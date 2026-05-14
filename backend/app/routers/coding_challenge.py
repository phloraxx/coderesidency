"""
Coding Challenge router for Phase 2 — The Code Crucible.
Handles challenge generation, code submission, and test validation.
"""

import json
import uuid
import logging
import re
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from appwrite.query import Query
from app.routers.auth import get_current_user_id
from app.database.appwrite_client import get_tables_db
from app.docker_manager.sandbox import get_sandbox
from app.agents.coding_challenge_agent import get_challenge_generator, get_output_validator
from app.scoring.engine import calculate_code_crucible_score
from app.config import settings
from app.models.challenge import ChallengeSubmitBody, TestCaseResult

router = APIRouter(prefix="/api", tags=["coding-challenge"])
logger = logging.getLogger(__name__)
_code_submission_columns: set[str] | None = None


def _filter_code_submission_data(db, data: dict) -> dict:
    global _code_submission_columns
    if _code_submission_columns is None:
        try:
            cols = db.list_columns(
                database_id=settings.appwrite_db_id,
                table_id=settings.appwrite_collection_code_submissions,
            )
            _code_submission_columns = {
                c.get("key") for c in cols.get("columns", []) if c.get("key")
            }
        except Exception as e:
            logger.warning(f"Failed to inspect code_submissions columns: {e}")
            return data
    return {k: v for k, v in data.items() if k in _code_submission_columns}


def _normalize_output(output: str) -> str:
    """Normalize output for comparison: strip whitespace, normalize line endings."""
    if output is None:
        return ""
    # Strip leading/trailing whitespace
    output = output.strip()
    # Normalize line endings
    output = output.replace("\r\n", "\n").replace("\r", "\n")
    return output


def _outputs_match(actual: str, expected: str) -> bool:
    """Compare outputs with tolerance for whitespace and numeric precision."""
    actual = _normalize_output(actual)
    expected = _normalize_output(expected)

    # Exact match
    if actual == expected:
        return True

    # Try numeric comparison for floating point tolerance
    try:
        actual_float = float(actual)
        expected_float = float(expected)
        if abs(actual_float - expected_float) < 0.001:
            return True
    except (ValueError, TypeError):
        pass

    return False


def _build_test_harness(student_code: str, function_name: str, test_input: str, language: str) -> str:
    """Build a test harness that runs the student's function with test input."""
    if language == "python":
        return f"""{student_code}

# ─── Test Harness (auto-generated) ───
_test_input = {test_input}
_result = {function_name}(_test_input)
print(_result)
"""
    elif language == "javascript":
        return f"""{student_code}

// ─── Test Harness (auto-generated) ───
const _testInput = {test_input};
const _result = {function_name}(_testInput);
console.log(_result);
"""
    else:
        # Default to Python-style
        return f"""{student_code}

# ─── Test Harness (auto-generated) ───
_test_input = {test_input}
_result = {function_name}(_test_input)
print(_result)
"""


