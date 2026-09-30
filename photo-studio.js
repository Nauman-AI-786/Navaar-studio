(()=>{
if(typeof T==='undefined')return;
const Q=(s,r)=>(r||document).querySelector(s),
SL=[['exp','Exposure',-100,100],['con','Contrast',-100,100],['hi','Highlights',-100,100],['sh','Shadows',-100,100],['wa','Warmth',-100,100],['sa','Saturation',-100,100],['vi','Vibrance',-100,100],['shp','Sharpen',0,100],['vg','Vignette',0,100],['bl','Blur',0,20]],
PRE={Original:{},Vivid:{con:15,sa:25,vi:20},Warm:{wa:35,exp:5,sa:10},Cool:{wa:-35,con:8},Cinema:{con:25,sa:-10,wa:-15,vg:30,sh:-10},Vintage:{wa:25,sa:-25,con:-10,vg:35},'B&W':{sa:-100,con:20},Soft:{con:-15,bl:1,exp:8},Drama:{con:40,hi:-30,sh:25,vg:25}},
ASP={Original:0,'1:1':[1,1],'4:5':[4,5],'9:16':[9,16],'16:9':[16,9],'3:4':[3,4]},
zero=()=>Object.fromEntries(SL.map(s=>[s[0],0])),
dl=(b,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4e3)},
rd=f=>new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=URL.createObjectURL(f)});

/* crop + rotate + flip into a canvas no wider than max */
function prep(im,A,rot,fh,max){let sw=im.width,sh=im.height,sx=0,sy=0;
 if(A){const t=A[0]/A[1];if(sw/sh>t){const n=sh*t;sx=(sw-n)/2;sw=n}else{const n=sw/t;sy=(sh-n)/2;sh=n}}
 const k=Math.min(1,max/Math.max(sw,sh)),w=Math.round(sw*k),h=Math.round(sh*k),r=rot%2,c=document.createElement('canvas');
 c.width=r?h:w;c.height=r?w:h;const x=c.getContext('2d');x.translate(c.width/2,c.height/2);x.rotate(rot*Math.PI/2);x.scale(fh?-1:1,1);x.drawImage(im,sx,sy,sw,sh,-w/2,-h/2,w,h);return c}

/* the edit pipeline: one pass over the pixels, then sharpen and vignette */
function run(src,v){const w=src.width,h=src.height,c=document.createElement('canvas');c.width=w;c.height=h;
 const x=c.getContext('2d',{willReadFrequently:true});
 if(v.bl)x.filter='blur('+v.bl*w/1000+'px)';x.drawImage(src,0,0);x.filter='none';
 const im=x.getImageData(0,0,w,h),d=im.data,ex=Math.pow(2,v.exp/100*1.2),ct=1+v.con/100,wa=v.wa*.4,sa=1+v.sa/100,vi=v.vi/100;
 for(let i=0;i<d.length;i+=4){let r=d[i]*ex,g=d[i+1]*ex,b=d[i+2]*ex;
  const L=(r*.299+g*.587+b*.114)/255,k=v.hi*(L>.5?(L-.5)*2:0)*.6+v.sh*(L<.5?(.5-L)*2:0)*.6;
  r+=k+wa;g+=k;b+=k-wa;
  r=(r-128)*ct+128;g=(g-128)*ct+128;b=(b-128)*ct+128;
  const y=r*.299+g*.587+b*.114,ch=(Math.max(r,g,b)-Math.min(r,g,b))/255,s=sa+vi*(1-Math.min(1,ch));
  d[i]=y+(r-y)*s;d[i+1]=y+(g-y)*s;d[i+2]=y+(b-y)*s}
 x.putImageData(im,0,0);
 if(v.shp){const b=document.createElement('canvas');b.width=w;b.height=h;const y=b.getContext('2d');y.filter='blur('+Math.max(.8,w/1200)+'px)';y.drawImage(c,0,0);
  const o=x.getImageData(0,0,w,h),p=y.getImageData(0,0,w,h),q=o.data,z=p.data,k=v.shp/50;
  for(let i=0;i<q.length;i+=4){q[i]+=(q[i]-z[i])*k;q[i+1]+=(q[i+1]-z[i+1])*k;q[i+2]+=(q[i+2]-z[i+2])*k}x.putImageData(o,0,0)}
 if(v.vg){const g=x.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+v.vg/100*.8+')');x.fillStyle=g;x.fillRect(0,0,w,h)}
 return c}

