import { Pencil, Trash2 } from 'lucide-react'
import type { RegisterEntry } from '../register-types'

type IconSize = 'sm' | 'md'

const iconClass: Record<IconSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
}

const buttonPadding: Record<IconSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
}

type RegisterEntryRowActionsProps = {
  entry: RegisterEntry
  iconSize?: IconSize
  onEditEntry: (entry: RegisterEntry) => void
  onDeleteEntry: (id: string) => Promise<void>
}

export const RegisterEntryRowActions = ({
  entry,
  iconSize = 'sm',
  onEditEntry,
  onDeleteEntry,
}: RegisterEntryRowActionsProps) => (
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => onEditEntry(entry)}
      aria-label="Editar registro"
      title="Editar registro"
      className={`cursor-pointer rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800 ${buttonPadding[iconSize]}`}
    >
      <Pencil className={iconClass[iconSize]} aria-hidden />
    </button>
    <button
      type="button"
      onClick={() => void onDeleteEntry(entry.id)}
      aria-label="Excluir registro"
      title="Excluir registro"
      className={`cursor-pointer rounded-md border border-red-700 text-red-200 hover:bg-red-950/30 ${buttonPadding[iconSize]}`}
    >
      <Trash2 className={iconClass[iconSize]} aria-hidden />
    </button>
  </div>
)
