'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  Calendar, 
  Users, 
  FileText, 
  Globe, 
  Twitter, 
  Instagram, 
  Linkedin, 
  ExternalLink,
  Edit,
  Settings,
  UserPlus,
  LogOut,
  LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PostCard } from '@/components/post/PostCard'
import { usePublication, useFollowPublication } from '@/hooks/use-publications'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import Link from 'next/link'

interface Post {
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
  _count: {
    likes: number
    comments: number
    bookmarks: number
  }
}

interface Member {
  id: string
  role: string
  joinedAt: string
  user: {
    id: string
    name?: string
    username?: string
    avatar?: string
    bio?: string
  }
}

export default function PublicationDetailPage() {
  const { slug } = useParams()
  const { data: session } = useSession()
  const [publication, setPublication] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)

  const { fetchPublication } = usePublication(publication?.id || '')
  const { followPublication, unfollowPublication, loading: followLoading } = useFollowPublication(publication?.id || '')

  const loadPublication = async () => {
    if (!slug) return

    setLoading(true)
    try {
      const data = await fetchPublication()
      setPublication(data)
      setPosts(data.posts || [])
      setMembers(data.members || [])
    } catch (error) {
      console.error('Error loading publication:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPublication()
  }, [slug])

  const handleFollowToggle = async () => {
    if (!session) {
      toast.error('لطفاً وارد حساب کاربری خود شوید')
      return
    }

    try {
      if (isFollowing) {
        await unfollowPublication()
        setIsFollowing(false)
        toast.success('دنبال کردن انتشار لغو شد')
      } else {
        await followPublication()
        setIsFollowing(true)
        toast.success('انتشار با موفقیت دنبال شد')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'OWNER': 'مالک',
      'EDITOR': 'ویراستار',
      'AUTHOR': 'نویسنده',
      'CONTRIBUTOR': 'مشارکت‌کننده'
    }
    return roleLabels[role] || role
  }

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'OWNER': 'default',
      'EDITOR': 'secondary',
      'AUTHOR': 'outline',
      'CONTRIBUTOR': 'outline'
    }
    return variants[role] || 'outline'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!publication) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            انتشار یافت نشد
          </h1>
          <p className="text-muted-foreground mb-6">
            انتشار مورد نظر شما وجود ندارد یا حذف شده است
          </p>
          <Button asChild>
            <Link href="/publications">
              بازگشت به انتشارات
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={publication.avatar} alt={publication.name} />
              <AvatarFallback className="text-2xl font-bold">
                {publication.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {publication.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{publication._count.followers.toLocaleString('fa-IR')} دنبال‌کننده</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{publication._count.posts.toLocaleString('fa-IR')} مقاله</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDistanceToNow(new Date(publication.createdAt), {
                          addSuffix: true,
                          locale: faIR
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {session && (
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                    >
                      {followLoading ? (
                        '...'
                      ) : isFollowing ? (
                        <>
                          <LogOut className="h-4 w-4 ml-2" />
                          لغو دنبال کردن
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 ml-2" />
                          دنبال کردن
                        </>
                      )}
                    </Button>
                  )}
                  
                  {session && publication.ownerId === session.user.id && (
                    <Button variant="outline" asChild>
                      <Link href={`/publications/${publication.slug}/settings`}>
                        <Settings className="h-4 w-4 ml-2" />
                        تنظیمات
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              
              {publication.description && (
                <p className="text-muted-foreground mt-4 max-w-3xl">
                  {publication.description}
                </p>
              )}
              
              {/* Social Links */}
              <div className="flex items-center gap-3 mt-4">
                {publication.website && (
                  <a
                    href={publication.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {publication.twitter && (
                  <a
                    href={`https://twitter.com/${publication.twitter.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {publication.instagram && (
                  <a
                    href={`https://instagram.com/${publication.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {publication.linkedin && (
                  <a
                    href={`https://linkedin.com/company/${publication.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            {publication.about && (
              <Card>
                <CardHeader>
                  <CardTitle>درباره انتشار</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-foreground max-w-none">
                    {publication.about.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Section */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                مقالات اخیر
              </h2>
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      هنوز مقاله‌ای منتشر نشده
                    </h3>
                    <p className="text-muted-foreground">
                      اولین مقاله در این انتشار به زودی منتشر خواهد شد
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">مالک انتشار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={publication.owner.avatar} alt={publication.owner.name} />
                    <AvatarFallback>
                      {publication.owner.name?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link
                      href={`/users/${publication.owner.username}`}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {publication.owner.name || publication.owner.username}
                    </Link>
                    <p className="text-sm text-muted-foreground">مالک</p>
                  </div>
                </div>
                {publication.owner.bio && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {publication.owner.bio}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Members Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  اعضا
                  <span className="text-sm font-normal text-muted-foreground">
                    {members.length} نفر
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.avatar} alt={member.user.name} />
                        <AvatarFallback>
                          {member.user.name?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/users/${member.user.username}`}
                          className="font-medium text-foreground hover:text-primary transition-colors text-sm truncate block"
                        >
                          {member.user.name || member.user.username}
                        </Link>
                        <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                          {getRoleLabel(member.role)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {members.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      و {members.length - 5} نفر دیگر...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">آمار انتشار</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">مقالات منتشر شده</span>
                    <span className="font-medium">{publication._count.posts.toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">دنبال‌کنندگان</span>
                    <span className="font-medium">{publication._count.followers.toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">اعضا</span>
                    <span className="font-medium">{publication._count.members.toLocaleString('fa-IR')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">تاریخ ایجاد</span>
                    <span className="font-medium text-sm">
                      {new Date(publication.createdAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}