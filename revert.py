import os

html_content = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Google AI Studio App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)


css_content = """@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  
  --color-brand-bg: #F0F8F4;
  --color-brand-primary: #2D6A4F;
  --color-brand-dark: #1B4332;
  --color-brand-gold: #C9A84C;
  --color-brand-teal: #1A5C50;
  --color-brand-gray: #6B7280;
  --color-brand-border: #E2E8E4;
}

@layer base {
  body {
    background-color: var(--color-brand-bg);
    color: var(--color-brand-dark);
    font-family: var(--font-sans);
    background-image: radial-gradient(circle at 10% 20%, rgba(45, 106, 79, 0.03) 0%, transparent 40%),
                      radial-gradient(circle at 80% 80%, rgba(201, 168, 76, 0.04) 0%, transparent 50%);
    background-attachment: fixed;
  }
}

/* Spatial UI Design Classes */
.spatial-glass {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(45, 106, 79, 0.08);
  box-shadow: 0 8px 32px 0 rgba(15, 35, 25, 0.03);
}

.spatial-dark-glass {
  background: rgba(15, 35, 25, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(201, 168, 76, 0.15);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.3);
}

.spatial-teal-glass {
  background: rgba(26, 92, 80, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px 0 rgba(15, 35, 25, 0.08);
}

.glow-border {
  border-color: rgba(201, 168, 76, 0.25);
  box-shadow: 0 0 15px rgba(201, 168, 76, 0.1);
}

.glow-border-green {
  border-color: rgba(45, 106, 79, 0.3);
  box-shadow: 0 0 15px rgba(45, 106, 79, 0.08);
}

.spatial-glow-subtle {
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3), 
              0 1px 2px rgba(15, 35, 25, 0.04), 
              0 4px 12px rgba(15, 35, 25, 0.02);
}

/* Smooth Progressive Animate Bar */
@keyframes fillProgress {
  from { width: 0%; }
}
.animate-progress {
  animation: fillProgress 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Scrollbar tweaks */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(45, 106, 79, 0.15);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(45, 106, 79, 0.3);
}
"""

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

