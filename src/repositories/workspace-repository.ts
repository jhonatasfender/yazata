import {
  createClerkSupabaseClient,
  type EmployeeRow,
  type ManagerRow,
} from '../lib/supabase'

type SupabaseClientLike = ReturnType<typeof createClerkSupabaseClient>

export class WorkspaceRepository {
  private readonly client: SupabaseClientLike

  constructor(client: SupabaseClientLike) {
    this.client = client
  }

  async claimEmployeeInvite(params: {
    clerkUserId: string
    email: string
  }): Promise<number> {
    const normalizedEmail = params.email.trim().toLowerCase()

    const { data: rpcUpdatedRows, error: rpcError } = await this.client.rpc(
      'claim_employee_invite_by_email',
      {
        p_clerk_user_id: params.clerkUserId,
        p_email: normalizedEmail,
      },
    )

    if (rpcError) throw new Error(rpcError.message)

    const updatedRows = Number(rpcUpdatedRows ?? 0)
    if (updatedRows > 0) return updatedRows

    const { data: fallbackData, error: fallbackError } = await this.client
      .from('employees')
      .update({
        employee_clerk_user_id: params.clerkUserId,
        status: 'active',
      })
      .is('employee_clerk_user_id', null)
      .ilike('employee_email', normalizedEmail)
      .select('id')

    if (fallbackError) throw new Error(fallbackError.message)
    return Array.isArray(fallbackData) ? fallbackData.length : 0
  }

  async findEmployeeByClerkUserId(clerkUserId: string): Promise<EmployeeRow | null> {
    const { data, error } = await this.client
      .from('employees')
      .select('*')
      .eq('employee_clerk_user_id', clerkUserId)
      .limit(1)
      .maybeSingle<EmployeeRow>()

    if (error) throw new Error(error.message)
    return data ?? null
  }

  async findManagerByClerkUserId(clerkUserId: string): Promise<ManagerRow | null> {
    const { data, error } = await this.client
      .from('managers')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .limit(1)
      .maybeSingle<ManagerRow>()

    if (error) throw new Error(error.message)
    return data ?? null
  }

  async countManagedEmployees(managerId: string): Promise<number> {
    const { count, error } = await this.client
      .from('employees')
      .select('id', { count: 'exact', head: true })
      .eq('manager_id', managerId)

    if (error) throw new Error(error.message)
    return count ?? 0
  }
}
