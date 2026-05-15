import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  onRecommended: (templateId: string) => void
}

export default function FlowRecommender({ onRecommended }: Props) {
  const [companyName, setCompanyName] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getDataAndRecommend = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: onboarding } = await supabase
          .from('onboarding')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!onboarding) return

        setCompanyName(onboarding.business_name || 'your business')

        // Decision logic — pure frontend, no Edge Function needed
        let recommendedTemplate = 'booking-without-lm' // default

        if (onboarding.closing_method === 'phone-call') {
          if (onboarding.has_lead_magnet === true) {
            recommendedTemplate = 'booking-with-lm'
          } else {
            recommendedTemplate = 'booking-without-lm'
          }
        } else if (onboarding.closing_method === 'no-call') {
          recommendedTemplate = 'close-in-chat' // ← renamed from no-booking
        }

        // Wait for animation (4 seconds) then redirect
        setTimeout(() => {
          onRecommended(recommendedTemplate)
        }, 4000)
      } catch (e) {
        console.error('FlowRecommender error:', e)
        setTimeout(() => onRecommended('booking-without-lm'), 4000)
      }
    }

    getDataAndRecommend()
  }, [onRecommended])

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9f9f9',
        backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.10) 1px, transparent 1px)',
        backgroundSize: '18px 18px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes magnetBounce {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.08) translateY(-12px); }
        }
        @keyframes magnetGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(196, 181, 253, 0.4), inset 0 1px 0 rgba(255,255,255,.8); }
          50% { box-shadow: 0 0 50px rgba(196, 181, 253, 0.6), inset 0 1px 0 rgba(255,255,255,.8); }
        }
        @keyframes magnetPulseRing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes typeText {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fr-magnet-circle {
          animation: magnetBounce 2.4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite, magnetGlow 2.4s ease-in-out infinite;
        }
        .fr-pulse-ring { animation: magnetPulseRing 2s ease-out infinite; }
        .fr-text { animation: typeText 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
        {/* Magnet Glass Circle */}
        <div style={{ position: 'relative', width: 240, height: 240 }}>
          <div className="fr-pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(196, 181, 253, 0.3)' }} />
          <div className="fr-pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(196, 181, 253, 0.2)', animationDelay: '0.5s' }} />
          <div
            className="fr-magnet-circle"
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,.8), 0 0 30px rgba(196, 181, 253, 0.4)',
            }}
          >
            <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'conic-gradient(from 0deg, #c4b5fd, #a78bfa, transparent)', opacity: 0.4, animation: 'spin 2s linear infinite' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #c4b5fd, #a78bfa)', boxShadow: '0 0 16px rgba(196, 181, 253, 0.6)', position: 'relative', zIndex: 2 }} />
          </div>
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div className="fr-text" style={{ fontSize: '16px', fontWeight: 600, color: '#111', letterSpacing: '-0.02em', lineHeight: 1.4 }}>
            Searching for the perfect flow for{' '}
            <span style={{ color: '#c4b5fd', fontWeight: 700 }}>
              {companyName || 'your business'}
            </span>
            …
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.4)', marginTop: '12px', fontWeight: 500 }}>
            Just a moment while we analyze your business.
          </div>
        </div>
      </div>
    </div>
  )
}
