import React from 'react';
import { Layers, Home, CheckSquare, Users, Building, Map, ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ServicesSection() {
  const services = [
    {
      icon: Home,
      title: 'Verified Property Listings',
      description: 'Help users discover trusted property listings with a stronger focus on transparency and reduced fraud.',
      status: 'Available at Launch',
      statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      icon: CheckSquare,
      title: 'Property Verification',
      description: 'Support property document review and verification before major property decisions.',
      status: 'Available at Launch',
      statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      icon: Users,
      title: 'Trusted Professionals',
      description: 'Connect buyers, renters and landlords with verified Property Lawyers, Licensed Surveyors and Structural Engineers.',
      status: 'Available at Launch',
      statusColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
    },
    {
      icon: Building,
      title: 'Property Management',
      description: 'Provide landlords and property managers with tools for managing tenants, rent and property operations.',
      status: 'Rolling Out',
      statusColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    {
      icon: Map,
      title: 'Area Intelligence',
      description: 'Collect trusted community insights to help users better understand neighbourhoods across Nigeria.',
      status: 'Early Access',
      statusColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    },
    {
      icon: Layers,
      title: 'Waitlist & Early Access',
      description: 'Join the waitlist to receive priority access and future platform updates.',
      status: 'Available Now',
      statusColor: 'bg-[var(--theme-brand-bg)]/10 text-[var(--theme-brand-bg)] border-[var(--theme-brand-bg)]/20'
    }
  ];

  return (
    <section id="services" className="py-24 md:py-32 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="max-w-[1320px] mx-auto px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-brand-bg)]/10 text-[var(--theme-brand-bg)] text-xs font-semibold tracking-wide uppercase mb-6 border border-[var(--theme-brand-bg)]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-brand-bg)] animate-pulse"></span>
              What We Offer
            </div>
            
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] mb-6 tracking-tight">
              Our Services
            </h2>
            
            <p className="text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed">
              Unity Homes is building a connected property ecosystem designed to reduce risk, improve transparency and simplify real estate services across Nigeria.
            </p>
          </motion.div>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden cursor-default"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center group-hover:bg-[var(--theme-brand-bg)]/5 group-hover:border-[var(--theme-brand-bg)]/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-[var(--color-text-primary)] group-hover:text-[var(--theme-brand-bg)] transition-colors duration-300" strokeWidth={1.5} />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--color-text-muted)] opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-[var(--theme-brand-bg)] transition-all duration-300" />
                </div>
                
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3 pr-4">
                  {service.title}
                </h3>
                
                <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed mb-8 flex-1">
                  {service.description}
                </p>
                
                <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${service.statusColor}`}>
                    {service.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
