interface Props {
  onDeploy: () => void
}

export default function BookingFlowPresent({ onDeploy }: Props) {
  return (
    <div style={{ padding: '40px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#999' }}>Booking Flow</span>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
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
