"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-100/50 animate-pulse" />
    );
  }

  const modes = [
    { id: "dark", icon: FiMoon, label: "Dark" },
    { id: "system", icon: FiMonitor, label: "Auto" },
    { id: "light", icon: FiSun, label: "Light" },
  ];

  return (
    <div className="relative flex items-center bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200 dark:border-gray-700 w-[108px] h-9">
      {/* Animated Background Pill */}
      <motion.div
        className="absolute h-7 rounded-lg bg-white dark:bg-gray-700 shadow-sm"
        initial={false}
        animate={{
          x: theme === "dark" ? 0 : theme === "system" ? 34 : 68,
          width: 32,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />

      {/* Buttons */}
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setTheme(mode.id)}
          className={`relative z-10 flex flex-1 items-center justify-center h-full transition-colors duration-200 ${
            theme === mode.id
              ? "text-primary dark:text-primary"
              : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          }`}
          title={mode.label}
          aria-label={`Switch to ${mode.label} mode`}
        >
          <mode.icon size={16} />
        </button>
      ))}
    </div>
  );
}
