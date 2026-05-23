import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface Persona {
  name: string
  age: number
  source: string
  personality: string
  criteria: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  briefing: string
  tested?: boolean
  session_id?: string
  score?: number
  analysis?: string
  judged?: boolean
}

interface Props {
  userId: string
  templateId: string
  agentName: string
}

type Screen = 'intro' | 'choose' | 'criteria' | 'personas' | 'briefing' | 'chat'

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
const JUDGE_WEBHOOK = 'https://leadflowai2026.app.n8n.cloud/webhook/30ab772b-a6d5-4894-b1e3-6816f9154f63'

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

// ─── PERSONAS SCREEN ─────────────────────────────────────────────────────────

function PersonasScreen({
  personas, agentName, onBack, onSelectPersona, onRegenerate, onJudge,
}: {
  personas: Persona[]
  agentName: string
  onBack: () => void
  onSelectPersona: (persona: Persona) => void
  onRegenerate: () => void
  onJudge: (persona: Persona) => void
}) {
  const [visible, setVisible] = useState(false)
  const [judgingName, setJudgingName] = useState<string | null>(null)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const difficultyStyle: Record<string, { bg: string; color: string }> = {
    Easy: { bg: 'rgba(37,211,102,0.09)', color: '#1a8c4e' },
    Medium: { bg: 'rgba(255,170,0,0.09)', color: '#b37700' },
    Hard: { bg: 'rgba(220,50,50,0.09)', color: '#c0392b' },
  }

  async function handleJudge(p: Persona) {
    setJudgingName(p.name)
    await onJudge(p)
    setJudgingName(null)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 24px', maxWidth: 680, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      {/* Create new personas button */}
      <button
        onClick={onRegenerate}
        style={{
          alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: '#aaa', fontFamily: 'inherit', fontWeight: 500,
          marginBottom: 28, padding: 0, transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#111'}
        onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
      >
        <i className="ti ti-plus" style={{ fontSize: 14 }} />
        Create new personas
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32, width: '100%' }}>
        <CampBadge />
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 8 }}>
          Choose your lead
        </h2>
        <p style={{ fontSize: 13.5, color: '#999', lineHeight: 1.6 }}>
          Pick one persona to test {agentName} against. Each one will challenge a different scenario.
        </p>
      </div>

      {/* Persona grid */}
      <div style={{
        width: '100%', display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
      }}>
        {personas.map((p, i) => {
          const diff = difficultyStyle[p.difficulty] || difficultyStyle.Medium
          const isTested = !!p.tested
          const isJudged = !!p.judged
          const isJudging = judgingName === p.name

          return (
            <div
              key={i}
              style={{
                borderRadius: 16, padding: '18px 20px',
                background: isTested ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)',
                border: isTested ? '0.5px solid rgba(0,0,0,0.1)' : '0.5px solid rgba(0,0,0,0.07)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                cursor: isTested ? 'default' : 'pointer',
              }}
              onClick={() => !isTested && onSelectPersona(p)}
              onMouseEnter={e => { if (!isTested) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: isTested ? 'rgba(37,211,102,0.1)' : 'rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={`ti ${isTested ? 'ti-check' : 'ti-user'}`} style={{ fontSize: 17, color: isTested ? '#1a8c4e' : '#888' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{p.name}</p>
                    <p style={{ fontSize: 11.5, color: '#aaa' }}>{p.age} · {p.source}</p>
                  </div>
                </div>
                {/* Difficulty badge */}
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100,
                  background: diff.bg, color: diff.color,
                  letterSpacing: '0.04em', textTransform: 'uppercase' as const, flexShrink: 0,
                }}>
                  {p.difficulty}
                </span>
              </div>

              {/* Criteria tag */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(0,0,0,0.04)', borderRadius: 100,
                padding: '4px 10px', marginBottom: 10,
              }}>
                <i className="ti ti-target" style={{ fontSize: 10, color: '#888' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#777' }}>{p.criteria}</span>
              </div>

              {/* Personality */}
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.5, marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: '#555' }}>{p.personality}</span> — {p.briefing.slice(0, 70)}...
              </p>

              {/* Score (if judged) */}
              {isJudged && p.score !== undefined && (
                <div style={{
                  background: 'rgba(0,0,0,0.03)', borderRadius: 10,
                  padding: '10px 12px', marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Judge Score</span>
                    <span style={{
                      fontSize: 15, fontWeight: 800,
                      color: p.score >= 75 ? '#1a8c4e' : p.score >= 50 ? '#b37700' : '#c0392b'
                    }}>
                      {p.score}/100
                    </span>
                  </div>
                  {p.analysis && (
                    <p style={{ fontSize: 11, color: '#888', lineHeight: 1.5, margin: 0 }}>
                      {p.analysis.slice(0, 100)}...
                    </p>
                  )}
                </div>
              )}

              {/* CTA */}
              {!isTested ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#111' }}>
                  <i className="ti ti-player-play" style={{ fontSize: 12 }} />
                  Play this lead
                </div>
              ) : !isJudged ? (
                <button
                  onClick={e => { e.stopPropagation(); handleJudge(p) }}
                  disabled={isJudging}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: isJudging ? 'rgba(0,0,0,0.04)' : 'rgba(255,170,0,0.1)',
                    border: '0.5px solid rgba(255,170,0,0.3)',
                    borderRadius: 8, padding: '7px 12px',
                    fontSize: 12, fontWeight: 700, color: isJudging ? '#aaa' : '#b37700',
                    cursor: isJudging ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', width: '100%', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {isJudging
                    ? <><i className="ti ti-loader-2" style={{ fontSize: 13, animation: 'spin 1s linear infinite' }} /> Judging...</>
                    : <><i className="ti ti-gavel" style={{ fontSize: 13 }} /> Judge this session</>
                  }
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#1a8c4e' }}>
                  <i className="ti ti-circle-check" style={{ fontSize: 13 }} />
                  Judged
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


// ─── BRIEFING SCREEN ─────────────────────────────────────────────────────────

function BriefingScreen({ persona, agentName, onStart, onBack }: {
  persona: Persona; agentName: string; onStart: () => void; onBack: () => void
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const diffColors: Record<string, { color: string; bg: string }> = {
    Easy: { color: '#1a8c4e', bg: 'rgba(37,211,102,0.09)' },
    Medium: { color: '#a36200', bg: 'rgba(255,170,0,0.10)' },
    Hard: { color: '#c0392b', bg: 'rgba(231,76,60,0.10)' },
  }
  const diff = diffColors[persona.difficulty] || diffColors.Medium

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '40px 24px', maxWidth: 560, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      {/* Back */}
      <button onClick={onBack} style={{
        alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 5,
        background: 'none', border: 'none', cursor: 'pointer', fontSize: 13,
        fontWeight: 600, color: '#aaa', padding: '0 0 28px', fontFamily: 'inherit',
        transition: 'color 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#111'}
        onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
        Back
      </button>

      {/* Header badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 100, padding: '5px 14px', marginBottom: 28,
      }}>
        <i className="ti ti-id-badge-2" style={{ fontSize: 13, color: '#888' }} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
          Your Briefing
        </span>
      </div>

      {/* Persona identity card */}
      <div style={{
        width: '100%', borderRadius: 20, padding: '28px 28px 24px',
        background: 'rgba(255,255,255,0.8)', border: '0.5px solid rgba(0,0,0,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.06)', marginBottom: 16,
      }}>
        {/* Top: avatar + name + diff */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(0,0,0,0.06)', border: '0.5px solid rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ti ti-user" style={{ fontSize: 22, color: '#888' }} />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: '-0.03em' }}>
                You are {persona.name}
              </p>
              <p style={{ fontSize: 12.5, color: '#aaa', marginTop: 2 }}>
                {persona.age} years old · from {persona.source}
              </p>
            </div>
          </div>
          <span style={{
            fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 100,
            background: diff.bg, color: diff.color,
            letterSpacing: '0.05em', textTransform: 'uppercase' as const,
          }}>
            {persona.difficulty}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: 0.5, background: 'rgba(0,0,0,0.06)', marginBottom: 20 }} />

        {/* Personality */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>
            Your personality
          </p>
          <p style={{ fontSize: 13.5, fontWeight: 600, color: '#444' }}>{persona.personality}</p>
        </div>

        {/* Scenario */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>
            Scenario to test
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,0.04)', borderRadius: 100, padding: '5px 12px',
          }}>
            <i className="ti ti-target" style={{ fontSize: 11, color: '#777' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{persona.criteria}</span>
          </div>
        </div>

        {/* Briefing */}
        <div>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>
            How to act
          </p>
          <p style={{ fontSize: 13.5, color: '#555', lineHeight: 1.7 }}>{persona.briefing}</p>
        </div>
      </div>

      {/* Tip box */}
      <div style={{
        width: '100%', borderRadius: 14, padding: '14px 18px',
        background: 'rgba(255,170,0,0.06)', border: '0.5px solid rgba(255,170,0,0.15)',
        display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24,
      }}>
        <i className="ti ti-bulb" style={{ fontSize: 16, color: '#b37700', marginTop: 1 }} />
        <p style={{ fontSize: 12.5, color: '#a36200', lineHeight: 1.6 }}>
          Stay in character. The more realistic you act, the more valuable the test will be for your agent.
        </p>
      </div>

      {/* Start button */}
      <button onClick={onStart} style={{
        width: '100%', padding: '15px', borderRadius: 14,
        background: '#111', color: '#fff', border: 'none',
        fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'opacity 0.15s, transform 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(1.01)' }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
      >
        <i className="ti ti-player-play" style={{ fontSize: 15 }} />
        Start chat as {persona.name}
      </button>
    </div>
  )
}

// ─── CHAT SCREEN ─────────────────────────────────────────────────────────────

const FUN_CHAT_WEBHOOK = 'https://leadflowai2026.app.n8n.cloud/webhook/1e571318-78c8-4f64-9b7a-d21ee69e9ca3'

interface Message {
  role: 'user' | 'agent'
  text: string
}

function ChatScreen({ persona, userId, templateId, agentName, sessionId, onEnd }: {
  persona: Persona; userId: string; templateId: string; agentName: string; sessionId: string; onEnd: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // ─── LOAD CHAT HISTORY FROM SUPABASE ──────────────────────────────────
  useEffect(() => {
    if (!sessionId) return
    async function loadHistory() {
      const { data } = await supabase
        .from('training_camp_chat_memory')
        .select('role, message')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      if (data && data.length > 0) {
        setMessages(data.map(m => ({ role: m.role as 'user' | 'agent', text: m.message })))
      }
    }
    loadHistory()
  }, [sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Message = { role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Persist user message
    await supabase.from('training_camp_chat_memory').insert({
      session_id: sessionId, role: 'user', message: text,
    })

    try {
      const res = await fetch(FUN_CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          template_id: templateId,
          session_id: sessionId,
          message: text,
          persona_name: persona.name,
          persona_briefing: persona.briefing,
          persona_criteria: persona.criteria,
        }),
      })
      const data = await res.json()
      const agentText = data.reply || data.message || data.text || ''

      // Persist agent reply
      await supabase.from('training_camp_chat_memory').insert({
        session_id: sessionId, role: 'agent', message: agentText,
      })

      if (data.is_conversation_complete === true || data.is_conversation_complete === 'true') {
        setMessages(prev => [...prev, { role: 'agent', text: agentText }])
        setLoading(false)
        setTimeout(() => onEnd(), 1500)
        return
      }

      setMessages(prev => [...prev, { role: 'agent', text: agentText }])
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: '⚠️ Connection error. Check n8n.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 680, minHeight: 480 }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '0.5px solid rgba(0,0,0,0.07)',
        background: 'rgba(255,255,255,0.7)', flexShrink: 0,
      }}>
        {/* Persona info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.06)', border: '0.5px solid rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <i className="ti ti-user" style={{ fontSize: 16, color: '#888' }} />
          </div>
          <div>
            <p style={{ fontSize: 12.5, fontWeight: 700, color: '#111' }}>
              You are <span style={{ color: '#333' }}>{persona.name}</span>
            </p>
            <p style={{ fontSize: 11, color: '#bbb' }}>Testing: {persona.criteria}</p>
          </div>
        </div>

        {/* Agent indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(37,211,102,0.08)', border: '0.5px solid rgba(37,211,102,0.18)',
            borderRadius: 100, padding: '4px 12px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#25d366' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1a8c4e' }}>{agentName}</span>
          </div>

          {/* End session */}
          <button onClick={() => setShowEndConfirm(true)} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(231,76,60,0.06)', border: '0.5px solid rgba(231,76,60,0.15)',
            borderRadius: 100, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 11, fontWeight: 700, color: '#c0392b', transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <i className="ti ti-flag" style={{ fontSize: 11 }} />
            End session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 20px 8px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {messages.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '40px 20px', textAlign: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
            }}>
              <i className="ti ti-message" style={{ fontSize: 20, color: '#ccc' }} />
            </div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#bbb', marginBottom: 6 }}>
              You're {persona.name} now
            </p>
            <p style={{ fontSize: 12, color: '#ccc', lineHeight: 1.6, maxWidth: 280 }}>
              {persona.briefing.slice(0, 100)}...
            </p>
            <p style={{ fontSize: 11.5, color: '#ddd', marginTop: 10 }}>Send your first message to start</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            animation: 'fadeUp 0.2s ease both',
          }}>
            {msg.role === 'agent' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginRight: 8, marginTop: 4,
                background: 'rgba(37,211,102,0.1)', border: '0.5px solid rgba(37,211,102,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="ti ti-robot" style={{ fontSize: 13, color: '#1a8c4e' }} />
              </div>
            )}
            <div style={{
              maxWidth: '72%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? '#111' : 'rgba(255,255,255,0.9)',
              border: msg.role === 'user' ? 'none' : '0.5px solid rgba(0,0,0,0.07)',
              color: msg.role === 'user' ? '#fff' : '#222',
              fontSize: 13.5, lineHeight: 1.6,
              boxShadow: msg.role === 'agent' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(37,211,102,0.1)', border: '0.5px solid rgba(37,211,102,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ti ti-robot" style={{ fontSize: 13, color: '#1a8c4e' }} />
            </div>
            <div style={{
              padding: '10px 16px', borderRadius: '16px 16px 16px 4px',
              background: 'rgba(255,255,255,0.9)', border: '0.5px solid rgba(0,0,0,0.07)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {[0, 1, 2].map(dot => (
                <div key={dot} style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#ccc',
                  animation: `bounce 1.2s ease-in-out ${dot * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px', borderTop: '0.5px solid rgba(0,0,0,0.07)',
        background: 'rgba(255,255,255,0.7)', flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          background: 'rgba(255,255,255,0.9)', borderRadius: 16,
          border: '0.5px solid rgba(0,0,0,0.09)', padding: '10px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message as ${persona.name}...`}
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              fontSize: 13.5, color: '#111', background: 'transparent',
              fontFamily: 'inherit', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: !input.trim() || loading ? 'rgba(0,0,0,0.06)' : '#111',
              border: 'none', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            <i className="ti ti-send-2" style={{ fontSize: 15, color: !input.trim() || loading ? '#bbb' : '#fff' }} />
          </button>
        </div>
        <p style={{ fontSize: 10.5, color: '#ccc', textAlign: 'center', marginTop: 8 }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

      {/* End confirm modal */}
      {showEndConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999,
        }} onClick={() => setShowEndConfirm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, padding: '28px 28px 24px',
            maxWidth: 380, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '0.5px solid rgba(0,0,0,0.07)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(231,76,60,0.08)', border: '0.5px solid rgba(231,76,60,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <i className="ti ti-flag" style={{ fontSize: 20, color: '#c0392b' }} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: 8 }}>
              End this session?
            </p>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>
              You've exchanged {messages.length} messages as {persona.name}. Are you done testing this scenario?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowEndConfirm(false)} style={{
                flex: 1, padding: '12px', borderRadius: 12,
                background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 700, color: '#555', fontFamily: 'inherit',
              }}>
                Keep going
              </button>
              <button onClick={onEnd} style={{
                flex: 1, padding: '12px', borderRadius: 12,
                background: '#111', border: 'none', cursor: 'pointer',
                fontSize: 13.5, fontWeight: 700, color: '#fff', fontFamily: 'inherit',
              }}>
                End session
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function TrainingCamp({ userId, templateId, agentName }: Props) {
  const [screen, setScreen] = useState<Screen | null>(null)
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [personas, setPersonas] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [sessionId, setSessionId] = useState<string>('')

  // ─── LOAD ALL STATE FROM SUPABASE ON MOUNT ──────────────────────────────
  useEffect(() => {
    async function loadState() {
      const { data } = await supabase
        .from('training_camp_state')
        .select('intro_seen, current_screen, personas, selected_criteria, selected_persona')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .maybeSingle()

      if (!data) { setScreen('intro'); return }

      if (data.personas) setPersonas(data.personas)
      if (data.selected_criteria) setSelectedCriteria(data.selected_criteria)
      if (data.selected_persona) setSelectedPersona(data.selected_persona)

      // If personas exist, go straight to personas screen — skip criteria
      if (data.personas && data.personas.length > 0) {
        setScreen('personas')
        // If they were mid-chat, restore session_id from metadata
        if (data.current_screen === 'chat' && data.selected_persona) {
          const { data: meta } = await supabase
            .from('training_camp_testing_metadata')
            .select('session_id')
            .eq('user_id', userId)
            .eq('template_id', templateId)
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          if (meta?.session_id) setSessionId(meta.session_id)
          setScreen('chat')
        }
        return
      }

      const savedScreen = (data.current_screen as Screen) || (data.intro_seen ? 'choose' : 'intro')
      setScreen(savedScreen)
    }
    loadState()
  }, [userId, templateId])

  // ─── PERSIST SCREEN CHANGES ─────────────────────────────────────────────
  async function persistScreen(newScreen: Screen) {
    setScreen(newScreen)
    await supabase
      .from('training_camp_state')
      .upsert({ user_id: userId, template_id: templateId, current_screen: newScreen, intro_seen: true }, { onConflict: 'user_id,template_id' })
  }

  async function handleUnderstood() {
    await supabase
      .from('training_camp_state')
      .upsert({ user_id: userId, template_id: templateId, intro_seen: true, current_screen: 'choose' }, { onConflict: 'user_id,template_id' })
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
      const generated = data.personas || []
      setPersonas(generated)
      // Persist personas + criteria + new screen
      await supabase
        .from('training_camp_state')
        .upsert({
          user_id: userId, template_id: templateId,
          intro_seen: true, current_screen: 'personas',
          personas: generated, selected_criteria: criteria,
        }, { onConflict: 'user_id,template_id' })
      setScreen('personas')
    } catch {
      alert('Failed to generate personas. Check n8n.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSelectPersona(persona: Persona) {
    const newSessionId = `tc_${userId}_${Date.now()}`
    setSelectedPersona(persona)
    setSessionId(newSessionId)

    // Create metadata row linking session to user/persona
    await supabase.from('training_camp_testing_metadata').insert({
      user_id: userId, template_id: templateId,
      session_id: newSessionId,
      persona_name: persona.name,
      criteria: persona.criteria,
      difficulty: persona.difficulty,
    })

    await supabase
      .from('training_camp_state')
      .upsert({
        user_id: userId, template_id: templateId,
        intro_seen: true, current_screen: 'briefing',
        selected_persona: persona,
      }, { onConflict: 'user_id,template_id' })
    setScreen('briefing')
  }

  async function handleEndSession() {
    if (!selectedPersona || !sessionId) return

    // Mark persona as tested in the personas array
    const updatedPersonas = personas.map(p =>
      p.name === selectedPersona.name
        ? { ...p, tested: true, session_id: sessionId }
        : p
    )
    setPersonas(updatedPersonas)

    // Update metadata ended_at
    await supabase
      .from('training_camp_testing_metadata')
      .update({ ended_at: new Date().toISOString() })
      .eq('session_id', sessionId)

    // Persist updated personas + go back to personas screen
    await supabase
      .from('training_camp_state')
      .upsert({
        user_id: userId, template_id: templateId,
        intro_seen: true, current_screen: 'personas',
        personas: updatedPersonas,
        selected_persona: null,
      }, { onConflict: 'user_id,template_id' })

    setSelectedPersona(null)
    setScreen('personas')
  }

  async function handleStartChat() {
    await persistScreen('chat')
  }

  async function handleJudge(persona: Persona) {
    if (!persona.session_id) return

    // Get best scenario description from criteria list
    const criteriaInfo = (CRITERIA_BY_TEMPLATE[templateId] || [])
      .find(c => c.label === persona.criteria)
    const bestScenario = criteriaInfo?.desc || persona.criteria

    try {
      const res = await fetch(JUDGE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          template_id: templateId,
          session_id: persona.session_id,
          persona: {
            name: persona.name,
            age: persona.age,
            source: persona.source,
            personality: persona.personality,
            criteria: persona.criteria,
            difficulty: persona.difficulty,
            briefing: persona.briefing,
          },
          best_scenario: bestScenario,
          agent_name: agentName,
        }),
      })

      const data = await res.json()
      const score = data.score || 0
      const analysis = data.analysis || data.feedback || ''

      // Save to fun_testing_results
      await supabase.from('fun_testing_results').insert({
        user_id: userId,
        template_id: templateId,
        session_id: persona.session_id,
        persona_name: persona.name,
        criteria: persona.criteria,
        score,
        analysis,
      })

      // Update persona in state with score
      const updatedPersonas = personas.map(p =>
        p.name === persona.name
          ? { ...p, judged: true, score, analysis }
          : p
      )
      setPersonas(updatedPersonas)

      // Persist updated personas
      await supabase
        .from('training_camp_state')
        .upsert({
          user_id: userId, template_id: templateId,
          intro_seen: true, personas: updatedPersonas,
        }, { onConflict: 'user_id,template_id' })

    } catch {
      alert('Judge failed. Check n8n webhook.')
    }
  }

  async function handleRegenerate() {
    await persistScreen('criteria')
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
      {screen === 'choose' && <ChooseScreen agentName={agentName} onFunTesting={() => persistScreen('criteria')} />}
      {screen === 'personas' && (
        <PersonasScreen
          personas={personas}
          agentName={agentName}
          onBack={() => persistScreen('choose')}
          onSelectPersona={handleSelectPersona}
          onRegenerate={handleRegenerate}
          onJudge={handleJudge}
        />
      )}
      {screen === 'briefing' && selectedPersona && (
        <BriefingScreen
          persona={selectedPersona}
          agentName={agentName}
          onBack={() => persistScreen('personas')}
          onStart={handleStartChat}
        />
      )}
      {screen === 'chat' && selectedPersona && (
        <ChatScreen
          persona={selectedPersona}
          userId={userId}
          templateId={templateId}
          agentName={agentName}
          sessionId={sessionId}
          onEnd={handleEndSession}
        />
      )}
      {screen === 'criteria' && (
        <CriteriaScreen
          templateId={templateId}
          userId={userId}
          agentName={agentName}
          onBack={() => persistScreen('choose')}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  )
}
