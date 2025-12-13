"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Bookmark, 
  AtSign,
  Check,
  Trash2,
  Filter,
  Settings,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import Link from "next/link";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "bookmark" | "mention";
  message: string;
  actorName: string;
  actorUsername: string;
  actorImage: string | null;
  postTitle: string | null;
  postSlug: string | null;
  read: boolean;
  createdAt: Date;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id, activeTab, filter, page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        unreadOnly: activeTab === "unread" ? "true" : "false",
      });

      if (filter !== "all") {
        params.append("type", filter);
      }

      const response = await fetch(`/api/notifications?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        setUnreadCount(data.unreadCount);
        setTotalPages(data.pagination.pages);
        setHasMore(page < data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/update?id=${notificationId}`, {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/update?markAll=true", {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/update?id=${notificationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        );
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const deleteAllNotifications = async () => {
    if (window.confirm("آیا از حذف همه اطلاع‌رسانی‌ها مطمئن هستید؟")) {
      try {
        const response = await fetch("/api/notifications/update?deleteAll=true", {
          method: "DELETE",
        });

        if (response.ok) {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Error deleting all notifications:", error);
      }
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "bookmark":
        return <Bookmark className="h-5 w-5 text-yellow-500" />;
      case "mention":
        return <AtSign className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: faIR 
    });
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === "unread") return !notif.read;
    if (filter !== "all") return notif.type === filter;
    return true;
  });

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">ورود به حساب کاربری</h2>
            <p className="text-muted-foreground mb-4">
              برای مشاهده اطلاع‌رسانی‌ها باید وارد حساب کاربری خود شوید
            </p>
            <Link href="/login">
              <Button>ورود</Button>
            </Link>
          </CardContent>
        </Card>
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
              <Link href="/">بازگشت به صفحه اصلی</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">اطلاع‌رسانی‌ها</h1>
          <p className="text-muted-foreground">
            آخرین فعالیت‌ها و تعاملات با محتوای شما
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  <p className="text-sm text-muted-foreground">همه اطلاع‌رسانی‌ها</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-sm text-muted-foreground">خوانده نشده</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Check className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{notifications.length - unreadCount}</p>
                  <p className="text-sm text-muted-foreground">خوانده شده</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all">همه</TabsTrigger>
                  <TabsTrigger value="unread">خوانده نشده</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="فیلتر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه انواع</SelectItem>
                    <SelectItem value="like">لایک‌ها</SelectItem>
                    <SelectItem value="comment">کامنت‌ها</SelectItem>
                    <SelectItem value="follow">دنبال کردن</SelectItem>
                    <SelectItem value="bookmark">نشان کردن</SelectItem>
                    <SelectItem value="mention">منشن‌ها</SelectItem>
                  </SelectContent>
                </Select>

                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={markAllAsRead}
                  >
                    خواندن همه
                  </Button>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={deleteAllNotifications}
                  className="text-red-500 hover:text-red-600"
                >
                  حذف همه
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchNotifications}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading && page === 1 ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="h-10 w-10 rounded-full bg-muted"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                        <div className="h-3 w-1/2 bg-muted rounded"></div>
                        <div className="h-3 w-1/4 bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">اطلاع‌رسانی‌ای یافت نشد</h3>
                <p className="text-muted-foreground">
                  {activeTab === "unread" 
                    ? "هیچ اطلاع‌رسانی خوانده نشده‌ای وجود ندارد"
                    : "هنوز اطلاع‌رسانی جدیدی برای شما وجود ندارد"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md ${
                  !notification.read ? "border-l-4 border-l-primary bg-blue-50/30" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.actorImage || undefined} alt={notification.actorName} />
                          <AvatarFallback className="text-sm">
                            {notification.actorName.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{notification.actorName}</span>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs">جدید</Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.postTitle && (
                        <Link 
                          href={`/article/${notification.postSlug}`}
                          className="text-primary hover:underline block mb-2"
                        >
                          {notification.postTitle}
                        </Link>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                        
                        <div className="flex items-center space-x-1 space-x-reverse">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-2"></div>
                  در حال بارگذاری...
                </>
              ) : (
                "بارگذاری بیشتر"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}