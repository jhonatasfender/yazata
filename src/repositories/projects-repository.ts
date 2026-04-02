import { createClerkSupabaseClient, type ProjectRow } from '../lib/supabase'

type SupabaseClientLike = ReturnType<typeof createClerkSupabaseClient>

export class ProjectsRepository {
  private readonly client: SupabaseClientLike

  constructor(client: SupabaseClientLike) {
    this.client = client
  }

  async listByCompany(companyId: string): Promise<ProjectRow[]> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('company_id', companyId)
      .order('is_active', { ascending: false })
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []) as ProjectRow[]
  }

  async listByEmploymentContract(contractId: string): Promise<ProjectRow[]> {
    const { data, error } = await this.client
      .from('employment_contracts')
      .select('manager_profiles!inner(company_id)')
      .eq('id', contractId)
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data || typeof data !== 'object') return []

    const row = data as Record<string, unknown>
    const mp = row.manager_profiles
    const mpRec =
      typeof mp === 'object' && mp !== null ? (mp as Record<string, unknown>) : null
    const companyId = mpRec?.company_id != null ? String(mpRec.company_id) : ''
    if (!companyId) return []

    return this.listByCompany(companyId)
  }

  async create(params: {
    companyId: string
    name: string
    createdByContractId?: string
  }): Promise<void> {
    const payload = {
      company_id: params.companyId,
      name: params.name,
      created_by_contract_id: params.createdByContractId ?? null,
    }

    const { error } = await this.client.from('projects').insert(payload)
    if (error) throw new Error(error.message)
  }

  async archive(params: { id: string; companyId: string }): Promise<void> {
    const { error } = await this.client
      .from('projects')
      .update({ is_active: false })
      .eq('id', params.id)
      .eq('company_id', params.companyId)

    if (error) throw new Error(error.message)
  }

  async unarchive(params: { id: string; companyId: string }): Promise<void> {
    const { error } = await this.client
      .from('projects')
      .update({ is_active: true })
      .eq('id', params.id)
      .eq('company_id', params.companyId)

    if (error) throw new Error(error.message)
  }
}
