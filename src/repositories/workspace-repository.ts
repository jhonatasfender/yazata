import {
  createClerkSupabaseClient,
  type EmployeeRow,
  type ManagerRow,
} from '../lib/supabase'

type SupabaseClientLike = ReturnType<typeof createClerkSupabaseClient>

function companyDisplayName(legalName: string, tradeName: string | null): string {
  const t = tradeName?.trim()
  if (t) return t
  return legalName.trim()
}

export class WorkspaceRepository {
  private readonly client: SupabaseClientLike

  constructor(client: SupabaseClientLike) {
    this.client = client
  }

  async ensureUserRow(params: {
    clerkUserId: string
    primaryEmail?: string | null
  }): Promise<void> {
    const { error } = await this.client.from('users').upsert(
      {
        clerk_user_id: params.clerkUserId,
        primary_email: params.primaryEmail?.trim() || null,
      },
      { onConflict: 'clerk_user_id' },
    )

    if (error) throw new Error(error.message)
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

    return Number(rpcUpdatedRows ?? 0)
  }

  async findEmployeeByClerkUserId(clerkUserId: string): Promise<EmployeeRow | null> {
    const { data: userRow, error: userError } = await this.client
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle<{ id: string }>()

    if (userError) throw new Error(userError.message)
    if (!userRow?.id) return null

    const { data, error } = await this.client
      .from('employment_contracts')
      .select(
        `
          id,
          manager_profile_id,
          company_tax_profile_id,
          employee_user_id,
          employee_email,
          hourly_rate_cents,
          status,
          starts_at,
          ends_at,
          created_at,
          manager_profiles!inner(company_id)
        `,
      )
      .eq('employee_user_id', userRow.id)
      .eq('status', 'active')
      .order('starts_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data || typeof data !== 'object') return null

    const row = data as Record<string, unknown>
    const mp = row.manager_profiles
    const mpRec =
      typeof mp === 'object' && mp !== null ? (mp as Record<string, unknown>) : null
    const companyId = mpRec?.company_id != null ? String(mpRec.company_id) : ''

    if (!companyId) return null

    return {
      id: String(row.id ?? ''),
      manager_profile_id: String(row.manager_profile_id ?? ''),
      company_tax_profile_id:
        row.company_tax_profile_id === null || row.company_tax_profile_id === undefined
          ? null
          : String(row.company_tax_profile_id),
      employee_user_id:
        row.employee_user_id === null || row.employee_user_id === undefined
          ? null
          : String(row.employee_user_id),
      employee_email: String(row.employee_email ?? ''),
      hourly_rate_cents: Number(row.hourly_rate_cents ?? 0),
      status: row.status as EmployeeRow['status'],
      starts_at:
        row.starts_at === null || row.starts_at === undefined
          ? null
          : String(row.starts_at),
      ends_at:
        row.ends_at === null || row.ends_at === undefined ? null : String(row.ends_at),
      created_at: String(row.created_at ?? ''),
      company_id: companyId,
    }
  }

  private mapManagerProfileRow(data: Record<string, unknown>): ManagerRow {
    const companies = data.companies
    const c =
      typeof companies === 'object' && companies !== null
        ? (companies as Record<string, unknown>)
        : null

    const legalName = c ? String(c.legal_name ?? '') : ''
    const tradeName =
      c?.trade_name === null || c?.trade_name === undefined ? null : String(c.trade_name)

    return {
      id: String(data.id ?? ''),
      user_id: String(data.user_id ?? ''),
      company_id: String(data.company_id ?? ''),
      settings_json:
        typeof data.settings_json === 'object' && data.settings_json !== null
          ? (data.settings_json as Record<string, unknown>)
          : {},
      created_at: String(data.created_at ?? ''),
      company_name: companyDisplayName(legalName, tradeName),
      company_legal_name: legalName,
      company_trade_name: tradeName,
    }
  }

  async listManagerProfilesByClerkUserId(clerkUserId: string): Promise<ManagerRow[]> {
    const { data, error } = await this.client
      .from('manager_profiles')
      .select(
        `
          id,
          user_id,
          company_id,
          settings_json,
          created_at,
          users!inner(clerk_user_id),
          companies!inner(legal_name, trade_name)
        `,
      )
      .eq('users.clerk_user_id', clerkUserId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    const rows = (data ?? []) as Record<string, unknown>[]
    return rows.map((row) => this.mapManagerProfileRow(row))
  }

  async countManagedEmployees(managerProfileId: string): Promise<number> {
    const { count, error } = await this.client
      .from('employment_contracts')
      .select('id', { count: 'exact', head: true })
      .eq('manager_profile_id', managerProfileId)

    if (error) throw new Error(error.message)
    return count ?? 0
  }

  async createCompanyAndManagerProfile(params: {
    clerkUserId: string
    primaryEmail?: string | null
    legalName: string
    tradeName?: string | null
  }): Promise<{ companyId: string; managerProfileId: string }> {
    await this.ensureUserRow({
      clerkUserId: params.clerkUserId,
      primaryEmail: params.primaryEmail,
    })

    const trade = params.tradeName?.trim()

    const { data, error } = await this.client.rpc('register_company_as_manager', {
      p_legal_name: params.legalName.trim(),
      p_trade_name: trade && trade.length > 0 ? trade : '',
    })

    if (error) {
      throw new Error(error.message)
    }

    const payload = data as {
      company_id?: string
      manager_profile_id?: string
    } | null
    const companyId = payload?.company_id
    const managerProfileId = payload?.manager_profile_id

    if (!companyId || !managerProfileId) {
      throw new Error('Company setup returned incomplete data.')
    }

    return { companyId, managerProfileId }
  }

  async updateCompany(params: {
    companyId: string
    legalName: string
    tradeName: string | null
  }): Promise<void> {
    const legal = params.legalName.trim()
    if (legal.length < 2) {
      throw new Error('Legal name is required')
    }

    const trade = params.tradeName?.trim() ? params.tradeName.trim() : null

    const { error } = await this.client
      .from('companies')
      .update({
        legal_name: legal,
        trade_name: trade,
      })
      .eq('id', params.companyId)

    if (error) throw new Error(error.message)
  }
}
