/**
 * Single Shared Background Music Controller
 * Supports:
 * 1. Direct YouTube streaming (videoId: uKxyLmbOc0Q - Renai Circulation) with zero file download needed!
 * 2. Optional local MP3 (/audio/community-theme.mp3)
 * - Initial volume: 20% (0.20)
 * - Loops continuously
 * - Never restarts when opening/closing windows
 * - Accessible from taskbar tray and desktop player widget
 */

export interface MusicState {
  isPlaying: boolean;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  hasError: boolean;
  errorMessage: string | null;
  activeSource: 'youtube' | 'local';
  youtubeVideoId: string;
  isDesktopWidgetVisible: boolean;
}

type MusicSubscriber = (state: MusicState) => void;

class BackgroundMusicController {
  private audio: HTMLAudioElement | null = null;
  private state: MusicState = {
    isPlaying: false,
    volume: 0.2, // Exactly 20%
    isMuted: false,
    hasError: false,
    errorMessage: null,
    activeSource: 'local', // Primary local MP3 with seamless YouTube fallback
    youtubeVideoId: 'uKxyLmbOc0Q',
    isDesktopWidgetVisible: true
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

      const savedSource = localStorage.getItem('ihn_bg_music_source');
      if (savedSource === 'local' || savedSource === 'youtube') {
        this.state.activeSource = savedSource;
      }
    } catch {
      // LocalStorage unavailable, use defaults
    }
  }

  private sendYouTubeCommand(func: string, args: unknown = '') {
    if (typeof document === 'undefined') return;
    const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe.yt-bg-stream-iframe');
    iframes.forEach((iframe) => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    });
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
        // If local audio fails, fall back to YouTube streaming seamlessly
        this.updateState({ 
          activeSource: 'youtube',
          hasError: false,
          errorMessage: null
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

  public setDesktopWidgetVisible(visible: boolean) {
    this.updateState({ isDesktopWidgetVisible: visible });
  }

  public setSource(source: 'youtube' | 'local') {
    if (source === this.state.activeSource) return;
    this.pause();
    this.updateState({ activeSource: source });
    try {
      localStorage.setItem('ihn_bg_music_source', source);
    } catch {}
  }

  /**
   * Start music from a user interaction (such as clicking the welcome button)
   */
  public async startFromUserGesture(): Promise<boolean> {
    this.updateState({ isDesktopWidgetVisible: true, isPlaying: true });

    if (this.state.activeSource === 'youtube') {
      // Send play command to YouTube iframe with 20% volume
      this.sendYouTubeCommand('setVolume', Math.round(this.state.volume * 100));
      if (this.state.isMuted) {
        this.sendYouTubeCommand('mute');
      } else {
        this.sendYouTubeCommand('unMute');
      }
      this.sendYouTubeCommand('playVideo');
      return true;
    } else {
      const audio = this.getAudio();
      audio.volume = this.state.isMuted ? 0 : this.state.volume;
      try {
        await audio.play();
        this.updateState({ isPlaying: true, hasError: false, errorMessage: null });
        return true;
      } catch {
        // Fall back to YouTube stream
        this.setSource('youtube');
        this.sendYouTubeCommand('playVideo');
        return true;
      }
    }
  }

  public async play(): Promise<boolean> {
    this.updateState({ isPlaying: true });
    if (this.state.activeSource === 'youtube') {
      this.sendYouTubeCommand('setVolume', Math.round(this.state.volume * 100));
      if (this.state.isMuted) {
        this.sendYouTubeCommand('mute');
      } else {
        this.sendYouTubeCommand('unMute');
      }
      this.sendYouTubeCommand('playVideo');
      return true;
    } else {
      const audio = this.getAudio();
      audio.volume = this.state.isMuted ? 0 : this.state.volume;
      try {
        await audio.play();
        this.updateState({ isPlaying: true, hasError: false, errorMessage: null });
        return true;
      } catch {
        return false;
      }
    }
  }

  public pause() {
    this.updateState({ isPlaying: false });
    if (this.state.activeSource === 'youtube') {
      this.sendYouTubeCommand('pauseVideo');
    } else if (this.audio) {
      this.audio.pause();
    }
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
    this.updateState({ volume: clamped });
    if (this.state.activeSource === 'youtube') {
      this.sendYouTubeCommand('setVolume', Math.round(clamped * 100));
    } else if (this.audio) {
      this.audio.volume = this.state.isMuted ? 0 : clamped;
    }
    try {
      localStorage.setItem('ihn_bg_music_volume', clamped.toString());
    } catch {}
  }

  public toggleMute() {
    const nextMuted = !this.state.isMuted;
    this.updateState({ isMuted: nextMuted });
    if (this.state.activeSource === 'youtube') {
      if (nextMuted) {
        this.sendYouTubeCommand('mute');
      } else {
        this.sendYouTubeCommand('unMute');
      }
    } else if (this.audio) {
      this.audio.volume = nextMuted ? 0 : this.state.volume;
    }
    try {
      localStorage.setItem('ihn_bg_music_muted', nextMuted.toString());
    } catch {}
  }

  public setMuted(muted: boolean) {
    this.updateState({ isMuted: muted });
    if (this.state.activeSource === 'youtube') {
      if (muted) {
        this.sendYouTubeCommand('mute');
      } else {
        this.sendYouTubeCommand('unMute');
      }
    } else if (this.audio) {
      this.audio.volume = muted ? 0 : this.state.volume;
    }
    try {
      localStorage.setItem('ihn_bg_music_muted', muted.toString());
    } catch {}
  }
}

export const backgroundMusic = new BackgroundMusicController();
