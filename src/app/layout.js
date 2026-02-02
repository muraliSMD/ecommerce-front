import "../styles/globals.css";
import { Toaster } from "react-hot-toast";
import QueryProvider from "./QueryProvider";
import { Outfit } from "next/font/google";
import AuthModal from "@/components/AuthModal";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Premium Clothing | Shop Trending Styles",
  description: "Experience the next generation of online shopping with our curated clothing collection.",
};

export default function RootLayout({ children }) {  
    return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans bg-surface min-h-screen antialiased`}>
        <QueryProvider>
          <AuthModal />
          {children}
          <Toaster position="bottom-center" />     
        </QueryProvider>
      </body>
    </html>
  );
}
