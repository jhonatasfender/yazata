import { Briefcase, User } from 'lucide-react'

import { cn } from '../../../lib/utils'
import type { ActiveWorkspaceContext } from '../../../hooks/use-workspace-context'

const segmentBtn = (active: boolean) =>
  cn(
    'min-h-9 flex-1 rounded-md px-2 py-1.5 text-sm font-medium',
    active ? 'bg-violet-600 text-white' : 'text-zinc-300 hover:text-zinc-100',
  )

const topbarBtn = (active: boolean) =>
  cn(
    'rounded-md px-3 py-1.5 text-sm font-medium',
    active ? 'bg-violet-600 text-white' : 'text-zinc-300 hover:text-zinc-100',
  )

const iconBtn = (active: boolean) =>
  cn(
    'flex h-10 w-full items-center justify-center rounded-lg border transition-colors',
    active
      ? 'border-violet-400/60 bg-violet-500/25 text-violet-100'
      : 'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
  )

type WorkspaceRoleToggleProps = {
  activeWorkspaceContext: ActiveWorkspaceContext
  onSelect: (context: ActiveWorkspaceContext) => void
  mode: 'sidebar-icons' | 'segmented' | 'topbar-row'
  showSegmentHeading?: boolean
}

export const WorkspaceRoleToggle = ({
  activeWorkspaceContext,
  onSelect,
  mode,
  showSegmentHeading = false,
}: WorkspaceRoleToggleProps) => {
  if (mode === 'sidebar-icons') {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          title="Employee — register your own time"
          aria-label="Switch to employee workspace"
          aria-pressed={activeWorkspaceContext === 'employee'}
          className={iconBtn(activeWorkspaceContext === 'employee')}
          onClick={() => onSelect('employee')}
        >
          <User size={18} strokeWidth={2.2} aria-hidden />
        </button>
        <button
          type="button"
          title="Manager — employees & company"
          aria-label="Switch to manager workspace"
          aria-pressed={activeWorkspaceContext === 'manager'}
          className={iconBtn(activeWorkspaceContext === 'manager')}
          onClick={() => onSelect('manager')}
        >
          <Briefcase size={18} strokeWidth={2.2} aria-hidden />
        </button>
      </div>
    )
  }

  if (mode === 'topbar-row') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-zinc-400">Workspace</span>
        <div className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 p-0.5">
          <button
            type="button"
            className={topbarBtn(activeWorkspaceContext === 'employee')}
            onClick={() => onSelect('employee')}
          >
            Employee
          </button>
          <button
            type="button"
            className={topbarBtn(activeWorkspaceContext === 'manager')}
            onClick={() => onSelect('manager')}
          >
            Manager
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {showSegmentHeading ? (
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Workspace
        </p>
      ) : null}
      <div className="inline-flex w-full rounded-lg border border-zinc-700 bg-zinc-950 p-0.5">
        <button
          type="button"
          className={segmentBtn(activeWorkspaceContext === 'employee')}
          onClick={() => onSelect('employee')}
        >
          Employee
        </button>
        <button
          type="button"
          className={segmentBtn(activeWorkspaceContext === 'manager')}
          onClick={() => onSelect('manager')}
        >
          Manager
        </button>
      </div>
    </div>
  )
}
