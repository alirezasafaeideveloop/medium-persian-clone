import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { slug: { contains: search } }
          ]
        }
      : {}

    const [publications, total] = await Promise.all([
      db.publication.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.publication.count({ where })
    ])

    return NextResponse.json({
      publications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching publications:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت انتشارات' },
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
    const { name, description, avatar, website, twitter, instagram, linkedin, about, isPrivate } = body

    if (!name) {
      return NextResponse.json(
        { error: 'نام انتشار الزامی است' },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')

    // Check if slug exists and make it unique
    const existingPublication = await db.publication.findFirst({
      where: { slug }
    })

    if (existingPublication) {
      slug = `${slug}-${Date.now()}`
    }

    const publication = await db.publication.create({
      data: {
        name,
        description,
        avatar,
        slug,
        website,
        twitter,
        instagram,
        linkedin,
        about,
        isPrivate: isPrivate || false,
        ownerId: session.user.id
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

    // Add owner as member with OWNER role
    await db.publicationMember.create({
      data: {
        userId: session.user.id,
        publicationId: publication.id,
        role: 'OWNER'
      }
    })

    return NextResponse.json(publication)
  } catch (error) {
    console.error('Error creating publication:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد انتشار' },
      { status: 500 }
    )
  }
}