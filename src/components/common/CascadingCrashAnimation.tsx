import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { sound } from '../../audio/soundEngine';

interface CrashWindowData {
  id: number;
  title: string;
  message: string;
  code: string;
  xOffset: number;
  yOffset: number;
}

const ERROR_TEMPLATES = [
  { title: 'WILLPOWER.EXE - Application Error', message: 'ERROR: DISCIPLINE NOT FOUND AT MEMORY ADDR 0x0040E0', code: '0x00000001' },
  { title: 'NutGuard Security Warning', message: 'WARNING: WILLPOWER.EXE HAS UNEXPECTEDLY STOPPED', code: '0x00000002' },
  { title: 'Fatal Dopamine Exception', message: 'FATAL ERROR: TEMPTATION_OVERFLOW IN KERNEL32.DLL', code: '0x00000069' },
  { title: 'System Willpower Protocol', message: 'SYSTEM FAILURE: STREAK TERMINATED BY USER DISPATCH', code: '0x00000404' },
  { title: 'Biological Kernel Alert', message: 'CRITICAL ERROR: SELF CONTROL NOT DETECTED ON SYSTEM BUS', code: '0x00000005' },
  { title: 'Urge Firewall Breach', message: 'EXCEPTION: RESISTANCE_CIRCUIT_OVERHEAT [COLLAPSED]', code: '0x00000006' },
  { title: 'Discipline Daemon', message: 'FATAL EXCEPTION: ANCESTRAL DISAPPOINTMENT OVERFLOW', code: '0x00000007' },
  { title: 'Willpower Memory Dump', message: 'ERROR: UNABLE TO WRITE PURITY_RECORD.DAT', code: '0x00000008' },
  { title: 'Nut98 Crash Recovery', message: 'ALERT: EMERGENCY FOLD REGISTERED FOR TODAY', code: '0x00000009' },
  { title: 'System Integrity Warning', message: 'CRITICAL: HORMONAL FLOOD EVENT COMPLETE', code: '0x0000000A' },
  { title: 'Kernel Emergency Stop', message: 'HALTING WILLPOWER SERVICES (ERROR 0xDEADBEEF)', code: '0x0000000B' },
  { title: 'Final System Trap', message: 'PREPARING BLUE SCREEN SYSTEM DUMP...', code: '0x0000000C' }
];

const generateCrashWindows = (): CrashWindowData[] => {
  if (typeof window === 'undefined') return [];
  const isMobile = window.innerWidth < 640;
  const count = isMobile ? 8 : 12;

  const startX = isMobile ? 10 : Math.max(20, window.innerWidth * 0.15);
  const startY = isMobile ? 20 : Math.max(30, window.innerHeight * 0.1);
  const stepX = isMobile ? 12 : 28;
  const stepY = isMobile ? 16 : 24;

  const list: CrashWindowData[] = [];
  for (let i = 0; i < count; i++) {
    const template = ERROR_TEMPLATES[i % ERROR_TEMPLATES.length];
    list.push({
      id: i,
      title: template.title,
      message: template.message,
      code: template.code,
      xOffset: startX + (i * stepX) % (window.innerWidth - (isMobile ? 260 : 360)),
      yOffset: startY + (i * stepY) % (window.innerHeight - 200)
    });
  }
  return list;
};

export const CascadingCrashAnimation: React.FC<{
  onFinished: () => void;
}> = ({ onFinished }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowsList] = useState<CrashWindowData[]>(() => generateCrashWindows());
  const finishedRef = useRef(false);

  const handleFinish = React.useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinished();
  }, [onFinished]);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      handleFinish();
      return;
    }

    // Keyboard ESC listener to skip animation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleFinish]);

  // GSAP Staggered Cascading Animation
  useGSAP(() => {
    if (windowsList.length === 0) return;

    const tl = gsap.timeline({
      onComplete: () => {
        // Dramatic delay before BSOD
        setTimeout(() => {
          handleFinish();
        }, 400);
      }
    });

    // Animate each cascading window appearing in quick retro succession
    const domWindows = containerRef.current?.querySelectorAll('.crash-dialog-window');
    if (domWindows && domWindows.length > 0) {
      domWindows.forEach((win, index) => {
        tl.fromTo(
          win,
          { opacity: 0, scale: 0.9, y: '+=10' },
          {
            opacity: 1,
            scale: 1,
            y: '-=10',
            duration: 0.12,
            ease: 'steps(2)',
            onStart: () => {
              // Play intermittent retro error clicks / bells
              if (index % 2 === 0) {
                try {
                  sound.playCritical();
                } catch {}
              }
            }
          },
          index * 0.15 // 150ms progressive stagger
        );
      });
    }

    return () => {
      tl.kill();
    };
  }, { scope: containerRef, dependencies: [windowsList] });

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-black/40 overflow-hidden select-none cursor-not-allowed"
      onClick={handleFinish}
    >
      {/* Cascading Dialog Windows */}
      {windowsList.map((win, idx) => (
        <div
          key={win.id}
          className="crash-dialog-window absolute w98-window p-1 bg-[#c0c0c0] shadow-2xl border-2 border-t-white border-l-white border-b-black border-r-black text-black pointer-events-none"
          style={{
            left: `${win.xOffset}px`,
            top: `${win.yOffset}px`,
            width: window.innerWidth < 640 ? '250px' : '360px',
            zIndex: 1000 + idx
          }}
        >
          {/* Blue Titlebar with close X */}
          <div className="w98-titlebar bg-[#000080] flex justify-between items-center px-1.5 py-0.5 font-bold text-white text-[10px]">
            <span className="truncate">{win.title}</span>
            <span className="w98-btn px-1 text-[9px] leading-none bg-[#c0c0c0] text-black">✕</span>
          </div>

          {/* Dialog Body */}
          <div className="p-2 space-y-2 text-[10.5px]">
            <div className="flex items-start gap-2">
              {/* Classic Windows 98 Critical Error Red Circle X */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white font-black text-base shadow-sm">
                ✕
              </div>
              <div className="space-y-0.5 leading-tight">
                <p className="font-bold text-red-950">{win.message}</p>
                <p className="text-gray-600 font-mono text-[9px]">Code: {win.code}</p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button 
                type="button" 
                className="w98-btn px-4 py-0.5 text-[10px] font-bold bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Retro Skip Button in corner */}
      <div className="absolute bottom-4 right-4 z-[999999] pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="w98-btn px-3 py-1 font-bold text-[11px] bg-red-100 text-red-950 border border-red-700 shadow-xl cursor-pointer"
        >
          [ESC] Skip to Blue Screen ↵
        </button>
      </div>
    </div>
  );
};
