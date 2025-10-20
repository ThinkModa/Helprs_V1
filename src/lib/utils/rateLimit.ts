// Simple in-memory rate limiter for development
// In production, use Redis-based rate limiting

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export const rateLimit = (
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000 // 1 minute
): RateLimitResult => {
  const now = Date.now()
  const key = identifier
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    }
    rateLimitStore.set(key, newEntry)
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: newEntry.resetTime
    }
  }

  if (entry.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime
    }
  }

  // Increment counter
  entry.count++
  rateLimitStore.set(key, entry)

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime
  }
}

// Get client IP from request
export const getClientIP = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return 'unknown'
}

// Rate limiting middleware for API routes
export const withRateLimit = (
  limit: number = 10,
  windowMs: number = 60 * 1000
) => {
  return (handler: Function) => {
    return async (request: Request, ...args: any[]) => {
      const clientIP = getClientIP(request)
      const result = rateLimit(clientIP, limit, windowMs)
      
      if (!result.success) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': result.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.reset.toString(),
              'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString()
            }
          }
        )
      }
      
      // Add rate limit headers to successful responses
      const response = await handler(request, ...args)
      
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Limit', result.limit.toString())
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
        response.headers.set('X-RateLimit-Reset', result.reset.toString())
      }
      
      return response
    }
  }
}
