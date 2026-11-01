import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useOS } from '../../context/OSContext';
import type { WindowInstance } from '../../types/os';
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
  MyComputerIcon,
  EmergencyPlayerIcon,
  UserAccountIcon
} from '../icons/PixelIcons';

interface WindowFrameProps {
  window: WindowInstance;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children }) => {
  const { 
    activeWindowId, 
    focusWindow, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow,
    updateWindowPos,
    updateWindowSize
  } = useOS();

  const windowRef = useRef<HTMLDivElement>(null);
  const isActive = activeWindowId === win.id;

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });

  // GSAP Entrance animation on first render
  useGSAP(() => {
    if (windowRef.current) {
      gsap.fromTo(windowRef.current,
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.18, ease: 'power2.out' }
      );
    }
  }, { scope: windowRef, dependencies: [] });

  // Handle Dragging
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    if ((e.target as HTMLElement).closest('.w98-title-btn')) return;
    
    focusWindow(win.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - win.x,
      y: e.clientY - win.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 120, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
        updateWindowPos(win.id, newX, newY);
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newW = Math.max(260, resizeStart.w + deltaX);
        const newH = Math.max(180, resizeStart.h + deltaY);
        updateWindowSize(win.id, newW, newH);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      if (win.allowMaximize && win.y <= 6) {
        maximizeWindow(win.id);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        if (e.cancelable) e.preventDefault();
        const touch = e.touches[0];
        const newX = Math.max(0, Math.min(window.innerWidth - 60, touch.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 60, touch.clientY - dragOffset.y));
        updateWindowPos(win.id, newX, newY);
      }
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        // Snapping: if dragged to top edge, snap to maximize
        if (win.allowMaximize && win.y <= 6) {
          maximizeWindow(win.id);
        }
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, win.id, win.y, win.allowMaximize, updateWindowPos, updateWindowSize, maximizeWindow]);

  // Touch start on title bar
  const handleTouchStart = (e: React.TouchEvent) => {
    if (win.isMaximized) return;
    if ((e.target as HTMLElement).closest('.w98-title-btn')) return;
    focusWindow(win.id);
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - win.x,
      y: touch.clientY - win.y
    });
  };

  // Helper icon render
  const renderAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'streak-tracker': return <StreakTrackerIcon size={16} />;
      case 'global-chat': return <GlobalChatIcon size={16} />;
      case 'leaderboard': return <LeaderboardIcon size={16} />;
      case 'urge-hotline': return <UrgeHotlineIcon size={16} />;
      case 'nut-sweeper': return <NutSweeperIcon size={16} />;
      case 'confession-notes': return <ConfessionNotepadIcon size={16} />;
      case 'internet-explorer': return <InternetExplorerIcon size={16} />;
      case 'display-settings': return <DisplaySettingsIcon size={16} />;
      case 'recycle-bin': return <RecycleBinIcon size={16} />;
      case 'my-computer': return <MyComputerIcon size={16} />;
      case 'emergency-player': return <EmergencyPlayerIcon size={16} />;
      case 'user-account': return <UserAccountIcon size={16} />;
      default: return <StreakTrackerIcon size={16} />;
    }
  };

  if (win.isMinimized) {
    return null; // Minimized windows are in the taskbar
  }

  const windowStyle: React.CSSProperties = win.isMaximized
    ? {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: 'calc(100vh - 28px)', // leaves room for taskbar
        zIndex: win.zIndex
      }
    : {
        position: 'absolute',
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex
      };

  return (
    <div
      ref={windowRef}
      style={windowStyle}
      onClick={() => focusWindow(win.id)}
      className="w98-outset flex flex-col select-none overflow-hidden"
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleTitleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={() => win.allowMaximize && maximizeWindow(win.id)}
        className="h-6 px-1 flex items-center justify-between cursor-default touch-none"
        style={{
          background: isActive
            ? 'linear-gradient(90deg, #000080 0%, #1084d0 100%)'
            : 'linear-gradient(90deg, #808080 0%, #b5b5b5 100%)',
          color: isActive ? '#ffffff' : '#c0c0c0'
        }}
      >
        <div className="flex items-center gap-1.5 overflow-hidden pr-2">
          <div className="flex-shrink-0 scale-90">
            {renderAppIcon(win.icon)}
          </div>
          <span className="font-bold text-[11px] truncate tracking-wide">
            {win.title}
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-[2px] flex-shrink-0">
          {/* Minimize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(win.id);
            }}
            className="w98-title-btn"
            title="Minimize"
          >
            <span className="font-bold pb-1 text-[11px]">_</span>
          </button>

          {/* Maximize / Restore */}
          {win.allowMaximize && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                maximizeWindow(win.id);
              }}
              className="w98-title-btn"
              title={win.isMaximized ? "Restore" : "Maximize"}
            >
              {win.isMaximized ? (
                <span className="text-[9px]">❐</span>
              ) : (
                <span className="text-[10px]">□</span>
              )}
            </button>
          )}

          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="w98-title-btn"
            title="Close"
          >
            <span className="text-[10px] font-bold">✕</span>
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 flex flex-col overflow-auto bg-[#c0c0c0] p-1">
        {children}
      </div>

      {/* Resize Handle on bottom right (only if not maximized) */}
      {!win.isMaximized && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            focusWindow(win.id);
            setIsResizing(true);
            setResizeStart({
              x: e.clientX,
              y: e.clientY,
              w: win.width,
              h: win.height
            });
          }}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-[1px] select-none"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="8" y1="2" x2="2" y2="8" stroke="#808080" strokeWidth="1" />
            <line x1="9" y1="2" x2="2" y2="9" stroke="#ffffff" strokeWidth="1" />
            <line x1="9" y1="5" x2="5" y2="9" stroke="#808080" strokeWidth="1" />
            <line x1="10" y1="5" x2="5" y2="10" stroke="#ffffff" strokeWidth="1" />
            <line x1="9" y1="8" x2="8" y2="9" stroke="#808080" strokeWidth="1" />
            <line x1="10" y1="8" x2="8" y2="10" stroke="#ffffff" strokeWidth="1" />
          </svg>
        </div>
      )}
    </div>
  );
};
