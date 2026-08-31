import { Link } from 'react-router-dom';
import { useWaitlist } from './WaitlistContext';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';

const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
  >
    <span className="w-0 h-[1px] bg-[#008D24] mr-0 group-hover:w-2 group-hover:mr-2 transition-all duration-300"></span>
    {children}
  </Link>
);

const Footer = () => {
  const { openWaitlist } = useWaitlist();
  const reducedMotion = useReducedMotion();

  const navReveal = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1, 
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.6, ease: "easeOut" as const }
    })
  };

  return (
    <footer className="relative bg-black w-full overflow-hidden flex flex-col font-sans">
      
      {/* SECTION 1: Architectural CTA (Visual Storytelling & Depth) */}
      <div className="relative w-full min-h-[500px] flex items-center py-24 lg:py-32 overflow-hidden">
        
        {/* Parallax / Layered Background */}
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" as const }}
          viewport={{ once: true }}
        >
          <img 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80" 
            alt="Modern Architecture" 
            className="w-full h-full object-cover"
          />
          {/* Layered gradients for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        </motion.div>

        {/* Content Layer */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div className="max-w-2xl">
            <motion.h2 
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: "easeOut" as const }}
            >
              The future of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">real estate is here.</span>
            </motion.h2>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" as const }}
            >
              Experience seamless property discovery, secure transactions, and premium management—all in one unified platform.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" as const }}
            className="shrink-0"
          >
            <button onClick={openWaitlist} className="group relative inline-flex items-center justify-center overflow-hidden bg-white text-black px-10 py-5 rounded-full font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] transition-all duration-300 cursor-pointer">
              <span className="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center">
                Join The Waitlist
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* SECTION 2: Structured Navigation (Architecture & Typography) */}
      <div className="relative z-20 bg-black pt-20 pb-10 px-6 lg:px-12 border-t border-white/10">
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
                  <div className="w-6 h-6 bg-[#008D24] rounded-sm transform rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Unity Homes
                </h3>
              </Link>
              <p className="text-gray-400 leading-relaxed max-w-sm text-sm">
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
                <span className="font-bold text-white mb-2 text-xs uppercase tracking-[0.2em]">Company</span>
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
                <span className="font-bold text-white mb-2 text-xs uppercase tracking-[0.2em]">Explore</span>
                <FooterLink to="/services">Services</FooterLink>
                <FooterLink to="/professionals">Professionals</FooterLink>
                <FooterLink to="/area-intelligence">Intelligence</FooterLink>
                <button onClick={openWaitlist} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left">Waitlist</button>
              </motion.div>

              <motion.div 
                className="flex flex-col space-y-5 col-span-2 md:col-span-1"
                custom={3}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={navReveal}
              >
                <span className="font-bold text-white mb-2 text-xs uppercase tracking-[0.2em]">Legal</span>
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
                <FooterLink to="/terms">Terms of Service</FooterLink>
              </motion.div>

            </div>
          </div>
          
          {/* Bottom Bar */}
          <motion.div 
            className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 tracking-wide"
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={navReveal}
          >
            <p>&copy; {new Date().getFullYear()} Unity Homes and Properties Ltd. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex gap-6">
               <span className="hover:text-white transition-colors cursor-pointer">Instagram</span>
               <span className="hover:text-white transition-colors cursor-pointer">Twitter</span>
               <span className="hover:text-white transition-colors cursor-pointer">LinkedIn</span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
