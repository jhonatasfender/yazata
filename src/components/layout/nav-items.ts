import type { LucideIcon } from 'lucide-react'
import {
  ClipboardPenLine,
  FolderKanban,
  LayoutList,
  ShieldUser,
  UsersRound,
} from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
}

const employeeNavItems: NavItem[] = [
  { to: '/', label: 'Registrar', icon: ClipboardPenLine },
  { to: '/projetos', label: 'Projetos', icon: FolderKanban },
  { to: '/resumo', label: 'Resumo', icon: LayoutList },
  { to: '/profile', label: 'Perfil', icon: ShieldUser },
]

const managerNavItems: NavItem[] = [
  { to: '/equipe', label: 'Equipe', icon: UsersRound },
  { to: '/projetos', label: 'Projetos', icon: FolderKanban },
  { to: '/resumo', label: 'Resumo', icon: LayoutList },
  { to: '/profile', label: 'Perfil', icon: ShieldUser },
]

export const getNavItems = (isEmployee: boolean): NavItem[] =>
  isEmployee ? employeeNavItems : managerNavItems
