import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useOS } from '../../context/OSContext';
import {
  WindowsFlagIcon,
  StreakTrackerIcon,
  GlobalChatIcon,
  LeaderboardIcon,
  UrgeHotlineIcon,
  NutSweeperIcon,
  ConfessionNotepadIcon,
  InternetExplorerIcon,
  DisplaySettingsIcon,
  RecycleBinIcon,
  FoldedWarningIcon,
  MyComputerIcon,
  EmergencyPlayerIcon,
  UserAccountIcon
} from '../icons/PixelIcons';
import type { AppId } from '../../types/os';

export const StartMenu: React.FC = () => {
  const { 
    startMenuOpen, 
    closeStartMenu, 
    openWindow, 
    triggerFolded, 
    restartBoot,
    streakState 
  } = useOS();
  const menuRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (startMenuOpen && menuRef.current) {
      gsap.fromTo(menuRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.15, ease: 'power2.out' }
      );
    }
  }, { scope: menuRef, dependencies: [startMenuOpen] });

  if (!startMenuOpen) return null;

  const handleLaunch = (appId: AppId) => {
    closeStartMenu();
    openWindow(appId);
  };

  return (
    <>
      {/* Invisible backdrop to dismiss menu on click outside */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={closeStartMenu} 
      />

      <div
        ref={menuRef}
        className="fixed left-0 bottom-[28px] z-[9999] w98-outset flex overflow-hidden shadow-2xl"
        style={{ width: '220px' }}
      >
        {/* Left Vertical Banner (Authentic Windows 98 Side Banner) */}
        <div 
          className="w-7 flex flex-col justify-end items-center py-2 select-none"
          style={{
            background: 'linear-gradient(180deg, #000080 0%, #1084d0 100%)',
            color: '#ffffff'
          }}
        >
          <div 
            className="text-[14px] font-black tracking-widest whitespace-nowrap -rotate-90 origin-bottom flex items-center gap-2 mb-2"
            style={{ transform: 'rotate(-90deg) translate(0, 0)' }}
          >
            <span>IHAVENTNUTTED</span>
            <span className="text-yellow-300 font-bold">98</span>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 py-1 bg-[#c0c0c0] flex flex-col text-[11px]">
          {/* User Quick Info */}
          <div 
            onClick={() => handleLaunch('user-account')}
            className="px-3 py-1 mb-1 border-b border-[#808080] text-gray-700 bg-[#dfdfdf]/60 font-semibold hover:bg-[#000080] hover:text-white cursor-default flex items-center justify-between"
            title="Click to manage User Identity & Cloud Logon"
          >
            <span>Day {streakState.currentStreakDays} Survivor</span>
            <span className="text-[10px] opacity-75">👤 Profile ↗</span>
          </div>

          {/* Programs */}
          <div
            onClick={() => handleLaunch('streak-tracker')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <StreakTrackerIcon size={20} />
            <span className="font-semibold">Streak Tracker 98</span>
          </div>

          <div
            onClick={() => handleLaunch('emergency-player')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group bg-red-50/50"
          >
            <EmergencyPlayerIcon size={20} />
            <span className="font-extrabold text-red-800 group-hover:text-white">STOP THE URGE (URGE.exe)</span>
          </div>

          <div
            onClick={() => handleLaunch('global-chat')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <GlobalChatIcon size={20} />
            <span>mIRC #Survival Chat</span>
          </div>

          <div
            onClick={() => handleLaunch('leaderboard')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <LeaderboardIcon size={20} />
            <span>Nut Hall of Fame</span>
          </div>

          <div
            onClick={() => handleLaunch('urge-hotline')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <UrgeHotlineIcon size={20} />
            <span className="font-semibold text-red-700 group-hover:text-red-200">Urge Crisis Center</span>
          </div>

          <div
            onClick={() => handleLaunch('nut-sweeper')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <NutSweeperIcon size={20} />
            <span>NutSweeper 98</span>
          </div>

          <div
            onClick={() => handleLaunch('confession-notes')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <ConfessionNotepadIcon size={20} />
            <span>Confession Notepad</span>
          </div>

          <div
            onClick={() => handleLaunch('internet-explorer')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <InternetExplorerIcon size={20} />
            <span>Internet Explorer 4.0</span>
          </div>

          {/* Separator */}
          <div className="h-[2px] bg-[#808080] border-b border-[#ffffff] my-1 mx-1" />

          {/* System Settings & Recycle */}
          <div
            onClick={() => handleLaunch('user-account')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <UserAccountIcon size={20} />
            <span>User Identity & Logon...</span>
          </div>

          <div
            onClick={() => handleLaunch('display-settings')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <DisplaySettingsIcon size={20} />
            <span>Settings & Themes...</span>
          </div>

          <div
            onClick={() => handleLaunch('my-computer')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <MyComputerIcon size={20} />
            <span>My Nut PC</span>
          </div>

          <div
            onClick={() => handleLaunch('recycle-bin')}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <RecycleBinIcon size={20} />
            <span>Recycle Bin</span>
          </div>

          {/* Separator */}
          <div className="h-[2px] bg-[#808080] border-b border-[#ffffff] my-1 mx-1" />

          {/* Reboot system */}
          <div
            onClick={() => {
              closeStartMenu();
              restartBoot();
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#000080] hover:text-white cursor-default group"
          >
            <WindowsFlagIcon size={18} />
            <span>Restart Windows...</span>
          </div>

          {/* I FOLDED (Shut Down / Surrender) */}
          <div
            onClick={triggerFolded}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#800000] hover:text-white cursor-default group text-red-900 font-bold"
          >
            <FoldedWarningIcon size={20} />
            <span>I Folded (Admit Defeat)...</span>
          </div>
        </div>
      </div>
    </>
  );
};
