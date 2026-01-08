// ==================================
// Voice Controller – Campus Assistant
// ==================================

let stage = "welcome";   // welcome → ask → confirm → navigate
let spokenDestination = "";
let recognition = null;

// 🔊 Text-to-Speech
function speak(text) {
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  msg.rate = 1;
  msg.pitch = 1;
  window.speechSynthesis.speak(msg);
}

// 🖥️ Status update (optional UI)
function updateStatus(text) {
  const el = document.getElementById("status");
  if (el) el.innerText = text;
}

// 🎤 Start Speech Recognition (ROBUST)
function startRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    speak("Voice recognition is not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;

  updateStatus("Listening… please speak");
  recognition.start();

  // When speech detected
  recognition.onresult = (event) => {
    handleResult(event);
  };

  // If error / noise
  recognition.onerror = () => {
    updateStatus("Didn't catch that. Listening again…");
    if (stage === "ask" || stage === "confirm") {
      setTimeout(startRecognition, 1500);
    }
  };

  // If user stayed silent
  recognition.onend = () => {
    if (stage === "ask" || stage === "confirm") {
      setTimeout(startRecognition, 1500);
    }
  };
}

// 🎯 Handle spoken result
function handleResult(event) {
  const text = event.results[0][0].transcript
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  updateStatus("You said: " + text);

  // 🔹 ASK DESTINATION
  if (stage === "ask") {
    spokenDestination = text;

    speak(
      `You are saying ${spokenDestination}. Say OK to continue or NO to repeat.`
    );

    stage = "confirm";
    return;
  }

  // 🔹 CONFIRM DESTINATION
  if (stage === "confirm") {
    if (text.includes("ok") || text.includes("yes")) {
      speak("Okay. Starting navigation.");
      stage = "navigate";

      // ✅ CALL GPS + ROUTE LOGIC (app.js)
      handleDestination(spokenDestination);

    } else {
      speak("Okay. Please say your destination again.");
      stage = "ask";
      setTimeout(startRecognition, 1500);
    }
  }
}

// 🚀 App Start (must be user-initiated)
function startApp() {
  if (stage !== "welcome") return;

  updateStatus("Welcome");
  speak("Welcome to Bishop Heber College.");

  setTimeout(() => {
    speak("Where are you going?");
    stage = "ask";
    updateStatus("Listening for destination…");
    setTimeout(startRecognition, 2000);
  }, 2000);
}
