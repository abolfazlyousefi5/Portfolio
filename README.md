<div align="center">

# 🌐 وب‌سایت شخصی ابوالفضل یوسفی

### رزومه و نمونه‌کار · طراحی تیره · کاملاً ریسپانسیو

<br/>

[![Live Site](https://img.shields.io/badge/🌐_مشاهده_سایت-abolfazlyousefi5.github.io-FF6A3D?style=for-the-badge&logo=githubpages&logoColor=white)](https://abolfazlyousefi5.github.io/Portfolio/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

<br/>

> **«از صفر تا آنلاین»** — یک وب‌سایت شخصی کامل با دو نسخه:
> نسخه **استاتیک** برای نمایش عمومی، و نسخه **Flask** با پنل مدیریت،
> دیتابیس و فرم تماس واقعی.

</div>

---

## 🖼️ پیش‌نمایش

<div align="center">

| صفحه اصلی | پروژه‌ها | موبایل |
|:---:|:---:|:---:|
| <img src="https://raw.githack.com/abolfazlyousefi5/Portfolio/refs/heads/main/img/11zon_cropped.png" width="90" alt="پروفایل"/> | 💼 ۶ پروژه | 📱 کامل ریسپانسیو |
| هدر · تایپ افکت · مهارت‌ها | کارت‌های پروژه با تگ | منوی همبرگری |

</div>

> 💡 برای دیدن واقعی، روی **[🌐 Live Site]https://abolfazl-yousefi.is-a.dev/)** کلیک کن. 
---

## ✨ امکانات

<table>
<tr>
<td width="50%" valign="top">

### 🎨 رابط کاربری
- 🌙 **تم تیره** با رنگ نارنجی `#FF6A3D`
- 📐 **راست‌به‌چپ** کامل (فارسی)
- 📱 **ریسپانسیو** — موبایل، تبلت، دسکتاپ
- ⌨️ **افکت تایپ متحرک** برای معرفی
- 🎯 **اسکرول نرم** + دکمه بازگشت به بالا
- 🔤 **فونت وزیرمتن** (۴ وزن، محلی)

</td>
<td width="50%" valign="top">

### ⚙️ بک‌اند (Flask)
- 🗄️ **دیتابیس SQLite** — محتوا داینامیک
- 🔐 **پنل مدیریت** در `/admin`
- ✉️ **فرم تماس واقعی** (DB + ایمیل)
- 🛡️ **امنیت**: CSRF، رمز هش‌شده، Rate Limit
- 🔌 **API عمومی JSON**: `/api/projects`
- 🔍 **سئو**: `robots.txt` + `sitemap.xml`

</td>
</tr>
</table>

---

## 🏗️ معماری پروژه

دو نسخه مستقل از یک طراحی:

```text
                          ┌──────────────────────────┐
                          │   طراحی مشترک (UI/UX)     │
                          │  HTML · Tailwind · JS    │
                          └────────────┬─────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
         ┌──────────▼───────────┐            ┌────────────▼─────────────┐
         │   نسخه استاتیک        │            │     نسخه Flask           │
         │   (GitHub Pages)      │            │   (PythonAnywhere)       │
         ├──────────────────────┤            ├──────────────────────────┤
         │ ✅ نمایش سریع         │            │ ✅ پنل مدیریت            │
         │ ✅ بدون سرور          │            │ ✅ دیتابیس SQLite        │
         │ ✅ رایگان و دائمی     │            │ ✅ فرم تماس واقعی        │
         │ ❌ بدون پنل ادمین     │            │ ✅ API JSON              │
         └──────────────────────┘            └──────────────────────────┘
                    │                                     │
                    ▼                                     ▼
        abolfazlyousefi5.github.io              Abolfazlyousefi
            /Portfolio                          .pythonanywhere.com
```

---

## 📂 ساختار فایل‌ها

<details open>
<summary><b>🟠 نسخه استاتیک (ریشه ریپو)</b></summary>

```text
Portfolio/
│
├── 📄 index.html              # کل صفحه سایت
├── 📄 .nojekyll               # غیرفعال کردن Jekyll
│
├── 📁 css/
│   ├── tailwind.css           # Tailwind کامپایل‌شده (۱۵KB)
│   ├── style.css              # استایل سفارشی + ریسپانسیو
│   └── fonts.css              # تعریف فونت وزیرمتن
│
├── 📁 js/
│   ├── script.js              # تایپ افکت، منو، اسکرول
│   └── static-form.js         # فرم تماس (نسخه استاتیک)
│
├── 📁 fonts/                  # ۴ وزن وزیرمتن (woff2)
├── 📁 img/                    # عکس پروفایل
└── 📁 assets/                 # رزومه PDF
```

</details>

<details>
<summary><b>🔵 نسخه Flask (پوشه <code>flask-app/</code>)</b></summary>

```text
flask-app/
│
├── 📁 app/
│   ├── __init__.py            # ساخت اپ، تنظیمات، هدرهای امنیتی
│   ├── public.py              # صفحه اصلی، فرم تماس، API، سئو
│   ├── admin.py               # پنل مدیریت (۵ بخش)
│   ├── db.py                  # دیتابیس SQLite + دستورهای CLI
│   ├── security.py            # CSRF، لاگین، Rate Limit
│   ├── mailer.py              # اطلاع‌رسانی ایمیل (اختیاری)
│   ├── defaults.py            # محتوای اولیه
│   ├── filters.py             # فیلترهای Jinja
│   ├── schema.sql             # ساختار ۵ جدول
│   │
│   ├── 📁 templates/
│   │   ├── index.html         # صفحه اصلی
│   │   ├── error.html         # صفحه‌های خطا
│   │   └── 📁 admin/          # ۸ قالب پنل مدیریت
│   │
│   └── 📁 static/
│       ├── css/  js/  img/  assets/
│
├── 📁 tests/
│   └── test_app.py            # ۲۶ تست خودکار
│
├── 📁 deploy/
│   ├── nginx.conf.example
│   └── portfolio.service
│
├── 📄 wsgi.py                 # نقطه ورود gunicorn
├── 📄 passenger_wsgi.py       # نقطه ورود cPanel
├── 📄 render.yaml             # تنظیمات Render
├── 📄 Procfile                # برای Heroku-like
├── 📄 requirements.txt
├── 📄 .env.example
└── 📄 run_local.py            # اجرای لوکال
```

</details>

---

## 🛠️ تکنولوژی‌ها

<div align="center">

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

### Backend
![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask_3.0-000000?style=flat-square&logo=flask&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-499848?style=flat-square&logo=gunicorn&logoColor=white)

### DevOps
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Pages-181717?style=flat-square&logo=github&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)

</div>

---

## 🚀 اجرای لوکال

### ۱. کلون کردن

```bash
git clone https://github.com/abolfazlyousefi5/Portfolio.git
cd Portfolio/flask-app
```

### ۲. محیط مجازی

```bash
python3 -m venv .venv

# لینوکس / مک
source .venv/bin/activate

# ویندوز
.venv\Scripts\activate
```

### ۳. نصب وابستگی‌ها

```bash
pip install -r requirements.txt
```

### ۴. تنظیمات

```bash
cp .env.example .env
```

فایل `.env` را ویرایش کن:

```env
APP_ENV=development
SECRET_KEY=یک-رشته-تصادفی-۶۴-کاراکتری
ADMIN_USERNAME=admin
ADMIN_PASSWORD=رمز-قوی-حداقل-۱۰-کاراکتر
```

> 💡 ساخت `SECRET_KEY`:
> ```bash
> python3 -c "import secrets; print(secrets.token_hex(32))"
> ```

### ۵. اجرا

```bash
flask --app wsgi run --debug
```

<div align="center">

| آدرس | توضیح |
|:---|:---|
| `http://127.0.0.1:5000` | 🌐 سایت |
| `http://127.0.0.1:5000/admin` | 🔐 پنل مدیریت |
| `http://127.0.0.1:5000/api/projects` | 🔌 API |

</div>

### ۶. تست‌ها

```bash
python -m unittest discover -s tests -t .
```

```text
Ran 26 tests in 5.3s

OK ✅
```

---

## 🔐 پنل مدیریت

بعد از ورود به `/admin` این بخش‌ها در دسترس است:

| بخش | امکانات |
|:---|:---|
| 📨 **پیام‌ها** | دیدن، علامت‌گذاری خوانده‌شده، حذف، خروجی CSV |
| 💼 **پروژه‌ها** | افزودن، ویرایش، حذف، ترتیب‌دهی، پیش‌نویس |
| 📊 **مهارت‌ها** | تغییر نام و درصد نوارها |
| ⚙️ **تنظیمات** | نام، متن درباره من، جمله‌های تایپ، لینک‌ها، آدرس سایت |
| 🔑 **رمز عبور** | تغییر رمز ادمین |

---

## 🔌 API عمومی

<table>
<tr><th>Endpoint</th><th>توضیح</th><th>نمونه خروجی</th></tr>
<tr>
<td><code>GET /api/projects</code></td>
<td>لیست پروژه‌های منتشرشده</td>
<td><code>[{"id":1,"title":"...","tags":["Python"]}]</code></td>
</tr>
<tr>
<td><code>GET /api/skills</code></td>
<td>لیست مهارت‌ها و درصد</td>
<td><code>[{"name":"Python","level":40}]</code></td>
</tr>
<tr>
<td><code>GET /api/health</code></td>
<td>بررسی سلامت سرویس</td>
<td><code>{"status":"ok"}</code></td>
</tr>
</table>

---

## 🛡️ امنیت

<table>
<tr><td>✅</td><td><b>رمز هش‌شده</b> — با <code>werkzeug.security</code> (PBKDF2)</td></tr>
<tr><td>✅</td><td><b>محافظت CSRF</b> — روی همه درخواست‌های POST</td></tr>
<tr><td>✅</td><td><b>Rate Limiting</b> — ۵ پیام در ساعت، ۸ تلاش ورود در ۱۵ دقیقه</td></tr>
<tr><td>✅</td><td><b>Honeypot</b> — فیلد مخفی ضد ربات در فرم تماس</td></tr>
<tr><td>✅</td><td><b>هدرهای امنیتی</b> — X-Frame-Options، CSP، HSTS، nosniff</td></tr>
<tr><td>✅</td><td><b>کوکی امن</b> — HttpOnly + SameSite + Secure</td></tr>
<tr><td>✅</td><td><b>اعتبارسنجی ورودی</b> — همه فیلدها سمت سرور</td></tr>
<tr><td>✅</td><td><b>رمز و کلید در <code>.env</code></b> — هرگز در کد یا گیت‌هاب</td></tr>
</table>

---

## 🌍 استقرار (Deploy)

<details>
<summary><b>🟢 GitHub Pages — نسخه استاتیک (فعال ✅)</b></summary>

```text
Settings → Pages → Source: Deploy from a branch
                 → Branch: main / (root)
                 → Save

آدرس: https://abolfazlyousefi5.github.io/Portfolio/
```

</details>

<details>
<summary><b>🔵 PythonAnywhere — نسخه Flask (فعال ✅)</b></summary>

```bash
# ۱. آپلود پروژه و ساخت venv
cd ~/portfolio-app
python3 -m venv .venv --system-site-packages
.venv/bin/pip install "Flask>=3.0,<4" "python-dotenv>=1.0"

# ۲. فایل .env
cat > .env <<'EOF'
APP_ENV=production
SECRET_KEY=...
ADMIN_PASSWORD=...
EOF
```

**در پنل Web:**
```python
# WSGI configuration file
import sys
path = "/home/USERNAME/portfolio-app"
if path not in sys.path:
    sys.path.insert(0, path)
from wsgi import app as application
```

</details>

<details>
<summary><b>⚪ Render — با دامنه اختصاصی رایگان</b></summary>

```text
۱. ریپو را در Render وصل کن
۲. New → Blueprint → render.yaml را تأیید کن
۳. ADMIN_PASSWORD را وارد کن (حداقل ۱۰ کاراکتر)
۴. Settings → Custom Domain → دامنه‌ات را وصل کن
```

> ⚠️ پلن رایگان Render دیسک دائمی ندارد — دیتابیس با هر ری‌استارت پاک می‌شود.

</details>

<details>
<summary><b>🖥️ VPS — پایدارترین گزینه</b></summary>

```bash
apt update && apt install -y python3-venv nginx git
git clone https://github.com/abolfazlyousefi5/Portfolio.git /var/www/portfolio
cd /var/www/portfolio/flask-app

python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

cp .env.example .env && nano .env

cp deploy/portfolio.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now portfolio

cp deploy/nginx.conf.example /etc/nginx/sites-available/portfolio
nano /etc/nginx/sites-available/portfolio
ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

certbot --nginx -d yourdomain.com
```

</details>

---

## 📊 آمار پروژه

<div align="center">

| متریک | مقدار |
|:---|:---|
| 📄 خطوط کد | ~۳,۵۰۰ |
| 🐍 فایل‌های پایتون | ۱۲ |
| 🎨 قالب‌های HTML | ۱۱ |
| ✅ تست‌های خودکار | ۲۶ (همه پاس) |
| 🗄️ جدول‌های دیتابیس | ۵ |
| 🔌 API Endpoints | ۳ |
| 📦 وابستگی‌های خارجی | ۲ (`flask`, `python-dotenv`) |
| ⚡ حجم نسخه استاتیک | ۱.۹ MB |
| 🔒 آسیب‌پذیری شناخته‌شده | ۰ |

</div>

---

## 🎓 آنچه در این پروژه یاد گرفتم

<table>
<tr>
<td width="33%" valign="top" align="center">

### 🐍 بک‌اند
- Flask و Blueprint
- SQLite و کوئری‌نویسی
- WSGI و Gunicorn
- مدیریت متغیرهای محیطی
- نوشتن تست خودکار

</td>
<td width="33%" valign="top" align="center">

### 🔐 امنیت
- CSRF Protection
- هش کردن رمز
- Rate Limiting
- هدرهای امنیتی
- اعتبارسنجی ورودی

</td>
<td width="33%" valign="top" align="center">

### 🚀 استقرار
- Git و GitHub
- GitHub Pages
- PythonAnywhere / Render
- Nginx و systemd
- SSL با Let's Encrypt

</td>
</tr>
</table>

---

## 🤝 مشارکت

اگر باگ پیدا کردی یا ایدهای داری:

```text
1. Fork کن
2. یک برنچ بساز:  git checkout -b feature/نام-قابلیت
3. کامیت کن:       git commit -m "feat: افزودن قابلیت"
4. پوش کن:         git push origin feature/نام-قابلیت
5. Pull Request بزن
```

---

## 📬 ارتباط با من

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-abolfazlyousefi5-181717?style=for-the-badge&logo=github)](https://github.com/abolfazlyousefi5)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-abolfazl--yousefi-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/abolfazl-yousefi-249a7b217/)
[![Telegram](https://img.shields.io/badge/Telegram-@abolfazl__yousefi02-26A5E4?style=for-the-badge&logo=telegram)](https://t.me/abolfazl_yousefi02)
[![Instagram](https://img.shields.io/badge/Instagram-@py__.y5-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/py_.y5)
[![Email](https://img.shields.io/badge/Email-a.yousefi2912@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:a.yousefi2912@gmail.com)

</div>

---

## 📄 مجوز

این پروژه تحت مجوز **MIT** منتشر شده است — استفاده، تغییر و توزیع آزاد.

```text
MIT License · © 1405 (2026) Abolfazl Yousefi
```

---

<div align="center">

### ⭐ اگر این پروژه را دوست داشتی، یک ستاره بده!

<br/>

**[🌐 مشاهده سایت](https://abolfazlyousefi5.github.io/Portfolio/)** · **[💻 مشاهده کد](https://github.com/abolfazlyousefi5/Portfolio)**

<br/>

<sub>ساخته شده با ❤️ و ☕ توسط ابوالفضل یوسفی</sub>

</div>
