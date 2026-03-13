"""
Scenario session router — start sessions and submit code.
Handles /api/scenarios/{id}/start and /api/execute
"""

import json
import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from appwrite.query import Query
from app.routers.auth import get_current_user_id
from app.database.appwrite_client import get_tables_db
from app.docker_manager.sandbox import get_sandbox
from app.config import settings
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api", tags=["scenarios"])
logger = logging.getLogger(__name__)


class SessionStartBody(BaseModel):
    preferences: Optional[dict] = {"difficulty_modifier": "normal", "enable_hints": True}


class CodeExecuteBody(BaseModel):
    session_id: str
    code: str
    language: str


@router.post("/scenarios/{scenario_id}/start")
async def start_scenario(
    scenario_id: str,
    body: SessionStartBody,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new session for a scenario and return initial state."""
    db = get_tables_db()
    try:
        # Load scenario (with truth_file, server-side only)
        scenario = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_scenarios,
            row_id=scenario_id,
        )

        # Abandon any existing in-progress sessions for this scenario
        existing = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            queries=[
                Query.equal("user_id", user_id),
                Query.equal("scenario_id", scenario_id),
                Query.equal("status", "active"),
            ],
        )
        for s in existing.get("rows", []):
            db.update_row(
                database_id=settings.appwrite_db_id,
                table_id=settings.appwrite_collection_sessions,
                row_id=s["$id"],
                data={"status": "abandoned"},
            )

        # Create new session
        session_id = str(uuid.uuid4())
        truth_file = scenario.get("truth_file", "{}")
        if isinstance(truth_file, str):
            truth_file = json.loads(truth_file)

        persona = truth_file.get("client_persona", truth_file.get("persona", {}))
        constraints_total = len(truth_file.get("constraints", []))

        now = datetime.now(timezone.utc)
        session_doc = db.create_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            row_id=session_id,
            data={
                "user_id": user_id,
                "scenario_id": scenario_id,
                "module_id": scenario.get("module_id", ""),
                "status": "active",
                "final_score": 0,
                "started_at": now.isoformat(),
                "preferences": json.dumps(body.preferences or {}),
            },
        )

        greeting = persona.get(
            "greeting",
            f"Hello, I'm {persona.get('name', 'your client')}. How can I help you today?"
        )

        # Save initial AI greeting to chat logs
        db.create_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_chat_logs,
            row_id=str(uuid.uuid4()),
            data={
                "session_id": session_id,
                "user_id": user_id,
                "role": "assistant",
                "content": greeting,
                "timestamp": now.isoformat(),
            },
        )

        return {
            "session_id": session_id,
            "scenario": {
                "scenario_id": scenario_id,
                "title": scenario.get("title"),
                "description": scenario.get("description"),
                "module_type": scenario.get("module_type", "client"),
                "time_limit_seconds": scenario.get("time_limit_seconds"),
                "max_score": scenario.get("max_score", 100),
            },
            "initial_state": {
                "client_name": persona.get("name", "Client"),
                "client_greeting": greeting,
                "current_score": 0,
                "constraints_discovered": 0,
                "constraints_total": constraints_total,
            },
            "started_at": now.isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"start_scenario error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/execute")
async def execute_code(
    body: CodeExecuteBody,
    user_id: str = Depends(get_current_user_id),
):
    """Execute code in the Docker sandbox and return results."""
    db = get_tables_db()

    sandbox = get_sandbox()
    result = await sandbox.execute(code=body.code, language=body.language)

    # Log submission to DB (non-fatal if it fails)
    try:
        db.create_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_code_submissions,
            row_id=str(uuid.uuid4()),
            data={
                "session_id": body.session_id,
                "user_id": user_id,
                "language": body.language,
                "code": body.code[:50000],
                "exit_code": result["exit_code"],
                "stdout": (result.get("stdout") or "")[:10000],
                "stderr": (result.get("stderr") or "")[:10000],
                "submitted_at": datetime.now(timezone.utc).isoformat(),
            },
        )
    except Exception as e:
        logger.warning(f"Failed to log code submission: {e}")

    return result


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get session details."""
    db = get_tables_db()
    try:
        session = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            row_id=session_id,
        )
        return session
    except Exception:
        raise HTTPException(status_code=404, detail="Session not found")
