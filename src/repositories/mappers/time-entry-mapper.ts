import { toHours } from '../../utils/time'

export type TimeEntryMutationInput = {
  workDate: string
  startTime: string
  endTime: string
  description: string
  projectId?: string | null
}

export type TimeEntryEmployeeRef = {
  id: string
  employee_email: string
  employee_display_name: string | null
}

export type TimeEntryProjectRef = {
  id: string
  name: string
  is_active: boolean
}

type TimeEntryMutationFields = {
  work_date: string
  start_time: string
  end_time: string
  project_id: string | null
  worked_hours: number
  hourly_rate_cents_snapshot: number
  gross_amount_cents: number
  description: string | null
}

export class TimeEntryMapper {
  static toMutationFields(
    input: TimeEntryMutationInput,
    hourlyRateCents: number,
  ): TimeEntryMutationFields {
    const workedHours = toHours(input.startTime, input.endTime)
    const grossAmountCents = Math.round(workedHours * hourlyRateCents)
    const normalizedProjectId = input.projectId?.trim()

    return {
      work_date: input.workDate,
      start_time: input.startTime,
      end_time: input.endTime,
      project_id: normalizedProjectId ? normalizedProjectId : null,
      worked_hours: workedHours,
      hourly_rate_cents_snapshot: hourlyRateCents,
      gross_amount_cents: grossAmountCents,
      description: input.description.trim() || null,
    }
  }
}
