import { useEffect, useState } from 'react'
import { ToastNotification } from '../hooks/useNotifications'

interface Props {
  toasts: ToastNotification[]
  onDismiss: (toastId: string) => void
  onNavigate: (page: string) => void
}

const typeConfig = {
  success: { icon: 'ti-circle-check', color: '#16a34a', bg: 'rgba(255,255,255,0.92)', border: 'rgba(37,211,102,0.2)' },
  error:   { icon: 'ti-circle-x',     color: '#dc2626', bg: 'rgba(255,255,255,0.92)', border: 'rgba(239,68,68,0.2)'  },
  warning: { icon: 'ti-alert-triangle', color: '#d97706', bg: 'rgba(255,255,255,0.92)', border: 'rgba(245,158,11,0.2)' },
  info:    { icon: 'ti-info-circle',  color: '#7c4dcc', bg: 'rgba(255,255,255,0.92)', border: 'rgba(124,77,204,0.2)' },
}

function Toast({ toast, onDismiss, onNavigate }: {
  toast: ToastNotification
  onDismiss: () => void
  onNavigate: (page: string) => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const cfg = typeConfig[toast.type as keyof typeof typeConfig] ?? typeConfig['info']
  const isHomeNotif = toast.title === 'Complete your setup'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '16px 18px',
      borderRadius: 16,
      background: cfg.bg,
      border: `0.5px solid ${cfg.border}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      width: 320,
      position: 'relative',
      transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.94)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `${cfg.color}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className={`ti ${cfg.icon}`} style={{ fontSize: 18, color: cfg.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {toast.title && (
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111', marginBottom: 3 }}>
              {toast.title}
            </div>
          )}
          {toast.html && (
            <div style={{ fontSize: 12.5, color: '#777', lineHeight: 1.55 }}>
              {toast.html}
            </div>
          )}
          {!toast.title && !toast.html && (
            <div style={{ fontSize: 13, color: '#777' }}>New notification</div>
          )}
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 2, color: '#ccc', display: 'flex', alignItems: 'center',
            borderRadius: 4, flexShrink: 0, transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#888')}
          onMouseLeave={e => (e.currentTarget.style.color = '#ccc')}
        >
          <i className="ti ti-x" style={{ fontSize: 14 }} />
        </button>
      </div>

      {/* CTA button for home notif */}
      {isHomeNotif && (
        <button
          onClick={() => { onNavigate('home'); onDismiss() }}
          style={{
            width: '100%', padding: '9px 0', borderRadius: 10,
            background: '#111', color: '#fff', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <i className="ti ti-home" style={{ fontSize: 13 }} />
          Go to Home
        </button>
      )}
    </div>
  )
}

export default function NotificationToast({ toasts, onDismiss, onNavigate }: Props) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div key={toast.toastId} style={{ pointerEvents: 'auto' }}>
          <Toast
            toast={toast}
            onDismiss={() => onDismiss(toast.toastId)}
            onNavigate={onNavigate}
          />
        </div>
      ))}
    </div>
  )
}
