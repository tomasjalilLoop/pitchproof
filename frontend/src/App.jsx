import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './routes/Landing.jsx'
import Console from './routes/Console.jsx'

// Two surfaces sharing one build:
//   /         → founder-facing landing + deck-review flow
//   /console  → VC partner console (backoffice)
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/console" element={<Console />} />
      </Routes>
    </BrowserRouter>
  )
}
