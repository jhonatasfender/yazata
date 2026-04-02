import type { ActiveWorkspaceContext } from '../../../hooks/use-workspace-context'
import type { WorkspaceContextVariant, WorkspaceManagerOption } from './types'

export type DerivedWorkspaceUi = {
  showWorkspaceToggle: boolean
  showManagerSwitcher: boolean
  selectedCompanyLabel: string | undefined
  showSingleCompanyLine: boolean
  employeeOnlyHint: boolean
  managerOnlyHint: boolean
  hideRoleHintsInSidebarCompact: boolean
  hasContent: boolean
}

export function deriveWorkspaceContextUi(params: {
  hasEmployeeRole: boolean
  hasManagerRole: boolean
  activeWorkspaceContext: ActiveWorkspaceContext
  managerOptions: WorkspaceManagerOption[]
  selectedManagerProfileId: string | null
  variant?: WorkspaceContextVariant
  sidebarCompact?: boolean
}): DerivedWorkspaceUi {
  const {
    hasEmployeeRole,
    hasManagerRole,
    activeWorkspaceContext,
    managerOptions,
    selectedManagerProfileId,
    variant = 'compact',
    sidebarCompact = false,
  } = params

  const showWorkspaceToggle = hasEmployeeRole && hasManagerRole
  const showManagerSwitcher =
    managerOptions.length > 1 && activeWorkspaceContext === 'manager'

  const selectedCompanyLabel =
    selectedManagerProfileId != null
      ? managerOptions.find((opt) => opt.id === selectedManagerProfileId)?.companyName
      : undefined

  const showSingleCompanyLine =
    Boolean(hasManagerRole) &&
    activeWorkspaceContext === 'manager' &&
    managerOptions.length === 1 &&
    Boolean(selectedCompanyLabel)

  const employeeOnlyHint = !showWorkspaceToggle && hasEmployeeRole && !hasManagerRole
  const managerOnlyHint = !showWorkspaceToggle && hasManagerRole && !hasEmployeeRole

  const hideRoleHintsInSidebarCompact =
    variant === 'sidebar' && sidebarCompact && (employeeOnlyHint || managerOnlyHint)

  const hasContent =
    showWorkspaceToggle ||
    showManagerSwitcher ||
    showSingleCompanyLine ||
    (employeeOnlyHint && !hideRoleHintsInSidebarCompact) ||
    (managerOnlyHint && !hideRoleHintsInSidebarCompact)

  return {
    showWorkspaceToggle,
    showManagerSwitcher,
    selectedCompanyLabel,
    showSingleCompanyLine,
    employeeOnlyHint,
    managerOnlyHint,
    hideRoleHintsInSidebarCompact,
    hasContent,
  }
}

export function getWorkspaceContextControlsHasContent(
  params: Parameters<typeof deriveWorkspaceContextUi>[0],
): boolean {
  return deriveWorkspaceContextUi(params).hasContent
}
