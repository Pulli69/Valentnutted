import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useOS } from '../../context/OSContext';
import { sound } from '../../audio/soundEngine';
import { WindowsFlagIcon } from '../icons/PixelIcons';

export const BootSequence: React.FC = () => {
  const { finishBoot, systemSettings } = useOS();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [bootStep, setBootStep] = useState<number>(0);
  const [logLines, setLogLines] = useState<string[]>([]);

  useEffect(() => {
    // Stage 1: BIOS Memory & Hardware Check lines
    const logs = [
      'Award Modular BIOS v4.51PG, An Energy Star Ally',
      'Copyright (C) 1984-98, Award Software, Inc.',
      '',
      'IHAVENTNUTTED WILLPOWER MOTHERBOARD V98.4',
      'CPU: Genuine Intel Pentium(R) II MMX 450MHz',
      'Memory Test : 131072K OK',
      '',
      'Primary Master   : WD 40GB NO_NUT_SYSTEM',
      'Primary Slave    : ATAPI CD-ROM 52X',
      'Secondary Master : PURITY SHIELD HARDWARE ACCELERATOR',
      '',
      'Detecting Plug and Play Devices...',
      'NutGuard 98 Protection Kernel Loaded: PASS',
      'Anti-Simp Firewall Daemon: ONLINE',
      'Starting Microsoft Windows 98...'
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < logs.length) {
        setLogLines(prev => [...prev, logs[current]]);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBootStep(1), 700); // Transition to Windows 98 Splash
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  useGSAP(() => {
    if (bootStep === 1) {
      if (systemSettings.soundEnabled) {
        sound.playStartup();
      }

      // Marching progress bar animation
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: finishBoot
          });
        }
      });

      tl.to(progressBarRef.current, {
        width: '100%',
        duration: 2.8,
        ease: 'steps(24)'
      });
    }
  }, { scope: containerRef, dependencies: [bootStep] });

  const handleSkip = () => {
    if (systemSettings.soundEnabled) {
      sound.playStartup();
    }
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: finishBoot
    });
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleSkip}
      className="fixed inset-0 z-[99999] bg-black text-white font-mono select-none cursor-pointer flex flex-col justify-between p-6"
      style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
    >
      {bootStep === 0 ? (
        // BIOS Screen
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-white font-bold text-base">IHAVENTNUTTED BIOS v4.51PG</div>
                <div className="text-gray-400 text-xs">EPA POLLUTION PREVENTER ALLY</div>
              </div>
              <div className="border-2 border-yellow-400 p-2 text-center text-xs text-yellow-300">
                <div className="font-bold">ENERGY STAR</div>
                <div className="text-[10px]">WILLPOWER CERTIFIED</div>
              </div>
            </div>

            <div className="space-y-1 text-xs text-gray-200">
              {logLines.map((line, idx) => (
                <div key={idx} className="min-h-[14px] leading-tight">{line}</div>
              ))}
              <span className="inline-block w-2 h-4 bg-white animate-pulse" />
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 pb-2">
            Click anywhere or press any key to skip boot sequence [Instant Start]
          </div>
        </div>
      ) : (
        // Windows 98 Splash Screen
        <div className="flex-1 flex flex-col items-center justify-center bg-[#000080]">
          <div className="w-full max-w-lg p-8 flex flex-col items-center">
            {/* Windows 98 Logo & Branding */}
            <div className="flex items-center gap-4 mb-6">
              <WindowsFlagIcon size={56} />
              <div>
                <div className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[2px_2px_0px_#000]">
                  Microsoft<span className="text-yellow-400">®</span>
                </div>
                <div className="text-5xl font-black tracking-tight text-white drop-shadow-[2px_2px_0px_#000]">
                  IHAVENTNUTTED <span className="text-sky-300">98</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-cyan-200 italic mb-8 tracking-wider">
              No Nut November Edition • Built for Pure Willpower
            </div>

            {/* Authentic Windows 98 Marching Progress Bar */}
            <div className="w-64 h-4 bg-black border border-gray-400 p-[2px] shadow-inner mb-4">
              <div 
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-500 w-0"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #00d2ff, #00d2ff 6px, #000 6px, #000 9px)'
                }}
              />
            </div>

            <div className="text-[11px] text-gray-300 animate-pulse">
              Starting operating system... Click anywhere to bypass
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
