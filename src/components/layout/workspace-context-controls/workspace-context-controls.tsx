import { useId } from 'react'
import { useNavigate } from 'react-router-dom'

import { cn } from '../../../lib/utils'
import { deriveWorkspaceContextUi } from './derive-workspace-ui'
import type { WorkspaceContextControlsProps } from './types'
import { WorkspaceCompanyBlock } from './workspace-company-block'
import { WorkspaceInnerBody } from './workspace-inner-body'
import { WorkspaceRoleHints } from './workspace-role-hints'
import { WorkspaceRoleToggle } from './workspace-role-toggle'

export const WorkspaceContextControls = ({
  hasEmployeeRole,
  hasManagerRole,
  activeWorkspaceContext,
  onSelectWorkspaceContext,
  managerOptions,
  selectedManagerProfileId,
  onSelectManagerProfile,
  variant = 'compact',
  sidebarCompact = false,
}: WorkspaceContextControlsProps) => {
  const navigate = useNavigate()
  const companySelectId = useId()

  const ui = deriveWorkspaceContextUi({
    hasEmployeeRole,
    hasManagerRole,
    activeWorkspaceContext,
    managerOptions,
    selectedManagerProfileId,
    variant,
    sidebarCompact,
  })

  if (!ui.hasContent) {
    return null
  }

  const applyWorkspaceContext = (
    context: Parameters<typeof onSelectWorkspaceContext>[0],
  ) => {
    onSelectWorkspaceContext(context)
    if (context === 'employee') {
      navigate('/time-entries/register')
    } else {
      navigate('/employees')
    }
  }

  const omitToggleSubLabel = variant === 'profile' || variant === 'sidebar'

  if (variant === 'profile') {
    return (
      <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
        <div>
          <h3 className="text-base font-semibold text-zinc-100">Workspace</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {ui.showWorkspaceToggle
              ? 'Switch between logging your own time and managing employees. The sidebar matches this choice — same as the header.'
              : 'How you use Yazata in this account.'}
          </p>
        </div>
        <div className="space-y-4 border-t border-zinc-800 pt-4">
          <WorkspaceInnerBody
            ui={ui}
            activeWorkspaceContext={activeWorkspaceContext}
            onSelectWorkspaceContext={applyWorkspaceContext}
            managerOptions={managerOptions}
            selectedManagerProfileId={selectedManagerProfileId}
            onSelectManagerProfile={onSelectManagerProfile}
            companySelectId={companySelectId}
            sidebarCompact={false}
            omitToggleSubLabel={omitToggleSubLabel}
          />
        </div>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div
        className={cn(
          'border-b border-zinc-800 pb-4',
          sidebarCompact ? 'space-y-2' : 'mb-4 space-y-3',
        )}
      >
        {!sidebarCompact && ui.showWorkspaceToggle ? (
          <p className="text-xs font-medium text-zinc-400">
            You have two roles — pick how you are working now. In manager mode you can
            also choose the company if you manage more than one.
          </p>
        ) : null}
        {sidebarCompact && ui.showWorkspaceToggle ? (
          <p className="text-center text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
            Mode
          </p>
        ) : null}
        {!sidebarCompact && !ui.showWorkspaceToggle && ui.showManagerSwitcher ? (
          <p className="text-xs font-medium text-zinc-400">
            Select which company you are managing. The menu shows manager tools for that
            company.
          </p>
        ) : null}
        <div className={cn('space-y-3', sidebarCompact && 'space-y-2')}>
          <WorkspaceInnerBody
            ui={ui}
            activeWorkspaceContext={activeWorkspaceContext}
            onSelectWorkspaceContext={applyWorkspaceContext}
            managerOptions={managerOptions}
            selectedManagerProfileId={selectedManagerProfileId}
            onSelectManagerProfile={onSelectManagerProfile}
            companySelectId={companySelectId}
            sidebarCompact={sidebarCompact}
            omitToggleSubLabel={omitToggleSubLabel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 min-w-0 space-y-3 border-t border-zinc-800 pt-4 sm:space-y-4">
      {ui.showWorkspaceToggle ? (
        <WorkspaceRoleToggle
          mode="topbar-row"
          activeWorkspaceContext={activeWorkspaceContext}
          onSelect={applyWorkspaceContext}
        />
      ) : null}

      <WorkspaceCompanyBlock
        placement="topbar"
        sidebarCompact={false}
        companySelectId={companySelectId}
        showManagerSwitcher={ui.showManagerSwitcher}
        showSingleCompanyLine={ui.showSingleCompanyLine}
        selectedCompanyLabel={ui.selectedCompanyLabel}
        managerOptions={managerOptions}
        selectedManagerProfileId={selectedManagerProfileId}
        onSelectManagerProfile={onSelectManagerProfile}
      />

      <WorkspaceRoleHints
        showEmployeeHint={ui.employeeOnlyHint}
        showManagerHint={ui.managerOnlyHint}
      />
    </div>
  )
}
