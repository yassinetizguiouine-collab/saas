import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

const AUTO_TEST_WEBHOOK = 'https://leadflowai2026.app.n8n.cloud/webhook/7702f93e-e54b-40fe-bc69-03e81003e60f'

const CRITERIA_OPTIONS = [
  { id: 'price_objection', label: 'Price objection', icon: 'ti-coin', desc: 'Too expensive' },
  { id: 'im_busy', label: 'Im busy', icon: 'ti-clock', desc: 'Not a good time right now' },
  { id: 'ill_think', label: 'Ill think about it', icon: 'ti-bulb', desc: 'Let me think and get back to you' },
  { id: 'talk_to_wife', label: 'Ill talk to my partner', icon: 'ti-users', desc: 'Need to check with someone first' },
  { id: 'mad_client', label: 'Angry or frustrated lead', icon: 'ti-mood-angry', desc: 'This is a waste of my time' },
  { id: 'not_interested', label: 'Not interested', icon: 'ti-ban', desc: 'Im good, thanks' },
  { id: 'too_good', label: 'Too good to be true', icon: 'ti-shield-question', desc: 'Sounds like a scam' },
  { id: 'already_tried', label: 'Already tried something similar', icon: 'ti-rotate-clockwise', desc: 'I tried before and it did not work' },
  { id: 'send_info', label: 'Send me more info', icon: 'ti-send', desc: 'Just send me details first' },
  { id: 'not_right_time', label: 'Not the right time', icon: 'ti-calendar-x', desc: 'Maybe later, not now' },
]

interface Props {
  userId: string
  templateId: string
  agentName: string
  onBack: () => void
}

// ─── BADGE ───────────────────────────────────────────────────────────────────

function CampBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: 'rgba(124,58,237,0.08)', border: '0.5px solid rgba(124,58,237,0.2)',
      borderRadius: 100, padding: '5px 14px', marginBottom: 20,
    }}>
      <span style={{ fontSize: 16 }}>⚡</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
        Auto Testing
      </span>
    </div>
  )
}

// ─── INTRO SCREEN ─────────────────────────────────────────────────────────────

function IntroScreen({ onUnderstood }: { onUnderstood: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const steps = [
    { icon: 'ti-list-check', label: 'Pick your criteria', desc: 'Choose the objections and scenarios you want to stress-test' },
    { icon: 'ti-robot', label: 'AI simulates the leads', desc: 'We generate scenarios and run your agent against each one automatically' },
    { icon: 'ti-chart-bar', label: 'Get a full report card', desc: 'Every scenario is graded — see exactly where your agent excels or needs work' },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px', maxWidth: 560, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <CampBadge />
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 12, textAlign: 'center' }}>
        How Auto Testing works
      </h2>
      <p style={{ fontSize: 14, color: '#999', lineHeight: 1.7, textAlign: 'center', marginBottom: 36 }}>
        No typing required. Pick your scenarios, sit back, and let us stress-test your agent end-to-end in minutes.
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            background: 'rgba(255,255,255,0.6)', border: '0.5px solid rgba(0,0,0,0.06)',
            borderRadius: 16, padding: '18px 20px',
            animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(124,58,237,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`ti ${step.icon}`} style={{ fontSize: 18, color: '#7c3aed' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{step.label}</p>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onUnderstood}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 14,
          background: '#111', border: 'none', cursor: 'pointer',
          fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'inherit',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Got it — let's go
      </button>
    </div>
  )
}

// ─── CRITERIA SCREEN ──────────────────────────────────────────────────────────

