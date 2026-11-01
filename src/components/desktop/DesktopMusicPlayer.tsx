import React, { useState } from 'react';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import { backgroundMusic } from '../../audio/backgroundMusic';

export const DesktopMusicPlayer: React.FC = () => {
  const { 
    isPlaying, 
    volume, 
    isMuted, 
    activeSource,
    currentTrackIndex,
    currentTrack,
    playlist,
    isDesktopWidgetVisible,
    togglePlay, 
    setVolume, 
    toggleMute,
    selectTrack,
    nextTrack,
    previousTrack
  } = useBackgroundMusic();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // If user dismissed or closed widget, don't show
  if (!isDesktopWidgetVisible) {
    return null;
  }

  const volPercentage = Math.round(volume * 100);
  const playlistParam = playlist.map(t => t.id).join(',');

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
            <span className="truncate">Windows Media Player - {currentTrack.title}</span>
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
            {/* Track Selector Dropdown */}
            <div className="flex items-center gap-1 text-[10px]">
              <span className="font-bold text-gray-700 shrink-0">Track {currentTrackIndex + 1}/{playlist.length}:</span>
              <select
                value={currentTrackIndex}
                onChange={(e) => selectTrack(Number(e.target.value))}
                className="w98-field flex-1 py-0.5 px-1 text-[10px] bg-white font-mono truncate"
              >
                {playlist.map((track, idx) => (
                  <option key={track.id} value={idx}>
                    {idx + 1}. {track.artist} - {track.title}
                  </option>
                ))}
              </select>
            </div>

            {activeSource === 'youtube' ? (
              /* Visible Standard YouTube Embed with playlist looped */
              <div className="w98-inset bg-black p-0.5 relative overflow-hidden aspect-video">
                <iframe
                  key={currentTrack.id}
                  src={`https://www.youtube.com/embed/${currentTrack.id}?enablejsapi=1&autoplay=1&loop=1&playlist=${playlistParam}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  title={`${currentTrack.title} - ${currentTrack.artist}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="yt-bg-stream-iframe w-full h-full border-0"
                />
              </div>
            ) : (
              /* Retro Win98 Visualizer Screen for Local MP3 */
              <div className="w98-inset bg-black p-2.5 flex flex-col items-center justify-center gap-1.5 font-mono text-[#00ff00] h-28 shadow-inner">
                <div className="text-[11px] font-bold tracking-wider text-center text-cyan-300 truncate w-full">
                  {currentTrack.title} ({currentTrack.artist})
                </div>
                <div className="text-[9.5px] text-emerald-400">
                  {isPlaying ? '● PLAYING • MP3 STEREO 44.1kHz' : '○ PAUSED'}
                </div>
                {/* Visualizer bars */}
                <div className="flex items-end gap-1.5 h-8 pt-1">
                  <span className={`w-2.5 bg-emerald-500 ${isPlaying ? 'h-5 animate-pulse' : 'h-1'}`} />
                  <span className={`w-2.5 bg-emerald-400 ${isPlaying ? 'h-7 animate-bounce' : 'h-1'}`} style={{ animationDuration: '0.6s' }} />
                  <span className={`w-2.5 bg-cyan-400 ${isPlaying ? 'h-4 animate-pulse' : 'h-1'}`} />
                  <span className={`w-2.5 bg-emerald-300 ${isPlaying ? 'h-8 animate-bounce' : 'h-1'}`} style={{ animationDuration: '0.8s' }} />
                  <span className={`w-2.5 bg-emerald-400 ${isPlaying ? 'h-6 animate-pulse' : 'h-1'}`} />
                  <span className={`w-2.5 bg-cyan-300 ${isPlaying ? 'h-3 animate-bounce' : 'h-1'}`} style={{ animationDuration: '0.5s' }} />
                  <span className={`w-2.5 bg-emerald-500 ${isPlaying ? 'h-5 animate-pulse' : 'h-1'}`} />
                </div>
              </div>
            )}

            {/* Retro Player Controls Bar with Previous/Next track buttons */}
            <div className="flex items-center justify-between gap-1 text-[10px] pt-0.5">
              <div className="flex items-center gap-1">
                {/* Previous Track */}
                <button
                  type="button"
                  onClick={() => previousTrack()}
                  className="w98-btn px-1.5 py-0.5 font-bold text-[10px] border border-t-white border-l-white border-b-black border-r-black cursor-pointer"
                  title="Previous Track"
                >
                  ⏮
                </button>

                {/* Play / Pause */}
                <button
                  type="button"
                  onClick={() => togglePlay()}
                  className="w98-btn px-2 py-0.5 font-bold flex items-center gap-1 text-[10px] border border-t-white border-l-white border-b-black border-r-black cursor-pointer active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
                >
                  <span>{isPlaying ? '⏸' : '▶'}</span>
                </button>

                {/* Next Track */}
                <button
                  type="button"
                  onClick={() => nextTrack()}
                  className="w98-btn px-1.5 py-0.5 font-bold text-[10px] border border-t-white border-l-white border-b-black border-r-black cursor-pointer"
                  title="Next Track"
                >
                  ⏭
                </button>

                {/* Mute */}
                <button
                  type="button"
                  onClick={() => toggleMute()}
                  className={`w98-btn px-1.5 py-0.5 font-bold text-[10px] border border-t-white border-l-white border-b-black border-r-black cursor-pointer ${
                    isMuted ? 'bg-red-100 text-red-900' : ''
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 flex-1 max-w-[110px]">
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

            {/* Status Footer & Mode Switcher */}
            <div className="w98-inset bg-white p-1 text-[9px] font-mono flex items-center justify-between text-gray-700">
              <span className="text-[#000080] font-bold truncate">
                🔂 LOOP: ON • {activeSource === 'local' ? 'Local MP3' : 'YouTube Stream'}
              </span>
              <button
                type="button"
                onClick={() => backgroundMusic.setSource(activeSource === 'local' ? 'youtube' : 'local')}
                className="text-[9px] text-blue-900 hover:underline font-sans cursor-pointer shrink-0 ml-1"
              >
                Switch to {activeSource === 'local' ? 'YouTube' : 'MP3'} ⇄
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
