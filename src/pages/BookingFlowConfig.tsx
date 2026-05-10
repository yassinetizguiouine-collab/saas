import { useState } from 'react'

interface Props {
  onBack: () => void
}

const TONES = [
  {
    id: 'bro',
    name: '😎 Bro',
    preview: "Bro just drop ur info real quick, I got something crazy for u 🔥",
  },
  {
    id: 'pro',
    name: '💼 Pro',
    preview: "Please provide your details and I will send you the information shortly.",
  },
  {
    id: 'friendly',
    name: '😊 Friendly',
    preview: "Hey! I'd love to help you out — just share your name and I'll get started!",
  },
  {
    id: 'warm',
    name: '🤗 Warm',
    preview: "Hi sweetheart! Before I send this over, can I get your name? 😊",
  },
]

function GlassSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="glass" style={{ borderRadius: 18, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'rgba(0,0,0,0.05)',
            borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className={`ti ${icon}`} style={{ fontSize: 16, color: '#444' }} aria-hidden="true" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{title}</span>
        </div>
        <i
          className="ti ti-chevron-up"
          style={{ fontSize: 16, color: '#aaa', transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}
          aria-hidden="true"
        />
      </div>

      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

function Field({ label, placeholder, type = 'text', hint }: { label: string; placeholder: string; type?: string; hint?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>{label}</label>
      {hint && <span style={{ fontSize: 11, color: '#aaa', marginTop: -3 }}>{hint}</span>}
      {type === 'textarea' ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          style={{
            background: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(0,0,0,0.12)',
            borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#111',
            outline: 'none', fontFamily: 'inherit', resize: 'vertical',
          }}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          style={{
            background: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(0,0,0,0.12)',
            borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#111',
            outline: 'none', fontFamily: 'inherit',
          }}
        />
      )}
    </div>
  )
}

export default function BookingFlowConfig({ onBack }: Props) {
  const [selectedTone, setSelectedTone] = useState('friendly')

  return (
    <div style={{ padding: '32px 48px', maxWidth: 820, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: '#888', fontSize: 13, cursor: 'pointer',
          border: 'none', background: 'none', fontFamily: 'inherit',
          marginBottom: 24, padding: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#111')}
        onMouseLeave={e => (e.currentTarget.style.color = '#888')}
      >
        <i className="ti ti-arrow-left" style={{ fontSize: 15 }} aria-hidden="true" />
        Back
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.5px', marginBottom: 4 }}>
        Configure your booking flow
      </h1>
      <p style={{ fontSize: 14, color: '#999', marginBottom: 28 }}>Set up your WhatsApp agent in a few steps.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Integrations */}
        <GlassSection icon="ti-plug" title="Integrations">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
            <div className="glass" style={{ borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-brand-whatsapp" style={{ fontSize: 20, color: '#25D366' }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>WhatsApp Receive</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>Incoming messages</div>
                </div>
              </div>
              <button style={{
                background: '#111', color: '#fff', border: 'none', borderRadius: 8,
                padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}>Connect</button>
            </div>
            <div className="glass" style={{ borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-brand-whatsapp" style={{ fontSize: 20, color: '#25D366' }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>WhatsApp Send</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>Outgoing messages</div>
                </div>
              </div>
              <button style={{
                background: '#111', color: '#fff', border: 'none', borderRadius: 8,
                padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}>Connect</button>
            </div>
          </div>
        </GlassSection>

        {/* AI Agent Tone */}
        <GlassSection icon="ti-mood-smile" title="AI Agent Tone">
          <p style={{ fontSize: 12, color: '#999', marginTop: 14, marginBottom: 14 }}>
            Choose how your agent speaks to leads. Each tone sends the same message, just differently.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TONES.map(tone => (
              <div
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  border: selectedTone === tone.id ? '1.5px solid #111' : '0.5px solid rgba(0,0,0,0.10)',
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 5 }}>{tone.name}</div>
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>{tone.preview}</div>
              </div>
            ))}
          </div>
        </GlassSection>

        {/* AI Agent Personality */}
        <GlassSection icon="ti-user-circle" title="AI Agent Personality">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            <Field label="Agent name" placeholder="e.g. Sofia, Max, Alex..." />
            <Field
              label="Personality description"
              placeholder="e.g. Energetic, empathetic, speaks simply and directly. Never salesy."
              type="textarea"
              hint="Describe how your agent should behave and feel to leads."
            />
          </div>
        </GlassSection>

        {/* Script 1 Config */}
        <GlassSection icon="ti-script" title="Script 1 — Lead Qualification">
          <p style={{ fontSize: 12, color: '#999', marginTop: 14, marginBottom: 16 }}>
            This script runs when a lead messages first. Customize it for your business.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field
                label="Traffic source"
                placeholder="e.g. TikTok, Instagram, Facebook..."
                hint="Where are your leads coming from?"
              />
              <Field
                label="Niche / pain point"
                placeholder="e.g. start making money from home"
                hint="What does your audience want?"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field
                label="Lead magnet type"
                placeholder="e.g. guide, ebook, video, checklist..."
              />
              <Field
                label="Lead magnet link"
                placeholder="https://..."
                type="url"
              />
            </div>
            <Field
              label="Outcome promise"
              placeholder="e.g. In 4 minutes, you'll understand how simple it is to get paid online"
              hint="What will they get / understand after consuming the lead magnet?"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field
                label="Page teaser (optional)"
                placeholder="e.g. don't skip page 14..."
                hint="A curiosity hook to get them to actually read it."
              />
              <Field
                label="Custom greeting (optional)"
                placeholder="e.g. Wa alaykoum salam, Hey, Hi there..."
              />
            </div>
          </div>
        </GlassSection>

        {/* Save */}
        <button
          style={{
            width: '100%', background: '#111', color: '#fff',
            border: 'none', borderRadius: 13,
            padding: '14px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <i className="ti ti-check" style={{ fontSize: 16 }} aria-hidden="true" />
          Save & activate booking flow
        </button>

      </div>
    </div>
  )
}
