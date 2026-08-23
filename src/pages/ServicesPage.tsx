import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, ShieldCheck, Users, Briefcase, Wrench, Map, Home, Plus, X } from 'lucide-react';

const SERVICES = [
  {
    id: '01',
    key: 'listings',
    title: 'Property Listings',
    description: 'Discover and list property opportunities through a transparent digital platform.',
    buttonText: 'Explore Property',
    status: 'Coming Soon',
    isComingSoon: true
  },
  {
    id: '02',
    key: 'verification',
    title: 'Property Verification',
    description: 'Support safer property decisions through structured verification processes.',
    buttonText: 'Learn More',
    status: 'In Development',
    detail: 'We are structuring a process that will allow buyers and renters to request standardized verification reports. This will include documentation reviews, site inspections by qualified professionals, and history checks to minimize risk before closing transactions.'
  },
  {
    id: '03',
    key: 'professionals',
    title: 'Trusted Professionals',
    description: 'Connect with verified Property Lawyers, Licensed Surveyors, and Structural Engineers.',
    buttonText: 'Meet Professionals',
    linkTo: '/professionals',
    status: 'Available Now'
  },
  {
    id: '04',
    key: 'management',
    title: 'Property Management',
    description: 'Help landlords and PMCs manage tenants, rent, maintenance and property operations.',
    buttonText: 'Learn About Management',
    status: 'Available Now',
    detail: 'A comprehensive suite for tracking rent collection, maintenance requests, and tenant communications. Landlords and PMCs will have clear dashboards to understand portfolio health, while tenants will have transparent logs of their requests and payments.'
  },
  {
    id: '05',
    key: 'facilities',
    title: 'Facilities Management',
    description: 'Support property upkeep, service tracking and operational coordination.',
    buttonText: 'Learn About Facilities',
    status: 'In Progress',
    detail: 'Expanding beyond basic property management, this service tracks physical assets, schedules preventative maintenance, coordinates vendors, and logs service delivery standards for entire estates and commercial buildings.'
  },
  {
    id: '06',
    key: 'intelligence',
    title: 'Area Intelligence',
    description: 'Collect community information to help people understand neighbourhoods better.',
    buttonText: 'Contribute Area Insights',
    linkTo: '/area-intelligence',
    status: 'Available Now'
  },
  {
    id: '07',
    key: 'shortlets',
    title: 'Shortlet Services',
    description: 'Support verified shortlet listings, availability and safer booking experiences.',
    buttonText: 'Join Waitlist',
    linkTo: '/waitlist?role=shortlet_landlord',
    status: 'Coming Soon'
  }
];

