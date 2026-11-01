import React, { createContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured, type PublicChatMessage, type DBChatMessage } from '../lib/supabase';
import { useAuth } from './useAuth';
import { sound } from '../audio/soundEngine';

export interface SystemNotice {
  id: string;
  text: string;
  color?: string;
  time: string;
}

const FALLBACK_DISPATCHES: PublicChatMessage[] = [
  {
    id: 'mock-1',
    username: 'PureMind_99',
    rank: '@',
    avatar_color: '#000080',
    message: 'Day 12 here. I can now taste colors and calculate pi to 500 digits.',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'mock-2',
    username: 'DownBadDan',
    rank: '',
    avatar_color: '#800000',
    message: 'Brothers help, I opened Instagram explore and almost lost it all...',
    created_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'mock-3',
    username: 'UrgeDestroyer9000',
    rank: '+',
    avatar_color: '#008000',
    message: '@DownBadDan CLOSE THE BROWSER AND GO DO 30 COLD PUSHUPS NOW!',
    created_at: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: 'mock-4',
    username: 'Monk_Dmitri',
    rank: '@',
    avatar_color: '#800080',
    message: 'Remember brothers: The temporary pleasure is not worth the permanent shame.',
    created_at: new Date(Date.now() - 600000).toISOString()
  }
];

