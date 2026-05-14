import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  onComplete: () => void
}

const STEPS = [
  {
    id: 'profile',
    question: 'What describes you the most?',
    sub: "We'll personalise your experience based on your profile.",
    type: 'chips' as const,
    options: [
      { label: '🌱 New to Business', value: 'new-to-business' },
      { label: '🏢 Business Owner', value: 'business-owner' },
      { label: '🚀 Agency', value: 'agency' },
      { label: '🔧 Engineer', value: 'engineer' },
      { label: '⚙️ Automation Specialist', value: 'automation' },
      { label: '📣 Marketer', value: 'marketer' },
      { label: '✨ Other', value: 'other' },
    ],
  },
  {
    id: 'business_name',
    question: 'What is your business name?',
    sub: 'Your AI agent will introduce itself on behalf of your brand.',
    type: 'text' as const,
    placeholder: 'e.g. Nova Consulting',
  },
  {
    id: 'industry',
    question: 'What industry is {business_name} in?',
    sub: 'Tell us about your industry or niche.',
    type: 'text' as const,
    placeholder: 'e.g. Digital Marketing, SaaS, E-commerce, Coaching',
  },
  {
    id: 'ideal_client',
    question: 'Who is the ideal client of {business_name}?',
    sub: 'Describe your target audience — who they are, what they struggle with.',
    type: 'textarea' as const,
    placeholder: 'e.g. Coaches and consultants doing $5k–$20k/month who struggle with lead follow-ups...',
  },
  {
    id: 'results_promise',
    question: 'What results do you promise your clients?',
    sub: 'The transformation or outcome you deliver.',
    type: 'textarea' as const,
    placeholder: 'e.g. We help coaches book 10+ qualified calls per week without manual follow-ups...',
  },
  {
    id: 'product_type',
    question: 'How do you deliver your product?',
    sub: 'What is the format of what you offer?',
    type: 'chips' as const,
    options: [
      { label: '🎥 Video Course', value: 'video-course' },
      { label: '📱 Digital Product', value: 'digital-product' },
      { label: '📦 Physical Product', value: 'physical-product' },
      { label: '🎓 Training/Coaching', value: 'training' },
      { label: '💼 Service', value: 'service' },
      { label: '📊 Software/SaaS', value: 'saas' },
    ],
  },
  {
    id: 'product_price',
    question: 'How much does your {product_type} cost?',
    sub: 'This helps us calibrate how the agent qualifies leads.',
    type: 'number' as const,
    placeholder: '9999',
  },
  {
    id: 'offer_name',
    question: 'What is the name of your offer?',
    sub: 'The actual product name (like "AirMax" or "Sales Bootcamp").',
    type: 'text' as const,
    placeholder: 'e.g. The Lead Machine, Sales Mastery Program',
  },
  {
    id: 'traffic_source',
    question: 'What is your #1 traffic source?',
    sub: 'Where do most of your leads come from?',
    type: 'text' as const,
    placeholder: 'e.g. TikTok, Google Ads, Referrals, Organic Instagram',
  },
  {
    id: 'closing_method',
    question: 'How do you close your clients?',
    sub: 'Does your closing process involve phone calls?',
    type: 'chips' as const,
    options: [
      { label: '📞 Phone call', value: 'phone-call' },
      { label: '⚡ Without phone call (automation only)', value: 'no-phone' },
    ],
  },
]

