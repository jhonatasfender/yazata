import { useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../../components/app-layout'
import { useTimeEntries } from '../../hooks/use-time-entries'
import { SummaryPageUnlinked, SummaryPageWorkspaceHint } from './summary-page-states'
import { SummarySection } from './summary-section'

export const SummaryPage = () => {
  const { employee, manager, activeWorkspaceContext } =
    useOutletContext<AppLayoutContext>()
  const showMyHours = Boolean(employee) && activeWorkspaceContext === 'employee'
  const showTeamHours = Boolean(manager) && activeWorkspaceContext === 'manager'

  const myHoursQuery = useTimeEntries({
    enabled: showMyHours,
    mode: 'employee',
    employmentContractId: employee?.id,
    hourlyRateCents: employee?.hourly_rate_cents ?? 0,
  })

  const teamHoursQuery = useTimeEntries({
    enabled: showTeamHours,
    mode: 'manager',
    managerProfileId: manager?.id,
    hourlyRateCents: 0,
  })

  if (!employee && !manager) {
    return <SummaryPageUnlinked />
  }

  if (!showMyHours && !showTeamHours) {
    return <SummaryPageWorkspaceHint />
  }

  return (
    <div className="space-y-6">
      {showMyHours ? (
        <SummarySection
          title="My time"
          profileHint="Active employment contract (employment_contract_id)."
          entries={myHoursQuery.entries}
          error={myHoursQuery.error}
          loading={myHoursQuery.loading}
          showEmployeeColumn={false}
          emptyMessage="No time entries for this contract in the selected window."
          onRefresh={myHoursQuery.reloadEntries}
        />
      ) : null}

      {showTeamHours ? (
        <SummarySection
          title="Team time"
          profileHint="Contracts under your manager profile (company scope)."
          entries={teamHoursQuery.entries}
          error={teamHoursQuery.error}
          loading={teamHoursQuery.loading}
          showEmployeeColumn
          emptyMessage="No team time entries in this period."
          onRefresh={teamHoursQuery.reloadEntries}
        />
      ) : null}
    </div>
  )
}
