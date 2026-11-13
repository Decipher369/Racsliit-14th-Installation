import { useEffect, useState } from 'react'
import { ArrowUpRight, Asterisk, Check, MapPin, Shirt, Ticket } from 'lucide-react'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase.js'
import { drawCard, triggerDownload } from '../lib/cardMaker.js'
import CeremonyHero from '../components/CeremonyHero'
import SliitMemberFields from '../components/SliitMemberFields.jsx'
import OutsideGuestFields from '../components/OutsideGuestFields.jsx'

function friendlyError(msg) {
  const m = msg || ''
  if (m.includes('INVALID_NIC') || m.includes('invalid NIC format') || m.includes('invalid_nic')) {
    return 'Please enter a valid NIC — 9 digits ending in V or X, or 12 digits.'
  }
  if (m.includes('DUPLICATE_NIC') || /duplicate key value .*registrations_nic_unique/.test(m)) {
    return 'This NIC is already registered. If you think this is a mistake, please contact the committee.'
  }
  if (m.includes('DUPLICATE_CONTACT') || /duplicate key value .*registrations_contact_unique/.test(m)) {
    return 'This contact number is already registered. If you think this is a mistake, please contact the committee.'
  }
  return m || 'Registration failed.'
}

export default function Register({ heroActive = true }) {
  const [category, setCategory] = useState(null)
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [cardErr, setCardErr] = useState('')

  useEffect(() => {
    if (confirmed) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [confirmed])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const empty = (v) => v === undefined || v === null || String(v).trim() === ''

// Sri Lankan NIC: 9 digits + V/X (old format) or 12 digits (new format).
// Rejects ASCII junk like "asdf1234" while allowing both official forms.
const NIC_RE = /^(?:\d{9}[vVxX]|\d{12})$/
function validNIC(v) {
  return empty(v) || NIC_RE.test(String(v).trim())
}

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
      for (const f of needed) if (empty(form[f])) req.push(f)
    } else {
      const needed = [
        'full_name', 'contact_number', 'nic_number', 'affiliation',
        'club_or_org_name', 'designation', 'food_preference',
      ]
      for (const f of needed) if (empty(form[f])) req.push(f)
    }
    if (form.parking_inside && empty(form.vehicle_number)) req.push('vehicle_number')
    if (req.length) {
      const labels = { full_name: 'Full name', contact_number: 'Contact number', nic_number: 'NIC number', sliit_reg_number: 'SLIIT registration number', faculty: 'Faculty', year: 'Year', food_preference: 'Food preference', affiliation: 'Affiliation', club_or_org_name: 'Club or organization', designation: 'Designation', vehicle_number: 'Vehicle number' }
      throw new Error('Please complete: ' + req.map((field) => labels[field] || field).join(', ') + '.')
    }
    if (form.nic_number && !validNIC(form.nic_number)) {
      throw new Error('Please enter a valid NIC — 9 digits ending in V or X, or 12 digits.')
    }
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
      if (!supabase) throw new Error('Registration is not available yet. Please try again later.')
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
      <main className="container ceremony-confirm">
        <section className="surface-card confirm">
          <div className="confirm-head">
            <Check className="confirmation-check" size={30} aria-hidden="true" /><p className="kicker" role="status">Your seat is reserved</p>
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
    <main className="installation-page">
      <CeremonyHero active={heroActive} />
      <section className="registration-section" id="registration" aria-labelledby="registration-title">
        <div className="registration-introduction">
          <span className="poster-label"><span className="section-number">01</span> Your invitation</span>
          <h2 id="registration-title">An evening to<br /><em>remember.</em></h2>
          <p>The incoming President and Board of Officials invite you to celebrate a new chapter with the Rotaract community.</p>
          <div className="registration-fact"><MapPin size={19} aria-hidden="true" /><div><span className="poster-label">The setting</span><strong>SLIIT Auditorium</strong></div></div>
          <div className="registration-fact"><Shirt size={19} aria-hidden="true" /><div><span className="poster-label">Dress code</span><strong>Formal</strong><p className="registration-dress-code">Gents: Blazer, shirt &amp; tie<br />Ladies: Saree or business attire</p></div></div>
          <div className="registration-pass-note"><Ticket size={25} aria-hidden="true" /><p>Reserve your seat below.<br />Your QR pass follows confirmation.</p></div>
          <Asterisk className="registration-flower" size={90} strokeWidth={1} aria-hidden="true" />
        </div>

        <div className="registration-panel">
          <div className="registration-panel-heading"><span className="poster-label">RSVP · 22 November 2026</span><span className="poster-label">No. 014</span></div>
          <h3>Make yourself part of it.</h3>
          <p className="registration-panel-description">Choose your guest category to get started.</p>
          <div className="registration-categories" role="group" aria-label="Guest category">
            <button
              type="button"
              className={'registration-category' + (category === 'sliit_member' ? ' active' : '')}
              aria-pressed={category === 'sliit_member'}
              onClick={() => { setCategory('sliit_member'); setForm({}); setError('') }}
            >
              <span className="poster-label">01 / On campus</span>
              <span>SLIIT member <ArrowUpRight size={19} aria-hidden="true" /></span>
              <small>Students &amp; club members</small>
            </button>
            <button
              type="button"
              className={'registration-category' + (category === 'outside_sliit' ? ' active' : '')}
              aria-pressed={category === 'outside_sliit'}
              onClick={() => { setCategory('outside_sliit'); setForm({}); setError('') }}
            >
              <span className="poster-label">02 / Beyond campus</span>
              <span>Invited guest <ArrowUpRight size={19} aria-hidden="true" /></span>
              <small>Guests from outside SLIIT</small>
            </button>
          </div>

          {category ? (
            <form className="registration-form" onSubmit={handleSubmit} noValidate aria-label="Seat reservation">
              <div className="registration-form-heading"><h4>Your details</h4><span>* Required fields</span></div>
              <div className="registration-fields">
                {category === 'sliit_member'
                  ? <SliitMemberFields form={form} set={set} />
                  : <OutsideGuestFields form={form} set={set} />}
              </div>
              {error && <div className="alert alert-error" role="alert">{error}</div>}
              <div className="registration-submit">
                <p>Your details will be used for registration and event check-in.</p>
                <button className="btn" type="submit" disabled={submitting}>
                  {submitting ? 'Reserving your seat…' : 'Reserve my seat'} <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              </div>
            </form>
          ) : (
            <div className="registration-empty"><span aria-hidden="true">✦</span><p>A seat for you.<br />A new chapter for us.</p><span className="poster-label">Select your category above</span></div>
          )}
        </div>
      </section>
      <footer className="ceremony-footer"><span>Rotaract Club of SLIIT</span><span>14th Installation Ceremony · 2026</span><a href="#registration">See you on the 22nd <ArrowUpRight size={14} /></a></footer>
    </main>
  )
}
