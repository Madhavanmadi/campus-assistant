// ===============================
// APP LOGIC + GPS-ONLY NAVIGATION
// ===============================

let routesData = {};
let watchId = null;

/* ---------- LOAD ROUTES ---------- */
fetch("data/routes.json")
  .then(res => res.json())
  .then(data => {
    routesData = data;
    console.log("Routes loaded", routesData);
  })
  .catch(() => {
    speak("Unable to load route data");
  });

/* ---------- NORMALIZE SPEECH ---------- */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/* ---------- GET CURRENT USER LOCATION ---------- */
function getCurrentLocation(callback) {
  if (!navigator.geolocation) {
    speak("GPS not supported on this device");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      console.log("Current Latitude:", lat);
      console.log("Current Longitude:", lng);

      if (callback) callback(lat, lng);
    },
    () => {
      speak("Unable to get your current location");
    },
    { enableHighAccuracy: true }
  );
}

/* ---------- HANDLE DESTINATION ---------- */
/* Called from voice.js */
function handleDestination(spokenText) {
  const spoken = normalize(spokenText);
  let matchedKey = null;

  // 🔍 Match using aliases inside routes.json
  for (const key in routesData) {
    const aliases = routesData[key].aliases || [];
    if (aliases.some(a => normalize(a) === spoken)) {
      matchedKey = key;
      break;
    }
  }

  if (!matchedKey) {
    speak("Destination not found. Please say again.");
    return;
  }

  const route = routesData[matchedKey].route;

  if (!route || route.length === 0) {
    speak("No route data available.");
    return;
  }

  speak(`Navigating to ${matchedKey}`);

  // 🔑 First get current location, then start navigation
  getCurrentLocation(() => {
    startGpsNavigation(route);
  });
}

/* ======================================================
   GPS-ONLY NAVIGATION (LATITUDE & LONGITUDE BASED)
   ====================================================== */

function startGpsNavigation(route) {
  let index = 0;

  if (!navigator.geolocation) {
    speak("GPS not supported on this device");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      const target = route[index];

      const dist = getDistance(
        userLat,
        userLng,
        target.lat,
        target.lng
      );

      // 🎯 Checkpoint reached
      if (dist < 8) {
        speak(`Reached ${target.name}`);
        index++;

        if (index >= route.length) {
          speak("You have reached your destination");
          navigator.geolocation.clearWatch(watchId);
        }
        return;
      }

      // 🧭 Direction guidance (LAT/LNG ONLY)
      giveDirection(
        userLat,
        userLng,
        target.lat,
        target.lng,
        dist
      );
    },
    () => speak("Unable to access GPS location"),
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    }
  );
}

/* ---------- DIRECTION LOGIC (LAT/LNG ONLY) ---------- */
function giveDirection(lat1, lng1, lat2, lng2, distance) {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;

  let direction = "";

  if (Math.abs(dLat) > Math.abs(dLng)) {
    direction = dLat > 0 ? "Move forward" : "Move backward";
  } else {
    direction = dLng > 0 ? "Turn right" : "Turn left";
  }

  speak(`${direction}. Distance ${Math.round(distance)} meters`);
}

/* ---------- DISTANCE (HAVERSINE FORMULA) ---------- */
function getDistance(lat1, lon1, lat2, lon2) {
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
