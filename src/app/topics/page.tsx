"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Hash, 
  TrendingUp, 
  Clock, 
  FileText, 
  Filter,
  Grid,
  List,
  ArrowRight
} from "lucide-react";

interface Topic {
  tag: string;
  count: number;
}

interface Category {
  name: string;
  value: string;
  count: number;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, [selectedCategory, sortBy]);

  const fetchTopics = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        sort: sortBy,
        page: pageNum.toString(),
        limit: "20",
      });

      const response = await fetch(`/api/topics?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (pageNum === 1) {
          setTopics(data.topics);
          setCategories(data.categories);
        }
        setTotalPages(data.pagination.pages);
        setHasMore(pageNum < data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchTopics(page + 1);
      setPage(prev => prev + 1);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    setTopics([]);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setPage(1);
    setTopics([]);
  };

  const handleTopicClick = (topic: string) => {
    // Navigate to search page with topic filter
    window.location.href = `/search?q=${encodeURIComponent(topic)}&type=posts`;
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4">در حال بارگذاری موضوعات...</p>
        </div>
      </div>
    );
  }

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

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">موضوعات</h1>
          <p className="text-muted-foreground">
            موضوعات محبوب برای کشف و دنبال کردن محتوای مورد علاقه شما
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="ml-2 h-5 w-5" />
              فیلترها
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="انتخاب دسته‌بندی" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه موضوعات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="مرتب‌سازی" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">محبوب‌ترین</SelectItem>
                  <SelectItem value="name">الفبایی</SelectItem>
                  <SelectItem value="recent">جدیدترین</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        {selectedCategory !== "all" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>دسته‌بندی: {categories.find(c => c.value === selectedCategory)?.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories
                  .filter(category => category.count > 0)
                  .map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? "default" : "outline"}
                      onClick={() => handleCategoryChange(category.value)}
                      className="h-16 p-3 flex flex-col items-center justify-center"
                    >
                      <div className="text-2xl font-bold mb-1">{category.count}</div>
                      <div className="text-sm">{category.name}</div>
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Topics Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {totalPages > 1 
                ? `موضوعات (صفحه ${page} از ${totalPages})`
                : "همه موضوعات"
              }
            </h2>
            <Badge variant="secondary">
              {topics.length} موضوع
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topics.map((topic, index) => (
              <Card 
                key={topic.tag} 
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => handleTopicClick(topic.tag)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2 group-hover:text-primary-600 transition-colors">
                    #{index + 1}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 truncate group-hover:text-primary-600">
                    {topic.tag}
                  </h3>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{topic.count} مقاله</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex flex-wrap justify-center gap-1">
                      <Hash className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary font-medium">کلیک کنید</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Load More */}
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
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  در حال بارگذاری...
                </>
              ) : (
                <>
                  نمایش موضوعات بیشتر
                  <ArrowRight className="mr-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}