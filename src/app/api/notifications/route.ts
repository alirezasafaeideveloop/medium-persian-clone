import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "برای دریافت اطلاع‌رسانی باید وارد شوید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const skip = (page - 1) * limit;

    const where: any = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      where.read = false;
    }

    const notifications = await db.notification.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const total = await db.notification.count({
      where,
    });

    const unreadCount = await db.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    // Transform notifications to include actor info
    const transformedNotifications = notifications.map(notification => {
      let message = "";
      
      switch (notification.type) {
        case "like":
          message = `${notification.actor?.name || "کاربری"} مقاله شما را لایک کرد`;
          break;
        case "comment":
          message = `${notification.actor?.name || "کاربری"} به مقاله شما کامنت داد`;
          break;
        case "follow":
          message = `${notification.actor?.name || "کاربری"} شما را دنبال کرد`;
          break;
        case "bookmark":
          message = `${notification.actor?.name || "کاربری"} مقاله شما را نشان کرد`;
          break;
        case "mention":
          message = `${notification.actor?.name || "کاربری"} شما را در کامنت منشن کرد`;
          break;
        default:
          message = notification.message || "اطلاع‌رسانی جدید";
      }

      return {
        ...notification,
        message,
        actorName: notification.actor?.name || "کاربری",
        actorUsername: notification.actor?.username || "user",
        actorImage: notification.actor?.image || null,
        postTitle: notification.post?.title || null,
        postSlug: notification.post?.id || null,
      };
    });

    return NextResponse.json({
      notifications: transformedNotifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاع‌رسانی" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "برای ایجاد اطلاع‌رسانی باید وارد شوید" },
        { status: 401 }
      );
    }

    const { userId, type, message, postId, actorId } = await request.json();

    if (!userId || !type) {
      return NextResponse.json(
        { error: "شناسه کاربر و نوع اطلاع‌رسانی الزامی هستند" },
        { status: 400 }
      );
    }

    // Don't create notification for self
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "نمی‌توان برای خود اطلاع‌رسانی ایجاد کرد" },
        { status: 400 }
      );
    }

    const notification = await db.notification.create({
      data: {
        userId,
        type,
        message: message || "",
        postId: postId || null,
        actorId: actorId || session.user.id,
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Transform notification
    let notificationMessage = "";
    
    switch (notification.type) {
      case "like":
        notificationMessage = `${notification.actor?.name || "کاربری"} مقاله شما را لایک کرد`;
        break;
      case "comment":
        notificationMessage = `${notification.actor?.name || "کاربری"} به مقاله شما کامنت داد`;
        break;
      case "follow":
        notificationMessage = `${notification.actor?.name || "کاربری"} شما را دنبال کرد`;
        break;
      case "bookmark":
        notificationMessage = `${notification.actor?.name || "کاربری"} مقاله شما را نشان کرد`;
        break;
      case "mention":
        notificationMessage = `${notification.actor?.name || "کاربری"} شما را در کامنت منشن کرد`;
        break;
      default:
        notificationMessage = notification.message || "اطلاع‌رسانی جدید";
    }

    const transformedNotification = {
      ...notification,
      message: notificationMessage,
      actorName: notification.actor?.name || "کاربری",
      actorUsername: notification.actor?.username || "user",
      actorImage: notification.actor?.image || null,
      postTitle: notification.post?.title || null,
      postSlug: notification.post?.id || null,
    };

    return NextResponse.json(transformedNotification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد اطلاع‌رسانی" },
      { status: 500 }
    );
  }
}