from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.tables_db import TablesDB
from appwrite.services.users import Users
from appwrite.services.storage import Storage
from app.config import settings

_client: Client | None = None


def get_appwrite_client() -> Client:
    global _client
    if _client is None:
        _client = Client()
        _client.set_endpoint(settings.appwrite_endpoint)
        _client.set_project(settings.appwrite_project_id)
        _client.set_key(settings.appwrite_api_key)
    return _client


def get_db() -> Databases:
    """Legacy Databases API — kept for schema setup scripts."""
    return Databases(get_appwrite_client())


def get_tables_db() -> TablesDB:
    """Appwrite 1.8+ TablesDB API — use this for all row operations."""
    return TablesDB(get_appwrite_client())


def get_storage() -> Storage:
    return Storage(get_appwrite_client())


def get_users_service() -> Users:
    return Users(get_appwrite_client())
