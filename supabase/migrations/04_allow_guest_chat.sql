-- ==============================================================================
-- MIGRATION 04: ALLOW GUEST CHAT MESSAGES WITHOUT AUTH
-- Run this in your Supabase Dashboard -> SQL Editor
-- This allows any visitor (guest) to transmit messages in the chat immediately
-- without requiring email registration or Supabase anonymous auth provider.
-- ==============================================================================

-- 1. Make user_id nullable in chat_messages table
ALTER TABLE public.chat_messages ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop existing insert policies and permit anon + authenticated insertion
DROP POLICY IF EXISTS "Authenticated users can post chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can post chat messages" ON public.chat_messages;

CREATE POLICY "Anyone can post chat messages"
  ON public.chat_messages 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- 3. Update the rate-limiting trigger to handle guest messages (user_id IS NULL)
CREATE OR REPLACE FUNCTION public.check_chat_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.chat_messages
      WHERE user_id = NEW.user_id
        AND created_at > (now() - INTERVAL '3 seconds')
    ) THEN
      RAISE EXCEPTION 'Rate limit exceeded: You can only send a message once every 3 seconds.';
    END IF;
  ELSE
    IF EXISTS (
      SELECT 1 FROM public.chat_messages
      WHERE username = NEW.username
        AND user_id IS NULL
        AND created_at > (now() - INTERVAL '3 seconds')
    ) THEN
      RAISE EXCEPTION 'Rate limit exceeded: You can only send a message once every 3 seconds.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
