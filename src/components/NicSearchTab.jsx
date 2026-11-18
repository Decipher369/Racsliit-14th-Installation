import { useState } from 'react'

export function searchByNic(registrations, query) {
  const nic = query.trim().toLowerCase()
  return nic
    ? registrations.filter((r) => (r.nic_number || '').trim().toLowerCase().includes(nic)).slice(0, 30)
    : []
}

export default function NicSearchTab({ registrations, onSelect }) {
  const [query, setQuery] = useState('')
  const results = searchByNic(registrations, query)

  return (
    <div>
      <div className="field search-input">
        <input
          type="text"
          aria-label="Search attendees by NIC"
          placeholder="Type an NIC number to search..."
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {query.trim() && results.length === 0 && (
        <div className="alert">No registrations match &quot;{query}&quot;.</div>
      )}
      <ul className="results-list">
        {results.map((r) => (
          <li key={r.id}><button type="button" className="admin-search-result" onClick={() => onSelect(r)}>
            <strong>{r.full_name}</strong>
            <div className="meta">
              #{r.reg_number} · {r.category === 'sliit_member' ? 'SLIIT Member' : 'Outside Guest'}
              {' '}· {r.attended ? 'Checked In' : 'Not Yet'}
            </div>
          </button></li>
        ))}
      </ul>
    </div>
  )
}
