import React from 'react';
import { Link } from 'react-router-dom';
import { Building, ShieldCheck, Users, Briefcase, Wrench, Map } from 'lucide-react';

const SERVICES_PREVIEW = [
  {
    icon: Building,
    title: 'Property Listings',
    description: 'Discover and list property opportunities through a transparent digital platform.',
    linkText: 'Explore Property',
    linkTo: '/services'
  },
  {
    icon: ShieldCheck,
    title: 'Property Verification',
    description: 'Support safer property decisions through structured verification processes.',
    linkText: 'Learn More',
    linkTo: '/services'
  },
  {
    icon: Users,
    title: 'Trusted Professionals',
    description: 'Connect with verified Property Lawyers, Licensed Surveyors, and Structural Engineers.',
    linkText: 'Meet Professionals',
    linkTo: '/professionals'
  },
  {
    icon: Briefcase,
    title: 'Property Management',
    description: 'Help landlords and PMCs manage tenants, rent, maintenance and property operations.',
    linkText: 'Learn About Management',
    linkTo: '/services'
  },
  {
    icon: Wrench,
    title: 'Facilities Management',
    description: 'Support property upkeep, service tracking and operational coordination.',
    linkText: 'Learn About Facilities',
    linkTo: '/services'
  },
  {
    icon: Map,
    title: 'Area Intelligence',
    description: 'Collect community information to help people understand neighbourhoods better.',
    linkText: 'Contribute Area Insights',
    linkTo: '/area-intelligence'
  }
];

const FAQS = [
  {
    question: 'How do you verify properties and professionals?',
    answer: 'We use a multi-step verification process checking credentials, structural reports, and legal documentation.',
    status: 'In Development'
  },
  {
    question: 'Can I list a property without an agent?',
    answer: 'Yes, direct landlord listings are supported subject to our standard verification requirements.',
    status: 'Coming Soon'
  },
  {
    question: 'How does Area Intelligence work?',
    answer: 'Community members can submit factual insights about neighborhoods, which are aggregated to help others make informed decisions.',
    status: 'Available Now'
  }
];

export default function HomePage() {
  const scrollToServices = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('services-preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-[var(--color-primary-green)] text-[var(--color-white)] pt-24 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-slide-up">
          <div className="inline-flex items-center px-4 py-2 rounded-[var(--radius-pill)] border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.05)] text-sm font-medium mb-8">
            Nigeria-focused real estate technology.
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Building a Safer, More Transparent Real Estate Experience for Nigeria.
          </h1>
          <p className="text-lg md:text-xl text-[rgba(255,255,255,0.8)] mb-10 max-w-3xl mx-auto leading-relaxed">
            Unity Homes and Properties Ltd is building technology that makes property discovery, trusted professional access, property management and real estate decision-making simpler and more transparent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/waitlist"
              className="w-full sm:w-auto bg-[var(--color-accent-gold)] text-[var(--color-primary-green)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-lg hover:opacity-90 transition-opacity min-h-[48px] flex items-center justify-center"
            >
              Join The Waitlist
            </Link>
            <a
              href="#services-preview"
              onClick={scrollToServices}
              className="w-full sm:w-auto bg-transparent border-2 border-[var(--color-white)] text-[var(--color-white)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-lg hover:bg-[rgba(255,255,255,0.1)] transition-colors min-h-[48px] flex items-center justify-center"
            >
              Explore Unity Homes
            </a>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section id="services-preview" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[var(--color-primary-green)] mb-4">Our Services</h2>
          <p className="text-[var(--color-secondary-text)] max-w-2xl mx-auto text-lg">
            A comprehensive suite of tools designed to bring trust and efficiency to the Nigerian real estate market.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES_PREVIEW.map((service, idx) => (
            <div key={idx} className="bg-[var(--color-white)] p-8 rounded-[var(--radius-card)] border border-[var(--color-border)] flex flex-col h-full hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[var(--color-background)] rounded-full flex items-center justify-center text-[var(--color-primary-green)] mb-6">
                <service.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-primary-text)] mb-3">{service.title}</h3>
              <p className="text-[var(--color-secondary-text)] mb-8 flex-1">
                {service.description}
              </p>
              <Link
                to={service.linkTo}
                className="text-[var(--color-secondary-green)] font-semibold hover:text-[var(--color-primary-green)] transition-colors inline-flex items-center group"
              >
                {service.linkText}
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--color-white)] border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-primary-green)] mb-4">Frequently Asked Questions</h2>
            <p className="text-[var(--color-secondary-text)] text-lg">
              Common questions about our platform and roadmap.
            </p>
          </div>
          
          <div className="space-y-6">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-[var(--color-background)] p-6 rounded-[var(--radius-card)] border border-[var(--color-border)]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <h3 className="text-lg font-bold text-[var(--color-primary-text)] pr-4">{faq.question}</h3>
                  <span className="shrink-0 inline-flex items-center px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--color-white)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-secondary-green)]">
                    {faq.status}
                  </span>
                </div>
                <p className="text-[var(--color-secondary-text)] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
