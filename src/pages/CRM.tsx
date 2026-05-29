import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Flow {
  id: string
  template_id: string
  template_title: string
  status: string
  config?: any
}

interface Lead {
  id: number
  phone_number: string
  lead_name: string | null
  stage: string
  created_at: string
  updated_at: string
  template_id: string
  flow_config_id: string | null
  magnet_sent_at?: string | null
  followup_sent_at?: string | null
  booked_at?: string | null
  calendar_link?: string | null
  session_time?: string | null
  notes?: string | null
  offer_sent_at?: string | null
  discount_sent_at?: string | null
  paid_at?: string | null
  payment_link?: string | null
  objections?: any[]
  emotional_state?: string | null
}

interface Props { onBack?: () => void }

const TEMPLATE_LABELS: Record<string, string> = {
  'booking-with-lm': 'Booking w/ LM',
  'booking-without-lm': 'Booking w/o LM',
  'close-in-chat': 'Close in Chat',
}
const TEMPLATE_ICONS: Record<string, string> = {
  'booking-with-lm': 'ti-calendar-plus',
  'booking-without-lm': 'ti-calendar-check',
  'close-in-chat': 'ti-message-2-check',
}

const BOOKING_STAGES = [
  { key: 'qualification', label: 'Trigger',      sub: 'WhatsApp',  icon: 'ti-bolt',            color: '#7c4dcc' },
  { key: 'magnet_sent',   label: 'Script 1',     sub: 'Welcome',   icon: 'ti-message-2',       color: '#378ADD' },
  { key: 'follow_up',     label: 'Lead Magnet',  sub: 'Send PDF',  icon: 'ti-file-download',   color: '#1a8c4e' },
  { key: 'booked',        label: 'Booking',      sub: 'Schedule',  icon: 'ti-calendar-check',  color: '#7c4dcc' },
  { key: 'lost',          label: 'Lost',         sub: 'No reply',  icon: 'ti-x',               color: '#e53e3e' },
]
const BOOKING_NO_LM_STAGES = [
  { key: 'qualification', label: 'Trigger',   sub: 'WhatsApp', icon: 'ti-bolt',           color: '#7c4dcc' },
  { key: 'follow_up',     label: 'Script 1',  sub: 'Welcome',  icon: 'ti-message-2',      color: '#378ADD' },
  { key: 'booked',        label: 'Booking',   sub: 'Schedule', icon: 'ti-calendar-check', color: '#1a8c4e' },
  { key: 'lost',          label: 'Lost',      sub: 'No reply', icon: 'ti-x',              color: '#e53e3e' },
]
const CLOSE_STAGES = [
  { key: 'qualification',  label: 'Trigger',   sub: 'WhatsApp', icon: 'ti-bolt',            color: '#7c4dcc' },
  { key: 'magnet_sent',    label: 'Script 1',  sub: 'Welcome',  icon: 'ti-message-2',       color: '#378ADD' },
  { key: 'offer_sent',     label: 'Offer',     sub: 'Sent',     icon: 'ti-tag',             color: '#c47a1a' },
  { key: 'discount_sent',  label: 'Discount',  sub: 'Sent',     icon: 'ti-percentage',      color: '#dd6b20' },
  { key: 'paid',           label: 'Paid',      sub: 'Closed',   icon: 'ti-circle-check',    color: '#1a8c4e' },
  { key: 'lost',           label: 'Lost',      sub: 'No reply', icon: 'ti-x',               color: '#e53e3e' },
]

function getStages(templateId: string) {
  if (templateId === 'close-in-chat') return CLOSE_STAGES
  if (templateId === 'booking-without-lm') return BOOKING_NO_LM_STAGES
  return BOOKING_STAGES
}
function getWinField(templateId: string, lead: Lead) {
  return templateId === 'close-in-chat' ? !!lead.paid_at : !!lead.booked_at
}
function getTable(templateId: string) {
  return templateId === 'close-in-chat' ? 'close_in_chat_leads' : 'booking_leads'
}
function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return days < 7 ? `${days}d ago` : new Date(ts).toLocaleDateString()
}
function formatDate(ts: string | null | undefined) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function initials(name: string | null, phone: string) {
  if (name) {
    const p = name.trim().split(' ')
    return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
  }
  return phone.slice(-2)
}

