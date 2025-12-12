import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://medium-fa.ir";
    
    // Get latest published posts
    const posts = await db.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 20,
    });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  
  <channel>
    <title>مدیوم فارسی</title>
    <description>مدیوم فارسی یک پلتفرم مدرن برای نشر و خواندن مقالات فارسی در موضوعات مختلف است.</description>
    <link>${baseUrl}</link>
    <language>fa-ir</language>
    <copyright>Copyright ${new Date().getFullYear()} مدیوم فارسی</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
    <generator>مدیوم فارسی RSS Generator</generator>
    
    ${posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt || "مقاله‌ای از مدیوم فارسی"}]]></description>
      <link>${baseUrl}/article/${post.id}</link>
      <guid isPermaLink="true">${baseUrl}/article/${post.id}</guid>
      <pubDate>${post.publishedAt?.toUTCString() || post.createdAt.toUTCString()}</pubDate>
      <dc:creator><![CDATA[${post.author.name}]]></dc:creator>
      <category><![CDATA[مقالات فارسی]]></category>
      ${post.coverImage ? `<enclosure url="${post.coverImage}" type="image/jpeg" />` : ""}
      <content:encoded><![CDATA[
        ${post.coverImage ? `<img src="${post.coverImage}" alt="${post.title}" style="max-width: 100%; height: auto;" />` : ""}
        <div style="direction: rtl; text-align: right; font-family: 'Vazirmatn', sans-serif;">
          ${post.content.replace(/<[^>]*>/g, '').substring(0, 500)}...
        </div>
        <p style="text-align: center; margin-top: 20px;">
          <a href="${baseUrl}/article/${post.id}" style="background-color: #1a1a1a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            ادامه مطلب
          </a>
        </p>
      ]]></content:encoded>
    </item>`).join('')}
    
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}