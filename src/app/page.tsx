"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Clock, Bookmark, Users, BookOpen } from "lucide-react";

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  featured: boolean;
  readingTime?: number;
  tags: string[];
  authorId: string;
  author: {
    name: string;
    username?: string;
    image?: string;
    bio?: string;
  };
  likes: number;
  bookmarks: number;
  views: number;
  createdAt: Date;
}

const trendingTopics = [
  { name: "هوش مصنوعی", count: 1234 },
  { name: "برنامه‌نویسی", count: 856 },
  { name: "استارتاپ", count: 642 },
  { name: "طراحی", count: 423 },
  { name: "بلاکچین", count: 389 }
];

const featuredPublications = [
  { name: "تکنولوژی فردا", slug: "tech-tomorrow", description: "مرجع مقالات تکنولوژی و نوآوری" },
  { name: "استارتاپ‌نامه", slug: "startup-notes", description: "داستان‌ها و درس‌های استارتاپی" },
  { name: "کدنویسی", slug: "coding-stories", description: "مقالات برنامه‌نویسی و توسعه نرم‌افزار" }
];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch("/api/posts?limit=10");
      if (response.ok) {
        const data = await response.json();
        setArticles(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const featuredArticle = articles.find(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 max-w-2xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                جایی که ایده‌ها زنده می‌شوند
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                مقالات بی‌نظیر را بخوانید، دانش خود را به اشتراک بگذارید و با نویسندگان فارسی‌زبان ارتباط برقرار کنید
              </p>
              <div className="flex justify-center space-x-4 space-x-reverse">
                <Button size="lg" className="px-8">
                  شروع به خواندن
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  شروع به نوشتن
                </Button>
              </div>
            </div>
          </section>

          {/* Featured Article */}
          {loading ? (
            <div className="mb-12">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          ) : featuredArticle ? (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">مقاله ویژه</h2>
              <ArticleCard article={featuredArticle} variant="featured" />
            </section>
          ) : null}

          <Separator className="my-8" />

          {/* Featured Publications */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                انتشارات ویژه
              </h2>
              <Button variant="outline" asChild>
                <a href="/publications">مشاهده همه</a>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPublications.map((publication) => (
                <div key={publication.slug} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{publication.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{publication.description}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/publications/${publication.slug}`}>مشاهده</a>
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-8" />

          {/* Recent Articles */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">مقالات اخیر</h2>
              <Button variant="outline">مشاهده همه</Button>
            </div>
            
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {regularArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}