// ─── STAGE PILL ───────────────────────────────────────────────
function StagePill({ stage, templateId }: { stage: string; templateId: string }) {
  const stages = getStages(templateId)
  const s = stages.find(x => x.key === stage) || { label: stage, color: '#888' }
  const isWin = stage === 'booked' || stage === 'paid'
  const isLost = stage === 'lost'
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
      background: isWin ? 'rgba(37,211,102,0.09)' : isLost ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.05)',
      color: isWin ? '#1a8c4e' : isLost ? '#dc2626' : s.color,
      whiteSpace: 'nowrap',
    }}>
      {isWin ? '● ' : ''}{s.label}
    </span>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = '#7c4dcc' }: {
  icon: string; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="glass" style={{ borderRadius: 16, padding: '18px 20px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={`ti ${icon}`} style={{ fontSize: 15, color }} />
        </div>
        <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#bbb', marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

// ─── FUNNEL ───────────────────────────────────────────────────
function Funnel({ leads, templateId }: { leads: Lead[]; templateId: string }) {
  const stages = getStages(templateId)
  const total = leads.length || 1

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '20px 24px', marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 18 }}>
        Conversion funnel
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {stages.map((s, i) => {
          const count = leads.filter(l => l.stage === s.key).length
          const pct = Math.round((count / total) * 100)
          const isLast = i === stages.length - 1
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className="glass" style={{
                flex: 1, borderRadius: 14, padding: '16px 14px', textAlign: 'center',
                border: count > 0 ? `1px solid ${s.color}22` : '0.5px solid rgba(0,0,0,0.06)',
                background: count > 0 ? `${s.color}08` : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 11,
                  background: count > 0 ? `${s.color}15` : 'rgba(0,0,0,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px',
                }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize: 17, color: count > 0 ? s.color : '#ccc' }} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: count > 0 ? s.color : '#ddd', letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {count}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: count > 0 ? '#444' : '#ccc', marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>{s.sub}</div>
                {i > 0 && (
                  <div style={{ fontSize: 10, fontWeight: 600, color: count > 0 ? s.color : '#ddd', marginTop: 6 }}>
                    {pct}%
                  </div>
                )}
              </div>
              {!isLast && (
                <div style={{ flexShrink: 0, padding: '0 6px', color: '#ddd', fontSize: 14 }}>
                  <i className="ti ti-chevron-right" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── LEAD PANEL ───────────────────────────────────────────────
function LeadPanel({ lead, templateId, userId, onClose, onUpdate }: {
  lead: Lead; templateId: string; userId: string; onClose: () => void; onUpdate: (l: Lead) => void
}) {
  const [messages, setMessages] = useState<any[]>([])
  const [loadingMem, setLoadingMem] = useState(true)
  const [notes, setNotes] = useState(lead.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  useEffect(() => {
    async function loadMem() {
      const { data } = await supabase
        .from('agent_memory')
        .select('memory, updated_at')
        .eq('user_id', userId)
        .eq('template_id', templateId)
        .eq('phone_number', lead.phone_number)
        .maybeSingle()
      if (data?.memory) {
        try {
          const m = data.memory
          if (Array.isArray(m)) setMessages(m)
          else if (m.messages) setMessages(m.messages)
          else if (m.chat_history) setMessages(m.chat_history)
        } catch {}
      }
      setLoadingMem(false)
    }
    loadMem()
  }, [lead.phone_number])

  async function saveNotes() {
    setSavingNotes(true)
    await supabase.from(getTable(templateId)).update({ notes }).eq('id', lead.id)
    onUpdate({ ...lead, notes })
    setSavingNotes(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const stages = getStages(templateId)
  const isWin = getWinField(templateId, lead)
  const stageIdx = stages.findIndex(x => x.key === lead.stage)

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, zIndex: 100 }}>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.12)', zIndex: -1 }} />
      <div className="glass-strong" style={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '0.5px solid rgba(255,255,255,0.9)', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '20px 22px 18px', borderBottom: '0.5px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: isWin ? 'rgba(37,211,102,0.12)' : 'rgba(124,77,204,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: isWin ? '#1a8c4e' : '#7c4dcc', flexShrink: 0 }}>
            {initials(lead.lead_name, lead.phone_number)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 3 }}>{lead.lead_name || 'Unknown'}</div>
            <div style={{ fontSize: 12, color: '#aaa' }}>{lead.phone_number}</div>
          </div>
          <StagePill stage={lead.stage} templateId={templateId} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 4, fontSize: 18, fontFamily: 'inherit' }}>
            <i className="ti ti-x" />
          </button>
        </div>

        {/* Journey stepper */}
        <div style={{ padding: '18px 22px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Journey</div>
          <div style={{ display: 'flex' }}>
            {stages.map((s, i) => {
              const done = i <= stageIdx
              const current = i === stageIdx
              return (
                <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {i > 0 && <div style={{ flex: 1, height: 2, background: done ? s.color : 'rgba(0,0,0,0.08)', opacity: done ? 0.5 : 1 }} />}
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: done ? s.color : 'rgba(0,0,0,0.1)', border: current ? `2px solid ${s.color}` : 'none', flexShrink: 0, boxShadow: current ? `0 0 0 3px ${s.color}22` : 'none' }} />
                    {i < stages.length - 1 && <div style={{ flex: 1, height: 2, background: done && i < stageIdx ? s.color : 'rgba(0,0,0,0.08)', opacity: 0.5 }} />}
                  </div>
                  <span style={{ fontSize: 9, color: current ? s.color : '#bbb', fontWeight: current ? 700 : 400, textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity */}
        <div style={{ padding: '16px 22px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <DateRow label="Lead created" value={formatDate(lead.created_at)} />
            {lead.magnet_sent_at && <DateRow label="LM sent" value={formatDate(lead.magnet_sent_at)} color="#7c4dcc" />}
            {lead.followup_sent_at && <DateRow label="Follow-up sent" value={formatDate(lead.followup_sent_at)} color="#c47a1a" />}
            {lead.booked_at && <DateRow label="Booked ✓" value={formatDate(lead.booked_at)} color="#1a8c4e" />}
            {lead.offer_sent_at && <DateRow label="Offer sent" value={formatDate(lead.offer_sent_at)} color="#c47a1a" />}
            {lead.discount_sent_at && <DateRow label="Discount sent" value={formatDate(lead.discount_sent_at)} color="#dd6b20" />}
            {lead.paid_at && <DateRow label="Paid ✓" value={formatDate(lead.paid_at)} color="#1a8c4e" />}
            {lead.emotional_state && <DateRow label="Emotional state" value={lead.emotional_state} color="#888" />}
          </div>
        </div>

        {/* Conversation */}
        <div style={{ padding: '16px 22px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Conversation</div>
          {loadingMem ? (
            <div style={{ color: '#ccc', fontSize: 12 }}>Loading...</div>
          ) : messages.length === 0 ? (
            <div style={{ color: '#ccc', fontSize: 12 }}>No conversation recorded yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
              {messages.slice(-12).map((msg: any, i: number) => {
                const isHuman = msg.type === 'human' || msg.role === 'user' || msg.kwargs?.type === 'human'
                const text = msg.content || msg.text || msg.kwargs?.content || ''
                if (!text) return null
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isHuman ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: isHuman ? '12px 12px 3px 12px' : '12px 12px 12px 3px', background: isHuman ? 'rgba(37,211,102,0.1)' : 'rgba(0,0,0,0.04)', fontSize: 12, color: '#333', lineHeight: 1.5, border: isHuman ? '0.5px solid rgba(37,211,102,0.2)' : '0.5px solid rgba(0,0,0,0.07)' }}>
                      {text}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={{ padding: '16px 22px', flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Notes</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this lead..." rows={4}
            style={{ width: '100%', background: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#111', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }} />
          <button onClick={saveNotes} disabled={savingNotes}
            style={{ marginTop: 8, padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: notesSaved ? 'rgba(37,211,102,0.09)' : '#111', color: notesSaved ? '#1a8c4e' : '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            {notesSaved ? '✓ Saved' : savingNotes ? 'Saving...' : 'Save notes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DateRow({ label, value, color = '#999' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#aaa' }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}</span>
    </div>
  )
}

function EmptyState({ hasFlows }: { hasFlows: boolean }) {
  return (
    <div className="glass" style={{ borderRadius: 22, padding: '72px 40px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(124,77,204,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <i className="ti ti-users" style={{ fontSize: 26, color: '#7c4dcc' }} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>
        {hasFlows ? 'No leads yet' : 'No active flows'}
      </h3>
      <p style={{ fontSize: 13.5, color: '#aaa', lineHeight: 1.65, maxWidth: 320, margin: '0 auto' }}>
        {hasFlows ? 'Leads will appear here once your WhatsApp agent starts receiving messages.' : 'Deploy a flow first — leads will appear here once your agent is live.'}
      </p>
    </div>
  )
}

function StageFilterBtn({ label, active, color, onClick }: { label: string; active: boolean; color?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, background: active ? (color || '#111') : 'rgba(0,0,0,0.04)', color: active ? '#fff' : '#888', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', opacity: active ? 1 : 0.85 }}>
      {label}
    </button>
  )
}

function LeadRow({ lead, templateId, index, isSelected, onClick }: { lead: Lead; templateId: string; index: number; isSelected: boolean; onClick: () => void }) {
  const isWin = getWinField(templateId, lead)
  return (
    <div onClick={onClick}
      style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 80px', padding: '13px 20px', cursor: 'pointer', borderBottom: '0.5px solid rgba(0,0,0,0.05)', background: isSelected ? 'rgba(124,77,204,0.04)' : 'transparent', transition: 'background 0.15s', animation: `crm-up 0.3s ease ${index * 0.03}s both`, alignItems: 'center' }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.025)' }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: isWin ? 'rgba(37,211,102,0.09)' : 'rgba(124,77,204,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: isWin ? '#1a8c4e' : '#7c4dcc' }}>
          {initials(lead.lead_name, lead.phone_number)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.lead_name || <span style={{ color: '#ccc', fontWeight: 400 }}>Unknown</span>}
          </div>
          <div style={{ fontSize: 11.5, color: '#bbb' }}>{lead.phone_number}</div>
        </div>
      </div>
      <div><StagePill stage={lead.stage} templateId={templateId} /></div>
      <div style={{ fontSize: 12, color: '#bbb' }}>—</div>
      <div style={{ fontSize: 12, color: '#aaa' }}>{timeAgo(lead.updated_at)}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <i className="ti ti-chevron-right" style={{ fontSize: 15, color: isSelected ? '#7c4dcc' : '#ddd' }} />
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function CRM({ onBack }: Props) {
  const [userId, setUserId] = useState('')
  const [flows, setFlows] = useState<Flow[]>([])
  const [flowConfigs, setFlowConfigs] = useState<Record<string, string>>({}) // template_id → flow_config_id
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [stageFilter, setStageFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Get active flows
      const { data: flowsData } = await supabase
        .from('flows')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      const activeFlows = (flowsData as Flow[]) ?? []
      setFlows(activeFlows)

      // Get flow_config ids to filter leads correctly
      const { data: configs } = await supabase
        .from('flow_config')
        .select('id, template_id')
        .eq('user_id', user.id)
      const configMap: Record<string, string> = {}
      configs?.forEach((c: any) => { configMap[c.template_id] = c.id })
      setFlowConfigs(configMap)

      if (activeFlows.length > 0) setSelectedFlow(activeFlows[0])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedFlow || !userId) return
    loadLeads(selectedFlow, userId)
  }, [selectedFlow, userId])

  async function loadLeads(flow: Flow, uid: string) {
    setLeadsLoading(true)
    setLeads([])
    const table = getTable(flow.template_id)
    const flowConfigId = flowConfigs[flow.template_id]

    let query = supabase
      .from(table)
      .select('*')
      .eq('user_id', uid)
      .eq('template_id', flow.template_id)

    // Filter by flow_config_id if available for precise per-flow data
    if (flowConfigId) {
      query = query.eq('flow_config_id', flowConfigId)
    }

    const { data } = await query.order('updated_at', { ascending: false })
    setLeads((data as Lead[]) ?? [])
    setLeadsLoading(false)
  }

  const stages = selectedFlow ? getStages(selectedFlow.template_id) : []
  const filteredLeads = leads.filter(l => {
    const matchStage = stageFilter === 'all' || l.stage === stageFilter
    const matchSearch = !search || (l.lead_name?.toLowerCase().includes(search.toLowerCase())) || l.phone_number.includes(search)
    return matchStage && matchSearch
  })

  const totalLeads = leads.length
  const winLeads = selectedFlow ? leads.filter(l => getWinField(selectedFlow.template_id, l)).length : 0
  const convRate = totalLeads > 0 ? Math.round((winLeads / totalLeads) * 100) : 0
  const todayLeads = leads.filter(l => {
    const d = new Date(l.created_at), now = new Date()
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth()
  }).length

  if (loading) return (
    <div style={{ padding: '80px 40px', textAlign: 'center', color: '#ccc' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <i className="ti ti-loader-2" style={{ fontSize: 28, animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '48px 40px 80px', maxWidth: 1000, margin: '0 auto', fontFamily: 'inherit' }}>
      <style>{`
        @keyframes crm-up { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32, animation: 'crm-up 0.4s ease both', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: 'rgba(124,77,204,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-users" style={{ fontSize: 20, color: '#7c4dcc' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.04em' }}>CRM</h1>
            <p style={{ fontSize: 13, color: '#aaa', marginTop: 1 }}>Your leads, all in one place</p>
          </div>
        </div>
        {flows.length > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {flows.map(f => (
              <button key={f.id} onClick={() => { setSelectedFlow(f); setStageFilter('all'); setSearch('') }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, background: selectedFlow?.id === f.id ? '#111' : 'rgba(0,0,0,0.05)', color: selectedFlow?.id === f.id ? '#fff' : '#666', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                <i className={`ti ${TEMPLATE_ICONS[f.template_id] || 'ti-bolt'}`} style={{ fontSize: 13 }} />
                {TEMPLATE_LABELS[f.template_id] || f.template_title}
              </button>
            ))}
          </div>
        )}
      </div>

      {flows.length === 0 ? <EmptyState hasFlows={false} /> : (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, animation: 'crm-up 0.4s ease 0.05s both' }}>
            <StatCard icon="ti-users" label="Total leads" value={totalLeads} color="#7c4dcc" />
            <StatCard icon="ti-chart-bar" label="Conversion rate" value={`${convRate}%`} sub={`${winLeads} wins`} color="#1a8c4e" />
            <StatCard icon="ti-calendar-event" label="Today" value={todayLeads} sub="new leads" color="#c47a1a" />
            <StatCard icon={selectedFlow?.template_id === 'close-in-chat' ? 'ti-cash' : 'ti-calendar-check'} label={selectedFlow?.template_id === 'close-in-chat' ? 'Paid' : 'Booked'} value={winLeads} color="#25D366" />
          </div>

          {/* Funnel */}
          {leads.length > 0 && selectedFlow && (
            <div style={{ animation: 'crm-up 0.4s ease 0.1s both' }}>
              <Funnel leads={leads} templateId={selectedFlow.template_id} />
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, animation: 'crm-up 0.4s ease 0.15s both', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#ccc', pointerEvents: 'none' }} />
              <input type="text" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 9, paddingBottom: 9, background: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 10, fontSize: 13, color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <StageFilterBtn label="All" active={stageFilter === 'all'} onClick={() => setStageFilter('all')} />
              {stages.map(s => <StageFilterBtn key={s.key} label={s.label} active={stageFilter === s.key} color={s.color} onClick={() => setStageFilter(s.key)} />)}
            </div>
          </div>

          {/* Table */}
          <div className="glass" style={{ borderRadius: 18, overflow: 'hidden', animation: 'crm-up 0.4s ease 0.2s both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 80px', padding: '10px 20px', borderBottom: '0.5px solid rgba(0,0,0,0.07)', background: 'rgba(255,255,255,0.4)' }}>
              {['Lead', 'Stage', 'Source', 'Last activity', ''].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {leadsLoading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#ccc' }}>
                <i className="ti ti-loader-2" style={{ fontSize: 24, animation: 'spin 1s linear infinite' }} />
              </div>
            ) : filteredLeads.length === 0 ? (
              <EmptyState hasFlows={true} />
            ) : (
              filteredLeads.map((lead, i) => (
                <LeadRow key={lead.id} lead={lead} templateId={selectedFlow!.template_id} index={i} isSelected={selectedLead?.id === lead.id} onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)} />
              ))
            )}
          </div>
        </>
      )}

      {selectedLead && selectedFlow && (
        <LeadPanel lead={selectedLead} templateId={selectedFlow.template_id} userId={userId} onClose={() => setSelectedLead(null)}
          onUpdate={updated => { setLeads(ls => ls.map(l => l.id === updated.id ? updated : l)); setSelectedLead(updated) }} />
      )}
    </div>
  )
}
