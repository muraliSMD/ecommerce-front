"use client";

import Image from "next/image";
import Link from "next/link";
import { FiCheck, FiAward, FiUsers, FiTrendingUp } from "react-icons/fi";

export default function AboutPage() {
  return (
    <div className="bg-white pt-28 md:pt-28">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 z-0 opacity-20">
            <Image 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                alt="About Hero"
                fill
                className="object-cover"
                priority
            />
        </div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <span className="text-primary font-bold tracking-widest uppercase text-sm md:text-base mb-4 block animate-in fade-in slide-in-from-bottom-4 duration-700">Since 1999</span>
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            We Are <span className="text-primary">GRABSZY</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Bridging the gap between premium quality and wholesale prices for over 25 years.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl skew-y-2 md:skew-y-0 md:-rotate-2 border-4 border-white">
                    <Image 
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop"
                        alt="Our Story"
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                </div>
                <div className="space-y-6">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">
                        25 Years of <span className="text-primary">Excellence</span>
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        What started as a small wholesale operation two decades ago has grown into a trusted name in the industry. For over 25 years, we have been the silent force behind many successful retailers, providing them with top-tier products at unbeatable wholesale rates.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Our journey has always been defined by one core principle: <strong className="text-gray-900">Quality shouldn&apos;t come at a premium.</strong> We believe that everyone deserves access to high-standard goods without the exorbitant markups.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 pt-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 className="text-4xl font-bold text-primary mb-2">25+</h4>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Years Experience</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <h4 className="text-4xl font-bold text-primary mb-2">10k+</h4>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Happy Customers</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Why Shop With Us?</h2>
                <p className="text-gray-500">We bring the wholesale advantage directly to your doorstep.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                        <FiAward size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
                    <p className="text-gray-500 leading-relaxed">
                        We don&apos;t compromise. Every product is hand-picked and rigorously checked to ensure it meets our 25-year standard of excellence.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                        <FiTrendingUp size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Wholesale Rates</h3>
                    <p className="text-gray-500 leading-relaxed">
                        By cutting out the middlemen, we pass the savings directly to you. Get the best market rates without bulk buying requirements.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                        <FiUsers size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Customer First</h3>
                    <p className="text-gray-500 leading-relaxed">
                        Our legacy is built on trust and relationships. Our support team is here to ensure your shopping experience is seamless.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Online Launch */}
      <section className="py-10 md:py-16 overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
            <div className="bg-gray-900 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 opacity-20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">New Chapter</span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">Doing It For You</h2>
                    <p className="text-gray-300 text-lg mb-10 leading-relaxed">
                        After 25 years of dominating the wholesale market, we realized it was time to evolve. We&apos;ve launched our online store to bring our extensive catalog and unmatchable prices directly to the end consumer. No more barriers, just great products.
                    </p>
                    <Link href="/shop" className="inline-flex items-center gap-2 bg-primary hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/25">
                        Explore Our Collection <FiCheck />
                    </Link>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}
