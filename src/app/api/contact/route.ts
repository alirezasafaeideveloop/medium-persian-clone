import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, type } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "تمام فیلدها الزامی هستند" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "ایمیل نامعتبر است" },
        { status: 400 }
      );
    }

    // Save contact message to database
    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        type: type || "general",
        status: "pending",
      },
    });

    // Send notification to admin using ZAI
    try {
      const zai = await ZAI.create();
      
      const notificationMessage = `
پیام جدید از تماس با ما:

نام: ${name}
ایمیل: ${email}
نوع: ${type || "general"}
موضوع: ${subject}
پیام: ${message}

تاریخ: ${new Date().toLocaleString("fa-IR")}
      `;

      // You can use ZAI to process this message or send notifications
      // For example, you could categorize the message or generate a summary
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "شما یک دستیار برای مدیریت پیام‌های تماس با ما هستید. لطفاً پیام را دسته‌بندی کرده و اولویت آن را مشخص کنید."
          },
          {
            role: "user",
            content: notificationMessage,
          },
        ],
      });

      console.log("AI Analysis:", completion.choices[0]?.message?.content);
    } catch (aiError) {
      console.error("Error processing with ZAI:", aiError);
      // Continue even if AI processing fails
    }

    return NextResponse.json({
      message: "پیام شما با موفقیت ارسال شد",
      id: contactMessage.id,
    });
  } catch (error) {
    console.error("Error in contact:", error);
    return NextResponse.json(
      { error: "خطا در ارسال پیام" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all";

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== "all") {
      where.status = status;
    }

    const messages = await db.contactMessage.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const total = await db.contactMessage.count({
      where,
    });

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پیام‌ها" },
      { status: 500 }
    );
  }
}