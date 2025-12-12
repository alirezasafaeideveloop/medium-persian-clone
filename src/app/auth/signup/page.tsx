import { SignUpForm } from "@/components/auth/SignUpForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 space-x-reverse">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">م</span>
            </div>
            <span className="font-bold text-xl">مدیوم فارسی</span>
          </Link>
          <p className="mt-4 text-muted-foreground">
            به جامعه نویسندگان فارسی‌زبان بپیوندید
          </p>
        </div>

        {/* Sign Up Form */}
        <SignUpForm />

        {/* Back to Home */}
        <div className="text-center">
          <Button variant="ghost" asChild>
            <Link href="/" className="inline-flex items-center">
              بازگشت به صفحه اصلی
              <ArrowRight className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}