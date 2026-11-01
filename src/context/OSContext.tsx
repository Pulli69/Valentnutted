import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { 
  AppId, 
  WindowInstance, 
  StreakState, 
  ConfessionEntry, 
  ChatMessage, 
  SystemSettings 
} from '../types/os';
import { sound } from '../audio/soundEngine';
import { useAuth } from './useAuth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface OSContextType {
  windows: WindowInstance[];
  activeWindowId: string | null;
  startMenuOpen: boolean;
  systemSettings: SystemSettings;
  streakState: StreakState;
  confessions: ConfessionEntry[];
  chatMessages: ChatMessage[];
  showBSOD: boolean;
  isBooting: boolean;
  showFoldConfirm: boolean;
  showCascadingCrash: boolean;
  notification: { title: string; message: string; type: 'info' | 'warning' | 'error' } | null;
  
  // Actions
  finishCascadingCrash: () => void;
  openWindow: (appId: AppId) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPos: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, w: number, h: number) => void;
  toggleStartMenu: () => void;
  closeStartMenu: () => void;
  toggleSound: () => void;
  setWallpaper: (wallpaper: SystemSettings['wallpaper']) => void;
  toggleCrtFilter: () => void;
  toggleChatNotifications: () => void;
  toggleDesktopChatVisible: () => void;
  finishBoot: () => void;
  restartBoot: () => void;
  checkInToday: () => Promise<boolean>;
  recordUrgeResisted: () => void;
  triggerFolded: () => void;
  setShowFoldConfirm: (show: boolean) => void;
  confirmFold: () => Promise<void>;
  resetAfterBSOD: () => void;
  addConfession: (text: string) => void;
  sendChatMessage: (text: string) => void;
  dismissNotification: () => void;
  showNotification: (title: string, message: string, type?: 'info' | 'warning' | 'error') => void;
  syncStreakFromCloud: () => Promise<void>;
}

export const OSContext = createContext<OSContextType | null>(null);

const DEFAULT_APPS_META: Record<AppId, { title: string; defaultWidth: number; defaultHeight: number; icon: string }> = {
  'streak-tracker': { title: 'IHAVENTNUTTED 98 - Willpower Core', defaultWidth: 460, defaultHeight: 480, icon: 'streak-tracker' },
  'global-chat': { title: 'mIRC v4.2 - #NoNutSurvival [Chat]', defaultWidth: 540, defaultHeight: 420, icon: 'global-chat' },
  'leaderboard': { title: 'Nut Hall of Fame - Leaderboard Explorer', defaultWidth: 580, defaultHeight: 430, icon: 'leaderboard' },
  'urge-hotline': { title: 'Emergency Urge Hotline - CRISIS 98', defaultWidth: 420, defaultHeight: 380, icon: 'urge-hotline' },
  'nut-sweeper': { title: 'NutSweeper 98', defaultWidth: 260, defaultHeight: 340, icon: 'nut-sweeper' },
  'confession-notes': { title: 'Confession Log - Notepad', defaultWidth: 480, defaultHeight: 360, icon: 'confession-notes' },
  'internet-explorer': { title: 'Internet Explorer 4.0 - The Willpower Web', defaultWidth: 620, defaultHeight: 460, icon: 'internet-explorer' },
  'display-settings': { title: 'Display & Sound Properties', defaultWidth: 400, defaultHeight: 390, icon: 'display-settings' },
  'recycle-bin': { title: 'Recycle Bin - Purged Desires', defaultWidth: 450, defaultHeight: 340, icon: 'recycle-bin' },
  'my-computer': { title: 'My Nut PC - Hardware Specs', defaultWidth: 440, defaultHeight: 320, icon: 'my-computer' },
  'emergency-player': { title: 'URGE.exe - Emergency Player', defaultWidth: 540, defaultHeight: 480, icon: 'emergency-player' },
  'user-account': { title: 'Network Logon 98 - User Identity', defaultWidth: 460, defaultHeight: 420, icon: 'user-account' }
};

