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
  onOpenChecklist: () => void
}

// ─── STEP EXPLANATION CONTENT ─────────────────────────────────────────────────

const STEP_EXPLANATIONS: Record<string, {
  title: string
  what: string
  sections: { heading: string; items: string[] }[]
  warning?: string
  ctaLabel: string
  ctaIcon: string
}> = {
  connect: {
    title: 'Connect WhatsApp',
    what: 'This connects your WhatsApp Business number to LeadFlow. Once connected, your AI agent will receive and send messages through your number automatically.',
    sections: [
      {
        heading: 'You will need 4 things',
        items: [
          'Client ID → your Meta App ID (from App Settings > Basic)',
          'Client Secret → your Meta App Secret (from App Settings > Basic)',
          'Phone Number ID → from WhatsApp > API Setup in your Meta app',
          'Access Token → a permanent token via System User (see below)',
        ],
      },
      {
        heading: 'How to get your Client ID & Secret',
        items: [
          'Go to developers.facebook.com/apps',
          'Click on your app',
          'Go to App Settings > Basic in the left menu',
          'Copy the App ID → this is your Client ID',
          'Copy the App Secret → this is your Client Secret',
        ],
      },
      {
        heading: 'How to get your Phone Number ID',
        items: [
          'In your Meta app, go to WhatsApp > API Setup',
          'Select your phone number from the "From" dropdown',
          'The Phone Number ID appears below it — copy it',
        ],
      },
      {
        heading: 'How to get a permanent Access Token',
        items: [
          'Go to business.facebook.com → Settings (gear icon)',
          'Go to Users > System Users → click Add',
          'Name it (e.g. "LeadFlow Agent"), set role to Admin, click Create',
          'Click "Add Assets" → Apps → select your Meta App → Full Control → Save',
          'Click "Add Assets" again → WhatsApp Accounts → select your WABA → Full Control → Save',
          'Click "Generate Token" → select your App → check whatsapp_business_messaging and whatsapp_business_management → Generate',
          'Copy the token immediately — Meta only shows it once',
        ],
      },
    ],
    warning: 'Do NOT use the temporary token from API Setup — it expires every 24 hours and will break your agent.',
    ctaLabel: 'Enter my credentials',
    ctaIcon: 'ti-plug-connected',
  },
  configure: {
    title: 'Configure your agent',
    what: 'This sets how your AI agent introduces itself and communicates with leads. It is the personality layer of your agent — name, tone, and how it speaks.',
    sections: [
      {
        heading: 'What you will configure',
        items: [
          'Agent Name → the name your agent uses with leads (e.g. "Sarah", "Alex")',
          'Agent Tone → the overall energy: Professional, Friendly, Direct, Conversational',
          'Agent Personality → 1-2 sentences describing how the agent behaves',
        ],
      },
      {
        heading: 'Why it matters',
        items: [
          'Your leads judge whether to trust you in the first 2 messages',
          'A real first name builds more trust than a brand name',
          'Match the tone to your audience — coaches: warm, agencies: professional',
          'Keep the personality short — 1 sentence is enough',
        ],
      },
    ],
    ctaLabel: 'Configure my agent',
    ctaIcon: 'ti-robot',
  },
  test: {
    title: 'Test your agent',
    what: 'Before going live, you test your agent across 6 critical scenarios. You play the role of a lead and chat with your agent directly in LeadFlow.',
    sections: [
      {
        heading: 'The 6 scenarios you will test',
        items: [
          'Script Flow & Sequence — does the agent follow the script in order?',
          'Off-Topic Recovery — when you go off-topic, does it come back on track?',
          'Question Handling — when you ask questions, does it answer then continue?',
          'Objection Handling — when you raise objections, does it handle them calmly?',
          'Hostile Lead — when you are rude or aggressive, does it stay composed?',
          'Closing Execution — does it ask for commitment at the right moment?',
        ],
      },
      {
        heading: 'How it works',
        items: [
          'Click "Start testing" to open the checklist',
          'Read the scenario for each field',
          'Chat with your agent as if you were a real lead',
          'Mark each test as Satisfied or leave a remark',
          'If you leave a remark, the AI fixes the issue automatically',
          'Retest until all 6 fields are Satisfied',
          'Click "Confirm & Unlock Full Workflow" when done',
        ],
      },
    ],
    warning: 'An untested agent will lose leads. Testing takes 15-20 minutes and saves you from losing real leads on day one.',
    ctaLabel: 'Start testing',
    ctaIcon: 'ti-flask',
  },
  deploy: {
    title: 'Deploy your flow',
    what: 'Deploying activates your AI agent. From this moment, your WhatsApp number is live and your agent will automatically handle every incoming message.',
    sections: [
      {
        heading: 'What happens when you deploy',
        items: [
          'Your n8n workflow is activated',
          'Your WhatsApp webhook is registered and listening',
          'Your agent starts responding to leads in real time',
          'Leads and conversations start appearing in your CRM',
        ],
      },
      {
        heading: 'What to check after deploying',
        items: [
          'Send a test message to your WhatsApp number',
          'Confirm the agent responds correctly',
          'Check your CRM to see the contact appear',
        ],
      },
    ],
    warning: 'Complete Steps 1, 2, and 3 before deploying. Any changes to the script after deploy require a re-deploy.',
    ctaLabel: 'Deploy my flow',
    ctaIcon: 'ti-rocket',
  },
  live: {
    title: 'Watch leads come in',
    what: 'Your agent is live. This step is about monitoring your results and making sure everything is working as expected.',
    sections: [
      {
        heading: 'What you will see in the CRM',
        items: [
          'Every lead that messaged your number',
          'Their current stage in the funnel (New → Engaged → Magnet Sent → Booked / Paid)',
          'The full conversation history for each lead',
          'Lead name, emotional state, and traffic source',
          'Booking or payment timestamps',
        ],
      },
      {
        heading: 'Tips to get leads in',
        items: [
          'Add your WhatsApp link to your bio: https://wa.me/YOUR_NUMBER',
          'The agent only works if people message it — drive traffic to it',
          'Check the CRM daily at first to see how the agent performs',
          'If the agent struggles on something, go back to Step 3 and leave a remark',
          'As results grow, raise your goal on the Home page',
        ],
      },
    ],
    ctaLabel: 'View my CRM',
    ctaIcon: 'ti-chart-bar',
  },
}

