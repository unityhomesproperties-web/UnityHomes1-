const fs = require('fs');

const content = `
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Download,
  Search,
  Menu,
  X
} from 'lucide-react';
import { 
  WaitlistRole, 
  WaitlistInterest, 
  WaitlistEntry, 
  submitWaitlistEntry, 
  confirmWaitlistEmail, 
  getWaitlistStats, 
  broadcastToWaitlist,
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

  const rolesList: { id: WaitlistRole; label: string; orgPlaceholder?: string }[] = [
    { id: 'long_term_landlord', label: 'Long-Term Landlord', orgPlaceholder: 'Portfolio Name (Optional)' },
    { id: 'shortlet_landlord', label: 'Shortlet Landlord', orgPlaceholder: 'Portfolio Name (Optional)' },
    { id: 'property_management_company', label: 'Property Management Company', orgPlaceholder: 'Company Name' },
    { id: 'shortlet_manager', label: 'Shortlet Manager', orgPlaceholder: 'Business Name' },
    { id: 'realtor', label: 'Realtors & Agents', orgPlaceholder: 'Agency Name (Optional)' },
    { id: 'property_lawyer', label: 'Property Lawyer', orgPlaceholder: 'Law Firm' },
    { id: 'licensed_surveyor', label: 'Licensed Surveyor', orgPlaceholder: 'Survey Firm' },
    { id: 'structural_engineer', label: 'Structural Engineer', orgPlaceholder: 'Engineering Firm' },
  ];

  const interestsList: { id: WaitlistInterest; title: string; desc: string }[] = [
    { id: 'buying_property', title: 'Buying Property', desc: 'Find verified properties.' },
    { id: 'renting', title: 'Renting', desc: 'Access verified rental listings.' },
    { id: 'property_management', title: 'Property Management', desc: 'Automate rent and maintenance.' },
    { id: 'property_verification', title: 'Property Verification', desc: 'Verify ownership titles.' },
    { id: 'finding_trusted_professionals', title: 'Finding Professionals', desc: 'Connect with verified experts.' },
    { id: 'neighbourhood_insights', title: 'Neighbourhood Insights', desc: 'Evaluate area history.' },
    { id: 'transparency_and_digital_records', title: 'Digital Records', desc: 'Immutable property deeds.' }
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
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-[#18452E] selection:text-white">
      {/* HEADER */}
      <header className={\`fixed top-0 inset-x-0 z-50 transition-all duration-500 \${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-stone-100 py-4' : 'bg-transparent py-6'}\`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div 
            onClick={() => navigate ? navigate('/') : window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-[#18452E] rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#C9A84C]">
                <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H16V13H8V21H4C3.44772 21 3 20.4477 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight text-stone-900">Unity Homes</span>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={() => setShowAdminModal(true)} className="text-sm font-medium text-stone-400 hover:text-stone-900 transition-colors hidden md:block">
              Admin
            </button>
            <button onClick={scrollToForm} className="text-sm font-medium text-white bg-[#18452E] hover:bg-[#0f2c1d] transition-colors px-5 py-2.5 rounded-full">
              Join Waitlist
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="pt-40 pb-20 px-6 md:px-12 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-stone-900 leading-[1.1] mb-6">
              The new standard in <br className="hidden md:block" /> Nigerian real estate.
            </h1>
            <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-12">
              A single, verifiable operating system for landlords, property managers, and trusted professionals. Zero fraud. Total transparency.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-stone-100 relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=100&w=2800" 
              alt="Modern luxury home" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </section>

        {/* TYPOGRAPHIC PHILOSOPHY */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-stone-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <div>
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Zero Fraud</h3>
              <p className="text-stone-500 leading-relaxed">Every property, title, and professional on our platform undergoes rigorous digital verification. Trust is built directly into the operating system.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Total Transparency</h3>
              <p className="text-stone-500 leading-relaxed">Immutable payment ledgers, digitized property deeds, and crystal clear lease terms. No hidden fees, no document ambiguity.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Effortless Management</h3>
              <p className="text-stone-500 leading-relaxed">Automate rent collection, tenant screening, and maintenance workflows. A premium experience designed for serious portfolios.</p>
            </div>
          </div>
        </section>

        {/* FORM SECTION */}
        <section id="waitlist-form" className="py-24 px-6 md:px-12 bg-[#FAFAFA]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mb-4">Request early access</h2>
              <p className="text-stone-500">Join a curated network of professionals shaping the future of real estate.</p>
            </div>

            <AnimatePresence mode="wait">
              {!submissionSuccess ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-stone-100"
                >
                  <form onSubmit={handleSubmit} className="space-y-10">
                    {errorMessage && (
                      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                        {errorMessage}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-stone-900">Full Name</label>
                          <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-stone-50 border-none rounded-xl px-4 py-3.5 text-stone-900 placeholder:text-stone-400 focus:ring-1 focus:ring-[#18452E] transition-shadow" placeholder="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-stone-900">Email Address</label>
                          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-stone-50 border-none rounded-xl px-4 py-3.5 text-stone-900 placeholder:text-stone-400 focus:ring-1 focus:ring-[#18452E] transition-shadow" placeholder="jane@example.com" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-stone-900">Phone Number</label>
                          <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-stone-50 border-none rounded-xl px-4 py-3.5 text-stone-900 placeholder:text-stone-400 focus:ring-1 focus:ring-[#18452E] transition-shadow" placeholder="+234 800 000 0000" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-stone-900">State / Region</label>
                          <select required value={state} onChange={e => setState(e.target.value)} className="w-full bg-stone-50 border-none rounded-xl px-4 py-3.5 text-stone-900 focus:ring-1 focus:ring-[#18452E] transition-shadow appearance-none">
                            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-stone-900 block">I am joining as a:</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rolesList.map(role => (
                          <div 
                            key={role.id} 
                            onClick={() => setSelectedRole(role.id)}
                            className={\`cursor-pointer border rounded-xl px-4 py-3.5 flex items-center justify-between transition-all duration-200 \${selectedRole === role.id ? 'border-[#18452E] bg-[#18452E]/5' : 'border-stone-100 hover:border-stone-300'}\`}
                          >
                            <span className={\`text-sm font-medium \${selectedRole === role.id ? 'text-[#18452E]' : 'text-stone-600'}\`}>{role.label}</span>
                            {selectedRole === role.id && <div className="w-4 h-4 rounded-full bg-[#18452E] flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {rolesList.find(r => r.id === selectedRole)?.orgPlaceholder && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-sm font-medium text-stone-900">{rolesList.find(r => r.id === selectedRole)?.orgPlaceholder}</label>
                        <input type="text" value={organisationName} onChange={e => setOrganisationName(e.target.value)} className="w-full bg-stone-50 border-none rounded-xl px-4 py-3.5 text-stone-900 placeholder:text-stone-400 focus:ring-1 focus:ring-[#18452E] transition-shadow" placeholder="Enter name" />
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-stone-900 block">Areas of Interest</label>
                      <div className="flex flex-wrap gap-2">
                        {interestsList.map(interest => (
                          <button
                            key={interest.id}
                            type="button"
                            onClick={() => handleInterestToggle(interest.id)}
                            className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${selectedInterests.includes(interest.id) ? 'bg-stone-900 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}\`}
                          >
                            {interest.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-[#18452E] text-white font-medium text-lg rounded-xl py-4 flex items-center justify-center space-x-2 hover:bg-[#0f2c1d] transition-all duration-200 disabled:opacity-70"
                      >
                        {isSubmitting ? <span className="opacity-80">Securing your spot...</span> : <span>Join the Waitlist</span>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-10 md:p-16 rounded-3xl shadow-[0_2px_40px_rgba(0,0,0,0.04)] border border-stone-100 text-center"
                >
                  <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#C9A84C]">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-3">You're on the list.</h3>
                  <p className="text-stone-500 mb-8 max-w-md mx-auto leading-relaxed">
                    Thank you for joining, {submissionSuccess.entry.full_name.split(' ')[0]}. We will notify you as soon as early access opens.
                  </p>
                  
                  <div className="bg-stone-50 rounded-2xl p-6 mb-8 text-left">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Your Referral Link</p>
                    <div className="flex items-center space-x-3">
                      <input 
                        readOnly 
                        value={\`https://unityhomes.com/waitlist?ref=\${submissionSuccess.entry.referral_code}\`}
                        className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-600 outline-none"
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(\`https://unityhomes.com/waitlist?ref=\${submissionSuccess.entry.referral_code}\`);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="px-6 py-3 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors shrink-0"
                      >
                        {copiedLink ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  
                  <button onClick={() => setSubmissionSuccess(null)} className="text-[#18452E] font-medium text-sm hover:underline">
                    Submit another response
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center border-t border-stone-100">
        <p className="text-stone-400 text-sm">© {new Date().getFullYear()} Unity Homes & Properties Ltd. All rights reserved.</p>
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
        className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <h2 className="text-lg font-bold text-stone-900">Waitlist Admin Console</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
              <p className="text-sm font-medium text-stone-500 mb-1">Total Entries</p>
              <p className="text-3xl font-bold text-stone-900">{stats.total}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm">
              <p className="text-sm font-medium text-stone-500 mb-1">Confirmed</p>
              <p className="text-3xl font-bold text-[#18452E]">{stats.confirmed}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name or email..." 
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-[#18452E]"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-500 font-medium border-b border-stone-100">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredEntries.map(e => (
                    <tr key={e.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-900">{e.full_name}</td>
                      <td className="px-6 py-4 text-stone-600">{e.email}</td>
                      <td className="px-6 py-4 text-stone-600 capitalize">{e.role.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 text-stone-400">{new Date(e.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-stone-400">No entries found.</td>
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
`

fs.writeFileSync('src/components/WaitlistLandingPage.tsx', content.trim());
console.log('Successfully rewrote WaitlistLandingPage.tsx');
