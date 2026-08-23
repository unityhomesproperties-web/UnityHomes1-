import React from 'react';
import { Link } from 'react-router-dom';

const SEQUENCE = [
  { step: 'Discover', status: 'In Development', description: 'Finding authentic property listings.' },
  { step: 'Verify', status: 'In Development', description: 'Checking properties and professional credentials.' },
  { step: 'Connect', status: 'In Development', description: 'Linking with trusted real estate experts.' },
  { step: 'Manage', status: 'In Development', description: 'Streamlined tools for property operations.' },
  { step: 'Understand', status: 'Available Now', description: 'Gaining factual insights about neighborhoods.' },
  { step: 'Improve', status: 'In Development', description: 'Elevating the standard of living and management.' },
];

export default function VisionPage() {
  return (
    <div className="min-h-screen flex flex-col animate-reveal-up bg-white">
      {/* Immersive Hero Banner */}
      <section className="relative text-white pt-40 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--color-brand-deep)]">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80" 
            alt="City Architecture" 
            className="w-full h-full object-cover animate-slow-pan opacity-60"
            aria-hidden="true"
          />
          {/* Solid color overlay, no gradient */}
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="w-16 h-1 bg-[var(--color-brand-fresh)] mx-auto mb-8 rounded-full"></div>
          <h4 className="text-sm font-bold tracking-widest uppercase text-white/80 mb-4">
            OUR VISION
          </h4>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-12">
            Our Vision
          </h1>
          <div className="max-w-4xl mx-auto border-l-4 border-[var(--color-brand-fresh)] pl-6 sm:pl-8 py-2 text-left bg-white/5 p-6 rounded-r-[var(--radius-large)] backdrop-blur-sm">
            <p className="text-2xl sm:text-3xl text-white font-bold leading-tight">
              To build a trusted digital infrastructure for real estate in Nigeria where people can discover properties, access the right professionals, understand important information and manage property with greater confidence.
            </p>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-24">
        <div className="mb-32">
          {/* Mobile Vertical Timeline */}
          <div className="lg:hidden space-y-0">
            {SEQUENCE.map((item, idx) => (
              <div key={idx} className="relative pl-12 pb-12 group cursor-default">
                {idx < SEQUENCE.length - 1 && (
                  <div className="absolute left-[15px] top-[30px] bottom-0 w-px bg-[var(--color-border)] group-hover:bg-[var(--color-brand-medium)] transition-colors duration-300"></div>
                )}
                <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-brand-medium)] flex items-center justify-center text-[10px] font-bold text-[var(--color-brand-deep)] transition-colors duration-300 group-hover:bg-[var(--color-brand-medium)] group-hover:text-white">
                  0{idx + 1}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                  <h3 className="text-xl font-bold text-[var(--color-brand-deep)] uppercase tracking-wide group-hover:text-[var(--color-brand-medium)] transition-colors duration-300">{item.step}</h3>
                  <div className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full self-start ${
                    item.status === 'Available Now' 
                      ? 'bg-[var(--color-surface-soft)] text-[var(--color-brand-medium)]' 
                      : 'bg-stone-100 text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                  }`}>
                    {item.status}
                  </div>
                </div>
                <p className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors duration-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop Horizontal Timeline */}
          <div className="hidden lg:block relative pt-12 pb-24">
            <div className="absolute top-[27px] left-0 right-0 h-px bg-[var(--color-border)]"></div>
            
            <div className="grid grid-cols-6 gap-6">
              {SEQUENCE.map((item, idx) => (
                <div key={idx} className="relative group cursor-default pt-12 hover:-translate-y-1 transition-transform duration-300">
                  <div className="absolute top-0 left-0 right-0 h-px bg-transparent group-hover:bg-[var(--color-brand-medium)] transition-colors duration-300 z-10"></div>
                  <div className="absolute top-[-15px] left-0 w-[30px] h-[30px] rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-brand-medium)] flex items-center justify-center text-[10px] font-bold text-[var(--color-brand-deep)] transition-colors duration-300 group-hover:bg-[var(--color-brand-medium)] group-hover:text-white z-20">
                    0{idx + 1}
                  </div>
                  
                  <h3 className="text-lg font-bold text-[var(--color-brand-deep)] uppercase tracking-wide mb-3 group-hover:text-[var(--color-brand-medium)] transition-colors duration-300">{item.step}</h3>
                  <div className={`inline-flex mb-4 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                    item.status === 'Available Now' 
                      ? 'bg-[var(--color-surface-soft)] text-[var(--color-brand-medium)]' 
                      : 'bg-stone-100 text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                  }`}>
                    {item.status}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors duration-300 pr-4">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Waitlist CTA */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center rounded-[32px] mb-12 overflow-hidden bg-[var(--color-brand-deep)]">
          {/* Animated Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[32px]">
            <img 
              src="https://images.unsplash.com/photo-1600607687920-4e2a09be1587?auto=format&fit=crop&q=80" 
              alt="Real Estate Action" 
              className="w-full h-full object-cover animate-slow-pan opacity-60"
              aria-hidden="true"
            />
            {/* Solid color overlay, no gradient */}
          </div>

          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <div className="w-16 h-1 bg-white/30 mx-auto mb-8 rounded-full"></div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Ready to be part of what's next?
            </h2>
            <div className="pt-8">
              <Link
                to="/waitlist"
                className="inline-flex bg-white text-[var(--color-brand-deep)] px-10 py-5 rounded-[var(--radius-button)] font-bold text-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              >
                Join The Waitlist
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
