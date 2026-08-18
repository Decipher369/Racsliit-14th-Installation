import { FoodParking } from './SliitMemberFields.jsx'

const AFFILIATIONS = [
  'rotary',
  'district_exec_committee',
  'district_steering_committee',
  'rotaract',
  'interact',
  'non_rotaract',
]

const AFFILIATION_LABELS = {
  rotary: 'Rotary',
  district_exec_committee: 'District Executive Committee',
  district_steering_committee: 'District Steering Committee',
  rotaract: 'Rotaract',
  interact: 'Interact',
  non_rotaract: 'Non-Rotaract',
}

export default function OutsideGuestFields({ form, set }) {
  return (
    <>
      <div className="field">
        <label>Full Name</label>
        <input type="text" value={form.full_name || ''} onChange={(e) => set('full_name', e.target.value)} />
      </div>

      <div className="field">
        <label>Contact Number / WhatsApp</label>
        <input type="tel" value={form.contact_number || ''} onChange={(e) => set('contact_number', e.target.value)} />
      </div>

      <div className="field">
        <label>NIC Number</label>
        <input type="text" value={form.nic_number || ''} onChange={(e) => set('nic_number', e.target.value)} />
      </div>

      <div className="field">
        <label>Affiliation</label>
        <select value={form.affiliation || ''} onChange={(e) => set('affiliation', e.target.value)}>
          <option value="">Select affiliation</option>
          {AFFILIATIONS.map((a) => <option key={a} value={a}>{AFFILIATION_LABELS[a]}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Name of Club / Organization you represent</label>
        <input type="text" value={form.club_or_org_name || ''} onChange={(e) => set('club_or_org_name', e.target.value)} />
      </div>

      <div className="field">
        <label>Designation</label>
        <input type="text" placeholder="e.g. General member / Committee Member"
          value={form.designation || ''} onChange={(e) => set('designation', e.target.value)} />
      </div>

      <FoodParking form={form} set={set} />
    </>
  )
}
