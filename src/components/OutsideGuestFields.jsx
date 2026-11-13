import { FoodParking } from './SliitMemberFields.jsx'
import { affiliationLabels as AFFILIATION_LABELS } from '../lib/registrationLabels.js'

const AFFILIATIONS = [
  'rotary',
  'district_exec_committee',
  'district_steering_committee',
  'rotaract',
  'interact',
  'non_rotaract',
]

export default function OutsideGuestFields({ form, set }) {
  return (
    <>
      <div className="field">
        <label htmlFor="full_name">Full Name <span aria-hidden="true">*</span></label>
        <input id="full_name" name="full_name" required type="text" value={form.full_name || ''} onChange={(e) => set('full_name', e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="contact_number">Contact Number / WhatsApp <span aria-hidden="true">*</span></label>
        <input id="contact_number" name="contact_number" required type="tel" value={form.contact_number || ''} onChange={(e) => set('contact_number', e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="nic_number">NIC Number <span aria-hidden="true">*</span></label>
        <input id="nic_number" name="nic_number" required type="text" value={form.nic_number || ''} onChange={(e) => set('nic_number', e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="affiliation">Affiliation <span aria-hidden="true">*</span></label>
        <select id="affiliation" name="affiliation" required value={form.affiliation || ''} onChange={(e) => set('affiliation', e.target.value)}>
          <option value="">Select affiliation</option>
          {AFFILIATIONS.map((a) => <option key={a} value={a}>{AFFILIATION_LABELS[a]}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="club_or_org_name">Name of Club / Organization you represent <span aria-hidden="true">*</span></label>
        <input id="club_or_org_name" name="club_or_org_name" required type="text" value={form.club_or_org_name || ''} onChange={(e) => set('club_or_org_name', e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="designation">Designation <span aria-hidden="true">*</span></label>
        <input id="designation" name="designation" required type="text" placeholder="e.g. General member / Committee Member"
          value={form.designation || ''} onChange={(e) => set('designation', e.target.value)} />
      </div>

      <FoodParking form={form} set={set} />
    </>
  )
}
