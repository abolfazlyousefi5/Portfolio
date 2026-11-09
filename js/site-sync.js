/* ============================================================
   site-sync.js — سایت استاتیک را از پنل ادمین Flask تغذیه می‌کند
   هر تغییری در abolfazlyousefi.pythonanywhere.com/admin بدهی،
   چند ثانیه بعد روی abolfazl-yousefi.is-a.dev دیده می‌شود.
   ============================================================ */
(function () {
  "use strict";

  var API = "https://Abolfazlyousefi.pythonanywhere.com";
  var CACHE_KEY = "site-data-v1";
  var CACHE_TTL = 5 * 60 * 1000;   // ۵ دقیقه
  var TIMEOUT = 12000;

  /* ---------- کش: اگر اینترنت قطع بود، آخرین نسخه نشان داده می‌شود ---------- */
  function readCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return o && o.data ? o : null;
    } catch (e) { return null; }
  }
  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data: data }));
    } catch (e) { /* حالت ناشناس — بی‌خیال */ }
  }

  function fetchJSON(path) {
    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT);
    return fetch(API + path, {
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      headers: { "Accept": "application/json", "X-Requested-With": "fetch" },
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).catch(function (e) { clearTimeout(timer); throw e; });
  }

  /* ---------- تعداد کاراکتر / نوار مهارت ---------- */
  function setText(sel, value) {
    if (!value) return;
    document.querySelectorAll(sel).forEach(function (el) {
      if (el.textContent.trim() !== String(value).trim()) el.textContent = value;
    });
  }
  function setHTML(sel, value) {
    if (!value) return;
    document.querySelectorAll(sel).forEach(function (el) { el.innerHTML = value; });
  }

  /* ---------- اعمال تنظیمات سایت ---------- */
  function applySite(s) {
    if (!s) return;

    if (s.site_title) document.title = s.site_title;

    var md = document.querySelector('meta[name="description"]');
    if (md && s.meta_description) md.setAttribute("content", s.meta_description);

    // نام در هدر
    setText("header > div", s.full_name);

    // عنوان اصلی (h1 در خانه)
    var h1 = document.querySelector("#home h1");
    if (h1 && s.headline) h1.textContent = s.headline;

    // جمله‌های افکت تایپ
    var typing = document.querySelector(".typing-effect");
    if (typing && s.typing_texts) {
      var lines = String(s.typing_texts).split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (lines.length) {
        typing.setAttribute("data-texts", JSON.stringify(lines));
        if (window.__typingRestart) window.__typingRestart(lines);
      }
    }

    // برچسب‌های زیر دکمه‌ها
    var techWrap = document.querySelector("#home .flex.space-x-6");
    if (techWrap && s.tech_line) {
      var tech = String(s.tech_line).split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
      if (tech.length) {
        techWrap.innerHTML = tech.map(function (t) { return "<span>" + t + "</span>"; }).join("");
      }
    }

    // متن درباره من
    var about = document.querySelector("#about p");
    if (about && s.about_text) about.textContent = s.about_text;

    // آمار
    var stats = document.querySelectorAll("#about .text-3xl, #about .stat-num");
    if (stats.length >= 2) {
      if (s.stat_projects) stats[0].textContent = s.stat_projects;
      if (s.stat_months) stats[1].textContent = s.stat_months;
    }

    // ایمیل / واتساپ / آدرس
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
      if (s.email) { a.setAttribute("href", "mailto:" + s.email); a.textContent = s.email; }
    });
    document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
      if (s.whatsapp) a.setAttribute("href", "https://wa.me/" + s.whatsapp);
    });

    // شبکه‌های اجتماعی
    var map = { instagram: "instagram.com", telegram: "t.me", linkedin: "linkedin.com", github: "github.com" };
    Object.keys(map).forEach(function (k) {
      if (!s[k]) return;
      document.querySelectorAll('a[href*="' + map[k] + '"]').forEach(function (a) {
        a.setAttribute("href", s[k]);
      });
    });
  }

  /* ---------- ساخت کارت‌های پروژه ---------- */
  function buildProjectCard(p) {
    var tags = (p.tags || []).map(function (t) {
      return '<span class="text-xs px-2 py-1 rounded bg-[#2C3340] text-[#8FA3C8]">' + t + "</span>";
    }).join("");

    var div = document.createElement("div");
    div.className = "bg-[#23262F] rounded-lg p-6 text-right flex flex-col";
    div.innerHTML =
      '<div class="w-12 h-12 rounded-xl bg-[#FF6A3D] flex items-center justify-center mb-4">' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>' +
      "</div>" +
      '<h3 class="text-lg font-semibold mb-2">' + p.title + "</h3>" +
      '<p class="text-sm text-[#9AA3B2] leading-relaxed flex-1 mb-4">' + (p.description || "") + "</p>" +
      '<div class="flex flex-wrap gap-2 mb-4">' + tags + "</div>" +
      (p.url ? '<a href="' + p.url + '" target="_blank" rel="noopener noreferrer" class="text-sm text-[#FF6A3D] hover:text-[#ff8a5c] transition-colors">لینک پروژه</a>' : "");
    return div;
  }

  function applyProjects(list) {
    if (!list || !list.length) return;
    var grid = document.querySelector("#projects .grid");
    if (!grid) return;
    // فقط اگر تعداد یا عنوان‌ها فرق داشت، بازسازی کن (تا انیمیشن‌ها نپرند)
    var current = grid.children.length;
    var firstTitle = grid.querySelector("h3, .font-semibold");
    var same = current === list.length &&
               firstTitle && firstTitle.textContent.trim() === String(list[0].title).trim();
    if (same) return;

    grid.innerHTML = "";
    list.forEach(function (p) { grid.appendChild(buildProjectCard(p)); });
  }

  /* ---------- نوارهای مهارت ---------- */
  function applySkills(list) {
    if (!list || !list.length) return;
    var wrap = document.querySelector(".skills-wrapper");
    if (!wrap) return;
    // جایگزینی مقادیر داخل نوارهای موجود (بر اساس نام)
    list.forEach(function (sk) {
      var rows = wrap.querySelectorAll("div");
      rows.forEach(function (row) {
        var nameEl = row.querySelector("span:first-child");
        if (!nameEl) return;
        if (nameEl.textContent.trim().toLowerCase() !== String(sk.name).trim().toLowerCase()) return;
        var pct = row.querySelector("span.text-\\[\\#FF6A3D\\], .skill-pct");
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
      // تازه است: فوری نشان بده، بعد در پس‌زمینه به‌روز کن
      applySite(cached.data.site);
      applyProjects(cached.data.projects);
      applySkills(cached.data.skills);
    }

    Promise.all([
      fetchJSON("/api/site").catch(function () { return null; }),
      fetchJSON("/api/projects").catch(function () { return null; }),
      fetchJSON("/api/skills").catch(function () { return null; })
    ]).then(function (res) {
      var site = res[0], projects = res[1], skills = res[2];
      if (!site && !projects && !skills) return;   // سرور خاموش — همان HTML ثابت می‌ماند
      if (site) applySite(site);
      if (projects) applyProjects(projects);
      if (skills) applySkills(skills);
      writeCache({ site: site, projects: projects, skills: skills });
    }).catch(function () { /* آفلاین — بی‌خیال */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 300); });
  } else {
    setTimeout(boot, 300);
  }
})();
