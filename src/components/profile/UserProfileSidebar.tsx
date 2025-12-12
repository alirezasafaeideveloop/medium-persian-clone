"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  BookOpen, 
  BarChart3, 
  LogOut,
  Edit,
  UserPlus,
  UserMinus
} from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio?: string;
  image?: string;
  stats: {
    totalPosts: number;
    totalFollowers: number;
    totalFollowing: number;
  };
}

export function UserProfileSidebar() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.username) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.username}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (!session) {
    return (
      <Card className="p-4">
        <CardContent className="p-0 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              برای دسترسی به پروفایل وارد شوید
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/signin">ورود</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4">
        <CardContent className="p-0">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted mx-auto"></div>
            <div className="h-4 w-24 bg-muted rounded mx-auto"></div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted rounded"></div>
              <div className="h-3 w-3/4 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <CardContent className="p-0 space-y-4">
        {/* User Info */}
        <div className="text-center">
          <Link href={`/profile/${profile?.username}`}>
            <Avatar className="h-16 w-16 mx-auto mb-3">
              <AvatarImage src={profile?.image} alt={profile?.name} />
              <AvatarFallback className="text-lg">
                {profile?.name?.slice(0, 2) || "کاربر"}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <Link href={`/profile/${profile?.username}`}>
            <h3 className="font-semibold hover:text-primary transition-colors">
              {profile?.name}
            </h3>
          </Link>
          
          <p className="text-sm text-muted-foreground">@{profile?.username}</p>
          
          {profile?.bio && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
              {profile.bio}
            </p>
          )}
        </div>

        <Separator />

        {/* Quick Stats */}
        {profile?.stats && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold">{profile.stats.totalPosts}</div>
              <div className="text-xs text-muted-foreground">مقاله</div>
            </div>
            <div>
              <div className="text-lg font-bold">{profile.stats.totalFollowers}</div>
              <div className="text-xs text-muted-foreground">دنبال‌کننده</div>
            </div>
            <div>
              <div className="text-lg font-bold">{profile.stats.totalFollowing}</div>
              <div className="text-xs text-muted-foreground">دنبال‌شونده</div>
            </div>
          </div>
        )}

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <Link href="/write">
              <Edit className="ml-2 h-4 w-4" />
              نوشتن مقاله جدید
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <Link href={`/profile/${profile?.username}`}>
              <BookOpen className="ml-2 h-4 w-4" />
              مشاهده پروفایل
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <Link href="/settings">
              <Settings className="ml-2 h-4 w-4" />
              تنظیمات
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <Link href="/stats">
              <BarChart3 className="ml-2 h-4 w-4" />
              آمار و تحلیل
            </Link>
          </Button>
        </div>

        <Separator />

        {/* Sign Out */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-red-600 hover:text-red-700"
          onClick={handleSignOut}
        >
          <LogOut className="ml-2 h-4 w-4" />
          خروج
        </Button>
      </CardContent>
    </Card>
  );
}