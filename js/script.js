// افکت تایپ متحرک: متن را تایپ می‌کند، پاک می‌کند و به جمله‌ی بعدی می‌رود
function createTypingEffect(element, texts, speed = 100) {
  let textIndex = 0; // شماره متن فعلی
  let charIndex = 0; // شماره کاراکتر فعلی
  let isDeleting = false; // آیا در حال پاک کردن هستیم؟

  function type() {
    const currentText = texts[textIndex];

    if (isDeleting) {
      element.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      element.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = speed;
    if (isDeleting) typeSpeed /= 2; // پاک کردن سریع‌تر

    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 2000; // توقف ۲ ثانیه
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
  }

  type();
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
    if (texts.length) createTypingEffect(typingElement, texts, 150);
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

  // دکمه‌ی برگشت به بالا
  const scrollBtn = document.getElementById("scrollToTop");
  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) {
        scrollBtn.classList.remove("scale-0");
        scrollBtn.classList.add("scale-100");
      } else {
        scrollBtn.classList.remove("scale-100");
        scrollBtn.classList.add("scale-0");
      }
    });

    scrollBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const duration = 800;
      const start = window.scrollY;
      const startTime = performance.now();

      function scrollStep(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out
        window.scrollTo(0, start * (1 - ease));
        if (progress < 1) requestAnimationFrame(scrollStep);
      }

      requestAnimationFrame(scrollStep);
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
