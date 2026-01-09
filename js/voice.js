// ===============================
// Voice Controller (Blind Friendly) - DEBUG VERSION
// ===============================

let stage = "idle";   // idle → welcome → ask → confirm → navigate
let spokenDestination = "";
let recognition = null;
let isListening = false;

// DOM
const bodyEl = document.getElementById("appBody");
const statusEl = document.getElementById("status");

console.log("[VOICE] voice.js loaded");

/* ---------- SPEAK FUNCTION ---------- */
function speak(text, onEnd) {
  console.log("[VOICE] Speaking:", text);

  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  msg.rate = 1;
  msg.pitch = 1;

  msg.onend = () => {
    console.log("[VOICE] Speech finished:", text);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(msg);
}

/* ---------- UPDATE STATUS ---------- */
function updateStatus(text) {
  console.log("[VOICE] Status update:", text);
  if (statusEl) statusEl.innerText = text;
}

/* ---------- START SPEECH RECOGNITION ---------- */
function startRecognition() {
  console.log("[VOICE] startRecognition() called");

  if (isListening) {
    console.log("[VOICE] Mic already listening");
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    console.error("[VOICE] SpeechRecognition not supported");
    speak("Voice recognition not supported");
    return;
  }

  recognition = new SR();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
    isListening = true;
    console.log("[VOICE] Mic started");
    updateStatus("Mic ON. Speak now.");
  };

  recognition.onresult = handleResult;

  recognition.onerror = err => {
    console.error("[VOICE] Recognition error:", err);
    isListening = false;
    updateStatus("Didn't catch that.");
    speak("Please say again", () => {
      startRecognition();
    });
  };

  recognition.onend = () => {
    console.log("[VOICE] Mic stopped");
    isListening = false;
  };

  recognition.start();
}

/* ---------- HANDLE VOICE RESULT ---------- */
function handleResult(event) {
  const text = event.results[0][0].transcript.toLowerCase().trim();

  console.log("[VOICE] Recognized text:", text);
  console.log("[VOICE] Current stage:", stage);

  updateStatus("You said: " + text);

  /* ---------- STAGE: ASK DESTINATION ---------- */
  if (stage === "ask") {
    spokenDestination = text;
    console.log("[VOICE] Destination captured:", spokenDestination);

    speak(
      `You said ${spokenDestination}. Say yes to confirm or no to repeat.`,
      () => {
        stage = "confirm";
        console.log("[VOICE] Stage changed to CONFIRM");
        startRecognition();
      }
    );
    return;
  }

  /* ---------- STAGE: CONFIRM ---------- */
  if (stage === "confirm") {
    if (text.includes("yes") || text.includes("ok")) {
      console.log("[VOICE] User confirmed destination:", spokenDestination);

      speak("Starting navigation.", () => {
        stage = "navigate";
        console.log("[VOICE] Stage changed to NAVIGATE");
        console.log("[VOICE] Calling handleDestination()");
        handleDestination(spokenDestination); // app.js
      });
    } else {
      console.log("[VOICE] User rejected destination");

      speak("Please say your destination again.", () => {
        stage = "ask";
        console.log("[VOICE] Stage changed back to ASK");
        startRecognition();
      });
    }
  }
}

/* ---------- MAIN START (USER TAP) ---------- */
bodyEl.addEventListener("click", () => {
  console.log("[VOICE] Screen tapped");

  if (stage !== "idle") {
    console.log("[VOICE] App already started");
    return;
  }

  stage = "welcome";
  console.log("[VOICE] Stage changed to WELCOME");
  updateStatus("Welcome");

  speak("Welcome to Bishop Heber College.", () => {
    speak("Where are you going?", () => {
      stage = "ask";
      console.log("[VOICE] Stage changed to ASK");
      updateStatus("Listening for destination...");
      startRecognition();
    });
  });
});

