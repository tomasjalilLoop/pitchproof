import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import FormStage from '../components/stages/FormStage.jsx'
import AnalyzingStage from '../components/stages/AnalyzingStage.jsx'
import EmailStage from '../components/stages/EmailStage.jsx'
import ResultsStage from '../components/stages/ResultsStage.jsx'
import { analyzeDeck, submitLead, submitToFirms } from '../api/analysis.js'

// Minimum time to keep the analyzing screen visible so the checklist/progress
// animation plays through, even if the API responds faster.
const MIN_ANALYZING_MS = 2900

// One empty founder row to start with.
const emptyFounder = () => ({ role: '', url: '' })

export default function Landing() {
  // "form" | "analyzing" | "email" | "results"
  const [stage, setStage] = useState('form')

  // Real uploaded File object (not just the name) — needed by the API layer.
  const [file, setFile] = useState(null)
  const [founders, setFounders] = useState([emptyFounder()])

  const [deckError, setDeckError] = useState(false)
  const [analyzeError, setAnalyzeError] = useState(false)

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(false)

  // AnalysisResult returned by the API (mock for now). Drives the results stage.
  const [result, setResult] = useState(null)

  // Guards against a resolved analysis updating state after unmount/reset.
  const runIdRef = useRef(0)

  useEffect(() => {
    // Bump the run id on unmount so any in-flight analysis is ignored.
    return () => {
      runIdRef.current += 1
    }
  }, [])

  // --- Founders list handlers ------------------------------------------------
  const onFounderChange = (i, field, value) => {
    setFounders((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)),
    )
  }
  const onFounderAdd = () => setFounders((prev) => [...prev, emptyFounder()])
  const onFounderRemove = (i) =>
    setFounders((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev,
    )

  // --- Stage transitions -----------------------------------------------------
  const onAnalyze = async () => {
    if (!file) {
      setDeckError(true)
      return
    }
    setDeckError(false)
    setAnalyzeError(false)
    setStage('analyzing')

    const runId = ++runIdRef.current
    try {
      // Kick off the analysis and the minimum animation window in parallel.
      const [data] = await Promise.all([
        analyzeDeck({ file, founders }),
        new Promise((resolve) => setTimeout(resolve, MIN_ANALYZING_MS)),
      ])
      if (runId !== runIdRef.current) return // superseded by reset/unmount
      setResult(data)
      setStage('email')
    } catch (err) {
      if (runId !== runIdRef.current) return
      // eslint-disable-next-line no-console
      console.error('Deck analysis failed', err)
      setAnalyzeError(true)
      setStage('form')
    }
  }

  const onSubmitEmail = async () => {
    if (!/.+@.+\..+/.test(email.trim())) {
      setEmailError(true)
      return
    }
    setEmailError(false)
    // Fire-and-forget lead capture (stub — Tomi wires this to the backend).
    submitLead({ email, result }).catch((err) =>
      // eslint-disable-next-line no-console
      console.error('Lead submit failed', err),
    )
    setStage('results')
  }

  const onSubmitToFirms = () => {
    // Stub — Tomi wires this to the backend once VC matching is real.
    submitToFirms({ file, email, matches: result?.matches }).catch((err) =>
      // eslint-disable-next-line no-console
      console.error('Submit to firms failed', err),
    )
  }

  const onReset = () => {
    runIdRef.current += 1 // ignore any in-flight analysis
    setStage('form')
    setFile(null)
    setFounders([emptyFounder()])
    setEmail('')
    setResult(null)
    setDeckError(false)
    setEmailError(false)
    setAnalyzeError(false)
  }

  return (
    <div className="app">
      <Header />

      {stage === 'form' && (
        <>
          <FormStage
            file={file}
            onSelectFile={(f) => {
              setFile(f)
              setDeckError(false)
            }}
            founders={founders}
            onFounderChange={onFounderChange}
            onFounderAdd={onFounderAdd}
            onFounderRemove={onFounderRemove}
            deckError={deckError}
            onAnalyze={onAnalyze}
          />
          {analyzeError && (
            <div className="error-text upload__error" role="alert">
              Something went wrong analyzing your deck. Please try again.
            </div>
          )}
        </>
      )}

      {stage === 'analyzing' && <AnalyzingStage />}

      {stage === 'email' && (
        <EmailStage
          email={email}
          onEmailChange={(v) => {
            setEmail(v)
            setEmailError(false)
          }}
          emailError={emailError}
          onSubmit={onSubmitEmail}
        />
      )}

      {stage === 'results' && result && (
        <ResultsStage
          result={result}
          onReset={onReset}
          onSubmitToFirms={onSubmitToFirms}
        />
      )}

      <Footer />
    </div>
  )
}
