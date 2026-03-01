import os
import json
from agents.director import DirectorAgent
from agents.actor import ActorAgent
from agents.evaluator import EvaluatorAgent

def select_scenario():
    scenario_dir = 'scenarios'
    files = [f for f in os.listdir(scenario_dir) if f.endswith('.json')]
    
    if not files:
        print("No scenarios found in /scenarios folder!")
        exit()

    print("\n--- SELECT A SCENARIO ---")
    for i, file in enumerate(files):
        print(f"{i + 1}. {file.replace('.json', '')}")
    
    try:
        choice = int(input("\nEnter the number of the scenario you want to run: ")) - 1
        return os.path.join(scenario_dir, files[choice])
    except (ValueError, IndexError):
        print("Invalid choice. Defaulting to the first scenario.")
        return os.path.join(scenario_dir, files[0])

def main():
    # 1. Setup
    API_KEY = "AIzaSyAjU4otIN2s_2797Fb978j5gNc8C9SSt-E" # Replace with your AI Studio Key
    scenario_path = select_scenario()
    
    with open(scenario_path, 'r') as f:
        scenario_data = json.load(f)

    # Load truth file content
    with open(scenario_data['truth_file'], 'r') as f:
        truth_content = json.load(f)

    # 2. Initialize Agents
    director = DirectorAgent(API_KEY)
    actor = ActorAgent(API_KEY)
    evaluator = EvaluatorAgent(API_KEY)

    chat_history = []
    print(f"\n--- STARTING SIMULATION: {scenario_data['name']} ---")
    print(f"Client: {scenario_data['initial_message']}")

    # 3. Chat Loop
    for _ in range(6):  # Limit to 6 turns to save quota
        user_input = input("\nYou (Student): ")
        if user_input.lower() in ['exit', 'quit', 'done']:
            break

        # Director evaluates and gives instructions
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
        report = evaluator.grade_session(chat_history, truth_content)
        print(f"\nGRADE: {report.letter_grade} ({report.total_score}/100)")
        print(f"FEEDBACK: {report.feedback}")
    except Exception as e:
        print(f"Grading failed: {e}")

if __name__ == "__main__":
    main()