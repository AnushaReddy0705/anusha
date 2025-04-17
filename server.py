import os
from flask import Flask, render_template, request, jsonify
import requests
import json
from datetime import datetime

app = Flask(__name__)
reminders = []

# Define the path to the notes.txt file in the same directory as server.py
notes_file_path = os.path.join(os.getcwd(), 'notes.txt')

def process_command(command):
    try:
        ollama_response = requests.post(
            'http://localhost:11434/api/generate',
            json={
                "model": "llama2",
                "prompt": (
                    f"You are a helpful AI assistant named NOVA. "
                    f"Reply to this in one short, clear sentence only: {command}"
                ),
                "stream": False
            }
        )
        # Debugging: Print response
        response_json = ollama_response.json()
        print(f"Ollama response: {response_json}")
        return response_json.get('response', 'Sorry, I couldn\'t process that.')
    except Exception as e:
        print(f"Error processing command: {e}")
        return f"Error processing command: {str(e)}"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def handle_command():
    data = request.json
    command = data.get('command', '')
    print(f"Received command: {command}")

    response = process_command(command)

    # Check for reminders
    if "remind" in command.lower():
        reminders.append({
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "text": command
        })
        response = "Reminder set successfully."

    # Check for notes
    if "note" in command.lower() or "take notes" in command.lower():
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        note_content = f"Note taken on {current_time}\n{command}\n\n"
        with open(notes_file_path, 'a') as notes_file:
            notes_file.write(note_content)
        response = f"Note saved successfully."

    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
