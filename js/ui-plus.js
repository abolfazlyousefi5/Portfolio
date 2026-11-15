/* ============================================================
   UI-PLUS  —  فاز ۱
   شامل: حالت روشن/تاریک · جستجوی سایت · سرویس‌های کمکی
   این فایل بعد از js/script.js و js/site-sync.js لود می‌شود.
   ============================================================ */
(function () {
  "use strict";

  /* ==========================================================
     ۱) حالت روشن / تاریک
     ========================================================== */
  var THEME_KEY = "site_theme";
  var root = document.documentElement;

  function readTheme() {
    try {
      var t = localStorage.getItem(THEME_KEY);
      if (t === "light" || t === "dark") return t;
    } catch (e) {}
    // پیش‌فرض همیشه تاریک است (هویت بصری سایت)
    return "dark";
  }

  function applyTheme(t, animate) {
    if (animate) {
      root.classList.add("theme-anim");
      window.setTimeout(function () { root.classList.remove("theme-anim"); }, 320);
    }
    root.setAttribute("data-theme", t);
    try {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", t === "light" ? "#F7F8FA" : "#181C23");
    } catch (e) {}
    document.querySelectorAll("#theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-label", t === "light" ? "تغییر به حالت تاریک" : "تغییر به حالت روشن");
      btn.setAttribute("title", t === "light" ? "حالت تاریک" : "حالت روشن");
      btn.setAttribute("aria-pressed", t === "light" ? "true" : "false");
    });
  }

  // اعمال فوری (قبل از رنگ‌آمیزی، برای جلوگیری از پرش رنگ)
  applyTheme(readTheme(), false);

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    applyTheme(next, true);
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#theme-toggle");
    if (b) { e.preventDefault(); toggleTheme(); }
  });

  /* ==========================================================
     ۲) جستجوی سایت
     ========================================================== */
  var DATA = { pages: [], items: [] };
  var SEARCH_OPEN = false;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function hl(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    try {
      var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      return safe.replace(re, "<mark>$1</mark>");
    } catch (e) { return safe; }
  }
  function norm(s) {
    return String(s || "").toLowerCase()
      .replace(/[يى]/g, "ی").replace(/ك/g, "ک")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .trim();
  }

  // صفحه‌های ثابت (همیشه در جستجو هستند)
  var STATIC_PAGES = [
    { t: "خانه", d: "صفحه‌ی اصلی سایت", u: "./", k: "خانه اصلی صفحه اول", i: "🏠" },
    { t: "درباره من", d: "درباره‌ی ابوالفضل یوسفی", u: "about.html", k: "درباره بیوگرافی معرفی", i: "👤" },
    { t: "پروژه‌ها", d: "همه‌ی پروژه‌ها", u: "projects.html", k: "پروژه کار نمونه portfolio", i: "💼" },
    { t: "بلاگ", d: "نوشته‌ها و مقاله‌ها", u: "blog.html", k: "بلاگ مقاله نوشته پست", i: "📝" },
    { t: "رزومه", d: "رزومه‌ی کامل", u: "resume.html", k: "رزومه cv resume رزومه‌ام", i: "📄" },
    { t: "تماس", d: "راه‌های ارتباطی", u: "./#contact", k: "تماس ارتباط ایمیل واتساپ شماره", i: "✉️" }
  ];

  function buildIndex() {
    DATA.pages = STATIC_PAGES.slice();
    DATA.items = [];

    fetch("data.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var s = d.settings || {};

        // پروژه‌ها
        (d.projects || []).forEach(function (p) {
          DATA.items.push({
            t: p.title || p.title_en || "پروژه",
            d: p.description || p.description_en || "",
            k: (p.title || "") + " " + (p.title_en || "") + " " + (p.description || "") + " " + (p.tags || []).join(" "),
            u: "projects.html#" + (p.id != null ? "p" + p.id : ""),
            i: "💼", g: "پروژه"
          });
        });

        // مهارت‌ها
        (d.skills || []).forEach(function (sk) {
          DATA.items.push({
            t: sk.name,
            d: "مهارت — " + (sk.level || 0) + "٪",
            k: sk.name,
            u: "index.html#skills",
            i: "⚡", g: "مهارت"
          });
        });

        // پست‌های بلاگ (اگر بعداً اضافه شود)
        (d.posts || []).forEach(function (po) {
          DATA.items.push({
            t: po.title || "پست",
            d: po.excerpt || "",
            k: (po.title || "") + " " + (po.excerpt || "") + " " + (po.tags || []).join(" "),
            u: "blog/" + (po.slug || "") + ".html",
            i: "📰", g: "بلاگ"
          });
        });

        if (SEARCH_OPEN) runSearch();
      })
      .catch(function () { /* اگر data.json نبود، فقط صفحه‌های ثابت */ });
  }

  function ensureModal() {
    if (document.getElementById("search-modal")) return;
    var wrap = document.createElement("div");
    wrap.id = "search-modal";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "جستجو در سایت");
    wrap.innerHTML =
      '<div id="search-box">' +
        '<div id="search-input-wrap">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
          '<input id="search-input" type="search" autocomplete="off" spellcheck="false" placeholder="جستجو در سایت… (پروژه، مهارت، پست)" />' +
          '<span id="search-esc">ESC</span>' +
        '</div>' +
        '<div id="search-results"></div>' +
        '<div id="search-foot">' +
          '<span><kbd>↑</kbd><kbd>↓</kbd> حرکت</span>' +
          '<span><kbd>Enter</kbd> رفتن</span>' +
          '<span><kbd>Esc</kbd> بستن</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    var modal = wrap;
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeSearch();
    });

    var input = document.getElementById("search-input");
    input.addEventListener("input", runSearch);
    input.addEventListener("keydown", function (e) {
      var items = Array.prototype.slice.call(document.querySelectorAll(".sr-item"));
      if (!items.length) {
        if (e.key === "Escape") closeSearch();
        return;
      }
      var idx = items.findIndex(function (n) { return n.classList.contains("active"); });
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (idx >= 0) items[idx].classList.remove("active");
        idx = (idx + 1) % items.length;
        items[idx].classList.add("active");
        items[idx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (idx >= 0) items[idx].classList.remove("active");
        idx = idx <= 0 ? items.length - 1 : idx - 1;
        items[idx].classList.add("active");
        items[idx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        var target = idx >= 0 ? items[idx] : items[0];
        if (target) { window.location.href = target.getAttribute("href"); }
      } else if (e.key === "Escape") {
        closeSearch();
      }
    });
  }

  function openSearch() {
    ensureModal();
    var m = document.getElementById("search-modal");
    m.classList.add("open");
    SEARCH_OPEN = true;
    document.body.style.overflow = "hidden";
    var i = document.getElementById("search-input");
    if (i) { i.value = ""; window.setTimeout(function () { i.focus(); }, 40); }
    runSearch();
  }

  function closeSearch() {
    var m = document.getElementById("search-modal");
    if (!m) return;
    m.classList.remove("open");
    SEARCH_OPEN = false;
    document.body.style.overflow = "";
  }
  window.__closeSearch = closeSearch;
  window.__openSearch = openSearch;

  function runSearch() {
    ensureModal();
    var q = norm((document.getElementById("search-input") || {}).value || "");
    var box = document.getElementById("search-results");
    if (!box) return;

    if (!q) {
      var rec = DATA.pages.slice(0, 5);
      var html =
        (DATA.items.length ? '<div class="sr-group">میان‌بُرها</div>' : "") +
        rec.map(function (p) {
          return '<a class="sr-item" href="' + esc(p.u) + '">' +
                   '<div class="sr-ic">' + p.i + '</div>' +
                   '<div class="sr-tx"><div class="sr-ti">' + esc(p.t) + '</div>' +
                   '<div class="sr-sb">' + esc(p.d) + '</div></div>' +
                 '</a>';
        }).join("");
      box.innerHTML = html;
      return;
    }

    var all = DATA.pages.map(function (p) { return { t: p.t, d: p.d, k: p.k || (p.t + " " + p.d), u: p.u, i: p.i, g: "صفحه" }; })
      .concat(DATA.items);

    var res = all.filter(function (x) {
      return norm(x.t + " " + x.d + " " + (x.k || "")).indexOf(q) !== -1;
    }).slice(0, 14);

    if (!res.length) {
      box.innerHTML = '<div class="sr-empty"><span class="big">🔍</span>چیزی پیدا نشد.<br/>کلمه‌ی دیگری امتحان کن.</div>';
      return;
    }

    // گروه‌بندی
    var groups = {};
    res.forEach(function (r) {
      var g = r.g || "نتیجه";
      (groups[g] = groups[g] || []).push(r);
    });

    var out = "";
    Object.keys(groups).forEach(function (g) {
      out += '<div class="sr-group">' + esc(g) + " (" + groups[g].length + ")</div>";
      groups[g].forEach(function (r) {
        out += '<a class="sr-item" href="' + esc(r.u) + '">' +
                 '<div class="sr-ic">' + (r.i || "•") + '</div>' +
                 '<div class="sr-tx">' +
                   '<div class="sr-ti">' + hl(r.t, q) + '</div>' +
                   '<div class="sr-sb">' + hl(String(r.d || "").slice(0, 90), q) + '</div>' +
                 '</div></a>';
      });
    });
    box.innerHTML = out;

    var first = box.querySelector(".sr-item");
    if (first) first.classList.add("active");
  }

  // میان‌بر: Ctrl/Cmd + K  یا  "/"
  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "textarea" || (e.target && e.target.isContentEditable);

    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      openSearch();
      return;
    }
    if (e.key === "/" && !typing && !SEARCH_OPEN) {
      e.preventDefault();
      openSearch();
      return;
    }
    if (e.key === "Escape" && SEARCH_OPEN) {
      closeSearch();
    }
  });

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#search-launch");
    if (b) { e.preventDefault(); openSearch(); }
  });

  /* ==========================================================
     ۲.۵) هم‌گام‌سازی شماره‌ی واتساپ با data.json
     ========================================================== */
  var DEF_WA = "989033647670"; // پیش‌فرض — اگر data.json در دسترس نبود

  function syncWhatsApp() {
    var btn = document.getElementById("whatsapp-btn");
    if (!btn) return;
    btn.setAttribute("href", "https://wa.me/" + DEF_WA);

    fetch("data.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var num = d && d.settings && d.settings.whatsapp;
        if (!num) return;
        num = String(num).replace(/[^0-9]/g, "").replace(/^0+/, "");
        if (num.length < 8) return;
        btn.setAttribute("href", "https://wa.me/" + num);
      })
      .catch(function () { /* پیش‌فرض می‌ماند */ });
  }

  /* ==========================================================
     ۲.۶) نگهبان PDF رزومه
     اگر resume.pdf در ریپو نباشد، دکمه‌های دانلود خودشان پنهان
     می‌شوند تا لینک شکسته (۴۰۴) به کاربر نشان ندهیم.
     ========================================================== */
  function guardPdfLinks() {
    var links = document.querySelectorAll('a[href="resume.pdf"]');
    if (!links.length) return;
    fetch("resume.pdf", { method: "HEAD", cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("missing");
      })
      .catch(function () {
        Array.prototype.forEach.call(links, function (a) {
          a.style.display = "none";
          a.setAttribute("aria-hidden", "true");
        });
      });
  }

  /* ==========================================================
     ۳) تاریخ شمسی (کمکی — برای بلاگ و شمارنده)
     ========================================================== */
  function toFa(n) {
    return String(n).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[+d]; });
  }
  function faDate(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d)) return "";
      var f = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" });
      return f.format(d);
    } catch (e) { return ""; }
  }
  window.__faDate = faDate;
  window.__toFa = toFa;

  /* ==========================================================
     ۴) راه‌اندازی
     ========================================================== */
  function boot() {
    applyTheme(root.getAttribute("data-theme") || readTheme(), false);
    syncWhatsApp();
    guardPdfLinks();
    buildIndex();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
