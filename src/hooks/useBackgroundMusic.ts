import { useState, useEffect } from 'react';
import { backgroundMusic, type MusicState } from '../audio/backgroundMusic';

export const useBackgroundMusic = () => {
  const [musicState, setMusicState] = useState<MusicState>(() => backgroundMusic.getState());

  useEffect(() => {
    const unsubscribe = backgroundMusic.subscribe((newState) => {
      setMusicState(newState);
    });
    return unsubscribe;
  }, []);

  return {
    ...musicState,
    play: () => backgroundMusic.play(),
    pause: () => backgroundMusic.pause(),
    togglePlay: () => backgroundMusic.togglePlay(),
    setVolume: (vol: number) => backgroundMusic.setVolume(vol),
    toggleMute: () => backgroundMusic.toggleMute(),
    setMuted: (muted: boolean) => backgroundMusic.setMuted(muted),
    startFromUserGesture: () => backgroundMusic.startFromUserGesture()
  };
};
