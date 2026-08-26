import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const SEQUENCE = [
  { step: 'Discover', status: 'In Development', description: 'Finding authentic property listings.' },
  { step: 'Verify', status: 'In Development', description: 'Checking properties and professional credentials.' },
  { step: 'Connect', status: 'In Development', description: 'Linking with trusted real estate experts.' },
  { step: 'Manage', status: 'In Development', description: 'Streamlined tools for property operations.' },
  { step: 'Understand', status: 'Available Now', description: 'Gaining factual insights about neighborhoods.' },
  { step: 'Improve', status: 'In Development', description: 'Elevating the standard of living and management.' },
];

export default function VisionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* Premium Hero Banner - Solid Fresh Green */}
      <section className="relative text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#6FBE45] overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
          >
            <h4 className="text-sm font-semibold tracking-widest uppercase text-white/90 mb-4">
              OUR VISION
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-8">
              Building the infrastructure for a better property experience.
            </h1>
          </motion.div>
          
          {/* Animated Network Visual */}
          <div className="hidden lg:flex justify-end items-center h-full relative">
            <svg viewBox="0 0 500 400" fill="none" className="w-full max-w-lg overflow-visible">
              
              {/* Connection Lines */}
              <motion.line x1="250" y1="200" x2="150" y2="100" stroke="white" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
              <motion.line x1="250" y1="200" x2="350" y2="100" stroke="white" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
              <motion.line x1="250" y1="200" x2="100" y2="250" stroke="white" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
              <motion.line x1="250" y1="200" x2="400" y2="250" stroke="white" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
              <motion.line x1="250" y1="200" x2="250" y2="350" stroke="white" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
              
              {/* Central Node - Property */}
              <motion.circle cx="250" cy="200" r="24" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} />
              <motion.circle cx="250" cy="200" r="32" stroke="white" strokeWidth="2" fill="none" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }} />
              
              {/* Surrounding Nodes */}
              <g>
                <motion.circle cx="150" cy="100" r="12" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, duration: 0.3 }} />
                <motion.text x="150" y="130" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>People</motion.text>
              </g>
              <g>
                <motion.circle cx="350" cy="100" r="12" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, duration: 0.3 }} />
                <motion.text x="350" y="130" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>Professionals</motion.text>
              </g>
              <g>
                <motion.circle cx="100" cy="250" r="12" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, duration: 0.3 }} />
                <motion.text x="100" y="280" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>Information</motion.text>
              </g>
              <g>
                <motion.circle cx="400" cy="250" r="12" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, duration: 0.3 }} />
                <motion.text x="400" y="280" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>Management</motion.text>
              </g>
              <g>
                <motion.circle cx="250" cy="350" r="12" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0, duration: 0.3 }} />
                <motion.text x="250" y="380" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>Trust</motion.text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Vision Statement Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold tracking-widest uppercase text-[#6B7280]">
              OUR VISION
            </h4>
            <div className="w-12 h-1 bg-[#6FBE45] mt-6 rounded-full hidden md:block"></div>
          </div>
          <div className="md:col-span-8">
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-2xl md:text-3xl text-[#132A1D] font-semibold leading-relaxed"
            >
              To build a trusted digital infrastructure for real estate in Nigeria where people can discover properties, access the right professionals, understand important information and manage property with greater confidence.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-32">
        {/* Mobile Vertical Timeline */}
        <div className="lg:hidden flex flex-col gap-0 relative">
          <div className="absolute left-[15px] top-[30px] bottom-[30px] w-px bg-gray-200"></div>
          
          {SEQUENCE.map((item, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4 }}
              className="relative pl-12 pb-12 group cursor-default"
            >
              <div className={`absolute left-0 top-1 w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-semibold z-10 transition-colors duration-300 ${item.status === 'Available Now' ? 'bg-[#6FBE45] text-white border-none' : 'bg-[#F5FAF2] border border-[#C9A84C] text-[#132A1D]'}`}>
                0{idx + 1}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                <h3 className="text-xl font-semibold text-[#132A1D] uppercase tracking-wide group-hover:text-[#6FBE45] transition-colors duration-300">{item.step}</h3>
                <div className={`inline-flex px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full self-start ${
                  item.status === 'Available Now' 
                    ? 'bg-[#EAF5E3] text-[#6FBE45]' 
                    : 'bg-stone-50 text-[#C9A84C] border border-[#C9A84C]/30'
                }`}>
                  {item.status}
                </div>
              </div>
              <p className="text-[#6B7280] group-hover:text-[#132A1D] transition-colors duration-300">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Desktop Horizontal Timeline */}
        <div className="hidden lg:block relative pt-12 pb-24">
          {/* Animated Base Line */}
          <motion.div 
            className="absolute top-[27px] left-0 h-px bg-[#6FBE45]"
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          ></motion.div>
          <div className="absolute top-[27px] left-0 right-0 h-px bg-gray-200 -z-10"></div>
          
          <div className="grid grid-cols-6 gap-6">
            {SEQUENCE.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                className="relative group cursor-default pt-12 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className={`absolute top-[-15px] left-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors duration-300 z-20 ${item.status === 'Available Now' ? 'bg-[#6FBE45] text-white border-none' : 'bg-[#F5FAF2] border border-[#C9A84C] text-[#132A1D]'}`}>
                  0{idx + 1}
                </div>
                
                <h3 className="text-lg font-semibold text-[#132A1D] uppercase tracking-wide mb-3 group-hover:text-[#6FBE45] transition-colors duration-300">{item.step}</h3>
                <div className={`inline-flex mb-4 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider rounded-full ${
                  item.status === 'Available Now' 
                    ? 'bg-[#EAF5E3] text-[#6FBE45]' 
                    : 'bg-stone-50 text-[#C9A84C] border border-[#C9A84C]/30'
                }`}>
                  {item.status}
                </div>
                <p className="text-sm text-[#6B7280] group-hover:text-[#132A1D] transition-colors duration-300 pr-4">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Banner - Solid Supporting Green */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center bg-[#2F8D46] overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-10 relative z-10">
          <motion.div
             initial={{ opacity: 0, y: 12 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-12">
              Join the Unity Homes journey.
            </h2>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
              <Link
                to="/waitlist"
                className="w-full sm:w-auto inline-flex justify-center bg-[#6FBE45] text-white px-10 py-5 rounded-[18px] font-semibold text-lg hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:bg-[#5CA636] transition-all duration-200"
              >
                Join The Waitlist
              </Link>
              <Link
                to="/area-intelligence"
                className="w-full sm:w-auto inline-flex justify-center bg-transparent text-white border-2 border-white/80 px-10 py-5 rounded-[18px] font-semibold text-lg hover:-translate-y-0.5 active:translate-y-0 hover:bg-white hover:text-[#2F8D46] transition-all duration-200"
              >
                Explore Area Intelligence
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
