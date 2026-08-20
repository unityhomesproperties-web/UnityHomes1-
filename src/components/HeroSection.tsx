import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, Lock, MapPin, Building2, Users, ArrowRight, BarChart3, CheckCircle2, BadgeCheck, Search } from 'lucide-react';

const CountUp = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export default function HeroSection() {
  const trustChips = [
    { icon: ShieldCheck, label: 'Verified Professionals' },
    { icon: Eye, label: 'Transparent Platform' },
    { icon: Lock, label: 'Secure Data' },
    { icon: MapPin, label: 'Built for Nigeria' },
  ];

  return (
    <section className="relative min-h-[900px] min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDE0LCA0NywgMzEsIDAuMDgpIi8+Cjwvc3ZnPg==')] opacity-40 dark:opacity-20"></div>
        
        {/* Soft Circles */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[var(--color-soft)]/5 blur-[100px]"></div>
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] rounded-full bg-[var(--color-gold)]/5 blur-[100px]"></div>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* LEFT COLUMN: Content (55%) */}
          <div className="w-full lg:w-[55%] flex flex-col items-start pt-10 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/5 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-pulse"></span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-gold)]">Launching Soon</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="font-display font-bold text-5xl md:text-6xl lg:text-[64px] leading-[1.1] tracking-tight text-[var(--color-text-primary)] max-w-[700px] mb-6"
            >
              Nigeria's Most <span className="text-[var(--color-gold)]">Trusted</span> Platform for Modern Real Estate
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-lg md:text-xl text-[var(--color-text-secondary)] font-light leading-relaxed max-w-[600px] mb-10"
            >
              Experience a new era of property management and real estate services. We combine verified properties, expert facility management, transparent operations, and community intelligence into one seamless, technology-driven ecosystem.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16"
            >
              <a
                href="#join"
                className="w-full sm:w-auto h-14 px-8 rounded-full bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] text-base font-semibold flex items-center justify-center gap-2 hover:scale-105 transition-all"
              >
                Join the Waitlist
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#vision"
                className="w-full sm:w-auto h-14 px-8 rounded-full border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--theme-surface)] hover:bg-[var(--color-bg)] text-base font-semibold flex items-center justify-center hover:scale-105 transition-all"
              >
                Explore the Vision
              </a>
            </motion.div>

            {/* Trust Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3"
            >
              {trustChips.map((chip, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--theme-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-medium"
                >
                  <chip.icon className="w-4 h-4 text-[var(--theme-brand-bg)]" />
                  {chip.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Hero Visual (45%) */}
          <div className="w-full lg:w-[45%] relative h-[600px] hidden md:block">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Premium Mobile App Representation */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[580px] bg-[var(--theme-surface)] border-8 border-[var(--color-bg)] rounded-[40px] overflow-hidden shadow-[var(--shadow-modal)] z-20">
                <div className="w-full h-12 flex justify-center items-end pb-2 bg-[var(--color-bg)]">
                  <div className="w-24 h-5 bg-[var(--color-border)] rounded-full"></div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-display font-bold text-lg text-[var(--color-text-primary)]">Lekki Phase 1</h4>
                      <p className="text-xs text-[var(--color-text-secondary)]">24 Verified Properties</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
                      <Search className="w-4 h-4 text-[var(--color-text-primary)]" />
                    </div>
                  </div>
                  
                  <div className="w-full h-[180px] rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] mb-4 flex items-center justify-center overflow-hidden relative">
                     {/* Map Placeholder */}
                     <MapPin className="w-8 h-8 text-[var(--theme-brand-bg)] absolute" />
                     <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAxMCBMMjAgMTAiIHN0cm9rZT0icmdiYSgwLCAwLCAwLCAwLjA1KSIvPgo8cGF0aCBkPSJNMTAgMCBMMTAgMjAiIHN0cm9rZT0icmdiYSgwLCAwLCAwLCAwLjA1KSIvPgo8L3N2Zz4=')]"></div>
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--theme-surface)] flex gap-3 items-center">
                        <div className="w-16 h-16 rounded-lg bg-[var(--color-bg)] shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-4 w-3/4 bg-[var(--color-bg)] rounded mb-2"></div>
                          <div className="h-3 w-1/2 bg-[var(--color-border)] rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Panels */}
              
              {/* Analytics Panel */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-10 -left-12 w-[220px] p-4 bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-card)] z-30 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--theme-brand-bg)]/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-[var(--theme-brand-bg)]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[var(--color-text-secondary)] tracking-wider">Properties Managed</p>
                  <p className="font-display font-bold text-xl text-[var(--color-text-primary)]">
                    <CountUp end={12450} />+
                  </p>
                </div>
              </motion.div>

              {/* Verification Panel */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/3 -right-16 w-[200px] p-4 bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-card)] z-30"
              >
                <div className="flex items-center gap-3 mb-2">
                  <BadgeCheck className="w-5 h-5 text-[var(--color-gold)]" />
                  <span className="text-xs font-semibold text-[var(--color-text-primary)]">Verified Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]"></div>
                  <div>
                    <div className="h-2 w-16 bg-[var(--color-text-secondary)] rounded mb-1 opacity-50"></div>
                    <div className="h-2 w-12 bg-[var(--color-border)] rounded"></div>
                  </div>
                </div>
              </motion.div>

              {/* Members Panel */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-20 -left-6 w-[200px] p-4 bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-card)] z-30 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[var(--color-gold)]" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[var(--color-text-secondary)] tracking-wider">Waitlist</p>
                  <p className="font-display font-bold text-xl text-[var(--color-text-primary)]">
                    <CountUp end={8340} />
                  </p>
                </div>
              </motion.div>
              
              {/* Companies Panel */}
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-10 -right-8 w-[180px] p-4 bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-card)] z-10 flex items-center gap-3"
              >
                <Building2 className="w-5 h-5 text-[var(--theme-brand-bg)]" />
                <div>
                  <p className="font-display font-bold text-lg text-[var(--color-text-primary)]">
                    <CountUp end={450} />+
                  </p>
                  <p className="text-[10px] uppercase font-semibold text-[var(--color-text-secondary)] tracking-wider">Agencies</p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
