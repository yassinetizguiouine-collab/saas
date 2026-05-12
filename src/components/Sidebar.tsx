export type Page = 'gallery' | 'my-flows' | 'sales-process' | 'flow-config'

interface SidebarProps {
  activePage: Page
  onNavigate: (page: Page) => void
  salesProcessDone: boolean
  onSignOut: () => void
}

export default function Sidebar({ activePage, onNavigate, salesProcessDone, onSignOut }: SidebarProps) {
  return (
    <aside
      className="glass-strong"
      style={{
        width: 260, minWidth: 260, height: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: '24px 14px',
        borderRight: '0.5px solid rgba(0,0,0,0.07)',
        borderRadius: 0,
      }}
    >
      <div style={{ padding: '4px 10px', marginBottom: 32 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111', letterSpacing: '-0.04em' }}>
          LeadFlow
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem icon="ti-sitemap" label="My Sales Process" active={activePage === 'sales-process'} onClick={() => onNavigate('sales-process')} badge={!salesProcessDone ? '!' : undefined} />
        <NavItem icon="ti-layout-grid" label="Templates" active={activePage === 'gallery'} onClick={() => onNavigate('gallery')} locked={!salesProcessDone} />
        <NavItem icon="ti-bolt" label="My Flows" active={activePage === 'my-flows'} onClick={() => onNavigate('my-flows')} locked={!salesProcessDone} />
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '0.5px solid rgba(0,0,0,0.07)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <NavItem icon="ti-settings" label="Settings" active={false} onClick={() => {}} />
        <NavItem icon="ti-logout" label="Sign out" active={false} onClick={onSignOut} />
      </div>
    </aside>
  )
}

function NavItem({ icon, label, active, onClick, locked, badge }: {
  icon: string; label: string; active: boolean; onClick: () => void; locked?: boolean; badge?: string
}) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      title={locked ? 'Complete your Sales Process first' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 10, border: 'none',
        background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
        color: locked ? '#ccc' : active ? '#111' : '#777',
        fontWeight: active ? 500 : 400, fontSize: 13.5,
        cursor: locked ? 'not-allowed' : 'pointer',
        width: '100%', textAlign: 'left', fontFamily: 'inherit',
        transition: 'all 0.15s', position: 'relative',
      }}
      onMouseEnter={e => { if (!active && !locked) { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'; (e.currentTarget as HTMLElement).style.color = '#111' } }}
      onMouseLeave={e => { if (!active && !locked) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#777' } }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 17 }} aria-hidden="true" />
      <span style={{ flex: 1 }}>{label}</span>
      {locked && <i className="ti ti-lock" style={{ fontSize: 13, color: '#ccc' }} />}
      {badge && !locked && (
        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
      )}
    </button>
  )
}
