import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useOS } from '../../context/OSContext';
import { InfoBalloonIcon, WarningExclamationIcon, ErrorStopIcon } from '../icons/PixelIcons';

export const NotificationBalloon: React.FC = () => {
  const { notification, dismissNotification } = useOS();
  const balloonRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (notification && balloonRef.current) {
      gsap.fromTo(balloonRef.current,
        { opacity: 0, y: 15, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'back.out(1.7)' }
      );
    }
  }, { scope: balloonRef, dependencies: [notification] });

  if (!notification) return null;

  const renderIcon = () => {
    switch (notification.type) {
      case 'warning': return <WarningExclamationIcon size={20} />;
      case 'error': return <ErrorStopIcon size={20} />;
      default: return <InfoBalloonIcon size={20} />;
    }
  };

  return (
    <div
      ref={balloonRef}
      style={{
        boxShadow: '2px 2px 5px rgba(0,0,0,0.4)',
        backgroundColor: '#ffffe1',
        border: '1px solid #000000'
      }}
      className="fixed bottom-[34px] right-4 z-[99999] max-w-[280px] p-2.5 text-[#000000] select-none text-[11px]"
    >
      {/* Balloon Header */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-400 pb-1 mb-1.5">
        <div className="flex items-center gap-1.5 font-bold">
          {renderIcon()}
          <span>{notification.title}</span>
        </div>
        <button
          onClick={dismissNotification}
          className="text-gray-600 hover:text-black font-bold text-xs px-1"
          title="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Balloon Message */}
      <div className="text-[11px] leading-tight text-gray-800">
        {notification.message}
      </div>

      {/* Bottom pointing triangle arrow toward tray */}
      <div
        className="absolute -bottom-2 right-8 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid #ffffe1'
        }}
      />
    </div>
  );
};
