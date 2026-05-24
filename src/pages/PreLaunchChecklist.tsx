import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type FieldStatus = 'not_started' | 'satisfied' | 'has_remarks'

type ChecklistData = {
  intro_seen: boolean
  workflow_unlocked: boolean
  script_flow: FieldStatus
  script_flow_remark: string | null
  off_topic: FieldStatus
  off_topic_remark: string | null
  question_handling: FieldStatus
  question_handling_remark: string | null
  objection_handling: FieldStatus
  objection_handling_remark: string | null
  hostile_lead: FieldStatus
  hostile_lead_remark: string | null
  closing: FieldStatus
  closing_remark: string | null
}

type FieldId = 'script_flow' | 'off_topic' | 'question_handling' | 'objection_handling' | 'hostile_lead' | 'closing'
type Screen = 'loading' | 'intro' | 'overview' | 'field' | 'chat' | 'result'

// ─── FIELD DEFINITIONS ────────────────────────────────────────────────────────

const FIELDS: {
  id: FieldId
  label: string
  icon: string
  tagline: string
  whatToLookFor: string[]
  scenario: string
}[] = [
  {
    id: 'script_flow',
    label: 'Script Flow & Sequence',
    icon: 'ti-list-numbers',
    tagline: 'Does the agent follow the script in order without skipping or rushing?',
    whatToLookFor: [
      'Agent completes each stage before moving to the next',
      'Does not jump to the close before discovery is done',
      'Does not skip steps when the lead is easy or agreeable',
      'Maintains the correct sequence under a normal, cooperative lead',
    ],
    scenario: 'Play a normal, cooperative lead. Go along with the conversation and see if the agent follows the script from start to finish without skipping stages.',
  },
  {
    id: 'off_topic',
    label: 'Off-Topic Recovery',
    icon: 'ti-arrows-shuffle',
    tagline: 'When the lead goes off-topic, does the agent acknowledge and steer back?',
    whatToLookFor: [
      'Agent acknowledges the off-topic message naturally',
      'Bridges back to the script without sounding robotic',
      'Does not get stuck in a side conversation',
      'Remembers where it was in the script after recovery',
    ],
    scenario: 'Start a normal conversation, then suddenly go off-topic — ask an unrelated question, change the subject, or say something random. See how the agent handles it and whether it comes back.',
  },
  {
    id: 'question_handling',
    label: 'Question Handling',
    icon: 'ti-help-circle',
    tagline: 'When the lead asks questions, does the agent answer and return to the script?',
    whatToLookFor: [
      'Answers the lead\'s question clearly and concisely',
      'Does not over-explain or go on tangents',
      'Immediately bridges back to the script after answering',
      'Does not lose its place in the conversation',
    ],
    scenario: 'Mid-conversation, ask the agent direct questions about the offer, the process, or the product. See if it answers well and gets back on track.',
  },
  {
    id: 'objection_handling',
    label: 'Objection Handling',
    icon: 'ti-shield',
    tagline: 'Does the agent handle objections with questions, not rebuttals, then return to the script?',
    whatToLookFor: [
      'Responds to objections with a question, not a defensive rebuttal',
      'Stays calm and does not get aggressive or submissive',
      'Gets back on the script after the objection is resolved',
      'Handles multiple objections in the same conversation',
    ],
    scenario: 'Throw 2-3 common objections during the conversation: "I need to think about it", "It\'s too expensive", "I already have someone", "Now is not a good time". See how it handles each one.',
  },
  {
    id: 'hostile_lead',
    label: 'Hostile Lead',
    icon: 'ti-mood-angry',
    tagline: 'Does the agent stay composed and on-script when the lead is rude or aggressive?',
    whatToLookFor: [
      'Stays polite and does not mirror the hostility',
      'De-escalates without being submissive or breaking character',
      'Does not abandon the script when under pressure',
      'Returns to the script once the situation is defused',
    ],
    scenario: 'Be rude, impatient, or aggressive. Say things like "Stop wasting my time", "This is ridiculous", or "I don\'t want to hear your pitch". See if the agent stays composed and professional.',
  },
  {
    id: 'closing',
    label: 'Closing Execution',
    icon: 'ti-flag',
    tagline: 'Does the agent ask for the commitment at the right moment and propose a clear next step?',
    whatToLookFor: [
      'Asks for commitment at the right point in the script, not too early or too late',
      'Uses soft, non-pushy closing language',
      'Proposes a clear next step — book a call, confirm appointment',
      'Does not hesitate or loop back unnecessarily before closing',
    ],
    scenario: 'Run through the full conversation cooperatively and pay attention to how and when the agent closes. Does it feel natural, timely, and clear?',
  },
]

