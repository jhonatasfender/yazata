import { ClerkProvider } from '@clerk/react'
import { dark } from '@clerk/themes'
import { ui } from '@clerk/ui'
import type { ComponentType, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import App from '../App'

const EnvClerkProvider = ClerkProvider as unknown as ComponentType<{
  children: ReactNode
  afterSignOutUrl: string
  signInUrl?: string
  signUpUrl?: string
  appearance?: unknown
  ui?: unknown
  routerPush?: (to: string) => void
  routerReplace?: (to: string) => void
}>

export const ClerkProviderWithRouter = () => {
  const navigate = useNavigate()

  return (
    <EnvClerkProvider
      afterSignOutUrl="/"
      signInUrl="/login"
      signUpUrl="/sign-up"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      ui={ui}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#8b5cf6',
          colorBackground: '#18181b',
          colorInputBackground: '#09090b',
          colorInputText: '#f4f4f5',
          colorText: '#f4f4f5',
          colorTextSecondary: '#a1a1aa',
        },
      }}
    >
      <App />
    </EnvClerkProvider>
  )
}
