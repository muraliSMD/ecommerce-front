"use client";

import Image from "next/image";
import { FiTruck, FiClock, FiPackage, FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ShippingPolicyPage() {
  const shippingDetails = [
    {
      icon: FiTruck,
      title: "Fast Dispatch",
      description: "Orders are processed and dispatched within 24-48 hours of confirmation."
    },
    {
      icon: FiClock,
      title: "Estimated Delivery",
      description: "3-5 business days for domestic shipping within India."
    },
    {
      icon: FiMapPin,
      title: "Pan-India Shipping",
      description: "We deliver to over 20,000+ pin codes across the country."
    },
    {
      icon: FiPackage,
      title: "Safe Packaging",
      description: "Premium materials to ensure your items arrive in perfect condition."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-28">
      {/* Header */}
      <section className="bg-gray-900 text-white py-20 relative overflow-hidden text-center">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
            alt="Shipping Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Shipping Policy</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto italic">
            Delivering style from Omalur to your doorstep.
          </p>
        </div>
      </section>

      <section className="py-16 -mt-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 p-8 md:p-16 border border-gray-100">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {shippingDetails.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 p-8 rounded-3xl text-center space-y-4 border border-gray-100/50"
                >
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                    <item.icon size={28} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="prose prose-lg max-w-none text-gray-600 space-y-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">1. Order Processing</h2>
                <p>
                  All orders are processed within 1-2 business days. Orders placed on weekends or public holidays will be processed on the next business day. You will receive a notification email or SMS once your order has been dispatched from our facility in <strong>Omalur, Salem</strong>.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">2. Shipping Rates & Delivery Estimates</h2>
                <p>
                  Shipping charges for your order will be calculated and displayed at checkout. Standard shipping is <strong>FREE</strong> for orders above ₹999 across India.
                </p>
                <div className="bg-gray-50 rounded-2xl overflow-hidden mt-4">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-900">Destination</th>
                        <th className="px-6 py-4 font-bold text-gray-900">Estimated Delivery</th>
                        <th className="px-6 py-4 font-bold text-gray-900">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4">Tamil Nadu</td>
                        <td className="px-6 py-4">1-3 Business Days</td>
                        <td className="px-6 py-4">₹50 (Free over ₹999)</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4">Rest of India</td>
                        <td className="px-6 py-4">3-7 Business Days</td>
                        <td className="px-6 py-4">₹80 (Free over ₹999)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">3. Shipment Confirmation & Tracking</h2>
                <p>
                  You will receive a Shipment Confirmation email/SMS once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">4. Customs, Duties & Taxes</h2>
                <p>
                  GRABSZY is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">5. Damages</h2>
                <p>
                  If you received your order damaged, please contact us immediately to file a claim. Please save all packaging materials and damaged goods before filing a claim.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
