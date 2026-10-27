/**
 * Web Audio API Medical Alarm Synthesizer
 * Generates continuous medical alert chime/beeps for 1 minute (or until user stops/marks as taken)
 * Zero external audio files required. Works reliably offline in PWA and mobile browsers.
 */

class AlarmAudioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
    this.timeoutId = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playChimeTriple() {
    if (!this.audioCtx) this.init();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      // High-clarity medical reminder chime frequencies: 880Hz (A5), 1046.5Hz (C6), 1318.5Hz (E6)
      const freqs = [880, 1046.5, 1318.5];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);

        gain.gain.setValueAtTime(0, now + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.4, now + idx * 0.14 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.13);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.14);
      });
    } catch (e) {
      console.warn("Alarm chime playback notice:", e);
    }
  }

  startAlarm(durationSeconds = 60, onAutoStop) {
    this.stop();
    this.init();
    this.isPlaying = true;

    // Immediate initial chime
    this.playChimeTriple();

    // Repeat medical alarm chime pattern every 1.5 seconds
    this.intervalId = setInterval(() => {
      if (this.isPlaying) {
        this.playChimeTriple();
      }
    }, 1500);

    // Automatically silence after stipulated duration (1 minute)
    this.timeoutId = setTimeout(() => {
      this.stop();
      if (typeof onAutoStop === "function") {
        onAutoStop();
      }
    }, durationSeconds * 1000);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const alarmAudio = new AlarmAudioSynthesizer();
