import { createClient } from '@/lib/supabase/server'
import { Tables } from '@/types/database'

export type Company = Tables<'companies'>

export class CompanyService {
  private supabase = createClient()

  async getCompanies() {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  }

  async getCompanyById(id: string) {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async getCompanyBySlug(slug: string) {
    const { data, error } = await this.supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  }

  async createCompany(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await this.supabase
      .from('companies')
      .insert(company)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateCompany(id: string, updates: Partial<Omit<Company, 'id' | 'created_at'>>) {
    const { data, error } = await this.supabase
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteCompany(id: string) {
    const { error } = await this.supabase
      .from('companies')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
