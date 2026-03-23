"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TransitionBar from "@/components/TransitionBar";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function StorefrontLayout({ children }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <div className="flex flex-col min-h-screen">
      <TransitionBar />
      {!isAuthRoute && <Header />}
      
      <div className={`flex-1 flex flex-col ${!isAuthRoute ? 'pt-28 lg:pt-48' : ''}`}>
        {pathname !== "/" && !isAuthRoute && (
          <div className="bg-bg-main">
            <Breadcrumbs />
          </div>
        )}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {!isAuthRoute && <Footer />}
    </div>
  );
}
