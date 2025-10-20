'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { validateImageFile } from '@/lib/utils/fileUpload'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  currentFile?: File | null
  currentUrl?: string
  error?: string
  disabled?: boolean
}

export function FileUpload({ 
  onFileSelect, 
  currentFile, 
  currentUrl, 
  error, 
  disabled = false 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    setUploadError(null)
    
    const validationError = validateImageFile(file)
    if (validationError) {
      setUploadError(validationError)
      return
    }

    onFileSelect(file)
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleRemove = () => {
    onFileSelect(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        {currentFile || currentUrl ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {currentFile ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 truncate max-w-48">
                    {currentFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : currentUrl ? (
                <div className="text-center">
                  <img
                    src={currentUrl}
                    alt="Company logo"
                    className="w-16 h-16 mx-auto mb-2 object-cover rounded-lg"
                  />
                  <p className="text-sm text-gray-600">Current logo</p>
                </div>
              ) : null}
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
                disabled={disabled}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                disabled={disabled}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF, WebP, or SVG (max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {(error || uploadError) && (
        <p className="text-red-500 text-sm mt-2">
          {error || uploadError}
        </p>
      )}
    </div>
  )
}
