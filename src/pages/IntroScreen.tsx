import { useEffect, useRef } from 'react'

interface Props {
  onComplete: () => void
}

export default function IntroScreen({ onComplete }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const TASKS = [
      'Connect WhatsApp',
      'Create AI agent',
      'Set identity & tools',
      'Wire send node',
      'Deploy & go live',
    ]
    const NODES = [
      { title: 'WhatsApp Connection', desc: 'Connecting your WhatsApp to LeadFlow.', icon: 'ti-brand-whatsapp' },
      { title: 'Agent Identity', desc: 'Personality, goals and behavior set.', icon: 'ti-robot' },
      { title: 'Tools & Knowledge', desc: 'Prompts, tools and business context loaded.', icon: 'ti-brain' },
      { title: 'Send Message Node', desc: 'Live WhatsApp messaging wired up.', icon: 'ti-send' },
    ]

    const $ = (id: string) => root.querySelector(`#${id}`)
    const show = (id: string, d: number) => {
      setTimeout(() => {
        const e = $(id)
        if (e) e.classList.add('on')
      }, d)
    }
    const hide = (id: string) => {
      const e = $(id)
      if (e) e.classList.remove('on')
    }
    const prog = (pct: number, d: number) => {
      setTimeout(() => {
        const e = $('lf-prog')
        const p = $('lf-pct')
        if (e) (e as HTMLElement).style.width = pct + '%'
        if (p) p.textContent = pct + '%'
        const a = $('lf-accent')
        if (a) (a as HTMLElement).style.width = pct * 0.58 + '%'
      }, d)
    }
    const typeText = (targetId: string, text: string, speed: number, cb?: () => void) => {
      const el = $(targetId)
      if (!el) return
      el.textContent = ''
      let i = 0
      const t = setInterval(() => {
        el.textContent += text[i]
        i++
        if (i >= text.length) {
          clearInterval(t)
          if (cb) setTimeout(cb, 200)
        }
      }, speed)
    }

    const buildTasks = () => {
      const c = $('lf-tasks')
      if (!c) return
      c.innerHTML = ''
      TASKS.forEach((t, i) => {
        const row = document.createElement('div')
        row.style.cssText = 'display:flex;align-items:center;gap:8px;opacity:0;transition:opacity .3s ease;'
        row.id = `lf-task-${i}`
        row.innerHTML = `<div id="lf-chk-${i}" style="width:16px;height:16px;border-radius:50%;background:#222;flex-shrink:0;transition:background .3s ease,box-shadow .3s ease;"></div><span style="font-size:11px;color:rgba(255,255,255,.6);">${t}</span>`
        c.appendChild(row)
      })
    }

    const buildNodes = () => {
      const c = $('lf-nodes')
      if (!c) return
      c.innerHTML = ''
      NODES.forEach((n, i) => {
        if (i > 0) {
          const line = document.createElement('div')
          line.id = `lf-line-${i}`
          line.className = 'lf-node-line'
          line.style.cssText = 'width:1.5px;background:rgba(255,255,255,.12);margin-left:15px;'
          c.appendChild(line)
        }
        const card = document.createElement('div')
        card.id = `lf-nd-${i}`
        card.className = 'lf-slide'
        card.style.cssText = 'background:#151515;border:0.5px solid rgba(255,255,255,.07);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:10px;'
        card.innerHTML = `
          <div style="width:32px;height:32px;background:#c4b5fd;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 0 14px rgba(196,181,253,.3);">
            <i class="ti ${n.icon}" style="font-size:16px;color:#1a1a1a;"></i>
          </div>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:600;color:rgba(255,255,255,.85);margin-bottom:2px;">${n.title}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.35);line-height:1.4;">${n.desc}</div>
          </div>
          <div id="lf-nchk-${i}" class="lf-dot" style="width:18px;height:18px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;color:#000;font-weight:700;"></div>
        `
        c.appendChild(card)
      })
    }

    const checkTask = (i: number) => {
      const row = $(`lf-task-${i}`)
      if (row) (row as HTMLElement).style.opacity = '1'
      const chk = $(`lf-chk-${i}`)
      if (chk) {
        (chk as HTMLElement).style.background = '#34d399'
        (chk as HTMLElement).style.boxShadow = '0 0 12px rgba(52,211,153,.6)'
      }
    }
    const checkNode = (i: number) => {
      const chk = $(`lf-nchk-${i}`)
      if (chk) {
        chk.classList.add('done')
        chk.textContent = '✓'
      }
    }
    const showNode = (i: number, d: number) => {
      if (i > 0)
        setTimeout(() => {
          const l = $(`lf-line-${i}`)
          if (l) l.classList.add('on')
        }, d - 150)
      show(`lf-nd-${i}`, d)
    }

    let loopCount = 0
    const resetAll = () => {
      ;['lf-b1', 'lf-b2', 'lf-thought', 'lf-gotit', 'lf-building', 'lf-todo'].forEach(id => hide(id))
      const cur = $('lf-cur2')
      if (cur) (cur as HTMLElement).style.display = 'inline'
      const b2t = $('lf-b2t')
      if (b2t) b2t.textContent = ''
      ;['lf-prog', 'lf-accent'].forEach(id => {
        const e = $(id)
        if (e) (e as HTMLElement).style.width = '0%'
      })
      const p = $('lf-pct')
      if (p) p.textContent = '0%'
      buildTasks()
      buildNodes()
    }

    const runLoop = () => {
      loopCount++
      const ll = $('lf-loop')
      if (ll) ll.textContent = `Loop ${loopCount}`
      resetAll()

      prog(8, 300)
      show('lf-b1', 400)

      show('lf-b2', 1100)
      setTimeout(() => {
        typeText('lf-b2t', "Bro it's easy and simple... just watch me build your AI WhatsApp agent.", 26, () => {
          const c = $('lf-cur2')
          if (c) (c as HTMLElement).style.display = 'none'
        })
      }, 1200)
      prog(18, 1400)

      show('lf-thought', 2800)
      show('lf-gotit', 3600)
      show('lf-building', 4200)
      show('lf-todo', 4400)
      prog(30, 4400)

      const nodeTimings = [4800, 6200, 7600, 9000]
      const taskTimings = [5200, 6600, 8000, 9400, 10600]

      nodeTimings.forEach((t, i) => {
        showNode(i, t)
        setTimeout(() => checkNode(i), t + 900)
        setTimeout(() => checkTask(i), t + 1000)
        prog(30 + (i + 1) * 15, t + 800)
      })

      setTimeout(() => checkTask(4), 10600)
      prog(100, 10400)

      setTimeout(runLoop, 14500)
    }

    runLoop()

    return () => {
      // Cleanup on unmount
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f9f9f9' }}>
      <style>{`
        #lf-root * { box-sizing: border-box; }
        
        .lf-fade {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .lf-fade.on {
          opacity: 1;
          transform: translateY(0);
        }
        
        .lf-slide {
          opacity: 0;
          transform: translateX(14px);
          transition: opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .lf-slide.on {
          opacity: 1;
          transform: translateX(0);
        }
        
        .lf-node-line {
          height: 0;
          transition: height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }
        .lf-node-line.on {
          height: 32px;
        }
        
        .lf-dot {
          background: #222;
          transition: background 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .lf-dot.done {
          background: #34d399;
          box-shadow: 0 0 14px rgba(52, 211, 153, 0.7);
        }
        
        @keyframes lfblink { 50% { opacity: 0; } }
        .lf-cursor {
          animation: lfblink 0.75s infinite;
          color: #a78bfa;
        }
        
        @keyframes lfspin { to { transform: rotate(360deg); } }
        .lf-spin {
          display: inline-block;
          animation: lfspin 0.9s linear infinite;
        }
        
        .lf-prog {
          transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div ref={rootRef} id="lf-root" style={{ width: '100%', maxWidth: '1000px' }}>
        {/* Top */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.04em', color: '#111' }}>LeadFlow</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '140px', height: '3px', background: 'rgba(0,0,0,.08)', borderRadius: '99px', overflow: 'hidden' }}>
              <div
                className="lf-prog"
                id="lf-prog"
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #a78bfa, #34d399)',
                  width: '0%',
                  borderRadius: '99px',
                }}
              />
            </div>
            <span id="lf-pct" style={{ fontSize: '11px', color: 'rgba(0,0,0,.3)', minWidth: '26px' }}>
              0%
            </span>
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '6px', color: '#111' }}>Watch LeadFlow in action</div>
          <div style={{ fontSize: '13px', color: 'rgba(0,0,0,.4)' }}>Before you dive in — watch your AI WhatsApp agent build itself live.</div>
        </div>

        {/* Main card */}
        <div
          style={{
            border: '0.5px solid rgba(0,0,0,.07)',
            borderRadius: '24px',
            overflow: 'hidden',
            display: 'flex',
            minHeight: '360px',
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 8px 32px rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.8)',
          }}
        >
          {/* Green top accent bar */}
          <div
            id="lf-accent"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '3px',
              width: '0%',
              background: 'linear-gradient(90deg, #d9ff6a, #b6ff42)',
              borderRadius: '99px 99px 0 0',
              boxShadow: '0 0 16px rgba(190, 255, 66, 0.6)',
              transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              zIndex: 2,
            }}
          />

          {/* Dot grid bg */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(0,0,0,.04) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
              pointerEvents: 'none',
            }}
          />

          {/* Purple glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle at top right, rgba(168,85,247,.12), transparent 65%)',
              pointerEvents: 'none',
            }}
          />

          {/* LEFT — chat */}
          <div style={{ width: '42%', padding: '28px 24px', borderRight: '0.5px solid rgba(0,0,0,.07)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
            {/* User bubble */}
            <div
              className="lf-fade"
              id="lf-b1"
              style={{
                alignSelf: 'flex-end',
                background: '#c4b5fd',
                color: '#1a1a1a',
                borderRadius: '16px 16px 4px 16px',
                padding: '11px 15px',
                fontSize: '13px',
                fontWeight: 500,
                maxWidth: '200px',
                lineHeight: 1.5,
                boxShadow: '0 4px 12px rgba(196, 181, 253, 0.25)',
              }}
            >
              Hey LeadFlow, how do you work? 👀
            </div>

            {/* AI bubble typing */}
            <div
              className="lf-fade"
              id="lf-b2"
              style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,.5)',
                border: '0.5px solid rgba(0,0,0,.08)',
                color: '#111',
                borderRadius: '16px 16px 16px 4px',
                padding: '11px 15px',
                fontSize: '13px',
                maxWidth: '220px',
                lineHeight: 1.5,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <span id="lf-b2t" />
              <span className="lf-cursor" id="lf-cur2">
                |
              </span>
            </div>

            {/* Thought */}
            <div className="lf-fade" id="lf-thought" style={{ fontSize: '12px', color: 'rgba(0,0,0,.4)', paddingLeft: '4px' }}>
              <i className="ti ti-chevron-right" style={{ fontSize: '12px' }} /> Thinking for 3 seconds…
            </div>

            {/* Got it */}
            <div
              className="lf-fade"
              id="lf-gotit"
              style={{
                background: 'rgba(255,255,255,.5)',
                border: '0.5px solid rgba(0,0,0,.08)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#111',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              Got it — let's start.
            </div>

            {/* Building */}
            <div className="lf-fade" id="lf-building" style={{ fontSize: '13px', color: 'rgba(0,0,0,.4)', paddingLeft: '4px' }}>
              <span className="lf-spin">⬡</span>&nbsp; Building…
            </div>
          </div>

          {/* RIGHT — workflow nodes + todo */}
          <div style={{ flex: 1, padding: '28px 24px', position: 'relative', zIndex: 1, display: 'flex', gap: '18px' }}>
            {/* Todo list */}
            <div
              className="lf-fade"
              id="lf-todo"
              style={{
                width: '170px',
                flexShrink: 0,
                background: 'rgba(255,255,255,.4)',
                border: '0.5px solid rgba(0,0,0,.07)',
                borderRadius: '16px',
                padding: '16px',
                alignSelf: 'flex-start',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: '#111' }}>Todo List</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} id="lf-tasks" />
            </div>

            {/* Nodes */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }} id="lf-nodes" />
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(0,0,0,.2)' }} id="lf-loop">
            Loop 1
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => onComplete()}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(0,0,0,.5)',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Skip
            </button>
            <button
              onClick={() => onComplete()}
              style={{
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '99px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
