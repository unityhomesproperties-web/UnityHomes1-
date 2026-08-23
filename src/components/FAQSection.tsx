import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

const FULL_FAQ = [
  {
    question: 'What is Unity Homes?',
    answer: 'Unity Homes and Properties Ltd is building technology that makes property discovery, trusted professional access, property management and real estate decision-making simpler and more transparent in Nigeria.',
    status: 'Available Now'
  },
  {
    question: 'Who can join the waitlist?',
    answer: 'The waitlist is open to Property Seekers (buyers/renters), Landlords, Property Management Companies, Property Lawyers, Licensed Surveyors, and Structural Engineers.',
    status: 'Available Now'
  },
  {
    question: 'How can professionals join?',
    answer: 'Professionals must register through the Waitlist using their respective professional registration numbers (NBA, Surveyors Council of Nigeria (SURCON), COREN). Unity Homes will verify all credentials before listing.',
    status: 'In Development'
  },
  {
    question: 'How can landlords participate?',
    answer: 'Landlords can register to either list their property only, or choose to utilize the Unity Homes Manager tool for comprehensive tenant and operations management.',
    status: 'Coming Soon'
  },
  {
    question: 'What is Area Intelligence?',
    answer: 'Area Intelligence is a community-driven tool where residents, visitors, and professionals share factual, structured insights about neighborhoods to help others make better property decisions.',
    status: 'Available Now'
  },
  {
    question: 'Is Area Intelligence mandatory?',
    answer: 'No, contributing to Area Intelligence is entirely optional, though we encourage community participation to build a more transparent real estate environment.',
    status: 'Available Now'
  },
  {
    question: 'Is the platform already live?',
    answer: 'Certain data collection modules like Area Intelligence are live now, while core features like Property Listings and the Verified Directory are currently in active development.',
    status: 'In Development'
  }
];

export default function FAQSection({ limit }: { limit?: number }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const displayedFaq = limit ? FULL_FAQ.slice(0, limit) : FULL_FAQ;

  return (
    <div className="w-full">
      <div className="border-t border-[var(--color-border)]">
        {displayedFaq.map((faq, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={idx} className="border-b border-[var(--color-border)]">
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full text-left py-6 focus:outline-none group flex items-start justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                      {faq.status}
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold transition-colors duration-200 ${isExpanded ? 'text-[var(--color-brand-deep)]' : 'text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-medium)]'}`}>
                    {faq.question}
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
                  isExpanded ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed pr-14">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
