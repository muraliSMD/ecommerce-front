"use client";

import Image from "next/image";
import { FiCheckSquare, FiAlertCircle, FiHelpCircle, FiBookOpen } from "react-icons/fi";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  const termsHighlights = [
    {
      icon: FiBookOpen,
      title: "Clear Guidelines",
      description: "Transparent rules guiding your interactions with our e-commerce platform."
    },
    {
      icon: FiCheckSquare,
      title: "Fair Usage",
      description: "Policies formulated to protect all buyers and ensure a smooth shopping experience."
    },
    {
      icon: FiAlertCircle,
      title: "Dispute Resolution",
      description: "Straightforward channels to resolve any conflicts relating to your purchases."
    },
    {
      icon: FiHelpCircle,
      title: "Dedicated Support",
      description: "Our team is available to assist you with any clarifications regarding our terms."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-28">
      {/* Header */}
      <section className="bg-gray-900 text-white py-20 relative overflow-hidden text-center">
        <div className="absolute inset-0 z-0 opacity-10">
          <Image 
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop"
            alt="Terms of Service Background"
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto italic">
            Please read these terms carefully before accessing our website.
          </p>
        </div>
      </section>

      <section className="py-16 -mt-10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 p-8 md:p-16 border border-gray-100">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {termsHighlights.map((item, idx) => (
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
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p>
                  By visiting our site and/or purchasing something from us, you engage in our &quot;Service&quot; and agree to be bound by the following terms and conditions (&quot;Terms of Service&quot;, &quot;Terms&quot;). These terms apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">2. General Conditions</h2>
                <p>
                  We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve transmissions over various networks. Credit card information is always encrypted during transfer over networks.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">3. Products and Services</h2>
                <p>
                  Certain products or services may be available exclusively online through the website. These products may have limited quantities and are subject to return or exchange exclusively according to our Return Policy. We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor&apos;s display of any color will be accurate.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">4. Pricing and Modifications</h2>
                <p>
                  Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time. We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">5. Accuracy of Billing and Account Information</h2>
                <p>
                  We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the email and/or billing address/phone number provided at the time the order was made. You agree to provide current, complete and accurate purchase and account information for all purchases made at our store.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">6. Third-Party Links</h2>
                <p>
                  Certain content, products, and services available via our Service may include materials from third-parties. Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy, and we do not warrant and will not have any liability or responsibility for any third-party materials or websites.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">7. Governing Law</h2>
                <p>
                  These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
