# Builds app/index.html from the web version's source.
s=open('src-body.html').read()
fonts=''.join(f'@font-face{{font-family:"{fam}";font-weight:{w};font-style:normal;font-display:swap;src:url(vendor/fonts/{fn}-latin-{w}-normal.woff2) format("woff2")}}\n'
  for fam,fn,ws in [('Chakra Petch','chakra-petch',[500,600,700]),('Barlow','barlow',[400,500,600,700]),('JetBrains Mono','jetbrains-mono',[400,500])] for w in ws)+'@font-face{font-family:"Chakra Petch";font-weight:700;font-style:italic;font-display:swap;src:url(vendor/fonts/chakra-petch-latin-700-italic.woff2) format("woff2")}\n'
head_old=s[:s.index('<style>')]
assert 'fonts.googleapis.com' in head_old and 'cdnjs' in head_old
head_new='<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'+\
  '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; worker-src \'self\' blob:; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: blob:; font-src \'self\'">\n'+\
  '<title>Last Layer Lab</title>\n<script src="vendor/three.min.js"></script>\n<script src="vendor/gan-bt.js"></script>\n'
s=head_new+s[s.index('<style>'):]
def rep(a,b):
    global s
    assert a in s,'missing: '+a[:60]
    s=s.replace(a,b,1)
rep('<style>','<style>\n'+fonts)
rep('</style>','''html,body{margin:0}
.brand-right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ver{font-family:var(--f-mono);font-size:.68rem;color:#6E7580;background:none;border:0;cursor:pointer;padding:4px 6px;border-radius:6px;margin-top:6px}
.ver:hover{background:var(--sunk);color:var(--fg)}
.updbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;background:var(--surface);border:1px solid var(--accent);border-radius:12px;padding:10px 14px}
.updbar .msg{flex:1;min-width:0}
.updbar .bar{height:4px;border-radius:2px;background:var(--sunk);overflow:hidden;flex-basis:100%}
.updbar .bar i{display:block;height:100%;background:var(--accent);width:0}
</style>''')
rep('<div class="brand"><h1>Last Layer Lab</h1></div>',
 '<div class="brand"><h1>Last Layer Lab</h1><button class="ver" id="verBtn" title="Check for updates">v—</button></div>')
rep('  <!--UPDBAR-->','''  <div class="updbar" id="updBar" hidden><span class="msg" id="updMsg"></span><button class="btn primary" id="updGo" hidden>Restart and update</button><button class="btn" id="updClose">Dismiss</button><div class="bar" id="updProg" hidden><i id="updFill"></i></div></div>''')
s=s.replace('/*SCRW*/',open('tools/scramble-worker.bundle.js').read().strip()).replace('/*CUBE*/',open('src-cube.js').read()+open('src-nxn.js').read()+open('src-poly.js').read()).replace('/*F2L*/',open('src-f2l.json').read()).replace('/*GUIDES*/',open('src-guides.js').read()).replace('/*SPEED*/',open('src-speed.js').read()).replace('/*SMART*/',open('src-smart.js').read()).replace('/*SYNC*/',open('src-sync.js').read()).replace('/*CROSS*/',open('src-cross.js').read()).replace('/*PLFONT*/',open('tools/helvetiker_bold.typeface.json').read())
upd='''
// ---- desktop updates ----
(function(){const D=window.desktop;if(!D){$('verBtn').hidden=true;return;}
  const bar=$('updBar'),msg=$('updMsg'),go=$('updGo'),prog=$('updProg'),fill=$('updFill');let manual=false;
  D.version().then(v=>$('verBtn').textContent='v'+v);
  $('verBtn').onclick=()=>{manual=true;D.checkForUpdates();};
  $('updClose').onclick=()=>bar.hidden=true;
  go.onclick=()=>{msg.textContent='Restarting…';D.installUpdate();};
  D.onUpdate(u=>{
    if(u.state==='checking'){if(manual){bar.hidden=false;go.hidden=true;prog.hidden=true;msg.textContent='Checking for updates…';}}
    else if(u.state==='none'){if(manual){bar.hidden=false;msg.textContent="You're on the latest version.";manual=false;}}
    else if(u.state==='downloading'){bar.hidden=false;go.hidden=true;prog.hidden=false;if(u.version)msg.dataset.v=u.version;
      msg.textContent=`Downloading version ${msg.dataset.v||''}… ${u.percent||0}%`;fill.style.width=(u.percent||0)+'%';}
    else if(u.state==='ready'){bar.hidden=false;prog.hidden=true;go.hidden=false;msg.textContent=`Version ${u.version} is ready. Restart to install it, or it installs next time you close the app.`;}
    else if(u.state==='error'){if(manual){bar.hidden=false;go.hidden=true;prog.hidden=true;msg.textContent="Couldn't check for updates. Check your internet connection and try again.";manual=false;}}
    else if(u.state==='dev'){if(manual){bar.hidden=false;msg.textContent='Updates only run in the installed app.';manual=false;}}
  });})();
'''
i=s.rindex('</script>');s=s[:i]+upd+s[i:]+'\n</html>\n'
open('app/index.html','w').write(s)
print('ok',len(s))
