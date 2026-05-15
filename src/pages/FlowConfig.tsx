import { supabase } from '../lib/supabase'
import { useState } from 'react'

interface Props {
  flowId?: string | null
  templateId?: string | null
  onBack: () => void
}

const TONES = [
  { id: 'bro', name: '😎 Bro', preview: "Bro just drop ur info real quick, I got something crazy for u 🔥" },
  { id: 'pro', name: '💼 Pro', preview: "Please provide your details and I will send you the information shortly." },
  { id: 'friendly', name: '😊 Friendly', preview: "Hey! I'd love to help you out — just share your name and I'll get started!" },
  { id: 'warm', name: '🤗 Warm', preview: "Hi sweetheart! Before I send this over, can I get your name? 😊" },
]

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="glass-strong"
        style={{ borderRadius: 20, padding: '28px 32px', width: 420, position: 'relative' }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#aaa', fontSize: 18, fontFamily: 'inherit',
          }}
        >
          <i className="ti ti-x" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  )
}

function GlassSection({ icon, title, children, defaultOpen = false }: {
  icon: string; title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="glass" style={{ borderRadius: 18, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.05)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className={`ti ${icon}`} style={{ fontSize: 16, color: '#444' }} aria-hidden="true" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{title}</span>
        </div>
        <i className="ti ti-chevron-up" style={{ fontSize: 16, color: '#aaa', transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} aria-hidden="true" />
      </div>
      {open && <div style={{ padding: '0 20px 20px', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>{children}</div>}
    </div>
  )
}

function Field({ label, placeholder, type = 'text', hint, value, onChange }: {
  label: string; placeholder: string; type?: string; hint?: string
  value?: string; onChange?: (v: string) => void
}) {
  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#111',
    outline: 'none', fontFamily: 'inherit', width: '100%',
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>{label}</label>
      {hint && <span style={{ fontSize: 11, color: '#aaa', marginTop: -3 }}>{hint}</span>}
      {type === 'textarea' ? (
        <textarea placeholder={placeholder} rows={3} value={value} onChange={e => onChange?.(e.target.value)}
          style={{ ...inputStyle, resize: 'vertical' }} />
      ) : (
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)}
          style={inputStyle} />
      )}
    </div>
  )
}

// ─── SCRIPT: BOOKING WITH LEAD MAGNET ────────────────────────────────────────

function ScriptBookingWithLM() {
  const [scriptMode, setScriptMode] = useState<null | 'proven' | 'scratch'>(null)
  const [scratchText, setScratchText] = useState('')
  const [source, setSource] = useState('')
  const [niche, setNiche] = useState('')
  const [magnetType, setMagnetType] = useState('')
  const [magnetLink, setMagnetLink] = useState('')
  const [promise, setPromise] = useState('')
  const [teaser, setTeaser] = useState('')
  const [greeting, setGreeting] = useState('')

  const greetingText = greeting || 'Wa alaykoum salam'
  const sourceLine = source ? `you came from ${source}` : 'you came from TikTok'
  const nicheLine = niche ? `because you want to ${niche}` : 'because you want to start making money from home'
  const magnetLine = magnetType || 'guide'
  const promiseLine = promise || "In 4 minutes, you'll understand how simple it is to get paid online"
  const teaserLine = teaser || "don't skip page 14…👀"

  const scriptPreview = `${greetingText} 👋 Just to confirm — ${sourceLine} ${nicheLine}, right?

(Lead replies)

Perfect 😊 Before I send your ${magnetLine}, what's your name?

(Lead replies)

Nice to meet you, [NAME] 👍
Quick question so I send you the right thing — Have you ever made money online before, or not yet?

(Lead replies)

And do you understand how it works fully, or are you just starting?

(Lead replies)

Great so this is the right thing for you!
I'll send you your ${magnetLine} now. ${promiseLine}.
Then if you like it, we'll talk about what you should do next to make your first sale as fast as possible insha'Allah
Sounds good to you?

(Lead replies)

Perfect so here's your ${magnetLine}: ${magnetLink || '(your link)'}
Take 4 minutes to read it now 👍
When you finish, send me "done" and I'll show you the next step
Ah and ${teaserLine}`

  return (
    <GlassSection icon="ti-script" title="Script 1 — Lead Qualification + Lead Magnet" defaultOpen={false}>
      {scriptMode === null && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <ScriptModeCard icon="ti-wand" title="Customize the proven script" desc="Start from our battle-tested template and fill in your details." onClick={() => setScriptMode('proven')} />
          <ScriptModeCard icon="ti-pencil" title="Start from scratch" desc="Write your own custom welcome script from a blank page." onClick={() => setScriptMode('scratch')} />
        </div>
      )}
      {scriptMode === 'proven' && (
        <div style={{ marginTop: 16 }}>
          <BackButton onClick={() => setScriptMode(null)} />
          <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>Fill in the fields and watch your script update live below.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Traffic source" placeholder="e.g. TikTok, Instagram..." hint="Where are your leads coming from?" value={source} onChange={setSource} />
              <Field label="Niche / pain point" placeholder="e.g. start making money from home" hint="What does your audience want?" value={niche} onChange={setNiche} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Lead magnet type" placeholder="e.g. guide, ebook, video..." value={magnetType} onChange={setMagnetType} />
              <Field label="Lead magnet link" placeholder="https://..." type="url" value={magnetLink} onChange={setMagnetLink} />
            </div>
            <Field label="Outcome promise" placeholder="e.g. In 4 minutes, you'll understand how simple it is to get paid online" hint="What will they get after consuming the lead magnet?" value={promise} onChange={setPromise} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Page teaser (optional)" placeholder="e.g. don't skip page 14..." hint="A curiosity hook." value={teaser} onChange={setTeaser} />
              <Field label="Custom greeting (optional)" placeholder="e.g. Wa alaykoum salam, Hey..." value={greeting} onChange={setGreeting} />
            </div>
            <LivePreview script={scriptPreview} />
          </div>
        </div>
      )}
      {scriptMode === 'scratch' && (
        <ScratchMode text={scratchText} onChange={setScratchText} onBack={() => setScriptMode(null)} />
      )}
    </GlassSection>
  )
}

