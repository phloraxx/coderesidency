"""
Database Setup Script
Run this ONCE after Appwrite is running to create all collections and seed initial module data.

Usage:
    python scripts/setup_db.py
"""

import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from appwrite.client import Client
from appwrite.services.databases import Databases
from app.config import settings


def get_client() -> Databases:
    client = Client()
    # When running locally outside Docker, 'appwrite' won't resolve. 
    # Swap it with localhost to ensure local execution works!
    endpoint = settings.appwrite_endpoint
    if "appwrite" in endpoint and "localhost" not in endpoint:
        endpoint = endpoint.replace("appwrite", "localhost", 1)
        
    client.set_endpoint(endpoint)
    client.set_project(settings.appwrite_project_id)
    client.set_key(settings.appwrite_api_key)
    return Databases(client)


def create_database(db: Databases):
    try:
        db.create(database_id=settings.appwrite_db_id, name="CodeResidency Main DB")
        print(f"✅ Created database: {settings.appwrite_db_id}")
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            print(f"ℹ️  Database already exists: {settings.appwrite_db_id}")
        else:
            raise


def safe_create(fn, log_name, *args, **kwargs):
    try:
        fn(*args, **kwargs)
        print(f"  ✅ {log_name}")
    except Exception as e:
        if "already exists" in str(e).lower() or "409" in str(e):
            print(f"  ℹ️  {log_name} (already exists)")
        else:
            print(f"  ❌ {log_name}: {e}")


