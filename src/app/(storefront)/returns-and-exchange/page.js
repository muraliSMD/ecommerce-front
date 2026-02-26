"use client";

import Image from "next/image";
import { FiRotateCcw, FiShield, FiCheckCircle, FiHelpCircle } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ReturnsPage() {
  const features = [
    {
      icon: FiRotateCcw,
      title: "7-Day Return",
      description: "Easy returns within 7 days of delivery for eligible products."
    },
    {
      icon: FiShield,
      title: "Quality Check",
      description: "Rigorous quality inspection to ensure seamless exchanges."
    },
    {
      icon: FiCheckCircle,
      title: "Fast Refunds",
      description: "Refunds processed within 5-7 business days after pickup."
    },
    {
      icon: FiHelpCircle,
      title: "24/7 Support",
      description: "Our team is here to help you throughout the process."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-28">
      {/* Header */}
      <section className="bg-gray-900 text-white py-20 relative overflow-hidden text-center">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image 
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop"
            alt="Returns Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Returns & Exchanges</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Your satisfaction is our priority. Hassle-free returns at GRABSZY.
          </p>
        </div>
      </section>

      <section className="py-16 -mt-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 p-8 md:p-16 border border-gray-100">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {features.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-8 rounded-3xl text-center space-y-4 border border-gray-100/50"
                >
                  <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto">
                    <item.icon size={28} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Conditions for Return</h2>
                <p>
                  In order for the Goods to be eligible for a return, please make sure that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The Goods were purchased in the last 7 days.</li>
                  <li>The Goods are in the original packaging.</li>
                  <li>The Goods are unused and in the same condition that you received them.</li>
                  <li>The original invoice or proof of purchase is available.</li>
                </ul>
              </div>

              <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100 flex gap-6 items-start">
                  <FiShield size={32} className="text-primary shrink-0 mt-1" />
                  <div>
                      <h4 className="font-display font-bold text-gray-900 mb-2">Exchanges (Indian Orders Only)</h4>
                      <p className="text-sm leading-relaxed">
                          We only replace items if they are defective, damaged, or size mismatched. If you need to exchange it for the same item, feel free to contact us via the help desk or account orders section.
                      </p>
                  </div>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Refund Process</h2>
                <p>
                  Once we receive and inspect your returned product, we will send you an email to notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Non-Returnable Items</h2>
                <p>
                  The following Goods cannot be returned:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>The supply of Goods made to your specifications or clearly personalized (e.g., custom sizes).</li>
                  <li>The supply of Goods which are not suitable for return due to health protection or hygiene reasons and were unsealed after delivery (e.g., Innerwear).</li>
                  <li>The supply of Goods which are, after delivery, according to their nature, inseparably mixed with other items.</li>
                </ul>
              </div>

              <div className="pt-8 border-t border-gray-100 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Need help with a return?</h3>
                  <p className="text-gray-500 mb-6 font-medium">Our support team is just a click away.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a href="/contact" className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary transition-all active:scale-95 shadow-lg shadow-gray-900/10">
                          Contact Support
                      </a>
                      <a href="/account/orders" className="bg-white text-gray-900 border border-gray-200 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95">
                          Track Your Order
                      </a>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