// ─── 3D Rotating Logo Animation ──────────────────────────────────────────
function RotatingLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 280
    canvas.height = 280

    const ctx = canvas.getContext('2d')!
    let rotation = 0

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Teal background
      ctx.fillStyle = '#5eccc0'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Save and transform for rotation
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(rotation)

      // Draw pixelated mushroom/logo shape (simplified voxel style)
      const scale = 30
      const voxels = [
        // Top part (mushroom cap)
        [[0, -2], [1, -2], [2, -2], [3, -2], [-1, -2], [-2, -2]],
        [[-1, -1], [0, -1], [1, -1], [2, -1]],
        [[-1, 0], [0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1]],
        // Middle
        [[0, 2], [1, 2]],
        // Bottom part (stem and base)
        [[-1, 3], [0, 3], [1, 3]],
        [[-2, 4], [-1, 4], [0, 4], [1, 4], [2, 4]],
      ]

      ctx.fillStyle = '#c4d961'
      voxels.forEach(row => {
        row.forEach(([x, y]) => {
          ctx.fillRect(x * scale - scale / 2, y * scale - scale / 2, scale - 2, scale - 2)
        })
      })

      // Add some dotted edge effect for that pixelated look
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      const dotSize = 4
      voxels.forEach(row => {
        row.forEach(([x, y]) => {
          // Random dots on edges
          if (Math.random() > 0.7) {
            ctx.fillRect(x * scale - scale / 2 + Math.random() * scale, y * scale - scale / 2 + Math.random() * scale, dotSize, dotSize)
          }
        })
      })

      ctx.restore()

      rotation += 0.03
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return <canvas ref={canvasRef} style={{ width: 280, height: 280, borderRadius: 24 }} />
}

// ─── Progress Bar ──────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = (current / total) * 100
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i < current ? '#7c4dcc' : 'rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}

