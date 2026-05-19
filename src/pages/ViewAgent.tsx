import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

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
  bro: '😎 Bro',
  pro: '💼 Pro',
  friendly: '😊 Friendly',
  warm: '🤗 Warm',
}

// ─── TAB BUTTON ──────────────────────────────────────────────────────────────

function Tab({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
        background: active ? '#111' : 'transparent',
        color: active ? '#fff' : '#888',
        border: active ? 'none' : '0.5px solid transparent',
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#111' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#888' }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 14 }} />
      {label}
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
      {/* Stats row */}
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

      {/* Prompt box */}
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
      const data = await res.json()
      const reply = data?.reply || data?.message || data?.text || 'No response'
      setMessages(prev => [...prev, { role: 'agent', text: reply, ts: Date.now() }])
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: '⚠️ Connection error. Check n8n.', ts: Date.now() }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: 520 }}>
      {/* Chat area */}
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
              maxWidth: '72%',
              padding: '10px 14px',
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
        padding: '14px 0 0',
        borderTop: '0.5px solid rgba(0,0,0,0.07)',
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
            outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
            overflowY: 'hidden',
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

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function ViewAgent({ flowId, templateId, onBack }: Props) {
  const [agent, setAgent] = useState<AgentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'prompt' | 'chat'>('prompt')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: config }, { data: prompt }] = await Promise.all([
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
      ])

      setAgent({
        agent_name: config?.agent_name || 'Agent',
        agent_tone: config?.agent_tone || 'friendly',
        agent_personality: config?.agent_personality || '',
        system_prompt: prompt?.system_prompt || '',
      })
      setLoading(false)
    }
    load()
  }, [flowId, templateId])

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
      `}</style>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: '#aaa', fontFamily: 'inherit', fontWeight: 500,
          marginBottom: 28, padding: 0,
          transition: 'color 0.15s',
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
        </div>
      </div>
    </div>
  )
}
