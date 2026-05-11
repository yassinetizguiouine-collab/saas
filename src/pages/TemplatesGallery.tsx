import { useState } from 'react'

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
  Booking: { bg: 'rgba(37,211,102,0.08)', color: '#1a8c4e', border: '0.5px solid rgba(37,211,102,0.25)' },
  'Follow Up': { bg: 'rgba(124,77,204,0.08)', color: '#7c4dcc', border: '0.5px solid rgba(124,77,204,0.22)' },
  Closing: { bg: 'rgba(196,122,26,0.08)', color: '#c47a1a', border: '0.5px solid rgba(196,122,26,0.22)' },
}

interface Props {
  onSelect: (templateId: string) => void
}

export default function TemplatesGallery({ onSelect }: Props) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)

  const filtered = TEMPLATES.filter(t => {
    const matchFilter = activeFilter === 'All' || t.category === activeFilter
    const matchSearch =
      search.trim() === '' ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;700&display=swap');
        .tpl-root { font-family: 'Caveat', cursive !important; }
        .tpl-root * { font-family: 'Caveat', cursive !important; }
      `}</style>

      <div className="tpl-root" style={{ padding: '40px 48px', maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(37,211,102,0.08)', border: '0.5px solid rgba(37,211,102,0.3)',
            borderRadius: 20, padding: '5px 14px', fontSize: 14, color: '#1a8c4e',
            marginBottom: 16, fontWeight: 500,
          }}>
            <i className="ti ti-brand-whatsapp" style={{ fontSize: 14 }} aria-hidden="true" />
            WhatsApp AI Sales Agent
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#111', letterSpacing: '-0.3px', marginBottom: 8 }}>
            Choose your flow
          </h1>
          <p style={{ fontSize: 16, color: '#888', lineHeight: 1.6, maxWidth: 480 }}>
            Pick a template that matches your goal. Each one deploys a ready-made WhatsApp AI agent in minutes.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', fontSize: 16, pointerEvents: 'none' }} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px 11px 40px',
              border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12,
              background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)',
              fontSize: 16, color: '#111', outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '7px 18px', borderRadius: 20, fontSize: 15, fontWeight: 500,
                border: activeFilter === f ? 'none' : '0.5px solid rgba(0,0,0,0.12)',
                background: activeFilter === f ? '#111' : 'rgba(255,255,255,0.65)',
                color: activeFilter === f ? '#fff' : '#666',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Count */}
        <div style={{ fontSize: 14, color: '#bbb', marginBottom: 18 }}>
          {filtered.length} template{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#bbb' }}>
            <i className="ti ti-search-off" style={{ fontSize: 32, display: 'block', marginBottom: 12 }} aria-hidden="true" />
            <p style={{ fontSize: 16 }}>No templates found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 16 }}>
            {filtered.map(t => {
              const isHovered = hovered === t.id
              const tagStyle = TAG_STYLES[t.tag]
              return (
                <div
                  key={t.id}
                  onClick={() => onSelect(t.id)}
                  onMouseEnter={() => setHovered(t.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    background: 'rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(20px)',
                    border: isHovered ? '0.5px solid rgba(0,0,0,0.18)' : '0.5px solid rgba(255,255,255,0.95)',
                    boxShadow: isHovered ? '0 8px 32px rgba(0,0,0,0.10)' : '0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                    borderRadius: 18, padding: '22px 20px', cursor: 'pointer',
                    transition: 'all 0.18s',
                    transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}
                >
                  {/* Icon + tag */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{
                      width: 40, height: 40,
                      background: isHovered ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)',
                      borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s', flexShrink: 0,
                    }}>
                      <i className={`ti ${t.icon}`} style={{ fontSize: 20, color: '#333' }} aria-hidden="true" />
                    </div>
                    <span style={{
                      fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                      background: tagStyle.bg, color: tagStyle.color, border: tagStyle.border,
                    }}>
                      {t.tag}
                    </span>
                  </div>

                  {/* Text */}
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 6, lineHeight: 1.35 }}>
                      {t.title}
                    </h3>
                    <p style={{ fontSize: 15, color: '#888', lineHeight: 1.6 }}>
                      {t.desc}
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: '#bbb' }}>
                      <i className="ti ti-brand-whatsapp" style={{ fontSize: 14, color: '#25D366' }} aria-hidden="true" />
                      WhatsApp Agent
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 14, fontWeight: 600,
                      color: isHovered ? '#111' : '#aaa', transition: 'color 0.15s',
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
    </>
  )
}
