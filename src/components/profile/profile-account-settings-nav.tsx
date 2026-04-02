import { Briefcase, Building2, Shield, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const linkClass =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100'

const activeClass = 'bg-zinc-800 text-violet-300 hover:text-violet-200'

const subheadingClass =
  'mb-1.5 mt-1 px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-zinc-500 first:mt-0'

type ProfileAccountSettingsNavProps = {
  showWorkspaceNav: boolean
  showCompanyNav: boolean
}

export const ProfileAccountSettingsNav = ({
  showWorkspaceNav,
  showCompanyNav,
}: ProfileAccountSettingsNavProps) => (
  <nav
    className="flex shrink-0 flex-col gap-0.5 border-b border-zinc-800 pb-4 md:w-52 md:border-b-0 md:border-r md:border-zinc-800 md:pb-0 md:pr-5"
    aria-label="Account settings"
  >
    <p className={subheadingClass}>Account</p>
    <NavLink
      to="/profile"
      end
      className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
    >
      <UserRound className="size-4 shrink-0 opacity-80" aria-hidden />
      Profile
    </NavLink>
    <NavLink
      to="/profile/security"
      className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
    >
      <Shield className="size-4 shrink-0 opacity-80" aria-hidden />
      Security
    </NavLink>

    {showWorkspaceNav ? (
      <>
        <p className={`${subheadingClass} md:mt-4`}>Workspace</p>
        <NavLink
          to="/profile/workspace"
          className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
        >
          <Briefcase className="size-4 shrink-0 opacity-80" aria-hidden />
          Roles & companies
        </NavLink>
      </>
    ) : null}

    {showCompanyNav ? (
      <>
        <p className={`${subheadingClass} md:mt-4`}>Company</p>
        <NavLink
          to="/profile/company"
          className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ''}`}
        >
          <Building2 className="size-4 shrink-0 opacity-80" aria-hidden />
          Legal & trade names
        </NavLink>
      </>
    ) : null}
  </nav>
)
