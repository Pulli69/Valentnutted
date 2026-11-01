import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://bjnymwvjlgawtlwgtvza.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_94HCtmUjgNSeex8ZHrYy-g_gI1iwbic';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '') : '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Check if credentials are valid and not placeholders
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-public-key')
);

export interface UserProfile {
  id: string;
  username: string;
  current_streak: number;
  highest_streak: number;
  is_leaderboard_public: boolean;
  avatar_color?: string;
  avatar_url?: string;
  rank?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DBChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  rank?: string;
  avatar_color?: string;
  avatar_url?: string;
  created_at: string;
}

export interface PublicChatMessage {
  id: string;
  username: string;
  message: string;
  rank?: string;
  avatar_color?: string;
  avatar_url?: string;
  created_at: string;
}

export interface DBChatReport {
  id?: string;
  reporter_id: string;
  message_id: string;
  reason: string;
  created_at?: string;
}

export interface DBCheckIn {
  id: string;
  user_id: string;
  day_number: number;
  check_in_date: string;
  created_at: string;
}

// Single instance Supabase client
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
