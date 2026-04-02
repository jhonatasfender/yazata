import { formatBRL } from '../../../utils/money'
import { formatWorkDate } from '../../../utils/time'
import type { RegisterEntry } from '../register-types'
import { RegisterEntryRowActions } from './entry-actions'
import { getRegisterEntryRowLabels } from './entry-row-labels'

type RegisterMiniBoardDesktopEntryTableProps = {
  entries: RegisterEntry[]
  activeEntryId: string | null
  activeEntryElapsedLabel: string | null
  onEditEntry: (entry: RegisterEntry) => void
  onDeleteEntry: (id: string) => Promise<void>
}

export const RegisterMiniBoardDesktopEntryTable = ({
  entries,
  activeEntryId,
  activeEntryElapsedLabel,
  onEditEntry,
  onDeleteEntry,
}: RegisterMiniBoardDesktopEntryTableProps) => (
  <div className="mt-4 hidden overflow-hidden rounded-xl border border-zinc-800 md:block">
    <div className="grid grid-cols-[120px_160px_100px_1fr_120px_120px] border-b border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
      <span>Data</span>
      <span>Início - fim</span>
      <span>Horas</span>
      <span>Descrição</span>
      <span>Projeto</span>
      <span>Ações</span>
    </div>

    <ul className="max-h-[460px] overflow-auto">
      {entries.map((entry) => {
        const { durationLabel, timeRangeLabel } = getRegisterEntryRowLabels(entry, {
          activeEntryId,
          activeEntryElapsedLabel,
        })

        return (
          <li
            key={entry.id}
            className="grid grid-cols-[120px_160px_100px_1fr_120px_120px] items-center gap-2 border-b border-zinc-900 px-3 py-2 text-sm last:border-none"
          >
            <span className="text-zinc-300">{formatWorkDate(entry.work_date)}</span>
            <span className="text-zinc-300">{timeRangeLabel}</span>
            <span className="font-medium">{durationLabel}</span>
            <div className="min-w-0">
              <p className="truncate text-zinc-200">{entry.description || '-'}</p>
              <p className="text-xs text-zinc-500">
                {formatBRL(entry.gross_amount_cents)}
              </p>
            </div>
            <span className="truncate text-zinc-300">{entry.project?.name || '-'}</span>
            <RegisterEntryRowActions
              entry={entry}
              iconSize="sm"
              onEditEntry={onEditEntry}
              onDeleteEntry={onDeleteEntry}
            />
          </li>
        )
      })}
    </ul>
  </div>
)
