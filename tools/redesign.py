# One-time patch: applies the "Stackmat + Arena" redesign and the Learn tab to src-body.html.
import json, re
P = 'src-body.html'
s = open(P).read()


def rep(a, b, count=1):
    global s
    assert a in s, 'missing: ' + a[:90]
    s = s.replace(a, b, count)


# ---------- fonts (web build) ----------
rep('family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;500&family=Figtree:wght@400;500;600',
    'family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,700&family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500')

# ---------- tokens: one dark Stackmat palette ----------
a = s.index(':root{\n  --bg:#f3f4f1')
b = s.index('*{box-sizing:border-box}')
s = s[:a] + ''':root{
  --bg:#0B0C0F; --rail:#101217; --surface:#13151A; --sunk:#1B1E25; --line:#262A32;
  --fg:#EEF0F4; --muted:#8A919D; --accent:#2F6BFF; --accent-soft:#A9C1FF; --accent-fg:#ffffff;
  --ready:#22C55E; --hold:#EF4444; --warn:#FFB020; --good:#5FE0A0;
  --plastic:#050505; --gray-st:#5d6259; --stage:#0F1116;
  --f-display:"Chakra Petch", "Segoe UI", system-ui, sans-serif;
  --f-body:"Barlow", "Segoe UI", system-ui, sans-serif;
  --f-mono:"JetBrains Mono", ui-monospace, Consolas, monospace;
  color-scheme:dark;
}
''' + s[b:]

# ---------- page layout: rail + main ----------
rep('''body{background:var(--bg);color:var(--fg);font-family:var(--f-body);font-size:15px;line-height:1.45;
  padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:18px 40px}
.wrap{max-width:1120px;margin:0 auto;display:flex;flex-direction:column;gap:18px}''',
'''body{background:var(--bg);color:var(--fg);font-family:var(--f-body);font-size:15px;line-height:1.45;margin:0}
.app{display:flex;min-height:100vh}
.wrap{flex:1;min-width:0;max-width:1320px;display:flex;flex-direction:column;gap:16px;padding:20px max(16px,env(safe-area-inset-right,0px)) 40px 26px}
.rail{position:sticky;top:0;height:100vh;flex:none;width:92px;background:var(--rail);display:flex;flex-direction:column;align-items:center;gap:6px;padding:18px 0 14px;z-index:6}
.rail::after{content:"";position:absolute;top:0;right:0;bottom:0;width:3px;background:linear-gradient(#FFD500 0 16.6%,#FF7A1A 0 33.3%,#D0213B 0 50%,#2F6BFF 0 66.6%,#11A35A 0 83.3%,#F2F2F2 0)}
.logo{width:42px;height:42px;display:grid;grid-template-columns:repeat(3,1fr);gap:3px;margin-bottom:14px;transform:rotate(-8deg)}
.logo i{border-radius:3px}
.brand h1{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.rail nav{display:flex;flex-direction:column;gap:4px;background:none;padding:0}
.rail nav button{width:70px;padding:10px 0 9px;border-radius:12px;display:flex;flex-direction:column;align-items:center;gap:4px;font:700 .68rem var(--f-body);letter-spacing:.07em;text-transform:uppercase;color:#7F8794;border:0;background:none;cursor:pointer}
.rail nav button svg{width:22px;height:22px}
.rail nav button:hover{color:var(--fg);background:#171A21}
.rail nav button[aria-selected="true"]{background:#1C2029;color:#fff;box-shadow:inset 0 -3px 0 var(--accent),0 10px 22px -14px var(--accent)}
.rail .grow{flex:1}
.streak{display:flex;flex-direction:column;align-items:center;gap:1px;color:var(--muted);font:700 .62rem var(--f-body);letter-spacing:.1em;text-align:center}
.streak b{font:700 1.15rem var(--f-display);color:var(--fg)}
.streak svg{width:18px;height:18px}
.brand{display:flex;flex-direction:column;align-items:center}
@media (max-width:700px){.app{flex-direction:column}.rail{position:sticky;top:0;height:auto;width:auto;flex-direction:row;padding:6px 8px;gap:4px;overflow-x:auto}
  .rail::after{top:auto;left:0;height:3px;width:auto}.logo,.streak,.rail .grow{display:none}.rail nav{flex-direction:row}.rail nav button{width:60px;padding:7px 0}.wrap{padding:14px 16px 40px}}''')

