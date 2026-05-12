import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  onAuth: () => void
}

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Account created! Logging you in…')
      setTimeout(onAuth, 1200)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      onAuth()
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'inherit', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 6 }}>
            LeadFlow
          </div>
          <div style={{ fontSize: 13.5, color: '#999' }}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong" style={{ borderRadius: 22, padding: '32px 28px' }}>

          {/* Toggle */}
          <div style={{
            display: 'flex', background: 'rgba(0,0,0,0.05)',
            borderRadius: 12, padding: 4, marginBottom: 28,
          }}>
            {(['signup', 'login'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null) }} style={{
                flex: 1, padding: '8px', borderRadius: 9, fontSize: 13, fontWeight: 500,
                fontFamily: 'inherit', cursor: 'pointer', border: 'none',
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? '#111' : '#888',
                boxShadow: mode === m ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.18s',
              }}>
                {m === 'signup' ? 'Sign up' : 'Log in'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.8)', border: '0.5px solid rgba(0,0,0,0.13)',
                  fontSize: 13.5, color: '#111', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>Password</label>
              <input
                type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.8)', border: '0.5px solid rgba(0,0,0,0.13)',
                  fontSize: 13.5, color: '#111', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 9, background: 'rgba(220,38,38,0.07)', border: '0.5px solid rgba(220,38,38,0.2)', fontSize: 12.5, color: '#dc2626' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 9, background: 'rgba(37,211,102,0.07)', border: '0.5px solid rgba(37,211,102,0.2)', fontSize: 12.5, color: '#1a8c4e' }}>
              {success}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            style={{
              width: '100%', marginTop: 22, padding: '13px', borderRadius: 12,
              background: '#111', color: '#fff', border: 'none', fontSize: 14,
              fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: (loading || !email || !password) ? 0.55 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#bbb', marginTop: 20 }}>
          By signing up you agree to our Terms of Service.
        </p>
      </div>
    </div>
  )
}
