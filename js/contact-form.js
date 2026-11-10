(function () {
  "use strict";

  /* ---------- تنظیمات ---------- */
  var FORMSUBMIT = "https://formsubmit.co/ajax/a.yousefi2912@gmail.com";
  var MAILTO = "a.yousefi2912@gmail.com";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("contact-status");
  var submitBtn = form.querySelector('button[type="submit"]') || form.querySelector(".contact-submit");
  var btnLabel = submitBtn ? submitBtn.querySelector("span") : null;
  var originalLabel = btnLabel ? btnLabel.textContent : "ارسال";

  var IS_EN = (document.documentElement.lang || "fa").slice(0, 2) === "en";

  /* متن‌های پیش‌فرض — site-sync.js آن‌ها را از data.json به‌روز می‌کند */
  var T = IS_EN
    ? {
        sending: "Sending…",
        ok: "Message sent ✓ — I'll reply to you by email soon.",
        bad: "Please fill the form correctly.",
        net: "Connection failed.",
        fallback: "Your email app is opening — just press Send to finish.",
        err: "Something went wrong."
      }
    : {
        sending: "در حال ارسال…",
        ok: "پیامت رسید ✓ — جوابت رو تا چند روز آینده با ایمیل می‌دم.",
        bad: "لطفاً فرم را درست پر کن.",
        net: "اتصال برقرار نشد.",
        fallback: "ایمیلت باز شد — فقط دکمه‌ی «ارسال» رو بزن تا پیام برسه.",
        err: "مشکلی پیش آمد."
      };

  /* ---------- متن‌ها را از data.json بگیر (اگر تنظیم شده باشد) ---------- */
  function syncTexts() {
    var root = document.documentElement;
    var ok = root.getAttribute("data-contact-ok");
    var fb = root.getAttribute("data-contact-fallback");
    if (ok && ok.trim()) T.ok = ok.trim();
    if (fb && fb.trim()) T.fallback = fb.trim();
  }
  syncTexts();
  window.__contactTextsChanged = syncTexts;   // site-sync صدا می‌زند

  /* ---------- نمایش پیام ---------- */
  function flash(text, kind) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = "form-flash form-flash-" + (kind || "ok");
    statusEl.style.display = "block";
    statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function clearFlash() {
    if (!statusEl) return;
    statusEl.className = "form-flash hidden";
    statusEl.style.display = "none";
    statusEl.textContent = "";
  }

  /* ---------- خطاهای فیلد ---------- */
  function setFieldError(name, msg) {
    var el = form.querySelector('[data-error-for="' + name + '"]');
    if (el) el.textContent = msg || "";
  }
  function clearFieldErrors() {
    form.querySelectorAll(".field-error").forEach(function (e) { e.textContent = ""; });
  }

  function validate(data) {
    var errors = {};
    if (!data.name || data.name.trim().length < 2)
      errors.name = IS_EN ? "Please enter your full name." : "نام را کامل بنویس.";
    if (!data.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email))
      errors.email = IS_EN ? "Please enter a valid email." : "ایمیل معتبر وارد کن.";
    if (!data.message || data.message.trim().length < 10)
      errors.message = IS_EN ? "Message must be at least 10 characters." : "پیام باید حداقل ۱۰ کاراکتر باشد.";
    return errors;
  }

  /* ---------- شمارنده کاراکتر ---------- */
  var counter = document.getElementById("message-count");
  var textarea = form.querySelector('textarea[name="message"]');
  function updateCounter() {
    if (!counter || !textarea) return;
    var n = textarea.value.length;
    var fa = "۰۱۲۳۴۵۶۷۸۹";
    counter.textContent = String(n).replace(/\d/g, function (d) { return fa[+d]; });
  }
  if (textarea) {
    textarea.addEventListener("input", updateCounter);
    updateCounter();
  }

  /* ---------- ارسال ---------- */
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    clearFlash();
    clearFieldErrors();

    var fd = new FormData(form);
    var data = {
      name: (fd.get("name") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      subject: (fd.get("subject") || "").toString().trim(),
      message: (fd.get("message") || "").toString().trim(),
      website: (fd.get("website") || "").toString().trim()
    };

    // هانی‌پات — ربات
    if (data.website) return;

    var errors = validate(data);
    if (Object.keys(errors).length) {
      Object.keys(errors).forEach(function (k) { setFieldError(k, errors[k]); });
      flash(T.bad, "error");
      return;
    }

    if (btnLabel) btnLabel.textContent = T.sending;
    if (submitBtn) submitBtn.disabled = true;

    var payload = {
      name: data.name,
      email: data.email,
      message: data.message,
      _subject: (IS_EN ? "New message from your site" : "پیام جدید از سایت") +
                (data.subject ? " — " + data.subject : ""),
      _template: "table",
      _captcha: "false"
    };

    function done() {
      if (btnLabel) btnLabel.textContent = originalLabel;
      if (submitBtn) submitBtn.disabled = false;
    }

    function mailtoFallback() {
      var body = data.message + "\n\n— " + data.name + " (" + data.email + ")";
      var url = "mailto:" + MAILTO +
                "?subject=" + encodeURIComponent(data.subject || "پیام از سایت") +
                "&body=" + encodeURIComponent(body);
      window.location.href = url;
      flash(T.fallback, "ok");
      done();
    }

    fetch(FORMSUBMIT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && (res.j.success === "true" || res.j.success === true)) {
          flash(T.ok, "ok");
          form.reset();
          updateCounter();
          done();
        } else {
          // FormSubmit قبول نکرد → ایمیل مستقیم
          mailtoFallback();
        }
      })
      .catch(function () {
        // شبکه قطع / فیلتر → ایمیل مستقیم
        mailtoFallback();
      });
  });

  // وقتی کاربر شروع به تایپ می‌کند، پیام قبلی محو شود
  form.addEventListener("input", function (e) {
    if (e.target.name) setFieldError(e.target.name, "");
  });
})();
