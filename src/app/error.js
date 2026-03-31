"use client";

import { useEffect } from "react";
import { toast } from "react-hot-toast";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log technical details silently to the console for developers
    console.error("Global Application Error (Live):", error);
    
    // Show a user-friendly toaster notification
    toast.error("Something went wrong! Please try again.", {
      id: "global-error-toast",
      duration: 5000,
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white/50 backdrop-blur-sm rounded-3xl m-6 border border-gray-100">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Notice</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        We encountered a small technical hurdle. Our team has been notified, and we&apos;re working to fix it.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => reset()}
          className="px-8 py-3 bg-black text-white rounded-full font-bold hover:scale-105 transition-transform shadow-xl shadow-black/10"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-8 py-3 bg-gray-100 text-gray-600 rounded-full font-bold hover:bg-gray-200 transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
