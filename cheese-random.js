
// cheese-random.js — draw sparse, randomly placed cheese icons behind content
(()=>{
  const IMG_SRC = 'cheese.png';   // put cheese.png next to this file
  const PRM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Create / get canvas
  let c = document.getElementById('cheeseBG');
  if(!c){
    c = document.createElement('canvas');
    c.id = 'cheeseBG';
    document.body.prepend(c);
  }
  const ctx = c.getContext('2d');
  let W = innerWidth, H = innerHeight;
  c.width = W; c.height = H;

  // Density controls
  const AREA_PER_ICON = 520000;           // px² per cheese (~4 on 1920x1080)
  const MIN = 3, MAX = 10;                // clamp count
  const MIN_SCALE = 0.7, MAX_SCALE = 1.3; // size range
  const MAX_SPEED = 0.08;                 // px per frame drift

  const cheeses = [];
  const img = new Image(); img.src = IMG_SRC;
  img.onload = ()=>{ reset(); if(!PRM) loop(); else drawOnce(); };

  function reset(){
    cheeses.length = 0;
    W = innerWidth; H = innerHeight; c.width = W; c.height = H;
    const target = Math.min(MAX, Math.max(MIN, Math.round((W*H)/AREA_PER_ICON)));
    for(let i=0;i<target;i++){
      const s = rand(MIN_SCALE, MAX_SCALE);
      cheeses.push({
        x: rand(-0.2*W, 1.2*W),
        y: rand(-0.2*H, 1.2*H),
        s,
        a: rand(-0.5, 0.5),               // angle
        va: rand(-0.002, 0.002),          // spin
        vx: rand(-MAX_SPEED, MAX_SPEED),  // drift
        vy: rand(-MAX_SPEED, MAX_SPEED),
        alpha: rand(0.28, 0.44),
      });
    }
    drawOnce();
  }

  function rand(a,b){ return Math.random()*(b-a)+a; }

  function drawOnce(){
    ctx.clearRect(0,0,W,H);
    for(const ch of cheeses){
      ctx.save();
      ctx.globalAlpha = ch.alpha;
      ctx.translate(ch.x, ch.y);
      ctx.rotate(ch.a);
      const w = img.width*ch.s, h = img.height*ch.s;
      ctx.drawImage(img, -w/2, -h/2, w, h);
      ctx.restore();
    }
  }

  let raf;
  function loop(){
    raf = requestAnimationFrame(loop);
    ctx.clearRect(0,0,W,H);
    for(const ch of cheeses){
      ch.x += ch.vx; ch.y += ch.vy; ch.a += ch.va;
      // wrap around edges softly
      if(ch.x < -0.25*W) ch.x = 1.25*W;
      if(ch.x >  1.25*W) ch.x = -0.25*W;
      if(ch.y < -0.25*H) ch.y = 1.25*H;
      if(ch.y >  1.25*H) ch.y = -0.25*H;
      ctx.save();
      ctx.globalAlpha = ch.alpha;
      ctx.translate(ch.x, ch.y);
      ctx.rotate(ch.a);
      const w = img.width*ch.s, h = img.height*ch.s;
      ctx.drawImage(img, -w/2, -h/2, w, h);
      ctx.restore();
    }
  }

  addEventListener('resize', ()=>{
    cancelAnimationFrame(raf);
    reset();
    if(!PRM) loop();
  });
})();
