import { useState } from 'react'

interface Props {
  flowId?: string | null
  templateId?: string | null
  onBack: () => void
}

const TONES = [
  { id: 'bro', name: '😎 Bro', preview: "Bro just drop ur info real quick, I got something crazy for u 🔥" },
  { id: 'pro', name: '💼 Pro', preview: "Please provide your details and I will send you the information shortly." },
  { id: 'friendly', name: '😊 Friendly', preview: "Hey! I'd love to help you out — just share your name and I'll get started!" },
  { id: 'warm', name: '🤗 Warm', preview: "Hi sweetheart! Before I send this over, can I get your name? 😊" },
]

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} className="glass-strong" style={{ borderRadius: 20, padding: '28px 32px', width: 420, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 18, fontFamily: 'inherit' }}>
          <i className="ti ti-x" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  )
}

function GlassSection({ icon, title, children, defaultOpen = false }: { icon: string; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="glass" style={{ borderRadius: 18, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.05)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className={`ti ${icon}`} style={{ fontSize: 16, color: '#444' }} aria-hidden="true" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{title}</span>
        </div>
        <i className="ti ti-chevron-up" style={{ fontSize: 16, color: '#aaa', transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} aria-hidden="true" />
      </div>
      {open && <div style={{ padding: '0 20px 20px', borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>{children}</div>}
    </div>
  )
}

function Field({ label, placeholder, type = 'text', hint, value, onChange }: { label: string; placeholder: string; type?: string; hint?: string; value?: string; onChange?: (v: string) => void }) {
  const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 9, padding: '9px 12px', fontSize: 13, color: '#111', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>{label}</label>
      {hint && <span style={{ fontSize: 11, color: '#aaa', marginTop: -3 }}>{hint}</span>}
      {type === 'textarea' ? (
        <textarea placeholder={placeholder} rows={3} value={value} onChange={e => onChange?.(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
      ) : (
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)} style={inputStyle} />
      )}
    </div>
  )
}

function ScriptModeCard({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <div onClick={onClick} className="glass" style={{ borderRadius: 14, padding: '20px', cursor: 'pointer', transition: 'all 0.15s', border: '0.5px solid rgba(0,0,0,0.08)' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = ''}>
      <div style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.05)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 18, color: '#333' }} aria-hidden="true" />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 11, color: '#888', lineHeight: 1.55 }}>{desc}</div>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16, padding: 0 }}>
      ← Change mode
    </button>
  )
}

function LivePreview({ script }: { script: string }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 8 }}>Live script preview</div>
      <div className="glass" style={{ borderRadius: 14, padding: '16px 18px' }}>
        <pre style={{ fontSize: 12, color: '#444', lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{script}</pre>
      </div>
    </div>
  )
}

function ScratchMode({ text, onChange, onBack }: { text: string; onChange: (v: string) => void; onBack: () => void }) {
  return (
    <div style={{ marginTop: 16 }}>
      <BackButton onClick={onBack} />
      <textarea
        placeholder="Write your script here..."
        value={text}
        onChange={e => onChange(e.target.value)}
        rows={16}
        style={{ width: '100%', background: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 12, padding: '14px', fontSize: 13, color: '#111', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.7, boxSizing: 'border-box' }}
      />
    </div>
  )
}

// ─── BOOKING WITH LM — SCRIPT 1 ──────────────────────────────────────────────

function ScriptBookingWithLM_S1() {
  const [mode, setMode] = useState<null | 'proven' | 'scratch'>(null)
  const [scratch, setScratch] = useState('')
  const [greeting, setGreeting] = useState('Wa alaykoum salam')
  const [trafficSource, setTrafficSource] = useState('TikTok')
  const [leadGoal, setLeadGoal] = useState('start making money from home')
  const [magnetType, setMagnetType] = useState('guide')
  const [pastExperience, setPastExperience] = useState('made money online')
  const [currentLevelCheck, setCurrentLevelCheck] = useState('understand how it works')
  const [outcomePromise, setOutcomePromise] = useState("In 4 minutes, you'll understand how simple it is to get paid online.")
  const [nextStepFraming, setNextStepFraming] = useState("make your first sale as fast as possible insha'Allah")
  const [magnetLink, setMagnetLink] = useState('')
  const [readTime, setReadTime] = useState('4 minutes')
  const [pageTeaser, setPageTeaser] = useState("don't skip page 14…👀")

  const preview = `${greeting} 👋 Just to confirm — you came from ${trafficSource} because you want to ${leadGoal}, right?

(Lead replies)

Perfect 😊 Before I send your ${magnetType}, what's your name?

(Lead replies)

Nice to meet you, (NAME) 👍
Quick question so I send you the right thing — Have you ever ${pastExperience} before, or not yet?

(Lead replies)

And do you ${currentLevelCheck} fully, or are you just starting?

(Lead replies)

Great so this is the right thing for you!

I'll send you your ${magnetType} now. ${outcomePromise}

Then if you like it, we'll talk about what you should do next to ${nextStepFraming}

Sounds good to you?

(Lead replies)

Perfect so here's your ${magnetType}: ${magnetLink || '(your link)'}

Take ${readTime} to read it now 👍

When you finish, send me "done" and I'll show you the next step

Ah and ${pageTeaser}`

  return (
    <GlassSection icon="ti-script" title="Script 1 — Lead Qualification + Lead Magnet Delivery" defaultOpen={false}>
      {mode === null && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <ScriptModeCard icon="ti-wand" title="Customize the proven script" desc="Start from our battle-tested template and fill in your details." onClick={() => setMode('proven')} />
          <ScriptModeCard icon="ti-pencil" title="Start from scratch" desc="Write your own custom script from a blank page." onClick={() => setMode('scratch')} />
        </div>
      )}
      {mode === 'proven' && (
        <div style={{ marginTop: 16 }}>
          <BackButton onClick={() => setMode(null)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Greeting" placeholder="e.g. Wa alaykoum salam, Hey..." value={greeting} onChange={setGreeting} />
              <Field label="Traffic source" placeholder="e.g. TikTok, Instagram..." value={trafficSource} onChange={setTrafficSource} />
            </div>
            <Field label="Lead goal" placeholder="e.g. start making money from home" hint="What does your lead want to achieve?" value={leadGoal} onChange={setLeadGoal} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Lead magnet type" placeholder="e.g. guide, video, ebook..." value={magnetType} onChange={setMagnetType} />
              <Field label="Lead magnet link" placeholder="https://..." type="url" value={magnetLink} onChange={setMagnetLink} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Past experience" placeholder="e.g. made money online..." hint="Fill in: Have you ever ___ before?" value={pastExperience} onChange={setPastExperience} />
              <Field label="Current level check" placeholder="e.g. understand how it works..." hint="Fill in: And do you ___ fully?" value={currentLevelCheck} onChange={setCurrentLevelCheck} />
            </div>
            <Field label="Outcome promise" placeholder="e.g. In 4 minutes, you'll understand how simple it is to get paid online." hint="What will they get after consuming the lead magnet?" value={outcomePromise} onChange={setOutcomePromise} />
            <Field label="Next step framing" placeholder="e.g. make your first sale as fast as possible" hint="Fill in: we'll talk about what you should do next to ___" value={nextStepFraming} onChange={setNextStepFraming} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Read time" placeholder="e.g. 4 minutes" value={readTime} onChange={setReadTime} />
              <Field label="Page teaser" placeholder="e.g. don't skip page 14…👀" hint="A curiosity hook at the end." value={pageTeaser} onChange={setPageTeaser} />
            </div>
            <LivePreview script={preview} />
          </div>
        </div>
      )}
      {mode === 'scratch' && <ScratchMode text={scratch} onChange={setScratch} onBack={() => setMode(null)} />}
    </GlassSection>
  )
}

