import google.generativeai as genai
from pydantic import BaseModel
from typing import List, Optional
import json
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

# Define the structure of the Director's evaluation for the backend
class DirectorResponse(BaseModel):
    constraint_addressed: Optional[str] = None  # e.g., "budget"
    reveal_instruction: str  # Instruction for the Actor Agent
    score_delta: int  # Points awarded/deducted
    is_polite: bool
    internal_reasoning: str # Why the AI made this choice

class DirectorAgent:
    def __init__(self, api_key: str, truth_file: dict):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash-latest')
        self.truth_file = truth_file

    def evaluate_message(self, student_message: str, chat_history: List[dict]) -> DirectorResponse:
        """
        Analyzes the student's message against the Truth File.
        """
        
        system_prompt = f"""
        You are the 'Director Agent' for CodeResidency. Your role is a hidden Game Master.
        
        TRUTH FILE (Hidden Constraints):
        {json.dumps(self.truth_file)}
        
        TASK:
        1. Compare the student's latest message to the hidden constraints.
        2. If they asked a clear, jargon-free question about a constraint, mark it addressed.
        3. Determine if they were polite or used too much technical jargon.
        4. Generate a 'reveal_instruction' for the Actor (the client) to follow.
        
        OUTPUT FORMAT:
        You must return a valid JSON object matching this schema:
        {{
            "constraint_addressed": "id_of_constraint or null",
            "reveal_instruction": "Instructions for the Actor",
            "score_delta": integer,
            "is_polite": boolean,
            "internal_reasoning": "your logic"
        }}
        """

        # Call Gemini 1.5 Pro with structured output
        response = self.model.generate_content(
            f"{system_prompt}\n\nStudent Message: {student_message}",
            generation_config={"response_mime_type": "application/json"}
        )
        
        return DirectorResponse.parse_raw(response.text)