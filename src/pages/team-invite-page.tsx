import { Link, Navigate, useNavigate, useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'
import { Form } from '../components/forms/form'
import { Input } from '../components/forms/input'
import { SubmitButton } from '../components/forms/submit-button'
import { useEmployees } from '../hooks/use-employees'
import {
  teamInviteSchema,
  type TeamInviteFormValues,
} from '../schemas/team-invite-schema'
import { toCents } from '../utils/money'

export const TeamInvitePage = () => {
  const navigate = useNavigate()
  const { manager, employee } = useOutletContext<AppLayoutContext>()
  const { inviteEmployee } = useEmployees({
    enabled: Boolean(manager),
    managerId: manager?.id,
  })

  const onInvite = async ({ email, hourlyRate }: TeamInviteFormValues) => {
    let hourlyRateCents = 0

    try {
      hourlyRateCents = toCents(hourlyRate)
    } catch (parseError) {
      window.alert((parseError as Error).message)
      return
    }

    const created = await inviteEmployee({
      email,
      hourlyRateCents,
    })

    if (!created) return
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

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Cadastrar funcionário</h2>
          <Link
            to="/equipe"
            className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
          >
            Voltar para equipe
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Convide por e-mail e já defina o valor por hora.
        </p>

        <Form<TeamInviteFormValues>
          className="mt-4 grid gap-3 md:grid-cols-3"
          schema={teamInviteSchema}
          defaultValues={{ email: '', hourlyRate: '25.00' }}
          onSubmit={onInvite}
        >
          <Input
            type="email"
            name="email"
            label="E-mail"
            placeholder="funcionario@empresa.com"
          />
          <Input
            type="text"
            name="hourlyRate"
            label="Valor/hora"
            placeholder="Ex.: 25.00"
          />
          <SubmitButton
            loadingText="Salvando..."
            className="h-10 rounded-lg px-6 md:w-auto md:self-end"
          >
            Cadastrar funcionário
          </SubmitButton>
        </Form>
      </article>
    </section>
  )
}