tsx_content = """import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Check, 
  ChevronRight, 
  Building2, 
  Key, 
  Home, 
  Users, 
  Scale, 
  Compass, 
  HardHat, 
  ShieldCheck, 
  FileText, 
  Layers,
  ArrowRight,
  Search,
  X,
  Lock
} from 'lucide-react';
import { 
  WaitlistRole, 
  WaitlistInterest, 
  WaitlistEntry, 
  submitWaitlistEntry, 
  confirmWaitlistEmail, 
  getWaitlistStats, 
  getWaitlistEntries
} from '../lib/waitlistService';

interface WaitlistLandingPageProps {
  isAdminRoute?: boolean;
  navigate?: (path: string) => void;
}

const NIGERIAN_STATES = [
  'Lagos', 'FCT Abuja', 'Rivers', 'Oyo', 'Ogun', 'Enugu', 'Kano', 'Delta', 'Anambra', 
  'Akwa Ibom', 'Edo', 'Kaduna', 'Kwara', 'Osun', 'Abia', 'Adamawa', 'Bauchi', 
  'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Ebonyi', 'Ekiti', 'Gombe', 'Imo', 
  'Jigawa', 'Katsina', 'Kebbi', 'Kogi', 'Nasarawa', 'Niger', 'Plateau', 'Sokoto', 
  'Taraba', 'Yobe', 'Zamfara'
];

export default function WaitlistLandingPage({ navigate, isAdminRoute = false }: WaitlistLandingPageProps) {
  const [showAdminModal, setShowAdminModal] = useState(isAdminRoute);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Lagos');
  const [selectedRole, setSelectedRole] = useState<WaitlistRole>('long_term_landlord');
  const [organisationName, setOrganisationName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<WaitlistInterest[]>(['property_management']);
  const [referralInput, setReferralInput] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<{ entry: WaitlistEntry; confirmation_link?: string; } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');
      const ref = searchParams.get('ref');
      if (ref) setReferralInput(ref);
      if (token) {
        const res = confirmWaitlistEmail(token);
        if (res.success && res.entry) {
          setSubmissionSuccess({ entry: res.entry, confirmation_link: window.location.href });
        }
      }
    } catch (err: any) {}
  }, []);

  const rolesList: { id: WaitlistRole; label: string; orgPlaceholder?: string }[] = [
    { id: 'long_term_landlord', label: 'Long-Term Landlord', orgPlaceholder: 'Portfolio Name (Optional)' },
    { id: 'shortlet_landlord', label: 'Shortlet Landlord', orgPlaceholder: 'Portfolio Name (Optional)' },
    { id: 'property_management_company', label: 'Property Management Company', orgPlaceholder: 'Company Name' },
    { id: 'shortlet_manager', label: 'Shortlet Manager', orgPlaceholder: 'Business Name' },
    { id: 'realtor', label: 'Realtors & Agents', orgPlaceholder: 'Agency Name (Optional)' },
    { id: 'property_lawyer', label: 'Property Lawyer', orgPlaceholder: 'Law Firm Name' },
    { id: 'licensed_surveyor', label: 'Licensed Surveyor', orgPlaceholder: 'Survey Firm Name' },
    { id: 'structural_engineer', label: 'Structural Engineer', orgPlaceholder: 'Engineering Firm Name' },
  ];

  const interestsList: { id: WaitlistInterest; title: string; desc: string }[] = [
    { id: 'buying_property', title: 'Buying Property', desc: 'Acquire verified assets.' },
    { id: 'renting', title: 'Renting', desc: 'Secure transparent leases.' },
    { id: 'property_management', title: 'Property Management', desc: 'Automate portfolios.' },
    { id: 'property_verification', title: 'Property Verification', desc: 'Verify ownership titles.' },
    { id: 'finding_trusted_professionals', title: 'Finding Professionals', desc: 'Hire vetted experts.' },
    { id: 'neighbourhood_insights', title: 'Neighbourhood Insights', desc: 'Data-driven locational analysis.' },
    { id: 'transparency_and_digital_records', title: 'Digital Records', desc: 'Immutable property ledgers.' }
  ];

  const handleInterestToggle = (id: WaitlistInterest) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length === 1) return;
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = submitWaitlistEntry({
        full_name: fullName, email, phone, role: selectedRole,
        organisation_name: organisationName, state, interests: selectedInterests,
        referred_by: referralInput
      });
      if (res.success && res.entry) {
        setSubmissionSuccess({ entry: res.entry, confirmation_link: res.confirmation_link });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById('waitlist-form');
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-[#18452E]/20 selection:text-[#18452E]">
      {/* HEADER */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-700 ease-in-out ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-stone-200/50 py-4 shadow-sm' : 'bg-white/0 py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div 
            onClick={() => navigate ? navigate('/') : window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-500 ${isScrolled ? 'bg-[#18452E] text-[#C9A84C]' : 'bg-stone-900 text-white group-hover:bg-[#18452E] group-hover:text-[#C9A84C]'}`}>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-current">
                <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H16V13H8V21H4C3.44772 21 3 20.4477 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-stone-900">Unity Homes</span>
          </div>
          <div className="flex items-center space-x-8">
            <button onClick={() => setShowAdminModal(true)} className="text-sm font-medium text-stone-400 hover:text-stone-900 transition-colors hidden md:block">
              Admin
            </button>
            <button onClick={scrollToForm} className="text-sm font-semibold text-white bg-stone-900 hover:bg-[#18452E] transition-all duration-300 px-6 py-2.5 rounded-full shadow-sm hover:shadow-md">
              Join Waitlist
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="pt-48 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-stone-50 border border-stone-200/60 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#18452E] animate-pulse"></span>
              <span className="text-xs font-medium tracking-wide text-stone-600 uppercase">Early Access Programme</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-900 leading-[1.05] mb-8">
              Real estate,<br/>without the <span className="text-stone-400">friction.</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10 font-light">
              We are building a singular operating system for Nigerian property. Verified assets, immutable ledgers, and a curated network of trusted professionals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={scrollToForm} 
                className="w-full sm:w-auto px-8 py-4 bg-stone-900 text-white rounded-full font-semibold text-[15px] hover:bg-[#18452E] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
              >
                <span>Request Access</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30, filter: 'blur(10px)' }} 
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} 
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full max-w-2xl lg:max-w-none"
          >
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-stone-100 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=90&w=1200" 
                alt="Minimalist modern interior" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-white">
                <div>
                  <p className="text-sm font-medium tracking-wide">Ikoyi, Lagos</p>
                  <p className="text-xs text-white/70">Verified Listing</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* REFINED PILLARS */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            <div className="group">
              <div className="mb-6 w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center transition-colors group-hover:bg-[#18452E]/5">
                <Lock className="w-6 h-6 text-stone-900 group-hover:text-[#18452E] transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3 tracking-tight">Zero Fraud</h3>
              <p className="text-stone-500 leading-relaxed font-light">Every property, title, and professional undergoes rigorous verification. Trust is built directly into the operating system.</p>
            </div>
            <div className="group">
              <div className="mb-6 w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center transition-colors group-hover:bg-[#18452E]/5">
                <FileText className="w-6 h-6 text-stone-900 group-hover:text-[#18452E] transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3 tracking-tight">Radical Transparency</h3>
              <p className="text-stone-500 leading-relaxed font-light">Immutable payment ledgers, digitized deeds, and clear lease terms. No hidden fees, no document ambiguity.</p>
            </div>
            <div className="group">
              <div className="mb-6 w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center transition-colors group-hover:bg-[#18452E]/5">
                <Layers className="w-6 h-6 text-stone-900 group-hover:text-[#18452E] transition-colors" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-3 tracking-tight">Effortless Control</h3>
              <p className="text-stone-500 leading-relaxed font-light">Automate rent collection, tenant screening, and maintenance workflows. An experience designed for serious portfolios.</p>
            </div>
          </div>
        </section>

        {/* WIDE IMAGE BREAKER */}
        <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden bg-stone-100 relative shadow-xl">
             <img 
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=90&w=2400" 
                alt="Architecture and precision" 
                className="w-full h-full object-cover"
              />
          </div>
        </section>

        {/* ELEGANT FORM SECTION */}
        <section id="waitlist-form" className="py-32 px-6 md:px-12 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-stone-900 mb-6">Join the Waitlist</h2>
            <p className="text-lg text-stone-500 font-light">Reserve your position to access the platform before the public launch.</p>
          </div>

          <AnimatePresence mode="wait">
            {!submissionSuccess ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[2rem] p-8 md:p-16 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-stone-100"
              >
                <form onSubmit={handleSubmit} className="space-y-12">
                  {errorMessage && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium border border-red-100 flex items-start">
                      <span className="mr-2">⚠️</span>
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-stone-700">Full Name</label>
                        <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-4 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all" placeholder="Enter your full name" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-stone-700">Email Address</label>
                        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-4 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all" placeholder="name@company.com" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-stone-700">Phone Number</label>
                        <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-4 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all" placeholder="+234..." />
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-stone-700">Primary State</label>
                        <div className="relative">
                          <select required value={state} onChange={e => setState(e.target.value)} className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-4 text-[15px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all appearance-none cursor-pointer">
                            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <label className="text-sm font-medium text-stone-700 block">I am joining as a:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {rolesList.map(role => (
                        <div 
                          key={role.id} 
                          onClick={() => setSelectedRole(role.id)}
                          className={`cursor-pointer rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-200 border ${selectedRole === role.id ? 'border-[#18452E] bg-[#18452E]/[0.02] shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300'}`}
                        >
                          <span className={`text-[15px] ${selectedRole === role.id ? 'font-semibold text-[#18452E]' : 'font-medium text-stone-600'}`}>{role.label}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedRole === role.id ? 'border-[#18452E] bg-[#18452E]' : 'border-stone-300'}`}>
                             {selectedRole === role.id && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {rolesList.find(r => r.id === selectedRole)?.orgPlaceholder && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                      >
                        <label className="text-sm font-medium text-stone-700">{rolesList.find(r => r.id === selectedRole)?.orgPlaceholder}</label>
                        <input type="text" value={organisationName} onChange={e => setOrganisationName(e.target.value)} className="w-full bg-stone-50/50 border border-stone-200 rounded-2xl px-5 py-4 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all" placeholder="Enter name" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-5">
                    <label className="text-sm font-medium text-stone-700 block">Primary interests</label>
                    <div className="flex flex-wrap gap-3">
                      {interestsList.map(interest => (
                        <button
                          key={interest.id}
                          type="button"
                          onClick={() => handleInterestToggle(interest.id)}
                          className={`px-5 py-2.5 rounded-full text-[14px] font-medium transition-all duration-200 border ${selectedInterests.includes(interest.id) ? 'bg-stone-900 border-stone-900 text-white shadow-sm' : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'}`}
                        >
                          {interest.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-stone-900 text-white font-semibold text-[16px] rounded-full py-5 flex items-center justify-center space-x-2 hover:bg-[#18452E] transition-all duration-300 disabled:opacity-70 shadow-md hover:shadow-lg"
                    >
                      {isSubmitting ? <span className="opacity-80">Processing request...</span> : <span>Submit Request</span>}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-12 md:p-20 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-stone-100 text-center"
              >
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-8 text-[#18452E]">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4 tracking-tight">Request Received</h3>
                <p className="text-lg text-stone-500 mb-10 max-w-lg mx-auto font-light leading-relaxed">
                  Thank you, {submissionSuccess.entry.full_name.split(' ')[0]}. Your position on the waitlist is confirmed. We will notify you when early access is available.
                </p>
                
                <div className="bg-stone-50 rounded-[2rem] p-8 mb-10 text-left border border-stone-100 max-w-lg mx-auto">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">Your Priority Access Link</p>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input 
                      readOnly 
                      value={`https://unityhomes.com/waitlist?ref=${submissionSuccess.entry.referral_code}`}
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3.5 text-[14px] text-stone-600 outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`https://unityhomes.com/waitlist?ref=${submissionSuccess.entry.referral_code}`);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 bg-stone-900 text-white text-[14px] font-medium rounded-xl hover:bg-[#18452E] transition-colors shrink-0"
                    >
                      {copiedLink ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>
                </div>
                
                <button onClick={() => setSubmissionSuccess(null)} className="text-stone-400 font-medium text-[15px] hover:text-stone-900 transition-colors">
                  Submit another request
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="py-16 text-center">
        <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center mx-auto mb-6 opacity-80">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
            <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H16V13H8V21H4C3.44772 21 3 20.4477 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-stone-400 text-sm font-medium">© {new Date().getFullYear()} Unity Homes & Properties Ltd. All rights reserved.</p>
      </footer>

      {showAdminModal && <AdminModal onClose={() => setShowAdminModal(false)} />}
    </div>
  );
}

function AdminModal({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, confirmationRate: 0, roleCounts: {} as Record<string, number>, interestCounts: {} as Record<string, number> });
  
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    setEntries(getWaitlistEntries());
    setStats(getWaitlistStats());
  }, []);

  const filteredEntries = entries.filter(e => 
    e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-semibold text-stone-900 tracking-tight">Waitlist Console</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 bg-stone-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <p className="text-sm font-medium text-stone-500 mb-2">Total Entries</p>
              <p className="font-display text-4xl font-bold text-stone-900 tracking-tight">{stats.total}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <p className="text-sm font-medium text-stone-500 mb-2">Confirmed</p>
              <p className="font-display text-4xl font-bold text-[#18452E] tracking-tight">{stats.confirmed}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-100 flex gap-4 bg-white">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name or email..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border-none rounded-xl text-[14px] focus:ring-1 focus:ring-stone-200 outline-none transition-shadow text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-stone-50/50 text-stone-500 font-medium border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredEntries.map(e => (
                    <tr key={e.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="px-6 py-5 font-medium text-stone-900">{e.full_name}</td>
                      <td className="px-6 py-5 text-stone-600">{e.email}</td>
                      <td className="px-6 py-5 text-stone-600 capitalize">{e.role.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-5 text-stone-400">{new Date(e.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center text-stone-400">No entries found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
"""

with open('src/components/WaitlistLandingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(tsx_content)

print("Reverted!")
