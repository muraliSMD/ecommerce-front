"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html>
      <body className="font-sans antialiased text-gray-900 bg-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Critical System Error</h1>
            <p className="text-gray-500 mb-6">The application encountered a critical error and cannot load.</p>
            <pre className="bg-gray-100 p-4 rounded-lg text-left text-xs font-mono overflow-auto mb-6 max-h-48 border border-gray-200">
                {error?.message || "Unknown error occurred"}
            </pre>
            <button 
                onClick={() => reset()}
                className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
                Reload Application
            </button>
        </div>
      </body>
    </html>
  );
}
