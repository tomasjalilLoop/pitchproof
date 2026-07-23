/**
 * Stage 3 — email capture. Gates the results reveal behind an email.
 * Validation lives in App (regex /.+@.+\..+/); this stage just renders.
 */
export default function EmailStage({ email, onEmailChange, emailError, onSubmit }) {
  return (
    <section className="email">
      <div className="eyebrow">
        <span className="eyebrow__dot" />
        Analysis complete
      </div>
      <h2 className="email__title">Your report is ready.</h2>
      <p className="email__sub">
        Enter your email to unlock your full score, slide-by-slide feedback and
        VC matches — and we'll send you a copy.
      </p>

      <form
        className="email__form"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <input
          className="field email__input"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@startup.com"
          aria-label="Email address"
        />
        <button type="submit" className="btn-primary">
          Unlock my results →
        </button>
        {emailError && (
          <div className="error-text">Please enter a valid email address.</div>
        )}
      </form>

      <div className="email__caption">
        No spam. We'll only email your report and, if you opt in, VC
        introductions.
      </div>
    </section>
  )
}
