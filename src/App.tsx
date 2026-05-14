import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Sidebar, { Page } from './components/Sidebar'
import AuthPage from './pages/AuthPage'
import Onboarding from './pages/Onboarding'
import SalesProcess from './pages/SalesProcess'
import TemplatesGallery from './pages/TemplatesGallery'
import MyFlows from './pages/MyFlows'
import FlowConfig from './pages/FlowConfig'
import FlowPreview from './pages/FlowPreview'

type AppState = 'loading' | 'auth' | 'initializing' | 'onboarding' | 'app'

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [page, setPage] = useState<Page>('sales-process')
  const [salesProcessDone, setSalesProcessDone] = useState(false)
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null)
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!session) { setAppState('auth'); return }
        await checkUserProgress(session.user.id, false)
      } catch (e) {
        console.error('Init error:', e)
        setAppState('auth')
      }
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') { setAppState('auth'); return }
      if (event === 'SIGNED_IN' && session) {
        setTimeout(() => checkUserProgress(session.user.id, true), 500)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (appState !== 'loading') return
    const timer = setTimeout(() => setAppState('auth'), 5000)
    return () => clearTimeout(timer)
  }, [appState])

  useEffect(() => {
    if (appState !== 'initializing') return
    const timer = setTimeout(() => setAppState('onboarding'), 2400)
    return () => clearTimeout(timer)
  }, [appState])

  async function checkUserProgress(userId: string, showInitializing = false) {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setAppState('auth'); return }
        userId = user.id
      }
      const [{ data: ob }, { data: sp }] = await Promise.all([
        supabase.from('onboarding').select('completed').eq('user_id', userId).maybeSingle(),
        supabase.from('sales_process').select('completed').eq('user_id', userId).maybeSingle(),
      ])
      const obDone = ob?.completed ?? false
      const spDone = sp?.completed ?? false
      setSalesProcessDone(spDone)
      if (!obDone) {
        setAppState(showInitializing ? 'initializing' : 'onboarding')
        return
      }
      setAppState('app')
      setPage(spDone ? 'gallery' : 'sales-process')
    } catch (e) {
      console.error('checkUserProgress error:', e)
      setAppState('auth')
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  async function handleUseTemplate(templateId: string, templateTitle: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('flows').insert({
        user_id: user.id, template_id: templateId,
        template_title: templateTitle, status: 'draft', config: {},
      }).select().single()
      if (data) {
        setActiveFlowId(data.id)
        setActiveTemplateId(templateId)
        setPage('flow-preview')
      }
    } catch (e) {
      console.error('handleUseTemplate error:', e)
    }
  }

  function handleConfigureFlow(flowId: string, templateId: string) {
    setActiveFlowId(flowId)
    setActiveTemplateId(templateId)
    setPage('flow-config')
  }

  function handlePreviewDeploy() {
    setPage('flow-config')
  }

  if (appState === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <i className="ti ti-loader-2" style={{ fontSize: 26, color: '#333', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (appState === 'initializing') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0a0a0a',
        flexDirection: 'column',
      }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg) } }
          @keyframes lf-rise { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
          @keyframes lf-bar { from { width:0 } to { width:100% } }
          @keyframes lf-fade { from { opacity:0 } to { opacity:1 } }
        `}</style>
        <div style={{ textAlign: 'center', animation: 'lf-rise 0.7s ease 0.1s both' }}>
          <div style={{ fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', marginBottom: 10 }}>
            LeadFlow
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', animation: 'lf-fade 0.5s ease 0.5s both' }}>
            Initializing your workspace…
          </div>
        </div>
        <div style={{
          marginTop: 48, width: 160, height: 1.5,
          background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden',
          animation: 'lf-fade 0.4s ease 0.7s both',
        }}>
          <div style={{
            height: '100%', background: 'rgba(255,255,255,0.6)', borderRadius: 99,
            animation: 'lf-bar 2s cubic-bezier(0.4,0,0.2,1) 0.85s both',
          }} />
        </div>
      </div>
    )
  }

  if (appState === 'auth') return <AuthPage onAuth={() => checkUserProgress('', false)} />
  if (appState === 'onboarding') return <Onboarding onComplete={() => checkUserProgress('', false)} />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activePage={page} onNavigate={setPage} salesProcessDone={salesProcessDone} onSignOut={handleSignOut} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {page === 'sales-process' && <SalesProcess onComplete={() => { setSalesProcessDone(true); setPage('gallery') }} />}
        {page === 'gallery' && salesProcessDone && <TemplatesGallery onUseTemplate={handleUseTemplate} />}
        {page === 'flow-preview' && <FlowPreview onDeploy={handlePreviewDeploy} />}
        {page === 'my-flows' && salesProcessDone && <MyFlows onConfigureFlow={handleConfigureFlow} />}
        {page === 'flow-config' && <FlowConfig flowId={activeFlowId} templateId={activeTemplateId} onBack={() => setPage('my-flows')} />}
      </main>
    </div>
  )
}
