-- ==============================================================================
-- IHAVENTNUTTED 98 - MIGRATION 02: AUTHORITATIVE STREAK RULES & INTEGRITY
-- ==============================================================================

-- 1. ADD COLUMNS TO PROFILES (Locked Timezone, Challenge Date, Relapse Tracking)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS challenge_joined_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS folded_count INTEGER NOT NULL DEFAULT 0 CHECK (folded_count >= 0),
  ADD COLUMN IF NOT EXISTS last_folded_at TIMESTAMPTZ DEFAULT NULL;

-- 2. ENHANCE CHECK-INS TABLE (Status and Fold tracking)
ALTER TABLE public.check_ins 
  ADD COLUMN IF NOT EXISTS status VARCHAR(10) NOT NULL DEFAULT 'holding',
  ADD COLUMN IF NOT EXISTS folded_at TIMESTAMPTZ DEFAULT NULL;

-- Add check constraint for status values safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_ins_status_check'
  ) THEN
    ALTER TABLE public.check_ins 
      ADD CONSTRAINT check_ins_status_check CHECK (status IN ('holding', 'folded'));
  END IF;
END $$;

-- Index on check-in lookups
CREATE INDEX IF NOT EXISTS idx_check_ins_user_date_status
  ON public.check_ins (user_id, check_in_date, status);

-- 3. PURE AUTHORITATIVE FUNCTION TO CALCULATE USER STREAK FROM RECORDS
CREATE OR REPLACE FUNCTION public.calculate_user_streak(p_user_id UUID, p_timezone TEXT)
RETURNS TABLE (
  current_streak INTEGER,
  today_status VARCHAR(10),
  today_date DATE,
  day_number INTEGER,
  missed_days_count INTEGER
) AS $$
DECLARE
  v_today DATE;
  v_day_num INTEGER;
  v_joined_date DATE;
  v_today_status VARCHAR(10) := 'pending';
  v_streak INTEGER := 0;
  v_check_date DATE;
  v_rec_status VARCHAR(10);
  v_missed_count INTEGER := 0;
  v_start_date DATE;
BEGIN
  -- Authoritative server date in user's timezone
  v_today := (now() AT TIME ZONE coalesce(nullif(trim(p_timezone), ''), 'UTC'))::DATE;
  v_day_num := LEAST(GREATEST(EXTRACT(DAY FROM v_today)::INTEGER, 1), 30);

  SELECT challenge_joined_date INTO v_joined_date 
  FROM public.profiles 
  WHERE id = p_user_id;

  -- If user hasn't participated yet, streak is 0
  IF v_joined_date IS NULL THEN
    RETURN QUERY SELECT 0, 'pending'::VARCHAR(10), v_today, v_day_num, 0;
    RETURN;
  END IF;

  -- Check today's record
  SELECT status INTO v_rec_status 
  FROM public.check_ins 
  WHERE user_id = p_user_id AND check_in_date = v_today;

  IF v_rec_status = 'folded' THEN
    v_today_status := 'folded';
    -- Folded today: active streak is immediately 0
    RETURN QUERY SELECT 0, 'folded'::VARCHAR(10), v_today, v_day_num, 0;
    RETURN;
  ELSIF v_rec_status = 'holding' THEN
    v_today_status := 'holding';
    v_start_date := v_today;
  ELSE
    v_today_status := 'pending';
    -- Today is pending: active streak is unbroken chain ending yesterday
    v_start_date := v_today - 1;
  END IF;

  -- Count backwards consecutive 'holding' days until v_joined_date
  v_check_date := v_start_date;
  WHILE v_check_date >= v_joined_date LOOP
    SELECT status INTO v_rec_status 
    FROM public.check_ins 
    WHERE user_id = p_user_id AND check_in_date = v_check_date;

    IF v_rec_status = 'holding' THEN
      v_streak := v_streak + 1;
      v_check_date := v_check_date - 1;
    ELSE
      -- Missed day or folded day: consecutive streak terminates
      EXIT;
    END IF;
  END LOOP;

  -- Count total missed days between v_joined_date and yesterday
  IF v_today > v_joined_date THEN
    SELECT count(*)::INTEGER INTO v_missed_count
    FROM generate_series(v_joined_date, v_today - 1, '1 day'::interval) d(dt)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.check_ins ci 
      WHERE ci.user_id = p_user_id AND ci.check_in_date = d.dt::DATE AND ci.status = 'holding'
    );
  END IF;

  RETURN QUERY SELECT v_streak, v_today_status, v_today, v_day_num, v_missed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ATOMIC CHECK-IN RPC
