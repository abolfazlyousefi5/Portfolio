var __typingTimer = null;      // تایمر حلقه‌ی فعلی — تا بتوانیم لغو کنیم
var __typingSignature = null;  // امضای متن‌ها — برای اینکه بی‌دلیل ری‌استارت نشود

function createTypingEffect(element, texts, speed) {
  speed = speed || 110;

  // ✅ هر بار که دوباره صدا زده شد، حلقه‌ی قبلی را بکش
  if (__typingTimer) { clearTimeout(__typingTimer); __typingTimer = null; }

  var textIndex = 0;
  var charIndex = 0;
  var isDeleting = false;

  function type() {
    var currentText = texts[textIndex] || "";
    var next;

    if (isDeleting) {
      charIndex--;
      next = currentText.substring(0, Math.max(charIndex, 0));
    } else {
      charIndex++;
      next = currentText.substring(0, charIndex);
    }

    // فقط اگر عوض شده، بنویس (جلوگیری از پرش)
    if (element.textContent !== next) element.textContent = next;

    var delay = isDeleting ? speed / 2 : speed;

    if (!isDeleting && charIndex >= currentText.length) {
      delay = 2200;                       // توقف روی جمله‌ی کامل
      isDeleting = true;
    } else if (isDeleting && charIndex <= 0) {
      isDeleting = false;
      charIndex = 0;
      textIndex = (textIndex + 1) % texts.length;
      delay = 450;
    }

    __typingTimer = setTimeout(type, delay);
  }

  element.textContent = "";
  __typingTimer = setTimeout(type, 250);
}

document.addEventListener("DOMContentLoaded", function () {
  // جمله‌ها از بک‌اند (پنل ادمین) در data-texts می‌آیند
  const typingElement = document.querySelector(".typing-effect");
  if (typingElement) {
    let texts = [];
    try {
      texts = JSON.parse(typingElement.dataset.texts || "[]");
    } catch (e) {
      texts = [];
    }
    if (texts.length) {
      __typingSignature = JSON.stringify(texts);
      createTypingEffect(typingElement, texts, 150);
    }

    // امکان راه‌اندازی دوباره وقتی site-sync.js جمله‌ها را عوض می‌کند
    window.__typingRestart = function (newTexts) {
      if (!newTexts || !newTexts.length) return;
      var sig = JSON.stringify(newTexts);
      // ✅ اگر متن‌ها همان قبلی هستند، هیچ کاری نکن (باگ اصلی همین بود)
      if (sig === __typingSignature) return;
      __typingSignature = sig;
      createTypingEffect(typingElement, newTexts, 150);
    };
  }

  // منوی همبرگری موبایل
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
      mobileMenuButton.classList.toggle("active");
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        mobileMenuButton.classList.remove("active");
      });
    });
  }

  // دکمه‌ی برگشت به بالا — نسخه‌ی درست برای موبایل و دسکتاپ
  const scrollBtn = document.getElementById("scrollToTop");
  if (scrollBtn) {
    const SHOW_AFTER = 320;
    let visible = false, ticking = false, animId = null;

    function syncBtn() {
      const show = window.scrollY > SHOW_AFTER;
      if (show !== visible) {
        visible = show;
        scrollBtn.classList.toggle("is-visible", show);
        scrollBtn.setAttribute("aria-hidden", show ? "false" : "true");
        scrollBtn.tabIndex = show ? 0 : -1;
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(syncBtn); }
    }, { passive: true });
    syncBtn();

    function goTop() {
      if (animId) cancelAnimationFrame(animId);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = window.scrollY || 0;
      if (start <= 0) return;
      document.documentElement.classList.add("st-scrolling");
      if (reduce) {
        window.scrollTo(0, 0);
        document.documentElement.classList.remove("st-scrolling");
        return;
      }
      const duration = Math.min(700, Math.max(260, start * 0.32));
      const t0 = performance.now();
      function step(now) {
        const t = (now - t0) / duration;
        const p = t >= 1 ? 1 : t;
        const e = 1 - Math.pow(1 - p, 3);
        window.scrollTo(0, Math.round(start * (1 - e)));
        if (p < 1) { animId = requestAnimationFrame(step); }
        else { animId = null; document.documentElement.classList.remove("st-scrolling"); }
      }
      animId = requestAnimationFrame(step);
    }

    let lastTouch = 0;
    scrollBtn.addEventListener("touchend", function (e) {
      lastTouch = Date.now(); e.preventDefault(); goTop();
    }, { passive: false });
    scrollBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (Date.now() - lastTouch < 700) return;
      goTop();
    });
    ["wheel", "touchstart"].forEach(function (ev) {
      window.addEventListener(ev, function () {
        if (animId) { cancelAnimationFrame(animId); animId = null;
          document.documentElement.classList.remove("st-scrolling"); }
      }, { passive: true });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && visible) goTop();
    });
  }


  // شمارنده‌ی زنده‌ی طول پیام
  const messageField = document.querySelector('#contact-form textarea[name="message"]');
  const messageCount = document.getElementById("message-count");
  if (messageField && messageCount) {
    const updateMessageCount = () => { messageCount.textContent = messageField.value.length.toLocaleString("fa-IR"); };
    messageField.addEventListener("input", updateMessageCount);
    updateMessageCount();
  }

  // فرم تماس: ارسال بدون رفرش صفحه (اگر جاوااسکریپت خاموش باشد، فرم عادی کار می‌کند)
  const form = document.getElementById("contact-form");
  if (form) {
    const status = document.getElementById("contact-status");
    const submitBtn = form.querySelector("button[type=submit]");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      form.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
      status.className = "form-flash hidden";
      submitBtn.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { "X-Requested-With": "fetch" },
        });
        const data = await res.json();

        Object.entries(data.errors || {}).forEach(([field, msg]) => {
          const el = form.querySelector(`[data-error-for="${field}"]`);
          if (el) el.textContent = msg;
        });

        status.textContent = data.message;
        status.className = "form-flash " + (data.ok ? "form-flash-ok" : "form-flash-error");
        if (data.ok) form.reset();
      } catch (err) {
        status.textContent = "ارسال انجام نشد. اینترنت را بررسی کن و دوباره تلاش کن.";
        status.className = "form-flash form-flash-error";
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
});
/* منوی همبرگری صفحه‌های داخلی را می‌سازد (صفحه‌ی اصلی منوی خودش را دارد).
   نسخه‌ی دوزبانه: روی صفحه‌ی انگلیسی، آدرس‌ها انگلیسی‌اند و لینک زبان
   به «جفتِ همین صفحه» می‌رود، نه به صفحه‌ی اصلی. */
