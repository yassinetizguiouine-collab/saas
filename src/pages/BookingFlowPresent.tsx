interface Props {
  onDeploy: () => void
}

export default function BookingFlowPresent({ onDeploy }: Props) {
  return (
    <div style={{ padding: '40px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#999' }}>Booking Flow</span>
      </div>

      {/* TOP */}
      <div style={{ textAlign: 'center', marginBottom: 48, paddingTop: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(37,211,102,0.08)', border: '0.5px solid rgba(37,211,102,0.3)',
          borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#1a8c4e',
          marginBottom: 20, fontWeight: 500
        }}>
          <i className="ti ti-brand-whatsapp" style={{ fontSize: 14 }} aria-hidden="true" />
          WhatsApp AI Sales Agent
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', letterSpacing: '-0.8px', marginBottom: 12 }}>
          Deploy your booking flow
        </h1>
        <p style={{ fontSize: 15, color: '#888', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
          Your AI agent qualifies leads, sends your guide automatically, and books calls — 24/7 on WhatsApp.
        </p>
      </div>

      {/* MIDDLE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, marginBottom: 40, alignItems: 'start' }}>

        {/* Left: 3 stacked cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              icon: 'ti-message-chatbot',
              title: 'Qualify leads automatically',
              desc: 'The agent asks the right questions to understand where your lead is and what they need.',
            },
            {
              icon: 'ti-send',
              title: 'Send your lead magnet',
              desc: 'Automatically delivers your guide or video link at the right moment in the conversation.',
            },
            {
              icon: 'ti-calendar-check',
              title: 'Book calls on autopilot',
              desc: 'Converts warm leads into booked calls without you lifting a finger.',
            },
          ].map((card, i) => (
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
                width: 38, height: 38,
                background: 'rgba(0,0,0,0.05)',
                borderRadius: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                <i className={`ti ${card.icon}`} style={{ fontSize: 19, color: '#333' }} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 6 }}>{card.title}</h3>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.55 }}>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Right: Animated WhatsApp mockup */}
        <WhatsAppMockup />
      </div>

      {/* BOTTOM */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onDeploy}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#111', color: '#fff',
            border: 'none', borderRadius: 13,
            padding: '14px 36px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            transition: 'opacity 0.15s, transform 0.15s',
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
          Deploy now
        </button>
        <p style={{ fontSize: 12, color: '#bbb', marginTop: 12 }}>Takes less than 5 minutes to configure</p>
      </div>
    </div>
  )
}

const messages = [
  { type: 'recv', text: 'Hey! 👋 Are you looking to grow your business with more qualified leads?', time: '11:28 AM' },
  { type: 'sent', text: 'Yes, definitely!', time: '11:29 AM' },
  { type: 'recv', text: 'Great! Quick question — are you currently running any ads or relying on organic traffic?', time: '11:29 AM' },
  { type: 'sent', text: 'Mostly organic right now', time: '11:30 AM' },
  { type: 'recv', text: 'Perfect. Here\'s your free guide 👇\n\n🔗 example.com/your-guide\n\nTake 4 minutes to read it. When done, reply "done" and I\'ll show you the next step 👍', time: '11:31 AM' },
  { type: 'sent', text: 'done', time: '11:35 AM' },
  { type: 'recv', text: 'Amazing! Ready to book a quick call to see how this works for your business? 📅', time: '11:35 AM' },
]

function WhatsAppMockup() {
  const chatRef = useRef<HTMLDivElement>(null)
  const [visibleMessages, setVisibleMessages] = useState<typeof messages>([])
  const [showTyping, setShowTyping] = useState(false)
  const stepRef = useRef(0)

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
  }, [])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [visibleMessages, showTyping])

  return (
    <div style={{
      width: '100%',
      borderRadius: 24,
      overflow: 'hidden',
      border: '1px solid rgba(0,0,0,0.08)',
      fontFamily: 'inherit',
      display: 'flex',
      flexDirection: 'column',
      height: 420,
    }}>
      {/* Header */}
      <div style={{
        background: '#075e54',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <img src="/booking.png" alt="Booking Flow" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>Booking Flow</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>online</div>
        </div>
        <i className="ti ti-dots-vertical" style={{ color: '#fff', fontSize: 18 }} aria-hidden="true" />
      </div>

      {/* Chat body */}
      <div
        ref={chatRef}
        style={{
          background: '#ece5dd',
          padding: '12px 10px',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          scrollbarWidth: 'none',
        }}
      >
        {visibleMessages.map((msg, i) => (
          <div
            key={i}
            style={{
              maxWidth: '82%',
              padding: '7px 10px',
              borderRadius: 10,
              fontSize: 12,
              lineHeight: 1.45,
              alignSelf: msg.type === 'sent' ? 'flex-end' : 'flex-start',
              background: msg.type === 'sent' ? '#dcf8c6' : '#fff',
              borderBottomRightRadius: msg.type === 'sent' ? 2 : 10,
              borderBottomLeftRadius: msg.type === 'recv' ? 2 : 10,
              color: '#111',
              animation: 'fadeIn 0.3s ease',
            }}
          >
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