// ─── Main Onboarding Component ─────────────────────────────────────────────
export default function Onboarding({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const step = STEPS[currentStep]
  const businessName = answers.business_name || 'your business'
  const productType = answers.product_type ? (STEPS[5].options?.find(o => o.value === answers.product_type)?.label || 'product') : 'product'

  // Replace placeholders in question text
  const displayQuestion = step.question
    .replace('{business_name}', businessName)
    .replace('{product_type}', productType)

  async function handleNext() {
    if (!answers[step.id]) return

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save to Supabase
      await saveOnboarding()
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function saveOnboarding() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Transform answers to match database structure
      const onboardingData = {
        profile: answers.profile,
        business_name: answers.business_name,
        industry: answers.industry,
        ideal_client: answers.ideal_client,
        results_promise: answers.results_promise,
        product_type: answers.product_type,
        product_price: answers.product_price,
        offer_name: answers.offer_name,
        traffic_source: answers.traffic_source,
        closing_method: answers.closing_method,
      }

      const { error } = await supabase
        .from('onboarding')
        .upsert({
          user_id: user.id,
          completed: true,
          answers: onboardingData,
        })

      if (error) throw error
      // Call onComplete to move to next section
      onComplete()
    } catch (e) {
      console.error('Save onboarding error:', e)
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '100vh',
      background: '#fff',
      flexDirection: 'column',
    }}>
      {/* Header - stays at top */}
      <div style={{
        gridColumn: '1 / -1',
        padding: '20px 48px',
        borderBottom: '0.5px solid rgba(0,0,0,0.07)',
        background: '#fff',
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111', letterSpacing: '-0.04em' }}>
          LeadFlow
        </div>
      </div>

      {/* Progress Bar - spans both columns */}
      <div style={{
        gridColumn: '1 / -1',
        padding: '20px 48px 0',
      }}>
        <ProgressBar current={currentStep + 1} total={STEPS.length} />
      </div>

      {/* Left side - Questions */}
      <div style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 0 }}>
        <div style={{ maxWidth: 500 }}>
          {/* Step counter */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#999', fontWeight: 500, letterSpacing: '0.05em', marginBottom: 8 }}>
              STEP {currentStep + 1} OF {STEPS.length}
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: '0 0 12px', lineHeight: 1.2 }}>
              {displayQuestion}
            </h1>
            <p style={{ fontSize: 14, color: '#777', margin: 0, lineHeight: 1.6 }}>
              {step.sub}
            </p>
          </div>

          {/* Input field */}
          <div style={{ marginTop: 32, marginBottom: 48 }}>
            {step.type === 'text' && (
              <input
                type="text"
                placeholder={step.placeholder}
                value={answers[step.id] || ''}
                onChange={e => setAnswers({ ...answers, [step.id]: e.target.value })}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  fontSize: 14,
                  border: '0.5px solid rgba(0,0,0,0.1)',
                  borderRadius: 12,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(124, 77, 204, 0.3)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 77, 204, 0.08)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            )}

            {step.type === 'number' && (
              <input
                type="number"
                placeholder={step.placeholder}
                value={answers[step.id] || ''}
                onChange={e => setAnswers({ ...answers, [step.id]: e.target.value })}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  fontSize: 14,
                  border: '0.5px solid rgba(0,0,0,0.1)',
                  borderRadius: 12,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(124, 77, 204, 0.3)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 77, 204, 0.08)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            )}

            {step.type === 'textarea' && (
              <textarea
                placeholder={step.placeholder}
                value={answers[step.id] || ''}
                onChange={e => setAnswers({ ...answers, [step.id]: e.target.value })}
                style={{
                  width: '100%',
                  padding: '13px 16px',
                  fontSize: 14,
                  border: '0.5px solid rgba(0,0,0,0.1)',
                  borderRadius: 12,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                  minHeight: 100,
                  resize: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'rgba(124, 77, 204, 0.3)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 77, 204, 0.08)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            )}

            {(step.type === 'chips' || step.type === 'chips-multi') && step.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {step.options.map(opt => {
                  const isSelected = step.type === 'chips'
                    ? answers[step.id] === opt.value
                    : Array.isArray(answers[step.id]) && answers[step.id].includes(opt.value)

                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (step.type === 'chips') {
                          setAnswers({ ...answers, [step.id]: opt.value })
                        } else {
                          const current = answers[step.id] || []
                          const updated = current.includes(opt.value)
                            ? current.filter((v: string) => v !== opt.value)
                            : [...current, opt.value]
                          setAnswers({ ...answers, [step.id]: updated })
                        }
                      }}
                      style={{
                        padding: '12px 16px',
                        border: isSelected ? '1.5px solid #7c4dcc' : '0.5px solid rgba(0,0,0,0.1)',
                        borderRadius: 10,
                        background: isSelected ? 'rgba(124, 77, 204, 0.08)' : 'transparent',
                        color: isSelected ? '#7c4dcc' : '#333',
                        fontSize: 14,
                        fontWeight: isSelected ? 500 : 400,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(124, 77, 204, 0.3)'
                          e.currentTarget.style.background = 'rgba(124, 77, 204, 0.04)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                style={{
                  padding: '12px 24px',
                  border: '0.5px solid rgba(0,0,0,0.1)',
                  borderRadius: 10,
                  background: 'transparent',
                  color: '#666',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(124, 77, 204, 0.3)'
                  e.currentTarget.style.color = '#7c4dcc'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'
                  e.currentTarget.style.color = '#666'
                }}
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!answers[step.id] || loading}
              style={{
                flex: 1,
                padding: '12px 24px',
                border: 'none',
                borderRadius: 10,
                background: answers[step.id] ? '#111' : '#ddd',
                color: answers[step.id] ? '#fff' : '#999',
                fontSize: 14,
                fontWeight: 600,
                cursor: answers[step.id] ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (answers[step.id]) {
                  e.currentTarget.style.background = '#7c4dcc'
                }
              }}
              onMouseLeave={e => {
                if (answers[step.id]) {
                  e.currentTarget.style.background = '#111'
                }
              }}
            >
              {loading ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Animated Logo */}
      <div style={{
        background: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <RotatingLogo />
          <p style={{ marginTop: 32, fontSize: 13, color: '#999', maxWidth: 240, margin: '32px auto 0' }}>
            Your AI agent will be trained with this information to qualify leads perfectly.
          </p>
        </div>
      </div>
    </div>
  )
}
