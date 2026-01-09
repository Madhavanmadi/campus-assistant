function startNavigation(steps) {
  let index = 0;

  function updateStepUI(name) {
    document.getElementById("currentStepName").innerText = name;
  }

  navigator.geolocation.watchPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    document.getElementById("lat").innerText = lat.toFixed(6);
    document.getElementById("lng").innerText = lng.toFixed(6);

    const step = steps[index];
    if (!step) return;

    const d = distance(lat, lng, step.lat, step.lng);

    if (d < 15) {
      updateStepUI(step.name);
      speak(step.instruction + (step.steps ? ` Walk ${step.steps}
steps.` : ""));
      index++;

      if (step.alert) speak(step.alert);
    }
  });
}

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

