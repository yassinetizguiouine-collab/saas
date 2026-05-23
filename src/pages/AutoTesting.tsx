import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AUTO_TEST_WEBHOOK = 'https://leadflowai2026.app.n8n.cloud/webhook/auto-test-placeholder'

const CRITERIA_OPTIONS = [
  { id: 'price_objection', label: 'Price objection', icon: '💸', desc: 'Too expensive' },
  { id: 'im_busy', label: 'Im busy', icon: '⏰', desc: 'Not a good time right now' },
  { id: 'ill_think', label: 'Ill think about it', icon: '🤔', desc: 'Let me think and get back to you' },
  { id: 'talk_to_wife', label: 'Ill talk to my partner', icon: '👫', desc: 'Need to check with someone first' },
  { id: 'mad_client', label: 'Angry or frustrated lead', icon: '😤', desc: 'This is a waste of my time' },
  { id: 'not_interested', label: 'Not interested', icon: '🚫', desc: 'Im good, thanks' },
  { id: 'too_good', label: 'Too good to be true', icon: '🤨', desc: 'Sounds like a scam' },
  { id: 'already_tried', label: 'Already tried something similar', icon: '😞', desc: 'I tried before and it did not work' },
  { id: 'send_info', label: 'Send me more info', icon: '📩', desc: 'Just send me details first' },
  { id: 'not_right_time', label: 'Not the right time', icon: '📅', desc: 'Maybe later, not now' },
]

interface Props {
  userId: string
  templateId: string
  agentName: string
  onBack: () => void
}

// ─── BADGE ───────────────────────────────────────────────────────────────────

function CampBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: 'rgba(124,58,237,0.08)', border: '0.5px solid rgba(124,58,237,0.2)',
      borderRadius: 100, padding: '5px 14px', marginBottom: 20,
    }}>
      <span style={{ fontSize: 16 }}>⚡</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
        Auto Testing
      </span>
    </div>
  )
}

// ─── INTRO SCREEN ─────────────────────────────────────────────────────────────

