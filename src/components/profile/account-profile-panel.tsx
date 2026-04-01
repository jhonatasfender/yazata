import { UserProfile } from '@clerk/react'

export const AccountProfilePanel = () => (
  <div className="account-profile-fill overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
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
          rootBox: 'w-full bg-transparent',
          cardBox: 'w-full border-0 bg-transparent shadow-none ring-0',
          scrollBox: 'w-full border-0 bg-transparent shadow-none ring-0',
          card: 'shadow-none border-0 bg-transparent text-zinc-100',
          navbar: 'bg-transparent',
          navbarButton: 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100',
          pageScrollBox: 'bg-transparent',
          profileSectionPrimaryButton: 'bg-violet-500 text-zinc-950 hover:bg-violet-400',
          formButtonPrimary: 'bg-violet-500 text-zinc-950 hover:bg-violet-400',
          formFieldInput: 'bg-zinc-900 border-zinc-700 text-zinc-100',
          formFieldLabel: 'text-zinc-300',
          formFieldAction: 'text-violet-300 hover:text-violet-200',
          badge: 'bg-zinc-800 text-zinc-300',
        },
      }}
    />
  </div>
)
