import re

content = """import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Compass
} from 'lucide-react';
import { Button } from '../design-system/components';
import WaitlistRegistration from './WaitlistRegistration';

interface WaitlistLandingPageProps {
  isAdminRoute?: boolean;
  navigate?: (path: string) => void;
}

export default function WaitlistLandingPage({ navigate }: WaitlistLandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    const el = document.getElementById('waitlist-container');
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans">
      
      {/* HEADER */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out ${isScrolled ? 'bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)] py-4' : 'bg-transparent py-[20px] md:py-[32px]'}`}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-[32px] flex items-center justify-between">
          <div 
            onClick={() => navigate ? navigate('/') : window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-[var(--color-forest)] rounded-xl flex items-center justify-center shrink-0">
               <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[var(--color-forest)] text-xl tracking-tight">Unity Homes</span>
          </div>
          <div className="flex items-center space-x-8">
            <Button onClick={scrollToForm} variant="outline">
              Join Waitlist
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="pt-[140px] md:pt-[180px] pb-[80px] px-6 md:px-[32px] max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-[64px] lg:gap-[80px]">
            {/* Left Side: Storytelling */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex-1 lg:max-w-[55%] w-full"
            >
              <div className="inline-flex items-center justify-center px-[16px] h-[34px] rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-forest)] text-[12px] font-[600] uppercase tracking-[0.08em] mb-[24px]">
                Early Access
              </div>
              
              <h1 className="text-[42px] md:text-[56px] lg:text-[72px] font-[800] tracking-tight text-[var(--color-text-primary)] leading-[1.05] mb-[24px]">
                Verified. <br className="hidden md:block" /> Secure. <br className="hidden md:block" /> <span className="text-[var(--color-gold)]">Transparent.</span>
              </h1>
              
              <p className="text-[18px] text-[var(--color-text-secondary)] leading-[1.7] mb-[40px] font-[400] max-w-[480px]">
                We are building a singular operating system for Nigerian property. Verified assets, immutable ledgers, and a curated network of trusted professionals.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-[16px] mb-[48px]">
                <Button size="lg" onClick={scrollToForm} rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Join Waitlist
                </Button>
                <Button variant="ghost" size="lg" onClick={scrollToForm}>
                  Learn Our Mission
                </Button>
              </div>

              <div className="flex items-start gap-[12px]">
                <div className="w-[24px] h-[24px] rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center shrink-0 mt-[2px]">
                  <Check className="w-[12px] h-[12px] text-[var(--color-forest)]" strokeWidth={3} />
                </div>
                <p className="text-[15px] text-[var(--color-text-secondary)] leading-[1.6] font-[500] max-w-[380px]">
                  Built for landlords, property managers, shortlet operators and verified property professionals across Nigeria.
                </p>
              </div>
            </motion.div>
            
            {/* Right Side: Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
              className="w-full lg:w-[45%]"
            >
              <div className="aspect-[4/5] rounded-[var(--radius-image)] overflow-hidden bg-[var(--color-surface)] shadow-[var(--shadow-card)] relative border border-[var(--color-border)]">
                <img 
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=90&w=1200" 
                  alt="Modern luxury home" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-forest)]/40 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* REGISTRATION FORM SECTION */}
        <WaitlistRegistration />

        {/* WHY UNITY HOMES */}
        <section className="py-[120px] px-6 md:px-[32px] max-w-[1200px] mx-auto border-t border-[var(--color-border)]">
          <div className="flex flex-col lg:flex-row gap-[80px]">
            <div className="lg:w-1/3">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="lg:sticky lg:top-[120px]"
              >
                <h2 className="text-[32px] md:text-[40px] font-[700] tracking-tight text-[var(--color-text-primary)] mb-[24px]">
                  Why Unity Homes
                </h2>
                <p className="text-[18px] text-[var(--color-text-secondary)] leading-[1.7] font-[400]">
                  Real estate shouldn't feel like a gamble. We replace ambiguity with data, and fraud with absolute verification.
                </p>
              </motion.div>
            </div>
            
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              {[
                { title: 'Verified Assets', desc: 'Every property on Unity Homes goes through strict title and ownership verification.', icon: ShieldCheck },
                { title: 'Trusted Network', desc: 'Connect exclusively with licensed lawyers, engineers, and real estate professionals.', icon: Users },
                { title: 'Full Transparency', desc: 'Clear history of transactions, previous tenants, and structural integrity reports.', icon: Compass },
                { title: 'Property Management', desc: 'Digital ledgers, automated rent collection, and seamless maintenance tracking.', icon: Building2 }
              ].map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.35, delay: idx * 0.1, ease: 'easeOut' }}
                  className="p-[32px] rounded-[var(--radius-card)] bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-sm hover:shadow-[var(--shadow-card)] transition-all duration-300"
                >
                  <div className="w-[48px] h-[48px] bg-[var(--color-bg)] rounded-[12px] flex items-center justify-center mb-[24px]">
                    <feature.icon className="w-[24px] h-[24px] text-[var(--color-forest)]" />
                  </div>
                  <h3 className="text-[20px] font-[700] text-[var(--color-text-primary)] mb-[12px]">{feature.title}</h3>
                  <p className="text-[15px] text-[var(--color-text-secondary)] leading-[1.6]">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[var(--color-surface-card)] border-t border-[var(--color-border)] py-[60px] md:py-[80px]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-[32px] flex flex-col md:flex-row justify-between items-center gap-[32px]">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-[var(--color-forest)] rounded-lg flex items-center justify-center shrink-0">
               <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--color-forest)] text-lg tracking-tight">Unity Homes</span>
          </div>
          <p className="text-[14px] text-[var(--color-text-secondary)] font-[500]">
            © {new Date().getFullYear()} Unity Homes. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
"""

with open("src/components/WaitlistLandingPage.tsx", "w") as f:
    f.write(content)

