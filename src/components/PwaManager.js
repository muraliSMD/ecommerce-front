"use client";

import { useEffect } from "react";

export default function PwaManager() {
  useEffect(() => {
    if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
          })
          .catch((err) => {
            console.error("Service Worker registration failed:", err);
          });
      });
    } else {
        console.log("Service Worker not supported or not on secure context:", {
            sw: "serviceWorker" in navigator,
            protocol: window.location.protocol,
            hostname: window.location.hostname
        });
    }
  }, []);

  return null;
}
