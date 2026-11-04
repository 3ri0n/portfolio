// Helpers
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const root = document.documentElement;

/* ================= THEME ================= */
const themeSwitch = $('#themeSwitch');
const storedTheme = localStorage.getItem('theme');
if(storedTheme){
  root.setAttribute('data-theme', storedTheme);
  if(themeSwitch) themeSwitch.checked = storedTheme === 'light';
}
themeSwitch?.addEventListener('change', ()=>{
  const t = themeSwitch.checked ? 'light' : 'dark';
  root.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
});

/* ================= WELCOME ================= */
const welcome = $('#welcome');
// prevent background scroll while welcome is shown
try{ document.body.classList.add('no-scroll'); }catch(e){}
const heroLines = $$('[data-split]');
const startBtn = $('#startBtn');
const fx = $('#fx');
const ctxFX = fx?.getContext?.('2d', { alpha: true });

heroLines.forEach(line => {
  const text = line.textContent.trim();
  line.innerHTML = [...text].map(ch => `<span class="ch">${ch}</span>`).join('');
});

document.fonts?.ready.then(()=>{ requestAnimationFrame(()=>{ heroLines.forEach(l=>l.classList.add('on')); }); });

let W=innerWidth, H=innerHeight;
if (fx) { fx.width=W; fx.height=H; }
const stars = Array.from({length: 80}, () => ({
  x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.6 + .4,
  vx: (Math.random()-.5) * .15, vy: (Math.random()-.5) * .15, a: Math.random()*Math.PI*2
}));
function drawFX(){
  if(!ctxFX) return;
  ctxFX.clearRect(0,0,W,H);
  for(const s of stars){
    s.x+=s.vx; s.y+=s.vy; s.a+=.01;
    if(s.x<-10) s.x=W+10; if(s.x>W+10) s.x=-10;
    if(s.y<-10) s.y=H+10; if(s.y>H+10) s.y=-10;
    ctxFX.beginPath();
    ctxFX.fillStyle = `hsla(35, 100%, ${72 + 20*Math.sin(s.a)}%, .7)`;
    ctxFX.arc(s.x, s.y, s.r, 0, Math.PI*2); ctxFX.fill();
    ctxFX.strokeStyle = '#ff8c0033'; ctxFX.lineWidth = 0.6; ctxFX.stroke();
  }
  requestAnimationFrame(drawFX);
}
drawFX();
addEventListener('resize', ()=>{ W=innerWidth; H=innerHeight; if(fx){ fx.width=W; fx.height=H; } });

function startSite(){
  if(!welcome?.classList.contains('hidden')){
    welcome?.classList.add('hidden');
    try{ document.body.classList.remove('no-scroll'); }catch(e){}
    setTimeout(()=>$('#in')?.focus(), 450);
  }
}
window.addEventListener('keydown', (e)=>{ if(e.key) startSite(); });
startBtn?.addEventListener('click', startSite);

/* ================= NAV & TABS ================= */
const tabs = $$('#tabs .tab');
const sections = $$('main > section');
$('#tabs')?.addEventListener('click', e=>{
  const b = e.target.closest('.tab'); if(!b) return;
  const id = b.dataset.target;
  tabs.forEach(t=>t.classList.toggle('active', t===b));
  sections.forEach(s=>s.classList.toggle('active', s.id===id));
  if(id==='terminal') setTimeout(()=>$('#in')?.focus(), 120);
  window.scrollTo({top:0, behavior:'smooth'});
});
$('#hamburger')?.addEventListener('click', ()=>{
  $('#tabsWrap')?.classList.toggle('collapsed');
});

