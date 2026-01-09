// ===============================
// Smart Campus Assistant - app.js (OLD + NEW COMBINED)
// ===============================

let routesData = {};
let watchId = null;

// 🔹 NEW STATE VARIABLES
let currentRoute = [];
let currentStepIndex = 0;
let navigationActive = false;

/* ---------- LOAD ROUTES ---------- */
async function loadRoutes() {
  console.log("========== LOAD ROUTES ==========");

  try {
    const res = await fetch("routes.json");
    const data = await res.json();

    routesData = data.navigation || {};
    console.log("[APP] Routes loaded:", Object.keys(routesData));
  } catch (err) {
    console.error("[APP] Route load failed:", err);
    speak("Unable to load routes");
  }
}

/* ---------- NORMALIZE ---------- */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------- DESTINATION ALIASES (OLD – KEPT) ---------- */
const destinationAliases = {
  principal_room: [
    "principal",
    "principal room",
    "principal office",
    "principal sir room",
    "admin room"
  ],
  stage: ["stage"]
};

/* ---------- HANDLE DESTINATION (UPDATED) ---------- */
async function handleDestination(text) {
  console.log("========== HANDLE DESTINATION ==========");
  console.log("[VOICE] Input:", text);

  await loadRoutes();

  const spoken = normalize(text);
  let matchedKey = null;

  // 🔍 OLD SEARCH LOGIC (KEPT)
  for (let key in destinationAliases) {
    if (
      destinationAliases[key].some(a =>
        spoken.includes(normalize(a))
      )
    ) {
      matchedKey = key;
      break;
    }
  }

  if (!matchedKey) {
    speak("Destination not detected");
    return;
  }

  const routeObj = routesData[matchedKey];
  if (!routeObj || !routeObj.route) {
    speak("Route data missing");
    return;
  }

  // 🔹 NEW NAVIGATION INIT
  currentRoute = routeObj.route;
  currentStepIndex = 0;
  navigationActive = true;

  speak(`Navigating to ${matchedKey.replace("_", " ")}`);

  // Speak ONLY FIRST STEP
  speakCurrentStep();

  startStepTracking();
}

/* ---------- SPEAK CURRENT STEP ---------- */
function speakCurrentStep() {
  if (!currentRoute[currentStepIndex]) return;

  const step = currentRoute[currentStepIndex];

  // 🖥 Update UI
  const el = document.getElementById("currentStepName");
  if (el) el.innerText = step.name;

  let message = step.instruction || "";
  if (step.steps) {
    message += ` Walk ${step.steps} steps.`;
  }

  console.log("[VOICE] Speaking step:", step.name);
  speak(message);
}

/* ---------- STEP-BY-STEP GPS TRACKING ---------- */
function startStepTracking() {
  if (!navigationActive) return;

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // 🖥 Live GPS on screen
      const latEl = document.getElementById("lat");
      const lngEl = document.getElementById("lng");
      if (latEl) latEl.innerText = lat.toFixed(6);
      if (lngEl) lngEl.innerText = lng.toFixed(6);

      const step = currentRoute[currentStepIndex];
      if (!step) return;

      const d = distance(lat, lng, step.lat, step.lng);
      console.log(`[GPS] Distance to ${step.name}: ${d} meters`);

      // ✅ Step reached
      if (d < 15) {
        currentStepIndex++;

        // Next step exists
        if (currentStepIndex < currentRoute.length) {
          speakCurrentStep();
        }
        // Final destination
        else {
          speak("You have reached your destination");
          navigator.geolocation.clearWatch(watchId);
          navigationActive = false;
        }
      }
    },
    err => console.error("[GPS] Error:", err),
    { enableHighAccuracy: true }
  );
}

/* ---------- DISTANCE ---------- */
function distance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

