import React, { useState } from 'react';
import { ShieldCheck, Shield, MapPin, Award, Star, X, Info, CheckSquare, MessageSquare, Loader2, PlusCircle, ArrowRight } from 'lucide-react';
import { Professional } from '../types';
import { initialProfessionals, saveInquiry } from '../data';
import BundleConnectionSection from './BundleConnectionSection';

interface ProfessionalsPageProps {
  navigate: (path: string, params?: any) => void;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function ProfessionalsPage({ navigate }: ProfessionalsPageProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stateFilter, setStateFilter] = useState<string>('');
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null);
  
  // Choice prompt state when "Get Connected" is clicked on an individual professional
  const [choicePromptProf, setChoicePromptProf] = useState<Professional | null>(null);

  // Terms agreement state
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  // Billing popup details
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    phone: '',
    email: '',
    cardName: '',
    cardNumber: '4000 1234 5678 9010',
    cardExpiry: '12/28',
    cardCvv: '232'
  });

  const filteredProfs = initialProfessionals.filter(p => {
    // Category match
    if (categoryFilter !== 'All') {
      if (categoryFilter === 'Lawyer' && p.category !== 'Lawyer') return false;
      if (categoryFilter === 'Surveyor' && p.category !== 'Surveyor') return false;
      if (categoryFilter === 'Structural Engineer' && p.category !== 'Structural Engineer') return false;
    }

    // State match
    if (stateFilter) {
      if (!p.statesCovered.includes(stateFilter)) return false;
    }

    return true;
  });

  const handleOpenProfile = (prof: Professional) => {
    setSelectedProf(prof);
    setTermsAgreed(false);
    setPaymentSuccess(false);
    setIsPaying(false);
  };

  const triggerPaystackCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingDetails.name || !billingDetails.phone || !billingDetails.email) {
      alert('Please fill out your contact details first.');
      return;
    }

    setIsPaying(true);
    // Simulate Paystack transaction load of 2 seconds
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      
      // Save query inquiry to admin directory
      saveInquiry({
        type: 'Professional',
        targetName: selectedProf?.name || 'Professional Connection',
        requesterName: billingDetails.name,
        requesterPhone: billingDetails.phone,
        requesterEmail: billingDetails.email
      });
      
      // After successfully paying, trigger WhatsApp intro in 1.5 seconds
      setTimeout(() => {
        const text = encodeURIComponent(`Hello Olayinka Ayodele, I just paid the NGN 55,000 connection fee on unityhomes.ng to be connected with ${selectedProf?.name} (${selectedProf?.category}). My Email is ${billingDetails.email}. Please arrange our introduction.`);
        try {
          window.open(`https://wa.me/2348145550012?text=${text}`, '_blank');
        } catch (e) {
          console.warn('window.open blocked in current environment, redirecting via location.href', e);
          window.location.href = `https://wa.me/2348145550012?text=${text}`;
        }
      }, 1500);

    }, 2000);
  };

  return (
    <div className="min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="bg-[#18452E] text-white py-12 px-4 md:px-8 text-center border-b border-stone-200">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="text-xs uppercase font-mono font-semibold tracking-widest text-[#C9A84C] bg-[#18452E]/20 border border-[#C9A84C]/25 px-3 py-1 rounded-full">
            FOUNDER&apos;S DIRECT VETTING
          </span>
          <h1 className="text-3xl md:text-4.5xl font-display font-semibold text-[#F0F8F4] tracking-tight mt-2">
            Find A Verified Professional
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl mx-auto">
            Every professional in this catalog has had their certificates inspected, practice license integrity confirmed, and has been personally selected and verified by <strong>Olayinka Ayodele</strong> before going live.
          </p>
        </div>
      </div>

      {/* GOLD DISCLAIMER BAR */}
      <div className="bg-[#C9A84C] text-white py-3.5 px-4 md:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-start md:items-center space-x-2">
          <Info className="w-5 h-5 text-white shrink-0" />
          <p className="text-[11px] md:text-xs font-sans font-medium text-white">
            <strong>Important Guardrail:</strong> Unity Homes verifies credentials and monitors professional connections but does not guarantee specific litigation or survey outcomes. Professional service fees are agreed separately between clients and professionals, and are separate from the Unity Homes connection fee.
          </p>
        </div>
      </div>

      <div className="py-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
        
        {/* DIRECTORY LIST VIEW SECTION */}
        {!selectedProf ? (
          <div>
            {/* PROMPT THREE FIX FIVE: Horizontal Dark Green Banner above Filter Tabs */}
            <div className="relative overflow-hidden text-white rounded-2xl p-5 md:p-6 mb-8 shadow-md border border-[#18452E]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Background Image & Overlay */}
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80" alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
              </div>
              <div className="relative z-10 flex items-center space-x-3.5 text-center sm:text-left">
                <div className="w-11 h-11 bg-[#18452E] text-[#C9A84C] rounded-xl flex items-center justify-center shrink-0 hidden sm:flex border border-[#C9A84C]/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base md:text-lg text-white">
                    Ready to connect with a professional?
                  </h3>
                  <p className="text-xs text-stone-200 font-normal mt-0.5">
                    See our connection packages
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/connect-with-a-professional')}
                className="relative z-10 px-6 py-3 bg-[#C9A84C] hover:bg-[#b5953e] text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center space-x-2 shrink-0"
              >
                <span>View Packages</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white border border-stone-200 p-4 rounded-xl shadow-xs mb-8">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-1">
                {['All', 'Lawyer', 'Surveyor', 'Structural Engineer'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setCategoryFilter(tag)}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      categoryFilter === tag 
                        ? 'bg-[#18452E] text-white' 
                        : 'text-stone-500 hover:bg-stone-50 hover:text-white'
                    }`}
                  >
                    {tag === 'All' ? 'All Professionals' : tag + 's'}
                  </button>
                ))}
              </div>

              {/* State select dropdown */}
              <div className="flex items-center space-x-2 w-auto md:w-56">
                <MapPin className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-xs text-white"
                >
                  <option value="">All States Areas</option>
                  <option value="Lagos">Lagos Sector</option>
                  <option value="Abuja">Abuja Sector</option>
                  <option value="Ogun">Ogun Area</option>
                </select>
              </div>
            </div>

            {/* CONNECTION OPTIONS BUNDLE SECTION */}
            <BundleConnectionSection navigate={navigate} />

            {/* Directory Heading */}
            <div className="border-t border-stone-200 pt-8 mb-6">
              <h3 className="font-display font-semibold text-white text-xl">
                Verified Individual Professionals Directory
              </h3>
              <p className="text-xs text-#6B7280 font-normal mt-0.5">
                Inspect credentials or connect directly with an accredited specialist below.
              </p>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                          {filteredProfs.map((prof) => (
                <div
                  key={prof.id}
                  className="bg-white rounded-xl border border-[#E2E8E4] p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="relative w-16 h-16 rounded-full bg-[#18452E] text-white flex items-center justify-center font-display font-semibold text-xl border-2 border-[#C9A84C] shadow-xs shrink-0">
                          <span>{getInitials(prof.name)}</span>
                          <div className="absolute -bottom-1 -right-1 bg-[#16A34A] text-white rounded-full p-0.5 border-2 border-white shadow-xs">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          </div>
                        </div>
                        <span className="text-[9px] text-stone-400 font-mono mt-1 font-medium block text-center whitespace-nowrap">
                          Photo Coming Soon
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="px-2 py-0.5 rounded bg-[#C9A84C]/10 text-[#C9A84C] text-[10px] font-mono font-semibold uppercase tracking-wider">
                          {prof.category}
                        </span>
                        {prof.isFoundingMember && (
                          <span className="flex items-center text-[9px] font-mono font-semibold text-[#C9A84C] mt-1.5 uppercase tracking-wide">
                            <Star className="w-3 h-3 text-[#C9A84C] fill-[#C9A84C] mr-0.5" />
                            Founding Member
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Meta information */}
                    <h3 className="font-display font-semibold text-white text-base leading-tight">
                      {prof.name}
                    </h3>
                    <p className="text-[10px] font-mono tracking-wide text-stone-400 mt-1 uppercase">
                      Reg: {prof.regNumber} &bull; {prof.issuingBody}
                    </p>
                    <div className="mt-2.5 space-y-1">
                      <div className="text-xs text-stone-500">
                        Experience: <strong className="text-white">{prof.experienceYears} Years Active</strong>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {prof.statesCovered.map((st) => (
                          <span key={st} className="px-2 py-0.5 border border-[#18452E]/20 rounded-full text-[9px] font-mono font-semibold text-white">
                            📍 {st}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-#6B7280 mt-4 leading-relaxed line-clamp-3">
                      {prof.bio}
                    </p>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenProfile(prof)}
                      className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-white text-xs font-semibold rounded-xl transition text-center cursor-pointer border border-stone-200"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setChoicePromptProf(prof)}
                      className="py-2.5 px-3 bg-[#18452E] text-white hover:bg-[#18452E] text-xs font-semibold rounded-xl transition text-center cursor-pointer shadow-xs"
                    >
                      Get Connected
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* INDIVIDUAL CHOICE PROMPT MODAL (FRONTEND STEP THREE) */}
            {choicePromptProf && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full p-6 md:p-8 space-y-6 shadow-sm relative border border-stone-200 animate-fade-in">
                  <button
                    onClick={() => setChoicePromptProf(null)}
                    className="absolute top-5 right-5 p-2 text-stone-400 hover:text-#132A1D rounded-full hover:bg-stone-50 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative w-12 h-12 rounded-full bg-[#18452E] text-white flex items-center justify-center font-display font-semibold text-base border-2 border-[#C9A84C] shadow-xs shrink-0">
                        <span>{getInitials(choicePromptProf.name)}</span>
                        <div className="absolute -bottom-0.5 -right-0.5 bg-[#16A34A] text-white rounded-full p-0.5 border border-white shadow-xs">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-2 h-2">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </div>
                      </div>
                      <span className="text-[8px] text-stone-400 font-mono mt-0.5 font-medium block text-center whitespace-nowrap">
                        Photo Coming Soon
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-semibold text-[#C9A84C] uppercase">
                        {choicePromptProf.category}
                      </span>
                      <h4 className="font-display font-semibold text-white text-base">
                        {choicePromptProf.name}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-semibold text-lg text-white">
                      How Would You Like to Connect?
                    </h3>
                    <p className="text-xs text-#6B7280 leading-relaxed font-normal">
                      You can connect with {choicePromptProf.name} individually or add them to a bundle to protect your property transaction with multiple professionals.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Option 1: Single Connection */}
                    <button
                      onClick={() => {
                        const targetProf = choicePromptProf;
                        setChoicePromptProf(null);
                        handleOpenProfile(targetProf);
                      }}
                      className="w-full py-3.5 bg-white border-2 border-[#18452E] hover:bg-emerald-50 text-white font-semibold text-xs rounded-2xl transition flex items-center justify-between px-4 cursor-pointer"
                    >
                      <span>Connect with {choicePromptProf.name} only</span>
                      <span className="font-mono text-white">NGN 55,000</span>
                    </button>

                    {/* Option 2: Add to a bundle */}
                    <button
                      onClick={() => {
                        setChoicePromptProf(null);
                        window.scrollTo({ top: 320, behavior: 'smooth' });
                      }}
                      className="w-full py-3.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold text-xs rounded-2xl transition flex items-center justify-between px-4 cursor-pointer shadow-md"
                    >
                      <div className="flex items-center space-x-2">
                        <PlusCircle className="w-4 h-4 text-[#C9A84C]" />
                        <span>Add to a Bundle</span>
                      </div>
                      <span className="font-mono text-[#C9A84C] text-[10px] bg-[#18452E] px-2 py-0.5 rounded">
                        Save up to NGN 45,000
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          
          /* INDIVIDUAL DETAIL PROFILE VIEW - STEP 10 */
          <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 md:p-10 max-w-4xl mx-auto">
            {/* Close detail/Back button */}
            <button
              onClick={() => setSelectedProf(null)}
              className="px-4 py-2 border border-stone-200 text-stone-500 hover:text-white text-xs font-semibold rounded-lg mb-6 flex items-center space-x-1 cursor-pointer"
            >
              <span>← Back to Vetted Directory</span>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column Profile info */}
              <div className="md:col-span-4 flex flex-col items-center text-center">
                {/* Initial circle with verification check mark */}
                <div className="flex flex-col items-center shrink-0 mb-3">
                  <div className="relative w-28 h-28 rounded-full bg-[#18452E] text-white flex items-center justify-center font-display font-semibold text-3xl border-3 border-[#C9A84C] shadow-md shrink-0">
                    <span>{getInitials(selectedProf.name)}</span>
                    <div className="absolute bottom-0 right-0 bg-[#16A34A] text-white rounded-full p-1.5 border-2 border-white shadow-xs">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono mt-2 font-medium block text-center whitespace-nowrap">
                    Photo Coming Soon
                  </span>
                </div>

                <h2 className="font-display font-semibold text-xl text-white leading-tight mt-1">
                  {selectedProf.name}
                </h2>
                <span className="px-3 py-1 bg-[#C9A84C]/15 text-[#C9A84C] font-mono font-semibold text-xs rounded-full uppercase tracking-wider mt-2 block">
                  {selectedProf.category}
                </span>

                {selectedProf.isFoundingMember && (
                  <span className="flex items-center text-[10px] font-mono font-semibold text-[#C9A84C] uppercase tracking-widest mt-3 bg-amber-50 rounded border border-amber-200 p-1.5">
                    <Star className="w-3.5 h-3.5 text-[#C9A84C] fill-[#C9A84C] mr-1" />
                    Founding Star Counselor
                  </span>
                )}

                {/* STRUCTURAL ENGINEER SPECIFIC TAGS SUB-ROW IN STEP 10 */}
                {selectedProf.category === 'Structural Engineer' && selectedProf.tags && (
                  <div className="mt-5 w-full text-left">
                    <span className="block text-[10px] font-mono font-semibold text-slate-400 uppercase mb-2">
                      Structural Competences Row
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedProf.tags.map((tg) => (
                        <span key={tg} className="bg-stone-50 border border-stone-200/60 p-1 text-[9px] font-semibold text-stone-500 rounded">
                          ✦ {tg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column details */}
              <div className="md:col-span-8 space-y-5">
                
                {/* Prominent Trust box including Official registry numbers */}
                <div className="bg-[#18452E]/5 rounded-xl border border-stone-200 p-5">
                  <span className="block text-[9px] font-mono font-semibold uppercase tracking-widest text-white mb-2.5">
                    Official Regulatory Registry Box
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-stone-400">REGISTERING AUTHORITY</span>
                      <span className="block text-xs font-semibold text-white mt-0.5">{selectedProf.issuingBody}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-400">REGISTRATION LICENSE</span>
                      <span className="block text-xs font-mono font-semibold text-white mt-0.5">{selectedProf.regNumber}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-400">PRACTICING LIFESPAN</span>
                      <span className="block text-xs font-semibold text-white mt-0.5">{selectedProf.experienceYears} Years Verified</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-400">ACTIVE STATES ON PLATFORM</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedProf.statesCovered.map((s) => (
                          <span key={s} className="bg-[#18452E] text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-medium text-sm text-white border-b border-stone-200 pb-2">Vetted Biography</h4>
                  <p className="text-xs text-#6B7280 mt-2.5 leading-relaxed font-normal">
                    {selectedProf.bio}
                  </p>
                </div>

                {/* Direct Introduction Charter/Rules box - STEP 10 SPEC */}
                <div className="p-4 bg-amber-50/50 border-l-[5px] border-[#18452E] rounded-r-xl">
                  <span className="block font-mono font-semibold text-[10px] uppercase tracking-wide text-white mb-2">
                    Direct Connection Guidelines &amp; Professional Charter
                  </span>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-white leading-relaxed">
                    <li>The connection fee is paid only to Unity Homes via Paystack on this website.</li>
                    <li>After payment, your introduction will be personally arranged by Olayinka Ayodele within 24 to 48 hours of payment confirmation.</li>
                    <li>Professional service fees are agreed separately between the client and the professional.</li>
                    <li>The connection fee is non-refundable once an introduction is made unless the professional fails to respond within forty-eight hours.</li>
                    <li>The visitor consents to being connected with the selected professional through Unity Homes’ monitored introduction process.</li>
                  </ol>
                  
                  {/* Mandatory acceptance checkbox */}
                  <div className="mt-4 pt-1 flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="acceptTermsProf"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-white focus:ring-[#18452E] border-stone-200 rounded cursor-pointer"
                    />
                    <label htmlFor="acceptTermsProf" className="text-[11px] font-semibold text-white select-none cursor-pointer">
                      I confirm I have read, understood, and accept all the connection conditions written in this official charter.
                    </label>
                  </div>
                </div>

                {/* CONNECTION BILLING FORM - TRIGGERED IF TERMS AGREED */}
                {termsAgreed && (
                  <div className="bg-stone-50 border border-dashed border-[#C9A84C] rounded-xl p-5 mt-6">
                    <span className="block text-[10px] font-mono font-semibold text-[#C9A84C] uppercase tracking-wider mb-3">
                      ✦ Secured Connection Checkout (Paystack Channel)
                    </span>

                    {paymentSuccess ? (
                      <div className="bg-emerald-50 text-emerald-800 p-5 rounded-lg text-center flex flex-col items-center space-y-2">
                        <CheckSquare className="w-10 h-10 text-emerald-600" />
                        <h4 className="font-semibold text-sm uppercase font-mono">Payment Successful!</h4>
                        <p className="text-xs">
                          Thank you. Your connection fee of <strong>₦55,000</strong> has been processed via Paystack. Your introduction to <strong>{selectedProf.name}</strong> will be personally arranged by Olayinka Ayodele within 24 to 48 hours.
                        </p>
                        <span className="text-[10px] text-#6B7280 animate-pulse font-mono">
                          Arranging introduction in seconds...
                        </span>
                      </div>
                    ) : (
                      <form onSubmit={triggerPaystackCheckout} className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[9px] font-semibold text-white uppercase">Your Legal Name</label>
                            <input
                              type="text"
                              required
                              value={billingDetails.name}
                              onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                              className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs text-white"
                              placeholder="Oluwaseun Adewale"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-semibold text-white uppercase">Your active Phone</label>
                            <input
                              type="text"
                              required
                              value={billingDetails.phone}
                              onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                              className="w-full bg-white border border-stone-200 rounded-lg p-3 py-2 text-xs text-white"
                              placeholder="+234 812 000 0000"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-semibold text-white uppercase">Your Email Address</label>
                            <input
                              type="email"
                              required
                              value={billingDetails.email}
                              onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                              className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs text-white"
                              placeholder="seun@gmail.com"
                            />
                          </div>
                        </div>

                        {/* Card details simulation */}
                        <div className="bg-white rounded-lg border border-stone-200 p-3">
                          <span className="block text-[8px] font-mono font-semibold text-stone-500 uppercase mb-2">Simulated Paystack Card Fields</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="block text-[8px] text-stone-400">Card Number:</span>
                              <input
                                type="text"
                                className="w-full border-0 p-1 font-mono text-#132A1D bg-stone-50 rounded"
                                value={billingDetails.cardNumber}
                                onChange={(e) => setBillingDetails({ ...billingDetails, cardNumber: e.target.value })}
                              />
                            </div>
                            <div>
                              <span className="block text-[8px] text-stone-400">Expires:</span>
                              <input
                                type="text"
                                className="w-full border-0 p-1 font-mono text-#132A1D bg-stone-50 rounded"
                                value={billingDetails.cardExpiry}
                                onChange={(e) => setBillingDetails({ ...billingDetails, cardExpiry: e.target.value })}
                              />
                            </div>
                            <div>
                              <span className="block text-[8px] text-stone-400">CVV Guard:</span>
                              <input
                                type="text"
                                className="w-full border-0 p-1 font-mono text-#132A1D bg-stone-50 rounded"
                                value={billingDetails.cardCvv}
                                onChange={(e) => setBillingDetails({ ...billingDetails, cardCvv: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isPaying}
                          className="w-full py-3 bg-[#18452E] hover:bg-[#18452E] disabled:bg-stone-300 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                        >
                          {isPaying ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
                              <span>Charging Card via Paystack...</span>
                            </>
                          ) : (
                            <>
                              <span>Pay ₦55,000 &amp; Request Personal Introduction</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {!termsAgreed && (
                  <button
                    disabled
                    className="w-full py-3.5 bg-stone-50 border border-stone-200 text-stone-400 font-semibold rounded-xl text-xs select-none block"
                  >
                    Please accept connection charter rules above to unlock payment
                  </button>
                )}

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
