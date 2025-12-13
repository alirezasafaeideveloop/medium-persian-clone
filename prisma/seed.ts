import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const samplePosts = [
  {
    title: "آینده هوش مصنوعی در ایران: فرصت‌ها و چالش‌ها",
    subtitle: "نگاهی عمیق به تأثیر AI بر اقتصاد و جامعه ایران",
    content: `
      <h2>مقدمه</h2>
      <p>هوش مصنوعی (AI) دیگر یک مفهوم علمی-تخیلی نیست، بلکه واقعیتی است که در حال تغییر دنیای ماست. ایران نیز به عنوان یکی از کشورهای در حال توسعه، با فرصت‌ها و چالش‌های منحصر به فردی در این زمینه روبرو است.</p>
      
      <h2>فرصت‌ها</h2>
      <p><strong>بهینه‌سازی صنایع:</strong> هوش مصنوعی می‌تواند به بهینه‌سازی صنایع نفت، گاز، پتروشیمی و فولاد کمک کند.</p>
      <p><strong>استارتاپ‌های فناوری:</strong> ایران پتانسیل بالایی برای رشد استارتاپ‌های مبتنی بر هوش مصنوعی دارد.</p>
      <p><strong>خدمات درمانی:</strong> AI می‌تواند به تشخیص دقیق‌تر بیماری‌ها و شخصی‌سازی درمان کمک کند.</p>
      
      <h2>چالش‌ها</h2>
      <p><strong>تحریم‌ها:</strong> محدودیت‌های بین‌المللی دسترسی به فناوری‌های پیشرفته را دشوار می‌کند.</p>
      <p><strong>نیروی انسانی متخصص:</strong> کمبود متخصصان ماهر در زمینه هوش مصنوعی یک چالش جدی است.</p>
      <p><strong>زیرساخت‌های فنی:</strong> نیاز به سرمایه‌گذاری heavy در زیرساخت‌های کامپیوتری و شبکه.</p>
      
      <h2>نتیجه‌گیری</h2>
      <p>با وجود چالش‌ها، آینده هوش مصنوعی در ایران روشن است. با سرمایه‌گذاری صحیح و تمرکز بر آموزش، ایران می‌تواند به یکی از بازیگران کلیدی در منطقه تبدیل شود.</p>
    `,
    excerpt: "در این مقاله به بررسی جامع تأثیر هوش مصنوعی بر بخش‌های مختلف اقتصاد ایران، از نفت و گاز گرفته تا استارتاپ‌های فناوری می‌پردازیم...",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    published: true,
    featured: true,
    readingTime: 12,
    tags: '["هوش مصنوعی", "تکنولوژی", "ایران"]',
    authorId: "user1",
  },
  {
    title: "برنامه‌نویسی ری‌اکت در سال ۲۰۲۴: بهترین شیوه‌ها",
    subtitle: "راهنمای کامل برای توسعه‌دهندگان ری‌اکت",
    content: `
      <h2>مقدمه</h2>
      <p>ری‌اکت در سال ۲۰۲۴ همچنان یکی از محبوب‌ترین کتابخانه‌های جاوااسکریپت برای ساخت رابط‌های کاربری است. در این مقاله به بررسی بهترین شیوه‌های توسعه با ری‌اکت می‌پردازیم.</p>
      
      <h2>ویژگی‌های جدید ری‌اکت ۱۸</h2>
      <p><strong>Concurrent Features:</strong> قابلیت‌های همزمانی که به برنامه‌ها اجازه می‌دهد روان‌تر عمل کنند.</p>
      <p><strong>Automatic Batching:</strong> بهبود عملکرد از طریق batch کردن خودکار state updates.</p>
      <p><strong>Transitions:</strong> API جدید برای مدیریت بهتر تغییرات UI.</p>
      
      <h2>بهترین شیوه‌ها</h2>
      <p><strong>استفاده از TypeScript:</strong> تایپ‌اسکریپت به کاهش باگ‌ها و بهبود maintainability کمک می‌کند.</p>
      <p><strong>Component Composition:</strong> استفاده از ترکیب کامپوننت‌ها به جای inheritance.</p>
      <p><strong>State Management:</strong> انتخاب ابزار مناسب برای مدیریت state بر اساس نیاز پروژه.</p>
      
      <h2>ابزارهای ضروری</h2>
      <p><strong>Vite:</strong> ابزار ساخت سریع و مدرن.</p>
      <p><strong>Tailwind CSS:</strong> فریمورک CSS utility-first.</p>
      <p><strong>Testing Library:</strong> برای تست کامپوننت‌ها.</p>
      
      <h2>نتیجه‌گیری</h2>
      <p>ری‌اکت همچنان در حال تکامل است و توسعه‌دهندگان باید با آخرین تغییرات و بهترین شیوه‌ها آشنا باشند تا برنامه‌های باکیفیت و بهینه بسازند.</p>
    `,
    excerpt: "با بررسی آخرین تغییرات در ری‌اکت ۱۸ و معرفی بهترین شیوه‌های توسعه، شما را برای ساخت اپلیکیشن‌های مدرن آماده می‌کنیم...",
    coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    published: true,
    featured: false,
    readingTime: 8,
    tags: '["React", "JavaScript", "برنامه‌نویسی"]',
    authorId: "user2",
  }
];

const sampleUsers = [
  {
    id: "user1",
    email: "ali@example.com",
    name: "علی رضایی",
    username: "alirezaei",
    password: "password123",
    bio: "متخصص هوش مصنوعی و توسعه‌دهنده نرم‌افزار. علاقه‌مند به تکنولوژی‌های نوین و کارآفرینی.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: "user2",
    email: "sara@example.com",
    name: "سارا محمدی",
    username: "saramohammadi",
    password: "password123",
    bio: "توسعه‌دهنده فرانت‌اند با تخصص در ری‌اکت و تایپ‌اسکریپت. عاشق کدنویسی تمیز و طراحی UI/UX.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b332c5ca?w=40&h=40&fit=crop&crop=face",
  },
];

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create users with hashed passwords
    for (const user of sampleUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await db.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          username: user.username,
          password: hashedPassword,
          bio: user.bio,
          image: user.image,
        },
        create: {
          ...user,
          password: hashedPassword,
        },
      });
    }

    // Create posts
    for (const post of samplePosts) {
      await db.post.create({
        data: post,
      });
    }

    console.log("Database seeded successfully!");
    console.log("Sample users created:");
    console.log("- ali@example.com / password123");
    console.log("- sara@example.com / password123");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await db.$disconnect();
  }
}

seedDatabase();