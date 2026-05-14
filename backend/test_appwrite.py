"""Test script to check Appwrite SDK object types"""
from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from app.config import settings

client = Client()
client.set_endpoint(settings.appwrite_endpoint)
client.set_project(settings.appwrite_project_id)
client.set_key(settings.appwrite_api_key)

db = TablesDB(client)

# Test list_rows
try:
    result = db.list_rows(
        database_id=settings.appwrite_db_id,
        table_id=settings.appwrite_collection_modules,
    )
    print(f"Type of result: {type(result)}")
    print(f"Result attributes: {dir(result)}")
    print(f"Has 'rows' attribute: {hasattr(result, 'rows')}")
    print(f"Has 'get' method: {hasattr(result, 'get')}")

    if hasattr(result, 'rows'):
        print(f"\nType of result.rows: {type(result.rows)}")
        if result.rows:
            print(f"Type of first row: {type(result.rows[0])}")
            print(f"First row attributes: {dir(result.rows[0])}")
            print(f"First row has 'get': {hasattr(result.rows[0], 'get')}")
    elif isinstance(result, dict) and 'rows' in result:
        print(f"\nResult is dict with 'rows' key")
        print(f"Type of result['rows']: {type(result['rows'])}")
        if result['rows']:
            print(f"Type of first row: {type(result['rows'][0])}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
