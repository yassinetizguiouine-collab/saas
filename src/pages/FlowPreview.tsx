import { useRef, useState, useEffect } from 'react'

interface Props {
  onDeploy: () => void
  templateId?: string | null
}

// ─── SHARED WHATSAPP MOCKUP SHELL ───────────────────────────────────────────

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
  { type: 'recv', text: 'I hear you. And are you currently running any kind of outreach, or is it mostly word of mouth?', time: '2:13 PM' },
  { type: 'sent', text: 'Mostly word of mouth', time: '2:14 PM' },
  { type: 'recv', text: 'Got it — that\'s exactly what we fix 💪\nWant to book a quick 20-min call so I can show you what that looks like for your business specifically? 📅', time: '2:14 PM' },
]

const messagesCloseInChat = [
  { type: 'recv', text: 'Hey! 👋 You reached out about our offer — just to confirm you\'re still interested, right?', time: '4:05 PM' },
  { type: 'sent', text: 'Yes I am', time: '4:06 PM' },
  { type: 'recv', text: 'Great! What\'s your name?', time: '4:06 PM' },
  { type: 'sent', text: 'Karim', time: '4:07 PM' },
  { type: 'recv', text: 'Nice Karim 👍 Quick question — what made you reach out today specifically?', time: '4:07 PM' },
  { type: 'sent', text: 'I saw your post and it resonated with me', time: '4:08 PM' },
  { type: 'recv', text: 'That makes sense. And right now — what\'s the main thing you\'re trying to solve?', time: '4:08 PM' },
  { type: 'sent', text: 'I want to increase my revenue without working more hours', time: '4:09 PM' },
  { type: 'recv', text: 'That\'s exactly what this is built for 🎯\n\nHere\'s what happens when you join:\n✅ You get the full system\n✅ Direct support from me\n✅ First results in 30 days\n\nAre you ready to get started today? 🚀', time: '4:10 PM' },
  { type: 'sent', text: 'Yes let\'s do it', time: '4:11 PM' },
]