rep('''nav{display:flex;gap:4px;background:var(--sunk);padding:4px;border-radius:10px;flex-wrap:wrap}
nav button{font:600 .9rem var(--f-body);border:0;background:none;color:var(--muted);padding:8px 14px;border-radius:7px;cursor:pointer}
nav button[aria-selected="true"]{background:var(--surface);color:var(--fg);box-shadow:0 1px 2px rgba(0,0,0,.12)}''', '')

# buttons, labels
rep('.btn{font:600 .85rem var(--f-body);border:1px solid var(--line);background:var(--surface);color:var(--fg);padding:7px 12px;border-radius:8px;cursor:pointer}',
    '.btn{font:600 .88rem var(--f-body);border:1px solid #2E323A;background:#15171C;color:var(--fg);padding:8px 14px;border-radius:9px;cursor:pointer}')
rep('.btn.primary{background:var(--accent);color:var(--accent-fg);border-color:var(--accent)}',
    '.btn.primary{background:var(--accent);color:var(--accent-fg);border-color:var(--accent);font-weight:700;box-shadow:0 6px 20px -8px var(--accent)}')
rep('.label{font:600 .7rem var(--f-body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}',
    '.label{font:700 .7rem var(--f-body);letter-spacing:.12em;text-transform:uppercase;color:#6E7580}')

# drill stage & viewer: spotlight + grid mat
rep('.stage{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:16px;min-width:0}',
    '.stage{display:flex;flex-direction:column;gap:16px;min-width:0}')
rep('.case-name{font-family:var(--f-display);font-weight:700;font-size:1.9rem;letter-spacing:-.02em;margin:0;line-height:1.1}',
    '.case-name{position:relative;font-family:var(--f-display);font-style:italic;font-weight:700;font-size:clamp(2rem,4.2vw,3.3rem);letter-spacing:0;margin:0;line-height:1}\n'
    '.case-meta{position:relative}\n.case-num{position:absolute;right:0;top:-24px;font:italic 700 8.5rem/1 var(--f-display);color:transparent;-webkit-text-stroke:1.5px #2A2F3A;pointer-events:none;user-select:none}\n'
    '.case-meta .label{position:relative;color:var(--accent-soft);display:flex;align-items:center;gap:10px;flex-wrap:wrap}')
rep('.setup{font-family:var(--f-mono);font-size:1rem;background:var(--sunk);border-radius:8px;padding:9px 12px;word-break:break-word}',
    '.setup{font-family:var(--f-mono);font-size:1rem;color:#C8CDD5;background:var(--surface);border:1px solid #23262E;border-radius:12px;padding:11px 14px;word-break:break-word}')
rep('.viewer{background:var(--stage);border-radius:12px;position:relative;overflow:hidden}',
    '.viewer{background:radial-gradient(ellipse 60% 55% at 50% 40%,rgba(47,107,255,.28),rgba(47,107,255,0) 70%),var(--stage);border:1px solid #23262E;border-radius:18px;position:relative;overflow:hidden}\n'
    '.viewer::before{content:"";position:absolute;left:-20%;right:-20%;bottom:0;height:46%;background-image:linear-gradient(rgba(120,150,255,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(120,150,255,.16) 1px,transparent 1px);background-size:44px 44px;transform:perspective(420px) rotateX(60deg);transform-origin:bottom;pointer-events:none}\n'
    '.viewer::after{content:"";position:absolute;left:30%;right:30%;top:66%;height:26px;border-radius:50%;background:rgba(0,0,0,.6);filter:blur(12px);pointer-events:none}')