@router.post("/challenge/{session_id}/generate")
async def generate_challenge(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Generate a coding challenge for this session from the scenario's truth_file."""
    db = get_tables_db()

    try:
        # Load session
        session = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            row_id=session_id,
        )

        if ("user_id" in session and session["user_id"]) != user_id:
            raise HTTPException(status_code=403, detail="Not your session")

        # Check if challenge already exists
        preferences_raw = session["preferences"] if "preferences" in session else "{}"
        preferences = json.loads(preferences_raw) if isinstance(preferences_raw, str) else preferences_raw

        if preferences.get("challenge_id"):
            # Challenge already generated, return it
            existing = db.get_row(
                database_id=settings.appwrite_db_id,
                table_id=settings.appwrite_collection_coding_challenges,
                row_id=preferences["challenge_id"],
            )
            test_cases = json.loads(existing["test_cases"] if "test_cases" in existing else "[]")
            sample_test_case = test_cases[0] if test_cases else {"input": "", "expected_output": ""}
            return {
                "challenge_id": existing["$id"],
                "task_description": existing["task_description"] if "task_description" in existing else None,
                "function_signature": existing["function_signature"] if "function_signature" in existing else None,
                "hints": json.loads(existing["hints"] if "hints" in existing else "[]"),
                "language": existing["language"] if "language" in existing else "python",
                "time_limit_minutes": existing["time_limit_minutes"] if "time_limit_minutes" in existing else 20,
                "test_case_count": len(test_cases),
                "sample_test_case": {
                    "input": sample_test_case.get("input", ""),
                    "expected_output": sample_test_case.get("expected_output", ""),
                },
                "starter_code": existing["starter_code"] if "starter_code" in existing else "",
                "already_generated": True,
            }

        # Load scenario
        scenario_id = session["scenario_id"] if "scenario_id" in session else None
        scenario = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_scenarios,
            row_id=scenario_id,
        )

        # Parse truth_file
        truth_file_raw = scenario["truth_file"] if "truth_file" in scenario else "{}"
        truth_file = json.loads(truth_file_raw) if isinstance(truth_file_raw, str) else truth_file_raw

        difficulty = scenario["difficulty_level"] if "difficulty_level" in scenario else 3

        # Generate challenge using AI
        generator = get_challenge_generator()
        challenge_data = await generator.generate(
            truth_file=truth_file,
            scenario_title=scenario["title"] if "title" in scenario else "Coding Challenge",
            scenario_description=scenario["description"] if "description" in scenario else "",
            difficulty=difficulty,
        )

        # Store challenge in DB
        challenge_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        db.create_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_coding_challenges,
            row_id=challenge_id,
            data={
                "challenge_id": challenge_id,
                "session_id": session_id,
                "task_description": challenge_data["task_description"],
                "function_signature": challenge_data["function_signature"],
                "function_name": challenge_data.get("function_name", "solution"),
                "test_cases": json.dumps(challenge_data["test_cases"]),  # Hidden from client
                "hints": json.dumps(challenge_data.get("hints", [])),
                "starter_code": challenge_data.get("starter_code", ""),
                "language": challenge_data.get("language", "python"),
                "time_limit_minutes": challenge_data.get("time_limit_minutes", 20),
                "generated_at": now.isoformat(),
            },
        )

        # Update session preferences with challenge info
        preferences["challenge_id"] = challenge_id
        preferences["phase"] = "coding"
        preferences["challenge_started_at"] = now.isoformat()

        db.update_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            row_id=session_id,
            data={"preferences": json.dumps(preferences)},
        )

        return {
            "challenge_id": challenge_id,
            "task_description": challenge_data["task_description"],
            "function_signature": challenge_data["function_signature"],
            "hints": challenge_data.get("hints", []),
            "language": challenge_data.get("language", "python"),
            "time_limit_minutes": challenge_data.get("time_limit_minutes", 20),
            "test_case_count": len(challenge_data["test_cases"]),
            "sample_test_case": {
                "input": challenge_data["test_cases"][0].get("input", "") if challenge_data.get("test_cases") else "",
                "expected_output": challenge_data["test_cases"][0].get("expected_output", "") if challenge_data.get("test_cases") else "",
            },
            "starter_code": challenge_data.get("starter_code", ""),
            "already_generated": False,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"generate_challenge error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/challenge/{session_id}/submit")
async def submit_challenge(
    session_id: str,
    body: ChallengeSubmitBody,
    user_id: str = Depends(get_current_user_id),
):
    """Submit code for evaluation — runs all test cases and scores."""
    db = get_tables_db()
    sandbox = get_sandbox()

    try:
        # Load session
        session = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            row_id=session_id,
        )

        if ("user_id" in session and session["user_id"]) != user_id:
            raise HTTPException(status_code=403, detail="Not your session")

        # Get challenge_id from preferences
        preferences_raw = session["preferences"] if "preferences" in session else "{}"
        preferences = json.loads(preferences_raw) if isinstance(preferences_raw, str) else preferences_raw

        challenge_id = preferences.get("challenge_id")
        if not challenge_id:
            raise HTTPException(status_code=400, detail="No challenge generated for this session")

        # Load challenge (with hidden test_cases)
        challenge = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_coding_challenges,
            row_id=challenge_id,
        )

        test_cases = json.loads(challenge.get("test_cases", "[]"))
        function_name = challenge.get("function_name", "solution")
        language = body.language or challenge.get("language", "python")

        # Run each test case
        test_results: list[TestCaseResult] = []

        for i, tc in enumerate(test_cases):
            harness_code = _build_test_harness(
                student_code=body.code,
                function_name=function_name,
                test_input=tc["input"],
                language=language,
            )

            result = await sandbox.execute(code=harness_code, language=language)

            actual_output = _normalize_output(result.get("stdout", ""))
            expected_output = _normalize_output(tc["expected_output"])
            passed = _outputs_match(actual_output, expected_output)

            # Only show expected output if passed (as encouragement), hide if failed (prevent cheating)
            test_results.append(TestCaseResult(
                case_number=i + 1,
                passed=passed,
                your_output=actual_output[:500] if actual_output else "(no output)",
                expected_output=expected_output if passed else None,
            ))

        passed_count = sum(1 for t in test_results if t.passed)
        total_count = len(test_results)

        # Get code quality review
        validator = get_output_validator()
        quality_review = await validator.validate(
            student_code=body.code,
            test_results=[{"passed": t.passed, "case_number": t.case_number} for t in test_results],
            language=language,
        )

        code_quality_score = quality_review.get("code_quality_score", 15)

        # Calculate time used
        challenge_started_at = preferences.get("challenge_started_at")
        if challenge_started_at:
            try:
                started = datetime.fromisoformat(challenge_started_at.replace("Z", "+00:00"))
                time_used_seconds = int((datetime.now(timezone.utc) - started).total_seconds())
            except Exception:
                time_used_seconds = 600  # default 10 min if parsing fails
        else:
            time_used_seconds = 600

        time_limit_seconds = (challenge.get("time_limit_minutes", 20)) * 60

        # Calculate final score
        total_score = calculate_code_crucible_score(
            passed_cases=passed_count,
            total_cases=total_count,
            code_quality_score=code_quality_score,
            time_used_seconds=time_used_seconds,
            time_limit_seconds=time_limit_seconds,
        )

        # Update session with score
        db.update_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            row_id=session_id,
            data={
                "final_score": total_score,
                "status": "completed" if passed_count == total_count else "active",
                "completed_at": datetime.now(timezone.utc).isoformat() if passed_count == total_count else None,
            },
        )

        # Log submission
        try:
            submission_data = {
                "session_id": session_id,
                "user_id": user_id,
                "language": language,
                "code": body.code[:50000],
                "exit_code": 0 if passed_count == total_count else 1,
                "stdout": f"Passed {passed_count}/{total_count} tests",
                "stderr": "",
                "submitted_at": datetime.now(timezone.utc).isoformat(),
            }
            db.create_row(
                database_id=settings.appwrite_db_id,
                table_id=settings.appwrite_collection_code_submissions,
                row_id=str(uuid.uuid4()),
                data=_filter_code_submission_data(db, submission_data),
            )
        except Exception as e:
            logger.warning(f"Failed to log code submission: {e}")

        return {
            "test_results": [t.model_dump() for t in test_results],
            "passed_count": passed_count,
            "total_count": total_count,
            "code_quality_score": code_quality_score,
            "total_score": total_score,
            "feedback": quality_review.get("feedback", ""),
            "time_used_seconds": time_used_seconds,
            "all_passed": passed_count == total_count,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"submit_challenge error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/challenge/{session_id}/run")
