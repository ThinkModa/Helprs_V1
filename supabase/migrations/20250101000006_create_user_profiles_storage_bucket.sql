-- Create the 'user-profiles' storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-profiles',
  'user-profiles',
  TRUE, -- Publicly accessible for display
  5242880, -- 5MB limit in bytes
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Optional: Add RLS policy for uploads (users can only upload to their own folder)
-- This policy assumes a folder structure like: user-profiles/user_id/filename
-- When RLS is re-enabled, a policy like this would be needed:
/*
CREATE POLICY "Allow authenticated users to upload their own profile pictures"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'user-profiles' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to view profile pictures in their company"
ON storage.objects FOR SELECT USING (
  bucket_id = 'user-profiles' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM user_profiles 
    WHERE company_id IN (
      SELECT company_id FROM user_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Allow users to update their own profile pictures"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'user-profiles' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Allow users to delete their own profile pictures"
ON storage.objects FOR DELETE USING (
  bucket_id = 'user-profiles' AND auth.uid()::text = (storage.foldername(name))[1]
);
*/