rep('.cube3d{height:320px;width:100%;cursor:grab;touch-action:none}', '.cube3d{position:relative;z-index:1;height:340px;width:100%;cursor:grab;touch-action:none}')
rep('.viewer .drag-hint{position:absolute;top:10px;left:12px;font-size:.75rem;color:var(--muted);pointer-events:none}',
    '.viewer .drag-hint{position:absolute;z-index:2;top:14px;left:16px;font:700 .7rem var(--f-body);letter-spacing:.12em;text-transform:uppercase;color:var(--accent-soft);pointer-events:none}')
rep('.viewer-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:10px 12px;border-top:1px solid var(--line);background:var(--surface)}',
    '.viewer-bar{position:relative;z-index:2;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;padding:6px 14px 16px}')
rep('.viewer-bar .speed{display:flex;align-items:center;gap:6px;font-size:.8rem;color:var(--muted);margin-left:auto}',
    '.viewer-bar .speed{display:flex;align-items:center;gap:6px;font-size:.8rem;color:var(--muted)}')
rep('.alg-line{font-family:var(--f-mono);font-size:1.05rem;display:flex;flex-wrap:wrap;gap:4px 8px;min-height:1.6em}',
    '.alg-line{font:600 1.05rem var(--f-display);display:flex;flex-wrap:wrap;gap:6px;min-height:1.6em}')
rep('.alg-line span{padding:0 3px;border-radius:4px}', '.alg-line span{padding:3px 9px;border-radius:6px;background:#1F232B}')
rep('.alg-line span.now{background:var(--accent);color:var(--accent-fg)}', '.alg-line span.now{background:var(--accent);color:var(--accent-fg);box-shadow:0 0 16px -2px var(--accent)}')
rep('.alg-line.concealed{color:var(--muted);font-family:var(--f-body);font-size:.88rem}',
    '.alg-line.concealed{color:var(--muted);font-family:var(--f-body);font-size:.88rem;font-weight:500}\n.alg-line.concealed span{background:none;padding:0}')
rep('.review{margin-left:6px;padding:1px 7px;border-radius:99px;background:var(--sunk);color:var(--accent);letter-spacing:.04em}',
    '.review{display:inline-flex;align-items:center;gap:6px;padding:2px 9px;border-radius:99px;border:1px solid rgba(255,176,32,.45);color:var(--warn);letter-spacing:.1em;font-size:.68rem}\n.review::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--warn);box-shadow:0 0 0 4px rgba(255,176,32,.2)}')
rep('.info{display:flex;flex-direction:column;gap:14px;min-width:0}', '.info{display:flex;flex-direction:column;gap:14px;min-width:0}\n.card2{background:var(--surface);border:1px solid #23262E;border-radius:14px;padding:13px 15px}')

