import { UserButton } from '@clerk/react'
import { Menu } from 'lucide-react'
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
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          {elapsedLabel ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 shadow-[0_0_25px_rgba(16,185,129,0.18)] sm:px-4 sm:py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Running
              </p>
              <p className="font-mono text-2xl font-bold leading-none text-emerald-200 sm:text-3xl">
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
