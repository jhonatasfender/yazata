import type { TimeEntryViewRow } from '../../repositories/time-entries-repository'
import type { TimeEntryProjectRef } from '../../repositories/mappers/time-entry-mapper'
import type { TimeEntryFormValues } from '../../schemas/time-entry-schema'

export type EditingEntry = {
  id: string
  values: TimeEntryFormValues
  project?: TimeEntryProjectRef
}

export type RegisterEntry = TimeEntryViewRow
