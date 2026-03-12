"use client";

import { useState, useRef, useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { AnimatePresence, motion } from "framer-motion";
import { FiMessageSquare, FiX, FiSend, FiUser, FiHelpCircle, FiTrendingUp, FiClock } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

export default function ChatWidget() {
  const { settings, isLoading } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi there! 👋 How can I help you today?" }
  ]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Fetch Trending and Recent Views on Open
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
        try {
            // Fetch Trending (Featured) Products
            const { data } = await api.get("/products?limit=5&isFeatured=true");
            setTrendingProducts(data);

            // Get Recent Views from localStorage
            const views = JSON.parse(localStorage.getItem('recent_views') || '[]');
            setRecentViews(views.slice(0, 3));

            // Get Recent Searches
            const searches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
            setRecentSearches(searches.slice(0, 3));
        } catch (err) {
            console.error("Failed to fetch chatbot data:", err);
        }
    };

    fetchData();
  }, [isOpen]);

  const showChatbot = settings?.marketing?.showChatbot ?? true;
  const showWhatsapp = !!settings?.marketing?.whatsappNumber;

  if (isLoading || (!showChatbot && !showWhatsapp)) return null;

  const suggestions = [
    { label: "Trending Now 🔥", action: "trending" },
    { label: "Recently Viewed 🕒", action: "recent" },
    { label: "Where is my order?", action: "order_status" },
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
            case "trending":
                if (trendingProducts.length > 0) {
                    botResponse = "Here are some of our hottest selling products right now:";
                } else {
                    botResponse = "We're currently updating our trending list. Check back soon!";
                }
                break;
            case "recent":
                if (recentViews.length > 0) {
                    botResponse = "Here are the items you recently looked at:";
                } else {
                    botResponse = "You haven't viewed any products recently. Start exploring our collection!";
                }
                break;
            case "contact":
                botResponse = `You can reach our support team at ${settings.supportEmail}. We usually reply within 24 hours.`;
                break;
            default:
                botResponse = "I'm not sure about that. Please contact support.";
        }

        setMessages(prev => [...prev, { 
            type: "bot", 
            text: botResponse, 
            action: suggestion.action,
            actionLink: suggestion.action === "order_status" ? "/account/orders" : null 
        }]);
    }, 600);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setMessages(prev => [...prev, { type: "user", text: userText }]);
    setInputText("");

    setTimeout(() => {
        let botResponse = "I'm a support bot. For specific product questions, try the 'Trending' or 'Recently Viewed' buttons!";
        
        const lowerText = userText.toLowerCase();
        if (lowerText.includes("trending") || lowerText.includes("best") || lowerText.includes("selling")) {
            handleSuggestionClick({ label: "Trending Now 🔥", action: "trending" });
            return;
        }
        if (lowerText.includes("recent") || lowerText.includes("history")) {
            handleSuggestionClick({ label: "Recently Viewed 🕒", action: "recent" });
            return;
        }
        if (lowerText.includes("order") || lowerText.includes("track")) {
            handleSuggestionClick({ label: "Where is my order?", action: "order_status" });
            return;
        }

        setMessages(prev => [...prev, { type: "bot", text: botResponse }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-4">
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && showChatbot && (
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
                                
                                {msg.action === 'trending' && trendingProducts.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {trendingProducts.map(p => (
                                            <Link 
                                                key={p._id}
                                                href={`/product/${p.slug || p._id}`}
                                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl hover:bg-white transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-gray-100 flex-shrink-0">
                                                    <Image src={p.images?.[0]} alt={p.name} fill className="object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-gray-900 truncate">{p.name}</p>
                                                    <p className="text-[9px] text-primary font-bold">{settings.currency === 'INR' ? '₹' : '$'}{p.price}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {msg.action === 'recent' && recentViews.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {recentViews.map(p => (
                                            <Link 
                                                key={p.id}
                                                href={`/product/${p.slug || p.id}`}
                                                className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl hover:bg-white transition-colors group"
                                            >
                                                <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-gray-100 flex-shrink-0">
                                                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-900 truncate">{p.name}</p>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {msg.actionLink && (
                                    <Link 
                                        href={msg.actionLink}
                                        className="block mt-2 text-primary font-bold hover:underline"
                                    >
                                        {msg.action === 'link' ? `View Results →` : 'Go to Orders →'}
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions / Input */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 mb-4">
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

                    {recentSearches.length > 0 && (
                        <div className="mb-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Based on your searches</p>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((s, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => {
                                            setMessages(prev => [...prev, { type: "user", text: `I'm looking for ${s}` }]);
                                            setTimeout(() => {
                                                setMessages(prev => [...prev, { 
                                                    type: "bot", 
                                                    text: `Check out our ${s} collection!`,
                                                    action: 'link',
                                                    actionLink: `/shop?search=${encodeURIComponent(s)}`
                                                }]);
                                            }, 600);
                                        }}
                                        className="px-2 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-bold border border-primary/10"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Input */}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input 
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-all"
                        />
                        <button 
                            type="submit"
                            className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors"
                        >
                            <FiSend size={18} />
                        </button>
                    </form>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button */}
      {settings?.marketing?.whatsappNumber && (
        <a
          href={`https://wa.me/${settings.marketing.whatsappNumber.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl shadow-green-500/20 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group animate-bounce"
          title="Chat on WhatsApp"
        >
          <FaWhatsapp size={32} />
        </a>
      )}

      {/* Toggle Button */}
      {showChatbot && (
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
      )}

    </div>
  );
}
