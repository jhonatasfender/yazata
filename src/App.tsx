import { Show } from '@clerk/react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/app-layout'
import { ForgotPasswordPage } from './pages/forgot-password-page'
import { LoginPage } from './pages/login-page.tsx'
import { RegisterPage } from './pages/register-page'
import { SignUpPage } from './pages/sign-up-page'
import { SummaryPage } from './pages/summary-page'
import { TeamPage } from './pages/team-page.tsx'
import { ProfilePage } from './pages/profile-page.tsx'
import { TeamInvitePage } from './pages/team-invite-page.tsx'
import { TeamEditHourlyRatePage } from './pages/team-edit-hourly-rate-page.tsx'
import { ProjectsPage } from './pages/projects-page.tsx'

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
          <Route path="/" element={<RegisterPage />} />
          <Route path="/resumo" element={<SummaryPage />} />
          <Route path="/equipe" element={<TeamPage />} />
          <Route path="/equipe/cadastrar" element={<TeamInvitePage />} />
          <Route path="/equipe/:employeeId/editar" element={<TeamEditHourlyRatePage />} />
          <Route path="/projetos" element={<ProjectsPage />} />
          <Route path="/profile/*" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Show>
  </>
)

export default App
