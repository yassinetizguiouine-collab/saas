import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Sidebar, { Page } from './components/Sidebar'
import AuthPage from './pages/AuthPage'
import Onboarding from './pages/Onboarding'
import IntroScreen from './pages/IntroScreen'
import TemplatesGallery from './pages/TemplatesGallery'
import MyFlows from './pages/MyFlows'
import FlowConfig from './pages/FlowConfig'
import FlowPreview from './pages/FlowPreview'

type AppState = 'loading' | 'auth' | 'onboarding' | 'intro' | 'app'

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [page, setPage] = useState<Page>('gallery')
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null)
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null)

  useEffect(() => {
    // Restore session silently — no black screen ever on refresh/tab switch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAppState('auth')
      } else {
        checkUserProgress(session.user.id)
      }
    })

    // Only handle sign out here — AuthPage handles the post-login transition
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setAppState('auth')
    })

    return () => subscription.unsubscribe()
  }, [])

  // Safety net: if still loading after 5s, go to auth
  useEffect(() => {
    if (appState !== 'loading') return
    const timer = setTimeout(() => setAppState('auth'), 5000)
    return () => clearTimeout(timer)
  }, [appState])

  async function checkUserProgress(userId?: string) {
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setAppState('auth'); return }
        userId = user.id
      }
      const [{ data: ob }, { data: intro }] = await Promise.all([
        supabase.from('onboarding').select('completed').eq('user_id', userId).maybeSingle(),
        supabase.from('intro_screen').select('completed').eq('user_id', userId).maybeSingle(),
      ])
      const obDone = ob?.completed ?? false
      const introDone = intro?.completed ?? false
      
      if (!obDone) {
        setAppState('onboarding')
        return
      }
      if (!introDone) {
        setAppState('intro')
        return
      }
      setAppState('app')
      setPage('gallery')
    } catch (e) {
      console.error('checkUserProgress error:', e)
      setAppState('auth')
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  async function handleIntroComplete() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // Mark intro as completed
      await supabase.from('intro_screen').upsert(
        { user_id: user.id, completed: true },
        { onConflict: 'user_id' }
      )
      setAppState('app')
      setPage('gallery')
    } catch (e) {
      console.error('handleIntroComplete error:', e)
    }
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <i className="ti ti-loader-2" style={{ fontSize: 26, color: '#ddd', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (appState === 'auth') return <AuthPage onAuth={() => checkUserProgress()} />
  if (appState === 'onboarding') return <Onboarding onComplete={() => checkUserProgress()} />
  if (appState === 'intro') return <IntroScreen onComplete={handleIntroComplete} />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activePage={page} onNavigate={setPage} onSignOut={handleSignOut} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {page === 'gallery' && <TemplatesGallery onUseTemplate={handleUseTemplate} />}
        {page === 'flow-preview' && <FlowPreview onDeploy={handlePreviewDeploy} />}
        {page === 'my-flows' && <MyFlows onConfigureFlow={handleConfigureFlow} />}
        {page === 'flow-config' && <FlowConfig flowId={activeFlowId} templateId={activeTemplateId} onBack={() => setPage('my-flows')} />}
      </main>
    </div>
  )
}
