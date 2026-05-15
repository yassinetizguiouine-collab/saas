import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  onComplete: () => void
}

interface Step {
  id: string
  question: string
  sub: string
  type: 'chips' | 'chips-multi' | 'text' | 'textarea'
  options?: Array<{ label: string; value: string }>
  placeholder?: string
  conditional?: (answers: Record<string, any>) => boolean
}

const STEPS: Step[] = [
  {
    id: 'role',
    question: 'What describes you the most?',
    sub: "We'll personalise your experience based on your profile.",
    type: 'chips',
    options: [
      { label: '🌱 New to Business', value: 'new-to-business' },
      { label: '🏢 Business Owner', value: 'business-owner' },
      { label: '🚀 Agency', value: 'agency' },
      { label: '🔧 Engineer', value: 'engineer' },
      { label: '⚙️ Automation Specialist', value: 'automation' },
      { label: '📣 Marketer', value: 'marketer' },
      { label: '💼 Sales', value: 'sales' },
      { label: '✨ Other', value: 'other' },
    ],
  },
  {
    id: 'business_name',
    question: 'What is the name of your business?',
    sub: 'Your AI agent will introduce itself on behalf of your brand.',
    type: 'text',
    placeholder: 'e.g. Nova Consulting',
  },
  {
    id: 'industry',
    question: 'What industry is your business in?',
    sub: 'This helps us tailor the agent language to your market.',
    type: 'chips',
    options: [
      { label: '🏠 Real Estate', value: 'real-estate' },
      { label: '🎓 Coaching / Consulting', value: 'coaching' },
      { label: '🛍️ E-commerce', value: 'ecommerce' },
      { label: '💻 SaaS / Tech', value: 'saas' },
      { label: '🏋️ Health & Fitness', value: 'health-fitness' },
      { label: '💰 Finance / Investing', value: 'finance' },
      { label: '🎨 Creative / Agency', value: 'creative-agency' },
      { label: '⚖️ Legal / Professional', value: 'legal' },
      { label: '🏥 Healthcare', value: 'healthcare' },
      { label: '🍽️ Food & Restaurant', value: 'food' },
      { label: '🎓 Education / Courses', value: 'education' },
      { label: '✨ Other', value: 'other' },
    ],
  },
  {
    id: 'ideal_client',
    question: 'Who is the ideal client of your business?',
    sub: 'Describe who you help — their profile, pain points, situation.',
    type: 'textarea',
    placeholder: 'e.g. Online coaches doing $5k–$20k/month who struggle to follow up with leads manually…',
  },
  {
    id: 'results_promised',
    question: 'What results do you promise your clients?',
    sub: 'The transformation or outcome your clients get from working with you.',
    type: 'textarea',
    placeholder: 'e.g. We help them book 10+ qualified calls per week on autopilot without paid ads…',
  },
  {
    id: 'product_type',
    question: 'How do you deliver your product?',
    sub: 'What format does your offer come in?',
    type: 'chips',
    options: [
      { label: '🎥 Video / Online Course', value: 'video-course' },
      { label: '📦 Physical Product', value: 'physical' },
      { label: '💻 Digital Product', value: 'digital' },
      { label: '🤝 1-on-1 Coaching', value: 'coaching' },
      { label: '👥 Group Program', value: 'group-program' },
      { label: '🛠️ Done-for-You Service', value: 'dfy-service' },
      { label: '📱 SaaS / Software', value: 'saas' },
      { label: '🎤 Events / Workshops', value: 'events' },
    ],
  },
  {
    id: 'price',
    question: 'How much does your offer cost?',
    sub: 'Enter the price of your main offer.',
    type: 'text',
    placeholder: 'e.g. $2,000 / $97/month / Free + upsell…',
  },
  {
    id: 'offer_name',
    question: 'What is the name of your offer?',
    sub: 'The actual name your clients know it by.',
    type: 'text',
    placeholder: 'e.g. The Scale Blueprint, AirMax Pro, 90-Day Accelerator…',
  },
  {
    id: 'traffic_source',
    question: 'What is your #1 traffic source?',
    sub: 'Where do most of your leads come from right now?',
    type: 'chips',
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
    id: 'closing_method',
    question: 'How do you close your clients?',
    sub: 'How does a lead become a paying customer?',
    type: 'chips',
    options: [
      { label: '📞 Phone Call / Sales Call', value: 'phone-call' },
      { label: '🤖 Without Phone Call', value: 'no-call' },
    ],
  },
  {
    id: 'has_lead_magnet',
    question: 'Do you use a lead magnet?',
    sub: 'A lead magnet is a free resource (guide, template, checklist) to qualify leads before the call.',
    type: 'chips',
    options: [
      { label: '✅ Yes, I use a lead magnet', value: 'true' },
      { label: '❌ No lead magnet, straight to call', value: 'false' },
    ],
    conditional: (answers: Record<string, any>) => answers.closing_method === 'phone-call',
  },
]

