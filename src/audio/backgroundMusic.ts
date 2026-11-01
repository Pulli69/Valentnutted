/**
 * Single Shared Background Music Controller
 * Manages official looped playlist streaming via YouTube:
 * 1. YOASOBI - Idol (ZRtdQ81jPUQ)
 * 2. Bambee - Bumble Bee (jyFivH9gxz0)
 * 3. 結束バンド - Guitar, Loneliness and Blue Planet (B7BxrAAXl94)
 * 4. MAISONdes - Tokyo Shandy Rendezvous (NFMmSOWPj_k)
 * 5. LiSA - Akeboshi (yGcm81aaTHg)
 * 6. millennium parade × Sheena Ringo - W●RK (dYzgZVhiqmU)
 * 7. ALI - LOST IN PARADISE (tLsJQ5srVQA)
 * 8. *namirin - Renai Circulation (uKxyLmbOc0Q)
 *
 * Loops continuously, starts automatically on user interaction,
 * and never restarts when windows open/close.
 */

export interface TrackMeta {
  id: string;
  title: string;
  artist: string;
}

export const COMMUNITY_PLAYLIST: TrackMeta[] = [
  { id: 'ZRtdQ81jPUQ', title: 'Idol (アイドル)', artist: 'YOASOBI' },
  { id: 'jyFivH9gxz0', title: 'Bumble Bee', artist: 'Bambee' },
  { id: 'B7BxrAAXl94', title: 'Guitar, Loneliness and Blue Planet', artist: '結束バンド (Kessoku Band)' },
  { id: 'NFMmSOWPj_k', title: 'Tokyo Shandy Rendezvous', artist: 'MAISONdes ft. KAF & Tsumiki' },
  { id: 'yGcm81aaTHg', title: 'Akeboshi (あけぼし)', artist: 'LiSA' },
  { id: 'dYzgZVhiqmU', title: 'W●RK', artist: 'millennium parade × Sheena Ringo' },
  { id: 'tLsJQ5srVQA', title: 'LOST IN PARADISE', artist: 'ALI ft. AKLO' },
  { id: 'uKxyLmbOc0Q', title: 'Renai Circulation', artist: '*namirin' }
];

export interface MusicState {
  isPlaying: boolean;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  hasError: boolean;
  errorMessage: string | null;
  activeSource: 'youtube' | 'local';
  currentTrackIndex: number;
  currentTrack: TrackMeta;
  isDesktopWidgetVisible: boolean;
}

type MusicSubscriber = (state: MusicState) => void;

class BackgroundMusicController {
  private audio: HTMLAudioElement | null = null;
  private state: MusicState = {
    isPlaying: false,
    volume: 0.2, // 20%
    isMuted: false,
    hasError: false,
    errorMessage: null,
    activeSource: 'youtube', // Default to streaming the 7-song looped playlist directly
    currentTrackIndex: 0,
    currentTrack: COMMUNITY_PLAYLIST[0],
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

      const savedIdx = localStorage.getItem('ihn_bg_track_index');
      if (savedIdx !== null) {
        const idx = parseInt(savedIdx, 10);
        if (!isNaN(idx) && idx >= 0 && idx < COMMUNITY_PLAYLIST.length) {
          this.state.currentTrackIndex = idx;
          this.state.currentTrack = COMMUNITY_PLAYLIST[idx];
        }
      }

      const savedSource = localStorage.getItem('ihn_bg_music_source');
      if (savedSource === 'local' || savedSource === 'youtube') {
        this.state.activeSource = savedSource;
      }
    } catch {
      // LocalStorage unavailable, use defaults
    }
  }

  public sendYouTubeCommand(func: string, args: unknown = '') {
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
        // Fall back to YouTube streaming playlist seamlessly
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

  public selectTrack(index: number) {
    if (index < 0 || index >= COMMUNITY_PLAYLIST.length) return;
    const track = COMMUNITY_PLAYLIST[index];
    this.updateState({
      currentTrackIndex: index,
      currentTrack: track,
      isPlaying: true
    });
    try {
      localStorage.setItem('ihn_bg_track_index', index.toString());
    } catch {}

    if (this.state.activeSource === 'youtube') {
      this.sendYouTubeCommand('playVideoAt', index);
    }
  }

  public nextTrack() {
    const nextIdx = (this.state.currentTrackIndex + 1) % COMMUNITY_PLAYLIST.length;
    this.selectTrack(nextIdx);
  }

  public previousTrack() {
    const prevIdx = (this.state.currentTrackIndex - 1 + COMMUNITY_PLAYLIST.length) % COMMUNITY_PLAYLIST.length;
    this.selectTrack(prevIdx);
  }

  /**
   * Start music from a user interaction (such as clicking the welcome button)
   */
  public async startFromUserGesture(): Promise<boolean> {
    this.updateState({ isDesktopWidgetVisible: true, isPlaying: true });

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
