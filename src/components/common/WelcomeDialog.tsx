import React, { useState } from 'react';
import { sound } from '../../audio/soundEngine';
import { backgroundMusic } from '../../audio/backgroundMusic';
import { WindowsFlagIcon } from '../icons/PixelIcons';

export const WelcomeDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('ihn_welcome_completed');
    } catch {
      return true;
    }
  });

  if (!isOpen) return null;

  const handleSelectOption = async () => {
    // Play retro button click sound
    sound.playClick();

    // Mark welcome completed in LocalStorage (we do NOT save the specific answer per requirements)
    try {
      localStorage.setItem('ihn_welcome_completed', 'true');
    } catch {}

    // Dismiss dialog
    setIsOpen(false);

    // Start background music at 20% volume directly from user gesture
    await backgroundMusic.startFromUserGesture();
  };

  return (
    <div 
      className="fixed inset-0 z-[12000] bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4 select-none animate-fadeIn"
      style={{ animationDuration: '0.2s' }}
    >
      <div 
        className="w98-window bg-[#c0c0c0] shadow-2xl border-2 border-t-white border-l-white border-b-black border-r-black max-w-md w-full text-black flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="w98-titlebar bg-[#000080] flex justify-between items-center px-2 py-1 font-bold text-white text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <WindowsFlagIcon size={14} />
            <span className="tracking-wide">WELCOME TO IHAVENTNUTTED</span>
          </div>
          <button 
            type="button"
            onClick={handleSelectOption}
            className="w98-btn px-1.5 py-0.5 text-xs leading-none bg-[#c0c0c0] text-black font-bold border border-t-white border-l-white border-b-black border-r-black cursor-pointer hover:bg-gray-200"
            title="Close Welcome Dialog"
          >
            ✕
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-4 space-y-4">
          {/* Header Banner */}
          <div className="flex items-start gap-3 bg-white p-3 w98-inset">
            <div className="shrink-0 p-1.5 bg-[#000080] text-white flex items-center justify-center text-xl shadow-sm border border-t-white border-l-white border-b-black border-r-black">
              🕊️
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-sm text-[#000080] leading-snug">
                Welcome to the No Fap Community
              </h2>
              <p className="text-[11px] text-gray-700 leading-normal">
                A community for everyone. Stay strong, support each other.
              </p>
            </div>
          </div>

          {/* Community Inclusivity Question Fieldset */}
          <div className="border border-gray-400 p-3 bg-[#dfdfdf] space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
              <span>💬</span>
              <span>Community Question:</span>
            </div>
            
            <p className="text-[12px] font-semibold text-gray-900 px-0.5">
              "Do you support lesbian people?"
            </p>

            {/* Three Response Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleSelectOption}
                className="w98-btn py-2 px-3 text-left font-bold text-xs bg-[#c0c0c0] text-black hover:bg-blue-100 active:bg-blue-200 border-2 border-t-white border-l-white border-b-black border-r-black flex items-center justify-between group cursor-pointer"
              >
                <span>YES, ABSOLUTELY</span>
                <span className="opacity-0 group-hover:opacity-100 text-[#000080]">↵</span>
              </button>

              <button
                type="button"
                onClick={handleSelectOption}
                className="w98-btn py-2 px-3 text-left font-bold text-xs bg-[#c0c0c0] text-black hover:bg-blue-100 active:bg-blue-200 border-2 border-t-white border-l-white border-b-black border-r-black flex items-center justify-between group cursor-pointer"
              >
                <span>NO</span>
                <span className="opacity-0 group-hover:opacity-100 text-[#000080]">↵</span>
              </button>

              <button
                type="button"
                onClick={handleSelectOption}
                className="w98-btn py-2 px-3 text-left font-bold text-xs bg-[#c0c0c0] text-black hover:bg-blue-100 active:bg-blue-200 border-2 border-t-white border-l-white border-b-black border-r-black flex items-center justify-between group cursor-pointer"
              >
                <span>PREFER NOT TO SAY</span>
                <span className="opacity-0 group-hover:opacity-100 text-[#000080]">↵</span>
              </button>
            </div>
          </div>

          {/* Windows 98 Footer Note */}
          <div className="flex items-center justify-between text-[10px] text-gray-600 px-1 font-mono">
            <span>IHAVENTNUTTED 98 • WILLPOWER CORE</span>
            <span>PRESS ANY OPTION TO ENTER</span>
          </div>
        </div>
      </div>
    </div>
  );
};
