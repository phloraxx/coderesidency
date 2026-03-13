"""Auth router — validates Appwrite JWT sessions and returns user info."""

from fastapi import APIRouter, Header, HTTPException, Depends
from appwrite.client import Client
from appwrite.services.account import Account
from app.config import settings
import logging

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = logging.getLogger(__name__)


def get_current_user_id(authorization: str = Header(...)) -> str:
    """Extract and validate user from Appwrite JWT token."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        # Create a client with the user's JWT
        client = Client()
        client.set_endpoint(settings.appwrite_endpoint)
        client.set_project(settings.appwrite_project_id)
        client.set_jwt(token)

        account = Account(client)
        user = account.get()
        return user["$id"]
    except Exception as e:
        logger.error(f"Auth validation error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.get("/session")
async def get_session(user_id: str = Depends(get_current_user_id)):
    """Verify current session is valid."""
    return {"user_id": user_id, "valid": True}


@router.post("/logout")
async def logout(user_id: str = Depends(get_current_user_id)):
    """Signal logout (actual logout handled client-side via Appwrite SDK)."""
    return {"message": "Logged out successfully"}
