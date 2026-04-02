import { useMemo } from 'react'
import type { TimeEntryViewRow } from '../../repositories/time-entries-repository'
import { collectTimeEntryIssueIdsByEmploymentContract } from '../../utils/time-entry-overlap'
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
}: SummarySectionProps) => {
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
      const label = e.employee?.employee_email?.trim() || `Contrato ${cid.slice(0, 8)}…`
      byContract.set(cid, label)
    }
    return [...byContract.values()].sort((a, b) => a.localeCompare(b))
  }, [entries, issueEntryIds, showEmployeeColumn])

  return (
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
            issueEntryIds={issueEntryIds}
          />
          <SummaryRecentEntriesDesktop
            entries={entries}
            showEmployeeColumn={showEmployeeColumn}
            issueEntryIds={issueEntryIds}
          />
        </>
      ) : null}
    </article>
  )
}
