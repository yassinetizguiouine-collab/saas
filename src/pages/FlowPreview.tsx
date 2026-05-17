import { useRef, useState, useEffect } from 'react'

interface Props {
  isRecommended?: boolean
  onDeploy: () => void
  templateId?: string | null
}

// ─── WHATSAPP ANIMATION (unchanged from original) ────────────────────────────

const messagesBookingWithLM = [
  { type: 'recv', text: 'Hey! 👋 Just to confirm — you came from TikTok because you want to start making money online, right?', time: '11:28 AM' },
  { type: 'sent', text: 'Yes exactly!', time: '11:29 AM' },
  { type: 'recv', text: 'Perfect 😊 Before I send your free guide, what\'s your name?', time: '11:29 AM' },
  { type: 'sent', text: 'Youssef', time: '11:30 AM' },
  { type: 'recv', text: 'Nice to meet you Youssef 👍\nHave you ever made money online before, or not yet?', time: '11:30 AM' },
  { type: 'sent', text: 'Not yet, just starting out', time: '11:31 AM' },
  { type: 'recv', text: 'Great so this is exactly the right thing for you!\n\nHere\'s your free guide 👇\n🔗 example.com/guide\n\nTake 4 minutes to read it. When done, reply "done" 👍', time: '11:31 AM' },
  { type: 'sent', text: 'done', time: '11:36 AM' },
  { type: 'recv', text: 'Amazing! Ready to book a quick call to see how this works for you? 📅', time: '11:36 AM' },
]

const messagesBookingWithoutLM = [
  { type: 'recv', text: 'Hey! 👋 Just to confirm — you reached out because you want to grow your business, right?', time: '2:10 PM' },
  { type: 'sent', text: 'Yes that\'s right', time: '2:11 PM' },
  { type: 'recv', text: 'Perfect 😊 What\'s your name?', time: '2:11 PM' },
  { type: 'sent', text: 'Sara', time: '2:12 PM' },
  { type: 'recv', text: 'Nice to meet you Sara 👍\nQuick question — what\'s your biggest challenge right now with getting clients?', time: '2:12 PM' },
  { type: 'sent', text: 'I don\'t have enough leads coming in', time: '2:13 PM' },
  { type: 'recv', text: 'Got it — that\'s exactly what we fix 💪\nWant to book a quick 20-min call so I can show you what that looks like for your business specifically? 📅', time: '2:14 PM' },
]

const messagesCloseInChat = [
  { type: 'recv', text: 'Hey! 👋 You reached out about our offer — just to confirm you\'re still interested, right?', time: '4:05 PM' },
  { type: 'sent', text: 'Yes I am', time: '4:06 PM' },
  { type: 'recv', text: 'Great! What\'s your name?', time: '4:06 PM' },
  { type: 'sent', text: 'Karim', time: '4:07 PM' },
  { type: 'recv', text: 'Nice Karim 👍 Quick question — what made you reach out today specifically?', time: '4:07 PM' },
  { type: 'sent', text: 'I saw your post and it resonated with me', time: '4:08 PM' },
  { type: 'recv', text: 'That\'s exactly what this is built for 🎯\n\nHere\'s what happens when you join:\n✅ You get the full system\n✅ Direct support from me\n✅ First results in 30 days\n\nAre you ready to get started today? 🚀', time: '4:10 PM' },
  { type: 'sent', text: 'Yes let\'s do it', time: '4:11 PM' },
]

