import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-top">
          <span className="auth-tabs">
            <span className="auth-tab active">Log in</span>
            <span className="auth-tab-sep"> or </span>
            <span className="auth-tab">Sign up</span>
          </span>
          <Link to="/register" className="auth-close" aria-label="Close">&times;</Link>
        </div>

        <h2 className="auth-welcome">Welcome to the Rotaract Club of SLIIT</h2>
        <p className="auth-sub">Sign in to the check-in dashboard</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <a
                className="forgot"
                href="#reset"
                onClick={(e) => e.preventDefault()}
              >
                Reset password
              </a>
            </div>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <label className="check-row">
            <input type="checkbox" defaultChecked />
            Remember this device for 30 days
          </label>

          <button className="btn btn-block" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-terms">
          By logging in, I agree and accept the Terms of Service
        </p>

        <p className="auth-help">
          Access is granted by the organizing committee.{' '}
          <Link to="/register">← Registration form</Link>
        </p>
      </div>
    </div>
  )
}
