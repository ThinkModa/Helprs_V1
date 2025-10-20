import { createClient } from '@/lib/supabase/client'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export const uploadCompanyLogo = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, GIF, WebP, or SVG image.'
      }
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Please upload an image smaller than 5MB.'
      }
    }

    const supabase = createClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('company-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: 'Failed to upload image. Please try again.'
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('company-logos')
      .getPublicUrl(fileName)

    return {
      success: true,
      url: urlData.publicUrl
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    }
  }
}

export const deleteCompanyLogo = async (
  fileName: string
): Promise<UploadResult> => {
  try {
    const supabase = createClient()

    const { error } = await supabase.storage
      .from('company-logos')
      .remove([fileName])

    if (error) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: 'Failed to delete image.'
      }
    }

    return {
      success: true
    }

  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred.'
    }
  }
}

// Helper function to extract filename from URL
export const extractFileNameFromUrl = (url: string): string => {
  const parts = url.split('/')
  return parts[parts.length - 1]
}

// Helper function to validate image file
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Please upload a JPEG, PNG, GIF, WebP, or SVG image.'
  }

  if (file.size > maxSize) {
    return 'File size too large. Please upload an image smaller than 5MB.'
  }

  return null
}