async def run_challenge_first_case(
    session_id: str,
    body: ChallengeSubmitBody,
    user_id: str = Depends(get_current_user_id),
):
    """Run only the first test case for quick feedback; full hidden suite runs on submit."""
    db = get_tables_db()
    sandbox = get_sandbox()

    try:
        session = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            row_id=session_id,
        )

        if session.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Not your session")

        preferences = session.get("preferences", "{}")
        if isinstance(preferences, str):
            preferences = json.loads(preferences)

        challenge_id = preferences.get("challenge_id")
        if not challenge_id:
            raise HTTPException(status_code=400, detail="No challenge generated for this session")

        challenge = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_coding_challenges,
            row_id=challenge_id,
        )

        test_cases = json.loads(challenge.get("test_cases", "[]"))
        if not test_cases:
            raise HTTPException(status_code=400, detail="Challenge has no test cases")

        tc = test_cases[0]
        function_name = challenge.get("function_name", "solution")
        language = body.language or challenge.get("language", "python")

        harness_code = _build_test_harness(
            student_code=body.code,
            function_name=function_name,
            test_input=tc["input"],
            language=language,
        )
        result = await sandbox.execute(code=harness_code, language=language)

        actual_output = _normalize_output(result.get("stdout", ""))
        expected_output = _normalize_output(tc.get("expected_output", ""))
        passed = _outputs_match(actual_output, expected_output)

        return {
            "case_number": 1,
            "input": tc.get("input", ""),
            "expected_output": expected_output,
            "your_output": actual_output if actual_output else "(no output)",
            "passed": passed,
            "stderr": _normalize_output(result.get("stderr", "")),
            "exit_code": result.get("exit_code", 1),
            "execution_time_ms": result.get("execution_time_ms", 0),
            "error": result.get("error"),
            "note": "Run executes only the first test case. Submit runs all hidden test cases.",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"run_challenge_first_case error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/challenge/{session_id}")
async def get_challenge(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get the challenge for this session (without hidden test case outputs)."""
    db = get_tables_db()

    try:
        # Load session
        session = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            row_id=session_id,
        )

        if ("user_id" in session and session["user_id"]) != user_id:
            raise HTTPException(status_code=403, detail="Not your session")

        # Get challenge_id from preferences
        preferences_raw = session["preferences"] if "preferences" in session else "{}"
        preferences = json.loads(preferences_raw) if isinstance(preferences_raw, str) else preferences_raw

        challenge_id = preferences.get("challenge_id")
        if not challenge_id:
            return {"challenge": None, "message": "No challenge generated yet"}

        # Load challenge
        challenge = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_coding_challenges,
            row_id=challenge_id,
        )

        # Return WITHOUT test case expected outputs
        test_cases = json.loads(challenge.get("test_cases", "[]"))

        return {
            "challenge_id": challenge["$id"],
            "task_description": challenge.get("task_description"),
            "function_signature": challenge.get("function_signature"),
            "hints": json.loads(challenge.get("hints", "[]")),
            "language": challenge.get("language", "python"),
            "time_limit_minutes": challenge.get("time_limit_minutes", 20),
            "test_case_count": len(test_cases),
            "sample_test_case": {
                "input": test_cases[0].get("input", "") if test_cases else "",
                "expected_output": test_cases[0].get("expected_output", "") if test_cases else "",
            },
            "starter_code": challenge.get("starter_code", ""),
            "generated_at": challenge.get("generated_at"),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"get_challenge error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
