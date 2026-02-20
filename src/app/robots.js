export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabszy.com";
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/account/',
        '/api/',
        '/checkout/',
        '/verify-email/',
        '/reset-password/',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
