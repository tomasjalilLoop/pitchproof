import { HERO } from '../../content.js'
import Dropzone from '../form/Dropzone.jsx'
import FoundersCard from '../form/FoundersCard.jsx'
import HowItWorks from '../form/HowItWorks.jsx'
import VcRow from '../form/VcRow.jsx'
import Faq from '../form/Faq.jsx'

/**
 * Stage 1 — hero + upload block + how-it-works + VC row + FAQ.
 * All state lives in App; this stage is presentational and calls back up.
 */
export default function FormStage({
  file,
  onSelectFile,
  founders,
  onFounderChange,
  onFounderAdd,
  onFounderRemove,
  deckError,
  onAnalyze,
}) {
  return (
    <>
      <section className="hero">
        <div className="eyebrow hero__eyebrow">
          <span className="eyebrow__dot" />
          {HERO.eyebrow}
        </div>
        <h1 className="hero__title">
          {HERO.titleBefore}
          <em>{HERO.titleEm}</em>
          {HERO.titleAfter}
        </h1>
        <p className="hero__sub">{HERO.sub}</p>
      </section>

      <section id="upload" className="upload">
        <Dropzone file={file} onSelect={onSelectFile} />

        <FoundersCard
          founders={founders}
          onChange={onFounderChange}
          onAdd={onFounderAdd}
          onRemove={onFounderRemove}
        />

        <button type="button" className="btn-primary upload__cta" onClick={onAnalyze}>
          Analyze my deck →
        </button>

        {deckError && (
          <div className="error-text upload__error">
            Please upload your pitch deck to continue.
          </div>
        )}

        <div className="upload__caption">
          Free feedback · Your deck stays private unless you opt in
        </div>
      </section>

      <HowItWorks />
      <VcRow />
      <Faq />
    </>
  )
}
