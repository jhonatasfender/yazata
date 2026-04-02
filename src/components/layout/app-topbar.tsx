import { UserButton } from '@clerk/react'
import { useEffect, useMemo, useState } from 'react'

import {
  WorkspaceContextControls,
  type WorkspaceManagerOption,
} from './workspace-context-controls'
import type { ActiveWorkspaceContext } from '../../hooks/use-workspace-context'

export type ManagerOption = WorkspaceManagerOption

type AppTopbarProps = {
  onOpenMenu: () => void
  currentEmployeeId: string | null
  managerOptions: ManagerOption[]
  selectedManagerProfileId: string | null
  onSelectManagerProfile: (id: string) => void
  hasEmployeeRole: boolean
  hasManagerRole: boolean
  activeWorkspaceContext: ActiveWorkspaceContext
  onSelectWorkspaceContext: (context: ActiveWorkspaceContext) => void
}

const QUICK_ENTRY_STORAGE_KEY = 'tracker.quick-entry'

const formatElapsedTime = (elapsedMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const AppTopbar = ({
  onOpenMenu,
  currentEmployeeId,
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
      const raw = window.localStorage.getItem(QUICK_ENTRY_STORAGE_KEY)
      if (!raw) {
        setQuickEntryStartedAt(null)
        return
      }

      try {
        const parsed = JSON.parse(raw) as {
          employeeId?: string
          id?: string
          startedAt?: string
        }

        if (
          parsed.employeeId !== currentEmployeeId ||
          !parsed.id ||
          !parsed.startedAt ||
          Number.isNaN(new Date(parsed.startedAt).getTime())
        ) {
          setQuickEntryStartedAt(null)
          return
        }

        setQuickEntryStartedAt(parsed.startedAt)
      } catch {
        window.localStorage.removeItem(QUICK_ENTRY_STORAGE_KEY)
        setQuickEntryStartedAt(null)
      }
    }

    syncQuickEntry()
    setNowMs(Date.now())
    const timer = window.setInterval(() => {
      setNowMs(Date.now())
      syncQuickEntry()
    }, 1000)

    return () => window.clearInterval(timer)
  }, [currentEmployeeId])

  const elapsedLabel = useMemo(() => {
    if (!quickEntryStartedAt || !nowMs) return null
    const startMs = new Date(quickEntryStartedAt).getTime()
    if (Number.isNaN(startMs)) return null
    return formatElapsedTime(nowMs - startMs)
  }, [nowMs, quickEntryStartedAt])

  return (
    <header className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 md:hidden"
            onClick={onOpenMenu}
          >
            Menu
          </button>
          <div>
            <p className="text-sm text-zinc-400">Yazata - Faith Tracker</p>
            <h1 className="text-2xl font-semibold">Team time tracking</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {elapsedLabel ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 shadow-[0_0_25px_rgba(16,185,129,0.18)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Running
              </p>
              <p className="font-mono text-3xl font-bold leading-none text-emerald-200">
                {elapsedLabel}
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
