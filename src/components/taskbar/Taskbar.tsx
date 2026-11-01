import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { 
  WindowsFlagIcon, 
  VolumeIcon, 
  NetworkIcon,
  StreakTrackerIcon,
  GlobalChatIcon,
  LeaderboardIcon,
  UrgeHotlineIcon,
  NutSweeperIcon,
  ConfessionNotepadIcon,
  InternetExplorerIcon,
  DisplaySettingsIcon,
  RecycleBinIcon,
  MyComputerIcon,
  EmergencyPlayerIcon,
  UserAccountIcon
} from '../icons/PixelIcons';
import { MusicTrayControl } from './MusicTrayControl';

export const Taskbar: React.FC = () => {
  const { 
    windows, 
    activeWindowId, 
    focusWindow, 
    minimizeWindow, 
    startMenuOpen, 
    toggleStartMenu,
    systemSettings,
    toggleSound
  } = useOS();

  // Clock state
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (winId: string) => {
    const win = windows.find(w => w.id === winId);
    if (!win) return;

    if (win.isMinimized) {
      focusWindow(winId);
    } else if (activeWindowId === winId) {
      minimizeWindow(winId);
    } else {
      focusWindow(winId);
    }
  };

  const renderTabIcon = (iconName: string) => {
    switch (iconName) {
      case 'streak-tracker': return <StreakTrackerIcon size={14} />;
      case 'global-chat': return <GlobalChatIcon size={14} />;
      case 'leaderboard': return <LeaderboardIcon size={14} />;
      case 'urge-hotline': return <UrgeHotlineIcon size={14} />;
      case 'nut-sweeper': return <NutSweeperIcon size={14} />;
      case 'confession-notes': return <ConfessionNotepadIcon size={14} />;
      case 'internet-explorer': return <InternetExplorerIcon size={14} />;
      case 'display-settings': return <DisplaySettingsIcon size={14} />;
      case 'recycle-bin': return <RecycleBinIcon size={14} />;
      case 'my-computer': return <MyComputerIcon size={14} />;
      case 'emergency-player': return <EmergencyPlayerIcon size={14} />;
      case 'user-account': return <UserAccountIcon size={14} />;
      default: return <StreakTrackerIcon size={14} />;
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-[28px] z-[9999] bg-[#c0c0c0] flex items-center justify-between px-1 select-none border-t-2 border-[#ffffff] shadow-[inset_0_1px_0_#dfdfdf,0_-1px_0_#808080]"
      style={{
        boxShadow: 'inset 0 1px 0 #ffffff, 0 -1px 0 #808080'
      }}
    >
      {/* Left: Start Button + Window Tabs */}
      <div className="flex items-center gap-1.5 h-full py-[2px] flex-1 overflow-hidden pr-2">
        {/* Start Button */}
        <button
          onClick={toggleStartMenu}
          className={`h-[22px] px-2 flex items-center gap-1.5 font-bold text-[11px] cursor-default ${
            startMenuOpen ? 'w98-inset' : 'w98-outset'
          }`}
          style={{
            minWidth: '60px'
          }}
        >
          <WindowsFlagIcon size={16} />
          <span>Start</span>
        </button>

        {/* Vertical separator */}
        <div className="w-[2px] h-[18px] border-l border-[#808080] border-r border-[#ffffff] mx-0.5" />

        {/* Window Tabs Container */}
        <div className="flex items-center gap-1 overflow-x-auto h-full py-[1px]">
          {windows.map(win => {
            const isActive = activeWindowId === win.id && !win.isMinimized;
            return (
              <button
                key={win.id}
                onClick={() => handleTabClick(win.id)}
                className={`h-[22px] px-2 max-w-[160px] min-w-[65px] sm:min-w-[100px] flex items-center gap-1.5 text-left text-[11px] truncate cursor-default ${
                  isActive ? 'w98-inset font-bold bg-[#e0e0e0]' : 'w98-outset'
                }`}
                title={win.title}
              >
                <div className="flex-shrink-0">
                  {renderTabIcon(win.icon)}
                </div>
                <span className="truncate">{win.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: System Tray (Sunken inset box) */}
      <div className="w98-inset h-[22px] px-2 flex items-center gap-2 text-[11px] bg-[#c0c0c0] flex-shrink-0">
        {/* Network Monitor */}
        <div title="NutGuard Network Protection: Active" className="cursor-default flex items-center">
          <NetworkIcon size={14} />
        </div>

        {/* Background Music Controller */}
        <MusicTrayControl />

        {/* Sound Toggle (Speaker icon) */}
        <button
          onClick={toggleSound}
          title={systemSettings.soundEnabled ? "Sound: ON (Click to Mute)" : "Sound: MUTED (Click to Enable)"}
          className="cursor-default hover:opacity-80 p-0.5 flex items-center"
        >
          <VolumeIcon size={14} muted={!systemSettings.soundEnabled} />
        </button>

        {/* Digital Clock */}
        <span className="font-mono text-[11px] tracking-tight pl-1 border-l border-[#808080]/40">
          {timeStr || '12:00 PM'}
        </span>
      </div>
    </div>
  );
};