const CHECKLIST_WEBHOOK = 'https://leadflowai2026.app.n8n.cloud/webhook/aa83d08b-9a28-45fc-b782-562f7ffac7b4'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function statusColor(s: FieldStatus) {
  if (s === 'satisfied') return '#1a8c4e'
  if (s === 'has_remarks') return '#b45309'
  return '#bbb'
}

function statusBg(s: FieldStatus) {
  if (s === 'satisfied') return 'rgba(37,211,102,0.08)'
  if (s === 'has_remarks') return 'rgba(245,158,11,0.08)'
  return 'rgba(0,0,0,0.04)'
}

function statusLabel(s: FieldStatus) {
  if (s === 'satisfied') return 'Satisfied'
  if (s === 'has_remarks') return 'Has Remarks'
  return 'Not Started'
}

function statusIcon(s: FieldStatus) {
  if (s === 'satisfied') return 'ti-circle-check'
  if (s === 'has_remarks') return 'ti-alert-circle'
  return 'ti-circle'
}

const DEFAULT_CHECKLIST: ChecklistData = {
  intro_seen: false,
  workflow_unlocked: false,
  script_flow: 'not_started',
  script_flow_remark: null,
  off_topic: 'not_started',
  off_topic_remark: null,
  question_handling: 'not_started',
  question_handling_remark: null,
  objection_handling: 'not_started',
  objection_handling_remark: null,
  hostile_lead: 'not_started',
  hostile_lead_remark: null,
  closing: 'not_started',
  closing_remark: null,
}

// ─── INTRO SCREEN ─────────────────────────────────────────────────────────────

