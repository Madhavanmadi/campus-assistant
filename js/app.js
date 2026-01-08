// ===============================
// GPS + Route Based Navigation
// ===============================

let routesData = {};
let currentStepIndex = 0;
let watchId = null;

// 📦 Load routes data
fetch("data/routes.json")
  .then(res => res.json())
  .then(data => {
    routesData = data;
    console.log("Routes loaded:", routesData);
  })
  .catch(() => {
    speak("Unable to load route data");
  });


// 🌍 Distance calculation (Haversine)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


// 🎯 HANDLE DESTINATION FROM VOICE
function handleDestination(text) {

  text = text.toLowerCase()
             .replace(/[^a-z\s]/g, "")
             .replace(/\s+/g, " ")
             .trim();

  for (let routeName in routesData) {
    const aliases = routesData[routeName].aliases || [routeName];

    if (aliases.some(a => text.includes(a))) {
      speak(`Starting navigation to ${routeName}`);
      startRoute(routeName);
      return;
    }
  }

  speak("Destination not found in campus map. Please say again.");
}


// 🚶 START STEP-BY-STEP ROUTE
function startRoute(routeName) {
  const route = routesData[routeName];
  currentStepIndex = 0;

  speakNextStep(route);

  // Start GPS monitoring
  startLiveTracking(route.destination, routeName);
}


// 🔊 SPEAK EACH STEP
function speakNextStep(route) {
  if (currentStepIndex >= route.steps.length) return;

  const step = route.steps[currentStepIndex];

  if (step.instruction) speak(step.instruction);
  if (step.steps) speak(`Move ${step.steps} steps`);
  if (step.alert) speak(`Alert. ${step.alert}`);

  currentStepIndex++;

  setTimeout(() => speakNextStep(route), 5000);
}


// 📍 LIVE GPS TRACKING
function startLiveTracking(destination, routeName) {

  if (!navigator.geolocation) {
    speak("GPS not supported on this device");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const dist = getDistance(
        pos.coords.latitude,
        pos.coords.longitude,
        destination.lat,
        destination.lng
      );

      if (dist < 10) {
        speak(`You have successfully reached ${routeName}`);
        navigator.geolocation.clearWatch(watchId);
      }
    },
    () => speak("Unable to get your current location"),
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}