// ─── SCRIPT: BOOKING WITHOUT LEAD MAGNET ─────────────────────────────────────

function ScriptBookingWithoutLM() {
  const [scriptMode, setScriptMode] = useState<null | 'proven' | 'scratch'>(null)
  const [scratchText, setScratchText] = useState('')
  const [source, setSource] = useState('')
  const [painPoint, setPainPoint] = useState('')
  const [greeting, setGreeting] = useState('')
  const [callLength, setCallLength] = useState('')
  const [callPurpose, setCallPurpose] = useState('')

  const greetingText = greeting || 'Hey'
  const sourceLine = source ? `you reached out from ${source}` : 'you reached out'
  const painLine = painPoint ? `because you want to ${painPoint}` : 'because you want to grow your business'
  const callLengthLine = callLength || '20-min'
  const callPurposeLine = callPurpose || 'show you exactly how this works for your situation'

  const scriptPreview = `${greetingText} 👋 Just to confirm — ${sourceLine} ${painLine}, right?

(Lead replies)

Perfect 😊 What's your name?

(Lead replies)

Nice to meet you, [NAME] 👍
Quick question — what's your biggest challenge right now when it comes to getting clients?

(Lead replies)

I hear you. And are you currently doing any kind of outreach, or is it mostly coming to you?

(Lead replies)

Got it — so you're at the stage where the right system would make a big difference.

Let me ask you this — on a scale of 1 to 10, how serious are you about changing that in the next 30 days?

(Lead replies)

That's what I needed to know 💪

I'd love to jump on a quick ${callLengthLine} call with you to ${callPurposeLine}.
No pressure — just a real conversation.

Want to lock in a time? 📅`

  return (
    <GlassSection icon="ti-script" title="Script 1 — Lead Qualification + Direct Booking" defaultOpen={false}>
      {scriptMode === null && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <ScriptModeCard icon="ti-wand" title="Customize the proven script" desc="Start from our battle-tested template and fill in your details." onClick={() => setScriptMode('proven')} />
          <ScriptModeCard icon="ti-pencil" title="Start from scratch" desc="Write your own custom welcome script from a blank page." onClick={() => setScriptMode('scratch')} />
        </div>
      )}
      {scriptMode === 'proven' && (
        <div style={{ marginTop: 16 }}>
          <BackButton onClick={() => setScriptMode(null)} />
          <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>Fill in the fields and watch your script update live below.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Traffic source" placeholder="e.g. TikTok, Instagram..." hint="Where are your leads coming from?" value={source} onChange={setSource} />
              <Field label="Pain point / goal" placeholder="e.g. grow your business, get more clients" hint="What does your lead want?" value={painPoint} onChange={setPainPoint} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Call length" placeholder="e.g. 20-min, 30-min" hint="How long is your discovery call?" value={callLength} onChange={setCallLength} />
              <Field label="Call purpose" placeholder="e.g. show you how this works for your situation" value={callPurpose} onChange={setCallPurpose} />
            </div>
            <Field label="Custom greeting (optional)" placeholder="e.g. Wa alaykoum salam, Hey..." value={greeting} onChange={setGreeting} />
            <LivePreview script={scriptPreview} />
          </div>
        </div>
      )}
      {scriptMode === 'scratch' && (
        <ScratchMode text={scratchText} onChange={setScratchText} onBack={() => setScriptMode(null)} />
      )}
    </GlassSection>
  )
}

