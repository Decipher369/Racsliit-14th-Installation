import { affiliationLabels, foodLabel, parkingLabel, dateLabel } from '../lib/registrationLabels.js'

function DetailGroup({ title, fields }) {
  return <section className="admin-detail-group" aria-label={title}>
    <h4>{title}</h4>
    <dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl>
  </section>
}

export default function CheckInConfirmCard({ row, onConfirm, busy }) {
  if (!row) return null
  const catLabel = row.category === 'sliit_member' ? 'SLIIT Member' : 'Outside Guest'
  return (
    <div className="checkin-card">
      <h3>{row.full_name}</h3>
      <div className="row">Reg #: <strong>{row.reg_number}</strong></div>
      <div className="row">Category: {catLabel}</div>
      <div className="row">
        Status: {row.attended
          ? <span className="done">Checked In</span>
          : <span className="grey">Not yet checked in</span>}
      </div>
      {!row.attended && (
        <button className="btn" onClick={() => onConfirm(row)} disabled={busy}>
          {busy ? 'Checking in...' : 'Confirm Check-In'}
        </button>
      )}
      {row.attended && <div className="row">Checked in at: {dateLabel(row.checked_in_at)}</div>}
      <DetailGroup title="Contact & event details" fields={[
        ['Contact / WhatsApp', row.contact_number],
        ['NIC number', row.nic_number],
        ['Food preference', foodLabel(row.food_preference)],
        ['Parking inside SLIIT', parkingLabel(row.parking_inside)],
        ...(row.parking_inside ? [['Vehicle number', row.vehicle_number]] : []),
        ['Registered at', dateLabel(row.registered_at)],
      ]} />
      {row.category === 'sliit_member' ? <>
        <DetailGroup title="SLIIT details" fields={[
          ['SLIIT registration number', row.sliit_reg_number],
          ['Faculty', row.faculty],
          ['Year', row.year],
        ]} />
        <details className="admin-parent-details" key={row.id}>
          <summary>Parent / guardian information</summary>
          <DetailGroup title="Mother" fields={[
            ['Name', row.mother_name], ['NIC', row.mother_nic], ['Contact', row.mother_contact],
          ]} />
          <DetailGroup title="Father" fields={[
            ['Name', row.father_name], ['NIC', row.father_nic], ['Contact', row.father_contact],
          ]} />
        </details>
      </> : <DetailGroup title="Club & organization" fields={[
        ['Affiliation', affiliationLabels[row.affiliation] || row.affiliation],
        ['Club / organization', row.club_or_org_name],
        ['Designation', row.designation],
      ]} />}
    </div>
  )
}
