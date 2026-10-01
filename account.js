/* Navaar Studio: plans + sign in + checkout.
   Add this line to studio.html just before </body>:
   <script src="account.js" defer></script> */
(function () {
  // ====== PASTE YOUR TWO VALUES HERE (public values only, never the service key) ======
  var SUPABASE_URL = "https://zcungofmmaagqcinafhb.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdW5nb2ZtbWFhZ3FjaW5hZmhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MzQ3OTksImV4cCI6MjEwNjExMDc5OX0.I0tfr6qLUr8Uzw2saJBzhAIvOwMkSM5PX0XWt1MBJcQ";
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
    ".modal-box{max-height:92vh;overflow:auto;width:min(100%,400px);background:var(--panel);border:1px solid var(--line);border-radius:1rem;padding:1.4rem}" +
    ".tabs{display:flex;gap:.5rem;margin-bottom:1rem}.tabs .chip{flex:1}" +
    "#auth-modal input[type=password]{width:100%;color:var(--paper);background:rgba(255,255,255,.04);border:1px solid rgba(214,239,230,.24);border-radius:.55rem;padding:.75rem}" +
    ".modal-x{float:right;background:none;border:0;color:var(--muted);font-size:1.4rem;cursor:pointer}" +
    ".links{display:none!important}.menu{display:inline-flex!important}.mobile{padding:.8rem 0 1.1rem}.mobile.open{gap:.9rem}.mobile a{font-size:.95rem}" +
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
    '<div class="tabs" id="auth-tabs"><button class="chip active" type="button" data-mode="in">Sign in</button><button class="chip" type="button" data-mode="up">Sign up</button></div>' +
    '<div id="auth-social"><button class="button secondary" type="button" id="auth-google" style="width:100%;margin-bottom:.9rem">Continue with Google</button><p class="field-help" style="text-align:center;margin:0 0 .9rem">or use your email</p></div>' +
    '<form id="auth-form" novalidate>' +
    '<div class="field" id="auth-name-wrap" style="display:none"><label for="auth-name">Your name</label><input id="auth-name" type="text" autocomplete="name"></div>' +
    '<div class="field" id="auth-email-wrap"><label for="auth-email">Email</label><input id="auth-email" type="email" autocomplete="email"></div>' +
    '<div class="field"><label for="auth-pass">Password</label><input id="auth-pass" type="password" autocomplete="current-password"></div>' +
    '<div class="field" id="auth-pass2-wrap" style="display:none"><label for="auth-pass2">Confirm password</label><input id="auth-pass2" type="password" autocomplete="new-password"></div>' +
    '<label class="field-help" style="display:flex;gap:.5rem;align-items:center;margin-bottom:.8rem"><input type="checkbox" id="auth-show"> Show password</label>' +
    '<label id="auth-terms-wrap" class="field-help" style="display:none;gap:.5rem;align-items:flex-start;margin-bottom:.8rem"><input type="checkbox" id="auth-terms" style="margin-top:.2rem"><span>I agree to the <a href="privacy.html" target="_blank" style="color:var(--mint)">Privacy Policy</a>.</span></label>' +
    '<button class="button primary" type="submit" id="auth-submit" style="width:100%">Sign in</button>' +
    '<p style="text-align:center;margin:.8rem 0 0"><a href="#" id="auth-forgot" style="color:var(--mint);font-size:.82rem">Forgot password?</a></p>' +
    '<p id="auth-status" class="status" role="status" aria-live="polite"></p></form></div>';
  document.body.appendChild(modal);

  // ---- Header: one menu for everything ----
  var mb = document.getElementById("menu-button"), mnav = document.getElementById("mobile-nav");
  mnav.innerHTML = '<a href="index.html">Home</a><a href="editor.html">Editor</a><a href="all-tools.html">Tools</a><a href="#quick-poetry">Quick poetry</a><a href="#photo-lyrics">Photo + lyrics</a><a href="#templates">Templates</a><a href="#projects">Projects</a><a href="#pricing">Plans</a><a href="#feedback">Feedback</a><a href="#" id="auth-link" style="color:#79d9bd;font-weight:700">Sign in / Sign up</a>';
  function closeMenu() { mnav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); }
  mnav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  var authBtn = document.getElementById("auth-link");

  var $ = function (id) { return document.getElementById(id); };
  var mode = "in", sb = null, session = null;
  function msg(id, t, k) { var e = $(id); e.textContent = t; e.className = "status " + (k || ""); }
  function setMode(m) {
    mode = m;
    modal.querySelectorAll(".tabs .chip").forEach(function (c) { c.classList.toggle("active", c.dataset.mode === m); });
    var up = m === "up", rs = m === "reset", show = function (id, on, d) { $(id).style.display = on ? (d || "") : "none"; };
    $("auth-submit").textContent = rs ? "Save new password" : up ? "Create account" : "Sign in";
    show("auth-name-wrap", up); show("auth-pass2-wrap", up || rs); show("auth-terms-wrap", up, "flex");
    show("auth-email-wrap", !rs); show("auth-tabs", !rs, "flex"); show("auth-social", !rs); show("auth-forgot", m === "in");
    $("auth-pass").autocomplete = m === "in" ? "current-password" : "new-password";
    msg("auth-status", "");
  }
  function openModal(m, note) { setMode(m || "in"); modal.classList.add("open"); if (note) msg("auth-status", note); $("auth-email").focus(); }
  function closeModal() { modal.classList.remove("open"); }
  modal.querySelectorAll(".tabs .chip").forEach(function (c) { c.onclick = function () { setMode(c.dataset.mode); }; });
  $("auth-x").onclick = closeModal;
  $("auth-google").onclick = async function () {
    if (!sb) return msg("auth-status", "Sign in is not set up yet.", "error");
    try { sessionStorage.setItem("navaar_oauth", "1"); } catch (e) {}
    var r = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.href.split("#")[0].split("?")[0] } });
    if (r.error) msg("auth-status", r.error.message, "error");
  };
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

  function configured() { return SUPABASE_URL.indexOf("PASTE_") !== 0 && SUPABASE_ANON_KEY.indexOf("PASTE_") !== 0; }

  $("auth-show").onchange = function () { var t = this.checked ? "text" : "password"; $("auth-pass").type = t; $("auth-pass2").type = t; };
  $("auth-forgot").onclick = async function (e) {
    e.preventDefault();
    var email = $("auth-email").value.trim();
    if (!sb) return msg("auth-status", "Sign in is not set up yet.", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return msg("auth-status", "Enter your email above, then tap Forgot password.", "error");
    var r = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split("#")[0].split("?")[0] });
    if (r.error) msg("auth-status", r.error.message, "error"); else msg("auth-status", "Password reset link sent. Check your email.", "success");
  };
  $("auth-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!sb) return msg("auth-status", "Sign in is not set up yet.", "error");
    var email = $("auth-email").value.trim(), pass = $("auth-pass").value;
    if (mode !== "reset" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return msg("auth-status", "Enter a valid email address.", "error");
    if (pass.length < 6) return msg("auth-status", "Password must be at least 6 characters.", "error");
    if (mode !== "in" && pass !== $("auth-pass2").value) return msg("auth-status", "Passwords do not match.", "error");
    if (mode === "up") {
      if ($("auth-name").value.trim().length < 2) return msg("auth-status", "Enter your name.", "error");
      if (!$("auth-terms").checked) return msg("auth-status", "Please agree to the Privacy Policy.", "error");
    }
    var btn = $("auth-submit"); btn.disabled = true; msg("auth-status", "Please wait…");
    try {
      if (mode === "reset") {
        var u = await sb.auth.updateUser({ password: pass });
        if (u.error) throw u.error;
        msg("auth-status", "Password updated.", "success"); setTimeout(function () { location.href = "index.html"; }, 800); return;
      }
      var r = mode === "in" ? await sb.auth.signInWithPassword({ email: email, password: pass }) : await sb.auth.signUp({ email: email, password: pass, options: { data: { full_name: $("auth-name").value.trim() } } });
      if (r.error) throw r.error;
      if (mode === "up" && !(r.data && r.data.session)) { setMode("in"); msg("auth-status", "Check your email and confirm your account, then sign in.", "success"); }
      else { msg("auth-status", "Signed in.", "success"); location.href = "index.html"; }
    } catch (err) { msg("auth-status", err.message || "Something went wrong. Try again.", "error"); }
    finally { btn.disabled = false; }
  });

  authBtn.onclick = async function (e) {
    e.preventDefault();
    if (session && sb) { await sb.auth.signOut(); location.href = "index.html"; } else openModal("in");
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
      sb.auth.onAuthStateChange(function (ev) { if (ev === "PASSWORD_RECOVERY") openModal("reset", "Enter your new password."); });
      var r = await sb.auth.getSession();
      session = r.data && r.data.session;
      if (session) {
        authBtn.textContent = "Sign out"; markCurrent();
        var fromGoogle = false;
        try { fromGoogle = sessionStorage.getItem("navaar_oauth") === "1"; sessionStorage.removeItem("navaar_oauth"); } catch (e) {}
        if (fromGoogle) { location.href = "index.html"; return; }
      }
      if (location.hash === "#signin" && !session) openModal("in");
    };
    document.head.appendChild(s);
  }
  init();
})();
