import Head from "next/head";
import { Metadata } from "next";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonical?: string;
}

export function SEO({
  title = "مدیوم فارسی - پلتفرم نشر محتوای فارسی",
  description = "مدیوم فارسی یک پلتفرم مدرن برای نشر و خواندن مقالات فارسی در موضوعات مختلف است. با مدیوم فارسی، افکار خود را با دنیا به اشتراک بگذارید.",
  keywords = ["مدیوم فارسی", "وبلاگ فارسی", "مقالات فارسی", "نشر محتوا", "بلاگ نویسی"],
  author = "مدیوم فارسی",
  image = "/images/og-image.jpg",
  url = "https://medium-fa.ir",
  type = "website",
  publishedTime,
  modifiedTime,
  section,
  tags,
  noIndex = false,
  canonical,
}: SEOProps) {
  const siteName = "مدیوم فارسی";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "WebSite",
    name: title,
    headline: title,
    description,
    image,
    url,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: "/images/logo.png",
      },
    },
    ...(type === "article" && {
      datePublished: publishedTime,
      dateModified: modifiedTime,
      articleSection: section,
      keywords: tags?.join(", "),
    }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords.join(", ")} />
        <meta name="author" content={author} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
        <meta name="googlebot" content={noIndex ? "noindex,nofollow" : "index,follow"} />
        
        {/* Canonical URL */}
        {canonical && <link rel="canonical" href={canonical} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="fa_IR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:site" content="@medium_fa" />
        <meta name="twitter:creator" content={author} />
        
        {/* Article Specific Meta Tags */}
        {type === "article" && (
          <>
            {publishedTime && (
              <meta property="article:published_time" content={publishedTime} />
            )}
            {modifiedTime && (
              <meta property="article:modified_time" content={modifiedTime} />
            )}
            {section && <meta property="article:section" content={section} />}
            {tags?.map((tag) => (
              <meta key={tag} property="article:tag" content={tag} />
            ))}
          </>
        )}
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={siteName} />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </Head>
    </>
  );
}

export function generateMetadata({
  title,
  description,
  keywords,
  author,
  image,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  section,
  tags,
  noIndex = false,
  canonical,
}: SEOProps): Metadata {
  const siteName = "مدیوم فارسی";
  const fullTitle = title?.includes(siteName) ? title : `${title} | ${siteName}`;
  
  return {
    title: fullTitle,
    description,
    keywords: keywords?.join(", "),
    authors: author ? [{ name: author }] : [],
    openGraph: {
      title: fullTitle,
      description,
      images: image ? [{ url: image }] : [],
      url,
      type,
      siteName,
      locale: "fa_IR",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: image ? [image] : [],
      creator: author,
      site: "@medium_fa",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    alternates: {
      canonical,
    },
    other: {
      ...(publishedTime && { "article:published_time": publishedTime }),
      ...(modifiedTime && { "article:modified_time": modifiedTime }),
      ...(section && { "article:section": section }),
      ...(tags?.reduce((acc, tag) => {
        acc[`article:tag`] = tag;
        return acc;
      }, {} as Record<string, string>)),
    },
  };
}