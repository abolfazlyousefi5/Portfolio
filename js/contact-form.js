/* ============================================================
   contact-form.js — نسخه ۴ (Google Apps Script)
   پیام → Google Sheet (پنل ادمین می‌بیند)
        → ایمیل به صاحب سایت
   روی گوگل اجرا می‌شود ← در ایران بدون فیلترشکن باز است
   ============================================================ */
(function () {
  "use strict";

  /* ---------- آدرس Apps Script ---------- */
  var ENDPOINT = "https://script.google.com/macros/s/AKfycbyz7C8V7zp74RDJmi4X-lWhSEb06QmgxxF0-UKoAa4wcZyZLC8OdfaCsqlB25K9wqMk/exec";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("contact-status");
  var submitBtn = form.querySelector('button[type="submit"]') || form.querySelector(".contact-submit");
  var btnLabel = submitBtn ? submitBtn.querySelector("span") : null;
  var originalLabel = btnLabel ? btnLabel.textContent : "ارسال";

  var IS_EN = (document.documentElement.lang || "fa").slice(0, 2) === "en";

  var T = IS_EN
    ? {
        sending: "Sending…",
        ok: "Message sent ✓ — I'll reply to you by email soon.",
        bad: "Please fill the form correctly.",
        net: "Connection failed — please try again.",
        fallback: "Your email app is opening — just press Send to finish.",
        err: "Something went wrong."
      }
    : {
        sending: "در حال ارسال…",
        ok: "پیامت رسید ✓ — جوابت رو تا چند روز آینده با ایمیل می‌دم.",
        bad: "لطفاً فرم را درست پر کن.",
        net: "ارسال نشد — یک‌بار دیگه تلاش کن.",
        fallback: "ایمیلت باز شد — فقط دکمه‌ی «ارسال» رو بزن تا پیام برسه.",
        err: "مشکلی پیش آمد."
      };

  /* متن‌ها از data.json (اختیاری) */
  function syncTexts() {
    var root = document.documentElement;
    var ok = root.getAttribute("data-contact-ok");
    var fb = root.getAttribute("data-contact-fallback");
    if (ok && ok.trim()) T.ok = ok.trim();
    if (fb && fb.trim()) T.fallback = fb.trim();
  }
  syncTexts();
  window.__contactTextsChanged = syncTexts;

  /* ---------- نمایش ---------- */
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

  function setFieldError(name, msg) {
    var el = form.querySelector('[data-error-for="' + name + '"]');
    if (el) el.textContent = msg || "";
  }
  function clearFieldErrors() {
    form.querySelectorAll(".field-error").forEach(function (e) { e.textContent = ""; });
  }

  function validate(d) {
    var errors = {};
    if (!d.name || d.name.trim().length < 2)
      errors.name = IS_EN ? "Please enter your full name." : "نام را کامل بنویس.";
    if (!d.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email))
      errors.email = IS_EN ? "Please enter a valid email." : "ایمیل معتبر وارد کن.";
    if (!d.message || d.message.trim().length < 10)
      errors.message = IS_EN ? "Message must be at least 10 characters." : "پیام باید حداقل ۱۰ کاراکتر باشد.";
    return errors;
  }

  /* ---------- شمارنده ---------- */
  var counter = document.getElementById("message-count");
  var textarea = form.querySelector('textarea[name="message"]');
  function updateCounter() {
    if (!counter || !textarea) return;
    var n = textarea.value.length, fa = "۰۱۲۳۴۵۶۷۸۹";
    counter.textContent = String(n).replace(/\d/g, function (d) { return fa[+d]; });
  }
  if (textarea) { textarea.addEventListener("input", updateCounter); updateCounter(); }

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

    if (data.website) return;   // هانی‌پات

    var errors = validate(data);
    if (Object.keys(errors).length) {
      Object.keys(errors).forEach(function (k) { setFieldError(k, errors[k]); });
      flash(T.bad, "error");
      return;
    }

    if (btnLabel) btnLabel.textContent = T.sending;
    if (submitBtn) submitBtn.disabled = true;

    function done() {
      if (btnLabel) btnLabel.textContent = originalLabel;
      if (submitBtn) submitBtn.disabled = false;
    }

    function mailtoFallback() {
      var MAIL = "abolfazl.yousefi.dev@gmail.com";
      var body = data.message + "\n\n— " + data.name + " (" + data.email + ")";
      window.location.href = "mailto:" + MAIL +
        "?subject=" + encodeURIComponent(data.subject || "پیام از سایت") +
        "&body=" + encodeURIComponent(body);
      flash(T.fallback, "ok");
      done();
    }

    var payload = {
      action: "send",
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message
    };

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow"
    })
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        var j = {};
        try { j = JSON.parse(txt); } catch (e) {}
        if (j && j.ok) {
          flash(T.ok, "ok");
          form.reset();
          updateCounter();
        } else {
          mailtoFallback();
        }
        done();
      })
      .catch(function () {
        mailtoFallback();
      });
  });

  form.addEventListener("input", function (e) {
    if (e.target.name) setFieldError(e.target.name, "");
  });
})();
