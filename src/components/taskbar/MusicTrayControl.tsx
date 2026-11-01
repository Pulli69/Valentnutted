import React, { useState, useRef, useEffect } from 'react';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import { backgroundMusic } from '../../audio/backgroundMusic';
import { useOS } from '../../context/OSContext';

export const MusicTrayControl: React.FC = () => {
  const { 
    isPlaying, 
    volume, 
    isMuted, 
    hasError, 
    togglePlay, 
    setVolume, 
    toggleMute 
  } = useBackgroundMusic();
  const { openWindow } = useOS();

  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const volPercentage = Math.round(volume * 100);

  return (
    <div className="relative flex items-center">
      {/* Tray Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        title={`Community Theme Audio: ${isPlaying ? `Playing (${volPercentage}%)` : 'Paused'} - Click to adjust`}
        className={`px-1 py-0.5 text-[10px] flex items-center gap-1 cursor-pointer select-none rounded-none border border-transparent hover:border-gray-500 active:border-black ${
          isPlaying ? 'text-[#000080] font-bold bg-blue-100/60' : 'text-gray-700'
        }`}
      >
        <span>🎵</span>
        <span className="hidden sm:inline text-[9px] font-mono">
          {isMuted ? 'MUTED' : `${volPercentage}%`}
        </span>
      </button>

      {/* Classic Windows 98 Volume / Audio Control Popup Dialog */}
      {isOpen && (
        <div 
          ref={popupRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 bottom-7 z-[10000] w-64 w98-window bg-[#c0c0c0] shadow-2xl border-2 border-t-white border-l-white border-b-black border-r-black text-black select-none"
        >
          {/* Title Bar */}
          <div className="w98-titlebar bg-[#000080] flex justify-between items-center px-1.5 py-0.5 font-bold text-white text-[10.5px]">
            <div className="flex items-center gap-1 truncate">
              <span>🎚️</span>
              <span className="truncate">Volume Control</span>
            </div>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="w98-btn px-1 text-[9px] leading-none bg-[#c0c0c0] text-black font-bold border border-t-white border-l-white border-b-black border-r-black cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Popup Body */}
          <div className="p-2.5 space-y-2.5 text-[11px]">
            {/* Status Indicator */}
            <div className="w98-inset bg-white p-1.5 flex flex-col gap-0.5 font-mono text-[9.5px]">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Track:</span>
                <span className="font-bold text-[#000080] truncate">community-theme.mp3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">State:</span>
                <span className={`font-bold ${isPlaying ? 'text-green-700' : 'text-gray-600'}`}>
                  {isPlaying ? '● PLAYING' : '○ PAUSED'}
                </span>
              </div>
            </div>

            {hasError && (
              <div className="p-1 bg-amber-50 border border-amber-600 text-amber-950 text-[9px] leading-tight">
                ℹ Note: Audio file not found. Place <code className="font-bold">community-theme.mp3</code> in <code className="font-bold">public/audio/</code>.
              </div>
            )}

            {/* Play/Pause & Mute Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => togglePlay()}
                className="flex-1 w98-btn py-1 font-bold text-xs bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black flex items-center justify-center gap-1 cursor-pointer active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
              >
                <span>{isPlaying ? '⏸' : '▶'}</span>
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleMute()}
                className={`px-2.5 py-1 w98-btn text-xs font-bold border-2 border-t-white border-l-white border-b-black border-r-black cursor-pointer ${
                  isMuted ? 'bg-red-100 text-red-900 border-red-800' : 'bg-[#c0c0c0]'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>
            </div>

            {/* Volume Slider Section */}
            <div className="border border-gray-400 p-2 bg-[#dfdfdf] space-y-1">
              <div className="flex justify-between items-center text-[10px] font-semibold text-gray-800">
                <span>Volume:</span>
                <span className="font-mono text-[#000080] font-bold">{volPercentage}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={volPercentage}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                className="w-full cursor-pointer accent-[#000080] h-2 bg-gray-300"
              />

              <div className="flex justify-between text-[8.5px] text-gray-500 font-mono">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Desktop Widget & Video Player Options */}
            <div className="pt-1 border-t border-gray-300 space-y-1">
              <button
                type="button"
                onClick={() => {
                  backgroundMusic.setDesktopWidgetVisible(true);
                  setIsOpen(false);
                }}
                className="w-full w98-btn py-1 text-[10px] text-[#000080] font-bold flex items-center justify-center gap-1.5 border border-t-white border-l-white border-b-black border-r-black cursor-pointer hover:bg-gray-100"
              >
                <span>📻</span>
                <span>Open Desktop Music Player</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openWindow('emergency-player');
                }}
                className="w-full w98-btn py-1 text-[10px] text-gray-800 flex items-center justify-center gap-1.5 border border-t-white border-l-white border-b-black border-r-black cursor-pointer hover:bg-gray-100"
              >
                <span>📺</span>
                <span>Open Full Video Player (YouTube)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
