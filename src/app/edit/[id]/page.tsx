"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArticleEditor } from "@/components/editor/ArticleEditor";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [articleId, setArticleId] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setArticleId(id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (isClient && status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router, isClient]);

  useEffect(() => {
    if (isClient && status === "authenticated" && articleId) {
      fetchArticle();
    }
  }, [isClient, status, articleId]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/posts/${articleId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Check if user is the author
        if (data.authorId !== session?.user?.id) {
          setError("شما مجوز ویرایش این مقاله را ندارید");
          setLoading(false);
          return;
        }

        setArticle({
          title: data.title,
          subtitle: data.subtitle,
          content: data.content,
          tags: JSON.parse(data.tags || "[]"),
          coverImage: data.coverImage,
        });
      } else {
        setError("مقاله یافت نشد");
      }
    } catch (error) {
      setError("خطا در دریافت مقاله");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (data: any) => {
    // Redirect to the updated article
    router.push(`/article/${articleId}`);
  };

  const handleCancel = () => {
    router.push(`/article/${articleId}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>در حال بارگذاری مقاله...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <Button onClick={() => router.push("/")}>بازگشت به صفحه اصلی</Button>
        </div>
      </div>
    );
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
              <Link href={`/article/${articleId}`}>
                بازگشت به مقاله
                <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="py-8">
        <ArticleEditor
          mode="edit"
          initialData={article}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </main>
    </div>
  );
}