function photo(b){
 b.innerHTML='<label>Choose a photo<input type="file" accept="image/*" class="f"></label>'
 +'<canvas style="max-width:100%;border-radius:12px;background:#0006"></canvas>'
 +'<div class="row"><button class="b pri au">Auto enhance</button><button class="b cmp">Hold to compare</button><button class="b rs">Reset</button></div>'
 +'<label>Looks</label><div class="row">'+Object.keys(PRE).map(k=>'<button class="b" data-p="'+k+'">'+k+'</button>').join('')+'</div>'
 +'<label>Crop</label><div class="row">'+Object.keys(ASP).map(k=>'<button class="b" data-a="'+k+'">'+k+'</button>').join('')+'<button class="b" data-r="1">Rotate</button><button class="b" data-fl="1">Flip</button></div>'
 +SL.map(s=>'<label>'+s[1]+'<input type="range" data-k="'+s[0]+'" min="'+s[2]+'" max="'+s[3]+'" value="0"></label>').join('')
 +'<label>Save as<select class="fm"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select></label>'
 +'<label>Quality<input type="range" class="q" min="50" max="100" value="92"></label><div class="row"><button class="b pri dl">Download</button></div><div class="st" style="color:var(--ac);min-height:22px" role="status"></div>';
 const cv=Q('canvas',b),st=m=>{Q('.st',b).textContent=m};
 let im,base,v=zero(),A=0,rot=0,fh=0,cmp=0,raf=0;
 const paint=()=>{if(!base)return;const c=cmp?base:run(base,v);cv.width=c.width;cv.height=c.height;cv.getContext('2d').drawImage(c,0,0)},
 draw=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(paint)},
 rebase=()=>{base=prep(im,A,rot,fh,1000);draw()},
 sync=()=>b.querySelectorAll('[data-k]').forEach(e=>e.value=v[e.dataset.k]);
 Q('.f',b).onchange=async e=>{const f=e.target.files[0];if(!f)return;try{im=await rd(f);v=zero();A=0;rot=0;fh=0;sync();rebase();st('Ready. Try Auto enhance or a look.')}catch(_){st('Could not read this photo.')}};
 b.oninput=e=>{const k=e.target.dataset.k;if(k){v[k]=+e.target.value;draw()}};
 b.onclick=e=>{const t=e.target,d=t.dataset;if(!im&&(d.p||d.a||d.r||d.fl||t.classList.contains('au')))return st('Choose a photo first.');
  if(d.p){v=Object.assign(zero(),PRE[d.p]);sync();draw()}
  if(d.a){A=ASP[d.a];rebase()}if(d.r){rot=(rot+1)%4;rebase()}if(d.fl){fh=fh?0:1;rebase()}
  if(t.classList.contains('rs')){v=zero();A=0;rot=0;fh=0;sync();if(im)rebase()}
  if(t.classList.contains('au')){const a=base.getContext('2d').getImageData(0,0,base.width,base.height).data;let s=0;for(let i=0;i<a.length;i+=16)s+=a[i]*.299+a[i+1]*.587+a[i+2]*.114;const m=s/(a.length/16)/255;
   v=Object.assign(zero(),{exp:Math.round(Math.max(-40,Math.min(40,(.48-m)*110))),con:12,sh:m<.42?28:12,hi:m>.6?-25:0,vi:22,shp:20});sync();draw();st('Auto enhance applied. Fine tune with the sliders.')}};
 const cm=Q('.cmp',b);cm.onpointerdown=()=>{cmp=1;paint()};cm.onpointerup=cm.onpointerleave=()=>{cmp=0;paint()};
 Q('.dl',b).onclick=()=>{if(!im)return st('Choose a photo first.');st('Saving…');
  setTimeout(()=>{const c=run(prep(im,A,rot,fh,4096),v),f=Q('.fm',b).value;c.toBlob(bl=>{dl(bl,'navaar-photo.'+f.split('/')[1].replace('jpeg','jpg'));st('Saved at full size.')},f,Q('.q',b).value/100)},30)}}

const old=T.findIndex(t=>t.id==='aienhance');if(old>-1)T.splice(old,1);
const d={id:'imgedit',cat:'Image',n:'Photo Editor Pro',d:'Auto enhance, looks, crop, rotate, exposure, shadows, highlights, vibrance, sharpen and full-size export.',k:'photo editor enhance filter crop rotate brightness contrast sharpen vignette blur warmth',pop:1,cu:photo},
t=T.find(z=>z.id==='imgedit');if(t)Object.assign(t,d,{x:0});else T.push(d);
route();
})();
