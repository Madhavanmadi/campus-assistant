// ===============================
// Voice Controller (Blind Friendly)
// ===============================

let stage = "idle";   // idle → ask → confirm → navigate
let spokenDestination = "";
let recognition = null;

// DOM
const bodyEl = document.getElementById("appBody");
const statusEl = document.getElementById("status");

// 🔊 Speak helper
function speak(text) {
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  msg.rate = 1;
  msg.pitch = 1;
  window.speechSynthesis.speak(msg);
}

// 🖥️ Update status
function updateStatus(text) {
  if (statusEl) statusEl.innerText = text;
}

// 🎤 Start mic
function startRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SR) {
    speak("Voice recognition not supported on this device");
    return;
  }

  recognition = new SR();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;

  updateStatus("Listening...");
  recognition.start();

  recognition.onresult = handleResult;

  recognition.onerror = () => {
    updateStatus("Didn't catch that. Listening again.");
    setTimeout(startRecognition, 1500);
  };

  recognition.onend = () => {
    if (stage === "ask" || stage === "confirm") {
      setTimeout(startRecognition, 1500);
    }
  };
}

// 🎯 Handle speech
function handleResult(event) {
  const text = event.results[0][0].transcript.toLowerCase().trim();
  updateStatus("You said: " + text);

  // STEP 1: Ask destination
  if (stage === "ask") {
    spokenDestination = text.toLowerCase().trim();
    speak(
      `You are saying ${spokenDestination}. Say OK to continue or NO to repeat.`
    );
    stage = "confirm";
    return;
  }

  // STEP 2: Confirm
  if (stage === "confirm") {
    if (text.includes("ok") || text.includes("yes")) {
      speak("Starting navigation.");
      stage = "navigate";
      handleDestination(spokenDestination); // app.js
    } else {
      speak("Please say your destination again.");
      stage = "ask";
      setTimeout(startRecognition, 1500);
    }
  }
}

// 🚀 MAIN START — ANYWHERE USER TAPS
bodyEl.addEventListener("click", () => {

  // Prevent re-trigger
  if (stage !== "idle") return;

  stage = "welcome";
  updateStatus("Welcome");

  // 🔊 Welcome
  speak("Welcome to Bishop Heber College.");

  // 🔊 Ask destination
  setTimeout(() => {
    speak("Where are you going?");
    stage = "ask";
    updateStatus("Listening for destination...");
    startRecognition();
  }, 2000);
});
