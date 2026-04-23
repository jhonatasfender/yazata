import { UserProfile } from '@clerk/react'
import { useOutletContext } from 'react-router-dom'

import type { AppLayoutContext } from '../app-layout'
import { EmployeeDisplayNameCard } from './employee-display-name-card'

const embeddedProfileSectionLayout = {
  profileSection: {
    flexDirection: 'column-reverse' as const,
    gap: '0.5rem',
    alignItems: 'stretch',
    alignSelf: 'stretch',
  },
  profileSectionHeader: {
    width: '100%',
    maxWidth: 'none',
    marginTop: 0,
    transform: 'none',
    alignSelf: 'flex-start',
    padding: 0,
  },
  profileSectionContent: {
    minWidth: 0,
    width: '100%',
  },
}

export const AccountProfilePanel = () => {
  const { employee } = useOutletContext<AppLayoutContext>()

  return (
  <div className="account-profile-fill min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
    {employee ? (
      <div className="min-w-0 border-b border-zinc-800/80 p-4 sm:p-5">
        <EmployeeDisplayNameCard />
      </div>
    ) : null}
    <UserProfile
      routing="path"
      path="/profile"
      appearance={{
        variables: {
          colorPrimary: '#a78bfa',
          colorBackground: '#18181b',
          colorNeutral: '#3f3f46',
          borderRadius: '0.75rem',
        },
        elements: {
          rootBox: 'w-full min-w-0 flex-1 bg-transparent',
          cardBox: 'w-full border-0 bg-transparent shadow-none ring-0',
          scrollBox: 'w-full min-w-0 border-0 bg-transparent shadow-none ring-0',
          card: 'shadow-none border-0 bg-transparent text-zinc-100',
          navbar: { display: 'none' },
          navbarMobileMenuRow: {
            display: 'none',
            visibility: 'hidden',
            height: 0,
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            border: 0,
          },
          navbarMobileMenuButton: { display: 'none' },
          navbarButton: 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
          pageScrollBox: 'min-w-0 bg-transparent',
          profileSectionPrimaryButton: 'bg-violet-500 text-zinc-950 hover:bg-violet-400',
          formButtonPrimary: 'bg-violet-500 text-zinc-950 hover:bg-violet-400',
          formFieldInput: 'bg-zinc-900 border-zinc-700 text-zinc-100',
          formFieldLabel: 'text-zinc-300',
          formFieldAction: 'text-violet-300 hover:text-violet-200',
          badge: 'bg-zinc-800 text-zinc-300',
          ...embeddedProfileSectionLayout,
        },
      }}
    />
  </div>
  )
}
