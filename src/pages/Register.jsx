import { useState } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase.js'
import SliitMemberFields from '../components/SliitMemberFields.jsx'
import OutsideGuestFields from '../components/OutsideGuestFields.jsx'

export default function Register() {
  const [category, setCategory] = useState(null)
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')

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
      const dataUrl = await QRCode.toDataURL(data.id)
      setQrDataUrl(dataUrl)
      setConfirmed(data)
    } catch (err) {
      setError('Registration failed: ' + (err.message || 'unknown error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <div className="container">
        <div className="card confirm">
          <h2>You're registered! 🎉</h2>
          <p>{confirmed.full_name}</p>
          <div className="regnum">#{confirmed.reg_number}</div>
          <div className="qr-wrap">
            {qrDataUrl && <img src={qrDataUrl} alt="QR code" />}
          </div>
          <p className="instructions">
            Save a screenshot of this QR code, or remember your registration number —
            either will be used for check-in at the event.
          </p>
          <button className="btn btn-block" onClick={() => window.location.reload()}>
            Register another guest
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <Banner />

      <div className="category-tabs">
        <button
          className={'category-tab' + (category === 'sliit_member' ? ' active' : '')}
          onClick={() => { setCategory('sliit_member'); setForm({}); setError('') }}
        >
          I'm a SLIIT Member
        </button>
        <button
          className={'category-tab' + (category === 'outside_sliit' ? ' active' : '')}
          onClick={() => { setCategory('outside_sliit'); setForm({}); setError('') }}
        >
          I'm a Guest (Outside SLIIT)
        </button>
      </div>

      {(category === 'sliit_member' || category === 'outside_sliit') && (
        <form className="card" onSubmit={handleSubmit} noValidate>
          {category === 'sliit_member'
            ? <SliitMemberFields form={form} set={set} />
            : <OutsideGuestFields form={form} set={set} />}

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </form>
      )}
    </div>
  )
}

function Banner() {
  return (
    <div className="banner">
      <h1>13th Installation Ceremony of the Rotaract Club of SLIIT</h1>
      <p className="invite">Rtr. Yasith Ardithya and his Board of Officials graciously invite you to join us.</p>
      <p>Date: 25th October 2024</p>
      <p>Time: 2:00 PM – 5:00 PM</p>
      <p>Venue: SLIIT Auditorium</p>
      <p>Attire: Formal / Lounge wear</p>
      <p className="note">Registration closes 21st August 2024, 11:59 PM.</p>
    </div>
  )
}
