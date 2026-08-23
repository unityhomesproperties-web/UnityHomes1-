import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LawyerVisual = ({ isHovered }: { isHovered: boolean }) => (
  <svg viewBox="0 0 100 100" className="w-10 h-10" aria-hidden="true">
    <rect x="25" y="15" width="50" height="70" rx="4" fill="none" stroke="currentColor" strokeWidth="4" className={`transition-colors duration-300 ${isHovered ? 'text-[var(--color-brand-medium)]' : 'text-[var(--color-border)]'}`} />
    <path d="M 40 35 L 60 35 M 40 50 L 60 50 M 40 65 L 50 65" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className={`transition-all duration-300 ease-in-out ${isHovered ? 'text-[var(--color-brand-medium)]' : 'text-[var(--color-border)]'}`} style={{ strokeDasharray: 100, strokeDashoffset: isHovered ? 0 : 100 }} />
  </svg>
);

const SurveyorVisual = ({ isHovered }: { isHovered: boolean }) => (
  <svg viewBox="0 0 100 100" className="w-10 h-10" aria-hidden="true">
    <path d="M 20 50 L 50 20 L 80 50 L 50 80 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" className={`transition-all duration-300 ease-in-out ${isHovered ? 'text-[var(--color-brand-medium)]' : 'text-[var(--color-border)]'}`} style={{ strokeDasharray: 200, strokeDashoffset: isHovered ? 0 : 200 }} />
    <path d="M 50 20 L 50 80 M 20 50 L 80 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className={`transition-colors duration-300 ${isHovered ? 'text-[var(--color-brand-medium)]' : 'text-[var(--color-border)]'}`} />
    <circle cx="50" cy="50" r="6" fill="currentColor" className={`transition-colors duration-300 ${isHovered ? 'text-[var(--color-brand-medium)]' : 'text-[var(--color-border)]'}`} />
  </svg>
);

const EngineerVisual = ({ isHovered }: { isHovered: boolean }) => (
  <svg viewBox="0 0 100 100" className="w-10 h-10" aria-hidden="true">
    <path d="M 15 85 L 15 25 L 50 10 L 85 25 L 85 85" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" className={`transition-colors duration-300 ${isHovered ? 'text-[var(--color-brand-medium)]' : 'text-[var(--color-border)]'}`} />
    <path d="M 15 25 L 85 25 M 50 10 L 50 85 M 15 85 L 50 25 L 85 85" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" className={`transition-all duration-300 ease-in-out ${isHovered ? 'text-[var(--color-brand-medium)]' : 'text-[var(--color-border)]'}`} style={{ strokeDasharray: 200, strokeDashoffset: isHovered ? 0 : 200 }} />
  </svg>
);

const PROFESSIONALS = [
  {
    id: '01',
    roleId: 'property_lawyer',
    title: 'Property Lawyer',
    description: 'Verify titles, draft agreements, and ensure all transactions are legally sound and protected.',
    visual: LawyerVisual
  },
  {
    id: '02',
    roleId: 'licensed_surveyor',
    title: 'Licensed Surveyor',
    description: 'Confirm property boundaries, conduct structural surveys, and provide accurate topographic data.',
    visual: SurveyorVisual
  },
  {
    id: '03',
    roleId: 'structural_engineer',
    title: 'Structural Engineer',
    description: 'Assess building integrity, review construction quality, and certify property safety standards.',
    visual: EngineerVisual
  }
];

const PROCESS_STEPS = [
  'JOIN',
  'SUBMIT DETAILS',
  'ELIGIBILITY REVIEW',
  'PROFESSIONAL VERIFICATION',
  'CONSIDERATION'
];

