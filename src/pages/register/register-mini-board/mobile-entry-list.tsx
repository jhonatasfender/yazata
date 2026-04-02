import { formatBRL } from '../../../utils/money'
import { formatWorkDate } from '../../../utils/time'
import type { RegisterEntry } from '../register-types'
import { RegisterEntryRowActions } from './entry-actions'
import { getRegisterEntryRowLabels } from './entry-row-labels'

type RegisterMiniBoardMobileEntryListProps = {
  entries: RegisterEntry[]
  activeEntryId: string | null
  activeEntryElapsedLabel: string | null
  onEditEntry: (entry: RegisterEntry) => void
  onDeleteEntry: (id: string) => Promise<void>
}

export const RegisterMiniBoardMobileEntryList = ({
  entries,
  activeEntryId,
  activeEntryElapsedLabel,
  onEditEntry,
  onDeleteEntry,
}: RegisterMiniBoardMobileEntryListProps) => (
  <ul className="mt-4 space-y-3 md:hidden" aria-label="Registros recentes">
    {entries.map((entry) => {
      const { durationLabel, timeRangeLabel } = getRegisterEntryRowLabels(entry, {
        activeEntryId,
        activeEntryElapsedLabel,
      })

      return (
        <li
          key={entry.id}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 shadow-sm ring-1 ring-zinc-800/60"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {formatWorkDate(entry.work_date)}
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-400">{timeRangeLabel}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums text-violet-200">
              {durationLabel}
            </p>
          </div>
          <p className="mt-2 line-clamp-3 text-sm text-zinc-200">
            {entry.description?.trim() ? entry.description : '—'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
            <span className="min-w-0 truncate">
              <span className="text-zinc-500">Projeto: </span>
              <span className="text-zinc-300">{entry.project?.name || '—'}</span>
            </span>
            <span className="tabular-nums text-zinc-300">
              {formatBRL(entry.gross_amount_cents)}
            </span>
          </div>
          <div className="mt-3 flex justify-end gap-2 border-t border-zinc-800/80 pt-3">
            <RegisterEntryRowActions
              entry={entry}
              iconSize="md"
              onEditEntry={onEditEntry}
              onDeleteEntry={onDeleteEntry}
            />
          </div>
        </li>
      )
    })}
  </ul>
)
