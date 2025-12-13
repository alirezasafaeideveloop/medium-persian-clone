"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Bookmark, 
  Share2, 
  MoreHorizontal,
  ArrowRight,
  Clock,
  Eye,
  Calendar,
  Edit,
  MessageSquare
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { useLike } from "@/hooks/useLike";
import { useBookmark } from "@/hooks/useBookmark";
import { CommentComponent } from "@/components/comment/CommentComponent";

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
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
    bio?: string;
  };
  likes: number;
  bookmarks: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchArticle();
    }
  }, [params.slug]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const isAuthor = session?.user?.id === article?.id;

  // Use custom hooks for like and bookmark functionality
  const { isLiked, likeCount, toggleLike, loading: likeLoading } = useLike(
    article?.id || "", 
    article?.likes || 0
  );
  const { isBookmarked, toggleBookmark, loading: bookmarkLoading } = useBookmark(
    article?.id || ""
  );

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (article?.id) {
      fetchComments();
    }
  }, [article?.id]);

  const fetchComments = async () => {
    if (!article?.id) return;
    
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/comments?postId=${article.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentReply = async (commentId: string, content: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: article?.id,
          content,
          parentId: commentId,
        }),
      });

      if (response.ok) {
        await fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: faIR 
    });
  };

  const tags = article ? (Array.isArray(article.tags) ? article.tags : JSON.parse(article.tags || "[]")) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">مقاله یافت نشد</h1>
          <Button onClick={() => router.push("/")}>بازگشت به صفحه اصلی</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-6">
            {article.featured && (
              <Badge className="mb-4" variant="secondary">
                مقاله ویژه
              </Badge>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>
            
            {article.subtitle && (
              <p className="text-xl text-muted-foreground mb-6">
                {article.subtitle}
              </p>
            )}
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Avatar className="h-12 w-12">
                <AvatarImage src={article.author.image} alt={article.author.name} />
                <AvatarFallback>{article.author.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{article.author.name}</p>
                <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(article.createdAt)}</span>
                  <span>•</span>
                  <Clock className="h-3 w-3" />
                  <span>{article.readingTime || 5} دقیقه خواندن</span>
                  <span>•</span>
                  <Eye className="h-3 w-3" />
                  <span>{article.views} بازدید</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant={isLiked ? "default" : "ghost"}
                size="sm"
                onClick={toggleLike}
                className={isLiked ? "text-red-500" : "text-muted-foreground"}
              >
                <Heart className={`ml-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {article.likes}
              </Button>
              <Button
                variant={isBookmarked ? "default" : "ghost"}
                size="sm"
                onClick={toggleBookmark}
                className={isBookmarked ? "text-yellow-500" : "text-muted-foreground"}
              >
                <Bookmark className={`ml-1 h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                {article.bookmarks}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag: string) => (
                <Link key={tag} href={`/topic/${tag}`}>
                  <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="relative h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <Separator className="mb-8" />

        {/* Article Content */}
        <article className="prose prose-lg max-w-none persian-content">
          <div 
            className="text-justify leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>

        <Separator className="my-8" />

        {/* Article Footer */}
        <footer className="space-y-6">
          {/* Author Bio */}
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex items-start space-x-4 space-x-reverse">
              <Avatar className="h-16 w-16">
                <AvatarImage src={article.author.image} alt={article.author.name} />
                <AvatarFallback className="text-lg">{article.author.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">{article.author.name}</h3>
                {article.author.bio && (
                  <p className="text-muted-foreground mb-4">{article.author.bio}</p>
                )}
                <Button variant="outline" size="sm">
                  دنبال کردن
                </Button>
              </div>
            </div>
          </div>

          {/* Share and Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant={isLiked ? "default" : "outline"}
                onClick={toggleLike}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`ml-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                پسندیدن ({article.likes})
              </Button>
              <Button
                variant={isBookmarked ? "default" : "outline"}
                onClick={toggleBookmark}
                className={isBookmarked ? "text-yellow-500" : ""}
              >
                <Bookmark className={`ml-2 h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                نشان کردن ({article.bookmarks})
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              {isAuthor && (
                <Link href={`/edit/${article.id}`}>
                  <Button variant="outline">
                    <Edit className="ml-2 h-4 w-4" />
                    ویرایش مقاله
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="ml-2 h-4 w-4" />
                اشتراک‌گذاری
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}