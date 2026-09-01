import React, { useState } from 'react';
import { Search, MapPin, Shield, Star, Award, MessageSquare, ArrowRight, Play, Check, ChevronRight, CheckCircle2, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Property, Professional } from '../types';
import { initialProperties, initialProfessionals } from '../data';

interface LandingPageProps {
  navigate: (path: string, params?: any) => void;
  onSearchQuery?: (filters: any) => void;
}

export default function LandingPage({ navigate, onSearchQuery }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'Buy' | 'Rent' | 'Land' | 'Lease'>('Buy');
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    priceRange: '',
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery) {
      onSearchQuery({ ...filters, tab: activeTab });
    }
    // Navigate to properties map/list view
    if (activeTab === 'Rent') {
      navigate('/rent');
    } else if (activeTab === 'Lease') {
      navigate('/lease');
    } else {
      navigate('/properties');
    }
  };

  // Get first 6 properties for featured displays
  const featured = initialProperties.slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      
                  {/* HERO SECTION */}
      <section className="relative min-h-[620px] md:min-h-[680px] bg-slate-950 text-white flex flex-col justify-center px-4 md:px-8 py-16 md:py-24 overflow-hidden">
        {/* Real Estate Premium Aerial Overlay Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/about_us.jpg" 
            alt="Premium Aerial Real Estate Nigeria" 
            className="w-full h-full object-cover opacity-30 scale-105 transition-transform duration-[10s] ease-out hover:scale-100"
          />
          {/* Ambient Golden light overlay */}
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#6FBE45]/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Pill Badge */}
            <div className="self-start flex items-center space-x-2 bg-[#18452E]/20 border border-[#18452E]/40 px-4 py-2 rounded-full backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 bg-[#16A34A] rounded-full animate-ping"></span>
              <span className="text-[11px] font-mono tracking-widest font-semibold text-[#6FBE45] uppercase">
                Nigeria&apos;s Premium Property Operating System
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5.5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-white">
              <span className="block">Acquire &amp; Lease Vetted Property</span>
              <span className="block text-[#6FBE45] mt-2 relative inline-block">
                Without Fear of Fraud.
                <span className="absolute left-0 bottom-1 w-full h-[3px] bg-[#6FBE45]/30 rounded"></span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-stone-300 text-sm md:text-base font-normal leading-relaxed max-w-xl">
              We coordinate real-estate transactions with absolute zero-trust verification. Secure your high-end rentals, certified legal advisors, and structural engineers on Nigeria&apos;s most rigorous protected routing network.
            </p>

            {/* Quick Contact buttons */}
            <div className="flex flex-wrap gap-4 pt-3">
              <button 
                onClick={() => navigate('/properties')}
                className="px-7 py-4 bg-[#18452E] text-white hover:bg-[#18452E] rounded-xl font-semibold text-xs uppercase tracking-wider shadow-sm flex items-center space-x-2.5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <span>Browse Verified Properties</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/connect-with-a-professional')}
                className="px-7 py-4 bg-white text-[#18452E] hover:bg-stone-50 rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-[#E2E8E4]"
              >
                Hire a Professional
              </button>
              <button 
                onClick={() => navigate('/pricing-and-services')}
                className="px-7 py-4 bg-white text-[#18452E] hover:bg-stone-50 rounded-xl font-semibold text-xs uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-[#E2E8E4]"
              >
                Pricing and Services
              </button>
            </div>

          </div>

          <div className="lg:col-span-5 w-full">
            {/* FLOATING SEARCH CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-[#E2E8E4]/60 overflow-hidden p-6 md:p-7 text-slate-800 relative"
            >
              {/* Premium golden tag accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#6FBE45]"></div>

              {/* Five Tabs */}
              <div className="flex space-x-1 border-b border-stone-100 pb-3.5 mb-5 mt-1 overflow-x-auto scrollbar-hide">
                {(['Buy', 'Rent', 'Land', 'Lease'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-2 px-3 flex-1 text-xs font-semibold text-center rounded-lg cursor-pointer transition-all duration-300 uppercase tracking-wider shrink-0 ${
                      activeTab === tab 
                        ? 'bg-[#18452E] text-white shadow-md' 
                        : 'text-stone-500 hover:bg-[#F0F8F4]/80 hover:text-[#18452E]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                {/* Mortgage Tab (Coming Soon) */}
                <button
                  className="py-2 px-3 flex-1 text-xs font-semibold text-center rounded-lg cursor-not-allowed transition-all duration-300 uppercase tracking-wider shrink-0 bg-[#F8FAFC] text-stone-400 border border-stone-200 relative group"
                  onClick={(e) => e.preventDefault()}
                >
                  Mortgage
                  <span className="absolute -top-2 -right-2 bg-[#6FBE45] text-[8px] text-white px-1.5 py-0.5 rounded font-semibold shadow-sm whitespace-nowrap">
                    Soon
                  </span>
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-widest ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. Ikoyi, Victoria Island, Maitama"
                      className="w-full pl-10 pr-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-widest ml-1">Property Type</label>
                    <select 
                      className="w-full px-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all appearance-none cursor-pointer text-slate-700"
                      value={filters.propertyType}
                      onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                    >
                      <option value="">Any Type</option>
                      <option value="House">House / Duplex</option>
                      <option value="Apartment">Apartment / Flat</option>
                      <option value="Commercial">Commercial / Office</option>
                      <option value="Land">Land</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-widest ml-1">Max Price</label>
                    <select 
                      className="w-full px-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#18452E]/20 focus:border-[#18452E] transition-all appearance-none cursor-pointer text-slate-700"
                      value={filters.priceRange}
                      onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    >
                      <option value="">Any Price</option>
                      <option value="50M">Under ₦50M</option>
                      <option value="100M">Under ₦100M</option>
                      <option value="500M">Under ₦500M</option>
                      <option value="1B">Under ₦1B</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-2 py-4 bg-[#18452E] hover:bg-[#18452E] text-white rounded-xl font-semibold text-sm shadow-[0_8px_20px_rgba(24,69,46,0.25)] transition-all flex items-center justify-center space-x-2 cursor-pointer group"
                >
                  <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Search {activeTab} Properties</span>
                </button>
              </form>

            </motion.div>
          </div>

        </div>
      </section>

      {/* TRUST BAR STRIP */}
      <div className="bg-white border-y border-stone-200 py-8 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <span className="block text-3xl sm:text-4xl font-display font-semibold text-[#18452E]">
              18,200+
            </span>
            <span className="block text-xs font-mono font-semibold uppercase tracking-widest text-[#6FBE45] mt-1">
              Nigerians Protected
            </span>
          </div>
          <div className="border-l border-stone-200 lg:border-l lg:border-stone-200">
            <span className="block text-3xl sm:text-4xl font-display font-semibold text-[#18452E]">
              150+
            </span>
            <span className="block text-xs font-mono font-semibold uppercase tracking-widest text-[#6FBE45] mt-1">
              Verified Professionals
            </span>
          </div>
          <div className="border-l border-stone-200 lg:border-l lg:border-stone-200">
            <span className="block text-3xl sm:text-4xl font-display font-semibold text-[#18452E]">
              1,240+
            </span>
            <span className="block text-xs font-mono font-semibold uppercase tracking-widest text-[#6FBE45] mt-1">
              Properties Managed
            </span>
          </div>
          <div className="border-l border-stone-200 lg:border-l lg:border-stone-200">
            <span className="block text-3xl sm:text-4xl font-display font-semibold text-[#18452E]">
              8+
            </span>
            <span className="block text-xs font-mono font-semibold uppercase tracking-widest text-[#6FBE45] mt-1">
              States Active
            </span>
          </div>
        </div>
      </div>

      {/* SERVICES GRID */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[10px] uppercase font-mono font-semibold tracking-widest text-[#6FBE45] bg-[#6FBE45]/10 px-3 py-1.5 rounded-full">
            UNITY PLATFORM UTILITIES
          </span>
          <h2 className="text-3xl md:text-4.5xl font-display font-semibold text-[#18452E] mt-4">
            Fully Verified Property Services
          </h2>
          <p className="text-#6B7280 text-sm mt-3 font-sans font-normal max-w-xl mx-auto leading-relaxed">
            We operate strict structural checks, trust structures, and professional introduced channels with absolute transaction integrity.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. Verified Rentals (Live) */}
          <div className="bg-white rounded-2xl border border-stone-200/60 p-7 hover:shadow-sm hover:border-stone-200 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#F0F8F4] text-[#18452E] rounded-xl transition-transform duration-300 group-hover:scale-105">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[9px] font-mono font-semibold tracking-widest bg-emerald-100 text-emerald-800 uppercase border border-emerald-200/50">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
                  <span>LIVE</span>
                </span>
              </div>
              <h3 className="font-display font-semibold text-[#18452E] text-lg group-hover:text-[#18452E] transition-colors duration-300">Verified Rentals</h3>
              <p className="text-xs text-stone-500 mt-3 leading-relaxed font-normal">
                Skip agent fraud. Real-time listings connected directly to verified titleholders with structured caution deposit protection and clear mediation.
              </p>
            </div>
            <button 
              onClick={() => navigate('/rent')}
              className="mt-6 flex items-center space-x-1.5 text-xs font-semibold text-[#18452E] group/btn cursor-pointer"
            >
              <span className="uppercase tracking-wider">Explore Rentals</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </button>
          </div>

          {/* 2. Meet Professionals (Live) */}
          <div className="bg-white rounded-2xl border border-stone-200/60 p-7 hover:shadow-sm hover:border-stone-200 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#F0F8F4] text-[#18452E] rounded-xl transition-transform duration-300 group-hover:scale-105">
                  <Star className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[9px] font-mono font-semibold tracking-widest bg-emerald-100 text-emerald-800 uppercase border border-emerald-200/50">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
                  <span>LIVE</span>
                </span>
              </div>
              <h3 className="font-display font-semibold text-[#18452E] text-lg group-hover:text-[#18452E] transition-colors duration-300">Meet Verified Professionals</h3>
              <p className="text-xs text-stone-500 mt-3 leading-relaxed font-normal">
                Connect directly with Supreme Court Lawyers, SURCON-registered surveyors, and COREN-licensed structural engineers scrutinized by our founder.
              </p>
            </div>
            <button 
              onClick={() => navigate('/professionals')}
              className="mt-6 flex items-center space-x-1.5 text-xs font-semibold text-[#18452E] group/btn cursor-pointer"
            >
              <span className="uppercase tracking-wider">Find Professionals</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </button>
          </div>

          {/* 3. Property Management (Live) */}
          <div className="bg-white rounded-2xl border border-stone-200/60 p-7 hover:shadow-sm hover:border-stone-200 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#F0F8F4] text-[#18452E] rounded-xl transition-transform duration-300 group-hover:scale-105">
                  <Award className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[9px] font-mono font-semibold tracking-widest bg-emerald-100 text-emerald-800 uppercase border border-emerald-200/50">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span>
                  <span>LIVE</span>
                </span>
              </div>
              <h3 className="font-display font-semibold text-[#18452E] text-lg group-hover:text-[#18452E] transition-colors duration-300">Property and Shortlet Management Plans</h3>
              <p className="text-xs text-stone-500 mt-3 leading-relaxed font-normal">
                Transparent subscription plans for landlords managing long-term rentals or serviced apartments.
              </p>
            </div>
            <button 
              onClick={() => navigate('/pricing-and-services')}
              className="mt-6 flex items-center space-x-1.5 text-xs font-semibold text-[#18452E] group/btn cursor-pointer"
            >
              <span className="uppercase tracking-wider">View Plans</span>
              <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </button>
          </div>

          {/* 4. Payment Plan Houses (Coming Soon) */}
          <div 
            onClick={() => navigate('/coming-soon')}
            className="bg-stone-50/70 rounded-2xl border border-stone-200 p-7 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-[#6FBE45] hover:shadow-sm transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-stone-50 text-[#18452E] rounded-xl group-hover:bg-[#6FBE45]/20 transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-mono font-semibold tracking-widest bg-[#6FBE45]/15 text-[#6FBE45] uppercase border border-[#6FBE45]/30">
                  Coming Soon
                </span>
              </div>
              <h3 className="font-display font-semibold text-[#18452E] text-lg group-hover:text-[#18452E] transition-colors">Payment Plan Houses</h3>
              <p className="text-xs text-#6B7280 mt-3 leading-relaxed font-normal">
                Structured legal contracts for buying property increment-by-increment directly from vetted developers with no mid-way price changes.
              </p>
            </div>
            <div className="mt-6 pt-2 flex items-center justify-between text-xs font-semibold text-[#6FBE45] group-hover:translate-x-1 transition-transform">
              <span className="uppercase tracking-wider">Preview Pipeline &rarr;</span>
            </div>
          </div>

          {/* 5. Mortgage Ready Properties (Coming Soon) */}
          <div 
            onClick={() => navigate('/coming-soon')}
            className="bg-stone-50/70 rounded-2xl border border-stone-200 p-7 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-[#6FBE45] hover:shadow-sm transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-stone-50 text-[#18452E] rounded-xl group-hover:bg-[#6FBE45]/20 transition-colors">
                  <Star className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-mono font-semibold tracking-widest bg-[#6FBE45]/15 text-[#6FBE45] uppercase border border-[#6FBE45]/30">
                  Coming Soon
                </span>
              </div>
              <h3 className="font-display font-semibold text-[#18452E] text-lg group-hover:text-[#18452E] transition-colors">Mortgage Ready Properties</h3>
              <p className="text-xs text-#6B7280 mt-3 leading-relaxed font-normal">
                Inspected, fully perfected governor-consent assets with verified ownership guarantees waiting to slot seamlessly into primary lending banks.
              </p>
            </div>
            <div className="mt-6 pt-2 flex items-center justify-between text-xs font-semibold text-[#6FBE45] group-hover:translate-x-1 transition-transform">
              <span className="uppercase tracking-wider">Preview Pipeline &rarr;</span>
            </div>
          </div>

          {/* 6. Buy & Build Land (Coming Soon) */}
          <div 
            onClick={() => navigate('/coming-soon')}
            className="bg-stone-50/70 rounded-2xl border border-stone-200 p-7 flex flex-col justify-between relative overflow-hidden cursor-pointer hover:border-[#6FBE45] hover:shadow-sm transition-all group"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-stone-50 text-[#18452E] rounded-xl group-hover:bg-[#6FBE45]/20 transition-colors">
                  <Award className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-mono font-semibold tracking-widest bg-[#6FBE45]/15 text-[#6FBE45] uppercase border border-[#6FBE45]/30">
                  Coming Soon
                </span>
              </div>
              <h3 className="font-display font-semibold text-[#18452E] text-lg group-hover:text-[#18452E] transition-colors">Buy &amp; Build Land</h3>
              <p className="text-xs text-#6B7280 mt-3 leading-relaxed font-normal">
                Red-line free land coordinates mapped by registered surveyors, backed by absolute security of title, and ready for swift transfer.
              </p>
            </div>
            <div className="mt-6 pt-2 flex items-center justify-between text-xs font-semibold text-[#6FBE45] group-hover:translate-x-1 transition-transform">
              <span className="uppercase tracking-wider">Preview Pipeline &rarr;</span>
            </div>
          </div>

        </div>

        {/* Mandatory Warning Warning Warning */}
        <div className="mt-8 bg-amber-50/40 border-l-4 border-red-600 rounded-r-xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="text-red-700 bg-red-100 p-1 rounded-full shrink-0">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <span className="block font-mono font-semibold text-xs uppercase tracking-wider text-red-700">
                OFFICIAL CONSUMER DISCLOSURE
              </span>
              <p className="text-xs text-[#18452E] mt-1 leading-relaxed">
                Unity Homes and Properties Ltd has not yet launched these categories. We are not accepting payments, deposits, or reservations for them. Anyone claiming to represent Unity Homes for these services before our official launch is not authorised.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-[#E2E8E4]/30 border-y border-stone-200 px-4 md:px-8 w-full">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-mono font-semibold tracking-widest text-[#6FBE45]">
              HOW IT OPERATES
            </span>
            <h2 className="text-2xl sm:text-3.5xl font-display font-semibold text-[#18452E] mt-1">
              Four Steps to Clean Real Estate
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="flex items-start space-x-3.5 bg-white p-5 rounded-xl border border-stone-200/70">
              <div className="w-8 h-8 rounded-full bg-[#6FBE45] text-[#18452E] font-mono font-semibold text-sm flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm text-[#18452E]">Browse Verified Listings</h4>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  Every property has physical site verification checkpoints before publishing. No ghost listings.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-white p-5 rounded-xl border border-stone-200/70">
              <div className="w-8 h-8 rounded-full bg-[#6FBE45] text-[#18452E] font-mono font-semibold text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm text-[#18452E]">Choose Your Service</h4>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  Rent instantly, hire supreme litigation lawyers, structural engineers, or perfect your lease.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-white p-5 rounded-xl border border-stone-200/70">
              <div className="w-8 h-8 rounded-full bg-[#6FBE45] text-[#18452E] font-mono font-semibold text-sm flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm text-[#18452E]">Pay Securely via Paystack</h4>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  Our transparent trust processes and introductions are processed securely through certified Paystack APIs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-white p-5 rounded-xl border border-stone-200/70">
              <div className="w-8 h-8 rounded-full bg-[#6FBE45] text-[#18452E] font-mono font-semibold text-sm flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm text-[#18452E]">We Stay Accountable</h4>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  We monitor group WhatsApp chats and enforce tenant deposits refund guarantees.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <span className="text-xs uppercase font-mono font-semibold tracking-widest text-[#6FBE45]">
              VERIFIED PORTFOLIO
            </span>
            <h2 className="text-3xl font-display font-semibold text-[#18452E] mt-1">
              Active Verified Properties
            </h2>
          </div>
          <button 
            onClick={() => navigate('/properties')}
            className="text-xs font-semibold text-[#18452E] h-10 mt-2 md:mt-0 flex items-center space-x-1 hover:underline cursor-pointer"
          >
            <span>View All Listings ({initialProperties.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of properties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((prop) => {
            // Status color matching precisely
            let statusColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200/50';
            let iconText = 'Active';
            if (prop.type === 'Shortlet') {
              statusColor = 'bg-amber-100 text-amber-800 border border-amber-200/50';
              iconText = 'Shortlet';
            } else if (prop.type === 'For Lease') {
              statusColor = 'bg-blue-100 text-blue-800 border border-blue-200/50';
              iconText = 'Lease';
            } else if (prop.type.includes('Commercial')) {
              statusColor = 'bg-purple-100 text-purple-800 border border-purple-200/50';
              iconText = 'Commercial';
            }
            return (
              <div 
                key={prop.id} 
                className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden shadow-xs hover:shadow-sm hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full group"
                id={`property-card-${prop.id}`}
              >
                <div className="relative h-56 w-full overflow-hidden bg-stone-50 shrink-0">
                  <img 
                    src={prop.photos[0]} 
                    alt={prop.title} 
                    className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 flex space-x-1.5 z-10">
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-mono font-semibold uppercase tracking-widest bg-[#16A34A] text-white shadow-xs">
                      Verified Check
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-mono font-semibold uppercase tracking-widest ${statusColor} shadow-xs`}>
                      {iconText}
                    </span>
                  </div>
                  {/* Subtle vignette shade */}
                  <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xl md:text-2xl font-display font-semibold text-[#18452E]">
                        {prop.type === 'Shortlet' ? `₦${prop.price.toLocaleString()}/night` : `₦${prop.price.toLocaleString()}/yr`}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#18452E] mt-2 line-clamp-1 group-hover:text-[#18452E] transition-colors duration-300">{prop.title}</h3>
                    <div className="flex items-center text-xs text-stone-500 mt-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#6FBE45] mr-1 shrink-0" />
                      <span className="line-clamp-1 font-semibold">{prop.location}</span>
                    </div>
                    <p className="text-xs text-#6B7280 mt-3 line-clamp-2 leading-relaxed font-normal">
                      {prop.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between">
                    <div className="flex space-x-3.5 text-xs text-stone-500 font-semibold">
                      <span className="font-mono">
                        <strong className="text-[#18452E]">{prop.bedrooms}</strong> Bed
                      </span>
                      <span className="text-stone-300">&bull;</span>
                      <span className="font-mono">
                        <strong className="text-[#18452E]">{prop.bathrooms}</strong> Bath
                      </span>
                    </div>
                    <button
                      onClick={() => navigate('/properties', { selectId: prop.id })}
                      className="px-4 py-2 border border-[#18452E]/60 text-[#18452E] hover:bg-[#18452E] hover:text-white hover:border-[#18452E] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PROFESSIONAL CATEGORIES STRIP */}
      <section className="py-16 bg-[#F0F8F4] border-t border-stone-200 px-4 md:px-8 w-full">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
            <div>
              <span className="text-xs uppercase font-mono font-semibold tracking-widest text-[#6FBE45]">
                HIRE SECURELY
              </span>
              <h2 className="text-2xl sm:text-3.5xl font-display font-semibold text-[#18452E] mt-1">
                Verified Professional Networks
              </h2>
            </div>
            <button 
              onClick={() => navigate('/professionals')}
              className="mt-2 md:mt-0 px-4 py-2 border border-[#18452E] text-[#18452E] font-semibold text-xs rounded-lg hover:bg-[#18452E]/5"
            >
              Browse Directory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-start">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-[#18452E] rounded-full flex items-center justify-center p-3">
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#6FBE45]" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 18V6" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 10C8 10 9 8 12 8C15 8 16 10 16 10" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14C8 14 9 16 12 16C15 16 16 14 16 14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-base text-[#18452E]">Real Estate Lawyers</h4>
                  <span className="font-mono text-[9px] font-semibold text-[#6FBE45] uppercase tracking-wider">Supreme Court Registry</span>
                </div>
              </div>
              <p className="text-xs text-#6B7280 leading-relaxed mb-4">
                Assistance with title documentation verification, Governor&apos;s Consent coordination, deeds extraction, and dispute clearance representation.
              </p>
              <div className="text-[11px] font-mono text-stone-500 bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1">
                Fixed connection: ₦55,000 introduced fee
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-start">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-[#18452E] rounded-full flex items-center justify-center p-3">
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#6FBE45]" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="22" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="12" x2="22" y2="8.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="12" x2="2" y2="8.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-base text-[#18452E]">Licensed Surveyors</h4>
                  <span className="font-mono text-[9px] font-semibold text-[#6FBE45] uppercase tracking-wider">SURCON Accredited Only</span>
                </div>
              </div>
              <p className="text-xs text-#6B7280 leading-relaxed mb-4">
                Execute charting calculations, boundary red-line certifications, topographical assessments, and direct verification of land coordinates.
              </p>
              <div className="text-[11px] font-mono text-stone-500 bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1">
                Charter maps checked directly
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col items-start">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-50 text-[#18452E] rounded-full flex items-center justify-center p-3">
                  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#6FBE45]" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="9" y1="3" x2="9" y2="21" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="15" y1="3" x2="15" y2="21" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="9" x2="21" y2="9" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="15" x2="21" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-base text-[#18452E]">Structural Engineers</h4>
                  <span className="font-mono text-[9px] font-semibold text-[#6FBE45] uppercase tracking-wider">COREN Registered &amp; Insured</span>
                </div>
              </div>
              <p className="text-xs text-#6B7280 leading-relaxed mb-4">
                Protect yourself from collapsed buildings. Detailed concrete integrity review, foundation slab inspection, and soil test validations.
              </p>
              <div className="text-[11px] font-mono text-stone-500 bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1">
                6-tier testing checklist applied
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOUNDER STORY STRIP */}
      <section className="py-16 bg-[#18452E] text-white px-4 md:px-8 w-full">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center space-y-6">
          <span className="font-serif text-5xl md:text-6xl text-[#6FBE45] font-semibold select-none leading-none h-6 block">
            “
          </span>
          <p className="font-serif text-base sm:text-lg md:text-xl italic font-normal leading-relaxed text-stone-100 max-w-3xl">
            Years ago, as a diasporan trying to navigate the complex real estate market in Epe, I was taken to an &apos;Eleran Igbe&apos; land location where weeds were high, and several false claims were made. I lost hard-earned savings. That agonizing moment became the seed of Unity Homes. We founded this platform to ensure that no Nigerian, at home or abroad, ever buys &apos;wahala&apos; or falls prey to fraudulent agents again.
          </p>
          <div className="pt-2">
            <span className="block font-display font-semibold text-base text-[#6FBE45]">
              Olayinka Ayodele
            </span>
            <span className="block text-[11px] font-mono uppercase tracking-widest text-[#E2E8E4]/60 mt-0.5">
              Founder &amp; Managing Director &bull; Unity Homes &amp; Properties
            </span>
          </div>
        </div>
      </section>

      {/* DON'T BUY WAHALA STRIP */}
      <section className="py-16 bg-[#18452E] text-white px-4 md:px-8 w-full border-t border-stone-200/20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-mono font-semibold tracking-widest text-[#6FBE45] uppercase">
              ANTI-FRAUD AWARENESS SERIES
            </span>
            <h2 className="text-5xl md:text-6xl font-display font-semibold text-[#6FBE45] mt-1 leading-none">
              Don&apos;t Buy Wahala
            </h2>
            <p className="text-sm text-stone-100 mt-4 leading-relaxed font-normal">
              Nigeria&apos;s leading consumer advocacy documentary and resource center. Our team goes deep into real estate scams, double sales, and mapping tricks, providing actionable guidelines for diasporan and domestic buyers.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => navigate('/performance-demo')}
              className="px-6 py-4 bg-[#6FBE45] text-[#18452E] hover:bg-[#B39340] rounded-xl font-semibold flex items-center space-x-3 transition duration-200 cursor-pointer text-sm shadow-md"
            >
              <BarChart2 className="w-5 h-5 shrink-0" />
              <span>Enter Demo Performance Center</span>
            </button>
            <button 
              onClick={() => navigate('/demo')}
              className="px-6 py-4 border-2 border-[#6FBE45] text-[#6FBE45] hover:bg-[#6FBE45] hover:text-[#18452E] rounded-xl font-semibold flex items-center space-x-3 transition duration-200 cursor-pointer text-sm shadow-md"
            >
              <Play className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
              <span>Watch the Awareness Series (Free)</span>
            </button>
          </div>
        </div>
      </section>

      {/* PARTNER NETWORK */}
      <section className="py-16 bg-white px-4 md:px-8 w-full">
        <div className="max-w-6xl mx-auto bg-[#F0F8F4] rounded-2xl border-l-[6px] border-[#6FBE45] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="max-w-xl">
            <span className="text-[10px] font-mono tracking-widest font-semibold text-[#18452E] uppercase">
              UNITY PARTNER REFERRALS
            </span>
            <h3 className="text-2xl font-display font-semibold text-[#18452E] mt-1">
              Join the Unity Homes Referrals Program
            </h3>
            <p className="text-xs text-stone-500 mt-2 leading-relaxed">
              Earn transparent referral fees by introducing diasporans or domestic renters to verified listings. We handle contracts and perfect documentation cleanly.
            </p>
          </div>
          <a 
            href="https://wa.me/2348145550012?text=Hello%20Unity%20Homes%20Team,%20I%20am%20interested%20in%20joining%20the%20Partner%20Network"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 bg-[#18452E] text-white hover:bg-[#18452E] rounded-xl font-semibold text-sm shrink-0 shadow-sm cursor-pointer text-center"
          >
            Join Partner Network
          </a>
        </div>
      </section>

      {/* CLOSING CALL TO ACTION BANNER */}
      <section className="relative py-16 text-white px-4 md:px-8 w-full border-t border-stone-200 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/images/our_services.jpg" alt="Architecture Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-transparent" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center space-y-6">
          <h2 className="text-3xl md:text-4.5xl font-display font-semibold tracking-tight leading-none max-w-2xl text-white">
            Ready to Navigate the Nigeria Real Estate Market Safely?
          </h2>
          <p className="text-sm text-white max-w-lg leading-relaxed font-normal">
            Contact us to connect with Supreme Court Land Attorneys, request verified site inspections, or configure land verification surveys.
          </p>
          <button 
            onClick={() => navigate('/connect-with-a-professional')}
            className="px-8 py-4 bg-white text-white hover:bg-stone-50 rounded-xl font-semibold font-sans tracking-wide shadow-sm flex items-center space-x-2 transition cursor-pointer"
          >
            <span>Get Connected Now</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </section>

    </div>
  );
}
