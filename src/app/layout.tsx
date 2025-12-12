import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "مدیوم فارسی - پلتفرم انتشار محتوای فارسی",
  description: "پلتفرم حرفه‌ای برای انتشار و خواندن مقالات فارسی - نسخه فارسی مدیوم",
  keywords: ["مدیوم فارسی", "وبلاگ فارسی", "مقالات فارسی", "نویسندگان فارسی", "محتوای فارسی"],
  authors: [{ name: "تیم مدیوم فارسی" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "مدیوم فارسی",
    description: "پلتفرم حرفه‌ای برای انتشار و خواندن مقالات فارسی",
    siteName: "مدیوم فارسی",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "مدیوم فارسی",
    description: "پلتفرم حرفه‌ای برای انتشار و خواندن مقالات فارسی",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning={true}>
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
