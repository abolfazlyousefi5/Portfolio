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

/* ============================================================
   فیکس چاپ رزومه (افزوده‌ی آخر)
   ------------------------------------------------------------
   مشکل: در «Microsoft Print to PDF» با گزینه‌ی Background graphics
   خاموش، مرورگر همه‌ی background-color ها را حذف می‌کند و صفحه
   سفید چاپ می‌شود.
   راه‌حل: پس‌زمینه را با عنصر <svg> می‌سازیم (عنصر چاپ می‌شود،
   نه background). فقط در resume.html فعال است.
   ============================================================ */
(function () {
  "use strict";

  function addPrintBackground() {
    var page = document.querySelector("#stage .page") || document.querySelector(".page");
    if (!page) return;
    if (page.querySelector(".paper-bg")) return;

    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "paper-bg");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("viewBox", "0 0 210 297");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block;pointer-events:none;";

    var r1 = document.createElementNS(NS, "rect");
    r1.setAttribute("x", "0");
    r1.setAttribute("y", "0");
    r1.setAttribute("width", "210");
    r1.setAttribute("height", "297");
    r1.setAttribute("fill", "#181C23");

    var r2 = document.createElementNS(NS, "rect");
    r2.setAttribute("x", "148");
    r2.setAttribute("y", "0");
    r2.setAttribute("width", "62");
    r2.setAttribute("height", "297");
    r2.setAttribute("fill", "#12161C");

    svg.appendChild(r1);
    svg.appendChild(r2);
    page.insertBefore(svg, page.firstChild);

    /* .page باید مرجع موقعیت SVG باشد — بدون دست‌زدن به display */
    if (getComputedStyle(page).position === "static") {
      page.style.position = "relative";
    }

    /* ستون‌ها فقط z-index بگیرند؛ اگر position:relative بدهیم،
       آیتم‌های grid می‌شوند و چیدمان رزومه به هم می‌ریزد */
    Array.prototype.forEach.call(page.children, function (el) {
      if (el.classList.contains("side") || el.classList.contains("main")) {
        if (getComputedStyle(el).zIndex === "auto") el.style.zIndex = "1";
      }
    });

    /* نام را وسط‌چین نگه می‌داریم (از قانون ستون‌بندی چاپ ارث می‌برد) */
    var head = page.querySelector(".head");
    if (head) {
      head.style.textAlign = "center";
      var h1 = head.querySelector("h1");
      if (h1) h1.style.textAlign = "center";
    }
  }

  /* قبل از چاپ: ارتفاع اینلاینی #stage را پاک کن.
     اسکریپت خود رزومه برای حالت اسکرین height=~1200px می‌گذارد و
     در چاپ پاکش نمی‌کند ⇒ مرورگر یک صفحه‌ی دوم خالی می‌سازد. */
  window.addEventListener("beforeprint", function () {
    var stage = document.getElementById("stage");
    var page = document.querySelector("#stage .page");
    if (stage) stage.style.height = "";
    if (page) page.style.transform = "";
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addPrintBackground);
  } else {
    addPrintBackground();
  }
})();
  /* ══════════════════════════════════════════════════════════
     بهبود جستجو — ۳ تغییر
     ──────────────────────────────────────────────────────────
     ۱) به‌جای «ESC» دکمه‌ی ✕ که با کلیک می‌بندد
     ۲) نوار پایین (↑↓ Enter Esc) حذف می‌شود
     ۳) بعد از کلیک روی نتیجه، همان محتوا در صفحه‌ی مقصد
        برجسته می‌شود: اسکرول + حلقه‌ی نارنجی + هایلایت کلمه
     ══════════════════════════════════════════════════════════ */
  (function () {
    "use strict";

    var KEY = "sr_target_v1";

    /* ---------- ۱) دکمه‌ی ✕ جای ESC ---------- */
    function swapCloseButton() {
      var wrap = document.getElementById("search-input-wrap");
      if (!wrap || document.getElementById("search-close")) return;

      var old = document.getElementById("search-esc");
      if (old) old.parentNode.removeChild(old);

      var btn = document.createElement("button");
      btn.id = "search-close";
      btn.type = "button";
      btn.setAttribute("aria-label", "بستن جستجو");
      btn.setAttribute("title", "بستن جستجو");
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
        'stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.__closeSearch) window.__closeSearch();
      });
      wrap.appendChild(btn);
    }

    /* ---------- ۲) حذف نوار پایین ---------- */
    function dropFootBar() {
      var f = document.getElementById("search-foot");
      if (f && f.parentNode) f.parentNode.removeChild(f);
    }

    /* ---------- ۳) بعد از کلیک: انتقال + برجسته‌سازی ---------- */

    // کلمه‌ی جستجو + آدرس مقصد را ذخیره می‌کنیم
    function rememberTarget(href) {
      var input = document.getElementById("search-input");
      var q = input ? String(input.value || "").trim() : "";
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ q: q, href: href, t: Date.now() }));
      } catch (e) { /* حالت خصوصی — مهم نیست */ }
    }

    // روی هر کلیک نتیجه، قبل از رفتن، کلمه را ذخیره کن
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest(".sr-item");
      if (!a) return;
      rememberTarget(a.getAttribute("href") || "");
    }, true);

    // Enter هم همان کار را بکند (که با حذف نوار پایین، کیبورد هم از کار نیفتد)
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      if (!document.getElementById("search-modal") ||
          !document.getElementById("search-modal").classList.contains("open")) return;
      var act = document.querySelector(".sr-item.active") || document.querySelector(".sr-item");
      if (act) rememberTarget(act.getAttribute("href") || "");
    }, true);

    /* ---------- اجرای برجسته‌سازی در صفحه‌ی مقصد ---------- */

    function faNorm(s) {
      return String(s == null ? "" : s).toLowerCase()
        .replace(/[\u064A\u0649]/g, "\u06CC").replace(/\u0643/g, "\u06A9")
        .replace(/[\u064B-\u065F\u0670]/g, "").trim();
    }

    function escapeRe(s) {
      return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // هایلایت کلمه داخل متن، بدون دست زدن به HTML
    function markIn(root, q) {
      if (!q || q.length < 2 || !root) return 0;
      var re;
      try { re = new RegExp("(" + escapeRe(q) + ")", "gi"); } catch (e) { return 0; }

      var n = 0;
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          var p = node.parentNode;
          if (!p) return NodeFilter.FILTER_REJECT;
          var tag = (p.tagName || "").toUpperCase();
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "MARK" || tag === "CODE" ||
              tag === "PRE" || tag === "TEXTAREA" || tag === "INPUT") return NodeFilter.FILTER_REJECT;
          if (p.closest && p.closest("#search-modal")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      var targets = [];
      while (walker.nextNode()) {
        // فقط جاهایی که واقعاً این کلمه را دارند
        if (faNorm(walker.currentNode.nodeValue).indexOf(faNorm(q)) !== -1) {
          targets.push(walker.currentNode);
        }
      }

      targets.forEach(function (node) {
        var text = node.nodeValue;
        var frag = document.createDocumentFragment();
        var last = 0, m;
        re.lastIndex = 0;
        var guard = 0;
        while ((m = re.exec(text)) !== null && guard++ < 60) {
          if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          var mk = document.createElement("mark");
          mk.className = "sr-hit";
          mk.textContent = m[0];
          frag.appendChild(mk);
          last = m.index + m[0].length;
          n++;
          if (m[0].length === 0) re.lastIndex++;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        if (node.parentNode) node.parentNode.replaceChild(frag, node);
      });

      return n;
    }

    function findCardFor(sel) {
      // sel می‌تواند "#p3" یا "#skills" یا خالی باشد
      if (!sel || sel === "#") return null;
      var id = sel.replace(/^#/, "");
      if (!id) return null;
      var el = document.getElementById(id);
      if (!el) return null;
      // اگر خودش کارت نیست، نزدیک‌ترین کارت یا بخش را برگردان
      return el;
    }

    function runHighlight() {
      var raw;
      try { raw = sessionStorage.getItem(KEY); } catch (e) { return; }
      if (!raw) return;

      var data;
      try { data = JSON.parse(raw); } catch (e) { return; }
      if (!data || !data.q) return;

      // فقط اگر خیلی قدیمی نیست (۲ دقیقه)
      if (Date.now() - (data.t || 0) > 120000) {
        try { sessionStorage.removeItem(KEY); } catch (e) {}
        return;
      }
      try { sessionStorage.removeItem(KEY); } catch (e) {}

      var q = data.q;

      function go() {
        var href = String(data.href || "");
        var hash = href.indexOf("#") !== -1 ? href.slice(href.indexOf("#")) : "";
        var el = hash ? findCardFor(hash) : null;

        // صفحه‌ی پست/رزومه: خودِ مقاله‌ی اصلی را برجسته کن
        if (!el) {
          el = document.querySelector("#post") ||
               document.querySelector("article#post") ||
               document.querySelector("main article") ||
               document.querySelector("#p-title");
          // عنوان را جدا می‌خواهیم نه خودش را — به والد کارت برو
          if (el && el.id === "p-title") el = el.closest("article") || el.parentElement;
        }

        // اگر کارت پیدا شد، بیا سرش
        if (el) {
          var top = el.getBoundingClientRect().top + window.pageYOffset - 110;
          try { window.scrollTo({ top: Math.max(0, top), behavior: "smooth" }); }
          catch (e) { window.scrollTo(0, Math.max(0, top)); }
          el.classList.add("sr-target");
          window.setTimeout(function () { el.classList.remove("sr-target"); }, 4200);
        }

        // هایلایت کلمه در ناحیه‌ی مقصد (یا کل صفحه اگر بخش مشخصی نبود)
        var scope = el || document.querySelector("main") || document.body;
        var n = markIn(scope, q);

        // اگر در آن بخش چیزی پیدا نشد، کل صفحه را بگرد
        if (!n && el) markIn(document.body, q);
      }

      // کارت‌ها با JS ساخته می‌شوند → کمی صبر می‌کنیم
      if (document.readyState === "complete") window.setTimeout(go, 550);
      else window.addEventListener("load", function () { window.setTimeout(go, 550); });
    }

    /* ---------- راه‌اندازی ---------- */
    var tries = 0;
    (function boot() {
      // مودال جستجو lazily ساخته می‌شود؛ تا ساخته نشده صبر می‌کنیم
      swapCloseButton();
      dropFootBar();
      if ((!document.getElementById("search-close") || !document.getElementById("search-foot")) && tries++ < 40) {
        window.setTimeout(boot, 150);
      }
    })();

    // هر بار مودال دوباره ساخته شد (مثلاً بعد از باز شدن)، دوباره اعمال کن
    document.addEventListener("click", function (e) {
      if (e.target.closest && (e.target.closest("#search-launch") || e.target.closest("#search-modal"))) {
        window.setTimeout(function () { swapCloseButton(); dropFootBar(); }, 0);
      }
    }, true);

    runHighlight();
  })();
/* Point English-page PDF buttons to the English PDF, not the Persian file. */
(function () {
  "use strict";

  function useEnglishResumePdf() {
    if ((document.documentElement.lang || "").toLowerCase().indexOf("en") !== 0) return;

    document.querySelectorAll('a[href="resume.pdf"]').forEach(function (link) {
      link.setAttribute("href", "en-resume.pdf");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", useEnglishResumePdf, { once: true });
  } else {
    useEnglishResumePdf();
  }
})();
