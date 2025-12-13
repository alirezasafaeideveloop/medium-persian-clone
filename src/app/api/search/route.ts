import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "posts"; // posts, users, topics
    const sort = searchParams.get("sort") || "relevance"; // relevance, date, views, likes
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const topic = searchParams.get("topic");
    const author = searchParams.get("author");

    const skip = (page - 1) * limit;

    // Build search conditions
    const searchConditions: any = {};

    if (query) {
      searchConditions.OR = [
        { title: { contains: query } },
        { subtitle: { contains: query } },
        { content: { contains: query } },
        { tags: { contains: query } },
      ];
    }

    if (topic) {
      searchConditions.tags = { contains: topic };
    }

    if (author) {
      searchConditions.author = {
        name: { contains: author }
      };
    }

    // Build order by clause
    let orderBy: any = {};
    switch (sort) {
      case "date":
        orderBy = { createdAt: "desc" };
        break;
      case "views":
        orderBy = { views: "desc" };
        break;
      case "likes":
        orderBy = {
          likes: {
            _count: "desc"
          }
        };
        break;
      default: // relevance
        orderBy = [
          { createdAt: "desc" },
          { views: "desc" },
          {
            likes: {
              _count: "desc"
            }
          }
        ];
    }

    let results: any[] = [];
    let total = 0;

    if (type === "posts") {
      // Search posts
      const where = {
        published: true,
        ...searchConditions
      };

      const [posts, totalCount] = await Promise.all([
        db.post.findMany({
          where,
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
          orderBy,
          skip,
          take: limit,
        }),
        db.post.count({ where }),
      ]);

      results = posts.map(post => ({
        ...post,
        likes: post._count.likes,
        bookmarks: post._count.bookmarks,
        _count: undefined,
      }));
      total = totalCount;
    } else if (type === "users") {
      // Search users
      const where = {
        ...searchConditions
      };

      results = await db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          username: true,
          bio: true,
          image: true,
          _count: {
            select: {
              posts: {
                where: { published: true }
              },
              followers: true,
            },
          },
        },
        orderBy: [
          { name: "asc" }
        ],
        skip,
        take: limit,
      });

      total = await db.user.count({ where });
    } else if (type === "topics") {
      // Extract and count unique tags
      const posts = await db.post.findMany({
        where: {
          published: true,
          tags: { not: "" }
        },
        select: {
          tags: true,
        },
      });

      // Extract all tags and count occurrences
      const tagCounts: { [key: string]: number } = {};
      posts.forEach(post => {
        if (post.tags) {
          try {
            const tags = JSON.parse(post.tags);
            tags.forEach((tag: string) => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          } catch (error) {
            console.error("Error parsing tags:", error);
          }
        }
      });

      // Filter by query if provided
      let filteredTags = Object.entries(tagCounts);
      if (query) {
        filteredTags = filteredTags.filter(([tag]) => 
          tag.toLowerCase().includes(query.toLowerCase())
        );
      }

      // Sort by count and take limit
      results = filteredTags
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }));
      
      total = filteredTags.length;
    }

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      query: {
        q: query,
        type,
        sort,
        topic,
        author,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "خطا در جستجو" },
      { status: 500 }
    );
  }
}