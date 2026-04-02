import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  ClipboardPenLine,
  FolderKanban,
  LayoutList,
  ShieldUser,
  UsersRound,
} from 'lucide-react'

import type { ActiveWorkspaceContext } from '../../hooks/use-workspace-context'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

const employeeNavItems: NavItem[] = [
  { to: '/time-entries/register', label: 'Register Time', icon: ClipboardPenLine },
  { to: '/projetos', label: 'Projects', icon: FolderKanban },
  { to: '/resumo', label: 'Summary', icon: LayoutList },
  { to: '/profile', label: 'Profile', icon: ShieldUser },
]

const managerNavItems: NavItem[] = [
  { to: '/employees', label: 'Employees', icon: UsersRound },
  { to: '/projetos', label: 'Projects', icon: FolderKanban },
  { to: '/resumo', label: 'Summary', icon: LayoutList },
  { to: '/profile', label: 'Profile', icon: ShieldUser },
]

const setupCompanyNavItem: NavItem = {
  to: '/setup/manager',
  label: 'Set up company',
  icon: Building2,
}

const appendSetupCompany = (items: NavItem[], hasManager: boolean): NavItem[] =>
  hasManager ? items : [...items, setupCompanyNavItem]

export const getWorkspaceNavItems = (params: {
  activeWorkspaceContext: ActiveWorkspaceContext
  hasEmployee: boolean
  hasManager: boolean
}): NavItem[] => {
  const { activeWorkspaceContext, hasEmployee, hasManager } = params

  if (hasEmployee && hasManager) {
    return activeWorkspaceContext === 'manager'
      ? managerNavItems
      : appendSetupCompany(employeeNavItems, hasManager)
  }

  if (hasEmployee) {
    return appendSetupCompany(employeeNavItems, hasManager)
  }

  if (hasManager) {
    return managerNavItems
  }

  return appendSetupCompany(employeeNavItems, hasManager)
}
