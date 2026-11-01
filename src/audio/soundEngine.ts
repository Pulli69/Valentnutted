/**
 * Web Audio API Synthesized Retro Sound Engine
 * No external audio files needed - 100% reliable, zero latency, zero 404s.
 * Conforms to requirement: Muted by default, controlled through settings.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction when enabled
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled && !this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      } catch (e) {
        console.warn('Web Audio not supported', e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && enabled) {
      this.ctx.resume();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  private getContext(): AudioContext | null {
    if (!this.isEnabled) return null;
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Authentic Windows 98 / 95 Startup Chime
  public playStartup() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [
      { freq: 261.63, time: 0, dur: 1.8 },    // C4
      { freq: 392.00, time: 0.25, dur: 1.6 }, // G4
      { freq: 523.25, time: 0.5, dur: 1.8 },  // C5
      { freq: 659.25, time: 0.75, dur: 2.0 }, // E5
      { freq: 783.99, time: 1.0, dur: 2.4 },  // G5
      { freq: 1046.50, time: 1.25, dur: 2.8 } // C6
    ];

    const now = ctx.currentTime;
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.linearRampToValueAtTime(0.18, now + n.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  // Classic mouse click
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Window open / restore
  public playWindowOpen() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Window minimize / close
  public playWindowClose() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Authentic Windows "Chord" Error DONGGG
  public playError() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [174.61, 220.00, 261.63, 349.23]; // F chord

    freqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      // Low pass filter to make it authentically mellow and resonant
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    });
  }

  // Critical Error / Stop warning beep
  public playCritical() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(300, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Notification Ding (Asterisk sound)
  public playNotification() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now); // C6 bell
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Check-in Triumph Fanfare
  public playStamp() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const sequence = [
      { f: 523.25, t: 0, d: 0.12 },
      { f: 659.25, t: 0.12, d: 0.12 },
      { f: 783.99, t: 0.24, d: 0.15 },
      { f: 1046.5, t: 0.39, d: 0.45 }
    ];

    sequence.forEach(s => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(s.f, now + s.t);
      gain.gain.setValueAtTime(0.15, now + s.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + s.t + s.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + s.t);
      osc.stop(now + s.t + s.d);
    });
  }

  // Sarcastic Folded sound (sad descending pitch slide)
  public playFolded() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 1.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Dial-up sound snippet for authentic 90s web connection
  public playDialup() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Dual Tone Multi-Frequency (DTMF) beeps
    const tones = [
      { f1: 697, f2: 1209, t: 0 },
      { f1: 770, f2: 1336, t: 0.1 },
      { f1: 852, f2: 1477, t: 0.2 },
      { f1: 941, f2: 1209, t: 0.3 }
    ];

    tones.forEach(tone => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(tone.f1, now + tone.t);
      osc2.frequency.setValueAtTime(tone.f2, now + tone.t);

      gain.gain.setValueAtTime(0.06, now + tone.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + tone.t + 0.08);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now + tone.t);
      osc2.start(now + tone.t);
      osc1.stop(now + tone.t + 0.08);
      osc2.stop(now + tone.t + 0.08);
    });
  }
}

export const sound = new SoundEngine();
