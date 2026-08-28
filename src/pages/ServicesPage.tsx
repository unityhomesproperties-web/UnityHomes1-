import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { X } from 'lucide-react';

const SERVICES = [
  {
    id: '01',
    key: 'listings',
    title: 'Property Listings',
    description: 'Discover and list property opportunities through a transparent digital platform.',
    buttonText: 'Explore Property',
    status: 'In Development',
    actionType: 'panel',
  },
  {
    id: '02',
    key: 'verification',
    title: 'Property Verification',
    description: 'Support safer property decisions through structured verification processes.',
    buttonText: 'Learn More',
    status: 'In Development',
    actionType: 'detail',
    detail: 'Verification is a critical step in the property journey. We are building a structured workflow that brings clarity to property information, documentation, and history before you commit.',
  },
  {
    id: '03',
    key: 'professionals',
    title: 'Trusted Professionals',
    description: 'Connect with verified Property Lawyers, Licensed Surveyors, and Structural Engineers.',
    buttonText: 'Meet Professionals',
    status: 'In Development',
    actionType: 'link',
    linkTo: '/professionals',
  },
  {
    id: '04',
    key: 'management',
    title: 'Property Management',
    description: 'Help landlords and PMCs manage tenants, rent, maintenance and property operations.',
    buttonText: 'Learn About Management',
    status: 'In Development',
    actionType: 'detail',
    detail: 'We are developing tools that simplify the day-to-day operations of property management, providing landlords and PMCs with a centralized view of their portfolios, tenant requests, and financials.',
  },
  {
    id: '05',
    key: 'facilities',
    title: 'Facilities Management',
    description: 'Support property upkeep, service tracking and operational coordination.',
    buttonText: 'Learn About Facilities',
    status: 'In Development',
    actionType: 'detail',
    detail: 'Effective facilities management requires coordination. Our tools will help track maintenance schedules, manage service requests, and ensure properties remain in excellent condition.',
  },
  {
    id: '06',
    key: 'area-intelligence',
    title: 'Area Intelligence',
    description: 'Collect community information to help people understand neighbourhoods better.',
    buttonText: 'Contribute Area Insights',
    status: 'Available Now',
    actionType: 'link',
    linkTo: '/area-intelligence',
  },
  {
    id: '07',
    key: 'shortlet',
    title: 'Shortlet Services',
    description: 'Support verified shortlet listings, availability and safer booking experiences.',
    buttonText: 'Coming Soon — Join Waitlist',
    status: 'In Development',
    actionType: 'link',
    linkTo: '/waitlist',
    state: { role: 'shortlet_landlord' },
  }
];

