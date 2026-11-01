import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useOS } from '../../context/OSContext';

export const BSOD: React.FC = () => {
  const { resetAfterBSOD, dismissNotification } = useOS();
  const screenRef = useRef<HTMLDivElement>(null);

  // Trigger glitch / CRT flash on mount
  useGSAP(() => {
    gsap.fromTo(screenRef.current, 
      { opacity: 0, scaleY: 0.1 },
      { opacity: 1, scaleY: 1, duration: 0.25, ease: 'power4.out' }
    );
  }, { scope: screenRef });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissNotification();
        resetAfterBSOD();
      } else {
        resetAfterBSOD();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetAfterBSOD, dismissNotification]);

  return (
    <div 
      ref={screenRef}
      className="fixed inset-0 z-[100000] bg-[#0000AA] text-white select-none flex flex-col justify-center items-center p-8 cursor-pointer"
      style={{ fontFamily: '"Courier New", Courier, monospace' }}
      onClick={resetAfterBSOD}
    >
      <div className="max-w-3xl w-full">
        {/* Title bar banner */}
        <div className="text-center mb-8">
          <span className="bg-[#A8A8A8] text-[#0000AA] font-bold px-4 py-1 text-lg uppercase tracking-wider inline-block">
            IHAVENTNUTTED FATAL EXCEPTION
          </span>
        </div>

        <div className="text-base leading-relaxed space-y-4">
          <p>
            A fatal exception 0E has occurred at 0028:C0011E36 in VXD NUTGUARD(01) + 00010E36. 
            The current biological containment protocol was terminated due to catastrophic dopamine collapse.
          </p>

          <p className="text-yellow-300 font-bold">
            ERROR CODE: 0x00000069 [TEMPTATION_OVERFLOW_EXCEPTION]
          </p>

          <div className="border border-white/30 p-4 bg-[#000080]/50 my-6 space-y-2">
            <p>System Diagnostic Details:</p>
            <p>* Physical Willpower: 0% [DEPLETED]</p>
            <p>* Incognito Tabs Detected: 1</p>
            <p>* Excuses Formulated: "It doesn't count if it's the weekend"</p>
            <p>* Ancestral Disappointment Index: MAXIMUM</p>
          </div>

          <p className="mt-8">
            * Press any key or CLICK ANYWHERE to restart the system and reset streak to Day 0.
          </p>
          <p>
            * You will be returned to the desktop where your shame will be archived in the Event Viewer.
          </p>
        </div>

        <div className="mt-12 text-center text-sm text-sky-300 animate-pulse">
          [ Click anywhere or press any key to reboot system ]
        </div>
      </div>
    </div>
  );
};
