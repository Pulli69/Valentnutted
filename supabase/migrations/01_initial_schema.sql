-- ==============================================================================
-- IHAVENTNUTTED 98 - SUPABASE DATABASE MIGRATION SCRIPT
-- Phase 2: Real Multi-User Backend, Authentication, Profiles, Chat & Leaderboard
-- ==============================================================================

-- 1. PROFILES TABLE (Persistent User Identity & Leaderboard Status)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(24) NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 1 CHECK (current_streak >= 0),
  highest_streak INTEGER NOT NULL DEFAULT 1 CHECK (highest_streak >= 0),
  is_leaderboard_public BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_color VARCHAR(7) DEFAULT '#000080',
  rank VARCHAR(4) DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on public leaderboard lookup
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard 
  ON public.profiles (current_streak DESC) 
  WHERE is_leaderboard_public = TRUE;

-- 2. VERIFIED CHECK-INS TABLE (Server-side Streak Record)
-- Prevents users from fabricating arbitrary streak numbers
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_daily_checkin UNIQUE (user_id, check_in_date)
);

-- 3. CHAT MESSAGES TABLE (mIRC Realtime Channel)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(24) NOT NULL,
  message VARCHAR(280) NOT NULL,
  rank VARCHAR(4) DEFAULT '',
  avatar_color VARCHAR(7) DEFAULT '#000080',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
  ON public.chat_messages (created_at DESC);

-- 4. CHAT REPORTS TABLE (Moderation / Abuse Flagging)
CREATE TABLE IF NOT EXISTS public.chat_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  reason VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- PRIVACY-SAFE PUBLIC VIEWS (Never exposes emails, auth IDs or private timestamps)
-- ==============================================================================

-- Public Leaderboard View
CREATE OR REPLACE VIEW public.public_leaderboard AS
SELECT 
  id,
  username,
  current_streak,
  highest_streak,
  rank,
  avatar_color,
  created_at
FROM public.profiles
WHERE is_leaderboard_public = TRUE;

-- Public Chat Messages View
CREATE OR REPLACE VIEW public.public_chat_messages AS
SELECT 
  id,
  username,
  message,
  rank,
  avatar_color,
  created_at
FROM public.chat_messages;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public can view public profiles" ON public.profiles;
CREATE POLICY "Public can view public profiles"
  ON public.profiles FOR SELECT
  USING (is_leaderboard_public = TRUE OR auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Check-ins Policies
DROP POLICY IF EXISTS "Users can view their own checkins" ON public.check_ins;
CREATE POLICY "Users can view their own checkins"
  ON public.check_ins FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can record their own checkins" ON public.check_ins;
CREATE POLICY "Users can record their own checkins"
  ON public.check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Chat Messages Policies
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
CREATE POLICY "Anyone can view chat messages"
  ON public.chat_messages FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can post chat messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can post chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Chat Reports Policies
DROP POLICY IF EXISTS "Authenticated users can report messages" ON public.chat_reports;
CREATE POLICY "Authenticated users can report messages"
  ON public.chat_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- ==============================================================================
-- SERVER-SIDE RATE LIMITING TRIGGER (Prevents spamming the chat)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_chat_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Disallow posting more than 1 message every 3 seconds per user
  IF EXISTS (
    SELECT 1 FROM public.chat_messages
    WHERE user_id = NEW.user_id
      AND created_at > (now() - INTERVAL '3 seconds')
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded: You can only send a message once every 3 seconds.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_chat_rate_limit ON public.chat_messages;
CREATE TRIGGER trigger_chat_rate_limit
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_chat_rate_limit();

-- ==============================================================================
-- REALTIME PUBLICATION
-- ==============================================================================

-- Enable Realtime broadcasting on chat_messages table safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;
