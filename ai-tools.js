(()=>{
if(typeof T==='undefined'||typeof CATS==='undefined')return;
const Q=(s,r)=>(r||document).querySelector(s),
dl=(b,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4e3)},
rd=f=>new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=URL.createObjectURL(f)}),
ld=u=>new Promise((r,j)=>{const s=document.createElement('script');s.src=u;s.onload=r;s.onerror=j;document.head.appendChild(s)}),
ST='<div class="st" style="color:var(--ac);min-height:22px" role="status"></div>',
sm=(b,m)=>{Q('.st',b).textContent=m},
fit=(im,m)=>{const k=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return c},
BASE='https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/';

/* 1. Auto enhance: levels stretch + gamma + saturation, all on the canvas */
function enhance(b){
b.innerHTML='<label>Choose a photo<input type="file" accept="image/*" class="f"></label><label>Strength<input type="range" class="s" min="0" max="100" value="80"></label><canvas style="max-width:100%;border-radius:10px;background:#0006"></canvas><div class="row"><button class="b" data-v="0">Original</button><button class="b" data-v="1">Enhanced</button><button class="b pri dl">Download</button></div>'+ST;
let o,e,orig=0;const cv=Q('canvas',b),x=cv.getContext('2d',{willReadFrequently:true});
const paint=()=>{if(!o)return;const k=orig?0:Q('.s',b).value/100,r=x.createImageData(o.width,o.height),a=o.data,z=e.data,d=r.data;for(let i=0;i<d.length;i++)d[i]=i%4==3?255:a[i]+(z[i]-a[i])*k;x.putImageData(r,0,0)};
const calc=()=>{const a=o.data,n=a.length/4,h=new Uint32Array(256);let s=0,t=0,lo=0,hi=255,i;
 for(i=0;i<a.length;i+=4){const l=(a[i]*.299+a[i+1]*.587+a[i+2]*.114)|0;h[l]++;s+=l}
 for(i=0;i<256;i++){t+=h[i];if(t>=n*.01){lo=i;break}}t=0;for(i=255;i>=0;i--){t+=h[i];if(t>=n*.01){hi=i;break}}
 const sc=Math.min(1.6,255/Math.max(60,hi-lo)),mn=Math.min(.95,Math.max(.05,s/n/255)),g=Math.min(1.4,Math.max(.7,Math.log(.48)/Math.log(mn))),
 lut=new Float32Array(256).map((_,v)=>255*Math.pow(Math.min(1,Math.max(0,(v-lo)*sc/255)),g));
 e=x.createImageData(o.width,o.height);const d=e.data;
 for(i=0;i<a.length;i+=4){const r=lut[a[i]],g2=lut[a[i+1]],bl=lut[a[i+2]],L=r*.299+g2*.587+bl*.114;d[i]=L+(r-L)*1.15;d[i+1]=L+(g2-L)*1.15;d[i+2]=L+(bl-L)*1.15;d[i+3]=255}};
Q('.f',b).onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{const c=fit(await rd(f),1600);cv.width=c.width;cv.height=c.height;x.drawImage(c,0,0);o=x.getImageData(0,0,c.width,c.height);calc();orig=0;paint();sm(b,'Done. Use the slider to adjust.')}catch(_){sm(b,'Could not read this photo.')}};
Q('.s',b).oninput=()=>{orig=0;paint()};
b.onclick=ev=>{const v=ev.target.dataset.v;if(v!==undefined){orig=v==='0';paint()}};
Q('.dl',b).onclick=()=>{if(!o)return sm(b,'Choose a photo first.');orig=0;paint();cv.toBlob(bl=>dl(bl,'navaar-enhanced.jpg'),'image/jpeg',.92)}}

