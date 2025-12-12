"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("رمز عبور و تأیید آن یکسان نیستند");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("حساب کاربری با موفقیت ایجاد شد! در حال انتقال به صفحه ورود...");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      } else {
        setError(data.error || "خطا در ایجاد حساب کاربری");
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">ایجاد حساب کاربری</CardTitle>
        <CardDescription>
          به مدیوم فارسی بپیوندید و داستان‌های خود را به اشتراک بگذارید
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">نام و نام خانوادگی</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="نام کامل خود را وارد کنید"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              dir="ltr"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">نام کاربری</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="نام کاربری دلخواه"
              value={formData.username}
              onChange={handleChange}
              required
              dir="ltr"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="حداقل ۶ کاراکتر"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأیید رمز عبور</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="رمز عبور را مجدداً وارد کنید"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال ایجاد حساب...
              </>
            ) : (
              "ایجاد حساب کاربری"
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">
            قبلاً حساب دارید؟{" "}
            <Link href="/auth/signin" className="text-primary hover:underline">
              وارد شوید
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}