"use client";

import { useSettingsStore } from "@/store/settingsStore";
import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

export default function AppDownloadSection() {
  const settings = useSettingsStore((state) => state.settings);
  const { android, ios } = settings.appLinks || {};

  if (!android && !ios) return null;

  return (
    <section className="py-24 bg-bg-surface overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 rounded-l-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-secondary/5 rounded-r-full blur-3xl -z-10" />

      <div className="container mx-auto px-6 md:px-12">
        <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-black/5 border border-border-main flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="flex-1 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-text-main mb-6 leading-tight">
                Shop on the go with our <span className="text-primary italic">Mobile App</span>
              </h2>
              <p className="text-text-muted text-lg md:text-xl mb-10 leading-relaxed">
                Experience the best of {settings.siteName || "GRABSZY"} directly from your phone. Get exclusive offers, track orders in real-time, and enjoy a seamless shopping experience.
              </p>

              <div className="flex flex-wrap gap-6 items-center">
                {android && (
                  <a 
                    href={android} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-105 active:scale-95"
                  >
                    <div className="bg-black text-white px-8 py-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-black/20">
                      <div className="w-8 h-8 relative">
                         <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                            <path d="M17.523 15.3414C18.1509 15.3414 18.6601 15.8506 18.6601 16.4785C18.6601 17.1064 18.1509 17.6156 17.523 17.6156C16.8951 17.6156 16.3859 17.1064 16.3859 16.4785C16.3859 15.8506 16.8951 15.3414 17.523 15.3414ZM6.47701 15.3414C7.10492 15.3414 7.61412 15.8506 7.61412 16.4785C7.61412 17.1064 7.10492 17.6156 6.47701 17.6156C5.8491 17.6156 5.3399 17.1064 5.3399 16.4785C5.3399 15.8506 5.8491 15.3414 6.47701 15.3414ZM17.915 11.2335L19.7423 8.06834C19.9515 7.70584 19.8273 7.24164 19.4648 7.03244C19.1023 6.82324 18.6381 6.94744 18.4289 7.30994L16.5826 10.5113C15.223 9.91924 13.6841 9.58554 12.0626 9.58554C10.43 9.58554 8.88091 9.92384 7.51471 10.5222L5.67111 7.30994C5.46191 6.94744 4.99771 6.82324 4.63521 7.03244C4.27271 7.24164 4.14851 7.70584 4.35771 8.06834L6.18501 11.2335C3.25031 12.8398 1.25 15.9328 1.25 19.4893H22.875C22.875 15.9328 20.8447 12.8398 17.915 11.2335ZM12.0626 5.16104C14.0044 5.16104 15.58 3.58544 15.58 1.64364H8.54521C8.54521 3.58544 10.1208 5.16104 12.0626 5.16104Z" />
                         </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 leading-tight">Get it on</p>
                        <p className="text-lg font-bold leading-tight">Google Play</p>
                      </div>
                    </div>
                  </a>
                )}

                {ios && (
                  <a 
                    href={ios} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="transition-transform hover:scale-105 active:scale-95"
                  >
                    <div className="bg-black text-white px-8 py-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-black/20">
                      <div className="w-8 h-8 relative">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                            <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 leading-tight">Download on the</p>
                        <p className="text-lg font-bold leading-tight">App Store</p>
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10 max-w-[300px] mx-auto group">
               <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-secondary rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
               <div className="relative bg-black rounded-[2.5rem] p-3 shadow-2xl overflow-hidden border-4 border-gray-900">
                  <div className="bg-bg-main h-[500px] rounded-[2rem] overflow-hidden flex items-center justify-center relative">
                    {/* Mock App Content */}
                    <div className="w-full h-full bg-primary flex flex-col items-center justify-center p-8 text-white relative">
                        <h3 className="text-4xl font-display font-bold mb-4">{settings.siteName || "GRABSZY"}</h3>
                        <p className="text-center opacity-80 mb-8">Premium Fashion at your fingertips</p>
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                             <div className="w-10 h-10 bg-primary rounded-xl" />
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
