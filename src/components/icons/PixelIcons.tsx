import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Authentic Windows 98 4-color flag
export const WindowsFlagIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Red top-left */}
    <path d="M1 2L7 1V7L1 8V2Z" fill="#FF0000" />
    <path d="M2 3L6 2V6L2 7V3Z" fill="#FF5555" />
    {/* Green top-right */}
    <path d="M8 1L15 2V8L8 7V1Z" fill="#00AA00" />
    <path d="M9 2L14 3V7L9 6V2Z" fill="#55FF55" />
    {/* Blue bottom-left */}
    <path d="M1 9L7 8V14L1 15V9Z" fill="#0000AA" />
    <path d="M2 10L6 9V13L2 14V10Z" fill="#5555FF" />
    {/* Yellow bottom-right */}
    <path d="M8 8L15 9V15L8 14V8Z" fill="#DDAA00" />
    <path d="M9 9L14 10V14L9 13V9Z" fill="#FFFF55" />
  </svg>
);

// My Nut PC (Classic Beige Desktop + CRT)
export const MyComputerIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* CRT Monitor */}
    <rect x="4" y="2" width="24" height="18" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
    <rect x="5" y="3" width="22" height="1" fill="#FFFFFF" />
    <rect x="5" y="3" width="1" height="16" fill="#FFFFFF" />
    <rect x="26" y="4" width="1" height="15" fill="#808080" />
    {/* Blue CRT Screen */}
    <rect x="7" y="5" width="18" height="12" fill="#000080" stroke="#000000" strokeWidth="1" />
    <rect x="8" y="6" width="16" height="10" fill="#008080" />
    <path d="M9 8H12V9H9V8Z" fill="#FFFFFF" />
    <path d="M14 11H21V12H14V11Z" fill="#00FF00" />
    <rect x="23" y="18" width="2" height="1" fill="#00FF00" /> {/* Power LED */}
    {/* Monitor Stand */}
    <rect x="13" y="20" width="6" height="3" fill="#808080" />
    <rect x="10" y="23" width="12" height="2" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
    {/* Tower Base */}
    <rect x="2" y="25" width="28" height="5" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
    <rect x="5" y="27" width="8" height="1" fill="#000000" /> {/* Floppy drive slot */}
    <rect x="16" y="27" width="6" height="1" fill="#808080" /> {/* CD Tray */}
    <rect x="25" y="27" width="2" height="2" fill="#00FF00" /> {/* Power Button */}
  </svg>
);

// Streak Tracker 98 Icon (Calendar + Golden Padlock)
export const StreakTrackerIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Calendar Base */}
    <rect x="3" y="4" width="22" height="24" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
    <rect x="3" y="4" width="22" height="6" fill="#800000" /> {/* Red top header */}
    <rect x="5" y="2" width="3" height="3" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
    <rect x="19" y="2" width="3" height="3" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
    {/* Days Grid */}
    <circle cx="7" cy="14" r="1.5" fill="#008000" />
    <circle cx="14" cy="14" r="1.5" fill="#008000" />
    <circle cx="7" cy="20" r="1.5" fill="#008000" />
    <circle cx="14" cy="20" r="1.5" fill="#008000" />
    <text x="5" y="8" fill="#FFFFFF" fontSize="5" fontFamily="monospace" fontWeight="bold">NOV</text>
    {/* Golden Willpower Padlock on bottom right */}
    <rect x="16" y="16" width="13" height="12" fill="#DDAA00" stroke="#000000" strokeWidth="1" />
    <rect x="17" y="17" width="11" height="1" fill="#FFFF77" />
    <path d="M19 16V12C19 10 21 8 23 8C25 8 27 10 27 12V16" stroke="#808080" strokeWidth="2" strokeLinecap="round" />
    <circle cx="22.5" cy="22" r="1.5" fill="#000000" />
    <rect x="22" y="22" width="1" height="3" fill="#000000" />
  </svg>
);

// Global Nut Chat (mIRC 98 Icon)
export const GlobalChatIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Background yellow speech bubble */}
    <path d="M4 4H26V18H14L8 24V18H4V4Z" fill="#FFFFDD" stroke="#000000" strokeWidth="1" />
    <path d="M5 5H25" stroke="#FFFFFF" strokeWidth="1" />
    {/* IRC Hash symbol */}
    <text x="8" y="14" fill="#000080" fontSize="11" fontWeight="bold" fontFamily="monospace">#</text>
    {/* Text lines */}
    <rect x="16" y="8" width="7" height="2" fill="#000080" />
    <rect x="16" y="12" width="5" height="2" fill="#808080" />
    {/* Foreground green speech bubble */}
    <path d="M12 12H29V24H22L16 29V24H12V12Z" fill="#C0FFC0" stroke="#000000" strokeWidth="1" />
    <text x="15" y="21" fill="#008000" fontSize="8" fontWeight="bold" fontFamily="monospace">LIVE</text>
  </svg>
);

