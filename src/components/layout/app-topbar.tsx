import { UserButton } from '@clerk/react'
import { Menu } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  WorkspaceContextControls,
  type WorkspaceManagerOption,
} from './workspace-context-controls'
import type { ActiveWorkspaceContext } from '../../hooks/use-workspace-context'
import {
  quickEntryElapsedMs,
  readQuickEntryLocalStateForEmployee,
} from '../../utils/quick-entry-local-state'
import { formatElapsedClock } from '../../utils/time'

export type ManagerOption = WorkspaceManagerOption

type AppTopbarProps = {
  onOpenMenu: () => void
  currentEmployeeId: string | null
  workspaceEmployeeSubtitle?: string | null
  managerOptions: ManagerOption[]
  selectedManagerProfileId: string | null
  onSelectManagerProfile: (id: string) => void
  hasEmployeeRole: boolean
  hasManagerRole: boolean
  activeWorkspaceContext: ActiveWorkspaceContext
  onSelectWorkspaceContext: (context: ActiveWorkspaceContext) => void
}

export const AppTopbar = ({
  onOpenMenu,
  currentEmployeeId,
  workspaceEmployeeSubtitle = null,
  managerOptions,
  selectedManagerProfileId,
  onSelectManagerProfile,
  hasEmployeeRole,
  hasManagerRole,
  activeWorkspaceContext,
  onSelectWorkspaceContext,
}: AppTopbarProps) => {
  const [quickEntryStartedAt, setQuickEntryStartedAt] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState<number | null>(null)

  useEffect(() => {
    const syncQuickEntry = () => {
      const state = readQuickEntryLocalStateForEmployee(currentEmployeeId)
      if (!state) {
        setQuickEntryStartedAt(null)
        return
      }

      setQuickEntryStartedAt(state.startedAt)
    }

    syncQuickEntry()
    setNowMs(Date.now())
    const timer = window.setInterval(() => {
      setNowMs(Date.now())
      syncQuickEntry()
    }, 1000)

    return () => window.clearInterval(timer)
  }, [currentEmployeeId])

  const quickEntryBanner = useMemo(() => {
    if (!quickEntryStartedAt || !nowMs) return null
    const state = readQuickEntryLocalStateForEmployee(currentEmployeeId)
    if (!state || state.startedAt !== quickEntryStartedAt) {
      return null
    }
    return {
      elapsedLabel: formatElapsedClock(quickEntryElapsedMs(state, nowMs)),
      paused: state.runningSinceMs === null,
    }
  }, [currentEmployeeId, nowMs, quickEntryStartedAt])

  return (
    <header className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:min-w-48 sm:flex-none sm:items-center sm:gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 lg:hidden"
            onClick={onOpenMenu}
          >
            <Menu size={20} strokeWidth={2.2} aria-hidden />
          </button>
          <div className="min-w-0">
            <p className="truncate text-xs text-zinc-400 sm:text-sm">
              Yazata - Faith Tracker
            </p>
            <h1 className="text-xl font-semibold leading-tight sm:text-2xl">
              Team time tracking
            </h1>
            {workspaceEmployeeSubtitle ? (
              <p className="mt-1 truncate text-sm text-zinc-400">
                {workspaceEmployeeSubtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          {quickEntryBanner ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 shadow-[0_0_25px_rgba(16,185,129,0.18)] sm:px-4 sm:py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {quickEntryBanner.paused ? 'Pausado' : 'Em andamento'}
              </p>
              <p className="font-mono text-2xl font-bold leading-none text-emerald-200 sm:text-3xl">
                {quickEntryBanner.elapsedLabel}
              </p>
            </div>
          ) : null}
          <UserButton userProfileMode="navigation" userProfileUrl="/profile" />
        </div>
      </div>

      <WorkspaceContextControls
        variant="compact"
        hasEmployeeRole={hasEmployeeRole}
        hasManagerRole={hasManagerRole}
        activeWorkspaceContext={activeWorkspaceContext}
        onSelectWorkspaceContext={onSelectWorkspaceContext}
        managerOptions={managerOptions}
        selectedManagerProfileId={selectedManagerProfileId}
        onSelectManagerProfile={onSelectManagerProfile}
      />
    </header>
  )
}
