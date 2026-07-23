import { useState } from 'react'
import { FAQS } from '../../content.js'

// FAQ accordion (form stage only). Each item toggles independently.
export default function Faq() {
  const [open, setOpen] = useState({})

  const toggle = (i) => setOpen((prev) => ({ ...prev, [i]: !prev[i] }))

  return (
    <section id="faq" className="faq">
      <h2 className="faq__title">Questions, answered</h2>
      {FAQS.map((item, i) => {
        const isOpen = !!open[i]
        return (
          <button
            key={i}
            type="button"
            className="faq__item"
            onClick={() => toggle(i)}
            aria-expanded={isOpen}
          >
            <span className="faq__q">
              <span>{item.q}</span>
              <span className="faq__sign">{isOpen ? '−' : '+'}</span>
            </span>
            {isOpen && <span className="faq__a">{item.a}</span>}
          </button>
        )
      })}
    </section>
  )
}
