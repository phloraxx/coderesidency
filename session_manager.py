import json
import os
# These lines tell Python to look inside the 'agents' folder
from agents.director import DirectorAgent
from agents.actor import ActorAgent
from agents.evaluator import EvaluatorAgent

# --- CONFIGURATION ---
# Replace with your actual API Key from Google AI Studio
API_KEY = "AIzaSyAjU4otIN2s_2797Fb978j5gNc8C9SSt-E"

# 1. Load the Truth File
# If you are running this from the backend folder, the path is correct
scenario_path = os.path.join('scenarios', 'bakery_owner.json')
with open(scenario_path, 'r') as f:
    scenario_data = json.load(f)

# 2. Initialize Agents
director = DirectorAgent(api_key=API_KEY, truth_file=scenario_data['truth_file'])
actor = ActorAgent(api_key=API_KEY, persona_data=scenario_data['persona'])
evaluator = EvaluatorAgent(api_key=API_KEY)

# 3. Simulation State
chat_history = []
discovered_constraints = []

def run_chat_turn(student_text):
    global discovered_constraints
    
    # STEP 1: Director Evaluates
    evaluation = director.evaluate_message(student_text, chat_history)
    
    # STEP 2: Logic Check
    if evaluation.constraint_addressed and evaluation.constraint_addressed not in discovered_constraints:
        discovered_constraints.append(evaluation.constraint_addressed)
        print(f"\n[SYSTEM LOG] Constraint Uncovered: {evaluation.constraint_addressed}")

    # STEP 3: Actor Responds
    actor_reply = actor.generate_response(
        director_instruction=evaluation.reveal_instruction,
        chat_history=chat_history
    )
    
    # Record History
    chat_history.append({"sender": "student", "message": student_text})
    chat_history.append({"sender": "client", "message": actor_reply})
    
    return actor_reply

if __name__ == "__main__":
    print(f"--- STARTING SIMULATION: {scenario_data['title']} ---")
    print("Rosa (Client): Hello? I'm looking for the person who is supposed to build my site?")
    
    while True:
        user_input = input("\nYou (Student): ")
        
        if user_input.lower() in ['exit', 'quit', 'done']:
            print("\n--- GENERATING FINAL EVALUATION ---")
            report = evaluator.grade_session(chat_history, scenario_data['truth_file'])
            print(f"\nFINAL GRADE: {report.letter_grade}")
            print(f"TOTAL SCORE: {report.total_score}/100")
            print(f"FEEDBACK: {report.feedback}")
            break
        
        response = run_chat_turn(user_input)
        print(f"\nRosa (Client): {response}")