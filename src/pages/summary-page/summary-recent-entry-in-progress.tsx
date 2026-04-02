import { TimeEntryIssueWarning } from '../../components/time-entry-issue-warning'
import type { SummaryInProgressLive } from '../../hooks/use-summary-entry-in-progress-live'
import type { TimeEntryViewRow } from '../../repositories/time-entries-repository'
import { formatBRL, grossCentsFromElapsedMs } from '../../utils/money'
import { isPersistedQuickEntryInProgress } from '../../utils/is-quick-entry-in-progress'
import { formatDurationBetweenTimes, formatElapsedClock } from '../../utils/time'

type DurationCellProps = {
  entry: TimeEntryViewRow
  issueEntryIds: Set<string>
  live: SummaryInProgressLive
}

export const SummaryRecentEntryDurationCell = ({
  entry,
  issueEntryIds,
  live,
}: DurationCellProps) => {
  const inProgress = isPersistedQuickEntryInProgress(entry)

  return (
    <span className="inline-flex items-center gap-1.5 font-medium text-zinc-200">
      {issueEntryIds.has(entry.id) ? (
        <TimeEntryIssueWarning className="inline-flex" />
      ) : null}
      {inProgress ? (
        <span
          className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5"
          title="Em andamento"
        >
          <span className="text-xs font-medium text-violet-200/80">Em andamento</span>
          {live.state === 'running' ? (
            <span className="font-mono text-xs tabular-nums text-violet-200">
              {formatElapsedClock(live.elapsedMs)}
            </span>
          ) : (
            <span className="text-zinc-500">—</span>
          )}
        </span>
      ) : (
        formatDurationBetweenTimes(entry.start_time, entry.end_time, entry.worked_hours)
      )}
    </span>
  )
}

type AmountCellProps = {
  entry: TimeEntryViewRow
  live: SummaryInProgressLive
}

export const SummaryRecentEntryAmountCell = ({ entry, live }: AmountCellProps) => {
  if (live.state === 'running') {
    const cents = grossCentsFromElapsedMs(
      live.elapsedMs,
      entry.hourly_rate_cents_snapshot,
    )
    return (
      <span
        className="tabular-nums text-zinc-200"
        title="Valor estimado enquanto em andamento"
      >
        {formatBRL(cents)}
      </span>
    )
  }

  return (
    <span className="tabular-nums text-zinc-200">
      {formatBRL(entry.gross_amount_cents)}
    </span>
  )
}

export const SummaryRecentEntryEndCell = ({ entry }: { entry: TimeEntryViewRow }) =>
  isPersistedQuickEntryInProgress(entry) ? (
    <span className="text-zinc-500" title="Em andamento">
      —
    </span>
  ) : (
    entry.end_time
  )
