"""
Phase 2 Database Setup Script — The Code Crucible
Run this after setup_db.py to add the coding_challenges collection and seed Phase 2 data.

Usage:
    python scripts/setup_phase2.py
"""

import sys
import os
import json
import warnings

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from appwrite.client import Client
from appwrite.services.tables_db import TablesDB
from appwrite.enums.index_type import IndexType
from app.config import settings


def get_client() -> TablesDB:
    client = Client()
    endpoint = settings.appwrite_endpoint
    if "appwrite" in endpoint and "localhost" not in endpoint:
        endpoint = endpoint.replace("appwrite", "localhost", 1)
    client.set_endpoint(endpoint)
    client.set_project(settings.appwrite_project_id)
    client.set_key(settings.appwrite_api_key)
    return TablesDB(client)


def safe_create(fn, log_name, *args, **kwargs):
    original_warn = warnings.warn

    def _filtered_warn(message, category=None, stacklevel=1, source=None):
        if category is DeprecationWarning and "Call to deprecated function" in str(message):
            return
        return original_warn(message, category=category, stacklevel=stacklevel, source=source)

    try:
        # Appwrite SDK can force deprecation warnings on every call; filter only its deprecated wrapper noise.
        warnings.warn = _filtered_warn
        with warnings.catch_warnings():
            fn(*args, **kwargs)
        print(f"  {log_name}")
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            print(f"  {log_name} (already exists)")
        else:
            print(f"  {log_name}: {e}")
    finally:
        warnings.warn = original_warn


def setup_coding_challenges_collection(db: TablesDB):
    """Create the coding_challenges collection for Phase 2."""
    cid = settings.appwrite_db_id
    collection_id = settings.appwrite_collection_coding_challenges

    print("\n Creating CODING_CHALLENGES collection...")
    safe_create(
        db.create_table,
        "coding_challenges collection",
        database_id=cid,
        table_id=collection_id,
        name="CodingChallenges",
    )

    attributes = [
        (db.create_string_column, "challenge_id", 50, True, None),
        (db.create_string_column, "session_id", 50, True, None),
        (db.create_string_column, "task_description", 5000, True, None),
        (db.create_string_column, "function_signature", 500, True, None),
        (db.create_string_column, "function_name", 100, False, "solution"),
        (db.create_string_column, "test_cases", 5000, True, None),  # JSON, hidden
        (db.create_string_column, "hints", 2000, False, "[]"),
        (db.create_string_column, "starter_code", 3000, False, None),
        (db.create_string_column, "language", 30, False, "python"),
        (db.create_integer_column, "time_limit_minutes", None, False, 20),
        (db.create_string_column, "generated_at", 50, False, None),
    ]

    for attr_fn, attr_name, size, required, default in attributes:
        kwargs = dict(
            database_id=cid,
            table_id=collection_id,
            key=attr_name,
            required=required,
        )
        if attr_fn == db.create_string_column:
            kwargs["size"] = size
        if default is not None:
            kwargs["default"] = default
        safe_create(attr_fn, f"  {attr_name}", **kwargs)

    # Index on session_id
    safe_create(
        db.create_index,
        "  index: session_id",
        database_id=cid,
        table_id=collection_id,
        key="idx_session_id",
        type=IndexType.KEY,
        columns=["session_id"],
    )


def seed_code_crucible_module(db: TablesDB):
    """Seed the Code Crucible module (mod-005)."""
    print("\n Seeding Code Crucible module...")

    module_data = {
        "title": "The Code Crucible",
        "slug": "code-crucible",
        "description": "Implement solutions to real-world coding challenges. Write clean, correct code that passes all test cases.",
        "difficulty_level": 3,
        "estimated_duration_mins": 30,
        "learning_objectives": json.dumps([
            "Requirement-driven implementation",
            "Output validation",
            "Code quality",
            "Problem solving",
            "Edge case handling",
        ]),
        "is_active": True,
        "icon": "code",
    }

    try:
        db.create_row(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_modules,
            row_id="mod-005",
            data=module_data,
        )
        print(f"  The Code Crucible module created")
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            print(f"  The Code Crucible module (already exists)")
        else:
            print(f"  Failed to create module: {e}")


