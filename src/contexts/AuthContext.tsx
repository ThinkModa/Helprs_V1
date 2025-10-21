'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { AuthUser, UserProfile } from '@/types/auth'
import { Tables } from '@/types/database'

interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  currentCompany: Tables<'companies'> | null
  currentRole: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  createCompany: (companyData: {
    name: string
    industry: string
    employeeRange: string
    city: string
    state: string
    logoUrl?: string
  }) => Promise<{ data: any; error: any }>
  setCurrentCompany: (company: Tables<'companies'>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentCompany, setCurrentCompany] = useState<Tables<'companies'> | null>(null)
  const [currentRole, setCurrentRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  
  const supabase = isSupabaseConfigured ? createClient() : null

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          // Don't log AuthSessionMissingError as it's expected during initial load
          if (!userError.message?.includes('Auth session missing')) {
            console.error('Error getting user:', userError)
          }
          setLoading(false)
          return
        }
        
        if (user) {
          setUser(user as AuthUser)
          
          try {
            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', user.id)
              .single()

            if (profileError) {
              console.error('Error fetching user profile:', profileError)
              // Profile might not exist yet - that's okay
              setProfile(null)
            } else if (profile) {
              setProfile(profile)
              
              // Fetch company if user has one
              if (profile.company_id) {
                const { data: company, error: companyError } = await supabase
                  .from('companies')
                  .select('*')
                  .eq('id', profile.company_id)
                  .single()

                if (companyError) {
                  console.error('Error fetching company:', companyError)
                  setCurrentCompany(null)
                } else if (company) {
                  setCurrentCompany(company)
                  setCurrentRole(profile.role)
                }
              }
            }
          } catch (error) {
            console.error('Error in getUser profile fetch:', error)
          }
        }
      } catch (error) {
        // Don't log AuthSessionMissingError as it's expected during initial load
        if (!error?.message?.includes('Auth session missing')) {
          console.error('Error in getUser:', error)
        }
      }
      
      setLoading(false)
    }

    getUser()

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change:', event, session?.user?.id)
          
          if (session?.user) {
            setUser(session.user as AuthUser)
            
            try {
              // Fetch updated profile
              const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              if (profileError) {
                console.error('Error fetching user profile:', profileError)
                // If profile doesn't exist, that's okay - user might be in onboarding
                setProfile(null)
              } else if (profile) {
                setProfile(profile)
                
                // Fetch company if user has one
                if (profile.company_id) {
                  const { data: company, error: companyError } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('id', profile.company_id)
                    .single()

                  if (companyError) {
                    console.error('Error fetching company:', companyError)
                    setCurrentCompany(null)
                  } else if (company) {
                    setCurrentCompany(company)
                    setCurrentRole(profile.role)
                  }
                }
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error)
            }
          } else {
            setUser(null)
            setProfile(null)
            setCurrentCompany(null)
            setCurrentRole(null)
          }
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [supabase?.auth])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase not configured') }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    })

    if (!error && data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          role: 'admin',
        })
      
      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Don't return error here as the user is already created in auth
        // The profile will be created when they complete onboarding
      }
    }

    return { error }
  }

  const signOut = async () => {
    if (!supabase) {
      return
    }
    
    try {
      await supabase.auth.signOut()
      
      // Clear all state after successful sign out
      setUser(null)
      setProfile(null)
      setCurrentCompany(null)
      setCurrentRole(null)
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('onboarding-form-data')
      }
      
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

    const createCompany = async (companyData: {
      name: string
      industry: string
      employeeRange: string
      city: string
      state: string
      logoUrl?: string
    }) => {
      console.log('createCompany called with:', companyData)
      console.log('supabase configured:', !!supabase)
      console.log('user authenticated:', !!user)
      
      if (!supabase || !user) {
        console.error('Not authenticated - supabase:', !!supabase, 'user:', !!user)
        return { data: null, error: new Error('Not authenticated') }
      }

      try {
        console.log('Calling API route to create company...')
        
        const response = await fetch('/api/companies/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(companyData),
        })

        const result = await response.json()
        
        if (!response.ok) {
          console.error('API error:', result.error)
          return { data: null, error: new Error(result.error || 'Failed to create company') }
        }

        console.log('Company created successfully:', result.data)
        setCurrentCompany(result.data)
        
        return { data: result.data, error: null }
      } catch (err) {
        console.error('Error in createCompany:', err)
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') }
      }
    }

  const handleSetCurrentCompany = (company: Tables<'companies'>) => {
    setCurrentCompany(company)
    
    // Find the role for this company
    const companyUser = profile?.companies?.find(c => c.company.id === company.id)
    if (companyUser) {
      setCurrentRole(companyUser.role)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        currentCompany,
        currentRole,
        loading,
        signIn,
        signUp,
        signOut,
        createCompany,
        setCurrentCompany: handleSetCurrentCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
