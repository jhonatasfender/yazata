import { Navigate, Route, Routes, useOutletContext } from 'react-router-dom'

import type { AppLayoutContext } from '../components/app-layout'
import { getWorkspaceContextControlsHasContent } from '../components/layout/workspace-context-controls'
import { AccountProfilePanel } from '../components/profile/account-profile-panel'
import { ProfileAccountSettingsNav } from '../components/profile/profile-account-settings-nav'
import { ProfileWorkspacePanel } from '../components/profile/profile-workspace-panel'
import { CompanySettingsPage } from './company-settings-page'

export const ProfilePage = () => {
  const { employee, managers, selectedManagerProfileId, activeWorkspaceContext } =
    useOutletContext<AppLayoutContext>()

  const managerOptions = managers.map((entry) => ({
    id: entry.id,
    companyName: entry.company_name,
  }))

  const showWorkspaceNav = getWorkspaceContextControlsHasContent({
    hasEmployeeRole: Boolean(employee),
    hasManagerRole: managers.length > 0,
    activeWorkspaceContext,
    managerOptions,
    selectedManagerProfileId,
    variant: 'profile',
    sidebarCompact: false,
  })

  const showCompanyNav = managers.length > 0

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
      <h2 className="mb-4 text-lg font-semibold text-zinc-100">Account</h2>
      <div className="flex w-full min-h-[min(70vh,36rem)] min-w-0 flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-6">
        <ProfileAccountSettingsNav
          showWorkspaceNav={showWorkspaceNav}
          showCompanyNav={showCompanyNav}
        />
        <Routes>
          <Route index element={<AccountProfilePanel />} />
          <Route path="security" element={<AccountProfilePanel />} />
          <Route
            path="workspace"
            element={
              showWorkspaceNav ? (
                <ProfileWorkspacePanel />
              ) : (
                <Navigate to="/profile" replace />
              )
            }
          />
          <Route
            path="company"
            element={
              showCompanyNav ? (
                <CompanySettingsPage embedded />
              ) : (
                <Navigate to="/profile" replace />
              )
            }
          />
          <Route path="*" element={<AccountProfilePanel />} />
        </Routes>
      </div>
    </section>
  )
}
