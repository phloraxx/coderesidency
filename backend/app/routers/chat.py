"""
Chat router — handles the Dual-Agent AI pipeline for The Difficult Client module.
Supports both REST (POST /api/chat/send) and WebSocket (/ws/chat).
"""

import json
import logging
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from appwrite.query import Query
from app.routers.auth import get_current_user_id
from app.database.appwrite_client import get_tables_db
from app.agents.dual_agent import DirectorAgent, ActorAgent, EvaluatorAgent
from app.scoring.engine import calculate_difficult_client_score, score_to_grade
from app.models.chat import ChatMessage, Sender
from app.config import settings

router = APIRouter(tags=["chat"])
logger = logging.getLogger(__name__)

# Agent singletons (initialized lazily)
_director: DirectorAgent | None = None
_actor: ActorAgent | None = None
_evaluator: EvaluatorAgent | None = None


def get_director() -> DirectorAgent:
    global _director
    if _director is None:
        _director = DirectorAgent()
    return _director


def get_actor() -> ActorAgent:
    global _actor
    if _actor is None:
        _actor = ActorAgent()
    return _actor


def get_evaluator() -> EvaluatorAgent:
    global _evaluator
    if _evaluator is None:
        _evaluator = EvaluatorAgent()
    return _evaluator


async def _run_dual_agent_pipeline(
    session_id: str,
    user_id: str,
    user_message: str,
    db,
) -> dict:
    """
    Core pipeline:
    1. Load session state (truth_file, history, progress)
    2. Director Agent evaluates message
    3. Actor Agent generates response
    4. Update score + state in DB
    5. Return response to client
    """
    # Load session
    session = db.get_row(
        database_id=settings.appwrite_db_id,
        table_id=settings.appwrite_collection_sessions,
        row_id=session_id,
    )
    scenario_id = session["scenario_id"]

    # Load scenario (truth_file only accessible server-side)
    scenario = db.get_row(
        database_id=settings.appwrite_db_id,
        table_id=settings.appwrite_collection_scenarios,
        row_id=scenario_id,
    )
    truth_file = json.loads(scenario.get("truth_file", "{}")) if isinstance(scenario.get("truth_file"), str) else scenario.get("truth_file", {})

    # Load conversation history
    history_result = db.list_rows(
        database_id=settings.appwrite_db_id,
        table_id=settings.appwrite_collection_chat_logs,
        queries=[Query.equal("session_id", session_id), Query.order_asc("$createdAt")],
    )
    history = [
        {"role": d["role"], "content": d["content"]}
        for d in history_result.get("rows", [])
    ]

    persona = truth_file.get("client_persona", truth_file.get("persona", {}))

    # Reconstruct progress from preferences field (stored as JSON string)
    prefs_raw = session.get("preferences", "{}")
    prefs = json.loads(prefs_raw) if isinstance(prefs_raw, str) else prefs_raw
    constraints_discovered = prefs.get("constraints_discovered", [])
    message_scores = prefs.get("message_scores", [])
    current_score = session.get("final_score", 0) or 0

    # Step 1: Director Agent evaluates
    director = get_director()
    director_decision = await director.evaluate(
        student_message=user_message,
        truth_file=truth_file,
        conversation_history=history,
        constraints_discovered=constraints_discovered,
        current_score=current_score,
        persona=persona,
    )

    # Step 2: Update discovered constraints
    if (
        director_decision.reveal_level in ("partial", "full")
        and director_decision.constraint_to_address
        and director_decision.constraint_to_address not in constraints_discovered
    ):
        constraints_discovered.append(director_decision.constraint_to_address)

    # Step 3: Actor Agent generates response
    actor = get_actor()
    actor_response = await actor.respond(
        persona=persona,
        director_instruction=director_decision.actor_instruction,
        conversation_history=history,
        student_message=user_message,
    )

    # Step 4: Recalculate score
    message_scores.append(director_decision.communication_score)
    all_constraints = [c["id"] for c in truth_file.get("constraints", [])]
    new_score = calculate_difficult_client_score(
        constraints_discovered=len(constraints_discovered),
        constraints_total=len(all_constraints),
        message_scores=message_scores,
    )

    # Step 5: Save chat logs
    now = datetime.now(timezone.utc).isoformat()

    # Save user message
    db.create_row(
        database_id=settings.appwrite_db_id,
        table_id=settings.appwrite_collection_chat_logs,
        row_id=str(uuid.uuid4()),
        data={
            "session_id": session_id,
            "user_id": user_id,
            "role": "user",
            "content": user_message,
            "timestamp": now,
        },
    )

    # Save actor response
    db.create_row(
        database_id=settings.appwrite_db_id,
        table_id=settings.appwrite_collection_chat_logs,
        row_id=str(uuid.uuid4()),
        data={
            "session_id": session_id,
            "user_id": user_id,
            "role": "assistant",
            "content": actor_response,
            "timestamp": now,
        },
    )

    # Update session score + progress (stored in preferences JSON)
    updated_prefs = {
        **prefs,
        "constraints_discovered": constraints_discovered,
        "message_scores": message_scores,
    }
    db.update_row(
        database_id=settings.appwrite_db_id,
        table_id=settings.appwrite_collection_sessions,
        row_id=session_id,
        data={
            "final_score": new_score,
            "preferences": json.dumps(updated_prefs),
        },
    )

    return {
        "message": actor_response,
        "sender": Sender.actor_ai.value,
        "score_delta": director_decision.score_delta,
        "current_score": new_score,
        "constraints_discovered": len(constraints_discovered),
        "constraints_total": len(all_constraints),
        "metadata": {
            "communication_score": director_decision.communication_score,
            "reveal_level": director_decision.reveal_level,
            "rationale": director_decision.rationale,
        },
    }


