let routesData = {};
let watchId = null;

/* ---------- LOAD ROUTES ---------- */
fetch("data/routes.json")
  .then(res => res.json())
  .then(data => {
    routesData = data;
    console.log("Routes loaded", routesData);
  });

/* ---------- NORMALIZE SPEECH ---------- */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z ]/g, "")
    .trim();
}

/* ---------- ALIAS MAP ---------- */
const destinationAliases = {
  "ps block": [
    "ps block",
    "p s block",
    "peace block",
    "psblok",
    "pess block"
  ]
};

/* ---------- HANDLE DESTINATION ---------- */
function handleDestination(text) {
  const spoken = normalize(text);
  let matchedKey = null;

  for (let key in destinationAliases) {
    if (destinationAliases[key].some(a => normalize(a) === spoken)) {
      matchedKey = key;
      break;
    }
  }

  if (!matchedKey || !routesData[matchedKey]) {
    speak("Destination not found. Please say again.");
    return;
  }

  speak("Navigating to PS block");

  const steps = routesData[matchedKey];
  const finalPoint = steps[steps.length - 1]; // ✅ last step = destination

  startNavigation(steps);          // map.js
  startTracking(finalPoint, "PS block");
}

/* ---------- GPS TRACKING ---------- */
function startTracking(dest, name) {
  if (!navigator.geolocation) {
    speak("GPS not supported on this device");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const d = distance(
        pos.coords.latitude,
        pos.coords.longitude,
        dest.lat,
        dest.lng
      );

      if (d < 10) {
        speak(`You have successfully reached ${name}`);
        navigator.geolocation.clearWatch(watchId);
      }
    },
    () => speak("Unable to access location"),
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
