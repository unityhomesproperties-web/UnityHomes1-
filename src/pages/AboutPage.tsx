import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const VALUES = [
  {
    id: '01',
    title: 'Transparency',
    description: 'Making important property information easier to understand.',
  },
  {
    id: '02',
    title: 'Trust',
    description: 'Connecting people with properly verified professionals and better processes.',
  },
  {
    id: '03',
    title: 'Technology',
    description: 'Using technology to reduce unnecessary friction and improve real estate experiences.',
  }
];

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* Premium Hero Banner */}
      <section className="relative text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#6FBE45] overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
          >
            <h4 className="text-sm font-bold tracking-widest uppercase text-white/90 mb-4">
              ABOUT UNITY HOMES
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-8">
              Making real estate easier to understand.
            </h1>
          </motion.div>
          
          {/* Animated Architectural Visual */}
          <div className="hidden lg:flex justify-end items-center h-full relative">
            <svg viewBox="0 0 500 300" fill="none" className="w-full max-w-lg">
              {/* Building 1 (Left) */}
              <motion.path 
                d="M50,220 L50,120 L110,80 L170,120 L170,220 Z" 
                stroke="white" strokeWidth="4" strokeLinejoin="round" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
              <motion.rect x="85" y="140" width="20" height="30" stroke="white" strokeWidth="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.3 }} />
              
              {/* Building 2 (Right) */}
              <motion.path 
                d="M330,220 L330,100 L390,60 L450,100 L450,220 Z" 
                stroke="white" strokeWidth="4" strokeLinejoin="round" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
              <motion.rect x="365" y="120" width="20" height="30" stroke="white" strokeWidth="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.3 }} />

              {/* Building 3 (Center - Unity Homes) */}
              <motion.path 
                d="M190,220 L190,90 L250,40 L310,90 L310,220 Z" 
                stroke="white" strokeWidth="5" strokeLinejoin="round" fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
              />
              <motion.rect x="235" y="110" width="30" height="40" stroke="white" strokeWidth="4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.3 }} />

              {/* Ground Line */}
              <motion.line 
                x1="20" y1="220" x2="480" y2="220" 
                stroke="white" strokeWidth="4" strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />

              {/* Connection Lines */}
              <motion.path 
                d="M170,180 L190,180" 
                stroke="white" strokeWidth="3" strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              />
              <motion.path 
                d="M310,180 L330,180" 
                stroke="white" strokeWidth="3" strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 0.3 }}
              />
              
              {/* Central Connection (Nodes) */}
              <motion.circle cx="180" cy="180" r="4" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
              <motion.circle cx="320" cy="180" r="4" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} />
            </svg>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h4 className="text-sm font-bold tracking-widest uppercase text-[#6B7280]">
              WHO WE ARE
            </h4>
            <div className="w-12 h-1 bg-[#6FBE45] mt-6 rounded-full hidden md:block"></div>
          </div>
          <div className="md:col-span-8">
            <p className="text-xl md:text-2xl text-[#132A1D] leading-relaxed font-medium">
              Unity Homes and Properties Ltd is a Nigerian real estate company focused on making property transactions safer, clearer and more transparent. The platform is being built to help people discover property opportunities, connect with trusted professionals, verify important information and manage real estate more efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Value System */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-8">
          {VALUES.map((value, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group bg-white p-10 border border-gray-200 hover:border-[#6FBE45]/40 hover:bg-[#EAF5E3] transition-all duration-200 cursor-default rounded-[24px] hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm font-bold text-[#132A1D] opacity-40 group-hover:opacity-100 group-hover:text-[#6FBE45] transition-colors duration-200">
                  {value.id}
                </span>
                <div className="h-px bg-gray-200 flex-1 group-hover:bg-[#6FBE45]/30 transition-colors duration-200"></div>
              </div>
              
              <h3 className="text-2xl font-extrabold text-[#132A1D] mb-4">
                {value.title}
              </h3>
              
              <p className="text-[#6B7280] group-hover:text-[#132A1D] leading-relaxed text-lg transition-colors duration-200">
                {value.description}
              </p>
              
              {/* Subtle visual indicator line */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-[#6FBE45] group-hover:w-full transition-all duration-300"></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Animated Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white border-y border-gray-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-[#132A1D] mb-20"
          >
            A clearer way forward.
          </motion.h2>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 lg:gap-20">
            {['DISCOVER', 'VERIFY', 'CONNECT', 'MANAGE'].map((word, idx) => (
              <div key={idx} className="flex items-center gap-6 md:gap-12 lg:gap-20">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.2, duration: 0.5, ease: "easeOut" }}
                >
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#6FBE45] tracking-tight">
                    {word}
                  </h3>
                </motion.div>
                
                {idx < 3 && (
                  <motion.div
                    className="w-1 h-8 md:w-12 md:h-1 lg:w-20 bg-gray-200 rounded-full hidden md:block"
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: (idx * 0.2) + 0.1, duration: 0.3 }}
                    style={{ transformOrigin: "left" }}
                  ></motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Banner */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center bg-[#2F8D46] overflow-hidden">
        
        {/* Subtle Architectural Line Animation Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex justify-center items-center">
           <svg viewBox="0 0 1000 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <motion.path 
                d="M-100,300 L200,300 L300,200 L700,200 L800,300 L1100,300"
                stroke="white" strokeWidth="2" fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.path 
                d="M100,400 L100,250 L250,100 L400,250 L400,400"
                stroke="white" strokeWidth="1" fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
              />
              <motion.path 
                d="M600,400 L600,250 L750,100 L900,250 L900,400"
                stroke="white" strokeWidth="1" fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
              />
           </svg>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <motion.div
             initial={{ opacity: 0, y: 12 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-12">
              Be part of what Unity Homes is building.
            </h2>
            <Link
              to="/waitlist"
              className="inline-flex bg-white text-[#2F8D46] px-10 py-5 rounded-[18px] font-bold text-lg hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md transition-all duration-200"
            >
              Join The Waitlist
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