# stackmat timer
rep('''.timer{user-select:none;-webkit-user-select:none;touch-action:none;cursor:pointer;border-radius:12px;background:var(--sunk);text-align:center;padding:18px 10px 14px}
.time{font-family:var(--f-display);font-weight:700;font-size:clamp(2.8rem,9vw,4.6rem);line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.04em}
.timer.hold .time{color:var(--hold)} .timer.ready .time{color:var(--ready)}
.timer .hint{color:var(--muted);font-size:.85rem;margin-top:10px;word-break:break-word}''',
'''.mat{user-select:none;-webkit-user-select:none;touch-action:none;cursor:pointer;display:flex;align-items:center;gap:20px;background:linear-gradient(#17191F,#0D0E12);border:1px solid #2A2E37;border-radius:999px;padding:14px 22px;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 18px 40px -20px rgba(0,0,0,.9)}
.pad{flex:none;display:flex;flex-direction:column;align-items:center;gap:6px;font:700 .66rem var(--f-body);letter-spacing:.14em;color:#6E7580}
.pad i{width:78px;height:78px;border-radius:50%;background:radial-gradient(circle at 40% 30%,#2C313B,#111318);border:3px solid #343842;box-shadow:inset 0 2px 6px rgba(0,0,0,.6);transition:border-color .1s,box-shadow .1s}
.mat.hold .pad i{border-color:var(--hold);box-shadow:0 0 22px -2px rgba(239,68,68,.7),inset 0 2px 6px rgba(0,0,0,.6)} .mat.hold .pad{color:var(--hold)}
.mat.ready .pad i,.mat.insp .pad i{border-color:var(--ready);box-shadow:0 0 22px -2px rgba(34,197,94,.75),inset 0 2px 6px rgba(0,0,0,.6)} .mat.ready .pad{color:var(--ready)}
.lcdcol{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:8px}
.lcd{background:#0A1A10;border:2px solid #1B2A20;border-radius:12px;padding:4px 28px;box-shadow:inset 0 0 24px rgba(0,0,0,.8);max-width:100%}
.time,.tm-time{font-family:var(--f-display);font-weight:700;font-size:clamp(2.8rem,8vw,5.6rem);line-height:1;letter-spacing:.04em;font-variant-numeric:tabular-nums;color:#7CFFB2;text-shadow:0 0 18px rgba(124,255,178,.5)}
.mat.hold .time,.mat.hold .tm-time{color:#FF8A8A;text-shadow:0 0 18px rgba(255,90,90,.5)}
.mat.warn .tm-time{color:#FFC861;text-shadow:0 0 18px rgba(255,176,32,.5)}
.mat .hint{color:#6E7580;font:600 .74rem var(--f-body);letter-spacing:.08em;text-transform:uppercase;text-align:center;word-break:break-word}
@media (max-width:640px){.pad{display:none}.mat{border-radius:22px;padding:14px}}''')
rep('@media (prefers-reduced-motion:no-preference){.timer .time{transition:color .08s}}', '')
rep('<div class="timer" id="timer"><div class="time" id="time">0.00</div>\n        <div class="hint" id="timerHint">Hold space (or press here), release to start. Any key stops.</div></div>',
    '<div class="mat timer" id="timer"><span class="pad" aria-hidden="true"><i></i>LEFT</span><div class="lcdcol"><div class="lcd"><div class="time" id="time">0.00</div></div>\n        <div class="hint" id="timerHint">Hold space (or press here), release to start. Any key stops.</div></div><span class="pad" aria-hidden="true"><i></i>RIGHT</span></div>')

# timer tab
rep('''.tm-timer{user-select:none;-webkit-user-select:none;touch-action:none;cursor:pointer;border-radius:12px;background:var(--sunk);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:28px 10px;min-height:230px}
.tm-time{font-family:var(--f-display);font-weight:700;font-size:clamp(3.4rem,12vw,6.6rem);line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.04em}
.tm-timer.hold .tm-time{color:var(--hold)} .tm-timer.ready .tm-time{color:var(--ready)}
.tm-timer.insp .tm-time{color:var(--accent)} .tm-timer.warn .tm-time{color:var(--warn)}
.tm-timer .hint{color:var(--muted);font-size:.85rem;text-align:center}''',
'''.tm-timer{min-height:200px;border-radius:28px}
.tm-timer .lcd{padding:8px 34px}
.tm-timer .tm-time{font-size:clamp(3.2rem,9vw,6.4rem)}''')
rep('.tm-phase{font:700 .95rem var(--f-display);color:var(--accent);min-height:1.2em}', '.tm-phase{font:700 .95rem var(--f-display);color:var(--accent-soft);min-height:1.2em}')
rep('.tm-scr{font-family:var(--f-mono);font-size:1.15rem;line-height:1.55;background:var(--sunk);border-radius:10px;padding:14px 16px;word-break:break-word;min-height:3.2em}',
    '.tm-scr{font-family:var(--f-mono);font-size:1.15rem;line-height:1.55;background:var(--surface);border:1px solid #23262E;border-radius:14px;padding:14px 16px;word-break:break-word;min-height:3.2em}')
rep('.tm-grid{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:16px;align-items:stretch}', '.tm-grid{display:flex;flex-direction:column;gap:16px}')
rep('.tm-prev{background:var(--stage);border-radius:12px;overflow:hidden;position:relative}',
    '.tm-prev{background:radial-gradient(ellipse 50% 60% at 50% 45%,rgba(47,107,255,.22),rgba(47,107,255,0) 70%),var(--stage);border:1px solid #23262E;border-radius:18px;overflow:hidden;position:relative}')
