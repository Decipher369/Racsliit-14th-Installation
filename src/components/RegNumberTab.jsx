import { useState } from 'react'

export default function RegNumberTab({ registrations, onSelect }) {
  const [value, setValue] = useState('')
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)

  function find() {
    const n = Number(value)
    if (!value || Number.isNaN(n)) return
    const found = registrations.find((r) => Number(r.reg_number) === n)
    setNotFound(!found)
    setResult(found || null)
    if (found) onSelect(found)
  }

  return (
    <div>
      <div className="field">
        <label>Registration Number</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && find()}
          />
          <button className="btn" type="button" onClick={find}>Find</button>
        </div>
      </div>
      {notFound && <div className="alert">No registration with number #{value}.</div>}
      {result && !notFound && (
        <div className="alert alert-success">
          Found: <strong>{result.full_name}</strong> (#{result.reg_number}) — {result.attended ? 'checked in' : 'not yet checked in'}.
        </div>
      )}
    </div>
  )
}
