const wakeWord = "hey jarvis";
const stopWord = "goodbye jarvis"; // Stop word to exit the interaction
let mode = "wake"; // "wake" or "command"
let isSpeaking = false;
let isRecognizing = false; // Prevent multiple recognition starts
let isActive = false; // Tracks if the assistant is active or not

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = "en-US";

recognition.onstart = () => {
    isRecognizing = true;
    console.log("Recognition started in mode:", mode);
};

recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
};

recognition.onresult = (event) => {
    if (isSpeaking) return; // Don’t process input while speaking

    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("Heard:", transcript);

    if (mode === "wake" && transcript.includes(wakeWord)) {
        console.log("Wake word detected.");
        mode = "command";
        isActive = true; // Activate assistant
        stopRecognition(); // Stop recognition momentarily
        speak("Of course, sir. What can I do for you?", () => {
            setTimeout(startRecognition, 500); // Restart listening after slight delay
        });
        return;
    }

    if (mode === "command" && !transcript.includes(stopWord)) {
        console.log("Received command:", transcript);
        stopRecognition(); // Stop recognition momentarily
        sendCommand(transcript); // Send the command to the backend for processing
    }

    if (transcript.includes(stopWord) && isActive) {
        console.log("Goodbye Jarvis detected. Stopping interaction.");
        speak("Goodbye, sir. I'll be here when you need me.", () => {
            mode = "wake"; // Reset to wake mode after goodbye
            stopRecognition(); // Pause recognition
            isActive = false; // Deactivate assistant
        });
    }
};

recognition.onend = () => {
    isRecognizing = false;
    if (isActive && !isSpeaking) {
        console.log("Recognition ended. Restarting...");
        setTimeout(startRecognition, 500); // Delay before restarting recognition after speaking
    } else {
        console.log("Recognition paused while speaking.");
    }
};

function speak(text, callback) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    utterance.voice = voices.find(v => v.name.includes("Google UK English Male")) || voices[0];

    utterance.onstart = () => {
        isSpeaking = true;
    };

    utterance.onend = () => {
        isSpeaking = false;
        if (callback) callback(); // After speaking, start recognition again
    };

    synth.speak(utterance);
}

function sendCommand(command) {
    fetch("/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Response:", data);
        if (data.response) {
            speak(data.response, () => {
                if (isActive) {
                    setTimeout(startRecognition, 500); // Delay before restarting recognition after speaking
                }
            });
        }
    })
    .catch(err => {
        console.error("Error sending command:", err);
    });
}

// Utility to start recognition safely
function startRecognition() {
    if (!isRecognizing && !isSpeaking) {
        recognition.start();
    }
}

// Utility to stop recognition safely
function stopRecognition() {
    if (isRecognizing) {
        recognition.stop();
    }
}

window.onload = () => {
    startRecognition(); // Start listening on load
};
