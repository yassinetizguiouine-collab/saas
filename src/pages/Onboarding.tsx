import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  onComplete: () => void
}

const STEPS = [
  {
    id: 'role',
    question: 'How would you describe yourself?',
    sub: "We'll personalise your experience based on your profile.",
    type: 'chips' as const,
    options: [
      { label: '🌱 New to Business', value: 'new-to-business' },
      { label: '🏢 Business Owner', value: 'business-owner' },
      { label: '💼 Sales', value: 'sales' },
      { label: '⚙️ Automation Specialist', value: 'automation' },
      { label: '🔧 Engineer', value: 'engineer' },
      { label: '📣 Marketer', value: 'marketer' },
      { label: '🚀 Agency', value: 'agency' },
      { label: '✨ Other', value: 'other' },
    ],
  },
  {
    id: 'business_name',
    question: 'What is the name of your business?',
    sub: 'Your AI agent will introduce itself on behalf of your brand.',
    type: 'text' as const,
    placeholder: 'e.g. Nova Consulting',
  },
  {
    id: 'business_what',
    question: 'What does your business do?',
    sub: 'Describe what you offer — products, services, results.',
    type: 'textarea' as const,
    placeholder: 'e.g. We help coaches and consultants book more calls through WhatsApp automation…',
  },
  {
    id: 'business_who',
    question: 'Who do you sell to?',
    sub: 'Your ideal client — who are they, what do they struggle with?',
    type: 'textarea' as const,
    placeholder: 'e.g. Online coaches doing $5k–$20k/month who are overwhelmed by manual follow-ups…',
  },
  {
    id: 'price_range',
    question: 'How much does your offer sell for?',
    sub: "This helps us calibrate the agent's tone and qualification questions.",
    type: 'chips' as const,
    options: [
      { label: 'Under $500', value: 'under-500' },
      { label: '$500 – $2k', value: '500-2k' },
      { label: '$2k – $5k', value: '2k-5k' },
      { label: '$5k – $15k', value: '5k-15k' },
      { label: '$15k+', value: '15k-plus' },
      { label: 'Varies / Custom', value: 'custom' },
    ],
  },
  {
    id: 'lead_sources',
    question: 'Where do your leads come from today?',
    sub: 'Select all that apply.',
    type: 'chips-multi' as const,
    options: [
      { label: '📱 Paid Ads (Meta/TikTok)', value: 'paid-ads' },
      { label: '🔍 Google Ads', value: 'google-ads' },
      { label: '📲 Organic Social', value: 'organic-social' },
      { label: '🤝 Referrals', value: 'referrals' },
      { label: '📧 Email List', value: 'email' },
      { label: '🌐 Website / SEO', value: 'seo' },
      { label: '📞 Cold Outreach', value: 'cold' },
      { label: '🎤 Events / Webinars', value: 'events' },
    ],
  },
  {
    id: 'sales_goal',
    question: 'What is your #1 goal right now?',
    sub: "We'll surface the most relevant templates first.",
    type: 'chips' as const,
    options: [
      { label: '📅 Book more calls', value: 'book-calls' },
      { label: '💰 Close more deals', value: 'close-deals' },
      { label: '🔄 Automate follow-ups', value: 'follow-ups' },
      { label: '⭐ Collect reviews', value: 'reviews' },
      { label: '👥 Get more referrals', value: 'referrals' },
      { label: '🔥 Keep leads warm', value: 'nurture' },
    ],
  },
  {
    id: 'automation_level',
    question: 'How familiar are you with automation platforms?',
    sub: 'Be honest — this helps us show the right level of complexity.',
    type: 'chips' as const,
    options: [
      { label: '🆕 Brand new to this', value: 'new' },
      { label: '📖 Used a few tools', value: 'some' },
      { label: '⚡ Pretty comfortable', value: 'comfortable' },
      { label: '🧠 Power user', value: 'expert' },
    ],
  },
]

