from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from enum import Enum


class AuthProvider(str, Enum):
    email = "email"
    github = "github"
    google = "google"


class UserRole(str, Enum):
    student = "student"
    admin = "admin"
    instructor = "instructor"


class UserBase(BaseModel):
    name: str
    email: str
    auth_provider: AuthProvider = AuthProvider.email
    profile_picture_url: Optional[str] = None
    role: UserRole = UserRole.student


class UserCreate(UserBase):
    appwrite_user_id: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    profile_picture_url: Optional[str] = None
    preferences: Optional[dict] = None


class User(UserBase):
    user_id: str
    global_score: int = 0
    created_at: datetime
    last_login: Optional[datetime] = None
    preferences: dict = {}

    class Config:
        from_attributes = True


class UserStats(BaseModel):
    global_score: int
    modules_completed: int
    average_score: float
    sessions_total: int
    rank: Optional[int] = None
