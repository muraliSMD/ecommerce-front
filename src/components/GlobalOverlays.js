"use client";

import dynamic from 'next/dynamic';

// Dynamically import non-critical overlays to reduce initial JS payload
const AuthModal = dynamic(() => import("@/components/AuthModal"), { ssr: false });
const PopupManager = dynamic(() => import("@/components/popups/PopupManager"), { ssr: false });
const ChatWidget = dynamic(() => import("./ChatWidget"), { ssr: false }); // Relative path for more reliable chunk loading
const PushNotificationManager = dynamic(() => import("@/components/PushNotificationManager"), { ssr: false });

export default function GlobalOverlays() {
  return (
    <>
      <AuthModal />
      <PopupManager />
      <ChatWidget />
      <PushNotificationManager />
    </>
  );
}
