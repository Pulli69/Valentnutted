import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { sound } from '../../audio/soundEngine';
import { UrgeHotlineIcon } from '../icons/PixelIcons';

export const UrgeHotlineApp: React.FC = () => {
  const { recordUrgeResisted, openWindow } = useOS();
  const [panicMode, setPanicMode] = useState<boolean>(false);
  const [pushupCount, setPushupCount] = useState<number>(0);
  const [breathePhase, setBreathePhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breatheTimer, setBreatheTimer] = useState<number>(4);

  // Tactical breathing loop
  useEffect(() => {
    const timer = setInterval(() => {
      setBreatheTimer(prev => {
        if (prev <= 1) {
          if (breathePhase === 'Inhale') {
            setBreathePhase('Hold');
            return 7;
          } else if (breathePhase === 'Hold') {
            setBreathePhase('Exhale');
            return 8;
          } else {
            setBreathePhase('Inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [breathePhase]);

  const handlePanicClick = () => {
    sound.playCritical();
    setPanicMode(true);
    recordUrgeResisted();
    setTimeout(() => setPanicMode(false), 3000);
  };

  return (
    <div className={`flex-1 flex flex-col justify-between text-[11px] h-full bg-[#c0c0c0] p-2 select-none ${
      panicMode ? 'bg-red-200 animate-pulse' : ''
    }`}>
      {/* Header Banner */}
      <div className="w98-inset p-2 bg-[#ffffff] flex items-center gap-2 mb-2">
        <UrgeHotlineIcon size={32} />
        <div>
          <div className="font-bold text-[12px] text-red-700">
            EMERGENCY URGE HOTLINE & CRISIS WIZARD
          </div>
          <div className="text-gray-600 text-[10px]">
            Direct neurological intervention for intense dopamine cravings
          </div>
        </div>
      </div>

      {/* Main Panic Button */}
      <div className="w98-outset p-3 bg-[#c0c0c0] flex flex-col items-center justify-center my-1 text-center">
        <span className="font-bold text-gray-800 mb-2">
          EXPERIENCING AN UNBEARABLE TEMPTATION?
        </span>
        <button
          onClick={handlePanicClick}
          className="w98-btn py-3 px-8 bg-red-600 text-white font-black text-sm tracking-widest shadow-lg hover:bg-red-700 active:scale-95"
        >
          🚨 PANIC: CRUSH THE URGE NOW 🚨
        </button>
        <span className="text-[10px] text-gray-600 mt-2">
          Clicking instantly registers +1 Urge Resisted in your system telemetry
        </span>
      </div>

      {/* 4-7-8 Tactical Breathing Visualizer */}
      <div className="w98-inset p-2 bg-[#dfdfdf] my-1">
        <div className="font-bold text-[#000080] mb-1">
          TACTICAL NERVOUS SYSTEM OVERRIDE (4-7-8 Breathing):
        </div>
        <div className="flex items-center justify-between px-4 py-2 bg-white border border-gray-400">
          <div>
            <div className="text-sm font-bold text-red-900 uppercase">
              Phase: {breathePhase}
            </div>
            <div className="text-[10px] text-gray-600">
              {breathePhase === 'Inhale' && 'Deep breath through the nose (4 seconds)'}
              {breathePhase === 'Hold' && 'Hold breath tightly. Starve the impulse (7 seconds)'}
              {breathePhase === 'Exhale' && 'Slow whoosh exhale through mouth (8 seconds)'}
            </div>
          </div>
          <div className="w98-led-counter text-2xl font-bold px-3 py-1">
            0{breatheTimer}
          </div>
        </div>
      </div>

      {/* Emergency Pushup Counter */}
      <div className="w98-outset p-2 bg-[#c0c0c0] flex items-center justify-between my-1">
        <div>
          <div className="font-bold text-gray-800">EMERGENCY PHYSICAL EXHAUSTION:</div>
          <div className="text-[10px] text-gray-600">Blood diverted to muscles cannot sustain temptation.</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPushupCount(c => c + 10);
              sound.playClick();
            }}
            className="w98-btn px-3 py-1 font-bold"
          >
            +10 Pushups Done ({pushupCount})
          </button>
        </div>
      </div>

      {/* Quick Distraction Shortcuts */}
      <div className="flex justify-between items-center pt-1 border-t border-gray-400">
        <button
          onClick={() => openWindow('nut-sweeper')}
          className="w98-btn px-3 py-1 text-[11px] font-semibold"
        >
          💣 Distract with NutSweeper
        </button>
        <button
          onClick={() => openWindow('confession-notes')}
          className="w98-btn px-3 py-1 text-[11px] font-semibold"
        >
          📝 Write in Confession Log
        </button>
      </div>
    </div>
  );
};
