import React from 'react';
import { ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutSection() {
  const trustCards = [
    {
      icon: ShieldCheck,
      title: 'Transparency',
      description: 'Helping users make informed property decisions through clear and reliable information.'
    },
    {
      icon: FileCheck,
      title: 'Verification',
      description: 'Building confidence with verified listings and trusted professionals.'
    },
    {
      icon: CheckCircle2,
      title: 'Trust',
      description: 'Creating a dependable ecosystem for buyers, renters, landlords and professionals.'
    }
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="max-w-[1320px] mx-auto px-6">
        
        {/* Header and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-brand-bg)]/10 text-[var(--theme-brand-bg)] text-xs font-semibold tracking-wide uppercase mb-6 border border-[var(--theme-brand-bg)]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-brand-bg)] animate-pulse"></span>
              Who We Are
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--color-text-primary)] mb-8 tracking-tight">
              About Unity Homes
            </h2>
            
            <div className="space-y-6 text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed">
              <p>
                Unity Homes and Properties Ltd is a Nigerian real estate company focused on making property transactions safer, more transparent, and easier to understand.
              </p>
              <p>
                We are building a modern property platform that helps people discover verified listings, connect with trusted professionals, and make informed real estate decisions with confidence.
              </p>
              <p>
                The platform is designed for buyers, renters, landlords, property managers, and real estate professionals who want a more reliable and organised property experience.
              </p>
            </div>
          </motion.div>
          
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="aspect-square md:aspect-[4/3] rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl shadow-black/5 overflow-hidden flex items-center justify-center relative p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-brand-bg)]/5 to-transparent"></div>
              
              {/* Product Illustration Mockup */}
              <div className="w-full h-full relative flex flex-col items-center justify-center">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAxMCBMMjAgMTAiIHN0cm9rZT0icmdiYSgwLCAwLCAwLCAwLjA1KSIvPgo8cGF0aCBkPSJNMTAgMCBMMTAgMjAiIHN0cm9rZT0icmdiYSgwLCAwLCAwLCAwLjA1KSIvPgo8L3N2Zz4=')]"></div>
                
                {/* Layered UI Elements */}
                <div className="relative z-10 w-full max-w-sm flex flex-col gap-4">
                  {/* Map Mockup */}
                  <div className="w-full h-32 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-md overflow-hidden relative translate-x-4 -translate-y-4">
                    <div className="absolute inset-0 opacity-20 bg-[var(--theme-brand-bg)]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--theme-brand-bg)]/20 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[var(--theme-brand-bg)] shadow-[0_0_15px_rgba(var(--theme-brand-bg),0.8)]"></div>
                    </div>
                  </div>
                  
                  {/* Verified Property Card Mockup */}
                  <div className="w-[90%] h-24 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg relative p-4 flex gap-4 -translate-y-8 -translate-x-4 z-20">
                    <div className="w-16 h-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]"></div>
                    <div className="flex-1 flex flex-col justify-center gap-2">
                      <div className="w-3/4 h-2 rounded-full bg-[var(--color-text-secondary)]/20"></div>
                      <div className="w-1/2 h-2 rounded-full bg-[var(--color-text-secondary)]/20"></div>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-[var(--theme-brand-bg)]" />
                        <div className="w-12 h-1.5 rounded-full bg-[var(--theme-brand-bg)]/30"></div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Preview Mockup */}
                  <div className="w-full h-20 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-md relative p-4 flex items-center gap-4 translate-x-8 -translate-y-6 z-30">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center">
                      <FileCheck className="w-4 h-4 text-[var(--theme-brand-bg)]" />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="w-full h-1.5 rounded-full bg-[var(--color-text-secondary)]/20"></div>
                      <div className="w-2/3 h-1.5 rounded-full bg-[var(--color-text-secondary)]/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {trustCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center mb-6 group-hover:bg-[var(--theme-brand-bg)]/5 group-hover:border-[var(--theme-brand-bg)]/20 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-[var(--color-text-primary)] group-hover:text-[var(--theme-brand-bg)] transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                  {card.title}
                </h3>
                <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
