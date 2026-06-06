"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import TransitionBar from "@/components/TransitionBar";

export default function AdminLayoutContent({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load collapse preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    } else {
      // Default to collapsed on smaller desktop screens (like 13-inch Macbook, width < 1280px)
      if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      }
    }
  }, []);

  const handleToggleCollapse = (val) => {
    setIsCollapsed(val);
    localStorage.setItem("admin-sidebar-collapsed", String(val));
  };

  return (
    <div className="flex bg-[#f9fafb] min-h-screen light text-gray-900">
      <TransitionBar />
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <main className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-72"} ml-0 p-4 pt-20 md:p-8 w-full`}>
        <div className="container mx-auto max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