(function () {
  "use strict";

  function isEnglishPage() {
    return (document.documentElement.lang || "fa").toLowerCase().indexOf("en") === 0;
  }

  /* پیشوند ../ برای صفحه‌هایی که داخل پوشه‌ی blog/ یا en-blog/ هستند */
  function upPrefix() {
    var path = location.pathname;
    return (path.indexOf("/blog/") > -1 || path.indexOf("/en-blog/") > -1) ? "../" : "";
  }

  /* جفتِ همین صفحه در زبان دیگر */
  function counterpartHref() {
    var path = location.pathname;
    var file = path.split("/").pop() || "index.html";

    if (path.indexOf("/en-blog/") > -1) return "../blog/" + file;
    if (path.indexOf("/blog/") > -1) return "../en-blog/" + file;

    var pairs = {
      "index.html": "en-index.html",
      "about.html": "en-about.html",
      "projects.html": "en-projects.html",
      "blog.html": "en-blog.html",
      "resume.html": "en-resume.html",
      "en-index.html": "index.html",
      "en-about.html": "about.html",
      "en-projects.html": "projects.html",
      "en-blog.html": "blog.html",
      "en-resume.html": "resume.html"
    };
    if (pairs[file]) return pairs[file];
    return isEnglishPage() ? "index.html" : "en-index.html";
  }

  function installMissingMenu() {
    var button = document.getElementById("mobile-menu-button");
    if (!button || document.getElementById("mobile-menu")) return;

    var isEnglish = isEnglishPage();
    var up = upPrefix();
    var labels = isEnglish
      ? ["Home", "About", "Projects", "Blog", "Resume", "Contact", "نسخه فارسی →"]
      : ["خانه", "درباره من", "پروژه‌ها", "بلاگ", "رزومه", "تماس", "English version →"];
    var hrefs = isEnglish
      ? [up + "en-index.html#home", up + "en-about.html", up + "en-projects.html", up + "en-blog.html", up + "en-resume.html", up + "en-index.html#contact", counterpartHref()]
      : [up + "index.html#home", up + "about.html", up + "projects.html", up + "blog.html", up + "resume.html", up + "index.html#contact", counterpartHref()];

    var menu = document.createElement("nav");
    menu.id = "mobile-menu";
    menu.className = "md:hidden bg-[#181C23] border-b border-[#23262F] px-8 py-4 space-y-3";
    menu.setAttribute("aria-label", isEnglish ? "Mobile navigation" : "منوی موبایل");

    labels.forEach(function (label, index) {
      var link = document.createElement("a");
      link.href = hrefs[index];
      link.textContent = label;
      link.className = index === labels.length - 1
        ? "block text-[#FF6A3D] hover:text-[#ff8a5c] transition-colors duration-200"
        : "block text-[#E5E7EB] hover:text-[#FF6A3D] transition-colors duration-200";
      if (index === labels.length - 1) {
        link.lang = isEnglish ? "fa" : "en";
        link.setAttribute("hreflang", isEnglish ? "fa" : "en");
      }
      menu.appendChild(link);
    });

    var header = button.closest("header");
    if (header) header.insertAdjacentElement("afterend", menu);
    else button.insertAdjacentElement("afterend", menu);

    button.setAttribute("aria-controls", "mobile-menu");
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      button.classList.toggle("active", isOpen);
      button.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        button.classList.remove("active");
        button.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* بعد از هندلر DOMContentLoaded در بالای همین فایل اجرا می‌شود،
     تا منوی صفحه‌ی اصلی همان یک لیسنر اصلی خودش را نگه دارد. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installMissingMenu, { once: true });
  } else {
    installMissingMenu();
  }
})();
/* On inner pages, send the desktop Contact link to the homepage contact section. */
(function () {
  "use strict";

  function fixInnerContactLinks() {
    if (document.getElementById("contact")) return;

    var isEnglish = (document.documentElement.lang || "fa").toLowerCase().indexOf("en") === 0;
    var destination = isEnglish ? "en-index.html#contact" : "index.html#contact";
    document.querySelectorAll('header nav a[href="#contact"]').forEach(function (link) {
      link.setAttribute("href", destination);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixInnerContactLinks, { once: true });
  } else {
    fixInnerContactLinks();
  }
})();
