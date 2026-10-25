// Web Audio API Synthesized Audio Engine for Meanwhile
// Zero external mp3 dependencies: zero latency, zero 404s, works offline!

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterVolume = 0.9;
    this.engineVolume = 0.65;
    this.sfxVolume = 1.0;

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

  // Tactile mechanical keypress sound (+4 dB punch)
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
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.14 * this.masterVolume * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  // Mistyped character error blip (+4 dB)
  playError() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(125, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.20 * this.masterVolume * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.075);
    } catch (e) {}
  }

  // Countdown Beeps (3, 2, 1, GO) (+4 dB)
  playCountdownBeep(isGo = false) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = isGo ? 880 : 440;
      const duration = isGo ? 0.38 : 0.18;

      osc.type = isGo ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.38 * this.masterVolume * this.sfxVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  // Finish Line Victory Chime (+4 dB)
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

        gain.gain.setValueAtTime(0.30 * this.masterVolume, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.7);
      });
    } catch (e) {}
  }

  // Continuous Procedural Engine Hum (+4 dB presence)
  startEngine() {
    if (this.isMuted || this.isEngineRunning) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      this.engineOsc = ctx.createOscillator();
      this.engineGain = ctx.createGain();
      this.engineFilter = ctx.createBiquadFilter();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(58, ctx.currentTime);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(280, ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.08 * this.masterVolume, ctx.currentTime);

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
      const targetFreq = 48 + gearRatio * 95 + gear * 14;

      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
      this.engineFilter.frequency.setTargetAtTime(220 + ratio * 650, this.ctx.currentTime, 0.1);

      const targetGain = (0.08 + ratio * 0.22) * this.masterVolume * this.engineVolume;
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

  // UI Button Click (+4 dB)
  playButtonClick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.045);

      gain.gain.setValueAtTime(0.15 * this.masterVolume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }
}

export const soundEngine = new SoundEngine();
