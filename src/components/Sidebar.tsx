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
        width: 230, minWidth: 230, height: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px',
        borderRight: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', marginBottom: 28 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 3C18.5 3 22 6.5 22 11C22 14.5 20 17 17.5 18.5L16 26H12L10.5 18.5C8 17 6 14.5 6 11C6 6.5 9.5 3 14 3Z" fill="#111" opacity="0.12"/>
          <path d="M14 3C17.5 3 21 6 21 10.5C21 13.5 19.5 16 17 17.5L15.5 24H12.5L11 17.5C8.5 16 7 13.5 7 10.5C7 6 10.5 3 14 3Z" fill="#111" opacity="0.4"/>
          <path d="M14 3C16.5 3 19 5.5 19 9.5C19 12.5 17.5 14.5 15.5 16L14 22L12.5 16C10.5 14.5 9 12.5 9 9.5C9 5.5 11.5 3 14 3Z" fill="#111"/>
        </svg>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>LeadFlow</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem
          icon="ti-bolt"
          label="Booking Flow"
          active={activePage === 'present' || activePage === 'config'}
          onClick={() => onNavigate('present')}
        />
      </nav>

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
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 10, border: 'none',
        background: active ? 'rgba(0,0,0,0.07)' : 'transparent',
        color: active ? '#111' : '#666',
        fontWeight: active ? 600 : 400,
        fontSize: 14, cursor: 'pointer', width: '100%',
        textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 17 }} aria-hidden="true" />
      {label}
    </button>
  )
}
