import google.generativeai as genai
from pydantic import BaseModel
from typing import List
import json
import warnings

# Suppress deprecation warnings
warnings.filterwarnings("ignore", category=FutureWarning)

class Assessment(BaseModel):
    letter_grade: str  
    total_score: float 
    constraint_discovery_pts: float 
    communication_pts: float 
    feedback: str 

class EvaluatorAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        # Using 1.5-flash for maximum stability on Free Tier
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def grade_session(self, chat_history: List[dict], truth_file: dict) -> Assessment:
        prompt = f"""
        ACT AS: Senior Software Architect.
        TASK: Grade the student's interview performance.
        
        TRUTH FILE: {json.dumps(truth_file)}
        CHAT TRANSCRIPT: {json.dumps(chat_history)}
        
        OUTPUT FORMAT: JSON matching the Assessment schema.
        """
        
        response = self.model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )

        data = json.loads(response.text)
        
        # Handle cases where AI wraps the response in a 'assessment' key
        if "assessment" in data:
            data = data["assessment"]

        return Assessment(**data)