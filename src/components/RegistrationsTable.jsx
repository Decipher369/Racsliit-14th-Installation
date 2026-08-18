import { useState } from 'react'

export default function RegistrationsTable({ registrations, onSelect }) {
  const [catFilter, setCatFilter] = useState('all')
  const [attFilter, setAttFilter] = useState('all')
  const [sort, setSort] = useState('reg_number')

  let rows = registrations
  if (catFilter !== 'all') rows = rows.filter((r) => r.category === catFilter)
  if (attFilter === 'in') rows = rows.filter((r) => r.attended)
  if (attFilter === 'out') rows = rows.filter((r) => !r.attended)

  const sorted = [...rows].sort((a, b) => {
    if (sort === 'reg_number') return a.reg_number - b.reg_number
    if (sort === 'registered_at') return new Date(a.registered_at) - new Date(b.registered_at)
    return 0
  })

  const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : '—')

  return (
    <div>
      <div className="table-filters">
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
          <option value="all">All categories</option>
          <option value="sliit_member">SLIIT Members</option>
          <option value="outside_sliit">Outside Guests</option>
        </select>
        <select value={attFilter} onChange={(e) => setAttFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="out">Not Yet</option>
          <option value="in">Checked In</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
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
              <th>Contact</th>
              <th>Food</th>
              <th>Attended</th>
              <th>Checked-in Time</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} onClick={() => onSelect(r)} style={{ cursor: 'pointer' }}>
                <td>{r.reg_number}</td>
                <td>{r.full_name}</td>
                <td>{r.category === 'sliit_member' ? 'SLIIT' : 'Outside'}</td>
                <td>{r.contact_number}</td>
                <td>{r.food_preference}</td>
                <td>
                  {r.attended
                    ? <span className="badge green">Checked In</span>
                    : <span className="badge grey">Not Yet</span>}
                </td>
                <td>{fmt(r.checked_in_at)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)' }}>No registrations.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
