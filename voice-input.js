/* Voice typing: tap the mic, speak, and the text appears in the box (Urdu, English, Hindi). */
(function () {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var IDS = ["poetry-text", "lyrics-input", "textInput", "lyricsInput"];
  var LANGS = [["ur-PK", "اردو Urdu"], ["en-US", "English"], ["hi-IN", "हिन्दी Hindi"]];
  var cur = null;

  function add(ta) {
    var bar = document.createElement("div");
    bar.style.cssText = "display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0 10px";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.style.cssText = "min-height:44px;padding:0 16px;border-radius:999px;border:1px solid #79d9bd;background:#79d9bd;color:#082018;font:700 14px system-ui,sans-serif;cursor:pointer;width:auto";
    btn.textContent = "🎤 Speak";
    var sel = document.createElement("select");
    sel.style.cssText = "width:auto;min-height:44px;padding:0 10px;border-radius:10px;font-size:14px";
    LANGS.forEach(function (l) { var o = document.createElement("option"); o.value = l[0]; o.textContent = l[1]; sel.appendChild(o); });
    try { sel.value = localStorage.getItem("nv-voice-lang") || "ur-PK"; } catch (e) {}
    var msg = document.createElement("span");
    msg.style.cssText = "font-size:12.5px;color:#9ab0aa";
    bar.append(btn, sel, msg);
    ta.parentNode.insertBefore(bar, ta.nextSibling);

    if (!SR) { btn.disabled = true; btn.style.opacity = ".5"; msg.textContent = "Voice typing needs Chrome."; return; }

    var rec = null, base = "";
    function reset() { btn.textContent = "🎤 Speak"; btn.style.background = "#79d9bd"; rec = null; if (cur === stop) cur = null; }
    function stop() { if (rec) try { rec.stop(); } catch (e) {} }
    sel.onchange = function () { try { localStorage.setItem("nv-voice-lang", sel.value); } catch (e) {} };

    btn.onclick = function () {
      if (rec) { stop(); return; }
      if (cur) cur();
      rec = new SR();
      rec.lang = sel.value; rec.continuous = true; rec.interimResults = true;
      base = ta.value ? ta.value.replace(/\s+$/, "") + "\n" : "";
      rec.onresult = function (e) {
        var t = Array.prototype.map.call(e.results, function (r) { return r[0].transcript; }).join(" ").trim();
        var v = base + t;
        if (ta.maxLength > 0) v = v.slice(0, ta.maxLength);
        ta.value = v;
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      };
      rec.onerror = function (e) {
        msg.textContent = e.error === "not-allowed" ? "Allow microphone permission and try again." : e.error === "no-speech" ? "No voice heard. Try again." : "Voice error: " + e.error;
      };
      rec.onend = function () { reset(); if (!msg.textContent.match(/Allow|error|No voice/)) msg.textContent = ""; };
      msg.textContent = "Listening… speak now";
      btn.textContent = "■ Stop"; btn.style.background = "#ffaaa4";
      cur = stop;
      try { rec.start(); } catch (e) { reset(); }
    };
  }

  function init() { IDS.forEach(function (id) { var ta = document.getElementById(id); if (ta) add(ta); }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
