import { useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth, useUser } from '@clerk/react'
import type { AppLayoutContext } from '../components/app-layout'
import { Form } from '../components/forms/form'
import { Input } from '../components/forms/input'
import { SubmitButton } from '../components/forms/submit-button'
import { createClerkSupabaseClient } from '../lib/supabase'
import { WorkspaceRepository } from '../repositories/workspace-repository'
import {
  setupManagerCompanySchema,
  type SetupManagerCompanyFormValues,
} from '../schemas/setup-manager-company-schema'

export const SetupManagerPage = () => {
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const { manager, refreshWorkspace, setActiveWorkspaceContext } =
    useOutletContext<AppLayoutContext>()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const repository = useMemo(() => {
    const client = createClerkSupabaseClient(getToken)
    return new WorkspaceRepository(client)
  }, [getToken])

  const onSubmit = async ({ legalName, tradeName }: SetupManagerCompanyFormValues) => {
    if (!user?.id) {
      setSubmitError('You must be signed in.')
      return
    }

    setSubmitError(null)
    try {
      await repository.createCompanyAndManagerProfile({
        clerkUserId: user.id,
        primaryEmail: user.primaryEmailAddress?.emailAddress ?? null,
        legalName,
        tradeName: tradeName?.trim() ? tradeName : null,
      })
      setActiveWorkspaceContext('manager')
      await refreshWorkspace()
      navigate('/employees', { replace: true })
    } catch (err) {
      setSubmitError((err as Error).message)
    }
  }

  if (manager) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Set up company</h2>
        <p className="mt-2 text-zinc-300">
          You already have a manager workspace. Invite employees and manage time from
          there.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/employees"
            className="inline-flex rounded-lg border border-violet-500/50 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-500/25"
          >
            Go to Employees
          </Link>
          <Link
            to="/profile/company"
            className="inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-500"
          >
            Edit company name
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Set up company</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Tell us you manage a team: we create your company and your manager profile so
          you can invite people by email. This does not affect your employee access if you
          also work for someone else.
        </p>

        <Form<SetupManagerCompanyFormValues>
          className="mt-6 grid max-w-xl gap-4"
          schema={setupManagerCompanySchema}
          defaultValues={{ legalName: '', tradeName: '' }}
          onSubmit={onSubmit}
        >
          <Input
            type="text"
            name="legalName"
            label="Legal name"
            placeholder="e.g. Acme Ltda"
            autoComplete="organization"
          />
          <Input
            type="text"
            name="tradeName"
            label="Trade name (optional)"
            placeholder="Name shown in the app"
            autoComplete="organization-title"
          />
          {submitError ? (
            <p className="rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
              {submitError}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <SubmitButton
              loadingText="Creating..."
              className="w-auto rounded-lg border border-violet-500/60 bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              Create company &amp; manager access
            </SubmitButton>
            <Link
              to="/time-entries/register"
              className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Cancel
            </Link>
          </div>
        </Form>
      </article>
    </section>
  )
}
