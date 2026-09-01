import React, { useState } from 'react';
import { Mail, Clock, ShieldAlert, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface ComingSoonPageProps {
  navigate: (path: string, params?: any) => void;
}

export default function ComingSoonPage({ navigate }: ComingSoonPageProps) {
  const [emails, setEmails] = useState({
    paymentPlan: '',
    mortgageReady: '',
    buyAndBuild: ''
  });

  const [submittedStatus, setSubmittedStatus] = useState({
    paymentPlan: false,
    mortgageReady: false,
    buyAndBuild: false
  });

  const handleSubmit = (e: React.FormEvent, track: 'paymentPlan' | 'mortgageReady' | 'buyAndBuild') => {
    e.preventDefault();
    if (!emails[track] || !emails[track].includes('@')) return;
    setSubmittedStatus(prev => ({ ...prev, [track]: true }));
  };

  return (
    <div className="min-h-screen py-16 px-4 md:px-8 max-w-6xl mx-auto w-full space-y-12">
      
      {/* HEADER HERO */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-[10px] sm:text-xs uppercase font-mono font-semibold tracking-widest text-[#6FBE45] bg-[#18452E]/20 px-3 py-1 rounded-full border border-[#6FBE45]/25">
          PIPELINE PROJECTS IN CUSTODY
        </span>
        <h1 className="text-3xl md:text-5xl font-display font-semibold text-[#18452E] leading-tight">
          Institutional Investments In Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-#6B7280 font-normal max-w-xl mx-auto leading-relaxed">
          Pre-vetted structures, certified soil logs, and guaranteed legal titles directly linked with our security-verified system. Register interest early to unlock allocations.
        </p>
      </div>

      {/* THREE PREVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CARD 1: PAYMENT PLAN HOUSES */}
        <div className="spatial-glass border border-stone-200/60 rounded-[var(--radius-large)] p-6 flex flex-col justify-between space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#18452E]/5 rounded-bl-full pointer-events-none"></div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider bg-[#18452E]/10 text-[#18452E] uppercase">
                Flexible Payment
              </span>
              <span className="text-stone-400 text-[10px]">&bull; Q4 Launch</span>
            </div>
            
            <h3 className="text-xl font-display font-semibold text-[#18452E]">Payment Plan Houses</h3>
            <p className="text-xs text-#6B7280 leading-relaxed font-normal">
              Premium 2 &amp; 3-bedroom apartments at Epe and Lekki featuring pre-approved payment allocations over 12 to 24 months. Fully backed by secure compliance routing.
            </p>
            
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5 font-sans">
              <span className="text-[10px] font-semibold text-stone-400 block uppercase font-mono">TARGET PRICING</span>
              <span className="block font-semibold text-sm text-[#18452E]">₦18,500,000 Starting</span>
              <span className="text-[9px] text-[#6FBE45] block font-mono">100% Litigation Verified Title</span>
            </div>
          </div>

          <div>
            {submittedStatus.paymentPlan ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Verification queue locked. We will contact you.</span>
              </div>
            ) : (
              <form onSubmit={(e) => handleSubmit(e, 'paymentPlan')} className="space-y-2">
                <label className="text-[10px] font-mono font-semibold text-stone-400 block uppercase">WAITLIST ACCESS</label>
                <div className="flex space-x-2">
                  <input 
                    type="email" 
                    required
                    placeholder="Enter email..." 
                    value={emails.paymentPlan}
                    onChange={(e) => setEmails(prev => ({ ...prev, paymentPlan: e.target.value }))}
                    className="flex-grow p-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#18452E] outline-none"
                  />
                  <button type="submit" className="px-3 bg-[#18452E] text-white rounded-xl text-xs font-semibold hover:bg-[#18452E] cursor-pointer">
                    Join
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* CARD 2: MORTGAGE READY PROPERTIES */}
        <div className="spatial-glass border border-stone-200/60 rounded-[var(--radius-large)] p-6 flex flex-col justify-between space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider bg-amber-100 text-amber-800 uppercase">
                Bank Approved
              </span>
              <span className="text-stone-400 text-[10px]">&bull; Q4 Launch</span>
            </div>

            <h3 className="text-xl font-display font-semibold text-[#18452E]">Mortgage Ready Properties</h3>
            <p className="text-xs text-#6B7280 leading-relaxed font-normal">
              FHA &amp; National Housing Fund (NHF) compatible homes. Verified survey plans and structural logs are fully packaged for easy commercial mortgage approval.
            </p>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5 font-sans">
              <span className="text-[10px] font-semibold text-stone-400 block uppercase font-mono">TENURE DURATION</span>
              <span className="block font-semibold text-sm text-[#18452E]">Up to 15-Year Mortgages</span>
              <span className="text-[9px] text-[#6FBE45] block font-mono">COREN Structural Sanity Cert</span>
            </div>
          </div>

          <div>
            {submittedStatus.mortgageReady ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Verification queue locked. We will contact you.</span>
              </div>
            ) : (
              <form onSubmit={(e) => handleSubmit(e, 'mortgageReady')} className="space-y-2">
                <label className="text-[10px] font-mono font-semibold text-stone-400 block uppercase">WAITLIST ACCESS</label>
                <div className="flex space-x-2">
                  <input 
                    type="email" 
                    required
                    placeholder="Enter email..." 
                    value={emails.mortgageReady}
                    onChange={(e) => setEmails(prev => ({ ...prev, mortgageReady: e.target.value }))}
                    className="flex-grow p-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#18452E] outline-none"
                  />
                  <button type="submit" className="px-3 bg-[#18452E] text-white rounded-xl text-xs font-semibold hover:bg-[#18452E] cursor-pointer">
                    Join
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* CARD 3: BUY AND BUILD LAND */}
        <div className="spatial-glass border border-stone-200/60 rounded-[var(--radius-large)] p-6 flex flex-col justify-between space-y-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-bl-full pointer-events-none"></div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider bg-teal-100 text-teal-800 uppercase">
                Zoned Plots
              </span>
              <span className="text-stone-400 text-[10px]">&bull; Q4 Launch</span>
            </div>

            <h3 className="text-xl font-display font-semibold text-[#18452E]">Buy and Build Land</h3>
            <p className="text-xs text-#6B7280 leading-relaxed font-normal">
              Epe and Ibeju-Lekki secure plots with authentic global C of O. Topographical survey logs are shared on access. Instant architectural handover.
            </p>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5 font-sans">
              <span className="text-[10px] font-semibold text-stone-400 block uppercase font-mono">CHARTING RECORDS</span>
              <span className="block font-semibold text-sm text-[#18452E]">100% Free From Gov Acquisition</span>
              <span className="text-[9px] text-[#6FBE45] block font-mono">Registered SURCON Surveyors</span>
            </div>
          </div>

          <div>
            {submittedStatus.buyAndBuild ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Verification queue locked. We will contact you.</span>
              </div>
            ) : (
              <form onSubmit={(e) => handleSubmit(e, 'buyAndBuild')} className="space-y-2">
                <label className="text-[10px] font-mono font-semibold text-stone-400 block uppercase">WAITLIST ACCESS</label>
                <div className="flex space-x-2">
                  <input 
                    type="email" 
                    required
                    placeholder="Enter email..." 
                    value={emails.buyAndBuild}
                    onChange={(e) => setEmails(prev => ({ ...prev, buyAndBuild: e.target.value }))}
                    className="flex-grow p-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-[#18452E] outline-none"
                  />
                  <button type="submit" className="px-3 bg-[#18452E] text-white rounded-xl text-xs font-semibold hover:bg-[#18452E] cursor-pointer">
                    Join
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* FRAUD DISCLAIMER BOX REPEATED IN FULL HERE */}
      <div className="bg-rose-50 border-2 border-rose-200 p-6 sm:p-8 rounded-[var(--radius-large)] space-y-3.5 shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 text-rose-800">
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <h4 className="font-display font-semibold text-xs sm:text-sm uppercase tracking-wider">
            CRITICAL ANTI-FRAUD DISCLOSURE &amp; COMPLIANCE NOTICE
          </h4>
        </div>
        <div className="text-#132A1D text-xs leading-relaxed font-normal space-y-2 font-sans">
          <p>
            Please take extreme warning: <strong>Unity Homes &amp; Properties Ltd.</strong> does not operate offline WhatsApp agent networks, and we strictly forbid soliciting direct cash remittances in person or via unlisted accounts. All financial allocations—including rents, leases, and land purchases—remain strictly recorded under designated, automated legal security accounts where double-checks are verified before clearance is logged on-screen.
          </p>
          <p>
            We require all property tenants and land buyers to actively confirm coordinate survey authenticity prior to committing capital. Ensure your surveyor charts physical coordinates againstSURCON registries.
          </p>
          <p className="text-[11px] font-mono text-rose-800 font-semibold uppercase tracking-wider">
            Our absolute operating mandate remains: Don&apos;t Buy Wahala! Report any unauthorized demands.
          </p>
        </div>
      </div>

    </div>
  );
}
