import type { ActiveWorkspaceContext } from '../../../hooks/use-workspace-context'

export type WorkspaceManagerOption = {
  id: string
  companyName: string
}

export type WorkspaceContextVariant = 'compact' | 'profile' | 'sidebar'

export type WorkspaceContextControlsProps = {
  hasEmployeeRole: boolean
  hasManagerRole: boolean
  activeWorkspaceContext: ActiveWorkspaceContext
  onSelectWorkspaceContext: (context: ActiveWorkspaceContext) => void
  managerOptions: WorkspaceManagerOption[]
  selectedManagerProfileId: string | null
  onSelectManagerProfile: (id: string) => void
  variant?: WorkspaceContextVariant
  sidebarCompact?: boolean
}
