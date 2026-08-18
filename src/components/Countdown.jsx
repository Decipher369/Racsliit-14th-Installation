import { useEffect, useState } from 'react'

function diff(ms) {
  const clamped = Math.max(0, ms - Date.now())
  const s = Math.floor(clamped / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: clamped === 0,
  }
}

export default function Countdown({ target }) {
  const atMs = target ? new Date(target).getTime() : NaN
  const live = Number.isNaN(atMs) ? null : atMs
  const [t, setT] = useState(() => (live === null ? null : diff(live)))

  useEffect(() => {
    if (live === null) {
      setT(null)
      return
    }
    setT(diff(live))
    const id = setInterval(() => setT(diff(live)), 1000)
    return () => clearInterval(id)
  }, [live])

  if (!t) {
    return (
      <p className="countdown-announce" role="status">
        <span className="cd-star">✦</span> Date &amp; time to be announced <span className="cd-star">✦</span>
      </p>
    )
  }

  if (t.done) {
    return <p className="countdown-announce">The ceremony is today — see you there!</p>
  }

  const pad = (n) => String(n).padStart(2, '0')
  const cells = [
    { v: pad(t.days), l: 'Days' },
    { v: pad(t.hours), l: 'Hours' },
    { v: pad(t.minutes), l: 'Mins' },
    { v: pad(t.seconds), l: 'Secs' },
  ]

  return (
    <div className="countdown" role="timer" aria-label="Time until the ceremony">
      {cells.map((c) => (
        <div key={c.l} className="countdown-cell">
          <span className="countdown-num">{c.v}</span>
          <span className="countdown-lbl">{c.l}</span>
        </div>
      ))}
    </div>
  )
}
