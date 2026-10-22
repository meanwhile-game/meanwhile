// Synthesized Web Audio API Engine for Meanwhile

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private engineVolume: number = 0.5;

  // Persistent engine oscillator nodes
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning: boolean = false;

  constructor() {
    // Load preferences from localStorage if available
    try {
      const savedMute = localStorage.getItem('meanwhile_muted') || localStorage.getItem('veloce_muted');
      if (savedMute !== null) this.isMuted = savedMute === 'true';

      const savedVol = localStorage.getItem('meanwhile_master_vol') || localStorage.getItem('veloce_master_vol');
      if (savedVol !== null) this.masterVolume = parseFloat(savedVol);
    } catch (e) {
      // ignore
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- SOUND EFFECTS ---

  public playKeyClick(isSpace: boolean = false): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isSpace ? 'triangle' : 'sine';
    const baseFreq = isSpace ? 320 : 650 + Math.random() * 80;
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12 * this.masterVolume * this.sfxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  public playKeystroke(wpm: number = 60, isSpace: boolean = false): void {
    this.playKeyClick(isSpace);
  }

  public playKeyError(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18 * this.masterVolume * this.sfxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  public playCountdownTick(count: number): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const isGo = count === 0;
    const freq = isGo ? 880 : 440; // High A5 for GO, A4 for countdown
    const duration = isGo ? 0.45 : 0.22;

    osc.type = isGo ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.25 * this.masterVolume * this.sfxVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  public playFinishSound(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    // Victory triumphant arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime + idx * 0.12;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22 * this.masterVolume * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  // --- DYNAMIC ENGINE REV AUDIO ---

  public startEngine(): void {
    if (this.isEngineRunning || this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      this.engineOsc = ctx.createOscillator();
      this.engineGain = ctx.createGain();
      this.engineFilter = ctx.createBiquadFilter();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(55, ctx.currentTime); // Low engine rumble 55Hz

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(400, ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.06 * this.masterVolume * this.engineVolume, ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(ctx.destination);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch (e) {
      console.warn('Could not start engine audio:', e);
    }
  }

  public updateEnginePitch(wpm: number): void {
    if (!this.isEngineRunning || !this.engineOsc || !this.engineFilter || !this.ctx) return;

    // Scale engine RPM based on WPM: 0-140 WPM maps to 55Hz - 220Hz
    const clampedWpm = Math.min(150, Math.max(0, wpm));
    const targetFreq = 55 + (clampedWpm / 150) * 160;
    const targetFilter = 400 + (clampedWpm / 150) * 1200;

    const now = this.ctx.currentTime;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.15);
    this.engineFilter.frequency.setTargetAtTime(targetFilter, now, 0.15);
  }

  public stopEngine(): void {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      }
      setTimeout(() => {
        if (this.engineOsc) {
          this.engineOsc.stop();
          this.engineOsc.disconnect();
          this.engineOsc = null;
        }
        this.isEngineRunning = false;
      }, 120);
    } catch (e) {
      this.isEngineRunning = false;
    }
  }

  // --- CONTROLS ---

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('meanwhile_muted', String(this.isMuted));
    } catch (e) {}

    if (this.isMuted && this.isEngineRunning) {
      this.stopEngine();
    }
    return this.isMuted;
  }

  public setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('meanwhile_master_vol', String(this.masterVolume));
    } catch (e) {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }
}

export const sound = new SoundEngine();
