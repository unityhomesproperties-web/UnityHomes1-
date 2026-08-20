import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const PILLARS = [
  {
    title: 'Transparency',
    explanation: 'We are committed to providing open, clear access to property histories, pricing data, and neighborhood insights so that everyone can make informed decisions without hidden surprises.'
  },
  {
    title: 'Accountability',
    explanation: 'By verifying professionals and standardizing property listings, we build a system where stakeholders are accountable for the quality and accuracy of the information they provide.'
  },
  {
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
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto min-h-screen animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[var(--color-primary-green)] mb-8">
          Our Mission
        </h1>
        <p className="text-2xl text-[var(--color-primary-text)] font-medium leading-relaxed mb-6">
          "To make real estate in Nigeria more transparent, trustworthy and easier to navigate by combining technology, verified information, trusted professionals and practical services."
        </p>
        <p className="text-lg text-[var(--color-secondary-text)] leading-relaxed">
          We believe buying, renting and managing property should not require people to depend on guesswork, hidden information or unnecessary stress.
        </p>
      </div>

      <div className="space-y-6">
        {PILLARS.map((pillar, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => toggleExpand(idx)}
              className="w-full text-left bg-[var(--color-white)] p-6 md:p-8 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--color-primary-text)]">{pillar.title}</h3>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-background)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-6 h-6 text-[var(--color-secondary-green)]" />
                </div>
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <p className="text-[var(--color-secondary-text)] leading-relaxed">
                  {pillar.explanation}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
