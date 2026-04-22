import { createClerkSupabaseClient, type EmployeeRow } from '../lib/supabase'

type SupabaseClientLike = ReturnType<typeof createClerkSupabaseClient>

export type ManagedEmployee = EmployeeRow & {
  timeEntriesCount: number
}

export type TerminateEmployeeResult = 'hard_deleted' | 'soft_deleted'

export class EmployeesRepository {
  private readonly client: SupabaseClientLike

  constructor(client: SupabaseClientLike) {
    this.client = client
  }

  async listByManager(managerProfileId: string): Promise<ManagedEmployee[]> {
    const { data, error } = await this.client
      .from('employment_contracts')
      .select(
        `
          id,
          manager_profile_id,
          company_tax_profile_id,
          employee_user_id,
          employee_email,
          employee_display_name,
          hourly_rate_cents,
          status,
          starts_at,
          ends_at,
          created_at,
          manager_profiles!inner(company_id)
        `,
      )
      .eq('manager_profile_id', managerProfileId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    const rows = (data ?? []) as Record<string, unknown>[]

    return Promise.all(
      rows.map(async (raw) => {
        const mp = raw.manager_profiles
        const mpRec =
          typeof mp === 'object' && mp !== null ? (mp as Record<string, unknown>) : null
        const companyId = mpRec?.company_id != null ? String(mpRec.company_id) : ''

        const employee: EmployeeRow = {
          id: String(raw.id ?? ''),
          manager_profile_id: String(raw.manager_profile_id ?? ''),
          company_tax_profile_id:
            raw.company_tax_profile_id === null ||
            raw.company_tax_profile_id === undefined
              ? null
              : String(raw.company_tax_profile_id),
          employee_user_id:
            raw.employee_user_id === null || raw.employee_user_id === undefined
              ? null
              : String(raw.employee_user_id),
          employee_email: String(raw.employee_email ?? ''),
          employee_display_name:
            raw.employee_display_name === null || raw.employee_display_name === undefined
              ? null
              : String(raw.employee_display_name),
          hourly_rate_cents: Number(raw.hourly_rate_cents ?? 0),
          status: raw.status as EmployeeRow['status'],
          starts_at:
            raw.starts_at === null || raw.starts_at === undefined
              ? null
              : String(raw.starts_at),
          ends_at:
            raw.ends_at === null || raw.ends_at === undefined
              ? null
              : String(raw.ends_at),
          created_at: String(raw.created_at ?? ''),
          company_id: companyId,
        }

        const { count, error: countError } = await this.client
          .from('time_entries')
          .select('id', { count: 'exact', head: true })
          .eq('employment_contract_id', employee.id)

        if (countError) throw new Error(countError.message)

        return {
          ...employee,
          timeEntriesCount: count ?? 0,
        } satisfies ManagedEmployee
      }),
    )
  }

  async invite(params: {
    managerProfileId: string
    email: string
    hourlyRateCents: number
    employeeDisplayName?: string | null
  }): Promise<void> {
    const normalizedEmail = params.email.trim().toLowerCase()

    const { data: profile, error: profileError } = await this.client
      .from('manager_profiles')
      .select('company_id')
      .eq('id', params.managerProfileId)
      .maybeSingle<{ company_id: string }>()

    if (profileError) throw new Error(profileError.message)
    if (!profile?.company_id) throw new Error('Perfil de gestor não encontrado.')

    const { data: taxProfile, error: taxError } = await this.client
      .from('company_tax_profiles')
      .select('id')
      .eq('company_id', profile.company_id)
      .eq('is_primary', true)
      .maybeSingle<{ id: string }>()

    if (taxError) throw new Error(taxError.message)

    const { error: deletePendingError } = await this.client
      .from('employment_contracts')
      .delete()
      .eq('manager_profile_id', params.managerProfileId)
      .eq('status', 'pending')
      .ilike('employee_email', normalizedEmail)

    if (deletePendingError) throw new Error(deletePendingError.message)

    const displayName = params.employeeDisplayName?.trim()
      ? params.employeeDisplayName.trim()
      : null

    const { error } = await this.client.from('employment_contracts').insert({
      manager_profile_id: params.managerProfileId,
      company_tax_profile_id: taxProfile?.id ?? null,
      employee_email: normalizedEmail,
      employee_user_id: null,
      employee_display_name: displayName,
      hourly_rate_cents: params.hourlyRateCents,
      status: 'pending',
    })

    if (error) throw new Error(error.message)
  }

  async updateHourlyRate(params: {
    contractId: string
    managerProfileId: string
    hourlyRateCents: number
    employeeDisplayName?: string | null
  }): Promise<void> {
    const patch: { hourly_rate_cents: number; employee_display_name?: string | null } = {
      hourly_rate_cents: params.hourlyRateCents,
    }
    if (params.employeeDisplayName !== undefined) {
      const trimmed = params.employeeDisplayName?.trim()
      patch.employee_display_name = trimmed ? trimmed : null
    }

    const { error } = await this.client
      .from('employment_contracts')
      .update(patch)
      .eq('id', params.contractId)
      .eq('manager_profile_id', params.managerProfileId)

    if (error) throw new Error(error.message)
  }

  async terminateEmployee(params: {
    contractId: string
  }): Promise<TerminateEmployeeResult> {
    const { data, error } = await this.client.rpc('terminate_employment_contract', {
      p_contract_id: params.contractId,
    })

    if (error) throw new Error(error.message)

    const result =
      typeof data === 'object' && data !== null && 'result' in data
        ? String((data as { result?: unknown }).result)
        : ''

    if (result !== 'hard_deleted' && result !== 'soft_deleted') {
      throw new Error('Não foi possível desligar o funcionário.')
    }

    return result
  }
}
