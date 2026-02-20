import "../styles/globals.css";
import { Toaster } from "react-hot-toast";
import QueryProvider from "./QueryProvider";
import { Outfit } from "next/font/google";
import AuthModal from "@/components/AuthModal";
import SettingsInitializer from "@/components/SettingsInitializer";
import PopupManager from "@/components/popups/PopupManager";
import ChatWidget from "@/components/ChatWidget";
import PushNotificationManager from "@/components/PushNotificationManager";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

import dbConnect from "@/lib/db";
import Settings from "@/models/Settings";
import ScriptManager from "@/components/ScriptManager";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";

export async function generateMetadata() {
  await dbConnect();
  const settings = await Settings.findOne().lean() || {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabszy.com";
  
  return {
    title: settings.seo?.metaTitle || "GRABSZY | Premium Clothing & Lifestyle",
    description: settings.seo?.metaDescription || "Experience the next generation of online shopping with Grabszy.",
    keywords: settings.seo?.metaKeywords || "fashion, clothing, premium, ecommerce",
    icons: {
      icon: settings.favicon || '/favicon.ico',
    },
    openGraph: {
      title: settings.seo?.metaTitle,
      description: settings.seo?.metaDescription,
      url: siteUrl,
      siteName: settings.siteName || "GRABSZY",
      images: [
        {
          url: settings.seo?.ogImage || `${siteUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.seo?.metaTitle,
      description: settings.seo?.metaDescription,
      images: [settings.seo?.ogImage || `${siteUrl}/og-image.jpg`],
    },
  };
}

export default async function RootLayout({ children }) {  
    await dbConnect();
    const settings = await Settings.findOne().lean() || {};
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabszy.com";

    return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans bg-surface min-h-screen antialiased`} suppressHydrationWarning={true}>
        <QueryProvider>
          <SettingsInitializer />
          <AuthModal />
          <PopupManager />
          <ChatWidget />
          <PushNotificationManager />
          <ScriptManager scripts={settings.scripts} />
          <OrganizationJsonLd 
            siteName={settings.siteName || "GRABSZY"}
            logo={settings.logo || `${siteUrl}/logo.png`}
            url={siteUrl}
            supportEmail={settings.supportEmail}
          />
          <WebSiteJsonLd 
            siteName={settings.siteName || "GRABSZY"}
            url={siteUrl}
          />
          {children}
          <Toaster position="top-right" />   
        </QueryProvider>
      </body>
    </html>
  );
}
