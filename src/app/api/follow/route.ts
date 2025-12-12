import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "برای دنبال کردن باید وارد شوید" },
        { status: 401 }
      );
    }

    const { followingId } = await request.json();

    if (!followingId) {
      return NextResponse.json(
        { error: "شناسه کاربر مورد نظر الزامی است" },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: "شما قبلاً این کاربر را دنبال می‌کنید" },
        { status: 400 }
      );
    }

    // Create follow relationship
    const follow = await db.follow.create({
      data: {
        followerId: session.user.id,
        followingId,
      },
    });

    return NextResponse.json({ message: "با موفقیت دنبال شدید", follow });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "خطا در دنبال کردن کاربر" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "برای لغو دنبال کردن باید وارد شوید" },
        { status: 401 }
      );
    }

    const { followingId } = await request.json();

    if (!followingId) {
      return NextResponse.json(
        { error: "شناسه کاربر مورد نظر الزامی است" },
        { status: 400 }
      );
    }

    // Remove follow relationship
    await db.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    return NextResponse.json({ message: "دنبال کردن با موفقیت لغو شد" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "خطا در لغو دنبال کردن کاربر" },
      { status: 500 }
    );
  }
}