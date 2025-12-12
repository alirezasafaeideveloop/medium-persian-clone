import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const featured = searchParams.get("featured") === "true";
    const published = searchParams.get("published") !== "false";
    const authorId = searchParams.get("authorId");
    const tags = searchParams.get("tags");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      published,
    };

    if (featured) {
      where.featured = true;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (tags) {
      const tagArray = tags.split(",").map(tag => tag.trim());
      where.OR = tagArray.map(tag => ({
        tags: {
          contains: tag
        }
      }));
    }

    // Get posts with author info
    const posts = await db.post.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await db.post.count({ where });

    // Transform the data to match the expected format
    const transformedPosts = posts.map(post => ({
      ...post,
      tags: Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags || "[]"),
      likes: post._count.likes,
      bookmarks: post._count.bookmarks,
      _count: undefined,
    }));

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "خطا در دریافت مقالات" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      content,
      excerpt,
      coverImage,
      published = false,
      featured = false,
      tags = [],
      authorId,
    } = body;

    // Validate required fields
    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: "فیلدهای عنوان، محتوا و نویسنده الزامی هستند" },
        { status: 400 }
      );
    }

    // Calculate reading time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Generate excerpt if not provided
    const generatedExcerpt = excerpt || content.substring(0, 200) + "...";

    const post = await db.post.create({
      data: {
        title,
        subtitle,
        content,
        excerpt: generatedExcerpt,
        coverImage,
        published,
        featured,
        readingTime,
        tags: JSON.stringify(tags),
        authorId,
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

    return NextResponse.json(transformedPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد مقاله" },
      { status: 500 }
    );
  }
}