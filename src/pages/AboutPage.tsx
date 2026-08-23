import React from 'react';
import { Link } from 'react-router-dom';

const CARDS = [
  {
    id: '01',
    title: 'TRANSPARENCY',
    description: 'Making important property information easier to understand.',
  },
  {
    id: '02',
    title: 'TRUST',
    description: 'Connecting people with properly verified professionals and better processes.',
  },
  {
    id: '03',
    title: 'TECHNOLOGY',
    description: 'Using technology to reduce unnecessary friction and improve real estate experiences.',
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col animate-reveal-up bg-white">
      {/* Immersive Hero Banner */}
      <section className="relative text-white pt-40 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--color-brand-deep)]">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80" 
            alt="Corporate Real Estate" 
            className="w-full h-full object-cover animate-slow-pan opacity-60"
            aria-hidden="true"
          />
          {/* Solid color overlay, no gradient */}
          <div className="absolute inset-0 bg-[#0E2F1F]/80"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="w-16 h-1 bg-[var(--color-brand-fresh)] mx-auto mb-8 rounded-full"></div>
          <h4 className="text-sm font-bold tracking-widest uppercase text-white/80 mb-4">
            ABOUT UNITY HOMES
          </h4>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-8 max-w-4xl mx-auto">
            Safer, clearer, and more transparent property transactions.
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
            Unity Homes and Properties Ltd is a Nigerian real estate company focused on making property transactions safer, clearer and more transparent. The platform is being built to help people discover property opportunities, connect with trusted professionals, verify important information and manage real estate more efficiently.
          </p>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="pt-24 mb-32">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {CARDS.map((card, idx) => (
              <div key={idx} className="group cursor-default">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-bold text-[var(--color-brand-medium)] transition-colors duration-300">
                    {card.id}
                  </span>
                  <div className="h-px bg-[var(--color-border)] flex-1 group-hover:bg-[var(--color-brand-medium)] transition-colors duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-brand-deep)] mb-4 group-hover:translate-x-1 transition-transform duration-300 uppercase">
                  {card.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed text-lg transition-colors duration-300">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Waitlist CTA */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center rounded-[32px] mb-12 overflow-hidden bg-[var(--color-brand-deep)]">
          {/* Animated Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[32px]">
            <img 
              src="https://images.unsplash.com/photo-1600607687920-4e2a09be1587?auto=format&fit=crop&q=80" 
              alt="Luxury Interior" 
              className="w-full h-full object-cover animate-slow-pan opacity-60"
              aria-hidden="true"
            />
            {/* Solid color overlay, no gradient */}
            <div className="absolute inset-0 bg-[#0E2F1F]/80"></div>
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
