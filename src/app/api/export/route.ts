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
    const postId = searchParams.get('postId')
    const userId = searchParams.get('userId') || session.user.id

    // Validate export type
    const validTypes = ['json', 'csv', 'markdown', 'pdf']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'نوع خروجی نامعتبر است' },
        { status: 400 }
      )
    }

    let data

    if (postId) {
      // Export single post
      const post = await db.post.findFirst({
        where: {
          id: postId,
          OR: [
            { authorId: userId },
            { published: true }
          ]
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: {
              likes: true,
              bookmarks: true,
              comments: true
            }
          }
        }
      })

      if (!post) {
        return NextResponse.json(
          { error: 'مقاله یافت نشد' },
          { status: 404 }
        )
      }

      data = post
    } else {
      // Export user's posts
      const posts = await db.post.findMany({
        where: { authorId: userId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true
            }
          },
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

      data = posts
    }

    // Format data based on type
    let formattedData: string
    let contentType: string
    let filename: string

    switch (type) {
      case 'json':
        formattedData = JSON.stringify(data, null, 2)
        contentType = 'application/json'
        filename = postId ? `post-${postId}.json` : `posts-${userId}.json`
        break

      case 'csv':
        formattedData = convertToCSV(data)
        contentType = 'text/csv'
        filename = postId ? `post-${postId}.csv` : `posts-${userId}.csv`
        break

      case 'markdown':
        formattedData = convertToMarkdown(data)
        contentType = 'text/markdown'
        filename = postId ? `post-${postId}.md` : `posts-${userId}.md`
        break

      case 'pdf':
        // For PDF, we'll need to use a library like puppeteer
        // For now, return markdown and suggest conversion
        formattedData = convertToMarkdown(data)
        contentType = 'text/markdown'
        filename = postId ? `post-${postId}.md` : `posts-${userId}.md`
        break

      default:
        formattedData = JSON.stringify(data, null, 2)
        contentType = 'application/json'
        filename = 'export.json'
    }

    return new NextResponse(formattedData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'خطا در خروجی گرفتن از داده‌ها' },
      { status: 500 }
    )
  }
}

function convertToCSV(data: any): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0]).filter(key => typeof data[0][key] !== 'object')
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value
        }).join(',')
      )
    ]
    
    return csvRows.join('\n')
  } else {
    // Single object
    const headers = Object.keys(data).filter(key => typeof data[key] !== 'object')
    const values = headers.map(header => {
      const value = data[header]
      return typeof value === 'string' && value.includes(',') 
        ? `"${value.replace(/"/g, '""')}"` 
        : value
    })
    
    return `${headers.join(',')}\n${values.join(',')}`
  }
}

function convertToMarkdown(data: any): string {
  if (Array.isArray(data)) {
    return data.map(post => convertPostToMarkdown(post)).join('\n\n---\n\n')
  } else {
    return convertPostToMarkdown(data)
  }
}

function convertPostToMarkdown(post: any): string {
  const title = post.title || 'بدون عنوان'
  const subtitle = post.subtitle || ''
  const content = post.content || ''
  const author = post.author?.name || 'ناشناس'
  const publishedAt = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('fa-IR') : ''
  const likes = post._count?.likes || 0
  const comments = post._count?.comments || 0

  let markdown = `# ${title}\n\n`
  
  if (subtitle) {
    markdown += `*${subtitle}*\n\n`
  }
  
  markdown += `**نویسنده:** ${author}\n\n`
  markdown += `**تاریخ انتشار:** ${publishedAt}\n\n`
  markdown += `**لایک‌ها:** ${likes} | **نظرات:** ${comments}\n\n`
  markdown += `---\n\n`
  markdown += content

  if (post.comments && post.comments.length > 0) {
    markdown += '\n\n## نظرات\n\n'
    post.comments.forEach((comment: any) => {
      const commentAuthor = comment.author?.name || 'ناشناس'
      const commentDate = new Date(comment.createdAt).toLocaleDateString('fa-IR')
      markdown += `### ${commentAuthor} - ${commentDate}\n\n`
      markdown += `${comment.content}\n\n`
    })
  }

  return markdown
}