function WhatsAppMockup({ messages, agentName, compact = false }: {
  messages: typeof messagesBookingWithLM; agentName: string; compact?: boolean
}) {
  const chatRef = useRef<HTMLDivElement>(null)
  const [visibleMessages, setVisibleMessages] = useState<typeof messages>([])
  const [showTyping, setShowTyping] = useState(false)
  const stepRef = useRef(0)

  useEffect(() => {
    setVisibleMessages([])
    stepRef.current = 0
  }, [messages])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    function showNext() {
      const step = stepRef.current
      if (step >= messages.length) {
        timeout = setTimeout(() => {
          setVisibleMessages([])
          stepRef.current = 0
          timeout = setTimeout(showNext, 600)
        }, 2500)
        return
      }
      const msg = messages[step]
      if (msg.type === 'recv') {
        setShowTyping(true)
        timeout = setTimeout(() => {
          setShowTyping(false)
          setVisibleMessages(prev => [...prev, msg])
          stepRef.current++
          timeout = setTimeout(showNext, 800)
        }, 1200)
      } else {
        setVisibleMessages(prev => [...prev, msg])
        stepRef.current++
        timeout = setTimeout(showNext, 900)
      }
    }
    timeout = setTimeout(showNext, 800)
    return () => clearTimeout(timeout)
  }, [messages])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [visibleMessages, showTyping])

  const height = compact ? 320 : 480

  return (
    <div style={{
      width: '100%', height, maxHeight: height, borderRadius: compact ? 16 : 22,
      overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: '#075e54', padding: compact ? '8px 12px' : '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <div style={{
          width: compact ? 28 : 36, height: compact ? 28 : 36,
          borderRadius: '50%', background: '#128c7e',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: compact ? 11 : 14 }}>{agentName[0]}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: compact ? 11 : 13, fontWeight: 500 }}>{agentName}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: compact ? 9 : 11 }}>online</div>
        </div>
        <i className="ti ti-dots-vertical" style={{ color: '#fff', fontSize: compact ? 15 : 18 }} />
      </div>

      <div ref={chatRef} style={{
        background: '#ece5dd', padding: compact ? '8px 8px' : '12px 10px',
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
        gap: compact ? 5 : 8, scrollbarWidth: 'none',
      }}>
        {visibleMessages.map((msg, i) => (
          <div key={i} style={{
            maxWidth: '82%', padding: compact ? '5px 8px' : '7px 10px', borderRadius: 10,
            fontSize: compact ? 10 : 12, lineHeight: 1.45,
            alignSelf: msg.type === 'sent' ? 'flex-end' : 'flex-start',
            background: msg.type === 'sent' ? '#dcf8c6' : '#fff',
            borderBottomRightRadius: msg.type === 'sent' ? 2 : 10,
            borderBottomLeftRadius: msg.type === 'recv' ? 2 : 10,
            color: '#111', animation: 'fadeIn 0.3s ease',
          }}>
            {msg.text.split('\n').map((line, j) => (
              <span key={j}>{line}{j < msg.text.split('\n').length - 1 && <br />}</span>
            ))}
            <div style={{ fontSize: compact ? 8 : 10, color: '#999', textAlign: 'right', marginTop: 3 }}>{msg.time}</div>
          </div>
        ))}
        {showTyping && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: '#fff', borderRadius: 10, borderBottomLeftRadius: 2,
            padding: compact ? '5px 8px' : '8px 12px', alignSelf: 'flex-start',
          }}>
            {[0, 0.2, 0.4].map((delay, i) => (
              <div key={i} style={{
                width: compact ? 4 : 6, height: compact ? 4 : 6,
                borderRadius: '50%', background: '#aaa',
                animation: `bounce 1.2s ${delay}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
      `}</style>
    </div>
  )
}

// ─── TEMPLATE DATA ────────────────────────────────────────────────────────────

const TEMPLATE_DATA = {
  'booking-with-lm': {
    badge: 'Lead Magnet Booking Flow',
    title: 'Lead Magnet Booking Flow',
    subtitle: 'Based on your onboarding answers, this funnel is designed to help you warm up cold leads, build trust automatically, and turn conversations into qualified discovery calls.',
    bestFor: 'Businesses that use a free guide, training, audit, checklist, webinar, or resource to warm up leads before booking calls.',
    result: 'Your leads feel warmed up before the call even happens.',
    cta: 'Turn cold leads into qualified discovery calls automatically.',
    steps: [
      'Leads come from your ads, content, or social media.',
      'They message your business to access your free offer.',
      'The AI starts a natural conversation and builds trust.',
      'Your lead magnet is delivered automatically.',
      'The system follows up, qualifies the lead, and guides them toward booking a discovery call.',
    ],
    why: [
      'Your offer benefits from trust-building before the sale',
      'You use content or free value to attract leads',
      'Discovery calls are part of your sales process',
      'Your leads may need nurturing before booking',
    ],
    messages: messagesBookingWithLM,
    agentName: 'Booking Agent',
  },
  'booking-without-lm': {
    badge: 'Direct Booking Flow',
    title: 'Direct Booking Flow',
    subtitle: 'Based on your onboarding answers, this funnel is designed to help you qualify inbound leads automatically and turn conversations into booked discovery calls.',
    bestFor: 'Businesses that already generate inbound interest and simply want more qualified calls booked automatically.',
    result: 'Spend less time qualifying leads manually and more time closing.',
    cta: 'Turn cold leads into booked discovery calls automatically.',
    steps: [
      'Leads come from your ads, content, or social media.',
      'They message your business to learn more or book a call.',
      'The AI starts a natural conversation and qualifies the lead.',
      'Questions are answered automatically in chat.',
      'Qualified leads are guided toward booking a discovery call.',
    ],
    why: [
      'You already generate inbound interest',
      'Your offer is clear and easy to understand',
      'Discovery calls are your main conversion goal',
      'You want to automate lead qualification and follow-up',
    ],
    messages: messagesBookingWithoutLM,
    agentName: 'Sales Agent',
  },
  'close-in-chat': {
    badge: 'Closing Flow',
    title: 'Closing Flow',
    subtitle: 'Based on your onboarding answers, this funnel is designed to help you build trust, qualify leads, and close customers directly in chat without relying on sales calls.',
    bestFor: 'Businesses selling lower-ticket offers or products that can close directly through chat.',
    result: 'Close more customers automatically without relying on discovery calls.',
    cta: 'Turn cold leads into customers directly in chat.',
    steps: [
      'Leads come from your ads, content, or social media.',
      'They message your business to access your free offer or learn more.',
      'The AI starts a natural conversation and builds trust.',
      'Your offer or resource is delivered automatically.',
      'The system follows up, handles objections, and guides qualified leads toward purchasing.',
    ],
    why: [
      'Your offer does not require a sales call to convert',
      'Your leads can make decisions directly in chat',
      'Speed and automation are important to your sales process',
      'You want to reduce manual selling and increase conversion efficiency',
    ],
    messages: messagesCloseInChat,
    agentName: 'Closer Agent',
  },
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function FlowPreview({ onDeploy, templateId, isRecommended = false }: Props) {
  const [demoOpen, setDemoOpen] = useState(false)

  const key = (templateId && templateId in TEMPLATE_DATA ? templateId : 'booking-with-lm') as keyof typeof TEMPLATE_DATA
  const t = TEMPLATE_DATA[key]

  // Close modal on Escape
  useEffect(() => {
    if (!demoOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDemoOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [demoOpen])

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = demoOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [demoOpen])

  return (
    <div style={{ padding: '48px 52px', maxWidth: 940, margin: '0 auto', fontFamily: 'inherit' }}>
      <style>{`
        @keyframes fp-up { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fp-fade { from { opacity:0 } to { opacity:1 } }
        @keyframes modal-in { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
        .demo-thumb:hover .demo-overlay { opacity: 1 !important; }
        .demo-thumb:hover { transform: scale(1.02); }
      `}</style>

      {/* Badge — only if this is the recommended flow */}
      {isRecommended && (
        <div style={{ marginBottom: 6, animation: 'fp-up 0.4s ease both' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(37,211,102,0.08)', border: '0.5px solid rgba(37,211,102,0.3)',
            borderRadius: 20, padding: '4px 12px', fontSize: 11, color: '#1a8c4e', fontWeight: 500,
          }}>
            <i className="ti ti-brand-whatsapp" style={{ fontSize: 12 }} />
            Your Recommended System
          </span>
        </div>
      )}

      {/* ── HERO ROW: Title + Demo Thumbnail ─────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32,
        alignItems: 'start', marginBottom: 40,
        animation: 'fp-up 0.45s 0.05s ease both',
      }}>
        {/* Left */}
        <div>
          <h1 style={{
            fontSize: 34, fontWeight: 800, color: '#111',
            letterSpacing: '-0.06em', lineHeight: 1.15, marginBottom: 14,
          }}>
            {t.title}
          </h1>
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7, maxWidth: 440, marginBottom: 28 }}>
            {t.subtitle}
          </p>

          {/* "What this does" pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#111', color: '#fff', borderRadius: 12,
            padding: '9px 18px', fontSize: 13, fontWeight: 600,
            marginBottom: 8,
          }}>
            <i className="ti ti-target" style={{ fontSize: 14 }} />
            {t.cta}
          </div>
        </div>

        {/* Right: Live Demo Thumbnail */}
        <div
          className="demo-thumb"
          onClick={() => setDemoOpen(true)}
          style={{
            position: 'relative', borderRadius: 20, overflow: 'hidden',
            cursor: 'pointer', transition: 'transform 0.2s ease',
            border: '0.5px solid rgba(0,0,0,0.09)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            height: 220,
          }}
        >
          {/* Blurred WhatsApp preview */}
          <div style={{ position: 'absolute', inset: 0, filter: 'blur(2px) brightness(0.92)', transform: 'scale(1.05)', pointerEvents: 'none' }}>
            <WhatsAppMockup messages={t.messages} agentName={t.agentName} compact />
          </div>

          {/* Overlay */}
          <div
            className="demo-overlay"
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.38)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: 0.92,
              transition: 'opacity 0.2s ease',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ti ti-player-play-filled" style={{ fontSize: 18, color: '#fff', marginLeft: 2 }} />
            </div>
            <span style={{
              fontSize: 12, fontWeight: 600, color: '#fff',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              borderRadius: 20, padding: '4px 12px',
              border: '0.5px solid rgba(255,255,255,0.25)',
              letterSpacing: '0.04em',
            }}>
              LIVE DEMO
            </span>
          </div>
        </div>
      </div>

      {/* ── CONTENT SECTIONS ─────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14,
        animation: 'fp-up 0.45s 0.1s ease both',
      }}>
        {/* Best for */}
        <div className="glass" style={{ borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.05)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-users" style={{ fontSize: 15, color: '#444' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Best for</span>
          </div>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65 }}>{t.bestFor}</p>
        </div>

        {/* Result */}
        <div className="glass" style={{ borderRadius: 18, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: 'rgba(37,211,102,0.1)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-trophy" style={{ fontSize: 15, color: '#1a8c4e' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Result</span>
          </div>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65 }}>{t.result}</p>
        </div>
      </div>

      {/* How it works */}
      <div className="glass" style={{ borderRadius: 18, padding: '24px 28px', marginTop: 14, animation: 'fp-up 0.45s 0.15s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.05)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-route" style={{ fontSize: 15, color: '#444' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>How it works</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {t.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, position: 'relative' }}>
              {/* Line */}
              {i < t.steps.length - 1 && (
                <div style={{
                  position: 'absolute', left: 15, top: 28, width: 1,
                  height: 'calc(100% - 4px)',
                  borderLeft: '1.5px dashed rgba(0,0,0,0.12)',
                }} />
              )}
              {/* Number */}
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: i === 0 ? '#111' : 'rgba(0,0,0,0.06)',
                color: i === 0 ? '#fff' : '#555',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 12,
                zIndex: 1, border: '2px solid rgba(255,255,255,0.8)',
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65, padding: '10px 0' }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why this matches — only for recommended flow */}
      {isRecommended && (
        <div className="glass" style={{ borderRadius: 18, padding: '24px 28px', marginTop: 14, animation: 'fp-up 0.45s 0.2s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.05)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-sparkles" style={{ fontSize: 15, color: '#444' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Why this matches your business</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {t.why.map((reason, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: 'rgba(37,211,102,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
              }}>
                <i className="ti ti-check" style={{ fontSize: 10, color: '#1a8c4e' }} />
              </div>
              <span style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{reason}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 32, textAlign: 'center', animation: 'fp-up 0.45s 0.25s ease both' }}>
        <button
          onClick={onDeploy}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#111', color: '#fff', border: 'none', borderRadius: 13,
            padding: '14px 40px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
        >
          <i className="ti ti-rocket" style={{ fontSize: 16 }} />
          Configure my flow
        </button>
        <p style={{ fontSize: 12, color: '#bbb', marginTop: 12 }}>Takes less than 5 minutes to configure</p>
      </div>

      {/* ── LIVE DEMO MODAL ───────────────────────────────────────────────── */}
      {demoOpen && (
        <div
          onClick={() => setDemoOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fp-fade 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 360, position: 'relative',
              animation: 'modal-in 0.25s ease',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setDemoOpen(false)}
              style={{
                position: 'absolute', top: -44, right: 0,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '0.5px solid rgba(255,255,255,0.25)',
                borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff', fontSize: 16,
              }}
            >
              <i className="ti ti-x" />
            </button>

            {/* Label */}
            <div style={{
              textAlign: 'center', marginBottom: 14,
              fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Live Demo — {t.badge}
            </div>

            {/* Full animation */}
            <WhatsAppMockup messages={t.messages} agentName={t.agentName} />
          </div>
        </div>
      )}
    </div>
  )
}
