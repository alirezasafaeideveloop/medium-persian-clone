"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  Clock, 
  Eye, 
  Heart, 
  TrendingUp,
  Users,
  Hash,
  Loader2,
  FileText
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  coverImage?: string;
  published: boolean;
  featured: boolean;
  readingTime?: number;
  tags: string[];
  author: {
    name: string;
    username?: string;
    image?: string;
    avatar?: string;
  };
  likes: number;
  bookmarks: number;
  views: number;
  createdAt: Date;
}

interface UserResult {
  id: string;
  name: string;
  username?: string;
  bio?: string;
  image?: string;
  _count: {
    posts: number;
    followers: number;
  };
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [type, setType] = useState("posts");
  const [sort, setSort] = useState("relevance");
  const [results, setResults] = useState<SearchResult[] | UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery, 1);
    } else {
      setResults([]);
      setTotalPages(0);
    }
  }, [debouncedQuery, type, sort]);

  const performSearch = async (searchQuery: string, pageNum: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type,
        sort,
        page: pageNum.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (pageNum === 1) {
          setResults(data.results);
        } else {
          setResults(prev => [...prev, ...data.results]);
        }
        setTotalPages(data.pagination.pages);
        setHasMore(pageNum < data.pagination.pages);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim(), 1);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      performSearch(query, page + 1);
      setPage(prev => prev + 1);
    }
  };

  const handleTypeChange = (newType: string) => {
    setType(newType);
    setPage(1);
    setResults([]);
    if (query.trim()) {
      performSearch(query.trim(), 1);
    }
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
    setResults([]);
    if (query.trim()) {
      performSearch(query.trim(), 1);
    }
  };

  const handleTopicClick = (topic: string) => {
    setQuery(topic);
    searchInputRef.current?.focus();
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

      <div className="max-w-4xl mx-auto p-6">
        {/* Search Form */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="جستجوی مقالات، نویسندگان یا موضوعات..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pr-10 text-lg"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="posts">مقالات</SelectItem>
                    <SelectItem value="users">نویسندگان</SelectItem>
                    <SelectItem value="topics">موضوعات</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">مرتبط‌ترین</SelectItem>
                    <SelectItem value="date">جدیدترین</SelectItem>
                    <SelectItem value="views">پربازدیدترین</SelectItem>
                    <SelectItem value="likes">محبوب‌ترین</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && page === 1 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {query && results.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {totalPages > 1 
                      ? `نتایج جستجو برای "${query}" (صفحه ${page} از ${totalPages})`
                      : `نتایج جستجو برای "${query}"`
                    }
                  </h2>
                  <Badge variant="secondary">
                    {results.length} نتیجه
                  </Badge>
                </div>
              </div>
            )}

            {query && results.length === 0 && !loading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    نتیجه‌ای برای "${query}" یافت نشد
                  </h3>
                  <p className="text-muted-foreground">
                    لطفاً کلمات کلیدی را تغییر دهید یا موضوعات دیگر را بررسی کنید.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Results List */}
            {results.length > 0 && (
              <div className="space-y-6">
                {type === "posts" && (
                  results.map((result) => (
                    <ArticleCard key={result.id} article={result} />
                  ))
                )}

                {type === "users" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((user) => (
                      <Card key={user.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.image} alt={user.name} />
                              <AvatarFallback>
                                {user.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{user.name}</h3>
                              {user.username && (
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                              )}
                              {user.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                              )}
                              <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <FileText className="h-3 w-3 ml-1" />
                                  {user._count?.posts || 0}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 ml-1" />
                                  {user._count?.followers || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {type === "topics" && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {results.map((topic: any, index) => (
                      <Card 
                        key={topic.tag} 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleTopicClick(topic.tag)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary mb-2">
                            #{index + 1}
                          </div>
                          <h3 className="font-semibold truncate">{topic.tag}</h3>
                          <p className="text-sm text-muted-foreground">
                            {topic.count} مقاله
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={loadMore} 
                  disabled={loading}
                  variant="outline"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      در حال بارگذاری...
                    </>
                  ) : (
                    <>
                      بارگذاری نتایج بیشتر
                      <TrendingUp className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <SearchPageContent />
    </Suspense>
  );
}