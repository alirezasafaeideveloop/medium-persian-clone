'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Plus, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PublicationCard } from '@/components/publication/PublicationCard'
import { usePublications } from '@/hooks/use-publications'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface Publication {
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

function PublicationsPageContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [publications, setPublications] = useState<Publication[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: '',
    website: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    about: '',
    isPrivate: false
  })

  const { fetchPublications, createPublication, loading } = usePublications()

  const loadPublications = async (page = 1, search = searchTerm) => {
    try {
      const data = await fetchPublications({ page, limit: pagination.limit, search })
      setPublications(data.publications)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error loading publications:', error)
    }
  }

  useEffect(() => {
    loadPublications(1, searchTerm)
  }, [searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadPublications(1, searchTerm)
  }

  const handleCreatePublication = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createPublication(formData)
      toast.success('انتشار با موفقیت ایجاد شد')
      setIsCreateDialogOpen(false)
      setFormData({
        name: '',
        description: '',
        avatar: '',
        website: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        about: '',
        isPrivate: false
      })
      loadPublications(1)
    } catch (error) {
      console.error('Error creating publication:', error)
    }
  }

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      loadPublications(pagination.page + 1, searchTerm)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                انتشارات
              </h1>
              <p className="text-muted-foreground">
                انتشارات را کشف کنید و محتوای باکیفیت را دنبال کنید
              </p>
            </div>
            
            {session && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shrink-0">
                    <Plus className="h-4 w-4 ml-2" />
                    ایجاد انتشار
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>ایجاد انتشار جدید</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePublication} className="space-y-4">
                    <div>
                      <Label htmlFor="name">نام انتشار *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="نام انتشار را وارد کنید"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">توضیحات</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="توضیحات کوتاه در مورد انتشار"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="avatar">آواتار</Label>
                      <Input
                        id="avatar"
                        value={formData.avatar}
                        onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
                        placeholder="لینک تصویر آواتار"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="website">وب‌سایت</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://example.com"
                        type="url"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="twitter">توییتر</Label>
                        <Input
                          id="twitter"
                          value={formData.twitter}
                          onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                          placeholder="@username"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="instagram">اینستاگرام</Label>
                        <Input
                          id="instagram"
                          value={formData.instagram}
                          onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                          placeholder="@username"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="linkedin">لینکدین</Label>
                        <Input
                          id="linkedin"
                          value={formData.linkedin}
                          onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                          placeholder="company-name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="about">درباره انتشار</Label>
                      <Textarea
                        id="about"
                        value={formData.about}
                        onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                        placeholder="توضیحات کامل در مورد انتشار و اهداف آن"
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPrivate"
                        checked={formData.isPrivate}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
                      />
                      <Label htmlFor="isPrivate">انتشار خصوصی</Label>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        انصراف
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'در حال ایجاد...' : 'ایجاد انتشار'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="جستجوی انتشارات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </form>

        {/* Publications Grid */}
        {loading && publications.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? 'هیچ انتشاری یافت نشد' : 'هنوز انتشاری ایجاد نشده'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? 'با جستجوی کلیدواژه‌های دیگر تلاش کنید'
                : 'اولین انتشار را ایجاد کنید یا به انتشارات موجود بپیوندید'
              }
            </p>
            {session && !searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                ایجاد اولین انتشار
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {publications.map((publication) => (
                <PublicationCard key={publication.id} publication={publication} />
              ))}
            </div>

            {/* Load More */}
            {pagination.page < pagination.pages && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'در حال بارگذاری...' : 'بارگذاری بیشتر'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function PublicationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <PublicationsPageContent />
    </Suspense>
  );
}