function CriteriaScreen({
  agentName,
  onStart,
  onBack,
}: {
  agentName: string
  onStart: (selected: string[]) => void
  onBack: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleStart() {
    if (selected.length === 0) return
    setLoading(true)
    await onStart(selected)
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px', maxWidth: 640, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <CampBadge />
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 8, textAlign: 'center' }}>
        What should we test?
      </h2>
      <p style={{ fontSize: 13.5, color: '#999', lineHeight: 1.6, textAlign: 'center', marginBottom: 32 }}>
        Pick the scenarios you want {agentName} stress-tested on. We'll build one scenario per criteria.
      </p>

      {/* Select all / none */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 12 }}>
        <button onClick={() => setSelected(CRITERIA_OPTIONS.map(c => c.id))} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: '#7c3aed', fontFamily: 'inherit',
        }}>Select all</button>
        <button onClick={() => setSelected([])} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: '#aaa', fontFamily: 'inherit',
        }}>Clear</button>
      </div>

      {/* Criteria grid */}
      <div style={{
        width: '100%', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 10, marginBottom: 32,
      }}>
        {CRITERIA_OPTIONS.map((c, i) => {
          const isSelected = selected.includes(c.id)
          return (
            <div
              key={c.id}
              onClick={() => toggle(c.id)}
              style={{
                borderRadius: 14, padding: '14px 16px',
                background: isSelected ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.6)',
                border: `0.5px solid ${isSelected ? 'rgba(124,58,237,0.3)' : 'rgba(0,0,0,0.07)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 12,
                animation: `fadeUp 0.35s ease ${i * 0.03}s both`,
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)' }}
            >
              {/* Checkbox */}
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${isSelected ? '#7c3aed' : '#ddd'}`,
                background: isSelected ? '#7c3aed' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {isSelected && <i className="ti ti-check" style={{ fontSize: 11, color: '#fff' }} />}
              </div>

              <i className={`ti ${c.icon}`} style={{ fontSize: 20, color: '#7c3aed', flexShrink: 0 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111', marginBottom: 2 }}>{c.label}</p>
                <p style={{ fontSize: 11.5, color: '#aaa', lineHeight: 1.4 }}>{c.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ width: '100%', display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            padding: '13px 20px', borderRadius: 12,
            background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.08)',
            cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#666',
            fontFamily: 'inherit', transition: 'opacity 0.15s', flexShrink: 0,
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleStart}
          disabled={selected.length === 0 || loading}
          style={{
            flex: 1, padding: '13px 0', borderRadius: 12,
            background: selected.length === 0 ? 'rgba(0,0,0,0.06)' : '#111',
            border: 'none', cursor: selected.length === 0 ? 'default' : 'pointer',
            fontSize: 14, fontWeight: 700,
            color: selected.length === 0 ? '#aaa' : '#fff',
            fontFamily: 'inherit', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading
            ? <><i className="ti ti-loader-2" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }} /> Starting test...</>
            : <><i className="ti ti-bolt" style={{ fontSize: 16 }} /> Run {selected.length} scenario{selected.length !== 1 ? 's' : ''}</>
          }
        </button>
      </div>
      {selected.length > 0 && (
        <p style={{ fontSize: 12, color: '#bbb', marginTop: 12, textAlign: 'center' }}>
          {selected.length} scenario{selected.length !== 1 ? 's' : ''} selected · takes ~{Math.ceil(selected.length * 0.5)} min
        </p>
      )}
    </div>
  )
}

// ─── TYPING TEXT ──────────────────────────────────────────────────────────────

function TypingText({ text, speed = 38, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
        onDone?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text])
  return (
    <span>
      {displayed}
      {!done && <span style={{ opacity: 0.5, animation: 'blink 1s step-end infinite' }}>|</span>}
    </span>
  )
}

// ─── CINEMATIC SCREEN ─────────────────────────────────────────────────────────

type RunData = {
  status: string
  current_phase: string
  current_scenario: number
  scenarios: any[]
  results: any[]
  overall_score: number
}

// ─── Cinematic dot grid (dark, purple hover glow) ─────────────────────────
function CinematicDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -999, y: -999 })
  const raf = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const DOT_SPACING = 22
    const GLOW_RADIUS = 130

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMove)

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cols = Math.ceil(canvas.width / DOT_SPACING) + 1
      const rows = Math.ceil(canvas.height / DOT_SPACING) + 1
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * DOT_SPACING
          const y = r * DOT_SPACING
          const dx = x - mouse.current.x
          const dy = y - mouse.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const proximity = Math.max(0, 1 - dist / GLOW_RADIUS)
          if (proximity > 0) {
            ctx.beginPath()
            ctx.arc(x, y, 1 + proximity * 2.8, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(124, 77, 204, ${0.15 + proximity * 0.7})`
            ctx.fill()
          } else {
            ctx.beginPath()
            ctx.arc(x, y, 1, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(255,255,255,0.07)'
            ctx.fill()
          }
        }
      }
      raf.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, zIndex: 0,
      pointerEvents: 'none',
    }} />
  )
}

function CinematicScreen({
  runId,
  userId,
  agentName,
  onDone,
}: {
  runId: string
  userId: string
  agentName: string
  onDone: (results: any[], overallScore: number) => void
}) {
  const [phase, setPhase] = useState<'generating' | 'simulating' | 'judging' | 'complete'>('generating')
  const [currentScenario, setCurrentScenario] = useState(0)
  const [totalScenarios, setTotalScenarios] = useState(10)
  const doneRef = useRef(false)

  useEffect(() => {
    const channel = supabase
      .channel(`auto_test_${runId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'auto_test_runs',
        filter: `id=eq.${runId}`,
      }, (payload) => {
        const data = payload.new as RunData
        const newPhase = data.current_phase as any
        setPhase(newPhase)
        setCurrentScenario(data.current_scenario || 0)
        if (data.scenarios?.length) setTotalScenarios(data.scenarios.length)

        if (newPhase === 'complete' && !doneRef.current) {
          doneRef.current = true
          setTimeout(() => onDone(data.results, data.overall_score), 1200)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [runId, onDone])

  const phaseLabel = {
    generating: 'Generating scenarios...',
    simulating: `Testing scenario ${currentScenario} of ${totalScenarios}`,
    judging: 'Judging all responses...',
    complete: 'Done!',
  }[phase]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#060606', display: 'flex', flexDirection: 'column',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <CinematicDotGrid />

      {/* Header — just LeadflowCode, light weight, no border */}
      <div style={{ padding: '28px 48px', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.9)' }}>
          LeadflowCode
        </span>
      </div>

      {/* Center — logo bounce + phase label */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1, gap: 0,
      }}>
        {/* Bouncing logo */}
        <div style={{ position: 'relative', width: 64, height: 64, margin: 'auto' }}>
          {/* shadow */}
          <div style={{
            position: 'absolute',
            top: 78, left: 0,
            width: 64, height: 6,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            animation: 'shadow324 0.5s linear infinite',
          }} />
          {/* logo */}
          <img
            src="/Création sans titre (25).png"
            alt="logo"
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              borderRadius: 8,
              objectFit: 'cover',
              animation: 'jump7456 0.5s linear infinite',
            }}
          />
        </div>

        {/* Phase label */}
        <p style={{
          marginTop: 64,
          fontSize: 15,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.02em',
          textAlign: 'center',
          animation: 'fadeInLine 0.4s ease both',
        }}>
          {phaseLabel}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, #fff 100%)',
          width: phase === 'generating' ? '15%'
            : phase === 'simulating' ? `${15 + (currentScenario / totalScenarios) * 65}%`
            : phase === 'judging' ? '85%' : '100%',
          transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>

      <style>{`
        @keyframes jump7456 {
          15% { border-bottom-right-radius: 3px; }
          25% { transform: translateY(9px) rotate(22.5deg); }
          50% { transform: translateY(18px) scale(1, .9) rotate(45deg); border-bottom-right-radius: 40px; }
          75% { transform: translateY(9px) rotate(67.5deg); }
          100% { transform: translateY(0) rotate(90deg); }
        }
        @keyframes shadow324 {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.2, 1); }
        }
        @keyframes fadeInLine { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
function ReportScreen({
  results,
  overallScore,
  agentName,
  onRetake,
  onSatisfied,
}: {
  results: any[]
  overallScore: number
  agentName: string
  onRetake: () => void
  onSatisfied: () => void
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const scoreColor = '#fff'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: '#000',
      overflowY: 'auto', fontFamily: "'Plus Jakarta Sans', sans-serif",
      opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 32px' }}>
        <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
          LeadflowCode
        </span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 32px' }}>
        {/* Overall score */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 16 }}>
            Overall Score
          </p>
          <div style={{ fontSize: 88, fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: 12 }}>
            {overallScore}
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>/100 · {results.length} scenarios tested</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>
            {agentName}'s performance report
          </p>
        </div>

        {/* Individual results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
          {results.map((r: any, i: number) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              animation: `fadeInLine 0.4s ease ${i * 0.06}s both`,
            }}>
              <div style={{
                fontSize: 22, fontWeight: 800, color: '#fff',
                minWidth: 48, textAlign: 'center' as const, flexShrink: 0,
              }}>
                {r.score}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700, marginBottom: 4 }}>
                  {r.criteria.replace(/_/g, ' ')}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                  {r.verdict || r.weaknesses || '—'}
                </p>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={`ti ${r.score >= 75 ? 'ti-check' : r.score >= 50 ? 'ti-minus' : 'ti-x'}`}
                  style={{ fontSize: 14, color: '#fff' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onRetake}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 12,
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
              fontFamily: 'inherit', transition: 'opacity 0.15s',
            }}
          >
            ↩ Retake
          </button>
          <button
            onClick={onSatisfied}
            style={{
              flex: 2, padding: '14px 0', borderRadius: 12,
              background: '#fff', border: 'none',
              cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#000',
              fontFamily: 'inherit', transition: 'opacity 0.15s',
            }}
          >
            ✓ Satisfied — Continue
          </button>
        </div>
      </div>

      <style>{`@keyframes fadeInLine { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function AutoTesting({ userId, templateId, agentName, onBack }: Props) {
  const [screen, setScreen] = useState<'loading' | 'intro' | 'criteria' | 'cinematic' | 'report'>('loading')
  const [runId, setRunId] = useState<string | null>(null)
  const [reportData, setReportData] = useState<{ results: any[]; overallScore: number } | null>(null)

  useEffect(() => {
    async function loadState() {
      const { data } = await supabase
        .from('training_camp_state')
        .select('auto_intro_seen')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .maybeSingle()

      if (data?.auto_intro_seen) {
        setScreen('criteria')
      } else {
        setScreen('intro')
      }
    }
    loadState()
  }, [userId, templateId])

  async function handleUnderstood() {
    await supabase
      .from('training_camp_state')
      .upsert(
        { user_id: userId, template_id: templateId, auto_intro_seen: true, intro_seen: true },
        { onConflict: 'user_id,template_id' }
      )
    setScreen('criteria')
  }

  async function handleStart(selectedCriteria: string[]) {
    // Create run row in Supabase
    const { data: run } = await supabase
      .from('auto_test_runs')
      .insert({
        user_id: userId,
        template_id: templateId,
        status: 'pending',
        current_phase: 'generating',
      })
      .select()
      .single()

    if (!run) return

    // Fire n8n webhook
    fetch(AUTO_TEST_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        template_id: templateId,
        run_id: run.id,
        agent_name: agentName,
        selected_criteria: selectedCriteria,
      }),
    })

    setRunId(run.id)
    setScreen('cinematic')
  }

  function handleCinematicDone(results: any[], overallScore: number) {
    setReportData({ results, overallScore })
    setScreen('report')
  }

  if (screen === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <i className="ti ti-loader-2" style={{ fontSize: 24, color: '#ddd', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {screen === 'intro' && <IntroScreen onUnderstood={handleUnderstood} />}
      {screen === 'criteria' && (
        <CriteriaScreen
          agentName={agentName}
          onStart={handleStart}
          onBack={onBack}
        />
      )}
      {screen === 'cinematic' && runId && createPortal(
        <CinematicScreen
          runId={runId}
          userId={userId}
          agentName={agentName}
          onDone={handleCinematicDone}
        />,
        document.body
      )}
      {screen === 'report' && reportData && createPortal(
        <ReportScreen
          results={reportData.results}
          overallScore={reportData.overallScore}
          agentName={agentName}
          onRetake={() => setScreen('criteria')}
          onSatisfied={onBack}
        />,
        document.body
      )}
    </>
  )
}
