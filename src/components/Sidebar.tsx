import { Page } from '../App'

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside
      className="glass-strong"
      style={{
        width: 280,
        minWidth: 280,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        borderRight: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 0,
      }}
    >
      {/* Logo only - no text */}
      <div style={{ padding: '4px 8px', marginBottom: 32 }}>
        <img
          src="/logonew.png"
          alt="LeadFlow"
          style={{ height: 62, objectFit: 'contain' }}
        />
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem
          icon="ti-bolt"
          label="Booking Flow"
          active={activePage === 'present' || activePage === 'config'}
          onClick={() => onNavigate('present')}
        />
      </nav>

      {/* Bottom */}
      <div style={{
        marginTop: 'auto',
        borderTop: '0.5px solid rgba(0,0,0,0.07)',
        paddingTop: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <NavItem icon="ti-settings" label="Settings" active={false} onClick={() => {}} />
        <NavItem icon="ti-logout" label="Sign out" active={false} onClick={() => {}} />
      </div>
    </aside>
  )
}

function NavItem({ icon, label, active, onClick }: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 10,
        border: 'none',
        background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
        color: active ? '#111' : '#777',
        fontWeight: active ? 500 : 400,
        fontSize: 14,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'
        if (!active) (e.currentTarget as HTMLElement).style.color = '#111'
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
        if (!active) (e.currentTarget as HTMLElement).style.color = '#777'
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 18 }} aria-hidden="true" />
      {label}
    </button>
  )
}
