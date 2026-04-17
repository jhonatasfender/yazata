import { useMemo } from 'react'
import { collectTimeEntryIssueIdsByEmploymentContract } from '../../../utils/time-entry-overlap'
import type { RegisterEntry } from '../register-types'
import { RegisterMiniBoardDesktopEntryTable } from './desktop-entry-table'
import { RegisterMiniBoardMobileEntryList } from './mobile-entry-list'
import { RegisterMiniBoardStatCards } from './stat-cards'

type RegisterMiniBoardProps = {
  totalWeekHours: number
  totalWeekAmountCents: number
  entries: RegisterEntry[]
  error: string | null
  activeEntryId: string | null
  activeEntryElapsedLabel: string | null
  activeEntryPaused?: boolean
  onEditEntry: (entry: RegisterEntry) => void
  onDeleteEntry: (id: string) => Promise<void>
}

export const RegisterMiniBoard = ({
  totalWeekHours,
  totalWeekAmountCents,
  entries,
  error,
  activeEntryId,
  activeEntryElapsedLabel,
  activeEntryPaused = false,
  onEditEntry,
  onDeleteEntry,
}: RegisterMiniBoardProps) => {
  const issueEntryIds = useMemo(
    () => collectTimeEntryIssueIdsByEmploymentContract(entries),
    [entries],
  )

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-5">
      <RegisterMiniBoardStatCards
        totalWeekHours={totalWeekHours}
        totalWeekAmountCents={totalWeekAmountCents}
        entryCount={entries.length}
      />

      {error ? (
        <p className="mt-4 rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {entries.length === 0 ? (
        <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/50 py-8 text-center text-sm text-zinc-400">
          Nenhum registro ainda.
        </p>
      ) : (
        <>
          <RegisterMiniBoardMobileEntryList
            entries={entries}
            issueEntryIds={issueEntryIds}
            activeEntryId={activeEntryId}
            activeEntryElapsedLabel={activeEntryElapsedLabel}
            activeEntryPaused={activeEntryPaused}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
          />
          <RegisterMiniBoardDesktopEntryTable
            entries={entries}
            issueEntryIds={issueEntryIds}
            activeEntryId={activeEntryId}
            activeEntryElapsedLabel={activeEntryElapsedLabel}
            activeEntryPaused={activeEntryPaused}
            onEditEntry={onEditEntry}
            onDeleteEntry={onDeleteEntry}
          />
        </>
      )}
    </article>
  )
}
