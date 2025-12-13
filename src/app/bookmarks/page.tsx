"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Bookmark, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface BookmarkedPost {
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
  };
  likes: number;
  bookmarks: number;
  views: number;
  createdAt: Date;
  bookmarkedAt: Date;
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/auth/signin";
      return;
    }

    if (status === "authenticated") {
      fetchBookmarks();
    }
  }, [status]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch("/api/bookmark");
      if (response.ok) {
        const data = await response.json();
        setBookmarkedPosts(data.bookmarkedPosts || []);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPosts = bookmarkedPosts
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime();
      } else {
        return new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime();
      }
    });

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <h1 className="text-xl font-semibold">نشان‌شده‌ها</h1>
            <Link href="/">
              <Button variant="ghost">بازگشت</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="جستجو در نشان‌شده‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              onClick={() => setSortBy("recent")}
            >
              جدیدترین
            </Button>
            <Button
              variant={sortBy === "oldest" ? "default" : "outline"}
              onClick={() => setSortBy("oldest")}
            >
              قدیمی‌ترین
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-5/6 bg-muted rounded"></div>
                    <div className="h-32 w-full bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedPosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "مقاله‌ای یافت نشد" : "هنوز مقاله‌ای نشان نکرده‌اید"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "مقاله‌ای با این مشخصات در نشان‌شده‌های شما وجود ندارد."
                  : "مقالاتی که دوست دارید بعداً در اینجا نمایش داده می‌شوند."
                }
              </p>
              {!searchTerm && (
                <Link href="/" className="inline-block mt-4">
                  <Button>کشف مقالات جدید</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {filteredAndSortedPosts.length} مقاله نشان‌شده
              </h2>
            </div>
            
            {filteredAndSortedPosts.map((post) => (
              <div key={post.id} className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    نشان‌شده در {new Date(post.bookmarkedAt).toLocaleDateString("fa-IR")}
                  </div>
                </div>
                <ArticleCard article={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}