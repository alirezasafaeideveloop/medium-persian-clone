"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArticleEditor } from "@/components/editor/ArticleEditor";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WritePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router, isClient]);

  const handleSave = (data: any) => {
    // Redirect to the newly created article or back to home
    router.push("/");
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (!isClient || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">م</span>
            </div>
            <span className="font-bold text-xl">مدیوم فارسی</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/">
                بازگشت به صفحه اصلی
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="py-8">
        <ArticleEditor
          mode="create"
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </main>
    </div>
  );
}