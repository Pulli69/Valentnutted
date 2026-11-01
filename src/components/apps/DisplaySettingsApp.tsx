import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import type { WallpaperType } from '../../types/os';
import { DisplaySettingsIcon, VolumeIcon } from '../icons/PixelIcons';

export const DisplaySettingsApp: React.FC = () => {
  const { 
    systemSettings, 
    setWallpaper, 
    toggleSound, 
    toggleCrtFilter, 
    toggleChatNotifications,
    toggleDesktopChatVisible,
    restartBoot,
    showNotification 
  } = useOS();

  const [activeTab, setActiveTab] = useState<'background' | 'effects' | 'sound'>('background');
  const [selectedWallpaper, setSelectedWallpaper] = useState<WallpaperType>(systemSettings.wallpaper);

  const handleApply = () => {
    setWallpaper(selectedWallpaper);
    showNotification('DISPLAY PROPERTIES', 'Settings applied successfully.', 'info');
  };

  const getPreviewBg = (type: WallpaperType): React.CSSProperties => {
    switch (type) {
      case 'bliss':
        return {
          background: 'linear-gradient(180deg, #3b82f6 0%, #60a5fa 60%, #15803d 60%, #166534 100%)'
        };
      case 'teal':
        return { backgroundColor: '#008080' };
      case 'midnight':
        return { backgroundColor: '#000080' };
      case 'matrix':
        return {
          backgroundColor: '#050c05',
          backgroundImage: 'radial-gradient(#00ff00 15%, transparent 16%)',
          backgroundSize: '8px 8px'
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between text-[11px] h-full bg-[#c0c0c0] select-none p-1">
      {/* Tabs */}
      <div className="flex border-b-2 border-[#ffffff] px-1 pt-1 mb-2">
        <button
          onClick={() => setActiveTab('background')}
          className={`w98-tab ${activeTab === 'background' ? 'active' : ''}`}
        >
          Background
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className={`w98-tab ${activeTab === 'effects' ? 'active' : ''}`}
        >
          Effects & Filter
        </button>
        <button
          onClick={() => setActiveTab('sound')}
          className={`w98-tab ${activeTab === 'sound' ? 'active' : ''}`}
        >
          Audio & System
        </button>
      </div>

      {/* Tab 1: Background */}
      {activeTab === 'background' && (
        <div className="flex-1 flex flex-col items-center justify-between gap-3 p-1">
          {/* CRT Monitor Mockup */}
          <div className="w-44 h-36 bg-[#dfdfdf] w98-outset p-2 flex flex-col items-center justify-center">
            {/* Monitor Screen Frame */}
            <div className="w-36 h-24 bg-[#000000] p-1 rounded-sm shadow-inner">
              <div 
                className="w-full h-full border border-gray-600 transition-colors duration-200"
                style={getPreviewBg(selectedWallpaper)}
              />
            </div>
            {/* Monitor Base Stand */}
            <div className="w-12 h-2 bg-[#b0b0b0] mt-1 shadow-sm" />
          </div>

          {/* Wallpaper Selection Box */}
          <div className="w-full flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <DisplaySettingsIcon size={18} />
              <span className="text-[11px] font-semibold">Select a wallpaper pattern:</span>
            </div>
            <div className="w98-field flex-1 overflow-y-auto p-1 max-h-32">
              <div
                onClick={() => setSelectedWallpaper('teal')}
                className={`px-2 py-1 cursor-default ${
                  selectedWallpaper === 'teal' ? 'bg-[#000080] text-white' : 'hover:bg-blue-100 text-black'
                }`}
              >
                Windows 98 Classic Teal (Default)
              </div>
              <div
                onClick={() => setSelectedWallpaper('bliss')}
                className={`px-2 py-1 cursor-default ${
                  selectedWallpaper === 'bliss' ? 'bg-[#000080] text-white' : 'hover:bg-blue-100 text-black'
                }`}
              >
                Bliss Meadow (Willpower Horizon)
              </div>
              <div
                onClick={() => setSelectedWallpaper('midnight')}
                className={`px-2 py-1 cursor-default ${
                  selectedWallpaper === 'midnight' ? 'bg-[#000080] text-white' : 'hover:bg-blue-100 text-black'
                }`}
              >
                Midnight Navy 98 (Deep Focus)
              </div>
              <div
                onClick={() => setSelectedWallpaper('matrix')}
                className={`px-2 py-1 cursor-default ${
                  selectedWallpaper === 'matrix' ? 'bg-[#000080] text-white' : 'hover:bg-blue-100 text-black'
                }`}
              >
                Matrix Protocol (Pure Discipline)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Effects & CRT */}
      {activeTab === 'effects' && (
        <div className="flex-1 flex flex-col gap-3 p-2">
          <fieldset className="border border-gray-400 p-2.5">
            <legend className="px-1 text-[11px] font-semibold">Visual Nostalgia Settings</legend>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={systemSettings.crtFilter}
                onChange={toggleCrtFilter}
                className="w98-checkbox"
              />
              <span>Enable Authentic CRT Scanline Filter (Subtle glass overlay)</span>
            </label>
            <p className="text-[10px] text-gray-600 pl-5">
              Simulates the phosphor scanlines of a 1998 Sony Trinitron multiscan monitor.
            </p>
          </fieldset>

          <fieldset className="border border-gray-400 p-2.5">
            <legend className="px-1 text-[11px] font-semibold">System Diagnostics</legend>
            <div className="space-y-1.5 text-[11px]">
              <div>• Screen Resolution: 1024 x 768 pixels (High Color 16-bit)</div>
              <div>• Refresh Rate: 85 Hz (Flicker-Free)</div>
              <div>• Hardware Acceleration: NutGuard V2 Full Glide</div>
            </div>
          </fieldset>
        </div>
      )}

      {/* Tab 3: Sound & System */}
      {activeTab === 'sound' && (
        <div className="flex-1 flex flex-col gap-3 p-2">
          <fieldset className="border border-gray-400 p-2.5">
            <legend className="px-1 text-[11px] font-semibold">Audio Scheme</legend>
            <div className="flex items-center justify-between mb-2">
              <span>Sound Synthesizer:</span>
              <button
                onClick={toggleSound}
                className="w98-btn px-3 py-1 flex items-center gap-1.5"
              >
                <VolumeIcon size={14} muted={!systemSettings.soundEnabled} />
                <span>{systemSettings.soundEnabled ? 'Mute Audio' : 'Enable Audio'}</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-600">
              Uses Web Audio API FM-synthesis to generate retro Windows 98 clicks, chimes, stamps, error bells, and modem dialups in real-time.
            </p>
          </fieldset>

          <fieldset className="border border-gray-400 p-2.5">
            <legend className="px-1 text-[11px] font-semibold">Desktop Chat & Notifications</legend>
            <div className="flex items-center justify-between mb-2">
              <span>Incoming Message Balloon Notifications:</span>
              <button
                type="button"
                onClick={toggleChatNotifications}
                className="w98-btn px-3 py-1 font-semibold"
              >
                {systemSettings.chatNotifications ? 'Disable Balloons' : 'Enable Balloons'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span>Desktop Chat Widget (Live Dispatch):</span>
              <button
                type="button"
                onClick={toggleDesktopChatVisible}
                className="w98-btn px-3 py-1 font-semibold"
              >
                {systemSettings.desktopChatVisible ? 'Hide Desktop Widget' : 'Show Desktop Widget'}
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-2">
              Displays incoming dispatches from #NoNutSurvival on the desktop. Notifications remain non-intrusive.
            </p>
          </fieldset>

          <fieldset className="border border-gray-400 p-2.5">
            <legend className="px-1 text-[11px] font-semibold">System Restart</legend>
            <div className="flex items-center justify-between">
              <span className="text-[11px]">Re-run BIOS and Win98 Boot Sequence:</span>
              <button
                type="button"
                onClick={restartBoot}
                className="w98-btn px-3 py-1 font-bold text-red-900"
              >
                Reboot System
              </button>
            </div>
          </fieldset>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t border-[#808080] mt-1">
        <button
          onClick={handleApply}
          className="w98-btn px-4 py-1 font-semibold"
        >
          OK
        </button>
        <button
          onClick={handleApply}
          className="w98-btn px-4 py-1"
        >
          Apply
        </button>
      </div>
    </div>
  );
};
