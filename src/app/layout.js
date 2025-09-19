"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../styles/globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Determine if current route is auth
  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen flex flex-col">
        {/* Render header only if NOT auth route */}
        {!isAuthRoute && <Header />}

        <QueryClientProvider client={queryClient}>
          <main className="flex-1">{children}</main>
          <Toaster position="top-right" />
        </QueryClientProvider>

        {/* Render footer only if NOT auth route */}
        {!isAuthRoute && <Footer />}
      </body>
    </html>
  );
}
