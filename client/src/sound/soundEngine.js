// Web Audio API Synthesized Audio Engine for Meanwhile
// Zero external mp3 dependencies: zero latency, zero 404s, works offline!

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterVolume = 0.7;
    this.engineVolume = 0.45;
    this.sfxVolume = 0.8;

    // Engine oscillator graph
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isEngineRunning = false;

    // Load user settings
    try {
      const savedMute = localStorage.getItem('meanwhile_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';

      const savedVol = localStorage.getItem('meanwhile_master_vol');
      if (savedVol !== null) this.masterVolume = parseFloat(savedVol);
    } catch (e) {
      // Storage unavailable
    }
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.isMuted = muted;
    try {
      localStorage.setItem('meanwhile_muted', String(muted));
    } catch (e) {}

    if (muted && this.isEngineRunning) {
      this.stopEngine();
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    try {
      localStorage.setItem('meanwhile_master_vol', String(this.masterVolume));
    } catch (e) {}

    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setValueAtTime(this.engineVolume * this.masterVolume, this.ctx.currentTime);
    }
  }

  // Tactile mechanical keypress sound
  playKeypress(isSpace = false) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = isSpace ? 280 : (420 + Math.random() * 80);
      osc.type = isSpace ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08 * this.masterVolume * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch (e) {}
  }

  // Mistyped character error blip
  playError() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.12 * this.masterVolume * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.065);
    } catch (e) {}
  }

  // Countdown Beeps (3, 2, 1, GO)
  playCountdownBeep(isGo = false) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = isGo ? 880 : 440;
      const duration = isGo ? 0.35 : 0.15;

      osc.type = isGo ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.25 * this.masterVolume * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  // Finish Line Victory Chime
  playFinishFanfare() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.18 * this.masterVolume, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.65);
      });
    } catch (e) {}
  }

  // Continuous Procedural Engine Hum
  startEngine() {
    if (this.isMuted || this.isEngineRunning) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      this.engineOsc = ctx.createOscillator();
      this.engineGain = ctx.createGain();
      this.engineFilter = ctx.createBiquadFilter();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, ctx.currentTime);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(260, ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.05 * this.masterVolume, ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(ctx.destination);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch (e) {}
  }

  // Update pitch/RPM based on vehicle speed
  updateEngineSpeed(speedKmh, maxSpeedKmh = 300) {
    if (!this.isEngineRunning || !this.ctx || !this.engineOsc || !this.engineFilter) return;

    try {
      const ratio = Math.max(0, Math.min(1, speedKmh / maxSpeedKmh));
      // Multi-gear RPM curve simulation
      const gear = Math.floor(ratio * 5) + 1;
      const gearRatio = (ratio * 5) % 1;
      const targetFreq = 45 + gearRatio * 90 + gear * 12;

      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
      this.engineFilter.frequency.setTargetAtTime(200 + ratio * 600, this.ctx.currentTime, 0.1);

      const targetGain = (0.05 + ratio * 0.15) * this.masterVolume * this.engineVolume;
      this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    } catch (e) {}
  }

  stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
      }
      setTimeout(() => {
        if (this.engineOsc) {
          try { this.engineOsc.stop(); } catch (e) {}
          this.engineOsc.disconnect();
          this.engineOsc = null;
        }
        this.isEngineRunning = false;
      }, 200);
    } catch (e) {
      this.isEngineRunning = false;
    }
  }

  // UI Button Click
  playButtonClick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.09 * this.masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
