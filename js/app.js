let locationsData = {};

// Load campus data
fetch("data/locations.json")
  .then(res => res.json())
  .then(data => {
    locationsData = data;
    console.log("Locations loaded:", locationsData);
  });

// MAIN navigation logic
function handleDestination(text) {
  text = text.toLowerCase();

  for (let place in locationsData) {
    // flexible match
    if (text.includes(place)) {

      const steps = locationsData[place].steps;
      const landmarks = locationsData[place].landmarks.join(", ");
      const obstacles = locationsData[place].obstacles.join(", ");

      speak(`You are going to ${place}.`);
      speak(`Total steps are ${steps}.`);

      if (landmarks) {
        speak(`You will pass near ${landmarks}.`);
      }

      if (obstacles) {
        speak(`Warning. Obstacle ahead. ${obstacles}.`);
      }

      return;
    }
  }

  // If no match
  speak("Sorry. Destination not found. Please say again.");
}
