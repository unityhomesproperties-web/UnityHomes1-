import React from 'react';
import Navigation from './Navigation';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import MissionSection from './MissionSection';
import ServicesSection from './ServicesSection';
import CtaSection from './CtaSection';
import WaitlistRegistration from './WaitlistRegistration';
import AreaIntelligencePreview from './AreaIntelligencePreview';

export default function WaitlistPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <main className="flex-grow flex flex-col">
        <HeroSection />
        <AboutSection />
        <MissionSection />
        <ServicesSection />
        <CtaSection />
        <WaitlistRegistration />
        <AreaIntelligencePreview />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-8 mt-auto relative z-10">
        <div className="max-w-[1320px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="h-8 relative flex items-center shrink-0">
              <img 
                src="/logo.svg" 
                alt="Unity Homes" 
                className="h-full w-auto object-contain dark:brightness-200 dark:grayscale dark:invert" 
              />
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] font-medium">
              &copy; {new Date().getFullYear()} Unity Homes and Properties Ltd. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-[var(--color-text-secondary)] font-medium">
            <span>RC-1849120</span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-border)]"></span>
            <span>Lagos, Nigeria</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
