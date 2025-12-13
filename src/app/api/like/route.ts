import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "برای لایک کردن باید وارد شوید" },
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

    // Check if already liked
    const existingLike = await db.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await db.like.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });

      return NextResponse.json({ 
        message: "لایک با موفقیت حذف شد",
        liked: false 
      });
    } else {
      // Like
      await db.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });

      return NextResponse.json({ 
        message: "مقاله با موفقیت لایک شد",
        liked: true 
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "خطا در لایک کردن مقاله" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ likedPosts: [] });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (postId) {
      // Check if specific post is liked
      const like = await db.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      });

      return NextResponse.json({ isLiked: !!like });
    } else {
      // Get all liked posts
      const likedPosts = await db.like.findMany({
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
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({ likedPosts });
    }
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لایک‌ها" },
      { status: 500 }
    );
  }
}