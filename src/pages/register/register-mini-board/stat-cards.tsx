import { Clock3, FileText, Wallet } from 'lucide-react'
import { formatBRL } from '../../../utils/money'
import { formatHoursAndMinutes } from '../../../utils/time'

type RegisterMiniBoardStatCardsProps = {
  totalWeekHours: number
  totalWeekAmountCents: number
  entryCount: number
}

export const RegisterMiniBoardStatCards = ({
  totalWeekHours,
  totalWeekAmountCents,
  entryCount,
}: RegisterMiniBoardStatCardsProps) => (
  <div className="grid gap-3 md:grid-cols-3">
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">Horas (7 dias)</p>
          <p className="mt-1 text-xl font-semibold">
            {formatHoursAndMinutes(totalWeekHours)}
          </p>
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
          <p className="mt-1 text-xl font-semibold">{entryCount}</p>
        </div>
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" aria-hidden />
      </div>
    </div>
  </div>
)
