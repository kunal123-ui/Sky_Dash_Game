class Player{
 constructor(canvas){this.canvas=canvas;this.reset()}
 reset(){this.lane=1;this.targetLane=1;this.y=0;this.vy=0;this.state="RUN";this.slide=0;this.boost=0;this.inv=0;this.shield=0;this.magnet=0;this.double=0;this.superJump=0;this.runT=0;this.airJump=false}
 hero(){return HEROES[gameState.selectedHero]||HEROES.Kai}
 move(dir){this.targetLane=Math.max(0,Math.min(2,this.targetLane+dir));beep(280,.04)}
 jump(){
  if(this.y<=.02&&!this.slide){this.vy=this.superJump?8.7:7.2;this.state="JUMP";this.airJump=false;particles.burst(this.x(),this.baseY(),10,"spark");beep(640,.09);return}
  if(this.y>.02&&this.y<.9&&!this.airJump&&this.hero().ability==="Double Jump"){this.vy=6.1;this.airJump=true;particles.burst(this.x(),this.baseY()-this.y*40,12,"spark");beep(820,.08)}
 }
 slideNow(){if(this.y<.2){this.slide=.65;this.state="SLIDE";beep(220,.05)}}
 boostNow(){this.boost=Math.max(this.boost,2.8);this.inv=Math.max(this.inv,1.5);beep(900,.12,"square")}
 update(dt){
  this.lane+=(this.targetLane-this.lane)*Math.min(1,dt*12);this.runT+=dt;
  if(this.y>0||this.vy>0){this.vy-=19*dt;this.y+=this.vy*dt;if(this.y<=0){this.y=0;this.vy=0;this.airJump=false;this.state="RUN";particles.burst(this.x(),this.baseY(),8,"spark");beep(170,.05)}}
  if(this.slide>0){this.slide-=dt;if(this.slide<=0)this.state="RUN"}
  if(this.boost>0)this.boost-=dt;if(this.inv>0)this.inv-=dt;if(this.shield>0)this.shield-=dt;if(this.magnet>0)this.magnet-=dt;if(this.double>0)this.double-=dt;if(this.superJump>0)this.superJump-=dt
 }
 x(){return this.canvas.width*(.5+(this.lane-1)*.18)}
 baseY(){return this.canvas.height*.78}
 draw(c,scale=1){
  const x=this.x(),y=this.baseY()-this.y*this.canvas.height*.06,bob=this.state==="RUN"?Math.sin(this.runT*15)*3:0,h=this.hero();
  c.save();c.translate(x,y+bob);c.scale(scale,scale);
  if(this.shield>0){c.strokeStyle="#65e9ffcc";c.lineWidth=4;c.beginPath();c.arc(0,-58,48,0,Math.PI*2);c.stroke()}
  if(this.boost>0){c.globalAlpha=.72;c.fillStyle="#ffdc45";c.beginPath();c.moveTo(-20,18);c.lineTo(-70,30+Math.random()*10);c.lineTo(-28,3);c.fill();c.globalAlpha=1}
  c.fillStyle="#17254d";c.beginPath();c.ellipse(0,5,31,7,0,0,Math.PI*2);c.fill();
  c.fillStyle=h.skin;c.beginPath();c.arc(0,-82,19,0,Math.PI*2);c.fill();
  c.fillStyle=h.hair;c.beginPath();c.arc(0,-92,20,Math.PI,Math.PI*2);c.fill();
  if(h.hairStyle==="spikes"){for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*10-5,-98);c.lineTo(i*10,-113);c.lineTo(i*10+6,-99);c.fill()}}
  if(h.hairStyle==="ponytail"){c.beginPath();c.arc(19,-99,9,0,Math.PI*2);c.fill()}
  c.fillStyle="#26314b";c.beginPath();c.arc(-6,-83,2.5,0,Math.PI*2);c.arc(6,-83,2.5,0,Math.PI*2);c.fill();
  c.fillStyle=h.suit;c.beginPath();c.roundRect(-22,-63,44,55,13);c.fill();
  c.fillStyle=h.accent;c.fillRect(-5,-58,10,40);
  c.fillStyle="#ffd0ad";c.save();c.translate(-22,-57);c.rotate(-.35+Math.sin(this.runT*15)*.12);c.roundRect(-5,0,10,42,6);c.fill();c.restore();c.save();c.translate(22,-57);c.rotate(.35-Math.sin(this.runT*15)*.12);c.roundRect(-5,0,10,42,6);c.fill();c.restore();
  c.fillStyle=h.pants;const legSwing=Math.sin(this.runT*15)*.35;c.save();c.translate(-10,-8);c.rotate(legSwing);c.roundRect(-6,0,12,48,6);c.fill();c.restore();c.save();c.translate(10,-8);c.rotate(-legSwing);c.roundRect(-6,0,12,48,6);c.fill();c.restore();
  c.fillStyle=h.shoe;c.beginPath();c.ellipse(-15,40,18,7,0,0,Math.PI*2);c.ellipse(15,40,18,7,0,0,Math.PI*2);c.fill();
  if(h.accessory==="visor"){c.fillStyle="#65e9ff";c.fillRect(-17,-88,34,7)}
  if(h.accessory==="scarf"){c.fillStyle="#ff5c9a";c.fillRect(-21,-60,42,7);c.beginPath();c.moveTo(15,-56);c.lineTo(38,-45);c.lineTo(22,-39);c.fill()}
  if(h.accessory==="energy"){c.strokeStyle="#ffe45b";c.lineWidth=3;c.strokeRect(-28,-69,56,66)}
  c.restore()
 }
}