// Leaderboard / Hall of Fame Icon
export const LeaderboardIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Golden Trophy Cup */}
    <path d="M7 6H25V14C25 18 21 21 16 21C11 21 7 18 7 14V6Z" fill="#FFCC00" stroke="#000000" strokeWidth="1" />
    <path d="M9 7H23V8H9V7Z" fill="#FFFF77" />
    {/* Left Handle */}
    <path d="M7 8H3C3 12 5 15 8 15V13C6 13 5 11 5 8H7V8Z" fill="#DDAA00" stroke="#000000" strokeWidth="0.8" />
    {/* Right Handle */}
    <path d="M25 8H29C29 12 27 15 24 15V13C26 13 27 11 27 8H25V8Z" fill="#DDAA00" stroke="#000000" strokeWidth="0.8" />
    {/* Stem & Pedestal */}
    <rect x="14" y="21" width="4" height="4" fill="#DDAA00" stroke="#000000" strokeWidth="1" />
    <rect x="9" y="25" width="14" height="4" fill="#804000" stroke="#000000" strokeWidth="1" />
    <rect x="11" y="26" width="10" height="2" fill="#FFCC00" />
    <text x="14" y="16" fill="#800000" fontSize="9" fontWeight="bold" fontFamily="sans-serif">1</text>
  </svg>
);

// NutSweeper / Minesweeper 98 Icon
export const NutSweeperIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* 3D Tile Background */}
    <rect x="2" y="2" width="28" height="28" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
    <path d="M2 2H30V4H4V30H2V2Z" fill="#FFFFFF" />
    <path d="M30 2V30H2V28H28V2H30Z" fill="#808080" />
    {/* Minesweeper Naval Mine / Spiky Nut */}
    <circle cx="16" cy="16" r="7" fill="#000000" />
    <circle cx="14" cy="14" r="2" fill="#FFFFFF" />
    {/* Spikes */}
    <line x1="16" y1="5" x2="16" y2="27" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <line x1="5" y1="16" x2="27" y2="16" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="8" x2="24" y2="24" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="24" x2="24" y2="8" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
    {/* Red flag on corner */}
    <polygon points="21,5 27,8 21,11" fill="#FF0000" />
    <line x1="21" y1="5" x2="21" y2="15" stroke="#000000" strokeWidth="1.5" />
  </svg>
);

// Emergency Urge Hotline Icon
export const UrgeHotlineIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Red Emergency Box */}
    <rect x="4" y="5" width="24" height="23" rx="2" fill="#CC0000" stroke="#000000" strokeWidth="1" />
    <rect x="5" y="6" width="22" height="1" fill="#FF8888" />
    {/* White First Aid Cross */}
    <rect x="13" y="10" width="6" height="13" fill="#FFFFFF" />
    <rect x="9.5" y="13.5" width="13" height="6" fill="#FFFFFF" />
    {/* Siren Rays */}
    <line x1="16" y1="1" x2="16" y2="3" stroke="#FFCC00" strokeWidth="2" />
    <line x1="6" y1="2" x2="8" y2="4" stroke="#FFCC00" strokeWidth="2" />
    <line x1="26" y1="2" x2="24" y2="4" stroke="#FFCC00" strokeWidth="2" />
  </svg>
);

// Confession Notepad 98 Icon
export const ConfessionNotepadIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Blue Spiral Notebook */}
    <rect x="6" y="4" width="20" height="25" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
    <rect x="4" y="4" width="5" height="25" fill="#000080" />
    {/* Spirals */}
    <circle cx="5" cy="8" r="1.5" fill="#C0C0C0" stroke="#000000" strokeWidth="0.8" />
    <circle cx="5" cy="14" r="1.5" fill="#C0C0C0" stroke="#000000" strokeWidth="0.8" />
    <circle cx="5" cy="20" r="1.5" fill="#C0C0C0" stroke="#000000" strokeWidth="0.8" />
    <circle cx="5" cy="26" r="1.5" fill="#C0C0C0" stroke="#000000" strokeWidth="0.8" />
    {/* Lined paper */}
    <line x1="12" y1="10" x2="23" y2="10" stroke="#808080" strokeWidth="1" />
    <line x1="12" y1="15" x2="23" y2="15" stroke="#808080" strokeWidth="1" />
    <line x1="12" y1="20" x2="23" y2="20" stroke="#808080" strokeWidth="1" />
    {/* Pencil leaning */}
    <polygon points="18,26 28,12 29,13 19,27" fill="#FFAA00" stroke="#000000" strokeWidth="0.8" />
    <polygon points="18,26 16,29 19,27" fill="#D4D0C8" stroke="#000000" strokeWidth="0.8" />
    <polygon points="16,29 17,28 17.5,28.5" fill="#000000" />
  </svg>
);

