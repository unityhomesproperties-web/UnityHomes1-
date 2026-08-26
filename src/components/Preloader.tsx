// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [loadingText, setLoadingText] = useState(0);

  useEffect(() => {
    // Animate percentage text
    const interval = setInterval(() => {
      setLoadingText((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30); // Reach 100 in about 3 seconds

    // Complete preloader after sequence
    const timer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  // Framer motion variants for line drawing
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.6, type: "tween", duration: 1.2, ease: "easeInOut" },
        opacity: { delay: i * 0.6, duration: 0.2 }
      }
    })
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#18452E] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-[#0E2F1F]/40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* SVG House Animation */}
        <div className="relative w-36 h-36 md:w-48 md:h-48 flex items-center justify-center mb-10">
           {/* Circular Progress Ring */}
           <motion.svg
             className="absolute inset-0 w-full h-full -rotate-90"
             viewBox="0 0 100 100"
           >
             {/* Background Ring */}
             <circle 
               cx="50" cy="50" r="48" 
               stroke="#18452E" strokeWidth="1" fill="none" 
               className="opacity-40"
             />
             {/* Animated Progress Ring */}
             <motion.circle 
               cx="50" cy="50" r="48" 
               stroke="#C9A84C" strokeWidth="1.5" fill="none"
               strokeLinecap="round"
               initial={{ pathLength: 0 }}
               animate={{ pathLength: 1 }}
               transition={{ duration: 3.5, ease: "easeInOut" }}
               style={{ filter: 'drop-shadow(0 0 6px rgba(201,168,76,0.4))' }}
             />
           </motion.svg>

           {/* House Blueprint SVG */}
           <svg viewBox="0 0 100 100" className="w-20 h-20 md:w-24 md:h-24 text-[#C9A84C]">
             {/* Roof */}
             <motion.path
               custom={0}
               variants={pathVariants}
               initial="hidden"
               animate="visible"
               d="M10 45 L50 15 L90 45"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
             />
             {/* Walls */}
             <motion.path
               custom={1}
               variants={pathVariants}
               initial="hidden"
               animate="visible"
               d="M20 38 L20 85 L80 85 L80 38"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
             />
             {/* Windows */}
             <motion.path
               custom={2}
               variants={pathVariants}
               initial="hidden"
               animate="visible"
               d="M30 48 L45 48 L45 62 L30 62 Z M55 48 L70 48 L70 62 L55 62 Z"
               fill="none"
               stroke="currentColor"
               strokeWidth="1.5"
               strokeLinecap="round"
               strokeLinejoin="round"
             />
             {/* Window Panes (Crosses) */}
             <motion.path
               custom={2.2}
               variants={pathVariants}
               initial="hidden"
               animate="visible"
               d="M37.5 48 L37.5 62 M30 55 L45 55 M62.5 48 L62.5 62 M55 55 L70 55"
               fill="none"
               stroke="currentColor"
               strokeWidth="1"
               strokeLinecap="round"
               className="opacity-70"
             />
             {/* Door */}
             <motion.path
               custom={3}
               variants={pathVariants}
               initial="hidden"
               animate="visible"
               d="M42 85 L42 70 L58 70 L58 85"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
             />
             {/* Foundation */}
             <motion.path
               custom={4}
               variants={pathVariants}
               initial="hidden"
               animate="visible"
               d="M5 85 L95 85"
               fill="none"
               stroke="currentColor"
               strokeWidth="3"
               strokeLinecap="round"
             />
             {/* Subtle completion shine (optional, animated later) */}
             <motion.path
               d="M10 45 L50 15 L90 45 M20 38 L20 85 L80 85 L80 38"
               fill="currentColor"
               className="opacity-0"
               animate={{ opacity: [0, 0.05, 0] }}
               transition={{ delay: 3.5, duration: 1 }}
             />
           </svg>
        </div>

        {/* Brand Reveal */}
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 1, ease: "easeOut" }}
        >
          <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-[0.2em] md:tracking-[0.25em] uppercase">
            Unity Homes
          </h1>
          <p className="font-mono text-[9px] md:text-[10px] text-[#C9A84C] tracking-[0.3em] uppercase mt-2">
            &amp; Properties
          </p>
        </motion.div>

        {/* Loading Bar */}
        <motion.div 
          className="w-48 md:w-64 h-[1px] bg-[#18452E]/40 mt-12 rounded-full overflow-hidden relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-[#C9A84C]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
            style={{ boxShadow: '0 0 8px rgba(201,168,76,0.5)' }}
          />
        </motion.div>

        {/* Percentage Counter */}
        <motion.div 
          className="font-mono text-[#C9A84C]/80 text-[10px] tracking-widest mt-3 flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <span>{loadingText.toString().padStart(3, '0')}%</span>
          <span className="w-1 h-1 rounded-full bg-[#16A34A] animate-pulse"></span>
        </motion.div>
      </div>
    </motion.div>
  );
}
