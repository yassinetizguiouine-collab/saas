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
        await checkUserProgress(session.user.id)
      } catch (e) {
        console.error('Init error:', e)
        setAppState('auth')
      }
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') { setAppState('auth'); return }
      if (session) {
        // 500ms delay ensures token is stored in localStorage before RLS queries fire
        setTimeout(() => checkUserProgress(session.user.id), 500)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Safety net: if still loading after 5s, force to auth
  useEffect(() => {
    if (appState !== 'loading') return
    const timer = setTimeout(() => setAppState('auth'), 5000)
    return () => clearTimeout(timer)
  }, [appState])

  // Auto-transition from initializing to onboarding after 2s
  useEffect(() => {
    if (appState !== 'initializing') return
    const timer = setTimeout(() => setAppState('onboarding'), 2000)
    return () => clearTimeout(timer)
  }, [appState])

  async function checkUserProgress(userId: string) {
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
      if (!obDone) { setAppState('initializing'); return }
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
        // Go to preview first, then to config after deploy
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
    // From preview, go straight to config
    setPage('flow-config')
  }

  if (appState === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <i className="ti ti-loader-2" style={{ fontSize: 28, color: '#ccc', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (appState === 'initializing') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        flexDirection: 'column',
        gap: 24,
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.04em' }}>
          LeadFlow
        </div>
        <div style={{ fontSize: 16, color: '#aaa', textAlign: 'center' }}>
          Initializing your workspace...
        </div>
        <i className="ti ti-loader-2" style={{ fontSize: 28, color: '#666', animation: 'spin 1s linear infinite', marginTop: 16 }} />
      </div>
    )
  }

  if (appState === 'auth') return <AuthPage onAuth={() => checkUserProgress('')} />
  if (appState === 'onboarding') return <Onboarding onComplete={() => checkUserProgress('')} />

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