def setup_collections(db: Databases):
    from appwrite.services.databases import Databases as DB

    cid = settings.appwrite_db_id
    STRING = "string"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    FLOAT = "double"

    # ── USERS ────────────────────────────────────────
    print("\n📦 Creating USERS collection...")
    safe_create(
        db.create_collection,
        "users collection",
        database_id=cid,
        collection_id=settings.appwrite_collection_users,
        name="Users",
    )
    for attr_fn, attr_name, size, required, default in [
        (db.create_string_attribute, "name", 100, True, None),
        (db.create_email_attribute, "email", None, True, None),
        (db.create_string_attribute, "auth_provider", 20, False, "email"),
        (db.create_string_attribute, "profile_picture_url", 500, False, None),
        (db.create_integer_attribute, "global_score", None, False, 0),
        (db.create_string_attribute, "role", 20, False, "student"),
        (db.create_string_attribute, "preferences", 2000, False, "{}"),
    ]:
        kwargs = dict(database_id=cid, collection_id=settings.appwrite_collection_users, key=attr_name, required=required)
        if attr_fn == db.create_string_attribute:
            kwargs["size"] = size
        if default is not None:
            kwargs["default"] = default
        safe_create(attr_fn, f"  {attr_name}", **kwargs)

    # ── MODULES ──────────────────────────────────────
    print("\n📦 Creating MODULES collection...")
    safe_create(
        db.create_collection,
        "modules collection",
        database_id=cid,
        collection_id=settings.appwrite_collection_modules,
        name="Modules",
    )
    for attr_fn, attr_name, size, required, default in [
        (db.create_string_attribute, "title", 100, True, None),
        (db.create_string_attribute, "slug", 100, True, None),
        (db.create_string_attribute, "description", 1000, True, None),
        (db.create_integer_attribute, "difficulty_level", None, True, None),
        (db.create_integer_attribute, "estimated_duration_mins", None, True, None),
        (db.create_string_attribute, "learning_objectives", 5000, False, "[]"),
        (db.create_boolean_attribute, "is_active", None, False, True),
        (db.create_string_attribute, "icon", 50, False, None),
    ]:
        kwargs = dict(database_id=cid, collection_id=settings.appwrite_collection_modules, key=attr_name, required=required)
        if attr_fn == db.create_string_attribute: kwargs["size"] = size
        if default is not None: kwargs["default"] = default
        safe_create(attr_fn, f"  {attr_name}", **kwargs)

    # ── SCENARIOS ────────────────────────────────────
    print("\n📦 Creating SCENARIOS collection...")
    safe_create(
        db.create_collection,
        "scenarios collection",
        database_id=cid,
        collection_id=settings.appwrite_collection_scenarios,
        name="Scenarios",
    )
    for attr_fn, attr_name, size, required, default in [
        (db.create_string_attribute, "module_id", 50, True, None),
        (db.create_string_attribute, "title", 200, True, None),
        (db.create_string_attribute, "description", 2000, True, None),
        (db.create_integer_attribute, "difficulty", None, True, None),
        (db.create_string_attribute, "truth_file", 20000, True, None),
        (db.create_string_attribute, "grading_rubric", 5000, True, None),
        (db.create_integer_attribute, "max_score", None, False, 100),
        (db.create_integer_attribute, "time_limit_seconds", None, False, None),
        (db.create_boolean_attribute, "is_active", None, False, True),
    ]:
        kwargs = dict(database_id=cid, collection_id=settings.appwrite_collection_scenarios, key=attr_name, required=required)
        if attr_fn == db.create_string_attribute: kwargs["size"] = size
        if default is not None: kwargs["default"] = default
        safe_create(attr_fn, f"  {attr_name}", **kwargs)

    # ── SESSIONS ─────────────────────────────────────
    print("\n📦 Creating SESSIONS collection...")
    safe_create(
        db.create_collection,
        "sessions collection",
        database_id=cid,
        collection_id=settings.appwrite_collection_sessions,
        name="Sessions",
    )
    for attr_fn, attr_name, size, required, default in [
        (db.create_string_attribute,  "user_id",       50,    True,  None),
        (db.create_string_attribute,  "scenario_id",   50,    True,  None),
        (db.create_string_attribute,  "module_id",     50,    True,  None),
        (db.create_string_attribute,  "status",        20,    False, "active"),   # active | completed | abandoned
        (db.create_integer_attribute, "final_score",   None,  False, 0),
        (db.create_string_attribute,  "started_at",    50,    False, None),
        (db.create_string_attribute,  "completed_at",  50,    False, None),
        (db.create_string_attribute,  "preferences",   2000,  False, "{}"),
    ]:
        kwargs = dict(database_id=cid, collection_id=settings.appwrite_collection_sessions, key=attr_name, required=required)
        if attr_fn == db.create_string_attribute: kwargs["size"] = size
        if default is not None: kwargs["default"] = default
        safe_create(attr_fn, f"  {attr_name}", **kwargs)
    # Index user_id so Query.equal("user_id", ...) works
    safe_create(
        db.create_index,
        "  index: user_id",
        database_id=cid,
        collection_id=settings.appwrite_collection_sessions,
        key="idx_user_id",
        type="key",
        attributes=["user_id"],
    )
    safe_create(
        db.create_index,
        "  index: status",
        database_id=cid,
        collection_id=settings.appwrite_collection_sessions,
        key="idx_status",
        type="key",
        attributes=["status"],
    )

    # ── CHAT LOGS ────────────────────────────────────
    print("\n📦 Creating CHAT_LOGS collection...")
    safe_create(
        db.create_collection,
        "chat_logs collection",
        database_id=cid,
        collection_id=settings.appwrite_collection_chat_logs,
        name="ChatLogs",
    )
    for attr_fn, attr_name, size, required, default in [
        (db.create_string_attribute,  "session_id",  50,    True,  None),
        (db.create_string_attribute,  "user_id",     50,    True,  None),
        (db.create_string_attribute,  "role",        20,    True,  None),   # user | assistant
        (db.create_string_attribute,  "content",     10000, True,  None),
        (db.create_string_attribute,  "timestamp",   50,    False, None),
    ]:
        kwargs = dict(database_id=cid, collection_id=settings.appwrite_collection_chat_logs, key=attr_name, required=required)
        if attr_fn == db.create_string_attribute: kwargs["size"] = size
        if default is not None: kwargs["default"] = default
        safe_create(attr_fn, f"  {attr_name}", **kwargs)
    safe_create(
        db.create_index, "  index: session_id",
        database_id=cid, collection_id=settings.appwrite_collection_chat_logs,
        key="idx_session_id", type="key", attributes=["session_id"],
    )

    # ── CODE SUBMISSIONS ─────────────────────────────
    print("\n📦 Creating CODE_SUBMISSIONS collection...")
    safe_create(
        db.create_collection,
        "code_submissions collection",
        database_id=cid,
        collection_id=settings.appwrite_collection_code_submissions,
        name="CodeSubmissions",
    )
    for attr_fn, attr_name, size, required, default in [
        (db.create_string_attribute,  "session_id",  50,    True,  None),
        (db.create_string_attribute,  "user_id",     50,    True,  None),
        (db.create_string_attribute,  "language",    30,    True,  None),
        (db.create_string_attribute,  "code",        50000, True,  None),
        (db.create_string_attribute,  "stdout",      10000, False, None),
        (db.create_string_attribute,  "stderr",      10000, False, None),
        (db.create_integer_attribute, "exit_code",   None,  False, 0),
        (db.create_string_attribute,  "submitted_at",50,    False, None),
    ]:
        kwargs = dict(database_id=cid, collection_id=settings.appwrite_collection_code_submissions, key=attr_name, required=required)
        if attr_fn == db.create_string_attribute: kwargs["size"] = size
        if default is not None: kwargs["default"] = default
        safe_create(attr_fn, f"  {attr_name}", **kwargs)

    # ── EVALUATION REPORTS ───────────────────────────
    print("\n📦 Creating EVALUATION_REPORTS collection...")
    safe_create(
        db.create_collection,
        "evaluation_reports collection",
        database_id=cid,
        collection_id=settings.appwrite_collection_eval_reports,
        name="EvaluationReports",
    )
    for attr_fn, attr_name, size, required, default in [
        (db.create_string_attribute,  "session_id",   50,   True,  None),
        (db.create_string_attribute,  "user_id",      50,   True,  None),
        (db.create_integer_attribute, "total_score",  None, False, 0),
        (db.create_string_attribute,  "feedback",     5000, False, None),
        (db.create_string_attribute,  "breakdown",    5000, False, "{}"),
        (db.create_string_attribute,  "generated_at", 50,   False, None),
    ]:
        kwargs = dict(database_id=cid, collection_id=settings.appwrite_collection_eval_reports, key=attr_name, required=required)
        if attr_fn == db.create_string_attribute: kwargs["size"] = size
        if default is not None: kwargs["default"] = default
        safe_create(attr_fn, f"  {attr_name}", **kwargs)

    # ── ACHIEVEMENTS ─────────────────────────────────
    print("\n📦 Creating ACHIEVEMENTS collection...")
    safe_create(
        db.create_collection,
        "achievements collection",
        database_id=cid,
        collection_id=settings.appwrite_collection_achievements,
        name="Achievements",
    )
    for attr_fn, attr_name, size, required, default in [
        (db.create_string_attribute, "user_id",      50,  True,  None),
        (db.create_string_attribute, "badge_id",     50,  True,  None),
        (db.create_string_attribute, "badge_name",   100, True,  None),
        (db.create_string_attribute, "earned_at",    50,  False, None),
    ]:
        kwargs = dict(database_id=cid, collection_id=settings.appwrite_collection_achievements, key=attr_name, required=required)
        if attr_fn == db.create_string_attribute: kwargs["size"] = size
        if default is not None: kwargs["default"] = default
        safe_create(attr_fn, f"  {attr_name}", **kwargs)
    safe_create(
        db.create_index, "  index: user_id",
        database_id=cid, collection_id=settings.appwrite_collection_achievements,
        key="idx_user_id", type="key", attributes=["user_id"],
    )


