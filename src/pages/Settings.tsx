import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.7)', borderRadius: 20,
      border: '0.5px solid rgba(0,0,0,0.07)',
      overflow: 'hidden', marginBottom: 16,
      animation: 'st-up 0.4s ease both',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '18px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'rgba(124,77,204,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`ti ${icon}`} style={{ fontSize: 16, color: '#7c4dcc' }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>{title}</span>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  )
}

// ─── ROW ──────────────────────────────────────────────────────────────────────

function Row({ label, value, masked }: { label: string; value: string; masked?: boolean }) {
  const [revealed, setRevealed] = useState(false)
  const display = masked && !revealed
    ? '•'.repeat(Math.min(value.length, 24))
    : value || '—'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '0.5px solid rgba(0,0,0,0.05)',
    }}>
      <span style={{ fontSize: 12.5, color: '#999', fontWeight: 500, minWidth: 160 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
        <span style={{
          fontSize: 13, color: value ? '#333' : '#ccc', fontWeight: 500,
          fontFamily: masked ? 'monospace' : 'inherit',
          maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {display}
        </span>
        {masked && value && (
          <button onClick={() => setRevealed(r => !r)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
            color: '#bbb', display: 'flex', alignItems: 'center', transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#777'}
            onMouseLeave={e => e.currentTarget.style.color = '#bbb'}
          >
            <i className={`ti ${revealed ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 14 }} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── PASSWORD CHANGE ─────────────────────────────────────────────────────────

function PasswordChange() {
  const [open, setOpen] = useState(false)
  const [newPass, setNewPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleChange() {
    if (newPass.length < 8) { setMsg({ type: 'error', text: 'Password must be at least 8 characters.' }); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPass })
    setLoading(false)
    if (error) { setMsg({ type: 'error', text: error.message }); return }
    setMsg({ type: 'success', text: 'Password updated.' })
    setNewPass('')
    setTimeout(() => { setOpen(false); setMsg(null) }, 1500)
  }

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{
          background: 'none', border: '0.5px solid rgba(0,0,0,0.12)',
          borderRadius: 9, padding: '8px 16px', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, color: '#555',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#111' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#555' }}
        >
          Change password
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340 }}>
          <input
            type="password" placeholder="New password (min 8 chars)"
            value={newPass} onChange={e => setNewPass(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 10, border: '0.5px solid rgba(0,0,0,0.12)',
              fontFamily: 'inherit', fontSize: 13, color: '#111', outline: 'none',
              background: 'rgba(255,255,255,0.8)',
            }}
          />
          {msg && (
            <div style={{ fontSize: 12.5, color: msg.type === 'success' ? '#1a8c4e' : '#dc2626', display: 'flex', alignItems: 'center', gap: 5 }}>
              <i className={`ti ${msg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} style={{ fontSize: 13 }} />
              {msg.text}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setOpen(false); setMsg(null); setNewPass('') }} style={{
              flex: 1, padding: '9px 0', borderRadius: 9,
              border: '0.5px solid rgba(0,0,0,0.1)', background: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, color: '#888', fontWeight: 600,
            }}>Cancel</button>
            <button onClick={handleChange} disabled={loading} style={{
              flex: 2, padding: '9px 0', borderRadius: 9, border: 'none',
              background: loading ? 'rgba(0,0,0,0.06)' : '#111',
              color: loading ? '#aaa' : '#fff',
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {loading && <i className="ti ti-loader-2" style={{ fontSize: 13, animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [onboarding, setOnboarding] = useState<any>(null)
  const [flowConfig, setFlowConfig] = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email || '')

      const [{ data: ob }, { data: fc }, { data: flows }] = await Promise.all([
        supabase.from('onboarding').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('flow_config').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('flows').select('template_id, template_title, status, created_at').eq('user_id', user.id),
      ])

      setOnboarding(ob)
      setFlowConfig(fc)
      setAgents(flows || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ padding: '80px 40px', textAlign: 'center', color: '#ccc' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes st-up { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <i className="ti ti-loader-2" style={{ fontSize: 28, animation: 'spin 1s linear infinite' }} />
    </div>
  )

  const goalLabel = onboarding?.goal_type === 'close-in-chat' ? 'Close in chat' : 'Get more bookings'
  const receiveData = flowConfig?.whatsapp_receive || {}
  const sendData = flowConfig?.whatsapp_send || {}

  return (
    <div style={{ padding: '48px 40px 80px', maxWidth: 700, margin: '0 auto', fontFamily: 'inherit' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes st-up { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 32, animation: 'st-up 0.4s ease both' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 6 }}>
          Settings
        </h1>
        <p style={{ fontSize: 14, color: '#aaa' }}>Your account and app details.</p>
      </div>

      {/* Account */}
      <Section title="Account" icon="ti-user">
        <Row label="Email" value={email} />
        <div style={{ padding: '14px 0 2px' }}>
          <div style={{ fontSize: 12.5, color: '#999', fontWeight: 500, marginBottom: 10 }}>Password</div>
          <PasswordChange />
        </div>
      </Section>

      {/* Onboarding data */}
      <Section title="Your profile" icon="ti-id">
        <Row label="Business name" value={onboarding?.business_name || ''} />
        <Row label="Industry" value={onboarding?.industry || ''} />
        <Row label="Ideal client" value={onboarding?.ideal_client || ''} />
        <Row label="Offer name" value={onboarding?.offer_name || ''} />
        <Row label="Price" value={onboarding?.price ? `$${onboarding.price}` : ''} />
        <Row label="Traffic source" value={onboarding?.traffic_source || ''} />
        <Row label="Closing method" value={onboarding?.closing_method === 'phone-call' ? 'Phone call' : onboarding?.closing_method === 'close-in-chat' ? 'Close in chat' : onboarding?.closing_method || ''} />
        <Row label="Goal" value={`${goalLabel} — ${onboarding?.goal_target || '?'}/month`} />
      </Section>

      {/* WhatsApp credentials */}
      <Section title="WhatsApp connection" icon="ti-brand-whatsapp">
        {flowConfig?.phone_number_id ? (
          <>
            <Row label="Phone Number ID" value={receiveData?.phoneNumberId || flowConfig?.phone_number_id || ''} masked />
            <Row label="Access Token" value={receiveData?.accessToken || sendData?.accessToken || ''} masked />
            <Row label="Client ID" value={receiveData?.clientId || sendData?.clientId || ''} masked />
            <Row label="Client Secret" value={receiveData?.clientSecret || sendData?.clientSecret || ''} masked />
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 16, color: '#f59e0b' }} />
            <span style={{ fontSize: 13, color: '#888' }}>No WhatsApp account connected yet. Complete Step 1 on the Home page.</span>
          </div>
        )}
      </Section>

      {/* Agents */}
      <Section title="Your agents" icon="ti-robot">
        {agents.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 16, color: '#f59e0b' }} />
            <span style={{ fontSize: 13, color: '#888' }}>No agents built yet. Start from the Templates page.</span>
          </div>
        ) : (
          <>
            {flowConfig?.agent_name && (
              <Row label="Agent name" value={flowConfig.agent_name} />
            )}
            {flowConfig?.agent_tone && (
              <Row label="Agent tone" value={flowConfig.agent_tone} />
            )}
            {agents.map((flow, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 2 }}>
                    {flow.template_title || flow.template_id}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#bbb' }}>
                    Created {new Date(flow.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100,
                  background: flow.status === 'active' ? 'rgba(37,211,102,0.1)' : 'rgba(0,0,0,0.05)',
                  color: flow.status === 'active' ? '#1a8c4e' : '#aaa',
                }}>
                  {flow.status === 'active' ? 'Active' : flow.status === 'paused' ? 'Paused' : 'Draft'}
                </div>
              </div>
            ))}
          </>
        )}
      </Section>
    </div>
  )
}
