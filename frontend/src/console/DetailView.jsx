import { useState } from 'react'
import { toDetail } from './viewmodel.js'
import DeckHeader from './detail/DeckHeader.jsx'
import StartupView from './detail/StartupView.jsx'
import ActionBar from './detail/ActionBar.jsx'
import TractionGrid from './detail/TractionGrid.jsx'
import CategoryScores from './detail/CategoryScores.jsx'
import StrengthsWatchouts from './detail/StrengthsWatchouts.jsx'
import SlideGrid from './detail/SlideGrid.jsx'
import FoundingTeam from './detail/FoundingTeam.jsx'
import ThesisMatch from './detail/ThesisMatch.jsx'

/**
 * Deck detail view. Presentational — status changes bubble up via onSetStatus,
 * which the parent persists (localStorage) and reflects back through `status`.
 *
 * @param {Object} props
 * @param {object} props.deck              raw deck domain object
 * @param {string} props.status            effective status
 * @param {() => void} props.onBack
 * @param {(status: string) => void} props.onSetStatus
 */
export default function DetailView({ deck, status, onBack, onSetStatus }) {
  const d = toDetail(deck, status)
  const [view, setView] = useState('vc')

  // Founder-facing data, with safe defaults if the data layer hasn't populated it.
  const founderView = {
    score: 0,
    strengths: [],
    improvements: [],
    hypotheses: [],
    summary: '',
    ...(deck && deck.founderView ? deck.founderView : {}),
  }

  const onDownload = () => {
    // Seam: wire to the real deck file once the backend serves it.
    // eslint-disable-next-line no-console
    console.info('[stub] download deck', deck.id)
  }

  return (
    <div className="detail">
      <button type="button" className="detail__back" onClick={onBack}>
        ← Back to queue
      </button>

      <DeckHeader d={d} />

      <div className="view-toggle" role="tablist" aria-label="Review perspective">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'vc'}
          className={`view-toggle__btn${view === 'vc' ? ' is-active' : ''}`}
          onClick={() => setView('vc')}
        >
          VC view
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'startup'}
          className={`view-toggle__btn${view === 'startup' ? ' is-active' : ''}`}
          onClick={() => setView('startup')}
        >
          Startup view
        </button>
      </div>

      {view === 'vc' ? (
        <>
          <ActionBar
            onInterested={() => onSetStatus('Reviewing')}
            onMeeting={() => onSetStatus('Meeting')}
            onShortlist={() => onSetStatus('Shortlisted')}
            onPass={() => onSetStatus('Passed')}
            onDownload={onDownload}
          />

          <TractionGrid traction={d.traction} />

          <CategoryScores categories={d.categories} />

          <StrengthsWatchouts strengths={d.strengths} fixes={d.fixes} />

          <SlideGrid slides={d.slides} />

          <div className="bottom-row">
            <FoundingTeam founders={d.founders} teamNote={d.teamNote} />
            <ThesisMatch match={d.match} matchReason={d.matchReason} />
          </div>
        </>
      ) : (
        <StartupView founderView={founderView} />
      )}
    </div>
  )
}
