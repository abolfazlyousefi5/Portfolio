/* ============================================================
   site-sync.js — سایت استاتیک را از پنل ادمین Flask تغذیه می‌کند
   هر تغییری در abolfazlyousefi.pythonanywhere.com/admin بدهی،
   چند ثانیه بعد روی abolfazl-yousefi.is-a.dev دیده می‌شود.
   ============================================================ */
(function () {
  "use strict";

  var API = "https://Abolfazlyousefi.pythonanywhere.com";
  // اگر در صفحه‌ی انگلیسی هستیم، متن‌های ثابت را انگلیسی می‌نویسیم
  var LANG = (document.documentElement.lang || "fa").slice(0, 2).toLowerCase();
  var IS_EN = LANG === "en";
  var STR = {
    viewProject: IS_EN ? "View project" : "لینک پروژه",
    projects:    IS_EN ? "Projects"      : "پروژه‌ها",
    completed:   IS_EN ? "Completed projects" : "پروژه تکمیل‌شده",
    months:      IS_EN ? "Months of experience" : "ماه تجربه"
  };
  var CACHE_KEY = "site-data-v1";
  var CACHE_TTL = 60 * 1000;        // ۱ دقیقه
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
    var sep = path.indexOf("?") === -1 ? "?" : "&";
    return fetch(API + path + sep + "_t=" + Date.now(), {
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

    if (s.site_title && !IS_EN) document.title = s.site_title;

    var md = document.querySelector('meta[name="description"]');
    if (md && s.meta_description && !IS_EN) md.setAttribute("content", s.meta_description);

    // نام در هدر — فقط فارسی (نسخه انگلیسی نام لاتین دارد)
    // ⚠️ مهم: نباید کل wrapper را بازنویسی کند، وگرنه لینک EN پاک می‌شود
    if (!IS_EN && s.full_name) {
      var nameEl = document.querySelector("header .site-name") ||
                   document.querySelector("header > div > div");
      if (nameEl) nameEl.textContent = s.full_name;
    }

    // عنوان اصلی (h1 در خانه)
    if (!IS_EN) {
      var h1 = document.querySelector("#home h1");
      if (h1 && s.headline) h1.textContent = s.headline;
    }

    // جمله‌های افکت تایپ — فقط اگر واقعاً عوض شده باشند
    var typing = document.querySelector(".typing-effect");
    if (typing && s.typing_texts && !IS_EN) {
      var lines = String(s.typing_texts).split("\n")
        .map(function (x) { return x.trim(); })
        .filter(Boolean);
      if (lines.length) {
        var current = typing.getAttribute("data-texts");
        var incoming = JSON.stringify(lines);
        if (current !== incoming) {
          typing.setAttribute("data-texts", incoming);
          if (window.__typingRestart) window.__typingRestart(lines);
        }
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
    if (!IS_EN) {
      var about = document.querySelector("#about p");
      if (about && s.about_text) about.textContent = s.about_text;
    }

    // آمار — بر اساس برچسب کنارش پیدا می‌شود (به کلاس وابسته نیست)
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
        if (plus) {
          num.firstChild.nodeValue = String(value);
        } else {
          num.textContent = value;
        }
        return;
      }
    }
    setStat("پروژه", s.stat_projects);
    setStat("Project", s.stat_projects);
    setStat("ماه تجربه", s.stat_months);
    setStat("ماه", s.stat_months);
    setStat("Month", s.stat_months);

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

  /* ---------- به‌روزرسانی کارت‌های پروژه (بدون بازسازی) ---------- */
  var ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-6 h-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>';

  function buildCard(p) {
    var d = document.createElement("div");
    d.className = "bg-[#23262F] rounded-lg p-6 text-right flex flex-col";
    d.innerHTML =
      '<div class="w-12 h-12 rounded-xl bg-[#FF6A3D] flex items-center justify-center mb-4">' + ICON_SVG + "</div>" +
      '<h3 class="text-lg font-bold mb-2"></h3>' +
      '<p class="text-[#7B7F86] text-sm leading-relaxed flex-1 mb-4"></p>' +
      '<div class="flex flex-wrap" style="gap:8px"></div>' +
      '<div class="card-link"></div>';
    d.querySelector("h3").textContent = p.title || "";
    d.querySelector("p").textContent = p.description || "";
    return d;
  }

  function fillCard(card, p) {
    var h3 = card.querySelector("h3");
    if (h3) h3.textContent = p.title || "";

    var par = card.querySelector("p");
    if (par) par.textContent = p.description || "";

    // تگ‌ها — کانتینر تگ‌ها: div فرزندِ مستقیم کارت که فقط span دارد
    var tagBox = null;
    var kids = card.children;
    for (var k = 0; k < kids.length; k++) {
      var el = kids[k];
      if (el.tagName !== "DIV") continue;
      if (!el.querySelector("span")) continue;
      if (el.querySelector("h3, p, a")) continue;
      if (el.querySelector("svg")) continue;
      if (el.children.length && el.children[0].tagName !== "SPAN") continue;
      tagBox = el; break;
    }
    if (tagBox) {
      tagBox.className = "flex flex-wrap";   // تا تگ‌ها بیرون نزنند
      tagBox.style.gap = "8px";              // همان فاصله‌ی space-x-2 قبلی
    }
    if (tagBox && p.tags && p.tags.length) {
      var sig = JSON.stringify(p.tags);
      if (tagBox.dataset.sig !== sig) {
        tagBox.dataset.sig = sig;
        tagBox.innerHTML = "";
        p.tags.forEach(function (t) {
          var sp = document.createElement("span");
          sp.className = "bg-[#FF6A3D] text-white px-2 py-1 rounded text-xs";
          sp.textContent = t;
          tagBox.appendChild(sp);
        });
      }
    }

    // لینک پروژه
    if (p.url) {
      var a = card.querySelector('a[href]');
      if (!a) {
        a = document.createElement("a");
        a.className = "text-sm text-[#FF6A3D] hover:opacity-80";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = STR.viewProject;
        card.appendChild(a);
      }
      if (a.getAttribute("href") !== p.url) a.setAttribute("href", p.url);
    }
  }

  var lastSig = null;
  function applyProjects(list) {
    if (!list) return;
    var grid = document.querySelector("#projects .grid");
    if (!grid) return;

    var sig = JSON.stringify(list.map(function (p) {
      return [p.title, p.description, p.url, (p.tags || []).join("|")];
    }));
    if (sig === lastSig) return;         // هیچ تغییری نبود
    lastSig = sig;

    var cards = grid.children;
    var n = list.length;

    // تعداد را تنظیم کن
    if (cards.length > n) {
      for (var i = cards.length - 1; i >= n; i--) grid.removeChild(cards[i]);
    }
    while (grid.children.length < n) {
      grid.appendChild(buildCard(list[grid.children.length]));
    }

    // محتوای هر کارت را به‌روز کن
    for (var j = 0; j < n; j++) fillCard(grid.children[j], list[j]);
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

  // وقتی کاربر از تب ادمین برمی‌گردد، دوباره بخوان (حداکثر هر ۳۰ ثانیه یک‌بار)
  var lastBoot = 0;
  function maybeReboot() {
    var now = Date.now();
    if (now - lastBoot < 30000) return;
    lastBoot = now;
    boot();
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") maybeReboot();
  });
  window.addEventListener("focus", maybeReboot);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 300); });
  } else {
    setTimeout(boot, 300);
  }
})();
