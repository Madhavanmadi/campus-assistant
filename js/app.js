let routesData = {};
let watchId = null;

fetch("data/routes.json")
  .then(res => res.json())
  .then(data => routesData = data);

function handleDestination(text) {
  text = text.toLowerCase();

  for (let route in routesData) {
    const aliases = routesData[route].aliases || [route];
    if (aliases.some(a => text.includes(a))) {
      speak(`Navigating to ${route}`);
      startTracking(routesData[route].destination, route);
      return;
    }
  }

  speak("Destination not found. Please say again.");
}

function startTracking(dest, name) {
  if (!navigator.geolocation) {
    speak("GPS not supported.");
    return;
  }

  watchId = navigator.geolocation.watchPosition(pos => {
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
  });
}

function distance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = x => x * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat/2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
