import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  userId: string
  templateId: string
  agentName: string
}

type Screen = 'intro' | 'choose' | 'criteria' | 'personas'

const CRITERIA_BY_TEMPLATE: Record<string, { icon: string; label: string; desc: string }[]> = {
  'booking-with-lm': [
    { icon: 'ti-wave-sine', label: 'Break the ice', desc: 'Agent opens naturally and confirms lead source and goal' },
    { icon: 'ti-list-check', label: 'Qualify the lead', desc: 'Agent asks the right diagnostic questions' },
    { icon: 'ti-gift', label: 'Deliver the lead magnet', desc: 'Agent sends the lead magnet at the right moment' },
    { icon: 'ti-message-check', label: 'After lead magnet thanks', desc: 'Agent handles "thanks" without losing momentum' },
    { icon: 'ti-arrows-shuffle', label: 'Off-topic lead', desc: 'Lead goes off-script, agent brings them back' },
    { icon: 'ti-mood-angry', label: 'Angry or rude lead', desc: 'Lead is hostile, agent stays calm and professional' },
    { icon: 'ti-user-x', label: 'Disobedient lead', desc: 'Lead ignores instructions, agent handles it' },
    { icon: 'ti-clock-pause', label: '"I\'ll think about it"', desc: 'Agent handles hesitation after the lead magnet' },
    { icon: 'ti-coin', label: 'Price objection', desc: 'Lead asks price too early, agent deflects and refocuses' },
    { icon: 'ti-calendar-check', label: 'Book the call', desc: 'Agent transitions from lead magnet to booking the call' },
  ],
}

const DEFAULT_SELECTED = ['Break the ice', 'Qualify the lead', 'Book the call']

const PERSONAS_WEBHOOK = 'https://leadflowai2026.app.n8n.cloud/webhook/6a8b392d-0028-44ae-8879-e6fe07cfe4ea'

// ─── BADGE ───────────────────────────────────────────────────────────────────

function CampBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: 'rgba(255,170,0,0.08)', border: '0.5px solid rgba(255,170,0,0.2)',
      borderRadius: 100, padding: '5px 14px', marginBottom: 20,
    }}>
      <span style={{ fontSize: 16 }}>🏕️</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#b37700', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
        Training Camp
      </span>
    </div>
  )
}

// ─── INTRO SCREEN ────────────────────────────────────────────────────────────

function IntroScreen({ onUnderstood }: { onUnderstood: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const steps = [
    { icon: 'ti-target', label: 'Pick your criteria', desc: 'Choose what you want to test your agent on' },
    { icon: 'ti-layout-grid', label: 'Choose your mode', desc: 'Automatic report card or play the lead yourself' },
    { icon: 'ti-trophy', label: 'Get your results', desc: 'See exactly where your agent wins or needs work' },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px', maxWidth: 580, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <CampBadge />
      <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', textAlign: 'center', marginBottom: 12, lineHeight: 1.2 }}>
        Put your agent through<br />boot camp before going live
      </h2>
      <p style={{ fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 1.7, marginBottom: 36, maxWidth: 420 }}>
        Pick the scenarios that matter to your business, then let us stress-test your agent — automatically or by playing a real lead yourself. Know it's ready before it talks to your first customer.
      </p>
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
              background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#bbb',
            }}>{i + 1}</div>
          </div>
        ))}
      </div>
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
        Let's go
        <i className="ti ti-arrow-right" style={{ fontSize: 15 }} />
      </button>
    </div>
  )
}

// ─── CHOOSE SCREEN ───────────────────────────────────────────────────────────