function IntroScreen({ agentName, onUnderstood }: { agentName: string; onUnderstood: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 60) }, [])

  return (
    <div style={{
      maxWidth: 580, margin: '0 auto', padding: '40px 24px',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)',
      transition: 'opacity 0.45s ease, transform 0.45s ease',
    }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: 'rgba(0,0,0,0.05)', borderRadius: 100,
        padding: '6px 14px', fontSize: 12, fontWeight: 700,
        color: '#555', letterSpacing: '0.04em', marginBottom: 28,
        textTransform: 'uppercase' as const,
      }}>
        <i className="ti ti-clipboard-check" style={{ fontSize: 13 }} />
        Pre-Launch Checklist
      </div>

      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 12, lineHeight: 1.2 }}>
        Before {agentName} goes live,<br />let's make sure it's ready.
      </h2>
      <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7, marginBottom: 36 }}>
        This checklist walks you through 6 critical tests. For each one, you'll chat with your agent as a lead and validate it yourself. If something is off, leave a remark and we'll fix it.
      </p>

      {/* Fields list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
        {FIELDS.map((f, i) => (
          <div key={f.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px', borderRadius: 14,
            background: 'rgba(255,255,255,0.6)',
            border: '0.5px solid rgba(0,0,0,0.07)',
            animation: `fadeUp 0.35s ease ${i * 0.06}s both`,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`ti ${f.icon}`} style={{ fontSize: 17, color: '#555' }} />
            </div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111', marginBottom: 2 }}>{f.label}</p>
              <p style={{ fontSize: 12, color: '#999' }}>{f.tagline}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onUnderstood}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 14,
          background: '#111', color: '#fff',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <i className="ti ti-arrow-right" style={{ fontSize: 15 }} />
        Start Checklist
      </button>
    </div>
  )
}

// ─── OVERVIEW SCREEN ──────────────────────────────────────────────────────────

function OverviewScreen({
  checklist,
  onSelectField,
  onFinalConfirm,
}: {
  checklist: ChecklistData
  onSelectField: (id: FieldId) => void
  onFinalConfirm: () => void
}) {
  const allDone = FIELDS.every(f => checklist[f.id] !== 'not_started')
  const allSatisfied = FIELDS.every(f => checklist[f.id] === 'satisfied')
  const satisfiedCount = FIELDS.filter(f => checklist[f.id] === 'satisfied').length
  const remarkCount = FIELDS.filter(f => checklist[f.id] === 'has_remarks').length

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(0,0,0,0.05)', borderRadius: 100,
          padding: '6px 14px', fontSize: 12, fontWeight: 700,
          color: '#555', letterSpacing: '0.04em', marginBottom: 16,
          textTransform: 'uppercase' as const,
        }}>
          <i className="ti ti-clipboard-check" style={{ fontSize: 13 }} />
          Pre-Launch Checklist
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 4 }}>
              {satisfiedCount} of {FIELDS.length} fields validated
            </h2>
            <p style={{ fontSize: 13, color: '#999' }}>
              {remarkCount > 0 ? `${remarkCount} field${remarkCount > 1 ? 's' : ''} with remarks — we'll fix those` : 'Test each field below and validate your agent'}
            </p>
          </div>
          {/* Progress ring */}
          <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
            <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="3" />
              <circle
                cx="26" cy="26" r="21" fill="none"
                stroke={allSatisfied ? '#25D366' : '#111'}
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 21}`}
                strokeDashoffset={`${2 * Math.PI * 21 * (1 - satisfiedCount / FIELDS.length)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <span style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#111',
            }}>
              {Math.round((satisfiedCount / FIELDS.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Field cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {FIELDS.map((f, i) => {
          const status = checklist[f.id]
          const remark = checklist[`${f.id}_remark` as keyof ChecklistData] as string | null
          return (
            <div
              key={f.id}
              onClick={() => onSelectField(f.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 14,
                background: status === 'satisfied' ? 'rgba(37,211,102,0.04)' : status === 'has_remarks' ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.6)',
                border: `0.5px solid ${status === 'satisfied' ? 'rgba(37,211,102,0.2)' : status === 'has_remarks' ? 'rgba(245,158,11,0.2)' : 'rgba(0,0,0,0.07)'}`,
                cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                animation: `fadeUp 0.35s ease ${i * 0.05}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {/* Icon */}
              <div style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: statusBg(status),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={`ti ${f.icon}`} style={{ fontSize: 18, color: statusColor(status) }} />
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111', marginBottom: 2 }}>{f.label}</p>
                {remark && status === 'has_remarks' ? (
                  <p style={{ fontSize: 12, color: '#b45309', lineHeight: 1.4 }}>
                    <i className="ti ti-pencil" style={{ fontSize: 11, marginRight: 4 }} />
                    {remark.length > 60 ? remark.slice(0, 60) + '...' : remark}
                  </p>
                ) : (
                  <p style={{ fontSize: 12, color: '#bbb' }}>{f.tagline}</p>
                )}
              </div>

              {/* Status badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 100,
                background: statusBg(status),
                fontSize: 11, fontWeight: 700, color: statusColor(status),
                flexShrink: 0,
              }}>
                <i className={`ti ${statusIcon(status)}`} style={{ fontSize: 11 }} />
                {statusLabel(status)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Final confirm button */}
      {allDone && (
        <div style={{ animation: 'fadeUp 0.35s ease both' }}>
          {allSatisfied ? (
            <button
              onClick={onFinalConfirm}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14,
                background: '#111', color: '#fff',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <i className="ti ti-rocket" style={{ fontSize: 15 }} />
              Confirm & Unlock Full Workflow
            </button>
          ) : (
            <div style={{
              padding: '16px 20px', borderRadius: 14,
              background: 'rgba(245,158,11,0.07)',
              border: '0.5px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <i className="ti ti-clock" style={{ fontSize: 18, color: '#b45309', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>Remarks pending review</p>
                <p style={{ fontSize: 12, color: '#b45309', lineHeight: 1.5 }}>
                  We're working on the fixes. Fields with remarks will reset automatically once the prompt is updated.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── FIELD DETAIL SCREEN ─────────────────────────────────────────────────────

function FieldScreen({
  field,
  status,
  remark,
  onStartTest,
  onBack,
}: {
  field: typeof FIELDS[0]
  status: FieldStatus
  remark: string | null
  onStartTest: () => void
  onBack: () => void
}) {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: '#aaa', fontFamily: 'inherit', fontWeight: 500,
          marginBottom: 28, padding: 0, transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#111'}
        onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
        Back to checklist
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: 'rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`ti ${field.icon}`} style={{ fontSize: 22, color: '#555' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: 4 }}>
            {field.label}
          </h2>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 100,
            background: statusBg(status),
            fontSize: 11, fontWeight: 700, color: statusColor(status),
          }}>
            <i className={`ti ${statusIcon(status)}`} style={{ fontSize: 11 }} />
            {statusLabel(status)}
          </div>
        </div>
      </div>

      {/* What to look for */}
      <div style={{
        padding: '18px 20px', borderRadius: 14,
        background: 'rgba(0,0,0,0.03)',
        border: '0.5px solid rgba(0,0,0,0.07)',
        marginBottom: 16,
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 12 }}>
          What to look for
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {field.whatToLookFor.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <i className="ti ti-point-filled" style={{ fontSize: 8, color: '#bbb', marginTop: 5, flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario */}
      <div style={{
        padding: '18px 20px', borderRadius: 14,
        background: 'rgba(0,0,0,0.02)',
        border: '0.5px solid rgba(0,0,0,0.06)',
        marginBottom: 28,
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 10 }}>
          Your scenario
        </p>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65 }}>{field.scenario}</p>
      </div>

      {/* Remark if exists */}
      {status === 'has_remarks' && remark && (
        <div style={{
          padding: '14px 18px', borderRadius: 12,
          background: 'rgba(245,158,11,0.07)',
          border: '0.5px solid rgba(245,158,11,0.2)',
          marginBottom: 20,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <i className="ti ti-alert-circle" style={{ fontSize: 16, color: '#b45309', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>Your remark</p>
            <p style={{ fontSize: 12.5, color: '#b45309', lineHeight: 1.5 }}>{remark}</p>
          </div>
        </div>
      )}

      <button
        onClick={onStartTest}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 14,
          background: '#111', color: '#fff',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <i className="ti ti-message-circle" style={{ fontSize: 15 }} />
        Test {field.label}
      </button>
    </div>
  )
}

// ─── CHAT SCREEN ──────────────────────────────────────────────────────────────

interface ChatMessage { role: 'user' | 'agent'; text: string; ts: number }

function ChatScreen({
  field,
  userId,
  templateId,
  agentName,
  onEndTest,
}: {
  field: typeof FIELDS[0]
  userId: string
  templateId: string
  agentName: string
  onEndTest: () => void
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sessionId = `${userId}_${field.id}`

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: ChatMessage = { role: 'user', text, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(CHECKLIST_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      })
      const reply = (await res.text()).trim() || 'No response'
      setMessages(prev => [...prev, { role: 'agent', text: reply, ts: Date.now() }])
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: 'Connection error. Check n8n.', ts: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 560 }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0 14px',
        borderBottom: '0.5px solid rgba(0,0,0,0.07)',
        marginBottom: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className={`ti ${field.icon}`} style={{ fontSize: 15, color: '#555' }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{field.label}</p>
            <p style={{ fontSize: 11, color: '#bbb' }}>Testing {agentName}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Hint tooltip */}
          <div style={{ position: 'relative' }}>
            <button
              onMouseEnter={() => setShowHint(true)}
              onMouseLeave={() => setShowHint(false)}
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: showHint ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
            >
              <i className="ti ti-info-circle" style={{ fontSize: 16, color: '#888' }} />
            </button>
            {showHint && (
              <div style={{
                position: 'absolute', right: 0, top: 40, zIndex: 10,
                width: 280, padding: '14px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.97)',
                border: '0.5px solid rgba(0,0,0,0.1)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 8 }}>
                  What to look for
                </p>
                {field.whatToLookFor.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <i className="ti ti-point-filled" style={{ fontSize: 7, color: '#bbb', marginTop: 5, flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: '#555', lineHeight: 1.55 }}>{item}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* End test */}
          <button
            onClick={onEndTest}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 9,
              background: '#111', color: '#fff',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 12.5, fontWeight: 700,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <i className="ti ti-square-check" style={{ fontSize: 13 }} />
            End Test
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 0',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#ccc' }}>
            <i className="ti ti-message-circle" style={{ fontSize: 32, display: 'block', marginBottom: 10, opacity: 0.4 }} />
            <p style={{ fontSize: 13, fontWeight: 500, color: '#bbb' }}>Start the conversation as a lead</p>
            <p style={{ fontSize: 12, color: '#ccc', marginTop: 4 }}>{field.scenario.slice(0, 80)}...</p>
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
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(37,211,102,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginRight: 8, alignSelf: 'flex-end',
              }}>
                <i className="ti ti-robot" style={{ fontSize: 14, color: '#25D366' }} />
              </div>
            )}
            <div style={{
              maxWidth: '72%', padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user' ? '#111' : 'rgba(0,0,0,0.05)',
              color: msg.role === 'user' ? '#fff' : '#111',
              fontSize: 13.5, lineHeight: 1.55, fontWeight: 450,
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, animation: 'fadeUp 0.2s ease both' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(37,211,102,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <i className="ti ti-robot" style={{ fontSize: 14, color: '#25D366' }} />
            </div>
            <div style={{
              padding: '10px 16px', borderRadius: '14px 14px 14px 4px',
              background: 'rgba(0,0,0,0.05)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: '50%', background: '#999',
                  display: 'inline-block',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'flex-end',
        padding: '12px 0 0',
        borderTop: '0.5px solid rgba(0,0,0,0.07)',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type as a lead..."
          rows={1}
          style={{
            flex: 1, resize: 'none', padding: '10px 14px',
            borderRadius: 12, fontSize: 13.5, color: '#111',
            background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.1)',
            outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
            maxHeight: 120, overflowY: 'auto',
          }}
          onInput={e => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            background: input.trim() && !loading ? '#111' : 'rgba(0,0,0,0.08)',
            color: input.trim() && !loading ? '#fff' : '#ccc',
            border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <i className="ti ti-send" style={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  )
}

// ─── RESULT SCREEN ────────────────────────────────────────────────────────────

function ResultScreen({
  field,
  currentStatus,
  currentRemark,
  onSatisfied,
  onRemark,
  onBack,
}: {
  field: typeof FIELDS[0]
  currentStatus: FieldStatus
  currentRemark: string | null
  onSatisfied: () => void
  onRemark: (remark: string) => void
  onBack: () => void
}) {
  const [remark, setRemark] = useState(currentRemark || '')
  const [mode, setMode] = useState<'choose' | 'remark'>(
    currentStatus === 'has_remarks' ? 'remark' : 'choose'
  )
  const [saving, setSaving] = useState(false)

  async function submitRemark() {
    if (!remark.trim()) return
    setSaving(true)
    await onRemark(remark.trim())
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: '#aaa', fontFamily: 'inherit', fontWeight: 500,
          marginBottom: 28, padding: 0, transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#111'}
        onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 14 }} />
        Back to test
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: 'rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`ti ${field.icon}`} style={{ fontSize: 20, color: '#555' }} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: 2 }}>
            How did it go?
          </h2>
          <p style={{ fontSize: 12.5, color: '#999' }}>{field.label}</p>
        </div>
      </div>

      {mode === 'choose' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Satisfied */}
          <button
            onClick={onSatisfied}
            style={{
              width: '100%', padding: '18px 20px', borderRadius: 14,
              background: 'rgba(37,211,102,0.05)',
              border: '0.5px solid rgba(37,211,102,0.25)',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all 0.15s', textAlign: 'left' as const,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,211,102,0.05)'}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'rgba(37,211,102,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ti ti-circle-check" style={{ fontSize: 20, color: '#1a8c4e' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a8c4e', marginBottom: 2 }}>Satisfied</p>
              <p style={{ fontSize: 12, color: '#6b9e7a' }}>The agent passed this test. Move to the next field.</p>
            </div>
          </button>

          {/* Leave remark */}
          <button
            onClick={() => setMode('remark')}
            style={{
              width: '100%', padding: '18px 20px', borderRadius: 14,
              background: 'rgba(245,158,11,0.05)',
              border: '0.5px solid rgba(245,158,11,0.25)',
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all 0.15s', textAlign: 'left' as const,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.05)'}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'rgba(245,158,11,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ti ti-pencil" style={{ fontSize: 20, color: '#b45309' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#b45309', marginBottom: 2 }}>Leave a remark</p>
              <p style={{ fontSize: 12, color: '#c47a2a' }}>Something was off. Describe the issue and we'll fix it.</p>
            </div>
          </button>
        </div>
      )}

      {mode === 'remark' && (
        <div style={{ animation: 'fadeUp 0.25s ease both' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 10 }}>
            Describe what went wrong
          </p>
          <textarea
            value={remark}
            onChange={e => setRemark(e.target.value)}
            placeholder="e.g. The agent didn't come back to the script after handling the objection. It just stopped..."
            rows={4}
            style={{
              width: '100%', resize: 'none', padding: '12px 14px',
              borderRadius: 12, fontSize: 13.5, color: '#111',
              background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.1)',
              outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
              marginBottom: 12, boxSizing: 'border-box' as const,
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setMode('choose')}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 12,
                background: 'rgba(0,0,0,0.05)', color: '#555',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13.5, fontWeight: 600, transition: 'background 0.15s',
              }}
            >
              Cancel
            </button>
            <button
              onClick={submitRemark}
              disabled={!remark.trim() || saving}
              style={{
                flex: 2, padding: '12px 0', borderRadius: 12,
                background: remark.trim() && !saving ? '#111' : 'rgba(0,0,0,0.08)',
                color: remark.trim() && !saving ? '#fff' : '#ccc',
                border: 'none', cursor: remark.trim() && !saving ? 'pointer' : 'default',
                fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'all 0.15s',
              }}
            >
              {saving
                ? <><i className="ti ti-loader-2" style={{ fontSize: 14, animation: 'spin 1s linear infinite' }} /> Saving...</>
                : <><i className="ti ti-send" style={{ fontSize: 14 }} /> Submit Remark</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── UNLOCKED SCREEN ──────────────────────────────────────────────────────────

function UnlockedScreen() {
  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', padding: '60px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      animation: 'fadeUp 0.4s ease both',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(37,211,102,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
        border: '0.5px solid rgba(37,211,102,0.2)',
      }}>
        <i className="ti ti-rocket" style={{ fontSize: 32, color: '#25D366' }} />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 10 }}>
        Workflow unlocked
      </h2>
      <p style={{ fontSize: 14, color: '#888', lineHeight: 1.65, maxWidth: 340 }}>
        All 6 fields have been validated. Your Full Workflow tab is now active. Head there to complete your launch.
      </p>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

interface Props {
  userId: string
  templateId: string
  agentName: string
  onWorkflowUnlocked: () => void
}

export default function PreLaunchChecklist({ userId, templateId, agentName, onWorkflowUnlocked }: Props) {
  const [screen, setScreen] = useState<Screen>('loading')
  const [checklist, setChecklist] = useState<ChecklistData>(DEFAULT_CHECKLIST)
  const [activeField, setActiveField] = useState<FieldId | null>(null)

  // ─── LOAD FROM SUPABASE ────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('pre_launch_checklist')
        .select('*')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .maybeSingle()

      if (!data) {
        setScreen('intro')
        return
      }

      const cl: ChecklistData = {
        intro_seen: data.intro_seen ?? false,
        workflow_unlocked: data.workflow_unlocked ?? false,
        script_flow: data.script_flow ?? 'not_started',
        script_flow_remark: data.script_flow_remark ?? null,
        off_topic: data.off_topic ?? 'not_started',
        off_topic_remark: data.off_topic_remark ?? null,
        question_handling: data.question_handling ?? 'not_started',
        question_handling_remark: data.question_handling_remark ?? null,
        objection_handling: data.objection_handling ?? 'not_started',
        objection_handling_remark: data.objection_handling_remark ?? null,
        hostile_lead: data.hostile_lead ?? 'not_started',
        hostile_lead_remark: data.hostile_lead_remark ?? null,
        closing: data.closing ?? 'not_started',
        closing_remark: data.closing_remark ?? null,
      }
      setChecklist(cl)
      setScreen(cl.intro_seen ? 'overview' : 'intro')
    }
    load()
  }, [userId, templateId])

  // ─── PERSIST ──────────────────────────────────────────────────────────────
  async function persist(updates: Partial<ChecklistData>) {
    const merged = { ...checklist, ...updates }
    setChecklist(merged)
    await supabase
      .from('pre_launch_checklist')
      .upsert({
        user_id: userId,
        template_id: templateId,
        ...merged,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,template_id' })
  }

  // ─── HANDLERS ─────────────────────────────────────────────────────────────
  async function handleIntroUnderstood() {
    await persist({ intro_seen: true })
    setScreen('overview')
  }

  function handleSelectField(id: FieldId) {
    setActiveField(id)
    setScreen('field')
  }

  function handleStartTest() {
    setScreen('chat')
  }

  function handleEndTest() {
    setScreen('result')
  }

  async function handleSatisfied() {
    if (!activeField) return
    await persist({ [activeField]: 'satisfied', [`${activeField}_remark`]: null } as any)
    setScreen('overview')
    setActiveField(null)
  }

  async function handleRemark(remark: string) {
    if (!activeField) return
    await persist({ [activeField]: 'has_remarks', [`${activeField}_remark`]: remark } as any)
    setScreen('overview')
    setActiveField(null)
  }

  async function handleFinalConfirm() {
    await persist({ workflow_unlocked: true })
    onWorkflowUnlocked()
    setScreen('overview')
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  const currentField = activeField ? FIELDS.find(f => f.id === activeField)! : null

  if (screen === 'loading') return (
    <div style={{ padding: '80px 40px', textAlign: 'center', color: '#ccc' }}>
      <i className="ti ti-loader-2" style={{ fontSize: 24, animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
      `}</style>

      {screen === 'intro' && (
        <IntroScreen agentName={agentName} onUnderstood={handleIntroUnderstood} />
      )}
      {screen === 'overview' && (
        <OverviewScreen
          checklist={checklist}
          onSelectField={handleSelectField}
          onFinalConfirm={handleFinalConfirm}
        />
      )}
      {screen === 'field' && currentField && (
        <FieldScreen
          field={currentField}
          status={checklist[currentField.id]}
          remark={checklist[`${currentField.id}_remark` as keyof ChecklistData] as string | null}
          onStartTest={handleStartTest}
          onBack={() => { setScreen('overview'); setActiveField(null) }}
        />
      )}
      {screen === 'chat' && currentField && (
        <ChatScreen
          field={currentField}
          userId={userId}
          templateId={templateId}
          agentName={agentName}
          onEndTest={handleEndTest}
        />
      )}
      {screen === 'result' && currentField && (
        <ResultScreen
          field={currentField}
          currentStatus={checklist[currentField.id]}
          currentRemark={checklist[`${currentField.id}_remark` as keyof ChecklistData] as string | null}
          onSatisfied={handleSatisfied}
          onRemark={handleRemark}
          onBack={() => setScreen('chat')}
        />
      )}
    </div>
  )
}
