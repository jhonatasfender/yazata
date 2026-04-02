import { Link } from 'react-router-dom'

const BackToEmployeesLink = () => (
  <Link
    to="/employees"
    className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
  >
    Back to employees
  </Link>
)

export const ManagerRequiredState = () => (
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
    <h2 className="text-lg font-semibold">Employees</h2>
    <p className="mt-2 text-zinc-300">Your account is not provisioned as a manager.</p>
  </section>
)

export const EmployeeNotFoundState = () => (
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">Employee not found</h2>
      <BackToEmployeesLink />
    </div>
  </section>
)

export const InactiveEmployeeState = () => (
  <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-lg font-semibold">Inactive employee</h2>
      <BackToEmployeesLink />
    </div>
    <p className="mt-3 text-sm text-zinc-300">
      This employee is inactive; hourly rate cannot be changed.
    </p>
  </section>
)
