"""
The Dual-Agent AI System for CodeResidency's conversational modules.

Director Agent (Hidden Game Master):
- Evaluates student communication quality
- Manages the truth_file constraints
- Decides what/how much to reveal
- Calculates score deltas
- Instructs the Actor Agent

Actor Agent (Visible Persona):
- Embodies the client/HR persona
- Generates natural in-character responses
- Follows Director's instructions
"""

import json
import logging
from typing import Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.config import settings
from app.models.chat import DirectorDecision

logger = logging.getLogger(__name__)


class DirectorAgent:
    """Hidden game master that evaluates student input and instructs the Actor."""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=settings.gemini_api_key,
            temperature=0.3,
        )

    async def evaluate(
        self,
        student_message: str,
        truth_file: dict,
        conversation_history: list[dict],
        constraints_discovered: list[str],
        current_score: int,
        persona: dict,
    ) -> DirectorDecision:
        """
        Evaluate student message and produce an instruction for the Actor Agent.
        """
        all_constraints = [c["id"] for c in truth_file.get("constraints", [])]
        not_discovered = [c for c in all_constraints if c not in constraints_discovered]

        history_text = "\n".join(
            f"{m.get('role', m.get('sender', 'user')).upper()}: {m.get('content', m.get('message', ''))}"
            for m in conversation_history[-10:]  # last 10 messages for context
        )

        system_prompt = f"""You are the Director Agent for CodeResidency's simulation module.

ROLE: You are the hidden game master. The student CANNOT see your outputs.

TRUTH FILE (Hidden from student):
{json.dumps(truth_file, indent=2)}

CURRENT PROGRESS:
- Constraints discovered: {len(constraints_discovered)}/{len(all_constraints)}
- Student has discovered: {constraints_discovered}
- Student has NOT discovered: {not_discovered}
- Current score: {current_score}

CONVERSATION HISTORY (last 10 messages):
{history_text}

STUDENT'S LATEST MESSAGE: "{student_message}"

YOUR TASK:
1. Evaluate the student's communication quality (0-10): Is it polite? Clear? Empathetic? Jargon-free?
2. Determine if the message probes for a specific hidden constraint
3. Decide whether and how much to reveal (based on question quality)
4. Generate an INSTRUCTION for the Actor Agent (what to say/reveal)
5. Calculate a score delta (0-25 points based on quality + discovery)

OUTPUT FORMAT (JSON only, no extra text):
{{
  "communication_score": <float 0-10>,
  "rationale": "<why you scored this way>",
  "constraint_to_address": "<constraint id or null>",
  "reveal_level": "<none|partial|full>",
  "actor_instruction": "<specific instruction for what Actor should say/reveal>",
  "score_delta": <integer 0-25>
}}

SCORING GUIDE:
- Rude/technical jargon: 0-3 points, reveal_level: none
- OK but could be clearer: 4-6 points, reveal_level: partial (if relevant)
- Great question, empathetic, clear: 7-10 points, reveal_level: full (if relevant)
- Off-topic: 0-2 points, reveal_level: none
"""

        messages = [HumanMessage(content=system_prompt)]
        response = await self.llm.ainvoke(messages)

        try:
            # Extract JSON from response
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            data = json.loads(content)
            return DirectorDecision(**data)
        except Exception as e:
            logger.error(f"Director Agent parse error: {e}\nRaw: {response.content}")
            # Fallback safe decision
            return DirectorDecision(
                communication_score=5.0,
                rationale="Could not parse director response",
                actor_instruction="Respond naturally to the student's question, staying in character.",
                score_delta=5,
            )


