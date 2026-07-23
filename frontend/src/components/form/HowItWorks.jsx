import { HOW_STEPS } from '../../content.js'

// "How it works" 3-step grid (form stage only). Anchored by #how.
export default function HowItWorks() {
  return (
    <section id="how" className="how">
      <div className="how__grid">
        {HOW_STEPS.map((step) => (
          <div className="how__step" key={step.num}>
            <div className="how__num">{step.num}</div>
            <div className="how__title">{step.title}</div>
            <p className="how__note">{step.note}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
