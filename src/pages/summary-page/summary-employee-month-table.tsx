import { formatBRL } from '../../utils/money'
import { formatHoursAndMinutes } from '../../utils/time'
import type { SummaryEmployeeMonthRow } from '../../hooks/use-summary-month-aggregates-live'
import { employeeDisplayLabel } from '../../utils/employee-display-label'

type SummaryEmployeeMonthTableProps = {
  rows: SummaryEmployeeMonthRow[]
}

const effectiveHourlyRateCents = (amountCents: number, hours: number): number | null => {
  if (hours <= 0 || !Number.isFinite(hours)) return null
  return Math.round(amountCents / hours)
}

export const SummaryEmployeeMonthTable = ({ rows }: SummaryEmployeeMonthTableProps) => (
  <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/30">
    <div className="border-b border-zinc-800 bg-zinc-950/80 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Por funcionário
      </p>
      <p className="mt-0.5 text-[0.65rem] text-zinc-600">
        Horas, valor/hora efetivo no mês (total ÷ horas) e valor total. Ordenado por valor
        total.
      </p>
    </div>
    <table className="min-w-full text-left text-sm">
      <thead>
        <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
          <th className="whitespace-nowrap px-3 py-2.5 font-medium">Funcionário</th>
          <th className="whitespace-nowrap px-3 py-2.5 font-medium">Horas</th>
          <th className="whitespace-nowrap px-3 py-2.5 font-medium">Valor/h</th>
          <th className="whitespace-nowrap px-3 py-2.5 font-medium">Valor</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
        {rows.map((row) => {
          const hourlyCents = effectiveHourlyRateCents(row.amountCents, row.hours)
          return (
            <tr key={row.employmentContractId} className="bg-zinc-900/40">
              <td className="max-w-[14rem] px-3 py-2.5 text-zinc-200">
                <span className="block truncate font-medium text-zinc-100">
                  {employeeDisplayLabel({
                    employee_email: row.email,
                    employee_display_name: row.displayName,
                  })}
                </span>
                {row.displayName?.trim() ? (
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">
                    {row.email}
                  </span>
                ) : null}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                {formatHoursAndMinutes(row.hours)}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-zinc-200">
                {hourlyCents !== null ? formatBRL(hourlyCents) : '—'}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 tabular-nums font-medium text-zinc-100">
                {formatBRL(row.amountCents)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  </div>
)