const INITIAL_CHAT: ChatMessage[] = [
  { id: '1', sender: 'System', text: 'Welcome to #NoNutSurvival on irc.ihaventnutted.net (Port 6667)', time: '12:00', isSystem: true },
  { id: '2', sender: 'PureMind_99', rank: '@', avatarColor: '#000080', text: 'Day 12 here. I can now taste colors and calculate pi to 500 digits.', time: '12:01' },
  { id: '3', sender: 'DownBadDan', rank: '', avatarColor: '#800000', text: 'Guys help, I opened Instagram explore and almost lost it all...', time: '12:02' },
  { id: '4', sender: 'UrgeDestroyer9000', rank: '+', avatarColor: '#008000', text: '@DownBadDan CLOSE THE BROWSER AND GO DO 30 COLD PUSHUPS NOW!', time: '12:02' },
  { id: '5', sender: 'Monk_Dmitri', rank: '@', avatarColor: '#800080', text: 'Remember brothers: The temporary pleasure is not worth the permanent shame.', time: '12:04' }
];

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Load initial streak data from localStorage or default
  const [streakState, setStreakState] = useState<StreakState>(() => {
    try {
      const saved = localStorage.getItem('ihn_streak_state');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      startDate: new Date().toISOString(),
      currentStreakDays: 1,
      lastCheckInDate: null,
      totalCheckIns: 1,
      highestStreak: 1,
      urgesResisted: 3,
      foldedCount: 0,
      todayStatus: 'pending',
      isCloudVerified: false,
      milestones: ['Day 1: The Awakening']
    };
  });

  const [confessions, setConfessions] = useState<ConfessionEntry[]>(() => {
    try {
      const saved = localStorage.getItem('ihn_confessions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', timestamp: 'Day 1 - 09:30 AM', text: 'Started the journey. The keyboard feels heavier today. I deleted 47 browser tabs.' },
      { id: '2', timestamp: 'Day 1 - 04:15 PM', text: 'Ate an entire bowl of raw almonds. They say zinc helps. Need more distractions.' }
    ];
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('ihn_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      wallpaper: 'bliss',
      soundEnabled: false, // Requirement: Muted by default
      crtFilter: false,
      bootSequenceDone: false,
      chatNotifications: true,
      desktopChatVisible: true
    };
  });

  const [isBooting, setIsBooting] = useState<boolean>(!systemSettings.bootSequenceDone);
  const [showBSOD, setShowBSOD] = useState<boolean>(false);
  const [showFoldConfirm, setShowFoldConfirm] = useState<boolean>(false);
  const [showCascadingCrash, setShowCascadingCrash] = useState<boolean>(false);
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [highestZ, setHighestZ] = useState<number>(10);
  const [startMenuOpen, setStartMenuOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [notification, setNotification] = useState<{ title: string; message: string; type: 'info' | 'warning' | 'error' } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ihn_streak_state', JSON.stringify(streakState));
    } catch {}
  }, [streakState]);

  useEffect(() => {
    try {
      localStorage.setItem('ihn_confessions', JSON.stringify(confessions));
    } catch {}
  }, [confessions]);

  useEffect(() => {
    try {
      localStorage.setItem('ihn_settings', JSON.stringify(systemSettings));
    } catch {}
  }, [systemSettings]);

  const showNotification = useCallback((
    title: string, 
    message: string, 
    type: 'info' | 'warning' | 'error' = 'info'
  ) => {
    setNotification({ title, message, type });
  }, []);

  // Synchronize Authoritative Streak from Supabase
  const syncStreakFromCloud = useCallback(async () => {
    const client = supabase;
    if (!client || !isSupabaseConfigured || !user) return;

    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      // Attempt to call RPC 02
      const { data, error } = await client.rpc('rpc_get_streak_status', { p_timezone: userTz });

      if (!error && data && data.authenticated && data.has_profile) {
        setStreakState(prev => ({
          ...prev,
          currentStreakDays: data.current_streak,
          highestStreak: data.highest_streak,
          todayStatus: data.today_status,
          todayDate: data.today_date,
          timezone: data.timezone,
          challengeJoinedDate: data.challenge_joined_date,
          foldedCount: data.folded_count ?? prev.foldedCount,
          history: data.history || [],
          missedDaysCount: data.missed_days_count || 0,
          isCloudVerified: true
        }));
        return;
      }

      // Graceful fallback if Migration 02 is not yet applied in Supabase:
      // Query raw profiles & check_ins tables
      const { data: pData } = await client
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const { data: cData } = await client
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id);

      if (pData) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCheckIn = cData?.find(c => c.check_in_date === todayStr);

        setStreakState(prev => ({
          ...prev,
          currentStreakDays: pData.current_streak,
          highestStreak: pData.highest_streak,
          todayStatus: todayCheckIn ? (todayCheckIn.status === 'folded' ? 'folded' : 'holding') : 'pending',
          todayDate: todayStr,
          isCloudVerified: true,
          history: cData || []
        }));
      }
    } catch (err) {
      console.warn('Authoritative streak sync:', err);
    }
  }, [user]);

  // Sync on mount and whenever user identity changes
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        syncStreakFromCloud();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, syncStreakFromCloud]);

  const openWindow = (appId: AppId) => {
    const meta = DEFAULT_APPS_META[appId];
    if (!meta) return;

    setWindows(prev => {
      const existing = prev.find(w => w.appId === appId);
      if (existing) {
        const nextZ = highestZ + 1;
        setHighestZ(nextZ);
        setActiveWindowId(existing.id);
        return prev.map(w => 
          w.id === existing.id 
            ? { ...w, isMinimized: false, zIndex: nextZ } 
            : w
        );
      }

      const nextZ = highestZ + 1;
      setHighestZ(nextZ);

      // Cascading window positioning
      const cascadeOffset = (prev.length % 6) * 24;
      const initialX = Math.min(Math.max(10, 40 + cascadeOffset), window.innerWidth - meta.defaultWidth - 20);
      const initialY = Math.min(Math.max(10, 40 + cascadeOffset), window.innerHeight - meta.defaultHeight - 50);

      const newWindow: WindowInstance = {
        id: `${appId}-${Date.now()}`,
        appId,
        title: meta.title,
        icon: meta.icon,
        isMinimized: false,
        isMaximized: false,
        zIndex: nextZ,
        x: initialX,
        y: initialY,
        width: Math.min(meta.defaultWidth, window.innerWidth - 20),
        height: Math.min(meta.defaultHeight, window.innerHeight - 60),
        allowMaximize: true
      };

      setActiveWindowId(newWindow.id);
      return [...prev, newWindow];
    });

    sound.playClick();
    closeStartMenu();
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
    sound.playClick();
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
    sound.playClick();
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    sound.playClick();
  };

  const focusWindow = (id: string) => {
    const nextZ = highestZ + 1;
    setHighestZ(nextZ);
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w));
  };

  const updateWindowPos = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  };

  const updateWindowSize = (id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  };

  const toggleStartMenu = () => {
    setStartMenuOpen(prev => !prev);
    sound.playClick();
  };

  const closeStartMenu = () => {
    setStartMenuOpen(false);
  };

  const toggleSound = () => {
    setSystemSettings(prev => {
      const nextSound = !prev.soundEnabled;
      sound.setEnabled(nextSound);
      return { ...prev, soundEnabled: nextSound };
    });
  };

  const setWallpaper = (wallpaper: SystemSettings['wallpaper']) => {
    setSystemSettings(prev => ({ ...prev, wallpaper }));
    sound.playClick();
  };

  const toggleCrtFilter = () => {
    setSystemSettings(prev => ({ ...prev, crtFilter: !prev.crtFilter }));
    sound.playClick();
  };

  const toggleChatNotifications = () => {
    setSystemSettings(prev => ({ ...prev, chatNotifications: !prev.chatNotifications }));
    sound.playClick();
  };

  const toggleDesktopChatVisible = () => {
    setSystemSettings(prev => ({ ...prev, desktopChatVisible: !prev.desktopChatVisible }));
    sound.playClick();
  };

  const finishBoot = () => {
    setIsBooting(false);
    setSystemSettings(prev => ({ ...prev, bootSequenceDone: true }));
    sound.playStartup();
  };

  const restartBoot = () => {
    setShowBSOD(false);
    setIsBooting(true);
    sound.playClick();
  };

  // Authoritative Check-In Method
  const checkInToday = async (): Promise<boolean> => {
    const client = supabase;
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    // 1. Authoritative Cloud check-in if logged in and Supabase is configured
    if (client && isSupabaseConfigured && user) {
      try {
        const { data, error } = await client.rpc('rpc_check_in', { p_timezone: localTz });

        if (error) {
          sound.playError();
          // Extract user-friendly error message from Postgres RAISE EXCEPTION
          const cleanMsg = error.message.replace(/^.*EXCEPTION:\s*/, '');
          showNotification('CHECK-IN REJECTED', cleanMsg, 'warning');
          return false;
        }

        if (data && data.success) {
          sound.playStamp();
          setStreakState(prev => ({
            ...prev,
            currentStreakDays: data.current_streak,
            highestStreak: data.highest_streak,
            todayStatus: 'holding',
            todayDate: data.check_in_date,
            timezone: data.timezone,
            isCloudVerified: true
          }));

          showNotification(
            'WILLPOWER VERIFIED (CLOUD)',
            `Verified Day ${data.current_streak} check-in registered! Next check-in eligible tomorrow.`,
            'info'
          );

          syncStreakFromCloud();
          return true;
        }
      } catch (err: unknown) {
        // Fallback for pre-migration state
        console.warn('Pre-migration check-in fallback notice:', err);
        const todayDate = new Date().toISOString().split('T')[0];
        const dayNum = Math.min(30, Math.max(1, new Date().getDate()));
        const { error: insErr } = await client
          .from('check_ins')
          .insert({
            user_id: user.id,
            day_number: dayNum,
            check_in_date: todayDate
          });

        if (insErr) {
          sound.playError();
          showNotification('ALREADY VERIFIED', 'You have already checked in for today!', 'warning');
          return false;
        }

        const nextStreak = streakState.currentStreakDays + 1;
        await client
          .from('profiles')
          .update({
            current_streak: nextStreak,
            highest_streak: Math.max(streakState.highestStreak, nextStreak)
          })
          .eq('id', user.id);

        sound.playStamp();
        setStreakState(prev => ({
          ...prev,
          currentStreakDays: nextStreak,
          highestStreak: Math.max(prev.highestStreak, nextStreak),
          todayStatus: 'holding',
          todayDate: todayDate,
          isCloudVerified: true
        }));
        showNotification('WILLPOWER VERIFIED', `Day ${nextStreak} recorded!`, 'info');
        return true;
      }
    }

    // 2. Local-only guest check-in
    const localToday = new Date().toDateString();
    if (streakState.lastCheckInDate === localToday || streakState.todayStatus === 'holding') {
      sound.playError();
      showNotification('ALREADY VERIFIED', 'You have already stamped your willpower for today! Keep fighting.', 'warning');
      return false;
    }

    if (streakState.todayStatus === 'folded') {
      sound.playError();
      showNotification('CANNOT CHECK IN', 'You have already folded for today. Next check-in is eligible tomorrow.', 'error');
      return false;
    }

    const nextStreak = streakState.currentStreakDays + 1;
    const nextTotal = streakState.totalCheckIns + 1;
    const nextHighest = Math.max(streakState.highestStreak, nextStreak);

    setStreakState(prev => ({
      ...prev,
      currentStreakDays: nextStreak,
      lastCheckInDate: localToday,
      totalCheckIns: nextTotal,
      highestStreak: nextHighest,
      todayStatus: 'holding',
      isCloudVerified: false
    }));

    sound.playStamp();
    showNotification('WILLPOWER VERIFIED (LOCAL)', `Day ${nextStreak} recorded locally. Connect your account to verify on the global leaderboard!`, 'info');
    return true;
  };

  const recordUrgeResisted = () => {
    setStreakState(prev => ({ ...prev, urgesResisted: prev.urgesResisted + 1 }));
    sound.playNotification();
    showNotification('URGE DESTROYED', '+1 Urge Resisted recorded. Your neural pathways are thanking you.', 'info');
  };

  // Requirement: Confirm before I FOLDED is submitted
  const triggerFolded = () => {
    closeStartMenu();
    setShowFoldConfirm(true);
  };

  // Permanent Fold Confirmation Execution
  const confirmFold = async () => {
    setShowFoldConfirm(false);
    const client = supabase;
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    // If cloud connected
    if (client && isSupabaseConfigured && user) {
      try {
        const { data, error } = await client.rpc('rpc_fold', { p_timezone: localTz });
        if (error) {
          console.warn('rpc_fold error:', error.message);
        } else if (data) {
          console.log('Fold confirmed via RPC:', data);
        }
      } catch {
        const todayDate = new Date().toISOString().split('T')[0];
        await client
          .from('check_ins')
          .update({ status: 'folded' })
          .eq('user_id', user.id)
          .eq('check_in_date', todayDate);

        await client
          .from('profiles')
          .update({ current_streak: 0 })
          .eq('id', user.id);
      }
    }

    // Reset local authoritative state immediately across all apps
    setStreakState(prev => ({
      ...prev,
      currentStreakDays: 0,
      todayStatus: 'folded',
      foldedCount: prev.foldedCount + 1
    }));

    sound.playFolded();
    setShowCascadingCrash(true);

    if (user) {
      syncStreakFromCloud();
    }
  };

  const finishCascadingCrash = () => {
    setShowCascadingCrash(false);
    setShowBSOD(true);
  };

  const resetAfterBSOD = () => {
    setShowBSOD(false);
    setIsBooting(true);
    sound.playError();
    showNotification(
      'SYSTEM CRASH RECOVERED',
      'Streak reset to 0 Days. Moment of weakness recorded. Stand tall and rise again tomorrow.',
      'error'
    );
  };

  const addConfession = (text: string) => {
    if (!text.trim()) return;
    const newEntry: ConfessionEntry = {
      id: Date.now().toString(),
      timestamp: `Day ${streakState.currentStreakDays} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      text
    };
    setConfessions(prev => [newEntry, ...prev]);
    sound.playClick();
  };

  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      avatarColor: '#008080',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    };
    setChatMessages(prev => [...prev, userMsg]);
    sound.playClick();
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  return (
    <OSContext.Provider value={{
      windows,
      activeWindowId,
      startMenuOpen,
      systemSettings,
      streakState,
      confessions,
      chatMessages,
      showBSOD,
      isBooting,
      showFoldConfirm,
      showCascadingCrash,
      finishCascadingCrash,
      notification,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      updateWindowPos,
      updateWindowSize,
      toggleStartMenu,
      closeStartMenu,
      toggleSound,
      setWallpaper,
      toggleCrtFilter,
      toggleChatNotifications,
      toggleDesktopChatVisible,
      finishBoot,
      restartBoot,
      checkInToday,
      recordUrgeResisted,
      triggerFolded,
      setShowFoldConfirm,
      confirmFold,
      resetAfterBSOD,
      addConfession,
      sendChatMessage,
      dismissNotification,
      showNotification,
      syncStreakFromCloud
    }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = React.useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
