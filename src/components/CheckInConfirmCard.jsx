export default function CheckInConfirmCard({ row, onConfirm, busy }) {
  if (!row) return null
  const catLabel = row.category === 'sliit_member' ? 'SLIIT Member' : 'Outside Guest'
  return (
    <div className="checkin-card">
      <h3>{row.full_name}</h3>
      <div className="row">Reg #: <strong>{row.reg_number}</strong></div>
      <div className="row">Category: {catLabel}</div>
      <div className="row">Food: {row.food_preference}</div>
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
      {row.attended && <div className="row">Checked in at: {row.checked_in_at || ''}</div>}
    </div>
  )
}
