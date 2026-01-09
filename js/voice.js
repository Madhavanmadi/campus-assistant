// ===============================
// Voice Controller (Blind Friendly)
// ===============================

let stage = "idle";   // idle → ask → confirm → navigate
let spokenDestination = "";
let recognition = null;
let isListening = false;

// DOM
const bodyEl = document.getElementById("appBody");
const statusEl = document.getElementById("status");

// 🔊 Speak helper (callback after speech ends)
function speak(text, onEnd) {
  window.speechSynthesis.cancel();

  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  msg.rate = 1;
  msg.pitch = 1;

  msg.onend = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(msg);
}

// 🖥️ Update status
function updateStatus(text) {
  if (statusEl) statusEl.innerText = text;
}

// 🎤 Start mic safely
function startRecognition() {
  if (isListening) return;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    speak("Voice recognition not supported");
    return;
  }

  recognition = new SR();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
    isListening = true;
    updateStatus("Mic ON. Speak now.");
  };

  recognition.onresult = handleResult;

  recognition.onerror = () => {
    isListening = false;
    updateStatus("Didn't catch that. Please speak again.");
  };

  recognition.onend = () => {
    isListening = false;
  };

  recognition.start();
}

// 🎯 Handle speech
function handleResult(event) {
  const text = event.results[0][0].transcript.toLowerCase().trim();
  updateStatus("You said: " + text);

  /* ---------- ASK STAGE ---------- */
  if (stage === "ask") {
    spokenDestination = text;

    speak(
      `You said ${spokenDestination}. Say yes to confirm or no to repeat.`,
      () => {
        stage = "confirm";
        setTimeout(startRecognition, 1000); // 🔑 silence gap
      }
    );

    return; // ✅ VERY IMPORTANT
  }

  /* ---------- CONFIRM STAGE ---------- */
  if (stage === "confirm") {
    if (
      text === "yes" ||
      text === "ok" ||
      text.includes("yes") ||
      text.includes("okay")
    ) {
      speak("Starting navigation.", () => {
        stage = "navigate";
        handleDestination(spokenDestination); // app.js
      });
    } else {
      speak("Please say your destination again.", () => {
        stage = "ask";
        setTimeout(startRecognition, 1000);
      });
    }
  }
}

// 🚀 MAIN START — USER TAP REQUIRED
bodyEl.addEventListener("click", () => {
  if (stage !== "idle") return;

  stage = "welcome";
  updateStatus("Welcome");

  speak("Welcome to Bishop Heber College.", () => {
    speak("Where are you going?", () => {
      stage = "ask";
      updateStatus("Listening for destination...");
      startRecognition();
    });
  });
});
