from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env"), 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

    # Gemini
    gemini_api_key: str = ""

    # Appwrite
    appwrite_endpoint: str = "https://backend.ieeesahrdaya.com/v1"
    appwrite_project_id: str = "69a6e879000cb23f6b5a"
    appwrite_api_key: str = "standard_91dd0e8265e9dc37fc7a2959d54f6dfb6efd6d342ca3b699081c4413c634da9d87c2d7248a206e30dc945b0fd2aade637ef799e6105607fff84647d88d12045a0d2dcba279e79beda07986824e6e1a4b82818bd22dde4e97c59777929a382fc5414694da69e08210ff9beeadb62d5ae1e27eceed9c771ffca255fae70c440280"
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

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # App
    backend_secret_key: str = "change_this"
    allowed_origins: str = "http://localhost:3000"

    # Docker Sandbox
    sandbox_memory_limit: str = "256m"
    sandbox_cpu_quota: int = 50000
    sandbox_timeout_seconds: int = 30
    sandbox_pids_limit: int = 50

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
