"""Modules & Scenarios router."""

from fastapi import APIRouter, Depends, HTTPException
from appwrite.query import Query
from app.routers.auth import get_current_user_id
from app.database.appwrite_client import get_tables_db
from app.config import settings
import logging

router = APIRouter(prefix="/api", tags=["modules"])
logger = logging.getLogger(__name__)


@router.get("/modules")
async def list_modules(user_id: str = Depends(get_current_user_id)):
    """List all active modules with user's best scores."""
    db = get_tables_db()
    try:
        modules = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_modules,
            queries=[Query.equal("is_active", True)],
        )

        # Enrich each module with user's best score
        sessions = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            queries=[
                Query.equal("user_id", user_id),
                Query.equal("status", "completed"),
            ],
        )

        # Build lookup of best scores by scenario_id
        scenario_best: dict[str, int] = {}
        for s in sessions.get("rows", []):
            sid = s.get("scenario_id")
            score = s.get("final_score", 0) or 0
            if sid and score > scenario_best.get(sid, 0):
                scenario_best[sid] = score

        docs = modules.get("rows", [])
        return {"modules": docs, "user_best_scores": scenario_best}
    except Exception as e:
        logger.error(f"list_modules error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/modules/{module_id}/scenarios")
async def list_scenarios(module_id: str, user_id: str = Depends(get_current_user_id)):
    """Get all scenarios for a module."""
    db = get_tables_db()
    try:
        result = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_scenarios,
            queries=[
                Query.equal("module_id", module_id),
                Query.equal("is_active", True),
            ],
        )
        docs = result.get("rows", [])
        for doc in docs:
            doc.pop("truth_file", None)
            doc.pop("setup_script", None)
        return {"scenarios": docs}
    except Exception as e:
        logger.error(f"list_scenarios error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scenarios/{scenario_id}")
async def get_scenario(scenario_id: str, user_id: str = Depends(get_current_user_id)):
    """Get scenario details (without exposing truth_file or setup_script)."""
    db = get_tables_db()
    try:
        doc = db.get_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_scenarios,
            row_id=scenario_id,
        )
        doc.pop("truth_file", None)
        doc.pop("setup_script", None)
        return doc
    except Exception as e:
        logger.error(f"get_scenario error: {e}")
        raise HTTPException(status_code=404, detail="Scenario not found")
