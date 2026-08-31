class RunnerGame{constructor(){this.canvas=el("gameCanvas");this.c=this.canvas.getContext("2d");this.player=new Player(this.canvas);this.obstacles=[];this.coins=[];this.powers=[];this.running=false;this.paused=false;this.over=false;this.last=0;this.distance=0;this.score=0;this.runCoins=0;this.combo=1;this.maxCombo=1;this.speed=15;this.spawn=0;this.coinSpawn=0;this.powerSpawn=4;this.milestones=new Set();this.hit=false;this.reviveUsed=false;this.event=null;this.eventT=0;this.resize();addEventListener("resize",()=>this.resize());this.bind()}resize(){const r=this.canvas.getBoundingClientRect(),d=devicePixelRatio||1;this.canvas.width=Math.floor(r.width*d);this.canvas.height=Math.floor(r.height*d);this.c.setTransform(d,0,0,d,0,0);this.W=r.width;this.H=r.height}bind(){document.addEventListener("keydown",e=>{
if(!this.running)return;
if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," ","Shift"].includes(e.key))e.preventDefault();
if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")this.player.move(-1);else 
if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")this.player.move(1);else 
if(["ArrowUp","w"," "].includes(e.key))this.player.jump();else 
if(e.key==="ArrowDown"||e.key.toLowerCase()==="s")this.player.slideNow();else 
if(e.key==="Shift")this.player.boostNow();else 
if(e.key.toLowerCase()==="p")this.togglePause();else 
if(e.key.toLowerCase()==="r")this.restart()});document.querySelectorAll("[data-control]").forEach(b=>{const act=b.dataset.control;["touchstart","mousedown"].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();this.control(act)},{passive:false}))});el("pauseBtn").onclick=()=>this.togglePause()}control(a){
if(!this.running)return;
if(a==="left")this.player.move(-1);
if(a==="right")this.player.move(1);
if(a==="jump")this.player.jump();
if(a==="slide")this.player.slideNow();
if(a==="boost")this.player.boostNow()}start(){this.resize();this.player.reset();this.obstacles=[];this.coins=[];this.powers=[];this.running=true;this.paused=false;this.over=false;this.last=performance.now();this.distance=0;this.score=0;this.runCoins=0;this.combo=1;this.maxCombo=1;this.speed=15;this.spawn=.4;this.coinSpawn=.2;this.powerSpawn=4;this.milestones.clear();this.hit=false;this.reviveUsed=false;el("gameOverlay").classList.add("hidden");requestAnimationFrame(t=>this.loop(t))}restart(){this.start()}togglePause(){
if(!this.running||this.over)return;this.paused=!this.paused;
if(this.paused)this.showPause();
else{el("gameOverlay").classList.add("hidden");this.last=performance.now();requestAnimationFrame(t=>this.loop(t))}}showPause(){el("overlayCard").innerHTML=`<h2>PAUSED</h2><p>Your run is safely frozen.</p><div class="hero-actions" style="justify-content:center"><button class="primary" onclick="game.togglePause()">RESUME</button><button class="secondary" onclick="game.restart()">RESTART</button><button class="secondary" onclick="game.endToHome()">EXIT</button></div>`;el("gameOverlay").classList.remove("hidden")}endToHome(){this.running=false;el("gameOverlay").classList.add("hidden");showPage("home")}loop(t){
if(!this.running||this.paused)return;const dt=Math.min(.033,(t-this.last)/1000);this.last=t;this.update(dt);this.draw();requestAnimationFrame(x=>this.loop(x))}update(dt){const diff=gameState.settings.difficulty;const mul=diff==="Easy"?.9:diff==="Hard"?1.13:1;this.speed=Math.min(29,(15+this.distance*.003)*mul+(this.player.boost>0?10:0));if(this.player.hero().ability==="Dash")this.speed+=.8;this.distance+=this.speed*dt;this.score+=this.speed*dt*10*this.combo*(this.player.double>0?2:1);this.player.update(dt);this.spawn-=dt;this.coinSpawn-=dt;this.powerSpawn-=dt;const zSpeed=this.speed*dt;
if(this.spawn<=0){this.spawnObstacle();this.spawn=Math.max(.42,1.05-this.distance/5000)*(0.8+Math.random()*.55)}
if(this.coinSpawn<=0){
for(let i=0;i<3;i++)this.coins.push(spawnCoin(1+i*.16,i%3));this.coinSpawn=.45+Math.random()*.45}
if(this.powerSpawn<=0){this.powers.push(spawnPower(1));this.powerSpawn=7+Math.random()*8}
for(const a of [this.obstacles,this.coins,this.powers])
for(const o of a)o.z-=zSpeed/100;
if(this.player.magnet>0)
for(const q of this.coins)
if(!q.collected&&q.z<.75&&q.lane===Math.round(this.player.lane))q.z-=.12;this.checkCollisions();this.obstacles=this.obstacles.filter(o=>o.z>-0.1&&!o.hit);this.coins=this.coins.filter(o=>o.z>-0.1&&!o.collected);this.powers=this.powers.filter(o=>o.z>-0.1&&!o.collected);particles.update(dt);this.eventT-=dt;
if(this.eventT<=0)el("hudEvent").textContent="RUN!";
if(this.eventT<=0&&Math.random()<dt*.025)this.startEvent();this.checkMilestones();this.updateHUD()}spawnObstacle(){this.obstacles.push(spawnObstacle(1.12));
if(Math.random()<.16&&this.distance>1000)this.obstacles.push({...spawnObstacle(1.3),lane:(this.player.targetLane+1)%3})}startEvent(){const events=["COIN STORM","SPEED SECTION","DRONE SWARM","MEGA COIN LINE","BONUS TUNNEL"];this.event=events[Math.floor(Math.random()*events.length)];this.eventT=4+Math.random()*3;el("hudEvent").textContent=this.event;
if(this.event==="COIN STORM")
for(let i=0;i<14;i++)this.coins.push(spawnCoin(1+i*.06,i%3));
if(this.event==="MEGA COIN LINE")
for(let i=0;i<18;i++)this.coins.push(spawnCoin(1+i*.07,1));}checkCollisions(){
for(const o of this.coins){
if(o.collected||o.z<.18||o.z>.72)continue;
if(Math.abs(o.lane-this.player.lane)<.48){o.collected=true;this.runCoins++;gameState.coins+=(this.player.double>0||this.player.hero().ability==="Coin Surge")?100:50;gameState.stats.coins++;this.combo=Math.min(10,this.combo+1);this.maxCombo=Math.max(this.maxCombo,this.combo);this.score+=50*this.combo*(gameState.upgrades["Coin Bonus"]?1+gameState.upgrades["Coin Bonus"]*.15:1);particles.burst(this.player.x(),this.player.baseY()-70,10,"coin");beep(760,.05)}}
for(const p of this.powers){
if(p.collected||p.z<.18||p.z>.7)continue;
if(Math.abs(p.lane-this.player.lane)<.48){p.collected=true;this.activatePower(p.power);gameState.stats.powerups++;this.combo=Math.min(10,this.combo+1);this.maxCombo=Math.max(this.maxCombo,this.combo)}}
for(const o of this.obstacles){
if(o.hit||o.z<.12||o.z>.42)continue;const same=Math.abs(o.lane-this.player.lane)<.42;const jump=this.player.y>.65,slide=this.player.slide>0;let safe=false;
if((o.type==="gate"||o.type==="rock"||o.type==="barrier")&&jump)safe=true;
if((o.type==="laser"||o.type==="spikes")&&slide)safe=true;
if(same&&!safe){
if(this.player.inv>0||this.player.shield>0){
if(this.player.shield>0)this.player.shield=0;else this.player.inv=.7;o.hit=true;particles.burst(this.player.x(),this.player.baseY()-60,25,"hit");beep(180,.12,"sawtooth");this.combo=1}
else{this.hit=true;o.hit=true;this.endRun()}}else 
if(same&&o.z<.25&&!safe){gameState.stats.obstacles++;this.score+=100*this.combo;this.combo=Math.min(10,this.combo+1);this.maxCombo=Math.max(this.maxCombo,this.combo);showToast("NEAR MISS! +100");beep(960,.06)}}}activatePower(p){const dur={SHIELD:7,MAGNET:7,BOOST:4,DOUBLE:7,SUPER:8,MULTI:8,INVINCIBILITY:5}[p]||5;
if(p==="SHIELD")this.player.shield=dur+(this.player.hero().ability==="Heavy Shield"?3:0);
if(p==="MAGNET")this.player.magnet=dur;
if(p==="BOOST")this.player.boost=dur;
if(p==="DOUBLE")this.player.double=dur;
if(p==="SUPER")this.player.superJump=dur;
if(p==="MULTI")this.player.double=dur;
if(p==="INVINCIBILITY")this.player.inv=dur;particles.burst(this.player.x(),this.player.baseY()-70,20,"spark");beep(1050,.12);showToast(p+" ACTIVE")}checkMilestones(){
for(const m of [100,500,1000,2500,5000,10000])
if(this.distance>=m&&!this.milestones.has(m)){this.milestones.add(m);showToast("MILESTONE! "+m+"m");this.score+=m;beep(620,.12)}}updateHUD(){el("hudScore").textContent=Math.floor(this.score).toLocaleString();el("hudDistance").textContent=Math.floor(this.distance)+"m";el("hudCoins").textContent=this.runCoins;el("hudBest").textContent=Math.floor(Math.max(gameState.bestScore,this.score)).toLocaleString();el("combo").textContent="x"+this.combo;el("powerBar").style.setProperty("--power",Math.min(100,Math.max(this.player.shield,this.player.magnet,this.player.boost,this.player.double,this.player.inv,this.player.superJump)*12)+"%")}endRun(){
if(this.over)return;this.over=true;this.running=false;gameState.totalRuns++;gameState.totalDistance+=this.distance;gameState.bestScore=Math.max(gameState.bestScore,Math.floor(this.score));gameState.daily.progress=Math.max(gameState.daily.progress,this.distance);addXP(Math.floor(this.distance/4)+this.runCoins*2);checkAchievements(this);saveState();this.showGameOver()}showGameOver(){const canRevive=!this.reviveUsed;el("overlayCard").innerHTML=`<h2>RUN OVER</h2><p>${this.hit?"The sky got the better of you.":"Run complete."}</p><div class="results"><div class="result"><small>SCORE</small><b>${Math.floor(this.score).toLocaleString()}</b></div><div class="result"><small>DISTANCE</small><b>${Math.floor(this.distance)}m</b></div><div class="result"><small>COINS</small><b>${this.runCoins}</b></div></div><div class="hero-actions" style="justify-content:center">${canRevive?'<button class="primary" onclick="game.revive()">REVIVE</button>':""}<button class="primary" onclick="game.restart()">RUN AGAIN</button><button class="secondary" onclick="game.endToHome()">HOME</button><button class="secondary" onclick="showPage('leaderboard');el('gameOverlay').classList.add('hidden')">LEADERBOARD</button></div>`;el("gameOverlay").classList.remove("hidden")}revive(){
if(this.reviveUsed)return;this.reviveUsed=true;this.over=false;this.running=true;this.player.inv=3;this.player.y=0;this.player.vy=0;this.last=performance.now();el("gameOverlay").classList.add("hidden");requestAnimationFrame(t=>this.loop(t));showToast("REVIVED!");beep(900,.16)}draw(){const c=this.c,W=this.W,H=this.H,w=currentWorld();const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,w.sky[0]);g.addColorStop(.58,w.sky[1]);g.addColorStop(1,"#7768d5");c.fillStyle=g;c.fillRect(0,0,W,H);this.drawEnvironment(c,W,H);this.drawRoad(c,W,H);this.drawObjects(c,W,H);this.player.draw(c,1);particles.draw(c)}drawEnvironment(c,W,H){const t=performance.now()/1000;c.globalAlpha=.6;
for(let i=0;i<8;i++){const x=(i*190-(t*18)%190),y=H*(.12+(i%3)*.09);c.fillStyle="#fff";c.beginPath();c.ellipse(x,y,70,18,0,0,Math.PI*2);c.ellipse(x+45,y+5,55,15,0,0,Math.PI*2);c.fill()}c.globalAlpha=.18;
for(let i=0;i<7;i++){const x=(i*250-(this.distance*.15)%250);c.fillStyle="#5a4bb7";c.beginPath();c.moveTo(x,H*.48);c.lineTo(x+70,H*.25-(i%2)*50);c.lineTo(x+150,H*.48);c.fill()}c.globalAlpha=1}drawRoad(c,W,H){const horizon=H*.42,center=W/2;const grad=c.createLinearGradient(0,horizon,0,H);grad.addColorStop(0,"#50499d");grad.addColorStop(1,"#171c4b");c.fillStyle=grad;c.beginPath();c.moveTo(center-55,horizon);c.lineTo(center+55,horizon);c.lineTo(W*.95,H);c.lineTo(W*.05,H);c.closePath();c.fill();
for(let lane=0;lane<4;lane++){const top=center+(lane-1.5)*28,bottom=W*(.05+lane*.30);c.strokeStyle="#80efff66";c.lineWidth=2;c.beginPath();c.moveTo(top,horizon);c.lineTo(bottom,H);c.stroke()}
for(let i=0;i<14;i++){const z=(i/14+(this.distance*.018)%1);const y=horizon+(z*z)*(H-horizon);const x=center;const half=35+z*z*W*.45;c.strokeStyle="#fff2";c.beginPath();c.moveTo(x-half,y);c.lineTo(x+half,y);c.stroke()}}drawObjects(c,W,H){const draw=(o,kind)=>{
if(o.z<=0||o.z>1.3)return;const z=Math.max(.03,o.z),p=Math.pow(1-z,1.8),y=H*.42+p*(H*.78-H*.42),x=W*(.5+(o.lane-1)*.18*p),s=.25+p*1.35;
if(kind==="coin"){c.save();c.translate(x,y-30*s);c.scale(s,s);c.fillStyle="#ffd53c";c.strokeStyle="#fff5";c.lineWidth=3;c.beginPath();c.ellipse(0,0,15,20,Math.sin(performance.now()/180)*.8,0,Math.PI*2);c.fill();c.stroke();c.restore()}else 
if(kind==="power"){c.save();c.translate(x,y-38*s);c.scale(s,s);c.fillStyle="#ff5fa8";c.shadowBlur=15;c.shadowColor="#ff5fa8";c.beginPath();c.moveTo(0,-22);c.lineTo(17,-4);c.lineTo(0,22);c.lineTo(-17,-4);c.closePath();c.fill();c.fillStyle="#fff";c.font="bold 15px system-ui";c.textAlign="center";c.fillText("⚡",0,5);c.restore()}
else{c.save();c.translate(x,y-28*s);c.scale(s,s);const col=o.type==="laser"?"#ff5e92":o.type==="drone"?"#36dfff":o.type==="spikes"?"#e9f1ff":"#ff8a45";c.fillStyle=col;c.strokeStyle="#18234c";c.lineWidth=3;
if(o.type==="drone"){c.beginPath();c.ellipse(0,0,27,12,0,0,Math.PI*2);c.fill();c.fillStyle="#fff";c.beginPath();c.arc(0,0,6,0,Math.PI*2);c.fill()}else 
if(o.type==="spikes"){
for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*13,15);c.lineTo(i*13+10,-18);c.lineTo(i*13+20,15);c.fill()}}
else{c.beginPath();c.roundRect(-30,-18,60,38,8);c.fill();c.stroke();c.fillStyle="#fff7";c.fillRect(-23,-9,46,6)}c.restore()}}
for(const o of this.obstacles)draw(o,"obstacle");
for(const o of this.coins)draw(o,"coin");
for(const o of this.powers)draw(o,"power")}}
let game=new RunnerGame();