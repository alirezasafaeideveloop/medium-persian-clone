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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const members = await db.publicationMember.findMany({
      where: { publicationId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            createdAt: true
          }
        }
      },
      orderBy: { joinedAt: 'asc' },
      skip,
      take: limit
    })

    const total = await db.publicationMember.count({
      where: { publicationId: id }
    })

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching publication members:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت اعضای انتشار' },
      { status: 500 }
    )
  }
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

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'شناسه کاربر و نقش الزامی هستند' },
        { status: 400 }
      )
    }

    // Check if user has permission to add members
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
        { error: 'شما اجازه افزودن عضو به این انتشار را ندارید' },
        { status: 403 }
      )
    }

    // Check if user is already a member
    const existingMember = await db.publicationMember.findUnique({
      where: {
        userId_publicationId: {
          userId,
          publicationId: id
        }
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'کاربر قبلاً عضو این انتشار بوده است' },
        { status: 400 }
      )
    }

    const member = await db.publicationMember.create({
      data: {
        userId,
        publicationId: id,
        role
      },
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
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error adding publication member:', error)
    return NextResponse.json(
      { error: 'خطا در افزودن عضو به انتشار' },
      { status: 500 }
    )
  }
}