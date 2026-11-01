-- ==============================================================================
-- IHAVENTNUTTED 98 - MIGRATION 03: AVATAR STORAGE, EXPANDED PROFILES & REAL VIEWS
-- ==============================================================================

-- 1. ADD AVATAR_URL TO PROFILES AND CHAT_MESSAGES
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

ALTER TABLE public.chat_messages 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

-- 2. RECREATE PUBLIC LEADERBOARD VIEW TO EXPOSE AVATAR_URL SAFELY
-- (DROP VIEW IF EXISTS avoids Postgres error 42P16 when adding columns to existing views)
DROP VIEW IF EXISTS public.public_leaderboard;

CREATE VIEW public.public_leaderboard AS
SELECT 
  id,
  username,
  current_streak,
  highest_streak,
  rank,
  avatar_color,
  avatar_url,
  created_at
FROM public.profiles
WHERE is_leaderboard_public = TRUE;

GRANT SELECT ON public.public_leaderboard TO anon, authenticated;

-- 3. RECREATE PUBLIC CHAT MESSAGES VIEW TO EXPOSE AVATAR_URL
DROP VIEW IF EXISTS public.public_chat_messages;

CREATE VIEW public.public_chat_messages AS
SELECT 
  id,
  username,
  message,
  rank,
  avatar_color,
  avatar_url,
  created_at
FROM public.chat_messages;

GRANT SELECT ON public.public_chat_messages TO anon, authenticated;

-- 4. CONFIGURE AVATARS STORAGE BUCKET (Publicly readable, authenticated write per folder)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 
  'avatars', 
  true, 
  3145728, -- 3MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 3145728,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload own avatar" ON storage.objects;
CREATE POLICY "Authenticated users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