// Internet Explorer 4.0 Icon
export const InternetExplorerIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Orbital Gold Ring */}
    <ellipse cx="16" cy="16" rx="14" ry="5" transform="rotate(-30 16 16)" stroke="#FFCC00" strokeWidth="3" />
    {/* Blue 'e' */}
    <path d="M16 6C10.5 6 6 10.5 6 16C6 21.5 10.5 26 16 26C20 26 23.5 23.5 25 20H18C15 20 12 18.5 12 16H26C26 10.5 21.5 6 16 6ZM12 13C12.5 10 14.5 9 16 9C17.5 9 19.5 10 20 13H12Z" fill="#0055CC" stroke="#000080" strokeWidth="1" />
    <path d="M13 10C14 8 16 8 17 8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Recycle Bin (Full of crumpled tissues / nuts)
export const RecycleBinIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Paper sticking out */}
    <path d="M9 7L13 3L16 6L21 4L23 8" stroke="#808080" strokeWidth="1" fill="#FFFFFF" />
    {/* Bin Rim */}
    <ellipse cx="16" cy="8" rx="10" ry="2.5" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
    {/* Bin Mesh Body */}
    <path d="M7 8L10 27H22L25 8" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
    {/* Cross-hatch mesh lines */}
    <line x1="9" y1="12" x2="23" y2="12" stroke="#808080" strokeWidth="1" />
    <line x1="10" y1="17" x2="22" y2="17" stroke="#808080" strokeWidth="1" />
    <line x1="11" y1="22" x2="21" y2="22" stroke="#808080" strokeWidth="1" />
    <line x1="13" y1="8" x2="14" y2="27" stroke="#808080" strokeWidth="1" />
    <line x1="16" y1="8" x2="16" y2="27" stroke="#808080" strokeWidth="1" />
    <line x1="19" y1="8" x2="18" y2="27" stroke="#808080" strokeWidth="1" />
    {/* Recycle logo */}
    <text x="12" y="19" fill="#008000" fontSize="8" fontWeight="bold">♻</text>
  </svg>
);

// Display Settings / Control Panel
export const DisplaySettingsIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Monitor */}
    <rect x="4" y="4" width="24" height="18" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
    <rect x="7" y="7" width="18" height="12" fill="#000000" stroke="#000000" strokeWidth="1" />
    {/* Color Palette on Screen */}
    <rect x="8" y="8" width="5" height="5" fill="#FF0000" />
    <rect x="13" y="8" width="5" height="5" fill="#00FF00" />
    <rect x="18" y="8" width="6" height="5" fill="#0000FF" />
    <rect x="8" y="13" width="5" height="5" fill="#FFFF00" />
    <rect x="13" y="13" width="5" height="5" fill="#FF00FF" />
    <rect x="18" y="13" width="6" height="5" fill="#00FFFF" />
    {/* Stand */}
    <rect x="13" y="22" width="6" height="3" fill="#808080" />
    <rect x="10" y="25" width="12" height="3" fill="#C0C0C0" stroke="#000000" strokeWidth="1" />
  </svg>
);

// I FOLDED (BSOD Trigger / Skull / Defeat)
export const FoldedWarningIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Hazard Triangle */}
    <polygon points="16,3 30,28 2,28" fill="#FFCC00" stroke="#000000" strokeWidth="1.5" />
    <polygon points="16,7 26,26 6,26" fill="#FFEE55" />
    {/* Skull or Exclamation */}
    <circle cx="16" cy="14" r="4.5" fill="#000000" />
    <rect x="14" y="17" width="4" height="3" fill="#000000" />
    <circle cx="14.5" cy="13.5" r="1" fill="#FFEE55" />
    <circle cx="17.5" cy="13.5" r="1" fill="#FFEE55" />
    <circle cx="16" cy="23.5" r="1.5" fill="#000000" />
  </svg>
);

