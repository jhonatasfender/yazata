import type { TimeEntryViewRow } from '../../repositories/time-entries-repository'
import { SummaryRecentEntriesDesktop } from './summary-recent-entries-desktop'
import { SummaryRecentEntriesMobile } from './summary-recent-entries-mobile'
import { SummaryStatCards } from './summary-stat-cards'

export type SummarySectionProps = {
  title: string
  profileHint: string
  entries: TimeEntryViewRow[]
  totalWeekHours: number
  totalWeekAmountCents: number
  error: string | null
  loading: boolean
  showEmployeeColumn: boolean
  emptyMessage: string
}

export const SummarySection = ({
  title,
  profileHint,
  entries,
  totalWeekHours,
  totalWeekAmountCents,
  error,
  loading,
  showEmployeeColumn,
  emptyMessage,
}: SummarySectionProps) => (
  <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-5">
    <header className="border-b border-zinc-800/80 pb-4">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h2>
      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
        {profileHint}
      </p>
    </header>

    <SummaryStatCards
      loading={loading}
      totalWeekHours={totalWeekHours}
      totalWeekAmountCents={totalWeekAmountCents}
      entryCount={entries.length}
    />

    {error ? (
      <p className="mt-4 rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
        {error}
      </p>
    ) : null}

    {!loading && !error && entries.length === 0 ? (
      <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-300">
        {emptyMessage}
      </p>
    ) : null}

    {!loading && entries.length > 0 ? (
      <>
        <SummaryRecentEntriesMobile
          entries={entries}
          showEmployeeColumn={showEmployeeColumn}
        />
        <SummaryRecentEntriesDesktop
          entries={entries}
          showEmployeeColumn={showEmployeeColumn}
        />
      </>
    ) : null}
  </article>
)
