import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, Cpu } from 'lucide-react';

const CARDS = [
  {
    icon: Search,
    title: 'Transparency',
    description: 'Making important property information easier to understand.',
  },
  {
    icon: Shield,
    title: 'Trust',
    description: 'Connecting people with properly verified professionals and better processes.',
  },
  {
    icon: Cpu,
    title: 'Technology',
    description: 'Using technology to reduce unnecessary friction and improve real estate experiences.',
  }
];

export default function AboutPage() {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col justify-center animate-fade-in">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-[var(--color-brand-deep)] mb-8">
          About Unity Homes
        </h1>
        <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed">
          Unity Homes and Properties Ltd is a Nigerian real estate company focused on making property transactions safer, clearer and more transparent. The platform is being built to help people discover property opportunities, connect with trusted professionals, verify important information and manage real estate more efficiently.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {CARDS.map((card, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[var(--radius-card)] border border-[var(--color-border)] text-center shadow-sm">
            <div className="w-16 h-16 bg-[var(--color-surface-light)] rounded-full flex items-center justify-center text-[var(--color-brand-medium)] mx-auto mb-6">
              <card.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">{card.title}</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          to="/waitlist"
          className="inline-flex bg-[var(--color-accent-gold)] text-[var(--color-brand-deep)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-lg hover:opacity-90 transition-opacity min-h-[48px] items-center justify-center"
        >
          Join The Waitlist
        </Link>
      </div>
    </div>
  );
}
