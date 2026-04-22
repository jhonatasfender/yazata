import { Link } from 'react-router-dom'
import { Form } from '../../components/forms/form'
import { Input } from '../../components/forms/input'
import { SubmitButton } from '../../components/forms/submit-button'
import type { EmployeeRow } from '../../lib/supabase'
import {
  teamEmployeeContractEditSchema,
  type TeamEmployeeContractEditFormValues,
} from '../../schemas/team-employee-contract-edit-schema'
import { centsToInputValue, formatBRL } from '../../utils/money'
import { employeeDisplayLabel } from '../../utils/employee-display-label'

type TeamEditHourlyRateFormCardProps = {
  selectedEmployee: EmployeeRow
  error: string | null
  onUpdate: (values: TeamEmployeeContractEditFormValues) => Promise<void>
}

export const TeamEditHourlyRateFormCard = ({
  selectedEmployee,
  error,
  onUpdate,
}: TeamEditHourlyRateFormCardProps) => (
  <article className="rounded-2xl border border-zinc-800 bg-linear-to-b from-zinc-900 to-zinc-900/80 p-5 shadow-lg shadow-black/20 md:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Edit hourly rate</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Update this employee&apos;s hourly rate.
        </p>
      </div>
      <Link
        to="/employees"
        className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
      >
        Back to employees
      </Link>
    </div>

    <div className="mt-5 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 md:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">Employee</p>
        <p className="mt-1 text-sm font-medium text-zinc-100">
          {employeeDisplayLabel(selectedEmployee)}
        </p>
        <p className="mt-1 break-all text-xs text-zinc-500">
          {selectedEmployee.employee_email}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Current hourly rate
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

    <Form<TeamEmployeeContractEditFormValues>
      key={selectedEmployee.id}
      className="mt-5 max-w-2xl space-y-3"
      schema={teamEmployeeContractEditSchema}
      defaultValues={{
        hourlyRate: centsToInputValue(selectedEmployee.hourly_rate_cents),
        displayName: selectedEmployee.employee_display_name ?? '',
      }}
      onSubmit={onUpdate}
    >
      <Input
        type="text"
        name="displayName"
        label="Display name"
        placeholder="e.g. Maria Silva"
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <Input
            type="text"
            name="hourlyRate"
            label="New hourly rate"
            placeholder="e.g. 25.00"
          />
        </div>
        <SubmitButton className="md:mb-0.5 md:w-auto md:min-w-56">
          Save changes
        </SubmitButton>
      </div>
      <p className="text-xs text-zinc-500">
        Tip: use dot or comma for cents (e.g. 25.50 or 25,50).
      </p>
    </Form>
  </article>
)
