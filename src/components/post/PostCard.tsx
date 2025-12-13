'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface PostCardProps {
  post: {
    id: string
    title: string
    subtitle?: string
    excerpt?: string
    coverImage?: string
    publishedAt: string
    readingTime?: number
    author: {
      id: string
      name?: string
      username?: string
      avatar?: string
    }
    publication?: {
      id: string
      name: string
      slug: string
    }
    tags?: string[]
    _count: {
      likes: number
      comments: number
      bookmarks: number
    }
  }
}

export function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(post._count.likes)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/bookmark`, {
        method: 'POST',
      })

      if (response.ok) {
        setIsBookmarked(!isBookmarked)
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card overflow-hidden">
      <Link href={`/posts/${post.id}`}>
        <div className="flex flex-col sm:flex-row">
          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback className="text-xs">
                  {post.author.name?.slice(0, 2).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground hover:text-primary transition-colors">
                  {post.author.name || post.author.username}
                </span>
                {post.publication && (
                  <>
                    <span>در</span>
                    <span className="font-medium text-foreground hover:text-primary transition-colors">
                      {post.publication.name}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(post.publishedAt), {
                    addSuffix: true,
                    locale: faIR
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>
              
              {post.subtitle && (
                <p className="text-muted-foreground line-clamp-2">
                  {post.subtitle}
                </p>
              )}

              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>{likesCount.toLocaleString('fa-IR')}</span>
                  <Heart className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1">
                  <span>{post._count.comments.toLocaleString('fa-IR')}</span>
                  <MessageCircle className="h-4 w-4" />
                </div>
                {post.readingTime && (
                  <div className="flex items-center gap-1">
                    <span>{post.readingTime} دقیقه</span>
                    <Eye className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleBookmark}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      اشتراک‌گذاری
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      گزارش مقاله
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="sm:w-48 lg:w-64 flex-shrink-0">
              <div className="relative h-full sm:min-h-full">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </Link>
    </Card>
  )
}