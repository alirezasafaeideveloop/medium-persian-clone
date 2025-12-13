'use client'

import { BackupManager } from '@/components/backup/BackupManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Database, 
  Download, 
  Upload, 
  Shield, 
  Clock, 
  CheckCircle,
  BarChart3,
  FileText,
  Users
} from 'lucide-react'

export default function DataManagementPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            مدیریت داده‌ها
          </h1>
          <p className="text-muted-foreground">
            خروجی گرفتن، پشتیبان‌گیری و مدیریت داده‌های خود
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">مقالات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">دنبال‌کنندگان</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Download className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">خروجی‌ها</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">پشتیبان‌ها</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                خروجی گرفتن
              </CardTitle>
              <CardDescription>
                داده‌های خود را در فرمت‌های مختلف خروجی بگیرید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">خروجی JSON برای داده‌های ساختاریافته</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">خروجی CSV برای استفاده در اکسل</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">خروجی Markdown برای انتشار در پلتفرم‌های دیگر</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">خروجی تک مقاله یا تمام مقالات</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                پشتیبان‌گیری
              </CardTitle>
              <CardDescription>
                از داده‌های خود نسخه پشتیبان کامل ایجاد کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">پشتیبان کامل از تمام داده‌ها</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">انتخاب داده‌های مورد نظر برای پشتیبان</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">بازنشانی آسان داده‌ها</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">حفظ تاریخچه و زمان‌بندی</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backup Manager */}
        <BackupManager />

        {/* Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              نکات و راهنما
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  زمان‌بندی پیشنهادی
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• هفتگی: برای کاربران فعال</li>
                  <li>• ماهانه: برای کاربران معمولی</li>
                  <li>• قبل از هر تغییر بزرگ در داده‌ها</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  نکات امنیتی
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• فایل‌های پشتیبان را در مکان امن نگهداری کنید</li>
                  <li>• از چند نسخه پشتیبان مختلف داشته باشید</li>
                  <li>• به صورت دوره‌ای فایل‌های پشتیبان را تست کنید</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}