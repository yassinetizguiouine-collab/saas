import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import PreLaunchChecklist from './PreLaunchChecklist'

interface Props {
  flowId: string
  templateId: string
  onBack: () => void
}

interface AgentData {
  agent_name: string
  agent_tone: string
  agent_personality: string
  system_prompt: string
}

interface ChatMessage {
  role: 'user' | 'agent'
  text: string
  ts: number
}

const CHAT_WEBHOOK = 'https://leadflowai2026.app.n8n.cloud/webhook/aa83d08b-9a28-45fc-b782-562f7ffac7b4'

const TONE_LABELS: Record<string, string> = {
  bro: 'Bro',
  pro: 'Pro',
  friendly: 'Friendly',
  warm: 'Warm',
}

// ─── TAB BUTTON ──────────────────────────────────────────────────────────────

function Tab({
  label, icon, active, onClick, locked,
}: {
  label: string; icon: string; active: boolean; onClick: () => void; locked?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
        background: active ? '#111' : 'transparent',
        color: active ? '#fff' : locked ? '#ccc' : '#888',
        border: active ? 'none' : '0.5px solid transparent',
        cursor: locked ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
        transition: 'all 0.15s', opacity: locked ? 0.6 : 1,
      }}
      onMouseEnter={e => { if (!active && !locked) e.currentTarget.style.color = '#111' }}
      onMouseLeave={e => { if (!active && !locked) e.currentTarget.style.color = '#888' }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 14 }} />
      {label}
      {locked && <i className="ti ti-lock" style={{ fontSize: 11, marginLeft: 2, color: '#ccc' }} />}
    </button>
  )
}

// ─── PROMPT TAB ──────────────────────────────────────────────────────────────

function PromptTab({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(37,211,102,0.08)', borderRadius: 8,
          padding: '6px 12px', fontSize: 12, fontWeight: 600, color: '#1a8c4e',
        }}>
          <i className="ti ti-check" style={{ fontSize: 12 }} />
          Ready to deploy
        </div>
        <span style={{ fontSize: 12, color: '#bbb' }}>{wordCount.toLocaleString()} words</span>
        <button
          onClick={copy}
          style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: copied ? 'rgba(37,211,102,0.08)' : 'rgba(0,0,0,0.05)',
            color: copied ? '#1a8c4e' : '#555',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: 13 }} />
          {copied ? 'Copied!' : 'Copy prompt'}
        </button>
      </div>
      <div style={{
        background: 'rgba(0,0,0,0.03)', borderRadius: 14,
        padding: '20px 22px', maxHeight: 480, overflowY: 'auto',
        border: '0.5px solid rgba(0,0,0,0.07)',
      }}>
        <pre style={{
          margin: 0, fontSize: 12.5, lineHeight: 1.75, color: '#333',
          fontFamily: "'SF Mono', 'Fira Code', monospace",
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {prompt}
        </pre>
      </div>
    </div>
  )
}

// ─── CHAT TAB ────────────────────────────────────────────────────────────────