// ─── BOOKING WITH LM — SCRIPT 2 ──────────────────────────────────────────────

function ScriptBookingWithLM_S2() {
  const [mode, setMode] = useState<null | 'proven' | 'scratch'>(null)
  const [scratch, setScratch] = useState('')
  const [greeting, setGreeting] = useState('Salam my friend')
  const [pastExperience, setPastExperience] = useState('making money online')
  const [leadGoal, setLeadGoal] = useState('make money from home')
  const [consumeIt, setConsumeIt] = useState('read it')
  const [incomeGoal1, setIncomeGoal1] = useState('extra income on the side')
  const [incomeGoal2, setIncomeGoal2] = useState('replace your income completely')
  const [motivation1, setMotivation1] = useState('Feel more in control of my life')
  const [motivation2, setMotivation2] = useState('Stop worrying about money')
  const [motivation3, setMotivation3] = useState('Support the people around me')
  const [motivation4, setMotivation4] = useState('Finally feel proud of myself')
  const [offerType, setOfferType] = useState('live training')
  const [offerDay, setOfferDay] = useState('This Saturday')
  const [offerDesc1, setOfferDesc1] = useState('How to offer something people actually want to pay for, even if you have no experience')
  const [offerDesc2, setOfferDesc2] = useState("How to use TikTok to bring people to you every day, even if you're starting from scratch")
  const [actionPlan, setActionPlan] = useState('simple 7-day action plan')
  const [firstResult, setFirstResult] = useState('your first $100 online')
  const [sessions, setSessions] = useState('6pm / 7pm / 8pm / 9pm')
  const [calendarLink, setCalendarLink] = useState('')

  const preview = `${greeting}
Sorry I didn't verify earlier — did the link for the guide work?

(Lead replies)

Perfect 👍
And did you have time to go through it or not yet?

If not complete:
No worries at all 👍
Go finish it first, it'll make everything much clearer for you
Message me after

If complete:

(Lead replies)

Nice — I'm curious, how did you find it?
Did it help you understand how ${pastExperience} actually works?

(Lead replies)

I'm glad it helped 🙏
Quick question — What made you want to ${consumeIt} in the first place?
Are you more just curious or actually looking to ${leadGoal}?

(Lead replies)

Ok I see 👍
So you're actually serious about this
And why does that matter to you?
Why do you want to ${leadGoal}?
Is it more like:
${incomeGoal1}
or ${incomeGoal2}?

(Lead replies)

Got it 👍
And if that actually works out for you… what would that change in your life?
Is it more like:
1 — ${motivation1}
2 — ${motivation2}
3 — ${motivation3}
4 — ${motivation4}

(Lead replies)

That's powerful

Now be honest with me…
If nothing changes, and you stay exactly where you are right now…
how would you feel in a few months knowing you could've done more?

(Lead replies)

Yeah… I understand

And that's exactly the problem most people face
They understand the basics… but they don't have a clear plan to follow

Because the truth is — ${pastExperience} isn't complicated
but without knowing what to do step by step, people just stay stuck

So let me ask you this:
Do you feel like you could figure everything out alone…
or would it be better to have some guidance and a clear plan to follow?

(Lead replies)

That makes sense 👍
I can see you're serious about this

So here's what I can do for you:

${offerDay}, I'm doing a ${offerType}
where I show step by step how to start from zero
Nothing complicated, just simple and clear

On the call, I'll show you 2 important things:
1 — ${offerDesc1}
2 — ${offerDesc2}

And at the end, I'll give you a ${actionPlan}
so you know exactly what to do to get ${firstResult}
No guessing, no confusion

Does that sound like something you'd want to join?

(Lead replies)

Perfect 👍

And just so you know — the call is completely free 👍
No catch, no pressure.
I just want to make sure I can actually help you before anything else.

I have ${sessions}
Which one works best for you?

(Lead replies)

Perfect 👍
Here's the link to book your spot 👇
${calendarLink || '(your calendar link)'}
Once you're in, send me a screenshot 👍`

  return (
    <GlassSection icon="ti-currency-dollar" title="Script 2 — Follow-up + Closing" defaultOpen={false}>
      {mode === null && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <ScriptModeCard icon="ti-wand" title="Customize the proven script" desc="Start from our battle-tested template and fill in your details." onClick={() => setMode('proven')} />
          <ScriptModeCard icon="ti-pencil" title="Start from scratch" desc="Write your own custom script from a blank page." onClick={() => setMode('scratch')} />
        </div>
      )}
      {mode === 'proven' && (
        <div style={{ marginTop: 16 }}>
          <BackButton onClick={() => setMode(null)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Greeting" placeholder="e.g. Salam my friend, Hey..." value={greeting} onChange={setGreeting} />
              <Field label="Consume it" placeholder="e.g. read it, watch it, go through it..." hint="Fill in: What made you want to ___ in the first place?" value={consumeIt} onChange={setConsumeIt} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Past experience" placeholder="e.g. making money online..." hint="Fill in: how ___ actually works?" value={pastExperience} onChange={setPastExperience} />
              <Field label="Lead goal" placeholder="e.g. make money from home..." value={leadGoal} onChange={setLeadGoal} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Income goal option 1" placeholder="e.g. extra income on the side" value={incomeGoal1} onChange={setIncomeGoal1} />
              <Field label="Income goal option 2" placeholder="e.g. replace your income completely" value={incomeGoal2} onChange={setIncomeGoal2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Motivation 1" placeholder="e.g. Feel more in control of my life" value={motivation1} onChange={setMotivation1} />
              <Field label="Motivation 2" placeholder="e.g. Stop worrying about money" value={motivation2} onChange={setMotivation2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Motivation 3" placeholder="e.g. Support the people around me" value={motivation3} onChange={setMotivation3} />
              <Field label="Motivation 4" placeholder="e.g. Finally feel proud of myself" value={motivation4} onChange={setMotivation4} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Offer type" placeholder="e.g. live training, workshop..." value={offerType} onChange={setOfferType} />
              <Field label="Offer day" placeholder="e.g. This Saturday, Tomorrow..." value={offerDay} onChange={setOfferDay} />
            </div>
            <Field label="Offer description line 1" placeholder="e.g. How to offer something people actually want to pay for, even if you have no experience" value={offerDesc1} onChange={setOfferDesc1} />
            <Field label="Offer description line 2" placeholder="e.g. How to use TikTok to bring people to you every day, even if you're starting from scratch" value={offerDesc2} onChange={setOfferDesc2} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Action plan" placeholder="e.g. simple 7-day action plan" value={actionPlan} onChange={setActionPlan} />
              <Field label="First result" placeholder="e.g. your first $100 online" value={firstResult} onChange={setFirstResult} />
            </div>
            <Field label="Calendar link" placeholder="https://calendly.com/..." type="url" value={calendarLink} onChange={setCalendarLink} />
            <LivePreview script={preview} />
          </div>
        </div>
      )}
      {mode === 'scratch' && <ScratchMode text={scratch} onChange={setScratch} onBack={() => setMode(null)} />}
    </GlassSection>
  )
}

// ─── BOOKING WITHOUT LM — SCRIPT 1 ───────────────────────────────────────────

function ScriptBookingWithoutLM_S1() {
  const [mode, setMode] = useState<null | 'proven' | 'scratch'>(null)
  const [scratch, setScratch] = useState('')
  const [greeting, setGreeting] = useState('Hey')
  const [trafficSource, setTrafficSource] = useState('TikTok')
  const [leadGoal, setLeadGoal] = useState('make money from home')
  const [pastExperience, setPastExperience] = useState('made money online')
  const [currentLevelCheck, setCurrentLevelCheck] = useState('understand how it works')
  const [incomeGoal1, setIncomeGoal1] = useState('extra income on the side')
  const [incomeGoal2, setIncomeGoal2] = useState('replace your income completely')
  const [motivation1, setMotivation1] = useState('Feel more in control of my life')
  const [motivation2, setMotivation2] = useState('Stop worrying about money')
  const [motivation3, setMotivation3] = useState('Support the people around me')
  const [motivation4, setMotivation4] = useState('Finally feel proud of myself')

  const preview = `${greeting} 👋 Just to confirm — you came from ${trafficSource} because you want to ${leadGoal}, right?

(Lead replies)

Perfect 😊 What's your name?

(Lead replies)

Nice to meet you, (NAME) 👍
Quick question — Have you ever ${pastExperience} before, or not yet?

(Lead replies)

And do you ${currentLevelCheck} fully, or are you just starting?

(Lead replies)

Got it 👍
And why does that matter to you?
Why do you want to ${leadGoal}?
Is it more like:
${incomeGoal1}
or ${incomeGoal2}?

(Lead replies)

And if that actually works out for you… what would that change in your life?
Is it more like:
1 — ${motivation1}
2 — ${motivation2}
3 — ${motivation3}
4 — ${motivation4}

(Lead replies)

That's powerful.
Now be honest with me…
If nothing changes and you stay exactly where you are right now…
how would you feel in a few months knowing you could've done more?

(Lead replies)

Yeah… I understand.
And that's exactly the problem most people face —
they want to ${leadGoal} but don't have a clear plan to follow.
So let me ask you this:
Do you feel like you could figure everything out alone…
or would it be better to have some guidance and a clear plan?

(Lead replies)`

  return (
    <GlassSection icon="ti-script" title="Script 1 — Lead Qualification" defaultOpen={false}>
      {mode === null && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <ScriptModeCard icon="ti-wand" title="Customize the proven script" desc="Start from our battle-tested template and fill in your details." onClick={() => setMode('proven')} />
          <ScriptModeCard icon="ti-pencil" title="Start from scratch" desc="Write your own custom script from a blank page." onClick={() => setMode('scratch')} />
        </div>
      )}
      {mode === 'proven' && (
        <div style={{ marginTop: 16 }}>
          <BackButton onClick={() => setMode(null)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Greeting" placeholder="e.g. Hey, Salam..." value={greeting} onChange={setGreeting} />
              <Field label="Traffic source" placeholder="e.g. TikTok, Instagram..." value={trafficSource} onChange={setTrafficSource} />
            </div>
            <Field label="Lead goal" placeholder="e.g. make money from home" hint="What does your lead want to achieve?" value={leadGoal} onChange={setLeadGoal} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Past experience" placeholder="e.g. made money online..." hint="Fill in: Have you ever ___ before?" value={pastExperience} onChange={setPastExperience} />
              <Field label="Current level check" placeholder="e.g. understand how it works..." hint="Fill in: And do you ___ fully?" value={currentLevelCheck} onChange={setCurrentLevelCheck} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Income goal option 1" placeholder="e.g. extra income on the side" value={incomeGoal1} onChange={setIncomeGoal1} />
              <Field label="Income goal option 2" placeholder="e.g. replace your income completely" value={incomeGoal2} onChange={setIncomeGoal2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Motivation 1" placeholder="e.g. Feel more in control of my life" value={motivation1} onChange={setMotivation1} />
              <Field label="Motivation 2" placeholder="e.g. Stop worrying about money" value={motivation2} onChange={setMotivation2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Motivation 3" placeholder="e.g. Support the people around me" value={motivation3} onChange={setMotivation3} />
              <Field label="Motivation 4" placeholder="e.g. Finally feel proud of myself" value={motivation4} onChange={setMotivation4} />
            </div>
            <LivePreview script={preview} />
          </div>
        </div>
      )}
      {mode === 'scratch' && <ScratchMode text={scratch} onChange={setScratch} onBack={() => setMode(null)} />}
    </GlassSection>
  )
}

// ─── WAIT TIME SELECTOR ───────────────────────────────────────────────────────

function WaitTimeSelector() {
  const [selected, setSelected] = useState('10min')
  const OPTIONS = ['5min', '10min', '15min', '30min', '1h', '2h']
  return (
    <GlassSection icon="ti-clock" title="Wait Time Before Follow-up" defaultOpen={false}>
      <p style={{ fontSize: 12, color: '#999', marginTop: 14, marginBottom: 14 }}>
        How long after sending the lead magnet should your agent wait before sending Script 2?
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {OPTIONS.map(opt => (
          <div key={opt} onClick={() => setSelected(opt)}
            style={{ padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: selected === opt ? '#111' : 'rgba(255,255,255,0.6)', color: selected === opt ? '#fff' : '#444', border: selected === opt ? 'none' : '0.5px solid rgba(0,0,0,0.12)', transition: 'all 0.15s' }}>
            {opt}
          </div>
        ))}
      </div>
    </GlassSection>
  )
}

// ─── BOOKING WITHOUT LM — SCRIPT 2 ───────────────────────────────────────────
function ScriptBookingWithoutLM_S2() {
  const [mode, setMode] = useState<null | 'proven' | 'scratch'>(null)
  const [scratch, setScratch] = useState('')
  const [offerType, setOfferType] = useState('live training')
  const [offerDay, setOfferDay] = useState('This Saturday')
  const [offerDesc1, setOfferDesc1] = useState('How to offer something people actually want to pay for, even if you have no experience')
  const [offerDesc2, setOfferDesc2] = useState("How to use TikTok to bring people to you every day, even if you're starting from scratch")
  const [actionPlan, setActionPlan] = useState('simple 7-day action plan')
  const [firstResult, setFirstResult] = useState('your first $100 online')
  const [fullPrice, setFullPrice] = useState('$18')
  const [discountedPrice, setDiscountedPrice] = useState('$9')
  const [discountPct, setDiscountPct] = useState('50%')
  const [condition1, setCondition1] = useState('You actually apply what you learn')
  const [condition2, setCondition2] = useState('You give me your feedback so I can improve it')
  const [condition3, setCondition3] = useState("You leave a review if you feel it's worth it")
  const [sessions, setSessions] = useState('6pm / 7pm / 8pm / 9pm')
  const [paymentLink, setPaymentLink] = useState('')

  const preview = `That makes sense 👍
I can see you're serious about this.

So here's what I can do for you:

${offerDay}, I'm doing a ${offerType}
where I show step by step how to start from zero.
Nothing complicated, just simple and clear.

On the call, I'll show you 2 important things:
1 — ${offerDesc1}
2 — ${offerDesc2}

And at the end, I'll give you a ${actionPlan}
so you know exactly what to do to get ${firstResult}
No guessing, no confusion.

Does that sound like something you'd want to join?

(Lead replies)

Perfect 👍

So normally, access to this is ${fullPrice}
But since you reached out today,
I can let you in for just ${discountedPrice} — so you save ${discountPct}

But under 3 simple conditions:
1 — ${condition1}
2 — ${condition2}
3 — ${condition3}
Fair?

And just so you feel comfortable —
if after the call you're not 100% clear on what to do to get ${firstResult},
I'll send you your money back.
No risk for you 👍

Does that sound good?

(Lead replies)

Perfect 👍
I have ${sessions}
Which one works best for you?

(Lead replies)

Perfect 👍
Here's the link to save your spot 👇
${paymentLink || '(your payment link)'}
Once you're in, send me a screenshot 👍`

  return (
    <GlassSection icon="ti-currency-dollar" title="Script 2 — Closing" defaultOpen={false}>
      {mode === null && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <ScriptModeCard icon="ti-wand" title="Customize the proven script" desc="Start from our battle-tested template and fill in your details." onClick={() => setMode('proven')} />
          <ScriptModeCard icon="ti-pencil" title="Start from scratch" desc="Write your own custom script from a blank page." onClick={() => setMode('scratch')} />
        </div>
      )}
      {mode === 'proven' && (
        <div style={{ marginTop: 16 }}>
          <BackButton onClick={() => setMode(null)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Offer type" placeholder="e.g. live training, workshop, call..." value={offerType} onChange={setOfferType} />
              <Field label="Offer day" placeholder="e.g. This Saturday, Tomorrow..." value={offerDay} onChange={setOfferDay} />
            </div>
            <Field label="Offer description line 1" placeholder="e.g. How to offer something people actually want to pay for, even if you have no experience" value={offerDesc1} onChange={setOfferDesc1} />
            <Field label="Offer description line 2" placeholder="e.g. How to use TikTok to bring people to you every day, even if you're starting from scratch" value={offerDesc2} onChange={setOfferDesc2} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Action plan" placeholder="e.g. simple 7-day action plan" value={actionPlan} onChange={setActionPlan} />
              <Field label="First result" placeholder="e.g. your first $100 online" value={firstResult} onChange={setFirstResult} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Full price" placeholder="e.g. $18" value={fullPrice} onChange={setFullPrice} />
              <Field label="Discounted price" placeholder="e.g. $9" value={discountedPrice} onChange={setDiscountedPrice} />
              <Field label="Discount %" placeholder="e.g. 50%" value={discountPct} onChange={setDiscountPct} />
            </div>
            <Field label="Condition 1" placeholder="e.g. You actually apply what you learn" value={condition1} onChange={setCondition1} />
            <Field label="Condition 2" placeholder="e.g. You give me your feedback so I can improve it" value={condition2} onChange={setCondition2} />
            <Field label="Condition 3" placeholder="e.g. You leave a review if you feel it's worth it" value={condition3} onChange={setCondition3} />
            <Field label="Sessions" placeholder="e.g. 6pm / 7pm / 8pm / 9pm" hint="List all available time slots" value={sessions} onChange={setSessions} />
            <Field label="Payment link" placeholder="https://..." type="url" value={paymentLink} onChange={setPaymentLink} />
            <LivePreview script={preview} />
          </div>
        </div>
      )}
      {mode === 'scratch' && <ScratchMode text={scratch} onChange={setScratch} onBack={() => setMode(null)} />}
    </GlassSection>
  )
}

// ─── CLOSE IN CHAT — SCRIPT 1 ────────────────────────────────────────────────

function ScriptCloseInChat_S1() {
  const [mode, setMode] = useState<null | 'proven' | 'scratch'>(null)
  const [scratch, setScratch] = useState('')
  const [greeting, setGreeting] = useState('Hey')
  const [trafficSource, setTrafficSource] = useState('TikTok')
  const [leadGoal, setLeadGoal] = useState('make money from home')
  const [pastExperience, setPastExperience] = useState('made money online')
  const [currentLevelCheck, setCurrentLevelCheck] = useState('understand how it works')
  const [incomeGoal1, setIncomeGoal1] = useState('extra income on the side')
  const [incomeGoal2, setIncomeGoal2] = useState('replace your income completely')
  const [motivation1, setMotivation1] = useState('Feel more in control of my life')
  const [motivation2, setMotivation2] = useState('Stop worrying about money')
  const [motivation3, setMotivation3] = useState('Support the people around me')
  const [motivation4, setMotivation4] = useState('Finally feel proud of myself')

  const preview = `${greeting} 👋 Just to confirm — you came from ${trafficSource} because you want to ${leadGoal}, right?

(Lead replies)

Perfect 😊 What's your name?

(Lead replies)

Nice to meet you, (NAME) 👍
Quick question — Have you ever ${pastExperience} before, or not yet?

(Lead replies)

And do you ${currentLevelCheck} fully, or are you just starting?

(Lead replies)

Got it 👍
And why does that matter to you?
Why do you want to ${leadGoal}?
Is it more like:
${incomeGoal1}
or ${incomeGoal2}?

(Lead replies)

And if that actually works out for you… what would that change in your life?
Is it more like:
1 — ${motivation1}
2 — ${motivation2}
3 — ${motivation3}
4 — ${motivation4}

(Lead replies)

That's powerful.
Now be honest with me…
If nothing changes and you stay exactly where you are right now…
how would you feel in a few months knowing you could've done more?

(Lead replies)

Yeah… I understand.
And that's exactly the problem most people face —
they want to ${leadGoal} but don't have a clear plan to follow.
So let me ask you this:
Do you feel like you could figure everything out alone…
or would it be better to have some guidance and a clear plan?

(Lead replies)`

  return (
    <GlassSection icon="ti-script" title="Script 1 — Lead Qualification" defaultOpen={false}>
      {mode === null && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <ScriptModeCard icon="ti-wand" title="Customize the proven script" desc="Start from our battle-tested template and fill in your details." onClick={() => setMode('proven')} />
          <ScriptModeCard icon="ti-pencil" title="Start from scratch" desc="Write your own custom script from a blank page." onClick={() => setMode('scratch')} />
        </div>
      )}
      {mode === 'proven' && (
        <div style={{ marginTop: 16 }}>
          <BackButton onClick={() => setMode(null)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Greeting" placeholder="e.g. Hey, Salam..." value={greeting} onChange={setGreeting} />
              <Field label="Traffic source" placeholder="e.g. TikTok, Instagram..." value={trafficSource} onChange={setTrafficSource} />
            </div>
            <Field label="Lead goal" placeholder="e.g. make money from home" hint="What does your lead want to achieve?" value={leadGoal} onChange={setLeadGoal} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Past experience" placeholder="e.g. made money online..." hint="Fill in: Have you ever ___ before?" value={pastExperience} onChange={setPastExperience} />
              <Field label="Current level check" placeholder="e.g. understand how it works..." hint="Fill in: And do you ___ fully?" value={currentLevelCheck} onChange={setCurrentLevelCheck} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Income goal option 1" placeholder="e.g. extra income on the side" value={incomeGoal1} onChange={setIncomeGoal1} />
              <Field label="Income goal option 2" placeholder="e.g. replace your income completely" value={incomeGoal2} onChange={setIncomeGoal2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Motivation 1" placeholder="e.g. Feel more in control of my life" value={motivation1} onChange={setMotivation1} />
              <Field label="Motivation 2" placeholder="e.g. Stop worrying about money" value={motivation2} onChange={setMotivation2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Motivation 3" placeholder="e.g. Support the people around me" value={motivation3} onChange={setMotivation3} />
              <Field label="Motivation 4" placeholder="e.g. Finally feel proud of myself" value={motivation4} onChange={setMotivation4} />
            </div>
            <LivePreview script={preview} />
          </div>
        </div>
      )}
      {mode === 'scratch' && <ScratchMode text={scratch} onChange={setScratch} onBack={() => setMode(null)} />}
    </GlassSection>
  )
}

// ─── CLOSE IN CHAT — SCRIPT 2 ────────────────────────────────────────────────

function ScriptCloseInChat_S2() {
  const [mode, setMode] = useState<null | 'proven' | 'scratch'>(null)
  const [scratch, setScratch] = useState('')
  const [greeting, setGreeting] = useState('Salam my friend')
  const [magnetType, setMagnetType] = useState('guide')
  const [pastExperience, setPastExperience] = useState('making money online')
  const [leadGoal, setLeadGoal] = useState('make money from home')
  const [consumeIt, setConsumeIt] = useState('read it')
  const [incomeGoal1, setIncomeGoal1] = useState('extra income on the side')
  const [incomeGoal2, setIncomeGoal2] = useState('replace your income completely')
  const [motivation1, setMotivation1] = useState('Feel more in control of my life')
  const [motivation2, setMotivation2] = useState('Stop worrying about money')
  const [motivation3, setMotivation3] = useState('Support the people around me')
  const [motivation4, setMotivation4] = useState('Finally feel proud of myself')
  const [offerName, setOfferName] = useState('our program')
  const [offerDesc1, setOfferDesc1] = useState('What you get / module 1')
  const [offerDesc2, setOfferDesc2] = useState('What you get / module 2')
  const [offerDesc3, setOfferDesc3] = useState('What you get / module 3')
  const [firstResult, setFirstResult] = useState('your first $100 online')
  const [fullPrice, setFullPrice] = useState('$18')
  const [discountedPrice, setDiscountedPrice] = useState('$9')
  const [discountPct, setDiscountPct] = useState('50%')
  const [condition1, setCondition1] = useState('You actually apply what you learn')
  const [condition2, setCondition2] = useState('You give me your feedback so I can improve it')
  const [condition3, setCondition3] = useState("You leave a review if you feel it's worth it")
  const [paymentLink, setPaymentLink] = useState('')

  const preview = `${greeting}
Sorry I didn't verify earlier — did the link for the ${magnetType} work?

(Lead replies)

Perfect 👍
And did you have time to go through it or not yet?

If not complete:
No worries at all 👍
Go finish it first, it'll make everything much clearer for you
Message me after

If complete:

(Lead replies)

Nice — I'm curious, how did you find it?
Did it help you understand how ${pastExperience} actually works?

(Lead replies)

I'm glad it helped 🙏
Quick question — What made you want to ${consumeIt} in the first place?
Are you more just curious or actually looking to ${leadGoal}?

(Lead replies)

Ok I see 👍
So you're actually serious about this
And why does that matter to you?
Why do you want to ${leadGoal}?
Is it more like:
${incomeGoal1}
or ${incomeGoal2}?

(Lead replies)

Got it 👍
And if that actually works out for you… what would that change in your life?
Is it more like:
1 — ${motivation1}
2 — ${motivation2}
3 — ${motivation3}
4 — ${motivation4}

(Lead replies)

That's powerful

Now be honest with me…
If nothing changes, and you stay exactly where you are right now…
how would you feel in a few months knowing you could've done more?

(Lead replies)

Yeah… I understand

And that's exactly the problem most people face
They understand the basics… but they don't have a clear plan to follow

Because the truth is — ${pastExperience} isn't complicated
but without knowing what to do step by step, people just stay stuck

So let me ask you this:
Do you feel like you could figure everything out alone…
or would it be better to have some guidance and a clear plan to follow?

(Lead replies)

That makes sense 👍
I can see you're serious about this

So here's what I can do for you:

Inside ${offerName}, here's what you get:
1 — ${offerDesc1}
2 — ${offerDesc2}
3 — ${offerDesc3}

And by the end you'll know exactly what to do to get ${firstResult}
No guessing, no confusion 👍

Does that sound like something you want?

(Lead replies)

Perfect 👍

So normally this is ${fullPrice}
But since you actually took action and went through the guide,
I can let you in for just ${discountedPrice} — so you save ${discountPct}

But under 3 simple conditions:
1 — ${condition1}
2 — ${condition2}
3 — ${condition3}
Fair?

And just so you feel comfortable —
if you're not 100% satisfied, I'll send you your money back.
No risk for you 👍

Does that sound good?

(Lead replies)

Perfect 👍

Here's your link to get started 👇
${paymentLink || '(your payment link)'}
Once you're in, send me a screenshot 👍`

  return (
    <GlassSection icon="ti-currency-dollar" title="Script 2 — Follow-up + Closing" defaultOpen={false}>
      {mode === null && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <ScriptModeCard icon="ti-wand" title="Customize the proven script" desc="Start from our battle-tested template and fill in your details." onClick={() => setMode('proven')} />
          <ScriptModeCard icon="ti-pencil" title="Start from scratch" desc="Write your own custom script from a blank page." onClick={() => setMode('scratch')} />
        </div>
      )}
      {mode === 'proven' && (
        <div style={{ marginTop: 16 }}>
          <BackButton onClick={() => setMode(null)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Greeting" placeholder="e.g. Salam my friend, Hey..." value={greeting} onChange={setGreeting} />
              <Field label="Lead magnet type" placeholder="e.g. guide, video, ebook..." value={magnetType} onChange={setMagnetType} />
              <Field label="Consume it" placeholder="e.g. read it, watch it, go through it..." hint="Fill in: What made you want to ___ in the first place?" value={consumeIt} onChange={setConsumeIt} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Past experience" placeholder="e.g. making money online..." hint="Fill in: how ___ actually works?" value={pastExperience} onChange={setPastExperience} />
              <Field label="Lead goal" placeholder="e.g. make money from home..." value={leadGoal} onChange={setLeadGoal} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Income goal option 1" placeholder="e.g. extra income on the side" value={incomeGoal1} onChange={setIncomeGoal1} />
              <Field label="Income goal option 2" placeholder="e.g. replace your income completely" value={incomeGoal2} onChange={setIncomeGoal2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Motivation 1" placeholder="e.g. Feel more in control of my life" value={motivation1} onChange={setMotivation1} />
              <Field label="Motivation 2" placeholder="e.g. Stop worrying about money" value={motivation2} onChange={setMotivation2} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Motivation 3" placeholder="e.g. Support the people around me" value={motivation3} onChange={setMotivation3} />
              <Field label="Motivation 4" placeholder="e.g. Finally feel proud of myself" value={motivation4} onChange={setMotivation4} />
            </div>
            <Field label="Offer name" placeholder="e.g. our program, the course, the mentorship..." value={offerName} onChange={setOfferName} />
            <Field label="Offer description line 1" placeholder="e.g. Full system access" value={offerDesc1} onChange={setOfferDesc1} />
            <Field label="Offer description line 2" placeholder="e.g. Direct support from me" value={offerDesc2} onChange={setOfferDesc2} />
            <Field label="Offer description line 3" placeholder="e.g. First results in 30 days" value={offerDesc3} onChange={setOfferDesc3} />
            <Field label="First result" placeholder="e.g. your first $100 online" value={firstResult} onChange={setFirstResult} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Full price" placeholder="e.g. $18" value={fullPrice} onChange={setFullPrice} />
              <Field label="Discounted price" placeholder="e.g. $9" value={discountedPrice} onChange={setDiscountedPrice} />
              <Field label="Discount %" placeholder="e.g. 50%" value={discountPct} onChange={setDiscountPct} />
            </div>
            <Field label="Condition 1" placeholder="e.g. You actually apply what you learn" value={condition1} onChange={setCondition1} />
            <Field label="Condition 2" placeholder="e.g. You give me your feedback so I can improve it" value={condition2} onChange={setCondition2} />
            <Field label="Condition 3" placeholder="e.g. You leave a review if you feel it's worth it" value={condition3} onChange={setCondition3} />
            <Field label="Payment link" placeholder="https://..." type="url" value={paymentLink} onChange={setPaymentLink} />
            <LivePreview script={preview} />
          </div>
        </div>
      )}
      {mode === 'scratch' && <ScratchMode text={scratch} onChange={setScratch} onBack={() => setMode(null)} />}
    </GlassSection>
  )
}
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const TEMPLATE_TITLES: Record<string, string> = {
  'booking-with-lm': 'Configure your booking flow w/ lead magnet',
  'booking-without-lm': 'Configure your direct booking flow',
  'close-in-chat': 'Configure your chat closing flow',
}
const TEMPLATE_SUBTITLES: Record<string, string> = {
  'booking-with-lm': 'Set up your WhatsApp agent in a few steps.',
  'booking-without-lm': 'Set up your direct booking agent in a few steps.',
  'close-in-chat': 'Set up your chat closing agent in a few steps.',
}
const TEMPLATE_SAVE_LABELS: Record<string, string> = {
  'booking-with-lm': 'Save & activate booking flow',
  'booking-without-lm': 'Save & activate booking flow',
  'close-in-chat': 'Save & activate closing flow',
}

export default function FlowConfig({ onBack, flowId, templateId }: Props) {
  const [selectedTone, setSelectedTone] = useState('friendly')
  const [receiveModal, setReceiveModal] = useState(false)
  const [sendModal, setSendModal] = useState(false)
  const [receiveConnected, setReceiveConnected] = useState(false)
  const [sendConnected, setSendConnected] = useState(false)
  const [receiveForm, setReceiveForm] = useState({ clientId: '', clientSecret: '' })
  const [sendForm, setSendForm] = useState({ accessToken: '', businessId: '' })
  const [agentName, setAgentName] = useState('')
  const [agentPersonality, setAgentPersonality] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const key = templateId || 'booking-with-lm'
  const title = TEMPLATE_TITLES[key] || TEMPLATE_TITLES['booking-with-lm']
  const subtitle = TEMPLATE_SUBTITLES[key] || TEMPLATE_SUBTITLES['booking-with-lm']
  const saveLabel = TEMPLATE_SAVE_LABELS[key] || TEMPLATE_SAVE_LABELS['booking-with-lm']

  return (
    <div style={{ padding: '32px 48px', maxWidth: 860, margin: '0 auto' }}>
      <button onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'inherit', marginBottom: 24, padding: 0 }}
        onMouseEnter={e => (e.currentTarget.style.color = '#111')}
        onMouseLeave={e => (e.currentTarget.style.color = '#888')}>
        <i className="ti ti-arrow-left" style={{ fontSize: 15 }} aria-hidden="true" />
        Back
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: '-0.5px', marginBottom: 4 }}>{title}</h1>
      <p style={{ fontSize: 14, color: '#999', marginBottom: 28 }}>{subtitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <GlassSection icon="ti-plug" title="Integrations" defaultOpen={true}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
            <div className="glass" style={{ borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-brand-whatsapp" style={{ fontSize: 20, color: '#25D366' }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>WhatsApp Receive</div>
                  <div style={{ fontSize: 11, color: receiveConnected ? '#25D366' : '#aaa' }}>{receiveConnected ? '✓ Connected' : 'Incoming messages'}</div>
                </div>
              </div>
              <button onClick={() => setReceiveModal(true)} style={{ background: receiveConnected ? 'rgba(37,211,102,0.1)' : '#111', color: receiveConnected ? '#1a8c4e' : '#fff', border: receiveConnected ? '0.5px solid rgba(37,211,102,0.4)' : 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                {receiveConnected ? 'Reconnect' : 'Connect'}
              </button>
            </div>
            <div className="glass" style={{ borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="ti ti-brand-whatsapp" style={{ fontSize: 20, color: '#25D366' }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>WhatsApp Send</div>
                  <div style={{ fontSize: 11, color: sendConnected ? '#25D366' : '#aaa' }}>{sendConnected ? '✓ Connected' : 'Outgoing messages'}</div>
                </div>
              </div>
              <button onClick={() => setSendModal(true)} style={{ background: sendConnected ? 'rgba(37,211,102,0.1)' : '#111', color: sendConnected ? '#1a8c4e' : '#fff', border: sendConnected ? '0.5px solid rgba(37,211,102,0.4)' : 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                {sendConnected ? 'Reconnect' : 'Connect'}
              </button>
            </div>
          </div>
        </GlassSection>

        <GlassSection icon="ti-mood-smile" title="AI Agent Tone" defaultOpen={false}>
          <p style={{ fontSize: 12, color: '#999', marginTop: 14, marginBottom: 14 }}>Choose how your agent speaks to leads.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TONES.map(tone => (
              <div key={tone.id} onClick={() => setSelectedTone(tone.id)}
                style={{ background: 'rgba(255,255,255,0.6)', border: selectedTone === tone.id ? '1.5px solid #111' : '0.5px solid rgba(0,0,0,0.10)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 5 }}>{tone.name}</div>
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>{tone.preview}</div>
              </div>
            ))}
          </div>
        </GlassSection>

        <GlassSection icon="ti-user-circle" title="AI Agent Personality" defaultOpen={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
            <Field label="Agent name" placeholder="e.g. Sofia, Max, Alex..." value={agentName} onChange={setAgentName} />
            <Field label="Personality description" placeholder="e.g. Energetic, empathetic, speaks simply and directly. Never salesy." type="textarea" hint="Describe how your agent should behave and feel to leads." value={agentPersonality} onChange={setAgentPersonality} />
          </div>
        </GlassSection>

        {key === 'booking-with-lm' && <><ScriptBookingWithLM_S1 /><WaitTimeSelector /><ScriptBookingWithLM_S2 /></>}
        {key === 'booking-without-lm' && <><ScriptBookingWithoutLM_S1 /><ScriptBookingWithoutLM_S2 /></>}
        {key === 'close-in-chat' && <><ScriptBookingWithLM_S1 /><WaitTimeSelector /><ScriptCloseInChat_S2 /></>}

        <button onClick={() => setShowSuccess(true)}
          style={{ width: '100%', background: '#111', color: '#fff', border: 'none', borderRadius: 13, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          <i className="ti ti-check" style={{ fontSize: 16 }} aria-hidden="true" />
          {saveLabel}
        </button>
      </div>

      {receiveModal && (
        <Modal onClose={() => setReceiveModal(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>WhatsApp Receive</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>Enter your credentials to receive incoming WhatsApp messages.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Client ID" placeholder="Your WhatsApp Client ID" value={receiveForm.clientId} onChange={v => setReceiveForm(f => ({ ...f, clientId: v }))} />
            <Field label="Client Secret" placeholder="Your WhatsApp Client Secret" type="password" value={receiveForm.clientSecret} onChange={v => setReceiveForm(f => ({ ...f, clientSecret: v }))} />
          </div>
          <button onClick={() => { setReceiveConnected(true); setReceiveModal(false) }} style={{ width: '100%', marginTop: 20, background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Connect</button>
        </Modal>
      )}

      {sendModal && (
        <Modal onClose={() => setSendModal(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>WhatsApp Send</h2>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>Enter your credentials to send WhatsApp messages to leads.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Access Token" placeholder="Your WhatsApp Access Token" type="password" value={sendForm.accessToken} onChange={v => setSendForm(f => ({ ...f, accessToken: v }))} />
            <Field label="Business Account ID" placeholder="Your Business Account ID" value={sendForm.businessId} onChange={v => setSendForm(f => ({ ...f, businessId: v }))} />
          </div>
          <button onClick={() => { setSendConnected(true); setSendModal(false) }} style={{ width: '100%', marginTop: 20, background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Connect</button>
        </Modal>
      )}

      {showSuccess && (
        <Modal onClose={() => setShowSuccess(false)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ width: 56, height: 56, background: 'rgba(37,211,102,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className="ti ti-check" style={{ fontSize: 28, color: '#25D366' }} aria-hidden="true" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>Request sent!</h2>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>Your flow configuration has been saved. Your WhatsApp agent will be activated shortly.</p>
            <button onClick={() => setShowSuccess(false)} style={{ background: '#111', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Done</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
