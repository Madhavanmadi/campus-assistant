const speakBtn = document.getElementById("speakBtn");

let audioCtx, analyser, dataArray;

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(stream);

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  dataArray = new Uint8Array(analyser.frequencyBinCount);
  source.connect(analyser);

  detectVoice();
});

function detectVoice() {
  requestAnimationFrame(detectVoice);

  analyser.getByteFrequencyData(dataArray);
  let sum = dataArray.reduce((a, b) => a + b, 0);
  let avg = sum / dataArray.length;

  if (avg > 20) {
    speakBtn.classList.add("listening");
  } else {
    speakBtn.classList.remove("listening");
  }
}
