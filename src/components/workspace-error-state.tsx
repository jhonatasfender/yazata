import type { ReactNode } from 'react'

type WorkspaceErrorStateProps = {
  error: string | null
  onRetry: () => void
  children: ReactNode
}

export const WorkspaceErrorState = ({
  error,
  onRetry,
  children,
}: WorkspaceErrorStateProps) => {
  if (!error) {
    return <>{children}</>
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="rounded-2xl border border-red-700 bg-red-950/40 p-5 text-red-200">
          <p>{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 cursor-pointer rounded-lg border border-red-400 px-3 py-1.5 text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </main>
  )
}