CREATE OR REPLACE FUNCTION public.rpc_check_in(p_timezone TEXT DEFAULT 'UTC')
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile RECORD;
  v_tz TEXT;
  v_today DATE;
  v_day_num INTEGER;
  v_existing RECORD;
  v_calc RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock profile row for update to prevent concurrent duplicate check-ins
  SELECT * INTO v_profile 
  FROM public.profiles 
  WHERE id = v_user_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found. Please logon to initialize your profile.';
  END IF;

  -- Lock timezone if not already set (cannot be modified after first interaction)
  IF v_profile.timezone IS NULL THEN
    v_tz := coalesce(nullif(trim(p_timezone), ''), 'UTC');
    UPDATE public.profiles SET timezone = v_tz WHERE id = v_user_id;
  ELSE
    v_tz := v_profile.timezone;
  END IF;

  -- Authoritative server date in user's locked timezone
  v_today := (now() AT TIME ZONE v_tz)::DATE;
  v_day_num := LEAST(GREATEST(EXTRACT(DAY FROM v_today)::INTEGER, 1), 30);

  -- Check existing record for today
  SELECT * INTO v_existing 
  FROM public.check_ins 
  WHERE user_id = v_user_id AND check_in_date = v_today;

  IF FOUND THEN
    IF v_existing.status = 'folded' THEN
      RAISE EXCEPTION 'Cannot check in: You have already folded for today (%s). Next check-in is eligible tomorrow.', v_today;
    ELSE
      RAISE EXCEPTION 'Already checked in for today (%s). Next check-in is eligible tomorrow.', v_today;
    END IF;
  END IF;

  -- Set challenge_joined_date if not set
  IF v_profile.challenge_joined_date IS NULL THEN
    UPDATE public.profiles 
    SET challenge_joined_date = v_today 
    WHERE id = v_user_id;
  END IF;

  -- Insert authoritative check-in
  INSERT INTO public.check_ins (user_id, day_number, check_in_date, status, created_at)
  VALUES (v_user_id, v_day_num, v_today, 'holding', now());

  -- Recalculate streak
  SELECT * INTO v_calc FROM public.calculate_user_streak(v_user_id, v_tz);

  -- Update profile with verified streak
  UPDATE public.profiles 
  SET 
    current_streak = v_calc.current_streak,
    highest_streak = GREATEST(v_profile.highest_streak, v_calc.current_streak),
    updated_at = now()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'current_streak', v_calc.current_streak,
    'highest_streak', GREATEST(v_profile.highest_streak, v_calc.current_streak),
    'today_status', 'holding',
    'check_in_date', v_today,
    'day_number', v_day_num,
    'timezone', v_tz
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ATOMIC FOLD RPC
CREATE OR REPLACE FUNCTION public.rpc_fold(p_timezone TEXT DEFAULT 'UTC')
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile RECORD;
  v_tz TEXT;
  v_today DATE;
  v_day_num INTEGER;
  v_existing RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_profile 
  FROM public.profiles 
  WHERE id = v_user_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  v_tz := coalesce(v_profile.timezone, nullif(trim(p_timezone), ''), 'UTC');
  v_today := (now() AT TIME ZONE v_tz)::DATE;
  v_day_num := LEAST(GREATEST(EXTRACT(DAY FROM v_today)::INTEGER, 1), 30);

  SELECT * INTO v_existing 
  FROM public.check_ins 
  WHERE user_id = v_user_id AND check_in_date = v_today;

  IF FOUND THEN
    IF v_existing.status = 'folded' THEN
      RAISE EXCEPTION 'You have already recorded a fold for today (%s).', v_today;
    ELSE
      -- Invalidate previously recorded holding check-in for today
      UPDATE public.check_ins 
      SET status = 'folded', folded_at = now()
      WHERE user_id = v_user_id AND check_in_date = v_today;
    END IF;
  ELSE
    -- Record fold event for today
    INSERT INTO public.check_ins (user_id, day_number, check_in_date, status, folded_at, created_at)
    VALUES (v_user_id, v_day_num, v_today, 'folded', now(), now());
  END IF;

  -- Set challenge joined date if first interaction
  IF v_profile.challenge_joined_date IS NULL THEN
    UPDATE public.profiles SET challenge_joined_date = v_today WHERE id = v_user_id;
  END IF;

  -- Immediately reset current streak to 0, increment folded count
  UPDATE public.profiles 
  SET 
    current_streak = 0,
    folded_count = v_profile.folded_count + 1,
    last_folded_at = now(),
    updated_at = now()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'current_streak', 0,
    'highest_streak', v_profile.highest_streak,
    'today_status', 'folded',
    'folded_date', v_today,
    'folded_count', v_profile.folded_count + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ATOMIC STREAK STATUS RPC (WITH AUTOMATIC MISSED-DAY SYNC)
CREATE OR REPLACE FUNCTION public.rpc_get_streak_status(p_timezone TEXT DEFAULT 'UTC')
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile RECORD;
  v_tz TEXT;
  v_calc RECORD;
  v_history JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('authenticated', false);
  END IF;

  SELECT * INTO v_profile 
  FROM public.profiles 
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('authenticated', true, 'has_profile', false);
  END IF;

  v_tz := coalesce(v_profile.timezone, nullif(trim(p_timezone), ''), 'UTC');
  
  -- Calculate verified streak
  SELECT * INTO v_calc FROM public.calculate_user_streak(v_user_id, v_tz);

  -- If database current_streak is out of sync (e.g. user missed a day since last login),
  -- update profile current_streak atomically so public leaderboard is always accurate!
  IF v_profile.current_streak != v_calc.current_streak THEN
    UPDATE public.profiles 
    SET current_streak = v_calc.current_streak, updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Fetch user check-in history records
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'day_number', day_number,
      'check_in_date', check_in_date,
      'status', status,
      'created_at', created_at,
      'folded_at', folded_at
    ) ORDER BY check_in_date ASC
  ), '[]'::jsonb) INTO v_history
  FROM public.check_ins
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'authenticated', true,
    'has_profile', true,
    'current_streak', v_calc.current_streak,
    'highest_streak', v_profile.highest_streak,
    'today_status', v_calc.today_status,
    'today_date', v_calc.today_date,
    'day_number', v_calc.day_number,
    'missed_days_count', v_calc.missed_days_count,
    'timezone', v_tz,
    'challenge_joined_date', v_profile.challenge_joined_date,
    'folded_count', v_profile.folded_count,
    'last_folded_at', v_profile.last_folded_at,
    'history', v_history
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. GRANT PERMISSIONS TO AUTHENTICATED & ANON
GRANT EXECUTE ON FUNCTION public.calculate_user_streak(UUID, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.rpc_check_in(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_fold(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_get_streak_status(TEXT) TO authenticated, anon;
