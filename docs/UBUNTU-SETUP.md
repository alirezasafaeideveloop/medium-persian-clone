# 🚀 راهنمای کامل اجرا و دیپلوی روی ابونتو 24.4

این راهنما شما را قدم به قدم برای اجرای کامل پروژه مدیوم فارسی روی ابونتو 24.4 هدایت می‌کند.

---

## 📋 پیش‌نیازهای اولیه

### ۱. ابونتو 24.4
- حافظه: حداقل 4GB RAM (8GB توصیه می‌شود)
- حافظه داخلی: حداقل 64GB
- اینترنت پایدار

### ۲. نرم‌افزارهای مورد نیاز
- **VS Code** یا هر ادیتور کد دیگر
- **Git** برای مدیریت نسخه
- **Docker** و **Docker Compose** (پیش‌نصب روی ابونتو)
- **PostgreSQL** (نصب روی ابونتو)

---

## 🔧 مرحله ۱: آماده‌سازی محیط

### نصب PostgreSQL روی ابونتو:
```bash
# آپدیت سیستم
sudo apt update && sudo apt upgrade -y

# نصب PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# فعال‌سازی سرویس PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# بررسی وضعیت
sudo systemctl status postgresql
```

### ایجاد کاربر و دیتابیس:
```bash
# ورود به کاربر postgres
sudo -u postgres psql

# ایجاد کاربر جدید برای پروژه
CREATE USER medium_user WITH PASSWORD 'your_secure_password';

# ایجاد دیتابیس
CREATE DATABASE medium_farsi OWNER medium_user;

# اعطای دسترسی‌ها
GRANT ALL PRIVILEGES ON DATABASE medium_farsi TO medium_user;

# خروج از PostgreSQL
\q
```

### تنظیمات PostgreSQL برای اتصال از خارج:
```bash
# ویرایش فایل پیکربندی
sudo nano /etc/postgresql/14/main/postgresql.conf

# این خطوط را پیدا و تغییر دهید:
# listen_addresses = 'localhost'          # old
listen_addresses = 'localhost,192.168.1.100'  # new (آدرس ابونتو شما)

# این خط را هم اضافه کنید:
listen_addresses = '*'

# فایل را ذخیره کنید و ری‌استارت کنید
sudo systemctl restart postgresql
```

### تنظیمات دسترسی PostgreSQL:
```bash
# ویرایش فایل pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# این خطوط را به انتهای فایل اضافه کنید:
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    medium_farsi     medium_user     192.168.1.0/24         md5
host    medium_farsi     medium_user     0.0.0.0/0               md5

# ری‌استارت سرویس
sudo systemctl restart postgresql
```

---

## 📥 مرحله ۲: دریافت پروژه

### از GitHub:
```bash
# رفتن به پوشه home
cd ~

# کلون پروژه
git clone https://github.com/username/medium-persian-clone.git

# ورود به پوشه پروژه
cd medium-persian-clone
```

### اگر فایل زیپ دارید:
```bash
# انتقال فایل زیپ به ابونتو
# از طریق USB یا شبکه

# استخراج فایل
unzip medium-persian-clone.zip -d medium-persian-clone

# ورود به پوشه
cd medium-persian-clone
```

---

## 🔧 مرحله ۳: پیکربندی پروژه

### نصب وابستگی‌ها:
```bash
# نصب Node.js (اگر نصب نبود)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# بررسی نسخه Node.js
node --version  # باید 18+ باشد

# نصب وابستگی‌های پروژه
npm install
```

### ایجاد فایل متغیرهای محیطی:
```bash
# ایجاد فایل .env.local
nano .env.local
```

محتوای فایل `.env.local`:
```env
# Database
DATABASE_URL="postgresql://medium_user:your_secure_password@localhost:5432/medium_farsi"

# NextAuth
NEXTAUTH_URL="http://192.168.1.100:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Development
NODE_ENV="development"
```

### تولید کلید تصادفی برای NEXTAUTH_SECRET:
```bash
# تولید کلید امنیتی
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# خروجی را کپی و در .env.local قرار دهید
```

---

## 🗄️ مرحله ۴: آماده‌سازی دیتابیس

