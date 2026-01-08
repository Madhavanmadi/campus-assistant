let locationsData = {};

// Load campus data
fetch("data/locations.json")
  .then(res => res.json())
  .then(data => locationsData = data);

function handleDestination(text) {
  for (let place in locationsData) {
    if (text.includes(place)) {
      const steps = locationsData[place].steps;
      const landmarks = locationsData[place].landmarks.join(", ");
      const obstacle = locationsData[place].obstacles.join(", ");

      speak(`You are going to ${place}. Total steps are ${steps}.`);
      speak(`You will pass near ${landmarks}.`);

      if (obstacle) {
        speak(`Warning. Obstacle ahead. ${obstacle}`);
      }
      return;
    }
  }
  speak("Sorry. Destination not found. Please say again.");
}