// ─── EXPLANATION MODAL ────────────────────────────────────────────────────────

function ExplanationModal({
  stepId,
  stepDone,
  onClose,
  onAction,
}: {
  stepId: string
  stepDone: boolean
  onClose: () => void
  onAction: () => void
}) {
  const content = STEP_EXPLANATIONS[stepId]
  if (!content) return null

  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 10) }, [])

  function close() {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 560,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          fontFamily: 'inherit',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '28px 28px 0',
          position: 'sticky', top: 0,
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: stepDone ? 'rgba(37,211,102,0.1)' : 'rgba(124,77,204,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className={`ti ${stepDone ? 'ti-circle-check' : STEP_EXPLANATIONS[stepId] ? `ti-${stepId === 'connect' ? 'plug-connected' : stepId === 'configure' ? 'robot' : stepId === 'test' ? 'flask' : stepId === 'deploy' ? 'rocket' : 'chart-bar'}` : 'ti-info-circle'}`}
                  style={{ fontSize: 21, color: stepDone ? '#1a8c4e' : '#7c4dcc' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
                  {stepDone ? 'Completed' : 'How to'}
                </div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', margin: 0 }}>
                  {content.title}
                </h2>
              </div>
            </div>
            <button
              onClick={close}
              style={{
                width: 32, height: 32, borderRadius: 9, border: 'none',
                background: 'rgba(0,0,0,0.05)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#aaa', transition: 'all 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.09)'; e.currentTarget.style.color = '#555' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#aaa' }}
            >
              <i className="ti ti-x" style={{ fontSize: 15 }} />
            </button>
          </div>
          <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.07)', margin: '0 -28px' }} />
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>

          {/* What is it */}
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 24 }}>
            {content.what}
          </p>

          {/* Warning */}
          {content.warning && (
            <div style={{
              padding: '14px 16px', borderRadius: 12, marginBottom: 24,
              background: 'rgba(245,158,11,0.07)',
              border: '0.5px solid rgba(245,158,11,0.25)',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <i className="ti ti-alert-triangle" style={{ fontSize: 15, color: '#b45309', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6, margin: 0 }}>{content.warning}</p>
            </div>
          )}

          {/* Sections */}
          {content.sections.map((section, si) => (
            <div key={si} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#888',
                textTransform: 'uppercase', letterSpacing: '0.07em',
                marginBottom: 10,
              }}>
                {section.heading}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map((item, ii) => (
                  <div key={ii} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 14px', borderRadius: 11,
                    background: 'rgba(0,0,0,0.025)',
                    border: '0.5px solid rgba(0,0,0,0.06)',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      background: 'rgba(0,0,0,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: '#888', marginTop: 1,
                    }}>
                      {ii + 1}
                    </div>
                    <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* CTA */}
          {!stepDone && (
            <button
              onClick={() => { close(); setTimeout(onAction, 280) }}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14,
                background: '#111', color: '#fff', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.15s', marginTop: 8,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <i className={`ti ${content.ctaIcon}`} style={{ fontSize: 15 }} />
              {content.ctaLabel}
            </button>
          )}

          {stepDone && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 18px', borderRadius: 14,
              background: 'rgba(37,211,102,0.06)',
              border: '0.5px solid rgba(37,211,102,0.2)',
              marginTop: 8,
            }}>
              <i className="ti ti-circle-check" style={{ fontSize: 18, color: '#1a8c4e' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1a8c4e' }}>
                This step is complete
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── GOAL BANNER ─────────────────────────────────────────────────────────────

function GoalBanner({ goalType, goalTarget, current, onGoalHit }: {
  goalType: string; goalTarget: number; current: number; onGoalHit: () => void
}) {
  const pct = Math.min(Math.round((current / goalTarget) * 100), 100)
  const label = goalType === 'bookings' ? 'bookings' : 'deals closed'
  const hit = current >= goalTarget

  useEffect(() => { if (hit) onGoalHit() }, [hit])

  return (
    <div className="glass" style={{
      borderRadius: 20, padding: '22px 28px', marginBottom: 32,
      display: 'flex', alignItems: 'center', gap: 24,
      animation: 'hm-up 0.4s ease both',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Your goal
          </span>
          {hit && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
              background: 'rgba(37,211,102,0.12)', color: '#1a8c4e',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <i className="ti ti-circle-check" style={{ fontSize: 10 }} /> Reached
            </span>
          )}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', marginBottom: 12 }}>
          {goalTarget} {label} per month
        </div>
        <div style={{ height: 6, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 99,
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
        <i className={`ti ${hit ? 'ti-trophy' : goalType === 'bookings' ? 'ti-calendar-check' : 'ti-message-2-check'}`}
          style={{ fontSize: 26, color: hit ? '#1a8c4e' : '#7c4dcc' }} />
      </div>
    </div>
  )
}

// ─── STEP CARD ────────────────────────────────────────────────────────────────

function StepCard({ step, index, isActive, isLocked, onClick }: {
  step: Step; index: number; isActive: boolean; isLocked: boolean; onClick: () => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      onMouseEnter={() => !isLocked && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '20px 24px', borderRadius: 18,
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
      <div style={{
        width: 40, height: 40, borderRadius: 13, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: step.done
          ? 'rgba(37,211,102,0.12)'
          : isActive ? 'rgba(124,77,204,0.1)' : 'rgba(0,0,0,0.04)',
        transition: 'background 0.2s',
      }}>
        {step.done
          ? <i className="ti ti-circle-check" style={{ fontSize: 20, color: '#1a8c4e' }} />
          : <i className={`ti ${step.icon}`} style={{ fontSize: 19, color: isActive ? '#7c4dcc' : '#bbb' }} />
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, marginBottom: 3,
          color: step.done ? '#6b9e7a' : isLocked ? '#bbb' : '#111',
          textDecoration: step.done ? 'line-through' : 'none',
          transition: 'color 0.2s',
        }}>
          {step.title}
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, color: step.done ? '#aaa' : isLocked ? '#ccc' : '#888' }}>
          {step.description}
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        {step.done ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
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
            opacity: hover ? 0.85 : 1, transition: 'opacity 0.15s',
          }}>
            See how
            <i className="ti ti-arrow-right" style={{ fontSize: 13 }} />
          </div>
        ) : step.done ? null : (
          <i className="ti ti-lock" style={{ fontSize: 15, color: '#ddd' }} />
        )}
      </div>
    </div>
  )
}

// ─── GOAL MODALS ──────────────────────────────────────────────────────────────

function GoalCelebration({ goalType, goalTarget, onSetNew }: {
  goalType: string; goalTarget: number; onSetNew: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
      animation: 'hm-fade 0.3s ease both',
    }}>
      <div className="glass-strong" style={{
        borderRadius: 28, padding: '48px 40px', maxWidth: 420, width: '90%',
        textAlign: 'center', animation: 'hm-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22, background: 'rgba(124,77,204,0.09)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <i className="ti ti-trophy" style={{ fontSize: 34, color: '#7c4dcc' }} />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.04em', marginBottom: 10 }}>
          Goal reached!
        </h2>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.65, marginBottom: 32 }}>
          You hit <strong>{goalTarget} {goalType === 'bookings' ? 'bookings' : 'deals'}</strong> this month. Time to aim higher.
        </p>
        <button onClick={onSetNew} style={{
          width: '100%', padding: '14px 0', borderRadius: 14,
          background: '#111', color: '#fff', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
          transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Set new goal
        </button>
      </div>
    </div>
  )
}

function SetGoalModal({ goalType, onSave, onClose }: {
  goalType: string; onSave: (t: number) => void; onClose: () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const options = goalType === 'bookings' ? ['10', '20', '50', '100'] : ['5', '10', '20', '50']
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
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
            <button key={o} onClick={() => setSelected(o)} style={{
              flex: 1, minWidth: 70, padding: '12px 0', borderRadius: 12, border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
              background: selected === o ? '#111' : 'rgba(0,0,0,0.05)',
              color: selected === o ? '#fff' : '#555', transition: 'all 0.15s',
            }}>
              {o}{o === '100' ? '+' : ''}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', borderRadius: 12,
            border: '0.5px solid rgba(0,0,0,0.1)', background: 'transparent',
            color: '#888', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
          }}>Cancel</button>
          <button onClick={() => selected && onSave(parseInt(selected))} disabled={!selected} style={{
            flex: 2, padding: '12px 0', borderRadius: 12, border: 'none',
            background: selected ? '#111' : 'rgba(0,0,0,0.06)',
            color: selected ? '#fff' : '#ccc',
            cursor: selected ? 'pointer' : 'default',
            fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, transition: 'all 0.15s',
          }}>Save goal</button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Home({ onNavigate, onOpenFlowConfig, onOpenChecklist }: Props) {
  const [loading, setLoading] = useState(true)
  const [goalType, setGoalType] = useState('bookings')
  const [goalTarget, setGoalTarget] = useState(10)
  const [currentCount, setCurrentCount] = useState(0)
  const [steps, setSteps] = useState<Step[]>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationDismissed, setCelebrationDismissed] = useState(false)
  const [showSetGoal, setShowSetGoal] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [activeModal, setActiveModal] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: ob } = await supabase.from('onboarding')
        .select('goal_type, goal_target, business_name').eq('user_id', user.id).maybeSingle()

      const gType = ob?.goal_type || 'bookings'
      const gTarget = ob?.goal_target || 10
      setGoalType(gType)
      setGoalTarget(gTarget)
      setBusinessName(ob?.business_name || '')

      const { data: flowConfig } = await supabase.from('flow_config')
        .select('phone_number_id, agent_name').eq('user_id', user.id).maybeSingle()

      const { data: flow } = await supabase.from('flows')
        .select('status').eq('user_id', user.id).eq('status', 'active').maybeSingle()

      const { data: checklist } = await supabase.from('pre_launch_checklist')
        .select('workflow_unlocked').eq('user_id', user.id).maybeSingle()

      const table = gType === 'close-in-chat' ? 'close_in_chat_leads' : 'booking_leads'
      const winField = gType === 'close-in-chat' ? 'paid_at' : 'booked_at'
      const { count } = await supabase.from(table)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).not(winField, 'is', null)

      setCurrentCount(count || 0)

      const step1Done = !!(flowConfig?.phone_number_id)
      const step2Done = !!(flowConfig?.agent_name)
      const step3Done = !!(checklist?.workflow_unlocked)
      const step4Done = !!(flow?.status === 'active')
      const step5Done = (count || 0) > 0

      setSteps([
        { id: 'connect', icon: 'ti-plug-connected', title: 'Connect WhatsApp', description: 'Link your WhatsApp Business number to LeadFlow.', cta: 'Connect', done: step1Done },
        { id: 'configure', icon: 'ti-robot', title: 'Configure your agent', description: 'Set your agent name, tone, and personality.', cta: 'Configure', done: step2Done },
        { id: 'test', icon: 'ti-flask', title: 'Test your agent', description: 'Run 6 critical scenarios before going live.', cta: 'Start testing', done: step3Done },
        { id: 'deploy', icon: 'ti-rocket', title: 'Deploy your flow', description: 'Go live and let your agent handle leads automatically.', cta: 'Deploy', done: step4Done },
        { id: 'live', icon: 'ti-chart-bar', title: 'Watch leads come in', description: 'Your agent is live. Track progress in your CRM.', cta: 'View CRM', done: step5Done },
      ])

      setLoading(false)
    }
    init()
  }, [])

  function getFirstActiveIndex(stepList: Step[]) {
    const i = stepList.findIndex(s => !s.done)
    return i === -1 ? stepList.length - 1 : i
  }

  function handleModalAction(stepId: string) {
    if (stepId === 'connect' || stepId === 'configure' || stepId === 'deploy') onOpenFlowConfig()
    else if (stepId === 'test') onOpenChecklist()
    else if (stepId === 'live') onNavigate('crm')
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
          {allDone ? `You're live` : `Let's get you to your first result`}
        </h1>
        <p style={{ fontSize: 14, color: '#aaa' }}>
          {allDone
            ? `${businessName ? businessName + ' is' : 'Your agent is'} running. Keep an eye on your CRM.`
            : `Click any step to learn what it is and how to do it.`}
        </p>
      </div>

      {/* Goal banner */}
      <GoalBanner
        goalType={goalType} goalTarget={goalTarget} current={currentCount}
        onGoalHit={() => { if (!celebrationDismissed) setShowCelebration(true) }}
      />

      {/* Change goal */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -20, marginBottom: 28 }}>
        <button onClick={() => setShowSetGoal(true)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: '#bbb', fontFamily: 'inherit', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s',
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
            key={step.id} step={step} index={i}
            isActive={i === activeIndex}
            isLocked={i > activeIndex && !step.done}
            onClick={() => setActiveModal(step.id)}
          />
        ))}
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="glass" style={{
          marginTop: 24, borderRadius: 18, padding: '22px 28px',
          display: 'flex', alignItems: 'center', gap: 16,
          border: '0.5px solid rgba(37,211,102,0.2)',
          background: 'rgba(37,211,102,0.04)',
          animation: 'hm-up 0.5s ease both',
        }}>
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
          <button onClick={() => onNavigate('crm')} style={{
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

      {/* Step explanation modal */}
      {activeModal && (
        <ExplanationModal
          stepId={activeModal}
          stepDone={steps.find(s => s.id === activeModal)?.done ?? false}
          onClose={() => setActiveModal(null)}
          onAction={() => handleModalAction(activeModal)}
        />
      )}

      {/* Goal celebration */}
      {showCelebration && (
        <GoalCelebration
          goalType={goalType} goalTarget={goalTarget}
          onSetNew={() => { setShowCelebration(false); setCelebrationDismissed(true); setShowSetGoal(true) }}
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
