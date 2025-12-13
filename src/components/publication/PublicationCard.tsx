'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { faIR } from 'date-fns/locale'
import { Users, FileText, Calendar, ExternalLink, Twitter, Instagram, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useFollowPublication } from '@/hooks/use-publications'
import { useSession } from 'next-auth/react'

interface PublicationCardProps {
  publication: {
    id: string
    name: string
    description?: string
    avatar?: string
    slug: string
    website?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    createdAt: string
    owner: {
      id: string
      name?: string
      username?: string
      avatar?: string
    }
    _count: {
      posts: number
      followers: number
      members: number
    }
  }
}

export function PublicationCard({ publication }: PublicationCardProps) {
  const { data: session } = useSession()
  const { followPublication, unfollowPublication, loading } = useFollowPublication(publication.id)

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) return

    try {
      // Here you would need to check if user is already following
      // For now, let's assume they're not following
      await followPublication()
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
      <Link href={`/publications/${publication.slug}`}>
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={publication.avatar} alt={publication.name} />
                <AvatarFallback className="text-lg font-semibold">
                  {publication.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {publication.name}
              </h3>
              
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>توسط</span>
                <Link 
                  href={`/users/${publication.owner.username}`}
                  className="hover:text-foreground transition-colors font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  {publication.owner.name || publication.owner.username}
                </Link>
              </div>

              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(publication.createdAt), {
                    addSuffix: true,
                    locale: faIR
                  })}
                </span>
              </div>
            </div>

            {session && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFollowToggle}
                disabled={loading}
                className="shrink-0"
              >
                {loading ? '...' : 'دنبال کردن'}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {publication.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {publication.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{publication._count.posts.toLocaleString('fa-IR')}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{publication._count.followers.toLocaleString('fa-IR')}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{publication._count.members.toLocaleString('fa-IR')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {publication.website && (
                <a
                  href={publication.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              
              {publication.twitter && (
                <a
                  href={`https://twitter.com/${publication.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              
              {publication.instagram && (
                <a
                  href={`https://instagram.com/${publication.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              
              {publication.linkedin && (
                <a
                  href={`https://linkedin.com/company/${publication.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}