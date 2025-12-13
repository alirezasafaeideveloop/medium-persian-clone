import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'json'
    const include = searchParams.get('include')?.split(',') || ['posts', 'profile', 'bookmarks']

    // Get user data
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      )
    }

    let backupData: any = {
      user,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    // Include posts
    if (include.includes('posts')) {
      const posts = await db.post.findMany({
        where: { authorId: session.user.id },
        include: {
          _count: {
            select: {
              likes: true,
              bookmarks: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      backupData.posts = posts
    }

    // Include bookmarks
    if (include.includes('bookmarks')) {
      const bookmarks = await db.bookmark.findMany({
        where: { userId: session.user.id },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              subtitle: true,
              excerpt: true,
              publishedAt: true,
              author: {
                select: {
                  name: true,
                  username: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      backupData.bookmarks = bookmarks
    }

    // Include likes
    if (include.includes('likes')) {
      const likes = await db.like.findMany({
        where: { userId: session.user.id },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              subtitle: true,
              publishedAt: true,
              author: {
                select: {
                  name: true,
                  username: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      backupData.likes = likes
    }

    // Include comments
    if (include.includes('comments')) {
      const comments = await db.comment.findMany({
        where: { authorId: session.user.id },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              publishedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      backupData.comments = comments
    }

    // Include followers
    if (include.includes('followers')) {
      const followers = await db.follow.findMany({
        where: { followingId: session.user.id },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      backupData.followers = followers
    }

    // Include following
    if (include.includes('following')) {
      const following = await db.follow.findMany({
        where: { followerId: session.user.id },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      backupData.following = following
    }

    // Include publications
    if (include.includes('publications')) {
      const publications = await db.publication.findMany({
        where: { ownerId: session.user.id },
        include: {
          _count: {
            select: {
              posts: true,
              followers: true,
              members: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      backupData.publications = publications
    }

    // Format and return backup
    const backupJson = JSON.stringify(backupData, null, 2)
    const filename = `backup-${user.username || user.id}-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(backupJson, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد پشتیبان' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { backupData, overwrite = false } = body

    if (!backupData || !backupData.user) {
      return NextResponse.json(
        { error: 'داده‌های پشتیبان نامعتبر هستند' },
        { status: 400 }
      )
    }

    // Verify backup belongs to current user
    if (backupData.user.id !== session.user.id) {
      return NextResponse.json(
        { error: 'پشتیبان متعلق به کاربر دیگری است' },
        { status: 403 }
      )
    }

    // Check if user already has data and overwrite is false
    if (!overwrite) {
      const existingPosts = await db.post.count({
        where: { authorId: session.user.id }
      })

      if (existingPosts > 0) {
        return NextResponse.json(
          { 
            error: 'شما از قبل داده‌های دارید. برای بازنشانی داده‌ها، overwrite را true کنید' 
          },
          { status: 409 }
        )
      }
    }

    // Start importing data
    const results: {
      posts: number;
      bookmarks: number;
      likes: number;
      comments: number;
      errors: string[];
    } = {
      posts: 0,
      bookmarks: 0,
      likes: 0,
      comments: 0,
      errors: []
    }

    try {
      // Import posts
      if (backupData.posts && Array.isArray(backupData.posts)) {
        for (const post of backupData.posts) {
          try {
            await db.post.create({
              data: {
                id: post.id, // Keep original ID for consistency
                title: post.title,
                subtitle: post.subtitle,
                content: post.content,
                excerpt: post.excerpt,
                coverImage: post.coverImage,
                published: post.published,
                featured: post.featured,
                readingTime: post.readingTime,
                tags: post.tags,
                publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
                authorId: session.user.id,
                views: post.views || 0,
                createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
                updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date()
              }
            })
            results.posts++
          } catch (error) {
            results.errors.push(`خطا در وارد کردن مقاله ${post.title}: ${error}`)
          }
        }
      }

      // Import bookmarks
      if (backupData.bookmarks && Array.isArray(backupData.bookmarks)) {
        for (const bookmark of backupData.bookmarks) {
          try {
            await db.bookmark.create({
              data: {
                userId: session.user.id,
                postId: bookmark.postId,
                createdAt: bookmark.createdAt ? new Date(bookmark.createdAt) : new Date()
              }
            })
            results.bookmarks++
          } catch (error) {
            results.errors.push(`خطا در وارد کردن نشان: ${error}`)
          }
        }
      }

      // Import likes
      if (backupData.likes && Array.isArray(backupData.likes)) {
        for (const like of backupData.likes) {
          try {
            await db.like.create({
              data: {
                userId: session.user.id,
                postId: like.postId,
                createdAt: like.createdAt ? new Date(like.createdAt) : new Date()
              }
            })
            results.likes++
          } catch (error) {
            results.errors.push(`خطا در وارد کردن لایک: ${error}`)
          }
        }
      }

      // Import comments
      if (backupData.comments && Array.isArray(backupData.comments)) {
        for (const comment of backupData.comments) {
          try {
            await db.comment.create({
              data: {
                id: comment.id,
                content: comment.content,
                postId: comment.postId,
                authorId: session.user.id,
                parentId: comment.parentId,
                likes: comment.likes || 0,
                createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
                updatedAt: comment.updatedAt ? new Date(comment.updatedAt) : new Date()
              }
            })
            results.comments++
          } catch (error) {
            results.errors.push(`خطا در وارد کردن نظر: ${error}`)
          }
        }
      }

      return NextResponse.json({
        message: 'بازنشانی داده‌ها با موفقیت انجام شد',
        results
      })

    } catch (error) {
      console.error('Error importing backup:', error)
      return NextResponse.json(
        { error: 'خطا در بازنشانی داده‌ها' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error processing backup:', error)
    return NextResponse.json(
      { error: 'خطا در پردازش پشتیبان' },
      { status: 500 }
    )
  }
}