const QUOTES = [
  'The agent adapts its tone to who you are and how you work.',
  'Your AI agent will speak on behalf of your brand.',
  'Industry context makes every message feel native to your market.',
  'The more we know your client, the sharper the qualification.',
  'We build urgency and desire around the outcome you deliver.',
  'Delivery format shapes how the agent presents your offer.',
  'Pricing context changes tone, urgency, and objection handling.',
  'Your offer name makes every conversation feel personal and real.',
  'Traffic source shapes how the agent opens the first message.',
  'Knowing your close method lets us build the perfect handoff.',
  'A lead magnet turns browsers into buyers before the call.',
]

// ─── Liquid Blob Animation ─────────────────────────────────────────────
function LiquidLogo() {
  return (
    <div style={{ position: 'relative', width: 340, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes megaFloat {
          0%,100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25%      { transform: translateY(-18px) rotate(-2deg) scale(1.04); }
          50%      { transform: translateY(-8px) rotate(2deg) scale(1.08); }
          75%      { transform: translateY(-20px) rotate(-1deg) scale(1.02); }
        }
        @keyframes blob1anim {
          0%   { border-radius: 52% 48% 45% 55% / 58% 45% 55% 42%; transform: scale(1) rotate(0deg); }
          100% { border-radius: 64% 36% 58% 42% / 38% 62% 38% 62%; transform: scale(1.18) rotate(5deg); }
        }
        @keyframes blob2anim {
          0%   { border-radius: 42% 58% 52% 48% / 55% 40% 60% 45%; transform: translateX(0px) scale(1); }
          100% { border-radius: 70% 30% 42% 58% / 35% 65% 35% 65%; transform: translateX(14px) scale(1.15); }
        }
        @keyframes blob3anim {
          0%   { border-radius: 50% 50% 45% 55% / 52% 48% 52% 48%; transform: translateY(0px) scale(1); }
          100% { border-radius: 68% 32% 60% 40% / 42% 58% 42% 58%; transform: translateY(18px) scale(1.25); }
        }
        @keyframes pulseGlow {
          0%,100% { transform: scale(1); opacity: 0.5; }
          50%      { transform: scale(1.25); opacity: 0.85; }
        }
        @keyframes shadowMove {
          0%,100% { transform: scale(1); opacity: 0.35; }
          50%      { transform: scale(0.82); opacity: 0.15; }
        }
        @keyframes flashRing {
          0%   { transform: scale(0.8); opacity: 0; }
          40%  { opacity: 0.2; }
          100% { transform: scale(1.35); opacity: 0; }
        }
      `}</style>

      {/* Purple glow behind blobs */}
      <div style={{
        position: 'absolute',
        width: 280, height: 280,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(120,80,255,0.15), transparent 70%)',
        filter: 'blur(40px)',
        animation: 'pulseGlow 4s ease-in-out infinite',
      }} />

      {/* Flash ring */}
      <div style={{
        position: 'absolute',
        width: 320, height: 320,
        borderRadius: '50%',
        border: '1.5px solid rgba(255,255,255,0.07)',
        animation: 'flashRing 3s linear infinite',
      }} />

      {/* Shadow */}
      <div style={{
        position: 'absolute',
        width: 180, height: 36,
        background: 'rgba(100,100,180,0.15)',
        borderRadius: '50%',
        bottom: 52,
        filter: 'blur(22px)',
        animation: 'shadowMove 5s ease-in-out infinite',
      }} />

      {/* The liquid blobs */}
      <div style={{
        position: 'relative',
        width: 260, height: 260,
        animation: 'megaFloat 5s ease-in-out infinite',
      }}>
        {/* Blob 1 — top cap */}
        <div style={{
          position: 'absolute',
          width: 195, height: 118,
          left: 33, top: 10,
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '52% 48% 45% 55% / 58% 45% 55% 42%',
          animation: 'blob1anim 3.2s ease-in-out infinite alternate',
          boxShadow: '0 8px 40px rgba(96,165,250,0.25), inset 0 1px 0 rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 'inherit',
            background: '#fff',
            filter: 'blur(18px)',
            opacity: 0.5,
          }} />
        </div>

        {/* Blob 2 — middle */}
        <div style={{
          position: 'absolute',
          width: 170, height: 92,
          left: 45, top: 95,
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '42% 58% 52% 48% / 55% 40% 60% 45%',
          animation: 'blob2anim 2.7s ease-in-out infinite alternate',
          boxShadow: '0 8px 32px rgba(52,211,153,0.2), inset 0 1px 0 rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.55)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 'inherit',
            background: '#fff',
            filter: 'blur(18px)',
            opacity: 0.5,
          }} />
        </div>

        {/* Blob 3 — stem/bottom */}
        <div style={{
          position: 'absolute',
          width: 92, height: 70,
          left: 85, top: 168,
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '50% 50% 45% 55% / 52% 48% 52% 48%',
          animation: 'blob3anim 2.2s ease-in-out infinite alternate',
          boxShadow: '0 8px 28px rgba(167,139,250,0.2), inset 0 1px 0 rgba(255,255,255,0.65)',
          border: '1px solid rgba(255,255,255,0.5)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 'inherit',
            background: '#fff',
            filter: 'blur(18px)',
            opacity: 0.5,
          }} />
        </div>
      </div>
    </div>
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
            ctx.beginPath()
            ctx.arc(x, y, 1 + proximity * 2.5, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(124, 77, 204, ${0.12 + proximity * 0.65})`
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
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, zIndex: 0,
      pointerEvents: 'none', background: '#f9f9f9',
    }} />
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

  // Get visible steps based on conditions
  const visibleSteps = STEPS.filter(s => !s.conditional || s.conditional(answers))
  const current = visibleSteps[step]
  const singleVal = answers[current.id] as string | undefined
  const multiVal = (answers[current.id] as string[] | undefined) ?? []

  function setSingle(v: string) { setAnswers(a => ({ ...a, [current.id]: v })) }
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
    if (step < visibleSteps.length - 1) { setAnimKey(k => k + 1); setStep(s => s + 1) }
    else handleSave()
  }

  function goBack() {
    if (step > 0) { setAnimKey(k => k + 1); setStep(s => s - 1) }
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    
    // Convert has_lead_magnet from string to boolean
    const hasLeadMagnet = answers.has_lead_magnet === 'true' ? true : 
                          answers.has_lead_magnet === 'false' ? false : 
                          null
    
    await supabase.from('onboarding').upsert({
      user_id: user.id,
      role: answers.role,
      business_name: answers.business_name,
      industry: answers.industry,
      ideal_client: answers.ideal_client,
      results_promised: answers.results_promised,
      product_type: answers.product_type,
      price: answers.price,
      offer_name: answers.offer_name,
      traffic_source: answers.traffic_source,
      closing_method: answers.closing_method,
      has_lead_magnet: hasLeadMagnet,
      completed: true,
    }, { onConflict: 'user_id' })
    setSaving(false)
    onComplete()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'inherit', position: 'relative' }}>
      <GlowDotGrid />

      {/* ── Left panel ── */}
      <div style={{
        width: '52%', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: '40px 56px',
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: 36 }}>
          LeadFlow
        </div>

        {/* Progress — now based on visibleSteps */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 48 }}>
          {visibleSteps.map((_, i) => (
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
            Step {step + 1} of {visibleSteps.length}
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
            <input type="text" autoFocus placeholder={current.placeholder}
              value={singleVal ?? ''} onChange={e => setSingle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canAdvance() && goNext()}
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 14,
                background: 'rgba(255,255,255,0.8)', border: '0.5px solid rgba(0,0,0,0.13)',
                fontSize: 15, color: '#111', outline: 'none',
                fontFamily: 'inherit', boxSizing: 'border-box',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            />
          )}
          {current.type === 'textarea' && (
            <textarea autoFocus placeholder={current.placeholder}
              value={singleVal ?? ''} onChange={e => setSingle(e.target.value)} rows={4}
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 14,
                background: 'rgba(255,255,255,0.8)', border: '0.5px solid rgba(0,0,0,0.13)',
                fontSize: 15, color: '#111', outline: 'none',
                fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.65,
                boxSizing: 'border-box', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
            />
          )}
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 40 }}>
          <button onClick={goBack} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: step === 0 ? 'default' : 'pointer',
            color: step === 0 ? 'transparent' : '#999', fontSize: 13,
            fontFamily: 'inherit', padding: 0, transition: 'color 0.15s',
          }}
            onMouseEnter={e => step > 0 && ((e.currentTarget as HTMLElement).style.color = '#111')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = step === 0 ? 'transparent' : '#999')}
          >
            <i className="ti ti-arrow-left" style={{ fontSize: 15 }} /> Back
          </button>

          <button onClick={goNext} disabled={!canAdvance() || saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#111', color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px 28px', fontSize: 14, fontWeight: 600,
              fontFamily: 'inherit', cursor: canAdvance() ? 'pointer' : 'not-allowed',
              opacity: canAdvance() && !saving ? 1 : 0.4, transition: 'all 0.18s',
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
            {saving ? 'Saving…' : step === visibleSteps.length - 1 ? 'Finish' : 'Next'}
            {!saving && <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />}
          </button>
        </div>
      </div>

      {/* ── Right panel — fluid glass ── */}
      <div style={{
        flex: 1, margin: '20px 20px 20px 0',
        borderRadius: 28, overflow: 'hidden',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <style>{`
          @keyframes fluidA { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.15)} 66%{transform:translate(-30px,50px) scale(0.95)} }
          @keyframes fluidB { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,60px) scale(1.1)} 66%{transform:translate(70px,-30px) scale(1.2)} }
          @keyframes fluidC { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,70px) scale(0.9)} 66%{transform:translate(-60px,-50px) scale(1.1)} }
          @keyframes fluidD { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,-60px) scale(1.2)} 66%{transform:translate(50px,40px) scale(0.95)} }
        `}</style>

        {/* Fluid color blobs background */}
        <div style={{ position: 'absolute', inset: 0, background: '#f0f4ff', borderRadius: 28 }}>
          {/* Blue blob */}
          <div style={{
            position: 'absolute', width: 420, height: 420, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96,165,250,0.7) 0%, rgba(59,130,246,0.4) 50%, transparent 70%)',
            filter: 'blur(50px)', top: '-80px', left: '-60px',
            animation: 'fluidA 9s ease-in-out infinite',
          }} />
          {/* Green blob */}
          <div style={{
            position: 'absolute', width: 380, height: 380, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52,211,153,0.65) 0%, rgba(16,185,129,0.35) 50%, transparent 70%)',
            filter: 'blur(55px)', bottom: '-60px', right: '-40px',
            animation: 'fluidB 11s ease-in-out infinite',
          }} />
          {/* Purple blob */}
          <div style={{
            position: 'absolute', width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.6) 0%, rgba(139,92,246,0.3) 50%, transparent 70%)',
            filter: 'blur(45px)', top: '40%', left: '20%',
            animation: 'fluidC 8s ease-in-out infinite',
          }} />
          {/* Sky blob */}
          <div style={{
            position: 'absolute', width: 280, height: 280, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(125,211,252,0.55) 0%, rgba(56,189,248,0.25) 50%, transparent 70%)',
            filter: 'blur(40px)', bottom: '20%', left: '-20px',
            animation: 'fluidD 13s ease-in-out infinite',
          }} />
          {/* Frosted glass overlay */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 28,
            backdropFilter: 'blur(0px)',
            background: 'rgba(255,255,255,0.18)',
          }} />
        </div>

        {/* Content sits on top of the glass */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Liquid logo */}
          <LiquidLogo />

          {/* LeadFlow label */}
          <div style={{
            fontSize: 12, fontWeight: 700, color: 'rgba(60,60,100,0.4)',
            letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4,
          }}>
            LeadFlow
          </div>

          {/* Quote — changes per step */}
          <div key={step} style={{
            marginTop: 36, textAlign: 'center', padding: '0 44px',
            animation: 'lf-up 0.4s ease both',
          }}>
            <div style={{
              fontSize: 13, color: 'rgba(60,60,100,0.55)',
              lineHeight: 1.7, fontStyle: 'italic',
            }}>
              {QUOTES[Math.min(step, QUOTES.length - 1)]}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
