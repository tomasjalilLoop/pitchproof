/**
 * Action bar. Each status button updates the deck's effective status (persisted
 * in localStorage via the parent). "Download deck" is a seam — wire to the real
 * deck file once the backend serves it.
 */
export default function ActionBar({ onInterested, onMeeting, onShortlist, onPass, onDownload }) {
  return (
    <div className="action-bar">
      <button type="button" className="action-btn action-btn--primary" onClick={onInterested}>
        ✓ Interested
      </button>
      <button type="button" className="action-btn" onClick={onMeeting}>
        Request meeting
      </button>
      <button type="button" className="action-btn" onClick={onShortlist}>
        ★ Shortlist
      </button>
      <button type="button" className="action-btn" onClick={onDownload}>
        ↓ Download deck
      </button>
      <button type="button" className="action-btn action-btn--ghost" onClick={onPass}>
        Pass
      </button>
    </div>
  )
}
