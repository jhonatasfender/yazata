import { createClerkSupabaseClient, type ProjectRow } from '../lib/supabase'

type SupabaseClientLike = ReturnType<typeof createClerkSupabaseClient>

export class ProjectsRepository {
  private readonly client: SupabaseClientLike

  constructor(client: SupabaseClientLike) {
    this.client = client
  }

  async listByManager(managerId: string): Promise<ProjectRow[]> {
    const { data, error } = await this.client
      .from('projects')
      .select('*')
      .eq('manager_id', managerId)
      .order('is_active', { ascending: false })
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return (data ?? []) as ProjectRow[]
  }

  async listByEmployee(employeeId: string): Promise<ProjectRow[]> {
    const { data, error } = await this.client
      .from('employees')
      .select('manager_id')
      .eq('id', employeeId)
      .limit(1)
      .maybeSingle<{ manager_id: string }>()

    if (error) throw new Error(error.message)
    if (!data?.manager_id) return []
    return this.listByManager(data.manager_id)
  }

  async create(params: {
    managerId: string
    name: string
    createdByEmployeeId?: string
  }): Promise<void> {
    const payload = {
      manager_id: params.managerId,
      name: params.name,
      created_by_employee_id: params.createdByEmployeeId ?? null,
    }

    const { error } = await this.client.from('projects').insert(payload)
    if (error) throw new Error(error.message)
  }

  async archive(params: { id: string; managerId: string }): Promise<void> {
    const { error } = await this.client
      .from('projects')
      .update({ is_active: false })
      .eq('id', params.id)
      .eq('manager_id', params.managerId)

    if (error) throw new Error(error.message)
  }

  async unarchive(params: { id: string; managerId: string }): Promise<void> {
    const { error } = await this.client
      .from('projects')
      .update({ is_active: true })
      .eq('id', params.id)
      .eq('manager_id', params.managerId)

    if (error) throw new Error(error.message)
  }
}
