import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/types/database'
import { UserRole } from '@/types/auth'

export type Profile = Tables<'profiles'>
export type CompanyUser = Tables<'company_users'>

export class UserService {
  private supabase = createClient()

  async getUsersByCompany(companyId: string) {
    const { data, error } = await this.supabase
      .from('company_users')
      .select(`
        *,
        profile:profiles(*),
        company:companies(*)
      `)
      .eq('company_id', companyId)
      .order('created_at')

    if (error) throw error
    return data
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  async getUserCompanies(userId: string) {
    const { data, error } = await this.supabase
      .from('company_users')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  }

  async createUserProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateUserProfile(userId: string, updates: Partial<Omit<Profile, 'id' | 'created_at'>>) {
    const { data, error } = await this.supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async addUserToCompany(companyId: string, userId: string, role: UserRole) {
    const { data, error } = await this.supabase
      .from('company_users')
      .insert({
        company_id: companyId,
        user_id: userId,
        role,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateUserRole(companyId: string, userId: string, role: UserRole) {
    const { data, error } = await this.supabase
      .from('company_users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async removeUserFromCompany(companyId: string, userId: string) {
    const { error } = await this.supabase
      .from('company_users')
      .delete()
      .eq('company_id', companyId)
      .eq('user_id', userId)

    if (error) throw error
  }
}