rep('''<div class="tm-grid">
        <div class="tm-timer" id="tmTimer"><div class="tm-time" id="tmTime">0.00</div><div class="tm-phase" id="tmPhase"></div><div class="hint" id="tmHint">Hold space (or press here), release to start. Any key stops.</div></div>
        <div class="tm-prev"><div class="cube3d" id="tm3d"></div><span class="label">Scrambled</span></div>
      </div>''',
'''<div class="tm-grid">
        <div class="tm-prev"><div class="cube3d" id="tm3d"></div><span class="label">Scrambled</span></div>
        <div class="mat tm-timer" id="tmTimer"><span class="pad" aria-hidden="true"><i></i>LEFT</span><div class="lcdcol"><div class="lcd"><div class="tm-time" id="tmTime">0.00</div></div><div class="tm-phase" id="tmPhase"></div><div class="hint" id="tmHint">Hold space (or press here), release to start. Any key stops.</div></div><span class="pad" aria-hidden="true"><i></i>RIGHT</span></div>
      </div>''')
rep('body.timing header,body.timing .secbar', 'body.timing .rail,body.timing .secbar')
rep('@media (prefers-reduced-motion:no-preference){header,.secbar', '@media (prefers-reduced-motion:no-preference){.rail,.secbar')

# panels / cards
rep('.panel{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px}',
    '.panel{background:var(--surface);border:1px solid #23262E;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px}')
rep('.stat .v{font-family:var(--f-display);font-weight:600;font-size:1.15rem;font-variant-numeric:tabular-nums}',
    '.stat .v{font-family:var(--f-display);font-weight:700;font-size:1.35rem;font-variant-numeric:tabular-nums}')
rep('.pcard{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px;', '.pcard{background:var(--surface);border:1px solid #23262E;border-radius:16px;padding:18px;')
rep('.quiz{background:var(--surface);border:1px solid var(--line);border-radius:14px;', '.quiz{background:var(--surface);border:1px solid #23262E;border-radius:16px;')
rep('.card{background:var(--surface);border:1px solid var(--line);border-radius:12px;', '.card{background:var(--surface);border:1px solid #23262E;border-radius:14px;')

# cube switcher with pictures
rep('''.cubes{display:flex;flex-wrap:wrap;gap:4px;background:var(--sunk);padding:4px;border-radius:10px;max-width:100%}
@media (max-width:560px){.cubes button{padding:6px 9px;font-size:.88rem}.look{margin-left:0}}
.cubes button{font:700 .95rem var(--f-display);border:0;background:none;color:var(--muted);padding:7px 14px;border-radius:7px;cursor:pointer;font-variant-numeric:tabular-nums}
.cubes button[aria-pressed="true"]{background:var(--accent);color:var(--accent-fg)}''',
'''.cubes{display:flex;flex-wrap:wrap;gap:2px;background:#15171C;border:1px solid #262A32;padding:4px;border-radius:12px;max-width:100%}
.cubes button{font:600 .74rem var(--f-display);border:0;background:none;color:#7F8794;padding:5px 7px 4px;border-radius:8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:44px}
.cubes button svg{width:30px;height:32px;opacity:.8}
.cubes button:hover{color:var(--fg);background:#1B1E25}.cubes button:hover svg{opacity:1}
.cubes button[aria-pressed="true"]{background:#EEF0F4;color:#0B0C0F;box-shadow:0 0 0 1px var(--accent),0 8px 20px -10px var(--accent)}
.cubes button[aria-pressed="true"] svg{opacity:1}
.cubes .sep{width:1px;align-self:stretch;margin:6px 3px;background:#2A2E37}
.cubes .more{border:1px dashed #3A3F49}
.cubes .more .quad{display:grid;grid-template-columns:1fr 1fr;gap:2px;width:30px;height:32px;align-content:center}
.cubes .more .quad svg{width:14px;height:15px}
@media (max-width:560px){.cubes button{min-width:38px;padding:4px}.cubes button svg{width:24px;height:26px}.look{margin-left:0}}''')
rep('.secbar{display:flex;align-items:center;gap:10px 14px;flex-wrap:wrap;padding:8px;background:var(--surface);border:1px solid var(--line);border-radius:14px}',
    '.secbar{display:flex;align-items:center;gap:10px 16px;flex-wrap:wrap}')
