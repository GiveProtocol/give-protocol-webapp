-- Migration: Add image support for volunteer opportunities
-- This migration adds columns for storing image URLs and paths,
-- and creates a storage bucket for opportunity images.

-- Add image columns to volunteer_opportunities table
ALTER TABLE volunteer_opportunities
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Add comment explaining the columns
COMMENT ON COLUMN volunteer_opportunities.image_url IS 'Public URL of the opportunity header image';
COMMENT ON COLUMN volunteer_opportunities.image_path IS 'Storage path for the image (used for deletion)';

-- Create the storage bucket for opportunity images
-- Note: This needs to be run with appropriate permissions or via Supabase dashboard
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'opportunity-images',
  'opportunity-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for opportunity-images bucket

-- Allow authenticated users to upload images to their charity folder
DROP POLICY IF EXISTS "Charities can upload opportunity images" ON storage.objects;
CREATE POLICY "Charities can upload opportunity images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'opportunity-images'
  AND (storage.foldername(name))[1] = 'opportunities'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.type = 'charity'
    AND profiles.id::text = (storage.foldername(name))[2]
  )
);

-- Allow authenticated charity users to update their own images
DROP POLICY IF EXISTS "Charities can update own opportunity images" ON storage.objects;
CREATE POLICY "Charities can update own opportunity images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'opportunity-images'
  AND (storage.foldername(name))[1] = 'opportunities'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.type = 'charity'
    AND profiles.id::text = (storage.foldername(name))[2]
  )
);

-- Allow authenticated charity users to delete their own images
DROP POLICY IF EXISTS "Charities can delete own opportunity images" ON storage.objects;
CREATE POLICY "Charities can delete own opportunity images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'opportunity-images'
  AND (storage.foldername(name))[1] = 'opportunities'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.type = 'charity'
    AND profiles.id::text = (storage.foldername(name))[2]
  )
);

-- Allow public read access to all opportunity images (bucket is public)
DROP POLICY IF EXISTS "Anyone can view opportunity images" ON storage.objects;
CREATE POLICY "Anyone can view opportunity images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'opportunity-images');
