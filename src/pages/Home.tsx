import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Step {
  id: string
  icon: string
  title: string
  description: string
  cta: string
  done: boolean
}

interface Props {
  onNavigate: (page: string) => void
  onOpenFlowConfig: () => void
}

function GoalBanner({
  goalType,
  goalTarget,
  current,
  onGoalHit,
}: {
  goalType: string
  goalTarget: number
  current: number
  onGoalHit: () => void
}) {
  const pct = Math.min(Math.round((current / goalTarget) * 100), 100)
  const label = goalType === 'bookings' ? 'bookings' : 'deals closed'
  const hit = current >= goalTarget

  useEffect(() => {
    if (hit) onGoalHit()
  }, [hit])

  return (
    <div
      className="glass"
      style={{
        borderRadius: 20,
        padding: '22px 28px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        animation: 'hm-up 0.4s ease both',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Your goal
          </span>
          {hit && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
              background: 'rgba(37,211,102,0.12)', color: '#1a8c4e',
            }}>
              🎉 Reached!
            </span>
          )}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: 12 }}>
          {goalTarget} {label} per month
        </div>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 99,
            background: hit ? '#25D366' : '#111',
            transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        </div>
        <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>
          {current} / {goalTarget} {label}
        </div>
      </div>
      <div style={{
        width: 64, height: 64, borderRadius: 20, flexShrink: 0,
        background: hit ? 'rgba(37,211,102,0.1)' : 'rgba(124,77,204,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 28 }}>{hit ? '🏆' : goalType === 'bookings' ? '📅' : '💬'}</span>
      </div>
    </div>
  )
}

function StepCard({
  step,
  index,
  isActive,
  isLocked,
  onClick,
}: {
  step: Step
  index: number
  isActive: boolean
  isLocked: boolean
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      onMouseEnter={() => !isLocked && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '20px 24px',
        borderRadius: 18,
        background: step.done
          ? 'rgba(37,211,102,0.04)'
          : isActive
          ? hover ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.7)'
          : 'rgba(255,255,255,0.35)',
        border: step.done
          ? '0.5px solid rgba(37,211,102,0.2)'
          : isActive
          ? `0.5px solid ${hover ? 'rgba(124,77,204,0.25)' : 'rgba(255,255,255,0.9)'}`
          : '0.5px solid rgba(0,0,0,0.05)',
        cursor: isLocked ? 'default' : 'pointer',
        opacity: isLocked ? 0.45 : 1,
        transition: 'all 0.2s',
        boxShadow: isActive && hover ? '0 4px 20px rgba(0,0,0,0.07)' : 'none',
        animation: `hm-up 0.4s ease ${index * 0.07}s both`,
      }}
    >
      {/* Step number / check */}
      <div style={{
        width: 40, height: 40, borderRadius: 13, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: step.done
          ? 'rgba(37,211,102,0.12)'
          : isActive
          ? 'rgba(124,77,204,0.1)'
          : 'rgba(0,0,0,0.04)',
        transition: 'background 0.2s',
      }}>
        {step.done ? (
          <i className="ti ti-circle-check" style={{ fontSize: 20, color: '#1a8c4e' }} />
        ) : (
          <span style={{ fontSize: 18 }}>{step.icon}</span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: step.done ? '#6b9e7a' : isLocked ? '#bbb' : '#111',
          marginBottom: 3,
          textDecoration: step.done ? 'line-through' : 'none',
          transition: 'color 0.2s',
        }}>
          {step.title}
        </div>
        <div style={{ fontSize: 12.5, color: step.done ? '#aaa' : isLocked ? '#ccc' : '#888', lineHeight: 1.5 }}>
          {step.description}
        </div>
      </div>

      {/* CTA / status */}
      <div style={{ flexShrink: 0 }}>
        {step.done ? (
          <div style={{
            fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100,
            background: 'rgba(37,211,102,0.1)', color: '#1a8c4e',
          }}>
            Done
          </div>
        ) : isActive ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12.5, fontWeight: 700, padding: '8px 16px', borderRadius: 10,
            background: '#111', color: '#fff',
            transition: 'opacity 0.15s',
            opacity: hover ? 0.85 : 1,
          }}>
            {step.cta}
            <i className="ti ti-arrow-right" style={{ fontSize: 13 }} />
          </div>
        ) : (
          <i className="ti ti-lock" style={{ fontSize: 15, color: '#ddd' }} />
        )}
      </div>
    </div>
  )
}

