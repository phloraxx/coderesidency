from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
from enum import Enum


class SessionStatus(str, Enum):
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"
    timed_out = "timed_out"
    abandoned = "abandoned"


class SessionCreate(BaseModel):
    user_id: str
    scenario_id: str
    preferences: Optional[dict] = {}


class Session(BaseModel):
    session_id: str
    user_id: str
    scenario_id: str
    status: SessionStatus = SessionStatus.in_progress
    current_score: int = 0
    final_score: Optional[int] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    metadata: dict = {}
    failure_reason: Optional[str] = None


class SessionStart(BaseModel):
    preferences: Optional[dict] = {
        "difficulty_modifier": "normal",
        "enable_hints": True
    }


class SessionStartResponse(BaseModel):
    session_id: str
    scenario: dict
    initial_state: dict
    started_at: datetime
