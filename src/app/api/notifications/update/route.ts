import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "برای به‌روزرسانی اطلاع‌رسانی باید وارد شوید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const markAll = searchParams.get("markAll") === "true";

    if (markAll) {
      // Mark all notifications as read
      await db.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return NextResponse.json({ 
        message: "همه اطلاع‌رسانی‌ها خوانده شدند" 
      });
    } else if (notificationId) {
      // Mark specific notification as read
      const notification = await db.notification.update({
        where: {
          id: notificationId,
          userId: session.user.id,
        },
        data: {
          read: true,
        },
      });

      if (!notification) {
        return NextResponse.json(
          { error: "اطلاع‌رسانی یافت نشد" },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        message: "اطلاع‌رسانی خوانده شد" 
      });
    } else {
      return NextResponse.json(
        { error: "شناسه اطلاع‌رسانی یا پرچم markAll الزامی است" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی اطلاع‌رسانی" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "برای حذف اطلاع‌رسانی باید وارد شوید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");
    const deleteAll = searchParams.get("deleteAll") === "true";

    if (deleteAll) {
      // Delete all notifications
      await db.notification.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return NextResponse.json({ 
        message: "همه اطلاع‌رسانی‌ها حذف شدند" 
      });
    } else if (notificationId) {
      // Delete specific notification
      const notification = await db.notification.delete({
        where: {
          id: notificationId,
          userId: session.user.id,
        },
      });

      if (!notification) {
        return NextResponse.json(
          { error: "اطلاع‌رسانی یافت نشد" },
          { status: 404 }
        );
      }

      return NextResponse.json({ 
        message: "اطلاع‌رسانی حذف شد" 
      });
    } else {
      return NextResponse.json(
        { error: "شناسه اطلاع‌رسانی یا پرچم deleteAll الزامی است" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "خطا در حذف اطلاع‌رسانی" },
      { status: 500 }
    );
  }
}