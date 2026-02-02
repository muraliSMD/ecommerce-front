"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function StorefrontLayout({ children }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <>
      {!isAuthRoute && <Header />}
      <main className="flex-1">{children}</main>
      {!isAuthRoute && <Footer />}
    </>
  );
}