rep('.look{display:flex;gap:2px;background:var(--sunk);padding:3px;border-radius:9px;margin-left:auto}', '.look{display:flex;gap:2px;background:#15171C;border:1px solid #262A32;padding:3px;border-radius:9px;margin-left:auto}')
rep('.look button[aria-pressed="true"]{background:var(--surface);color:var(--fg);box-shadow:0 1px 2px rgba(0,0,0,.12)}', '.look button[aria-pressed="true"]{background:#262A32;color:var(--fg)}')
rep('''.chip{font:600 .86rem var(--f-body);border:1px solid var(--line);background:var(--surface);color:var(--fg);padding:6px 13px;border-radius:99px;cursor:pointer;display:inline-flex;gap:7px;align-items:baseline}
.chip .n{font-weight:500;color:var(--muted);font-size:.78rem}
.chip[aria-pressed="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.chip[aria-pressed="true"] .n{color:inherit;opacity:.7}
.chip.parity{border-color:var(--accent);color:var(--accent)}
.chip.parity[aria-pressed="true"]{background:var(--accent);color:var(--accent-fg)}''',
'''.chip{--c:#8A919D;font:700 .82rem var(--f-body);letter-spacing:.03em;border:1px solid #2E323A;background:none;color:#7F8794;padding:6px 12px;border-radius:7px;cursor:pointer;display:inline-flex;gap:8px;align-items:center}
.chip::before{content:"";width:8px;height:8px;border-radius:2px;background:var(--c)}
.chip .n{font-weight:600;opacity:.75;font-size:.76rem}
.chip[aria-pressed="true"]{border-color:var(--c);color:#fff;background:color-mix(in srgb,var(--c) 18%,transparent);box-shadow:0 0 16px -6px var(--c)}
.chip[data-sec="f2l"]{--c:#11A35A}.chip[data-sec="oll"],.chip[data-sec="ollf"]{--c:#FFD500}.chip[data-sec="custom"]{--c:#B9C0CB}.chip[data-sec="pll"]{--c:#2F6BFF}
.chip.parity{--c:#FF7A1A}.chip[data-sec="centers"]{--c:#D0213B}.chip[data-sec="cll"]{--c:#FFD500}''')

# ---------- markup: rail ----------
ICON = {
 'learn': '<path d="M2 5c3-1.5 7-1.5 10 1 3-2.5 7-2.5 10-1v14c-3-1.5-7-1.5-10 1-3-2.5-7-2.5-10-1z"/><path d="M12 6v14"/>',
 'drill': '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
 'timer': '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
 'progress': '<path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/>',
 'test': '<path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>',
 'quiz': '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 'cases': '<rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
}
def tab(v, label, sel=False):
    return (f'<button role="tab" id="tab-{v}" aria-selected="{"true" if sel else "false"}" data-view="{v}">'
            f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[v]}</svg>{label}</button>')
logo = ''.join(f'<i style="background:{c}"></i>' for c in ['#FFD500', '#FFD500', '#FF7A1A', '#FFD500', '#11A35A', '#FFD500', '#2F6BFF', '#FFD500', '#D0213B'])
a = s.index('<div class="wrap">\n  <header>')
b = s.index('  </header>') + len('  </header>')
s = s[:a] + f'''<div class="app">
<aside class="rail">
  <div class="logo" aria-hidden="true">{logo}</div>
  <nav role="tablist" aria-label="Sections" aria-orientation="vertical">
    {tab('learn','Learn')}
    {tab('drill','Drill',True)}
    {tab('timer','Timer')}
    {tab('progress','Stats')}
    {tab('test','Test')}
    {tab('quiz','Spot')}
    {tab('cases','Cases')}
  </nav>
  <span class="grow"></span>
  <div class="streak" id="streak" title="Days in a row you've practiced"><svg viewBox="0 0 24 24" fill="none" stroke="#FFB020" stroke-width="2.2" aria-hidden="true"><path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/></svg><b id="streakN">0</b>DAY STREAK</div>
  <div class="brand"><h1>Last Layer Lab</h1></div>
</aside>
<div class="wrap">
  <!--UPDBAR-->''' + s[b:]