@router.post("/api/chat/send")
async def send_chat_message(
    body: ChatMessage,
    user_id: str = Depends(get_current_user_id),
):
    """Send a chat message and get AI response."""
    db = get_tables_db()
    try:
        result = await _run_dual_agent_pipeline(
            session_id=body.session_id,
            user_id=user_id,
            user_message=body.message,
            db=db,
        )
        return result
    except Exception as e:
        logger.error(f"send_chat_message error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/chat/history/{session_id}")
async def get_chat_history(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get full chat history for a session."""
    db = get_tables_db()
    try:
        result = db.list_rows(
            database_id=settings.appwrite_db_id,
            table_id=settings.appwrite_collection_chat_logs,
            queries=[Query.equal("session_id", session_id), Query.order_asc("$createdAt")],
        )
        # Normalise to the shape the frontend expects
        rows = result.get("rows", [])
        return {
            "documents": [
                {
                    "sender": r.get("role", "user"),
                    "message": r.get("content", ""),
                    "$createdAt": r.get("timestamp", r.get("$createdAt", "")),
                    "$id": r.get("$id", ""),
                }
                for r in rows
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# WebSocket endpoint for real-time chat
# ─────────────────────────────────────────────

active_connections: dict[str, list[WebSocket]] = {}


@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    """Real-time chat via WebSocket."""
    await websocket.accept()
    session_id = None
    db = get_tables_db()

    try:
        # First message must be auth handshake
        auth_data = await websocket.receive_json()
        token = auth_data.get("token")
        session_id = auth_data.get("session_id")

        if not token or not session_id:
            await websocket.send_json({"type": "error", "message": "Missing token or session_id"})
            await websocket.close()
            return

        # Validate token
        from appwrite.client import Client
        from appwrite.services.account import Account
        client = Client()
        client.set_endpoint(settings.appwrite_endpoint)
        client.set_project(settings.appwrite_project_id)
        client.set_jwt(token)
        account_svc = Account(client)
        appwrite_user = account_svc.get()
        user_id = appwrite_user["$id"]

        # Track connection
        if session_id not in active_connections:
            active_connections[session_id] = []
        active_connections[session_id].append(websocket)

        await websocket.send_json({"type": "connected", "session_id": session_id})

        # Message loop
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "chat_message":
                user_message = data.get("payload", {}).get("message", "")
                try:
                    result = await _run_dual_agent_pipeline(
                        session_id=session_id,
                        user_id=user_id,
                        user_message=user_message,
                        db=db,
                    )
                    await websocket.send_json({
                        "type": "chat_response",
                        "session_id": session_id,
                        "payload": result,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
                except Exception as e:
                    await websocket.send_json({"type": "error", "message": str(e)})

    except WebSocketDisconnect:
        pass
    finally:
        if session_id and session_id in active_connections:
            connections = active_connections[session_id]
            if websocket in connections:
                connections.remove(websocket)
