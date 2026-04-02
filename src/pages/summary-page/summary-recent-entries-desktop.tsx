import { useSummaryEntryInProgressLive } from '../../hooks/use-summary-entry-in-progress-live'
import type { TimeEntryViewRow } from '../../repositories/time-entries-repository'
import { formatWorkDate } from '../../utils/time'
import {
  SummaryRecentEntryAmountCell,
  SummaryRecentEntryDurationCell,
  SummaryRecentEntryEndCell,
} from './summary-recent-entry-in-progress'

const emptyIssueEntryIds = new Set<string>()

type SummaryRecentEntriesDesktopProps = {
  entries: TimeEntryViewRow[]
  showEmployeeColumn: boolean
  issueEntryIds?: Set<string>
}

const SummaryRecentEntryRowDesktop = ({
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
    <tr className="border-b border-zinc-800/80 transition-colors last:border-0 hover:bg-zinc-900/50">
      {showEmployeeColumn ? (
        <td className="whitespace-nowrap px-3 py-2.5 text-zinc-400">
          {entry.employee?.employee_email ?? '-'}
        </td>
      ) : null}
      <td className="whitespace-nowrap px-3 py-2.5">{formatWorkDate(entry.work_date)}</td>
      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-zinc-400">
        {entry.start_time}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-zinc-400">
        <SummaryRecentEntryEndCell entry={entry} />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <SummaryRecentEntryDurationCell
          entry={entry}
          issueEntryIds={issueEntryIds}
          live={live}
        />
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <SummaryRecentEntryAmountCell entry={entry} live={live} />
      </td>
      <td className="max-w-56 truncate px-3 py-2.5 text-zinc-400">
        {entry.description ?? '-'}
      </td>
    </tr>
  )
}

export const SummaryRecentEntriesDesktop = ({
  entries,
  showEmployeeColumn,
  issueEntryIds = emptyIssueEntryIds,
}: SummaryRecentEntriesDesktopProps) => (
  <div className="mt-5 hidden overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/30 md:block">
    <div className="border-b border-zinc-800 bg-zinc-950/80 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Recent entries
      </p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
            {showEmployeeColumn ? (
              <th className="whitespace-nowrap px-3 py-2.5 font-medium">Employee</th>
            ) : null}
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">Date</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">Start</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">End</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">Hours</th>
            <th className="whitespace-nowrap px-3 py-2.5 font-medium">Amount</th>
            <th className="px-3 py-2.5 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="text-zinc-300">
          {entries.map((entry) => (
            <SummaryRecentEntryRowDesktop
              key={entry.id}
              entry={entry}
              showEmployeeColumn={showEmployeeColumn}
              issueEntryIds={issueEntryIds}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
