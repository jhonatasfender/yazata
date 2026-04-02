import { Show } from '@clerk/react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import { ForgotPasswordPage } from './pages/forgot-password-page'
import { HomeRedirectPage } from './pages/home-redirect-page'
import { LoginPage } from './pages/login-page.tsx'
import { RegisterPage } from './pages/register-page'
import { SignUpPage } from './pages/sign-up-page'
import { SummaryPage } from './pages/summary-page'
import { TeamPage } from './pages/team-page.tsx'
import { ProfilePage } from './pages/profile-page.tsx'
import { TeamInvitePage } from './pages/team-invite-page.tsx'
import { TeamEditHourlyRatePage } from './pages/team-edit-hourly-rate-page.tsx'
import { ProjectsPage } from './pages/projects-page.tsx'
import { SetupManagerPage } from './pages/setup-manager-page.tsx'

const LegacyEquipeEditRedirect = () => {
  const { employeeId } = useParams()
  if (!employeeId) {
    return <Navigate to="/employees" replace />
  }
  return <Navigate to={`/employees/${employeeId}/edit`} replace />
}

const App = () => (
  <>
    <Show when="signed-out">
      <Routes>
        <Route path="/login/*" element={<LoginPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Show>

    <Show when="signed-in">
      <Routes>
        <Route path="/login/*" element={<Navigate to="/" replace />} />
        <Route path="/sign-up/*" element={<Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRedirectPage />} />
          <Route path="/time-entries/register" element={<RegisterPage />} />
          <Route path="/employees" element={<TeamPage />} />
          <Route path="/employees/create" element={<TeamInvitePage />} />
          <Route
            path="/employees/:employeeId/edit"
            element={<TeamEditHourlyRatePage />}
          />
          <Route path="/resumo" element={<SummaryPage />} />
          <Route path="/equipe" element={<Navigate to="/employees" replace />} />
          <Route
            path="/equipe/cadastrar"
            element={<Navigate to="/employees/create" replace />}
          />
          <Route
            path="/equipe/:employeeId/editar"
            element={<LegacyEquipeEditRedirect />}
          />
          <Route path="/projetos" element={<ProjectsPage />} />
          <Route path="/setup/manager" element={<SetupManagerPage />} />
          <Route path="/company" element={<Navigate to="/profile/company" replace />} />
          <Route path="/profile/*" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Show>
  </>
)

export default App
