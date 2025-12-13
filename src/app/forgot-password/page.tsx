"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || "خطا در ارسال درخواست");
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">م</span>
          </div>
          <h1 className="text-2xl font-bold">مدیوم فارسی</h1>
          <p className="text-muted-foreground mt-2">بازیابی رمز عبور</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {submitted ? "ایمیل ارسال شد" : "فراموشی رمز عبور"}
            </CardTitle>
            <CardDescription className="text-center">
              {submitted 
                ? "لینک بازیابی رمز عبور به ایمیل شما ارسال شد"
                : "ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    ایمیل بازیابی رمز عبور به آدرس زیر ارسال شد:
                  </p>
                  <p className="font-medium text-primary">{email}</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• لینک بازیابی برای ۲۴ ساعت معتبر است</p>
                  <p>• ایمیل اسپم خود را نیز بررسی کنید</p>
                  <p>• اگر ایمیل را دریافت نکردید، دوباره تلاش کنید</p>
                </div>
                <div className="pt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSubmitted(false)}
                  >
                    ارسال مجدد ایمیل
                  </Button>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full">
                      بازگشت به ورود
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ایمیل خود را وارد کنید"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-10"
                      required
                    />
                  </div>
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
                      ارسال لینک بازیابی
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center space-y-2">
                  <Link 
                    href="/login" 
                    className="text-sm text-primary hover:underline"
                  >
                    بازگشت به ورود
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    حساب کاربری ندارید؟{" "}
                    <Link 
                      href="/register" 
                      className="text-primary hover:underline"
                    >
                      ثبت‌نام کنید
                    </Link>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}