class ActorAgent:
    """Visible AI persona that generates in-character responses."""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=settings.gemini_api_key,
            temperature=0.8,
        )

    async def respond(
        self,
        persona: dict,
        director_instruction: str,
        conversation_history: list[dict],
        student_message: str,
    ) -> str:
        """Generate an in-character response following the Director's instruction."""
        history_text = "\n".join(
            f"{m.get('role', m.get('sender', 'user')).upper()}: {m.get('content', m.get('message', ''))}"
            for m in conversation_history[-8:]
        )

        system_prompt = f"""You are playing the role of "{persona.get('name', 'the client')}" in a simulation.

PERSONA DETAILS:
- Name: {persona.get('name', 'Unknown')}
- Business/Role: {persona.get('business', persona.get('role', 'Unknown'))}
- Personality: {persona.get('personality', 'friendly but cautious')}
- Technical Knowledge: {persona.get('technical_knowledge', 'minimal')}
- Current Mood: {persona.get('initial_mood', 'neutral')}

CONVERSATION HISTORY (last 8 messages):
{history_text}

STUDENT'S LATEST MESSAGE: "{student_message}"

DIRECTOR'S INSTRUCTION (follow this exactly):
{director_instruction}

YOUR TASK:
Generate a natural, in-character response that:
1. Follows the Director's instruction precisely
2. Maintains your persona's personality, vocabulary, and tone
3. Uses NO technical jargon (you're a non-technical person)
4. Feels authentic and human, with natural speech patterns
5. Reveals ONLY what the Director instructed — nothing more

Your response should be ONLY your character's spoken words (no stage directions, no quotation marks).
Keep it conversational, 2-4 sentences typically.
"""
        messages = [HumanMessage(content=system_prompt)]
        response = await self.llm.ainvoke(messages)
        return response.content.strip()


class EvaluatorAgent:
    """Generates final evaluation reports after session completion."""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=settings.gemini_api_key,
            temperature=0.4,
        )

    async def generate_report(
        self,
        session_data: dict,
        conversation_history: list[dict],
        truth_file: dict,
        constraints_discovered: list[str],
        final_score: int,
    ) -> dict:
        """Generate a comprehensive evaluation report card."""
        all_constraints = [c["id"] for c in truth_file.get("constraints", [])]
        discovery_rate = len(constraints_discovered) / max(len(all_constraints), 1)

        history_text = "\n".join(
            f"{m.get('role', m.get('sender', 'user')).upper()}: {m.get('content', m.get('message', ''))}"
            for m in conversation_history
        )

        prompt = f"""You are an expert evaluator for CodeResidency, an engineering education platform.

STUDENT SESSION DATA:
- Final Score: {final_score}/100
- Constraints Discovered: {len(constraints_discovered)}/{len(all_constraints)} ({discovery_rate*100:.0f}%)
- Constraints Found: {constraints_discovered}
- Constraints Missed: {[c for c in all_constraints if c not in constraints_discovered]}

FULL CONVERSATION:
{history_text}

Generate a detailed evaluation report in JSON format:
{{
  "communication_score": <integer 0-100>,
  "technical_score": <integer 0-100>,
  "efficiency_score": <integer 0-100>,
  "overall_score": {final_score},
  "letter_grade": "<A+|A|B+|B|C+|C|D|F>",
  "strengths": "<2-3 specific positive things the student did well>",
  "areas_for_improvement": "<2-3 specific actionable improvements>",
  "detailed_breakdown": {{
    "communication": {{
      "clarity": {{"score": <0-100>, "feedback": "<specific feedback>"}},
      "empathy": {{"score": <0-100>, "feedback": "<specific feedback>"}},
      "jargon_avoidance": {{"score": <0-100>, "feedback": "<specific feedback>"}}
    }},
    "requirement_discovery": {{
      "completeness": {{"score": <0-100>, "feedback": "<specific feedback>"}},
      "questioning_strategy": {{"score": <0-100>, "feedback": "<specific feedback>"}}
    }}
  }}
}}

Letter grade: A+ (95+), A (90+), B+ (85+), B (80+), C+ (75+), C (70+), D (60+), F (<60)
Output ONLY valid JSON.
"""

        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        try:
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            return json.loads(content)
        except Exception as e:
            logger.error(f"Evaluator parse error: {e}")
            return {
                "communication_score": 70,
                "technical_score": 70,
                "efficiency_score": 70,
                "overall_score": final_score,
                "letter_grade": "C+",
                "strengths": "Showed persistence throughout the simulation.",
                "areas_for_improvement": "Practice asking more targeted, empathetic questions.",
                "detailed_breakdown": {},
            }
