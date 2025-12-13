import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "ایمیل الزامی است" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "اگر ایمیل در سیستم وجود داشته باشد، لینک بازیابی رمز عبور ارسال می‌شود"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token to database
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
    
    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      return NextResponse.json(
        { error: "خطا در ارسال ایمیل بازیابی رمز عبور" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "لینک بازیابی رمز عبور به ایمیل شما ارسال شد"
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "خطا در پردازش درخواست" },
      { status: 500 }
    );
  }
}