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
        <label>SLIIT Registration Number</label>
        <input type="text" value={form.sliit_reg_number || ''} onChange={(e) => set('sliit_reg_number', e.target.value)} />
      </div>

      <div className="field">
        <label>Faculty</label>
        <select value={form.faculty || ''} onChange={(e) => set('faculty', e.target.value)}>
          <option value="">Select faculty</option>
          {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Year</label>
        <select value={form.year || ''} onChange={(e) => set('year', e.target.value)}>
          <option value="">Select year</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Are you a member of Rotaract?</label>
        <div className="segment">
          <button type="button" className={form.is_rotaract_member ? 'active' : ''}
            onClick={() => set('is_rotaract_member', true)}>Yes</button>
          <button type="button" className={form.is_rotaract_member === false ? 'active' : ''}
            onClick={() => set('is_rotaract_member', false)}>No</button>
        </div>
      </div>

      {form.is_rotaract_member && (
        <>
          <div className="field">
            <label>Position</label>
            <select value={form.position || ''} onChange={(e) => set('position', e.target.value)}>
              <option value="">Select position</option>
              <option value="board">Board member</option>
              <option value="general">General member</option>
              <option value="new">New member</option>
            </select>
          </div>

          <div className="field">
            <label>Do you have the Rotaract Membership Card?</label>
            <select value={form.membership_card_status || ''} onChange={(e) => set('membership_card_status', e.target.value)}>
              <option value="">Select</option>
              <option value="with_me">Yes, I have it with me</option>
              <option value="paid_no_card">Yes, I paid the membership fee, but I don't have the card with me</option>
              <option value="no_card">No, I don't have the membership card</option>
            </select>
          </div>
        </>
      )}

      <div className="field">
        <label>Are you a Board Member?</label>
        <div className="segment">
          <button type="button" className={form.is_board_member ? 'active' : ''}
            onClick={() => set('is_board_member', true)}>Yes</button>
          <button type="button" className={form.is_board_member === false ? 'active' : ''}
            onClick={() => set('is_board_member', false)}>No</button>
        </div>
      </div>

      {form.is_board_member && (
        <>
          <div className="field"><label>Board Member Name</label>
            <input type="text" value={form.board_member_name || ''} onChange={(e) => set('board_member_name', e.target.value)} />
          </div>
          <div className="field"><label>Board Member Position</label>
            <input type="text" value={form.board_member_position || ''} onChange={(e) => set('board_member_position', e.target.value)} />
          </div>
          <div className="field"><label>Board Member Contact Number</label>
            <input type="tel" value={form.board_member_contact || ''} onChange={(e) => set('board_member_contact', e.target.value)} />
          </div>
        </>
      )}

      <details className="optional">
        <summary>Parent / Guardian Information <span className="hint">(optional — fill in if applicable)</span></summary>
        <div className="inner">
          <div className="field"><label>Mother's Name</label>
            <input type="text" value={form.mother_name || ''} onChange={(e) => set('mother_name', e.target.value)} />
          </div>
          <div className="field"><label>Mother's NIC</label>
            <input type="text" value={form.mother_nic || ''} onChange={(e) => set('mother_nic', e.target.value)} />
          </div>
          <div className="field"><label>Mother's Contact</label>
            <input type="tel" value={form.mother_contact || ''} onChange={(e) => set('mother_contact', e.target.value)} />
          </div>
          <div className="field"><label>Father's Name</label>
            <input type="text" value={form.father_name || ''} onChange={(e) => set('father_name', e.target.value)} />
          </div>
          <div className="field"><label>Father's NIC</label>
            <input type="text" value={form.father_nic || ''} onChange={(e) => set('father_nic', e.target.value)} />
          </div>
          <div className="field"><label>Father's Contact</label>
            <input type="tel" value={form.father_contact || ''} onChange={(e) => set('father_contact', e.target.value)} />
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
        <label>Food Preference</label>
        <div className="segment">
          <button type="button" className={form.food_preference === 'veg' ? 'active' : ''}
            onClick={() => set('food_preference', 'veg')}>Veg</button>
          <button type="button" className={form.food_preference === 'non_veg' ? 'active' : ''}
            onClick={() => set('food_preference', 'non_veg')}>Non-Veg</button>
        </div>
      </div>

      <div className="field">
        <label>Will you be parking your vehicle inside SLIIT premises?</label>
        <div className="segment">
          <button type="button" className={form.parking_inside ? 'active' : ''}
            onClick={() => set('parking_inside', true)}>Yes</button>
          <button type="button" className={form.parking_inside === false ? 'active' : ''}
            onClick={() => set('parking_inside', false)}>No</button>
        </div>
      </div>

      {form.parking_inside && (
        <div className="field">
          <label>Vehicle Number</label>
          <input type="text" value={form.vehicle_number || ''} onChange={(e) => set('vehicle_number', e.target.value)} />
        </div>
      )}
    </>
  )
}