rep('''</div>
<div class="toast" id="toast" hidden></div>''', '''</div>
</div>
<div class="toast" id="toast" hidden></div>''')

# ---------- cube switcher markup ----------
icons = json.load(open('tools/puzzle-icons.json'))
def ic(k):
    return f'<svg viewBox="0 0 32 34" aria-hidden="true">{icons[k]}</svg>'
names = {'2':'2x2','3':'3x3','4':'4x4','5':'5x5','6':'6x6','7':'7x7','9':'9x9'}
btns = ''.join(f'<button data-cube="{k}" aria-pressed="{"true" if k=="3" else "false"}" aria-label="{v}">{ic(k)}<span>{v}</span></button>' for k, v in names.items())
btns += '<span class="sep" aria-hidden="true"></span>'
for k, lab, full in [('pyra','Pyra','Pyraminx'),('mega','Mega','Megaminx'),('skewb','Skewb','Skewb'),('sq1','SQ-1','Square-1'),('clock','Clock','Clock')]:
    btns += f'<button data-puzzle="{k}" aria-label="{full} (opens Learn)" title="{full}: how to solve">{ic(k)}<span>{lab}</span></button>'
btns += '<span class="sep" aria-hidden="true"></span>'
btns += f'<button class="more" data-puzzle="more" aria-label="More puzzles" title="All puzzles"><span class="quad">{ic("ivy")}{ic("gear")}{ic("mirror")}{ic("kilo")}</span><span>More</span></button>'
rep('<button data-cube="2" aria-pressed="false">2x2</button><button data-cube="3" aria-pressed="true">3x3</button><button data-cube="4" aria-pressed="false">4x4</button><button data-cube="5" aria-pressed="false">5x5</button><button data-cube="6" aria-pressed="false">6x6</button><button data-cube="7" aria-pressed="false">7x7</button><button data-cube="9" aria-pressed="false">9x9</button>', btns)
rep('''$('cubeSel').addEventListener('click',e=>{const b=e.target.closest('[data-cube]');if(!b)return;b.blur();setCube(+b.dataset.cube);});''',
    '''$('cubeSel').addEventListener('click',e=>{const p=e.target.closest('[data-puzzle]');if(p){p.blur();openLearn(p.dataset.puzzle==='more'?null:p.dataset.puzzle);return;}
  const b=e.target.closest('[data-cube]');if(!b)return;b.blur();setCube(+b.dataset.cube);if(view()==='learn'){learnSel=String(cubeN);renderLearn();}});''')

# ---------- drill info: number, cards, sparkline ----------
rep('''<span class="label"><span id="drillGroup">PLL</span> <span class="review" id="drillReview"></span></span>
              <h2 class="case-name" id="drillName">—</h2>''',
    '''<span class="case-num" id="drillNum" aria-hidden="true"></span>
              <span class="label"><span id="drillGroup">PLL</span><span class="review" id="drillReview"></span></span>
              <h2 class="case-name" id="drillName">—</h2>''')
rep('''<div class="block">
            <div class="solve-head"><span class="label">Solution</span>''', '''<div class="block card2">
            <div class="solve-head"><span class="label">Solution</span>''')
rep('''          <div class="block"><label class="label" for="drillNote">Notes</label>''',
    '''          <div class="block card2" id="spark"><div class="top-row"><span class="label">This case · last 20</span><span class="sp-trend" id="spTrend"></span></div>
            <svg id="spLine" viewBox="0 0 320 44" preserveAspectRatio="none" role="img" aria-label="Your recent times on this case"></svg>
            <div class="stats"><div class="stat"><div class="label">Ao5</div><div class="v" id="spAo5">—</div></div><div class="stat"><div class="label">Best</div><div class="v sp-best" id="spBest">—</div></div><div class="stat"><div class="label">Reps</div><div class="v" id="spReps">0</div></div></div></div>
          <div class="block"><label class="label" for="drillNote">Notes</label>''')
