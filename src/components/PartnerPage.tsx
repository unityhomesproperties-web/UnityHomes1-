import React, { useState } from 'react';
import { Gift, Award, ShieldAlert, HeartHandshake, CheckCircle, Users, Scale, AlertCircle } from 'lucide-react';

interface PartnerPageProps {
  navigate: (path: string, params?: any) => void;
}

export default function PartnerPage({ navigate }: PartnerPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    preferredTrack: 'Landlord',
    bio: ''
  });

  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;
    setSuccess(true);
  };

  return (
    <div className="min-h-screen py-16 px-4 md:px-8 max-w-5xl mx-auto w-full space-y-16">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[10px] sm:text-xs uppercase font-mono font-semibold tracking-widest text-[#C9A84C] bg-[#18452E]/20 px-3.5 py-1.5 rounded-full border border-[#C9A84C]/25">
          COLLABORATIVE GROWTH INDEX
        </span>
        <h1 className="text-3xl md:text-5xl font-display font-semibold text-[#18452E] leading-tight">
          Refer &amp; Earn with Unity Homes
        </h1>
        <p className="text-xs sm:text-sm text-#6B7280 font-normal leading-relaxed">
          Help expand Nigeria&apos;s cleanest property ecosystem. Recommend landlords, professionals, or tenants and share in the ecosystem growth.
        </p>
      </div>

      {/* THREE REFERRAL TRACKS */}
      <div className="space-y-6">
        <h2 className="text-xl font-display font-semibold text-[#18452E] text-center">Referral Tracks &amp; Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="spatial-glass border border-stone-200/60 rounded-[var(--radius-large)] p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#18452E]/10 flex items-center justify-center text-[#18452E]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-[#18452E]">Refer a Landlord</h3>
            <div className="font-mono text-xl font-semibold text-[#18452E]">
              ₦50,000 <span className="text-xs font-normal text-#6B7280">Reward</span>
            </div>
            <p className="text-xs text-#6B7280 font-normal leading-relaxed">
              <strong>Trigger condition:</strong> Paid instantly when the referred landlord&apos;s first residential or shortlet property is certified, verified by admin, and goes live on active listing profiles.
            </p>
          </div>

          <div className="spatial-glass border border-stone-200/60 rounded-[var(--radius-large)] p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-800">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-[#18452E]">Refer a Professional</h3>
            <div className="font-mono text-xl font-semibold text-teal-800">
              ₦25,000 <span className="text-xs font-normal text-#6B7280">Reward</span>
            </div>
            <p className="text-xs text-#6B7280 font-normal leading-relaxed">
              <strong>Trigger condition:</strong> Paid in full once the referred lawyer, surveyor, or structural engineer successfully uploads accreditation credentials and activates a premium profile.
            </p>
          </div>

          <div className="spatial-glass border border-stone-200/60 rounded-[var(--radius-large)] p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center text-[#C9A84C]">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold text-base text-[#18452E]">Refer a Tenant</h3>
            <div className="font-mono text-xl font-semibold text-[#C9A84C]">
              ₦10,000 <span className="text-xs font-normal text-#6B7280">Reward</span>
            </div>
            <p className="text-xs text-#6B7280 font-normal leading-relaxed">
              <strong>Trigger condition:</strong> Paid immediately when the referred tenant gets approved for a tenant code, activates their dashboard, and has their first rental payment confirmed on their ledger.
            </p>
          </div>

        </div>
      </div>

      {/* THE THREE PARTNER TIERS */}
      <div className="space-y-6">
        <h2 className="text-xl font-display font-semibold text-[#18452E] text-center">Partner Network Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-3 shadow-xs">
            <span className="text-[10px] font-mono bg-stone-50 text-#6B7280 px-2.5 py-0.5 rounded font-semibold uppercase">
              TIER 1 &bull; STARTER
            </span>
            <h3 className="text-base font-display font-semibold text-[#18452E]">Community Partner</h3>
            <p className="text-xs text-#6B7280 font-normal leading-normal">
              For partners who complete <strong>0 to 5 successful track conversions</strong>. Standard base rewards are credited. Single portal access.
            </p>
          </div>

          <div className="bg-white border-2 border-stone-200 rounded-[var(--radius-large)] p-6 space-y-3 shadow-xs relative">
            <div className="absolute top-3 right-3 bg-[#18452E]/10 text-[#18452E] text-[8px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded">
              POPULAR
            </div>
            <span className="text-[10px] font-mono bg-[#18452E]/10 text-[#18452E] px-2.5 py-0.5 rounded font-semibold uppercase">
              TIER 2 &bull; HIGH REACH
            </span>
            <h3 className="text-base font-display font-semibold text-[#18452E]">Associate Partner</h3>
            <p className="text-xs text-#6B7280 font-normal leading-normal">
              For partners who reach <strong>6 to 20 conversions</strong>. Unlocks a <strong>10% bonus modifier</strong> on all referral cash rewards and quarterly digital networking invites.
            </p>
          </div>

          <div className="bg-white border-2 border-[#C9A84C]/25 rounded-[var(--radius-large)] p-6 space-y-3 shadow-sm relative">
            <span className="text-[10px] font-mono bg-[#C9A84C]/15 text-[#C9A84C] px-2.5 py-0.5 rounded font-semibold uppercase">
              TIER 3 &bull; INSTITUTIONAL
            </span>
            <h3 className="text-base font-display font-semibold text-[#18452E]">Strategic Partner</h3>
            <p className="text-xs text-#6B7280 font-normal leading-normal">
              For partners clearing <strong>21 or more conversions</strong>. Unlocks a <strong>20% bonus modifier</strong> on all rewards, plus a custom &quot;Strategic Portfolio Partner&quot; visual badge.
            </p>
          </div>

        </div>
      </div>

      {/* REGISTRATION FORM & RULES COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        
        {/* PARTNER REGISTRATION FORM */}
        <div className="md:col-span-5 spatial-glass border border-stone-200/60 rounded-[var(--radius-large)] p-6 shadow-sm space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="font-display font-semibold text-base text-[#18452E]">Network Registration Form</h3>
            <p className="text-[10px] text-stone-400">Join other verified partners in Nigeria today</p>
          </div>

          {success ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-display font-semibold text-sm text-emerald-950">Application Logged</h4>
              <p className="text-xs text-emerald-800 leading-normal font-normal">
                Our operations desk will review your details. Your custom partner referral link will be dispatched shortly. Don&apos;t Buy Wahala!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-#6B7280 uppercase block font-mono text-[9px]">YOUR FULL NAME</label>
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="e.g. Adebayo Ogunlesi" 
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#18452E] outline-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-#6B7280 uppercase block font-mono text-[9px]">PHONE LINE / WHATSAPP</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. +234 805 123 4567" 
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#18452E] outline-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-#6B7280 uppercase block font-mono text-[9px]">E-MAIL ADDRESS</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="e.g. adebayo@example.com" 
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#18452E] outline-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-#6B7280 uppercase block font-mono text-[9px]">PREFERRED TRACK TYPE</label>
                <select 
                  value={formData.preferredTrack}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredTrack: e.target.value }))}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#18452E] outline-none text-xs"
                >
                  <option value="Landlord">Refer a Landlord (₦50k)</option>
                  <option value="Professional">Refer a Connection Professional (₦25k)</option>
                  <option value="Tenant">Refer a Tenant Partner (₦10k)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-#6B7280 uppercase block font-mono text-[9px]">BRIEF BIO / TARGET AUDIENCE</label>
                <textarea 
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Please describe how you plan to find leads (e.g. diasporan forums, estate agents groups...)" 
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#18452E] outline-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#18452E] hover:bg-[#18452E] text-white rounded-xl font-semibold uppercase tracking-wider shadow-md hover:shadow-sm transition cursor-pointer text-xs"
              >
                Submit Application
              </button>
            </form>
          )}
        </div>

        {/* GUIDING PARTNER RULES - NUMBERED LIST */}
        <div className="md:col-span-7 space-y-6">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#18452E]" />
            <h3 className="font-display font-semibold text-[#18452E] text-base uppercase tracking-wider">
              Guiding Partner Network Rules &amp; Covenants
            </h3>
          </div>
          
          <div className="space-y-4 font-sans text-xs sm:text-sm leading-relaxed text-#132A1D font-normal">
            <p>
              To maintain the hard-earned trust Unity Homes provides across Nigeria, every network partner agrees to operate in full accordance with these five rules:
            </p>

            <ol className="space-y-4 list-decimal pl-5">
              <li className="pl-1.5">
                <strong>Honest Representation:</strong> Partners must present the platform features, security buffers, and structural vetting timelines truthfully. You are strictly forbidden from making unverified claims or guaranteeing instant tenancy approval.
              </li>
              <li className="pl-1.5">
                <strong>No Referring Known Bad Actors:</strong> You must not refer landlords with active title litigation claims or tenants who have proven track histories of safety violations, malicious damage, or recurrent rent default.
              </li>
              <li className="pl-1.5">
                <strong>Rewards Paid Only on Completion:</strong> Referral fees are only triggered and approved once the referred party completes full administrative onboarding, clears background routing setups, and goes live with transaction logs.
              </li>
              <li className="pl-1.5">
                <strong>Clearing Within Fourteen Business Days:</strong> Once a conversion trigger is certified by Unity Homes administration, payment of the reward is processed and transferred to your verified naira bank account within 14 business days.
              </li>
              <li className="pl-1.5">
                <strong>Referral Arrangement, Not Employment:</strong> This network forms a strict independent referral affiliate commission model. Partners have no authorization to act as employees, signs documents, or demand payments on behalf of Unity Homes.
              </li>
            </ol>
            
            <div className="bg-amber-50 p-4 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs leading-normal">
              <AlertCircle className="w-4.5 h-4.5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-amber-800 font-sans">
                <strong>Important:</strong> Violating rules 1 or 2 triggers immediate expulsion from the Partner Network and forfeiture of all accumulated or pending referral reward balances.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER COVENANT */}
      <p className="text-center text-[10px] text-[#C9A84C] font-mono leading-normal">
        <em>Don&apos;t Buy Wahala</em> &bull; Authorized Unity Homes Affiliate Desk RC-1849120
      </p>

    </div>
  );
}
