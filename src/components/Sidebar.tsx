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
        width: 300,
        minWidth: 300,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        borderRight: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 0,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', marginBottom: 28 }}>
        <img
          src="/logo.png"
          alt="LeadFlow logo"
          style={{ width: 32, height: 32, objectFit: 'contain' }}
        />
        <span style={{ fontSize: 18, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>LeadFlow</span>
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
      <div style={{ marginTop: 'auto', borderTop: '0.5px solid rgba(0,0,0,0.07)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem icon="ti-settings" label="Settings" active={false} onClick={() => {}} />
        <NavItem icon="ti-logout" label="Sign out" active={false} onClick={() => {}} />
      </div>
    </aside>
  )
}

function NavItem({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 10,
        border: 'none',
        background: active ? 'rgba(0,0,0,0.07)' : 'transparent',
        color: active ? '#111' : '#666',
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 17 }} aria-hidden="true" />
      {label}
    </button>
  )
}
