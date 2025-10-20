'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, User, Loader2 } from 'lucide-react'
import { Button } from './button'
import { storageService, UploadProgress } from '@/lib/storage/upload'

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null
  onImageChange: (file: File | null, previewUrl: string | null) => void
  onUploadComplete?: (url: string) => void
  onUploadError?: (error: string) => void
  userId?: string
  companyId?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProfilePictureUpload({
  currentImageUrl,
  onImageChange,
  onUploadComplete,
  onUploadError,
  userId,
  companyId,
  disabled = false,
  size = 'md'
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file
    if (!storageService.isValidImageFile(file)) {
      const errorMsg = 'Invalid file type. Please upload a JPG, PNG, or WebP image.'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'File size too large. Please upload an image smaller than 5MB.'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    // Create preview
    const newPreviewUrl = storageService.createPreviewUrl(file)
    setPreviewUrl(newPreviewUrl)
    onImageChange(file, newPreviewUrl)

    // Auto-upload if userId and companyId are provided
    if (userId && companyId) {
      await handleUpload(file)
    }
  }

  const handleUpload = async (file: File) => {
    if (!userId || !companyId) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const result = await storageService.uploadProfilePicture(
        file,
        userId,
        companyId,
        (progress: UploadProgress) => {
          setUploadProgress(progress.percentage)
        }
      )

      if (result.success && result.url) {
        setPreviewUrl(result.url)
        onUploadComplete?.(result.url)
        setError(null)
      } else {
        const errorMsg = result.error || 'Upload failed'
        setError(errorMsg)
        onUploadError?.(errorMsg)
        // Revert to previous image on error
        setPreviewUrl(currentImageUrl || null)
        onImageChange(null, currentImageUrl || null)
      }
    } catch (error) {
      const errorMsg = 'An unexpected error occurred during upload'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      setPreviewUrl(currentImageUrl || null)
      onImageChange(null, currentImageUrl || null)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = () => {
    // Revoke preview URL to free memory
    if (previewUrl && previewUrl.startsWith('blob:')) {
      storageService.revokePreviewUrl(previewUrl)
    }

    setPreviewUrl(null)
    onImageChange(null, null)
    setError(null)

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Profile Picture Display */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 ${
            disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
          }`}
          onClick={handleClick}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}

          {/* Upload Progress Overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <div className="text-xs">{Math.round(uploadProgress)}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Remove Button */}
        {previewUrl && !uploading && !disabled && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex flex-col items-center space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled || uploading}
          className="flex items-center space-x-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>{previewUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </>
          )}
        </Button>

        {/* File Info */}
        {previewUrl && !uploading && (
          <p className="text-xs text-gray-500 text-center">
            {previewUrl.startsWith('blob:') ? 'Ready to upload' : 'Uploaded'}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-600 text-center max-w-48">{error}</p>
        )}

        {/* File Requirements */}
        <p className="text-xs text-gray-400 text-center max-w-48">
          JPG, PNG, or WebP up to 5MB
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  )
}
