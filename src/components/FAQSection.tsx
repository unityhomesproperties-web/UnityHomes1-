import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

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
    <div className="w-full flex flex-col gap-4">
      {displayedFaq.map((faq, idx) => {
        const isExpanded = expandedIndex === idx;
        const statusColor = faq.status === 'Available Now' ? 'text-[#6FBE45]' : 'text-[#C9A84C]';
        
        return (
          <div 
            key={idx} 
            className={`bg-white border ${isExpanded ? 'border-[#6FBE45]/30 shadow-sm' : 'border-gray-200 hover:border-gray-300'} rounded-[20px] overflow-hidden transition-all duration-300`}
          >
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className="w-full text-left p-6 md:p-8 focus:outline-none focus:ring-4 focus:ring-[#EAF5E3] flex items-start justify-between gap-6"
              aria-expanded={isExpanded}
              aria-controls={`faq-answer-${idx}`}
              id={`faq-question-${idx}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[11px] font-semibold uppercase tracking-widest ${statusColor}`}>
                    {faq.status}
                  </span>
                </div>
                <h3 className={`text-lg md:text-xl font-semibold transition-colors duration-200 ${isExpanded ? 'text-[#6FBE45]' : 'text-[#132A1D]'}`}>
                  {faq.question}
                </h3>
              </div>
              
              <div className="shrink-0 mt-1 flex items-center justify-center text-[#132A1D]">
                {isExpanded ? (
                  <Minus className="w-5 h-5 text-[#6FBE45] transition-transform duration-300" strokeWidth={2.5} />
                ) : (
                  <Plus className="w-5 h-5 transition-transform duration-300" strokeWidth={2.5} />
                )}
              </div>
            </button>
            
            <div 
              id={`faq-answer-${idx}`}
              role="region"
              aria-labelledby={`faq-question-${idx}`}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 md:px-8 pb-8 pt-2">
                <p className="text-base md:text-lg text-[#6B7280] leading-relaxed max-w-3xl">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
