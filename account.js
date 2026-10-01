/* Navaar Studio: plans + sign in + checkout.
   Add this line to studio.html just before </body>:
   <script src="account.js" defer></script> */
(function () {
  // ====== PASTE YOUR TWO VALUES HERE (public values only, never the service key) ======
  var SUPABASE_URL = "PASTE_SUPABASE_URL_HERE";
  var SUPABASE_ANON_KEY = "PASTE_SUPABASE_ANON_KEY_HERE";
  // ====================================================================================
  var API = "https://navaar-backend-production.up.railway.app";

  var PLANS = [
    { id: "free", name: "Free", price: 0, blurb: "Explore the studio and make first drafts.",
      items: ["Quick Poetry video maker", "Photo + lyrics videos (up to 12 photos, 8 MB each)", "All poetry and quote templates", "Projects saved in this browser"] },
    { id: "creator", name: "Creator", price: 12, best: true, blurb: "Regular video making with deeper creative control.",
      items: ["Everything in Free", "Projects saved to your account, on any device", "New templates as they are added"] },
    { id: "studio", name: "Studio", price: 24, blurb: "For teams who need consistent output.",
      items: ["Everything in Creator", "Use for team and client work", "Priority support"] }
  ];

  var css = ".pricing-sec{background:#f5f1e9;color:#0b0d12;border-block:0}" +
    ".pricing-sec .eyebrow{color:#596d10}.pricing-sec .section-copy{color:#5a5751}.pricing-sec .status.error{color:#a3322b}" +
    ".plans{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}" +
    ".plan{display:flex;flex-direction:column;background:#0b0d12;color:#f5f1e9;border:1px solid rgba(245,241,233,.17);border-radius:.75rem;padding:1.5rem}" +
    ".plan.best{border-color:#dcff71;box-shadow:0 0 0 1px #dcff71}" +
    ".plan h3{margin:0;font-family:Fraunces,serif;font-size:1.7rem;letter-spacing:-.04em;display:flex;justify-content:space-between;align-items:center;gap:.6rem}" +
    ".badge{font-family:'DM Sans',sans-serif;font-size:.68rem;font-weight:700;letter-spacing:0;background:#dcff71;color:#11140c;padding:.25rem .6rem;border-radius:.45rem}" +
    ".price{font-family:Fraunces,serif;font-size:2.8rem;margin:.9rem 0 .2rem;letter-spacing:-.06em}.price small{font-family:'DM Sans',sans-serif;font-size:.85rem;color:#a9a69e;letter-spacing:0}" +
    ".plan p{color:#a9a69e;line-height:1.6;margin:.2rem 0 1rem}" +
    ".plan ul{list-style:none;margin:0 0 1.4rem;padding:1rem 0 0;border-top:1px solid rgba(245,241,233,.17);display:grid;gap:.6rem;flex:1}" +
    ".plan li{display:flex;gap:.7rem;line-height:1.5;color:#e6e2da;font-size:.92rem}.plan li:before{content:'';flex:0 0 auto;width:8px;height:8px;margin-top:.5rem;border-radius:50%;background:#dcff71}" +
    ".plan .button{width:100%;border-radius:.45rem}.plan .button.primary{background:#dcff71;color:#11140c}.plan .button.primary:hover{background:#e7ffa1}" +
    ".plan .button.secondary{border-color:rgba(245,241,233,.17);color:#f5f1e9}.plan .button.secondary:hover{border-color:#dcff71;color:#dcff71}" +
    ".modal{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;padding:1rem;background:rgba(5,9,10,.8)}.modal.open{display:flex}" +
    ".modal-box{width:min(100%,400px);background:var(--panel);border:1px solid var(--line);border-radius:1rem;padding:1.4rem}" +
    ".tabs{display:flex;gap:.5rem;margin-bottom:1rem}.tabs .chip{flex:1}" +
    ".modal-x{float:right;background:none;border:0;color:var(--muted);font-size:1.4rem;cursor:pointer}" +
    "@media(max-width:780px){.plans{grid-template-columns:1fr}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // ---- Pricing section ----
  var cards = PLANS.map(function (p) {
    return '<article class="plan' + (p.best ? " best" : "") + '"><h3>' + p.name + (p.best ? '<span class="badge">Recommended</span>' : "") + '</h3>' +
      '<div class="price">$' + p.price + ' <small>/ month</small></div><p>' + p.blurb + '</p><ul>' +
      p.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + '</ul>' +
      '<button class="button ' + (p.best ? "primary" : "secondary") + '" type="button" data-plan="' + p.id + '">' + (p.id === "free" ? "Start free" : "Choose " + p.name) + '</button></article>';
  }).join("");
  var sec = document.createElement("section");
  sec.id = "pricing"; sec.className = "pricing-sec section";
  sec.innerHTML = '<div class="frame"><div class="section-head"><p class="eyebrow">Plans</p><h2 class="section-title">Pick the plan that fits your work.</h2>' +
    '<p class="section-copy">Start free. Upgrade when you need more. Cancel any time.</p></div><div class="plans">' + cards + '</div>' +
    '<p id="plan-status" class="status" role="status" aria-live="polite"></p></div>';
  var fb = document.getElementById("feedback");
  fb.parentNode.insertBefore(sec, fb);

  // ---- Sign in modal ----
  var modal = document.createElement("div");
  modal.className = "modal"; modal.id = "auth-modal";
  modal.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true" aria-label="Sign in"><button class="modal-x" type="button" id="auth-x" aria-label="Close">&times;</button>' +
    '<div class="tabs"><button class="chip active" type="button" data-mode="in">Sign in</button><button class="chip" type="button" data-mode="up">Sign up</button></div>' +
    '<form id="auth-form" novalidate><div class="field"><label for="auth-email">Email</label><input id="auth-email" type="email" autocomplete="email"></div>' +
    '<div class="field"><label for="auth-pass">Password</label><input id="auth-pass" type="password" autocomplete="current-password" minlength="6"></div>' +
    '<button class="button primary" type="submit" id="auth-submit" style="width:100%">Sign in</button><p id="auth-status" class="status" role="status" aria-live="polite"></p></form></div>';
  document.body.appendChild(modal);

  // ---- Header: Plans link + Sign in button ----
  document.querySelectorAll(".links,#mobile-nav").forEach(function (n) {
    var a = document.createElement("a"); a.href = "#pricing"; a.textContent = "Plans"; n.appendChild(a);
  });
  var authBtn = document.createElement("button");
  authBtn.id = "auth-btn"; authBtn.type = "button"; authBtn.className = "button secondary";
  authBtn.style.cssText = "min-height:38px;padding:.4rem .85rem"; authBtn.textContent = "Sign in";
  var mb = document.getElementById("menu-button");
  mb.parentNode.insertBefore(authBtn, mb);

  var $ = function (id) { return document.getElementById(id); };
  var mode = "in", sb = null, session = null;
  function msg(id, t, k) { var e = $(id); e.textContent = t; e.className = "status " + (k || ""); }
  function setMode(m) {
    mode = m;
    modal.querySelectorAll(".tabs .chip").forEach(function (c) { c.classList.toggle("active", c.dataset.mode === m); });
    $("auth-submit").textContent = m === "in" ? "Sign in" : "Create account";
    $("auth-pass").autocomplete = m === "in" ? "current-password" : "new-password";
    msg("auth-status", "");
  }
  function openModal(m, note) { setMode(m || "in"); modal.classList.add("open"); if (note) msg("auth-status", note); $("auth-email").focus(); }
  function closeModal() { modal.classList.remove("open"); }
  modal.querySelectorAll(".tabs .chip").forEach(function (c) { c.onclick = function () { setMode(c.dataset.mode); }; });
  $("auth-x").onclick = closeModal;
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  function configured() { return SUPABASE_URL.indexOf("PASTE_") !== 0 && SUPABASE_ANON_KEY.indexOf("PASTE_") !== 0; }

  $("auth-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!sb) return msg("auth-status", "Sign in is not set up yet.", "error");
    var email = $("auth-email").value.trim(), pass = $("auth-pass").value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return msg("auth-status", "Enter a valid email address.", "error");
    if (pass.length < 6) return msg("auth-status", "Password must be at least 6 characters.", "error");
    var btn = $("auth-submit"); btn.disabled = true; msg("auth-status", "Please wait…");
    try {
      var r = mode === "in" ? await sb.auth.signInWithPassword({ email: email, password: pass }) : await sb.auth.signUp({ email: email, password: pass });
      if (r.error) throw r.error;
      if (mode === "up" && !(r.data && r.data.session)) { msg("auth-status", "Check your email and confirm your account, then sign in.", "success"); setMode("in"); $("auth-status").textContent = "Check your email and confirm your account, then sign in."; $("auth-status").className = "status success"; }
      else { msg("auth-status", "Signed in.", "success"); location.href = "index.html"; }
    } catch (err) { msg("auth-status", err.message || "Something went wrong. Try again.", "error"); }
    finally { btn.disabled = false; }
  });

  authBtn.onclick = async function () {
    if (session && sb) { await sb.auth.signOut(); location.reload(); } else openModal("in");
  };

  // ---- Plans: choose / checkout ----
  async function buy(plan, btn) {
    if (!session) return openModal("in", "Sign in to choose a plan.");
    var label = btn.textContent; btn.disabled = true; btn.textContent = "Opening checkout…"; msg("plan-status", "");
    try {
      var r = await fetch(API + "/api/checkout", { method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ plan: plan, billing: "monthly" }) });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok || !d.url) throw new Error(d.error || "Could not start checkout.");
      location.href = d.url;
    } catch (err) { msg("plan-status", err.message, "error"); btn.disabled = false; btn.textContent = label; }
  }
  sec.querySelectorAll("[data-plan]").forEach(function (b) {
    b.onclick = function () {
      if (b.dataset.plan === "free") { document.getElementById("quick-poetry").scrollIntoView({ behavior: "smooth" }); return; }
      buy(b.dataset.plan, b);
    };
  });

  async function markCurrent() {
    try {
      var r = await fetch(API + "/api/subscription/" + session.user.id, { headers: { Authorization: "Bearer " + session.access_token } });
      var d = await r.json();
      var plan = d && d.status === "active" ? d.plan : "free";
      var b = sec.querySelector('[data-plan="' + plan + '"]');
      if (b) { b.textContent = "Your current plan"; b.disabled = true; }
    } catch (e) { /* plans still work without this */ }
  }

  // ---- Start: load Supabase, restore session ----
  function init() {
    if (!configured()) return;
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.onload = async function () {
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      var r = await sb.auth.getSession();
      session = r.data && r.data.session;
      if (session) { authBtn.textContent = "Sign out"; markCurrent(); }
      if (location.hash === "#signin" && !session) openModal("in");
    };
    document.head.appendChild(s);
  }
  init();
})();