def seed_code_crucible_scenarios(db: TablesDB):
    """Seed standalone scenarios for The Code Crucible."""
    print("\n Seeding Code Crucible scenarios...")

    scenarios = [
        {
            "$id": "scen-cc-001",
            "module_id": "mod-005",
            "title": "Receipt Generator",
            "description": "Build a function that generates a formatted receipt from a list of items and prices. Handle edge cases like empty carts and rounding.",
            "difficulty": 2,
            "truth_file": json.dumps({
                "challenge_context": {
                    "domain": "retail/point-of-sale",
                    "task_type": "string formatting + calculation",
                    "requirements": [
                        "Generate a formatted receipt string from items",
                        "Each item has a name and price",
                        "Calculate and display the total",
                        "Handle empty lists",
                        "Format prices with 2 decimal places",
                    ],
                    "example_input": "[('Croissant', 2.50), ('Coffee', 3.00)]",
                    "example_output": "Croissant: $2.50\nCoffee: $3.00\n---\nTotal: $5.50",
                },
                "constraints": [
                    {"id": "formatting", "description": "Currency with $ prefix and 2 decimal places"},
                    {"id": "empty_handling", "description": "Empty list returns 'No items\\n---\\nTotal: $0.00'"},
                    {"id": "newlines", "description": "Items separated by newlines, total at bottom"},
                ],
            }),
            "grading_rubric": json.dumps({
                "test_correctness": 0.5,
                "code_quality": 0.3,
                "efficiency": 0.2,
            }),
            "max_score": 100,
            "time_limit_seconds": 1200,  # 20 minutes
            "is_active": True,
        },
        {
            "$id": "scen-cc-002",
            "module_id": "mod-005",
            "title": "Student Grade Calculator",
            "description": "Create a function that calculates weighted student grades and assigns letter grades. Handle missing assignments and extra credit.",
            "difficulty": 3,
            "truth_file": json.dumps({
                "challenge_context": {
                    "domain": "education/grading",
                    "task_type": "calculation + conditional logic",
                    "requirements": [
                        "Calculate weighted average from category scores",
                        "Categories: homework (20%), quizzes (30%), exams (50%)",
                        "Assign letter grade: A (90+), B (80-89), C (70-79), D (60-69), F (<60)",
                        "Handle missing scores (treat as 0)",
                        "Round to 1 decimal place",
                    ],
                    "example_input": "{'homework': 85, 'quizzes': 78, 'exams': 92}",
                    "example_output": "{'average': 86.4, 'grade': 'B'}",
                },
                "constraints": [
                    {"id": "weights", "description": "Homework 20%, Quizzes 30%, Exams 50%"},
                    {"id": "rounding", "description": "Round average to 1 decimal place"},
                    {"id": "missing", "description": "Missing categories count as 0"},
                ],
            }),
            "grading_rubric": json.dumps({
                "test_correctness": 0.5,
                "code_quality": 0.3,
                "efficiency": 0.2,
            }),
            "max_score": 100,
            "time_limit_seconds": 1500,  # 25 minutes
            "is_active": True,
        },
        {
            "$id": "scen-cc-003",
            "module_id": "mod-005",
            "title": "Password Validator",
            "description": "Implement a password validation function that checks multiple security criteria and returns detailed feedback.",
            "difficulty": 2,
            "truth_file": json.dumps({
                "challenge_context": {
                    "domain": "security/authentication",
                    "task_type": "string validation + rule checking",
                    "requirements": [
                        "Check password against multiple criteria",
                        "Minimum 8 characters",
                        "At least one uppercase letter",
                        "At least one lowercase letter",
                        "At least one digit",
                        "At least one special character (!@#$%^&*)",
                        "Return dict with 'valid' boolean and 'issues' list",
                    ],
                    "example_input": "'Password1!'",
                    "example_output": "{'valid': True, 'issues': []}",
                },
                "constraints": [
                    {"id": "length", "description": "Minimum 8 characters"},
                    {"id": "uppercase", "description": "At least one A-Z"},
                    {"id": "lowercase", "description": "At least one a-z"},
                    {"id": "digit", "description": "At least one 0-9"},
                    {"id": "special", "description": "At least one of !@#$%^&*"},
                ],
            }),
            "grading_rubric": json.dumps({
                "test_correctness": 0.5,
                "code_quality": 0.3,
                "efficiency": 0.2,
            }),
            "max_score": 100,
            "time_limit_seconds": 1200,  # 20 minutes
            "is_active": True,
        },
    ]

    for s in scenarios:
        doc_id = s.pop("$id")
        try:
            db.create_row(
                database_id=settings.appwrite_db_id,
                table_id=settings.appwrite_collection_scenarios,
                row_id=doc_id,
                data=s,
            )
            print(f"  {s['title']} created")
        except Exception as e:
            if "already exists" in str(e).lower() or "409" in str(e):
                print(f"  {s['title']} (already exists)")
            else:
                print(f"  {s['title']}: {e}")


if __name__ == "__main__":
    print(" CodeResidency Phase 2 Setup — The Code Crucible")
    print("=" * 50)

    db = get_client()
    setup_coding_challenges_collection(db)
    seed_code_crucible_module(db)
    seed_code_crucible_scenarios(db)

    print("\n Phase 2 setup complete!")
    print("   The Code Crucible module is now available.")
    print("   Run the backend and navigate to /modules/code-crucible")
