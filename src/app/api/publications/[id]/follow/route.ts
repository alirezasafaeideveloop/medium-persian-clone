import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface Params {
  params: { id: string }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'لطفاً وارد حساب کاربری خود شوید' },
        { status: 401 }
      )
    }

    // Check if publication exists
    const publication = await db.publication.findUnique({
      where: { id }
    })

    if (!publication) {
      return NextResponse.json(
        { error: 'انتشار یافت نشد' },
        { status: 404 }
      )
    }

    // Check if already following
    const existingFollow = await db.publicationFollower.findUnique({
      where: {
        userId_publicationId: {
          userId: session.user.id,
          publicationId: id
        }
      }
    })

    if (existingFollow) {
      return NextResponse.json(
        { error: 'شما قبلاً این انتشار را دنبال می‌کنید' },
        { status: 400 }
      )
    }

    const follow = await db.publicationFollower.create({
      data: {
        userId: session.user.id,
        publicationId: id
      }
    })

    // Create notification for publication owner
    await db.notification.create({
      data: {
        userId: publication.ownerId,
        type: 'publication_follow',
        message: `${session.user.name || 'یک کاربر'} انتشار شما را دنبال کرد`,
        actorId: session.user.id
      }
    })

    return NextResponse.json({ message: 'انتشار با موفقیت دنبال شد' })
  } catch (error) {
    console.error('Error following publication:', error)
    return NextResponse.json(
      { error: 'خطا در دنبال کردن انتشار' },
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

    const follow = await db.publicationFollower.findUnique({
      where: {
        userId_publicationId: {
          userId: session.user.id,
          publicationId: id
        }
      }
    })

    if (!follow) {
      return NextResponse.json(
        { error: 'شما این انتشار را دنبال نمی‌کنید' },
        { status: 400 }
      )
    }

    await db.publicationFollower.delete({
      where: {
        userId_publicationId: {
          userId: session.user.id,
          publicationId: id
        }
      }
    })

    return NextResponse.json({ message: 'دنبال کردن انتشار لغو شد' })
  } catch (error) {
    console.error('Error unfollowing publication:', error)
    return NextResponse.json(
      { error: 'خطا در لغو دنبال کردن انتشار' },
      { status: 500 }
    )
  }
}