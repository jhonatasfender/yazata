import { useOutletContext } from 'react-router-dom'

import type { AppLayoutContext } from '../app-layout'
import { WorkspaceContextControls } from '../layout/workspace-context-controls'

export const ProfileWorkspacePanel = () => {
  const {
    employee,
    managers,
    selectedManagerProfileId,
    setSelectedManagerProfileId,
    activeWorkspaceContext,
    setActiveWorkspaceContext,
  } = useOutletContext<AppLayoutContext>()

  const managerOptions = managers.map((entry) => ({
    id: entry.id,
    companyName: entry.company_name,
  }))

  return (
    <div className="min-h-0 min-w-0 flex-1">
      <WorkspaceContextControls
        variant="profile"
        hasEmployeeRole={Boolean(employee)}
        hasManagerRole={managers.length > 0}
        activeWorkspaceContext={activeWorkspaceContext}
        onSelectWorkspaceContext={setActiveWorkspaceContext}
        managerOptions={managerOptions}
        selectedManagerProfileId={selectedManagerProfileId}
        onSelectManagerProfile={setSelectedManagerProfileId}
      />
    </div>
  )
}
