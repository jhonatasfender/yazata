import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSummaryMonthAggregatesLive } from '../../hooks/use-summary-month-aggregates-live'
import type { TimeEntryViewRow } from '../../repositories/time-entries-repository'
import { collectTimeEntryIssueIdsByEmploymentContract } from '../../utils/time-entry-overlap'
import {
  formatYearMonthLabel,
  getCurrentYearMonthLocal,
  isWorkDateInYearMonth,
} from '../../utils/summary-year-month'
import { SummaryEmployeeMonthTable } from './summary-employee-month-table'
import { SummaryLiveProvider } from './summary-live-context'
import { SummaryRecentEntriesDesktop } from './summary-recent-entries-desktop'
import { SummaryRecentEntriesMobile } from './summary-recent-entries-mobile'
import { SummaryStatCards } from './summary-stat-cards'
import { employeeDisplayLabel } from '../../utils/employee-display-label'

export type SummarySectionProps = {
  title: string
  profileHint: string
  entries: TimeEntryViewRow[]
  error: string | null
  loading: boolean
  showEmployeeColumn: boolean
  emptyMessage: string
  onRefresh: () => void | Promise<void>
}

type SummarySectionLiveBodyProps = {
  entries: TimeEntryViewRow[]
  yearMonth: string
  loading: boolean
  error: string | null
  showEmployeeColumn: boolean
  emptyMessage: string
  issueEntryIds: Set<string>
  employeesWithIssues: string[]
}

const SummarySectionLiveBody = ({
  entries,
  yearMonth,
  loading,
  error,
  showEmployeeColumn,
  emptyMessage,
  issueEntryIds,
  employeesWithIssues,
}: SummarySectionLiveBodyProps) => {
  const { monthEntries, totalHours, totalAmountCents, employeeRows } =
    useSummaryMonthAggregatesLive(entries, yearMonth)

  const periodLabel = useMemo(() => formatYearMonthLabel(yearMonth), [yearMonth])

  const hasAnyEntries = entries.length > 0
  const monthIsEmpty = !loading && hasAnyEntries && monthEntries.length === 0

  return (
    <>
      <SummaryStatCards
        loading={loading}
        totalHours={totalHours}
        totalAmountCents={totalAmountCents}
        periodLabel={periodLabel}
      />

      {error ? (
        <p className="mt-4 rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {employeesWithIssues.length > 0 ? (
        <p className="mt-4 rounded-lg border border-amber-800/80 bg-amber-950/30 px-3 py-2 text-xs leading-relaxed text-amber-100">
          <span className="font-medium text-amber-200">Conflitos por funcionário: </span>
          {employeesWithIssues.join(', ')}
        </p>
      ) : null}

      {issueEntryIds.size > 0 && !showEmployeeColumn ? (
        <p className="mt-4 rounded-lg border border-amber-800/80 bg-amber-950/30 px-3 py-2 text-xs text-amber-100">
          Há registros com sobreposição ou horário inválido — veja o aviso ao lado das
          horas.
        </p>
      ) : null}

      {!loading && !error && !hasAnyEntries ? (
        <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-300">
          {emptyMessage}
        </p>
      ) : null}

      {monthIsEmpty ? (
        <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-sm text-zinc-300">
          Nenhum lançamento em {periodLabel}.
        </p>
      ) : null}

      {showEmployeeColumn && !loading && monthEntries.length > 0 ? (
        <SummaryEmployeeMonthTable rows={employeeRows} />
      ) : null}

      {!loading && monthEntries.length > 0 ? (
        <>
          <SummaryRecentEntriesMobile
            entries={monthEntries}
            showEmployeeColumn={showEmployeeColumn}
            issueEntryIds={issueEntryIds}
            periodLabel={periodLabel}
          />
          <SummaryRecentEntriesDesktop
            entries={monthEntries}
            showEmployeeColumn={showEmployeeColumn}
            issueEntryIds={issueEntryIds}
            periodLabel={periodLabel}
          />
        </>
      ) : null}
    </>
  )
}

export const SummarySection = ({
  title,
  profileHint,
  entries,
  error,
  loading,
  showEmployeeColumn,
  emptyMessage,
  onRefresh,
}: SummarySectionProps) => {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonthLocal)

  const issueEntryIds = useMemo(
    () => collectTimeEntryIssueIdsByEmploymentContract(entries),
    [entries],
  )

  const employeesWithIssues = useMemo(() => {
    if (!showEmployeeColumn || issueEntryIds.size === 0) return []
    const byContract = new Map<string, string>()
    for (const e of entries) {
      if (!issueEntryIds.has(e.id)) continue
      const cid = e.employment_contract_id
      if (!cid || byContract.has(cid)) continue
      const label = e.employee
        ? employeeDisplayLabel(e.employee)
        : `Contrato ${cid.slice(0, 8)}…`
      byContract.set(cid, label)
    }
    return [...byContract.values()].sort((a, b) => a.localeCompare(b))
  }, [entries, issueEntryIds, showEmployeeColumn])

  const monthEntriesForLive = useMemo(
    () => entries.filter((e) => isWorkDateInYearMonth(e.work_date, yearMonth)),
    [entries, yearMonth],
  )

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-5">
      <header className="flex flex-col gap-3 border-b border-zinc-800/80 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">
            {profileHint}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2 sm:shrink-0">
          <label className="flex flex-col gap-1">
            <span className="text-[0.65rem] font-medium uppercase tracking-wide text-zinc-500">
              Mês
            </span>
            <input
              type="month"
              value={yearMonth}
              onChange={(event) => setYearMonth(event.target.value)}
              className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/60 focus-visible:ring-2 focus-visible:ring-violet-500/25"
              aria-label="Mês de referência para totais e lançamentos"
            />
          </label>
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={loading}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Atualizar listagem"
            title="Atualizar listagem"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              aria-hidden
            />
          </button>
        </div>
      </header>

      <SummaryLiveProvider entries={monthEntriesForLive}>
        <SummarySectionLiveBody
          entries={entries}
          yearMonth={yearMonth}
          loading={loading}
          error={error}
          showEmployeeColumn={showEmployeeColumn}
          emptyMessage={emptyMessage}
          issueEntryIds={issueEntryIds}
          employeesWithIssues={employeesWithIssues}
        />
      </SummaryLiveProvider>
    </article>
  )
}
