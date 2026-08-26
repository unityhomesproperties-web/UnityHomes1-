const fs = require('fs');

const content = `import React from 'react';
import { Link } from 'react-router-dom';
import { Map, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function WaitlistSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Premium Success Banner */}
      <section className="bg-[#6FBE45] text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* Animated Architectural Checkmark */}
          <div className="w-32 h-32 mx-auto mb-10 relative">
            <svg viewBox="0 0 120 120" fill="none" className="w-full h-full overflow-visible">
              {/* House Base Outline */}
              <motion.path 
                d="M20,70 L60,35 L100,70 V100 H20 Z" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinejoin="round" 
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              {/* Checkmark */}
              <motion.path 
                d="M40,70 L55,85 L85,45" 
                stroke="currentColor" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
              />
            </svg>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <h4 className="text-sm md:text-base font-bold tracking-widest uppercase text-white/90 mb-4">
              THANK YOU
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Thank you for joining the Unity Homes Waitlist.
            </h1>
            <p className="text-xl md:text-2xl font-medium text-white/90 max-w-2xl mx-auto">
              Together, let's build a safer real estate industry.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Area Intelligence Bridge */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-left"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-[#F5FAF2] border border-[#6FBE45]/20 rounded-[18px] flex items-center justify-center text-[#6FBE45] mr-5 shrink-0">
              <Map className="w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#132A1D]">
              Help Build Better Area Intelligence
            </h2>
          </div>
          
          <p className="text-lg md:text-xl text-[#6B7280] mb-12 leading-relaxed">
            Would you like to help us understand what life is really like in your area? Your experience can help us build better community information for future buyers and renters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link
              to="/area-intelligence"
              className="flex-1 text-center bg-[#6FBE45] text-white px-8 py-5 rounded-[18px] font-bold text-lg hover:bg-[#5CA636] transition-all duration-200 min-h-[56px] flex items-center justify-center group"
            >
              Contribute Area Insights
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/"
              className="flex-1 text-center bg-white text-[#132A1D] border-2 border-gray-200 px-8 py-5 rounded-[18px] font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 min-h-[56px] flex items-center justify-center group"
            >
              Skip For Now
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/WaitlistSuccessPage.tsx', content);
console.log('WaitlistSuccessPage written');