function ChatTab({ userId, agentName }: { userId: string; agentName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

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
      const res = await fetch(CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message: text }),
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: 520 }}>
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 0',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ccc' }}>
            <i className="ti ti-brand-whatsapp" style={{ fontSize: 36, display: 'block', marginBottom: 12, color: '#25D366', opacity: 0.4 }} />
            <p style={{ fontSize: 13, fontWeight: 500 }}>Send a message to test {agentName || 'your agent'}</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>It'll respond using the generated system prompt</p>
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
      <div style={{
        display: 'flex', gap: 8, alignItems: 'flex-end',
        padding: '14px 0 0', borderTop: '0.5px solid rgba(0,0,0,0.07)',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Message ${agentName || 'agent'}...`}
          rows={1}
          style={{
            flex: 1, resize: 'none', padding: '10px 14px',
            borderRadius: 12, fontSize: 13.5, color: '#111',
            background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.1)',
            outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, overflowY: 'hidden',
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

// ─── FULL WORKFLOW TAB (LOCKED) ───────────────────────────────────────────────

function FullWorkflowLocked() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '72px 24px', textAlign: 'center',
      animation: 'fadeUp 0.4s ease both',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, border: '0.5px solid rgba(0,0,0,0.08)',
      }}>
        <i className="ti ti-lock" style={{ fontSize: 28, color: '#ccc' }} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: 8 }}>
        Full Workflow is locked
      </h3>
      <p style={{ fontSize: 13.5, color: '#999', lineHeight: 1.65, maxWidth: 320 }}>
        Complete your Pre-Launch Checklist and confirm all fields to unlock your full workflow.
      </p>
    </div>
  )
}

// ─── FULL WORKFLOW TAB (UNLOCKED) ────────────────────────────────────────────

const DEPLOY_WEBHOOK = 'https://leadflowai2026.app.n8n.cloud/webhook/0e5c6446-ba5a-4cd0-ba9a-554605c593f3'

// Node definitions for the canvas
const WORKFLOW_NODES = [
  { id: 'trigger', x: 60, y: 180, icon: 'ti-brand-whatsapp', label: 'WhatsApp Trigger', color: '#25D366', bg: 'rgba(37,211,102,0.1)', desc: 'Receives incoming WhatsApp messages from leads', config: { type: 'whatsAppTrigger', updates: ['messages'], credential: 'WhatsApp OAuth account' } },
  { id: 'wait', x: 240, y: 180, icon: 'ti-clock', label: 'Human Delay', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', desc: 'Adds a natural delay before responding', config: { type: 'wait', amount: '2 seconds', reason: 'Mimics human typing delay' } },
  { id: 'typing', x: 420, y: 180, icon: 'ti-eye', label: 'Mark Read + Typing', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', desc: 'Marks message as read and shows typing indicator', config: { type: 'httpRequest', url: 'graph.facebook.com/v25.0/{phone_id}/messages', action: 'POST — sets status: read + typing_indicator' } },
  { id: 'wait2', x: 600, y: 180, icon: 'ti-clock', label: 'Typing Delay', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', desc: 'Waits while typing animation shows', config: { type: 'wait', amount: '2 seconds', reason: 'Lets typing indicator show before reply' } },
  { id: 'agent', x: 780, y: 180, icon: 'ti-robot', label: 'AI Agent', color: '#111', bg: 'rgba(0,0,0,0.07)', desc: 'Processes the message and generates a reply using your system prompt', config: { type: 'agent', model: 'openai/gpt-4o-mini via OpenRouter', memory: 'Postgres Chat Memory (Supabase)', prompt: 'Your generated system prompt' } },
  { id: 'parse', x: 960, y: 180, icon: 'ti-code', label: 'Parse Reply', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', desc: 'Extracts the reply text from the AI JSON output', config: { type: 'code', language: 'JavaScript', extracts: 'reply field or messages[0]' } },
  { id: 'send', x: 1140, y: 180, icon: 'ti-send', label: 'Send Message', color: '#25D366', bg: 'rgba(37,211,102,0.1)', desc: 'Sends the reply back to the lead on WhatsApp', config: { type: 'whatsApp', operation: 'send', to: 'lead phone number', credential: 'WhatsApp account' } },
]

const EDGES = [
  ['trigger', 'wait'], ['wait', 'typing'], ['typing', 'wait2'],
  ['wait2', 'agent'], ['agent', 'parse'], ['parse', 'send'],
]

function WorkflowCanvas({ onNodeClick }: { onNodeClick: (node: typeof WORKFLOW_NODES[0]) => void }) {
  const nodeW = 130
  const nodeH = 64
  const canvasH = 380

  function getNodeCenter(id: string) {
    const node = WORKFLOW_NODES.find(n => n.id === id)!
    return { x: node.x + nodeW / 2, y: node.y + nodeH / 2 }
  }

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
      <div style={{ position: 'relative', width: 1300, height: canvasH, margin: '0 auto' }}>
        {/* SVG edges */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="rgba(0,0,0,0.15)" />
            </marker>
          </defs>
          {EDGES.map(([from, to]) => {
            const s = getNodeCenter(from)
            const e = getNodeCenter(to)
            const mx = (s.x + e.x) / 2
            return (
              <path
                key={`${from}-${to}`}
                d={`M${s.x},${s.y} C${mx},${s.y} ${mx},${e.y} ${e.x},${e.y}`}
                fill="none"
                stroke="rgba(0,0,0,0.12)"
                strokeWidth="2"
                strokeDasharray="4 3"
                markerEnd="url(#arrow)"
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {WORKFLOW_NODES.map((node) => (
          <button
            key={node.id}
            onClick={() => onNodeClick(node)}
            style={{
              position: 'absolute', left: node.x, top: node.y,
              width: nodeW, height: nodeH,
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.09)',
              borderRadius: 14, cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 5,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              transition: 'all 0.15s', fontFamily: 'inherit',
              padding: '8px 10px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = node.color
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: node.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <i className={`ti ${node.icon}`} style={{ fontSize: 15, color: node.color }} />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: '#111', textAlign: 'center', lineHeight: 1.3 }}>
              {node.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function NodeDetailPanel({ node, onClose }: { node: typeof WORKFLOW_NODES[0]; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 320,
      background: '#fff', borderLeft: '0.5px solid rgba(0,0,0,0.08)',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
      zIndex: 100, display: 'flex', flexDirection: 'column',
      animation: 'slideIn 0.2s ease both',
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '0.5px solid rgba(0,0,0,0.07)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: node.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <i className={`ti ${node.icon}`} style={{ fontSize: 18, color: node.color }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{node.label}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>Node config</div>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#bbb', fontSize: 18, padding: 4,
        }}>
          <i className="ti ti-x" />
        </button>
      </div>

      {/* Description */}
      <div style={{ padding: '16px 20px', borderBottom: '0.5px solid rgba(0,0,0,0.07)' }}>
        <p style={{ fontSize: 12.5, color: '#666', lineHeight: 1.6, margin: 0 }}>{node.desc}</p>
      </div>

      {/* Config */}
      <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Configuration
        </div>
        {Object.entries(node.config).map(([k, v]) => (
          <div key={k} style={{
            padding: '10px 12px', borderRadius: 10,
            background: 'rgba(0,0,0,0.03)', marginBottom: 8,
            border: '0.5px solid rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{k}</div>
            <div style={{ fontSize: 12.5, color: '#333', fontFamily: "'SF Mono', monospace", lineHeight: 1.5 }}>{String(v)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FullWorkflowUnlocked({ agentName, userId, templateId }: { agentName: string; userId: string; templateId: string }) {
  const [screen, setScreen] = useState<'confirm' | 'deploying' | 'done'>('confirm')
  const [tokens, setTokens] = useState({ clientId: '', clientSecret: '', businessId: '', accessToken: '' })
  const [editing, setEditing] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [tokenConfirmed, setTokenConfirmed] = useState(false)
  const [selectedNode, setSelectedNode] = useState<typeof WORKFLOW_NODES[0] | null>(null)
  const [flowJson, setFlowJson] = useState<object | null>(null)

  useEffect(() => {
    async function load() {
      // Check if already confirmed
      const { data: conf } = await supabase.from('token_confirmation').select('id').eq('user_id', userId).maybeSingle()
      if (conf) { setTokenConfirmed(true); loadFlowJson(); return }

      // Load tokens from flow_config
      const { data } = await supabase.from('flow_config')
        .select('whatsapp_receive, whatsapp_send')
        .eq('user_id', userId).eq('template_id', templateId).maybeSingle()
      if (data) {
        const recv = typeof data.whatsapp_receive === 'string' ? JSON.parse(data.whatsapp_receive) : data.whatsapp_receive
        const send = typeof data.whatsapp_send === 'string' ? JSON.parse(data.whatsapp_send) : data.whatsapp_send
        setTokens({
          clientId: recv?.clientId || '',
          clientSecret: recv?.clientSecret || '',
          businessId: send?.businessId || '',
          accessToken: send?.accessToken || '',
        })
      }
    }
    load()
  }, [userId, templateId])

  async function loadFlowJson() {
    const { data } = await supabase.from('flow_config').select('flow_json').eq('user_id', userId).eq('template_id', templateId).maybeSingle()
    if (data?.flow_json) setFlowJson(data.flow_json)
    setScreen('done')
  }

  async function saveToken(field: string, value: string) {
    const isReceive = field === 'clientId' || field === 'clientSecret'
    const column = isReceive ? 'whatsapp_receive' : 'whatsapp_send'
    const { data } = await supabase.from('flow_config').select(column).eq('user_id', userId).eq('template_id', templateId).maybeSingle()
    const current = typeof data?.[column] === 'string' ? JSON.parse(data[column]) : (data?.[column] || {})
    const updated = { ...current, [field]: value }
    await supabase.from('flow_config').update({ [column]: updated }).eq('user_id', userId).eq('template_id', templateId)
    setTokens(prev => ({ ...prev, [field]: value }))
  }

  async function handleConfirmDeploy() {
    setScreen('deploying')
    try {
      await supabase.from('token_confirmation').upsert({ user_id: userId, flow_config_id: templateId, confirmed_at: new Date().toISOString() }, { onConflict: 'user_id' })
      const res = await fetch(DEPLOY_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, template_id: templateId, ...tokens }),
      })
      const data = await res.json()
      if (data?.workflow_json || data?.flow_json) {
        const json = data.workflow_json || data.flow_json
        await supabase.from('flow_config').update({ flow_json: json, deployed_at: new Date().toISOString() }).eq('user_id', userId).eq('template_id', templateId)
        setFlowJson(json)
      }
      await supabase.from('workflow_deploy_log').insert({ user_id: userId, template_id: templateId, flow_config_id: userId, status: 'success', workflow_json: data })
      setTokenConfirmed(true)
      setScreen('done')
    } catch (e) {
      await supabase.from('workflow_deploy_log').insert({ user_id: userId, template_id: templateId, flow_config_id: userId, status: 'failed', error: String(e) })
      setScreen('done')
    }
  }

  const TOKEN_FIELDS = [
    { key: 'clientId', label: 'App ID (Client ID)', icon: 'ti-id', section: 'WhatsApp Receive' },
    { key: 'clientSecret', label: 'App Secret (Client Secret)', icon: 'ti-key', section: 'WhatsApp Receive' },
    { key: 'businessId', label: 'WhatsApp Business Account ID', icon: 'ti-building', section: 'WhatsApp Send' },
    { key: 'accessToken', label: 'Access Token', icon: 'ti-shield-lock', section: 'WhatsApp Send' },
  ]

  // ── CONFIRM SCREEN ──
  if (screen === 'confirm') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(37,211,102,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-shield-check" style={{ fontSize: 20, color: '#25D366' }} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>Confirm your WhatsApp tokens</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>Review and edit before deploying — this shows once</div>
        </div>
      </div>

      {/* Group by section */}
      {['WhatsApp Receive', 'WhatsApp Send'].map(section => (
        <div key={section}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{section}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TOKEN_FIELDS.filter(f => f.section === section).map(field => (
              <div key={field.key} style={{
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(0,0,0,0.02)', border: '0.5px solid rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${field.icon}`} style={{ fontSize: 15, color: '#888' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', marginBottom: 3 }}>{field.label}</div>
                  {editing === field.key ? (
                    <input
                      autoFocus
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      onBlur={async () => { await saveToken(field.key, editVal); setEditing(null) }}
                      onKeyDown={async e => { if (e.key === 'Enter') { await saveToken(field.key, editVal); setEditing(null) } }}
                      style={{
                        width: '100%', fontSize: 12.5, padding: '4px 8px',
                        border: '1px solid rgba(0,0,0,0.15)', borderRadius: 7,
                        outline: 'none', fontFamily: "'SF Mono', monospace", color: '#111',
                        background: '#fff',
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 12.5, color: tokens[field.key as keyof typeof tokens] ? '#111' : '#ccc', fontFamily: "'SF Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tokens[field.key as keyof typeof tokens] || 'Not set'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => { setEditing(field.key); setEditVal(tokens[field.key as keyof typeof tokens]) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 4, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#111'}
                  onMouseLeave={e => e.currentTarget.style.color = '#bbb'}
                >
                  <i className="ti ti-pencil" style={{ fontSize: 14 }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleConfirmDeploy}
        style={{
          width: '100%', padding: '15px 20px', borderRadius: 13,
          background: '#111', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 700, fontSize: 14, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <i className="ti ti-rocket" style={{ fontSize: 15 }} />
        Confirm & Deploy Workflow
      </button>
    </div>
  )

  // ── DEPLOYING SCREEN ──
  if (screen === 'deploying') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 16, animation: 'fadeUp 0.3s ease both' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="ti ti-loader-2" style={{ fontSize: 26, color: '#111', animation: 'spin 1s linear infinite' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 6 }}>Building your workflow…</div>
        <div style={{ fontSize: 13, color: '#aaa' }}>Our AI is assembling all the nodes</div>
      </div>
      {['Validating tokens…', 'Generating workflow JSON…', 'Saving to your account…'].map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, background: 'rgba(0,0,0,0.03)', width: '100%', maxWidth: 340 }}>
          <i className="ti ti-loader-2" style={{ fontSize: 13, color: '#bbb', animation: `spin 1s linear ${i * 0.3}s infinite` }} />
          <span style={{ fontSize: 12.5, color: '#888' }}>{step}</span>
        </div>
      ))}
    </div>
  )

  // ── DONE SCREEN — CANVAS ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.3s ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(37,211,102,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-check" style={{ fontSize: 20, color: '#25D366' }} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>{agentName}'s workflow is live</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>Click any node to see its configuration</div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{
        borderRadius: 16, border: '0.5px solid rgba(0,0,0,0.08)',
        background: 'rgba(0,0,0,0.01)',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        padding: '24px 16px', overflow: 'hidden',
      }}>
        <WorkflowCanvas onNodeClick={setSelectedNode} />
      </div>

      {/* Flow JSON download if available */}
      {flowJson && (
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(flowJson, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `${agentName.toLowerCase().replace(/\s+/g, '-')}-workflow.json`
            a.click(); URL.revokeObjectURL(url)
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.08)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#555',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.07)'; e.currentTarget.style.color = '#111' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#555' }}
        >
          <i className="ti ti-download" style={{ fontSize: 15 }} />
          Download workflow JSON for n8n import
        </button>
      )}

      {/* Node detail panel */}
      {selectedNode && <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />}
    </div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function ViewAgent({ flowId, templateId, onBack }: Props) {
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'prompt' | 'chat' | 'checklist' | 'workflow'>('prompt')
  const [userId, setUserId] = useState<string>('')
  const [workflowUnlocked, setWorkflowUnlocked] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: config }, { data: prompt }, { data: checklist }] = await Promise.all([
        supabase
          .from('flow_config')
          .select('agent_name, agent_tone, agent_personality')
          .eq('user_id', user.id)
          .eq('template_id', templateId)
          .maybeSingle(),
        supabase
          .from('generated_prompts')
          .select('system_prompt')
          .eq('user_id', user.id)
          .eq('template_id', templateId)
          .maybeSingle(),
        supabase
          .from('pre_launch_checklist')
          .select('workflow_unlocked')
          .eq('user_id', user.id)
          .eq('template_id', templateId)
          .maybeSingle(),
      ])

      setAgent({
        agent_name: config?.agent_name || 'Agent',
        agent_tone: config?.agent_tone || 'friendly',
        agent_personality: config?.agent_personality || '',
        system_prompt: prompt?.system_prompt || '',
      })
      setWorkflowUnlocked(checklist?.workflow_unlocked ?? false)
      setLoading(false)
    }
    load()
  }, [flowId, templateId])

  function handleWorkflowUnlocked() {
    setWorkflowUnlocked(true)
  }

  if (loading) return (
    <div style={{ padding: '80px 40px', textAlign: 'center', color: '#ccc' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <i className="ti ti-loader-2" style={{ fontSize: 28, animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (!agent) return null

  return (
    <div style={{ padding: '48px 40px 80px', maxWidth: 860, margin: '0 auto', fontFamily: 'inherit' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

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
        My Flows
      </button>

      {/* Header */}
      <div style={{ marginBottom: 32, animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'rgba(37,211,102,0.09)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '0.5px solid rgba(37,211,102,0.15)',
          }}>
            <i className="ti ti-robot" style={{ fontSize: 24, color: '#25D366' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 3 }}>
              {agent.agent_name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                background: 'rgba(37,211,102,0.09)', color: '#1a8c4e',
              }}>● Active</span>
              <span style={{ fontSize: 12, color: '#bbb' }}>
                {TONE_LABELS[agent.agent_tone] || agent.agent_tone}
              </span>
            </div>
          </div>
        </div>

        {agent.agent_personality && (
          <p style={{
            fontSize: 13.5, color: '#777', lineHeight: 1.65,
            maxWidth: 560, padding: '12px 16px',
            background: 'rgba(0,0,0,0.03)', borderRadius: 10,
            border: '0.5px solid rgba(0,0,0,0.06)',
          }}>
            {agent.agent_personality}
          </p>
        )}
      </div>

      {/* Main card */}
      <div
        className="glass"
        style={{ borderRadius: 20, overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.1s both' }}
      >
        {/* Tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '14px 18px',
          borderBottom: '0.5px solid rgba(0,0,0,0.07)',
          background: 'rgba(255,255,255,0.5)',
        }}>
          <Tab label="System Prompt" icon="ti-code" active={tab === 'prompt'} onClick={() => setTab('prompt')} />
          <Tab label="Test Agent" icon="ti-message-circle" active={tab === 'chat'} onClick={() => setTab('chat')} />
          <Tab label="Pre-Launch" icon="ti-clipboard-check" active={tab === 'checklist'} onClick={() => setTab('checklist')} />
          <Tab
            label="Full Workflow"
            icon="ti-rocket"
            active={tab === 'workflow'}
            onClick={() => { if (workflowUnlocked) setTab('workflow') }}
            locked={!workflowUnlocked}
          />
        </div>

        {/* Content */}
        <div style={{ padding: '24px 24px' }}>
          {tab === 'prompt' && (
            agent.system_prompt
              ? <PromptTab prompt={agent.system_prompt} />
              : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ccc' }}>
                  <i className="ti ti-file-off" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} />
                  <p style={{ fontSize: 13 }}>No system prompt found. Run the build first.</p>
                </div>
              )
          )}
          {tab === 'chat' && (
            <ChatTab userId={userId} agentName={agent.agent_name} />
          )}
          {tab === 'checklist' && (
            <PreLaunchChecklist
              userId={userId}
              templateId={templateId}
              agentName={agent.agent_name}
              onWorkflowUnlocked={handleWorkflowUnlocked}
            />
          )}
          {tab === 'workflow' && (
            workflowUnlocked
              ? <FullWorkflowUnlocked agentName={agent.agent_name} userId={userId} templateId={templateId} />
              : <FullWorkflowLocked />
          )}
        </div>
      </div>
    </div>
  )
}
