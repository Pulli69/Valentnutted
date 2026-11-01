import React, { useCallback } from 'react';
import { OSProvider } from './context/OSContext';
import { useOS } from './context/useOS';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { Desktop } from './components/desktop/Desktop';
import { WindowFrame } from './components/window/WindowFrame';
import { Taskbar } from './components/taskbar/Taskbar';
import { StartMenu } from './components/taskbar/StartMenu';
import { BSOD } from './components/bsod/BSOD';
import { BootSequence } from './components/boot/BootSequence';
import { NotificationBalloon } from './components/notifications/NotificationBalloon';
import { DesktopChatPreview } from './components/desktop/DesktopChatPreview';
import { FoldConfirmDialog } from './components/common/FoldConfirmDialog';
import { CascadingCrashAnimation } from './components/common/CascadingCrashAnimation';
import { sound } from './audio/soundEngine';
import type { PublicChatMessage } from './lib/supabase';

// Applications
import { StreakTrackerApp } from './components/apps/StreakTrackerApp';
import { GlobalChatApp } from './components/apps/GlobalChatApp';
import { LeaderboardApp } from './components/apps/LeaderboardApp';
import { UrgeHotlineApp } from './components/apps/UrgeHotlineApp';
import { NutSweeperApp } from './components/apps/NutSweeperApp';
import { ConfessionNotepadApp } from './components/apps/ConfessionNotepadApp';
import { InternetExplorerApp } from './components/apps/InternetExplorerApp';
import { DisplaySettingsApp } from './components/apps/DisplaySettingsApp';
import { RecycleBinApp } from './components/apps/RecycleBinApp';
import { MyComputerApp } from './components/apps/MyComputerApp';
import { EmergencyPlayerApp } from './components/apps/EmergencyPlayerApp';
import { UserAccountApp } from './components/apps/UserAccountApp';
import type { WindowInstance } from './types/os';

function renderAppContent(win: WindowInstance) {
  switch (win.appId) {
    case 'streak-tracker':
      return <StreakTrackerApp />;
    case 'global-chat':
      return <GlobalChatApp />;
    case 'leaderboard':
      return <LeaderboardApp />;
    case 'urge-hotline':
      return <UrgeHotlineApp />;
    case 'nut-sweeper':
      return <NutSweeperApp />;
    case 'confession-notes':
      return <ConfessionNotepadApp />;
    case 'internet-explorer':
      return <InternetExplorerApp />;
    case 'display-settings':
      return <DisplaySettingsApp />;
    case 'recycle-bin':
      return <RecycleBinApp />;
    case 'my-computer':
      return <MyComputerApp />;
    case 'emergency-player':
      return <EmergencyPlayerApp />;
    case 'user-account':
      return <UserAccountApp />;
    default:
      return (
        <div className="p-4 text-center text-gray-700">
          Application window for {win.appId}
        </div>
      );
  }
}

const OSDesktop: React.FC = () => {
  const { isBooting, showBSOD, showCascadingCrash, finishCascadingCrash, windows } = useOS();

  if (showBSOD) {
    return <BSOD />;
  }

  if (isBooting) {
    return <BootSequence />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#008080]">
      {/* Windows 98 Desktop Area & Icons */}
      <Desktop />

      {/* Persistent Desktop Chat Preview Widget (Visible by default on desktop) */}
      <DesktopChatPreview />

      {/* Active Windows */}
      {windows.map((win) => (
        <WindowFrame key={win.id} window={win}>
          {renderAppContent(win)}
        </WindowFrame>
      ))}

      {/* Relapse Confirmation Modal Dialog */}
      <FoldConfirmDialog />

      {/* Cascading Crash Error Waterfall Dialogs */}
      {showCascadingCrash && (
        <CascadingCrashAnimation onFinished={finishCascadingCrash} />
      )}

      {/* Start Menu */}
      <StartMenu />

      {/* Balloon Notification */}
      <NotificationBalloon />

      {/* Bottom Taskbar */}
      <Taskbar />
    </div>
  );
};

const DesktopWithChatProvider: React.FC = () => {
  const { systemSettings, showNotification } = useOS();

  const handleIncomingChatMessage = useCallback((msg: PublicChatMessage) => {
    // Live notification balloon if enabled in settings
    if (systemSettings.chatNotifications) {
      const preview = msg.message.length > 55 ? msg.message.slice(0, 52) + '...' : msg.message;
      showNotification(`💬 <${msg.username}>`, preview, 'info');
    }
    // Notification sound if sound enabled
    if (systemSettings.soundEnabled) {
      sound.playNotification();
    }
  }, [systemSettings.chatNotifications, systemSettings.soundEnabled, showNotification]);

  return (
    <ChatProvider onIncomingMessage={handleIncomingChatMessage}>
      <OSDesktop />
    </ChatProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <OSProvider>
        <DesktopWithChatProvider />
      </OSProvider>
    </AuthProvider>
  );
}
