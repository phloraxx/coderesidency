"""Debug script to check actual Appwrite SDK return types during runtime"""
import sys
sys.path.append('.')

from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from app.config import settings

def debug_appwrite_objects():
    client = Client()
    client.set_endpoint(settings.appwrite_endpoint)
    client.set_project(settings.appwrite_project_id)
    client.set_key(settings.appwrite_api_key)

    db = TablesDB(client)

    # Test with modules collection
    try:
        print("=== Testing modules collection ===")
        modules = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_modules,
        )
        print(f"Type of modules: {type(modules)}")
        print(f"Modules has 'get' method: {hasattr(modules, 'get')}")
        print(f"Modules has 'rows' attribute: {hasattr(modules, 'rows')}")
        print(f"Modules dir: {[attr for attr in dir(modules) if not attr.startswith('_')]}")

        # Test accessing data
        try:
            data_via_get = modules.get("rows", [])
            print(f"SUCCESS: modules.get('rows') returned {len(data_via_get)} items")
        except AttributeError as e:
            print(f"ERROR with .get(): {e}")

        try:
            data_via_attr = modules.rows
            print(f"SUCCESS: modules.rows returned {len(data_via_attr)} items")
        except AttributeError as e:
            print(f"ERROR with .rows: {e}")

        try:
            data_via_dict = modules["rows"]
            print(f"SUCCESS: modules['rows'] returned {len(data_via_dict)} items")
        except (KeyError, TypeError) as e:
            print(f"ERROR with ['rows']: {e}")

    except Exception as e:
        print(f"Connection error: {e}")

    # Test with sessions collection
    try:
        print("\n=== Testing sessions collection ===")
        sessions = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_sessions,
        )
        print(f"Type of sessions: {type(sessions)}")
        print(f"Sessions has 'get' method: {hasattr(sessions, 'get')}")
        print(f"Sessions has 'rows' attribute: {hasattr(sessions, 'rows')}")

    except Exception as e:
        print(f"Sessions connection error: {e}")

if __name__ == "__main__":
    debug_appwrite_objects()