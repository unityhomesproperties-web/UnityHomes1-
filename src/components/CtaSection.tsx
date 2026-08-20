import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function CtaSection() {
  const scrollToWaitlist = () => {
    const element = document.getElementById('join');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 md:py-32 bg-[var(--color-surface)] border-b border-[var(--color-border)] overflow-hidden relative">
      {/* Abstract geometric background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-full max-w-[1000px] aspect-[2/1] bg-gradient-to-tr from-[var(--theme-brand-bg)]/5 via-transparent to-[var(--theme-brand-bg)]/5 rounded-full blur-[100px] opacity-70"></div>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto rounded-3xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-xl p-8 md:p-16 lg:p-20 text-center relative overflow-hidden"
        >
          {/* Subtle noise overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDE0LCA0NywgMzEsIDAuMDUpIi8+Cjwvc3ZnPg==')] opacity-50 dark:opacity-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-brand-bg)]/10 text-[var(--theme-brand-bg)] text-xs font-semibold tracking-wide uppercase mb-8 border border-[var(--theme-brand-bg)]/20">
              <Sparkles className="w-3.5 h-3.5" />
              Get Early Access
            </div>
            
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--color-text-primary)] mb-6 tracking-tight max-w-2xl mx-auto">
              Ready to experience a better way to handle property?
            </h2>
            
            <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-10 max-w-xl mx-auto">
              Join the Unity Homes Waitlist today and be among the first to access a more transparent real estate experience.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={scrollToWaitlist}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(20,90,50,0.3)] shadow-[var(--theme-brand-bg)]/20"
              >
                Join the Waitlist
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={scrollToAbout}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-primary)] font-semibold border border-[var(--color-border)] hover:bg-[var(--color-bg)] active:scale-[0.98] transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
