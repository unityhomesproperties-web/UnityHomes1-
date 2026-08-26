import React, { useState } from 'react';
import { Scale, Lock, ShieldAlert, BookOpen, Search, CheckSquare } from 'lucide-react';

interface RulesPageProps {
  navigate: (path: string, params?: any) => void;
}

export default function RulesPage({ navigate }: RulesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'general',
      title: '1. General Platform Rules',
      content: 'Every user—whether a guest, landlord, tenant, professional, or manager—must interact with absolute truthfulness and respect. We enforce a zero-tolerance policy against cyber-harassment, false representation, account-sharing, or using automated scripts to extract listings. Only verified individuals and legally registered corporate entities are permitted to operate active dashboards.'
    },
    {
      id: 'professional',
      title: '2. Professional Connection Rules',
      content: 'All lawyers, land surveyors, and structural engineers listed inside the connection panel must upload active, verifiable credentials from their respective statutory boards (e.g., Nigerian Bar Association, Surveyor General SURCON Registry, COREN Engineering Councils). Providing expired, forged, or third-party license numbers triggers instant permanent profile bans and referral to federal authorities.'
    },
    {
      id: 'listings',
      title: '3. Rental Listing Rules',
      content: 'No real estate agent, landlord, or management company is allowed to list mock properties. Every listing must carry a verified title deed check, accurate coordinates, and genuine high-resolution imagery. Price listings must be mathematically transparent, outlining exact rent values, precise caution deposit margins, and legal fees. Fake bait-and-switch listings or hidden fees are blocked on verification.'
    },
    {
      id: 'tenant-payments',
      title: '4. Tenant Payment Rules',
      content: 'Tenants are required to verify the exact bank account details displayed on their dashboards prior to initiating any bank transfers. Rents must be paid directly to verified accounts, and official payment receipts must be submitted with accuracy. Making payments outside listed verified bounds is dangerous; Unity Homes will not be liable for non-verified payment disputes. Don\'t Buy Wahala!'
    },
    {
      id: 'landlords',
      title: '5. Landlord Rules',
      content: 'Approved landlords must keep their structural units fit for safe human occupation. All caution deposits must sit inside arbitrated trust accounts. Landlords cannot unilaterally hold or deduct caution balances without lodging official, photo-verified damage reports. Evictions must enforce strict, legal statutory notice periods under the Lagos State Tenancy Law.'
    },
    {
      id: 'shortlet',
      title: '6. Shortlet Management Rules',
      content: 'Shortlet managers must log every booking with real check-in and check-out dates, correct night rates, and authentic booking sources. Once logged, a booking cannot be altered without administrative override. Managers must verify landlord account numbers prior to submitting remittance forms and must remit funds within the agreed contract period.'
    },
    {
      id: 'partners',
      title: '7. Partner Network Rules',
      content: 'Partners must represent the Unity Homes platform truthfully. Spamming referral links in unauthorized social channels, bribing clients, or referring known bad actors (litigious landlords or serial rent defaulters) is strictly illegal. Commission rewards are paid solely on completion, cleared within fourteen business days of administrative approval.'
    },
    {
      id: 'data-protection',
      title: '8. Data Protection & Privacy',
      content: 'We adhere to the Nigeria Data Protection Regulation (NDPR) guidelines. Personal identity records—such as tenant passport photos, dates of birth, bank details, and guarantor addresses—remain strongly encrypted. Dates of birth are strictly used for our Birthday system and are never broadcast publicly. We do not sell or lease user information to third-party ad brokers.'
    },
    {
      id: 'liability',
      title: '9. Limitation of Liability',
      content: 'Unity Homes operates strictly as a secure property operating system, transaction registry, and verified payment routing hub. We do not assume civil or structural liability for developers building on swamp lands without engineering clearance, nor do we settle physical landlord utility disputes beyond the scope of local tenant mediation. All deals are facilitated on a zero-trust foundation.'
    },
    {
      id: 'governing-law',
      title: '10. Governing Law & Jurisdiction',
      content: 'These rules, active covenants, and operations are governed by, and construed in full accordance with, the Laws of the Federal Republic of Nigeria. Any litigation, contractual arbitration, or legal tenancy dispute arising from platform operations must be filed under the exclusive jurisdiction of the state high courts in Lagos, Nigeria.'
    }
  ];

  const filteredSections = sections.filter(sec => 
    sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sec.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-16 px-4 md:px-8 max-w-4xl mx-auto w-full space-y-12">
      
      {/* HEADER HERO */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[10px] sm:text-xs uppercase font-mono font-semibold tracking-widest text-[#C9A84C] bg-[#18452E]/20 px-3.5 py-1.5 rounded-full border border-[#C9A84C]/25">
          Ecosystem Constitution
        </span>
        <h1 className="text-3xl md:text-5xl font-display font-semibold text-[#18452E] leading-tight">
          Rules &amp; Disclaimers
        </h1>
        <p className="text-xs sm:text-sm text-#6B7280 font-normal leading-relaxed">
          The legal framework and transactional bylaws governing Unity Homes. Crafted to protect honesty, eliminate property fraud, and prevent litigation.
        </p>
      </div>

      {/* SEARCH OVERLAY */}
      <div className="spatial-glass border border-stone-200/60 p-4 rounded-2xl flex items-center space-x-3 shadow-xs">
        <Search className="w-5 h-5 text-[#18452E] shrink-0" />
        <input 
          type="text" 
          placeholder="Search rule clauses (e.g. data protection, trust, landlord)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow bg-transparent border-none text-xs sm:text-sm outline-none text-[#18452E] font-sans"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="text-[10px] font-mono text-stone-400 hover:text-#132A1D cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* RULES LIST CONTAINER */}
      <div className="space-y-6">
        {filteredSections.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs italic">
            No specific rule clauses matched your search query. Try typing &quot;trust&quot;, &quot;lawyer&quot;, or &quot;Nigeria&quot;.
          </div>
        ) : (
          filteredSections.map((sec) => (
            <div 
              key={sec.id} 
              id={sec.id}
              className="spatial-glass border border-stone-200/50 p-6 sm:p-8 rounded-[var(--radius-large)] space-y-3 shadow-xs hover:border-[#C9A84C]/40 transition duration-200"
            >
              <h3 className="font-display font-semibold text-sm sm:text-base text-[#18452E] border-b border-stone-200 pb-2.5 flex items-center justify-between">
                <span>{sec.title}</span>
                <Scale className="w-4 h-4 text-[#C9A84C]" />
              </h3>
              <p className="text-xs sm:text-sm text-#6B7280 font-normal leading-relaxed font-sans">
                {sec.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* FINAL WARNING BOX */}
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-[var(--radius-large)] flex items-start space-x-3 text-xs text-amber-800 font-sans leading-relaxed">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold uppercase tracking-wider text-[11px] text-amber-950 font-display">
            MANDATORY COMPLIANCE ACKNOWLEDGEMENT
          </h4>
          <p className="font-normal">
            By creating or logging into any workspace dashboard, you grant irreversible confirmation of your consent to abide by these regulatory coordinates, legal bylaws, and fee structures. Non-compliance results in automatic ledger locks and formal CAC/LASRERA deregistration requests.
          </p>
        </div>
      </div>

      {/* FOOTER FRAUD VOW */}
      <p className="text-center text-[10px] text-[#C9A84C] font-mono font-medium tracking-wide italic">
        Don&apos;t Buy Wahala &bull; Legal Affairs Team, RC-1849120
      </p>

    </div>
  );
}
