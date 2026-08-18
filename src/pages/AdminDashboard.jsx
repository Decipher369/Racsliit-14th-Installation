import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import QrScanTab from '../components/QrScanTab.jsx'
import NameSearchTab from '../components/NameSearchTab.jsx'
import RegNumberTab from '../components/RegNumberTab.jsx'
import CheckInConfirmCard from '../components/CheckInConfirmCard.jsx'
import RegistrationsTable from '../components/RegistrationsTable.jsx'

const TABS = {
  qr: 'QR Scan',
  name: 'Search by Name',
  reg: 'Registration Number',
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [tab, setTab] = useState('qr')
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/admin/login', { replace: true })
        return
      }
      setAuthed(true)
      fetchData()
    })
  }, [])

  async function fetchData() {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('reg_number')
      if (error) throw error
      setRegistrations(data || [])
    } catch (err) {
      setLoadError('Failed to load registrations: ' + (err.message || 'unknown error'))
    }
  }

  async function confirmCheckIn(row) {
    setBusy(true)
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ attended: true, checked_in_at: new Date().toISOString() })
        .eq('id', row.id)
      if (error) throw error
      const patched = registrations.map((r) =>
        r.id === row.id ? { ...r, attended: true, checked_in_at: new Date().toISOString() } : r
      )
      setRegistrations(patched)
      setSelected(patched.find((r) => r.id === row.id))
      setToast(`${row.full_name} checked in!`)
      setTimeout(() => setToast(''), 2500)
    } catch (err) {
      setToast('Check-in failed: ' + (err.message || 'unknown error'))
      setTimeout(() => setToast(''), 4000)
    } finally {
      setBusy(false)
    }
  }

  function handleSelect(row) {
    setSelected(row)
  }

  if (authed === null) return <div className="container">Checking session...</div>

  const total = registrations.length
  const checkedIn = registrations.filter((r) => r.attended).length
  const sliit = registrations.filter((r) => r.category === 'sliit_member').length
  const outside = registrations.filter((r) => r.category === 'outside_sliit').length
  const veg = registrations.filter((r) => r.food_preference === 'veg').length
  const nonVeg = registrations.filter((r) => r.food_preference === 'non_veg').length

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Rotaract Installation — Check-In Dashboard</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/register">View form</Link>
          <button className="btn btn-danger btn-sm" onClick={async () => {
            await supabase.auth.signOut()
            navigate('/admin/login')
          }}>Log out</button>
        </div>
      </div>

      {loadError && <div className="alert alert-error">{loadError}</div>}

      <div className="summary-grid">
        <div className="stat"><div className="num">{total}</div><div className="lbl">Total registered</div></div>
        <div className="stat"><div className="num">{checkedIn} / {total}</div><div className="lbl">Checked in</div></div>
        <div className="stat"><div className="num">{sliit}</div><div className="lbl">SLIIT Members</div></div>
        <div className="stat"><div className="num">{outside}</div><div className="lbl">Outside Guests</div></div>
        <div className="stat"><div className="num">{veg}</div><div className="lbl">Veg</div></div>
        <div className="stat"><div className="num">{nonVeg}</div><div className="lbl">Non-Veg</div></div>
      </div>

      <div className="tabs">
        {Object.entries(TABS).map(([key, label]) => (
          <button key={key}
            className={'tab-btn' + (tab === key ? ' active' : '')}
            onClick={() => { setTab(key); setSelected(null) }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'qr' && <QrScanTab registrations={registrations} onScanned={handleSelect} />}
      {tab === 'name' && <NameSearchTab registrations={registrations} onSelect={handleSelect} />}
      {tab === 'reg' && <RegNumberTab registrations={registrations} onSelect={handleSelect} />}

      <CheckInConfirmCard row={selected} onConfirm={confirmCheckIn} busy={busy} />

      {toast && <div className="toast">{toast}</div>}

      <RegistrationsTable registrations={registrations} onSelect={handleSelect} />
    </div>
  )
}
