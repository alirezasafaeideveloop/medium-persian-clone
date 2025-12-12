"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart, 
  Bookmark, 
  Users,
  Calendar,
  ArrowRight,
  FileText
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";

interface StatsData {
  totalViews: number;
  totalLikes: number;
  totalBookmarks: number;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
  monthlyViews: { month: string; views: number }[];
  topPosts: {
    id: string;
    title: string;
    views: number;
    likes: number;
  }[];
  postStats: {
    published: number;
    drafts: number;
    total: number;
  };
}

export default function StatsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4">در حال بارگذاری آمار...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">داده‌ها در دسترس نیستند</h2>
          <p className="text-muted-foreground">در دریافت آمار مشکلی پیش آمد.</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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

      {/* Stats Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">آمار و تحلیل</h1>
          <p className="text-muted-foreground">
            آمار دقیق عملکرد مقالات و تعاملات کاربران
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString("fa-IR")}</div>
              <div className="text-sm text-muted-foreground">کل بازدیدها</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString("fa-IR")}</div>
              <div className="text-sm text-muted-foreground">کل لایک‌ها</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Bookmark className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{stats.totalBookmarks.toLocaleString("fa-IR")}</div>
              <div className="text-sm text-muted-foreground">کل نشان‌شده‌ها</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{stats.totalFollowers}</div>
              <div className="text-sm text-muted-foreground">دنبال‌کنندگان</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="ml-2 h-5 w-5" />
                بازدیدهای ماهانه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyViews}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Posts Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="ml-2 h-5 w-5" />
                آمار مقالات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'منتشر شده', value: stats.postStats.published, fill: '#0088FE' },
                      { name: 'پیش‌نویس', value: stats.postStats.drafts, fill: '#00C49F' },
                    { name: 'کل', value: stats.postStats.total, fill: '#FFBB28' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {COLORS.map((fill, index) => (
                      <Cell key={`cell-${index}`} fill={fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="ml-2 h-5 w-5" />
                محبوب‌ترین مقالات
              </div>
              <Badge variant="secondary">{stats.topPosts.length} مقاله</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{post.title}</h4>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 ml-1" />
                        {post.views.toLocaleString("fa-IR")}
                      </div>
                      <div className="flex items-center">
                        <Heart className="h-3 w-3 ml-1" />
                        {post.likes}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}