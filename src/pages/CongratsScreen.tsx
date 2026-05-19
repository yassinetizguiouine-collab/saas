import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  userId: string
  templateId: string
  onContinue: () => void
}

// ─── CONFETTI (same as FoundFlow) ────────────────────────────────────────────

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

    spawn('left', 80)
    spawn('right', 80)

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

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function CongratsScreen({ userId, templateId, onContinue }: Props) {
  const [agentName, setAgentName] = useState<string>('')
  const [ready, setReady] = useState(false)
  const [countdown, setCountdown] = useState(4)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useConfetti(canvasRef, ready)

  // Fetch agent name from flow_config
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('flow_config')
        .select('agent_name')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .maybeSingle()
      if (data?.agent_name) setAgentName(data.agent_name)
      setTimeout(() => setReady(true), 200)
    }
    load()
  }, [userId, templateId])

  // Countdown + auto-redirect
  useEffect(() => {
    if (!ready) return
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          onContinue()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [ready, onContinue])

  const progress = ready ? ((4 - countdown) / 4) * 100 : 0

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f9f9f9', position: 'relative', overflow: 'hidden', fontFamily: 'inherit',
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes progressFill {
          from { width: 0%; }
        }
      `}</style>

      {/* Dot background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.018,
        backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
        backgroundSize: '28px 28px', pointerEvents: 'none',
      }} />

      {/* Confetti */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }} />

      {/* Top-left logo */}
      <div style={{
        position: 'absolute', top: 28, left: 36,
        display: 'flex', alignItems: 'center', gap: 6,
        animation: 'fadeUp 0.5s ease both',
      }}>
        <img
          src="/Création sans titre (25).png"
          alt=""
          style={{ height: 28, width: 28, objectFit: 'contain', mixBlendMode: 'darken' }}
        />
        <span style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.03em' }}>
          LeadFlow
        </span>
      </div>

      {/* Card */}
      <div
        className="glass-strong"
        style={{
          borderRadius: 28, padding: '56px 64px', maxWidth: 520, width: '90%',
          textAlign: 'center', position: 'relative', zIndex: 1,
          border: '0.5px solid rgba(0,0,0,0.09)',
          opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Check icon */}
        <div style={{
          width: 72, height: 72,
          background: 'rgba(37,211,102,0.10)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          border: '0.5px solid rgba(37,211,102,0.2)',
        }}>
          <i
            className="ti ti-check"
            style={{ fontSize: 34, color: '#25D366', animation: ready ? 'checkPop 0.5s ease both' : 'none' }}
          />
        </div>

        {/* Label */}
        <p style={{
          fontSize: 12, color: '#aaa', fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 10,
        }}>
          Agent Ready
        </p>

        {/* Agent name headline */}
        <h1 style={{
          fontSize: 32, fontWeight: 800, color: '#111',
          letterSpacing: '-0.05em', lineHeight: 1.1, marginBottom: 14,
        }}>
          {agentName ? (
            <>
              <span style={{
                background: 'linear-gradient(90deg, #111 0%, #555 40%, #111 60%, #555 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 2.5s linear infinite',
              }}>
                {agentName}
              </span>
              {' '}is live 🎉
            </>
          ) : (
            'Your agent is live 🎉'
          )}
        </h1>

        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.65, marginBottom: 36, maxWidth: 360, margin: '0 auto 36px' }}>
          Your WhatsApp sales agent has been trained and is ready to start converting leads.
        </p>

        {/* Divider */}
        <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.07)', marginBottom: 28 }} />

        {/* Auto-redirect bar */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: '#bbb', marginBottom: 10 }}>
            Taking you to My Flows in {countdown}s...
          </p>
          <div style={{ height: 3, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: '#111',
              borderRadius: 99,
              transition: 'width 1s linear',
            }} />
          </div>
        </div>

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
          Go to My Flows
          <i className="ti ti-arrow-right" style={{ fontSize: 15 }} />
        </button>
      </div>
    </div>
  )
}
