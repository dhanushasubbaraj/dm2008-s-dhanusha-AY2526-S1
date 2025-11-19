/* Bloomfall Constellations — Fix Build with diagnostics */
let port, haveSerial=false;
let lastSpawnMs=-1, REFRACTORY_MS=250;
let mouseIsDown=false, mouseDownMs=0;
let W=960,H=540;
const blooms=[], stars=[], connectors=[];
const phrases=[
  "we leave breadcrumbs of light",
  "touch becomes memory",
  "petals drift into night",
  "together we map the sky",
  "every signal is a story"
];

function logln(...args){
  const el = document.getElementById('log');
  const msg = args.map(a => typeof a==='string'?a:JSON.stringify(a)).join(' ');
  if(el){ el.textContent += msg + "\n"; el.scrollTop = el.scrollHeight; }
  console.log("[Bloomfall]", ...args);
}

function setup(){
  const holder = document.getElementById("canvas-holder");
  const c = createCanvas(holder.clientWidth, holder.clientHeight); c.parent(holder);
  W=width; H=height; noStroke(); textAlign(CENTER,CENTER);

  for(let i=0;i<120;i++) stars.push(new Star(random(W),random(H),random(0.6,2.0),random(120,255)));

  const btn = document.getElementById("connectBtn");
  const canSerial = 'serial' in navigator;
  const secure = window.isSecureContext;

  if(!canSerial){ setStatus("Serial: not supported (use Chrome/Edge)"); logln("Web Serial not supported."); }
  else if(!secure){ setStatus("Serial: needs HTTPS/localhost"); logln("Not a secure context. Launch via localhost."); }
  else { setStatus("Serial: not connected"); logln("Ready. Click Connect Sensor."); }

  btn.addEventListener("click", async () => {
    try{
      if(!canSerial || !secure){ alert("Use Chrome/Edge + HTTPS/localhost."); return; }
      if(!port) port = createSerial();
      await port.requestPort();              logln("Port selected.");
      await port.open({ baudRate:9600 });    logln("Port opened @9600.");
      haveSerial = true; setStatus("Serial: connected");
    }catch(e){
      setStatus("Serial: connection canceled or failed");
      logln("Connection error:", e.name||"", e.message||e);
    }
  });

  // Try to use already granted ports (if any)
  if(canSerial && secure){
    navigator.serial.getPorts().then(granted => {
      if(granted && granted.length>0){
        logln("Previously granted port found. Click Connect to select again if needed.");
      }
    });
  }
}

function windowResized(){
  const holder=document.getElementById("canvas-holder");
  resizeCanvas(holder.clientWidth, holder.clientHeight); W=width; H=height;
}

function draw(){
  background(9,13,29);
  for(const s of stars){ s.update(); s.draw(); }

  try{
    if(port && haveSerial && port.available()){
      let line = port.readUntil("\n");
      if(typeof line==="string"){
        line = line.trim();
        if(line){
          logln("RX:", line);
          handleSignal(line);
        }
      }
    }
  }catch(err){ /* keep rendering */ }

  for(let i=blooms.length-1;i>=0;i--){
    const b=blooms[i]; b.update(); b.draw(); if(b.isDone()) blooms.splice(i,1);
  }
  for(let i=connectors.length-1;i>=0;i--){
    const L=connectors[i]; L.update(); L.draw(); if(L.dead) connectors.splice(i,1);
  }
}

function handleSignal(line){
  const now=millis();
  if(lastSpawnMs>=0 && now-lastSpawnMs<REFRACTORY_MS) return;
  lastSpawnMs=now;
  if(line==="1"){ spawnBloom(); }
  else if(line==="2"){ spawnBloom(); connectNearest(); }
  else {
    const v=parseInt(line,10);
    if(!isNaN(v)){
      if(v>700){ spawnBloom(); connectNearest(); }
      else if(v>300){ spawnBloom(); }
    }
  }
}

