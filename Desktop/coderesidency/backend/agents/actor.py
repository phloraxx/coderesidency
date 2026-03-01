import google.generativeai as genai
from typing import List
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

class ActorAgent:
    def __init__(self, api_key: str, persona_data: dict):
        """
        persona_data: Dictionary containing 'name', 'traits', and 'speech_pattern' 
        from your scenario JSON files.
        """
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-3-flash-preview')
        self.persona = persona_data

    def generate_response(self, director_instruction: str, chat_history: List[dict]) -> str:
        """
        Generates a persona-driven response based on the Director's secret instruction.
        """
        
        system_prompt = f"""
        ACT AS: {self.persona['name']}
        YOUR ROLE: {self.persona.get('role', 'A client')}
        PERSONALITY: {', '.join(self.persona['traits'])}
        SPEECH STYLE: {self.persona['speech_pattern']}

        CONTEXT FROM DIRECTOR: 
        The Director has given you this secret instruction for your next reply: 
        "{director_instruction}"

        RULES:
        1. STAY IN CHARACTER. Never mention you are an AI or the 'Director'.
        2. DO NOT reveal more than the Director instructed.
        3. If the student uses technical jargon you don't understand, act confused or annoyed.
        4. Keep responses brief and conversational (like a real person).
        """

        # Format chat history for Gemini
        formatted_history = []
        for entry in chat_history[-5:]: # Only last 5 messages for context
            role = "user" if entry['sender'] == "student" else "model"
            formatted_history.append({"role": role, "parts": [entry['message']]})

        # Add the instruction as a hidden prompt for this specific turn
        full_prompt = f"{system_prompt}\n\nDirector's Instruction: {director_instruction}"
        
        response = self.model.generate_content(full_prompt)
        return response.text