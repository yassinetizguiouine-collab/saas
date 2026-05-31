import { useEffect, useState } from 'react'
import { ToastNotification } from '../hooks/useNotifications'

interface Props {
  toasts: ToastNotification[]
  onDismiss: (toastId: string) => void
}

const typeConfig = {
  success: { icon: 'ti-circle-check', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  error:   { icon: 'ti-circle-x',     color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  warning: { icon: 'ti-alert-triangle', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  info:    { icon: 'ti-info-circle',  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
}

function Toast({ toast, onDismiss }: { toast: ToastNotification; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const cfg = typeConfig[toast.type as keyof typeof typeConfig] ?? typeConfig['info']

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '13px 14px',
        borderRadius: 12,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        minWidth: 280,
        maxWidth: 360,
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(30px) scale(0.95)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <i
        className={`ti ${cfg.icon}`}
        style={{ fontSize: 18, color: cfg.color, marginTop: 1, flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111', marginBottom: toast.html ? 2 : 0 }}>
            {toast.title}
          </div>
        )}
        {toast.html && (
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.4 }}>
            {toast.html}
          </div>
        )}
        {!toast.title && !toast.html && (
          <div style={{ fontSize: 13, color: '#555' }}>New notification</div>
        )}
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          color: '#aaa',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 4,
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#555')}
        onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
      >
        <i className="ti ti-x" style={{ fontSize: 14 }} />
      </button>
    </div>
  )
}

export default function NotificationToast({ toasts, onDismiss }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(toast => (
        <div key={toast.toastId} style={{ pointerEvents: 'auto' }}>
          <Toast toast={toast} onDismiss={() => onDismiss(toast.toastId)} />
        </div>
      ))}
    </div>
  )
}
