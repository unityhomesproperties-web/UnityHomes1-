import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import type { Variants } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="group flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-brand-fresh)] transition-colors duration-200 py-1.5 w-fit"
  >
    <span className="font-medium text-sm md:text-base">{children}</span>
    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 ml-1" />
  </Link>
);

export default function Footer() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  
  // Subtle Parallax setup
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [-12, 12]);
  
  const navReveal: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: (custom: number) => ({
      opacity: 1, 
      y: 0,
      transition: { delay: custom * 0.08, duration: 0.35, ease: "easeOut" as const }
    })
  };

  return (
    <footer className="w-full flex flex-col mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface-light)]" ref={containerRef}>
      {/* Pre-Footer CTA & Architectural Section */}
      <div className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden z-10">
        
        {/* Subtle Architectural Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-architectural-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="var(--color-brand-deep)" strokeWidth="0.75" />
            </pattern>
          </defs>
          <motion.rect 
            width="100%" height="100%" fill="url(#footer-architectural-grid)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>

        {/* Architectural Parallax Drawing */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none flex items-center justify-end right-0 lg:right-12 opacity-25 md:opacity-100"
          style={{ y: reducedMotion ? 0 : y }}
        >
           <svg viewBox="0 0 600 400" className="w-[600px] lg:w-[700px] xl:w-[800px] h-auto max-w-none translate-x-1/4 lg:translate-x-0 text-[var(--color-brand-deep)] opacity-20">
              {/* Base lines */}
              <motion.path 
                d="M 50 300 L 550 300 M 100 320 L 500 320" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                fill="none"
                initial={reducedMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />

              {/* Building outlines & Property blocks */}
              <motion.path 
                d="M 150 300 L 150 150 L 250 100 L 350 150 L 350 300 M 200 300 L 200 200 L 300 200 L 300 300 M 350 250 L 450 250 L 450 300 M 50 300 L 50 220 L 120 220 L 120 300"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                initial={reducedMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
              />
              
              {/* Architectural grids & Connection lines */}
              <motion.path
                 d="M 250 100 L 250 50 L 450 50 L 450 250 M 150 150 L 80 150 L 80 300 M 150 200 L 200 200 M 300 250 L 350 250 M 380 250 L 380 300 M 420 250 L 420 300"
                 stroke="currentColor"
                 strokeWidth="1"
                 strokeDasharray="4 6"
                 fill="none"
                 initial={reducedMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                 whileInView={{ pathLength: 1, opacity: 1 }}
                 viewport={{ once: true, margin: "-50px" }}
                 transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
              />

              {/* Fresh Green Accent Points */}
              <motion.circle cx="250" cy="50" r="3.5" fill="var(--color-brand-fresh)" 
                 initial={reducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                 whileInView={{ scale: 1, opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.3, delay: 1.2 }}
              />
              <motion.circle cx="80" cy="150" r="3.5" fill="var(--color-brand-fresh)" 
                 initial={reducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                 whileInView={{ scale: 1, opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.3, delay: 1.3 }}
              />
              <motion.circle cx="450" cy="50" r="3.5" fill="var(--color-brand-fresh)" 
                 initial={reducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                 whileInView={{ scale: 1, opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.3, delay: 1.4 }}
              />

              {/* Gold Accent */}
              <motion.circle cx="250" cy="100" r="4.5" fill="var(--color-accent-gold)" 
                 initial={reducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                 whileInView={{ scale: 1, opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.4, delay: 1.6 }}
              />

              {/* Subtle continuous motion point (runs along the dashed connection line) */}
              {!reducedMotion && (
                <motion.circle r="2.5" fill="var(--color-brand-fresh)"
                   animate={{ 
                     cx: [80, 80, 150, 150, 80],
                     cy: [300, 150, 150, 300, 300],
                   }}
                   transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              )}
           </svg>
        </motion.div>

        {/* Statement & CTA */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl lg:max-w-2xl lg:w-3/5">
            <motion.h2 
              className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight mb-6"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              Building a better way to experience real estate.
            </motion.h2>
            
            <motion.p 
              className="text-base md:text-lg text-[var(--color-text-secondary)] leading-relaxed mb-10 max-w-xl"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            >
              Unity Homes and Properties Ltd is building technology that makes property discovery, trusted professional access, property management and real estate decision-making simpler and more transparent.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            >
              <Link
                to="/waitlist"
                className="group inline-flex items-center justify-center bg-[var(--color-brand-fresh)] text-white px-8 py-4 rounded-[18px] font-bold text-lg min-h-[48px] shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-[200ms]"
              >
                Join The Waitlist
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-[200ms] group-hover:translate-x-[3px]" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Area */}
      <div className="bg-white pt-16 pb-8 px-4 sm:px-6 lg:px-8 z-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Brand Column */}
            <motion.div 
              className="md:col-span-12 lg:col-span-5"
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={navReveal}
            >
              <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                <motion.img 
                  src="/logo.jpg" 
                  alt="Unity Homes Logo" 
                  className="h-14 w-auto object-contain"
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                Unity Homes and Properties Ltd
              </h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed max-w-sm text-sm">
                A premium platform designed to connect, verify, and streamline real estate experiences in Nigeria.
              </p>
            </motion.div>

            {/* Links Columns */}
            <div className="md:col-span-12 lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Company */}
              <motion.div 
                className="flex flex-col space-y-4"
                custom={1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={navReveal}
              >
                <span className="font-bold text-[var(--color-text-primary)] mb-2 text-xs md:text-sm uppercase tracking-widest">Company</span>
                <FooterLink to="/about">About</FooterLink>
                <FooterLink to="/mission">Mission</FooterLink>
                <FooterLink to="/vision">Vision</FooterLink>
                <FooterLink to="/contact">Contact</FooterLink>
              </motion.div>

              {/* Explore */}
              <motion.div 
                className="flex flex-col space-y-4"
                custom={1.75}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={navReveal}
              >
                <span className="font-bold text-[var(--color-text-primary)] mb-2 text-xs md:text-sm uppercase tracking-widest">Explore</span>
                <FooterLink to="/services">Services</FooterLink>
                <FooterLink to="/professionals">Professionals</FooterLink>
                <FooterLink to="/area-intelligence">Area Intelligence</FooterLink>
                <FooterLink to="/waitlist">Join Waitlist</FooterLink>
              </motion.div>

              {/* Legal */}
              <motion.div 
                className="flex flex-col space-y-4 col-span-2 md:col-span-1"
                custom={2.5}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={navReveal}
              >
                <span className="font-bold text-[var(--color-text-primary)] mb-2 text-xs md:text-sm uppercase tracking-widest">Legal</span>
                <FooterLink to="/privacy">Privacy</FooterLink>
                <FooterLink to="/terms">Terms</FooterLink>
              </motion.div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center text-sm text-[var(--color-text-secondary)]">
            <p>&copy; 2026 Unity Homes and Properties Ltd. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