export interface ChatContextType {
  messages: PublicChatMessage[];
  recentMessages: PublicChatMessage[];
  systemNotices: SystemNotice[];
  isLoading: boolean;
  isLoadingOlder: boolean;
  hasMoreOlder: boolean;
  isSending: boolean;
  realtimeState: 'CONNECTING' | 'SUBSCRIBED' | 'DISCONNECTED' | 'OFFLINE';
  sendMessage: (text: string) => Promise<{ success: boolean; error?: string }>;
  loadOlderMessages: () => Promise<number>;
  reportMessage: (messageId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  addSystemNotice: (text: string, color?: string) => void;
  reportedIds: Set<string>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ 
  children: React.ReactNode; 
  onIncomingMessage?: (msg: PublicChatMessage) => void;
}> = ({ children, onIncomingMessage }) => {
  const { user, profile, signInAnonymously } = useAuth();

  const [messages, setMessages] = useState<PublicChatMessage[]>(() => 
    isSupabaseConfigured ? [] : FALLBACK_DISPATCHES
  );
  const [systemNotices, setSystemNotices] = useState<SystemNotice[]>(() => 
    isSupabaseConfigured ? [] : [
      {
        id: 'sys_offline_1',
        text: '*** Connected to LOCAL SIMULATION mode (irc.ihaventnutted.net:6667)',
        color: '#800000',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'sys_offline_2',
        text: '*** Notice: Supabase not configured in .env.local. Displaying cached transmissions.',
        color: '#804000',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  );
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(isSupabaseConfigured));
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [realtimeState, setRealtimeState] = useState<'CONNECTING' | 'SUBSCRIBED' | 'DISCONNECTED' | 'OFFLINE'>(() =>
    isSupabaseConfigured ? 'CONNECTING' : 'OFFLINE'
  );
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  // Ref to onIncomingMessage callback to avoid re-subscribing on handler reference changes
  const onIncomingRef = useRef(onIncomingMessage);
  useEffect(() => {
    onIncomingRef.current = onIncomingMessage;
  }, [onIncomingMessage]);

  const addSystemNotice = useCallback((text: string, color = '#008000') => {
    setSystemNotices(prev => [
      ...prev,
      {
        id: 'sys_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        text,
        color,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  // 1. Initial Load: Fetch latest 50 messages
  useEffect(() => {
    let isMounted = true;
    const client = supabase;

    if (!client || !isSupabaseConfigured) {
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await client
          .from('public_chat_messages')
          .select('id, username, message, rank, avatar_color, created_at')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!isMounted) return;

        if (error) {
          console.error('Error fetching chat messages:', error);
          addSystemNotice(`*** Failed to retrieve dispatches: ${error.message}`, '#800000');
          setMessages(FALLBACK_DISPATCHES);
        } else if (data) {
          if (data.length === 50) {
            setHasMoreOlder(true);
          }
          const chronological = [...data].reverse();
          setMessages(chronological);
          addSystemNotice('*** Connected to irc.ihaventnutted.net:6667 (Realtime Mode Active)', '#008000');
          addSystemNotice('*** Joined channel #NoNutSurvival: Willpower Vanguard', '#000080');
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Network error';
        addSystemNotice(`*** Network error: ${msg}`, '#800000');
        setMessages(FALLBACK_DISPATCHES);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [addSystemNotice]);

  // 2. Single Realtime Subscription across entire app session
  useEffect(() => {
    const client = supabase;
    if (!client || !isSupabaseConfigured) return;

    const channel = client
      .channel('chat_messages_realtime_feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const row = payload.new as DBChatMessage;
          if (!row || !row.id) return;

          const newFormatted: PublicChatMessage = {
            id: row.id,
            username: row.username,
            message: row.message,
            rank: row.rank || '',
            avatar_color: row.avatar_color || '#000080',
            created_at: row.created_at
          };

          setMessages(prev => {
            if (prev.some(m => m.id === row.id)) {
              return prev;
            }
            return [...prev, newFormatted];
          });

          // Notify parent desktop listener if message is from another user
          if (row.user_id !== user?.id) {
            if (onIncomingRef.current) {
              onIncomingRef.current(newFormatted);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeState('SUBSCRIBED');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeState('DISCONNECTED');
        } else {
          setRealtimeState('CONNECTING');
        }
      });

    return () => {
      client.removeChannel(channel);
    };
  }, [user?.id]);

  // 3. Load Older Messages Pagination
  const loadOlderMessages = useCallback(async (): Promise<number> => {
    const client = supabase;
    if (!client || !messages.length || isLoadingOlder) return 0;

    const oldest = messages[0]?.created_at;
    if (!oldest) return 0;

    setIsLoadingOlder(true);
    try {
      const { data, error } = await client
        .from('public_chat_messages')
        .select('id, username, message, rank, avatar_color, created_at')
        .lt('created_at', oldest)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error fetching older messages:', error.message);
        addSystemNotice(`*** Failed to retrieve older dispatches: ${error.message}`, '#800000');
        return 0;
      }

      if (data) {
        if (data.length < 50) {
          setHasMoreOlder(false);
        }
        const reversed = [...data].reverse();
        setMessages(prev => [...reversed, ...prev]);
        return reversed.length;
      }
      return 0;
    } catch (err) {
      console.warn('Load older error:', err);
      return 0;
    } finally {
      setIsLoadingOlder(false);
    }
  }, [messages, isLoadingOlder, addSystemNotice]);

  // 4. Send Message Function
  const sendMessage = useCallback(async (text: string): Promise<{ success: boolean; error?: string }> => {
    const cleanText = text.trim();
    if (!cleanText || isSending) {
      return { success: false, error: 'Empty message' };
    }

    if (cleanText.length > 280) {
      addSystemNotice('*** [VALIDATION ERROR]: Message exceeds maximum 280 characters.', '#800000');
      sound.playError();
      return { success: false, error: 'Exceeds 280 characters' };
    }

    const client = supabase;
    if (!client || !isSupabaseConfigured) {
      setIsSending(true);
      const fakeMsg: PublicChatMessage = {
        id: 'local_' + Date.now(),
        username: profile?.username || 'You (Survivor)',
        message: cleanText,
        rank: profile?.rank || '',
        avatar_color: profile?.avatar_color || '#008080',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, fakeMsg]);
      setIsSending(false);
      sound.playClick();
      return { success: true };
    }

    let currentUserId = user?.id;
    if (!currentUserId) {
      setIsSending(true);
      const anonSuccess = await signInAnonymously();
      if (anonSuccess) {
        const { data: { session } } = await client.auth.getSession();
        currentUserId = session?.user?.id;
      }
      // If anonymous login failed (e.g. disabled in Supabase), we continue
      // and attempt direct guest insert (compatible with Migration 04)
    }

    setIsSending(true);
    try {
      const { data, error } = await client
        .from('chat_messages')
        .insert({
          user_id: currentUserId || null,
          username: profile?.username || 'Guest_' + Math.floor(1000 + Math.random() * 9000),
          message: cleanText,
          avatar_color: profile?.avatar_color || '#000080',
          avatar_url: profile?.avatar_url || null,
          rank: profile?.rank || ''
        })
        .select()
        .single();

      if (error) {
        console.error('Chat insert error:', error);
        if (
          error.message.includes('Rate limit') || 
          error.message.includes('3 seconds') || 
          error.code === 'P0001' || 
          error.code === '429'
        ) {
          addSystemNotice('*** [RATE LIMIT]: Slow down soldier! You can only transmit once every 3 seconds.', '#800000');
          sound.playError();
          return { success: false, error: 'Rate limit: wait 3 seconds' };
        }

        if (
          error.message.includes('violates row-level security policy') ||
          error.message.includes('null value in column "user_id"') ||
          error.message.includes('foreign key constraint') ||
          error.message.includes('Anonymous')
        ) {
          addSystemNotice('*** [GUEST ACCESS]: Enable "Anonymous Sign-Ins" in Supabase Dashboard (Authentication > Providers > Anonymous) or run Migration 04.', '#800000');
          sound.playError();
          return { success: false, error: 'Anonymous access disabled in Supabase' };
        }

        addSystemNotice(`*** Transmission rejected: ${error.message}`, '#800000');
        sound.playError();
        return { success: false, error: error.message };
      }

      sound.playClick();
      if (data) {
        const sentMsg: PublicChatMessage = {
          id: data.id,
          username: data.username,
          message: data.message,
          rank: data.rank || '',
          avatar_color: data.avatar_color || '#000080',
          created_at: data.created_at
        };
        setMessages(prev => {
          if (prev.some(m => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transmission failure';
      addSystemNotice(`*** Error: ${msg}`, '#800000');
      sound.playError();
      return { success: false, error: msg };
    } finally {
      setIsSending(false);
    }
  }, [isSending, profile, user, signInAnonymously, addSystemNotice]);

  // 5. Report Abuse
  const reportMessage = useCallback(async (messageId: string, reason: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Auth required to report messages' };
    }
    const client = supabase;
    if (!client || !isSupabaseConfigured) {
      setReportedIds(prev => new Set(prev).add(messageId));
      return { success: true };
    }

    try {
      const { error } = await client
        .from('chat_reports')
        .insert({
          reporter_id: user.id,
          message_id: messageId,
          reason
        });

      if (error) {
        return { success: false, error: error.message };
      }

      setReportedIds(prev => new Set(prev).add(messageId));
      addSystemNotice(`*** [MODERATION]: Report submitted for message #${messageId.slice(0, 6)}.`, '#804000');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Report failure';
      return { success: false, error: msg };
    }
  }, [user, addSystemNotice]);

  // Compute latest 3-5 messages for persistent desktop preview
  const recentMessages = useMemo(() => {
    return messages.slice(-5);
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        recentMessages,
        systemNotices,
        isLoading,
        isLoadingOlder,
        hasMoreOlder,
        isSending,
        realtimeState,
        sendMessage,
        loadOlderMessages,
        reportMessage,
        addSystemNotice,
        reportedIds
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