// ─── SCRIPT: CLOSE IN CHAT ───────────────────────────────────────────────────

function ScriptCloseInChat() {
  const [qualifyMode, setQualifyMode] = useState<null | 'proven' | 'scratch'>(null)
  const [closeMode, setCloseMode] = useState<null | 'proven' | 'scratch'>(null)
  const [qualifyScratch, setQualifyScratch] = useState('')
  const [closeScratch, setCloseScratch] = useState('')

  const [source, setSource] = useState('')
  const [offerName, setOfferName] = useState('')
  const [offerOutcome, setOfferOutcome] = useState('')
  const [offerBenefit1, setOfferBenefit1] = useState('')
  const [offerBenefit2, setOfferBenefit2] = useState('')
  const [offerBenefit3, setOfferBenefit3] = useState('')
  const [greeting, setGreeting] = useState('')
  const [ctaLine, setCtaLine] = useState('')

  const greetingText = greeting || 'Hey'
  const sourceLine = source ? `you reached out from ${source}` : 'you reached out'
  const offerLine = offerName || 'our program'
  const outcomeLine = offerOutcome || 'increase your revenue without working more hours'
  const b1 = offerBenefit1 || 'You get the full system'
  const b2 = offerBenefit2 || 'Direct support from me'
  const b3 = offerBenefit3 || 'First results in 30 days'
  const ctaText = ctaLine || 'Are you ready to get started today?'

  const qualifyScript = `${greetingText} 👋 Just to confirm — ${sourceLine} because you're interested in ${offerLine}, right?

(Lead replies)

Perfect! What's your name?

(Lead replies)

Nice [NAME] 👍 Quick question — what made you reach out today specifically?

(Lead replies)

That makes sense. And right now — what's the main thing you're trying to solve?

(Lead replies)

Got it. And if you had a solution to that in the next 30 days, what would that change for you?

(Lead replies)

I love that. You're exactly the kind of person this is built for.`

  const closeScript = `So here's what happens inside ${offerLine}:

Your goal is to ${outcomeLine}.

Here's what you get:
✅ ${b1}
✅ ${b2}
✅ ${b3}

${ctaText} 🚀

(Lead replies)

Amazing — let me get you set up right now 👇`

  return (
    <>
      {/* Script 1: Qualify */}
      <GlassSection icon="ti-script" title="Script 1 — Lead Qualification" defaultOpen={false}>
        {qualifyMode === null && (
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <ScriptModeCard icon="ti-wand" title="Customize the proven script" desc="Start from our battle-tested template and fill in your details." onClick={() => setQualifyMode('proven')} />
            <ScriptModeCard icon="ti-pencil" title="Start from scratch" desc="Write your own custom qualification script." onClick={() => setQualifyMode('scratch')} />
          </div>
        )}
        {qualifyMode === 'proven' && (
          <div style={{ marginTop: 16 }}>
            <BackButton onClick={() => setQualifyMode(null)} />
            <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>Fill in the fields and watch your script update live below.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Traffic source" placeholder="e.g. TikTok, Instagram..." hint="Where are your leads coming from?" value={source} onChange={setSource} />
                <Field label="Offer name" placeholder="e.g. our coaching program, the course..." value={offerName} onChange={setOfferName} />
              </div>
              <Field label="Custom greeting (optional)" placeholder="e.g. Wa alaykoum salam, Hey..." value={greeting} onChange={setGreeting} />
              <LivePreview script={qualifyScript} />
            </div>
          </div>
        )}
        {qualifyMode === 'scratch' && (
          <ScratchMode text={qualifyScratch} onChange={setQualifyScratch} onBack={() => setQualifyMode(null)} />
        )}
      </GlassSection>

      {/* Script 2: Close */}
      <GlassSection icon="ti-currency-dollar" title="Script 2 — Closing Script" defaultOpen={false}>
        {closeMode === null && (
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <ScriptModeCard icon="ti-wand" title="Customize the proven script" desc="Start from our battle-tested closing template." onClick={() => setCloseMode('proven')} />
            <ScriptModeCard icon="ti-pencil" title="Start from scratch" desc="Write your own custom closing script." onClick={() => setCloseMode('scratch')} />
          </div>
        )}
        {closeMode === 'proven' && (
          <div style={{ marginTop: 16 }}>
            <BackButton onClick={() => setCloseMode(null)} />
            <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>Fill in your offer details and watch the closing script build itself.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Offer name" placeholder="e.g. the mentorship, our program..." value={offerName} onChange={setOfferName} />
              <Field label="Main outcome" placeholder="e.g. increase your revenue without working more hours" hint="What transformation does your offer give?" value={offerOutcome} onChange={setOfferOutcome} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <Field label="Benefit 1" placeholder="e.g. Full system access" value={offerBenefit1} onChange={setOfferBenefit1} />
                <Field label="Benefit 2" placeholder="e.g. Direct support" value={offerBenefit2} onChange={setOfferBenefit2} />
                <Field label="Benefit 3" placeholder="e.g. Results in 30 days" value={offerBenefit3} onChange={setOfferBenefit3} />
              </div>
              <Field label="CTA line" placeholder="e.g. Are you ready to get started today?" value={ctaLine} onChange={setCtaLine} />
              <LivePreview script={closeScript} />
            </div>
          </div>
        )}
        {closeMode === 'scratch' && (
          <ScratchMode text={closeScratch} onChange={setCloseScratch} onBack={() => setCloseMode(null)} />
        )}
      </GlassSection>
    </>
  )
}

