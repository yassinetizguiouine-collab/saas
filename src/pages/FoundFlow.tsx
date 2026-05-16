import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  templateId: string
  onContinue: () => void
}

const TEMPLATE_DATA: Record<string, { name: string; subtitle: string }> = {
  'booking-with-lm': {
    name: 'Lead Magnet Booking Flow',
    subtitle: 'Warm up leads with your free offer, then convert them into discovery calls — automatically.',
  },
  'booking-without-lm': {
    name: 'Direct Booking Flow',
    subtitle: 'Qualify inbound leads automatically and turn conversations into booked discovery calls.',
  },
  'close-in-chat': {
    name: 'Closing Flow',
    subtitle: 'Build trust, handle objections, and close customers directly in WhatsApp chat.',
  },
}

// ─── CONFETTI ───────────────────────────────────────────────────────────────

const COLORS = ['#111', '#555', '#25D366', '#888', '#bbb', '#000', '#444']

interface Particle {
  x: number; y: number; vx: number; vy: number
  color: string; rotation: number; rotationSpeed: number
  width: number; height: number; opacity: number; gravity: number
}

function useConfetti(canvasRef: React.RefObject<HTMLCanvasElement>, trigger: boolean) {
  const animRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    if (!trigger || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    function spawn(side: 'left' | 'right', count: number) {
      const x = side === 'left' ? canvas.width * 0.15 : canvas.width * 0.85
      const y = canvas.height
      for (let i = 0; i < count; i++) {
        const angle = side === 'left'
          ? -(Math.random() * 70 + 50) * (Math.PI / 180)
          : -(Math.random() * 70 + 60) * (Math.PI / 180)
        const speed = Math.random() * 14 + 8
        particlesRef.current.push({
          x, y,
          vx: Math.cos(angle) * speed * (side === 'left' ? 1 : -1),
          vy: Math.sin(angle) * speed,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 8,
          width: Math.random() * 8 + 5,
          height: Math.random() * 5 + 3,
          opacity: 1,
          gravity: Math.random() * 0.3 + 0.2,
        })
      }
    }

    spawn('left', 60)
    spawn('right', 60)

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter(p => p.opacity > 0)
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.vx *= 0.99
        p.rotation += p.rotationSpeed
        if (p.y > canvas.height * 0.4) p.opacity -= 0.018
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation * Math.PI / 180)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
        ctx.restore()
      }
      if (particlesRef.current.length > 0) {
        animRef.current = requestAnimationFrame(draw)
      }
    }

    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [trigger, canvasRef])
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function FoundFlow({ templateId, onContinue }: Props) {
  const [businessName, setBusinessName] = useState<string>('')
  const [ready, setReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useConfetti(canvasRef, ready)

  const key = templateId in TEMPLATE_DATA ? templateId : 'booking-with-lm'
  const t = TEMPLATE_DATA[key as keyof typeof TEMPLATE_DATA]

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setReady(true); return }
      const { data } = await supabase
        .from('onboarding')
        .select('business_name')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data?.business_name) setBusinessName(data.business_name)
      setTimeout(() => setReady(true), 100)
    }
    load()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f9f9f9', position: 'relative', overflow: 'hidden', fontFamily: 'inherit',
    }}>
      {/* Subtle background texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.018,
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        pointerEvents: 'none',
      }} />

      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}
      />

      {/* Card */}
      <div
        className="glass-strong"
        style={{
          borderRadius: 28, padding: '56px 64px', maxWidth: 540, width: '90%',
          textAlign: 'center', position: 'relative', zIndex: 1,
          opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          border: '0.5px solid rgba(0,0,0,0.09)',
        }}
      >
        {/* Trophy icon */}
        <div style={{
          width: 64, height: 64, background: 'rgba(0,0,0,0.06)', borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px', border: '0.5px solid rgba(0,0,0,0.08)',
        }}>
          <i className="ti ti-trophy" style={{ fontSize: 28, color: '#111' }} />
        </div>

        {/* Headline */}
        <p style={{ fontSize: 13, color: '#aaa', fontWeight: 500, marginBottom: 10, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          We Found The Best Funnel For
        </p>
        <h1 style={{
          fontSize: 30, fontWeight: 800, color: '#111', letterSpacing: '-0.06em',
          marginBottom: 28, lineHeight: 1.15,
        }}>
          {businessName || 'Your Business'}
        </h1>

        {/* Divider */}
        <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', marginBottom: 28 }} />

        {/* Flow name tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#111', color: '#fff', borderRadius: 12,
          padding: '8px 18px', fontSize: 13, fontWeight: 600,
          marginBottom: 18,
        }}>
          <i className="ti ti-brand-whatsapp" style={{ fontSize: 15, color: '#25D366' }} />
          {t.name}
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.65, marginBottom: 40, maxWidth: 380, margin: '12px auto 40px' }}>
          {t.subtitle}
        </p>

        {/* CTA */}
        <button
          onClick={onContinue}
          style={{
            width: '100%', background: '#111', color: '#fff', border: 'none',
            borderRadius: 13, padding: '14px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
        >
          See How It Works
          <i className="ti ti-arrow-right" style={{ fontSize: 15 }} />
        </button>

        <p style={{ fontSize: 11, color: '#ccc', marginTop: 14 }}>
          Customise everything in the next step
        </p>
      </div>
    </div>
  )
}
