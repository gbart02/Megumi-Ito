let clickAudioContext;

function playClickSound() {
    clickAudioContext ??= new AudioContext();

    if (clickAudioContext.state === "suspended") {
        clickAudioContext.resume();
    }

    const oscillator = clickAudioContext.createOscillator();
    const gain = clickAudioContext.createGain();
    const startTime = clickAudioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(520, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(260, startTime + 0.025);
    gain.gain.setValueAtTime(0.025, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.035);

    oscillator.connect(gain);
    gain.connect(clickAudioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.035);
}

document.addEventListener("click", (event) => {
    if (event.isTrusted) {
        playClickSound();
    }
});
