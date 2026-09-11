-- ==============================================================================
-- JEEVA Disaster Response Platform - Supabase Storage & Incidents Setup
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create Public Storage Bucket for Incident Photos and Audio Notes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'incident-media',
  'incident-media',
  true,
  52428800, -- 50 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/mpeg']
)
ON CONFLICT (id) DO UPDATE 
SET 
  public = true,
  file_size_limit = 52428800;

-- 2. Allow Public Access (Read & Upload) for Disaster Media
DO $$
BEGIN
  -- Allow public viewing/downloading of photos and audio
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Incident Media Read' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Incident Media Read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'incident-media');
  END IF;

  -- Allow citizens & responders to upload emergency photos and voice notes
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Incident Media Insert' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Incident Media Insert"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'incident-media');
  END IF;

  -- Allow update / overwrite
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Incident Media Update' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Incident Media Update"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'incident-media');
  END IF;
END $$;

-- 3. Confirm Table Structure
-- Ensure incidents table has text columns for title, audio_url, and photo_url
ALTER TABLE IF EXISTS public.incidents 
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS audio_url TEXT,
  ADD COLUMN IF NOT EXISTS voice_transcript TEXT;
