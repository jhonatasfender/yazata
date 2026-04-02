import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ManagerWorkspaceRequired } from '../components/manager-workspace-required'
import type { AppLayoutContext } from '../components/app-layout'
import { useEmployees } from '../hooks/use-employees'
import { showAlertDialog } from '../lib/dialog'
import type { HourlyRateInlineFormValues } from '../schemas/hourly-rate-inline-schema'
import { toCents } from '../utils/money'
import { TeamEditHourlyRateFormCard } from './team-edit-hourly-rate/team-edit-hourly-rate-form-card'
import {
  EmployeeNotFoundState,
  InactiveEmployeeState,
  ManagerRequiredState,
} from './team-edit-hourly-rate/team-edit-hourly-rate-states'

export const TeamEditHourlyRatePage = () => {
  const navigate = useNavigate()
  const { employeeId = '' } = useParams()
  const { manager, employee, activeWorkspaceContext } =
    useOutletContext<AppLayoutContext>()
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
      await showAlertDialog({
        title: 'Invalid value',
        text: (parseError as Error).message,
        icon: 'error',
      })
      return
    }

    const updated = await updateHourlyRate(employeeId, hourlyRateCents)
    if (!updated) return
    navigate('/employees')
  }

  if (!manager) {
    return <ManagerRequiredState />
  }

  if (employee && manager && activeWorkspaceContext === 'employee') {
    return <ManagerWorkspaceRequired />
  }

  if (!selectedEmployee) {
    return <EmployeeNotFoundState />
  }

  if (selectedEmployee.status === 'inactive') {
    return <InactiveEmployeeState />
  }

  return (
    <section className="space-y-6">
      <TeamEditHourlyRateFormCard
        selectedEmployee={selectedEmployee}
        error={error}
        onUpdate={onUpdate}
      />
    </section>
  )
}
