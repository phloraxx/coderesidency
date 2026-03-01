import os
import json
from agents.director import DirectorAgent
from agents.actor import ActorAgent
from agents.evaluator import EvaluatorAgent

def select_scenario():
    scenario_dir = 'scenarios'
    # Check if directory exists
    if not os.path.exists(scenario_dir):
        print(f"Error: Folder '{scenario_dir}' not found!")
        exit()
        
    files = [f for f in os.listdir(scenario_dir) if f.endswith('.json')]
    
    if not files:
        print("No scenarios found in /scenarios folder!")
        exit()

    print("\n--- SELECT A SCENARIO ---")
    for i, file in enumerate(files):
        print(f"{i + 1}. {file.replace('.json', '')}")
    
    try:
        choice = int(input("\nEnter the number of the scenario you want to run: ")) - 1
        if choice < 0 or choice >= len(files):
            raise IndexError
        return os.path.join(scenario_dir, files[choice])
    except (ValueError, IndexError):
        print("Invalid choice. Defaulting to the first scenario.")
        return os.path.join(scenario_dir, files[0])

def main():
    # 1. Setup
    # WARNING: Keeping API keys in code is risky if pushed to GitHub.
    API_KEY = "AIzaSyAjU4otIN2s_2797Fb978j5gNc8C9SSt-E" 
    
    scenario_path = select_scenario()
    
    with open(scenario_path, 'r') as f:
        scenario_data = json.load(f)

    # Correctly indented truth_file logic
    truth_data = scenario_data.get('truth_file')

    if isinstance(truth_data, dict):
        # If the truth data is already inside the file, just use it
        truth_content = truth_data
    elif isinstance(truth_data, str):
        # If it's a string (a path), open that file
        try:
            with open(truth_data, 'r') as f:
                truth_content = json.load(f)
        except FileNotFoundError:
            print(f"Warning: Truth file {truth_data} not found. Using empty dict.")
            truth_content = {}
    else:
        truth_content = {}


    # 2. Initialize Agents
    # Add 'truth_content' as a second argument to these agents
    director = DirectorAgent(API_KEY, truth_content) 
    actor = ActorAgent(API_KEY) # Actor usually stays "in the dark"
    evaluator = EvaluatorAgent(API_KEY, truth_content)

    chat_history = []
    print(f"\n--- STARTING SIMULATION: {scenario_data.get('name', 'Unknown')} ---")
    print(f"Client: {scenario_data.get('initial_message', 'Hello!')}")

    # 3. Chat Loop
    for _ in range(6):  # Limit turns to preserve your 20-request daily quota
        user_input = input("\nYou (Student): ")
        if user_input.lower() in ['exit', 'quit', 'done']:
            break

        # Director evaluates and gives instructions
        # Note: Each call here uses your daily request quota
        evaluation = director.evaluate_message(user_input, chat_history)
        
        # Actor responds based on Director's guidance
        actor_reply = actor.generate_response(
            director_instruction=evaluation.reveal_instruction,
            chat_history=chat_history
        )
        
        print(f"\nClient: {actor_reply}")
        chat_history.append({"role": "user", "content": user_input})
        chat_history.append({"role": "assistant", "content": actor_reply})

    # 4. Final Grading
    print("\n--- GENERATING FINAL EVALUATION ---")
    try:
        # Final grading call also uses your quota
        report = evaluator.grade_session(chat_history, truth_content)
        print(f"\nGRADE: {report.letter_grade} ({report.total_score}/100)")
        print(f"FEEDBACK: {report.feedback}")
    except Exception as e:
        print(f"Grading failed: {e}")

if __name__ == "__main__":
    main()