export default function ServicesPage() {
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const yImage = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const yPattern = useTransform(scrollYProgress, [0, 1], ['0%', '5%']);

  const [activeComingSoon, setActiveComingSoon] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const handleAction = (service: any) => {
    if (service.actionType === 'panel') {
      setActiveComingSoon(service.key);
    } else if (service.actionType === 'detail') {
      setExpandedId(expandedId === service.key ? null : service.key);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* Premium Hero Banner - Architectural Refinement */}
      <section ref={heroRef} className="relative text-[#132A1D] pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" alt="Architecture Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#F5FAF2]/95" />
        </div>
        
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
          className="absolute inset-0 w-full h-full opacity-[0.03] md:opacity-[0.06] pointer-events-none z-0" 
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
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#132A1D] opacity-[0.07] blur-[100px] rounded-full pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h4 className="text-xs md:text-sm font-semibold tracking-widest uppercase text-[#132A1D]/90 mb-4">
              OUR SERVICES
            </h4>
            <h1 className="text-[36px] leading-[1.1] md:text-[42px] lg:text-[48px] font-semibold text-[#132A1D] mb-6 lg:mb-8 tracking-tight text-balance">
              Real estate services, connected around you.
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#132A1D]/90 leading-[1.6] max-w-xl font-normal">
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
                    stroke="#132A1D" strokeWidth="1" strokeDasharray="3 3" 
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
      </section>

      {/* Services Introduction */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <h4 className="text-sm font-semibold tracking-widest uppercase text-[#6B7280]">
            THE UNITY HOMES ECOSYSTEM
          </h4>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#132A1D] leading-tight">
            Built around the decisions people make before, during and after a property transaction.
          </h2>
          <p className="text-lg md:text-xl text-[#6B7280] leading-relaxed">
            Our ecosystem integrates verified information, trusted professionals, and seamless management tools to create a better real estate experience for everyone.
          </p>
        </motion.div>
      </section>

      {/* Service Navigation */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto hide-scrollbar py-4 gap-6 md:gap-8 items-center">
            {SERVICES.map((service) => (
              <button
                key={service.key}
                onClick={() => scrollToSection(`service-${service.key}`)}
                className="whitespace-nowrap text-sm font-semibold text-[#6B7280] hover:text-[#6FBE45] transition-colors focus:outline-none"
              >
                {service.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Sections */}
      <div className="py-12">
        {SERVICES.map((service, idx) => {
          const isEven = idx % 2 === 1;
          
          return (
            <section 
              key={service.key} 
              id={`service-${service.key}`} 
              className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-gray-100 last:border-0"
            >
              <div className={`grid lg:grid-cols-2 gap-12 lg:gap-24 items-center ${isEven ? 'lg:rtl' : ''}`}>
                
                {/* Text Content */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4 }}
                  className={`${isEven ? 'lg:ltr' : ''} space-y-8`}
                  style={isEven ? { direction: 'ltr' } : {}}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-[#6FBE45]">{service.id}</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-3xl md:text-4xl font-semibold text-[#132A1D]">
                      {service.title}
                    </h3>
                    <div className="inline-flex px-3 py-1 rounded-full bg-[#F5FAF2] border border-[#6FBE45]/30 text-xs font-semibold uppercase tracking-wider text-[#132A1D]">
                      {service.status}
                    </div>
                  </div>
                  
                  <p className="text-lg md:text-xl text-[#6B7280] leading-relaxed">
                    {service.description}
                  </p>
                  
                  {service.actionType === 'link' ? (
                    <Link
                      to={service.linkTo as string}
                      state={service.state}
                      className="inline-flex items-center justify-center bg-[#6FBE45] text-white px-8 py-4 rounded-[18px] font-semibold text-lg hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md transition-all duration-200 group"
                    >
                      {service.buttonText}
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleAction(service)}
                      className="inline-flex items-center justify-center bg-[#6FBE45] text-white px-8 py-4 rounded-[18px] font-semibold text-lg hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md transition-all duration-200 group focus:outline-none"
                    >
                      {service.buttonText}
                      {service.actionType === 'detail' && expandedId === service.key ? (
                        <span className="ml-2 rotate-90 transition-transform">→</span>
                      ) : (
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      )}
                    </button>
                  )}

                  {/* Expandable Detail */}
                  {service.actionType === 'detail' && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedId === service.key ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="bg-[#F5FAF2] p-6 rounded-[20px] border border-gray-100">
                        <p className="text-[#132A1D] leading-relaxed">
                          {service.detail}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
                
                {/* Visual Area */}
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5 }}
                  className={`${isEven ? 'lg:ltr' : ''} bg-[#F5FAF2] rounded-[32px] p-8 md:p-12 aspect-square flex items-center justify-center border border-gray-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-200`}
                  style={isEven ? { direction: 'ltr' } : {}}
                >
                  <ServiceVisual type={service.key} />
                </motion.div>

              </div>
            </section>
          );
        })}
      </div>

      {/* Coming Soon Panel Modal */}
      <AnimatePresence>
        {activeComingSoon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-[#132A1D]/80" onClick={() => setActiveComingSoon(null)}></div>
            <motion.div 
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-lg rounded-[32px] p-8 md:p-12 shadow-lg relative z-10 flex flex-col items-center text-center"
            >
              <button 
                onClick={() => setActiveComingSoon(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none"
              >
                <X strokeWidth={2.5} className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-[#F5FAF2] rounded-full flex items-center justify-center mb-6 border border-[#6FBE45]/20">
                <div className="w-8 h-8 bg-[#6FBE45] rounded-full"></div>
              </div>
              
              <h3 className="text-2xl font-semibold text-[#132A1D] mb-4">Coming Soon</h3>
              <p className="text-[#6B7280] leading-relaxed mb-8">
                This feature is currently in development. We are building a structured workflow that brings clarity and trust to property information before it goes live.
              </p>
              
              <Link
                to="/waitlist"
                className="inline-flex items-center justify-center bg-[#6FBE45] text-white px-8 py-4 rounded-[18px] font-semibold text-lg hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all duration-200 w-full"
              >
                Join The Waitlist
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final CTA */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" alt="Architecture Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#F5FAF2]/95" />
        </div>
        
        {/* Abstract Ecosystem CTA Visual */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none flex justify-center items-center overflow-hidden">
           <svg viewBox="0 0 1000 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <motion.path 
                d="M-100,200 L200,200 L300,100 L500,100 L600,200 L1100,200"
                stroke="#132A1D" strokeWidth="2" fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.circle cx="500" cy="100" r="8" fill="white" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} />
              <motion.circle cx="200" cy="200" r="8" fill="white" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
              <motion.circle cx="600" cy="200" r="8" fill="white" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.0 }} />
           </svg>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <motion.div
             initial={{ opacity: 0, y: 12 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.4 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#132A1D] leading-tight mb-8">
              Be part of the Unity Homes journey.
            </h2>
            <p className="text-lg md:text-xl text-[#132A1D]/90 leading-relaxed max-w-2xl mx-auto mb-12">
              Join the waitlist and stay connected as Unity Homes continues building its real estate technology platform.
            </p>
            <Link
              to="/waitlist"
              className="inline-flex bg-[#132A1D] text-[#2F8D46] px-10 py-5 rounded-[18px] font-semibold text-lg hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md transition-all duration-200"
            >
              Join The Waitlist
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Sub-components for service visuals
function ServiceVisual({ type }: { type: string }) {
  if (type === 'listings') {
    return (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[200px] text-[#2F8D46]">
        {/* Search Field */}
        <motion.rect x="30" y="40" width="140" height="24" rx="12" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} />
        {/* Property Outline */}
        <motion.path d="M50,140 L50,90 L100,50 L150,90 L150,140 Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
        <motion.rect x="85" y="110" width="30" height="30" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
        {/* Filter Indicator */}
        <motion.circle cx="150" cy="52" r="8" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} />
      </svg>
    );
  }
  
  if (type === 'verification') {
    return (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[200px] text-[#2F8D46]">
        {/* Info */}
        <motion.rect x="40" y="30" width="120" height="30" rx="8" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} />
        <motion.path d="M100,60 L100,80" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} />
        
        {/* Docs */}
        <motion.rect x="60" y="80" width="80" height="40" rx="8" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.3 }} />
        <motion.line x1="80" y1="95" x2="120" y2="95" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
        <motion.line x1="80" y1="105" x2="110" y2="105" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
        <motion.path d="M100,120 L100,140" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
        
        {/* Verify */}
        <motion.circle cx="100" cy="160" r="20" stroke="currentColor" strokeWidth="3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} />
        <motion.path d="M90,160 L98,168 L112,152" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.0 }} />
      </svg>
    );
  }

  if (type === 'professionals') {
    return (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[200px] text-[#2F8D46]">
        <motion.circle cx="100" cy="100" r="24" stroke="currentColor" strokeWidth="4" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} />
        <motion.rect x="90" y="90" width="20" height="20" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} />
        
        <motion.line x1="100" y1="76" x2="100" y2="40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
        <motion.circle cx="100" cy="30" r="10" stroke="currentColor" strokeWidth="3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
        
        <motion.line x1="80" y1="112" x2="40" y2="150" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
        <motion.circle cx="34" cy="156" r="10" stroke="currentColor" strokeWidth="3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
        
        <motion.line x1="120" y1="112" x2="160" y2="150" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
        <motion.circle cx="166" cy="156" r="10" stroke="currentColor" strokeWidth="3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
      </svg>
    );
  }

  if (type === 'management') {
    return (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[200px] text-[#2F8D46]">
        {/* Property */}
        <motion.rect x="80" y="30" width="40" height="40" stroke="currentColor" strokeWidth="3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} />
        <motion.path d="M100,70 L100,100" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} />
        
        {/* Tenant & Maint */}
        <motion.rect x="40" y="100" width="120" height="40" rx="8" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
        <motion.line x1="100" y1="100" x2="100" y2="140" stroke="currentColor" strokeWidth="2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
        
        <motion.path d="M100,140 L100,160" stroke="currentColor" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
        
        {/* Mgmt Node */}
        <motion.circle cx="100" cy="170" r="10" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }} />
      </svg>
    );
  }

  if (type === 'facilities') {
    return (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[200px] text-[#2F8D46]">
        <motion.path d="M60,160 L60,60 L140,60 L140,160 Z" stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} />
        <motion.line x1="40" y1="160" x2="160" y2="160" stroke="currentColor" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} />
        
        {/* Grid lines inside building */}
        <motion.line x1="60" y1="93" x2="140" y2="93" stroke="currentColor" strokeWidth="2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
        <motion.line x1="60" y1="126" x2="140" y2="126" stroke="currentColor" strokeWidth="2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
        <motion.line x1="100" y1="60" x2="100" y2="160" stroke="currentColor" strokeWidth="2" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
        
        {/* Gear/Service Indicator */}
        <motion.circle cx="100" cy="110" r="14" fill="white" stroke="currentColor" strokeWidth="3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }} />
        <motion.circle cx="100" cy="110" r="4" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.9 }} />
      </svg>
    );
  }

  if (type === 'area-intelligence') {
    return (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[200px] text-[#2F8D46]">
        {/* Houses */}
        <motion.path d="M40,120 L40,90 L60,70 L80,90 L80,120 Z" stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} />
        <motion.path d="M120,120 L120,90 L140,70 L160,90 L160,120 Z" stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} />
        <motion.path d="M80,160 L80,130 L100,110 L120,130 L120,160 Z" stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} />
        
        {/* Connections */}
        <motion.path d="M60,120 L100,160" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
        <motion.path d="M140,120 L100,160" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
        <motion.path d="M60,70 L140,70" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
        
        {/* Central Intelligence Point */}
        <motion.circle cx="100" cy="100" r="8" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} />
      </svg>
    );
  }

  if (type === 'shortlet') {
    return (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full max-w-[200px] text-[#2F8D46]">
        {/* Calendar/Booking */}
        <motion.rect x="50" y="50" width="100" height="110" rx="8" stroke="currentColor" strokeWidth="3" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} />
        <motion.line x1="50" y1="80" x2="150" y2="80" stroke="currentColor" strokeWidth="3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} />
        
        {/* Rings */}
        <motion.line x1="75" y1="40" x2="75" y2="60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} />
        <motion.line x1="125" y1="40" x2="125" y2="60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} />
        
        {/* Availability / Property dots */}
        <motion.rect x="70" y="100" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} />
        <motion.rect x="110" y="100" width="20" height="20" rx="4" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7 }} />
        <motion.rect x="70" y="130" width="20" height="20" rx="4" fill="currentColor" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }} />
        
        {/* Verify overlay */}
        <motion.circle cx="150" cy="160" r="16" fill="white" stroke="currentColor" strokeWidth="3" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.0 }} />
        <motion.path d="M142,160 L148,166 L158,154" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.2 }} />
      </svg>
    );
  }

  return null;
}
