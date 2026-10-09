/* Start page (index.html): signed-in users go to studio.html; Sign in/Sign up open auth.html; payments hidden. */
(function () {
  var has = false;
  try { for (var i = 0; i < localStorage.length; i++) if (/^sb-.*-auth-token$/.test(localStorage.key(i))) has = true; } catch (e) {}
  var q = new URLSearchParams(location.search).get("auth");
  if (q) { location.replace("auth.html?mode=" + (q === "signup" ? "signup" : "in")); return; }
  if (has) { location.replace("studio.html"); return; }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("#openLoginBtn,#openSignupBtn");
    if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    location.href = "auth.html?mode=" + (b.id === "openSignupBtn" ? "signup" : "in");
  }, true);

  var p = document.getElementById("pricing"); if (p) p.remove();
  document.querySelectorAll('a[href="#pricing"]').forEach(function (a) { (a.closest("li") || a).remove(); });
})();
