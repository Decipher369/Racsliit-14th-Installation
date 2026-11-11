import { useCallback, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import RegistrationIntro from './components/RegistrationIntro'
import GlassReveal21stDemo from './components/ui/demo'
import Register from './pages/Register.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

function RegistrationPage() {
  const [showIntro, setShowIntro] = useState(true)
  const continueToRegistration = useCallback(() => setShowIntro(false), [])
  return (
    <>
      <div inert={showIntro ? '' : undefined} aria-hidden={showIntro || undefined}>
        <Register heroActive={!showIntro} />
      </div>
      {showIntro && <RegistrationIntro onContinue={continueToRegistration} />}
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/demo" element={<GlassReveal21stDemo />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  )
}
