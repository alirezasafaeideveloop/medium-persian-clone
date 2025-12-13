"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Bookmark, Share2, MoreHorizontal, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";
import { useLike } from "@/hooks/useLike";
import { useBookmark } from "@/hooks/useBookmark";
import { useSession } from "next-auth/react";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    subtitle?: string;
    excerpt?: string;
    coverImage?: string;
    published: boolean;
    featured: boolean;
    readingTime?: number;
    tags: string[];
    authorId: string;
    author: {
      name: string;
      username?: string;
      image?: string;
    };
    likes: number;
    bookmarks: number;
    views: number;
    createdAt: Date;
  };
  variant?: "default" | "featured" | "compact";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const { data: session } = useSession();
  const tags = Array.isArray(article.tags) ? article.tags : JSON.parse(article.tags || "[]");
  
  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: faIR 
    });
  };

  const isAuthor = session?.user?.id === article.authorId;

  // Use custom hooks for like and bookmark functionality
  const { isLiked, likeCount, toggleLike, loading: likeLoading } = useLike(article.id, article.likes);
  const { isBookmarked, toggleBookmark, loading: bookmarkLoading } = useBookmark(article.id);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.origin + `/article/${article.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/article/${article.id}`);
    }
  };

  if (variant === "featured") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <Link href={`/article/${article.id}`}>
          <div className="relative h-64 md:h-80">
            {article.coverImage ? (
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center p-6">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{article.title}</h2>
                  {article.subtitle && (
                    <p className="text-lg text-muted-foreground">{article.subtitle}</p>
                  )}
                </div>
              </div>
            )}
            {article.featured && (
              <Badge className="absolute top-4 left-4" variant="secondary">
                ویژه
              </Badge>
            )}
          </div>
        </Link>
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Avatar className="h-10 w-10">
                <AvatarImage src={article.author.image} alt={article.author.name} />
                <AvatarFallback>{article.author.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{article.author.name}</p>
                <p className="text-sm text-muted-foreground">{formatDate(article.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-muted-foreground">
              <span>{article.readingTime || 5} دقیقه خواندن</span>
              <span>•</span>
              <span>{article.views} بازدید</span>
            </div>
          </div>

          <Link href={`/article/${article.id}`}>
            <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
              {article.title}
            </h3>
            {article.subtitle && (
              <p className="text-muted-foreground mb-3">{article.subtitle}</p>
            )}
            {article.excerpt && (
              <p className="text-muted-foreground line-clamp-3 mb-4">{article.excerpt}</p>
            )}
          </Link>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

              <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLike}
                disabled={likeLoading}
                className={`${isLiked ? "text-red-500" : "text-muted-foreground"} hover:text-red-500`}
              >
                <Heart className={`ml-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {likeCount}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
                className={`${isBookmarked ? "text-yellow-500" : "text-muted-foreground"} hover:text-yellow-500`}
              >
                <Bookmark className={`ml-1 h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                {article.bookmarks}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-blue-500"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {isAuthor && (
                <Link href={`/edit/${article.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex space-x-4 space-x-reverse">
            {article.coverImage && (
              <div className="flex-shrink-0">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <Link href={`/article/${article.id}`}>
                <h3 className="font-semibold mb-1 hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                {article.subtitle && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {article.subtitle}
                  </p>
                )}
              </Link>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={article.author.image} alt={article.author.name} />
                    <AvatarFallback className="text-xs">{article.author.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{article.author.name}</span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse text-xs text-muted-foreground">
                  <span>{formatDate(article.createdAt)}</span>
                  <span>•</span>
                  <span>{article.readingTime || 5} دقیقه</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Avatar className="h-8 w-8">
              <AvatarImage src={article.author.image} alt={article.author.name} />
              <AvatarFallback>{article.author.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{article.author.name}</p>
              <p className="text-xs text-muted-foreground">{formatDate(article.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-xs text-muted-foreground">
            <span>{article.readingTime || 5} دقیقه خواندن</span>
            <span>•</span>
            <span>{article.views} بازدید</span>
          </div>
        </div>

        <Link href={`/article/${article.id}`}>
          <h3 className="text-lg font-bold mb-2 hover:text-primary transition-colors">
            {article.title}
          </h3>
          {article.subtitle && (
            <p className="text-muted-foreground mb-3">{article.subtitle}</p>
          )}
          {article.excerpt && (
            <p className="text-muted-foreground line-clamp-2 mb-4">{article.excerpt}</p>
          )}
        </Link>

        {article.coverImage && (
          <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 2).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLike}
              className="text-muted-foreground hover:text-red-500"
            >
              <Heart className="ml-1 h-4 w-4" />
              {article.likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleBookmark}
              className="text-muted-foreground hover:text-yellow-500"
            >
              <Bookmark className="ml-1 h-4 w-4" />
              {article.bookmarks}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-blue-500"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}