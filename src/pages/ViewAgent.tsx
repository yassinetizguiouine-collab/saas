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

function ChatTab({ userId, agentName, templateId }: { userId: string; agentName: string; templateId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sessionId = `test_${userId}_${templateId}`

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!userId) return

    // 1. Load full history from memory table
    supabase
      .from('test_agent_memory')
      .select('id, message, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          const parsed: ChatMessage[] = data.map(row => {
            const msg = row.message as { type: string; content: string }
            return {
              role: msg.type === 'human' ? 'user' : 'agent',
              text: msg.content,
              ts: new Date(row.created_at).getTime(),
            }
          })
          setMessages(parsed)
        }
        setHistoryLoaded(true)
      })

    // 2. Realtime — only append AI replies (human already shown optimistically)
    const channel = supabase
      .channel(`test-agent-${userId}-${templateId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'test_agent_memory',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const row = payload.new as { message: { type: string; content: string }; created_at: string }
          // Skip human messages — already added optimistically on send
          if (row.message.type !== 'ai') return
          setMessages(prev => [...prev, {
            role: 'agent',
            text: row.message.content,
            ts: new Date(row.created_at).getTime(),
          }])
          setLoading(false)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, sessionId])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)

    // Show user message immediately — don't wait for n8n/Realtime
    setMessages(prev => [...prev, { role: 'user', text, ts: Date.now() }])

    try {
      await fetch(CHAT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, template_id: templateId, session_id: sessionId, message: text }),
      })
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: 'Connection error. Check n8n.', ts: Date.now() }])
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
        {historyLoaded && messages.length === 0 && (
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

const MAIN_NODES = [
  {
    id: 'trigger', label: 'WhatsApp Trigger', icon: 'ti-brand-whatsapp', color: '#22c55e', border: '#16a34a',
    desc: 'Receives incoming WhatsApp messages from leads',
    config: { type: 'whatsAppTrigger', updates: 'messages', credential: 'WhatsApp OAuth account' },
  },
  {
    id: 'wait1', label: 'Human Delay', icon: 'ti-clock-pause', color: '#f59e0b', border: '#d97706',
    desc: 'Adds a natural human-like delay before responding',
    config: { type: 'wait', duration: '2–4 seconds', reason: 'Mimics human typing delay' },
  },
  {
    id: 'typing', label: 'Show Typing + Mark Read', icon: 'ti-eye-check', color: '#6366f1', border: '#4f46e5',
    desc: 'Marks message as read and shows typing indicator via Meta API',
    config: { type: 'httpRequest', url: 'graph.facebook.com/v25.0/{phone_id}/messages', method: 'POST', sets: 'status: read + typing_on' },
  },
  {
    id: 'wait2', label: 'Wait', icon: 'ti-clock', color: '#f59e0b', border: '#d97706',
    desc: 'Waits while typing animation displays to the lead',
    config: { type: 'wait', duration: '2 seconds', reason: 'Lets typing indicator show before reply' },
  },
  {
    id: 'agent', label: 'AI Agent', icon: 'ti-cpu', color: '#111', border: '#333',
    desc: 'Processes the message and generates a reply using your system prompt',
    config: { type: 'agent', model: 'LeadFlow AI', memory: 'LeadFlow Memory', prompt: 'Your generated system prompt from Supabase' },
    hasSubs: true,
  },
  {
    id: 'parse', label: 'Parse Reply', icon: 'ti-code-dots', color: '#f97316', border: '#ea580c',
    desc: 'Extracts the reply text from the AI JSON output',
    config: { type: 'code', language: 'JavaScript', extracts: 'reply field from agent JSON output' },
  },
  {
    id: 'send', label: 'Send Message', icon: 'ti-brand-whatsapp', color: '#22c55e', border: '#16a34a',
    desc: 'Sends the final reply back to the lead on WhatsApp',
    config: { type: 'whatsApp', operation: 'send', to: 'Lead phone number', credential: 'WhatsApp account' },
  },
]

const SUB_NODES = [
  { id: 'sub-model', parentId: 'agent', label: 'LeadFlow AI', icon: 'ti-sparkles', color: '#8b5cf6', border: '#7c3aed', desc: 'GPT-4o mini model powering your agent via LeadFlow', config: { provider: 'LeadFlow AI', model: 'gpt-4o-mini', routing: 'OpenRouter' } },
  { id: 'sub-memory', parentId: 'agent', label: 'LeadFlow Memory', icon: 'ti-database', color: '#0ea5e9', border: '#0284c7', desc: 'Postgres-backed memory storing full conversation history per lead', config: { type: 'Postgres Chat Memory', table: 'checklist_chat_memory', sessionKey: '{client_id}_{lead_phone}', window: '100 messages' } },
]

const EDGES_MAIN = ['trigger→wait1', 'wait1→typing', 'typing→wait2', 'wait2→agent', 'agent→parse', 'parse→send']

const NODE_W = 140
const NODE_H = 72
const H_GAP = 60
const CANVAS_TOP = 32
const ROW_Y = CANVAS_TOP + 20

function N8nCanvas({ onNodeClick, flowJson }: { onNodeClick: (node: typeof MAIN_NODES[0] | typeof SUB_NODES[0]) => void; flowJson?: object | null }) {
  const enrichedMain = MAIN_NODES.map(node => {
    if (!flowJson) return node
    const wf = flowJson as any
    const wfNodes: any[] = wf.nodes || []
    if (node.id === 'trigger') {
      const n = wfNodes.find((n: any) => n.type?.includes('whatsAppTrigger') && n.name?.includes('Trigger2'))
      if (n) return { ...node, config: { type: n.type, webhookId: n.webhookId || 'configured', credential: n.credentials ? Object.keys(n.credentials)[0] : 'WhatsApp OAuth account' } }
    }
    if (node.id === 'agent') {
      const n = wfNodes.find((n: any) => n.name === 'AI Agent2')
      if (n) return { ...node, config: { type: 'agent', model: 'LeadFlow AI', memory: 'LeadFlow Memory', prompt: n.parameters?.options?.systemMessage ? n.parameters.options.systemMessage.slice(0, 80) + '\u2026' : 'Your generated system prompt' } }
    }
    if (node.id === 'send') {
      const n = wfNodes.find((n: any) => n.name === 'Send message4')
      if (n) return { ...node, config: { type: 'whatsApp', operation: 'send', phoneNumberId: n.parameters?.phoneNumberId || 'configured', to: 'Lead phone number' } }
    }
    if (node.id === 'typing') {
      const n = wfNodes.find((n: any) => n.name?.includes('Show typing + mark read1'))
      if (n) return { ...node, config: { type: 'httpRequest', url: 'graph.facebook.com/v25.0/{phone_id}/messages', method: 'POST', sets: 'status: read + typing_on' } }
    }
    return node
  })
  const enrichedSubs = SUB_NODES.map(node => {
    if (!flowJson) return node
    const wf = flowJson as any
    const wfNodes: any[] = wf.nodes || []
    if (node.id === 'sub-memory') {
      const n = wfNodes.find((n: any) => n.type?.includes('memoryPostgresChat'))
      if (n) return { ...node, config: { type: 'Postgres Chat Memory', table: n.parameters?.tableName || 'checklist_chat_memory', sessionKey: n.parameters?.sessionKey || '{client_id}_{lead_phone}', window: `${n.parameters?.contextWindowLength || 100} messages` } }
    }
    return node
  })
  const totalW = enrichedMain.length * (NODE_W + H_GAP) - H_GAP + 80
  const subY = ROW_Y + NODE_H + 44
  const canvasH = subY + NODE_H + 48

  function nodeX(i: number) { return 40 + i * (NODE_W + H_GAP) }
  function nodeCX(i: number) { return nodeX(i) + NODE_W / 2 }

  const agentIdx = enrichedMain.findIndex(n => n.id === 'agent')
  const agentCX = nodeCX(agentIdx)

  const subPositions: Record<string, { x: number; y: number }> = {
    'sub-model': { x: agentCX - NODE_W - 20, y: subY },
    'sub-memory': { x: agentCX + 20, y: subY },
  }

  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible', paddingBottom: 8 }}>
      <div style={{ position: 'relative', width: totalW, height: canvasH, minWidth: totalW }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0,0.5 L0,6.5 L6,3.5 z" fill="rgba(0,0,0,0.2)" />
            </marker>
            <marker id="arr-sub" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
              <path d="M0,0.5 L0,6.5 L6,3.5 z" fill="rgba(0,0,0,0.15)" />
            </marker>
          </defs>
          {EDGES_MAIN.map(edge => {
            const [fromId, toId] = edge.split('→')
            const fi = enrichedMain.findIndex(n => n.id === fromId)
            const ti = enrichedMain.findIndex(n => n.id === toId)
            const x1 = nodeX(fi) + NODE_W, y1 = ROW_Y + NODE_H / 2
            const x2 = nodeX(ti), y2 = ROW_Y + NODE_H / 2
            const mx = (x1 + x2) / 2
            return (
              <path key={edge}
                d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
                fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5"
                markerEnd="url(#arr)"
              />
            )
          })}
          {enrichedSubs.map(sub => {
            const pos = subPositions[sub.id]
            const scx = pos.x + NODE_W / 2
            const scy = pos.y
            return (
              <line key={sub.id}
                x1={agentCX} y1={ROW_Y + NODE_H}
                x2={scx} y2={scy}
                stroke="rgba(0,0,0,0.13)" strokeWidth="1.5" strokeDasharray="5 3"
                markerEnd="url(#arr-sub)"
              />
            )
          })}
          <text x={agentCX - NODE_W - 20 + NODE_W / 2} y={subY - 8} textAnchor="middle" fontSize="9" fill="#aaa" fontFamily="inherit" fontWeight="600" letterSpacing="0.04em">MODEL</text>
          <text x={agentCX + 20 + NODE_W / 2} y={subY - 8} textAnchor="middle" fontSize="9" fill="#aaa" fontFamily="inherit" fontWeight="600" letterSpacing="0.04em">MEMORY</text>
        </svg>
        {enrichedMain.map((node, i) => (
          <button key={node.id} onClick={() => onNodeClick(node)}
            style={{
              position: 'absolute', left: nodeX(i), top: ROW_Y,
              width: NODE_W, height: NODE_H,
              background: '#fff', border: `1.5px solid ${node.border}22`,
              borderRadius: 14, cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
              boxShadow: '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s', fontFamily: 'inherit', padding: '8px 10px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 6px 24px rgba(0,0,0,0.13), 0 0 0 2px ${node.border}33`
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.borderColor = node.border + '66'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = node.border + '22'
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: node.color === '#111' ? 'rgba(0,0,0,0.06)' : `${node.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <i className={`ti ${node.icon}`} style={{ fontSize: 16, color: node.color }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#222', textAlign: 'center', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              {node.label}
            </span>
          </button>
        ))}
        {enrichedSubs.map(sub => {
          const pos = subPositions[sub.id]
          return (
            <button key={sub.id} onClick={() => onNodeClick(sub as any)}
              style={{
                position: 'absolute', left: pos.x, top: pos.y,
                width: NODE_W, height: NODE_H,
                background: '#fff', border: `1.5px solid ${sub.border}22`,
                borderRadius: 14, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.15s', fontFamily: 'inherit', padding: '8px 10px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 6px 20px rgba(0,0,0,0.11), 0 0 0 2px ${sub.border}33`
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = sub.border + '55'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = sub.border + '22'
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: `${sub.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className={`ti ${sub.icon}`} style={{ fontSize: 16, color: sub.color }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#222', textAlign: 'center', lineHeight: 1.25 }}>
                {sub.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function NodePanel({ node, onClose }: { node: typeof MAIN_NODES[0]; onClose: () => void }) {
  const color = (node as any).color || '#111'
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 300,
      background: '#fff', borderLeft: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '-12px 0 40px rgba(0,0,0,0.07)',
      zIndex: 200, display: 'flex', flexDirection: 'column',
      animation: 'slideIn 0.18s ease both',
    }}>
      <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color === '#111' ? 'rgba(0,0,0,0.06)' : `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`ti ${(node as any).icon}`} style={{ fontSize: 18, color }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{node.label}</div>
          <div style={{ fontSize: 10.5, color: '#bbb', marginTop: 1 }}>Node configuration</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 16, padding: 2 }}>
          <i className="ti ti-x" />
        </button>
      </div>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ fontSize: 12, color: '#777', lineHeight: 1.6, margin: 0 }}>{node.desc}</p>
      </div>
      <div style={{ padding: '14px 18px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Config</div>
        {Object.entries(node.config || {}).map(([k, v]) => (
          <div key={k} style={{ padding: '9px 11px', borderRadius: 9, background: 'rgba(0,0,0,0.025)', marginBottom: 7, border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{k}</div>
            <div style={{ fontSize: 12, color: '#333', fontFamily: "'SF Mono', monospace", lineHeight: 1.5 }}>{String(v)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

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

const DEPLOY_WEBHOOK = 'https://leadflowai2026.app.n8n.cloud/webhook/0e5c6446-ba5a-4cd0-ba9a-554605c593f3'

function FullWorkflowUnlocked({ agentName, userId, templateId }: { agentName: string; userId: string; templateId: string }) {
  const [screen, setScreen] = useState<'confirm' | 'deploying' | 'done'>('confirm')
  const [tokens, setTokens] = useState({ clientId: '', clientSecret: '', businessId: '', accessToken: '' })
  const [editing, setEditing] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')
  const [tokenConfirmed, setTokenConfirmed] = useState(false)
  const [selectedNode, setSelectedNode] = useState<typeof MAIN_NODES[0] | null>(null)
  const [flowJson, setFlowJson] = useState<object | null>(null)

  useEffect(() => {
    async function load() {
      const { data: conf } = await supabase.from('token_confirmation').select('id').eq('user_id', userId).maybeSingle()
      if (conf) { setTokenConfirmed(true); loadFlowJson(); return }

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.3s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(37,211,102,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-check" style={{ fontSize: 20, color: '#25D366' }} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>{agentName}'s workflow is live</div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>Click any node to see its configuration</div>
        </div>
      </div>
      <div style={{
        borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)',
        background: '#fafafa',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        padding: '20px 16px 24px',
        overflow: 'hidden',
      }}>
        <N8nCanvas onNodeClick={setSelectedNode} flowJson={flowJson} />
      </div>
      {selectedNode && <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />}
    </div>
  )
}

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
        supabase.from('flow_config').select('agent_name, agent_tone, agent_personality').eq('user_id', user.id).eq('template_id', templateId).maybeSingle(),
        supabase.from('generated_prompts').select('system_prompt').eq('user_id', user.id).eq('template_id', templateId).maybeSingle(),
        supabase.from('pre_launch_checklist').select('workflow_unlocked').eq('user_id', user.id).eq('template_id', templateId).maybeSingle(),
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

  function handleWorkflowUnlocked() { setWorkflowUnlocked(true) }

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
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

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
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: 'rgba(37,211,102,0.09)', color: '#1a8c4e' }}>● Active</span>
              <span style={{ fontSize: 12, color: '#bbb' }}>{TONE_LABELS[agent.agent_tone] || agent.agent_tone}</span>
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

      <div className="glass" style={{ borderRadius: 20, overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.1s both' }}>
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
          {tab === 'chat' && <ChatTab userId={userId} agentName={agent.agent_name} templateId={templateId} />}
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
