"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX } from "react-icons/fi";

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger" // danger | warning | info
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <FiX size={24} />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                type === 'danger' ? 'bg-red-50 text-red-500' : 
                type === 'warning' ? 'bg-orange-50 text-orange-500' : 
                'bg-blue-50 text-blue-500'
              }`}>
                <FiAlertTriangle size={40} />
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-bold text-gray-900">{title}</h3>
                <p className="text-gray-500 leading-relaxed px-4">{message}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-8 py-4 rounded-2xl font-bold bg-surface text-gray-600 hover:bg-gray-100 transition-all active:scale-[0.98]"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-8 py-4 rounded-2xl font-bold text-white transition-all active:scale-[0.98] shadow-lg ${
                    type === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
                    type === 'warning' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : 
                    'bg-primary hover:bg-secondary shadow-primary/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
