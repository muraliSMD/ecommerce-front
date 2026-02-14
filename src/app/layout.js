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

export async function generateMetadata() {
  await dbConnect();
  const settings = await Settings.findOne() || {};
  
  return {
    title: settings.seo?.metaTitle || "Premium Clothing | Shop Trending Styles",
    description: settings.seo?.metaDescription || "Experience the next generation of online shopping.",
    icons: {
      icon: settings.favicon || '/favicon.ico',
    }
  };
}

export default function RootLayout({ children }) {  
    return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans bg-surface min-h-screen antialiased`}>
        <QueryProvider>
          <SettingsInitializer />
          <AuthModal />
          <PopupManager />
          <ChatWidget />
          <PushNotificationManager />
          {children}
          <Toaster position="top-right" />   
        </QueryProvider>
      </body>
    </html>
  );
}