const ProfessionalRow = ({ prof }: { prof: any }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="border-b border-[var(--color-border)] group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Accent line expansion */}
      <div className={`absolute bottom-[-1px] left-0 h-px bg-[var(--color-brand-medium)] transition-all duration-500 ease-out z-10 ${isHovered ? 'w-full' : 'w-0'}`}></div>
      
      <div className="py-10 md:py-14 flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
        {/* Number & Title */}
        <div className="flex items-center gap-6 md:gap-8 w-full md:w-5/12 shrink-0">
          <span className={`text-xl font-bold transition-transform duration-300 ${isHovered ? 'text-[var(--color-brand-medium)] -translate-y-1' : 'text-[var(--color-text-secondary)]'}`}>
            {prof.id}
          </span>
          <h3 className={`text-2xl md:text-3xl font-extrabold uppercase tracking-wide transition-colors duration-300 ${isHovered ? 'text-[var(--color-brand-fresh)]' : 'text-[var(--color-brand-deep)]'}`}>
            {prof.title}
          </h3>
        </div>
        
        {/* Description & Action */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-8 md:gap-12 justify-between">
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-md">
            {prof.description}
          </p>
          
          <div className="shrink-0 flex items-center gap-6">
            {/* Visual Icon Box */}
            <div className="hidden lg:flex w-20 h-20 items-center justify-center bg-[var(--color-surface-soft)] rounded-2xl border border-[var(--color-border)]">
              <prof.visual isHovered={isHovered} />
            </div>
            
            <Link
              to={`/waitlist?role=${prof.roleId}`}
              className="inline-flex items-center text-base font-bold text-[var(--color-brand-deep)] hover:text-[var(--color-brand-medium)] transition-colors py-2 min-h-[48px]"
            >
              <span className="border-b-2 border-transparent group-hover:border-[var(--color-brand-medium)] pb-1 transition-colors duration-300">
                Join The Waitlist
              </span>
              <span className={`ml-3 transition-transform duration-300 ${isHovered ? 'translate-x-2' : ''}`}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfessionalsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <style>{`
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
        .animate-draw {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: drawPath 2s ease-out forwards;
        }
        .animate-draw-delayed {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: drawPath 2.5s ease-out forwards 0.5s;
        }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        
        .node-pulse {
          animation: pulseNode 4s infinite alternate ease-in-out;
        }
        @keyframes pulseNode {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>

      {/* Hero Banner */}
      <section className="relative text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--color-brand-deep)]">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
            alt="Professionals" 
            className="w-full h-full object-cover animate-slow-pan opacity-60"
            aria-hidden="true"
          />
          {/* Solid color overlay, no gradient */}
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          <div className="space-y-8 max-w-xl animate-reveal-up">
            <div className="flex items-center gap-4">
              <h4 className="text-sm font-bold tracking-widest uppercase text-white/80">
                FOR REAL ESTATE PROFESSIONALS
              </h4>
              <div className="h-px bg-white/30 flex-1 max-w-[60px]"></div>
              <span className="text-sm font-bold text-[#C9A84C]">03</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1]">
              The right expertise<br />for better property decisions.
            </h1>
            <p className="text-lg text-white/90 leading-relaxed max-w-lg">
              Unity Homes is building a trusted professional network for people who need qualified help with property decisions.
            </p>
            <div className="pt-4">
              <Link
                to="/waitlist"
                className="inline-flex bg-white text-[#2F8D46] px-8 py-4 rounded-[var(--radius-button)] font-bold text-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              >
                Join The Waitlist
              </Link>
            </div>
          </div>
          
          <div className="relative h-64 md:h-96 w-full flex items-center justify-center animate-fade-in opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
             {/* Animated Nodes Component */}
             <svg viewBox="0 0 400 400" className="w-full h-full max-w-[400px]">
               {/* Connecting Lines */}
               <path d="M 100 250 L 200 100 L 300 250 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
               <path d="M 100 250 L 200 100 L 300 250 Z" fill="none" stroke="#C9A84C" strokeWidth="2" className="animate-draw" strokeLinejoin="round" />
               
               {/* Nodes */}
               <g className="node-pulse" style={{ animationDelay: '0s', transformOrigin: '100px 250px' }}>
                 <circle cx="100" cy="250" r="6" fill="white" />
                 <circle cx="100" cy="250" r="16" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
               </g>
               <g className="node-pulse" style={{ animationDelay: '1s', transformOrigin: '200px 100px' }}>
                 <circle cx="200" cy="100" r="6" fill="white" />
                 <circle cx="200" cy="100" r="16" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
               </g>
               <g className="node-pulse" style={{ animationDelay: '2s', transformOrigin: '300px 250px' }}>
                 <circle cx="300" cy="250" r="6" fill="white" />
                 <circle cx="300" cy="250" r="16" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
               </g>
               
               {/* Labels */}
               <text x="100" y="285" fill="white" fontSize="12" fontWeight="700" textAnchor="middle" className="tracking-widest opacity-0 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>LAW</text>
               <text x="200" y="70" fill="white" fontSize="12" fontWeight="700" textAnchor="middle" className="tracking-widest opacity-0 animate-fade-in" style={{ animationDelay: '1.5s', animationFillMode: 'forwards' }}>STRUCTURE</text>
               <text x="300" y="285" fill="white" fontSize="12" fontWeight="700" textAnchor="middle" className="tracking-widest opacity-0 animate-fade-in" style={{ animationDelay: '2.5s', animationFillMode: 'forwards' }}>SURVEY</text>
             </svg>
          </div>
        </div>
      </section>

      {/* Professional Network Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl mb-16 md:mb-24">
          <h4 className="text-sm font-bold tracking-widest uppercase text-[var(--color-brand-medium)] mb-6">
            PROFESSIONAL NETWORK
          </h4>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--color-brand-deep)] mb-8 leading-tight">
            Three disciplines. One trusted ecosystem.
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
            Unity Homes is building access to qualified expertise across property law, surveying and structural engineering.
          </p>
        </div>

        <div className="border-t border-[var(--color-border)] mb-24">
          {PROFESSIONALS.map((prof) => (
            <ProfessionalRow key={prof.roleId} prof={prof} />
          ))}
        </div>

        {/* Process Section */}
        <div className="pt-12">
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-[var(--color-brand-deep)] mb-4">What happens next</h3>
            <p className="text-[var(--color-text-secondary)]">The path to joining the network.</p>
          </div>
          
          <div className="relative">
            {/* Desktop Line */}
            <div className="hidden lg:block absolute top-[15px] left-[15px] right-[15px] h-px bg-[var(--color-border)]"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4 relative">
              {PROCESS_STEPS.map((step, idx) => (
                <div key={idx} className="relative flex lg:flex-col items-start lg:items-center gap-6 lg:gap-4 group cursor-default">
                   {/* Mobile Line */}
                   {idx < PROCESS_STEPS.length - 1 && (
                     <div className="lg:hidden absolute left-[15px] top-[30px] bottom-[-30px] w-px bg-[var(--color-border)]"></div>
                   )}
                   
                   <div className="w-[30px] h-[30px] shrink-0 rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-brand-medium)] flex items-center justify-center text-[10px] font-bold text-[var(--color-brand-deep)] relative z-10 transition-colors duration-300 group-hover:bg-[var(--color-brand-medium)] group-hover:text-white">
                     0{idx + 1}
                   </div>
                   
                   <div className="lg:text-center pt-1 lg:pt-0 lg:mt-2">
                     <h4 className="text-[11px] font-bold text-[var(--color-brand-deep)] uppercase tracking-wider group-hover:text-[var(--color-brand-medium)] transition-colors duration-300">{step}</h4>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden mb-12 rounded-[32px] mx-4 sm:mx-6 lg:mx-8 bg-[var(--color-brand-deep)]">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[32px]">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" 
            alt="Real Estate" 
            className="w-full h-full object-cover animate-slow-pan opacity-60"
            aria-hidden="true"
          />
          {/* Solid color overlay, no gradient */}
        </div>

        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
          <svg className="w-full h-full max-w-3xl ml-auto" viewBox="0 0 400 200" preserveAspectRatio="xMaxYMax meet">
            <path d="M 50 200 L 50 120 L 100 120 L 100 50 L 200 50 L 200 80 L 280 80 L 280 200" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" className="animate-draw-delayed" />
            <path d="M 70 140 L 80 140 M 70 160 L 80 160 M 70 180 L 80 180" fill="none" stroke="white" strokeWidth="1.5" className="animate-draw-delayed delay-300" />
            <path d="M 120 70 L 180 70 M 120 90 L 180 90 M 120 110 L 180 110" fill="none" stroke="white" strokeWidth="1.5" className="animate-draw-delayed delay-400" />
          </svg>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <div className="w-16 h-1 bg-white/30 mx-auto mb-8 rounded-full"></div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Build the future of real estate with Unity Homes.
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Join the waitlist as a qualified professional.
          </p>
          <div className="pt-8">
            <Link
              to="/waitlist"
              className="inline-flex bg-white text-[#2F8D46] px-10 py-5 rounded-[var(--radius-button)] font-bold text-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              Join The Waitlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

