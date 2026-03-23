"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiPackage, FiMapPin, FiUser, FiCreditCard, FiLogOut, FiMessageSquare } from "react-icons/fi";
import { useUserStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/Loader";

export default function AccountLayout({ children }) {
  const pathname = usePathname();
  const { userInfo, logout, isHydrated } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if hydration is complete and we are DEFINITELY not logged in
    // This prevents race conditions during token rehydration
    if (isHydrated && !userInfo) {
      router.push("/");
    }
  }, [userInfo, isHydrated, router]);

  if (!isHydrated) return <PageLoader />;
  if (!userInfo) return null;

  const links = [
    { href: "/account", label: "Overview", icon: FiGrid },
    { href: "/account/orders", label: "My Orders", icon: FiPackage },
    { href: "/account/tickets", label: "Support Tickets", icon: FiMessageSquare },
    { href: "/account/addresses", label: "Addresses", icon: FiMapPin },
    { href: "/account/profile", label: "Profile", icon: FiUser },
    // { href: "/account/wallet", label: "Saved Cards", icon: FiCreditCard }, // Future
  ];

  return (
     <main className="bg-bg-main min-h-screen pb-12 text-text-main">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
           <aside className="lg:w-64 flex-shrink-0">
             <div className="bg-bg-surface rounded-3xl p-6 shadow-sm border border-border-main sticky top-20 lg:top-32">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border-main/50">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                        {userInfo.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-text-main">{userInfo.name}</h3>
                        <p className="text-xs text-text-muted truncate w-32">{userInfo.email}</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                                    isActive 
                                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                    : "text-text-muted hover:bg-bg-section/50 hover:text-text-main"
                                }`}
                            >
                                <Icon size={20} />
                                {link.label}
                            </Link>
                        );
                    })}
                    
                    <button 
                        onClick={async () => {
                            await logout();
                            router.push("/");
                            router.refresh();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-red-500 hover:bg-red-500/10 mt-4"
                    >
                        <FiLogOut size={20} />
                        Logout
                    </button>
                </nav>
             </div>
          </aside>

          {/* Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
