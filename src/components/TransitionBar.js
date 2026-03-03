"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TransitionBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 600); // Should match or slightly exceed PageTransition duration

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ width: "0%", opacity: 1 }}
          animate={{ width: "100%", transition: { duration: 0.6, ease: "easeInOut" } }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-[9999] pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
