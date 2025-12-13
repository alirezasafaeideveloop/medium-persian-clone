# مستندات استقرار تولید (Production Deployment)

این مستند به شما کمک می‌کند تا کلون مدیوم فارسی را در محیط تولید مستقر کنید.

## پیش‌نیازها

- Node.js 18 یا بالاتر
- npm یا yarn
- Docker و Docker Compose (اختیاری)
- PostgreSQL (برای محیط تولید)
- Redis (برای کش و سشن‌ها)
- Nginx (برای reverse proxy)
- SSL Certificate

## مراحل استقرار

### 1. آماده‌سازی محیط

```bash
# کلون پروژه
git clone <repository-url>
cd medium-persian-clone

# نصب وابستگی‌ها
npm install

# کپی فایل محیطی
cp .env.production.example .env.production
```

### 2. پیکربندی متغیرهای محیطی

فایل `.env.production` را ویرایش کنید:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/medium_clone"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"
```

### 3. ساخت دیتابیس

```bash
# ساخت کلاینت Prisma
npx prisma generate

# اجرای migrationها
npx prisma migrate deploy

# فشردن اسکیمای دیتابیس
npx prisma db push
```

### 4. ساخت اپلیکیشن

```bash
# ساخت برای محیط تولید
npm run build

# تحلیل باندل (اختیاری)
ANALYZE=true npm run build
```

### 5. استقرار با Docker (توصیه شده)

```bash
# ساخت و اجرا با Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# مشاهده لاگ‌ها
docker-compose -f docker-compose.prod.yml logs -f
```

### 6. استقرار دستی

```bash
# اجرای اسکریپ استقرار
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## پیکربندی Nginx

فایل `nginx.conf` را مطابق با دامنه خود پیکربندی کنید:

```nginx
server_name your-domain.com www.your-domain.com;
```

## SSL Certificate

از Let's Encrypt برای دریافت گواهی SSL رایگان استفاده کنید:

```bash
# نصب Certbot
sudo apt install certbot python3-certbot-nginx

# دریافت گواهی SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## مانیتورینگ و لاگ‌گیری

### health check

```bash
# بررسی سلامت اپلیکیشن
curl https://your-domain.com/api/health
```

### مشاهده لاگ‌ها

```bash
# لاگ‌های Docker
docker-compose -f docker-compose.prod.yml logs app

# لاگ‌های Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## بهینه‌سازی عملکرد

### 1. کش

- Redis برای سشن‌ها و کش
- Nginx برای کش فایل‌های استاتیک
- CDN برای فایل‌های رسانه‌ای

### 2. فشرده‌سازی

- Gzip برای فایل‌های متنی
- Brotli برای فشرده‌سازی بهتر

### 3. امنیت

- HTTPS با SSL/TLS
- Security headers
- Rate limiting
- CORS configuration

## بکاپ‌گیری

### بکاپ دیتابیس

```bash
# بکاپ PostgreSQL
pg_dump -h localhost -U postgres medium_clone > backup.sql

# بازیابی بکاپ
psql -h localhost -U postgres medium_clone < backup.sql
```

### بکاپ فایل‌ها

```bash
# بکاپ فایل‌های آپلود شده
tar -czf uploads-backup.tar.gz uploads/

# بکاپ کل پروژه
tar -czf project-backup.tar.gz --exclude='node_modules' --exclude='.git' .
```

## عیب‌یابی

### مشکلات رایج

1. **خطای DATABASE_URL**
   - مطمئن شوید دیتابیس در حال اجراست
   - بررسی کنید URL صحیح است

2. **خطای NEXTAUTH_SECRET**
   - یک رشته تصادفی و قوی ایجاد کنید
   - مطمئن شوید در تمام محیط‌ها یکسان است

3. **مشکلات SSL**
   - گواهی SSL معتبر است
   - Nginx به درستی پیکربندی شده

4. **مشکلات عملکرد**
   - کش فعال است
   - فشرده‌سازی فعال است
   - منابع کافی اختصاص داده شده

### ابزارهای دیباگ

```bash
# بررسی پورت‌های باز
netstat -tulpn

# بررسی وضعیت سرویس‌ها
systemctl status nginx
docker ps

# بررسی منابع
htop
df -h
free -h
```

## به‌روزرسانی

```bash
# کشیدن آخرین تغییرات
git pull origin main

# نصب وابستگی‌های جدید
npm install

# ساخت مجدد
npm run build

# ری‌استارت سرویس‌ها
docker-compose -f docker-compose.prod.yml restart
```

## پشتیبانی

در صورت بروز هرگونه مشکل، از طریق راه‌های زیر با ما تماس بگیرید:

- GitHub Issues
- ایمیل: support@your-domain.com
- مستندات: https://docs.your-domain.com