const fs = require('fs');

const content = `import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

const PROFESSIONALS = [
  {
    id: '01',
    roleId: 'property_lawyer',
    title: 'Property Lawyer',
    description: 'Verify titles, draft agreements, and ensure all transactions are legally sound and protected.',
  },
  {
    id: '02',
    roleId: 'licensed_surveyor',
    title: 'Licensed Surveyor',
    description: 'Confirm property boundaries, conduct structural surveys, and provide accurate topographic data.',
  },
  {
    id: '03',
    roleId: 'structural_engineer',
    title: 'Structural Engineer',
    description: 'Assess building integrity, review construction quality, and certify property safety standards.',
  }
];

export default function ProfessionalsPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col bg-white overflow-hidden"
    >
      {/* Premium Hero Banner - Solid Supporting Green */}
      <section className="relative text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#2F8D46] overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
          >
            <h4 className="text-sm font-bold tracking-widest uppercase text-white/90 mb-4">
              FOR REAL ESTATE PROFESSIONALS
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-8">
              The right expertise for better property decisions.
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-xl font-medium">
              Unity Homes is building a trusted professional network for people who need qualified help with property decisions.
            </p>
          </motion.div>
          
          {/* Animated Professional Network Visual */}
          <div className="flex justify-start lg:justify-end items-center h-64 lg:h-full relative">
            <svg viewBox="0 0 500 400" fill="none" className="w-full h-full max-w-lg overflow-visible">
              
              {/* Central Property Node */}
              <motion.rect x="230" y="180" width="40" height="40" rx="8" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} />
              <motion.path d="M250,150 L250,180" stroke="white" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.2 }} />
              <motion.path d="M220,180 L250,150 L280,180" stroke="white" strokeWidth="3" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.3 }} />
              
              {/* Connecting Lines */}
              <motion.line x1="250" y1="200" x2="100" y2="100" stroke="white" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.4 }} />
              <motion.line x1="250" y1="200" x2="400" y2="100" stroke="white" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.4 }} />
              <motion.line x1="250" y1="200" x2="250" y2="320" stroke="white" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.0, duration: 0.4 }} />
              
              {/* Professional Nodes */}
              <g>
                <motion.circle cx="100" cy="100" r="14" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, duration: 0.3 }} />
                <motion.text x="100" y="130" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>Property Lawyer</motion.text>
              </g>
              <g>
                <motion.circle cx="400" cy="100" r="14" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, duration: 0.3 }} />
                <motion.text x="400" y="130" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>Licensed Surveyor</motion.text>
              </g>
              <g>
                <motion.circle cx="250" cy="320" r="14" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, duration: 0.3 }} />
                <motion.text x="250" y="350" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>Structural Engineer</motion.text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h4 className="text-sm font-bold tracking-widest uppercase text-[#6B7280]">
            A TRUSTED PROFESSIONAL NETWORK
          </h4>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#132A1D] leading-tight">
            Expertise matters when property decisions matter.
          </h2>
          <p className="text-lg md:text-xl text-[#6B7280] leading-relaxed">
            Unity Homes is building a trusted professional network for people who need qualified help with property decisions.
          </p>
        </motion.div>
      </section>

      {/* Category Navigation */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto hide-scrollbar py-4 gap-6 md:gap-8 items-center justify-start lg:justify-center">
            {PROFESSIONALS.map((prof) => (
              <button
                key={prof.roleId}
                onClick={() => scrollToSection(\`prof-\${prof.roleId}\`)}
                className="whitespace-nowrap text-sm font-bold text-[#6B7280] hover:text-[#6FBE45] transition-colors focus:outline-none"
              >
                {prof.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Professional Sections */}
      <div className="py-12">
        {PROFESSIONALS.map((prof, idx) => {
          const isEven = idx % 2 === 1;
          
          return (
            <section 
              key={prof.roleId} 
              id={\`prof-\${prof.roleId}\`} 
              className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-gray-100 last:border-0"
            >
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                
                {/* Text Content */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4 }}
                  className={\`space-y-8 \${isEven ? 'lg:order-last' : 'lg:order-first'}\`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-[#6FBE45]">{prof.id}</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-extrabold text-[#132A1D]">
                    {prof.title}
                  </h3>
                  
                  <p className="text-lg md:text-xl text-[#6B7280] leading-relaxed">
                    {prof.description}
                  </p>
                  
                  <Link
                    to="/waitlist"
                    state={{ role: prof.roleId }}
                    className="inline-flex items-center justify-center bg-[#6FBE45] text-white px-8 py-4 rounded-[18px] font-bold text-lg hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    Join The Waitlist
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </motion.div>
                
                {/* Visual Area */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className={\`bg-[#F5FAF2] rounded-[32px] p-8 md:p-12 aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200 \${isEven ? 'lg:order-first' : 'lg:order-last'}\`}
                >
                  <ProfessionalVisual type={prof.roleId} />
                </motion.div>

              </div>
            </section>
          );
        })}
      </div>

      {/* Professional Trust Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F5FAF2] border-y border-[#6FBE45]/10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#132A1D] leading-tight">
              Built around professional accountability.
            </h2>
            <p className="text-lg text-[#6B7280] leading-relaxed">
              Expertise requires responsibility. We are building a network focused on qualified professionals who can provide accurate information and reliable service for every property transaction.
            </p>
            <h3 className="text-2xl font-bold text-[#132A1D] mt-8 pt-8 border-t border-gray-200">
              Professional participation starts with review.
            </h3>
            <p className="text-lg text-[#6B7280] leading-relaxed">
              Professionals provide relevant registration information and consent to eligibility and professional verification as part of the future review process.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-start space-y-6 lg:pl-12"
          >
            {[
              'PROVIDE DETAILS',
              'CONSENT',
              'REVIEW',
              'CONSIDERATION'
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-6 group">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.2, duration: 0.3 }}
                  className="w-10 h-10 rounded-full border-2 border-[#6FBE45] flex items-center justify-center text-xs font-bold text-[#6FBE45] bg-white group-hover:bg-[#6FBE45] group-hover:text-white transition-colors duration-300"
                >
                  0{idx + 1}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: (idx * 0.2) + 0.1, duration: 0.3 }}
                >
                  <h4 className="text-lg font-bold text-[#132A1D] tracking-wide">{step}</h4>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center bg-[#6FBE45] overflow-hidden">
        
        {/* Network CTA Visual */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex justify-center items-center overflow-hidden">
           <svg viewBox="0 0 1000 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <motion.line x1="300" y1="100" x2="500" y2="200" stroke="white" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.0 }} />
              <motion.line x1="700" y1="100" x2="500" y2="200" stroke="white" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.0 }} />
              <motion.line x1="500" y1="300" x2="500" y2="200" stroke="white" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.0 }} />
              
              <motion.circle cx="300" cy="100" r="10" fill="white" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
              <motion.circle cx="700" cy="100" r="10" fill="white" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
              <motion.circle cx="500" cy="300" r="10" fill="white" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
              <motion.rect x="480" y="180" width="40" height="40" rx="8" stroke="white" strokeWidth="3" fill="none" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} />
           </svg>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <motion.div
             initial={{ opacity: 0, y: 12 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-8">
              Build the future of real estate with Unity Homes.
            </h2>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto mb-12">
              Join the waitlist to stay connected with what Unity Homes is building for real estate professionals.
            </p>
            <Link
              to="/waitlist"
              className="inline-flex bg-white text-[#6FBE45] px-10 py-5 rounded-[18px] font-bold text-lg hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Join The Waitlist
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}

// Sub-components for professional visuals
function ProfessionalVisual({ type }: { type: string }) {
  if (type === 'property_lawyer') {
    return (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[200px] text-[#2F8D46]">
        {/* Document Outline */}
        <motion.rect x="40" y="30" width="80" height="100" rx="4" stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} />
        <motion.line x1="60" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} />
        <motion.line x1="60" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
        
        {/* Property Outline */}
        <motion.path d="M100,100 L100,80 L130,50 L160,80 L160,100" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.5 }} />
        <motion.path d="M100,100 L160,100 L160,160 L100,160 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 0.4 }} />
        
        {/* Connection & Check */}
        <motion.path d="M80,130 L100,130" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.0 }} />
        <motion.circle cx="160" cy="160" r="16" fill="white" stroke="currentColor" strokeWidth="3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.2 }} />
        <motion.path d="M152,160 L158,166 L168,154" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.4 }} />
      </svg>
    );
  }

  if (type === 'licensed_surveyor') {
    return (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[200px] text-[#2F8D46]">
        {/* Boundary Line */}
        <motion.path d="M40,160 L40,80 L100,40 L160,80 L160,160 Z" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
        
        {/* Measurement Points */}
        <motion.circle cx="40" cy="160" r="6" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
        <motion.circle cx="40" cy="80" r="6" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
        <motion.circle cx="100" cy="40" r="6" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
        <motion.circle cx="160" cy="80" r="6" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }} />
        <motion.circle cx="160" cy="160" r="6" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} />
        
        {/* Crosshair / Connection */}
        <motion.line x1="100" y1="80" x2="100" y2="120" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.0 }} />
        <motion.line x1="80" y1="100" x2="120" y2="100" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.0 }} />
        
        {/* Final Property Outline */}
        <motion.rect x="70" y="110" width="60" height="50" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.2 }} />
      </svg>
    );
  }

  if (type === 'structural_engineer') {
    return (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[200px] text-[#2F8D46]">
        {/* Building framework */}
        <motion.line x1="60" y1="160" x2="140" y2="160" stroke="currentColor" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.4 }} />
        <motion.line x1="70" y1="160" x2="70" y2="60" stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.4 }} />
        <motion.line x1="100" y1="160" x2="100" y2="40" stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.4 }} />
        <motion.line x1="130" y1="160" x2="130" y2="60" stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.4 }} />
        
        {/* Beams */}
        <motion.line x1="60" y1="120" x2="140" y2="120" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.3 }} />
        <motion.line x1="60" y1="80" x2="140" y2="80" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.7, duration: 0.3 }} />
        <motion.line x1="90" y1="40" x2="110" y2="40" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 0.2 }} />
        
        {/* Connection / Inspection Node */}
        <motion.circle cx="100" cy="100" r="16" fill="white" stroke="currentColor" strokeWidth="3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.0 }} />
        <motion.circle cx="100" cy="100" r="4" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.1 }} />
      </svg>
    );
  }

  return null;
}
`
fs.writeFileSync('src/pages/ProfessionalsPage.tsx', content);
console.log('ProfessionalsPage written');
