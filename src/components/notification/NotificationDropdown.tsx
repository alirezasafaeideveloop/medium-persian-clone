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
  X,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface NotificationDropdownProps {
  unreadCount?: number;
}

export function NotificationDropdown({ unreadCount: propUnreadCount }: NotificationDropdownProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(propUnreadCount || 0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session?.user?.id]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=10");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "bookmark":
        return <Bookmark className="h-4 w-4 text-yellow-500" />;
      case "mention":
        return <AtSign className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: faIR 
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">اطلاع‌رسانی‌ها</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                خواندن همه
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">در حال بارگذاری...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">اطلاع‌رسانی جدیدی وجود ندارد</p>
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="relative">
                <DropdownMenuItem 
                  asChild
                  className={`p-4 cursor-pointer hover:bg-muted/50 ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 space-x-reverse mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={notification.actorImage || undefined} alt={notification.actorName || ""} />
                            <AvatarFallback className="text-xs">
                              {notification.actorName.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{notification.actorName}</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        {notification.postTitle && (
                          <Link 
                            href={`/article/${notification.postSlug}`}
                            className="text-sm text-primary hover:underline flex items-center"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {notification.postTitle}
                            <ExternalLink className="h-3 w-3 mr-1" />
                          </Link>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                          
                          <div className="flex items-center space-x-1 space-x-reverse">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <Separator className="last:hidden" />
              </div>
            ))}
          </div>
        )}
        
        <div className="p-4 border-t">
          <Link href="/notifications" className="text-sm text-primary hover:underline">
            مشاهده همه اطلاع‌رسانی‌ها
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}