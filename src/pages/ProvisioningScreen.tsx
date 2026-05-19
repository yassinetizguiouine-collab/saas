import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  userId: string
  templateId: string
  onComplete: () => void
}

interface ProvisioningStatus {
  status: 'started' | 'in_progress' | 'completed' | 'failed'
  current_step: string
}

function useTypingEffect(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const prevText = useRef('')

  useEffect(() => {
    if (text === prevText.current) return
    prevText.current = text
    setDone(false)
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return { displayed, done }
}

function PulsingDot() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginLeft: 6 }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#111',
            opacity: 0.25,
            display: 'inline-block',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </span>
  )
}

export default function ProvisioningScreen({ userId, templateId, onComplete }: Props) {
  const [status, setStatus] = useState<ProvisioningStatus>({
    status: 'started',
    current_step: 'Starting your agent build...',
  })
  const { displayed, done } = useTypingEffect(status.current_step, 22)

  useEffect(() => {
    // Initial fetch
    supabase
      .from('provisioning_status')
      .select('status, current_step')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setStatus(data as ProvisioningStatus)
      })

    // Realtime subscription
    const channel = supabase
      .channel('provisioning-' + userId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'provisioning_status',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as ProvisioningStatus
          setStatus(row)
          if (row.status === 'completed') {
            setTimeout(() => onComplete(), 2200)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, templateId, onComplete])

  const isCompleted = status.status === 'completed'
  const isFailed = status.status === 'failed'

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9f9f9',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.10) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.06); }
          50% { box-shadow: 0 0 32px 8px rgba(0,0,0,0.07); }
        }
      `}</style>

      {/* Top-left logo */}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          animation: 'fadeIn 0.5s ease both',
        }}
      >
        <img
          src="/Création sans titre (25).png"
          alt=""
          style={{ height: 28, width: 28, objectFit: 'contain' }}
        />
        <span
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#111',
            letterSpacing: '-0.03em',
          }}
        >
          LeadFlow
        </span>
      </div>

      {/* Center card */}
      <div
        className="glass-strong"
        style={{
          borderRadius: 28,
          padding: '52px 56px',
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          animation: 'fadeIn 0.5s ease 0.1s both',
          animationName: 'glowPulse',
          animationDuration: '3s',
          animationIterationCount: 'infinite',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: isCompleted
              ? 'rgba(37,211,102,0.10)'
              : isFailed
              ? 'rgba(239,68,68,0.10)'
              : 'rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.4s ease',
          }}
        >
          {isCompleted ? (
            <i
              className="ti ti-check"
              style={{
                fontSize: 34,
                color: '#25D366',
                animation: 'checkPop 0.4s ease both',
              }}
            />
          ) : isFailed ? (
            <i
              className="ti ti-x"
              style={{ fontSize: 34, color: '#ef4444', animation: 'checkPop 0.4s ease both' }}
            />
          ) : (
            <img
              src="/ChatGPT Image 18 mai 2026, 09_10_46.png"
              alt=""
              style={{
                height: 36,
                width: 36,
                objectFit: 'contain',
                animation: 'spin 3s linear infinite',
              }}
            />
          )}
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#111',
              letterSpacing: '-0.5px',
              marginBottom: 8,
            }}
          >
            {isCompleted
              ? 'Your agent is ready 🎉'
              : isFailed
              ? 'Build failed'
              : 'Building your agent...'}
          </h1>
          <p style={{ fontSize: 13, color: '#aaa', fontWeight: 400 }}>
            {isCompleted
              ? 'Taking you to your flow now'
              : isFailed
              ? 'Something went wrong. Please try again.'
              : 'This takes about 60 seconds. Stay with us.'}
          </p>
        </div>

        {/* Typing step */}
        <div
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.03)',
            borderRadius: 16,
            padding: '20px 24px',
            minHeight: 64,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: isFailed ? '#ef4444' : '#111',
              lineHeight: 1.6,
              margin: 0,
              letterSpacing: '-0.1px',
            }}
          >
            {displayed}
            {!done && !isCompleted && !isFailed && <PulsingDot />}
          </p>
        </div>

        {/* Progress bar */}
        {!isCompleted && !isFailed && (
          <div
            style={{
              width: '100%',
              height: 3,
              background: 'rgba(0,0,0,0.07)',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '40%',
                background: '#111',
                borderRadius: 99,
                animation: 'progressSlide 2s ease-in-out infinite alternate',
              }}
            />
            <style>{`
              @keyframes progressSlide {
                from { transform: translateX(-100%); }
                to { transform: translateX(300%); }
              }
            `}</style>
          </div>
        )}

        {/* Failed — retry button */}
        {isFailed && (
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 32px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              animation: 'fadeIn 0.4s ease both',
            }}
          >
            Try again
          </button>
        )}
      </div>

      {/* Bottom hint */}
      {!isCompleted && !isFailed && (
        <p
          style={{
            position: 'absolute',
            bottom: 28,
            fontSize: 12,
            color: '#ccc',
            animation: 'fadeIn 0.5s ease 0.6s both',
          }}
        >
          Powered by LeadFlow AI
        </p>
      )}
    </div>
  )
}