// ─── SHARED SMALL COMPONENTS ─────────────────────────────────────────────────

function ScriptModeCard({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="glass"
      style={{ borderRadius: 14, padding: '20px', cursor: 'pointer', transition: 'all 0.15s', border: '0.5px solid rgba(0,0,0,0.08)' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}
    >
      <div style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.05)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 18, color: '#333' }} aria-hidden="true" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 11, color: '#888', lineHeight: 1.55 }}>{desc}</div>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16, padding: 0 }}>
      ← Change mode
    </button>
  )
}

function LivePreview({ script }: { script: string }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>Live script preview</div>
      <div className="glass" style={{ borderRadius: 14, padding: '16px 18px' }}>
        <pre style={{ fontSize: 12, color: '#444', lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
          {script}
        </pre>
      </div>
    </div>
  )
}

function ScratchMode({ text, onChange, onBack }: { text: string; onChange: (v: string) => void; onBack: () => void }) {
  return (
    <div style={{ marginTop: 16 }}>
      <BackButton onClick={onBack} />
      <div style={{ marginBottom: 14 }}>
        <a href="https://hollmann.international/vehicle/26G0794/" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: '#111', textDecoration: 'underline', fontWeight: 500 }}>
          How to write my welcome script?
        </a>
      </div>
      <textarea
        placeholder="Write your script here..."
        value={text}
        onChange={e => onChange(e.target.value)}
        rows={16}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.7)',
          border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12,
          padding: '14px', fontSize: 13, color: '#111',
          outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.7,
        }}
      />
    </div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const TEMPLATE_TITLES: Record<string, string> = {
  'booking-with-lm': 'Configure your booking flow w/ lead magnet',
  'booking-without-lm': 'Configure your direct booking flow',
  'close-in-chat': 'Configure your chat closing flow',
}

