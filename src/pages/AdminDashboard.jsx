import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { QrCode, Search, Hash, Users, CircleCheck, GraduationCap, Globe, Leaf, Utensils, ArrowUpRight, LogOut, RefreshCw, ScanLine } from 'lucide-react'
import { LiquidNavbar } from '../components/ui/liquid-glass-navbar'
import clubLogo from '../assets/rotaract-sliit-logo.png'
import { supabase } from '../lib/supabase.js'
import QrScanTab from '../components/QrScanTab.jsx'
import NameSearchTab from '../components/NameSearchTab.jsx'
import RegNumberTab from '../components/RegNumberTab.jsx'
import CheckInConfirmCard from '../components/CheckInConfirmCard.jsx'
import RegistrationsTable from '../components/RegistrationsTable.jsx'

const NAV_ITEMS = [
  { label: 'QR Scan', icon: <QrCode size={18} />, fx: 'pop' },
  { label: 'Search by Name', icon: <Search size={18} />, fx: 'spin' },
  { label: 'Registration Number', icon: <Hash size={18} />, fx: 'wave' },
]
const TAB_KEYS = ['qr', 'name', 'reg']
const TAB_DESCRIPTIONS = {
  qr: 'Scan the QR code on an attendee’s registration pass.',
  name: 'Find an attendee by typing all or part of their name.',
  reg: 'Enter the number printed on an attendee’s registration pass.',
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
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!supabase) {
      navigate('/admin/login', { replace: true })
      return
    }
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
    setRefreshing(true)
    setLoadError('')
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('reg_number')
      if (error) throw error
      setRegistrations(data || [])
    } catch (err) {
      setLoadError('Failed to load registrations: ' + (err.message || 'unknown error'))
    } finally {
      setRefreshing(false)
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

  if (authed === null) return <main className="admin-glass admin-loading" role="status"><RefreshCw size={24} /><p>Checking your session…</p></main>

  const total = registrations.length
  const checkedIn = registrations.filter((r) => r.attended).length
  const sliit = registrations.filter((r) => r.category === 'sliit_member').length
  const outside = registrations.filter((r) => r.category === 'outside_sliit').length
  const veg = registrations.filter((r) => r.food_preference === 'veg').length
  const nonVeg = registrations.filter((r) => r.food_preference === 'non_veg').length

  const stats = [
    { label: 'Total registered', value: total, icon: Users, note: 'Guests on the list' },
    { label: 'Checked in', value: checkedIn, icon: CircleCheck, note: `${total ? Math.round(checkedIn / total * 100) : 0}% of registered guests`, accent: true },
    { label: 'SLIIT members', value: sliit, icon: GraduationCap, note: 'From our community' },
    { label: 'Outside guests', value: outside, icon: Globe, note: 'Joining the celebration' },
    { label: 'Vegetarian', value: veg, icon: Leaf, note: 'Meal preferences' },
    { label: 'Non-vegetarian', value: nonVeg, icon: Utensils, note: 'Meal preferences' },
  ]

  return (
    <main className="admin-glass">
      <div className="admin-container">
        <header className="admin-topbar">
          <Link to="/register" className="admin-brand"><img src={clubLogo} alt="Rotaract Club of SLIIT" /></Link>
          <span className="admin-workspace-label">Committee workspace</span>
          <div className="admin-actions">
            <Link className="glass-action" to="/register">View form <ArrowUpRight size={15} /></Link>
            <button className="glass-action" onClick={async () => {
              await supabase.auth.signOut()
              navigate('/admin/login')
            }}><LogOut size={15} /><span>Log out</span></button>
          </div>
        </header>

        <section className="admin-heading">
          <div><p className="admin-eyebrow">14th Installation · Rotaract Club of SLIIT</p>
            <h1>A warm welcome starts here.</h1>
            <p>Your guest list, arrivals and check-ins. All in one place.</p>
          </div>
          <button className="glass-action" onClick={fetchData} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'admin-spinning' : ''} />{refreshing ? 'Refreshing…' : 'Refresh list'}
          </button>
        </section>

        {loadError && <div className="alert alert-error" role="alert">{loadError}</div>}
        <section className="summary-grid" aria-label="Registration summary" aria-busy={refreshing}>
          {stats.map(({ label, value, icon: Icon, note, accent }) => (
            <article className={'stat glass-surface' + (accent ? ' stat-accent' : '')} key={label}>
              <div className="stat-top"><span className="lbl">{label}</span><Icon size={17} /></div>
              <div className="num">{refreshing && !registrations.length ? '—' : value}</div>
              <p className="sub">{note}</p>
            </article>
          ))}
        </section>

        <section className="glass-surface admin-checkin-section" aria-labelledby="checkin-title">
          <div className="admin-section-heading">
            <div><p className="admin-eyebrow">At the welcome desk</p><h2 id="checkin-title">Check in an attendee</h2></div>
            <LiquidNavbar items={NAV_ITEMS} active={TAB_KEYS.indexOf(tab)}
              onChange={(index) => { setTab(TAB_KEYS[index]); setSelected(null) }}
              tone="light" sound={false} refraction={false} aria-label="Attendee lookup method" />
          </div>
          <div className="admin-checkin-grid">
            <div className="admin-lookup-panel">
              <h3>{NAV_ITEMS[TAB_KEYS.indexOf(tab)].label}</h3>
              <p className="admin-panel-description">{TAB_DESCRIPTIONS[tab]}</p>
              {tab === 'qr' && <QrScanTab registrations={registrations} onScanned={handleSelect} />}
              {tab === 'name' && <NameSearchTab registrations={registrations} onSelect={handleSelect} />}
              {tab === 'reg' && <RegNumberTab registrations={registrations} onSelect={handleSelect} />}
            </div>
            <div className="admin-attendee-panel" aria-live="polite">
              {selected ? <CheckInConfirmCard row={selected} onConfirm={confirmCheckIn} busy={busy} /> : (
                <div className="admin-empty-attendee"><span className="admin-scan-icon"><ScanLine size={30} strokeWidth={1.3} /></span>
                  <h3>Ready for the next hello.</h3><p>Scan a pass or find a guest to see their details and confirm their arrival.</p>
                  <span className="admin-small-label">Attendee details appear here</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {toast && <div className="toast" role="status">{toast}</div>}
        <section className="glass-surface admin-guest-section" aria-labelledby="guest-list-title">
          <div className="admin-section-heading"><div><p className="admin-eyebrow">Everyone on the list</p><h2 id="guest-list-title">Registrations <span className="admin-count">{total}</span></h2></div>
            <span className="admin-table-hint">Select a guest to check them in</span>
          </div>
          <RegistrationsTable registrations={registrations} onSelect={handleSelect} />
        </section>
        <footer className="admin-footer"><span>Rotaract Club of SLIIT</span><span>A celebration. A new chapter.</span></footer>
      </div>
    </main>
  )
}
