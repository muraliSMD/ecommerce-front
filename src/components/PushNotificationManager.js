"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { api } from "@/lib/api";

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function PushNotificationManager() {
  const { userInfo } = useUserStore();

  useEffect(() => {
    if (!userInfo) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Register Service Worker
    navigator.serviceWorker.register("/sw.js")
      .then(async (registration) => {
        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();
        
        // If not subscribed, could ask for permission here or wait for user action
        // For now, we'll try to subscribe if permission is default/granted
        // NOTE: Browsers require user gesture for requestPermission, so auto-subscribe might fail or require a button.
        // But if permission is already granted, we can subscribe.
        
        if (!subscription) {
            // Only try if permission is 'granted' or we want to prompt (be careful with prompting)
            // Let's prompt if we have a user logged in, or maybe add a button in UI later.
            // For now, let's just attempt if permission isn't denied.
            // Actually, best UX is a button. But user asked for "implementation", so let's try to ask nicely.
            
            // For this iteration, we'll just log or check permission.
            // To properly implement, we should have a UI toggle. 
            // Instead of auto-prompting, let's expose a method or just run it.
        }
      })
      .catch((err) => console.error("Service Worker registration failed:", err));
      
  }, [userInfo]);

  const subscribeUser = async () => {
     if (!("serviceWorker" in navigator)) return;
     
     try {
         const registration = await navigator.serviceWorker.ready;
         const permission = await Notification.requestPermission();
         
         if (permission === 'granted') {
             const newSubscription = await registration.pushManager.subscribe({
                 userVisibleOnly: true,
                 applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
             });
             
             // Send to backend
             await api.post("/notifications/subscribe", newSubscription);
             console.log("Push Notification Subscribed!");
         }
     } catch (err) {
         console.error("Subscription failed", err);
     }
  };

  // Auto-subscribe on load if logged in and permission granted? 
  // Or just render nothing and use this as a logic container.
  
  // Let's run subscribe logic once if permission is already granted to ensure backend is in sync
  useEffect(() => {
      if(userInfo && Notification.permission === 'granted') {
          subscribeUser();
      }
  }, [userInfo]);

  return null; // This component doesn't render anything visible, just handles logic
}
