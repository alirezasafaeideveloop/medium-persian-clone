import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        email: false, // Don't expose email
        createdAt: true,
        _count: {
          select: {
            posts: {
              where: { published: true }
            },
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    // Get user's posts
    const posts = await db.post.findMany({
      where: {
        authorId: user.id,
        published: true,
      },
      include: {
        _count: {
          select: {
            likes: true,
            bookmarks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Transform posts
    const transformedPosts = posts.map(post => ({
      ...post,
      likes: post._count.likes,
      bookmarks: post._count.bookmarks,
      _count: undefined,
    }));

    // Calculate total stats
    const totalStats = await db.post.aggregate({
      where: {
        authorId: user.id,
        published: true,
      },
      _sum: {
        views: true,
      },
    });

    const profileData = {
      ...user,
      posts: transformedPosts,
      stats: {
        totalPosts: user._count.posts,
        totalFollowers: user._count.followers,
        totalFollowing: user._count.following,
        totalViews: totalStats._sum.views || 0,
      },
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پروفایل کاربر" },
      { status: 500 }
    );
  }
}