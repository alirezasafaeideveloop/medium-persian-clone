import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
        _count: {
          select: {
            likes: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "مقاله یافت نشد" },
        { status: 404 }
      );
    }

    // Increment view count
    await db.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Transform the response
    const transformedPost = {
      ...post,
      likes: post._count.likes,
      bookmarks: post._count.bookmarks,
      _count: undefined,
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "خطا در دریافت مقاله" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      subtitle,
      content,
      excerpt,
      coverImage,
      published,
      featured,
      tags,
      authorId,
    } = body;

    // Check if post exists and user has permission
    const existingPost = await db.post.findUnique({
      where: { id: id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "مقاله یافت نشد" },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== authorId) {
      return NextResponse.json(
        { error: "شما مجوز ویرایش این مقاله را ندارید" },
        { status: 403 }
      );
    }

    // Calculate reading time if content changed
    let readingTime = existingPost.readingTime;
    if (content && content !== existingPost.content) {
      const wordCount = content.split(/\s+/).length;
      readingTime = Math.ceil(wordCount / 200);
    }

    // Generate excerpt if not provided
    const finalExcerpt = excerpt || (content ? content.substring(0, 200) + "..." : existingPost.excerpt);

    const post = await db.post.update({
      where: { id: id },
      data: {
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle }),
        ...(content && { content }),
        ...(excerpt !== undefined && { excerpt: finalExcerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(published !== undefined && { published }),
        ...(featured !== undefined && { featured }),
        ...(readingTime !== existingPost.readingTime && { readingTime }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
        _count: {
          select: {
            likes: true,
            bookmarks: true,
          },
        },
      },
    });

    // Transform the response
    const transformedPost = {
      ...post,
      likes: post._count.likes,
      bookmarks: post._count.bookmarks,
      _count: undefined,
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "خطا در ویرایش مقاله" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");

    if (!authorId) {
      return NextResponse.json(
        { error: "شناسه نویسنده الزامی است" },
        { status: 400 }
      );
    }

    // Check if post exists and user has permission
    const existingPost = await db.post.findUnique({
      where: { id: id },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "مقاله یافت نشد" },
        { status: 404 }
      );
    }

    if (existingPost.authorId !== authorId) {
      return NextResponse.json(
        { error: "شما مجوز حذف این مقاله را ندارید" },
        { status: 403 }
      );
    }

    await db.post.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "مقاله با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "خطا در حذف مقاله" },
      { status: 500 }
    );
  }
}