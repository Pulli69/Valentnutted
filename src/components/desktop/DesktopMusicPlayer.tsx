import React, { useState } from 'react';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import { backgroundMusic } from '../../audio/backgroundMusic';

export const DesktopMusicPlayer: React.FC = () => {
  const { 
    isPlaying, 
    volume, 
    isMuted, 
    youtubeVideoId, 
    isDesktopWidgetVisible,
    togglePlay, 
    setVolume, 
    toggleMute 
  } = useBackgroundMusic();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // If user dismissed or closed widget, don't show
  if (!isDesktopWidgetVisible) {
    return null;
  }

  const volPercentage = Math.round(volume * 100);

  return (
    <div 
      className="fixed left-3 bottom-10 z-30 w-72 sm:w-80 shadow-2xl select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w98-window bg-[#c0c0c0] p-1 border-2 border-t-white border-l-white border-b-black border-r-black text-black">
        {/* Title Bar */}
        <div className="w98-titlebar bg-[#000080] flex justify-between items-center px-1.5 py-0.5 font-bold text-white text-[10.5px]">
          <div className="flex items-center gap-1.5 truncate">
            <span>🎵</span>
            <span className="truncate">Windows Media Player - Renai Circulation</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Collapse / Expand */}
            <button
              type="button"
              onClick={() => setIsCollapsed(prev => !prev)}
              className="w98-btn px-1 text-[9px] leading-none h-3.5 flex items-center justify-center font-mono"
              title={isCollapsed ? 'Expand player' : 'Collapse player'}
            >
              {isCollapsed ? '+' : '–'}
            </button>
            {/* Close / Hide */}
            <button
              type="button"
              onClick={() => backgroundMusic.setDesktopWidgetVisible(false)}
              className="w98-btn px-1 text-[9px] leading-none h-3.5 flex items-center justify-center font-bold"
              title="Close player widget (Can reopen from taskbar tray 🎵 icon)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isCollapsed && (
          <div className="mt-1 space-y-1.5 p-1 bg-[#dfdfdf] border border-gray-400">
            {/* Visible Standard YouTube Embed (100% compliant with YouTube terms & controls) */}
            <div className="w98-inset bg-black p-0.5 relative overflow-hidden aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${youtubeVideoId}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                title="Renai Circulation Background Audio"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="yt-bg-stream-iframe w-full h-full border-0"
              />
            </div>

            {/* Retro Player Controls Bar */}
            <div className="flex items-center justify-between gap-1 text-[10px] pt-0.5">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => togglePlay()}
                  className="w98-btn px-2 py-0.5 font-bold flex items-center gap-1 text-[10px] border border-t-white border-l-white border-b-black border-r-black cursor-pointer active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
                >
                  <span>{isPlaying ? '⏸' : '▶'}</span>
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleMute()}
                  className={`w98-btn px-2 py-0.5 font-bold text-[10px] border border-t-white border-l-white border-b-black border-r-black cursor-pointer ${
                    isMuted ? 'bg-red-100 text-red-900' : ''
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 flex-1 max-w-[130px]">
                <span className="text-[9px] font-mono text-gray-700">{volPercentage}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volPercentage}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="w-full cursor-pointer accent-[#000080] h-1.5 bg-gray-300"
                  title={`Volume: ${volPercentage}%`}
                />
              </div>
            </div>

            {/* Status Footer */}
            <div className="w98-inset bg-white p-1 text-[9px] font-mono flex items-center justify-between text-gray-700">
              <span className="text-[#000080] font-bold truncate">STREAM: YouTube Direct (No download)</span>
              <span>VOL: 20% (Default)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
