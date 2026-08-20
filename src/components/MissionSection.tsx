import React from 'react';
import { Target, Search, Lock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function MissionSection() {
  const missionPillars = [
    {
      icon: Search,
      title: 'Transparency',
      description: 'Making information easier to access and understand.'
    },
    {
      icon: Lock,
      title: 'Accountability',
      description: 'Encouraging responsible and trustworthy property practices.'
    },
    {
      icon: TrendingUp,
      title: 'Better Property Decisions',
      description: 'Helping users make smarter choices through reliable information.'
    }
  ];

  return (
    <section id="mission" className="py-24 md:py-32 bg-[var(--color-surface)] border-b border-[var(--color-border)] relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[var(--theme-brand-bg)]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      <div className="max-w-[1320px] mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-brand-bg)]/10 text-[var(--theme-brand-bg)] text-xs font-semibold tracking-wide uppercase mb-6 border border-[var(--theme-brand-bg)]/20">
              <Target className="w-3.5 h-3.5" />
              Our Purpose
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--color-text-primary)] mb-8 tracking-tight">
              Our Mission
            </h2>
            
            <p className="text-xl md:text-2xl text-[var(--color-text-primary)] font-medium leading-relaxed mb-8">
              To make property transactions in Nigeria more transparent, trustworthy and efficient by combining verified information, trusted professionals and modern technology.
            </p>

            <div className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed space-y-4">
              <p>
                We believe people should never struggle with hidden risks, unnecessary confusion or unreliable property information.
              </p>
              <p>
                Unity Homes exists to simplify every stage of the real estate journey while helping users make confident decisions.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Mission Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {missionPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 rounded-3xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-6 group-hover:bg-[var(--theme-brand-bg)]/5 group-hover:border-[var(--theme-brand-bg)]/20 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-[var(--color-text-primary)] group-hover:text-[var(--theme-brand-bg)] transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
