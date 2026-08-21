import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

export default function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {FULL_FAQ.map((faq, idx) => {
        const isExpanded = expandedIndex === idx;
        return (
          <button
            key={idx}
            onClick={() => setExpandedIndex(isExpanded ? null : idx)}
            className="w-full text-left bg-[var(--color-white)] p-6 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow focus:outline-none"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <h3 className="text-lg font-bold text-[var(--color-primary-text)] pr-4 flex-1">
                {faq.question}
              </h3>
              <div className="flex items-center space-x-4">
                <span className="shrink-0 inline-flex items-center px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-secondary-text)]">
                  {faq.status}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-background)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5 text-[var(--color-secondary-green)]" />
                </div>
              </div>
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <p className="text-[var(--color-secondary-text)] leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
