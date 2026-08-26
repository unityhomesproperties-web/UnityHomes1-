import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-[var(--color-border)] pb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-brand-deep)] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)]">
            How Unity Homes collects, uses, and protects your data.
          </p>
        </div>
        
        <div className="prose prose-lg prose-green max-w-none text-[var(--color-text-secondary)]">
          <p>
            This privacy policy is currently being updated to reflect the Unity Homes Waitlist and Area Intelligence initiatives.
          </p>
          <p>
            Please check back closer to our official launch for the comprehensive privacy policy governing the use of the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
