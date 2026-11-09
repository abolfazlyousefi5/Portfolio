/* ============================================================
   فرم تماس نسخه‌ی استاتیک (GitHub Pages)
   پیام را مستقیم به API نسخه‌ی Flask روی PythonAnywhere می‌فرستد،
   بنابراین در پنل مدیریت همان سایت ذخیره می‌شود.
   ============================================================ */
(function () {
  "use strict";

  // آدرس API (نسخه‌ی Flask)
  var API_BASE = "https://Abolfazlyousefi.pythonanywhere.com";
  var ENDPOINT = API_BASE + "/contact";
  var TIMEOUT_MS = 20000;

  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("contact-status");
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn ? submitBtn.querySelector("span") : null;
  var originalLabel = submitLabel ? submitLabel.textContent : "ارسال پیام";

  function show(kind, text) {
    if (!statusEl) return;
    statusEl.className = "form-flash " + (kind === "ok" ? "form-flash-ok" : "form-flash-error");
    statusEl.textContent = text;
    statusEl.classList.remove("hidden");
    statusEl.setAttribute("role", kind === "ok" ? "status" : "alert");
  }

  function clearErrors() {
    form.querySelectorAll(".field-error").forEach(function (el) {
      el.textContent = "";
    });
    form.querySelectorAll(".field").forEach(function (el) {
      el.classList.remove("field-invalid");
    });
  }

  function setFieldError(name, msg) {
    var slot = form.querySelector('[data-error-for="' + name + '"]');
    if (slot) slot.textContent = msg;
    var input = form.querySelector('[name="' + name + '"]');
    if (input) input.classList.add("field-invalid");
  }

  function busy(state) {
    if (!submitBtn) return;
    submitBtn.disabled = state;
    submitBtn.classList.toggle("is-loading", state);
    if (submitLabel) {
      submitLabel.textContent = state ? "در حال ارسال…" : originalLabel;
    }
  }

  function localValidate(data) {
    var errors = {};
    if (data.name.length < 2) errors.name = "نام باید حداقل ۲ کاراکتر باشد.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) errors.email = "ایمیل معتبر وارد کن.";
    if (data.message.length < 10) errors.message = "پیام باید حداقل ۱۰ کاراکتر باشد.";
    if (data.message.length > 2000) errors.message = "پیام نباید بیشتر از ۲۰۰۰ کاراکتر باشد.";
    return errors;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    clearErrors();
    var data = {
      name: (form.querySelector('[name="name"]') || {}).value || "",
      email: (form.querySelector('[name="email"]') || {}).value || "",
      subject: (form.querySelector('[name="subject"]') || {}).value || "",
      message: (form.querySelector('[name="message"]') || {}).value || "",
      website: (form.querySelector('[name="website"]') || {}).value || ""
    };
    data.name = data.name.trim();
    data.email = data.email.trim();
    data.subject = data.subject.trim();
    data.message = data.message.trim();

    var errs = localValidate(data);
    if (Object.keys(errs).length) {
      Object.keys(errs).forEach(function (k) { setFieldError(k, errs[k]); });
      show("error", "لطفاً خطاهای فرم را برطرف کن.");
      return;
    }

    var body = new URLSearchParams();
    body.set("name", data.name);
    body.set("email", data.email);
    body.set("subject", data.subject);
    body.set("message", data.message);
    body.set("website", data.website);

    busy(true);
    show("ok", "در حال ارسال پیام…");

    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);

    fetch(ENDPOINT, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "X-Requested-With": "fetch",
        "Accept": "application/json"
      },
      body: body.toString(),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) {
        clearTimeout(timer);
        return res.json().catch(function () { return { ok: res.ok, message: "" }; })
          .then(function (json) { return { status: res.status, json: json }; });
      })
      .then(function (out) {
        var json = out.json || {};
        if (out.status === 200 && json.ok) {
          show("ok", json.message || "پیامت ارسال شد. ممنون!");
          form.reset();
          var counter = document.getElementById("message-count");
          if (counter) counter.textContent = "۰";
          if (statusEl) statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(function () { busy(false); }, 400);
          return;
        }
        if (json.errors && typeof json.errors === "object") {
          Object.keys(json.errors).forEach(function (k) { setFieldError(k, json.errors[k]); });
        }
        show("error", json.message || "ارسال نشد. لطفاً دوباره تلاش کن.");
        busy(false);
      })
      .catch(function () {
        clearTimeout(timer);
        show("error", "اتصال برقرار نشد. اینترنتت را چک کن و دوباره تلاش کن.");
        busy(false);
      });
  });

  // پاک‌کردن پیام وضعیت وقتی کاربر دوباره تایپ می‌کند
  form.addEventListener("input", function () {
    if (statusEl && !statusEl.classList.contains("hidden") &&
        statusEl.classList.contains("form-flash-error")) {
      statusEl.classList.add("hidden");
    }
  });
})();

/* سال شمسی خودکار در کپی‌رایت */
(function setYear() {
  var el = document.getElementById("copyright-year");
  if (!el) return;
  try {
    var y = new Intl.DateTimeFormat("fa-IR-u-nu-arabext", { year: "numeric" }).format(new Date());
    el.textContent = y.replace(/[^۰-۹0-9]/g, "") || el.textContent;
  } catch (e) { /* همیشه سال ثابت می‌ماند */ }
})();
