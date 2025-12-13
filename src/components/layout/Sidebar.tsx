"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UserProfileSidebar } from "@/components/profile/UserProfileSidebar";
import { 
  Home, 
  TrendingUp, 
  Bookmark, 
  Hash,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Heart,
  BarChart3
} from "lucide-react";

const topics = [
  { name: "تکنولوژی", count: 1234, color: "bg-blue-100 text-blue-800" },
  { name: "برنامه‌نویسی", count: 856, color: "bg-green-100 text-green-800" },
  { name: "طراحی", count: 642, color: "bg-purple-100 text-purple-800" },
  { name: "کسب‌وکار", count: 423, color: "bg-orange-100 text-orange-800" },
  { name: "علم", count: 389, color: "bg-red-100 text-red-800" },
  { name: "هنر", count: 267, color: "bg-pink-100 text-pink-800" },
  { name: "فرهنگ", count: 198, color: "bg-yellow-100 text-yellow-800" },
  { name: "ورزش", count: 156, color: "bg-indigo-100 text-indigo-800" },
];

export function Sidebar() {
  const [showMoreTopics, setShowMoreTopics] = useState(false);

  return (
    <aside className="w-64 border-l bg-background p-4 hidden lg:block">
      <div className="space-y-4">
        {/* User Profile */}
        <UserProfileSidebar />

        <Separator />

        {/* Main Navigation */}
        <nav className="space-y-1">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start">
              <Home className="ml-2 h-4 w-4" />
              صفحه اصلی
            </Button>
          </Link>
          <Link href="/trending">
            <Button variant="ghost" className="w-full justify-start">
              <TrendingUp className="ml-2 h-4 w-4" />
              محبوب‌ها
            </Button>
          </Link>
          <Link href="/bookmarks">
            <Button variant="ghost" className="w-full justify-start">
              <Bookmark className="ml-2 h-4 w-4" />
              نشان‌شده‌ها
            </Button>
          </Link>
        </nav>

        <Separator />

        {/* Topics */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground">موضوعات محبوب</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoreTopics(!showMoreTopics)}
            >
              {showMoreTopics ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <div className="space-y-2">
            {topics.slice(0, showMoreTopics ? topics.length : 5).map((topic) => (
              <Link key={topic.name} href={`/topic/${topic.name}`}>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{topic.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {topic.count}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quick Links */}
        <div className="space-y-2">
          <Link href="/help">
            <Button variant="ghost" className="w-full justify-start text-sm">
              <BookOpen className="ml-2 h-4 w-4" />
              راهنما
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>© 2024 مدیوم فارسی</p>
            <div className="flex space-x-2 space-x-reverse">
              <Link href="/about" className="hover:text-foreground">درباره ما</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-foreground">حریم خصوصی</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-foreground">شرایط استفاده</Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}