let started = false;

function startApp() {
  if (started) return;
  started = true;

  updateStatus("Welcome to Bishop Heber College. Where are you going?");
  speak("Welcome to Bishop Heber College. Where are you going?");

  setTimeout(startListening, 1500);
}

function updateStatus(text) {
  document.getElementById("status").innerText = text;
}

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  speechSynthesis.speak(msg);
}

function startListening() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript.toLowerCase();
    updateStatus("You said: " + text);
    handleDestination(text);
  };

  recognition.start();
}
