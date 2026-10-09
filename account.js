/* Navaar Studio (studio.html): login guard, stylish name, sign out. No plans/payments. */
(function () {
  var has = false;
  try { for (var i = 0; i < localStorage.length; i++) if (/^sb-.*-auth-token$/.test(localStorage.key(i))) has = true; } catch (e) {}
  if (!has) { location.replace("index.html"); return; }

  var st = document.createElement("style");
  st.textContent =
    ".brand{font-family:Fraunces,serif!important;font-style:italic;font-size:1.6rem!important;letter-spacing:-.02em;background:linear-gradient(120deg,#8fe6cc,#d8b674);-webkit-background-clip:text;background-clip:text;color:transparent!important}" +
    ".brand b{color:#d8b674!important;-webkit-text-fill-color:#d8b674}" +
    ".links{display:none!important}.menu{display:inline-flex!important}.mobile{padding:.8rem 0 1.1rem}.mobile.open{gap:.9rem}.mobile a{font-size:.95rem}";
  document.head.appendChild(st);

  var mb = document.getElementById("menu-button"), mnav = document.getElementById("mobile-nav");
  mnav.innerHTML =
    '<a href="studio.html">Studio</a><a href="editor.html">Editor</a><a href="tools.html">Tools</a>' +
    '<a href="#quick-poetry">Quick poetry</a><a href="#photo-lyrics">Photo + lyrics</a><a href="#templates">Templates</a>' +
    '<a href="#projects">Projects</a><a href="#feedback">Feedback</a>' +
    '<a href="#" id="signout-link" style="color:#ffaaa4;font-weight:700">Sign out</a>';
  function closeMenu() { mnav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); }
  mnav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  function clearAndLeave() {
    try { Object.keys(localStorage).forEach(function (k) { if (/^sb-.*-auth-token$/.test(k)) localStorage.removeItem(k); }); } catch (e) {}
    location.href = "index.html";
  }
  document.getElementById("signout-link").onclick = function (e) {
    e.preventDefault();
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    s.onload = function () {
      try {
        var sb = window.supabase.createClient("https://zcungofmmaagqcinafhb.supabase.co", "sb_publishable_7ydxbZOzF0v2X58P7Pk_jg_za4pBQ3s");
        sb.auth.signOut().then(clearAndLeave, clearAndLeave);
      } catch (x) { clearAndLeave(); }
    };
    s.onerror = clearAndLeave;
    document.head.appendChild(s);
  };
})();
