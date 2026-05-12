import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  onComplete: () => void
}

interface FunnelStep {
  id: string
  type: string
  label: string
  icon: string
}

const STEP_TYPES = [
  { type: 'ad', label: 'Paid Ad', icon: 'ti-ad-2', color: '#f59e0b' },
  { type: 'organic', label: 'Organic Post', icon: 'ti-brand-instagram', color: '#ec4899' },
  { type: 'landing', label: 'Landing Page', icon: 'ti-browser', color: '#3b82f6' },
  { type: 'whatsapp', label: 'WhatsApp Agent', icon: 'ti-brand-whatsapp', color: '#25D366' },
  { type: 'email', label: 'Email', icon: 'ti-mail', color: '#6366f1' },
  { type: 'call', label: 'Sales Call', icon: 'ti-phone', color: '#7c4dcc' },
  { type: 'close', label: 'Close / Sale', icon: 'ti-trophy', color: '#f59e0b' },
  { type: 'followup', label: 'Follow Up', icon: 'ti-refresh', color: '#14b8a6' },
]

const PRESET_FUNNELS = [
  {
    id: 'ads-wp-call',
    label: 'Ads → WhatsApp → Call',
    desc: 'Most common for coaches & consultants running paid traffic.',
    steps: ['ad', 'whatsapp', 'call', 'close'],
  },
  {
    id: 'ads-lp-wp-call',
    label: 'Ads → Landing Page → WhatsApp → Call',
    desc: 'Warm up leads on a landing page before the agent qualifies them.',
    steps: ['ad', 'landing', 'whatsapp', 'call', 'close'],
  },
  {
    id: 'organic-wp-call',
    label: 'Organic → WhatsApp → Call',
    desc: 'Content-driven lead generation straight into WhatsApp.',
    steps: ['organic', 'whatsapp', 'call', 'close'],
  },
  {
    id: 'custom',
    label: 'Build my own',
    desc: 'Drag and drop your exact process step by step.',
    steps: [],
  },
]

function uid() { return Math.random().toString(36).slice(2, 8) }

