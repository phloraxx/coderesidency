"""Users router — profile, stats, and achievements."""

from fastapi import APIRouter, Depends, HTTPException
from appwrite.query import Query
from app.routers.auth import get_current_user_id
from app.database.appwrite_client import get_tables_db, get_users_service
from app.config import settings
import logging

router = APIRouter(prefix="/api/users", tags=["users"])
logger = logging.getLogger(__name__)


@router.get("/me")
async def get_my_profile(user_id: str = Depends(get_current_user_id)):
    """Get current user's profile from Appwrite."""
    try:
        db = get_tables_db()
        try:
            user_doc = db.get_row(
                database_id=settings.appwrite_db_id,
                table_id=settings.appwrite_collection_users,
                row_id=user_id,
            )
        except Exception:
            # First login — fetch from Appwrite auth and create user row
            users_svc = get_users_service()
            auth_user = users_svc.get(user_id=user_id)

            user_doc = db.create_row(
                database_id=settings.appwrite_db_id,
                table_id=settings.appwrite_collection_users,
                row_id=user_id,
                data={
                    "name": auth_user.get("name", "Student") if isinstance(auth_user, dict) else (auth_user.name if hasattr(auth_user, 'name') else "Student"),
                    "email": auth_user.get("email", "") if isinstance(auth_user, dict) else (auth_user.email if hasattr(auth_user, 'email') else ""),
                    "auth_provider": "oauth",
                    "global_score": 0,
                    "role": "student",
                    "preferences": "{}",
                },
            )
        return user_doc
    except Exception as e:
        logger.error(f"get_my_profile error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me/stats")
async def get_my_stats(user_id: str = Depends(get_current_user_id)):
    """Get user statistics — sessions, scores, module completions."""
    try:
        db = get_tables_db()

        sessions = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
            queries=[Query.equal("user_id", user_id)],
        )

        docs = sessions.get("rows", [])
        completed = [s for s in docs if s.get("status") == "completed"]
        scores = [s.get("final_score", 0) for s in completed if s.get("final_score")]

        return {
            "global_score": sum(scores),
            "sessions_total": len(docs),
            "modules_completed": len(completed),
            "average_score": round(sum(scores) / max(len(scores), 1), 1),
        }
    except Exception as e:
        logger.error(f"get_my_stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me/achievements")
async def get_my_achievements(user_id: str = Depends(get_current_user_id)):
    """Get unlocked badges/achievements."""
    try:
        db = get_tables_db()

        result = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_achievements,
            queries=[Query.equal("user_id", user_id)],
        )
        return result.get("rows", [])
    except Exception as e:
        logger.error(f"get_my_achievements error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 20):
    """Get global leaderboard — top users by score."""
    try:
        db = get_tables_db()

        result = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_users,
            queries=[Query.order_desc("global_score"), Query.limit(limit)],
        )
        return result.get("rows", [])
    except Exception as e:
        logger.error(f"get_leaderboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
