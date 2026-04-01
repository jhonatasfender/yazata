import { Link, Navigate, useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'
import { useEmployees } from '../hooks/use-employees'
import { formatBRL } from '../utils/money'

export const TeamPage = () => {
  const { manager, employee } = useOutletContext<AppLayoutContext>()
  const { employees, error } = useEmployees({
    enabled: Boolean(manager),
    managerId: manager?.id,
  })

  if (employee) {
    return <Navigate to="/" replace />
  }

  if (!manager) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Equipe</h2>
        <p className="mt-2 text-zinc-300">
          Seu usuário ainda não foi provisionado como gestor.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Funcionários cadastrados</h2>
          <Link
            to="/equipe/cadastrar"
            className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
          >
            Cadastrar funcionário
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-400">Total: {employees.length}</p>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-800">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-zinc-950 text-left text-zinc-300">
              <tr>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Valor/hora</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900">
              {employees.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-400" colSpan={4}>
                    Nenhum funcionário cadastrado.
                  </td>
                </tr>
              ) : (
                employees.map((currentEmployee) => (
                  <tr key={currentEmployee.id}>
                    <td className="px-4 py-3 text-zinc-100">
                      {currentEmployee.employee_email}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {currentEmployee.status === 'active' ? 'Vinculado' : 'Pendente'}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {formatBRL(currentEmployee.hourly_rate_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/equipe/${currentEmployee.id}/editar`}
                        className="inline-flex rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
