import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useOS } from '../../context/OSContext';
import { DesktopIcon } from './DesktopIcon';
import {
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

interface DesktopApp {
  id: AppId;
  title: string;
  icon: React.ReactNode;
}

export const Desktop: React.FC = () => {
  const { 
    openWindow, 
    systemSettings, 
    closeStartMenu,
    triggerFolded
  } = useOS();

  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);
  const iconsContainerRef = useRef<HTMLDivElement>(null);

  const desktopApps: DesktopApp[] = [
    { id: 'my-computer', title: 'My Nut PC', icon: <MyComputerIcon size={32} /> },
    { id: 'recycle-bin', title: 'Recycle Bin', icon: <RecycleBinIcon size={32} /> },
    { id: 'streak-tracker', title: 'Streak Tracker 98', icon: <StreakTrackerIcon size={32} /> },
    { id: 'emergency-player', title: 'STOP THE URGE', icon: <EmergencyPlayerIcon size={32} /> },
    { id: 'global-chat', title: 'mIRC Survival Chat', icon: <GlobalChatIcon size={32} /> },
    { id: 'leaderboard', title: 'Nut Hall of Fame', icon: <LeaderboardIcon size={32} /> },
    { id: 'urge-hotline', title: 'Urge Crisis Center', icon: <UrgeHotlineIcon size={32} /> },
    { id: 'nut-sweeper', title: 'NutSweeper 98', icon: <NutSweeperIcon size={32} /> },
    { id: 'confession-notes', title: 'Confession Log', icon: <ConfessionNotepadIcon size={32} /> },
    { id: 'internet-explorer', title: 'Internet Explorer', icon: <InternetExplorerIcon size={32} /> },
    { id: 'display-settings', title: 'Display Settings', icon: <DisplaySettingsIcon size={32} /> },
    { id: 'user-account', title: 'User Profile', icon: <UserAccountIcon size={32} /> },
  ];

  // GSAP Staggered desktop icons entrance
  useGSAP(() => {
    if (iconsContainerRef.current) {
      gsap.fromTo('.desktop-icon',
        { scale: 0.8, opacity: 0, y: -10 },
        { 
          scale: 1, 
          opacity: 1, 
          y: 0, 
          stagger: 0.05, 
          duration: 0.25, 
          ease: 'back.out(1.5)' 
        }
      );
    }
  }, { scope: iconsContainerRef });

  const handleDesktopClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.desktop-icon')) return;
    setSelectedIconId(null);
    setContextMenu(null);
    closeStartMenu();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((e.target as HTMLElement).closest('.desktop-icon')) return;
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 180),
      y: Math.min(e.clientY, window.innerHeight - 200)
    });
  };

  const getWallpaperStyle = (): React.CSSProperties => {
    switch (systemSettings.wallpaper) {
      case 'bliss':
        return {
          backgroundImage: `url('/assets/bliss.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      case 'teal':
        return { backgroundColor: '#008080' };
      case 'midnight':
        return { backgroundColor: '#000080' };
      case 'matrix':
        return { 
          backgroundColor: '#050c05',
          backgroundImage: 'radial-gradient(#005500 15%, transparent 16%)',
          backgroundSize: '16px 16px'
        };
      default:
        return { backgroundColor: '#008080' };
    }
  };

  return (
    <div
      ref={desktopRef}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
      style={getWallpaperStyle()}
      className="absolute inset-0 pb-[28px] overflow-hidden select-none"
    >
      {/* CRT Scanline filter if enabled */}
      {systemSettings.crtFilter && <div className="absolute inset-0 scanlines z-10 pointer-events-none" />}

      {/* Desktop Icons Grid */}
      <div 
        ref={iconsContainerRef}
        className="p-3 grid grid-flow-col grid-rows-6 gap-y-3 gap-x-2 w-max h-full"
      >
        {desktopApps.map(app => (
          <DesktopIcon
            key={app.id}
            id={app.id}
            title={app.title}
            icon={app.icon}
            isSelected={selectedIconId === app.id}
            onClick={(e) => {
              e.stopPropagation();
              if (selectedIconId === app.id) {
                openWindow(app.id);
              } else {
                setSelectedIconId(app.id);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              openWindow(app.id);
            }}
          />
        ))}

        {/* Big Warning "I FOLDED" Desktop Shortcut */}
        <DesktopIcon
          id="folded-shortcut"
          title="I FOLDED (Give Up)"
          icon={<FoldedWarningIcon size={32} />}
          isSelected={selectedIconId === 'folded-shortcut'}
          onClick={(e) => {
            e.stopPropagation();
            if (selectedIconId === 'folded-shortcut') {
              triggerFolded();
            } else {
              setSelectedIconId('folded-shortcut');
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            triggerFolded();
          }}
        />
      </div>

      {/* Prominent Desktop Emergency Button */}
      <div className="absolute top-2.5 right-2.5 z-10 select-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openWindow('emergency-player');
          }}
          className="w98-outset bg-[#ffdddd] hover:bg-[#ffcccc] active:bg-[#ffaaaa] text-red-950 font-bold text-[11px] px-3 py-1.5 flex items-center gap-1.5 border border-red-700 shadow-md cursor-default"
          title="Emergency Urge Destroyer: Launch URGE.exe"
        >
          <span className="text-sm">🛑</span>
          <span className="font-black tracking-wider text-red-900">STOP THE URGE</span>
          <span className="text-[9px] bg-red-700 text-white px-1 font-mono">URGE.EXE</span>
        </button>
      </div>

      {/* Right-click Desktop Context Menu */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          className="fixed z-[9999] w-44 w98-outset py-1 bg-[#c0c0c0] text-[11px] shadow-md"
        >
          <div 
            onClick={() => { setContextMenu(null); openWindow('display-settings'); }}
            className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default"
          >
            Active Desktop
          </div>
          <div 
            onClick={() => setContextMenu(null)}
            className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default"
          >
            Arrange Icons
          </div>
          <div 
            onClick={() => setContextMenu(null)}
            className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default"
          >
            Line Up Icons
          </div>
          <div 
            onClick={() => setContextMenu(null)}
            className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default"
          >
            Refresh
          </div>

          <div className="h-[2px] bg-[#808080] border-b border-[#ffffff] my-1 mx-1" />

          <div 
            onClick={() => { setContextMenu(null); openWindow('confession-notes'); }}
            className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default"
          >
            New Confession Log
          </div>

          <div className="h-[2px] bg-[#808080] border-b border-[#ffffff] my-1 mx-1" />

          <div 
            onClick={() => { setContextMenu(null); openWindow('display-settings'); }}
            className="px-3 py-1 hover:bg-[#000080] hover:text-white cursor-default font-semibold"
          >
            Properties (Display)...
          </div>
        </div>
      )}
    </div>
  );
};
