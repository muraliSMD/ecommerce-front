"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiSave, 
  FiSettings, 
  FiDollarSign, 
  FiGlobe, 
  FiMail,
  FiTruck,
  FiPercent,
  FiSearch,
  FiImage,
  FiTag,
  FiStar,
  FiMessageCircle,
  FiGift
} from "react-icons/fi";
import toast from "react-hot-toast";
import { SectionLoader } from "@/components/Loader";
import { useSettingsStore } from "@/store/settingsStore";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const [activeTab, setActiveTab] = useState("general");
  
  const [settings, setSettings] = useState({
    siteName: "",
    supportEmail: "",
    logo: "",
    favicon: "",
    currency: "USD",
    taxRate: 0,
    shippingCharge: 0,
    maintenanceMode: false,
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogImage: ""
    },
    marketing: {
      showOfferPopup: true,
      offerCode: "",
      offerDiscount: "",
      showSignupPopup: true,
      showChatbot: true
    }
  });

  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await api.get("/settings");
      return data;
    },
  });

  useEffect(() => {
    if (fetchedSettings) {
      setSettings({
        siteName: fetchedSettings.siteName || "",
        supportEmail: fetchedSettings.supportEmail || "",
        logo: fetchedSettings.logo || "",
        favicon: fetchedSettings.favicon || "",
        currency: fetchedSettings.currency || "USD",
        taxRate: fetchedSettings.taxRate || 0,
        shippingCharge: fetchedSettings.shippingCharge || 0,
        maintenanceMode: fetchedSettings.maintenanceMode || false,
        seo: {
            metaTitle: fetchedSettings.seo?.metaTitle || "",
            metaDescription: fetchedSettings.seo?.metaDescription || "",
            metaKeywords: fetchedSettings.seo?.metaKeywords || "",
            ogImage: fetchedSettings.seo?.ogImage || ""
        },
        marketing: {
            showOfferPopup: fetchedSettings.marketing?.showOfferPopup ?? true,
            offerCode: fetchedSettings.marketing?.offerCode || "",
            offerDiscount: fetchedSettings.marketing?.offerDiscount || "",
            showSignupPopup: fetchedSettings.marketing?.showSignupPopup ?? true,
            showChatbot: fetchedSettings.marketing?.showChatbot ?? true
        }
      });
    }
  }, [fetchedSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      const { data: response } = await api.put("/settings", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-settings"]);
      fetchSettings();
      toast.success("Settings updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("seo.")) {
        const field = name.split(".")[1];
        setSettings({
            ...settings,
            seo: { ...settings.seo, [field]: value }
        });
    } else if (name.startsWith("marketing.")) {
        const field = name.split(".")[1];
        setSettings({
            ...settings,
            marketing: { ...settings.marketing, [field]: type === 'checkbox' ? checked : value }
        });
    } else {
        setSettings({ 
          ...settings, 
          [name]: type === 'checkbox' ? checked : value 
        });
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    
    const toastId = toast.loading("Uploading...");
    try {
        const { data } = await api.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        setSettings(prev => ({ ...prev, [field]: data.url }));
        toast.success("Image uploaded!", { id: toastId });
    } catch (err) {
        toast.error("Upload failed", { id: toastId });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(settings);
  };

  if (isLoading) return <SectionLoader className="min-h-[60vh]" />;

  const tabs = [
    { id: "general", label: "General", icon: FiSettings },
    { id: "financial", label: "Financials", icon: FiDollarSign },
    { id: "seo", label: "SEO & Metadata", icon: FiSearch },
    { id: "marketing", label: "Marketing", icon: FiStar },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-2">Configure store preferences and financials.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={updateSettingsMutation.isPending}
          className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
        >
          <FiSave /> {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? "bg-gray-900 text-white shadow-lg" 
                    : "bg-surface text-gray-400 hover:bg-white hover:text-gray-900"
                }`}
            >
                <tab.icon /> {tab.label}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* General Settings */}
        {activeTab === "general" && (
            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
                <FiSettings className="text-primary" /> General Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FiGlobe /> Site Name
                </label>
                <input 
                    type="text" 
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleInputChange}
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                />
                </div>
                <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FiMail /> Support Email
                </label>
                <input 
                    type="email" 
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={handleInputChange}
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                />
                </div>
                
                {/* Logo Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FiImage /> Logo
                    </label>
                    <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-surface rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden relative">
                             {settings.logo ? (
                                <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                             ) : (
                                <FiImage className="text-gray-300" size={24} />
                             )}
                        </div>
                        <div className="flex-1">
                             <input 
                                type="text"
                                name="logo"
                                value={settings.logo}
                                onChange={handleInputChange}
                                placeholder="Image URL"
                                className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 py-3 rounded-xl outline-none transition-all mb-2 text-sm"
                            />
                            <label className="inline-block bg-black text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-800 transition-colors">
                                Upload New Logo
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'logo')}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Favicon Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FiImage /> Favicon
                    </label>
                    <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-surface rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden relative">
                             {settings.favicon ? (
                                <img src={settings.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                             ) : (
                                <FiImage className="text-gray-300" size={24} />
                             )}
                        </div>
                        <div className="flex-1">
                             <input 
                                type="text"
                                name="favicon"
                                value={settings.favicon}
                                onChange={handleInputChange}
                                placeholder="Image URL"
                                className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 py-3 rounded-xl outline-none transition-all mb-2 text-sm"
                            />
                            <label className="inline-block bg-black text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-800 transition-colors">
                                Upload New Favicon
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'favicon')}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            </section>
        )}

        {/* Financial Settings */}
        {activeTab === "financial" && (
            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
                <FiDollarSign className="text-primary" /> Financials & Shipping
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FiDollarSign /> Currency
                </label>
                <select 
                    name="currency"
                    value={settings.currency}
                    onChange={handleInputChange}
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all appearance-none"
                >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="AED">AED (DH)</option>
                    <option value="SAR">SAR (SR)</option>
                    <option value="PKR">PKR (Rs)</option>
                </select>
                </div>

                <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FiPercent /> Tax Rate (%)
                </label>
                <input 
                    type="number" 
                    name="taxRate"
                    value={settings.taxRate}
                    onChange={handleInputChange}
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                    step="0.01"
                />
                </div>

                <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FiTruck /> Shipping Charge
                </label>
                <input 
                    type="number" 
                    name="shippingCharge"
                    value={settings.shippingCharge}
                    onChange={handleInputChange}
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                    step="0.01"
                />
                </div>

            </div>
            </section>
        )}

        {/* SEO Settings */}
        {activeTab === "seo" && (
            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
                <FiSearch className="text-primary" /> SEO & Metadata
            </h2>
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FiGlobe /> Global Meta Title
                    </label>
                    <input 
                        type="text" 
                        name="seo.metaTitle"
                        value={settings.seo.metaTitle}
                        onChange={handleInputChange}
                        placeholder="e.g. GRABSZY - Premium Fashion & Lifestyle"
                        className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                    />
                    <p className="text-xs text-gray-400">Appears in the browser tab and search engine results.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FiSettings /> Meta Description
                    </label>
                    <textarea 
                        name="seo.metaDescription"
                        value={settings.seo.metaDescription}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="A brief summary of your store..."
                        className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-400">Recommended length: 150-160 characters.</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FiTag /> Meta Keywords
                    </label>
                    <input 
                        type="text" 
                        name="seo.metaKeywords"
                        value={settings.seo.metaKeywords}
                        onChange={handleInputChange}
                        placeholder="e.g. fashion, electronics, premium, deals"
                        className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                    />
                    <p className="text-xs text-gray-400">Separate keywords with commas.</p>
                </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FiImage /> OG Image URL (Social Share)
                    </label>
                    <input 
                        type="text" 
                        name="seo.ogImage"
                        value={settings.seo.ogImage}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                    />
                </div>
            </div>
            </section>
        )}

        {/* Marketing Settings */}
        {activeTab === "marketing" && (
            <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
                <FiStar className="text-primary" /> Marketing & Engagement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Popups */}
                <div className="space-y-6">
                    <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Popups</h3>
                    
                    <div className="flex items-center justify-between bg-surface p-4 rounded-2xl">
                        <div>
                            <p className="font-bold text-gray-900">Offer Popup</p>
                            <p className="text-xs text-gray-400">Show discount modal to new visitors</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="marketing.showOfferPopup"
                                checked={settings.marketing.showOfferPopup}
                                onChange={handleInputChange}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FiGift /> Offer Code
                        </label>
                        <input 
                            type="text" 
                            name="marketing.offerCode"
                            value={settings.marketing.offerCode}
                            onChange={handleInputChange}
                            placeholder="WELCOME10"
                            disabled={!settings.marketing.showOfferPopup}
                            className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all disabled:opacity-50"
                        />
                    </div>

                     <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FiPercent /> Offer Text
                        </label>
                        <input 
                            type="text" 
                            name="marketing.offerDiscount"
                            value={settings.marketing.offerDiscount}
                            onChange={handleInputChange}
                            placeholder="Get 10% OFF"
                            disabled={!settings.marketing.showOfferPopup}
                            className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all disabled:opacity-50"
                        />
                    </div>

                    <div className="flex items-center justify-between bg-surface p-4 rounded-2xl">
                        <div>
                            <p className="font-bold text-gray-900">Newsletter Signup</p>
                            <p className="text-xs text-gray-400">Show subscription modal</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="marketing.showSignupPopup"
                                checked={settings.marketing.showSignupPopup}
                                onChange={handleInputChange}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>

                {/* Chatbot */}
                <div className="space-y-6">
                    <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Support</h3>
                     <div className="flex items-center justify-between bg-surface p-4 rounded-2xl">
                        <div>
                            <p className="font-bold text-gray-900">AI Chat Widget</p>
                            <p className="text-xs text-gray-400">Enable floating support assistant</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="marketing.showChatbot"
                                checked={settings.marketing.showChatbot}
                                onChange={handleInputChange}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    
                    <div className="bg-blue-50 p-6 rounded-2xl text-blue-800 text-sm leading-relaxed">
                        <FiMessageCircle className="mb-2 text-xl" />
                        The AI Chat Widget provides automated responses for common queries like order tracking and shipping policies. Disabling this will remove the floating chat icon from the storefront.
                    </div>
                </div>
            </div>
            </section>
        )}

      </div>
    </div>
  );
}
