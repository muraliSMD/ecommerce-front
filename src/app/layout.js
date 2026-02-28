import "../styles/globals.css";
import { Toaster } from "react-hot-toast";
import QueryProvider from "./QueryProvider";
import { Montserrat, Open_Sans } from "next/font/google";
import AuthModal from "@/components/AuthModal";
import SettingsInitializer from "@/components/SettingsInitializer";
import PopupManager from "@/components/popups/PopupManager";
import ChatWidget from "@/components/ChatWidget";
import PushNotificationManager from "@/components/PushNotificationManager";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

import dbConnect from "@/lib/db";
import Settings from "@/models/Settings";
import ScriptManager from "@/components/ScriptManager";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";
import PwaManager from "@/components/PwaManager";

export async function generateMetadata() {
  await dbConnect();
  const settingsDoc = await Settings.findOne().lean();
  const settings = settingsDoc ? JSON.parse(JSON.stringify(settingsDoc)) : {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabszy.com";
  
  return {
    title: settings.seo?.metaTitle || "GRABSZY | Premium Clothing & Lifestyle",
    description: settings.seo?.metaDescription || "Experience the next generation of online shopping with Grabszy.",
    keywords: settings.seo?.metaKeywords || "fashion, clothing, premium, ecommerce",
    manifest: '/manifest.json',
    icons: {
      icon: settings.favicon || '/favicon.ico',
      apple: '/icons/icon-192x192.png',
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

export function generateViewport() {
  return {
    themeColor: '#000000',
  };
}

export default async function RootLayout({ children }) {  
    await dbConnect();
    const settingsDoc = await Settings.findOne().lean();
    const settings = settingsDoc ? JSON.parse(JSON.stringify(settingsDoc)) : {};
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grabszy.com";

    return (
    <html lang="en">
      <body className={`${montserrat.variable} ${openSans.variable} font-sans bg-surface min-h-screen antialiased`} suppressHydrationWarning={true}>
        <QueryProvider>
          <SettingsInitializer />
          <AuthModal />
          <PwaManager />
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
