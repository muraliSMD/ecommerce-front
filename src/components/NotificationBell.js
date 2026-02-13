"use client";

import { useState, useEffect, useRef } from "react";
import { FiBell } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

export default function NotificationBell({ className = "", align = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  // Polling every 30 seconds
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data;
    },
    refetchInterval: 30000, 
    staleTime: 10000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
       await api.put("/notifications", { id });
    },
    onSuccess: () => {
       queryClient.invalidateQueries(["notifications"]);
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
       await api.put("/notifications", { markAllRead: true });
    },
    onSuccess: () => {
       queryClient.invalidateQueries(["notifications"]);
    }
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
        markReadMutation.mutate(notif._id);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100/10 transition-colors"
      >
        <FiBell size={22} className="currentColor" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
           <motion.div
             initial={{ opacity: 0, y: 10, scale: 0.95 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className={`absolute ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'} top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left`}
           >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <h3 className="font-bold text-gray-900">Notifications</h3>
                 {unreadCount > 0 && (
                    <button 
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-xs text-primary font-bold hover:underline"
                    >
                        Mark all read
                    </button>
                 )}
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto">
                 {notifications.length > 0 ? (
                    notifications.map((notif) => (
                        <div 
                            key={notif._id} 
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.isRead ? 'bg-primary/5' : ''}`}
                        >
                           <Link 
                                href={notif.link || "#"} 
                                onClick={() => handleNotificationClick(notif)}
                                className="block"
                           >
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {notif.title}
                                    </h4>
                                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></span>}
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{notif.message}</p>
                                <span className="text-xs text-gray-400">
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                </span>
                           </Link>
                        </div>
                    ))
                 ) : (
                    <div className="p-8 text-center text-gray-400">
                        <FiBell size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                 )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
