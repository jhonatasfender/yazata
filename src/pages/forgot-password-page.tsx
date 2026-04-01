import { useSignIn } from '@clerk/react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type Step = 'request' | 'reset'

export const ForgotPasswordPage = () => {
  const { signIn } = useSignIn()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onRequestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setLoading(true)
    setError(null)
    setMessage(null)

    const createResult = await signIn.create({
      identifier: email,
    })
    if (createResult.error) {
      setError(
        createResult.error.message || 'Nao foi possivel validar o e-mail informado.',
      )
      setLoading(false)
      return
    }

    const sendCodeResult = await signIn.resetPasswordEmailCode.sendCode()
    if (sendCodeResult.error) {
      setError(
        sendCodeResult.error.message ||
          'Nao foi possivel enviar o codigo de recuperacao para este e-mail.',
      )
      setLoading(false)
      return
    }

    setStep('reset')
    setMessage('Enviamos um codigo para seu e-mail.')
    setLoading(false)
  }

  const onSubmitNewPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setLoading(true)
    setError(null)
    setMessage(null)

    const verifyCodeResult = await signIn.resetPasswordEmailCode.verifyCode({
      code,
    })
    if (verifyCodeResult.error) {
      setError(verifyCodeResult.error.message || 'Codigo invalido. Tente novamente.')
      setLoading(false)
      return
    }

    const submitPasswordResult = await signIn.resetPasswordEmailCode.submitPassword({
      password,
    })
    if (submitPasswordResult.error) {
      setError(
        submitPasswordResult.error.message || 'Sua senha nao atende aos requisitos.',
      )
      setLoading(false)
      return
    }

    const finalizeResult = await signIn.finalize()
    if (finalizeResult.error) {
      setError(
        finalizeResult.error.message || 'Nao foi possivel concluir o reset da senha.',
      )
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/', { replace: true })
  }

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
        className="relative mx-auto w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
          Tracker de Horas
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Recuperar senha</h1>
        <p className="mt-2 text-sm text-zinc-300">
          {step === 'request'
            ? 'Informe seu e-mail para receber o codigo de recuperacao.'
            : 'Digite o codigo recebido e defina sua nova senha.'}
        </p>

        {message ? (
          <p className="mt-4 rounded-lg border border-emerald-700 bg-emerald-950/40 p-3 text-sm text-emerald-200">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-lg border border-red-700 bg-red-950/40 p-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        {step === 'request' ? (
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => void onRequestReset(event)}
          >
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm text-zinc-300">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-violet-400"
                placeholder="voce@empresa.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-xl bg-violet-500 px-4 py-2 font-medium text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Enviando...' : 'Enviar codigo'}
            </button>
          </form>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => void onSubmitNewPassword(event)}
          >
            <div className="space-y-1">
              <label htmlFor="code" className="text-sm text-zinc-300">
                Codigo
              </label>
              <input
                id="code"
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-violet-400"
                placeholder="123456"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm text-zinc-300">
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 outline-none focus:border-violet-400"
                placeholder="Digite sua nova senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-xl bg-violet-500 px-4 py-2 font-medium text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Definir nova senha'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-zinc-400">
          Lembrou a senha?{' '}
          <Link
            to="/login"
            className="text-violet-300 underline-offset-2 transition-colors hover:text-violet-200 hover:underline"
          >
            Voltar para login
          </Link>
        </p>
      </motion.section>
    </main>
  )
}
