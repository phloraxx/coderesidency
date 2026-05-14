"""
AI Agents for the Code Crucible (Phase 2) module.

ChallengeGeneratorAgent: Generates coding challenges from scenario context
OutputValidatorAgent: Reviews code quality after test execution
"""

import json
import logging
from typing import Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from app.config import settings

logger = logging.getLogger(__name__)


class ChallengeGeneratorAgent:
    """Generates coding challenges from scenario truth_file context."""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite-preview-09-2025",
            google_api_key=settings.gemini_api_key,
            temperature=0.3,
        )

    async def generate(
        self,
        truth_file: dict,
        scenario_title: str,
        scenario_description: str,
        difficulty: int = 3,
    ) -> dict:
        """
        Generate a coding challenge with test cases from scenario context.

        Returns:
            dict: {
                task_description, function_signature, test_cases,
                hints, language, time_limit_minutes, starter_code
            }
        """
        challenge_context = truth_file.get("challenge_context", {})
        constraints = truth_file.get("constraints", [])

        difficulty_guide = {
            1: "beginner-friendly, simple inputs/outputs, 3-4 test cases",
            2: "easy, straightforward logic, 4-5 test cases",
            3: "intermediate, requires thought, 5-6 test cases with edge cases",
            4: "challenging, multiple edge cases, 6-7 test cases",
            5: "advanced, complex logic, 7-8 test cases including tricky edge cases",
        }

        system_prompt = f"""You are an expert coding challenge designer for CodeResidency.

SCENARIO CONTEXT:
Title: {scenario_title}
Description: {scenario_description}

CHALLENGE CONTEXT (from truth_file):
{json.dumps(challenge_context, indent=2)}

CONSTRAINTS/REQUIREMENTS:
{json.dumps(constraints, indent=2)}

DIFFICULTY LEVEL: {difficulty}/5 — {difficulty_guide.get(difficulty, difficulty_guide[3])}

YOUR TASK:
Generate a standalone Python coding challenge based on this context.

REQUIREMENTS FOR THE CHALLENGE:
1. Task should be practical and relate to the scenario context
2. Function signature must be clear with type hints
3. Test cases must have DETERMINISTIC outputs (same input = same output always)
4. Test case inputs should be valid Python expressions (will be eval'd)
5. Test case expected_outputs should be the exact stdout when print(result) is called
6. Include edge cases: empty inputs, boundary values, large numbers if applicable
7. Hints should be progressive: first hint is gentle, later hints are more direct
8. Starter code should have the function signature and a pass statement

OUTPUT FORMAT (JSON only, no explanation):
{{
    "task_description": "<clear description of what to implement, 2-4 sentences>",
    "function_signature": "def function_name(param: type) -> return_type:",
    "function_name": "<just the function name for test harness>",
    "test_cases": [
        {{"input": "<valid Python expression>", "expected_output": "<exact stdout string>"}},
        ...
    ],
    "hints": [
        "<hint 1 - gentle nudge>",
        "<hint 2 - more specific>",
        "<hint 3 - nearly gives it away>"
    ],
    "language": "python",
    "time_limit_minutes": <15-30 based on difficulty>,
    "starter_code": "<function signature + docstring + pass>"
}}

IMPORTANT:
- Test case inputs must be valid Python (e.g., "[1, 2, 3]" not "1, 2, 3")
- expected_output is what print(function(input)) would show, as a string
- For numbers, use the exact string representation (e.g., "5.5" not "5.50")
- Include 4-6 test cases covering normal cases and edge cases
"""

        messages = [HumanMessage(content=system_prompt)]
        response = await self.llm.ainvoke(messages)

        try:
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            data = json.loads(content)

            # Validate required fields
            required = ["task_description", "function_signature", "test_cases", "function_name"]
            for field in required:
                if field not in data:
                    raise ValueError(f"Missing required field: {field}")

            # Ensure defaults
            data.setdefault("hints", [])
            data.setdefault("language", "python")
            data.setdefault("time_limit_minutes", 20)
            data.setdefault("starter_code", f"{data['function_signature']}\n    # Your code here\n    pass")

            return data

        except Exception as e:
            logger.error(f"ChallengeGeneratorAgent parse error: {e}\nRaw: {response.content}")
            # Fallback challenge
            return {
                "task_description": "Write a function that calculates the sum of all numbers in a list.",
                "function_signature": "def sum_list(numbers: list) -> int:",
                "function_name": "sum_list",
                "test_cases": [
                    {"input": "[1, 2, 3]", "expected_output": "6"},
                    {"input": "[]", "expected_output": "0"},
                    {"input": "[5]", "expected_output": "5"},
                    {"input": "[-1, 1]", "expected_output": "0"},
                ],
                "hints": [
                    "Think about how to iterate through a list",
                    "You can use a loop or Python's built-in sum()",
                    "sum() takes an iterable and returns the total",
                ],
                "language": "python",
                "time_limit_minutes": 15,
                "starter_code": "def sum_list(numbers: list) -> int:\n    # Your code here\n    pass",
            }


