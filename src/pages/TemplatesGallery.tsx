import { useState, CSSProperties } from 'react'

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
    id: 'close-in-chat',
    category: 'Closing',
    title: 'Close in WhatsApp Convo',
    desc: 'Qualify leads, deliver your guide, and close the sale entirely inside WhatsApp — no call needed.',
    icon: 'ti-message-2-check',
    tag: 'Closing',
  },
]

const FILTERS = ['All', 'Booking', 'Closing'] as const
type Filter = typeof FILTERS[number]

const TAG_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Booking: {
    bg: 'rgba(37,211,102,0.08)',
    color: '#1a8c4e',
    border: '0.5px solid rgba(37,211,102,0.25)',
  },
  'Follow Up': {
    bg: 'rgba(124,77,204,0.08)',
    color: '#7c4dcc',
    border: '0.5px solid rgba(124,77,204,0.22)',
  },
  Closing: {
    bg: 'rgba(196,122,26,0.08)',
    color: '#c47a1a',
    border: '0.5px solid rgba(196,122,26,0.22)',
  },
}

const STYLE_ID = 'tg-keyframes'
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style')
  s.id = STYLE_ID
  s.textContent = `
    @keyframes tg-fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes tg-orb1 {
      0%,100% { transform: translate(0,0) scale(1); }
      50%     { transform: translate(60px,40px) scale(1.1); }
    }
    @keyframes tg-orb2 {
      0%,100% { transform: translate(0,0) scale(1); }
      50%     { transform: translate(-50px,-30px) scale(1.08); }
    }
    @keyframes tg-float {
      0%,100% { transform: translateY(0px) rotate(-8deg); }
      50%     { transform: translateY(-6px) rotate(-8deg); }
    }
  `
  document.head.appendChild(s)
}

function WhatsAppSvg({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function SquigglyUnderline() {
  return (
    <svg
      viewBox="0 0 286 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        bottom: -6,
        left: '-8%',
        width: '116%',
        height: 16,
        color: '#7c4dcc',
        opacity: 0.65,
        pointerEvents: 'none',
      }}
    >
      <path
        d="M2 10C20 4 40 14 60 8C80 2 100 14 120 8C140 2 160 14 180 8C200 2 220 14 240 8C260 2 270 10 284 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 13C24 7 44 17 64 11C84 5 104 17 124 11C144 5 164 17 184 11C204 5 224 17 244 11C264 5 274 13 282 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  )
}

function TemplateCard({
  template,
  onUseTemplate,
  animDelay,
  isRecommended,
}: {
  template: Template
  onUseTemplate: (id: string, title: string) => void
  animDelay: number
  isRecommended: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const tagStyle = TAG_STYLES[template.tag]

  const card: CSSProperties = {
    background: hovered
      ? isRecommended ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.72)'
      : isRecommended ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: isRecommended
      ? hovered ? '1px solid rgba(37,211,102,0.45)' : '1px solid rgba(37,211,102,0.28)'
      : hovered ? '0.5px solid rgba(0,0,0,0.14)' : '0.5px solid rgba(255,255,255,0.95)',
    borderRadius: 18,
    boxShadow: isRecommended
      ? hovered
        ? '0 12px 40px rgba(37,211,102,0.13), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)'
        : '0 4px 24px rgba(37,211,102,0.10), inset 0 1px 0 rgba(255,255,255,0.8)'
      : hovered
        ? '0 12px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)'
        : '0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
    padding: '22px 20px 18px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    position: 'relative',
    overflow: 'visible',
    transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
    transition: 'all 0.24s cubic-bezier(0.4,0,0.2,1)',
    animation: `tg-fadeUp 0.45s ease ${animDelay}s both`,
  }

  const iconWrap: CSSProperties = {
    width: 42,
    height: 42,
    borderRadius: 13,
    background: hovered ? 'rgba(124,77,204,0.10)' : 'rgba(0,0,0,0.05)',
    border: hovered ? '0.5px solid rgba(124,77,204,0.2)' : '0.5px solid rgba(0,0,0,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s ease',
  }

  const ctaColor = hovered ? '#7c4dcc' : '#aaa'

  return (
    <div
      onClick={() => onUseTemplate(template.id, template.title)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={card}
    >
      {/* Character sticker poking out of the top-right — only for recommended */}
      {isRecommended && (
        <img
          src="/ChatGPT Image 18 mai 2026, 09_10_46.png"
          alt="Recommended"
          style={{
            position: 'absolute',
            top: -38,
            right: -12,
            width: 80,
            height: 80,
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 10,
            animation: 'tg-float 3s ease-in-out infinite',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
          }}
        />
      )}

      {/* Shine line */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)',
        pointerEvents: 'none',
        borderRadius: 18,
      }} />

      {/* Recommended badge — top-left inside card */}
      {isRecommended && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: 'rgba(37,211,102,0.12)',
          border: '0.5px solid rgba(37,211,102,0.35)',
          borderRadius: 100,
          padding: '3px 10px',
          fontSize: 10.5,
          fontWeight: 700,
          color: '#1a8c4e',
          letterSpacing: '0.01em',
          zIndex: 1,
        }}>
          ✨ Recommended flow
        </div>
      )}

      {/* Top row — push down if recommended badge is showing */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: isRecommended ? 20 : 0,
      }}>
        <div style={iconWrap}>
          <i
            className={`ti ${template.icon}`}
            style={{ fontSize: 20, color: hovered ? '#7c4dcc' : '#444', transition: 'color 0.2s' }}
            aria-hidden="true"
          />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 100,
          background: tagStyle.bg, color: tagStyle.color, border: tagStyle.border,
          letterSpacing: '0.01em', whiteSpace: 'nowrap',
        }}>
          {template.tag}
        </span>
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 6, lineHeight: 1.35, letterSpacing: '-0.01em' }}>
          {template.title}
        </h3>
        <p style={{ fontSize: 12.5, color: '#666', lineHeight: 1.65, margin: 0 }}>
          {template.desc}
        </p>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 14, borderTop: '0.5px solid rgba(0,0,0,0.07)', marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#bbb' }}>
          <WhatsAppSvg size={14} />
          WhatsApp Agent
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: hovered ? 7 : 5,
          fontSize: 12, fontWeight: 600, color: ctaColor,
          transition: 'all 0.2s ease',
        }}>
          Use template
          <i className="ti ti-arrow-right" style={{ fontSize: 13 }} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

