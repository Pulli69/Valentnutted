/**
 * Single Shared Background Music Controller
 * Manages background playback for /audio/community-theme.mp3
 * - Initial volume: 20% (0.20)
 * - Loops continuously
 * - Never restarts when opening/closing windows
 * - Handles missing files, errors, and autoplay restrictions gracefully
 * - Persists volume and mute state locally
 */

export interface MusicState {
  isPlaying: boolean;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

type MusicSubscriber = (state: MusicState) => void;

class BackgroundMusicController {
  private audio: HTMLAudioElement | null = null;
  private state: MusicState = {
    isPlaying: false,
    volume: 0.2, // Requirement: exactly 20%
    isMuted: false,
    hasError: false,
    errorMessage: null
  };
  private subscribers = new Set<MusicSubscriber>();
  private audioSrc = '/audio/community-theme.mp3';

  constructor() {
    this.loadPersistedPreferences();
  }

  private loadPersistedPreferences() {
    try {
      const savedVol = localStorage.getItem('ihn_bg_music_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.state.volume = parsed;
        }
      }

      const savedMute = localStorage.getItem('ihn_bg_music_muted');
      if (savedMute !== null) {
        this.state.isMuted = savedMute === 'true';
      }
    } catch {
      // LocalStorage unavailable, use defaults
    }
  }

  private getAudio(): HTMLAudioElement {
    if (!this.audio && typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.src = this.audioSrc;
      this.audio.loop = true;
      this.audio.volume = this.state.isMuted ? 0 : this.state.volume;
      this.audio.preload = 'metadata';

      this.audio.addEventListener('play', () => {
        this.updateState({ isPlaying: true, hasError: false, errorMessage: null });
      });

      this.audio.addEventListener('pause', () => {
        this.updateState({ isPlaying: false });
      });

      this.audio.addEventListener('error', () => {
        const errorMsg = 'Audio file not found at public/audio/community-theme.mp3';
        console.info(`[IHAVENTNUTTED Audio] ${errorMsg}`);
        this.updateState({ 
          isPlaying: false, 
          hasError: true, 
          errorMessage: errorMsg 
        });
      });
    }
    return this.audio!;
  }

  private updateState(partial: Partial<MusicState>) {
    this.state = { ...this.state, ...partial };
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb({ ...this.state });
      } catch (e) {
        console.warn('Error in music subscriber callback', e);
      }
    });
  }

  public subscribe(cb: MusicSubscriber): () => void {
    this.subscribers.add(cb);
    cb({ ...this.state });
    return () => {
      this.subscribers.delete(cb);
    };
  }

  public getState(): MusicState {
    return { ...this.state };
  }

  /**
   * Start music from a user interaction (such as clicking the welcome button)
   */
  public async startFromUserGesture(): Promise<boolean> {
    const audio = this.getAudio();
    audio.volume = this.state.isMuted ? 0 : this.state.volume;
    try {
      await audio.play();
      this.updateState({ isPlaying: true, hasError: false, errorMessage: null });
      return true;
    } catch (err: unknown) {
      console.info('[IHAVENTNUTTED Audio] Playback prevented or file unavailable:', err);
      this.updateState({ isPlaying: false });
      return false;
    }
  }

  public async play(): Promise<boolean> {
    const audio = this.getAudio();
    audio.volume = this.state.isMuted ? 0 : this.state.volume;
    try {
      await audio.play();
      this.updateState({ isPlaying: true, hasError: false, errorMessage: null });
      return true;
    } catch (err) {
      console.info('[IHAVENTNUTTED Audio] Play prevented:', err);
      this.updateState({ isPlaying: false });
      return false;
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.updateState({ isPlaying: false });
  }

  public togglePlay(): Promise<boolean> | void {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      return this.play();
    }
  }

  public setVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.state.isMuted ? 0 : clamped;
    }
    this.updateState({ volume: clamped });
    try {
      localStorage.setItem('ihn_bg_music_volume', clamped.toString());
    } catch {}
  }

  public toggleMute() {
    const nextMuted = !this.state.isMuted;
    if (this.audio) {
      this.audio.volume = nextMuted ? 0 : this.state.volume;
    }
    this.updateState({ isMuted: nextMuted });
    try {
      localStorage.setItem('ihn_bg_music_muted', nextMuted.toString());
    } catch {}
  }

  public setMuted(muted: boolean) {
    if (this.audio) {
      this.audio.volume = muted ? 0 : this.state.volume;
    }
    this.updateState({ isMuted: muted });
    try {
      localStorage.setItem('ihn_bg_music_muted', muted.toString());
    } catch {}
  }
}

export const backgroundMusic = new BackgroundMusicController();
