"""Evaluation router — generate and retrieve session report cards."""

import json
import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from appwrite.query import Query
from app.routers.auth import get_current_user_id
from app.database.appwrite_client import get_tables_db
from app.agents.dual_agent import EvaluatorAgent
from app.scoring.engine import score_to_grade
from app.config import settings

router = APIRouter(prefix="/api/evaluation", tags=["evaluation"])
logger = logging.getLogger(__name__)

_evaluator: EvaluatorAgent | None = None


def get_evaluator() -> EvaluatorAgent:
    global _evaluator
    if _evaluator is None:
        _evaluator = EvaluatorAgent()
    return _evaluator


def _bounded_string(value, max_len: int) -> str:
    """Coerce any value to a DB-safe string and enforce a max length."""
    if value is None:
        text = ""
    elif isinstance(value, str):
        text = value
    elif isinstance(value, (list, tuple)):
        text = "\n".join(str(v) for v in value)
    elif isinstance(value, dict):
        text = json.dumps(value, ensure_ascii=False)
    else:
        text = str(value)
    return text[:max_len]


@router.post("/{session_id}/generate")
async def generate_evaluation(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Generate an evaluation report for a completed session."""
    db = get_tables_db()
    try:
        # Load session
        session = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            row_id=session_id,
        )

        # Load scenario (truth_file)
        scenario = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_scenarios,
            row_id=session["scenario_id"],
        )
        truth_file = scenario.get("truth_file", "{}")
        if isinstance(truth_file, str):
            truth_file = json.loads(truth_file)

        # Load chat history
        history_result = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_chat_logs,
            queries=[Query.equal("session_id", session_id), Query.order_asc("$createdAt")],
        )
        history = [
            {"role": d["role"], "content": d["content"]}
            for d in history_result.get("rows", [])
        ]

        # Get constraints discovered from preferences JSON
        prefs_raw = session.get("preferences", "{}")
        prefs = json.loads(prefs_raw) if isinstance(prefs_raw, str) else prefs_raw
        constraints_discovered = prefs.get("constraints_discovered", [])
        final_score = session.get("final_score", 0) or 0

        # Generate report via Evaluator Agent
        evaluator = get_evaluator()
        report_data = await evaluator.generate_report(
            session_data=session,
            conversation_history=history,
            truth_file=truth_file,
            constraints_discovered=constraints_discovered,
            final_score=final_score,
        )

        # Save report to DB
        report_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        feedback_text = _bounded_string(report_data.get("strengths", ""), 5000)
        breakdown_text = _bounded_string(report_data.get("detailed_breakdown", {}), 5000)
        db.create_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_eval_reports,
            row_id=report_id,
            data={
                "session_id": session_id,
                "user_id": user_id,
                "total_score": final_score,
                "feedback": feedback_text,
                "breakdown": breakdown_text,
                "generated_at": now.isoformat(),
            },
        )

        # Mark session as completed
        db.update_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            row_id=session_id,
            data={
                "status": "completed",
                "final_score": final_score,
                "completed_at": now.isoformat(),
            },
        )

        # Update user's global score (non-fatal)
        try:
            user_doc = db.get_row(
                database_id=settings.appwrite_db_id,
                table_id=settings.appwrite_collection_users,
                row_id=user_id,
            )
            new_global = (user_doc.get("global_score") or 0) + final_score
            db.update_row(
                database_id=settings.appwrite_db_id,
                table_id=settings.appwrite_collection_users,
                row_id=user_id,
                data={"global_score": new_global},
            )
        except Exception:
            pass

        return {
            "report_id": report_id,
            "session_id": session_id,
            "overall_score": final_score,
            "letter_grade": score_to_grade(final_score),
            **report_data,
        }

    except Exception as e:
        logger.error(f"generate_evaluation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{session_id}")
async def get_evaluation(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get existing evaluation report for a session."""
    db = get_tables_db()
    try:
        result = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_eval_reports,
            queries=[Query.equal("session_id", session_id)],
        )
        rows = result.get("rows", [])
        if not rows:
            raise HTTPException(status_code=404, detail="Evaluation report not found")
        return rows[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
