import { Link, useOutletContext } from 'react-router-dom'
import { Pencil, Trash2, UserMinus } from 'lucide-react'
import { ManagerWorkspaceRequired } from '../components/manager-workspace-required'
import type { AppLayoutContext } from '../components/app-layout'
import { useEmployees } from '../hooks/use-employees'
import { confirmDialog, showAlertDialog } from '../lib/dialog'
import { formatBRL } from '../utils/money'
import { employeeDisplayLabel } from '../utils/employee-display-label'

export const TeamPage = () => {
  const { manager, employee, activeWorkspaceContext } =
    useOutletContext<AppLayoutContext>()
  const { employees, error, loading, terminateEmployee } = useEmployees({
    enabled: Boolean(manager),
    managerId: manager?.id,
  })

  const getStatusLabel = (status: (typeof employees)[number]['status']) => {
    if (status === 'active') return 'Active'
    if (status === 'inactive') return 'Inactive'
    return 'Pending'
  }

  const onTerminateEmployee = async (employeeId: string, hasHours: boolean) => {
    const confirmationMessage = hasHours
      ? 'Terminate this person? Time history will be kept.'
      : 'Remove this person? There are no time entries, so the record will be deleted.'

    const confirmed = await confirmDialog({
      title: 'Confirm',
      text: confirmationMessage,
      confirmButtonText: hasHours ? 'Terminate' : 'Remove',
    })
    if (!confirmed) return

    const result = await terminateEmployee(employeeId)
    if (!result) return

    if (result === 'hard_deleted') {
      await showAlertDialog({
        title: 'Removed',
        text: 'Employee record removed.',
        icon: 'success',
      })
      return
    }

    await showAlertDialog({
      title: 'Terminated',
      text: 'Employee terminated; history preserved.',
      icon: 'success',
    })
  }

  if (!manager) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold">Employees</h2>
        <p className="mt-2 text-zinc-300">
          Set up your company here first, then you can invite and manage employees.
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
          <h2 className="text-lg font-semibold">Employees</h2>
          <Link
            to="/employees/create"
            className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-zinc-500"
          >
            Add employee
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
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Hourly rate</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900">
              {employees.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-zinc-400" colSpan={5}>
                    No employees yet.
                  </td>
                </tr>
              ) : (
                employees.map((currentEmployee) => (
                  <tr key={currentEmployee.id}>
                    <td className="px-4 py-3 text-zinc-100">
                      {employeeDisplayLabel(currentEmployee)}
                    </td>
                    <td className="max-w-[12rem] truncate px-4 py-3 text-zinc-400">
                      {currentEmployee.employee_email}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {getStatusLabel(currentEmployee.status)}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {formatBRL(currentEmployee.hourly_rate_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/employees/${currentEmployee.id}/edit`}
                          aria-label="Edit employee"
                          title="Edit employee"
                          className="inline-flex rounded-md border border-zinc-700 p-2 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800"
                        >
                          <Pencil size={14} />
                        </Link>
                        {currentEmployee.status !== 'inactive' ? (
                          <button
                            type="button"
                            onClick={() =>
                              void onTerminateEmployee(
                                currentEmployee.id,
                                currentEmployee.timeEntriesCount > 0,
                              )
                            }
                            disabled={loading}
                            aria-label={
                              currentEmployee.timeEntriesCount > 0
                                ? 'Terminate and keep history'
                                : 'Remove employee'
                            }
                            title={
                              currentEmployee.timeEntriesCount > 0
                                ? 'Terminate and keep history'
                                : 'Remove permanently'
                            }
                            className="inline-flex rounded-md border border-red-900 p-2 text-red-200 hover:border-red-700 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {currentEmployee.timeEntriesCount > 0 ? (
                              <UserMinus size={14} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        ) : null}
                      </div>
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