interface Props {
  onUseTemplate: (templateId: string, templateTitle: string) => void
  recommendedTemplateId?: string | null
}

export default function TemplatesGallery({ onUseTemplate, recommendedTemplateId }: Props) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const filtered = TEMPLATES.filter(t => {
    const matchFilter = activeFilter === 'All' || t.category === activeFilter
    const matchSearch =
      search.trim() === '' ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const root: CSSProperties = {
    padding: '48px 40px 80px',
    maxWidth: 1040,
    margin: '0 auto',
    position: 'relative',
    minHeight: '100%',
    fontFamily: 'inherit',
  }

  return (
    <div style={root}>

      {/* ── Header ── */}
      <header style={{
        textAlign: 'center',
        maxWidth: 580,
        margin: '0 auto 44px',
        animation: 'tg-fadeUp 0.5s ease both',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'rgba(37,211,102,0.08)',
          border: '0.5px solid rgba(37,211,102,0.25)',
          borderRadius: 100, padding: '5px 16px',
          fontSize: 12.5, fontWeight: 500, color: '#1a8c4e',
          marginBottom: 22, letterSpacing: '0.01em',
        }}>
          <WhatsAppSvg size={14} />
          WhatsApp AI Sales Agent
        </div>

        {/* Title with squiggly */}
        <h1 style={{
          fontSize: 'clamp(32px, 4vw, 50px)',
          fontWeight: 700,
          color: '#111',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          margin: '0 0 14px',
        }}>
          Choose your{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            flow
            <SquigglyUnderline />
          </span>
        </h1>

        <p style={{ fontSize: 14.5, color: '#777', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
          Pick a template that matches your goal. Each one deploys a ready-made
          WhatsApp AI agent in minutes.
        </p>
      </header>

      {/* ── Search ── */}
      <div style={{
        maxWidth: 520,
        margin: '0 auto 18px',
        position: 'relative',
        animation: 'tg-fadeUp 0.5s ease 0.08s both',
      }}>
        <i className="ti ti-search" style={{
          position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)',
          color: '#bbb', fontSize: 16, pointerEvents: 'none',
        }} aria-hidden="true" />
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: '100%',
            padding: '13px 16px 13px 42px',
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: searchFocused
              ? '0.5px solid rgba(124,77,204,0.35)'
              : '0.5px solid rgba(255,255,255,0.9)',
            borderRadius: 14,
            boxShadow: searchFocused
              ? '0 0 0 3px rgba(124,77,204,0.08), 0 2px 16px rgba(0,0,0,0.06)'
              : '0 2px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
            fontSize: 14,
            color: '#111',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>

      {/* ── Filter pills ── */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap',
        marginBottom: 28,
        animation: 'tg-fadeUp 0.5s ease 0.14s both',
      }}>
        {FILTERS.map(f => {
          const active = activeFilter === f
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500,
                fontFamily: 'inherit', cursor: 'pointer', userSelect: 'none',
                background: active ? 'rgba(17,17,17,0.88)' : 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: active ? '0.5px solid rgba(17,17,17,0.9)' : '0.5px solid rgba(255,255,255,0.9)',
                color: active ? '#fff' : '#666',
                boxShadow: active
                  ? '0 4px 20px rgba(0,0,0,0.14)'
                  : '0 2px 10px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
                transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* ── Count ── */}
      <p style={{
        textAlign: 'center', fontSize: 12, color: '#bbb',
        marginBottom: 20, letterSpacing: '0.02em',
        animation: 'tg-fadeUp 0.4s ease 0.2s both',
      }}>
        {filtered.length} template{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* ── Grid / Empty ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '72px 0', color: '#bbb',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.9)',
          borderRadius: 18,
        }}>
          <i className="ti ti-search-off" style={{ fontSize: 36 }} aria-hidden="true" />
          <p style={{ fontSize: 14, margin: 0 }}>No templates found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 18,
          paddingTop: 24, // extra space so floating character doesn't get clipped
        }}>
          {filtered.map((t, i) => (
            <TemplateCard
              key={t.id}
              template={t}
              onUseTemplate={onUseTemplate}
              animDelay={0.1 + i * 0.05}
              isRecommended={t.id === recommendedTemplateId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
