(function(){
var signed=false;try{for(var i=0;i<localStorage.length;i++){if(/^sb-.*-auth-token$/.test(localStorage.key(i)))signed=true}}catch(e){}
var H=signed?'studio.html':'index.html';
var L=signed
?[['Studio','studio.html'],['Video Editor','editor.html'],['Design Studio & Tools','tools.html'],['Quick Poetry Video','studio.html#quick-poetry'],['Photo + Lyrics Video','studio.html#photo-lyrics'],['Templates','studio.html#templates'],['Feedback','studio.html#feedback'],['Privacy Policy','privacy.html']]
:[['Home','index.html'],['Video Editor','editor.html'],['Design Studio & Tools','tools.html'],['Privacy Policy','privacy.html']];
var st=document.createElement('style');st.textContent='#nvMB{width:44px;height:44px;min-height:44px;border-radius:12px;border:1px solid #2a353c;background:#1c262c;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;padding:0;flex:none}#nvMB i{display:block;width:20px;height:2px;border-radius:2px;background:#e9f0ee}#nvSh{position:fixed;inset:0;background:#0009;z-index:1000;display:none}#nvSh.on{display:block}#nvDr{position:fixed;top:0;right:0;bottom:0;width:min(320px,88vw);z-index:1001;background:#11191d;border-left:1px solid #2a353c;padding:18px 16px;overflow:auto;transform:translateX(105%);visibility:hidden;transition:transform .25s;font:14.5px system-ui,sans-serif;color:#e9f0ee}#nvDr.on{transform:none;visibility:visible}#nvDr a,#nvDr button.so{display:block;width:100%;text-align:left;font:inherit;padding:10px 12px;margin-bottom:4px;border-radius:10px;background:rgba(255,255,255,.04);color:#e9f0ee;text-decoration:none;border:0;cursor:pointer}#nvDr a:hover,#nvDr a.cur{background:rgba(111,211,181,.16)}#nvDr button.so{color:#ffaaa4;font-weight:700;margin-top:10px}#nvDr .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;font-weight:800;font-size:18px}#nvDr .top button{width:38px;height:38px;min-height:38px;border-radius:10px;border:0;background:rgba(255,255,255,.06);color:#e9f0ee;cursor:pointer}#nvDr .au{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}#nvDr .au a{text-align:center;margin:0;border:1px solid #2a353c}#nvDr .au a.p{background:#6fd3b5;color:#0b1a15;font-weight:700;border-color:#6fd3b5}.nvbar{display:flex;justify-content:space-between;align-items:center;padding:0 16px;height:56px;background:#151d22;border-bottom:1px solid #2a353c}.nvbar a.b{color:#e9f0ee;font:800 17px system-ui,sans-serif;text-decoration:none}';document.head.appendChild(st);
var b=document.createElement('button');b.id='nvMB';b.type='button';b.setAttribute('aria-label','Open menu');b.innerHTML='<i></i><i></i><i></i>';
var h=document.querySelector('header');
if(!h){h=document.createElement('header');h.className='nvbar';h.innerHTML='<a class="b" href="'+H+'">Navaar Studio</a>';document.body.insertBefore(h,document.body.firstChild)}
var n=h.querySelector('nav');if(n)n.remove();
var w=h.querySelector('.w');(w||h).appendChild(b);
var sh=document.createElement('div');sh.id='nvSh';
var d=document.createElement('aside');d.id='nvDr';d.setAttribute('aria-label','Website menu');
var page=location.pathname.split('/').pop()||'index.html';
d.innerHTML='<div class="top">Navaar Studio<button type="button" aria-label="Close menu">&#10005;</button></div>'+(signed?'':'<div class="au"><a class="p" href="auth.html?mode=in">Sign in</a><a href="auth.html?mode=signup">Sign up</a></div>')+L.map(function(x){return'<a href="'+x[1]+'"'+(x[1]==page?' class="cur"':'')+'>'+x[0].replace('&','&amp;')+'</a>'}).join('')+(signed?'<button type="button" class="so">Sign out</button>':'');
document.body.appendChild(sh);document.body.appendChild(d);
function o(v){d.classList.toggle('on',v);sh.classList.toggle('on',v)}
b.onclick=function(){o(true)};sh.onclick=d.querySelector('.top button').onclick=function(){o(false)};
document.addEventListener('keydown',function(e){if(e.key==='Escape')o(false)});
function leave(){try{Object.keys(localStorage).forEach(function(k){if(/^sb-.*-auth-token$/.test(k))localStorage.removeItem(k)})}catch(e){}location.href='index.html'}
var so=d.querySelector('.so');
if(so)so.onclick=function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=function(){try{window.supabase.createClient('https://zcungofmmaagqcinafhb.supabase.co','sb_publishable_7ydxbZOzF0v2X58P7Pk_jg_za4pBQ3s').auth.signOut().then(leave,leave)}catch(e){leave()}};s.onerror=leave;document.head.appendChild(s)};
})();
