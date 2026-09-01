import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Check, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, ArrowRight, X, Building2, UserCheck, Send, Sparkles, MessageSquare, Tag, CheckCircle2, Mail } from 'lucide-react';
import { loadSubscriptionTiers, saveSubscriptionInquiry } from '../data';
import { SubscriptionTier } from '../types';
import { validatePromoCode, redeemPromoCode, ValidatePromoCodeOutput } from '../lib/promoCodeSystem';
import BundleConnectionSection from './BundleConnectionSection';

interface PlatformPricingPageProps {
  navigate: (path: string, params?: any) => void;
}

export default function PlatformPricingPage({ navigate }: PlatformPricingPageProps) {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = "Pricing and Services | Unity Homes & Properties";
  }, []);

  // Modal State for Get Started WhatsApp Pre-Inquiry
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [portfolioSize, setPortfolioSize] = useState('');
  const [inquiryNotes, setInquiryNotes] = useState('');

  // Advisory Services Interest Capture State (Section Four)
  const [advisoryEmail, setAdvisoryEmail] = useState('');
  const [advisorySuccess, setAdvisorySuccess] = useState(false);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoResult, setAppliedPromoResult] = useState<ValidatePromoCodeOutput | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const handleApplyPromoCode = () => {
    const cleanCode = promoCodeInput.trim().toUpperCase();
    if (!cleanCode) return;
    if (!selectedTier) return;

    setIsValidatingPromo(true);
    setPromoError(null);

    const baseAmount = isAnnual ? Math.round(selectedTier.monthlyPrice * 12 * 0.9) : selectedTier.monthlyPrice;

    setTimeout(() => {
      setIsValidatingPromo(false);
      const res = validatePromoCode({
        code: cleanCode,
        applies_to: 'subscription',
        plan_name: selectedTier.id || selectedTier.name,
        order_amount: baseAmount,
        user_id: visitorEmail.trim() || 'guest-user',
        user_role: selectedTier.appliesTo === 'PMC' ? 'PMC' : 'Landlord'
      });

      if (res.valid) {
        setAppliedPromoResult(res);
        setPromoError(null);
      } else {
        setAppliedPromoResult(null);
        setPromoError(res.message);
      }
    }, 300);
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoResult(null);
    setPromoCodeInput('');
    setPromoError(null);
  };

  const allTiers = loadSubscriptionTiers();

  const longTermTiers = allTiers.filter(t => t.appliesTo === 'Long-Term Landlord');
  const shortletTiers = allTiers.filter(t => t.appliesTo === 'Shortlet Landlord');

  const getPriceDisplay = (monthlyPrice: number) => {
    if (isAnnual) {
      const annualPrice = Math.round(monthlyPrice * 12 * 0.9);
      const monthlyEquiv = Math.round(annualPrice / 12);
      return {
        amountDisplay: `₦${annualPrice.toLocaleString()}`,
        period: '/ year',
        subtext: `₦${monthlyEquiv.toLocaleString()}/mo equivalent (Saved 10%)`
      };
    }
    return {
      amountDisplay: `₦${monthlyPrice.toLocaleString()}`,
      period: '/ month',
      subtext: `Billed monthly`
    };
  };

  const handleOpenInquiryModal = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setPortfolioSize(typeof tier.unitLimit === 'number' ? `Up to ${tier.unitLimit} units` : 'Unlimited units');
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    const priceInfo = getPriceDisplay(selectedTier.monthlyPrice);

    // Save subscription inquiry to local storage / backend database
    const newInquiry = saveSubscriptionInquiry({
      planName: selectedTier.name,
      appliesTo: selectedTier.appliesTo,
      billingCycle: isAnnual ? 'Annual' : 'Monthly',
      monthlyPrice: selectedTier.monthlyPrice,
      annualPrice: Math.round(selectedTier.monthlyPrice * 12 * 0.9),
      visitorName: visitorName || 'Valued Visitor',
      visitorPhone: visitorPhone || '+234...',
      visitorEmail: visitorEmail || 'visitor@unityhomes.ng',
      portfolioSize: portfolioSize,
      notes: inquiryNotes,
      promo_code: (appliedPromoResult && appliedPromoResult.valid) ? promoCodeInput.trim().toUpperCase() : undefined,
      promo_discount_text: (appliedPromoResult && appliedPromoResult.valid) ? appliedPromoResult.message : undefined
    });

    // Record promo code redemption if applied
    if (appliedPromoResult && appliedPromoResult.valid && appliedPromoResult.promo_code_id) {
      const baseAmount = isAnnual ? Math.round(selectedTier.monthlyPrice * 12 * 0.9) : selectedTier.monthlyPrice;
      redeemPromoCode({
        promo_code_id: appliedPromoResult.promo_code_id,
        code: promoCodeInput.trim().toUpperCase(),
        user_id: visitorEmail.trim() || 'guest-user',
        user_role: selectedTier.appliesTo === 'PMC' ? 'PMC' : 'Landlord',
        applied_to: 'subscription',
        related_id: newInquiry.id,
        original_amount: baseAmount,
        discount_amount: appliedPromoResult.discount_amount || 0,
        userName: visitorName.trim()
      });
    }

    const promoDetailsText = (appliedPromoResult && appliedPromoResult.valid)
      ? `The user applied promo code: ${promoCodeInput.trim().toUpperCase()}.\nDiscount: ${appliedPromoResult.message}.\nOriginal plan price: ${priceInfo.amountDisplay}.\nDiscounted price: ₦${(appliedPromoResult.discounted_amount || 0).toLocaleString()}.\nPlease apply this discount when generating their payment link.\n\n`
      : '';

    // Format WhatsApp pre-inquiry message
    const text = encodeURIComponent(
      `Hello Unity Homes Team, I am interested in subscribing to the platform:\n\n` +
      `*Plan:* ${selectedTier.name}\n` +
      `*Category:* ${selectedTier.appliesTo}\n` +
      `*Billing Cycle:* ${isAnnual ? 'Annual (10% Discount Applied)' : 'Monthly'}\n` +
      `*Price:* ${priceInfo.amountDisplay} ${priceInfo.period}\n\n` +
      promoDetailsText +
      `*Subscriber Details:*\n` +
      `- Name: ${visitorName}\n` +
      `- Phone: ${visitorPhone}\n` +
      `- Email: ${visitorEmail}\n` +
      `- Portfolio Size: ${portfolioSize}\n` +
      (inquiryNotes ? `- Notes: ${inquiryNotes}\n` : '') +
      `\nPlease reach out to initiate my personal onboarding.`
    );

    const waUrl = `https://wa.me/2348145550012?text=${text}`;
    
    // Close modal & reset form
    setSelectedTier(null);
    setVisitorName('');
    setVisitorPhone('');
    setVisitorEmail('');
    setInquiryNotes('');

    try {
      window.open(waUrl, '_blank');
    } catch (err) {
      window.location.href = waUrl;
    }
  };

  const handleAdvisoryInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryEmail) return;
    setAdvisorySuccess(true);
  };

  const faqs = [
    {
      q: 'What services does Unity Homes offer?',
      a: 'Unity Homes currently offers three services. Long-term property management subscriptions for landlords, shortlet management subscriptions for landlords with serviced apartments, and professional connection services linking property buyers and investors with verified real estate lawyers, surveyors, and structural engineers. We are expanding into advisory services soon.'
    },
    {
      q: 'What happens when I reach my unit limit?',
      a: 'We never lock you out of your account. When your portfolio reaches or exceeds your plan\'s limit, a friendly notice appears on your dashboard giving you a 14-day grace window to upgrade your tier or request a custom unit limit override.'
    },
    {
      q: 'Can I switch between monthly and annual?',
      a: 'Yes, you can switch between monthly and annual billing at any point inside your account settings or through support, immediately unlocking the 10% annual discount.'
    },
    {
      q: 'Is there a setup fee?',
      a: 'No, there are zero setup or hidden fees. Account creation and property onboarding are completely free, including personal setup guidance from our support team.'
    },
    {
      q: 'Can I add units later?',
      a: 'Yes! You can add properties and units seamlessly at any time. Your subscription tier automatically adjusts or prompts you when entering a higher bracket.'
    },
    {
      q: 'What is included in every plan regardless of tier?',
      a: 'Every plan includes full tenant profile management, automated rent reminders, official payment transparency certificates, maintenance tracking, document vault storage, and direct access to Unity Homes admin support.'
    }
  ];

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto w-full">
      
      {/* PAGE HEADER SECTION (STEP FIVE) */}
      <div className="bg-[#18452E] text-white rounded-[var(--radius-large)] p-8 md:p-12 text-center mb-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
          <span className="inline-block text-[10px] font-mono font-semibold uppercase tracking-widest text-[#6FBE45] bg-[#18452E]/50 px-4 py-1.5 rounded-full border border-[#6FBE45]/30 shadow-xs">
            UNITY HOMES SERVICES
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-white tracking-tight">
            Pricing and Services
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 font-normal leading-relaxed max-w-2xl mx-auto">
            Transparent pricing for every service we offer. No hidden fees. No long-term contracts.
          </p>

          {/* MONTHLY / ANNUAL TOGGLE */}
          <div className="pt-4 flex items-center justify-center space-x-3">
            <span className={`text-xs font-semibold font-mono ${!isAnnual ? 'text-[#6FBE45]' : 'text-stone-300'}`}>
              MONTHLY BILLING
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="p-1 rounded-full bg-[#18452E] border border-[#6FBE45]/40 text-white transition cursor-pointer"
              aria-label="Toggle annual billing"
            >
              {isAnnual ? (
                <ToggleRight className="w-9 h-9 text-[#6FBE45]" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-stone-300" />
              )}
            </button>
            <div className="flex items-center space-x-1.5">
              <span className={`text-xs font-semibold font-mono ${isAnnual ? 'text-[#6FBE45]' : 'text-stone-300'}`}>
                ANNUAL BILLING
              </span>
              <span className="bg-[#6FBE45] text-[#18452E] text-[9px] font-semibold font-mono px-2.5 py-0.5 rounded-full uppercase shadow-xs">
                SAVE 10%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION ONE: PROPERTY MANAGEMENT PLANS */}
      <section className="mb-12">
        <div className="border-l-4 border-[#0E2F1F] pl-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#18452E] tracking-tight">
            Property Management Plans
          </h2>
          <p className="text-xs sm:text-sm text-#6B7280 font-normal mt-1 max-w-3xl leading-relaxed">
            For landlords who want complete visibility, automated tracking, and professional documentation for their long-term rental portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {longTermTiers.map((tier) => {
            const price = getPriceDisplay(tier.monthlyPrice);
            return (
              <div
                key={tier.id}
                className={`bg-white rounded-[var(--radius-large)] border-2 p-6 md:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  tier.popular
                    ? 'border-[#18452E] shadow-sm ring-2 ring-[#18452E]/20 scale-[1.01]'
                    : 'border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#18452E] text-white font-mono font-semibold text-[9px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    MOST POPULAR TIER
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold text-[#18452E] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                      {tier.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-[#18452E] text-2xl">
                    {tier.name}
                  </h3>

                  <div className="my-6 pt-2 pb-4 border-b border-stone-200">
                    <span className="font-display font-semibold text-[#18452E] text-4xl block">
                      {price.amountDisplay}
                    </span>
                    <span className="text-xs text-#6B7280 font-mono block mt-1">
                      {price.period} &bull; <span className="text-[#18452E] font-semibold">{price.subtext}</span>
                    </span>
                  </div>

                  <ul className="space-y-3 text-xs text-#132A1D font-normal">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-2.5 leading-relaxed">
                        <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                        <span className={feature.startsWith('Everything in') ? 'font-semibold text-[#18452E]' : ''}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenInquiryModal(tier)}
                  className={`mt-8 w-full py-3.5 rounded-xl font-semibold text-xs transition cursor-pointer shadow-md flex items-center justify-center space-x-2 ${
                    tier.popular
                      ? 'bg-[#18452E] hover:bg-[#18452E] text-white'
                      : 'bg-[#18452E] hover:bg-[#18452E] text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#6FBE45]" />
                  <span>Get Started via WhatsApp</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* DIVIDER */}
      <hr className="border-t border-stone-200 my-12" />

      {/* SECTION TWO: SHORTLET MANAGEMENT PLANS */}
      <section className="mb-12">
        <div className="border-l-4 border-[#6FBE45] pl-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#18452E] tracking-tight">
            Shortlet Management Plans
          </h2>
          <p className="text-xs sm:text-sm text-#6B7280 font-normal mt-1 max-w-3xl leading-relaxed">
            For landlords who hand over their apartments to a manager and want real-time transparency into every booking and remittance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">
          {shortletTiers.map((tier) => {
            const price = getPriceDisplay(tier.monthlyPrice);
            return (
              <div
                key={tier.id}
                className={`bg-white rounded-[var(--radius-large)] border-2 p-6 md:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  tier.popular
                    ? 'border-[#6FBE45] shadow-sm ring-2 ring-[#6FBE45]/20'
                    : 'border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6FBE45] text-[#18452E] font-mono font-semibold text-[9px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    RECOMMENDED SHORTLET TIER
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-semibold text-[#6FBE45] uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      {tier.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-[#18452E] text-2xl">
                    {tier.name}
                  </h3>

                  <div className="my-6 pt-2 pb-4 border-b border-stone-200">
                    <span className="font-display font-semibold text-[#18452E] text-4xl block">
                      {price.amountDisplay}
                    </span>
                    <span className="text-xs text-#6B7280 font-mono block mt-1">
                      {price.period} &bull; <span className="text-[#6FBE45] font-semibold">{price.subtext}</span>
                    </span>
                  </div>

                  <ul className="space-y-3 text-xs text-#132A1D font-normal">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-2.5 leading-relaxed">
                        <Check className="w-4 h-4 text-[#6FBE45] shrink-0 mt-0.5" />
                        <span className={feature.startsWith('Everything in') ? 'font-semibold text-[#18452E]' : ''}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenInquiryModal(tier)}
                  className="mt-8 w-full py-3.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4 text-[#6FBE45]" />
                  <span>Get Started via WhatsApp</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* DIVIDER */}
      <hr className="border-t border-stone-200 my-12" />

      {/* SECTION THREE: PROFESSIONAL SERVICES */}
      <section className="mb-12">
        <div className="border-l-4 border-[#1A5C50] pl-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#18452E] tracking-tight">
            Professional Services
          </h2>
          <p className="text-xs sm:text-sm text-#6B7280 font-normal mt-1 max-w-3xl leading-relaxed">
            Connect with personally verified Nigerian real estate professionals. Every professional in our catalogue has been inspected and selected by Olayinka Ayodele before going live.
          </p>
        </div>

        <BundleConnectionSection navigate={navigate} />
      </section>

      {/* DIVIDER */}
      <hr className="border-t border-stone-200 my-12" />

      {/* SECTION FOUR: COMING SOON - ADVISORY SERVICES */}
      <section className="mb-16">
        <div className="border-l-4 border-stone-300 pl-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-[#18452E] tracking-tight">
            Advisory Services
          </h2>
          <p className="text-xs sm:text-sm text-#6B7280 font-normal mt-0.5">
            Future expansions to our professional services platform.
          </p>
        </div>

        <div className="bg-[#FDFBF7] rounded-[var(--radius-large)] border border-stone-200 p-8 md:p-12 relative shadow-xs">
          <span className="absolute top-6 right-6 border border-[#6FBE45] text-[#6FBE45] font-mono text-[10px] font-semibold uppercase px-3.5 py-1 rounded-full tracking-wider bg-amber-50/50">
            Coming Soon
          </span>

          <div className="max-w-2xl space-y-4">
            <h3 className="text-2xl font-display font-semibold text-[#18452E]">
              Property Valuation and Advisory
            </h3>
            <p className="text-xs sm:text-sm text-#6B7280 font-normal leading-relaxed">
              We are expanding our professional services to include property valuation and advisory. Register your interest below and we will reach out when this launches.
            </p>

            {advisorySuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you! Your interest has been registered. We will notify you as soon as Advisory Services launches.</span>
              </div>
            ) : (
              <form onSubmit={handleAdvisoryInterestSubmit} className="pt-2 flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={advisoryEmail}
                  onChange={(e) => setAdvisoryEmail(e.target.value)}
                  className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs text-[#18452E] focus:outline-none focus:border-[#18452E] shadow-xs"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold text-xs uppercase rounded-xl transition cursor-pointer shrink-0 shadow-sm flex items-center justify-center space-x-2"
                >
                  <span>Register Interest</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#6FBE45]" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <hr className="border-t border-stone-200 my-12" />

      {/* FAQ ACCORDION SECTION (STEP SIX) */}
      <section className="max-w-4xl mx-auto mb-16">
        <div className="text-center mb-8 space-y-2">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#18452E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-2xl font-display font-semibold text-[#18452E]">
            Subscription &amp; Licensing Clarifications
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-display font-semibold text-[#18452E] text-sm md:text-base cursor-pointer hover:bg-stone-50 transition"
                >
                  <span className="flex items-center space-x-3">
                    <HelpCircle className="w-4 h-4 text-[#18452E] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-stone-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-#6B7280 font-normal border-t border-stone-200 leading-relaxed bg-stone-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* WHATSAPP PRE-INQUIRY MODAL */}
      {selectedTier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-large)] max-w-lg w-full p-6 md:p-8 space-y-6 shadow-sm relative border border-stone-200 animate-fade-in">
            
            <button
              onClick={() => setSelectedTier(null)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-#132A1D rounded-full hover:bg-stone-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold text-[#18452E] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                {selectedTier.appliesTo} &bull; {selectedTier.badge}
              </span>
              <h3 className="font-display font-semibold text-[#18452E] text-xl pt-2">
                Subscribe to {selectedTier.name}
              </h3>
              <p className="text-xs text-#6B7280 font-normal">
                Enter your details to initiate your personal onboarding conversation on WhatsApp with our team.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-[10px] font-mono text-stone-400 uppercase">SELECTED PLAN PRICE</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-display font-semibold text-[#18452E] text-base">
                      {appliedPromoResult && appliedPromoResult.valid && appliedPromoResult.discounted_amount !== undefined
                        ? `₦${appliedPromoResult.discounted_amount.toLocaleString()}`
                        : getPriceDisplay(selectedTier.monthlyPrice).amountDisplay}
                    </span>
                    <span className="text-[10px] text-#6B7280 font-mono">
                      {getPriceDisplay(selectedTier.monthlyPrice).period}
                    </span>
                  </div>
                </div>
                <span className="bg-[#18452E] text-white text-[9px] font-mono font-semibold px-2.5 py-1 rounded-full uppercase">
                  {isAnnual ? 'ANNUAL 10% SAVED' : 'MONTHLY'}
                </span>
              </div>

              {appliedPromoResult && appliedPromoResult.valid && (
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between font-mono text-[11px] text-emerald-800">
                  <span className="font-semibold flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-emerald-600" />
                    <span>Promo Discount Applied</span>
                  </span>
                  <span className="font-semibold">
                    -₦{appliedPromoResult.discount_amount?.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-3.5 text-xs">
              
              {/* PROMO CODE FIELD */}
              <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl space-y-2">
                <label className="block text-[10px] font-mono font-semibold text-#6B7280 uppercase flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-[#18452E]" />
                  <span>Have a Promo Code?</span>
                </label>

                {appliedPromoResult && appliedPromoResult.valid ? (
                  <div className="flex items-center justify-between bg-emerald-100/70 border border-emerald-300 p-2.5 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <div>
                        <span className="font-mono font-semibold text-xs text-emerald-900 uppercase">
                          {promoCodeInput.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-emerald-700 block font-normal">
                          {appliedPromoResult.message}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromoCode}
                      className="text-[10px] font-semibold text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. LAUNCH20, WELCOME50"
                      value={promoCodeInput}
                      onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono uppercase text-[#18452E] focus:outline-none focus:border-[#18452E]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={isValidatingPromo || !promoCodeInput.trim()}
                      className="px-4 py-2 bg-[#18452E] hover:bg-[#18452E] disabled:bg-stone-300 text-white font-semibold text-xs uppercase rounded-xl transition cursor-pointer shrink-0"
                    >
                      {isValidatingPromo ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                )}

                {promoError && (
                  <p className="text-[11px] font-mono text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                    {promoError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-[#18452E] uppercase mb-1">
                  YOUR FULL NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kemi Adebayo"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#18452E] outline-none focus:bg-white focus:border-[#18452E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-[#18452E] uppercase mb-1">
                    PHONE / WHATSAPP *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+234 812 000 0000"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#18452E] outline-none focus:bg-white focus:border-[#18452E]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-[#18452E] uppercase mb-1">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="kemi@adebayo.ng"
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#18452E] outline-none focus:bg-white focus:border-[#18452E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-[#18452E] uppercase mb-1">
                  ESTIMATED PORTFOLIO / UNIT COUNT
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12 units in Lekki & Ikeja"
                  value={portfolioSize}
                  onChange={(e) => setPortfolioSize(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#18452E] outline-none focus:bg-white focus:border-[#18452E]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-[#18452E] uppercase mb-1">
                  OPTIONAL NOTES / QUESTIONS
                </label>
                <input
                  type="text"
                  placeholder="e.g. Want to bring 3 caretakers onboard..."
                  value={inquiryNotes}
                  onChange={(e) => setInquiryNotes(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-[#18452E] outline-none focus:bg-white focus:border-[#18452E]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-md flex items-center justify-center space-x-2 pt-3"
              >
                <MessageSquare className="w-4 h-4 text-[#6FBE45]" />
                <span>Proceed to WhatsApp Onboarding</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