function ChooseScreen({ agentName, onFunTesting }: { agentName: string; onFunTesting: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const modes = [
    {
      id: 'fun', icon: 'ti-mood-happy', name: 'Fun Testing', tag: 'Recommended',
      tagColor: '#1a8c4e', tagBg: 'rgba(37,211,102,0.09)',
      description: "Pick your criteria, get 10 real lead personas, and chat as one of them. You'll feel exactly what your leads feel.",
      highlights: ['10 custom lead personas', 'You play the lead', 'AI grades the result'],
      border: 'rgba(37,211,102,0.2)', comingSoon: false,
    },
    {
      id: 'auto', icon: 'ti-bolt', name: 'Automatic Testing', tag: 'Coming soon',
      tagColor: '#888', tagBg: 'rgba(0,0,0,0.05)',
      description: 'Select criteria and let us run everything automatically. Get a full report card with scores and feedback in minutes.',
      highlights: ['Full automated run', 'Report card with scores', 'Fix weak points CTA'],
      border: 'rgba(0,0,0,0.07)', comingSoon: true,
    },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px', maxWidth: 600, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <CampBadge />
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 10 }}>
          Choose your mode
        </h2>
        <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>How do you want to test {agentName}?</p>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {modes.map((mode, i) => (
          <div
            key={mode.id}
            onClick={() => { if (!mode.comingSoon) onFunTesting() }}
            style={{
              borderRadius: 18, padding: '22px 24px',
              background: 'rgba(255,255,255,0.6)',
              border: `0.5px solid ${mode.border}`,
              cursor: mode.comingSoon ? 'default' : 'pointer',
              opacity: mode.comingSoon ? 0.6 : 1,
              transition: 'transform 0.15s, box-shadow 0.15s',
              animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
            }}
            onMouseEnter={e => { if (!mode.comingSoon) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: mode.comingSoon ? 'rgba(0,0,0,0.04)' : 'rgba(37,211,102,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}><i className={`ti ${mode.icon}`} style={{ fontSize: 22, color: mode.comingSoon ? '#aaa' : '#25D366' }} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>{mode.name}</h3>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                    background: mode.tagBg, color: mode.tagColor,
                    letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                  }}>{mode.tag}</span>
                </div>
                <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6, marginBottom: 14 }}>{mode.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                  {mode.highlights.map((h, j) => (
                    <span key={j} style={{
                      fontSize: 11.5, fontWeight: 600, color: '#666',
                      background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: '4px 10px',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <i className="ti ti-check" style={{ fontSize: 10, color: '#aaa' }} />{h}
                    </span>
                  ))}
                </div>
              </div>
              {!mode.comingSoon && (
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: '#111',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
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

// ─── CRITERIA SCREEN ─────────────────────────────────────────────────────────

function CriteriaScreen({
  templateId, userId, agentName, onBack, onGenerate,
}: {
  templateId: string
  userId: string
  agentName: string
  onBack: () => void
  onGenerate: (criteria: string[]) => void
}) {
  const criteria = CRITERIA_BY_TEMPLATE[templateId] || CRITERIA_BY_TEMPLATE['booking-with-lm']
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED)
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  function toggle(label: string) {
    setSelected(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : prev.length < 5 ? [...prev, label] : prev
    )
  }

  async function handleGenerate() {
    if (selected.length === 0) return
    setLoading(true)
    onGenerate(selected)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 24px', maxWidth: 620, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: '#aaa', fontFamily: 'inherit', fontWeight: 500,
          marginBottom: 28, padding: 0, transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#111'}
        onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
        Back
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32, width: '100%' }}>
        <CampBadge />
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 8 }}>
          Pick your battle scenarios
        </h2>
        <p style={{ fontSize: 13.5, color: '#999', lineHeight: 1.6 }}>
          Choose up to 5 situations to test {agentName} on. We'll generate a real lead persona for each one.
        </p>
      </div>

      {/* Counter */}
      <div style={{
        alignSelf: 'flex-end', marginBottom: 14,
        fontSize: 12, fontWeight: 600, color: selected.length === 5 ? '#b37700' : '#bbb',
      }}>
        {selected.length}/5 selected
      </div>

      {/* Criteria grid */}
      <div style={{
        width: '100%', display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 28,
      }}>
        {criteria.map((c, i) => {
          const isSelected = selected.includes(c.label)
          const isDisabled = !isSelected && selected.length >= 5
          return (
            <div
              key={i}
              onClick={() => { if (!isDisabled) toggle(c.label) }}
              style={{
                borderRadius: 14, padding: '14px 16px',
                background: isSelected ? 'rgba(255,170,0,0.07)' : 'rgba(255,255,255,0.6)',
                border: isSelected ? '1.5px solid rgba(255,170,0,0.35)' : '0.5px solid rgba(0,0,0,0.07)',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
                transition: 'all 0.15s',
                animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                position: 'relative' as const,
              }}
              onMouseEnter={e => { if (!isDisabled && !isSelected) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)' }}
            >
              {/* Checkmark */}
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#b37700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className="ti ti-check" style={{ fontSize: 10, color: '#fff' }} />
                </div>
              )}
              <div style={{ width: 32, height: 32, borderRadius: 9, marginBottom: 10, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className={`ti ${c.icon}`} style={{ fontSize: 16, color: '#555' }} /></div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3 }}>{c.label}</p>
              <p style={{ fontSize: 11.5, color: '#999', lineHeight: 1.5 }}>{c.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={selected.length === 0 || loading}
        style={{
          width: '100%', padding: '14px', borderRadius: 13,
          background: selected.length === 0 ? 'rgba(0,0,0,0.06)' : '#111',
          color: selected.length === 0 ? '#bbb' : '#fff',
          border: 'none', fontSize: 14, fontWeight: 700,
          cursor: selected.length === 0 || loading ? 'default' : 'pointer',
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (selected.length > 0 && !loading) { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(1.02)' } }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
      >
        {loading ? (
          <>
            <i className="ti ti-loader-2" style={{ fontSize: 15, animation: 'spin 1s linear infinite' }} />
            Generating your leads...
          </>
        ) : (
          <>
            Generate {selected.length > 0 ? selected.length : ''} lead persona{selected.length !== 1 ? 's' : ''}
            <i className="ti ti-arrow-right" style={{ fontSize: 15 }} />
          </>
        )}
      </button>
    </div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function TrainingCamp({ userId, templateId, agentName }: Props) {
  const [screen, setScreen] = useState<Screen | null>(null)
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [personas, setPersonas] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function checkIntro() {
      const { data } = await supabase
        .from('training_camp_state')
        .select('intro_seen')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .maybeSingle()
      setScreen(data?.intro_seen ? 'choose' : 'intro')
    }
    checkIntro()
  }, [userId, templateId])

  async function handleUnderstood() {
    await supabase
      .from('training_camp_state')
      .upsert({ user_id: userId, template_id: templateId, intro_seen: true }, { onConflict: 'user_id,template_id' })
    setScreen('choose')
  }

  async function handleGenerate(criteria: string[]) {
    setGenerating(true)
    setSelectedCriteria(criteria)
    try {
      const res = await fetch(PERSONAS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, template_id: templateId, criteria }),
      })
      const data = await res.json()
      setPersonas(data.personas || [])
      setScreen('personas')
    } catch {
      alert('Failed to generate personas. Check n8n.')
    } finally {
      setGenerating(false)
    }
  }

  if (!screen) return (
    <div style={{ padding: '80px 40px', textAlign: 'center', color: '#ccc' }}>
      <i className="ti ti-loader-2" style={{ fontSize: 24, animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
      {screen === 'intro' && <IntroScreen onUnderstood={handleUnderstood} />}
      {screen === 'choose' && <ChooseScreen agentName={agentName} onFunTesting={() => setScreen('criteria')} />}
      {screen === 'criteria' && (
        <CriteriaScreen
          templateId={templateId}
          userId={userId}
          agentName={agentName}
          onBack={() => setScreen('choose')}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  )
}