/* ================= TERMINAL ================= */
const out = $('#out');
const input = $('#in');
function print(html, typed=false){
  const d = document.createElement('div'); d.className='line';
  if(!typed){
    d.innerHTML = html; out?.appendChild(d);
    if(out) out.scrollTop = out.scrollHeight;
    return;
  }
  out?.appendChild(d);
  let i=0;
  (function tick(){
    d.innerHTML = html.slice(0, ++i);
    if(out) out.scrollTop = out.scrollHeight;
    if(i < html.length) requestAnimationFrame(tick);
  })();
}
function promptEcho(val){ print(`<span class="prompt">erion@portfolio:~$</span> <span class="cmd">${val}</span>`); }
const blocks = {
  help:`Available commands:<br>
    <b>whoami</b> — Short bio<br>
    <b>about</b> — Learn about me<br>
    <b>skills</b> — Technical skills<br>
    <b>experience</b> — Work history<br>
    <b>education</b> — Education & certifications<br>
    <b>projects</b> — Local AI assistant, SpaceEagles UAVs &amp; CNC plotters<br>
    <b>contact</b> — Contact links<br>
    <b>play</b> / <b>game</b> — Launch minigame<br>
    <b>clear</b> — Clear terminal<br>
    <b>ls</b> — List sections<br>
    <b>date</b> — Current date/time<br>
    <b>matrix</b> — ...<br>
    <b>coffee</b> — Coffee break`,
  about:`I'm Erion — software engineering and testing experience at DigitSapiens, with projects in embedded systems, local AI and automation. Founder of SpaceEagles, with two fixed-wing UAVs in development. Built a Raspberry Pi 5 and Hailo NPU smart-home assistant with camera-based vision.`,
  skills:`Programming: JavaScript, JSON, Python, C++, SQL, G-code | Testing: software testing, system testing and software quality | Hardware: Raspberry Pi 5, Hailo NPU, ESP32, Arduino, GRBL | AI: local processing, vision and pattern recognition | Infrastructure: servers, NAS, backups and networking | Data: Power BI.`,
  experience:`Junior Software Engineer — DigitSapiens (started Oct 2025)<br>Software Tester Intern — DigitSapiens (Aug–Oct 2025)<br>Founder — SpaceEagles (two fixed-wing UAVs in development)<br>Seasonal Hotel Manager — Vila Enhalon (recurring four-month summer seasons)<br>Network Administrator — TCMC (part-time, 2022–2024)`,
  education:`Computer Engineering &amp; IT studies at CIT (started 2023). Training and badges: Cisco JavaScript Essentials 1 (Jan 2026), Oracle Database Administration, Generative AI (CIT), AWS Academy Cloud Web Application Builder (May 2025), Cisco Networking Essentials (Jul 2024), CEH training and Semos Python, Power BI and T-SQL courses.`,
  projects:`SpaceEagles — two fixed-wing UAVs in development.<br>Local AI smart home and personal assistant — Raspberry Pi 5, Hailo NPU, cameras, vision and pattern recognition.<br>Two Arduino CNC plotters with custom GRBL — see the Projects tab.`,
  contact:`Email: <a href="mailto:erionhani@yahoo.com">erionhani@yahoo.com</a> · LinkedIn: <a href="https://www.linkedin.com/in/erion-hani-636736198/" target="_blank" rel="noopener">/erion-hani</a>`,
  ls:`about/  skills/  experience/  education/  projects/  contact/  cv.pdf`,
  whoami:`erion — Software engineering, testing, embedded systems and local AI; founder of SpaceEagles; open to opportunities.`,
  date:new Date().toString(),
  matrix:`Wake up, Neo…<br>The Matrix has you.<br>Follow the orange glow.`,
  coffee:`☕ Brewing coffee… Done. Caffeine level: OPTIMAL.`,
  odr:`Hi Im Odri and I love MATCHAA!`,
  mirela:`balerina capuchina — mi mi mirela ✨`,
  erion:`Un n bank ka mu martu 💵`,
  bo:`❄⏲`,
};

/* ================= FOLLOWER CURSOR ================= */
(function(){
  const el = $('#follower');
  if(!el) return;
  let x = innerWidth/2, y = innerHeight/2, tx=x, ty=y;
  addEventListener('mousemove', e=>{ tx=e.clientX; ty=e.clientY; });
  (function loop(){
    x+=(tx-x)*0.15; y+=(ty-y)*0.15;
    const a=Math.atan2(ty-y,tx-x)*180/Math.PI;
    el.style.transform=`translate(${x}px, ${y}px) rotate(${a/18}deg)`;
    requestAnimationFrame(loop);
  })();
  function size(){ el.classList.toggle('small', innerWidth<640); }
  size(); addEventListener('resize', size);
  const inEl = $('#in');
  if(!inEl) return;
  ;['focus','keydown','keyup'].forEach(ev => inEl.addEventListener(ev,()=>el.classList.add('hide')));
  inEl.addEventListener('blur',()=>el.classList.remove('hide'));
})();

