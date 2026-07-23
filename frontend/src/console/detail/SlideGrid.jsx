// Slide thumbnails. Placeholder tiles — for real decks we only know the slide
// count (titles/renders aren't stored yet), so the panel shows the title when
// present and otherwise just the "Slide N" footer.
export default function SlideGrid({ slides }) {
  if (!slides.length) return null
  return (
    <>
      <h3 className="detail__h3">The deck</h3>
      <div className="slide-grid">
        {slides.map((sl) => (
          <div className="slide-tile" key={sl.n}>
            <div className="slide-tile__panel" style={{ background: sl.tint }}>
              {sl.title}
            </div>
            <div className="slide-tile__foot">Slide {sl.n}</div>
          </div>
        ))}
      </div>
    </>
  )
}
