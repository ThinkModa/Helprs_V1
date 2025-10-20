'use client'

import { createClient } from '@/lib/supabase/client'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export class StorageService {
  private supabase = createClient()

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file type
      if (!this.isValidImageFile(file)) {
        return {
          success: false,
          error: 'Invalid file type. Please upload a JPG, PNG, or WebP image.'
        }
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return {
          success: false,
          error: 'File size too large. Please upload an image smaller than 5MB.'
        }
      }

      // Check if bucket exists
      const { data: buckets, error: bucketError } = await this.supabase.storage.listBuckets()
      
      if (bucketError) {
        console.error('Error checking buckets:', bucketError)
        return {
          success: false,
          error: 'Storage service unavailable. Please try again later.'
        }
      }

      const bucketExists = buckets?.some(b => b.name === bucket)
      
      if (!bucketExists) {
        console.error(`Bucket '${bucket}' does not exist`)
        return {
          success: false,
          error: 'Storage bucket not configured. Please contact support.'
        }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${path}/${fileName}`

      // Upload file with progress tracking
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        
        // Provide more specific error messages
        if (error.message.includes('Bucket not found')) {
          return {
            success: false,
            error: 'Storage bucket not configured. Please contact support.'
          }
        }
        
        return {
          success: false,
          error: error.message || 'Failed to upload file'
        }
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during upload'
      }
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path])

      if (error) {
        console.error('Delete error:', error)
        return {
          success: false,
          error: error.message || 'Failed to delete file'
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during deletion'
      }
    }
  }

  /**
   * Upload user profile picture
   */
  async uploadProfilePicture(
    file: File,
    userId: string,
    companyId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const path = `${companyId}/users/${userId}`
    return this.uploadFile('user-profiles', path, file, onProgress)
  }

  /**
   * Delete user profile picture
   */
  async deleteProfilePicture(userId: string, companyId: string, currentPath: string): Promise<{ success: boolean; error?: string }> {
    // Extract the path from the full URL
    const pathParts = currentPath.split('/')
    const fileName = pathParts[pathParts.length - 1]
    const path = `${companyId}/users/${userId}/${fileName}`
    
    return this.deleteFile('user-profiles', path)
  }

  /**
   * Validate image file type
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    return validTypes.includes(file.type)
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Create a preview URL for an image file
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * Revoke a preview URL to free memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url)
  }
}

// Export singleton instance
export const storageService = new StorageService()
