"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  ArrowRight,
  Save,
  Camera
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    bio: session?.user?.bio || "",
    email: session?.user?.email || "",
    username: session?.user?.username || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("تنظیمات با موفقیت ذخیره شد");
      } else {
        const data = await response.json();
        toast.error(data.error || "خطا در ذخیره تنظیمات");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

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
              <a href="/">بازگشت به صفحه اصلی</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">تنظیمات</h1>
          <p className="text-muted-foreground">
            اطلاعات پروفایل و تنظیمات حساب کاربری خود را مدیریت کنید
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">پروفایل</TabsTrigger>
            <TabsTrigger value="account">حساب کاربری</TabsTrigger>
            <TabsTrigger value="notifications">اطلاع‌رسانی‌ها</TabsTrigger>
            <TabsTrigger value="privacy">حریم خصوصی</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="ml-2 h-5 w-5" />
                  اطلاعات پروفایل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || ""} />
                    <AvatarFallback className="text-lg">
                      {session?.user?.name?.slice(0, 2) || "کاربر"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Camera className="ml-2 h-4 w-4" />
                      تغییر تصویر پروفایل
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">نام و نام خانوادگی</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="نام کامل خود را وارد کنید"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">نام کاربری</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="نام کاربری"
                    dir="ltr"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">بیوگرافی</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="خودتان را معرفی کنید..."
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4" />
                      ذخیره تغییرات
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="ml-2 h-5 w-5" />
                  امنیت حساب کاربری
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    ایمیل قابل تغییر نیست. برای تغییر ایمیل با پشتیبانی تماس بگیرید.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">تأیید دو مرحله‌ای</h4>
                      <p className="text-sm text-muted-foreground">
                        افزودن لایه امنیتی به حساب کاربری
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      فعال‌سازی
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">رمز عبور</h4>
                      <p className="text-sm text-muted-foreground">
                        آخرین تغییر: ۳۰ روز پیش
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      تغییر رمز عبور
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="ml-2 h-5 w-5" />
                  اطلاع‌رسانی‌ها
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">اطلاع‌رسانی‌های ایمیل</h4>
                      <p className="text-sm text-muted-foreground">
                        دریافت ایمیل برای لایک‌ها و کامنت‌ها
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      مدیریت
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">اطلاع‌رسانی‌های مرورگر</h4>
                      <p className="text-sm text-muted-foreground">
                        نوتیفیکیشن‌های دسکتاپ
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      مدیریت
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="ml-2 h-5 w-5" />
                  حریم خصوصی
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">نمایش پروفایل عمومی</h4>
                      <p className="text-sm text-muted-foreground">
                        همه کاربران می‌توانند پروفایل شما را ببینند
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      مدیریت
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">نمایش در موتورهای جستجو</h4>
                      <p className="text-sm text-muted-foreground">
                        پروفایل شما در نتایج جستجو نمایش داده شود
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      مدیریت
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}