function StepBlock({ step, onRemove, index, total }: {
  step: FunnelStep; onRemove: () => void; index: number; total: number
}) {
  const def = STEP_TYPES.find(s => s.type === step.type)!
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <div style={{
        background: 'rgba(255,255,255,0.8)',
        border: '0.5px solid rgba(0,0,0,0.10)',
        borderRadius: 14, padding: '14px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        minWidth: 160, position: 'relative',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: def.color + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <i className={`ti ${def.icon}`} style={{ fontSize: 18, color: def.color }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{step.label}</div>
          <div style={{ fontSize: 11, color: '#aaa' }}>Step {index + 1}</div>
        </div>
        <button onClick={onRemove} style={{
          position: 'absolute', top: 8, right: 8,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#ccc', fontSize: 14, padding: 2, lineHeight: 1,
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#ccc')}
        >
          <i className="ti ti-x" />
        </button>
      </div>
      {index < total - 1 && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 6px' }}>
          <div style={{ width: 24, height: 1, background: 'rgba(0,0,0,0.15)' }} />
          <i className="ti ti-chevron-right" style={{ fontSize: 14, color: '#ccc', marginLeft: -2 }} />
        </div>
      )}
    </div>
  )
}

export default function SalesProcess({ onComplete }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([])
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [landingUrl, setLandingUrl] = useState('')
  const [adLinks, setAdLinks] = useState('')
  const [saving, setSaving] = useState(false)
  const [phase, setPhase] = useState<'preset' | 'build'>('preset')

  function selectPreset(p: typeof PRESET_FUNNELS[0]) {
    setSelectedPreset(p.id)
    if (p.id === 'custom') {
      setFunnelSteps([])
    } else {
      setFunnelSteps(p.steps.map(type => ({
        id: uid(),
        type,
        label: STEP_TYPES.find(s => s.type === type)!.label,
        icon: STEP_TYPES.find(s => s.type === type)!.icon,
      })))
    }
    setPhase('build')
  }

  function addStep(type: string) {
    const def = STEP_TYPES.find(s => s.type === type)!
    setFunnelSteps(s => [...s, { id: uid(), type, label: def.label, icon: def.icon }])
  }

  function removeStep(id: string) {
    setFunnelSteps(s => s.filter(x => x.id !== id))
  }

  async function handleSave() {
    if (funnelSteps.length < 2) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    await supabase.from('sales_process').upsert({
      user_id: user.id,
      steps: funnelSteps.map(s => ({ type: s.type, label: s.label })),
      website_url: websiteUrl || null,
      landing_page_url: landingUrl || null,
      ad_links: adLinks ? adLinks.split('\n').filter(Boolean) : [],
      completed: true,
    }, { onConflict: 'user_id' })

    setSaving(false)
    onComplete()
  }

  return (
    <div style={{ minHeight: '100vh', padding: '48px 40px 80px', maxWidth: 900, margin: '0 auto', fontFamily: 'inherit' }}>
      <style>{`@keyframes sp-up { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 48, animation: 'sp-up 0.4s ease both' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(124,77,204,0.08)', border: '0.5px solid rgba(124,77,204,0.22)',
          borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 500, color: '#7c4dcc',
          marginBottom: 18,
        }}>
          <i className="ti ti-sitemap" style={{ fontSize: 13 }} />
          Sales Process
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', letterSpacing: '-0.03em', marginBottom: 10 }}>
          Show us your sales process
        </h1>
        <p style={{ fontSize: 14.5, color: '#888', lineHeight: 1.65, maxWidth: 520 }}>
          This helps your AI agent understand exactly where it sits in your funnel — so every message it sends moves the lead to the next step.
        </p>
      </div>

      {/* Phase: preset selection */}
      {phase === 'preset' && (
        <div style={{ animation: 'sp-up 0.4s ease 0.1s both' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 16 }}>
            Choose your funnel or build your own
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {PRESET_FUNNELS.map((p, i) => (
              <div
                key={p.id}
                onClick={() => selectPreset(p)}
                className="glass"
                style={{
                  borderRadius: 18, padding: '22px 20px', cursor: 'pointer',
                  transition: 'all 0.2s', animation: `sp-up 0.4s ease ${0.1 + i * 0.07}s both`,
                  border: '0.5px solid rgba(255,255,255,0.9)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.10)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,77,204,0.25)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = ''
                  ;(e.currentTarget as HTMLElement).style.boxShadow = ''
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.9)'
                }}
              >
                {p.id === 'custom' ? (
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <i className="ti ti-pencil" style={{ fontSize: 18, color: '#555' }} />
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                    {p.steps.map((type, idx) => {
                      const def = STEP_TYPES.find(s => s.type === type)!
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: def.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className={`ti ${def.icon}`} style={{ fontSize: 14, color: def.color }} />
                          </div>
                          {idx < p.steps.length - 1 && <i className="ti ti-chevron-right" style={{ fontSize: 11, color: '#ccc' }} />}
                        </div>
                      )
                    })}
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 5 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.55 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase: build */}
      {phase === 'build' && (
        <div style={{ animation: 'sp-up 0.35s ease both' }}>
          <button onClick={() => setPhase('preset')} style={{
            display: 'flex', alignItems: 'center', gap: 6, color: '#999', fontSize: 13,
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            padding: 0, marginBottom: 32,
          }}>
            <i className="ti ti-arrow-left" style={{ fontSize: 15 }} /> Change template
          </button>

          {/* Funnel visualizer */}
          <div className="glass" style={{ borderRadius: 20, padding: '28px 24px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 20 }}>Your funnel</div>
            {funnelSteps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#ccc' }}>
                <i className="ti ti-sitemap" style={{ fontSize: 32, display: 'block', marginBottom: 10 }} />
                <div style={{ fontSize: 13 }}>Add steps below to build your funnel</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0 }}>
                {funnelSteps.map((s, i) => (
                  <StepBlock key={s.id} step={s} index={i} total={funnelSteps.length} onRemove={() => removeStep(s.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Add steps */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#aaa', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Add a step</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {STEP_TYPES.map(s => (
                <button key={s.type} onClick={() => addStep(s.type)} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px', borderRadius: 100, fontSize: 12.5, fontWeight: 500,
                  fontFamily: 'inherit', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(0,0,0,0.1)',
                  color: '#444', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = s.color + '12'
                    ;(e.currentTarget as HTMLElement).style.borderColor = s.color + '40'
                    ;(e.currentTarget as HTMLElement).style.color = s.color
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.1)'
                    ;(e.currentTarget as HTMLElement).style.color = '#444'
                  }}
                >
                  <i className={`ti ${s.icon}`} style={{ fontSize: 14 }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Links section */}
          <div className="glass" style={{ borderRadius: 20, padding: '24px', marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 18 }}>Your assets (optional)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Website URL', placeholder: 'https://yourwebsite.com', val: websiteUrl, set: setWebsiteUrl },
                { label: 'Landing Page URL', placeholder: 'https://yourlandingpage.com', val: landingUrl, set: setLandingUrl },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input type="url" placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.8)', border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 6 }}>Ad links <span style={{ color: '#bbb', fontWeight: 400 }}>(one per line)</span></label>
                <textarea placeholder={'https://facebook.com/ads/...\nhttps://tiktok.com/...'} value={adLinks} onChange={e => setAdLinks(e.target.value)} rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.8)', border: '0.5px solid rgba(0,0,0,0.12)', fontSize: 13, color: '#111', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {funnelSteps.length < 2 && (
            <div style={{ fontSize: 12.5, color: '#f59e0b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 14 }} />
              Add at least 2 steps to continue
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={funnelSteps.length < 2 || saving}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: '#111', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
              cursor: funnelSteps.length >= 2 ? 'pointer' : 'not-allowed',
              opacity: funnelSteps.length >= 2 && !saving ? 1 : 0.4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.15s',
            }}
          >
            <i className="ti ti-check" style={{ fontSize: 16 }} />
            {saving ? 'Saving…' : 'Save & unlock my templates'}
          </button>
        </div>
      )}
    </div>
  )
}
