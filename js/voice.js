// ===============================
// Voice Controller for Campus Assistant
// ===============================

let stage = "welcome";   // welcome → ask → confirm → navigate
let spokenDestination = "";
let recognition = null;

// 🔊 Text to Speech
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  msg.rate = 1;
  msg.pitch = 1;
  window.speechSynthesis.cancel(); // stop previous speech
  window.speechSynthesis.speak(msg);
}

// 🖥️ Update on-screen status (for judges / helpers)
function updateStatus(text) {
  const el = document.getElementById("status");
  if (el) el.innerText = text;
}

// 🎤 Start Speech Recognition
function startRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    speak("Sorry, voice recognition is not supported in this browser.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.start();

  recognition.onresult = handleResult;

  recognition.onerror = () => {
    speak("I did not understand. Please say again.");
    setTimeout(startRecognition, 1500);
  };
}

// 🎯 Handle what the user says
function handleResult(event) {
  const text = event.results[0][0].transcript.toLowerCase();
  updateStatus("You said: " + text);

  // 🔹 STAGE: ASK DESTINATION
  if (stage === "ask") {
    spokenDestination = text;

    speak(
      "You are saying " +
      spokenDestination +
      ". Say OK to continue or NO to repeat."
    );

    stage = "confirm";
    setTimeout(startRecognition, 2000);
  }

  // 🔹 STAGE: CONFIRM DESTINATION
  else if (stage === "confirm") {
    if (text.includes("ok") || text.includes("yes")) {
      speak("Okay. Starting navigation.");
      stage = "navigate";

      // ✅ CALL app.js FUNCTION
      handleDestination(spokenDestination);

    } else {
      speak("Okay. Please say your destination again.");
      stage = "ask";
      setTimeout(startRecognition, 2000);
    }
  }
}

// 🚀 App Start (must be triggered by user tap)
function startApp() {
  if (stage !== "welcome") return;

  updateStatus("Welcome");
  speak("Welcome to Bishop Heber College.");

  setTimeout(() => {
    speak("Where are you going?");
    stage = "ask";
    updateStatus("Listening for destination...");
    setTimeout(startRecognition, 2000);
  }, 2000);
}
