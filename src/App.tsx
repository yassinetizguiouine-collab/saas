import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Sidebar, { Page } from './components/Sidebar'
import AuthPage from './pages/AuthPage'
import Onboarding from './pages/Onboarding'
import FlowRecommender from './pages/FlowRecommender'
import TemplatesGallery from './pages/TemplatesGallery'
import MyFlows from './pages/MyFlows'
import FlowConfig from './pages/FlowConfig'
import FlowPreview from './pages/FlowPreview'
import FoundFlow from './pages/FoundFlow'
import ProvisioningScreen from './pages/ProvisioningScreen'
import ViewAgent from './pages/ViewAgent'
import CongratsScreen from './pages/CongratsScreen'
import NotificationToast from './components/NotificationToast'
import { useNotifications } from './hooks/useNotifications'
import TrainingCamp from './pages/TrainingCamp'
import AutoTesting from './pages/AutoTesting'

type AppState = 'loading' | 'auth' | 'onboarding' | 'recommender' | 'found' | 'app' | 'provisioning' | 'congrats'

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [page, setPage] = useState<Page>(() => {
    return (localStorage.getItem('lf_page') as Page) || 'gallery'
  })
  const [activeFlowId, setActiveFlowId] = useState<string | null>(() => {
    return localStorage.getItem('lf_flow_id')
  })
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(() => {
    return localStorage.getItem('lf_template_id')
  })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentAgentName, setCurrentAgentName] = useState<string>('Your Agent')
  const [recommendedTemplateId, setRecommendedTemplateId] = useState<string | null>(null)
  const [provisioningUserId, setProvisioningUserId] = useState<string | null>(null)
  const [provisioningTemplateId, setProvisioningTemplateId] = useState<string | null>(null)
  const { toasts, dismiss } = useNotifications()

  // Persist navigation state
  useEffect(() => {
    if (appState === 'app') {
      localStorage.setItem('lf_page', page)
      if (activeFlowId) localStorage.setItem('lf_flow_id', activeFlowId)
      if (activeTemplateId) localStorage.setItem('lf_template_id', activeTemplateId)
    }
  }, [page, activeFlowId, activeTemplateId, appState])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAppState('auth')
      } else {
        checkUserProgress(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setAppState('auth')
    })

    return () => subscription.unsubscribe()
  }, [])

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
      setCurrentUserId(userId)
      // Fetch agent name from generated_prompts
      supabase.from('generated_prompts').select('system_prompt').eq('user_id', userId).maybeSingle().then(({ data }) => {
        if (data?.system_prompt) {
          const match = data.system_prompt.match(/You are ([A-Z][a-z]+)\./)
          if (match?.[1]) setCurrentAgentName(match[1])
        }
      })
      const [{ data: ob }, { data: rec }] = await Promise.all([
        supabase.from('onboarding').select('completed').eq('user_id', userId).maybeSingle(),
        supabase.from('recommended_flows').select('completed, recommended_template_id').eq('user_id', userId).maybeSingle(),
      ])
      const obDone = ob?.completed ?? false
      const recDone = rec?.completed ?? false

      if (rec?.recommended_template_id) {
        setRecommendedTemplateId(rec.recommended_template_id)
      }

      if (!obDone) { setAppState('onboarding'); return }
      if (!recDone) { setAppState('recommender'); return }
      setAppState('app')
      // Restore last page from localStorage, fall back to gallery
      const savedPage = localStorage.getItem('lf_page') as Page | null
      setPage(savedPage || 'gallery')
    } catch (e) {
      console.error('checkUserProgress error:', e)
      setAppState('auth')
    }
  }

  async function handleSignOut() {
    localStorage.removeItem('lf_page')
    localStorage.removeItem('lf_flow_id')
    localStorage.removeItem('lf_template_id')
    await supabase.auth.signOut()
  }

  async function handleRecommendationComplete(templateId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: newFlow } = await supabase.from('flows').insert({
        user_id: user.id,
        template_id: templateId,
        template_title: getTemplateTitle(templateId),
        status: 'draft',
        config: {},
      }).select().single()

      if (newFlow) {
        await supabase.from('recommended_flows').upsert(
          { user_id: user.id, completed: true, recommended_template_id: templateId },
          { onConflict: 'user_id' }
        )

        setRecommendedTemplateId(templateId)
        setActiveFlowId(newFlow.id)
        setActiveTemplateId(templateId)
        setAppState('found')
      }
    } catch (e) {
      console.error('handleRecommendationComplete error:', e)
    }
  }

  function getTemplateTitle(templateId: string): string {
    const templates: Record<string, string> = {
      'booking-with-lm': 'Booking Flow w/ Lead Magnet',
      'booking-without-lm': 'Booking Flow w/o Lead Magnet',
      'close-in-chat': 'Close in WhatsApp Convo',
    }
    return templates[templateId] || 'Custom Flow'
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

  function handlePreviewDeploy() {
    setPage('flow-config')
  }

  function handleConfigureFlow(flowId: string, templateId: string) {
    setActiveFlowId(flowId)
    setActiveTemplateId(templateId)
    setPage('flow-config')
  }

  function handleViewAgent(flowId: string, templateId: string) {
    setActiveFlowId(flowId)
    setActiveTemplateId(templateId)
    setPage('view-agent')
  }

  function handleProvisioningStart(userId: string, templateId: string) {
    setProvisioningUserId(userId)
    setProvisioningTemplateId(templateId)
    setAppState('provisioning')
  }

  function handleProvisioningComplete() {
    setAppState('congrats')
  }

  function handleCongratsComplete() {
    setAppState('app')
    setPage('my-flows')
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
  if (appState === 'recommender') return <FlowRecommender onRecommended={handleRecommendationComplete} />
  if (appState === 'found') return (
    <FoundFlow
      templateId={activeTemplateId || 'booking-with-lm'}
      onContinue={() => { setAppState('app'); setPage('flow-preview') }}
    />
  )

  if (appState === 'provisioning') return (
    <ProvisioningScreen
      userId={provisioningUserId!}
      templateId={provisioningTemplateId!}
      onComplete={handleProvisioningComplete}
    />
  )

  if (appState === 'congrats') return (
    <CongratsScreen
      userId={provisioningUserId!}
      templateId={provisioningTemplateId!}
      onContinue={handleCongratsComplete}
    />
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activePage={page} onNavigate={setPage} onSignOut={handleSignOut} />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {page === 'gallery' && (
          <TemplatesGallery
            onUseTemplate={handleUseTemplate}
            recommendedTemplateId={recommendedTemplateId}
          />
        )}
        {page === 'flow-preview' && (
          <FlowPreview
            onDeploy={handlePreviewDeploy}
            templateId={activeTemplateId}
            isRecommended={activeTemplateId === recommendedTemplateId}
          />
        )}
        {page === 'my-flows' && <MyFlows onConfigureFlow={handleConfigureFlow} onViewAgent={handleViewAgent} />}
        {page === 'view-agent' && activeFlowId && activeTemplateId && (
          <ViewAgent
            flowId={activeFlowId}
            templateId={activeTemplateId}
            onBack={() => setPage('my-flows')}
          />
        )}
        {page === 'flow-config' && (
          <FlowConfig
            flowId={activeFlowId}
            templateId={activeTemplateId}
            onBack={() => setPage('my-flows')}
            onProvisioningStart={handleProvisioningStart}
          />
        )}
        {page === 'training-camp' && currentUserId && (
          <TrainingCamp
            userId={currentUserId}
            templateId={activeTemplateId || 'booking-with-lm'}
            agentName={currentAgentName}
            onAutoTesting={() => setPage('auto-testing')}
          />
        )}
        {page === 'auto-testing' && currentUserId && (
          <AutoTesting
            userId={currentUserId}
            templateId={activeTemplateId || 'booking-with-lm'}
            agentName={currentAgentName}
            onBack={() => setPage('training-camp')}
          />
        )}
      </main>
      <NotificationToast toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
