from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class Sender(str, Enum):
    user = "user"
    actor_ai = "actor_ai"
    director_ai = "director_ai"
    system = "system"


class ChatMessage(BaseModel):
    session_id: str
    message: str


class ChatLogEntry(BaseModel):
    log_id: str
    session_id: str
    sender: Sender
    message: str
    timestamp: datetime
    metadata: dict = {}
    is_system_message: bool = False


class ChatResponse(BaseModel):
    message: str
    sender: Sender
    score_delta: int = 0
    current_score: int
    constraints_discovered: int
    constraints_total: int
    metadata: dict = {}


class DirectorDecision(BaseModel):
    communication_score: float
    rationale: str
    constraint_to_address: Optional[str] = None
    reveal_level: str = "none"   # "none" | "partial" | "full"
    actor_instruction: str
    score_delta: int = 0


class EvaluationReport(BaseModel):
    report_id: str
    session_id: str
    communication_score: int
    technical_score: int
    efficiency_score: int
    overall_score: int
    letter_grade: str
    strengths: str
    areas_for_improvement: str
    detailed_breakdown: dict
    generated_at: datetime
