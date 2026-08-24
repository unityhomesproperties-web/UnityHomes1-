import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import ShareModal from '../components/ShareModal';

interface AISuccessStateProps {
  onReset: () => void;
}

export default function AreaIntelligenceSuccess({ onReset }: AISuccessStateProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

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
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] mb-6">
          Thank you for helping improve property transparency in Nigeria
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed mb-10">
          Your insights will help others make more informed, safer property decisions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            to="/"
            className="flex items-center justify-center bg-white text-[var(--color-text-primary)] border border-[var(--color-border)] px-8 py-4 rounded-[18px] font-bold text-lg hover:bg-stone-50 transition-colors duration-200 min-h-[48px] shadow-sm hover:-translate-y-0.5 active:translate-y-0"
          >
            Return Home
          </Link>
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center justify-center space-x-2 bg-[var(--color-brand-fresh)] text-white px-8 py-4 rounded-[18px] font-bold text-lg hover:bg-[var(--color-brand-medium)] transition-colors duration-200 min-h-[48px] shadow-sm hover:-translate-y-0.5 active:translate-y-0"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Area Intelligence</span>
          </button>
        </div>
      </motion.div>

      <ShareModal
        url={window.location.origin + '/area-intelligence'}
        title="Unity Homes Area Intelligence"
        text="I just contributed to Area Intelligence on Unity Homes to help build a more transparent real estate market in Nigeria. Share your neighborhood insights too!"
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
