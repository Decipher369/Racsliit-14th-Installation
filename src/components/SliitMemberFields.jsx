const FACULTIES = [
  'Faculty of Computing',
  'Faculty of Engineering',
  'Faculty of Law',
  'Faculty of Humanities and Sciences',
  'Business School',
  'Architecture School',
  'SLIIT City Uni (SLIIT Academy)',
  'William Angliss',
]

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']

export default function SliitMemberFields({ form, set }) {
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
        <label htmlFor="sliit_reg_number">SLIIT Registration Number <span aria-hidden="true">*</span></label>
        <input id="sliit_reg_number" name="sliit_reg_number" required type="text" value={form.sliit_reg_number || ''} onChange={(e) => set('sliit_reg_number', e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="faculty">Faculty <span aria-hidden="true">*</span></label>
        <select id="faculty" name="faculty" required value={form.faculty || ''} onChange={(e) => set('faculty', e.target.value)}>
          <option value="">Select faculty</option>
          {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="field">
        <label htmlFor="year">Year <span aria-hidden="true">*</span></label>
        <select id="year" name="year" required value={form.year || ''} onChange={(e) => set('year', e.target.value)}>
          <option value="">Select year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <details className="optional">
        <summary>Parent / Guardian Information <span className="hint">(optional — fill in if applicable)</span></summary>
        <div className="inner">
          <div className="field"><label htmlFor="mother_name">Mother's Name</label>
            <input id="mother_name" name="mother_name" type="text" value={form.mother_name || ''} onChange={(e) => set('mother_name', e.target.value)} />
          </div>
          <div className="field"><label htmlFor="mother_nic">Mother's NIC</label>
            <input id="mother_nic" name="mother_nic" type="text" value={form.mother_nic || ''} onChange={(e) => set('mother_nic', e.target.value)} />
          </div>
          <div className="field"><label htmlFor="mother_contact">Mother's Contact</label>
            <input id="mother_contact" name="mother_contact" type="tel" value={form.mother_contact || ''} onChange={(e) => set('mother_contact', e.target.value)} />
          </div>
          <div className="field"><label htmlFor="father_name">Father's Name</label>
            <input id="father_name" name="father_name" type="text" value={form.father_name || ''} onChange={(e) => set('father_name', e.target.value)} />
          </div>
          <div className="field"><label htmlFor="father_nic">Father's NIC</label>
            <input id="father_nic" name="father_nic" type="text" value={form.father_nic || ''} onChange={(e) => set('father_nic', e.target.value)} />
          </div>
          <div className="field"><label htmlFor="father_contact">Father's Contact</label>
            <input id="father_contact" name="father_contact" type="tel" value={form.father_contact || ''} onChange={(e) => set('father_contact', e.target.value)} />
          </div>
        </div>
      </details>

      <FoodParking form={form} set={set} />
    </>
  )
}

export function FoodParking({ form, set }) {
  return (
    <>
      <div className="field">
        <label id="food-preference">Food Preference</label>
        <div className="segment" role="group" aria-labelledby="food-preference">
          <button type="button" aria-pressed={!!(form.food_preference === 'veg')} className={form.food_preference === 'veg' ? 'active' : ''}
            onClick={() => set('food_preference', 'veg')}>Veg</button>
          <button type="button" aria-pressed={!!(form.food_preference === 'non_veg')} className={form.food_preference === 'non_veg' ? 'active' : ''}
            onClick={() => set('food_preference', 'non_veg')}>Non-Veg</button>
        </div>
      </div>

      <div className="field">
        <label id="will-you-be-parking-your-vehicle-inside-sliit-premises">Will you be parking your vehicle inside SLIIT premises?</label>
        <div className="segment" role="group" aria-labelledby="will-you-be-parking-your-vehicle-inside-sliit-premises">
          <button type="button" aria-pressed={!!(form.parking_inside)} className={form.parking_inside ? 'active' : ''}
            onClick={() => set('parking_inside', true)}>Yes</button>
          <button type="button" aria-pressed={!!(form.parking_inside === false)} className={form.parking_inside === false ? 'active' : ''}
            onClick={() => set('parking_inside', false)}>No</button>
        </div>
      </div>

      {form.parking_inside && (
        <div className="field">
          <label htmlFor="vehicle_number">Vehicle Number <span aria-hidden="true">*</span></label>
          <input id="vehicle_number" name="vehicle_number" required type="text" value={form.vehicle_number || ''} onChange={(e) => set('vehicle_number', e.target.value)} />
        </div>
      )}
    </>
  )
}
