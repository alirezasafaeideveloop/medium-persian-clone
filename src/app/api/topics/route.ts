import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "popular"; // popular, name, recent
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // Build where clause
    let where: any = {};
    let orderBy: any = {};

    if (category && category !== "all") {
      where.tags = { contains: category };
    }

    switch (sort) {
      case "name":
        orderBy = { name: "asc" };
        break;
      case "recent":
        orderBy = { createdAt: "desc" };
        break;
      default: // popular
        orderBy = {
          _count: {
            posts: "desc"
          }
        };
    }

    // Get topics with post counts
    const posts = await db.post.findMany({
      where: {
        published: true,
        ...where
      },
      select: {
        tags: true,
        createdAt: true,
      },
      orderBy,
      skip,
      take: limit * 2, // Get more to calculate counts
    });

    // Extract and count unique tags
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

    // Convert to array and apply filters
    let topics = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .filter(({ tag }) => {
        if (category && category !== "all") {
          return tag.toLowerCase() === category.toLowerCase();
        }
        return true;
      });

    // Sort and paginate
    topics.sort((a, b) => {
      if (sort === "name") {
        return a.tag.localeCompare(b.tag, "fa-IR");
      } else {
        return b.count - a.count;
      }
    });

    const total = topics.length;
    const paginatedTopics = topics.slice(skip, skip + limit);

    // Get categories
    const allTags = Object.keys(tagCounts);
    const categories = [
      { name: "تکنولوژی", value: "تکنولوژی", count: 0 },
      { name: "برنامه‌نویسی", value: "برنامه-نویسی", count: 0 },
      { name: "طراحی", value: "طراحی", count: 0 },
      { name: "کسب‌وکار", value: "کسب-وکار", count: 0 },
      { name: "علم", value: "علم", count: 0 },
      { name: "فرهنگ و موسیقی", value: "فرهنگ-موسیقی", count: 0 },
      { name: "ورزش", value: "ورزش", count: 0 },
      { name: "سینما", value: "سینما", count: 0 },
      { name: "گردشگری", value: "گردشگری", count: 0 },
      { name: "سیاست", value: "سیاست", count: 0 },
      { name: "تاریخ و فرهنگ", value: "تاریخ-و-فرهنگ", count: 0 },
      { name: "علم و تحقیق", value: "علم-و-تحقیق", count: 0 },
    ];

    categories.forEach(category => {
      const count = allTags.filter(tag => 
        tag.toLowerCase().includes(category.value)
      ).length;
      category.count = count;
    });

    return NextResponse.json({
      topics: paginatedTopics,
      categories: categories.sort((a, b) => b.count - a.count),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        category,
        sort,
      },
    });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "خطا در دریافت موضوعات" },
      { status: 500 }
    );
  }
}