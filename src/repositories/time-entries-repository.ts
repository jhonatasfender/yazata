import { createClerkSupabaseClient, type TimeEntryRow } from '../lib/supabase'
import {
  TimeEntryMapper,
  type TimeEntryEmployeeRef,
  type TimeEntryMutationInput,
  type TimeEntryProjectRef,
} from './mappers/time-entry-mapper'

export type TimeEntryViewRow = TimeEntryRow & {
  employee?: TimeEntryEmployeeRef
  project?: TimeEntryProjectRef
}

type SupabaseClientLike = ReturnType<typeof createClerkSupabaseClient>

export class TimeEntriesRepository {
  private readonly client: SupabaseClientLike

  constructor(client: SupabaseClientLike) {
    this.client = client
  }

  async listByEmploymentContract(contractId: string): Promise<TimeEntryViewRow[]> {
    const { data, error } = await this.client
      .from('time_entries')
      .select(
        `
          *,
          project:projects(
            id,
            name,
            is_active
          )
        `,
      )
      .eq('employment_contract_id', contractId)
      .order('work_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (error) throw new Error(error.message)

    return this.mapRows(data)
  }

  async listByManagerProfile(managerProfileId: string): Promise<TimeEntryViewRow[]> {
    const { data: contractsData, error: contractsError } = await this.client
      .from('employment_contracts')
      .select('id')
      .eq('manager_profile_id', managerProfileId)

    if (contractsError) throw new Error(contractsError.message)

    const contractIds = (contractsData ?? [])
      .map((row) => (this.isRecord(row) ? String(row.id ?? '') : ''))
      .filter(Boolean)

    if (contractIds.length === 0) return []

    const { data, error } = await this.client
      .from('time_entries')
      .select(
        `
          *,
          employment_contract:employment_contracts!inner(
            id,
            employee_email,
            employee_display_name,
            manager_profile_id
          ),
          project:projects(
            id,
            name,
            is_active
          )
        `,
      )
      .in('employment_contract_id', contractIds)
      .order('work_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (error) throw new Error(error.message)

    return this.mapRows(data)
  }

  async createForEmployee(params: {
    employmentContractId: string
    input: TimeEntryMutationInput
    hourlyRateCents: number
  }): Promise<string> {
    const payload = TimeEntryMapper.toMutationFields(params.input, params.hourlyRateCents)

    const { data, error } = await this.client
      .from('time_entries')
      .insert({
        employment_contract_id: params.employmentContractId,
        ...payload,
      })
      .select('id')
      .single<{ id: string }>()

    if (error) throw new Error(error.message)
    return data.id
  }

  async updateForEmployee(params: {
    id: string
    employmentContractId: string
    input: TimeEntryMutationInput
    hourlyRateCents: number
  }): Promise<void> {
    const payload = TimeEntryMapper.toMutationFields(params.input, params.hourlyRateCents)

    const { error } = await this.client
      .from('time_entries')
      .update(payload)
      .eq('id', params.id)
      .eq('employment_contract_id', params.employmentContractId)

    if (error) throw new Error(error.message)
  }

  async deleteForEmployee(params: {
    id: string
    employmentContractId: string
  }): Promise<void> {
    const { error } = await this.client
      .from('time_entries')
      .delete()
      .eq('id', params.id)
      .eq('employment_contract_id', params.employmentContractId)

    if (error) throw new Error(error.message)
  }

  private mapRows(data: unknown): TimeEntryViewRow[] {
    if (!Array.isArray(data)) return []

    return data.map((row) => {
      const raw = this.isRecord(row) ? row : {}

      const ecRaw = this.isRecord(raw.employment_contract)
        ? raw.employment_contract
        : undefined
      const projectRaw = this.isRecord(raw.project) ? raw.project : undefined

      const employee: TimeEntryEmployeeRef | undefined = ecRaw
        ? {
            id: String(ecRaw.id ?? ''),
            employee_email: String(ecRaw.employee_email ?? ''),
            employee_display_name:
              ecRaw.employee_display_name === null ||
              ecRaw.employee_display_name === undefined
                ? null
                : String(ecRaw.employee_display_name),
          }
        : undefined

      const project: TimeEntryProjectRef | undefined = projectRaw
        ? {
            id: String(projectRaw.id ?? ''),
            name: String(projectRaw.name ?? ''),
            is_active: Boolean(projectRaw.is_active),
          }
        : undefined

      return {
        id: String(raw.id ?? ''),
        employment_contract_id: String(raw.employment_contract_id ?? ''),
        project_id:
          raw.project_id === null || raw.project_id === undefined
            ? null
            : String(raw.project_id),
        work_date: String(raw.work_date ?? ''),
        start_time: String(raw.start_time ?? ''),
        end_time: String(raw.end_time ?? ''),
        worked_hours: Number(raw.worked_hours ?? 0),
        hourly_rate_cents_snapshot: Number(raw.hourly_rate_cents_snapshot ?? 0),
        gross_amount_cents: Number(raw.gross_amount_cents ?? 0),
        description:
          raw.description === null || raw.description === undefined
            ? null
            : String(raw.description),
        created_at: String(raw.created_at ?? ''),
        employee,
        project,
      }
    })
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
  }
}
