import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Notification {
  id: string
  title?: string
  message?: string
  type?: 'success' | 'error' | 'info' | 'warning'
  created_at?: string
}

export interface ToastNotification extends Notification {
  toastId: string
}

export function useNotifications() {
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  const dismiss = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId))
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('notif-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notif' },
        (payload) => {
          const row = payload.new as Notification
          const toast: ToastNotification = {
            ...row,
            toastId: `${row.id ?? ''}-${Date.now()}`,
          }
          setToasts(prev => [...prev, toast])

          // Auto-dismiss after 5s
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.toastId !== toast.toastId))
          }, 5000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { toasts, dismiss }
}
