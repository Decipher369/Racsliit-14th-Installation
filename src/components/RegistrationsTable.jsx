import { useState } from 'react'
import { affiliationLabels, foodLabel, parkingLabel, dateLabel } from '../lib/registrationLabels.js'

export default function RegistrationsTable({ registrations, onSelect }) {
  const [catFilter, setCatFilter] = useState('all')
  const [attFilter, setAttFilter] = useState('all')
  const [parkingFilter, setParkingFilter] = useState('all')
  const [sort, setSort] = useState('reg_number')

  let rows = registrations
  if (catFilter !== 'all') rows = rows.filter((r) => r.category === catFilter)
  if (attFilter === 'in') rows = rows.filter((r) => r.attended)
  if (attFilter === 'out') rows = rows.filter((r) => !r.attended)

  if (parkingFilter === 'yes') rows = rows.filter((r) => r.parking_inside === true)
  if (parkingFilter === 'no') rows = rows.filter((r) => r.parking_inside === false)

  const sorted = [...rows].sort((a, b) => {
    if (sort === 'reg_number') return a.reg_number - b.reg_number
    if (sort === 'registered_at') return new Date(a.registered_at) - new Date(b.registered_at)
    return 0
  })

  return (
    <div>
      <div className="table-filters">
        <select aria-label="Filter by category" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">All categories</option>
          <option value="sliit_member">SLIIT Members</option>
          <option value="outside_sliit">Outside Guests</option>
        </select>
        <select aria-label="Filter by attendance" value={attFilter} onChange={(e) => setAttFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="out">Not Yet</option>
          <option value="in">Checked In</option>
        </select>
        <select aria-label="Filter by parking" value={parkingFilter} onChange={(e) => setParkingFilter(e.target.value)}>
          <option value="all">All parking requests</option>
          <option value="yes">Parking requested</option>
          <option value="no">No parking requested</option>
        </select>
        <select aria-label="Sort registrations" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="reg_number">Sort by Reg #</option>
          <option value="registered_at">Sort by Registered At</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th onClick={() => setSort('reg_number')}>Reg #</th>
              <th>Name</th>
              <th>Category</th>
              <th>Club / Organization</th>
              <th>Contact</th>
              <th>Food</th>
              <th>Parking</th>
              <th>Vehicle</th>
              <th>Attended</th>
              <th>Checked-in Time</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} tabIndex={0} aria-label={`Select ${r.full_name}, registration ${r.reg_number}`} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(r) } }} onClick={() => onSelect(r)} style={{ cursor: 'pointer' }}>
                <td data-label="Reg #">{r.reg_number}</td>
                <td data-label="Name">{r.full_name}</td>
                <td data-label="Category">{r.category === 'sliit_member' ? 'SLIIT' : 'Outside'}</td>
                <td data-label="Club / Org">{r.category === 'sliit_member' ? 'SLIIT' : <>
                  {r.club_or_org_name || 'Not provided'}
                  <span className="admin-table-secondary">{affiliationLabels[r.affiliation] || r.affiliation || 'Not provided'}</span>
                </>}</td>
                <td data-label="Contact">{r.contact_number || 'Not provided'}</td>
                <td data-label="Food">{foodLabel(r.food_preference)}</td>
                <td data-label="Parking">{parkingLabel(r.parking_inside)}</td>
                <td data-label="Vehicle">{r.parking_inside ? r.vehicle_number || 'Not provided' : '—'}</td>
                <td data-label="Attended">
                  {r.attended
                    ? <span className="badge green">Checked In</span>
                    : <span className="badge grey">Not Yet</span>}
                </td>
                <td data-label="Check-in time">{dateLabel(r.checked_in_at)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--muted)' }}>No registrations.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
