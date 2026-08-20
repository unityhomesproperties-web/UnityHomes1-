import React from 'react';
import { Link } from 'react-router-dom';

export default function AreaIntelligencePage() {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen text-center animate-fade-in flex flex-col justify-center">
      <h1 className="text-4xl font-bold text-[var(--color-primary-green)] mb-6">
        Area Intelligence
      </h1>
      <p className="text-xl text-[var(--color-secondary-text)] leading-relaxed mb-10">
        Collect and view community information to help people understand neighbourhoods better before they move or invest.
      </p>
      
      <div className="bg-[var(--color-white)] p-8 rounded-[var(--radius-card)] border border-[var(--color-border)] mb-10 inline-block text-left">
        <h2 className="text-lg font-bold text-[var(--color-primary-text)] mb-2">Neighborhood Insights</h2>
        <div className="inline-flex px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--color-background)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-secondary-text)]">
          Status: Available Now
        </div>
      </div>
      
      <div>
        <Link
          to="/waitlist"
          className="inline-flex bg-[var(--color-accent-gold)] text-[var(--color-primary-green)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-lg hover:opacity-90 transition-opacity min-h-[48px] items-center justify-center"
        >
          Join The Waitlist to Contribute
        </Link>
      </div>
    </div>
  );
}