/* 2. Background remover: MediaPipe selfie segmentation (people), runs in the browser */
function bgr(b){
b.innerHTML='<label>Choose a photo of a person<input type="file" accept="image/*" class="f"></label><label>Background<select class="m"><option value="t">Transparent</option><option value="c">Solid color</option><option value="b">Blurred original</option></select></label><label>Color<input type="color" class="c" value="#ffffff"></label><div class="row"><button class="b pri go">Remove background</button><button class="b dl">Download PNG</button></div>'+ST+'<canvas style="max-width:100%;border-radius:10px;background:repeating-conic-gradient(#8885 0 25%,#0000 0 50%) 0 0/20px 20px"></canvas><p class="note">Works best on photos of people. The first run downloads a small AI model.</p>';
let src,P;const cv=Q('canvas',b),x=cv.getContext('2d');
const show=()=>{if(!P)return;const m=Q('.m',b).value;cv.width=P.width;cv.height=P.height;x.clearRect(0,0,cv.width,cv.height);
 if(m==='c'){x.fillStyle=Q('.c',b).value;x.fillRect(0,0,cv.width,cv.height)}
 if(m==='b'){x.filter='blur(16px)';x.drawImage(src,0,0);x.filter='none'}
 x.drawImage(P,0,0)};
Q('.go',b).onclick=async()=>{const f=Q('.f',b).files[0];if(!f)return sm(b,'Choose a photo first.');
 try{sm(b,'Loading AI model…');src=fit(await rd(f),1280);
  if(!window.SelfieSegmentation)await ld(BASE+'selfie_segmentation.js');
  const sg=new SelfieSegmentation({locateFile:n=>BASE+n});sg.setOptions({modelSelection:0});
  const mk=await new Promise((res,rej)=>{sg.onResults(r=>res(r.segmentationMask));sg.send({image:src}).catch(rej)});
  P=document.createElement('canvas');P.width=src.width;P.height=src.height;const p=P.getContext('2d');p.filter='blur(1px)';p.drawImage(mk,0,0,P.width,P.height);p.filter='none';p.globalCompositeOperation='source-in';p.drawImage(src,0,0);
  show();sm(b,'Done. Change the background or download.');if(sg.close)sg.close()}
 catch(e){sm(b,'Could not load the AI model. Check your internet and try again.')}};
b.oninput=b.onchange=e=>{if(e.target.classList.contains('m')||e.target.classList.contains('c'))show()};
Q('.dl',b).onclick=()=>{if(!P)return sm(b,'Remove the background first.');cv.toBlob(bl=>dl(bl,'navaar-no-background.png'))}}

/* 3. Voice to captions: browser speech recognition, timed .srt */
function cap(b){
const R=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!R){b.innerHTML='<p class="mu">Voice captions need Chrome on Android or desktop.</p>';return}
b.innerHTML='<label>Language<select class="l"><option value="ur-PK">Urdu</option><option value="en-US">English</option><option value="hi-IN">Hindi</option></select></label><div class="row"><button class="b pri go">● Start speaking</button><button class="b sp">■ Stop</button></div>'+ST+'<pre class="o" dir="auto"></pre><div class="row"><button class="b d1">Download .srt</button><button class="b d2">Download .txt</button><button class="b cp">Copy text</button></div><p class="note">Speak near the microphone. Use the .srt in any video app, or paste the lines into the Editor captions box.</p>';
let r,on=0,t0,last=0,S=[];
const pad=(n,l)=>String(n).padStart(l||2,'0'),tc=s=>pad(Math.floor(s/3600))+':'+pad(Math.floor(s%3600/60))+':'+pad(Math.floor(s%60))+','+pad(Math.min(999,Math.round(s%1*1e3)),3),
srt=()=>S.map((z,i)=>(i+1)+'\n'+tc(z[0])+' --> '+tc(z[1])+'\n'+z[2]).join('\n\n'),txt=()=>S.map(z=>z[2]).join('\n'),ui=()=>{Q('.o',b).textContent=txt()};
Q('.go',b).onclick=()=>{if(on)return;S=[];last=0;on=1;t0=Date.now();r=new R();r.continuous=true;r.interimResults=false;r.lang=Q('.l',b).value;
 r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal){const n=(Date.now()-t0)/1e3;S.push([last,n,e.results[i][0].transcript.trim()]);last=n;ui()}};
 r.onerror=e=>{if(e.error==='not-allowed'){on=0;sm(b,'Microphone permission is needed.')}};
 r.onend=()=>{if(on)try{r.start()}catch(_){}};
 try{r.start();sm(b,'Listening…')}catch(_){on=0;sm(b,'Could not start the microphone.')}};
Q('.sp',b).onclick=()=>{on=0;try{r.stop()}catch(_){}sm(b,S.length?S.length+' captions ready.':'Nothing was heard.')};
Q('.d1',b).onclick=()=>S.length?dl(new Blob([srt()],{type:'text/plain'}),'navaar-captions.srt'):sm(b,'Speak first.');
Q('.d2',b).onclick=()=>S.length?dl(new Blob([txt()],{type:'text/plain'}),'navaar-captions.txt'):sm(b,'Speak first.');
Q('.cp',b).onclick=()=>navigator.clipboard.writeText(txt()).then(()=>sm(b,'Copied'),()=>sm(b,'Copy is not available here.'));
clean=()=>{on=0;try{r&&r.stop()}catch(_){}}}

T.push(
{id:'aienhance',cat:'AI',n:'Auto Enhance Photo',d:'Fix dark or flat photos in one tap: brightness, contrast and color. Runs in your browser.',k:'enhance improve brightness fix photo auto ai',pop:1,cu:enhance},
{id:'aibg',cat:'AI',n:'Background Remover',d:'Cut out the person in a photo. Transparent, solid color or blurred background.',k:'remove background cutout transparent png ai people',pop:1,cu:bgr},
{id:'aicap',cat:'AI',n:'Voice to Captions',d:'Speak and get timed captions (.srt) in Urdu, English or Hindi.',k:'captions subtitles speech to text srt urdu ai',pop:1,cu:cap});
if(!CATS.includes('AI'))CATS.push('AI');
SOON.length=0;
route();
})();
