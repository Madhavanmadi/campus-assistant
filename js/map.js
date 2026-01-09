let watchId = null;

function startGpsNavigation(route) {
  let index = 0;

  if (!navigator.geolocation) {
    speak("GPS not supported");
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      const target = route[index];

      const distance = getDistance(
        userLat, userLng,
        target.lat, target.lng
      );

      if (distance < 8) {
        speak(`Reached ${target.name}`);
        index++;

        if (index >= route.length) {
          speak("You have reached your destination");
          navigator.geolocation.clearWatch(watchId);
        }
        return;
      }

      giveDirection(userLat, userLng, target.lat, target.lng, distance);
    },
    () => speak("Unable to get GPS location"),
    { enableHighAccuracy: true }
  );
}

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
