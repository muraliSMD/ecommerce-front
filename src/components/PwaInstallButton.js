"use client";

import { useSettingsStore } from "@/store/settingsStore";
import usePwaInstall from "@/hooks/usePwaInstall";
import { FiDownload } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function PwaInstallButton() {
  const { isInstallable, install } = usePwaInstall();
  const settings = useSettingsStore((state) => state.settings);
  const pwaEnabled = settings.appLinks?.pwaEnabled ?? true;

  console.log("PwaInstallButton visibility check:", { isInstallable, pwaEnabled, appLinks: settings.appLinks });

  if (!isInstallable || !pwaEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 20 }}
        className="fixed bottom-24 left-6 z-50 flex flex-col items-center"
      >
        <button
          onClick={install}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl shadow-primary/40 transition-all hover:scale-110 active:scale-95"
          aria-label="Install App"
        >
          <FiDownload size={24} className="animate-bounce" />
          
          {/* Tooltip */}
          <span className="absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-black px-4 py-2 text-xs font-bold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
            Install Website
          </span>

          {/* Ripples */}
          <span className="absolute inset-0 block animate-ping rounded-full bg-primary/30" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