export default function ServicesPage() {
  const [activeComingSoon, setActiveComingSoon] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setExpandedId(expandedId === id ? null : id);
  };

  const featuredService = SERVICES[0];
  const remainingServices = SERVICES.slice(1);

  return (
    <div className="min-h-screen flex flex-col animate-reveal-up bg-white">
      {/* Immersive Hero Banner */}
      <section className="relative text-white pt-40 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--color-brand-deep)]">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" 
            alt="Services Strategy" 
            className="w-full h-full object-cover animate-slow-pan opacity-60"
            aria-hidden="true"
          />
          {/* Solid color overlay, no gradient */}
          <div className="absolute inset-0 bg-[#0E2F1F]/80"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-6">
            <h4 className="text-sm font-bold tracking-widest uppercase text-white/80">
              OUR SERVICES
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1]">
              Real estate services built around better decisions.
            </h1>
          </div>
          <div className="lg:pl-12 space-y-8 lg:border-l border-white/20">
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Unity Homes is bringing property discovery, verification, professional access and property operations into a more transparent digital experience.
            </p>
            <div className="inline-flex flex-col">
              <span className="text-[var(--color-brand-fresh)] font-extrabold text-3xl">07</span>
              <span className="text-sm font-bold tracking-widest uppercase text-white">SERVICES</span>
              <span className="text-sm font-bold tracking-widest uppercase text-white/60 mt-1">ONE CONNECTED EXPERIENCE</span>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pt-24">
        {/* Featured Service: Property Listings */}
        <div className="mb-16">
          <div className="bg-white rounded-[32px] p-8 sm:p-12 lg:p-16 border border-[var(--color-border)] flex flex-col lg:flex-row gap-12 lg:gap-24 items-center relative overflow-hidden group hover:border-[var(--color-brand-medium)] transition-colors duration-500">
            <div className="flex-1 space-y-6 z-10 w-full">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm font-bold text-[var(--color-brand-medium)]">
                  {featuredService.id}
                </span>
                <div className="h-px bg-[var(--color-border)] flex-1"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[var(--color-brand-deep)] uppercase">
                {featuredService.title}
              </h2>
            <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
              {featuredService.description}
            </p>
            
            <div className="pt-6">
              <button
                onClick={() => setActiveComingSoon(featuredService.key)}
                className="inline-flex items-center text-[var(--color-brand-deep)] font-bold text-lg hover:text-[var(--color-brand-medium)] transition-colors group/btn"
              >
                {featuredService.buttonText}
                <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full bg-[var(--color-surface-soft)] rounded-[24px] min-h-[300px] flex items-center justify-center border border-[var(--color-border)] z-10 relative overflow-hidden">
             <Building className="w-24 h-24 text-[var(--color-brand-deep)] opacity-10 absolute -right-4 -bottom-4" />
             <div className="text-center px-6">
               <div className="inline-flex px-4 py-2 bg-white rounded-full border border-[var(--color-border)] text-sm font-bold text-[var(--color-brand-deep)] shadow-sm">
                 {featuredService.status}
               </div>
             </div>
          </div>

          {/* Coming Soon Panel Overlay */}
          <div className={`absolute inset-0 bg-white/95 backdrop-blur-sm z-20 p-8 md:p-16 flex flex-col justify-center items-center text-center transition-transform duration-500 ease-out ${activeComingSoon === featuredService.key ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-16 h-16 bg-[var(--color-surface-soft)] rounded-full flex items-center justify-center text-[var(--color-brand-medium)] mx-auto mb-8">
                <Building className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-[var(--color-brand-deep)] mb-4">Module In Development</h4>
              <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
                This feature is currently being built to ensure it meets our strict standards for transparency and data integrity.
              </p>
              <button
                onClick={() => setActiveComingSoon(null)}
                className="inline-flex border-2 border-[var(--color-brand-deep)] text-[var(--color-brand-deep)] px-8 py-3 rounded-[var(--radius-button)] font-bold hover:bg-[var(--color-brand-deep)] hover:text-white transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Remaining Services List */}
      <div className="border-t border-[var(--color-border)] mb-32">
        {remainingServices.map((service) => {
          const isExpanded = expandedId === service.key;
          
          return (
            <div key={service.key} className="border-b border-[var(--color-border)] group">
              <div className="py-8 lg:py-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-12 transition-colors duration-300">
                {/* ID & Title */}
                <div className="flex items-center gap-6 w-full md:w-1/3 shrink-0">
                  <span className="text-lg font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand-medium)] transition-colors duration-300">
                    {service.id}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-[var(--color-brand-deep)] uppercase group-hover:translate-x-1 transition-transform duration-300">
                    {service.title}
                  </h3>
                </div>
                
                {/* Description & Action */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  {service.key === 'professionals' ? (
                     <div className="flex-1 flex flex-col space-y-3">
                       <span className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-deep)] transition-colors inline-flex items-center">PROPERTY LAWYER <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-brand-medium)]">→</span></span>
                       <span className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-deep)] transition-colors inline-flex items-center">LICENSED SURVEYOR <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-brand-medium)]">→</span></span>
                       <span className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-deep)] transition-colors inline-flex items-center">STRUCTURAL ENGINEER <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-brand-medium)]">→</span></span>
                     </div>
                  ) : (
                    <p className="text-[var(--color-text-secondary)] leading-relaxed flex-1 max-w-xl">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="shrink-0 flex items-center gap-4">
                    {service.linkTo ? (
                      <Link
                        to={service.linkTo}
                        className="inline-flex items-center text-sm font-bold text-[var(--color-brand-deep)] hover:text-[var(--color-brand-medium)] transition-colors"
                      >
                        {service.buttonText}
                        <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    ) : service.detail ? (
                      <button
                        onClick={(e) => toggleExpand(service.key, e)}
                        className="inline-flex items-center text-sm font-bold text-[var(--color-brand-deep)] hover:text-[var(--color-brand-medium)] transition-colors focus:outline-none"
                      >
                        {service.buttonText}
                        <span className={`ml-2 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-1'}`}>→</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              
              {/* Expandable Detail */}
              {service.detail && (
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100 pb-10' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="md:pl-[calc(33.333%+3rem)]">
                    <div className="bg-[var(--color-surface-soft)] p-6 md:p-8 rounded-[20px] border border-[var(--color-border)]">
                       <p className="text-[var(--color-text-primary)] leading-relaxed mb-6">
                         {service.detail}
                       </p>
                       <div className="inline-flex px-3 py-1 rounded-full bg-white border border-[var(--color-border)] text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] shadow-sm">
                         Status: {service.status}
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      </div>

      {/* Waitlist CTA */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center rounded-[32px] mb-12 overflow-hidden bg-[var(--color-brand-deep)] max-w-7xl mx-auto w-full">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[32px]">
          <img 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09be1587?auto=format&fit=crop&q=80" 
            alt="Real Estate Action" 
            className="w-full h-full object-cover animate-slow-pan opacity-60"
            aria-hidden="true"
          />
          {/* Solid color overlay, no gradient */}
          <div className="absolute inset-0 bg-[#0E2F1F]/80"></div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="w-16 h-1 bg-white/30 mx-auto mb-8 rounded-full"></div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Ready to be part of what's next?
          </h2>
          <div className="pt-8">
            <Link
              to="/waitlist"
              className="inline-flex bg-white text-[var(--color-brand-deep)] px-10 py-5 rounded-[var(--radius-button)] font-bold text-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              Join The Waitlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
