import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Building, ShieldCheck, Users, Briefcase, Wrench, Map, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import FAQSection from '../components/FAQSection';

const HERO_SLIDES = [
  {
    id: 1,
    tag: "Nigeria-focused real estate technology.",
    headline: "Building a Safer, More Transparent Real Estate Experience for Nigeria.",
    description: "Unity Homes and Properties Ltd is building technology that makes property discovery, trusted professional access, property management and real estate decision-making simpler and more transparent.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    tag: "Trusted Professional Network",
    headline: "Verified Professionals at Your Fingertips.",
    description: "Connect with trusted Property Lawyers, Licensed Surveyors, and Structural Engineers to ensure secure and verified property transactions.",
    image: "https://images.unsplash.com/photo-1541881591873-455de31cebd8?auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    tag: "Data-Driven Decisions",
    headline: "Community-Powered Area Intelligence.",
    description: "Discover deep insights about neighborhoods, infrastructure, and community vibes before you make your next property move.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
  }
];

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
  },
  {
    icon: Home,
    title: 'Shortlet Services',
    description: 'Find premium short-term rentals and manage shortlet properties efficiently.',
    linkText: 'Explore Shortlets',
    linkTo: '/services'
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const scrollToServices = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('services-preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[100svh] min-h-[600px] lg:h-[85vh] overflow-hidden bg-[var(--color-surface-light)] pt-16 lg:pt-0">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 flex flex-col-reverse lg:grid lg:grid-cols-2 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Content Side */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-16 xl:px-24 py-12 lg:py-0 relative z-20 bg-[var(--color-surface-light)] lg:bg-transparent">
              <div className="max-w-xl mx-auto lg:mx-0 w-full">
                <div className="overflow-hidden mb-6">
                  <div 
                    className={`inline-flex items-center text-xs uppercase tracking-widest font-bold text-[var(--color-brand-medium)] transition-all duration-700 delay-100 ${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }`}
                  >
                    {slide.tag}
                  </div>
                </div>
                
                <div className="overflow-hidden mb-6">
                  <h1 
                    className={`text-4xl md:text-5xl lg:text-[56px] font-extrabold text-[var(--color-brand-deep)] leading-[1.1] transition-all duration-700 delay-200 ${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }`}
                  >
                    {slide.headline}
                  </h1>
                </div>

                <div className="overflow-hidden mb-10">
                  <p 
                    className={`text-lg text-[var(--color-text-secondary)] leading-relaxed transition-all duration-700 delay-300 ${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }`}
                  >
                    {slide.description}
                  </p>
                </div>

                <div className="overflow-hidden">
                  <div 
                    className={`flex flex-col sm:flex-row items-center gap-4 transition-all duration-700 delay-400 ${
                      idx === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                    }`}
                  >
                    <Link
                      to="/waitlist"
                      className="w-full sm:w-auto bg-[var(--color-brand-fresh)] text-white px-8 py-4 rounded-[var(--radius-button)] font-bold text-base hover:bg-[var(--color-brand-medium)] transition-colors duration-200 min-h-[48px] flex items-center justify-center shadow-sm"
                    >
                      Join The Waitlist
                    </Link>
                    <a
                      href="#services-preview"
                      onClick={scrollToServices}
                      className="w-full sm:w-auto bg-transparent border border-[var(--color-border)] text-[var(--color-brand-deep)] px-8 py-4 rounded-[var(--radius-button)] font-bold text-base hover:bg-[var(--color-surface-soft)] transition-colors duration-200 min-h-[48px] flex items-center justify-center"
                    >
                      Explore Unity Homes
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative w-full h-[45vh] lg:h-full lg:flex-1 overflow-hidden lg:rounded-bl-[var(--radius-large)] bg-[var(--color-surface-soft)]">
              <img
                src={slide.image}
                alt={slide.headline}
                className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-out ${
                  idx === currentSlide ? 'scale-105' : 'scale-100'
                }`}
              />
              {/* Subtle tint instead of dark overlay */}
              <div className="absolute inset-0 bg-[var(--color-brand-deep)]/5 mix-blend-multiply"></div>
            </div>
          </div>
        ))}

        {/* Hero Controls */}
        <div className="absolute z-30 bottom-0 left-0 lg:w-1/2 px-4 sm:px-6 lg:px-16 xl:px-24 pb-8 lg:pb-12 pointer-events-none">
          <div className="max-w-xl mx-auto lg:mx-0 flex items-center justify-between pointer-events-auto">
            {/* Slide Indicator */}
            <div className="flex items-center gap-4">
              <span className="font-bold text-sm text-[var(--color-brand-deep)] w-5">
                {String(currentSlide + 1).padStart(2, '0')}
              </span>
              
              <div className="w-24 h-[2px] bg-[var(--color-border)] rounded-full relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-[var(--color-brand-fresh)] transition-all duration-[6000ms] ease-linear"
                  style={{ width: `${(currentSlide + 1) * (100 / HERO_SLIDES.length)}%` }}
                />
              </div>
              
              <span className="font-medium text-sm text-[var(--color-text-secondary)] w-5">
                {String(HERO_SLIDES.length).padStart(2, '0')}
              </span>
            </div>

            {/* Nav Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-brand-deep)] hover:bg-[var(--color-surface-soft)] transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-brand-deep)] hover:bg-[var(--color-surface-soft)] transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="space-y-6">
            <h4 className="text-sm font-bold tracking-widest uppercase text-[var(--color-brand-medium)]">
              About Unity Homes
            </h4>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-brand-deep)] leading-[1.1]">
              Building greater confidence into every property decision.
            </h2>
          </div>
          <div className="space-y-8">
            <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
              Unity Homes and Properties Ltd is a Nigerian real estate company focused on making property transactions safer, clearer and more transparent. The platform is being built to help people discover property opportunities, connect with trusted professionals, verify important information and manage real estate more efficiently.
            </p>
            <Link 
              to="/about"
              className="inline-flex items-center text-[var(--color-brand-deep)] font-bold group hover:text-[var(--color-brand-medium)] transition-colors"
            >
              Learn More 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
        
        {/* Trust Principles */}
        <div className="mt-32 border-t border-[var(--color-border)] pt-16">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { id: '01', title: 'TRANSPARENCY', desc: 'Making important property information easier to understand.' },
              { id: '02', title: 'TRUST', desc: 'Connecting people with properly verified professionals and better processes.' },
              { id: '03', title: 'TECHNOLOGY', desc: 'Using technology to reduce unnecessary friction in real estate experiences.' }
            ].map(principle => (
              <div key={principle.id} className="group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-bold text-[var(--color-accent-gold)]">{principle.id}</span>
                  <div className="h-px bg-[var(--color-border)] flex-1 group-hover:bg-[var(--color-brand-fresh)] transition-colors duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-[var(--color-brand-deep)] mb-3 group-hover:translate-x-1 transition-transform duration-300">
                  {principle.title}
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed group-hover:text-[var(--color-text-primary)] transition-colors duration-300">
                  {principle.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section id="services-preview" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[var(--color-surface-light)] rounded-[32px] my-12 border border-[var(--color-border)]">
        <div className="mb-16">
          <h4 className="text-sm font-bold tracking-widest uppercase text-[var(--color-brand-medium)] mb-4">
            WHAT WE'RE BUILDING
          </h4>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-brand-deep)] max-w-2xl leading-[1.2]">
            Real estate services designed around better decisions.
          </h2>
        </div>
        
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Featured Service - Property Listings */}
          <div className="lg:col-span-5 flex flex-col bg-white p-10 sm:p-12 rounded-[24px] border border-[var(--color-border)] hover:border-[var(--color-brand-fresh)] hover:-translate-y-1 transition-all duration-300">
            <div className="mb-auto">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--color-surface-soft)] text-[var(--color-brand-deep)] mb-8">
                <Building className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-extrabold text-[var(--color-brand-deep)] mb-4 uppercase">
                Property Listings
              </h3>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-8">
                Discover and list property opportunities through a transparent digital platform.
              </p>
            </div>
            <Link
              to="/services"
              className="mt-8 inline-flex items-center text-[var(--color-brand-deep)] font-bold group hover:text-[var(--color-brand-medium)] transition-colors"
            >
              Explore Property 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Remaining Services List */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {SERVICES_PREVIEW.filter(s => s.title !== 'Property Listings').map((service, idx) => (
              <Link
                key={idx}
                to={service.linkTo}
                className="group flex flex-col justify-between p-6 sm:p-8 bg-white border border-[var(--color-border)] rounded-[20px] hover:-translate-y-0.5 hover:border-[var(--color-brand-fresh)] transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <service.icon className="w-6 h-6 text-[var(--color-brand-deep)]" strokeWidth={1.5} />
                    <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      {service.title === 'Property Verification' ? 'Coming Soon' : 'Active'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-deep)] mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center text-sm font-bold text-[var(--color-brand-deep)] group-hover:text-[var(--color-brand-medium)] transition-colors">
                  {service.linkText}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-sm font-bold tracking-widest uppercase text-[var(--color-brand-medium)] mb-4">
              FAQ
            </h4>
            <h2 className="text-3xl font-bold text-[var(--color-brand-deep)] mb-4">Frequently Asked Questions</h2>
          </div>
          
          <FAQSection limit={4} />
          
          <div className="mt-12 text-center">
            <Link 
              to="/contact"
              className="inline-flex items-center text-[var(--color-brand-deep)] font-bold group hover:text-[var(--color-brand-medium)] transition-colors"
            >
              View Full FAQ 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final Waitlist CTA */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 text-center mt-12 mb-12 max-w-7xl mx-auto rounded-[32px] overflow-hidden bg-[var(--color-brand-deep)]">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80" 
            alt="Real Estate Building" 
            className="w-full h-full object-cover animate-slow-pan opacity-60"
            aria-hidden="true"
          />
          {/* Solid color overlay, no gradient */}
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <div className="w-16 h-1 bg-[var(--color-accent-gold)] mx-auto mb-8 rounded-full"></div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Be part of what's next in Nigerian real estate.
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Join the waitlist to get early access to a platform built for safer, more transparent property experiences.
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