def seed_modules(db: Databases):
    """Seed the 5 core modules."""
    print("\n🌱 Seeding modules...")
    modules = [
        {
            "$id": "mod-001",
            "title": "The Difficult Client",
            "slug": "difficult-client",
            "description": "Master requirements engineering through challenging client interactions. Extract hidden constraints from vague, non-technical clients.",
            "difficulty_level": 2,
            "estimated_duration_mins": 45,
            "learning_objectives": json.dumps([
                "Requirements elicitation",
                "Client communication",
                "Managing ambiguity",
                "Jargon-free communication",
            ]),
            "is_active": True,
            "icon": "💬",
        },
        {
            "$id": "mod-002",
            "title": "The Code Crucible",
            "slug": "code-crucible",
            "description": "Implement solutions to real-world coding challenges. Write clean, correct code that passes all test cases.",
            "difficulty_level": 3,
            "estimated_duration_mins": 30,
            "learning_objectives": json.dumps([
                "Algorithm design",
                "Code optimization",
                "Edge case handling",
                "Unit testing",
            ]),
            "is_active": True,
            "icon": "</>",
        },
        {
            "$id": "mod-003",
            "title": "The Gatekeeper",
            "slug": "gatekeeper",
            "description": "A teammate secretly introduced a bug. Use git log, git blame, and git bisect to find and undo it — without breaking the repository.",
            "difficulty_level": 5,
            "estimated_duration_mins": 60,
            "learning_objectives": json.dumps([
                "Git forensics",
                "Code review",
                "Safe rollback strategies",
                "Merge conflict resolution",
            ]),
            "is_active": True,
            "icon": "🕵️",
        },
        {
             "$id": "mod-004",
            "title": "The War Room",
            "slug": "war-room",
            "description": "Handle production server outages under pressure. Diagnose and fix faults in a real Linux environment with a ticking clock.",
            "difficulty_level": 4,
            "estimated_duration_mins": 30,
            "learning_objectives": json.dumps([
                "Linux command mastery",
                "Log analysis",
                "Root cause analysis",
                "Stress management",
            ]),
            "is_active": True,
            "icon": "🔥",
        },
        {
            "$id": "mod-005",
            "title": "The Imposter",
            "slug": "imposter",
            "description": "Ace your technical and behavioral interviews. AI parsing your resume for targeted questions.",
            "difficulty_level": 3,
            "estimated_duration_mins": 40,
            "learning_objectives": json.dumps([
                "Technical interview prep",
                "STAR method",
                "Live coding",
                "Resume integrity",
            ]),
            "is_active": True,
            "icon": "🎯",
        },
    ]

    for m in modules:
        doc_id = m.pop("$id")
        try:
            db.create_document(
                database_id=settings.appwrite_db_id,
                collection_id=settings.appwrite_collection_modules,
                document_id=doc_id,
                data=m,
            )
            print(f"  ✅ {m['title']}")
        except Exception as e:
            if "already exists" in str(e).lower() or "409" in str(e):
                print(f"  ℹ️  {m['title']} (updating existing...)")
                try:
                    db.update_document(
                        database_id=settings.appwrite_db_id,
                        collection_id=settings.appwrite_collection_modules,
                        document_id=doc_id,
                        data=m,
                    )
                    print(f"  🔄 Updated {m['title']}")
                except Exception as update_err:
                     print(f"  ❌ Failed to update {m['title']}: {update_err}")
            else:
                print(f"  ❌ {m['title']}: {e}")


