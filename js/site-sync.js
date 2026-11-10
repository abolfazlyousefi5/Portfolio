(function () {
  "use strict";

  var LANG = (document.documentElement.lang || "fa").slice(0, 2).toLowerCase();
  var IS_EN = LANG === "en";
  var STR = {
    viewProject: IS_EN ? "View project" : "لینک پروژه"
  };

  function pick(obj, faKey, enKey) {
    if (IS_EN) {
      var en = obj[enKey];
      if (en && String(en).trim()) return en;
      return obj[faKey];
    }
    return obj[faKey];
  }

  var CACHE_KEY = "site-data-v2";
  var CACHE_TTL = 30 * 1000;   // ۳۰ ثانیه

  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      var o = raw ? JSON.parse(raw) : null;
      return o && o.data ? o : null;
    } catch (e) { return null; }
  }
  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: data })); } catch (e) {}
  }

  function loadData() {
    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 10000);
    return fetch("data.json?t=" + Date.now(), {
      cache: "no-store",
      headers: { "Accept": "application/json" },
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).catch(function (e) { clearTimeout(timer); throw e; });
  }

  /* ---------- تنظیمات سایت ---------- */
  function applySite(s) {
    if (!s) return;

    if (s.site_title && !IS_EN) document.title = s.site_title;

    var md = document.querySelector('meta[name="description"]');
    if (md && s.meta_description && !IS_EN) md.setAttribute("content", s.meta_description);

    if (!IS_EN && s.full_name) {
      var nameEl = document.querySelector("header .site-name") ||
                   document.querySelector("header > div > div");
      if (nameEl) nameEl.textContent = s.full_name;
    }

    if (!IS_EN) {
      var h1 = document.querySelector("#home h1");
      var hl = pick(s, "headline", "headline_en");
      if (h1 && hl) h1.textContent = hl;
    }

    var typing = document.querySelector(".typing-effect");
    var typingSrc = pick(s, "typing_texts", "typing_texts_en");
    if (typing && typingSrc) {
      var lines = String(typingSrc).split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (lines.length) {
        var incoming = JSON.stringify(lines);
        if (typing.getAttribute("data-texts") !== incoming) {
          typing.setAttribute("data-texts", incoming);
          if (window.__typingRestart) window.__typingRestart(lines);
        }
      }
    }

    var techWrap = document.querySelector("#home .flex.space-x-6");
    if (techWrap && s.tech_line) {
      var tech = String(s.tech_line).split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      var want = tech.join("|");
      if (techWrap.getAttribute("data-sig") !== want) {
        techWrap.setAttribute("data-sig", want);
        techWrap.innerHTML = tech.map(function (t) { return "<span>" + t + "</span>"; }).join("");
      }
    }

    var about = document.querySelector("#about p");
    var ab = pick(s, "about_text", "about_text_en");
    if (about && ab && about.textContent.trim() !== String(ab).trim()) about.textContent = ab;

    function setStat(labelText, value) {
      if (!value) return;
      var labels = document.querySelectorAll("#about div, #about span, #about p");
      for (var i = 0; i < labels.length; i++) {
        var el = labels[i];
        if (el.children.length > 0) continue;
        if (el.textContent.trim().indexOf(labelText) === -1) continue;
        var num = el.previousElementSibling;
        if (!num) continue;
        var plus = num.querySelector("span");
        if (plus && num.firstChild && num.firstChild.nodeType === 3) num.firstChild.nodeValue = String(value);
        else num.textContent = value;
        return;
      }
    }
    setStat("Project", s.stat_projects);
    setStat("پروژه", s.stat_projects);
    setStat("Month", s.stat_months);
    setStat("ماه تجربه", s.stat_months);
    setStat("ماه", s.stat_months);

    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      if (s.email) { a.setAttribute("href", "mailto:" + s.email); a.textContent = s.email; }
    });
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
      if (s.whatsapp) a.setAttribute("href", "https://wa.me/" + s.whatsapp);
    });

    var map = { instagram: "instagram.com", telegram: "t.me", linkedin: "linkedin.com", github: "github.com" };
    Object.keys(map).forEach(function (k) {
      if (!s[k]) return;
      document.querySelectorAll('a[href*="' + map[k] + '"]').forEach(function (a) {
        if (a.getAttribute("href") !== s[k]) a.setAttribute("href", s[k]);
      });
    });
  }

  /* ---------- پروژه‌ها ---------- */
  var ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>';

  function cardTitle(p) { return pick(p, "title", "title_en") || ""; }
  function cardDesc(p)  { return pick(p, "description", "description_en") || ""; }

  function buildCard(p) {
    var d = document.createElement("div");
    d.className = "bg-[#23262F] rounded-lg p-6 text-right flex flex-col";
    d.innerHTML =
      '<div class="w-12 h-12 rounded-xl bg-[#FF6A3D] flex items-center justify-center mb-4">' + ICON_SVG + "</div>" +
      '<h3 class="text-lg font-bold mb-2"></h3>' +
      '<p class="text-[#7B7F86] text-sm leading-relaxed flex-1 mb-4"></p>' +
      '<div class="flex flex-wrap" style="gap:8px"></div>' +
      '<div class="card-link"></div>';
    d.querySelector("h3").textContent = cardTitle(p);
    d.querySelector("p").textContent = cardDesc(p);
    return d;
  }

  function fillCard(card, p) {
    var h3 = card.querySelector("h3");
    if (h3) h3.textContent = cardTitle(p);
    var par = card.querySelector("p");
    if (par) par.textContent = cardDesc(p);

    var tagBox = null, kids = card.children;
    for (var k = 0; k < kids.length; k++) {
      var el = kids[k];
      if (el.tagName !== "DIV") continue;
      if (!el.querySelector("span")) continue;
      if (el.querySelector("h3, p, a, svg")) continue;
      if (el.children.length && el.children[0].tagName !== "SPAN") continue;
      tagBox = el; break;
    }
    if (tagBox) {
      tagBox.className = "flex flex-wrap";
      tagBox.style.gap = "8px";
      var tags = p.tags || [];
      var sig = JSON.stringify(tags);
      if (tagBox.dataset.sig !== sig) {
        tagBox.dataset.sig = sig;
        tagBox.innerHTML = "";
        tags.forEach(function (t) {
          var sp = document.createElement("span");
          sp.className = "bg-[#FF6A3D] text-white px-2 py-1 rounded text-xs";
          sp.textContent = t;
          tagBox.appendChild(sp);
        });
      }
    }

    var a = card.querySelector('a[href]');
    if (p.url) {
      if (!a) {
        a = document.createElement("a");
        a.className = "text-sm text-[#FF6A3D] hover:opacity-80";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = STR.viewProject;
        card.appendChild(a);
      }
      if (a.getAttribute("href") !== p.url) a.setAttribute("href", p.url);
    } else if (a) {
      a.remove();
    }
  }

  var lastSig = null;
  function applyProjects(list) {
    if (!list) return;
    var grid = document.querySelector("#projects .grid");
    if (!grid) return;

    var sig = JSON.stringify(list.map(function (p) {
      return [cardTitle(p), cardDesc(p), p.url, (p.tags || []).join("|")];
    }));
    if (sig === lastSig) return;
    lastSig = sig;

    var n = list.length;
    while (grid.children.length > n) grid.removeChild(grid.lastElementChild);
    while (grid.children.length < n) grid.appendChild(buildCard(list[grid.children.length]));
    for (var j = 0; j < n; j++) fillCard(grid.children[j], list[j]);
  }

  /* ---------- مهارت‌ها ---------- */
  function applySkills(list) {
    if (!list || !list.length) return;
    var wrap = document.querySelector(".skills-wrapper");
    if (!wrap) return;
    list.forEach(function (sk) {
      var name = String(sk.name || "").trim().toLowerCase();
      if (!name) return;
      wrap.querySelectorAll("div").forEach(function (row) {
        var nameEl = row.querySelector("span:first-child");
        if (!nameEl) return;
        if (nameEl.textContent.trim().toLowerCase() !== name) return;
        var pct = row.querySelector(".skill-pct");
        if (!pct) {
          var spans = row.querySelectorAll("span");
          for (var i = 0; i < spans.length; i++) {
            if (/^\d+\s*%$/.test(spans[i].textContent.trim())) { pct = spans[i]; break; }
          }
        }
        if (pct) pct.textContent = sk.level + "%";
        var fill = row.querySelector(".skill-bar-fill, i, .bar");
        if (fill) fill.style.width = sk.level + "%";
      });
    });
  }

  /* ---------- اجرا ---------- */
  function boot() {
    var cached = readCache();
    if (cached && Date.now() - cached.t < CACHE_TTL) {
      applySite(cached.data.settings);
      applyProjects(cached.data.projects);
      applySkills(cached.data.skills);
    }
    loadData().then(function (d) {
      if (!d) return;
      applySite(d.settings);
      applyProjects(d.projects);
      applySkills(d.skills);
      writeCache(d);
    }).catch(function () { /* آفلاین — HTML ثابت می‌ماند */ });
  }

  var lastBoot = 0;
  function maybeReboot() {
    var now = Date.now();
    if (now - lastBoot < 20000) return;
    lastBoot = now;
    boot();
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") maybeReboot();
  });
  window.addEventListener("focus", maybeReboot);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 250); });
  } else {
    setTimeout(boot, 250);
  }
})();