function IntroScreen({ onUnderstood }: { onUnderstood: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  const steps = [
    { icon: 'ti-list-check', label: 'Pick your criteria', desc: 'Choose the objections and scenarios you want to stress-test' },
    { icon: 'ti-robot', label: 'AI simulates the leads', desc: 'We generate scenarios and run your agent against each one automatically' },
    { icon: 'ti-chart-bar', label: 'Get a full report card', desc: 'Every scenario is graded — see exactly where your agent excels or needs work' },
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px', maxWidth: 560, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <CampBadge />
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 12, textAlign: 'center' }}>
        How Auto Testing works
      </h2>
      <p style={{ fontSize: 14, color: '#999', lineHeight: 1.7, textAlign: 'center', marginBottom: 36 }}>
        No typing required. Pick your scenarios, sit back, and let us stress-test your agent end-to-end in minutes.
      </p>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            background: 'rgba(255,255,255,0.6)', border: '0.5px solid rgba(0,0,0,0.06)',
            borderRadius: 16, padding: '18px 20px',
            animation: `fadeUp 0.4s ease ${i * 0.1}s both`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(124,58,237,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className={`ti ${step.icon}`} style={{ fontSize: 18, color: '#7c3aed' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{step.label}</p>
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onUnderstood}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 14,
          background: '#111', border: 'none', cursor: 'pointer',
          fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'inherit',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Got it — let's go
      </button>
    </div>
  )
}

// ─── CRITERIA SCREEN ──────────────────────────────────────────────────────────

function CriteriaScreen({
  agentName,
  onStart,
  onBack,
}: {
  agentName: string
  onStart: (selected: string[]) => void
  onBack: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function handleStart() {
    if (selected.length === 0) return
    setLoading(true)
    await onStart(selected)
    setLoading(false)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px', maxWidth: 640, margin: '0 auto',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    }}>
      <CampBadge />
      <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 8, textAlign: 'center' }}>
        What should we test?
      </h2>
      <p style={{ fontSize: 13.5, color: '#999', lineHeight: 1.6, textAlign: 'center', marginBottom: 32 }}>
        Pick the scenarios you want {agentName} stress-tested on. We'll build one scenario per criteria.
      </p>

      {/* Select all / none */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 12 }}>
        <button onClick={() => setSelected(CRITERIA_OPTIONS.map(c => c.id))} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: '#7c3aed', fontFamily: 'inherit',
        }}>Select all</button>
        <button onClick={() => setSelected([])} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: '#aaa', fontFamily: 'inherit',
        }}>Clear</button>
      </div>

      {/* Criteria grid */}
      <div style={{
        width: '100%', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 10, marginBottom: 32,
      }}>
        {CRITERIA_OPTIONS.map((c, i) => {
          const isSelected = selected.includes(c.id)
          return (
            <div
              key={c.id}
              onClick={() => toggle(c.id)}
              style={{
                borderRadius: 14, padding: '14px 16px',
                background: isSelected ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.6)',
                border: `0.5px solid ${isSelected ? 'rgba(124,58,237,0.3)' : 'rgba(0,0,0,0.07)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 12,
                animation: `fadeUp 0.35s ease ${i * 0.03}s both`,
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)' }}
            >
              {/* Checkbox */}
              <div style={{
                width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${isSelected ? '#7c3aed' : '#ddd'}`,
                background: isSelected ? '#7c3aed' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {isSelected && <i className="ti ti-check" style={{ fontSize: 11, color: '#fff' }} />}
              </div>

              <span style={{ fontSize: 18, flexShrink: 0 }}>{c.icon}</span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111', marginBottom: 2 }}>{c.label}</p>
                <p style={{ fontSize: 11.5, color: '#aaa', lineHeight: 1.4 }}>{c.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ width: '100%', display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            padding: '13px 20px', borderRadius: 12,
            background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.08)',
            cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#666',
            fontFamily: 'inherit', transition: 'opacity 0.15s', flexShrink: 0,
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleStart}
          disabled={selected.length === 0 || loading}
          style={{
            flex: 1, padding: '13px 0', borderRadius: 12,
            background: selected.length === 0 ? 'rgba(0,0,0,0.06)' : '#111',
            border: 'none', cursor: selected.length === 0 ? 'default' : 'pointer',
            fontSize: 14, fontWeight: 700,
            color: selected.length === 0 ? '#aaa' : '#fff',
            fontFamily: 'inherit', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading
            ? <><i className="ti ti-loader-2" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }} /> Starting test...</>
            : <><i className="ti ti-bolt" style={{ fontSize: 16 }} /> Run {selected.length} scenario{selected.length !== 1 ? 's' : ''}</>
          }
        </button>
      </div>
      {selected.length > 0 && (
        <p style={{ fontSize: 12, color: '#bbb', marginTop: 12, textAlign: 'center' }}>
          {selected.length} scenario{selected.length !== 1 ? 's' : ''} selected · takes ~{Math.ceil(selected.length * 0.5)} min
        </p>
      )}
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function AutoTesting({ userId, templateId, agentName, onBack }: Props) {
  const [screen, setScreen] = useState<'loading' | 'intro' | 'criteria'>('loading')

  useEffect(() => {
    async function loadState() {
      const { data } = await supabase
        .from('training_camp_state')
        .select('auto_intro_seen')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .maybeSingle()

      if (data?.auto_intro_seen) {
        setScreen('criteria')
      } else {
        setScreen('intro')
      }
    }
    loadState()
  }, [userId, templateId])

  async function handleUnderstood() {
    await supabase
      .from('training_camp_state')
      .upsert(
        { user_id: userId, template_id: templateId, auto_intro_seen: true, intro_seen: true },
        { onConflict: 'user_id,template_id' }
      )
    setScreen('criteria')
  }

  async function handleStart(selectedCriteria: string[]) {
    // Create run row in Supabase
    const { data: run } = await supabase
      .from('auto_test_runs')
      .insert({
        user_id: userId,
        template_id: templateId,
        status: 'pending',
        current_phase: 'generating',
      })
      .select()
      .single()

    if (!run) return

    // Fire n8n webhook
    await fetch(AUTO_TEST_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        template_id: templateId,
        run_id: run.id,
        agent_name: agentName,
        selected_criteria: selectedCriteria,
      }),
    })

    // TODO: navigate to cinematic screen (next step)
    alert(`Auto test started! Run ID: ${run.id}`)
  }

  if (screen === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <i className="ti ti-loader-2" style={{ fontSize: 24, color: '#ddd', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {screen === 'intro' && <IntroScreen onUnderstood={handleUnderstood} />}
      {screen === 'criteria' && (
        <CriteriaScreen
          agentName={agentName}
          onStart={handleStart}
          onBack={onBack}
        />
      )}
    </>
  )
}