const TEMPLATE_SUBTITLES: Record<string, string> = {
  'booking-with-lm': 'Set up your WhatsApp agent in a few steps.',
  'booking-without-lm': 'Set up your direct booking agent in a few steps.',
  'close-in-chat': 'Set up your chat closing agent in a few steps.',
}

const TEMPLATE_SAVE_LABELS: Record<string, string> = {
  'booking-with-lm': 'Save & activate booking flow',
  'booking-without-lm': 'Save & activate booking flow',
  'close-in-chat': 'Save & activate closing flow',
}

export default function FlowConfig({ onBack, flowId, templateId }: Props) {
  const [selectedTone, setSelectedTone] = useState('friendly')
  const [receiveModal, setReceiveModal] = useState(false)
  const [sendModal, setSendModal] = useState(false)
  const [receiveConnected, setReceiveConnected] = useState(false)
  const [sendConnected, setSendConnected] = useState(false)
  const [receiveForm, setReceiveForm] = useState({ clientId: '', clientSecret: '' })
  const [sendForm, setSendForm] = useState({ accessToken: '', businessId: '' })
  const [agentName, setAgentName] = useState('')
  const [agentPersonality, setAgentPersonality] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const key = templateId || 'booking-with-lm'
  const title = TEMPLATE_TITLES[key] || TEMPLATE_TITLES['booking-with-lm']
  const subtitle = TEMPLATE_SUBTITLES[key] || TEMPLATE_SUBTITLES['booking-with-lm']
  const saveLabel = TEMPLATE_SAVE_LABELS[key] || TEMPLATE_SAVE_LABELS['booking-with-lm']

  return (
    <div style={{ padding: '32px 48px', maxWidth: 860, margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'inherit', marginBottom: 24, padding: 0 }}
        onMouseEnter={e => (e.currentTarget.style.color = '#111')}
        onMouseLeave={e => (e.currentTarget.style.color = '#888')}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 15 }} aria-hidden="true" />
        Back
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.5px', marginBottom: 4 }}>{title}</h1>
      <p style={{ fontSize: 14, color: '#999', marginBottom: 28 }}>{subtitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── INTEGRATIONS (shared) ── */}
        <GlassSection icon="ti-plug" title="Integrations" defaultOpen={true}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
            <div className="glass" style={{ borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-brand-whatsapp" style={{ fontSize: 20, color: '#25D366' }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>WhatsApp Receive</div>
                  <div style={{ fontSize: 11, color: receiveConnected ? '#25D366' : '#aaa' }}>{receiveConnected ? '✓ Connected' : 'Incoming messages'}</div>
                </div>
              </div>
              <button
                onClick={() => setReceiveModal(true)}
                style={{ background: receiveConnected ? 'rgba(37,211,102,0.1)' : '#111', color: receiveConnected ? '#1a8c4e' : '#fff', border: receiveConnected ? '0.5px solid rgba(37,211,102,0.4)' : 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {receiveConnected ? 'Reconnect' : 'Connect'}
              </button>
            </div>
            <div className="glass" style={{ borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-brand-whatsapp" style={{ fontSize: 20, color: '#25D366' }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>WhatsApp Send</div>
                  <div style={{ fontSize: 11, color: sendConnected ? '#25D366' : '#aaa' }}>{sendConnected ? '✓ Connected' : 'Outgoing messages'}</div>
                </div>
              </div>
              <button
                onClick={() => setSendModal(true)}
                style={{ background: sendConnected ? 'rgba(37,211,102,0.1)' : '#111', color: sendConnected ? '#1a8c4e' : '#fff', border: sendConnected ? '0.5px solid rgba(37,211,102,0.4)' : 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {sendConnected ? 'Reconnect' : 'Connect'}
              </button>
            </div>
          </div>
        </GlassSection>

        {/* ── TONE (shared) ── */}
        <GlassSection icon="ti-mood-smile" title="AI Agent Tone" defaultOpen={false}>
          <p style={{ fontSize: 12, color: '#999', marginTop: 14, marginBottom: 14 }}>Choose how your agent speaks to leads.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TONES.map(tone => (
              <div
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                style={{ background: 'rgba(255,255,255,0.6)', border: selectedTone === tone.id ? '1.5px solid #111' : '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 5 }}>{tone.name}</div>
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>{tone.preview}</div>
              </div>
            ))}
          </div>
        </GlassSection>

        {/* ── PERSONALITY (shared) ── */}
        <GlassSection icon="ti-user-circle" title="AI Agent Personality" defaultOpen={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            <Field label="Agent name" placeholder="e.g. Sofia, Max, Alex..." value={agentName} onChange={setAgentName} />
            <Field label="Personality description" placeholder="e.g. Energetic, empathetic, speaks simply and directly. Never salesy." type="textarea" hint="Describe how your agent should behave and feel to leads." value={agentPersonality} onChange={setAgentPersonality} />
          </div>
        </GlassSection>

        {/* ── TEMPLATE-SPECIFIC SCRIPTS ── */}
        {key === 'booking-with-lm' && <ScriptBookingWithLM />}
        {key === 'booking-without-lm' && <ScriptBookingWithoutLM />}
        {key === 'close-in-chat' && <ScriptCloseInChat />}

        {/* ── SAVE BUTTON ── */}
        <button
          onClick={() => setShowSuccess(true)}
          style={{ width: '100%', background: '#111', color: '#fff', border: 'none', borderRadius: 13, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <i className="ti ti-check" style={{ fontSize: 16 }} aria-hidden="true" />
          {saveLabel}
        </button>
      </div>

      {/* ── MODALS ── */}
      {receiveModal && (
        <Modal onClose={() => setReceiveModal(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>WhatsApp Receive</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>Enter your credentials to receive incoming WhatsApp messages.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Client ID" placeholder="Your WhatsApp Client ID" value={receiveForm.clientId} onChange={v => setReceiveForm(f => ({ ...f, clientId: v }))} />
            <Field label="Client Secret" placeholder="Your WhatsApp Client Secret" type="password" value={receiveForm.clientSecret} onChange={v => setReceiveForm(f => ({ ...f, clientSecret: v }))} />
          </div>
          <button onClick={() => { setReceiveConnected(true); setReceiveModal(false) }} style={{ width: '100%', marginTop: 20, background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Connect
          </button>
        </Modal>
      )}

      {sendModal && (
        <Modal onClose={() => setSendModal(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>WhatsApp Send</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>Enter your credentials to send WhatsApp messages to leads.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Access Token" placeholder="Your WhatsApp Access Token" type="password" value={sendForm.accessToken} onChange={v => setSendForm(f => ({ ...f, accessToken: v }))} />
            <Field label="Business Account ID" placeholder="Your Business Account ID" value={sendForm.businessId} onChange={v => setSendForm(f => ({ ...f, businessId: v }))} />
          </div>
          <button onClick={() => { setSendConnected(true); setSendModal(false) }} style={{ width: '100%', marginTop: 20, background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Connect
          </button>
        </Modal>
      )}

      {showSuccess && (
        <Modal onClose={() => setShowSuccess(false)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 56, height: 56, background: 'rgba(37,211,102,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className="ti ti-check" style={{ fontSize: 28, color: '#25D366' }} aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>Request sent!</h2>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>
              Your flow configuration has been saved. Your WhatsApp agent will be activated shortly.
            </p>
            <button onClick={() => setShowSuccess(false)} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