def seed_scenarios(db: Databases):
    """Seed sample scenarios for The Difficult Client module."""
    print("\n🌱 Seeding scenarios...")
    scenarios = [
        {
            "$id": "scen-001",
            "module_id": "mod-001",
            "title": "Angry Bakery Owner — Website Request",
            "description": "Rosa Martinez runs a small neighborhood bakery and wants a website. She's skeptical of tech people and budget-constrained.",
            "difficulty": 2,
            "truth_file": json.dumps({
                "constraints": [
                    {"id": "budget", "value": 0, "weight": 0.3, "hint_level": "hard"},
                    {"id": "hosting", "value": "must_be_offline", "weight": 0.25, "hint_level": "hard"},
                    {"id": "deadline", "value": "2_weeks", "weight": 0.2, "hint_level": "medium"},
                    {"id": "technical_skill", "value": "zero", "weight": 0.15, "hint_level": "easy"},
                    {"id": "accessibility", "value": "required", "weight": 0.1, "hint_level": "medium"},
                ],
                "client_persona": {
                    "name": "Rosa Martinez",
                    "business": "Rosa's Bakery",
                    "personality": "frustrated, non-technical, budget-conscious, skeptical of tech people",
                    "technical_knowledge": "ZERO — doesn't understand 'hosting', 'domain', or 'CMS'",
                    "initial_mood": "cautious",
                    "greeting": "Hello... are you the website person my daughter hired? I hope this doesn't cost me an arm and a leg.",
                },
            }),
            "grading_rubric": json.dumps({
                "communication": 0.6,
                "code_quality": 0.4,
            }),
            "max_score": 100,
            "time_limit_seconds": None,
            "is_active": True,
        },
        {
            "$id": "scen-002",
            "module_id": "mod-001",
            "title": "Overwhelmed Non-Profit Director",
            "description": "Carmen needs an app for her non-profit but has no budget or technical understanding. She keeps changing her mind.",
            "difficulty": 3,
            "truth_file": json.dumps({
                "constraints": [
                    {"id": "budget", "value": 0, "weight": 0.35, "hint_level": "hard"},
                    {"id": "volunteers_only", "value": True, "weight": 0.2, "hint_level": "medium"},
                    {"id": "mobile_first", "value": True, "weight": 0.2, "hint_level": "easy"},
                    {"id": "offline_capable", "value": True, "weight": 0.15, "hint_level": "hard"},
                    {"id": "multilingual", "value": "Spanish + English", "weight": 0.1, "hint_level": "medium"},
                ],
                "client_persona": {
                    "name": "Carmen Okafor",
                    "business": "Hope Bridge Non-Profit",
                    "personality": "overwhelmed, idealistic, constantly changing requirements",
                    "technical_knowledge": "minimal — has a smartphone but no coding knowledge",
                    "initial_mood": "excited but stressed",
                    "greeting": "Oh thank goodness you're here! I have SO many ideas for our app and I don't even know where to start...",
                },
            }),
            "grading_rubric": json.dumps({"communication": 0.6, "code_quality": 0.4}),
            "max_score": 100,
            "time_limit_seconds": None,
            "is_active": True,
        },
    ]

    for s in scenarios:
        doc_id = s.pop("$id")
        try:
            db.create_document(
                database_id=settings.appwrite_db_id,
                collection_id=settings.appwrite_collection_scenarios,
                document_id=doc_id,
                data=s,
            )
            print(f"  ✅ {s['title']}")
        except Exception as e:
            if "already exists" in str(e).lower() or "409" in str(e):
                print(f"  ℹ️  {s['title']} (already seeded)")
            else:
                print(f"  ❌ {s['title']}: {e}")


if __name__ == "__main__":
    print("🔧 CodeResidency Database Setup")
    print("=" * 40)

    db = get_client()
    create_database(db)
    setup_collections(db)
    seed_modules(db)
    seed_scenarios(db)

    print("\n✅ Database setup complete!")
    print("   You can now start the backend server.")