rep('.note{color:var(--muted);font-size:.8rem}', '''.note{color:var(--muted);font-size:.8rem}
#spLine{width:100%;height:44px;display:block}#spLine polyline{fill:none;stroke:var(--accent);stroke-width:2.5;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.sp-trend{font-size:.76rem;font-weight:700;color:var(--good)}.sp-trend.up{color:var(--hold)}.sp-best{color:var(--good)}
.sp-empty{fill:#5F6670;font:12px var(--f-body)}''')
rep('''  renderExtras();}
let dRevealed=false;''', '''  const grp=allCases().filter(c=>c.group===current.group);$('drillNum').textContent=$('optHide').checked?'':(grp.findIndex(c=>c.id===current.id)+1||'');
  renderExtras();renderSpark();}
function renderSpark(){if(!current)return;const h=(stats[statKey(current)]||[]).slice(-20),svg=$('spLine');
  $('spReps').textContent=(stats[statKey(current)]||[]).length;$('spAo5').textContent=fmt(avg(h,5));$('spBest').textContent=h.length?fmt(Math.min(...h)):'—';
  if(h.length<2){svg.innerHTML='<text class="sp-empty" x="0" y="26">Time this case a few times to see your trend.</text>';$('spTrend').textContent='';return;}
  const mn=Math.min(...h),mx=Math.max(...h),r=mx-mn||1;
  svg.innerHTML='<polyline points="'+h.map((t,i)=>(i*320/(h.length-1)).toFixed(1)+','+(4+36*(t-mn)/r).toFixed(1)).join(' ')+'"/>';
  const half=Math.floor(h.length/2),a1=mean(h.slice(0,half)),a2=mean(h.slice(half));const d=(a1-a2)/1000;
  $('spTrend').textContent=Math.abs(d)<.01?'':(d>0?'▼ '+d.toFixed(2)+'s faster':'▲ '+(-d).toFixed(2)+'s slower');$('spTrend').classList.toggle('up',d<0);}
let dRevealed=false;''')

# streak
rep('''renderSecs();loadCase();renderSession();renderTScore();
</script>''', '''function renderStreak(){const days=new Set();const k=t=>{const d=new Date(t);return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();};
  for(const r of dlog)if(r.at)days.add(k(r.at));for(const n in solves)for(const r of solves[n]||[])if(r.at)days.add(k(r.at));
  let n=0,d=new Date();if(!days.has(k(d)))d.setDate(d.getDate()-1);while(days.has(k(d))){n++;d.setDate(d.getDate()-1);}$('streakN').textContent=n;}
renderSecs();loadCase();renderSession();renderTScore();renderStreak();
</script>''')
rep('''  store.set('session',session);store.set('stats',stats);renderSession();
  $('timerHint')''', '''  store.set('session',session);store.set('stats',stats);renderSession();renderStreak();
  $('timerHint')''')

# ---------- tabs: add learn ----------
rep("document.querySelector('nav').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;",
    "document.querySelector('nav').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;showTab(b);});\nfunction showTab(b){")
rep("  ['drill','timer','progress','test','quiz','cases'].forEach(v=>$('view-'+v).hidden=v!==b.dataset.view);\n  $('secChips').hidden=b.dataset.view==='timer';",
    "  ['learn','drill','timer','progress','test','quiz','cases'].forEach(v=>$('view-'+v).hidden=v!==b.dataset.view);\n  $('secChips').hidden=b.dataset.view==='timer'||b.dataset.view==='learn';document.querySelector('.look').hidden=b.dataset.view==='learn';if(b.dataset.view==='learn')renderLearn();")
rep("  if(b.dataset.view==='test'&&!testStarted){testStarted=true;newTest();}b.blur();});",
    "  if(b.dataset.view==='test'&&!testStarted){testStarted=true;newTest();}b.blur();}")

open(P, 'w').write(s)
print('ok')
