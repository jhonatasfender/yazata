import { UserButton } from '@clerk/react'

type AppTopbarProps = {
  onOpenMenu: () => void
}

export const AppTopbar = ({ onOpenMenu }: AppTopbarProps) => (
  <header className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Abrir menu lateral"
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 md:hidden"
          onClick={onOpenMenu}
        >
          Menu
        </button>
        <div>
          <p className="text-sm text-zinc-400">Yazata - Faith Tracker</p>
          <h1 className="text-2xl font-semibold">Registro de jornada da equipe</h1>
        </div>
      </div>
      <UserButton userProfileMode="navigation" userProfileUrl="/profile" />
    </div>
  </header>
)
