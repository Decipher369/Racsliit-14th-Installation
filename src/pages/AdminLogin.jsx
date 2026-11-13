import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, LockKeyhole } from 'lucide-react'
import clubLogo from '../assets/rotaract-sliit-logo.png'
import { supabase } from '../lib/supabase.js'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!supabase) {
      setError('Committee sign in is not available yet. Please try again later.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Login failed: ' + error.message)
      return
    }
    navigate('/admin')
  }

  return (
    <main className="auth-page admin-glass">
      <section className="auth-card glass-surface">
        <img className="admin-auth-logo" src={clubLogo} alt="Rotaract Club of SLIIT" />
        <div className="admin-auth-icon"><LockKeyhole size={23} strokeWidth={1.5} /></div>
        <p className="auth-kicker">Rotaract Club of SLIIT</p>
        <h1 className="auth-title">Committee sign in</h1>
        <p className="admin-auth-description">Welcome back. Let’s get everyone settled in.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@rotaractsliit.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ marginTop: 20 }}>
            <button className="btn btn-block" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} />
            </button>
          </div>
        </form>

        <p className="auth-back">
          Access is granted by the organising committee.{' '}
          <Link to="/register">Back to registration</Link>
        </p>
      </section>
    </main>
  )
}
