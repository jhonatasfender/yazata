import type { ActiveWorkspaceContext } from '../../../hooks/use-workspace-context'
import type { DerivedWorkspaceUi } from './derive-workspace-ui'
import type { WorkspaceManagerOption } from './types'
import { WorkspaceCompanyBlock } from './workspace-company-block'
import { WorkspaceRoleHints } from './workspace-role-hints'
import { WorkspaceRoleToggle } from './workspace-role-toggle'

type WorkspaceInnerBodyProps = {
  ui: DerivedWorkspaceUi
  activeWorkspaceContext: ActiveWorkspaceContext
  onSelectWorkspaceContext: (context: ActiveWorkspaceContext) => void
  managerOptions: WorkspaceManagerOption[]
  selectedManagerProfileId: string | null
  onSelectManagerProfile: (id: string) => void
  companySelectId: string
  sidebarCompact: boolean
  omitToggleSubLabel: boolean
}

export const WorkspaceInnerBody = ({
  ui,
  activeWorkspaceContext,
  onSelectWorkspaceContext,
  managerOptions,
  selectedManagerProfileId,
  onSelectManagerProfile,
  companySelectId,
  sidebarCompact,
  omitToggleSubLabel,
}: WorkspaceInnerBodyProps) => {
  const showEmployeeHint = ui.employeeOnlyHint && !ui.hideRoleHintsInSidebarCompact
  const showManagerHint = ui.managerOnlyHint && !ui.hideRoleHintsInSidebarCompact

  return (
    <>
      {ui.showWorkspaceToggle ? (
        <WorkspaceRoleToggle
          mode={sidebarCompact ? 'sidebar-icons' : 'segmented'}
          activeWorkspaceContext={activeWorkspaceContext}
          onSelect={onSelectWorkspaceContext}
          showSegmentHeading={!sidebarCompact && !omitToggleSubLabel}
        />
      ) : null}

      <WorkspaceCompanyBlock
        placement="sidebar"
        sidebarCompact={sidebarCompact}
        companySelectId={companySelectId}
        showManagerSwitcher={ui.showManagerSwitcher}
        showSingleCompanyLine={ui.showSingleCompanyLine}
        selectedCompanyLabel={ui.selectedCompanyLabel}
        managerOptions={managerOptions}
        selectedManagerProfileId={selectedManagerProfileId}
        onSelectManagerProfile={onSelectManagerProfile}
      />

      <WorkspaceRoleHints
        showEmployeeHint={showEmployeeHint}
        showManagerHint={showManagerHint}
      />
    </>
  )
}
