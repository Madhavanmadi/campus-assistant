let stage = "welcome";
let spokenDestination = "";
let recognition = null;

const speakBtn = document.getElementById("speakBtn");
speakBtn.addEventListener("click", startApp);

function speak(text) {
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  window.speechSynthesis.speak(msg);
}

function updateStatus(text) {
  document.getElementById("status").innerText = text;
}

function startRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.lang = "en-IN";

  updateStatus("Listening...");
  recognition.start();

  recognition.onresult = handleResult;
  recognition.onerror = () => setTimeout(startRecognition, 1500);
  recognition.onend = () => {
    if (stage === "ask" || stage === "confirm")
      setTimeout(startRecognition, 1500);
  };
}

function handleResult(event) {
  const text = event.results[0][0].transcript.toLowerCase();
  updateStatus("You said: " + text);

  if (stage === "ask") {
    spokenDestination = text;
    speak(`You are saying ${text}. Say OK to continue or NO to repeat.`);
    stage = "confirm";
    return;
  }

  if (stage === "confirm") {
    if (text.includes("ok") || text.includes("yes")) {
      speak("Starting navigation.");
      stage = "navigate";
      handleDestination(spokenDestination);
    } else {
      speak("Please say destination again.");
      stage = "ask";
    }
  }
}

function startApp() {
  if (stage !== "welcome") return;
  speak("Welcome to Bishop Heber College.");
  setTimeout(() => {
    speak("Where are you going?");
    stage = "ask";
    startRecognition();
  }, 2000);
}
