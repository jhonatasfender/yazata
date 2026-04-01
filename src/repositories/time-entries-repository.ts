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

  async listByEmployee(employeeId: string): Promise<TimeEntryViewRow[]> {
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
      .eq('employee_id', employeeId)
      .order('work_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (error) throw new Error(error.message)
    return this.mapRows(data)
  }

  async listByManager(managerId: string): Promise<TimeEntryViewRow[]> {
    const { data, error } = await this.client
      .from('time_entries')
      .select(
        `
          *,
          employee:employees!inner(
            id,
            employee_email,
            manager_id
          ),
          project:projects(
            id,
            name,
            is_active
          )
        `,
      )
      .eq('employee.manager_id', managerId)
      .order('work_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (error) throw new Error(error.message)
    return this.mapRows(data)
  }

  async createForEmployee(params: {
    employeeId: string
    input: TimeEntryMutationInput
    hourlyRateCents: number
  }): Promise<string> {
    const payload = TimeEntryMapper.toMutationFields(params.input, params.hourlyRateCents)

    const { data, error } = await this.client
      .from('time_entries')
      .insert({
        employee_id: params.employeeId,
        ...payload,
      })
      .select('id')
      .single<{ id: string }>()

    if (error) throw new Error(error.message)
    return data.id
  }

  async updateForEmployee(params: {
    id: string
    employeeId: string
    input: TimeEntryMutationInput
    hourlyRateCents: number
  }): Promise<void> {
    const payload = TimeEntryMapper.toMutationFields(params.input, params.hourlyRateCents)

    const { error } = await this.client
      .from('time_entries')
      .update(payload)
      .eq('id', params.id)
      .eq('employee_id', params.employeeId)

    if (error) throw new Error(error.message)
  }

  async deleteForEmployee(params: { id: string; employeeId: string }): Promise<void> {
    const { error } = await this.client
      .from('time_entries')
      .delete()
      .eq('id', params.id)
      .eq('employee_id', params.employeeId)

    if (error) throw new Error(error.message)
  }

  private mapRows(data: unknown): TimeEntryViewRow[] {
    if (!Array.isArray(data)) return []

    return data.map((row) => {
      const raw = this.isRecord(row) ? row : {}

      const employeeRaw = this.isRecord(raw.employee) ? raw.employee : undefined
      const projectRaw = this.isRecord(raw.project) ? raw.project : undefined
      const employee: TimeEntryEmployeeRef | undefined = employeeRaw
        ? {
            id: String(employeeRaw.id ?? ''),
            employee_email: String(employeeRaw.employee_email ?? ''),
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
        employee_id: String(raw.employee_id ?? ''),
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
