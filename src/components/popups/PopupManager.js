"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import OfferPopup from "./OfferPopup";
import SignupPopup from "./SignupPopup";
import { usePathname } from "next/navigation";

export default function PopupManager() {
  const { settings, isLoading } = useSettingsStore();
  const [showOffer, setShowOffer] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Don't show on admin pages or if settings loading
    if (isLoading || pathname.startsWith("/admin") || pathname.startsWith("/account")) return;

    const checkPopups = () => {
        const hasSeenOffer = localStorage.getItem("grabszy_offer_seen");
        const hasSeenSignup = localStorage.getItem("grabszy_signup_seen");

        // Logic for Offer Popup
        if (settings?.marketing?.showOfferPopup && !hasSeenOffer) {
            const timer = setTimeout(() => {
                setShowOffer(true);
            }, 3000); // Show after 3 seconds
            return () => clearTimeout(timer);
        }

        // Logic for Signup Popup (only if offer not shown)
        if (settings?.marketing?.showSignupPopup && !hasSeenSignup && !showOffer) {
             const timer = setTimeout(() => {
                setShowSignup(true);
            }, 10000); // Show after 10 seconds
            return () => clearTimeout(timer);
        }
    };

    const cleanup = checkPopups();
    return cleanup;
  }, [settings, isLoading, pathname, showOffer]);

  const closeOffer = () => {
    setShowOffer(false);
    localStorage.setItem("grabszy_offer_seen", "true");
    
    // Attempt to show signup later in same session? 
    // For now, let's keep it simple and just close.
  };

  const closeSignup = () => {
    setShowSignup(false);
    localStorage.setItem("grabszy_signup_seen", "true");
  };

  if (isLoading) return null;

  return (
    <>
      <OfferPopup isOpen={showOffer} onClose={closeOffer} />
      <SignupPopup isOpen={showSignup} onClose={closeSignup} />
    </>
  );
}
