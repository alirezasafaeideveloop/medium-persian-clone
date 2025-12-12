#!/bin/bash

# 🚀 اسکریپت نصب خودکار مدیوم فارسی روی ابونتو 24.4
# این اسکریپت تمام مراحل لازم را به صورت خودکار انجام می‌دهد

set -e  # خروج در صورت خطا

# رنگ‌ها برای خروجی بهتر
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# توابع چاپ
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# تابع بررسی دسترسی روت
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "این اسکریپت باید با دسترسی روت اجرا شود"
        log_info "لطفاً از دستور زیر استفاده کنید:"
        echo "sudo $0"
        exit 1
    fi
}

# تابع نمایش بنر
show_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║               🚀 نصب خودکار مدیوم فارسی                    ║"
    echo "║                      ابونتو 24.4                           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# تابع به‌روزرسانی سیستم
update_system() {
    log_step "۱. به‌روزرسانی سیستم..."
    apt update && apt upgrade -y
    log_info "سیستم با موفقیت به‌روزرسانی شد"
}

# تابع نصب پیش‌نیازها
install_dependencies() {
    log_step "۲. نصب پیش‌نیازهای اصلی..."
    
    # نصب ابزارهای پایه
    apt install -y curl wget git nano htop unzip software-properties-common
    
    # نصب Node.js 18
    log_info "در حال نصب Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # بررسی نسخه Node.js
    NODE_VERSION=$(node --version)
    log_info "Node.js نسخه $NODE_VERSION نصب شد"
    
    # نصب Docker و Docker Compose
    log_info "در حال نصب Docker..."
    apt install -y docker.io docker-compose
    
    # افزودن کاربر به گروه docker
    usermod -aG docker $SUDO_USER
    
    # نصب PostgreSQL
    log_info "در حال نصب PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    
    log_info "پیش‌نیازها با موفقیت نصب شدند"
}

# تابع پیکربندی PostgreSQL
configure_postgresql() {
    log_step "۳. پیکربندی PostgreSQL..."
    
    # فعال‌سازی سرویس
    systemctl start postgresql
    systemctl enable postgresql
    
    # دریافت IP ابونتو
    UBUNTU_IP=$(hostname -I | awk '{print $1}')
    
    # پیکربندی PostgreSQL برای اتصال از خارج
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost,$UBUNTU_IP'/" /etc/postgresql/14/main/postgresql.conf
    sed -i "s/#listen_addresses = '\*'/listen_addresses = '\*'/" /etc/postgresql/14/main/postgresql.conf
    
    # ری‌استارت سرویس
    systemctl restart postgresql
    
    log_info "PostgreSQL با موفقیت پیکربندی شد"
}

# تابع ایجاد دیتابیس
create_database() {
    log_step "۴. ایجاد دیتابیس و کاربر..."
    
    # ایجاد پسورد تصادفی
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # ایجاد کاربر و دیتابیس
    sudo -u postgres psql -c "CREATE USER medium_user WITH PASSWORD '$DB_PASSWORD';"
    sudo -u postgres psql -c "CREATE DATABASE medium_farsi OWNER medium_user;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE medium_farsi TO medium_user;"
    
    # ذخیره اطلاعات برای استفاده بعدی
    echo "POSTGRES_USER=medium_user" > /tmp/db_info.txt
    echo "POSTGRES_PASSWORD=$DB_PASSWORD" >> /tmp/db_info.txt
    echo "POSTGRES_DB=medium_farsi" >> /tmp/db_info.txt
    
    log_info "دیتابیس با موفقیت ایجاد شد"
    log_info "نام کاربر: medium_user"
    log_info "نام دیتابیس: medium_farsi"
}

# تابع دریافت پروژه
get_project() {
    log_step "۵. دریافت پروژه مدیوم فارسی..."
    
    cd /home/$SUDO_USER
    
    # اگر پوشه پروژه وجود دارد، آن را پاک می‌کنیم
    if [ -d "medium-persian-clone" ]; then
        log_warn "پوشه پروژه از قبل وجود دارد، در حال پاک کردن..."
        rm -rf medium-persian-clone
    fi
    
    # دریافت پروژه از GitHub (با استفاده از ریپازیتوری شما)
    log_info "در حال کلون پروژه از GitHub..."
    git clone https://github.com/z-ai-web-dev-sdk/medium-persian-clone.git
    
    # ورود به پوشه پروژه
    cd medium-persian-clone
    
    log_info "پروژه با موفقیت دریافت شد"
}

