import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppTopbar } from './layout/app-topbar'
import { DesktopSidebar } from './layout/desktop-sidebar'
import { MobileSidebarDrawer } from './layout/mobile-sidebar-drawer'
import { WorkspaceContextControls } from './layout/workspace-context-controls'
import { getWorkspaceNavItems } from './layout/nav-items'
import { useWorkspaceContext } from '../hooks/use-workspace-context'
import type { ActiveWorkspaceContext } from '../hooks/use-workspace-context'
import type { EmployeeRow, ManagerRow } from '../lib/supabase'
import { WorkspaceErrorState } from './workspace-error-state'

const SIDEBAR_PREF_KEY = 'tracker-sidebar-expanded'

export const AppLayout = () => {
  const {
    loading,
    error,
    manager,
    managers,
    selectedManagerProfileId,
    setSelectedManagerProfileId,
    employee,
    activeWorkspaceContext,
    setActiveWorkspaceContext,
    refresh,
  } = useWorkspaceContext(true)
  const [desktopExpanded, setDesktopExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(SIDEBAR_PREF_KEY)
    if (saved === 'true') setDesktopExpanded(true)
    if (saved === 'false') setDesktopExpanded(false)
  }, [])

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_PREF_KEY, String(desktopExpanded))
  }, [desktopExpanded])

  const desktopMode = useMemo(
    () => (desktopExpanded ? 'expanded' : 'collapsed'),
    [desktopExpanded],
  )
  const navItems = useMemo(
    () =>
      getWorkspaceNavItems({
        activeWorkspaceContext,
        hasEmployee: Boolean(employee),
        hasManager: Boolean(manager),
      }),
    [activeWorkspaceContext, employee, manager],
  )

  const managerOptions = useMemo(
    () =>
      managers.map((entry) => ({
        id: entry.id,
        companyName: entry.company_name,
      })),
    [managers],
  )

  const workspaceControlProps = {
    hasEmployeeRole: Boolean(employee),
    hasManagerRole: managers.length > 0,
    activeWorkspaceContext,
    onSelectWorkspaceContext: setActiveWorkspaceContext,
    managerOptions,
    selectedManagerProfileId,
    onSelectManagerProfile: setSelectedManagerProfileId,
  } as const

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
          <p className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 text-zinc-300">
            Preparing your workspace...
          </p>
        </div>
      </main>
    )
  }

  return (
    <WorkspaceErrorState error={error} onRetry={() => void refresh()}>
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="flex w-full gap-6 px-4 py-6 md:px-8 md:py-8">
          <MobileSidebarDrawer
            isOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
            navItems={navItems}
            workspaceControls={
              <WorkspaceContextControls
                variant="sidebar"
                sidebarCompact={false}
                {...workspaceControlProps}
              />
            }
          />
          <DesktopSidebar
            desktopExpanded={desktopExpanded}
            desktopMode={desktopMode}
            onToggleExpanded={() => setDesktopExpanded((prev) => !prev)}
            navItems={navItems}
            workspaceControls={
              <WorkspaceContextControls
                variant="sidebar"
                sidebarCompact={!desktopExpanded}
                {...workspaceControlProps}
              />
            }
          />

          <div className="min-w-0 flex-1 space-y-6">
            <AppTopbar
              onOpenMenu={() => setMobileOpen(true)}
              currentEmployeeId={employee?.id ?? null}
              managerOptions={managerOptions}
              selectedManagerProfileId={selectedManagerProfileId}
              onSelectManagerProfile={setSelectedManagerProfileId}
              hasEmployeeRole={Boolean(employee)}
              hasManagerRole={managers.length > 0}
              activeWorkspaceContext={activeWorkspaceContext}
              onSelectWorkspaceContext={setActiveWorkspaceContext}
            />

            <Outlet
              context={{
                manager,
                managers,
                selectedManagerProfileId,
                setSelectedManagerProfileId,
                employee,
                activeWorkspaceContext,
                setActiveWorkspaceContext,
                refreshWorkspace: refresh,
              }}
            />
          </div>
        </div>
      </main>
    </WorkspaceErrorState>
  )
}

export type AppLayoutContext = {
  manager: ManagerRow | null
  managers: ManagerRow[]
  selectedManagerProfileId: string | null
  setSelectedManagerProfileId: (id: string) => void
  employee: EmployeeRow | null
  activeWorkspaceContext: ActiveWorkspaceContext
  setActiveWorkspaceContext: (context: ActiveWorkspaceContext) => void
  refreshWorkspace: () => Promise<void>
}
