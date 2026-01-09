function startNavigation(steps) {
  let index = 0;

  function nextStep() {
    if (index >= steps.length) return;

    const step = steps[index];

    if (step.instruction) {
      speak(step.instruction);
    }

    if (step.alert) {
      speak(step.alert);
    }

    index++;
  }

  nextStep();
}