/* ================= Minigame (modal, for `play` command) ================= */
const modal = $('#gameModal');
const canvas = $('#gameCanvas');
const ctx = canvas?.getContext?.('2d');
let raf, running=false, paused=false;
const player = {x:(canvas?.width||0)/2, y:(canvas?.height||0)-60, w:44, h:18, vx:0, speed:6};
let obstacles=[], orbs=[], score=0, lastSpawn=0, lastOrb=0;
function rnd(min,max){ return Math.random()*(max-min)+min; }
function resetGame(){
  if(!canvas) return;
  player.x=canvas.width/2; player.vx=0; obstacles=[]; orbs=[]; score=0; lastSpawn=0; lastOrb=0;
}
function spawnObstacle(){
  if(!canvas) return;
  const w=rnd(40,110); obstacles.push({x:rnd(0,canvas.width-w), y:-20, w, h:14, vy:rnd(2.2,4.6)});
}
function spawnOrb(){ if(!canvas) return; orbs.push({x:rnd(16, canvas.width-16), y:-20, r:8, vy:rnd(2.4,4.2)}); }
function update(ts){
  if(!running || paused || !ctx || !canvas) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(ts-lastSpawn>650){ spawnObstacle(); lastSpawn=ts; }
  if(ts-lastOrb>1200){ spawnOrb(); lastOrb=ts; }
  player.x+=player.vx; player.x=Math.max(0, Math.min(canvas.width-player.w, player.x));
  ctx.fillStyle = getComputedStyle(root).getPropertyValue('--accent') || '#ffa500';
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillRect(player.x+10, player.y-6, player.w-20, 6);
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  for(let i=obstacles.length-1;i>=0;i--){
    const o=obstacles[i]; o.y+=o.vy; ctx.fillRect(o.x,o.y,o.w,o.h);
    if(o.y>canvas.height+40) obstacles.splice(i,1);
    if(o.x<player.x+player.w && o.x+o.w>player.x && o.y<player.y+player.h && o.y+o.h>player.y){
      paused=true; running=false;
      ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#ff4d4f'; ctx.font='bold 28px JetBrains Mono'; ctx.fillText('Game Over — Score: '+score, 40, canvas.height/2);
      ctx.fillStyle='#fff'; ctx.font='16px JetBrains Mono'; ctx.fillText('Press Enter to play again or Esc to exit', 40, canvas.height/2+32); return;
    }
  }
  for(let i=orbs.length-1;i>=0;i--){
    const b=orbs[i]; b.y+=b.vy; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle='rgba(255, 180, 80, .9)'; ctx.fill();
    if(b.y>canvas.height+20) orbs.splice(i,1);
    if(Math.abs((b.x)-(player.x+player.w/2))<(player.w/2+b.r) && Math.abs(b.y-(player.y+player.h/2))<(player.h/2+b.r)){ score+=10; orbs.splice(i,1); }
  }
  ctx.fillStyle='#ffffffb3'; ctx.font='16px JetBrains Mono'; ctx.fillText('Score: '+score, 14, 24);
  raf=requestAnimationFrame(update);
}
function openGame(){
  modal?.classList.add('open');
  modal?.setAttribute('aria-hidden','false');
  resetGame(); running=true; paused=false;
  raf=requestAnimationFrame(update);
}
function closeGame(){
  if(raf) cancelAnimationFrame(raf);
  running=false; paused=false;
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
  // Also hide the glow if it’s visible
  try{ hideGlowButton(); }catch(e){}
}
document.addEventListener('keydown', e=>{
  if(modal && modal.classList.contains('open')){
    if(e.key==='Escape'){ closeGame(); }
    if(e.key==='ArrowLeft'){ player.vx = -player.speed; }
    if(e.key==='ArrowRight'){ player.vx = player.speed; }
    if(e.key==='Enter' && !running){ running=true; paused=false; raf=requestAnimationFrame(update); }
  }
});
document.addEventListener('keyup', e=>{ if(e.key==='ArrowLeft'||e.key==='ArrowRight'){ player.vx=0; } });

