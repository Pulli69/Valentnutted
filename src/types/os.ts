export type AppId = 
  | 'streak-tracker'
  | 'global-chat'
  | 'leaderboard'
  | 'urge-hotline'
  | 'nut-sweeper'
  | 'confession-notes'
  | 'internet-explorer'
  | 'display-settings'
  | 'recycle-bin'
  | 'my-computer'
  | 'emergency-player'
  | 'user-account';

export interface AppDefinition {
  id: AppId;
  title: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  allowMaximize?: boolean;
}

export interface WindowInstance {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  allowMaximize: boolean;
}

export interface DailyCheckInRecord {
  day_number: number;
  check_in_date: string;
  status: 'holding' | 'folded';
  created_at?: string;
  folded_at?: string;
}

export interface StreakState {
  startDate: string; // ISO date string
  currentStreakDays: number;
  lastCheckInDate: string | null;
  totalCheckIns: number;
  highestStreak: number;
  urgesResisted: number;
  foldedCount: number;
  milestones: string[];
  todayStatus?: 'holding' | 'folded' | 'pending';
  todayDate?: string;
  timezone?: string;
  challengeJoinedDate?: string | null;
  isCloudVerified?: boolean;
  history?: DailyCheckInRecord[];
  missedDaysCount?: number;
}

export interface ConfessionEntry {
  id: string;
  timestamp: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  rank?: string;
  avatarColor?: string;
  text: string;
  time: string;
  isSystem?: boolean;
  isSelf?: boolean;
}

export type WallpaperType = 'bliss' | 'teal' | 'midnight' | 'matrix';

export interface SystemSettings {
  wallpaper: WallpaperType;
  soundEnabled: boolean;
  crtFilter: boolean;
  bootSequenceDone: boolean;
  chatNotifications: boolean;
  desktopChatVisible: boolean;
}