class OutputValidatorAgent:
    """Reviews code quality after test execution (not test correctness)."""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=settings.gemini_api_key,
            temperature=0.2,
        )

    async def validate(
        self,
        student_code: str,
        test_results: list[dict],
        language: str = "python",
    ) -> dict:
        """
        Review code quality and provide feedback.

        Returns:
            dict: {
                code_quality_score (0-30), feedback,
                naming_quality, structure_quality, readability_quality
            }
        """
        passed_count = sum(1 for t in test_results if t.get("passed", False))
        total_count = len(test_results)

        system_prompt = f"""You are a code quality reviewer for CodeResidency.

STUDENT'S CODE ({language}):
```{language}
{student_code}
```

TEST RESULTS:
- Passed: {passed_count}/{total_count} tests

YOUR TASK:
Evaluate the CODE QUALITY (not correctness — that's already measured by tests).

SCORING CRITERIA (total 30 points max):
1. NAMING (10 pts): Are variable/function names descriptive and follow conventions?
   - 8-10: Excellent, self-documenting names
   - 5-7: Good, mostly clear names
   - 2-4: Poor, unclear or single-letter names everywhere
   - 0-1: Very poor, confusing names

2. STRUCTURE (10 pts): Is the code well-organized? Proper use of functions/loops?
   - 8-10: Clean, logical structure, good separation of concerns
   - 5-7: Reasonable structure, minor issues
   - 2-4: Messy, hard to follow
   - 0-1: Completely unstructured

3. READABILITY (10 pts): Is it easy to understand? Good formatting? Comments where needed?
   - 8-10: Crystal clear, well-formatted
   - 5-7: Readable with minor issues
   - 2-4: Difficult to read
   - 0-1: Very poor readability

OUTPUT FORMAT (JSON only):
{{
    "code_quality_score": <0-30 total>,
    "feedback": "<2-3 sentences of constructive feedback>",
    "naming_quality": "<good|fair|poor>",
    "naming_score": <0-10>,
    "structure_quality": "<good|fair|poor>",
    "structure_score": <0-10>,
    "readability_quality": "<good|fair|poor>",
    "readability_score": <0-10>
}}
"""

        messages = [HumanMessage(content=system_prompt)]
        response = await self.llm.ainvoke(messages)

        try:
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()

            data = json.loads(content)

            # Ensure score is capped at 30
            data["code_quality_score"] = min(data.get("code_quality_score", 15), 30)

            return data

        except Exception as e:
            logger.error(f"OutputValidatorAgent parse error: {e}\nRaw: {response.content}")
            # Fallback evaluation
            return {
                "code_quality_score": 15,
                "feedback": "Code runs correctly. Consider using more descriptive variable names.",
                "naming_quality": "fair",
                "naming_score": 5,
                "structure_quality": "fair",
                "structure_score": 5,
                "readability_quality": "fair",
                "readability_score": 5,
            }


# ─── Singleton Pattern ─────────────────────────────────────────────
_challenge_generator: Optional[ChallengeGeneratorAgent] = None
_output_validator: Optional[OutputValidatorAgent] = None


def get_challenge_generator() -> ChallengeGeneratorAgent:
    global _challenge_generator
    if _challenge_generator is None:
        _challenge_generator = ChallengeGeneratorAgent()
    return _challenge_generator


def get_output_validator() -> OutputValidatorAgent:
    global _output_validator
    if _output_validator is None:
        _output_validator = OutputValidatorAgent()
    return _output_validator
