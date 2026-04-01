import type { TimeEntryMutationInput } from '../../repositories/mappers/time-entry-mapper'

export type CreateTimeEntryInput = TimeEntryMutationInput
export type UpdateTimeEntryInput = TimeEntryMutationInput

export type UseTimeEntriesOptions = {
  enabled: boolean
  mode: 'employee' | 'manager'
  employeeId?: string
  managerId?: string
  hourlyRateCents?: number
}
