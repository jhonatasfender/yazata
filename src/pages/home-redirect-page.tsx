import { Navigate, useOutletContext } from 'react-router-dom'
import type { AppLayoutContext } from '../components/app-layout'

export const HomeRedirectPage = () => {
  const { employee, manager, activeWorkspaceContext } =
    useOutletContext<AppLayoutContext>()

  if (!employee && !manager) {
    return <Navigate to="/time-entries/register" replace />
  }

  if (employee && !manager) {
    return <Navigate to="/time-entries/register" replace />
  }

  if (manager && !employee) {
    return <Navigate to="/employees" replace />
  }

  if (activeWorkspaceContext === 'manager') {
    return <Navigate to="/employees" replace />
  }

  return <Navigate to="/time-entries/register" replace />
}
