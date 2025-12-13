export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
          صفحه یافت نشد
        </h2>
        <p className="text-muted-foreground mb-8">
          صفحه‌ای که به دنبال آن بودید وجود ندارد یا حذف شده است.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
        >
          بازگشت به صفحه اصلی
        </a>
      </div>
    </div>
  );
}