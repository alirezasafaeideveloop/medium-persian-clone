"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  Globe, 
  Heart, 
  Shield, 
  Zap,
  ArrowRight,
  Github,
  Twitter,
  Mail
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">م</span>
            </div>
            <span className="font-bold text-xl">مدیوم فارسی</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/">بازگشت به صفحه اصلی</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">درباره مدیوم فارسی</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            پلتفرم مدرن برای نشر و خواندن مقالات فارسی در موضوعات مختلف
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">مأموریت ما</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg leading-relaxed">
              مدیوم فارسی با هدف ایجاد یک فضای حرفه‌ای و مدرن برای نویسندگان و خوانندگان فارسی‌زبان ایجاد شده است.
              ما می‌خواهیم بهترین تجربه را برای خلق، اشتراک‌گذاری و کشف محتوای باکیفیت فارسی فراهم کنیم.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">ویژگی‌های کلیدی</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">ویرایشگر قدرتمند</h3>
                <p className="text-sm text-muted-foreground">
                  ویرایشگر متن غنی با پشتیبانی کامل از زبان فارسی و RTL
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">جامعه فعال</h3>
                <p className="text-sm text-muted-foreground">
                  ارتباط با نویسندگان و خوانندگان از طریق کامنت‌ها و دنبال کردن
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">کشف محتوا</h3>
                <p className="text-sm text-muted-foreground">
                  سیستم جستجوی پیشرفته و موضوعات متنوع برای کشف مقالات مورد علاقه
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">تعاملات اجتماعی</h3>
                <p className="text-sm text-muted-foreground">
                  لایک، بوکمارک و اشتراک‌گذاری مقالات مورد علاقه
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">امنیت و حریم خصوصی</h3>
                <p className="text-sm text-muted-foreground">
                  حفاظت از اطلاعات کاربران و ارائه کنترل کامل بر محتوای شخصی
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">تجربه سریع</h3>
                <p className="text-sm text-muted-foreground">
                  رابط کاربری سریع و روان با بهینه‌سازی برای دستگاه‌های مختلف
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">آمار و ارقام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">۱۰۰۰+</div>
                <p className="text-sm text-muted-foreground">مقاله منتشر شده</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">۵۰۰+</div>
                <p className="text-sm text-muted-foreground">نویسنده فعال</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">۵۰۰۰+</div>
                <p className="text-sm text-muted-foreground">خواننده ماهانه</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">۵۰+</div>
                <p className="text-sm text-muted-foreground">موضوع مختلف</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">فناوری‌های استفاده شده</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">فرانت‌اند</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Next.js 15 با App Router</li>
                  <li>• TypeScript برای نوع‌دهی امن</li>
                  <li>• Tailwind CSS برای استایل‌دهی</li>
                  <li>• shadcn/ui برای کامپوننت‌های مدرن</li>
                  <li>• Framer Motion برای انیمیشن‌ها</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">بک‌اند</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Prisma ORM برای مدیریت دیتابیس</li>
                  <li>• SQLite برای ذخیره‌سازی داده‌ها</li>
                  <li>• NextAuth.js برای احراز هویت</li>
                  <li>• API Routes برای بک‌اند</li>
                  <li>• Zod برای اعتبارسنجی داده‌ها</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open Source */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">متن‌باز و جامعه‌محور</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-6">
              مدیوم فارسی یک پروژه متن‌باز است و از مشارکت‌های جامعه استقبال می‌کند.
              ما معتقدیم که بهترین محصولات توسط جامعه‌ای از توسعه‌دهندگان و کاربران خلق می‌شوند.
            </p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <Button variant="outline" asChild>
                <a href="https://github.com/medium-fa" target="_blank" rel="noopener noreferrer">
                  <Github className="ml-2 h-4 w-4" />
                  گیت‌هاب
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://twitter.com/medium_fa" target="_blank" rel="noopener noreferrer">
                  <Twitter className="ml-2 h-4 w-4" />
                  توییتر
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">تماس با ما</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-6">
              برای سوالات، پیشنهادات یا گزارش مشکلات، با ما در ارتباط باشید
            </p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <Button asChild>
                <Link href="/contact">
                  <Mail className="ml-2 h-4 w-4" />
                  تماس با ما
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">
                  <ArrowRight className="ml-2 h-4 w-4" />
                  شروع نوشتن
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}