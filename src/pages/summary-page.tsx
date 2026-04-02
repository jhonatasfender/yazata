import { Clock3, FileText, Wallet } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'
import { useTimeEntries } from '../hooks/use-time-entries'
import type { TimeEntryViewRow } from '../repositories/time-entries-repository'
import { formatBRL } from '../utils/money'
import {
  formatDurationBetweenTimes,
  formatHoursAndMinutes,
  formatWorkDate,
} from '../utils/time'

type SummarySectionProps = {
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

const SummarySection = ({
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

    {loading ? (
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="h-18 animate-pulse rounded-xl bg-zinc-800/40 ring-1 ring-zinc-800/60"
          />
        ))}
      </div>
    ) : (
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-950 to-zinc-950/80 p-3.5 ring-1 ring-violet-500/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-zinc-500">
                Hours
              </p>
              <p className="mt-0.5 text-[0.65rem] text-zinc-600">Last 7 days</p>
              <p className="mt-1.5 truncate text-xl font-semibold tabular-nums text-zinc-50">
                {formatHoursAndMinutes(totalWeekHours)}
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300/90">
              <Clock3 className="h-4 w-4" aria-hidden />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-950 to-zinc-950/80 p-3.5 ring-1 ring-emerald-500/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-zinc-500">
                Amount
              </p>
              <p className="mt-0.5 text-[0.65rem] text-zinc-600">Last 7 days</p>
              <p className="mt-1.5 truncate text-xl font-semibold tabular-nums text-zinc-50">
                {formatBRL(totalWeekAmountCents)}
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300/90">
              <Wallet className="h-4 w-4" aria-hidden />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-950 to-zinc-950/80 p-3.5 ring-1 ring-sky-500/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-zinc-500">
                Entries
              </p>
              <p className="mt-0.5 text-[0.65rem] text-zinc-600">In this period</p>
              <p className="mt-1.5 text-xl font-semibold tabular-nums text-zinc-50">
                {entries.length}
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300/90">
              <FileText className="h-4 w-4" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    )}

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
      <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/30">
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
                <tr
                  key={entry.id}
                  className="border-b border-zinc-800/80 transition-colors last:border-0 hover:bg-zinc-900/50"
                >
                  {showEmployeeColumn ? (
                    <td className="whitespace-nowrap px-3 py-2.5 text-zinc-400">
                      {entry.employee?.employee_email ?? '-'}
                    </td>
                  ) : null}
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {formatWorkDate(entry.work_date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-zinc-400">
                    {entry.start_time}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-zinc-400">
                    {entry.end_time}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium text-zinc-200">
                    {formatDurationBetweenTimes(
                      entry.start_time,
                      entry.end_time,
                      entry.worked_hours,
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-zinc-200">
                    {formatBRL(entry.gross_amount_cents)}
                  </td>
                  <td className="max-w-56 truncate px-3 py-2.5 text-zinc-400">
                    {entry.description ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : null}
  </article>
)

export const SummaryPage = () => {
  const { employee, manager, activeWorkspaceContext } =
    useOutletContext<AppLayoutContext>()
  const showMyHours = Boolean(employee) && activeWorkspaceContext === 'employee'
  const showTeamHours = Boolean(manager) && activeWorkspaceContext === 'manager'

  const myHoursQuery = useTimeEntries({
    enabled: showMyHours,
    mode: 'employee',
    employmentContractId: employee?.id,
    hourlyRateCents: employee?.hourly_rate_cents ?? 0,
  })

  const teamHoursQuery = useTimeEntries({
    enabled: showTeamHours,
    mode: 'manager',
    managerProfileId: manager?.id,
    hourlyRateCents: 0,
  })

  if (!employee && !manager) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Summary</h2>
        <p className="mt-2 text-zinc-300">
          Your account is not linked to any time entries yet.
        </p>
      </section>
    )
  }

  if (!showMyHours && !showTeamHours) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Summary</h2>
        <p className="mt-2 text-zinc-300">
          Switch workspace in the header to see employee or manager summaries.
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      {showMyHours ? (
        <SummarySection
          title="My time"
          profileHint="Active employment contract (employment_contract_id)."
          entries={myHoursQuery.entries}
          totalWeekHours={myHoursQuery.totalWeekHours}
          totalWeekAmountCents={myHoursQuery.totalWeekAmountCents}
          error={myHoursQuery.error}
          loading={myHoursQuery.loading}
          showEmployeeColumn={false}
          emptyMessage="No time entries for this contract in the selected window."
        />
      ) : null}

      {showTeamHours ? (
        <SummarySection
          title="Team time"
          profileHint="Contracts under your manager profile (company scope)."
          entries={teamHoursQuery.entries}
          totalWeekHours={teamHoursQuery.totalWeekHours}
          totalWeekAmountCents={teamHoursQuery.totalWeekAmountCents}
          error={teamHoursQuery.error}
          loading={teamHoursQuery.loading}
          showEmployeeColumn
          emptyMessage="No team time entries in this period."
        />
      ) : null}
    </div>
  )
}
