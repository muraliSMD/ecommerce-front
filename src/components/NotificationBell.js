"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiBell } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

export default function NotificationBell({ className = "", align = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
               
               {/* View All Button */}
               <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
                  <button 
                      onClick={() => {
                          setIsOpen(false);
                          setIsModalOpen(true);
                      }}
                      className="text-sm font-bold text-primary hover:text-secondary transition-colors"
                  >
                      View All Notifications
                  </button>
               </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Full Notifications Modal via Portal */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                 {/* Backdrop */}
                 <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                     onClick={() => setIsModalOpen(false)}
                 />
                 
                 {/* Modal Content */}
                 <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="relative w-[95vw] md:w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                 >
                    {/* Header */}
                    <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                       <div>
                           <h2 className="text-2xl font-display font-bold text-gray-900">All Notifications</h2>
                           <p className="text-sm text-gray-500 mt-1">Stay updated with your latest alerts</p>
                       </div>
                       <div className="flex items-center gap-4">
                           {unreadCount > 0 && (
                              <button 
                                  onClick={() => markAllReadMutation.mutate()}
                                  className="text-sm text-primary font-bold hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors"
                              >
                                  Mark all read
                              </button>
                           )}
                           <button 
                               onClick={() => setIsModalOpen(false)}
                               className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                           >
                               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                           </button>
                       </div>
                    </div>
                    
                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-50/30">
                       {notifications.length > 0 ? (
                          <div className="space-y-2">
                              {notifications.map((notif) => (
                                  <div 
                                      key={notif._id} 
                                      className={`p-5 rounded-2xl border transition-all ${
                                          !notif.isRead 
                                              ? 'bg-white border-primary/20 shadow-md shadow-primary/5' 
                                              : 'bg-white border-gray-100 hover:border-gray-200'
                                      }`}
                                  >
                                     <Link 
                                          href={notif.link || "#"} 
                                          onClick={() => {
                                              if (!notif.isRead) markReadMutation.mutate(notif._id);
                                              setIsModalOpen(false);
                                          }}
                                          className="flex gap-4"
                                     >
                                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                              !notif.isRead ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                                          }`}>
                                              <FiBell size={20} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <div className="flex justify-between items-start gap-4 mb-2">
                                                  <h4 className={`text-base truncate md:whitespace-normal ${!notif.isRead ? 'font-bold text-gray-900' : 'font-bold text-gray-700'}`}>
                                                      {notif.title}
                                                  </h4>
                                                  <span className="text-xs font-bold text-gray-400 flex-shrink-0 bg-gray-50 px-2 py-1 rounded-md">
                                                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                  </span>
                                              </div>
                                              <p className="text-sm text-gray-500 leading-relaxed font-medium">{notif.message}</p>
                                          </div>
                                     </Link>
                                  </div>
                              ))}
                          </div>
                       ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                  <FiBell size={48} className="opacity-20" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">You&apos;re all caught up!</h3>
                              <p className="text-sm">There are no new notifications to show right now.</p>
                          </div>
                       )}
                    </div>
                 </motion.div>
              </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
