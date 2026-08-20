import React, { useState } from 'react';
import { Play, ShieldAlert, Award, ArrowRight, LayoutDashboard, Database, Activity, BarChart2 } from 'lucide-react';

interface DemoPageProps {
  navigate: (path: string, params?: any) => void;
  onQuickLogin?: (role: 'Admin' | 'Landlord' | 'Tenant' | 'Shortlet Manager' | 'PMC') => void;
}

export default function DemoPage({ navigate, onQuickLogin }: DemoPageProps) {
  const [activeTab, setActiveTab] = useState<'Landlords' | 'Shortlet' | 'Tenants' | 'PMC'>('Landlords');

  const tabs = [
    { id: 'Landlords', label: 'For Landlords', role: 'Landlord' as const },
    { id: 'Shortlet', label: 'For Shortlet Managers', role: 'Shortlet Manager' as const },
    { id: 'Tenants', label: 'For Tenants', role: 'Tenant' as const },
    { id: 'PMC', label: 'For PM Companies', role: 'PMC' as const }
  ];

  const videoMeta = {
    Landlords: {
      title: 'Vetted Landlord Ledger Configuration & WhatsApp Sequence Demo',
      desc: 'Learn how to register property title coordinates, map bank accounts securely, and trigger the ten-touch tapered rent reminders automatically.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    Shortlet: {
      title: 'Shortlet Guest Register, Remittance Calculations & Payouts',
      desc: 'Watch our automated remittance form engine calculate landlord/shortlet manager rent divisions and remittance payouts directly.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    Tenants: {
      title: 'Tenant Verification Code & Caution Deposit Refund Flow',
      desc: 'A complete guide on entering rent verification tags (UH-LANDLORD-XXXX) and claiming refundable deposits safely on-screen.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    PMC: {
      title: 'Property Management Corporate Portfolio Multi-Landlord Split',
      desc: 'A walkthrough of collection manager role permission levels, portfolio metrics toggles, and dynamic report export templates.',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    }
  };

  const handleDemoWhatsApp = () => {
    const text = encodeURIComponent('Hello Unity Homes Team, I am browsing your demo page and would like to coordinate a real interactive custom demo zoom walk with our group.');
    try {
      window.open(`https://wa.me/2348145550012?text=${text}`, '_blank');
    } catch (e) {
      console.warn('window.open blocked in current environment, redirecting via location.href', e);
      window.location.href = `https://wa.me/2348145550012?text=${text}`;
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-6xl mx-auto w-full">
      
      {/* HEADER GREEN BOX */}
      <div className="bg-[#18452E] text-white rounded-3xl p-8 md:p-12 text-center mb-10 shadow-sm">
        <span className="text-xs uppercase font-mono font-bold tracking-widest text-[#C9A84C] bg-[#18452E]/30 px-3.5 py-1.5 rounded-full border border-[#C9A84C]/20">
          SYSTEM PREVIEWS
        </span>
        <h1 className="text-3xl md:text-4.5xl font-display font-black text-white mt-3">
          See Unity Homes In Action
        </h1>
        <p className="text-xs sm:text-sm text-stone-200 font-light max-w-xl mx-auto mt-2 leading-relaxed">
          Explore walk-around recordings of our property operations screens, live remind engines, and landlord split wallets.
        </p>
      </div>

      {/* PERSISTENT GOLD DEMO ALERT BANNER */}
      <div className="mb-8 bg-[#C9A84C]/15 border-l-4 border-[#C9A84C] p-3 text-xs text-[#18452E] font-mono font-bold flex items-center space-x-2 rounded-r-lg shadow-inner">
        <ShieldAlert className="w-5 h-5 text-[#C9A84C] shrink-0" />
        <span>Sample data shown inside recordings and dashboard modules is for demonstration purposes only.</span>
      </div>

      {/* DEMO TABS */}
      <div className="flex flex-wrap border-b border-stone-200 pb-2 mb-8 gap-1.5 justify-center md:justify-start">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setActiveTab(tb.id as any)}
            className={`px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold border cursor-pointer transition ${
              activeTab === tb.id 
                ? 'bg-[#18452E] text-white border-[#18452E]' 
                : 'text-stone-500 bg-white border-stone-200 hover:bg-stone-50'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* Left Column: Recording placeholder */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-stone-200 shadow-md bg-[#18452E]/5 flex items-center justify-center">
            {/* Embedded 16:9 frame container */}
            <iframe
              className="absolute inset-0 w-full h-full"
              src={videoMeta[activeTab].embedUrl}
              title={videoMeta[activeTab].title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div>
            <h3 className="font-display font-black text-base text-[#18452E]">
              ✦ Video: {videoMeta[activeTab].title}
            </h3>
            <p className="text-xs text-stone-500 mt-1 font-light leading-relaxed">
              {videoMeta[activeTab].desc}
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Quick Login Simulation Launcher! */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#18452E] rounded-2xl p-6 shadow-sm text-white">
            <div className="flex items-center space-x-2 mb-3">
              <BarChart2 className="w-6 h-6 text-[#C9A84C]" />
              <h3 className="font-display font-black text-white text-lg">
                Performance Center
              </h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed mb-4 font-light">
              Don't want to log in? Instantly explore our simulated analytics, generated reports, and proprietary portfolio health scores right now.
            </p>
            <button
              onClick={() => navigate('/performance-demo')}
              className="w-full py-3.5 bg-[#C9A84C] text-[#18452E] hover:bg-white rounded-xl font-bold flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <BarChart2 className="w-5 h-5" />
              <span>Enter Performance Center</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border-2 border-dashed border-[#C9A84C]/40 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-[#18452E]" />
            <h3 className="font-display font-extrabold text-[#18452E] text-sm">
              Live Clickable Sandbox
            </h3>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed mb-4 font-light">
            Skip registration. Directly launch into pre-seeded credentials for each workspace role to inspect the ledger structures yourself.
          </p>

          <div className="space-y-2">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                onClick={() => {
                  if (onQuickLogin) {
                    onQuickLogin(tb.role);
                    navigate('/dashboard');
                  } else {
                    alert('Redirecting to secure workspace login...');
                    navigate('/login');
                  }
                }}
                className="w-full p-3 bg-[#F0F8F4] hover:bg-[#18452E] group hover:text-white border border-stone-200 rounded-xl flex items-center justify-between transition text-left cursor-pointer"
              >
                <div>
                  <span className="block text-xs font-bold text-[#18452E] group-hover:text-white leading-tight">
                    Simulate {tb.label}
                  </span>
                  <span className="block text-[9px] text-stone-500 group-hover:text-stone-300 font-mono tracking-wide mt-0.5">
                    Click to load preset dashboard
                  </span>
                </div>
                <LayoutDashboard className="w-4 h-4 text-[#C9A84C] group-hover:text-white shrink-0" />
              </button>
            ))}
            
            {/* Admin entry */}
            <button
              onClick={() => {
                if (onQuickLogin) {
                  onQuickLogin('Admin');
                  navigate('/dashboard');
                } else {
                  navigate('/login');
                }
              }}
              className="w-full p-3 bg-stone-50 hover:bg-[#18452E] group hover:text-white border border-stone-200 rounded-xl flex items-center justify-between transition text-left cursor-pointer"
            >
              <div>
                <span className="block text-xs font-bold text-stone-900 group-hover:text-white leading-tight">
                  Simulate Admin Desk
                </span>
                <span className="block text-[9px] text-stone-500 group-hover:text-stone-300 font-mono mt-0.5">
                  Verify registrations &amp; applications
                </span>
              </div>
              <Database className="w-4 h-4 text-[#C9A84C] group-hover:text-white shrink-0" />
            </button>
          </div>

          <div className="mt-5 p-3 bg-stone-50 border border-stone-200 rounded-lg text-[10px] text-#6B7280 text-center uppercase tracking-wide font-mono">
            Requires zero password credentials in sandbox mode
          </div>
        </div>
        </div>

      </div>

      {/* CALL TO ACTION BUTTON REUSING WHATSAPP */}
      <div className="bg-[#C9A84C] text-[#18452E] p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="max-w-xl text-center md:text-left">
          <h3 className="font-display font-black text-lg">
            Have Questions About Operating System Scoping?
          </h3>
          <p className="text-xs font-light mt-1 text-[#18452E] leading-normal">
            Request an structured zoom onboarding walk-around for your real estate company or asset management team directly with Olayinka Ayodele.
          </p>
        </div>
        <button
          onClick={handleDemoWhatsApp}
          className="px-6 py-3.5 bg-[#18452E] text-white hover:bg-[#18452E] text-xs font-bold rounded-xl shadow-lg shrink-0 flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Request Corporate Demo Introduce</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
