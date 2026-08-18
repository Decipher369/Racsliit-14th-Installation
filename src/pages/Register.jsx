import { useState } from 'react'
import QRCode from 'qrcode'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { drawCard, triggerDownload } from '../lib/cardMaker.js'
import { EVENT_AT } from '../lib/event.js'
import Countdown from '../components/Countdown.jsx'
import SliitMemberFields from '../components/SliitMemberFields.jsx'
import OutsideGuestFields from '../components/OutsideGuestFields.jsx'

function friendlyError(msg) {
  const m = msg || ''
  if (m.includes('DUPLICATE_NIC') || /duplicate key value .*registrations_nic_unique/.test(m)) {
    return 'This NIC is already registered. If you think this is a mistake, please contact the committee.'
  }
  if (m.includes('DUPLICATE_CONTACT') || /duplicate key value .*registrations_contact_unique/.test(m)) {
    return 'This contact number is already registered. If you think this is a mistake, please contact the committee.'
  }
  return m || 'Registration failed.'
}

function Rule({ className = '' }) {
  return <div className={`rule-gold ${className}`} />
}

export default function Register() {
  const [category, setCategory] = useState(null)
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [cardErr, setCardErr] = useState('')

  const dateLabel = EVENT_AT
    ? new Date(EVENT_AT).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })
    : 'To be announced'
  const facts = [
    { k: 'Venue', v: 'SLIIT Auditorium' },
    { k: 'Attire', v: 'Formal / Lounge' },
    { k: 'Date & Time', v: dateLabel },
  ]

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const empty = (v) => v === undefined || v === null || String(v).trim() === ''

  function buildPayload() {
    const base = {
      category,
      full_name: form.full_name,
      contact_number: form.contact_number,
      nic_number: form.nic_number,
      food_preference: form.food_preference,
      parking_inside: !!form.parking_inside,
    }
    if (form.parking_inside) base.vehicle_number = form.vehicle_number
    if (category === 'sliit_member') {
      Object.assign(base, {
        sliit_reg_number: form.sliit_reg_number,
        faculty: form.faculty,
        year: form.year,
        is_rotaract_member: form.is_rotaract_member,
        position: form.is_rotaract_member ? form.position : null,
        membership_card_status: form.is_rotaract_member ? form.membership_card_status : null,
        is_board_member: form.is_board_member,
        board_member_name: form.is_board_member ? form.board_member_name : null,
        board_member_position: form.is_board_member ? form.board_member_position : null,
        board_member_contact: form.is_board_member ? form.board_member_contact : null,
        mother_name: form.mother_name || null,
        mother_nic: form.mother_nic || null,
        mother_contact: form.mother_contact || null,
        father_name: form.father_name || null,
        father_nic: form.father_nic || null,
        father_contact: form.father_contact || null,
      })
    } else {
      Object.assign(base, {
        affiliation: form.affiliation,
        club_or_org_name: form.club_or_org_name,
        designation: form.designation,
      })
    }
    return base
  }

  function validate() {
    const req = []
    if (category === 'sliit_member') {
      const needed = [
        'full_name', 'contact_number', 'nic_number', 'sliit_reg_number',
        'faculty', 'year', 'food_preference',
      ]
      if (empty(form.is_rotaract_member)) throw new Error('Please answer whether you are a Rotaract member.')
      if (form.is_rotaract_member) {
        if (empty(form.position)) throw new Error('Please select your Rotaract position.')
        if (empty(form.membership_card_status)) throw new Error('Please answer the membership card question.')
      }
      if (form.is_board_member) {
        needed.push('board_member_name', 'board_member_position', 'board_member_contact')
      }
      for (const f of needed) if (empty(form[f])) req.push(f)
    } else {
      const needed = [
        'full_name', 'contact_number', 'nic_number', 'affiliation',
        'club_or_org_name', 'designation', 'food_preference',
      ]
      for (const f of needed) if (empty(form[f])) req.push(f)
    }
    if (form.parking_inside && empty(form.vehicle_number)) req.push('vehicle_number')
    if (req.length) throw new Error('Please fill in all required fields: ' + req.join(', '))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      validate()
    } catch (err) {
      setError(err.message)
      return
    }
    setSubmitting(true)
    try {
      const { data, error } = await supabase.rpc('register_guest', {
        payload: buildPayload(),
      })
      if (error) throw error
      const dataUrl = await QRCode.toDataURL(data.id, {
        margin: 1, width: 480,
        color: { dark: '#3a2560', light: '#ffffff' },
      })
      setQrDataUrl(dataUrl)
      setConfirmed(data)
    } catch (err) {
      setError('Registration failed: ' + friendlyError(err.message))
    } finally {
      setSubmitting(false)
    }
  }

  async function downloadCardImage() {
    if (!confirmed) return
    setCardErr('')
    try {
      const url = await drawCard({
        full_name: confirmed.full_name,
        reg_number: confirmed.reg_number,
        category: confirmed.category,
        food: confirmed.food_preference,
        qrDataUrl,
      })
      triggerDownload(url, `Rotaract-Card-${confirmed.reg_number}.png`)
    } catch (err) {
      setCardErr('Could not create the card image: ' + (err.message || 'unknown error'))
    }
  }

  if (confirmed) {
    return (
      <main className="container">
        <section className="surface-card confirm">
          <div className="confirm-head">
            <p className="kicker">Registration confirmed</p>
            <h1 className="name">{confirmed.full_name}</h1>
            <p className="num">#{confirmed.reg_number}</p>
          </div>
          <div className="confirm-body">
            {qrDataUrl && (
              <div className="qr-wrap">
                <img src={qrDataUrl} alt="QR check-in pass" width={224} height={224} />
              </div>
            )}
            <p className="instructions">
              Download your pass as a card image, save a screenshot of this QR code,
              or remember your registration number — any of these is used to check you in at the entrance.
            </p>
            <div className="card-actions">
              <button className="btn" onClick={downloadCardImage}>
                Download card image
              </button>
            </div>
            {cardErr && <div className="alert alert-error" style={{ textAlign: 'center' }}>{cardErr}</div>}
            <button className="btn btn-block" onClick={() => window.location.reload()}>
              Register another guest
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="container">
      <header className="landing-header">
        <p className="landing-kicker">Rotaract Club of SLIIT</p>
        <div className="landing-edition">
          <span className="num">14</span>
          <span className="suf">TH</span>
        </div>
        <h1 className="landing-title">
          Installation<br />Ceremony
        </h1>
        <div className="landing-divider">
          <Rule />
          <span className="star">✦</span>
          <Rule />
        </div>
        <Countdown target={EVENT_AT} />
        <p className="landing-invite">
          The incoming President and the Board of Officials graciously invite you to join us
          for the evening. Complete the form below to reserve your seat and receive your QR check-in pass.
        </p>
      </header>

      <div className="landing-facts">
        {facts.map((fact) => (
          <div key={fact.k} className="fact">
            <p className="k">{fact.k}</p>
            <p className="v">{fact.v}</p>
          </div>
        ))}
      </div>

      <div className="landing-choices">
        <button
          className={'choice-btn' + (category === 'sliit_member' ? ' active' : '')}
          onClick={() => { setCategory('sliit_member'); setForm({}); setError('') }}
        >
          I'm a SLIIT member
        </button>
        <button
          className={'choice-btn' + (category === 'outside_sliit' ? ' active' : '')}
          onClick={() => { setCategory('outside_sliit'); setForm({}); setError('') }}
        >
          I'm a guest (outside SLIIT)
        </button>
      </div>

      {(category === 'sliit_member' || category === 'outside_sliit') && (
        <form className="card" onSubmit={handleSubmit} noValidate>
          {category === 'sliit_member'
            ? <SliitMemberFields form={form} set={set} />
            : <OutsideGuestFields form={form} set={set} />}

          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ marginTop: 18 }}>
            <button className="btn btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Confirm my seat'}
            </button>
          </div>
        </form>
      )}

      <footer style={{ marginTop: 48, textAlign: 'center' }}>
        <Link to="/admin/login" style={{ color: 'var(--muted-foreground)', fontSize: 13, textDecoration: 'none' }}>
          Committee check-in dashboard
        </Link>
      </footer>
    </main>
  )
}
