import { useRef, useState } from 'react'
import { ACCEPTED_FILE_TYPES } from '../../content.js'

/**
 * File dropzone. Wraps a hidden <input type=file> in a <label> so the whole
 * area is clickable, and supports drag & drop.
 *
 * @param {Object}   props
 * @param {File|null} props.file            currently selected deck (or null)
 * @param {(file: File) => void} props.onSelect  called with the real File object
 */
export default function Dropzone({ file, onSelect }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (f) onSelect(f)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files && e.dataTransfer.files[0]
    handleFile(f)
  }

  return (
    <label
      className={`dropzone${dragging ? ' is-dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        onChange={(e) => handleFile(e.target.files && e.target.files[0])}
      />

      {file ? (
        <div className="dropzone__inner">
          <div className="dropzone__icon dropzone__icon--done" aria-hidden="true">
            ✓
          </div>
          <div className="dropzone__title dropzone__title--file">{file.name}</div>
          <div className="dropzone__hint">
            Ready to analyze · click to choose a different file
          </div>
        </div>
      ) : (
        <div className="dropzone__inner">
          <div className="dropzone__icon" aria-hidden="true">
            ↑
          </div>
          <div className="dropzone__title">Drag &amp; drop your deck</div>
          <div className="dropzone__hint">
            or <em>browse your files</em> · PDF, PPTX or Keynote up to 50MB
          </div>
        </div>
      )}
    </label>
  )
}
