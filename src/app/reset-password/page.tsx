"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, XCircle } from "lucide-react";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError("لینک بازیابی رمز عبور نامعتبر است");
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("رمز عبور و تأیید آن یکسان نیستند");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error || "خطا در بازنشانی رمز عبور");
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">لینک نامعتبر</h2>
            <p className="text-muted-foreground mb-4">
              لینک بازیابی رمز عبور نامعتبر یا منقضی شده است
            </p>
            <div className="space-y-2">
              <Link href="/forgot-password">
                <Button className="w-full">
                  درخواست لینک جدید
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  بازگشت به ورود
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">م</span>
          </div>
          <h1 className="text-2xl font-bold">مدیوم فارسی</h1>
          <p className="text-muted-foreground mt-2">بازنشانی رمز عبور</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {success ? "رمز عبور بازنشانی شد" : "رمز عبور جدید"}
            </CardTitle>
            <CardDescription className="text-center">
              {success 
                ? "رمز عبور شما با موفقیت بازنشانی شد"
                : "رمز عبور جدید خود را وارد کنید"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {success ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    رمز عبور شما با موفقیت بازنشانی شد
                  </p>
                  <p className="text-sm text-muted-foreground">
                    به زودی به صفحه ورود هدایت می‌شوید...
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    رفتن به صفحه ورود
                  </Button>
                </Link>
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
                  <Label htmlFor="password">رمز عبور جدید</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="رمز عبور جدید را وارد کنید"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 pl-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأیید رمز عبور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="رمز عبور را مجددا وارد کنید"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10 pl-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-1 top-1 h-8 w-8 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>رمز عبور باید حداقل شامل:</p>
                  <ul className="mr-4 space-y-1">
                    <li>• ۶ کاراکتر</li>
                    <li>• حداقل یک حرف</li>
                    <li>• حداقل یک عدد</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
                      در حال بازنشانی...
                    </>
                  ) : (
                    <>
                      بازنشانی رمز عبور
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    href="/login" 
                    className="text-sm text-primary hover:underline"
                  >
                    بازگشت به ورود
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}