# تابع پیکربندی پروژه
configure_project() {
    log_step "۶. پیکربندی پروژه..."
    
    # نصب وابستگی‌ها
    log_info "در حال نصب وابستگی‌های پروژه..."
    npm install
    
    # خواندن اطلاعات دیتابیس
    source /tmp/db_info.txt
    
    # دریافت IP ابونتو
    UBUNTU_IP=$(hostname -I | awk '{print $1}')
    
    # تولید کلید تصادفی برای NextAuth
    NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    # ایجاد فایل .env.local
    cat > .env.local << EOF
# Database Configuration
DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB"

# NextAuth Configuration
NEXTAUTH_URL="http://$UBUNTU_IP:3000"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

# Environment
NODE_ENV="development"
EOF
    
    log_info "فایل .env.local با موفقیت ایجاد شد"
    log_info "URL پروژه: http://$UBUNTU_IP:3000"
}

# تابع آماده‌سازی دیتابیس
prepare_database() {
    log_step "۷. آماده‌سازی دیتابیس..."
    
    # نصب Prisma CLI به صورت سراسری
    npm install -g prisma
    
    # تولید کلاینت Prisma
    npx prisma generate
    
    # فشردن اسکیمای دیتابیس
    npx prisma db push
    
    log_info "دیتابیس با موفقیت آماده شد"
}

# تابع اجرای پروژه
run_project() {
    log_step "۸. اجرای پروژه..."
    
    # ایجاد سرویس systemd برای پروژه
    cat > /etc/systemd/system/medium-persian.service << EOF
[Unit]
Description=Medium Persian Clone
After=network.target postgresql.service

[Service]
Type=simple
User=$SUDO_USER
WorkingDirectory=/home/$SUDO_USER/medium-persian-clone
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # بارگذاری مجدد systemd
    systemctl daemon-reload
    
    # فعال‌سازی و اجرای سرویس
    systemctl enable medium-persian.service
    systemctl start medium-persian.service
    
    # صبر برای شروع سرویس
    sleep 5
    
    # بررسی وضعیت سرویس
    if systemctl is-active --quiet medium-persian.service; then
        log_info "پروژه با موفقیت اجرا شد"
    else
        log_error "خطا در اجرای پروژه"
        systemctl status medium-persian.service
    fi
}

# تابع نمایش اطلاعات نهایی
show_final_info() {
    UBUNTU_IP=$(hostname -I | awk '{print $1}')
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🎉 نصب با موفقیت تمام شد!                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${BLUE}📍 اطلاعات دسترسی:${NC}"
    echo -e "   🌐 آدرس پروژه: ${GREEN}http://$UBUNTU_IP:3000${NC}"
    echo -e "   📁 پوشه پروژه: ${GREEN}/home/$SUDO_USER/medium-persian-clone${NC}"
    echo -e "   🗄️ دیتابیس: ${GREEN}PostgreSQL (localhost:5432)${NC}"
    echo -e "   👤 کاربر دیتابیس: ${GREEN}medium_user${NC}"
    
    echo -e "${BLUE}🔧 دستورات مفید:${NC}"
    echo -e "   📊 مشاهده وضعیت سرویس: ${GREEN}systemctl status medium-persian.service${NC}"
    echo -e "   📋 مشاهده لاگ‌ها: ${GREEN}journalctl -u medium-persian -f${NC}"
    echo -e "   🔄 ری‌استارت سرویس: ${GREEN}sudo systemctl restart medium-persian.service${NC}"
    echo -e "   🛑 توقف سرویس: ${GREEN}sudo systemctl stop medium-persian.service${NC}"
    
    echo -e "${BLUE}📱 دسترسی از موبایل:${NC}"
    echo -e "   1. موبایل را به همان وای‌فای متصل کنید"
    echo -e "   2. مرورگر را باز کنید و به آدرس بالا بروید"
    
    echo -e "${YELLOW}⚠️ نکات مهم:${NC}"
    echo -e "   • پروژه به صورت سرویس در حال اجرا است"
    echo -e "   • برای توسعه، از سرویس توقف کرده و به صورت دستی اجرا کنید"
    echo -e "   • لاگ‌های پروژه در journalctl قابل مشاهده است"
    
    source /tmp/db_info.txt
    echo -e "${GREEN}🔐 اطلاعات دیتابیس (برای استفاده بعدی):${NC}"
    echo -e "   کاربر: $POSTGRES_USER"
    echo -e "   پسورد: $POSTGRES_PASSWORD"
    echo -e "   دیتابیس: $POSTGRES_DB"
}

# تابع اصلی
main() {
    show_banner
    
    log_info "شروع نصب خودکار مدیوم فارسی روی ابونتو 24.4..."
    echo
    
    check_root
    update_system
    install_dependencies
    configure_postgresql
    create_database
    get_project
    configure_project
    prepare_database
    run_project
    show_final_info
    
    echo -e "${GREEN}🎉 نصب با موفقیت تمام شد! پروژه شما در حال اجرا است.${NC}"
}

# اجرای تابع اصلی
main "$@"