const fs = require('fs');

const file = 'src/pages/ServicesPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update imports
content = content.replace(
  "import { motion, AnimatePresence } from 'motion/react';",
  "import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'motion/react';\nimport { useRef } from 'react';"
);

// Find the start of ServicesPage component to add hooks
content = content.replace(
  "export default function ServicesPage() {",
  "export default function ServicesPage() {\n  const heroRef = useRef<HTMLElement>(null);\n  const reducedMotion = useReducedMotion();\n  const { scrollYProgress } = useScroll({\n    target: heroRef,\n    offset: ['start start', 'end start']\n  });\n  const yImage = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);\n  const yPattern = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);\n"
);

const oldHero = `{/* Premium Hero Banner - Solid Fresh Green */}
      <section className="relative text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#6FBE45] overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
          >
            <h4 className="text-sm font-semibold tracking-widest uppercase text-white/90 mb-4">
              OUR SERVICES
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-8">
              Real estate services, connected around you.
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-xl font-medium">
              Explore the services Unity Homes is building to make property discovery, verification, professional access and property management simpler and more transparent.
            </p>
          </motion.div>
          
          {/* Animated Ecosystem Visual */}
          <div className="flex justify-start lg:justify-end items-center h-64 lg:h-full relative">
            <svg viewBox="0 0 500 400" fill="none" className="w-full h-full max-w-lg overflow-visible">
              
              {/* Central Unity Homes Node */}
              <motion.circle cx="250" cy="200" r="28" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} />
              
              {/* Service Nodes & Connections */}
              {[
                { cx: 250, cy: 60, delay: 0.2 },
                { cx: 380, cy: 120, delay: 0.3 },
                { cx: 400, cy: 260, delay: 0.4 },
                { cx: 250, cy: 340, delay: 0.5 },
                { cx: 100, cy: 260, delay: 0.6 },
                { cx: 120, cy: 120, delay: 0.7 },
                { cx: 180, cy: 80, delay: 0.8 }, // 7th node
              ].map((pos, idx) => (
                <g key={idx}>
                  <motion.line 
                    x1="250" y1="200" x2={pos.cx} y2={pos.cy} 
                    stroke="white" strokeWidth="2" strokeDasharray="4 4" 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: pos.delay, duration: 0.4 }} 
                  />
                  <motion.circle 
                    cx={pos.cx} cy={pos.cy} r="14" fill="white" 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: pos.delay + 0.2, duration: 0.3 }} 
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>`;

const newHero = `{/* Premium Hero Banner - Architectural Refinement */}
      <section ref={heroRef} className="relative text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#73C81C] overflow-hidden">
        
        {/* Very Subtle Background Depth without harsh gradients */}
        <div className="absolute inset-0 pointer-events-none z-0">
           <div className="absolute top-0 right-0 w-3/4 h-full bg-[#48B400] opacity-40 blur-[120px] mix-blend-multiply rounded-full translate-x-1/4 -translate-y-1/4" />
           <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-[#0B8E2A] opacity-20 blur-[100px] mix-blend-multiply rounded-full -translate-x-1/4 translate-y-1/4" />
        </div>

        {/* Architectural Image Overlay */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none mix-blend-overlay opacity-[0.08]"
          style={{ y: reducedMotion ? '0%' : yImage }}
        >
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" 
            alt="Architecture Texture" 
            className="w-full h-full object-cover filter blur-[2px] grayscale"
          />
        </motion.div>

        {/* Architectural Grid Pattern */}
        <motion.svg 
          className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none z-0" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ y: reducedMotion ? '0%' : yPattern }}
        >
          <defs>
            <pattern id="arch-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#FFFFFF" strokeWidth="1" />
              <circle cx="60" cy="60" r="1.5" fill="#FFFFFF" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#arch-pattern)" />
        </motion.svg>

        {/* Soft Lighting Behind Headline */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-white opacity-[0.07] blur-[100px] rounded-full pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h4 className="text-xs md:text-sm font-semibold tracking-widest uppercase text-white/90 mb-4">
              OUR SERVICES
            </h4>
            <h1 className="text-[36px] leading-[1.1] md:text-[42px] lg:text-[48px] font-semibold text-white mb-6 lg:mb-8 tracking-tight">
              Real estate services, connected around you.
            </h1>
            <p className="text-[16px] md:text-[18px] text-white/90 leading-[1.6] max-w-xl font-normal">
              Explore the services Unity Homes is building to make property discovery, verification, professional access and property management simpler and more transparent.
            </p>
          </motion.div>
          
          {/* Refined Ecosystem Visual */}
          <div className="flex justify-start lg:justify-end items-center h-48 lg:h-full relative opacity-60 mix-blend-overlay">
            <svg viewBox="0 0 500 400" fill="none" className="w-full h-full max-w-md overflow-visible">
              
              {/* Central Unity Homes Node */}
              <motion.circle cx="250" cy="200" r="20" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} />
              
              {/* Service Nodes & Connections */}
              {[
                { cx: 250, cy: 80, delay: 0.2 },
                { cx: 360, cy: 140, delay: 0.3 },
                { cx: 380, cy: 260, delay: 0.4 },
                { cx: 250, cy: 320, delay: 0.5 },
                { cx: 120, cy: 260, delay: 0.6 },
                { cx: 140, cy: 140, delay: 0.7 },
                { cx: 190, cy: 100, delay: 0.8 },
              ].map((pos, idx) => (
                <g key={idx}>
                  <motion.line 
                    x1="250" y1="200" x2={pos.cx} y2={pos.cy} 
                    stroke="white" strokeWidth="1" strokeDasharray="3 3" 
                    initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.8 }} transition={{ delay: pos.delay, duration: 0.6, ease: "easeOut" }} 
                  />
                  <motion.circle 
                    cx={pos.cx} cy={pos.cy} r="8" fill="white" 
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.9 }} transition={{ delay: pos.delay + 0.3, duration: 0.4 }} 
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>`;

if (content.includes(oldHero)) {
    content = content.replace(oldHero, newHero);
    fs.writeFileSync(file, content);
    console.log("ServicesPage updated successfully.");
} else {
    console.log("Could not find the target hero code.");
}
