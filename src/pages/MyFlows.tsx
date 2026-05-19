import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Flow {
  id: string
  template_id: string
  template_title: string
  status: 'draft' | 'active' | 'paused'
  created_at: string
}

interface Props {
  onConfigureFlow: (flowId: string, templateId: string) => void
  onViewAgent: (flowId: string, templateId: string) => void
}

const TEMPLATE_ICONS: Record<string, string> = {
  'booking-with-lm': 'ti-calendar-plus',
  'booking-without-lm': 'ti-calendar-check',
  'followup-post-call': 'ti-phone-check',
  'closing-with-lm': 'ti-trophy',
  'closing-without-lm': 'ti-badge-check',
  'followup-reviews': 'ti-star',
  'followup-referral': 'ti-users-plus',
  'followup-warm': 'ti-flame',
}

const STATUS_STYLES = {
  draft: { bg: 'rgba(0,0,0,0.05)', color: '#999', label: 'Draft' },
  active: { bg: 'rgba(37,211,102,0.09)', color: '#1a8c4e', label: '● Active' },
  paused: { bg: 'rgba(245,158,11,0.09)', color: '#b45309', label: '⏸ Paused' },
}

export default function MyFlows({ onConfigureFlow, onViewAgent }: Props) {
  const [flows, setFlows] = useState<Flow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('flows').select('*').order('created_at', { ascending: false })
      setFlows((data as Flow[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function toggleStatus(flow: Flow) {
    const next = flow.status === 'active' ? 'paused' : 'active'
    await supabase.from('flows').update({ status: next }).eq('id', flow.id)
    setFlows(f => f.map(x => x.id === flow.id ? { ...x, status: next } : x))
  }

  async function deleteFlow(id: string) {
    await supabase.from('flows').delete().eq('id', id)
    setFlows(f => f.filter(x => x.id !== id))
  }

  return (
    <div style={{ padding: '48px 40px 80px', maxWidth: 900, margin: '0 auto', fontFamily: 'inherit' }}>
      <style>{`@keyframes mf-up { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 40, animation: 'mf-up 0.4s ease both' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', letterSpacing: '-0.03em', marginBottom: 8 }}>
          My Flows
        </h1>
        <p style={{ fontSize: 14, color: '#999', lineHeight: 1.6 }}>
          Your active WhatsApp agents. Configure, pause, or manage them here.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#ccc' }}>
          <i className="ti ti-loader-2" style={{ fontSize: 32, display: 'block', marginBottom: 12, animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : flows.length === 0 ? (
        <div className="glass" style={{
          borderRadius: 22, padding: '72px 40px', textAlign: 'center',
          animation: 'mf-up 0.4s ease 0.1s both',
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <i className="ti ti-bolt" style={{ fontSize: 28, color: '#bbb' }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>No flows yet</h3>
          <p style={{ fontSize: 13.5, color: '#aaa', lineHeight: 1.65, maxWidth: 320, margin: '0 auto' }}>
            Head to Templates, pick one that fits your goal, and click "Use template" to add it here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {flows.map((flow, i) => {
            const icon = TEMPLATE_ICONS[flow.template_id] ?? 'ti-bolt'
            const st = STATUS_STYLES[flow.status]
            return (
              <div
                key={flow.id}
                className="glass"
                style={{
                  borderRadius: 18, padding: '20px 22px',
                  display: 'flex', alignItems: 'center', gap: 18,
                  animation: `mf-up 0.4s ease ${i * 0.06}s both`,
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.09)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}
              >
                {/* Icon */}
                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(124,77,204,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${icon}`} style={{ fontSize: 22, color: '#7c4dcc' }} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>{flow.template_title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                      background: st.bg, color: st.color,
                    }}>{st.label}</span>
                    <span style={{ fontSize: 11, color: '#ccc' }}>
                      Added {new Date(flow.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => onViewAgent(flow.id, flow.template_id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
                      background: 'rgba(37,211,102,0.09)', color: '#1a8c4e', border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <i className="ti ti-eye" style={{ fontSize: 13 }} />
                    View
                  </button>
                  <button
                    onClick={() => onConfigureFlow(flow.id, flow.template_id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
                      background: '#111', color: '#fff', border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <i className="ti ti-settings" style={{ fontSize: 13 }} />
                    Configure
                  </button>
                  <button
                    onClick={() => toggleStatus(flow)}
                    style={{
                      padding: '8px 14px', borderRadius: 9, fontSize: 12.5, fontWeight: 500,
                      background: 'rgba(0,0,0,0.05)', color: '#555', border: 'none',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.09)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.05)')}
                  >
                    {flow.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteFlow(flow.id)}
                    style={{
                      width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'none', border: '0.5px solid rgba(0,0,0,0.1)', cursor: 'pointer',
                      color: '#ccc', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget.style.background = 'rgba(239,68,68,0.07)')
                      ;(e.currentTarget.style.color = '#ef4444')
                      ;(e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)')
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget.style.background = 'none')
                      ;(e.currentTarget.style.color = '#ccc')
                      ;(e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')
                    }}
                  >
                    <i className="ti ti-trash" style={{ fontSize: 15 }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
