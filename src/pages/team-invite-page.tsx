import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { ManagerWorkspaceRequired } from '../components/manager-workspace-required'
import type { AppLayoutContext } from '../components/app-layout'
import { Form } from '../components/forms/form'
import { Input } from '../components/forms/input'
import { SubmitButton } from '../components/forms/submit-button'
import { useEmployees } from '../hooks/use-employees'
import { showAlertDialog } from '../lib/dialog'
import {
  teamInviteSchema,
  type TeamInviteFormValues,
} from '../schemas/team-invite-schema'
import { toCents } from '../utils/money'

export const TeamInvitePage = () => {
  const navigate = useNavigate()
  const { manager, employee, activeWorkspaceContext } =
    useOutletContext<AppLayoutContext>()
  const { inviteEmployee } = useEmployees({
    enabled: Boolean(manager),
    managerId: manager?.id,
  })

  const onInvite = async ({ email, hourlyRate, displayName }: TeamInviteFormValues) => {
    let hourlyRateCents = 0

    try {
      hourlyRateCents = toCents(hourlyRate)
    } catch (parseError) {
      await showAlertDialog({
        title: 'Invalid value',
        text: (parseError as Error).message,
        icon: 'error',
      })
      return
    }

    const created = await inviteEmployee({
      email,
      hourlyRateCents,
      employeeDisplayName: displayName,
    })

    if (!created) return
    navigate('/employees')
  }

  if (!manager) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Employees</h2>
        <p className="mt-2 text-zinc-300">
          Your account is not set up as a manager yet. Create your company first, then you
          can invite people by email.
        </p>
        <Link
          to="/setup/manager"
          className="mt-4 inline-flex rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-500/25"
        >
          Set up company
        </Link>
      </section>
    )
  }

  if (employee && manager && activeWorkspaceContext === 'employee') {
    return <ManagerWorkspaceRequired />
  }

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Add employee</h2>
          <Link
            to="/employees"
            className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
          >
            Back to employees
          </Link>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Invite by email, optionally add a display name, and set an hourly rate.
        </p>

        <Form<TeamInviteFormValues>
          className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4"
          schema={teamInviteSchema}
          defaultValues={{ email: '', displayName: '', hourlyRate: '25.00' }}
          onSubmit={onInvite}
        >
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="employee@company.com"
          />
          <Input
            type="text"
            name="displayName"
            label="Name (optional)"
            placeholder="e.g. Maria Silva"
          />
          <Input
            type="text"
            name="hourlyRate"
            label="Hourly rate"
            placeholder="e.g. 25.00"
          />
          <SubmitButton
            loadingText="Saving..."
            className="h-10 rounded-lg px-6 md:col-span-2 md:w-auto md:self-end lg:col-span-1"
          >
            Add employee
          </SubmitButton>
        </Form>
      </article>
    </section>
  )
}
