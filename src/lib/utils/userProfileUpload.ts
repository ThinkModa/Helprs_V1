import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

export const uploadUserProfilePicture = async (
  file: File,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  if (!file) {
    return { success: false, error: 'No file provided.' }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Only images (PNG, JPEG, GIF, WebP, SVG) are allowed.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.` }
  }

  const fileExtension = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExtension}` // Store in user-specific folder

  try {
    const { data, error } = await supabase.storage
      .from('user-profiles')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('user-profiles')
      .getPublicUrl(fileName)

    if (!publicUrlData.publicUrl) {
      return { success: false, error: 'Failed to get public URL for the uploaded profile picture.' }
    }

    return { success: true, url: publicUrlData.publicUrl }
  } catch (err) {
    console.error('Unexpected upload error:', err)
    return { success: false, error: 'An unexpected error occurred during upload.' }
  }
}

export const deleteUserProfilePicture = async (
  profilePictureUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const path = profilePictureUrl.split('user-profiles/')[1] // Extract path from URL
    if (!path) {
      return { success: false, error: 'Invalid profile picture URL for deletion.' }
    }

    const { error } = await supabase.storage.from('user-profiles').remove([path])

    if (error) {
      console.error('Supabase delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected delete error:', err)
    return { success: false, error: 'An unexpected error occurred during deletion.' }
  }
}
