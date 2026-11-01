import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, type UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAnonymous: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  authError: string | null;
  signInAnonymously: () => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  updateUsername: (newUsername: string) => Promise<boolean>;
  updateAvatar: (avatarUrl: string | null) => Promise<boolean>;
  toggleLeaderboardPublic: (isPublic: boolean) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('ihn_guest_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.current_streak === 1 && parsed.highest_streak === 1 && parsed.id === 'local-guest') {
          parsed.current_streak = 0;
          parsed.highest_streak = 0;
        }
        return parsed;
      }
    } catch {}
    const localAvatar = localStorage.getItem('ihn_custom_avatar') || undefined;
    return {
      id: 'local-guest',
      username: 'Guest_Survivor_' + Math.floor(1000 + Math.random() * 9000),
      current_streak: 0,
      highest_streak: 0,
      is_leaderboard_public: false,
      avatar_url: localAvatar
    };
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch or create profile from Supabase
  const loadProfile = useCallback(async (userId: string, defaultName?: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Profile fetch error:', error.message);
      }

      if (data) {
        setProfile(data as UserProfile);
      } else {
        // Create initial profile row
        const newName = defaultName || 'Disciple_' + Math.floor(1000 + Math.random() * 9000);
        const { data: newRow, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: newName,
            current_streak: 0,
            highest_streak: 0,
            is_leaderboard_public: false,
          })
          .select()
          .maybeSingle();

        if (!insertError && newRow) {
          setProfile(newRow as UserProfile);
        }
      }
    } catch (err: unknown) {
      console.warn('Failed to load profile:', err);
    }
  }, []);

  // Initialize Auth state listener
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadProfile(currentUser.id);
      }
      setIsLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await loadProfile(currentUser.id);
      } else {
        setProfile({
          id: 'local-guest',
          username: 'Guest_Survivor_' + Math.floor(1000 + Math.random() * 9000),
          current_streak: 0,
          highest_streak: 0,
          is_leaderboard_public: false,
        });
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Save guest profile locally
  useEffect(() => {
    if (!user && profile) {
      try {
        localStorage.setItem('ihn_guest_profile', JSON.stringify(profile));
      } catch {}
    }
  }, [user, profile]);

  // Anonymous Sign In (Guests)
  const signInAnonymously = useCallback(async (): Promise<boolean> => {
    if (!supabase) return false;
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        setAuthError(error.message);
        return false;
      }
      if (data.user) {
        setUser(data.user);
        await loadProfile(data.user.id);
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Anonymous login failed';
      setAuthError(msg);
      return false;
    }
  }, [loadProfile]);

  // Email Sign Up / Upgrade
  const signUpWithEmail = useCallback(async (email: string, pass: string, username: string) => {
    if (!supabase) return { success: false, error: 'Supabase is not configured' };
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            username: username.trim() || 'Disciple_' + Math.floor(1000 + Math.random() * 9000)
          }
        }
      });
      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      if (data.user) {
        await loadProfile(data.user.id, username.trim());
        return { success: true };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, [loadProfile]);

  // Email Sign In
  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    if (!supabase) return { success: false, error: 'Supabase is not configured' };
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }
      if (data.user) {
        await loadProfile(data.user.id);
        return { success: true };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, [loadProfile]);

  // Update Display Username
  const updateUsername = useCallback(async (newUsername: string): Promise<boolean> => {
    const clean = newUsername.trim().slice(0, 24);
    if (!clean) return false;

    if (!supabase || !user) {
      // Local guest mode
      setProfile(prev => prev ? { ...prev, username: clean } : null);
      return true;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: clean, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        setAuthError(error.message);
        return false;
      }

      setProfile(prev => prev ? { ...prev, username: clean } : null);
      return true;
    } catch (err: unknown) {
      console.warn('Update username error:', err);
      return false;
    }
  }, [user]);

  // Toggle Leaderboard Public Opt-in
  const toggleLeaderboardPublic = useCallback(async (isPublic: boolean): Promise<boolean> => {
    if (!supabase || !user) {
      setProfile(prev => prev ? { ...prev, is_leaderboard_public: isPublic } : null);
      return true;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_leaderboard_public: isPublic, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        setAuthError(error.message);
        return false;
      }

      setProfile(prev => prev ? { ...prev, is_leaderboard_public: isPublic } : null);
      return true;
    } catch (err: unknown) {
      console.warn('Toggle public error:', err);
      return false;
    }
  }, [user]);

  // Sign out
  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, []);

  // Update Profile Avatar
  const updateAvatar = useCallback(async (avatarUrl: string | null): Promise<boolean> => {
    if (!supabase || !user) {
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl || undefined } : null);
      try {
        if (avatarUrl) {
          localStorage.setItem('ihn_custom_avatar', avatarUrl);
        } else {
          localStorage.removeItem('ihn_custom_avatar');
        }
      } catch {}
      return true;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        setAuthError(error.message);
        return false;
      }

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl || undefined } : null);
      return true;
    } catch (err: unknown) {
      console.warn('Update avatar error:', err);
      return false;
    }
  }, [user]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAnonymous: Boolean(user?.is_anonymous),
      isAuthenticated: Boolean(user),
      isLoading,
      isConfigured: isSupabaseConfigured,
      authError,
      signInAnonymously,
      signUpWithEmail,
      signInWithEmail,
      updateUsername,
      updateAvatar,
      toggleLeaderboardPublic,
      signOut,
      clearAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