/* ===== v2.2: mobile dropdown menu ===== */
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.querySelector('.close-menu');
document.getElementById('hamburger')?.addEventListener('click', ()=>{
  mobileMenu?.classList.add('open'); document.body.classList.add('no-scroll');
});
closeMenu?.addEventListener('click', ()=>{
  mobileMenu?.classList.remove('open'); document.body.classList.remove('no-scroll');
});
mobileMenu?.addEventListener('click', (e)=>{
  const link = e.target.closest('.m-item'); if(!link) return;
  const id = link.getAttribute('data-target'); if(!id) return;
  // activate the same tab behavior
  const tabBtn = document.querySelector(`.tab[data-target="${id}"]`);
  tabBtn?.click();
  mobileMenu.classList.remove('open'); document.body.classList.remove('no-scroll');
  window.scrollTo({top:0, behavior:'smooth'});
});

/* ================= GLOW BUTTON (links to minigame.html) ================= */
const GLOW_ID = 'glow-button';
const GLOW_OFFSET = { bottom: 20, right: 20 };
const GLOW_HREF = 'minigame.html'; // your file next to index.html

function createGlowStyleOnce(){
  if (document.getElementById('glow-style')) return;
  const style = document.createElement('style');
  style.id = 'glow-style';
  style.textContent = `
    #${GLOW_ID}{
      position:fixed; z-index:1000;
      bottom:${GLOW_OFFSET.bottom}px; right:${GLOW_OFFSET.right}px;
      width:72px; height:72px; border-radius:50%;
      background:transparent; border:0; cursor:pointer;
      box-shadow:0 0 24px 14px rgba(255,165,0,.75);
      animation:pulse-g 2s infinite;
      opacity:0; transform:scale(.9);
      transition:opacity .25s ease, transform .25s ease;
    }
    #${GLOW_ID}.show{ opacity:1; transform:scale(1); }
    #${GLOW_ID}:focus-visible{ outline:2px solid #ffa500; outline-offset:4px; }
    @keyframes pulse-g{
      0%,100%{ box-shadow:0 0 24px 14px rgba(255,165,0,.75) }
      50%    { box-shadow:0 0 36px 20px rgba(255,165,0,.95) }
    }
  `;
  document.head.appendChild(style);
}

function showGlowButton(){
  createGlowStyleOnce();
  let el = document.getElementById(GLOW_ID);
  if (!el) {
    // Create a link that navigates to your minigame.html
    el = document.createElement('a');
    el.id = GLOW_ID;
    el.href = GLOW_HREF;
    el.target = '_self'; // or '_blank' for new tab
    el.setAttribute('aria-label', 'Open typing minigame');
    document.body.appendChild(el);
    requestAnimationFrame(()=> el.classList.add('show'));
  } else {
    el.classList.add('show');
  }
}

function hideGlowButton(){
  const el = document.getElementById(GLOW_ID);
  if (el) el.classList.remove('show');
}

/* ================= TERMINAL INPUT (with glow commands) ================= */
input?.addEventListener('keydown', e=>{
  if(e.key!=='Enter') return;
  const val = input.value.trim().toLowerCase();
  promptEcho(val);
  if(val===''){ input.value=''; return; }

  // built-ins
  if(val==='clear'){ if(out) out.innerHTML=''; input.value=''; return; }
  if(val==='play' || val==='game'){
    openGame();
    print(`<span class="muted">Launching minigame… Press <b>Esc</b> to exit.</span>`, true);
    input.value='';
    return;
  }

  // Glow trigger (auto-hide after 1 minute)
  if(val==='matrix'){
    print(`<span class="muted">${blocks.matrix}</span>`, true);
    showGlowButton();
    setTimeout(hideGlowButton, 60_000);
    input.value='';
    return;
  }



  // mapped content
  if(blocks[val]){
    print(`<span class="muted">${blocks[val]}</span>`, true);
    input.value='';
    return;
  }

  // unknown
  print(`<span class="muted">Command '${val}' not found. Try 'help'.</span>`, true);
  input.value='';
});
