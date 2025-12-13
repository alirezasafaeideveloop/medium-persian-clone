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

    const { commentId } = await request.json();

    if (!commentId) {
      return NextResponse.json(
        { error: "شناسه کامنت الزامی است" },
        { status: 400 }
      );
    }

    // Check if already liked
    const existingLike = await db.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await db.commentLike.delete({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
          },
        },
      });

      // Update comment like count
      await db.comment.update({
        where: { id: commentId },
        data: {
          likes: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ 
        message: "لایک با موفقیت حذف شد",
        liked: false 
      });
    } else {
      // Like
      await db.commentLike.create({
        data: {
          userId: session.user.id,
          commentId,
        },
      });

      // Update comment like count
      await db.comment.update({
        where: { id: commentId },
        data: {
          likes: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ 
        message: "کامنت با موفقیت لایک شد",
        liked: true 
      });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    return NextResponse.json(
      { error: "خطا در لایک کردن کامنت" },
      { status: 500 }
    );
  }
}