import os

content = """import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  FileText, 
  Layers,
  ArrowRight,
  Search,
  X,
  Lock,
  ChevronRight,
  Home,
  Key,
  Building2,
  Users,
  Scale,
  Compass,
  HardHat,
  ShieldCheck,
  Share2
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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

  const rolesList: { id: WaitlistRole; label: string; desc: string; icon: any; orgPlaceholder?: string }[] = [
    { id: 'long_term_landlord', label: 'Long-Term Landlord', desc: 'Managing annual leases.', icon: Home, orgPlaceholder: 'Portfolio Name (Optional)' },
    { id: 'shortlet_landlord', label: 'Shortlet Landlord', desc: 'Managing short stays.', icon: Key, orgPlaceholder: 'Portfolio Name (Optional)' },
    { id: 'property_management_company', label: 'Property Manager', desc: 'Managing for others.', icon: Building2, orgPlaceholder: 'Company Name' },
    { id: 'realtor', label: 'Realtor & Agent', desc: 'Brokering deals.', icon: Users, orgPlaceholder: 'Agency Name (Optional)' },
    { id: 'property_lawyer', label: 'Property Lawyer', desc: 'Legal verification.', icon: Scale, orgPlaceholder: 'Law Firm Name' },
    { id: 'licensed_surveyor', label: 'Licensed Surveyor', desc: 'Land measurement.', icon: Compass, orgPlaceholder: 'Survey Firm Name' },
    { id: 'structural_engineer', label: 'Structural Engineer', desc: 'Building integrity.', icon: HardHat, orgPlaceholder: 'Engineering Firm Name' },
  ];

  const interestsList: { id: WaitlistInterest; title: string; desc: string; icon: any }[] = [
    { id: 'buying_property', title: 'Buying Property', desc: 'Acquire verified assets.', icon: Home },
    { id: 'renting', title: 'Renting', desc: 'Secure transparent leases.', icon: Key },
    { id: 'property_management', title: 'Property Management', desc: 'Automate portfolios.', icon: Building2 },
    { id: 'property_verification', title: 'Property Verification', desc: 'Verify ownership titles.', icon: ShieldCheck },
    { id: 'finding_trusted_professionals', title: 'Finding Professionals', desc: 'Hire vetted experts.', icon: Users },
    { id: 'neighbourhood_insights', title: 'Neighbourhood Insights', desc: 'Data-driven locational analysis.', icon: Compass },
    { id: 'transparency_and_digital_records', title: 'Digital Records', desc: 'Immutable property ledgers.', icon: FileText }
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
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8F4] text-[#132A1D] font-sans selection:bg-[#0E2F1F]/20 selection:text-[#0E2F1F]" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out ${isScrolled ? 'bg-[#F4F8F4]/90 backdrop-blur-md border-b border-[#0E2F1F]/[0.08] py-4' : 'bg-transparent py-[20px] md:py-[32px]'}`}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-[32px] flex items-center justify-between">
          <div 
            onClick={() => navigate ? navigate('/') : window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-[#0E2F1F] transition-transform duration-250 group-hover:-translate-y-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#C9A84C]">
                <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H16V13H8V21H4C3.44772 21 3 20.4477 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-[700] text-[22px] tracking-tight text-[#132A1D]">Unity Homes</span>
          </div>
          <div className="flex items-center space-x-8">
            <button onClick={() => setShowAdminModal(true)} className="text-[16px] font-[600] text-[#6B7280] hover:text-[#132A1D] transition-colors hidden md:block">
              Admin
            </button>
            <button onClick={scrollToForm} className="text-[16px] font-[600] text-[#0E2F1F] bg-transparent border border-[#0E2F1F] hover:bg-[#0E2F1F] hover:text-white transition-all duration-250 px-[24px] h-[48px] rounded-[18px]">
              Join Waitlist
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* 60/40 HERO SECTION */}
        <section className="pt-[140px] md:pt-[180px] pb-[120px] px-6 md:px-[32px] max-w-[1200px] mx-auto bg-[#F4F8F4]">
          <div className="flex flex-col lg:flex-row items-center gap-[64px] lg:gap-[80px]">
            {/* Left Side: Storytelling (60%) */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex-1 lg:max-w-[55%] w-full"
            >
              <div className="inline-flex items-center justify-center px-[16px] h-[34px] rounded-full border border-[#0E2F1F] bg-white text-[#0E2F1F] text-[12px] font-[600] uppercase tracking-[0.08em] mb-[24px]">
                Early Access
              </div>
              <h1 className="text-[42px] md:text-[56px] lg:text-[72px] font-[800] tracking-tight text-[#0E2F1F] leading-[1.05] mb-[24px]">
                Verified. <br className="hidden md:block" /> Secure. <br className="hidden md:block" /> <span className="text-[#C9A84C]">Transparent.</span>
              </h1>
              <p className="text-[18px] text-[#6B7280] leading-[1.7] mb-[40px] font-[400] max-w-[480px]">
                We are building a singular operating system for Nigerian property. Verified assets, immutable ledgers, and a curated network of trusted professionals.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-[16px] mb-[48px]">
                <button 
                  onClick={scrollToForm} 
                  className="w-full sm:w-auto px-[28px] h-[56px] bg-[#0E2F1F] text-white rounded-[18px] font-[600] text-[16px] hover:-translate-y-[2px] transition-all duration-250 hover:shadow-[0_8px_20px_rgba(14,47,31,0.15)] flex items-center justify-center"
                >
                  Join Waitlist
                </button>
                <button 
                  onClick={scrollToForm} 
                  className="w-full sm:w-auto px-[28px] h-[56px] bg-transparent border border-[#0E2F1F] text-[#0E2F1F] rounded-[18px] font-[600] text-[16px] hover:bg-[#0E2F1F] hover:text-white transition-all duration-250 flex items-center justify-center"
                >
                  Learn Our Mission
                </button>
              </div>
              <div className="flex items-start gap-[12px]">
                <div className="w-[24px] h-[24px] rounded-full border border-[#0E2F1F]/[0.15] flex items-center justify-center shrink-0 mt-[2px]">
                  <Check className="w-[12px] h-[12px] text-[#0E2F1F]" />
                </div>
                <p className="text-[15px] text-[#6B7280] leading-[1.6] font-[500] max-w-[380px]">
                  Built for landlords, property managers, shortlet operators and verified property professionals across Nigeria.
                </p>
              </div>
            </motion.div>
            
            {/* Right Side: Premium Visual (40%) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
              className="w-full lg:w-[45%]"
            >
              <div className="aspect-[4/5] rounded-[28px] overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.06)] relative border border-[#0E2F1F]/[0.08]">
                <img 
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=90&w=1200" 
                  alt="Modern luxury home" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* OVERLAPPING FORM SECTION */}
        <section id="waitlist-form" className="relative -mt-[60px] px-6 md:px-[32px] max-w-[1200px] mx-auto z-10 pb-[120px]">
          <div className="max-w-[800px] mx-auto">
            <AnimatePresence mode="wait">
              {!submissionSuccess ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="bg-white rounded-[24px] p-[28px] md:p-[40px] shadow-[0_15px_40px_rgba(0,0,0,.05)] border border-[#0E2F1F]/[0.08]"
                >
                  <div className="mb-[40px]">
                    <h2 className="text-[32px] md:text-[40px] font-[700] text-[#132A1D] mb-[8px] tracking-tight">Join Early Access</h2>
                    <p className="text-[18px] text-[#6B7280] font-[400] leading-[1.7]">
                      Reserve your position to access the platform before the public launch.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-[40px]">
                    {errorMessage && (
                      <div className="p-[18px] bg-red-50 text-[#C92A2A] rounded-[18px] text-[15px] font-[600] border border-red-100 flex items-start">
                        <span className="mr-[12px]">⚠️</span>
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="space-y-[24px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                        <div className="space-y-[12px]">
                          <label className="text-[15px] font-[600] text-[#132A1D] block">Full Name</label>
                          <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white border border-[#0E2F1F]/[0.08] rounded-[18px] px-[18px] h-[56px] text-[16px] text-[#132A1D] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E2F1F] focus:shadow-[0_4px_12px_rgba(14,47,31,0.08)] transition-all duration-250" placeholder="Enter your full name" />
                        </div>
                        <div className="space-y-[12px]">
                          <label className="text-[15px] font-[600] text-[#132A1D] block">Email Address</label>
                          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-[#0E2F1F]/[0.08] rounded-[18px] px-[18px] h-[56px] text-[16px] text-[#132A1D] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E2F1F] focus:shadow-[0_4px_12px_rgba(14,47,31,0.08)] transition-all duration-250" placeholder="name@company.com" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                        <div className="space-y-[12px]">
                          <label className="text-[15px] font-[600] text-[#132A1D] block">Phone Number</label>
                          <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white border border-[#0E2F1F]/[0.08] rounded-[18px] px-[18px] h-[56px] text-[16px] text-[#132A1D] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E2F1F] focus:shadow-[0_4px_12px_rgba(14,47,31,0.08)] transition-all duration-250" placeholder="+234..." />
                        </div>
                        <div className="space-y-[12px]">
                          <label className="text-[15px] font-[600] text-[#132A1D] block">Primary State</label>
                          <div className="relative">
                            <select required value={state} onChange={e => setState(e.target.value)} className="w-full bg-white border border-[#0E2F1F]/[0.08] rounded-[18px] px-[18px] h-[56px] text-[16px] text-[#132A1D] focus:outline-none focus:border-[#0E2F1F] focus:shadow-[0_4px_12px_rgba(14,47,31,0.08)] transition-all duration-250 appearance-none cursor-pointer">
                              {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronRight className="absolute right-[20px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#6B7280] pointer-events-none rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-[16px]">
                      <label className="text-[15px] font-[600] text-[#132A1D] block">I am joining as a:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                        {rolesList.map(role => (
                          <div 
                            key={role.id}
                            onClick={() => setSelectedRole(role.id)}
                            className={`cursor-pointer rounded-[18px] p-[16px] flex items-start gap-[16px] transition-all duration-250 border hover:-translate-y-[4px] ${selectedRole === role.id ? 'bg-[#0E2F1F] border-[#0E2F1F] shadow-[0_8px_20px_rgba(14,47,31,0.15)]' : 'bg-white border-[#0E2F1F]/[0.08] shadow-[0_4px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_15px_rgba(0,0,0,0.05)] hover:border-[#0E2F1F]/[0.2]'}`}
                          >
                            <div className={`w-[40px] h-[40px] rounded-[12px] flex items-center justify-center shrink-0 transition-colors ${selectedRole === role.id ? 'bg-white/20 text-white' : 'bg-[#F4F8F4] text-[#0E2F1F]'}`}>
                              <role.icon className="w-[20px] h-[20px]" />
                            </div>
                            <div>
                              <h4 className={`text-[16px] font-[600] mb-[4px] ${selectedRole === role.id ? 'text-white' : 'text-[#132A1D]'}`}>{role.label}</h4>
                              <p className={`text-[14px] font-[400] ${selectedRole === role.id ? 'text-white/80' : 'text-[#6B7280]'}`}>{role.desc}</p>
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
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-[12px] pt-[8px]">
                            <label className="text-[15px] font-[600] text-[#132A1D] block">{rolesList.find(r => r.id === selectedRole)?.orgPlaceholder}</label>
                            <input type="text" value={organisationName} onChange={e => setOrganisationName(e.target.value)} className="w-full bg-white border border-[#0E2F1F]/[0.08] rounded-[18px] px-[18px] h-[56px] text-[16px] text-[#132A1D] placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E2F1F] focus:shadow-[0_4px_12px_rgba(14,47,31,0.08)] transition-all duration-250" placeholder="Enter name" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-[16px]">
                      <label className="text-[15px] font-[600] text-[#132A1D] block">Primary interests</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                        {interestsList.map(interest => (
                          <div
                            key={interest.id}
                            onClick={() => handleInterestToggle(interest.id)}
                            className={`cursor-pointer rounded-[18px] p-[16px] flex items-start gap-[16px] transition-all duration-250 border ${selectedInterests.includes(interest.id) ? 'bg-[#F4F8F4] border-[#2F8D46] shadow-[0_4px_12px_rgba(47,141,70,0.08)]' : 'bg-white border-[#0E2F1F]/[0.08] hover:border-[#0E2F1F]/[0.2] hover:shadow-[0_4px_10px_rgba(0,0,0,0.03)]'}`}
                          >
                            <div className={`w-[40px] h-[40px] rounded-[12px] flex items-center justify-center shrink-0 transition-colors ${selectedInterests.includes(interest.id) ? 'bg-[#2F8D46] text-white' : 'bg-[#F4F8F4] text-[#0E2F1F]'}`}>
                              {selectedInterests.includes(interest.id) ? <Check className="w-[20px] h-[20px]" /> : <interest.icon className="w-[20px] h-[20px]" />}
                            </div>
                            <div>
                              <h4 className="text-[16px] font-[600] text-[#132A1D] mb-[4px]">{interest.title}</h4>
                              <p className="text-[14px] font-[400] text-[#6B7280]">{interest.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-[24px] flex flex-col md:flex-row items-center justify-between gap-[24px]">
                      <div className="flex items-center gap-[8px] order-2 md:order-1 text-[#6B7280]">
                        <Lock className="w-[16px] h-[16px]" />
                        <span className="text-[14px] font-[500]">Your information is secure and will never be shared.</span>
                      </div>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full md:w-auto h-[56px] bg-[#C9A84C] text-white font-[600] text-[16px] rounded-[18px] px-[40px] hover:-translate-y-[2px] transition-all duration-250 hover:shadow-[0_8px_20px_rgba(201,168,76,0.25)] flex items-center justify-center space-x-[8px] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none order-1 md:order-2"
                      >
                        {isSubmitting ? <span className="opacity-80">Processing request...</span> : (
                          <>
                            <span>Join the Waitlist</span>
                            <ArrowRight className="w-[20px] h-[20px]" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="bg-white rounded-[24px] p-[40px] md:p-[64px] shadow-[0_15px_40px_rgba(0,0,0,.05)] border border-[#0E2F1F]/[0.08]"
                >
                  <div className="text-center">
                    <div className="w-[80px] h-[80px] bg-[#F4F8F4] rounded-[24px] flex items-center justify-center mx-auto mb-[32px] text-[#2F8D46]">
                      <Check className="w-[40px] h-[40px]" />
                    </div>
                    <h3 className="text-[32px] md:text-[40px] font-[700] text-[#132A1D] mb-[16px] tracking-tight">Welcome!</h3>
                    <p className="text-[18px] font-[600] text-[#0E2F1F] mb-[8px]">You're officially on the Unity Homes Waitlist.</p>
                    <p className="text-[16px] text-[#6B7280] mb-[48px] max-w-[480px] mx-auto font-[400] leading-[1.7]">
                      A confirmation email has been sent to {email}. We will notify you when early access is available.
                    </p>
                    
                    <div className="flex justify-center mb-[48px]">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`https://unityhomes.com/waitlist?ref=${submissionSuccess.entry.referral_code}`);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="h-[56px] bg-transparent border border-[#0E2F1F] text-[#0E2F1F] text-[16px] font-[600] rounded-[18px] px-[32px] hover:bg-[#0E2F1F] hover:text-white transition-all duration-250 flex items-center gap-[8px]"
                      >
                        {copiedLink ? <Check className="w-[20px] h-[20px]" /> : <Share2 className="w-[20px] h-[20px]" />}
                        <span>{copiedLink ? 'Link Copied!' : 'Share with a Friend'}</span>
                      </button>
                    </div>
                    
                    <button onClick={() => setSubmissionSuccess(null)} className="text-[#6B7280] font-[600] text-[15px] hover:text-[#132A1D] transition-colors">
                      Submit another request
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="py-[80px] md:py-[120px] text-center bg-white border-t border-[#0E2F1F]/[0.06]">
        <div className="w-[48px] h-[48px] bg-[#0E2F1F] rounded-[12px] flex items-center justify-center mx-auto mb-[32px]">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#C9A84C]">
            <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H16V13H8V21H4C3.44772 21 3 20.4477 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[#6B7280] text-[14px] font-[500] uppercase tracking-[0.05em]">© {new Date().getFullYear()} Unity Homes & Properties Ltd.</p>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-[24px]">
      <div className="absolute inset-0 bg-[#132A1D]/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-[#F4F8F4] w-full max-w-[1000px] max-h-[90vh] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,.1)] flex flex-col overflow-hidden border border-[#0E2F1F]/[0.08]"
      >
        <div className="px-[32px] py-[24px] border-b border-[#0E2F1F]/[0.06] flex items-center justify-between bg-white">
          <h2 className="text-[22px] font-[700] text-[#132A1D]">Waitlist Console</h2>
          <button onClick={onClose} className="p-[8px] hover:bg-[#F4F8F4] rounded-full transition-colors text-[#6B7280]">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-[32px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] mb-[32px]">
            <div className="bg-white p-[28px] rounded-[20px] border border-[#0E2F1F]/[0.08] shadow-[0_15px_40px_rgba(0,0,0,.05)]">
              <p className="text-[15px] font-[600] text-[#6B7280] mb-[8px]">Total Entries</p>
              <p className="text-[38px] font-[700] text-[#132A1D]">{stats.total}</p>
            </div>
            <div className="bg-white p-[28px] rounded-[20px] border border-[#0E2F1F]/[0.08] shadow-[0_15px_40px_rgba(0,0,0,.05)]">
              <p className="text-[15px] font-[600] text-[#6B7280] mb-[8px]">Confirmed</p>
              <p className="text-[38px] font-[700] text-[#2F8D46]">{stats.confirmed}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-[20px] border border-[#0E2F1F]/[0.08] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,.05)]">
            <div className="p-[24px] border-b border-[#0E2F1F]/[0.06] flex gap-[16px]">
              <div className="relative flex-1 max-w-[400px]">
                <Search className="absolute left-[18px] top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name or email..." 
                  className="w-full pl-[48px] pr-[18px] h-[56px] bg-[#F4F8F4] border border-transparent rounded-[18px] text-[16px] focus:outline-none focus:border-[#0E2F1F]/[0.2] transition-colors text-[#132A1D] placeholder:text-[#6B7280]"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[16px]">
                <thead className="bg-[#F4F8F4] text-[#6B7280] font-[600] border-b border-[#0E2F1F]/[0.06]">
                  <tr>
                    <th className="px-[24px] py-[16px]">Name</th>
                    <th className="px-[24px] py-[16px]">Email</th>
                    <th className="px-[24px] py-[16px]">Role</th>
                    <th className="px-[24px] py-[16px]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0E2F1F]/[0.06]">
                  {filteredEntries.map(e => (
                    <tr key={e.id} className="hover:bg-[#F4F8F4]/50 transition-colors">
                      <td className="px-[24px] py-[20px] font-[600] text-[#132A1D]">{e.full_name}</td>
                      <td className="px-[24px] py-[20px] text-[#6B7280]">{e.email}</td>
                      <td className="px-[24px] py-[20px] text-[#6B7280] capitalize">{e.role.replace(/_/g, ' ')}</td>
                      <td className="px-[24px] py-[20px] text-[#6B7280]">{new Date(e.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-[24px] py-[64px] text-center text-[#6B7280]">No entries found.</td>
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
    f.write(content)

print("Rewrite successful.")
