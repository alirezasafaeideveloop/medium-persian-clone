import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!postId) {
      return NextResponse.json(
        { error: "شناسه مقاله الزامی است" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const comments = await db.comment.findMany({
      where: {
        postId,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        replies: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const total = await db.comment.count({
      where: {
        postId,
        parentId: null,
      },
    });

    const transformedComments = comments.map(comment => ({
      ...comment,
      replies: comment._count.replies,
      _count: undefined,
    }));

    return NextResponse.json({
      comments: transformedComments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "خطا در دریافت کامنت‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "برای ارسال کامنت باید وارد شوید" },
        { status: 401 }
      );
    }

    const { postId, content, parentId } = await request.json();

    if (!postId || !content?.trim()) {
      return NextResponse.json(
        { error: "محتوا و شناسه مقاله الزامی هستند" },
        { status: 400 }
      );
    }

    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: session.user.id,
        parentId: parentId || null,
      },
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
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد کامنت" },
      { status: 500 }
    );
  }
}