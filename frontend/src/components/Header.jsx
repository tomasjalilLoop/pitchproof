// Persistent top header. Nav links are in-page anchors (#how, #faq, #upload).
export default function Header() {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand__avatar" aria-hidden="true">
          P
        </div>
        <span className="brand__word">Pitch Proof</span>
      </div>
      <nav className="header__nav">
        <a href="#how">How it works</a>
        <a href="#faq">FAQ</a>
        <a href="#upload" className="is-cta">
          Upload a deck →
        </a>
      </nav>
    </header>
  )
}
