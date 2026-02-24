"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  FiHome, 
  FiPackage, 
  FiShoppingBag, 
  FiGrid, 
  FiSettings, 
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiMenu,
  FiImage,
  FiTag,
  FiEdit2,
  FiMessageSquare
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import NotificationBell from "./NotificationBell";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: FiHome },
  { label: "Products", href: "/admin/products", icon: FiPackage },
  { label: "Orders", href: "/admin/orders", icon: FiShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: FiUsers },
  { label: "Categories", href: "/admin/categories", icon: FiGrid },
  { label: "Coupons", href: "/admin/coupons", icon: FiTag },
  { label: "Tickets", href: "/admin/tickets", icon: FiMessageSquare },
  { label: "Blog", href: "/admin/blogs", icon: FiEdit2 },
  { label: "Hero Slider", href: "/admin/hero-slides", icon: FiImage },
  { label: "Settings", href: "/admin/settings", icon: FiSettings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, userInfo } = useUserStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on resize > md
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
    {/* Mobile Top Navigation Bar */}
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white z-[40] flex items-center justify-between px-4 sm:px-6 shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-primary w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg">S</div>
        <span className="text-xl font-display font-bold tracking-tight">GRABSZY <span className="text-primary font-normal text-xs uppercase tracking-widest ml-1">Admin</span></span>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell className="text-white" align="right" />
        <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 -mr-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
        >
            {isMobileOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
    </header>

    {/* Backdrop */}
    {isMobileOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
        />
    )}

    <aside 
      className={`bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-screen z-50 top-0 bottom-0 ${
        isCollapsed ? "md:w-20" : "md:w-72"
      } w-72 ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >

      {/* Brand (Desktop Only) */}
      <div className="hidden md:flex p-6 mb-8 items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="bg-primary w-8 h-8 rounded-xl flex items-center justify-center font-bold text-lg">S</div>
            <span className="text-xl font-display font-bold tracking-tight">GRABSZY <span className="text-primary font-normal text-xs uppercase tracking-widest ml-1">Admin</span></span>
            <NotificationBell className="ml-2 text-white" align="left" />
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
        </button>
      </div>
      
      {/* Mobile Branding inside Sidebar (Optional, keeps parity) */}
      <div className="md:hidden p-6 mb-4 flex items-center justify-between border-b border-white/10 pt-8">
         <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Navigation</span>
         <button 
          onClick={() => setIsMobileOpen(false)}
          className="p-2 bg-white/10 rounded-xl transition-colors"
         >
          <FiChevronLeft size={20} />
         </button>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={22} className={isActive ? "text-white" : "group-hover:text-primary transition-colors"} />
              {!isCollapsed && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-white/5 mt-auto">
        {!isCollapsed && userInfo && (
          <div className="mb-4 px-4 py-3 bg-white/5 rounded-2xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Admin User</p>
            <p className="text-sm font-bold truncate">{userInfo.name}</p>
          </div>
        )}
        <button
          onClick={() => {
            logout();
            router.push("/admin/login");
          }}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-sm tracking-wide"
        >
          <FiLogOut size={22} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
    </>
  );
}
