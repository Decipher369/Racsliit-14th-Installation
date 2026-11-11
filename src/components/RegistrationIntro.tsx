import { useEffect, useState } from 'react'
import { RotaractGlassReveal } from './ui/liquid-glass-logo-reveal'

export default function RegistrationIntro({ onContinue }: { onContinue: () => void }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hold = reduced ? 1800 : 5500
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const fadeTimer = window.setTimeout(() => setFading(true), hold)
    const finishTimer = window.setTimeout(onContinue, hold + (reduced ? 0 : 700))
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(finishTimer)
      document.body.style.overflow = previousOverflow
    }
  }, [onContinue])

  return (
    <div className={`registration-intro${fading ? ' is-fading' : ''}`}>
      <RotaractGlassReveal className="intro-reveal" loop={false} />
    </div>
  )
}
