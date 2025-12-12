"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail, 
  Send, 
  MessageCircle, 
  Bug, 
  Lightbulb,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general"
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          type: "general"
        });
      } else {
        setError(data.error || "خطا در ارسال پیام");
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getSubjectIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-5 w-5 text-red-500" />;
      case "feature":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default:
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
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

      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">تماس با ما</h1>
          <p className="text-muted-foreground">
            برای سوالات، پیشنهادات یا گزارش مشکلات با ما در ارتباط باشید
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">ارسال پیام</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">پیام شما ارسال شد</h3>
                  <p className="text-muted-foreground">
                    با تشکر از تماس شما. پیامتان دریافت شد و در اسرع وقت بررسی خواهد شد.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSubmitted(false)}
                  className="mt-4"
                >
                  ارسال پیام جدید
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">نام و نام خانوادگی</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="نام خود را وارد کنید"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ایمیل خود را وارد کنید"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">نوع پیام</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="نوع پیام را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <MessageCircle className="h-4 w-4" />
                          <span>پیام عمومی</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bug">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Bug className="h-4 w-4" />
                          <span>گزارش خطا</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="feature">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Lightbulb className="h-4 w-4" />
                          <span>پیشنهاد ویژگی</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">موضوع</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="موضوع پیام خود را وارد کنید"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">متن پیام</Label>
                  <Textarea
                    id="message"
                    placeholder="پیام خود را اینجا بنویسید..."
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <Send className="ml-2 h-4 w-4" />
                      ارسال پیام
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">ایمیل</h3>
              <p className="text-sm text-muted-foreground">contact@medium-fa.ir</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">شبکه‌های اجتماعی</h3>
              <p className="text-sm text-muted-foreground">@medium_fa</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Bug className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">گزارش خطا</h3>
              <p className="text-sm text-muted-foreground">گیت‌هاب</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>سوالات متداول</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">چگونه مقاله منتشر کنم؟</h4>
              <p className="text-sm text-muted-foreground">
                پس از ثبت‌نام و ورود به حساب کاربری، از منوی اصلی روی "نوشتن" کلیک کنید و مقاله خود را بنویسید.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">آیا مدیوم فارسی رایگان است؟</h4>
              <p className="text-sm text-muted-foreground">
                بله، استفاده از مدیوم فارسی کاملاً رایگان است و هیچ هزینه‌ای برای نشر یا خواندن مقالات دریافت نمی‌شود.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">چگونه با نویسندگان دیگر ارتباط برقرار کنم؟</h4>
              <p className="text-sm text-muted-foreground">
                می‌توانید از طریق کامنت‌ها، دنبال کردن نویسندگان و ارسال پیام خصوصی با آن‌ها ارتباط برقرار کنید.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}