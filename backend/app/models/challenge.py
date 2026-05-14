"""
Pydantic models for the Code Crucible (Phase 2) module.
"""

from typing import Optional
from pydantic import BaseModel
from enum import Enum


class ChallengeSubmitBody(BaseModel):
    """Body for POST /api/challenge/{session_id}/submit"""
    code: str
    language: str  # python | javascript | java


class TestCaseResult(BaseModel):
    case_number: int
    passed: bool
    your_output: str
    expected_output: Optional[str] = None  # only shown on pass


class ChallengeSubmitResponse(BaseModel):
    test_results: list[TestCaseResult]
    passed_count: int
    total_count: int
    code_quality_score: int
    total_score: int
    feedback: str
