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
    <div className="container">
      <div className="card auth-wrap">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-block" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p style={{ marginTop: 14, fontSize: 13, textAlign: 'center' }}>
          <Link to="/register">← Registration form</Link>
        </p>
      </div>
    </div>
  )
}
