import { useSummaryEntryInProgressLive } from '../../hooks/use-summary-entry-in-progress-live'
import type { TimeEntryViewRow } from '../../repositories/time-entries-repository'
import { formatWorkDate } from '../../utils/time'
import {
  SummaryRecentEntryAmountCell,
  SummaryRecentEntryDurationCell,
  SummaryRecentEntryEndCell,
} from './summary-recent-entry-in-progress'

const emptyIssueEntryIds = new Set<string>()

type SummaryRecentEntriesMobileProps = {
  entries: TimeEntryViewRow[]
  showEmployeeColumn: boolean
  issueEntryIds?: Set<string>
}

const SummaryRecentEntryCardMobile = ({
  entry,
  showEmployeeColumn,
  issueEntryIds,
}: {
  entry: TimeEntryViewRow
  showEmployeeColumn: boolean
  issueEntryIds: Set<string>
}) => {
  const live = useSummaryEntryInProgressLive(entry)

  return (
    <li className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 ring-1 ring-zinc-800/60">
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
            {entry.start_time} → <SummaryRecentEntryEndCell entry={entry} />
          </p>
        </div>
        <div className="flex shrink-0 items-center text-sm font-semibold tabular-nums text-violet-200">
          <SummaryRecentEntryDurationCell
            entry={entry}
            issueEntryIds={issueEntryIds}
            live={live}
          />
        </div>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-zinc-200">
        {entry.description?.trim() ? entry.description : '—'}
      </p>
      <p className="mt-2 text-sm text-zinc-300">
        <SummaryRecentEntryAmountCell entry={entry} live={live} />
      </p>
    </li>
  )
}

export const SummaryRecentEntriesMobile = ({
  entries,
  showEmployeeColumn,
  issueEntryIds = emptyIssueEntryIds,
}: SummaryRecentEntriesMobileProps) => (
  <div className="mt-5 md:hidden">
    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
      Recent entries
    </p>
    <ul className="space-y-3" aria-label="Recent entries">
      {entries.map((entry) => (
        <SummaryRecentEntryCardMobile
          key={entry.id}
          entry={entry}
          showEmployeeColumn={showEmployeeColumn}
          issueEntryIds={issueEntryIds}
        />
      ))}
    </ul>
  </div>
)
