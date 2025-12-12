import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isFollowing: false });
    }

    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get("followingId");

    if (!followingId) {
      return NextResponse.json(
        { error: "شناسه کاربر مورد نظر الزامی است" },
        { status: 400 }
      );
    }

    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "خطا در بررسی وضعیت دنبال کردن" },
      { status: 500 }
    );
  }
}