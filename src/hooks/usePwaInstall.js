"use client";

import { useEffect, useState } from "react";

// Use a global variable to store the prompt in case the event fires before the hook mounts
let deferredPromptGlobal = null;

export default function usePwaInstall() {
  const [isInstallable, setIsInstallable] = useState(!!deferredPromptGlobal);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPromptGlobal = e;
      setIsInstallable(true);
      console.log("PWA: captured beforeinstallprompt event");
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If it's already captured, we're good
    if (deferredPromptGlobal) {
      setIsInstallable(true);
    }

    // Check display mode
    const checkDisplayMode = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstallable(false);
      }
    };
    
    checkDisplayMode();

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async () => {
    if (!deferredPromptGlobal) {
        console.warn("PWA: No install prompt available");
        return;
    }

    deferredPromptGlobal.prompt();
    const { outcome } = await deferredPromptGlobal.userChoice;
    
    if (outcome === "accepted") {
      console.log("PWA: user accepted install");
    } else {
      console.log("PWA: user dismissed install");
    }

    deferredPromptGlobal = null;
    setIsInstallable(false);
  };

  return { isInstallable, install };
}
