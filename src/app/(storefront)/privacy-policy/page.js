"use client";

import Image from "next/image";
import { FiShield, FiLock, FiEye, FiFileText } from "react-icons/fi";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  const policyHighlights = [
    {
      icon: FiShield,
      title: "Data Protection",
      description: "We employ robust encryption and security to keep your personal information safe."
    },
    {
      icon: FiLock,
      title: "Secure Payments",
      description: "All payments are processed securely through trusted payment gateways like Razorpay."
    },
    {
      icon: FiEye,
      title: "Transparency",
      description: "We are clear about the data we collect and how we utilize it to improve your experience."
    },
    {
      icon: FiFileText,
      title: "Information Control",
      description: "You have the right to access, update, or request the deletion of your personal data."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-28">
      {/* Header */}
      <section className="bg-gray-900 text-white py-20 relative overflow-hidden text-center">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image 
            src="https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=2070&auto=format&fit=crop"
            alt="Privacy Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto italic">
            Your privacy is critically important to us.
          </p>
        </div>
      </section>

      <section className="py-16 -mt-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 p-8 md:p-16 border border-gray-100">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {policyHighlights.map((item, idx) => (
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
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p>
                  When you visit our store or make a purchase, we collect certain information about your device, your interaction with the site, and information necessary to process your purchases. This may include your name, billing address, shipping address, payment information, email address, and phone number.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p>
                  We utilize the information we gather to fulfill any orders placed through the website (including processing your payment, arranging shipping, and addressing your invoices and order confirmations). Furthermore, we use this order information to:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>Communicate with you regarding our products or your orders.</li>
                  <li>Screen orders for potential risk or fraud.</li>
                  <li>Provide recommendations or advertising related to our products, in accordance with the preferences you have shared.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">3. Data Protection and Security</h2>
                <p>
                  We understand the importance of keeping your data secure. We implement a variety of security measures to maintain the safety of your personal information when you place an order. Transactions are processed through reliable, secure payment gateways (like Razorpay) and your financial data is never stored on our direct servers.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">4. Sharing Your Personal Information</h2>
                <p>
                  We share your Personal Information with trusted third parties exclusively to help us operate our services, as described above. For example, we use third-party logistics to mail your packages, and analytics providers to help us understand how our customers use the website. We may also share your Personal Information to comply with applicable laws and regulations or to respond to a subpoena or lawful request for information.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">5. Cookies and Web Beacons</h2>
                <p>
                  Like any other website, our store uses cookies. These cookies are used to store information including visitors&apos; preferences, shopping cart sessions, and the pages on the website that the visitor accessed or visited. The information is utilized to optimize the user experience by customizing our web page content based on visitors&apos; browser type and/or other information.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">6. Your Rights</h2>
                <p>
                  If you are a resident of a participating region, you have the right to access the personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information available on our website.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
