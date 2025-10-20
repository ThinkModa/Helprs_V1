import DOMPurify from 'dompurify'

// Client-side sanitization for user input
export const sanitizeInput = (input: string): string => {
  if (typeof window === 'undefined') {
    // Server-side fallback - basic sanitization
    return input
      .replace(/[<>]/g, '') // Remove < and > characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
  }
  
  // Client-side sanitization using DOMPurify
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] // No attributes allowed
  }).trim()
}

// Sanitize object properties recursively
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value)
    }
    return sanitized
  }
  
  return obj
}

// Server-side sanitization (for API routes)
export const sanitizeServerInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script tags
    .replace(/iframe/gi, '') // Remove iframe tags
    .replace(/object/gi, '') // Remove object tags
    .replace(/embed/gi, '') // Remove embed tags
    .replace(/link/gi, '') // Remove link tags
    .replace(/meta/gi, '') // Remove meta tags
    .trim()
}

// Sanitize server-side object
export const sanitizeServerObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeServerInput(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeServerObject)
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeServerObject(value)
    }
    return sanitized
  }
  
  return obj
}
