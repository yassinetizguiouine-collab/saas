import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props { onAuth: () => void }

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
    // No need to call onAuth — Supabase redirects back and
    // the onAuthStateChange listener in App.tsx handles it
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Account created! Logging you in…')
      setTimeout(() => {
        setLoading(false)
        setInitializing(true)
        setTimeout(onAuth, 2400)
      }, 1200)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setLoading(false)
      setInitializing(true)
      setTimeout(onAuth, 2400)
    }
  }

  // ── Initializing screen ──────────────────────────────────────
  if (initializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', flexDirection: 'column' }}>
        <style>{`
          @keyframes lf-rise { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
          @keyframes lf-bar  { from { width:0 } to { width:100% } }
          @keyframes lf-fade { from { opacity:0 } to { opacity:1 } }
        `}</style>
        <div style={{ textAlign: 'center', animation: 'lf-rise 0.7s ease 0.1s both' }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 10 }}>LeadFlow</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', animation: 'lf-fade 0.5s ease 0.5s both' }}>Initializing your workspace…</div>
        </div>
        <div style={{ marginTop: 48, width: 160, height: 1.5, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', animation: 'lf-fade 0.4s ease 0.7s both' }}>
          <div style={{ height: '100%', background: 'rgba(255,255,255,0.6)', borderRadius: 99, animation: 'lf-bar 2s cubic-bezier(0.4,0,0.2,1) 0.85s both' }} />
        </div>
      </div>
    )
  }

  // ── Auth form ────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
            <img src="/Création sans titre (25).png" alt="" style={{ height: 32, width: 32, objectFit: 'contain' }} />
            <span style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.04em' }}>LeadFlow</span>
          </div>
          <div style={{ fontSize: 13.5, color: '#999' }}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </div>
        </div>

        {/* Card */}
        <div className="glass-strong" style={{ borderRadius: 22, padding: '32px 28px' }}>

          {/* Toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {(['signup', 'login'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null) }} style={{ flex: 1, padding: '8px', borderRadius: 9, fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#111' : '#888', boxShadow: mode === m ? '0 1px 6px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.18s' }}>
                {m === 'signup' ? 'Sign up' : 'Log in'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 11, border: '0.5px solid rgba(0,0,0,0.13)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13.5, fontWeight: 500, color: '#111', cursor: googleLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: 20, transition: 'all 0.15s', opacity: googleLoading ? 0.6 : 1, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            onMouseEnter={e => { if (!googleLoading) (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
          >
            {/* Google SVG icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.20455C17.64 8.56637 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Redirecting…' : `Continue with Google`}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,0,0,0.1)' }} />
            <span style={{ fontSize: 11.5, color: '#bbb', fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,0,0,0.1)' }} />
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.8)', border: '0.5px solid rgba(0,0,0,0.13)', fontSize: 13.5, color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#555', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.8)', border: '0.5px solid rgba(0,0,0,0.13)', fontSize: 13.5, color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Error / Success */}
          {error && <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 9, background: 'rgba(220,38,38,0.07)', border: '0.5px solid rgba(220,38,38,0.2)', fontSize: 12.5, color: '#dc2626' }}>{error}</div>}
          {success && <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 9, background: 'rgba(37,211,102,0.07)', border: '0.5px solid rgba(37,211,102,0.2)', fontSize: 12.5, color: '#1a8c4e' }}>{success}</div>}

          {/* CTA */}
          <button onClick={handleSubmit} disabled={loading || !email || !password}
            style={{ width: '100%', marginTop: 22, padding: '13px', borderRadius: 12, background: '#111', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', opacity: (loading || !email || !password) ? 0.55 : 1, transition: 'opacity 0.15s' }}>
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
