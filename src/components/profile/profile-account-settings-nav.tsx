import { Briefcase, Building2, Shield, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { cn } from '../../lib/utils'

const linkClass =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100'

const activeClass = 'bg-zinc-800 text-violet-300 hover:text-violet-200'

const subheadingClass =
  'mb-1.5 mt-1 px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-500 first:mt-0'

type NavItem = {
  to: string
  end?: boolean
  label: string
  tabLabel: string
  Icon: LucideIcon
}

type ProfileAccountSettingsNavProps = {
  showWorkspaceNav: boolean
  showCompanyNav: boolean
}

export const ProfileAccountSettingsNav = ({
  showWorkspaceNav,
  showCompanyNav,
}: ProfileAccountSettingsNavProps) => {
  const accountItems: NavItem[] = [
    {
      to: '/profile',
      end: true,
      label: 'Profile',
      tabLabel: 'Profile',
      Icon: UserRound,
    },
    {
      to: '/profile/security',
      label: 'Security',
      tabLabel: 'Security',
      Icon: Shield,
    },
  ]

  const workspaceItems: NavItem[] = showWorkspaceNav
    ? [
        {
          to: '/profile/workspace',
          label: 'Roles & companies',
          tabLabel: 'Workspace',
          Icon: Briefcase,
        },
      ]
    : []

  const companyItems: NavItem[] = showCompanyNav
    ? [
        {
          to: '/profile/company',
          label: 'Legal & trade names',
          tabLabel: 'Company',
          Icon: Building2,
        },
      ]
    : []

  const tabItems = [...accountItems, ...workspaceItems, ...companyItems]

  const tabLinkClass = (isActive: boolean) =>
    cn(
      'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-zinc-800 text-violet-300 ring-1 ring-zinc-700/80'
        : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100',
    )

  return (
    <>
      <nav
        className="mb-1 min-w-0 border-b border-zinc-800 pb-3 lg:hidden"
        aria-label="Account settings"
      >
        <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-1 pb-0.5">
            {tabItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => tabLinkClass(isActive)}
              >
                <item.Icon className="size-4 shrink-0 opacity-90" aria-hidden />
                {item.tabLabel}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <nav
        className="hidden shrink-0 flex-col gap-0.5 border-b border-zinc-800 pb-4 lg:flex lg:w-52 lg:border-b-0 lg:border-r lg:border-zinc-800 lg:pb-0 lg:pr-5"
        aria-label="Account settings"
      >
        <p className={subheadingClass}>Account</p>
        {accountItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
          >
            <item.Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            {item.label}
          </NavLink>
        ))}

        {workspaceItems.length > 0 ? (
          <>
            <p className={`${subheadingClass} lg:mt-4`}>Workspace</p>
            {workspaceItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ''}`
                }
              >
                <item.Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </>
        ) : null}

        {companyItems.length > 0 ? (
          <>
            <p className={`${subheadingClass} lg:mt-4`}>Company</p>
            {companyItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${linkClass} ${isActive ? activeClass : ''}`
                }
              >
                <item.Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                {item.label}
              </NavLink>
            ))}
          </>
        ) : null}
      </nav>
    </>
  )
}
