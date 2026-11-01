import React from 'react';

interface DesktopIconProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  title,
  icon,
  isSelected,
  onClick,
  onDoubleClick
}) => {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`desktop-icon group flex flex-col items-center justify-start w-[76px] p-1.5 cursor-default select-none transition-none rounded-none text-center ${
        isSelected ? 'bg-blue-900/30' : 'hover:bg-white/10'
      }`}
    >
      {/* 32x32 Icon Container */}
      <div className={`w-8 h-8 flex items-center justify-center mb-1 filter drop-shadow-sm ${
        isSelected ? 'opacity-90 contrast-125' : ''
      }`}>
        {icon}
      </div>

      {/* Label with authentic Windows 98 highlight */}
      <span
        className={`text-[11px] leading-tight px-1 py-[1px] break-words line-clamp-2 max-w-[72px] ${
          isSelected
            ? 'bg-[#000080] text-white border border-dotted border-white/80'
            : 'text-white drop-shadow-[1px_1px_1px_#000000]'
        }`}
        style={{
          textShadow: isSelected ? 'none' : '1px 1px 1px #000, 0 0 2px #000'
        }}
      >
        {title}
      </span>
    </div>
  );
};
