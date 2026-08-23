import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const PILLARS = [
  {
    id: '01',
    title: 'Transparency',
    explanation: 'We are committed to providing open, clear access to property histories, pricing data, and neighborhood insights so that everyone can make informed decisions without hidden surprises.'
  },
  {
    id: '02',
    title: 'Accountability',
    explanation: 'By verifying professionals and standardizing property listings, we build a system where stakeholders are accountable for the quality and accuracy of the information they provide.'
  },
  {
    id: '03',
    title: 'Better Property Decisions',
    explanation: 'Ultimately, our platform exists to empower individuals and businesses with the right tools and connections to confidently buy, rent, and manage properties.'
  }
];

export default function MissionPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col animate-reveal-up bg-white">
      {/* Immersive Hero Banner */}
      <section className="relative text-white pt-40 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--color-brand-deep)]">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
            alt="Business Mission" 
            className="w-full h-full object-cover animate-slow-pan opacity-60"
            aria-hidden="true"
          />
          {/* Solid color overlay, no gradient */}
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="w-16 h-1 bg-[var(--color-brand-fresh)] mx-auto mb-8 rounded-full"></div>
          <h4 className="text-sm font-bold tracking-widest uppercase text-white/80 mb-4">
            OUR MISSION
          </h4>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8 max-w-5xl mx-auto">
            To make real estate in Nigeria more transparent, trustworthy and easier to navigate.
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
            We believe buying, renting and managing property should not require people to depend on guesswork, hidden information or unnecessary stress.
          </p>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-24">
        <div className="border-t border-[var(--color-border)] mb-32 max-w-4xl mx-auto">
          {PILLARS.map((pillar, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div key={idx} className="border-b border-[var(--color-border)]">
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full text-left py-8 focus:outline-none group flex items-start justify-between gap-6"
                >
                  <div className="flex items-center gap-6 md:gap-12 flex-1">
                    <span className={`text-lg font-bold transition-colors duration-200 ${isExpanded ? 'text-[var(--color-brand-medium)]' : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-medium)]'}`}>
                      {pillar.id}
                    </span>
                    <h3 className={`text-2xl md:text-3xl font-bold transition-colors duration-200 ${isExpanded ? 'text-[var(--color-brand-deep)]' : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-medium)]'}`}>
                      {pillar.title}
                    </h3>
                  </div>
                  
                  <div className="shrink-0 mt-1">
                    <div className={`w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-[var(--color-brand-deep)] text-white border-[var(--color-brand-deep)] rotate-180' : 'bg-transparent text-[var(--color-brand-deep)] group-hover:border-[var(--color-brand-medium)]'}`}>
                      {isExpanded ? (
                        <X className="w-4 h-4" strokeWidth={2} />
                      ) : (
                        <Plus className="w-4 h-4" strokeWidth={2} />
                      )}
                    </div>
                  </div>
                </button>
                
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100 pb-10' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="flex gap-6 md:gap-12">
                    {/* Spacer for alignment with title */}
                    <div className="w-[18px] md:w-[22px] hidden sm:block shrink-0"></div>
                    <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-2xl pr-8">
                      {pillar.explanation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Waitlist CTA */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center rounded-[32px] mb-12 overflow-hidden bg-[var(--color-brand-deep)]">
          {/* Animated Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[32px]">
            <img 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" 
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
