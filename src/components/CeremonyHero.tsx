import { ArrowDown, ArrowUpRight } from 'lucide-react'
import WavingPortfolioLanding from './ui/waving-portfolio-landing'
import Countdown from './Countdown.jsx'
import { EVENT_AT } from '../lib/event.js'

export default function CeremonyHero({ active }: { active: boolean }) {
  return (
    <header className="ceremony-hero">
      <nav className="ceremony-nav" aria-label="Page navigation">
        <a href="#" className="ceremony-brand" aria-label="Rotaract Club of SLIIT home">
          <img src="/rotaract-sliit-logo-transparent.png" alt="Rotaract Club of SLIIT" width="140" height="50" />
        </a>
        <span className="ceremony-nav-label">A new chapter begins</span>
        <a href="#registration" className="ceremony-nav-link">Reserve your seat <ArrowUpRight size={16} /></a>
      </nav>
      <div className="ceremony-poster-wrap">
        <WavingPortfolioLanding
          key={active ? 'playing' : 'waiting'}
          ceremony
          intro={active}
          name="Rotaract Club of SLIIT"
          year="2026"
          roles={['Leadership. Service. Fellowship.', 'The next chapter.']}
          title="14th Installation Ceremony"
          signature="XIV"
          accent="#593580"
          ink="#322141"
          paper="#faf7f0"
          height="100%"
        />
      </div>
      <div className="ceremony-details">
        <div className="ceremony-date"><span className="poster-label">Save the date</span><p>22 November <em>2026</em></p><span>Sunday · 3.30 PM onwards · Sri Lanka time</span></div>
        <div className="ceremony-countdown"><span className="poster-label">Until we begin</span><Countdown target={EVENT_AT} /></div>
        <a href="#registration" className="ceremony-rsvp">Be part of<br />the next chapter <ArrowDown size={22} /></a>
      </div>
    </header>
  )
}
