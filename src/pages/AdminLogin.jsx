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
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-kicker">Rotaract Club of SLIIT</p>
        <h1 className="auth-title">Committee sign in</h1>
        <div className="auth-divider">
          <div className="rule rule-gold" />
          <span className="star">✦</span>
          <div className="rule rule-gold" />
        </div>

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
              {loading ? 'Signing in…' : 'Sign in'}
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