// Volume Speaker Icon
export const VolumeIcon: React.FC<{ size?: number; muted?: boolean; className?: string }> = ({ size = 16, muted = false, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Speaker cone */}
    <path d="M2 5H5L9 2V14L5 11H2V5Z" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
    <path d="M3 6H5V10H3V6Z" fill="#FFFF77" />
    {!muted ? (
      <>
        {/* Sound waves */}
        <path d="M11 5C12 6.5 12 9.5 11 11" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M13 3C15 5.5 15 10.5 13 13" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ) : (
      <>
        {/* Red X Mute */}
        <line x1="10" y1="5" x2="15" y2="11" stroke="#FF0000" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="5" x2="10" y2="11" stroke="#FF0000" strokeWidth="1.5" strokeLinecap="round" />
      </>
    )}
  </svg>
);

// Dual Network Monitor Icon (Tray)
export const NetworkIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Top monitor */}
    <rect x="2" y="1" width="8" height="6" fill="#C0C0C0" stroke="#000000" strokeWidth="0.8" />
    <rect x="3" y="2" width="6" height="4" fill="#00AA00" />
    {/* Bottom right monitor */}
    <rect x="6" y="7" width="8" height="6" fill="#C0C0C0" stroke="#000000" strokeWidth="0.8" />
    <rect x="7" y="8" width="6" height="4" fill="#00AA00" />
  </svg>
);

// Classic Dialog Icons
export const ErrorStopIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="16" cy="16" r="14" fill="#CC0000" stroke="#000000" strokeWidth="1" />
    <circle cx="16" cy="16" r="13" stroke="#FFAAAA" strokeWidth="1" />
    <line x1="10" y1="10" x2="22" y2="22" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="square" />
    <line x1="22" y1="10" x2="10" y2="22" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="square" />
  </svg>
);

export const WarningExclamationIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polygon points="16,2 30,28 2,28" fill="#FFCC00" stroke="#000000" strokeWidth="1" />
    <line x1="16" y1="10" x2="16" y2="19" stroke="#000000" strokeWidth="3" strokeLinecap="square" />
    <circle cx="16" cy="24" r="1.8" fill="#000000" />
  </svg>
);

export const InfoBalloonIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="16" cy="16" r="14" fill="#0000AA" stroke="#000000" strokeWidth="1" />
    <circle cx="16" cy="16" r="13" stroke="#8888FF" strokeWidth="1" />
    <circle cx="16" cy="10" r="2" fill="#FFFFFF" />
    <line x1="16" y1="14" x2="16" y2="23" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="square" />
  </svg>
);

// Emergency Urge Media Player Icon
export const EmergencyPlayerIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Media Player Chassis */}
    <rect x="2" y="4" width="28" height="24" fill="#D4D0C8" stroke="#000000" strokeWidth="1" />
    <rect x="3" y="5" width="26" height="1" fill="#FFFFFF" />
    <rect x="3" y="5" width="1" height="22" fill="#FFFFFF" />
    <rect x="28" y="6" width="1" height="21" fill="#808080" />
    {/* Dark screen frame */}
    <rect x="5" y="7" width="22" height="13" fill="#000000" stroke="#808080" strokeWidth="1" />
    {/* Green play triangle inside screen */}
    <polygon points="13,10 20,13.5 13,17" fill="#00FF00" />
    {/* Red siren / emergency badge on bottom right */}
    <circle cx="23" cy="22" r="5" fill="#CC0000" stroke="#000000" strokeWidth="1" />
    <circle cx="23" cy="22" r="4" stroke="#FFAAAA" strokeWidth="0.5" />
    <rect x="22" y="19" width="2" height="4" fill="#FFFFFF" />
    <circle cx="23" cy="25" r="0.75" fill="#FFFFFF" />
    {/* Controls strip */}
    <rect x="5" y="22" width="12" height="3" fill="#808080" />
    <rect x="7" y="23" width="2" height="1" fill="#000000" />
    <rect x="11" y="23" width="2" height="1" fill="#000000" />
  </svg>
);

// User Profile / Network Logon Icon
export const UserAccountIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Identity Card Frame */}
    <rect x="3" y="4" width="26" height="24" rx="1" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
    <rect x="4" y="5" width="24" height="6" fill="#000080" />
    <circle cx="16" cy="15" r="4" fill="#808080" />
    <path d="M9 25C9 21.5 12 20 16 20C20 20 23 21.5 23 25" fill="#808080" />
    {/* Golden Key Badge */}
    <circle cx="24" cy="10" r="3" fill="#DDAA00" stroke="#000000" strokeWidth="0.5" />
    <rect x="23" y="10" width="6" height="2" fill="#DDAA00" />
    <rect x="27" y="12" width="2" height="2" fill="#DDAA00" />
  </svg>
);