function spawnBloom(x=random(0.15*W,0.85*W), y=random(0.2*H,0.9*H)){
  const petals=floor(random(6,10)), hue=random(180,300);
  blooms.push(new Bloom(x,y,petals,hue));
  if(random()<0.08){ push(); fill(230,240,255,160); textSize(random(12,16)); text(random(phrases), x, y-random(40,80)); pop(); }
}
function connectNearest(){
  if(blooms.length<2) return;
  const a=blooms[blooms.length-1], k=3, others=blooms.slice(0,-1);
  others.sort((p,q)=>dist(a.x,a.y,p.x,p.y)-dist(a.x,a.y,q.x,q.y));
  for(let i=0;i<min(k,others.length);i++) connectors.push(new Connector(a.x,a.y, others[i].x, others[i].y));
}

function mousePressed(){ mouseIsDown=true; mouseDownMs=millis(); }
function mouseReleased(){
  const held=millis()-mouseDownMs; mouseIsDown=false;
  if(held>400) handleSignal("2"); else handleSignal("1");
}
function setStatus(msg){ const el=document.getElementById("serialStatus"); if(el) el.textContent=msg; }

class Star{ constructor(x,y,r,a){ this.x=x; this.y=y; this.r=r; this.a=a; this.tw=random(0.003,0.01); this.ph=random(TWO_PI);} update(){ this.ph+=this.tw;} draw(){ const f=(sin(this.ph)*0.5+0.5); fill(210,230,255,this.a*(0.5+0.5*f)); circle(this.x,this.y,this.r*(1.0+0.5*f)); } }
class Bloom{
  constructor(x,y,petals,hue){ this.x=x; this.y=y; this.petals=petals; this.hue=hue; this.age=0; this.lifespan=4200; this.rBase=random(14,26);
    this.vel=createVector(random(-0.2,0.2), random(-0.35,-0.05)); this.rotation=random(TWO_PI); this.rotVel=random(-0.01,0.01); }
  update(){ this.age+=deltaTime; this.x+=this.vel.x; this.y+=this.vel.y; this.rotation+=this.rotVel; this.vel.y+=0.00015; }
  draw(){ push(); translate(this.x,this.y); rotate(this.rotation); const t=constrain(this.age/this.lifespan,0,1); const alpha=255*(1.0-smoothstep(0.8,1.0,t));
    drawingContext.shadowColor="rgba(150,140,255,0.35)"; drawingContext.shadowBlur=12;
    for(let i=0;i<this.petals;i++){ const ang=i*TWO_PI/this.petals; const r=this.rBase*(1.0+0.3*sin(ang*3 + t*6)); const px=cos(ang)*r, py=sin(ang)*r;
      push(); translate(px,py); rotate(ang); fill(200,200,255,alpha); ellipse(0,0, r*1.2, r*0.7); pop(); }
    fill(255,235,180,alpha); circle(0,0,this.rBase*0.9); pop(); }
  isDone(){ return this.age>=this.lifespan; }
}
class Connector{
  constructor(x1, y1, x2, y2){
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    this.age = 0;
    this.life = 4000;      // total lifetime (ms)
    this.growMs = 1000;     // how long the line takes to "grow in"
    this.dead = false;
  }

  update(){
    this.age += deltaTime;
    if (this.age > this.life) this.dead = true;
  }

  draw(){
    // 1) Growth progress (0 → 1 during the first growMs)
    const growT = constrain(this.age / this.growMs, 0, 1);

    // Interpolate the endpoint so the line "extends" outwards
    const ex = lerp(this.x1, this.x2, growT);
    const ey = lerp(this.y1, this.y2, growT);

    // 2) Fade-out progress only after it has fully grown
    const fadeStart = this.growMs;
    const fadeDuration = this.life - this.growMs;
    const fadeT = fadeDuration > 0
      ? constrain((this.age - fadeStart) / fadeDuration, 0, 1)
      : 1;

    // Alpha + thickness: bright at first, then gently fade
    const alpha = 220 * (1.0 - fadeT * 0.9);   // keep a soft glow
    const weight = 1.6 - 0.8 * fadeT;

    stroke(170, 190, 255, alpha);
    strokeWeight(weight);
    noFill();
    line(this.x1, this.y1, ex, ey);
    noStroke();
  }
}

function smoothstep(e0,e1,x){ const t=constrain((x-e0)/(e1-e0),0,1); return t*t*(3-2*t); }