// ─── Mouse glow dot grid ──────────────────────────────────────────────
function GlowDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -999, y: -999 })
  const raf = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const DOT_SPACING = 18
    const GLOW_RADIUS = 120

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
            // glowing purple dot
            const alpha = 0.12 + proximity * 0.65
            const radius = 1 + proximity * 2.5
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(124, 77, 204, ${alpha})`
            ctx.fill()
          } else {
            // normal grey dot
            ctx.beginPath()
            ctx.arc(x, y, 1, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(0,0,0,0.10)'
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
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none',
        background: '#f9f9f9',
      }}
    />
  )
}

// ─── Welcome splash ───────────────────────────────────────────────────
function WelcomeSplash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#0a0a0a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{`
        @keyframes lf-up { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes lf-bar { from { width:0 } to { width:100% } }
        @keyframes lf-sub { from { opacity:0 } to { opacity:1 } }
      `}</style>
      <div style={{ textAlign: 'center', animation: 'lf-up 0.7s ease 0.15s both' }}>
        <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 10 }}>
          LeadFlow
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', animation: 'lf-sub 0.5s ease 0.55s both' }}>
          Setting up your workspace…
        </div>
      </div>
      <div style={{
        marginTop: 44, width: 180, height: 2,
        background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden',
        animation: 'lf-sub 0.4s ease 0.7s both',
      }}>
        <div style={{
          height: '100%', background: '#fff', borderRadius: 99,
          animation: 'lf-bar 2s cubic-bezier(0.4,0,0.2,1) 0.85s both',
        }} />
      </div>
    </div>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────
function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 20px', borderRadius: 100, fontSize: 13.5, fontWeight: 500,
      fontFamily: 'inherit', cursor: 'pointer', userSelect: 'none',
      background: selected ? '#111' : 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      border: selected ? '0.5px solid #111' : '0.5px solid rgba(0,0,0,0.13)',
      color: selected ? '#fff' : '#444',
      boxShadow: selected ? '0 4px 16px rgba(0,0,0,0.16)' : '0 1px 6px rgba(0,0,0,0.05)',
      transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {label}
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────
export default function Onboarding({ onComplete }: Props) {
  const [showSplash, setShowSplash] = useState(true)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [saving, setSaving] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  const current = STEPS[step]

  const getValue = () => answers[current.id]
  const singleVal = getValue() as string | undefined
  const multiVal = (getValue() as string[] | undefined) ?? []

  function setSingle(v: string) {
    setAnswers(a => ({ ...a, [current.id]: v }))
  }
  function toggleMulti(v: string) {
    setAnswers(a => {
      const prev = (a[current.id] as string[] | undefined) ?? []
      return { ...a, [current.id]: prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v] }
    })
  }

  function canAdvance() {
    const v = answers[current.id]
    if (!v) return false
    if (Array.isArray(v)) return v.length > 0
    return v.trim().length > 0
  }

  function goNext() {
    if (step < STEPS.length - 1) {
      setAnimKey(k => k + 1)
      setStep(s => s + 1)
    } else {
      handleSave()
    }
  }

  function goBack() {
    if (step > 0) {
      setAnimKey(k => k + 1)
      setStep(s => s - 1)
    }
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    await supabase.from('onboarding').upsert({
      user_id: user.id,
      role: answers.role,
      business_name: answers.business_name,
      business_what: answers.business_what,
      business_who: answers.business_who,
      price_range: answers.price_range,
      lead_sources: answers.lead_sources,
      sales_goal: answers.sales_goal,
      automation_level: answers.automation_level,
      completed: true,
    }, { onConflict: 'user_id' })

    setSaving(false)
    onComplete()
  }

  if (showSplash) return <WelcomeSplash onDone={() => setShowSplash(false)} />

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'inherit', position: 'relative' }}>
      <GlowDotGrid />

      {/* Left panel — form */}
      <div style={{
        width: '52%', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: '48px 56px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: 44 }}>
          LeadFlow
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 52 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 3, flex: 1, borderRadius: 99,
              background: i <= step ? '#111' : 'rgba(0,0,0,0.10)',
              transition: 'background 0.4s ease',
            }} />
          ))}
        </div>

        {/* Step content */}
        <div key={animKey} style={{ flex: 1, animation: 'lf-up 0.38s ease both' }}>
          <style>{`@keyframes lf-up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }`}</style>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Step {step + 1} of {STEPS.length}
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 10 }}>
            {current.question}
          </h2>
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 32 }}>
            {current.sub}
          </p>

          {/* Chips single */}
          {current.type === 'chips' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {current.options!.map(o => (
                <Chip key={o.value} label={o.label} selected={singleVal === o.value} onClick={() => setSingle(o.value)} />
              ))}
            </div>
          )}

          {/* Chips multi */}
          {current.type === 'chips-multi' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {current.options!.map(o => (
                <Chip key={o.value} label={o.label} selected={multiVal.includes(o.value)} onClick={() => toggleMulti(o.value)} />
              ))}
            </div>
          )}

          {/* Text input */}
          {current.type === 'text' && (
            <input
              type="text"
              autoFocus
              placeholder={current.placeholder}
              value={(singleVal ?? '')}
              onChange={e => setSingle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canAdvance() && goNext()}
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 14,
                background: 'rgba(255,255,255,0.8)',
                border: '0.5px solid rgba(0,0,0,0.13)',
                fontSize: 15, color: '#111', outline: 'none',
                fontFamily: 'inherit', boxSizing: 'border-box',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            />
          )}

          {/* Textarea */}
          {current.type === 'textarea' && (
            <textarea
              autoFocus
              placeholder={current.placeholder}
              value={(singleVal ?? '')}
              onChange={e => setSingle(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 14,
                background: 'rgba(255,255,255,0.8)',
                border: '0.5px solid rgba(0,0,0,0.13)',
                fontSize: 15, color: '#111', outline: 'none',
                fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.65,
                boxSizing: 'border-box', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            />
          )}
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40 }}>
          <button
            onClick={goBack}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: step === 0 ? 'default' : 'pointer',
              color: step === 0 ? 'transparent' : '#999', fontSize: 13,
              fontFamily: 'inherit', padding: 0, transition: 'color 0.15s',
            }}
            onMouseEnter={e => step > 0 && ((e.currentTarget as HTMLElement).style.color = '#111')}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = step === 0 ? 'transparent' : '#999'}
          >
            <i className="ti ti-arrow-left" style={{ fontSize: 15 }} />
            Back
          </button>

          <button
            onClick={goNext}
            disabled={!canAdvance() || saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#111', color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px 28px', fontSize: 14, fontWeight: 600,
              fontFamily: 'inherit', cursor: canAdvance() ? 'pointer' : 'not-allowed',
              opacity: canAdvance() && !saving ? 1 : 0.4,
              transition: 'all 0.18s',
            }}
          >
            {saving ? 'Saving…' : step === STEPS.length - 1 ? 'Finish' : 'Next'}
            {!saving && <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />}
          </button>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, margin: '24px 24px 24px 0',
        borderRadius: 28, overflow: 'hidden',
        background: '#f0eeff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
      }}>
        {/* dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.3,
          backgroundImage: 'radial-gradient(circle, rgba(124,77,204,0.45) 1px, transparent 1px)',
          backgroundSize: '22px 22px', pointerEvents: 'none',
        }} />
        {/* blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: 140, height: 140, borderRadius: '50%', background: '#7c4dcc', opacity: 0.07, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 200, height: 200, borderRadius: '50%', background: '#7c4dcc', opacity: 0.05, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '60%', left: '15%', width: 80, height: 80, borderRadius: '50%', background: '#7c4dcc', opacity: 0.08, pointerEvents: 'none' }} />

        {/* Quote card */}
        <div key={step} style={{
          position: 'relative', zIndex: 1, maxWidth: 340,
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.9)',
          borderRadius: 20, padding: '28px 30px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          animation: 'lf-up 0.45s ease both',
        }}>
          <div style={{ fontSize: 32, color: '#7c4dcc', lineHeight: 1, marginBottom: 14, opacity: 0.6 }}>"</div>
          <p style={{ fontSize: 14.5, color: '#333', lineHeight: 1.7, margin: '0 0 20px', fontStyle: 'italic' }}>
            {[
              'The agent knows exactly where it sits in your funnel — every message moves the lead forward.',
              'Your brand, your voice. The agent introduces itself as part of your team.',
              'The more context we have, the smarter the qualification questions become.',
              'We craft messaging around the exact pain points of your ideal client.',
              'Pricing context changes everything — from tone to urgency to objection handling.',
              'Knowing your traffic source helps the agent speak the right language on day one.',
              'Your goal unlocks the right templates — pre-built for your exact use case.',
              'We meet you where you are. The experience adapts to your level.',
            ][step]}
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(124,77,204,0.09)', border: '0.5px solid rgba(124,77,204,0.2)',
            borderRadius: 100, padding: '5px 14px', fontSize: 11.5, fontWeight: 600, color: '#7c4dcc',
          }}>
            {['Role-aware AI', 'Brand identity', 'Deep context', 'Audience targeting', 'Offer calibration', 'Traffic awareness', 'Goal-first templates', 'Your pace'][step]}
          </div>
        </div>
      </div>
    </div>
  )
}
