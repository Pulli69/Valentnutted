import React, { useState } from 'react';
import { WarningExclamationIcon, VolumeIcon } from '../icons/PixelIcons';

const VIDEOS = {
  emergency: {
    id: 'PjxN1zSUnb0',
    name: '🛑 Emergency Tape',
    protocol: 'EMERGENCY PROTOCOL ACTIVATED',
    mediaLabel: 'MEDIA: URGE.AVI [16:9 STEREO]'
  },
  community: {
    id: 'uKxyLmbOc0Q',
    name: '🎵 Community Video',
    protocol: 'COMMUNITY THEME BROADCAST',
    mediaLabel: 'MEDIA: COMMUNITY_THEME.AVI [16:9 STEREO]'
  }
};

export const EmergencyPlayerApp: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<'emergency' | 'community'>('emergency');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [embedError, setEmbedError] = useState<boolean>(false);

  const currentVideo = VIDEOS[activeTrack];

  return (
    <div className="flex-1 flex flex-col justify-between text-[11px] h-full bg-[#c0c0c0] select-none">
      {/* Menubar with Track Switcher */}
      <div className="flex items-center justify-between px-2 py-0.5 border-b border-[#808080] text-[11px] bg-[#c0c0c0]">
        <div className="flex items-center gap-3">
          <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">File</span>
          <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Play</span>
          <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Help</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setActiveTrack('emergency'); setEmbedError(false); }}
            className={`px-1.5 py-0.5 text-[10px] cursor-pointer ${activeTrack === 'emergency' ? 'w98-inset font-bold bg-[#dfdfdf]' : 'w98-outset'}`}
          >
            🛑 Urge Tape
          </button>
          <button
            type="button"
            onClick={() => { setActiveTrack('community'); setEmbedError(false); }}
            className={`px-1.5 py-0.5 text-[10px] cursor-pointer ${activeTrack === 'community' ? 'w98-inset font-bold bg-[#dfdfdf]' : 'w98-outset'}`}
          >
            🎵 Community Theme
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-2 gap-2 overflow-y-auto">
        {/* Top Protocol Status Bar */}
        <div className="w98-inset bg-[#000000] text-[#00FF00] p-1.5 font-mono text-[11px] flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${activeTrack === 'emergency' ? 'bg-red-600 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
            <span className={`font-bold tracking-wider ${activeTrack === 'emergency' ? 'text-red-400' : 'text-cyan-300'}`}>
              {currentVideo.protocol}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 hidden sm:inline">
            {currentVideo.mediaLabel}
          </span>
        </div>

        {/* 16:9 Video Screen Frame (Sunken CRT Well) */}
        <div className="w98-inset bg-[#000000] p-1 flex flex-col items-center justify-center relative overflow-hidden">
          {!embedError ? (
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              <iframe
                key={currentVideo.id}
                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&rel=0`}
                title={currentVideo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onError={() => setEmbedError(true)}
                className="w-full h-full border-0 absolute inset-0 z-10"
              />
            </div>
          ) : (
            <div className="p-6 text-center text-white space-y-2">
              <div className="text-red-500 font-bold text-sm">VIDEO EMBED RESTRICTED BY HOST</div>
              <p className="text-gray-300 text-[11px]">
                Click below to open the video stream directly in a new window:
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${currentVideo.id}`}
                target="_blank"
                rel="noreferrer"
                className="w98-btn inline-block px-3 py-1 text-blue-900 font-bold"
              >
                Open Video on YouTube ↗
              </a>
            </div>
          )}
        </div>

        {/* Retro Media Controls Bar */}
        <div className="w98-outset bg-[#c0c0c0] p-1.5 flex flex-wrap items-center justify-between gap-2">
          {/* Playback Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className={`w98-btn px-2.5 py-0.5 text-[10px] font-bold ${isPlaying ? 'font-black' : ''}`}
              title="Play"
            >
              ▶ Play
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="w98-btn px-2 py-0.5 text-[10px]"
              title="Pause"
            >
              ⏸ Pause
            </button>
            <button
              type="button"
              className="w98-btn px-2 py-0.5 text-[10px]"
              title="Stop"
            >
              ⏹ Stop
            </button>
            <button
              type="button"
              className="w98-btn px-2 py-0.5 text-[10px]"
              title="Rewind"
            >
              ⏮ Rewind
            </button>
          </div>

          {/* Time Progress Indicator */}
          <div className="w98-inset bg-black text-[#00FF00] font-mono text-[10px] px-2 py-0.5">
            00:45 / 02:40
          </div>

          {/* Audio Volume Indicator */}
          <div className="flex items-center gap-1 px-1 text-gray-700">
            <VolumeIcon size={14} />
            <div className="w-16 h-2 w98-inset bg-gray-200 relative overflow-hidden">
              <div className="h-full bg-[#000080] w-[80%]" />
            </div>
          </div>
        </div>

        {/* Humorous Message Box */}
        <div className="w98-inset p-2.5 bg-[#ffffdf] border border-[#d4d0c8] flex items-center gap-2.5 shadow-sm">
          <div className="flex-shrink-0">
            <WarningExclamationIcon size={24} />
          </div>
          <div className="flex-1 text-[11px] text-[#000000] font-semibold leading-snug">
            Your future self says thanks. Don't be stupid.
          </div>
        </div>

        {/* Help Tip */}
        <div className="text-[10px] text-gray-600 italic px-1">
          * Notice: If browser security blocks automatic sound playback, please tap the native YouTube player directly.
        </div>
      </div>

      {/* Status Bar */}
      <div className="w98-inset px-2 py-0.5 text-[10px] flex justify-between bg-[#c0c0c0] text-gray-700 mx-1 mb-0.5">
        <span className="font-semibold text-red-900">Status: EMERGENCY PROTOCOL ACTIVATED</span>
        <span>Codec: Cinepak 1080p</span>
      </div>
    </div>
  );
};
