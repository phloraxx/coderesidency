from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"), 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

    gemini_api_key: str = ""

    appwrite_endpoint: str = ""
    appwrite_project_id: str = ""
    appwrite_api_key: str = ""
    appwrite_db_id: str = "main"
    appwrite_collection_users: str = "users"
    appwrite_collection_modules: str = "modules"
    appwrite_collection_scenarios: str = "scenarios"
    appwrite_collection_sessions: str = "sessions"
    appwrite_collection_chat_logs: str = "chat_logs"
    appwrite_collection_code_submissions: str = "code_submissions"
    appwrite_collection_terminal_logs: str = "terminal_logs"
    appwrite_collection_eval_reports: str = "evaluation_reports"
    appwrite_collection_achievements: str = "achievements"
    appwrite_collection_coding_challenges: str = "coding_challenges"

    redis_url: str = "redis://localhost:6379/0"

    backend_secret_key: str = ""
    allowed_origins: str = "http://localhost:3000"

    sandbox_memory_limit: str = "256m"
    sandbox_cpu_quota: int = 50000
    sandbox_timeout_seconds: int = 30
    sandbox_pids_limit: int = 50

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
