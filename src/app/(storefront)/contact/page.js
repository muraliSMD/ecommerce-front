"use client";

import { useState } from "react";
import Image from "next/image";
import { FiMapPin, FiPhone, FiMail, FiSend } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-28">
      {/* Header */}
      <section className="bg-gray-900 text-white py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
            <Image 
                src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2070&auto=format&fit=crop"
                alt="Contact Background"
                fill
                className="object-cover"
            />
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Contact Us</h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Have questions? We&apos;d love to hear from you. Reach out to our team for any inquiries or support.
            </p>
        </div>
      </section>

      <section className="py-16 md:py-24 -mt-10">
        <div className="container mx-auto px-4 md:px-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 overflow-hidden border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    
                    {/* Contact Info */}
                    <div className="bg-primary p-10 md:p-16 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        
                        <div className="relative z-10">
                            <h2 className="text-3xl font-display font-bold mb-8">Get In Touch</h2>
                            <p className="text-white/80 mb-12 leading-relaxed">
                                Whether you&apos;re interested in our wholesale rates, have a question about an order, or just want to say hello, we&apos;re here to help.
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                                        <FiMapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Our Location</h4>
                                        <p className="text-white/80">123 Commerce St, Wholesale District<br />New York, NY 10001, USA</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                                        <FiMail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Email Us</h4>
                                        <p className="text-white/80">support@grabszy.com</p>
                                        <p className="text-white/80">wholesale@grabszy.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
                                        <FiPhone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Call Us</h4>
                                        <p className="text-white/80">+1 (555) 123-4567</p>
                                        <p className="text-white/80">Mon - Fri, 9am - 6pm EST</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="p-10 md:p-16">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-xl outline-none transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Email</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-xl outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Subject</label>
                                <input 
                                    type="text" 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-xl outline-none transition-all"
                                    placeholder="Order Inquiry / General Question"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Message</label>
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full bg-gray-50 border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-xl outline-none transition-all resize-none"
                                    placeholder="How can we help you today?"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-primary transition-all shadow-lg shadow-gray-900/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        Send Message <FiSend />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