function GoalCelebration({ goalType, goalTarget, onSetNew }: {
  goalType: string
  goalTarget: number
  onSetNew: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
      animation: 'hm-fade 0.3s ease both',
    }}>
      <div className="glass-strong" style={{
        borderRadius: 28, padding: '48px 40px', maxWidth: 420, width: '90%',
        textAlign: 'center', animation: 'hm-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🏆</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 10 }}>
          Goal reached!
        </h2>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.65, marginBottom: 32 }}>
          You hit <strong>{goalTarget} {goalType === 'bookings' ? 'bookings' : 'deals'}</strong> this month.
          Time to aim higher. 🚀
        </p>
        <button
          onClick={onSetNew}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 14,
            background: '#111', color: '#fff', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Set new goal 🎯
        </button>
      </div>
    </div>
  )
}

function SetGoalModal({ goalType, onSave, onClose }: {
  goalType: string
  onSave: (target: number) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const options = goalType === 'bookings'
    ? ['10', '20', '50', '100']
    : ['5', '10', '20', '50']

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
    }}>
      <div className="glass-strong" style={{
        borderRadius: 28, padding: '40px 36px', maxWidth: 400, width: '90%',
        animation: 'hm-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 8 }}>
          Set your next goal
        </h2>
        <p style={{ fontSize: 13.5, color: '#888', marginBottom: 24 }}>
          How many {goalType === 'bookings' ? 'bookings' : 'deals'} per month are you targeting now?
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {options.map(o => (
            <button
              key={o}
              onClick={() => setSelected(o)}
              style={{
                flex: 1, minWidth: 70, padding: '12px 0', borderRadius: 12, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
                background: selected === o ? '#111' : 'rgba(0,0,0,0.05)',
                color: selected === o ? '#fff' : '#555',
                transition: 'all 0.15s',
              }}
            >
              {o}{o === '100' ? '+' : ''}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', borderRadius: 12, border: '0.5px solid rgba(0,0,0,0.1)',
            background: 'transparent', color: '#888', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13.5, fontWeight: 600,
          }}>
            Cancel
          </button>
          <button
            onClick={() => selected && onSave(parseInt(selected))}
            disabled={!selected}
            style={{
              flex: 2, padding: '12px 0', borderRadius: 12, border: 'none',
              background: selected ? '#111' : 'rgba(0,0,0,0.06)',
              color: selected ? '#fff' : '#ccc',
              cursor: selected ? 'pointer' : 'default',
              fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
              transition: 'all 0.15s',
            }}
          >
            Save goal
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Home({ onNavigate, onOpenFlowConfig }: Props) {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [goalType, setGoalType] = useState<string>('bookings')
  const [goalTarget, setGoalTarget] = useState<number>(10)
  const [currentCount, setCurrentCount] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationDismissed, setCelebrationDismissed] = useState(false)
  const [showSetGoal, setShowSetGoal] = useState(false)
  const [businessName, setBusinessName] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Load onboarding data
      const { data: ob } = await supabase
        .from('onboarding')
        .select('goal_type, goal_target, business_name')
        .eq('user_id', user.id)
        .maybeSingle()

      const gType = ob?.goal_type || 'bookings'
      const gTarget = ob?.goal_target || 10
      setGoalType(gType)
      setGoalTarget(gTarget)
      setBusinessName(ob?.business_name || '')

      // Load flow config
      const { data: flowConfig } = await supabase
        .from('flow_config')
        .select('phone_number_id, agent_name, status, deployed_at')
        .eq('user_id', user.id)
        .maybeSingle()

      // Load flow status
      const { data: flow } = await supabase
        .from('flows')
        .select('status, template_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      // Load checklist
      const { data: checklist } = await supabase
        .from('pre_launch_checklist')
        .select('workflow_unlocked')
        .eq('user_id', user.id)
        .maybeSingle()

      // Load lead count based on goal type
      const table = gType === 'close-in-chat' ? 'close_in_chat_leads' : 'booking_leads'
      const winField = gType === 'close-in-chat' ? 'paid_at' : 'booked_at'
      const { count } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not(winField, 'is', null)

      setCurrentCount(count || 0)

      const step1Done = !!(flowConfig?.phone_number_id)
      const step2Done = !!(flowConfig?.agent_name)
      const step3Done = !!(checklist?.workflow_unlocked)
      const step4Done = !!(flow?.status === 'active')
      const step5Done = (count || 0) > 0

      setSteps([
        {
          id: 'connect',
          icon: '🔌',
          title: 'Connect WhatsApp',
          description: 'Enter your phone number ID and token to connect your WhatsApp account.',
          cta: 'Connect',
          done: step1Done,
        },
        {
          id: 'configure',
          icon: '🤖',
          title: 'Configure your agent',
          description: 'Set your agent name, tone, and personality so it speaks your brand.',
          cta: 'Configure',
          done: step2Done,
        },
        {
          id: 'test',
          icon: '🧪',
          title: 'Test your agent',
          description: 'Run through 6 critical scenarios to make sure your agent is ready.',
          cta: 'Start testing',
          done: step3Done,
        },
        {
          id: 'deploy',
          icon: '🚀',
          title: 'Deploy your flow',
          description: 'Go live and let your agent start handling leads automatically.',
          cta: 'Deploy',
          done: step4Done,
        },
        {
          id: 'live',
          icon: '🎯',
          title: 'Watch leads come in',
          description: 'Your agent is live. Check your CRM to see leads and track progress.',
          cta: 'View CRM',
          done: step5Done,
        },
      ])

      setLoading(false)
    }
    init()
  }, [])

  function getFirstActiveIndex(stepList: Step[]) {
    const firstNotDone = stepList.findIndex(s => !s.done)
    return firstNotDone === -1 ? stepList.length - 1 : firstNotDone
  }

  function handleStepClick(stepId: string) {
    if (stepId === 'connect' || stepId === 'configure' || stepId === 'deploy') {
      onOpenFlowConfig()
    } else if (stepId === 'test') {
      onOpenFlowConfig() // will be wired to checklist
    } else if (stepId === 'live') {
      onNavigate('crm')
    }
  }

  async function handleSaveNewGoal(target: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('onboarding').update({ goal_target: target }).eq('user_id', user.id)
    setGoalTarget(target)
    setShowSetGoal(false)
    setCelebrationDismissed(false)
  }

  const activeIndex = getFirstActiveIndex(steps)
  const allDone = steps.every(s => s.done)

  if (loading) return (
    <div style={{ padding: '80px 40px', textAlign: 'center', color: '#ccc' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <i className="ti ti-loader-2" style={{ fontSize: 28, animation: 'spin 1s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ padding: '48px 40px 80px', maxWidth: 720, margin: '0 auto', fontFamily: 'inherit' }}>
      <style>{`
        @keyframes hm-up { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes hm-fade { from { opacity:0 } to { opacity:1 } }
        @keyframes hm-pop { from { opacity:0; transform:scale(0.92) } to { opacity:1; transform:scale(1) } }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32, animation: 'hm-up 0.4s ease both' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 6 }}>
          {allDone ? `You're live 🎉` : `Let's get you to your first result`}
        </h1>
        <p style={{ fontSize: 14, color: '#aaa' }}>
          {allDone
            ? `${businessName ? businessName + ' is' : 'Your agent is'} running. Keep an eye on your CRM.`
            : `Follow the steps below to launch your AI agent and reach your goal.`}
        </p>
      </div>

      {/* Goal banner */}
      <GoalBanner
        goalType={goalType}
        goalTarget={goalTarget}
        current={currentCount}
        onGoalHit={() => {
          if (!celebrationDismissed) setShowCelebration(true)
        }}
      />

      {/* Change goal link */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -20, marginBottom: 28 }}>
        <button
          onClick={() => setShowSetGoal(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: '#bbb', fontFamily: 'inherit', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#888'}
          onMouseLeave={e => e.currentTarget.style.color = '#bbb'}
        >
          <i className="ti ti-pencil" style={{ fontSize: 11 }} />
          Change goal
        </button>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            index={i}
            isActive={i === activeIndex}
            isLocked={i > activeIndex && !step.done}
            onClick={() => handleStepClick(step.id)}
          />
        ))}
      </div>

      {/* All done banner */}
      {allDone && (
        <div
          className="glass"
          style={{
            marginTop: 24, borderRadius: 18, padding: '22px 28px',
            display: 'flex', alignItems: 'center', gap: 16,
            border: '0.5px solid rgba(37,211,102,0.2)',
            background: 'rgba(37,211,102,0.04)',
            animation: 'hm-up 0.5s ease both',
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 13, flexShrink: 0,
            background: 'rgba(37,211,102,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className="ti ti-rocket" style={{ fontSize: 20, color: '#1a8c4e' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a8c4e', marginBottom: 2 }}>
              Your agent is live and working
            </div>
            <div style={{ fontSize: 12.5, color: '#6b9e7a' }}>
              Head to your CRM to track every lead in real time.
            </div>
          </div>
          <button
            onClick={() => onNavigate('crm')}
            style={{
              padding: '9px 18px', borderRadius: 10, border: 'none',
              background: '#1a8c4e', color: '#fff', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'opacity 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <i className="ti ti-users" style={{ fontSize: 13 }} />
            View CRM
          </button>
        </div>
      )}

      {/* Celebration modal */}
      {showCelebration && (
        <GoalCelebration
          goalType={goalType}
          goalTarget={goalTarget}
          onSetNew={() => {
            setShowCelebration(false)
            setCelebrationDismissed(true)
            setShowSetGoal(true)
          }}
        />
      )}

      {/* Set goal modal */}
      {showSetGoal && (
        <SetGoalModal
          goalType={goalType}
          onSave={handleSaveNewGoal}
          onClose={() => setShowSetGoal(false)}
        />
      )}
    </div>
  )
}
