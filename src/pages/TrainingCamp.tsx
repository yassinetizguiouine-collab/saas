import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  userId: string
  templateId: string
  agentName: string
}

type Screen = 'intro' | 'choose'

// ─── INTRO SCREEN ────────────────────────────────────────────────────────────

function IntroScreen({ onUnderstood }: { onUnderstood: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 80)
  }, [])

  const steps = [
    { icon: 'ti-target', label: 'Pick your criteria', desc: 'Choose what you want to test your agent on' },
    { icon: 'ti-users', label: 'Meet your leads', desc: 'We generate 10 realistic lead personas for you' },
    { icon: 'ti-messages', label: 'Play the lead', desc: 'Chat as a real prospect and see how your agent responds' },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px', maxWidth: 580, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      {/* Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        background: 'rgba(255,170,0,0.08)', border: '0.5px solid rgba(255,170,0,0.2)',
        borderRadius: 100, padding: '5px 14px', marginBottom: 24,
      }}>
        <span style={{ fontSize: 16 }}>🏕️</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#b37700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Training Camp
        </span>
      </div>

      {/* Headline */}
      <h2 style={{
        fontSize: 28, fontWeight: 800, color: '#111',
        letterSpacing: '-0.04em', textAlign: 'center', marginBottom: 12, lineHeight: 1.2,
      }}>
        Put your agent through<br />boot camp before going live
      </h2>
      <p style={{
        fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 1.7,
        marginBottom: 36, maxWidth: 420,
      }}>
        Select the scenarios you care about, get 10 realistic lead personas generated for your business, then chat as a real prospect to see exactly how your agent performs.
      </p>

      {/* Steps */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px', borderRadius: 14,
            background: 'rgba(255,255,255,0.6)', border: '0.5px solid rgba(0,0,0,0.07)',
            animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: 'rgba(255,170,0,0.08)', border: '0.5px solid rgba(255,170,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`ti ${step.icon}`} style={{ fontSize: 17, color: '#b37700' }} />
            </div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111', marginBottom: 2 }}>{step.label}</p>
              <p style={{ fontSize: 12.5, color: '#999' }}>{step.desc}</p>
            </div>
            <div style={{
              marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#bbb',
            }}>
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onUnderstood}
        style={{
          width: '100%', padding: '14px', borderRadius: 13,
          background: '#111', color: '#fff', border: 'none',
          fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'opacity 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(1.02)' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
      >
        Let's go 🔥
        <i className="ti ti-arrow-right" style={{ fontSize: 15 }} />
      </button>
    </div>
  )
}

// ─── CHOOSE SCREEN ───────────────────────────────────────────────────────────

function ChooseScreen({ agentName }: { agentName: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 80)
  }, [])

  const modes = [
    {
      id: 'fun',
      emoji: '🎭',
      name: 'Fun Testing',
      tag: 'Recommended',
      tagColor: '#1a8c4e',
      tagBg: 'rgba(37,211,102,0.09)',
      description: 'Pick your criteria, get 10 real lead personas, and chat as one of them. You\'ll feel exactly what your leads feel.',
      highlights: ['10 custom lead personas', 'You play the lead', 'AI grades the result'],
      border: 'rgba(37,211,102,0.2)',
      iconBg: 'rgba(37,211,102,0.08)',
      iconColor: '#25D366',
      comingSoon: false,
    },
    {
      id: 'auto',
      emoji: '⚡',
      name: 'Automatic Testing',
      tag: 'Coming soon',
      tagColor: '#888',
      tagBg: 'rgba(0,0,0,0.05)',
      description: 'Select criteria and let us run everything automatically. Get a full report card with scores and feedback in minutes.',
      highlights: ['Full automated run', 'Report card with scores', 'Fix weak points CTA'],
      border: 'rgba(0,0,0,0.07)',
      iconBg: 'rgba(0,0,0,0.04)',
      iconColor: '#aaa',
      comingSoon: true,
    },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px', maxWidth: 600, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(255,170,0,0.08)', border: '0.5px solid rgba(255,170,0,0.2)',
          borderRadius: 100, padding: '5px 14px', marginBottom: 20,
        }}>
          <span style={{ fontSize: 16 }}>🏕️</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#b37700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Training Camp
          </span>
        </div>
        <h2 style={{
          fontSize: 26, fontWeight: 800, color: '#111',
          letterSpacing: '-0.04em', marginBottom: 10,
        }}>
          Choose your mode
        </h2>
        <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
          How do you want to test {agentName}?
        </p>
      </div>

      {/* Mode cards */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {modes.map((mode, i) => (
          <div
            key={mode.id}
            style={{
              borderRadius: 18, padding: '22px 24px',
              background: 'rgba(255,255,255,0.6)',
              border: `0.5px solid ${mode.border}`,
              cursor: mode.comingSoon ? 'default' : 'pointer',
              opacity: mode.comingSoon ? 0.6 : 1,
              transition: 'transform 0.15s, box-shadow 0.15s',
              animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              if (!mode.comingSoon) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {/* Icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: mode.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {mode.emoji}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>
                    {mode.name}
                  </h3>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                    background: mode.tagBg, color: mode.tagColor,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>
                    {mode.tag}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6, marginBottom: 14 }}>
                  {mode.description}
                </p>
                {/* Highlights */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {mode.highlights.map((h, j) => (
                    <span key={j} style={{
                      fontSize: 11.5, fontWeight: 600, color: '#666',
                      background: 'rgba(0,0,0,0.04)', borderRadius: 100,
                      padding: '4px 10px',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <i className="ti ti-check" style={{ fontSize: 10, color: '#aaa' }} />
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              {!mode.comingSoon && (
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: '#111',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                  <i className="ti ti-arrow-right" style={{ fontSize: 14, color: '#fff' }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

const INTRO_KEY = 'training_camp_intro_seen'

export default function TrainingCamp({ userId, templateId, agentName }: Props) {
  const [screen, setScreen] = useState<Screen | null>(null)

  useEffect(() => {
    async function checkIntro() {
      const { data } = await supabase
        .from('training_camp_state')
        .select('intro_seen')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .maybeSingle()

      if (data?.intro_seen) {
        setScreen('choose')
      } else {
        setScreen('intro')
      }
    }
    checkIntro()
  }, [userId, templateId])

  async function handleUnderstood() {
    await supabase
      .from('training_camp_state')
      .upsert({ user_id: userId, template_id: templateId, intro_seen: true }, { onConflict: 'user_id,template_id' })
    setScreen('choose')
  }

  if (!screen) return (
    <div style={{ padding: '80px 40px', textAlign: 'center', color: '#ccc' }}>
      <i className="ti ti-loader-2" style={{ fontSize: 24, animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {screen === 'intro' && <IntroScreen onUnderstood={handleUnderstood} />}
      {screen === 'choose' && <ChooseScreen agentName={agentName} />}
    </div>
  )
}
