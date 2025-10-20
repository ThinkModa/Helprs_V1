import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeServerObject } from '@/lib/utils/sanitize'
import { rateLimit, getClientIP } from '@/lib/utils/rateLimit'

// Server-side validation functions
const validateName = (name: string, fieldName: string): string | null => {
  if (!name || !name.trim()) return `${fieldName} is required`
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`
  if (name.trim().length > 100) return `${fieldName} must be less than 100 characters`
  if (!/^[a-zA-Z0-9\s\-'&.,()]+$/.test(name.trim())) {
    return `${fieldName} contains invalid characters`
  }
  return null
}

const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 requests per minute per IP
    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(clientIP, 5, 60 * 1000)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
          }
        }
      )
    }

    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client for company creation
    const serviceClient = await createServiceRoleClient()

    const body = await request.json()
    
    // Sanitize all input data
    const sanitizedBody = sanitizeServerObject(body)
    const { name, industry, employeeRange, city, state, logoUrl } = sanitizedBody

    // Server-side validation
    const validationErrors: Record<string, string> = {}
    
    const nameError = validateName(name, 'Company name')
    if (nameError) validationErrors.name = nameError
    
    const industryError = validateRequired(industry, 'Industry')
    if (industryError) validationErrors.industry = industryError
    
    const employeeRangeError = validateRequired(employeeRange, 'Employee range')
    if (employeeRangeError) validationErrors.employeeRange = employeeRangeError
    
    const cityError = validateRequired(city, 'City')
    if (cityError) validationErrors.city = cityError
    
    const stateError = validateRequired(state, 'State')
    if (stateError) validationErrors.state = stateError

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationErrors 
      }, { status: 400 })
    }

    // Generate a unique slug from company name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substr(2, 6)

    const insertData = {
      name,
      slug,
      industry,
      employee_range: employeeRange,
      city,
      state,
      logo_url: logoUrl,
      subscription_tier: 'free',
      subscription_status: 'active',
      is_active: true,
    }

    console.log('Server: Inserting company data:', insertData)

    // Insert company using service role client
    const { data: companyData, error: companyError } = await serviceClient
      .from('companies')
      .insert(insertData)
      .select()
      .single()

    if (companyError) {
      console.error('Server: Company insert error:', companyError)
      return NextResponse.json({ error: companyError.message }, { status: 400 })
    }

    console.log('Server: Company created:', companyData)

    // Ensure user profile exists and update with company_id
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      // Update existing profile with company_id
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ company_id: companyData.id })
        .eq('id', user.id)

      if (updateError) {
        console.error('Server: User profile update error:', updateError)
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }
    } else {
      // Create new user profile with company_id
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email!,
          first_name: user.user_metadata?.first_name || 'User',
          last_name: user.user_metadata?.last_name || 'Name',
          role: 'admin',
          company_id: companyData.id
        })

      if (insertError) {
        console.error('Server: User profile insert error:', insertError)
        return NextResponse.json({ error: insertError.message }, { status: 400 })
      }
    }

    console.log('Server: User profile updated successfully')

    return NextResponse.json({ data: companyData })
  } catch (error) {
    console.error('Server: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
