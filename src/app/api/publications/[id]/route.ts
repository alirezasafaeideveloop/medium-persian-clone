import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface Params {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const publication = await db.publication.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
                bio: true
              }
            }
          },
          orderBy: { joinedAt: 'asc' }
        },
        posts: {
          where: { published: true },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true
              }
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                bookmarks: true
              }
            }
          },
          orderBy: { publishedAt: 'desc' },
          take: 6
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            members: true
          }
        }
      }
    })

    if (!publication) {
      return NextResponse.json(
        { error: 'انتشار یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json(publication)
  } catch (error) {
    console.error('Error fetching publication:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات انتشار' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    // Check if user is owner or editor
    const publication = await db.publication.findUnique({
      where: { id: id },
      include: {
        members: {
          where: {
            userId: session.user.id,
            role: { in: ['OWNER', 'EDITOR'] }
          }
        }
      }
    })

    if (!publication || (publication.ownerId !== session.user.id && publication.members.length === 0)) {
      return NextResponse.json(
        { error: 'شما اجازه ویرایش این انتشار را ندارید' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, avatar, website, twitter, instagram, linkedin, about, isPrivate } = body

    const updatedPublication = await db.publication.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(avatar !== undefined && { avatar }),
        ...(website !== undefined && { website }),
        ...(twitter !== undefined && { twitter }),
        ...(instagram !== undefined && { instagram }),
        ...(linkedin !== undefined && { linkedin }),
        ...(about !== undefined && { about }),
        ...(isPrivate !== undefined && { isPrivate })
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            members: true
          }
        }
      }
    })

    return NextResponse.json(updatedPublication)
  } catch (error) {
    console.error('Error updating publication:', error)
    return NextResponse.json(
      { error: 'خطا در ویرایش انتشار' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    const publication = await db.publication.findUnique({
      where: { id: id }
    })

    if (!publication) {
      return NextResponse.json(
        { error: 'انتشار یافت نشد' },
        { status: 404 }
      )
    }

    if (publication.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: 'فقط مالک انتشار می‌تواند آن را حذف کند' },
        { status: 403 }
      )
    }

    await db.publication.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'انتشار با موفقیت حذف شد' })
  } catch (error) {
    console.error('Error deleting publication:', error)
    return NextResponse.json(
      { error: 'خطا در حذف انتشار' },
      { status: 500 }
    )
  }
}