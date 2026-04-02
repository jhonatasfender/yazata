import { useMemo, useState } from 'react'
import { Link, Navigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '@clerk/react'
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

type CompanySettingsPageProps = {
  embedded?: boolean
}

export const CompanySettingsPage = ({ embedded = false }: CompanySettingsPageProps) => {
  const { getToken } = useAuth()
  const { manager, refreshWorkspace } = useOutletContext<AppLayoutContext>()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const repository = useMemo(() => {
    const client = createClerkSupabaseClient(getToken)
    return new WorkspaceRepository(client)
  }, [getToken])

  if (!manager) {
    return <Navigate to="/setup/manager" replace />
  }

  const defaultValues: SetupManagerCompanyFormValues = {
    legalName: manager.company_legal_name,
    tradeName: manager.company_trade_name ?? '',
  }

  const onSubmit = async ({ legalName, tradeName }: SetupManagerCompanyFormValues) => {
    setSubmitError(null)
    setSaved(false)
    try {
      await repository.updateCompany({
        companyId: manager.company_id,
        legalName,
        tradeName: tradeName?.trim() ? tradeName : null,
      })
      await refreshWorkspace()
      setSaved(true)
    } catch (err) {
      setSubmitError((err as Error).message)
    }
  }

  const body = (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="text-lg font-semibold">Company</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Legal and trade names for{' '}
        <span className="font-medium text-zinc-200">{manager.company_name}</span>. This is
        what your team sees where the company is shown.
      </p>

      <Form<SetupManagerCompanyFormValues>
        className="mt-6 grid max-w-xl gap-4"
        schema={setupManagerCompanySchema}
        defaultValues={defaultValues}
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
        {saved ? (
          <p className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 p-3 text-sm text-emerald-200">
            Company details saved.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <SubmitButton
            loadingText="Saving..."
            className="w-auto rounded-lg border border-violet-500/60 bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Save changes
          </SubmitButton>
          {embedded ? (
            <Link
              to="/profile"
              className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
            >
              Back to account
            </Link>
          ) : null}
          <Link
            to="/employees"
            className="inline-flex items-center rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500"
          >
            Back to employees
          </Link>
        </div>
      </Form>
    </article>
  )

  if (embedded) {
    return <div className="min-h-0 min-w-0 flex-1">{body}</div>
  }

  return <section className="space-y-6">{body}</section>
}
