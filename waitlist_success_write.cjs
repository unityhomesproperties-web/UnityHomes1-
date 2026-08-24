const fs = require('fs');

const content = `import React from 'react';
import { Link } from 'react-router-dom';
import { Map } from 'lucide-react';
import { motion } from 'motion/react';

export default function WaitlistSuccessPage() {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto min-h-[70vh] flex flex-col justify-center items-center text-center">
      <div className="mb-10 w-32 h-32 relative">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <motion.path 
            d="M20,70 L50,40 L80,70 V90 H20 Z" 
            stroke="#6FBE45" 
            strokeWidth="3" 
            strokeLinejoin="round" 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.path 
            d="M35,60 L45,70 L65,50" 
            stroke="#6FBE45" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
          />
        </svg>
      </div>
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.3 }}>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] mb-4">
          Thank you for joining the Unity Homes Waitlist.
        </h1>
        <p className="text-xl md:text-2xl font-medium text-[var(--color-text-secondary)] mb-12">
          Together, let's build a safer real estate industry.
        </p>
        
        <div className="bg-stone-50 p-8 md:p-10 rounded-[24px] border border-[var(--color-border)] shadow-sm w-full text-left">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-white border border-[var(--color-border)] rounded-[14px] flex items-center justify-center text-[#6FBE45] mr-5 shadow-sm">
              <Map className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
              Help Build Better Area Intelligence
            </h2>
          </div>
          
          <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
            Would you like to help us understand what life is really like in your area? Your experience can help us build better community information for future buyers and renters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/area-intelligence"
              className="flex-1 text-center bg-[#6FBE45] text-white px-6 py-4 rounded-[18px] font-bold text-lg hover:bg-[#5CA636] transition-all duration-200 min-h-[56px] flex items-center justify-center shadow-sm hover:-translate-y-0.5 active:translate-y-0"
            >
              Contribute Area Insights
            </Link>
            <Link
              to="/"
              className="flex-1 text-center bg-white text-[var(--color-text-primary)] border border-[var(--color-border)] px-6 py-4 rounded-[18px] font-bold text-lg hover:bg-stone-50 transition-all duration-200 min-h-[56px] flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              Skip For Now
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/WaitlistSuccessPage.tsx', content);
console.log('Successfully wrote WaitlistSuccessPage.tsx');
