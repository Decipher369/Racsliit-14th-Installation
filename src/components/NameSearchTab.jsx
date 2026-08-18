import { useState } from 'react'

export default function NameSearchTab({ registrations, onSelect }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const results = q
    ? registrations.filter((r) => (r.full_name || '').toLowerCase().includes(q)).slice(0, 30)
    : []

  return (
    <div>
      <div className="field search-input">
        <input
          type="text"
          placeholder="Type a name to search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {q && results.length === 0 && (
        <div className="alert">No registrations match &quot;{query}&quot;.</div>
      )}
      <ul className="results-list">
        {results.map((r) => (
          <li key={r.id} onClick={() => onSelect(r)}>
            <strong>{r.full_name}</strong>
            <div className="meta">
              #{r.reg_number} · {r.category === 'sliit_member' ? 'SLIIT Member' : 'Outside Guest'}
              {' '}· {r.attended ? 'Checked In' : 'Not Yet'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
