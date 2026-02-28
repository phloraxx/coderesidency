import google.generativeai as genai
from pydantic import BaseModel
from typing import List
import json
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

class Assessment(BaseModel):
    letter_grade: str  # A+, A, B, etc.
    total_score: float # 0-100
    constraint_discovery_pts: float # 0-40
    communication_pts: float # 0-25
    feedback: str # Qualitative advice

class EvaluatorAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash-latest')

    def grade_session(self, chat_history: List[dict], truth_file: dict) -> Assessment:
        prompt = f"""
        ACT AS: Senior Software Architect / Lead Instructor.
        TASK: Grade the student's performance based on the provided Chat Transcript and Truth File.
        
        RUBRIC:
        - Constraint Discovery (40%): Did they find the hidden budget, deadline, etc?
        - Communication Quality (25%): Were they polite? Did they avoid jargon?
        - Professionalism (15%): Empathy and structure.
        - Efficiency (10%): Was the interview concise?
        
        TRUTH FILE: {json.dumps(truth_file)}
        CHAT TRANSCRIPT: {json.dumps(chat_history)}
        
        OUTPUT FORMAT: JSON matching the Assessment schema.
        """
        
        response = self.model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        return Assessment.parse_raw(response.text)