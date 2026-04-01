import { SignUp } from '@clerk/react'
import { dark } from '@clerk/themes'
import { motion } from 'framer-motion'

export const SignUpPage = () => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-10 text-zinc-100 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-violet-700/15 blur-3xl" />
        <div className="absolute -right-16 bottom-8 h-72 w-72 rounded-full bg-zinc-500/10 blur-3xl" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-8"
      >
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-300">Yazata</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
            Criar conta da equipe
          </h1>
          <p className="mt-3 max-w-xl text-zinc-300">
            Cadastre-se para acessar o Yazata e comecar a registrar as horas trabalhadas.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
          className="w-full max-w-md rounded-2xl bg-transparent p-0 shadow-none backdrop-blur-none"
        >
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/login"
            forceRedirectUrl="/"
            appearance={{
              theme: dark,
              elements: {
                rootBox: 'w-full',
                cardBox: 'w-full',
                card: 'w-full border-0 bg-transparent shadow-none',
                headerTitle: 'text-zinc-100',
                headerSubtitle: 'text-zinc-400',
                formFieldLabel: 'text-zinc-300',
                formFieldInput:
                  'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-violet-400 focus:ring-violet-400',
                formButtonPrimary:
                  'bg-violet-500 text-white hover:bg-violet-400 focus:ring-violet-400',
                footerActionText: 'text-zinc-400',
                footerActionLink:
                  'text-violet-300 hover:text-violet-200 underline-offset-2 hover:underline',
              },
            }}
          />
        </motion.div>
      </motion.section>
    </main>
  )
}
