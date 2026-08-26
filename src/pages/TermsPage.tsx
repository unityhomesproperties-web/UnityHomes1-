import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-[var(--color-border)] pb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--color-brand-deep)] tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)]">
            The rules and guidelines for using Unity Homes.
          </p>
        </div>
        
        <div className="prose prose-lg prose-green max-w-none text-[var(--color-text-secondary)]">
          <p>
            Our terms of service are currently being updated to reflect the Unity Homes Waitlist and upcoming platform features.
          </p>
          <p>
            Please check back closer to our official launch for the comprehensive terms governing the use of the platform and our trusted professional network.
          </p>
        </div>
      </div>
    </div>
  );
}
