import { useState, useEffect } from 'react'

interface Template {
  id: string
  category: 'Booking' | 'Follow Up' | 'Closing'
  title: string
  desc: string
  icon: string
  tag: string
}

const TEMPLATES: Template[] = [
  {
    id: 'booking-with-lm',
    category: 'Booking',
    title: 'Booking Flow w/ Lead Magnet',
    desc: 'Qualify leads, deliver your guide automatically, then book a call — all on WhatsApp.',
    icon: 'ti-calendar-plus',
    tag: 'Booking',
  },
  {
    id: 'booking-without-lm',
    category: 'Booking',
    title: 'Booking Flow w/o Lead Magnet',
    desc: 'Qualify leads and book a call directly — no guide needed, straight to the point.',
    icon: 'ti-calendar-check',
    tag: 'Booking',
  },
  {
    id: 'followup-post-call',
    category: 'Follow Up',
    title: 'Follow Up — Post Call',
    desc: 'Re-engage leads who have already booked a call. Keep momentum going after the conversation.',
    icon: 'ti-phone-check',
    tag: 'Follow Up',
  },
  {
    id: 'closing-with-lm',
    category: 'Closing',
    title: 'Closing Flow w/ Lead Magnet',
    desc: 'Convert warm leads who have consumed your guide into paying clients.',
    icon: 'ti-trophy',
    tag: 'Closing',
  },
  {
    id: 'closing-without-lm',
    category: 'Closing',
    title: 'Closing Flow w/o Lead Magnet',
    desc: 'Close leads directly without a lead magnet. For high-intent prospects ready to buy.',
    icon: 'ti-badge-check',
    tag: 'Closing',
  },
  {
    id: 'followup-reviews',
    category: 'Follow Up',
    title: 'Follow Up — Collect Reviews',
    desc: 'Automatically ask happy clients for reviews at the right moment after delivery.',
    icon: 'ti-star',
    tag: 'Follow Up',
  },
  {
    id: 'followup-referral',
    category: 'Follow Up',
    title: 'Follow Up — Referral',
    desc: 'Turn satisfied clients into your best sales reps. Automate referral requests on WhatsApp.',
    icon: 'ti-users-plus',
    tag: 'Follow Up',
  },
  {
    id: 'followup-warm',
    category: 'Follow Up',
    title: 'Follow Up — Keep List Warm',
    desc: 'Constantly nurture your lead list so no one goes cold. Stay top of mind, always.',
    icon: 'ti-flame',
    tag: 'Follow Up',
  },
]

const FILTERS = ['All', 'Booking', 'Follow Up', 'Closing'] as const
type Filter = typeof FILTERS[number]

const TAG_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Booking: { bg: 'rgba(37,211,102,0.12)', color: '#25d366', border: '0.5px solid rgba(37,211,102,0.3)' },
  'Follow Up': { bg: 'rgba(124,77,204,0.12)', color: '#a78bfa', border: '0.5px solid rgba(124,77,204,0.3)' },
  Closing: { bg: 'rgba(196,122,26,0.12)', color: '#f59e0b', border: '0.5px solid rgba(196,122,26,0.3)' },
}

interface Props {
  onSelect: (templateId: string) => void
}

export default function TemplatesGallery({ onSelect }: Props) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 200)
    return () => clearTimeout(t)
  }, [])

  const filtered = TEMPLATES.filter(t => {
    const matchFilter = activeFilter === 'All' || t.category === activeFilter
    const matchSearch =
      search.trim() === '' ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      padding: '60px 48px',
      fontFamily: 'inherit',
    }}>
      <style>{`
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tpl-card {
          animation: fadeUp 0.4s ease forwards;
        }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h1 style={{
            fontSize: 54,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-1.5px',
            lineHeight: 1.1,
            marginBottom: 20,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            Explore 100s of{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              flows
              <svg
                viewBox="0 0 180 12"
                style={{
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '110%',
                  height: 12,
                  overflow: 'visible',
                }}
              >
                <path
                  d="M 0 7 Q 45 1 90 6 Q 135 11 180 5"
                  stroke="#7c4dcc"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="220"
                  strokeDashoffset={drawn ? 0 : 220}
                  style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                />
              </svg>
            </span>
          </h1>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, maxWidth: 400, margin: '0 auto' }}>
            Pick a template that matches your goal. Each one deploys a ready-made WhatsApp AI agent in minutes.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16, maxWidth: 560, margin: '0 auto 16px' }}>
          <i className="ti ti-search" style={{
            position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
            color: '#444', fontSize: 16, pointerEvents: 'none',
          }} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '13px 16px 13px 44px',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)',
              fontSize: 14,
              color: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                border: activeFilter === f ? 'none' : '0.5px solid rgba(255,255,255,0.12)',
                background: activeFilter === f ? '#fff' : 'rgba(255,255,255,0.05)',
                color: activeFilter === f ? '#0a0a0a' : '#666',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Count */}
        <div style={{ fontSize: 12, color: '#333', marginBottom: 20, textAlign: 'left' }}>
          {filtered.length} template{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#444' }}>
            <i className="ti ti-search-off" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} aria-hidden="true" />
            <p style={{ fontSize: 14 }}>No templates found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map((t, i) => {
              const isHovered = hovered === t.id
              const tagStyle = TAG_STYLES[t.tag]
              return (
                <div
                  key={t.id}
                  className="tpl-card"
                  onClick={() => onSelect(t.id)}
                  onMouseEnter={() => setHovered(t.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    animationDelay: `${i * 0.05}s`,
                    opacity: 0,
                    background: isHovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: isHovered ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(255,255,255,0.07)',
                    boxShadow: isHovered ? '0 8px 40px rgba(0,0,0,0.4)' : 'none',
                    borderRadius: 20,
                    padding: '22px 20px',
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  {/* Icon + tag */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{
                      width: 40, height: 40,
                      background: isHovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
                      borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s', flexShrink: 0,
                    }}>
                      <i className={`ti ${t.icon}`} style={{ fontSize: 20, color: '#ccc' }} aria-hidden="true" />
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                      background: tagStyle.bg, color: tagStyle.color, border: tagStyle.border,
                    }}>
                      {t.tag}
                    </span>
                  </div>

                  {/* Text */}
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.35 }}>
                      {t.title}
                    </h3>
                    <p style={{ fontSize: 12, color: '#555', lineHeight: 1.65 }}>
                      {t.desc}
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#333' }}>
                      <i className="ti ti-brand-whatsapp" style={{ fontSize: 14, color: '#25D366' }} aria-hidden="true" />
                      WhatsApp Agent
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 12, fontWeight: 600,
                      color: isHovered ? '#fff' : '#333',
                      transition: 'color 0.15s',
                    }}>
                      Use template
                      <i className="ti ti-arrow-right" style={{ fontSize: 13 }} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
