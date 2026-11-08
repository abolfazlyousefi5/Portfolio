/* نسخه استاتیک (بدون بک‌اند): فرم تماس پیام را در ایمیل‌کلاینت باز می‌کند */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  if (!form) return;
  const mailLink = document.querySelector('a[href^="mailto:"]');
  const to = mailLink ? mailLink.getAttribute("href").replace(/^mailto:/, "").split("?")[0] : "";
  const status = document.getElementById("contact-status");
  const submitBtn = form.querySelector("button[type=submit]");
  form.addEventListener("submit", function (e) {
    e.preventDefault(); e.stopImmediatePropagation();
    const val = (n) => (form.querySelector('[name="' + n + '"]') || {}).value || "";
    const name = val("name").trim(), email = val("email").trim();
    const subject = val("subject").trim(), message = val("message").trim();
    if (name.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length < 10) {
      if (status) { status.className = "form-flash form-flash-error"; status.textContent = "لطفاً نام، ایمیل معتبر و پیامی حداقل ۱۰ کاراکتری وارد کن."; }
      return;
    }
    const body = "از: " + name + " <" + email + ">\n\n" + message;
    if (status) { status.className = "form-flash form-flash-ok"; status.textContent = "این نسخه پیش‌نمایش است؛ پنجره ایمیل باز می‌شود. (نسخه کامل روی هاست، پیام را ذخیره می‌کند)"; }
    if (submitBtn) submitBtn.disabled = false;
    window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent("پیام از سایت" + (subject ? ": " + subject : "")) + "&body=" + encodeURIComponent(body);
  }, true);
});
