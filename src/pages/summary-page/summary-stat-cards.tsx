import { Clock3, Wallet } from 'lucide-react'
import { formatBRL } from '../../utils/money'
import { formatHoursAndMinutes } from '../../utils/time'

type SummaryStatCardsProps = {
  loading: boolean
  totalHours: number
  totalAmountCents: number
  periodLabel: string
}

export const SummaryStatCards = ({
  loading,
  totalHours,
  totalAmountCents,
  periodLabel,
}: SummaryStatCardsProps) => {
  if (loading) {
    return (
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[0, 1].map((key) => (
          <div
            key={key}
            className="h-18 animate-pulse rounded-xl bg-zinc-800/40 ring-1 ring-zinc-800/60"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-zinc-800 bg-linear-to-br from-zinc-950 to-zinc-950/80 p-3.5 ring-1 ring-violet-500/10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-zinc-500">
              Hours
            </p>
            <p className="mt-0.5 text-[0.65rem] text-zinc-600">{periodLabel}</p>
            <p className="mt-1.5 truncate text-xl font-semibold tabular-nums text-zinc-50">
              {formatHoursAndMinutes(totalHours)}
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
            <p className="mt-0.5 text-[0.65rem] text-zinc-600">{periodLabel}</p>
            <p className="mt-1.5 truncate text-xl font-semibold tabular-nums text-zinc-50">
              {formatBRL(totalAmountCents)}
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300/90">
            <Wallet className="h-4 w-4" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}
