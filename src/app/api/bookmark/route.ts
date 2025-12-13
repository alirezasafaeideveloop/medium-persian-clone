import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "برای نشان کردن باید وارد شوید" },
        { status: 401 }
      );
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "شناسه مقاله الزامی است" },
        { status: 400 }
      );
    }

    // Check if already bookmarked
    const existingBookmark = await db.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await db.bookmark.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });

      return NextResponse.json({ 
        message: "نشان با موفقیت حذف شد",
        bookmarked: false 
      });
    } else {
      // Add bookmark
      await db.bookmark.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });

      return NextResponse.json({ 
        message: "مقاله با موفقیت نشان شد",
        bookmarked: true 
      });
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { error: "خطا در نشان کردن مقاله" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ bookmarkedPosts: [] });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (postId) {
      // Check if specific post is bookmarked
      const bookmark = await db.bookmark.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });

      return NextResponse.json({ isBookmarked: !!bookmark });
    } else {
      // Get all bookmarked posts
      const bookmarkedPosts = await db.bookmark.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  bookmarks: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Transform posts
      const transformedPosts = bookmarkedPosts.map(bookmark => ({
        ...bookmark.post,
        tags: Array.isArray(bookmark.post.tags) ? bookmark.post.tags : JSON.parse(bookmark.post.tags || "[]"),
        likes: bookmark.post._count.likes,
        bookmarks: bookmark.post._count.bookmarks,
        _count: undefined,
        bookmarkedAt: bookmark.createdAt,
      }));

      return NextResponse.json({ bookmarkedPosts: transformedPosts });
    }
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "خطا در دریافت نشان‌شده‌ها" },
      { status: 500 }
    );
  }
}