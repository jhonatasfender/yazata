import { Clock3, FileText, Wallet } from 'lucide-react'
import { formatBRL } from '../../utils/money'
import type { RegisterEntry } from './register-types'

type RegisterMiniBoardProps = {
  totalWeekHours: number
  totalWeekAmountCents: number
  entries: RegisterEntry[]
  error: string | null
  onEditEntry: (entry: RegisterEntry) => void
  onDeleteEntry: (id: string) => Promise<void>
}

export const RegisterMiniBoard = ({
  totalWeekHours,
  totalWeekAmountCents,
  entries,
  error,
  onEditEntry,
  onDeleteEntry,
}: RegisterMiniBoardProps) => (
  <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:p-5">
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Horas (7 dias)</p>
            <p className="mt-1 text-xl font-semibold">{totalWeekHours.toFixed(2)}h</p>
          </div>
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
        </div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Valor (7 dias)</p>
            <p className="mt-1 text-xl font-semibold">{formatBRL(totalWeekAmountCents)}</p>
          </div>
          <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
        </div>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-400">Registros</p>
            <p className="mt-1 text-xl font-semibold">{entries.length}</p>
          </div>
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
        </div>
      </div>
    </div>

    {error ? (
      <p className="mt-4 rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
        {error}
      </p>
    ) : null}

    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
      <div className="grid grid-cols-[120px_160px_100px_1fr_120px_120px] border-b border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
        <span>Data</span>
        <span>Início - fim</span>
        <span>Horas</span>
        <span>Descrição</span>
        <span>Projeto</span>
        <span>Ações</span>
      </div>

      <ul className="max-h-[460px] overflow-auto">
        {entries.length === 0 ? (
          <li className="px-3 py-6 text-sm text-zinc-400">Nenhum registro ainda.</li>
        ) : (
          entries.map((entry) => (
            <li
              key={entry.id}
              className="grid grid-cols-[120px_160px_100px_1fr_120px_120px] items-center gap-2 border-b border-zinc-900 px-3 py-2 text-sm last:border-none"
            >
              <span className="text-zinc-300">{entry.work_date}</span>
              <span className="text-zinc-300">
                {entry.start_time} - {entry.end_time}
              </span>
              <span className="font-medium">{entry.worked_hours.toFixed(2)}h</span>
              <div className="min-w-0">
                <p className="truncate text-zinc-200">{entry.description || '-'}</p>
                <p className="text-xs text-zinc-500">
                  {formatBRL(entry.gross_amount_cents)}
                </p>
              </div>
              <span className="truncate text-zinc-300">{entry.project?.name || '-'}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEditEntry(entry)}
                  className="cursor-pointer rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => void onDeleteEntry(entry.id)}
                  className="cursor-pointer rounded-md border border-red-700 px-2 py-1 text-xs text-red-200 hover:bg-red-950/30"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  </article>
)
