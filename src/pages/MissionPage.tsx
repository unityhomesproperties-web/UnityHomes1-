import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const PILLARS = [
  {
    id: '01',
    title: 'Transparency',
    explanation: 'We are committed to providing open, clear access to property histories, pricing data, and neighborhood insights so that everyone can make informed decisions without hidden surprises.'
  },
  {
    id: '02',
    title: 'Accountability',
    explanation: 'By verifying professionals and standardizing property listings, we build a system where stakeholders are accountable for the quality and accuracy of the information they provide.'
  },
  {
    id: '03',
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
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* Premium Hero Banner - Solid Supporting Green */}
      <section className="relative text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1541888086925-ebcf3819e933?auto=format&fit=crop&q=80" alt="Hero Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
          >
            <h4 className="text-sm font-semibold tracking-widest uppercase text-white/90 mb-4">
              OUR MISSION
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-8">
              Making better property decisions easier.
            </h1>
          </motion.div>
          
          {/* Animated Path Visual */}
          <div className="hidden lg:flex justify-end items-center h-full relative pl-10">
            <svg viewBox="0 0 500 300" fill="none" className="w-full h-full max-w-lg overflow-visible">
              
              {/* Central Line */}
              <motion.path 
                d="M50,250 C100,250 100,200 150,200 C200,200 200,150 250,150 C300,150 300,100 350,100 C400,100 400,150 450,150" 
                stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
              
              {/* Nodes and Text Labels */}
              <g>
                <motion.circle cx="50" cy="250" r="6" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.3 }} />
                <motion.text x="50" y="275" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Information</motion.text>
              </g>

              <g>
                <motion.circle cx="150" cy="200" r="6" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, duration: 0.3 }} />
                <motion.text x="150" y="225" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Verification</motion.text>
              </g>

              <g>
                <motion.circle cx="250" cy="150" r="6" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, duration: 0.3 }} />
                <motion.text x="250" y="175" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>Professionals</motion.text>
              </g>

              <g>
                <motion.circle cx="350" cy="100" r="6" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0, duration: 0.3 }} />
                <motion.text x="350" y="125" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>Property</motion.text>
              </g>

              <g>
                <motion.circle cx="450" cy="150" r="10" fill="white" stroke="#2F8D46" strokeWidth="4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3, duration: 0.4 }} />
                <motion.circle cx="450" cy="150" r="14" stroke="white" strokeWidth="2" fill="none" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.4, duration: 0.4 }} />
                <motion.text x="450" y="185" fill="white" fontSize="14" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>Better Decisions</motion.text>
              </g>
              
            </svg>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold tracking-widest uppercase text-[#6B7280]">
              OUR MISSION
            </h4>
            <div className="w-12 h-1 bg-[#2F8D46] mt-6 rounded-full hidden md:block"></div>
          </div>
          <div className="md:col-span-8">
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl md:text-3xl text-[#132A1D] font-semibold leading-relaxed mb-10"
            >
              To make real estate in Nigeria more transparent, trustworthy and easier to navigate by combining technology, verified information, trusted professionals and practical services.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-lg md:text-xl text-[#6B7280] leading-relaxed max-w-2xl font-medium"
            >
              We believe buying, renting and managing property should not require people to depend on guesswork, hidden information or unnecessary stress.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-6">
          {PILLARS.map((pillar, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className={`bg-white border ${isExpanded ? 'border-[#6FBE45]/30 shadow-sm' : 'border-gray-200 hover:border-gray-300'} rounded-[20px] overflow-hidden transition-all duration-300`}
              >
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full text-left p-6 md:p-8 focus:outline-none focus:ring-4 focus:ring-[#EAF5E3] group flex items-start justify-between gap-6"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-6 md:gap-10 flex-1">
                    <span className={`text-sm font-semibold transition-colors duration-200 ${isExpanded ? 'text-[#6FBE45]' : 'text-gray-400 group-hover:text-[#6FBE45]'}`}>
                      {pillar.id}
                    </span>
                    <h3 className={`text-xl md:text-2xl font-semibold transition-colors duration-200 ${isExpanded ? 'text-[#6FBE45]' : 'text-[#132A1D] group-hover:text-[#6FBE45]'}`}>
                      {pillar.title}
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
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 md:px-8 pb-8 pt-2 flex gap-6 md:gap-10">
                    <div className="w-[18px] md:w-[22px] hidden sm:block shrink-0"></div>
                    <p className="text-base md:text-lg text-[#6B7280] leading-relaxed max-w-2xl pr-4">
                      {pillar.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Closing Section - Solid Fresh Green */}
      
    </div>
  );
}
