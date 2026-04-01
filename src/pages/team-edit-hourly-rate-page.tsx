import {
  Link,
  Navigate,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'
import { Form } from '../components/forms/form'
import { Input } from '../components/forms/input'
import { SubmitButton } from '../components/forms/submit-button'
import { useEmployees } from '../hooks/use-employees'
import {
  hourlyRateInlineSchema,
  type HourlyRateInlineFormValues,
} from '../schemas/hourly-rate-inline-schema'
import { centsToInputValue, formatBRL, toCents } from '../utils/money'

export const TeamEditHourlyRatePage = () => {
  const navigate = useNavigate()
  const { employeeId = '' } = useParams()
  const { manager, employee } = useOutletContext<AppLayoutContext>()
  const { employees, error, updateHourlyRate } = useEmployees({
    enabled: Boolean(manager),
    managerId: manager?.id,
  })

  const selectedEmployee = employees.find((entry) => entry.id === employeeId)

  const onUpdate = async ({ hourlyRate }: HourlyRateInlineFormValues) => {
    let hourlyRateCents = 0

    try {
      hourlyRateCents = toCents(hourlyRate)
    } catch (parseError) {
      window.alert((parseError as Error).message)
      return
    }

    const updated = await updateHourlyRate(employeeId, hourlyRateCents)
    if (!updated) return
    navigate('/equipe')
  }

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

  if (!selectedEmployee) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Funcionário não encontrado</h2>
          <Link
            to="/equipe"
            className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
          >
            Voltar para equipe
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-zinc-800 bg-linear-to-b from-zinc-900 to-zinc-900/80 p-5 shadow-lg shadow-black/20 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Editar valor/hora</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Atualize o valor/hora do colaborador de forma segura.
            </p>
          </div>
          <Link
            to="/equipe"
            className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
          >
            Voltar para equipe
          </Link>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Funcionário</p>
            <p className="mt-1 break-all text-sm font-medium text-zinc-100">
              {selectedEmployee.employee_email}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Valor/hora atual
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-200">
              {formatBRL(selectedEmployee.hourly_rate_cents)}
            </p>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <Form<HourlyRateInlineFormValues>
          className="mt-5 max-w-2xl space-y-3"
          schema={hourlyRateInlineSchema}
          defaultValues={{
            hourlyRate: centsToInputValue(selectedEmployee.hourly_rate_cents),
          }}
          onSubmit={onUpdate}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <Input
                type="text"
                name="hourlyRate"
                label="Novo valor/hora"
                placeholder="Ex.: 25.00"
              />
            </div>
            <SubmitButton className="md:mb-0.5 md:w-auto md:min-w-56">
              Salvar alterações
            </SubmitButton>
          </div>
          <p className="text-xs text-zinc-500">
            Dica: use ponto ou vírgula para centavos (ex.: 25.50 ou 25,50).
          </p>
        </Form>
      </article>
    </section>
  )
}