### نصب و پیکربندی Prisma:
```bash
# نصب Prisma CLI به صورت سراسری
npm install -g prisma

# تولید کلاینت Prisma
npx prisma generate

# فشردن اسکیمای دیتابیس
npx prisma db push
```

### بررسی اتصال دیتابیس:
```bash
# تست اتصال به دیتابیس
npx prisma db pull

# اگر خطایی نداشت، همه چیز درست است
```

---

## 🚀 مرحله ۵: اجرای پروژه

### اجرای در حالت توسعه:
```bash
# اجرای سرور توسعه
npm run dev

# یا اجرا در پس‌زمینه
nohup npm run dev > dev.log 2>&1 &
```

### اجرای در حالت تولید (تست):
```bash
# ساخت پروژه
npm run build

# اجرای سرور تولید
npm start
```

---

## 🌐 مرحله ۶: دسترسی از دیگر دستگاه‌ها

### پیدا کردن IP ابونتو:
```bash
# پیدا کردن آدرس IP
hostname -I
# یا
ip addr show

# آدرس معمولاً 192.168.1.100 است
```

### دسترسی از کامپیوتر دیگر:
1. کامپیوتر دیگر را به همان شبکه وای‌فای متصل کنید
2. مرورگر را باز کنید و به آدرس زیر بروید:
   ```
   http://192.168.1.100:3000
   ```

---

## 🐳 مرحله ۷: اجرا با Docker (اختیاری اما توصیه شده)

### ایجاد فایل docker-compose.yml:
```bash
# ایجاد فایل
nano docker-compose.yml
```

محتوای فایل `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://medium_user:your_secure_password@db:5432/medium_farsi
      - NEXTAUTH_URL=http://192.168.1.100:3000
      - NEXTAUTH_SECRET=your-super-secret-key
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=medium_farsi
      - POSTGRES_USER=medium_user
      - POSTGRES_PASSWORD=your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### اجرا با Docker:
```bash
# ساخت و اجرا
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# توقف
docker-compose down
```

---

## 🔧 مرحله ۸: دیباگ کردن

### فعال‌سازی دیباگ در VS Code:
```bash
# نصب افزونه Remote Development
# در VS Code: Ctrl+Shift+P → Remote Development: Connect to Host

# یا از طریق CLI
code --remote=ssh-remote+ubuntu@192.168.1.100/home/ubuntu/medium-persian-clone
```

### دیباگ از طریق مرورگر:
```bash
# باز کردن دیباگر مرورگر
# در مرورگر: Ctrl+Shift+I (یا F12)
# به تب Network بروید و درخواست‌ها را بررسی کنید
```

---

## 📊 مرحله ۹: مانیتورینگ

### مشاهده لاگ‌های برنامه:
```bash
# مشاهده لاگ‌های زنده
tail -f dev.log

# یا مشاهده تمام لاگ‌ها
cat dev.log

# فیلتر لاگ‌ها برای خطاها
grep -i error dev.log
```

### مانیتورینگ منابع سیستم:
```bash
# استفاده از CPU و حافظه
htop

# استفاده از دیسک
df -h

# استفاده از شبکه
netstat -tulpn
```

### مانیتورینگ PostgreSQL:
```bash
# وضعیت سرویس
sudo systemctl status postgresql

# اتصالات فعال
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# حجم دیتابیس
sudo -u postgres psql -c "SELECT pg_size.pretty(pg_database_size('medium_farsi'));"
```

---

## 🚨 عیب‌یابی رایج

### مشکل: پورت 3000 اشغال است
```bash
# پیدا کردن فرآیند روی پورت 3000
sudo lsof -i :3000

# کشتن فرآیند
sudo kill -9 PID

# یا استفاده از پورت دیگر
PORT=3001 npm run dev
```

### مشکل: خطای اتصال به دیتابیس
```bash
# بررسی وضعیت PostgreSQL
sudo systemctl status postgresql

# تست اتصال
psql -h localhost -U medium_user -d medium_farsi

# ری‌استارت سرویس
sudo systemctl restart postgresql
```

### مشکل: خطای NODE_ENV
```bash
# تنظیم متغیر محیطی
export NODE_ENV=development

