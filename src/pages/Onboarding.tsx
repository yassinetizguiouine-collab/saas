import { useState, useEffect, useRef } from 'react'
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

// ─── Animated Logo (organic morph: dot → mushroom → bounce → loop) ────
function LogoMorph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2 + 20

    // Each frame: t goes 0→1 over the full loop (4s at 60fps = 240 frames)
    const LOOP = 260

    // Keyframe shapes — drawn as bezier-approximated blobs via SVG path data rendered to canvas
    // We interpolate between "states" using a t value

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t
    }

    function easeInOut(t: number) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    }

    function easeOutBounce(t: number) {
      if (t < 1 / 2.75) return 7.5625 * t * t
      if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75 }
      if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375 }
      t -= 2.625 / 2.75; return 7.5625 * t * t + 0.984375
    }

    // Draw the mushroom logo shape morphing from dot
    // Shape is defined by a set of parameters that interpolate
    function drawShape(t: number) {
      ctx.clearRect(0, 0, W, H)

      // t: 0=dot, 0.2=pill, 0.4=morph, 0.6=full mushroom, 0.8=bounce, 1=loop back

      let dotR = 4
      let capW = 0
      let capH = 0
      let stemW = 0
      let stemH = 0
      let capY = cy
      let bounce = 0

      if (t < 0.15) {
        // Phase 1: dot → small pill
        const p = easeInOut(t / 0.15)
        dotR = lerp(4, 18, p)
        capW = lerp(0, 18, p)
        capH = lerp(0, 22, p)
        capY = cy
      } else if (t < 0.35) {
        // Phase 2: pill → cap shape forming
        const p = easeInOut((t - 0.15) / 0.2)
        capW = lerp(18, 70, p)
        capH = lerp(22, 65, p)
        stemW = lerp(0, 18, p)
        stemH = lerp(0, 20, p)
        capY = lerp(cy, cy - 15, p)
        dotR = 0
      } else if (t < 0.55) {
        // Phase 3: grow to full mushroom
        const p = easeInOut((t - 0.35) / 0.2)
        capW = lerp(70, 95, p)
        capH = lerp(65, 85, p)
        stemW = lerp(18, 28, p)
        stemH = lerp(20, 38, p)
        capY = lerp(cy - 15, cy - 20, p)
        dotR = 0
      } else if (t < 0.72) {
        // Phase 4: settle — slight squish
        const p = easeInOut((t - 0.55) / 0.17)
        capW = lerp(95, 88, p)
        capH = lerp(85, 90, p)
        stemW = 28
        stemH = 38
        capY = cy - 20
        dotR = 0
      } else if (t < 0.88) {
        // Phase 5: bounce — drop slightly then spring up
        const p = (t - 0.72) / 0.16
        bounce = Math.sin(p * Math.PI * 2) * 8 * (1 - p)
        capW = 88
        capH = 90
        stemW = 28
        stemH = 38
        capY = cy - 20 + bounce
        dotR = 0
      } else {
        // Phase 6: fade back to dot
        const p = easeInOut((t - 0.88) / 0.12)
        capW = lerp(88, 4, p)
        capH = lerp(90, 4, p)
        stemW = lerp(28, 0, p)
        stemH = lerp(38, 0, p)
        capY = lerp(cy - 20, cy, p)
        dotR = lerp(0, 4, p)
      }

      ctx.save()

      // Shadow
      if (capW > 20) {
        const shadowAlpha = Math.min(1, capW / 88) * 0.18
        const shadowW = capW * 0.7
        ctx.beginPath()
        ctx.ellipse(cx, cy + stemH + 8, shadowW * 0.5, 6, 0, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`
        ctx.fill()
      }

      // Draw main cap (top blob of the mushroom)
      if (capW > 2) {
        // Cap is a rounded blob — approximate with multiple ellipses + bezier
        const r = capW / 2
        const h = capH / 2

        ctx.beginPath()
        // Top cap: smooth blob
        ctx.save()
        ctx.translate(cx, capY)
        // Main cap ellipse
        ctx.beginPath()
        ctx.ellipse(0, 0, r, h * 0.85, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#111'
        ctx.fill()

        // Second lobe — left bump (like the inspo logo has 3 lobes)
        if (capW > 40) {
          const lobeScale = Math.min(1, (capW - 40) / 50)
          ctx.beginPath()
          ctx.ellipse(-r * 0.55, h * 0.1, r * 0.42 * lobeScale, h * 0.55 * lobeScale, -0.15, 0, Math.PI * 2)
          ctx.fillStyle = '#111'
          ctx.fill()

          // Third lobe — right bump
          ctx.beginPath()
          ctx.ellipse(r * 0.45, h * 0.15, r * 0.36 * lobeScale, h * 0.48 * lobeScale, 0.2, 0, Math.PI * 2)
          ctx.fillStyle = '#111'
          ctx.fill()
        }
        ctx.restore()

        // Stem
        if (stemW > 2 && stemH > 2) {
          const sw = stemW / 2
          const sh = stemH
          const stemTop = capY + h * 0.5
          ctx.beginPath()
          ctx.moveTo(cx - sw, stemTop)
          ctx.bezierCurveTo(cx - sw * 1.1, stemTop + sh * 0.5, cx - sw * 0.9, stemTop + sh * 0.8, cx - sw * 1.3, stemTop + sh)
          ctx.lineTo(cx + sw * 1.3, stemTop + sh)
          ctx.bezierCurveTo(cx + sw * 0.9, stemTop + sh * 0.8, cx + sw * 1.1, stemTop + sh * 0.5, cx + sw, stemTop)
          ctx.closePath()
          ctx.fillStyle = '#111'
          ctx.fill()
        }
      } else if (dotR > 0) {
        // Just a dot
        ctx.beginPath()
        ctx.arc(cx, cy, dotR, 0, Math.PI * 2)
        ctx.fillStyle = '#111'
        ctx.fill()
      }

      ctx.restore()
    }

    function animate() {
      frameRef.current = (frameRef.current + 1) % LOOP
      const t = frameRef.current / LOOP
      drawShape(t)
      rafRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={280}
      style={{ display: 'block' }}
    />
  )
}

// ─── Glow dot grid background ─────────────────────────────────────────
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
            const alpha = 0.12 + proximity * 0.65
            const radius = 1 + proximity * 2.5
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(124, 77, 204, ${alpha})`
            ctx.fill()
          } else {
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

// ─── Chip ─────────────────────────────────────────────────────────────
function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 20px', borderRadius: 100, fontSize: 13.5, fontWeight: 500,
        fontFamily: 'inherit', cursor: 'pointer', userSelect: 'none',
        background: selected ? '#111' : 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        border: selected ? '0.5px solid #111' : '0.5px solid rgba(0,0,0,0.13)',
        color: selected ? '#fff' : '#444',
        boxShadow: selected ? '0 4px 16px rgba(0,0,0,0.16)' : '0 1px 6px rgba(0,0,0,0.05)',
        transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
      }}
      onMouseEnter={e => {
        if (!selected) {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'rgba(124,77,204,0.08)'
          el.style.borderColor = 'rgba(124,77,204,0.3)'
          el.style.color = '#7c4dcc'
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'rgba(255,255,255,0.72)'
          el.style.borderColor = 'rgba(0,0,0,0.13)'
          el.style.color = '#444'
        }
      }}
    >
      {label}
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────
export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [saving, setSaving] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  const current = STEPS[step]
  const singleVal = answers[current.id] as string | undefined
  const multiVal = (answers[current.id] as string[] | undefined) ?? []

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
    return (v as string).trim().length > 0
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'inherit', position: 'relative' }}>
      <GlowDotGrid />

      {/* Left panel — form */}
      <div style={{
        width: '52%', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: '40px 56px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo — always at top */}
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: 36 }}>
          LeadFlow
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 48 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              height: 3, flex: 1, borderRadius: 99,
              background: i <= step ? '#111' : 'rgba(0,0,0,0.10)',
              transition: 'background 0.4s ease',
            }} />
          ))}
        </div>

        {/* Step content — animates on change */}
        <div key={animKey} style={{ flex: 1, animation: 'lf-up 0.38s ease both' }}>
          <style>{`
            @keyframes lf-up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
          `}</style>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Step {step + 1} of {STEPS.length}
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 10 }}>
            {current.question}
          </h2>
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 32 }}>
            {current.sub}
          </p>

          {current.type === 'chips' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {current.options!.map(o => (
                <Chip key={o.value} label={o.label} selected={singleVal === o.value} onClick={() => setSingle(o.value)} />
              ))}
            </div>
          )}

          {current.type === 'chips-multi' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {current.options!.map(o => (
                <Chip key={o.value} label={o.label} selected={multiVal.includes(o.value)} onClick={() => toggleMulti(o.value)} />
              ))}
            </div>
          )}

          {current.type === 'text' && (
            <input
              type="text"
              autoFocus
              placeholder={current.placeholder}
              value={singleVal ?? ''}
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

          {current.type === 'textarea' && (
            <textarea
              autoFocus
              placeholder={current.placeholder}
              value={singleVal ?? ''}
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

        {/* Nav */}
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
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = step === 0 ? 'transparent' : '#999')}
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
            onMouseEnter={e => {
              if (canAdvance() && !saving) {
                const el = e.currentTarget as HTMLElement
                el.style.background = '#7c4dcc'
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = '0 6px 20px rgba(124,77,204,0.35)'
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = '#111'
              el.style.transform = 'none'
              el.style.boxShadow = 'none'
            }}
          >
            {saving ? 'Saving…' : step === STEPS.length - 1 ? 'Finish' : 'Next'}
            {!saving && <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />}
          </button>
        </div>
      </div>

      {/* Right panel — dark with morphing logo */}
      <div style={{
        flex: 1, margin: '20px 20px 20px 0',
        borderRadius: 28, overflow: 'hidden',
        background: '#0a0a0a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
        gap: 0,
      }}>
        {/* Subtle noise texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }} />

        {/* Glow behind logo */}
        <div style={{
          position: 'absolute',
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* The morphing logo */}
        <div style={{ position: 'relative', zIndex: 1, filter: 'invert(1)' }}>
          <LogoMorph />
        </div>

        {/* LeadFlow label below */}
        <div style={{
          position: 'relative', zIndex: 1,
          marginTop: 8,
          fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          LeadFlow
        </div>

        {/* Step label */}
        <div key={step} style={{
          position: 'relative', zIndex: 1,
          marginTop: 40,
          textAlign: 'center',
          animation: 'lf-up 0.4s ease both',
          padding: '0 40px',
        }}>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            {step + 1} / {STEPS.length}
          </div>
          <div style={{
            fontSize: 13.5, color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.6, fontStyle: 'italic',
          }}>
            {[
              'The agent knows exactly where it sits in your funnel.',
              'Your AI agent will introduce itself as part of your brand.',
              'More context means smarter, more human conversations.',
              'We craft messaging around your ideal client's pain points.',
              'Pricing shapes tone, urgency, and objection handling.',
              'Your traffic source shapes how the agent opens conversations.',
              'Your goal unlocks the right templates — pre-built for your case.',
              'The experience adapts to your level. No overwhelm.',
            ][step]}
          </div>
        </div>
      </div>
    </div>
  )
}
