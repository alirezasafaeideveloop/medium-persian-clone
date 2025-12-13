import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "برای مشاهده آمار باید وارد شوید" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get basic stats
    const [totalViews, totalLikes, totalBookmarks, totalPosts, totalFollowers, totalFollowing] = await Promise.all([
      // Total views
      db.post.aggregate({
        where: { authorId: userId },
        _sum: { views: true },
      }).then(result => result._sum.views || 0),

      // Total likes
      db.like.count({
        where: {
          post: { authorId: userId },
        },
      }),

      // Total bookmarks
      db.bookmark.count({
        where: {
          post: { authorId: userId },
        },
      }),

      // Total posts
      db.post.count({
        where: { authorId: userId },
      }),

      // Total followers
      db.follow.count({
        where: { followingId: userId },
      }),

      // Total following
      db.follow.count({
        where: { followerId: userId },
      }),
    ]);

    // Get monthly views for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyViews = await db.post.findMany({
      where: {
        authorId: userId,
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        views: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by month
    const monthlyData = monthlyViews.reduce((acc: any[], post) => {
      const month = post.createdAt.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short' });
      const existingMonth = acc.find(item => item.month === month);
      
      if (existingMonth) {
        existingMonth.views += post.views;
      } else {
        acc.push({ month, views: post.views });
      }
      
      return acc;
    }, []);

    // Get top posts
    const topPosts = await db.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        views: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        views: 'desc',
      },
      take: 5,
    });

    const formattedTopPosts = topPosts.map(post => ({
      ...post,
      likes: post._count.likes,
    }));

    // Get post stats (published vs drafts)
    const [publishedCount, draftCount] = await Promise.all([
      db.post.count({
        where: { authorId: userId, published: true },
      }),
      db.post.count({
        where: { authorId: userId, published: false },
      }),
    ]);

    const statsData = {
      totalViews,
      totalLikes,
      totalBookmarks,
      totalPosts,
      totalFollowers,
      totalFollowing,
      monthlyViews: monthlyData,
      topPosts: formattedTopPosts,
      postStats: {
        published: publishedCount,
        drafts: draftCount,
        total: publishedCount + draftCount,
      },
    };

    return NextResponse.json(statsData);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "خطا در دریافت آمار" },
      { status: 500 }
    );
  }
}