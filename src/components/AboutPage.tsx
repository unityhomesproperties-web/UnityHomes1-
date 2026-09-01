import React from 'react';
import { Award, Compass, HeartHandshake, ShieldCheck, CheckCircle2, Landmark, HelpCircle } from 'lucide-react';

interface AboutPageProps {
  navigate: (path: string, params?: any) => void;
}

export default function AboutPage({ navigate }: AboutPageProps) {
  return (
    <div className="min-h-screen py-16 px-4 md:px-8 max-w-5xl mx-auto w-full space-y-16">
      
      {/* HEADER SECTION - SPATIAL GLASS PANEL */}
      <div className="spatial-dark-glass text-white rounded-[var(--radius-large)] p-8 md:p-14 text-center shadow-sm relative overflow-hidden glow-border">
        {/* Glow orb effect */}
        <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full bg-[#18452E]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-20 w-72 h-72 rounded-full bg-[#6FBE45]/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <span className="text-[10px] sm:text-xs uppercase font-mono font-semibold tracking-widest text-[#6FBE45] bg-[#18452E]/40 px-3.5 py-1.5 rounded-full border border-[#6FBE45]/30">
            OUR FOUNDATIONAL MISSION
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-white leading-tight mt-2">
            Nigeria&apos;s Cleanest Property Ecosystem
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 font-normal max-w-2xl mx-auto leading-relaxed mt-4">
            Eliminating structural crack surprises, double-allocated land litigation, and unchecked landlord tenancy disputes. Established in Lagos, Nigeria.
          </p>
        </div>
      </div>

      {/* CORE FOUNDER STORY STORY - 3 PARAGRAPHS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6 text-#132A1D font-sans text-xs sm:text-sm leading-relaxed font-normal">
          <span className="text-[10px] font-mono font-semibold text-[#6FBE45] tracking-widest uppercase block">
            HOW WE WERE FORMED
          </span>
          <h2 className="text-2xl font-display font-semibold text-[#18452E]">
            The Olayinka Ayodele Story
          </h2>
          <p>
            Unity Homes &amp; Properties Ltd. was born out of critical operational necessity. Our founder, <strong>Olayinka Ayodele</strong>, witnessed firsthand the severe emotional and financial trauma diaspora and domestic property buyers faced—ranging from fake surveyors forging charting records to developers building on swamp coordinates without structure engineering clearance.
          </p>
          <p>
            In Nigeria&apos;s rapidly growing real estate landscape, buying a simple parcel of land frequently turned into a multi-year litigation nightmare due to overlapping claims, land grabs, and falsified layout drawings. Realizing that brokers were merely pushing transactions without auditing titles, Olayinka decided it was time to establish a direct, systemic barrier to real estate fraud.
          </p>
          <p>
            Instead of building just another agency platform, Olayinka designed a strict, zero-trust <strong>Property Operating System</strong> (OS). Every parcel listed here maps to SURCON-certified survey coordinates, and every rental agreement incorporates structured landlord-tenant mediation protocols, establishing a secure environment for families to find and hold clear properties.
          </p>
          
          <div className="p-5 spatial-glass border-l-4 border-[#6FBE45] rounded-r-2xl font-sans mt-6">
            <p className="text-xs font-semibold text-[#18452E] italic leading-relaxed">
              &quot;We don&apos;t sell houses. We sell legal and structural clarity. In a market plagued with uncertainty, our absolute operating vow remains: Don&apos;t Buy Wahala.&quot;
            </p>
            <span className="block text-[10px] font-mono text-[#6FBE45] mt-2 font-semibold">— OLAYINKA AYODELE, FOUNDER</span>
          </div>
        </div>

        {/* MISSION STATEMENT DISPLAY */}
        <div className="spatial-glass border border-stone-200/60 rounded-[var(--radius-large)] p-8 space-y-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#18452E]/10 flex items-center justify-center text-[#18452E]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-[#18452E] text-sm tracking-wide uppercase">
                Our Immutable Mission
              </h3>
              <p className="text-[10px] text-stone-400 font-mono">EST. LAGOS, NIGERIA</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-#6B7280 leading-relaxed font-normal">
            To provide a fully verified, transparent real estate operational mesh for Nigeria that secures the tenant&apos;s lease rights, ensures structural safety through professional certification, hides no hidden listing fees, and guarantees absolute transaction safety.
          </p>
          
          <div className="pt-4 border-t border-stone-200 space-y-3 font-sans text-xs">
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#18452E] shrink-0 mt-0.5" />
              <span className="text-#6B7280"><strong>100% Survey Vetted:</strong> Complete SURCON coordinates verification.</span>
            </div>
            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#18452E] shrink-0 mt-0.5" />
              <span className="text-#6B7280"><strong>Arbitrated Deposits:</strong> Secure caution deposits.</span>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT MAKES US DIFFERENT BLOCKS - GOLD LEFT BORDERS */}
      <div className="space-y-6">
        <div className="text-center">
          <span className="text-[9px] font-mono font-semibold text-[#6FBE45] tracking-widest uppercase block">OPERATING PILLARS</span>
          <h2 className="text-2xl font-display font-semibold text-[#18452E] mt-1">What Makes Us Different</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Blocks with gold left border */}
          <div className="bg-white border-l-4 border-l-[#6FBE45] border border-stone-200 rounded-r-2xl p-6 space-y-2 shadow-xs spatial-glow-subtle">
            <ShieldCheck className="w-6 h-6 text-[#18452E]" />
            <h3 className="font-display font-semibold text-sm text-[#18452E]">SURCON Standardized Listings</h3>
            <p className="text-[11px] text-stone-500 leading-relaxed font-normal">
              Every single listing coordinate chart displayed on our platform is dynamically validated against certified Surveyor Registry datasets. You get exact mapping, zero double-allocation plots, and zero imaginary survey plans.
            </p>
          </div>

          <div className="bg-white border-l-4 border-l-[#6FBE45] border border-stone-200 rounded-r-2xl p-6 space-y-2 shadow-xs spatial-glow-subtle">
            <Award className="w-6 h-6 text-emerald-800" />
            <h3 className="font-display font-semibold text-sm text-[#18452E]">Independent COREN Audits</h3>
            <p className="text-[11px] text-stone-500 leading-relaxed font-normal">
              We require fully independent registered structural engineering review signatures (COREN status checked) for multi-story properties, validating concrete load factors and swamp soil foundation pillars beforehand.
            </p>
          </div>

          <div className="bg-white border-l-4 border-l-[#6FBE45] border border-stone-200 rounded-r-2xl p-6 space-y-2 shadow-xs spatial-glow-subtle">
            <Compass className="w-6 h-6 text-teal-700" />
            <h3 className="font-display font-semibold text-sm text-[#18452E]">Caution Deposit Mediation</h3>
            <p className="text-[11px] text-stone-500 leading-relaxed font-normal">
              Caution deposits are held by the landlord directly. Any dispute over a caution deposit is mediated by Unity Homes admin using documented evidence including the Damage Reports feature. Unity Homes never holds, locks, or moves tenant money at any point.
            </p>
          </div>

          <div className="bg-white border-l-4 border-l-[#6FBE45] border border-stone-200 rounded-r-2xl p-6 space-y-2 shadow-xs spatial-glow-subtle">
            <HeartHandshake className="w-6 h-6 text-[#6FBE45]" />
            <h3 className="font-display font-semibold text-sm text-[#18452E]">Certified Professional Panels</h3>
            <p className="text-[11px] text-stone-500 leading-relaxed font-normal">
              We only hook you up with verified industry experts. Real lawyers check property title validity, real surveyors chart the physical earth, and specialized property management companies oversee direct operations.
            </p>
          </div>
        </div>
      </div>

      {/* REGULATORY COMMITMENTS - CAC, LASRERA, ESVARBON */}
      <div className="spatial-glass rounded-2xl p-8 border border-stone-200/60 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-stone-200 pb-4">
          <Landmark className="w-5 h-5 text-[#18452E]" />
          <div>
            <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase tracking-wider">
              Regulatory Commitments &amp; Authorisations
            </h3>
            <p className="text-[10px] text-stone-500 mt-0.5">We operate strictly under authorized Nigerian real estate regulatory frameworks.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
          <div className="space-y-1.5 p-4 bg-[#F0F8F4] rounded-xl border border-[#18452E]/10">
            <h4 className="font-semibold text-[#18452E] tracking-normal font-display">CAC Compliance Vow</h4>
            <p className="text-#6B7280 text-[11px] leading-relaxed font-normal">
              Unity Homes &amp; Properties Ltd is duly incorporated with the Corporate Affairs Commission under Registered Charter Number: <strong>RC-1849120</strong>, operating with authorized legal power.
            </p>
          </div>
          <div className="space-y-1.5 p-4 bg-[#F0F8F4] rounded-xl border border-[#18452E]/10">
            <h4 className="font-semibold text-[#18452E] tracking-normal font-display">LASRERA Registered Frameworks</h4>
            <p className="text-#6B7280 text-[11px] leading-relaxed font-normal">
              We operate in full alignment with the Lagos State Real Estate Regulatory Authority. All listings are subject to the LASRERA fair tenancy practices act guidelines.
            </p>
          </div>
          <div className="space-y-1.5 p-4 bg-[#F0F8F4] rounded-xl border border-[#18452E]/10">
            <h4 className="font-semibold text-[#18452E] tracking-normal font-display">ESVARBON Valuer Access</h4>
            <p className="text-#6B7280 text-[11px] leading-relaxed font-normal">
              Our partner properties are evaluated by professionals certified in compliance with the Estate Surveyors and Valuers Registration Board of Nigeria, preventing fake appraisals.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-stone-50 p-4 rounded-xl border border-stone-200">
          <p className="text-[11px] text-#6B7280 font-normal text-center sm:text-left">
            Verify our active subscription licensing fees details or join our partner networks.
          </p>
          <button
            onClick={() => navigate('/pricing-and-services')}
            className="px-5 py-2.5 bg-[#18452E] hover:bg-[#18452E] text-white text-xs font-semibold rounded-xl shadow-md transition shrink-0 cursor-pointer"
          >
            Pricing and Services
          </button>
        </div>
      </div>

      {/* FOOTER FRAUD VOW */}
      <p className="text-center text-[10px] text-[#6FBE45] font-mono font-medium tracking-wide">
        <em>Don&apos;t Buy Wahala</em> &bull; Authorized Unity Homes Corporate Office
      </p>

    </div>
  );
}
