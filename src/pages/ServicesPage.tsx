import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, ShieldCheck, Users, Briefcase, Wrench, Map, Home } from 'lucide-react';

const SERVICES = [
  {
    id: 'listings',
    icon: Building,
    title: 'Property Listings',
    description: 'Discover and list property opportunities through a transparent digital platform.',
    buttonType: 'coming-soon',
    buttonText: 'Explore Property',
  },
  {
    id: 'verification',
    icon: ShieldCheck,
    title: 'Property Verification',
    description: 'Support safer property decisions through structured verification processes.',
    buttonType: 'scroll',
    buttonText: 'Learn More',
    targetId: 'verification-details'
  },
  {
    id: 'professionals',
    icon: Users,
    title: 'Trusted Professionals',
    description: 'Connect with verified Property Lawyers, Licensed Surveyors, and Structural Engineers.',
    buttonType: 'link',
    buttonText: 'Meet Professionals',
    linkTo: '/professionals'
  },
  {
    id: 'management',
    icon: Briefcase,
    title: 'Property Management',
    description: 'Help landlords and PMCs manage tenants, rent, maintenance and property operations.',
    buttonType: 'scroll',
    buttonText: 'Learn About Management',
    targetId: 'management-details'
  },
  {
    id: 'facilities',
    icon: Wrench,
    title: 'Facilities Management',
    description: 'Support property upkeep, service tracking and operational coordination.',
    buttonType: 'scroll',
    buttonText: 'Learn About Facilities',
    targetId: 'facilities-details'
  },
  {
    id: 'intelligence',
    icon: Map,
    title: 'Area Intelligence',
    description: 'Collect community information to help people understand neighbourhoods better.',
    buttonType: 'link',
    buttonText: 'Contribute Area Insights',
    linkTo: '/area-intelligence'
  },
  {
    id: 'shortlets',
    icon: Home,
    title: 'Shortlet Services',
    description: 'Support verified shortlet listings, availability and safer booking experiences.',
    buttonType: 'link',
    buttonText: 'Coming Soon, Join Waitlist',
    linkTo: '/waitlist?role=shortlet_landlord'
  }
];

export default function ServicesPage() {
  const [activeComingSoon, setActiveComingSoon] = useState<string | null>(null);

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen animate-fade-in relative">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[var(--color-brand-deep)] mb-6">
          Our Services
        </h1>
        <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          Comprehensive real estate infrastructure designed for transparency and trust.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        {SERVICES.map((service) => (
          <div key={service.id} className="bg-white p-8 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="w-14 h-14 bg-[var(--color-surface-soft)] rounded-full flex items-center justify-center text-[var(--color-brand-fresh)] mb-6">
              <service.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">{service.title}</h3>
            <p className="text-[var(--color-text-secondary)] mb-8 flex-1 leading-relaxed">
              {service.description}
            </p>
            
            {service.buttonType === 'link' && service.linkTo && (
              <Link
                to={service.linkTo}
                className="w-full text-center bg-[var(--color-surface-light)] text-[var(--color-brand-deep)] border border-[var(--color-border)] px-6 py-3 rounded-[var(--radius-button)] font-semibold hover:bg-[var(--color-brand-deep)] hover:text-white transition-colors min-h-[48px] flex items-center justify-center"
              >
                {service.buttonText}
              </Link>
            )}

            {service.buttonType === 'scroll' && service.targetId && (
              <a
                href={`#${service.targetId}`}
                onClick={(e) => scrollToSection(e, service.targetId as string)}
                className="w-full text-center bg-[var(--color-surface-light)] text-[var(--color-brand-deep)] border border-[var(--color-border)] px-6 py-3 rounded-[var(--radius-button)] font-semibold hover:bg-[var(--color-brand-deep)] hover:text-white transition-colors min-h-[48px] flex items-center justify-center"
              >
                {service.buttonText}
              </a>
            )}

            {service.buttonType === 'coming-soon' && (
              <button
                onClick={() => setActiveComingSoon(service.id)}
                className="w-full text-center bg-[var(--color-surface-light)] text-[var(--color-brand-deep)] border border-[var(--color-border)] px-6 py-3 rounded-[var(--radius-button)] font-semibold hover:bg-[var(--color-brand-deep)] hover:text-white transition-colors min-h-[48px] flex items-center justify-center"
              >
                {service.buttonText}
              </button>
            )}

            {/* Coming Soon Panel Overlay */}
            <div className={`absolute inset-0 bg-[var(--color-brand-deep)] text-white p-8 flex flex-col justify-center items-center text-center transition-transform duration-300 ${activeComingSoon === service.id ? 'translate-y-0' : 'translate-y-full'}`}>
              <h4 className="text-xl font-bold mb-4">Module In Development</h4>
              <p className="text-white/80 mb-6">
                This feature is currently being built to ensure it meets our strict standards for transparency and data integrity.
              </p>
              <button
                onClick={() => setActiveComingSoon(null)}
                className="text-[var(--color-brand-fresh)] font-semibold hover:underline"
              >
                Close Panel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Sections */}
      <div className="space-y-16 max-w-4xl mx-auto border-t border-[var(--color-border)] pt-16">
        <section id="verification-details" className="scroll-mt-32">
          <h2 className="text-3xl font-bold text-[var(--color-brand-deep)] mb-6">Property Verification details</h2>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-4">
            We are structuring a process that will allow buyers and renters to request standardized verification reports. This will include documentation reviews, site inspections by qualified professionals, and history checks to minimize risk before closing transactions.
          </p>
          <div className="inline-flex px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--color-surface-light)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)]">
            Status: Framework In Development
          </div>
        </section>

        <section id="management-details" className="scroll-mt-32">
          <h2 className="text-3xl font-bold text-[var(--color-brand-deep)] mb-6">Property Management workflows</h2>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-4">
            A comprehensive suite for tracking rent collection, maintenance requests, and tenant communications. Landlords and PMCs will have clear dashboards to understand portfolio health, while tenants will have transparent logs of their requests and payments.
          </p>
          <div className="inline-flex px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--color-surface-light)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)]">
            Status: Core Modules Available Now
          </div>
        </section>

        <section id="facilities-details" className="scroll-mt-32">
          <h2 className="text-3xl font-bold text-[var(--color-brand-deep)] mb-6">Facilities Management integrations</h2>
          <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-4">
            Expanding beyond basic property management, this service tracks physical assets, schedules preventative maintenance, coordinates vendors, and logs service delivery standards for entire estates and commercial buildings.
          </p>
          <div className="inline-flex px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--color-surface-light)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)]">
            Status: Architecture In Progress
          </div>
        </section>
      </div>
    </div>
  );
}
