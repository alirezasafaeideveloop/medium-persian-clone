"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard } from "@/components/article/ArticleCard";
import { 
  User, 
  Calendar, 
  Eye, 
  Heart, 
  Bookmark, 
  FileText,
  Users,
  UserPlus,
  UserMinus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio?: string;
  image?: string;
  createdAt: Date;
  posts: any[];
  stats: {
    totalPosts: number;
    totalFollowers: number;
    totalFollowing: number;
    totalViews: number;
    totalLikes: number;
    totalBookmarks: number;
  };
}

interface ProfilePageProps {
  username: string;
}

export function ProfilePage({ username }: ProfilePageProps) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        
        // Check if current user is following this profile
        if (session?.user?.id) {
          checkFollowStatus(data.id);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/follow/check?followingId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    if (!session) {
      toast.error("برای دنبال کردن باید وارد شوید");
      return;
    }

    setFollowLoading(true);
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followingId: profile?.id,
        }),
      });

      if (response.ok) {
        setIsFollowing(true);
        toast.success("با موفقیت دنبال شدید");
        
        // Update follower count
        if (profile) {
          setProfile(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              totalFollowers: prev.stats.totalFollowers + 1,
            }
          } : null);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || "خطا در دنبال کردن");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!session) return;

    setFollowLoading(true);
    try {
      const response = await fetch("/api/follow", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          followingId: profile?.id,
        }),
      });

      if (response.ok) {
        setIsFollowing(false);
        toast.success("دنبال کردن با موفقیت لغو شد");
        
        // Update follower count
        if (profile) {
          setProfile(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              totalFollowers: prev.stats.totalFollowers - 1,
            }
          } : null);
        }
      } else {
        const data = await response.json();
        toast.error(data.error || "خطا در لغو دنبال کردن");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: faIR 
    });
  };

  const isOwnProfile = session?.user?.id === profile?.id;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="h-20 w-20 rounded-full bg-muted"></div>
            <div className="space-y-2">
              <div className="h-6 w-32 bg-muted rounded"></div>
              <div className="h-4 w-48 bg-muted rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">کاربر یافت نشد</h1>
        <p>کاربری با این نام کاربری وجود ندارد.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 md:space-x-reverse">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.image} alt={profile.name} />
              <AvatarFallback className="text-2xl">{profile.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
              <p className="text-muted-foreground mb-2">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm mb-4">{profile.bio}</p>
              )}
              
              <div className="flex items-center justify-center md:justify-start space-x-2 space-x-reverse text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>عضو شده در {formatDate(profile.createdAt)}</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {!isOwnProfile && (
                <Button
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  disabled={followLoading}
                  variant={isFollowing ? "outline" : "default"}
                >
                  {followLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  ) : isFollowing ? (
                    <>
                      <UserMinus className="ml-2 h-4 w-4" />
                      لغو دنبال کردن
                    </>
                  ) : (
                    <>
                      <UserPlus className="ml-2 h-4 w-4" />
                      دنبال کردن
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.stats.totalPosts}</div>
            <div className="text-sm text-muted-foreground">مقاله</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.stats.totalFollowers}</div>
            <div className="text-sm text-muted-foreground">دنبال‌کننده</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <User className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.stats.totalFollowing}</div>
            <div className="text-sm text-muted-foreground">دنبال شونده</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.stats.totalViews.toLocaleString("fa-IR")}</div>
            <div className="text-sm text-muted-foreground">بازدید</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.stats.totalLikes.toLocaleString("fa-IR")}</div>
            <div className="text-sm text-muted-foreground">لایک</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Bookmark className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.stats.totalBookmarks.toLocaleString("fa-IR")}</div>
            <div className="text-sm text-muted-foreground">نشان‌شده</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">مقالات</TabsTrigger>
          <TabsTrigger value="about">درباره</TabsTrigger>
          <TabsTrigger value="activity">فعالیت</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">مقالات اخیر</h2>
            <Badge variant="secondary">{profile.stats.totalPosts} مقاله</Badge>
          </div>
          
          {profile.posts.length > 0 ? (
            <div className="space-y-6">
              {profile.posts.map((post) => (
                <ArticleCard key={post.id} article={post} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">هنوز مقاله‌ای منتشر نشده</h3>
                <p className="text-muted-foreground">این کاربر هنوز مقاله‌ای منتشر نکرده است.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>درباره {profile.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.bio ? (
                <p>{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground">بیوگرافی مشخص نشده است.</p>
              )}
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">نام کاربری:</span>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
                <div>
                  <span className="font-semibold">تاریخ عضویت:</span>
                  <p className="text-muted-foreground">{formatDate(profile.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 w-32 bg-muted rounded mx-auto mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded"></div>
                  <div className="h-3 w-3/4 bg-muted rounded"></div>
                  <div className="h-3 w-5/6 bg-muted rounded"></div>
                </div>
              </div>
              <p className="text-muted-foreground mt-4">بخش فعالیت‌ها به زودی اضافه می‌شود.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}