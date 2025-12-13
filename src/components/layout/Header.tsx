"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, Bell, User, Settings, LogOut, Moon, Sun, Database } from "lucide-react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">م</span>
          </div>
          <span className="font-bold text-xl">مدیوم فارسی</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            صفحه اصلی
          </Link>
          <Link href="/trending" className="text-sm font-medium hover:text-primary transition-colors">
            محبوب‌ها
          </Link>
          <Link href="/topics" className="text-sm font-medium hover:text-primary transition-colors">
            موضوعات
          </Link>
          <Link href="/publications" className="text-sm font-medium hover:text-primary transition-colors">
            انتشارات
          </Link>
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="جستجو در مقالات..."
              className="w-full pl-10 pr-4 py-2 rounded-full border bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setIsSearchOpen(false)}
              onClick={() => window.location.href = "/search"}
              dir="rtl"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {session ? (
            <>
              {/* Start Writing */}
              <Link href="/write">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Plus className="ml-2 h-4 w-4" />
                  شروع نوشتن
                </Button>
              </Link>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>
                        {session.user?.name?.slice(0, 2) || "کاربر"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${session.user?.username}`}>
                      <User className="ml-2 h-4 w-4" />
                      پروفایل
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="ml-2 h-4 w-4" />
                      تنظیمات
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/data-management">
                      <Database className="ml-2 h-4 w-4" />
                      مدیریت داده‌ها
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="ml-2 h-4 w-4" />
                    خروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/signin">ورود</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/signup">ثبت‌نام</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}