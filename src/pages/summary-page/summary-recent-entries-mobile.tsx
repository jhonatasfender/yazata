import type { TimeEntryViewRow } from '../../repositories/time-entries-repository'
import { formatBRL } from '../../utils/money'
import { formatDurationBetweenTimes, formatWorkDate } from '../../utils/time'

type SummaryRecentEntriesMobileProps = {
  entries: TimeEntryViewRow[]
  showEmployeeColumn: boolean
}

export const SummaryRecentEntriesMobile = ({
  entries,
  showEmployeeColumn,
}: SummaryRecentEntriesMobileProps) => (
  <div className="mt-5 md:hidden">
    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
      Recent entries
    </p>
    <ul className="space-y-3" aria-label="Recent entries">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 ring-1 ring-zinc-800/60"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {formatWorkDate(entry.work_date)}
              </p>
              {showEmployeeColumn ? (
                <p className="mt-1 truncate text-xs text-zinc-400">
                  {entry.employee?.employee_email ?? '—'}
                </p>
              ) : null}
              <p className="mt-1 font-mono text-xs text-zinc-400">
                {entry.start_time} → {entry.end_time}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-violet-200">
              {formatDurationBetweenTimes(
                entry.start_time,
                entry.end_time,
                entry.worked_hours,
              )}
            </p>
          </div>
          <p className="mt-2 line-clamp-3 text-sm text-zinc-200">
            {entry.description?.trim() ? entry.description : '—'}
          </p>
          <p className="mt-2 text-sm tabular-nums text-zinc-300">
            {formatBRL(entry.gross_amount_cents)}
          </p>
        </li>
      ))}
    </ul>
  </div>
)
