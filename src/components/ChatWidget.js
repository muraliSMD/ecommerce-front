"use client";

import { useState, useRef, useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { AnimatePresence, motion } from "framer-motion";
import { FiMessageSquare, FiX, FiSend, FiUser, FiHelpCircle } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";

export default function ChatWidget() {
  const { settings, isLoading } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi there! 👋 How can I help you today?" }
  ]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (isLoading || !settings?.marketing?.showChatbot) return null;

  const suggestions = [
    { label: "Where is my order?", action: "order_status" },
    { label: "Shipping Policy", action: "shipping" },
    { label: "Return Policy", action: "returns" },
    { label: "Contact Support", action: "contact" },
  ];

  const handleSuggestionClick = (suggestion) => {
    // Add user message
    setMessages(prev => [...prev, { type: "user", text: suggestion.label }]);

    // Simulate bot thinking
    setTimeout(() => {
        let botResponse = "";
        
        switch(suggestion.action) {
            case "order_status":
                botResponse = "You can track your order status in your Account Dashboard under 'My Orders'. Would you like me to take you there?";
                break;
            case "shipping":
                botResponse = `We offer flat rate shipping of ${settings.currency === 'USD' ? '$' : ''}${settings.shippingCharge}. Orders are typically processed within 1-2 business days.`;
                break;
            case "returns":
                botResponse = "We accept returns within 30 days of purchase for unworn items. Please contact support@grabszy.com to initiate a return.";
                break;
            case "contact":
                botResponse = `You can reach our support team at ${settings.supportEmail}. We usually reply within 24 hours.`;
                break;
            default:
                botResponse = "I'm not sure about that. Please contact support.";
        }

        setMessages(prev => [...prev, { type: "bot", text: botResponse, actionLink: suggestion.action === "order_status" ? "/account/orders" : null }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-4">
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="bg-white rounded-[2rem] shadow-2xl shadow-black/20 w-80 sm:w-96 overflow-hidden border border-gray-100"
            >
                {/* Header */}
                <div className="bg-primary p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <FiHelpCircle className="text-white text-xl" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">Support Assistant</p>
                            <p className="text-white/60 text-[10px] flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                    >
                        <FiX />
                    </button>
                </div>

                {/* Messages */}
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                msg.type === 'user' 
                                ? 'bg-black text-white rounded-br-none' 
                                : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-none'
                            }`}>
                                <p>{msg.text}</p>
                                {msg.actionLink && (
                                    <Link 
                                        href={msg.actionLink}
                                        className="block mt-2 text-primary font-bold hover:underline"
                                    >
                                        Go to Orders &rarr;
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions / Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1.5 bg-gray-50 hover:bg-primary/10 hover:text-primary text-gray-600 rounded-lg text-xs font-bold transition-colors border border-gray-100"
                            >
                                {suggestion.label}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-black text-white rounded-full shadow-xl shadow-primary/20 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 relative group"
      >
        <AnimatePresence mode="wait">
            {isOpen ? (
                <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                >
                    <FiX size={24} />
                </motion.div>
            ) : (
                <motion.div
                    key="chat"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="relative"
                >
                    <FiMessageSquare size={24} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></span>
                </motion.div>
            )}
        </AnimatePresence>
      </button>

    </div>
  );
}
