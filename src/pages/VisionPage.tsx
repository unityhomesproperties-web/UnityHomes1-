import React from 'react';

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
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen animate-fade-in">
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h1 className="text-4xl font-bold text-[var(--color-primary-green)] mb-8">
          Our Vision
        </h1>
        <p className="text-2xl text-[var(--color-primary-text)] font-medium leading-relaxed">
          "To build a trusted digital infrastructure for real estate in Nigeria where people can discover properties, access the right professionals, understand important information and manage property with greater confidence."
        </p>
      </div>

      <div className="relative">
        {/* Horizontal connecting line (hidden on mobile) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-[var(--color-border)] -translate-y-1/2 z-0" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
          {SEQUENCE.map((item, idx) => (
            <div key={idx} className="bg-[var(--color-white)] p-6 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-sm flex flex-col items-center text-center relative hover:-translate-y-1 transition-transform">
              <div className="absolute -top-3 bg-[var(--color-background)] px-2 py-1 text-xs font-bold text-[var(--color-secondary-text)] rounded-[var(--radius-pill)] border border-[var(--color-border)] shadow-sm">
                Step 0{idx + 1}
              </div>
              <h3 className="text-lg font-bold text-[var(--color-primary-green)] mt-4 mb-2">{item.step}</h3>
              <p className="text-sm text-[var(--color-secondary-text)] mb-6 flex-1">
                {item.description}
              </p>
              <div className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-pill)] ${
                item.status === 'Available Now' 
                  ? 'bg-[#E8F5E9] text-[var(--color-secondary-green)]' 
                  : 'bg-[var(--color-background)] text-[var(--color-secondary-text)] border border-[var(--color-border)]'
              }`}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
