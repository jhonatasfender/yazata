import { useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'
import { useTimeEntries } from '../hooks/use-time-entries'
import { formatBRL } from '../utils/money'

export const SummaryPage = () => {
  const { employee, manager } = useOutletContext<AppLayoutContext>()
  const mode = manager ? 'manager' : 'employee'
  const { entries, totalWeekHours, totalWeekAmountCents, error } = useTimeEntries({
    enabled: Boolean(manager || employee),
    mode,
    managerId: manager?.id,
    employeeId: employee?.id,
    hourlyRateCents: employee?.hourly_rate_cents ?? 0,
  })

  if (!employee && !manager) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Resumo detalhado</h2>
        <p className="mt-2 text-zinc-300">
          Seu usuário ainda não possui vínculo com registros de horas.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-lg font-semibold">Resumo detalhado</h2>
      <p className="mt-2 text-zinc-300">
        Horas nos últimos 7 dias: {totalWeekHours.toFixed(2)}h
      </p>
      <p className="mt-1 text-zinc-300">
        Valor nos últimos 7 dias: {formatBRL(totalWeekAmountCents)}
      </p>
      <p className="mt-1 text-sm text-zinc-400">Registros carregados: {entries.length}</p>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              {mode === 'manager' ? <th className="px-3 py-2">Funcionário</th> : null}
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Início</th>
              <th className="px-3 py-2">Fim</th>
              <th className="px-3 py-2">Horas</th>
              <th className="px-3 py-2">Valor</th>
              <th className="px-3 py-2">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-zinc-900">
                {mode === 'manager' ? (
                  <td className="px-3 py-2">{entry.employee?.employee_email ?? '-'}</td>
                ) : null}
                <td className="px-3 py-2">{entry.work_date}</td>
                <td className="px-3 py-2">{entry.start_time}</td>
                <td className="px-3 py-2">{entry.end_time}</td>
                <td className="px-3 py-2">{entry.worked_hours.toFixed(2)}h</td>
                <td className="px-3 py-2">{formatBRL(entry.gross_amount_cents)}</td>
                <td className="px-3 py-2 text-zinc-300">{entry.description ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