function WhatsAppMockup({ messages, agentName }: { messages: typeof messagesBookingWithLM; agentName: string }) {
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

  return (
    <div style={{
      width: '100%', height: 493, maxHeight: 493, borderRadius: 24,
      overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)',
      fontFamily: 'inherit', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: '#075e54', padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#128c7e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{agentName[0]}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{agentName}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>online</div>
        </div>
        <i className="ti ti-dots-vertical" style={{ color: '#fff', fontSize: 18 }} aria-hidden="true" />
      </div>

      <div ref={chatRef} style={{
        background: '#ece5dd', padding: '12px 10px', flex: 1,
        overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, scrollbarWidth: 'none',
      }}>
        {visibleMessages.map((msg, i) => (
          <div key={i} style={{
            maxWidth: '82%', padding: '7px 10px', borderRadius: 10,
            fontSize: 12, lineHeight: 1.45,
            alignSelf: msg.type === 'sent' ? 'flex-end' : 'flex-start',
            background: msg.type === 'sent' ? '#dcf8c6' : '#fff',
            borderBottomRightRadius: msg.type === 'sent' ? 2 : 10,
            borderBottomLeftRadius: msg.type === 'recv' ? 2 : 10,
            color: '#111', animation: 'fadeIn 0.3s ease',
          }}>
            {msg.text.split('\n').map((line, j) => (
              <span key={j}>{line}{j < msg.text.split('\n').length - 1 && <br />}</span>
            ))}
            <div style={{ fontSize: 10, color: '#999', textAlign: 'right', marginTop: 3 }}>{msg.time}</div>
          </div>
        ))}
        {showTyping && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            background: '#fff', borderRadius: 10, borderBottomLeftRadius: 2,
            padding: '8px 12px', alignSelf: 'flex-start',
          }}>
            {[0, 0.2, 0.4].map((delay, i) => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: '#aaa',
                animation: `bounce 1.2s ${delay}s infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }
      `}</style>
    </div>
  )
}

// ─── TEMPLATE CONFIGS ────────────────────────────────────────────────────────

const TEMPLATE_DATA = {
  'booking-with-lm': {
    badge: 'Booking Flow w/ Lead Magnet',
    title: 'Deploy your booking flow',
    subtitle: 'Your AI agent qualifies leads, sends your guide automatically, and books calls — 24/7 on WhatsApp.',
    saveLabel: 'Save & activate booking flow',
    cards: [
      { icon: 'ti-message-chatbot', title: 'Qualify leads automatically', desc: 'The agent asks the right questions to understand where your lead is and what they need.' },
      { icon: 'ti-send', title: 'Send your lead magnet', desc: 'Automatically delivers your guide or video link at the right moment in the conversation.' },
      { icon: 'ti-calendar-check', title: 'Book calls on autopilot', desc: 'Converts warm leads into booked calls without you lifting a finger.' },
    ],
    messages: messagesBookingWithLM,
    agentName: 'Booking Flow',
  },
  'booking-without-lm': {
    badge: 'Booking Flow w/o Lead Magnet',
    title: 'Deploy your direct booking flow',
    subtitle: 'Your AI agent qualifies leads and books calls directly — no guide needed, straight to the meeting.',
    saveLabel: 'Save & activate booking flow',
    cards: [
      { icon: 'ti-message-chatbot', title: 'Qualify leads instantly', desc: 'The agent identifies pain points and buying intent with precise NEPQ-style questions.' },
      { icon: 'ti-heart-handshake', title: 'Build trust fast', desc: 'Warms up leads through a natural conversation before presenting the booking offer.' },
      { icon: 'ti-calendar-check', title: 'Book calls on autopilot', desc: 'Moves qualified leads straight to booking without any manual follow-up.' },
    ],
    messages: messagesBookingWithoutLM,
    agentName: 'Sales Agent',
  },
  'close-in-chat': {
    badge: 'Close in WhatsApp Convo',
    title: 'Deploy your chat closing flow',
    subtitle: 'Your AI agent qualifies leads, handles objections, and closes the sale entirely inside WhatsApp.',
    saveLabel: 'Save & activate closing flow',
    cards: [
      { icon: 'ti-message-chatbot', title: 'Qualify & engage leads', desc: 'Opens the conversation naturally and identifies serious buyers from time-wasters instantly.' },
      { icon: 'ti-shield-check', title: 'Handle objections', desc: 'The agent responds to common objections with tailored responses that keep the sale alive.' },
      { icon: 'ti-currency-dollar', title: 'Close directly in chat', desc: 'Presents the offer at the right moment and guides the lead to a yes — no call needed.' },
    ],
    messages: messagesCloseInChat,
    agentName: 'Closer Agent',
  },
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function FlowPreview({ onDeploy, templateId }: Props) {
  const key = (templateId && templateId in TEMPLATE_DATA ? templateId : 'booking-with-lm') as keyof typeof TEMPLATE_DATA
  const t = TEMPLATE_DATA[key]

  return (
    <div style={{ padding: '40px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#999' }}>{t.badge}</span>
      </div>

      {/* TOP */}
      <div style={{ textAlign: 'center', marginBottom: 48, paddingTop: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(37,211,102,0.08)', border: '0.5px solid rgba(37,211,102,0.3)',
          borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#1a8c4e',
          marginBottom: 20, fontWeight: 500,
        }}>
          <i className="ti ti-brand-whatsapp" style={{ fontSize: 14 }} aria-hidden="true" />
          WhatsApp AI Sales Agent
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', letterSpacing: '-0.8px', marginBottom: 12 }}>
          {t.title}
        </h1>
        <p style={{ fontSize: 15, color: '#888', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
          {t.subtitle}
        </p>
      </div>

      {/* MIDDLE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, marginBottom: 40, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {t.cards.map((card, i) => (
            <div
              key={i}
              className="glass"
              style={{ borderRadius: 18, padding: '22px 20px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.10)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = ''
              }}
            >
              <div style={{
                width: 38, height: 38, background: 'rgba(0,0,0,0.05)',
                borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
              }}>
                <i className={`ti ${card.icon}`} style={{ fontSize: 19, color: '#333' }} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 6 }}>{card.title}</h3>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.55 }}>{card.desc}</p>
            </div>
          ))}
        </div>

        <WhatsAppMockup messages={t.messages} agentName={t.agentName} />
      </div>

      {/* BOTTOM */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onDeploy}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#111', color: '#fff', border: 'none', borderRadius: 13,
            padding: '14px 36px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.opacity = '0.82'
            ;(e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.opacity = '1'
            ;(e.currentTarget as HTMLElement).style.transform = 'scale(1)'
          }}
        >
          <i className="ti ti-rocket" style={{ fontSize: 16 }} aria-hidden="true" />
          Configure my flow
        </button>
        <p style={{ fontSize: 12, color: '#bbb', marginTop: 12 }}>Takes less than 5 minutes to configure</p>
      </div>
    </div>
  )
}
