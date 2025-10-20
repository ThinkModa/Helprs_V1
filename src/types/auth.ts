import { User } from '@supabase/supabase-js'
import { Tables } from './database'

export type UserRole = 'owner' | 'admin' | 'manager' | 'employee'

export interface UserProfile extends Tables<'profiles'> {
  companies: Array<{
    company: Tables<'companies'>
    role: UserRole
  }>
}

export interface AuthUser extends User {
  profile?: UserProfile
  currentCompany?: Tables<'companies'>
  currentRole?: UserRole
}

export interface CompanyUser extends Tables<'company_users'> {
  profile: Tables<'profiles'>
  company: Tables<'companies'>
}