# یا در فایل .env.local
echo "NODE_ENV=development" >> .env.local
```

### مشکل: دسترسی به API از دیگر دستگاه‌ها
```bash
# بررسی فایل next.config.js
# مطمئن شوید این تنظیمات وجود دارد:
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://192.168.1.100:3000/api/:path*`,
      },
    ]
  },
}
```

---

## 🔄 مرحله ۱۰: دیپلوی روی ابونتو

### ساخت پروژه برای تولید:
```bash
# ساخت نسخه نهایی
npm run build

# ساخت Docker Image
docker build -t medium-persian-clone .

# تگ کردن ایمیج
docker tag medium-persian-clone:latest your-username/medium-persian-clone:latest
```

### اجرا به صورت سرویس:
```bash
# ایجاد فایل سرویس systemd
sudo nano /etc/systemd/system/medium-persian.service
```

محتوای فایل:
```ini
[Unit]
Description=Medium Persian Clone
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/medium-persian-clone
ExecStart=/usr/bin/docker run --rm -p 3000:3000 medium-persian-clone:latest
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

فعال‌سازی سرویس:
```bash
# بارگذاری مجدد systemd
sudo systemctl daemon-reload

# فعال‌سازی سرویس
sudo systemctl enable medium-persian.service

# اجرای سرویس
sudo systemctl start medium-persian.service

# بررسی وضعیت
sudo systemctl status medium-persian.service
```

---

## 🌍 مرحله ۱۱: بهینه‌سازی برای ابونتو

### بهینه‌سازی PostgreSQL:
```bash
# ویرایش فایل postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# این تنظیمات را اضافه کنید:
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# ری‌استارت PostgreSQL
sudo systemctl restart postgresql
```

### بهینه‌سازی Node.js:
```bash
# افزایش تعداد فایل‌های باز
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 📱 مرحله ۱۲: دسترسی از موبایل

### پیدا کردن IP برای دسترسی از خارج:
```bash
# نصب ابزار finding IP
sudo apt install -y curl

# دریافت IP عمومی
curl ifconfig.me

# یا استفاده از سایت
# به whatismyipaddress.com بروید
```

### پیکربندی دسترسی از موبایل:
1. از طریق دیتای موبایل به ابونتو متصل شوید
2. IP عمومی را پیدا کنید
3. در موبایل به آدرس `http://YOUR_PUBLIC_IP:3000` بروید

---

## 🎯 نکات پیشرفته

### استفاده از HTTPS محلی:
```bash
# نصب mkcert
sudo apt install -y mkcert

# ایجاد CA محلی
mkcert -install

# ایجاد گواهی SSL
mkcert localhost 127.0.0.1 ::1

# در .env.local:
NEXTAUTH_URL="https://localhost:3000"
```

### بکاپ‌گیری خودکار:
```bash
# ایجاد اسکریپت بکاپ
nano backup.sh
```

محتوای `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"

mkdir -p $BACKUP_DIR

# بکاپ دیتابیس
sudo -u postgres pg_dump medium_farsi > $BACKUP_DIR/db_backup_$DATE.sql

# بکاپ فایل‌های پروژه
tar -czf $BACKUP_DIR/project_backup_$DATE.tar.gz /home/ubuntu/medium-persian-clone

echo "Backup completed: $DATE"
```

اجرا دادن دسترسی اجرا:
```bash
chmod +x backup.sh

# اجرای بکاپ
./backup.sh
```

---

## 🎉 تبریک!

پس از طی این مراحل، شما:
- ✅ پروژه مدیوم فارسی را روی ابونتو 24.4 اجرا کرده‌اید
- ✅ دیتابیس PostgreSQL را پیکربندی کرده‌اید
- ✅ از کامپیوتر دیگر به پروژه دسترسی دارید
- ✅ می‌توانید دیباگ و توسعه دهید
- ✅ پروژه را به صورت سرویس اجرا کنید

**اگر در هر مرحله‌ای به مشکل برخوردید، لاگ‌ها را بررسی کنید یا از مستندات پروژه کمک بگیرید!**

موفق باشید! 🚀🇮🇷