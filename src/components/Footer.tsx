import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useWaitlist } from './WaitlistContext';

const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="text-black font-medium hover:text-[#6FBE45] transition-colors duration-300 relative group inline-flex"
  >
    <span>{children}</span>
    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#6FBE45] transition-all duration-300 group-hover:w-full"></span>
  </Link>
);

const Footer = () => {
  const { openWaitlist } = useWaitlist();
  const shouldReduceMotion = useReducedMotion();

  const navReveal = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1, 
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.6, ease: "easeOut" as const }
    })
  };

  return (
    <footer className="relative w-full overflow-hidden flex flex-col font-sans bg-black">
      
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/videos/footer.mp4" type="video/mp4" />
      </video>

      {/* Structured Navigation */}
      <div className="relative z-20 pt-20 pb-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-10 mb-20">
            
            {/* Brand Column */}
            <motion.div 
              className="md:col-span-12 lg:col-span-5 flex flex-col"
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={navReveal}
            >
              <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <div className="w-6 h-6 bg-[#6FBE45] rounded-sm transform rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
                </div>
                <h3 className="text-2xl font-bold text-black tracking-tight">
                  Unity Homes
                </h3>
              </Link>
              <p className="text-black/80 font-medium leading-relaxed max-w-sm text-sm">
                A premium proptech ecosystem designed to connect, verify, and elevate real estate experiences globally.
              </p>
            </motion.div>

            {/* Links Columns */}
            <div className="md:col-span-12 lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
              
              <motion.div 
                className="flex flex-col space-y-5"
                custom={1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={navReveal}
              >
                <span className="font-bold text-[#18452E] mb-2 text-xs uppercase tracking-[0.2em]">Company</span>
                <FooterLink to="/about">About Us</FooterLink>
                <FooterLink to="/mission">Our Mission</FooterLink>
                <FooterLink to="/vision">Vision</FooterLink>
                <FooterLink to="/contact">Contact</FooterLink>
              </motion.div>

              <motion.div 
                className="flex flex-col space-y-5"
                custom={2}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={navReveal}
              >
                <span className="font-bold text-[#18452E] mb-2 text-xs uppercase tracking-[0.2em]">Explore</span>
                <FooterLink to="/services">Services</FooterLink>
                <FooterLink to="/professionals">Professionals</FooterLink>
                <FooterLink to="/area-intelligence">Intelligence</FooterLink>
                <button onClick={openWaitlist} className="text-black font-medium hover:text-[#6FBE45] transition-colors cursor-pointer text-left">Waitlist</button>
              </motion.div>

              <motion.div 
                className="flex flex-col space-y-5 col-span-2 md:col-span-1"
                custom={3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={navReveal}
              >
                <span className="font-bold text-[#18452E] mb-2 text-xs uppercase tracking-[0.2em]">Legal</span>
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
                <FooterLink to="/terms">Terms of Service</FooterLink>
              </motion.div>

            </div>
          </div>
          
          {/* Bottom Bar */}
          <motion.div 
            className="pt-8 border-t border-black/20 flex flex-col md:flex-row justify-between items-center text-xs text-black/70 font-medium tracking-wide"
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={navReveal}
          >
            <p>&copy; {new Date().getFullYear()} Unity Homes and Properties Ltd. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex gap-6">
               <span className="hover:text-[#6FBE45] transition-colors cursor-pointer">Instagram</span>
               <span className="hover:text-[#6FBE45] transition-colors cursor-pointer">Twitter</span>
               <span className="hover:text-[#6FBE45] transition-colors cursor-pointer">LinkedIn</span>
            </div>
          </motion.div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
