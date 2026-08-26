import React, { useState } from 'react';
import { Check, ShieldCheck, Star, X, Loader2, ArrowRight, CheckCircle2, Tag } from 'lucide-react';
import { PackageType, ProfessionalConnection } from '../types';
import { saveProfessionalConnection, saveInquiry } from '../data';
import { validatePromoCode, redeemPromoCode, ValidatePromoCodeOutput } from '../lib/promoCodeSystem';
import CollapsiblePromoCodeSection from './CollapsiblePromoCodeSection';

interface BundleConnectionSectionProps {
  navigate?: (path: string, params?: any) => void;
  onSelectSingle?: () => void;
  selectedProfForBundle?: any; // If triggered from an individual card choice prompt
  onClosePrompt?: () => void;
}

export type DualCombinationOption = 'lawyer_surveyor' | 'lawyer_engineer' | 'surveyor_engineer';

export default function BundleConnectionSection({ 
  navigate, 
  onSelectSingle,
  selectedProfForBundle,
  onClosePrompt 
}: BundleConnectionSectionProps) {
  // Dual Bundle selection modal/flow state
  const [showDualSelection, setShowDualSelection] = useState(false);
  const [selectedDualOption, setSelectedDualOption] = useState<DualCombinationOption | null>(null);

  // Active checkout state
  const [activeCheckoutPackage, setActiveCheckoutPackage] = useState<{
    packageType: PackageType;
    title: string;
    amount: number;
    detailsText: string;
  } | null>(null);

  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [billingDetails, setBillingDetails] = useState({
    name: '',
    phone: '',
    email: '',
    cardNumber: '4000 1234 5678 9010',
    cardExpiry: '12/28',
    cardCvv: '232'
  });

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoResult, setAppliedPromoResult] = useState<ValidatePromoCodeOutput | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const handleApplyPromoCode = () => {
    const cleanCode = promoCodeInput.trim().toUpperCase();
    if (!cleanCode) return;
    if (!activeCheckoutPackage) return;

    setIsValidatingPromo(true);
    setPromoError(null);

    setTimeout(() => {
      setIsValidatingPromo(false);
      const res = validatePromoCode({
        code: cleanCode,
        applies_to: 'professional_connection',
        plan_name: activeCheckoutPackage.packageType,
        order_amount: activeCheckoutPackage.amount,
        user_id: billingDetails.email.trim() || 'guest-user',
        user_role: 'Public'
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

  const finalPayableAmount = activeCheckoutPackage ? 
    (appliedPromoResult?.valid && appliedPromoResult.discounted_amount !== undefined 
      ? appliedPromoResult.discounted_amount 
      : activeCheckoutPackage.amount) 
    : 0;

  // Handle Dual Bundle option choice
  const handleOpenDualModal = () => {
    setShowDualSelection(true);
    setSelectedDualOption(null);
  };

  const handleProceedDualToCheckout = () => {
    if (!selectedDualOption) return;

    let pkgType: PackageType = 'dual_bundle_lawyer_surveyor';
    let label = 'Dual Bundle: Lawyer & Surveyor';

    if (selectedDualOption === 'lawyer_engineer') {
      pkgType = 'dual_bundle_lawyer_engineer';
      label = 'Dual Bundle: Lawyer & Structural Engineer';
    } else if (selectedDualOption === 'surveyor_engineer') {
      pkgType = 'dual_bundle_surveyor_engineer';
      label = 'Dual Bundle: Surveyor & Structural Engineer';
    }

    setShowDualSelection(false);
    setActiveCheckoutPackage({
      packageType: pkgType,
      title: label,
      amount: 95000,
      detailsText: 'Personal introduction to both verified professionals in a single monitored group.'
    });
    setTermsAgreed(false);
    setPaymentSuccess(false);
  };

  const handleOpenCompleteBundleCheckout = () => {
    setActiveCheckoutPackage({
      packageType: 'complete_bundle',
      title: 'Complete Property Shield Bundle',
      amount: 120000,
      detailsText: 'Personal introduction to Lawyer, Surveyor, and Structural Engineer together.'
    });
    setTermsAgreed(false);
    setPaymentSuccess(false);
  };

  const handleOpenSingleCheckout = () => {
    if (onSelectSingle) {
      onSelectSingle();
    } else {
      setActiveCheckoutPackage({
        packageType: 'lawyer', // Default single connection
        title: 'Single Professional Connection',
        amount: 55000,
        detailsText: 'Personal introduction to 1 verified real estate professional.'
      });
      setTermsAgreed(false);
      setPaymentSuccess(false);
    }
  };

  const executePaystackCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingDetails.name || !billingDetails.phone || !billingDetails.email) {
      alert('Please fill out your contact details first.');
      return;
    }

    if (!activeCheckoutPackage) return;

    setIsPaying(true);

    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);

      // Save connection document to store & localStorage
      const newConn = saveProfessionalConnection({
        clientName: billingDetails.name,
        clientPhone: billingDetails.phone,
        clientEmail: billingDetails.email,
        packageType: activeCheckoutPackage.packageType,
        amount: activeCheckoutPackage.amount,
        paymentStatus: 'confirmed',
        connectionStatus: 'group_created',
        notes: `Paid NGN ${activeCheckoutPackage.amount.toLocaleString()} via Paystack for ${activeCheckoutPackage.title}`
      });

      // Record promo code redemption if applied
      if (appliedPromoResult && appliedPromoResult.valid && appliedPromoResult.promo_code_id) {
        redeemPromoCode({
          promo_code_id: appliedPromoResult.promo_code_id,
          code: promoCodeInput.trim().toUpperCase(),
          user_id: billingDetails.email.trim() || 'guest-user',
          user_role: 'Public',
          applied_to: 'professional_connection',
          related_id: newConn.id,
          original_amount: activeCheckoutPackage.amount,
          discount_amount: appliedPromoResult.discount_amount || 0,
          userName: billingDetails.name.trim()
        });
      }

      // Save inquiry log
      saveInquiry({
        type: 'Professional',
        targetName: activeCheckoutPackage.title,
        requesterName: billingDetails.name,
        requesterPhone: billingDetails.phone,
        requesterEmail: billingDetails.email
      });

      // Redirect URL goes to WhatsApp intro with package_type and amount as query parameters
      setTimeout(() => {
        const text = encodeURIComponent(
          `Hello Olayinka Ayodele, I just paid NGN ${activeCheckoutPackage.amount.toLocaleString()} on unityhomes.ng for the ${activeCheckoutPackage.title} (Package: ${activeCheckoutPackage.packageType}). My name is ${billingDetails.name} and email is ${billingDetails.email}. Please arrange our introduction.`
        );
        const waUrl = `https://wa.me/2348145550012?text=${text}&package_type=${activeCheckoutPackage.packageType}&amount=${activeCheckoutPackage.amount}`;
        
        try {
          window.open(waUrl, '_blank');
        } catch (err) {
          window.location.href = waUrl;
        }
      }, 1500);

    }, 2000);
  };

  return (
    <div className="w-full my-8 space-y-6">
      
      {/* SECTION HEADER */}
      <div className="text-center space-y-1.5 mb-6">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--color-accent-gold)] bg-[var(--color-brand-deep)]/10 border border-[var(--color-accent-gold)]/30 px-3 py-1 rounded-full">
          Connection Options
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-[var(--color-brand-deep)]">
          How Would You Like to Connect
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-xl mx-auto font-normal">
          Choose between an individual verified expert or multi-professional protected bundles with direct founder oversight.
        </p>
      </div>

      {/* 3 CARDS VERTICAL STACK ON MOBILE / 3 COLUMNS ON DESKTOP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* CARD ONE: SINGLE PROFESSIONAL CONNECTION */}
        <div className="bg-white rounded-2xl border-2 border-[var(--color-brand-deep)] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-semibold text-[var(--color-brand-deep)] uppercase tracking-wider">
                STARTER OPTION
              </span>
            </div>
            <h3 className="font-display font-semibold text-[var(--color-brand-deep)] text-xl">
              One Professional
            </h3>
            <div className="my-4">
              <span className="font-display font-semibold text-[var(--color-brand-deep)] text-3.5xl">
                NGN 55,000
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-5 font-normal leading-relaxed">
              Connect with one verified real estate professional of your choice.
            </p>

            <ul className="space-y-3 border-t border-stone-200 pt-4 text-xs text-[var(--color-brand-deep)]">
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-brand-medium)] shrink-0 mt-0.5" />
                <span>Personal introduction by Olayinka Ayodele</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-brand-medium)] shrink-0 mt-0.5" />
                <span>Verified registration and credentials confirmed</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-brand-medium)] shrink-0 mt-0.5" />
                <span>Monitored group introduction with quality assurance follow-up</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleOpenSingleCheckout}
            className="mt-6 w-full py-3 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)] text-white font-semibold text-xs rounded-xl shadow transition cursor-pointer"
          >
            Get Connected
          </button>

          <CollapsiblePromoCodeSection
            appliesTo="professional_connection"
            planName="single_connection"
            baseAmount={55000}
            userId={billingDetails.email.trim() || 'guest-user'}
            userRole="Public"
            onPromoApplied={(res, code) => {
              setAppliedPromoResult(res);
              setPromoCodeInput(code);
            }}
          />
        </div>

        {/* CARD TWO: DUAL PROFESSIONAL BUNDLE */}
        <div className="bg-white rounded-2xl border-2 border-[var(--color-accent-gold)] p-6 shadow-sm flex flex-col justify-between relative hover:shadow-md transition">
          <div className="absolute top-4 right-4 bg-[var(--color-accent-gold)] text-[var(--color-brand-deep)] font-mono font-semibold text-[10px] px-2.5 py-1 rounded-md shadow-xs">
            Save NGN 15,000
          </div>

          <div>
            <div className="mb-2">
              <span className="text-[10px] font-mono font-semibold text-[var(--color-accent-gold)] uppercase tracking-wider">
                POPULAR BUNDLE
              </span>
            </div>
            <h3 className="font-display font-semibold text-[var(--color-brand-deep)] text-xl">
              Any Two Professionals
            </h3>
            
            <div className="my-4">
              <span className="font-display font-semibold text-[var(--color-brand-deep)] text-3.5xl block">
                NGN 95,000
              </span>
              <span className="line-through text-stone-400 text-xs font-mono block mt-0.5">
                vs NGN 110,000 individually
              </span>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] mb-5 font-normal leading-relaxed">
              Connect with any two professionals from our verified catalogue. You choose the combination.
            </p>

            <ul className="space-y-3 border-t border-stone-200 pt-4 text-xs text-[var(--color-brand-deep)]">
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-brand-medium)] shrink-0 mt-0.5" />
                <span>Personal introduction by Olayinka Ayodele for both professionals</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-brand-medium)] shrink-0 mt-0.5" />
                <span>Both credentials verified independently</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-brand-medium)] shrink-0 mt-0.5" />
                <span>Monitored group introduction with both professionals included</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-brand-medium)] shrink-0 mt-0.5" />
                <span>Priority matching within 48 hours</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleOpenDualModal}
            className="mt-6 w-full py-3 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)/80] text-[var(--color-brand-deep)] font-semibold text-xs rounded-xl shadow transition cursor-pointer"
          >
            Get Connected
          </button>

          <CollapsiblePromoCodeSection
            appliesTo="professional_connection"
            planName="dual_bundle"
            baseAmount={95000}
            userId={billingDetails.email.trim() || 'guest-user'}
            userRole="Public"
            onPromoApplied={(res, code) => {
              setAppliedPromoResult(res);
              setPromoCodeInput(code);
            }}
          />
        </div>

        {/* CARD THREE: COMPLETE BUNDLE */}
        <div className="bg-[var(--color-brand-deep)] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden ring-4 ring-[var(--color-accent-gold)]/25">
          <div className="absolute top-4 right-4 bg-[var(--color-accent-gold)] text-[var(--color-brand-deep)] font-mono font-semibold text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider">
            Best Value
          </div>

          <div>
            <div className="mb-2">
              <span className="text-[10px] font-mono font-semibold text-[var(--color-accent-gold)] uppercase tracking-wider">
                TOTAL PROPERTY SHIELD
              </span>
            </div>
            <h3 className="font-display font-semibold text-[var(--color-brand-deep)] text-xl text-white">
              All Three Professionals
            </h3>

            <div className="my-4">
              <span className="font-display font-semibold text-[var(--color-accent-gold)] text-3.5xl block">
                NGN 120,000
              </span>
              <span className="line-through text-stone-300 text-xs font-mono block mt-0.5">
                vs NGN 165,000 individually
              </span>
            </div>

            <p className="text-xs text-stone-200 mb-5 font-normal leading-relaxed">
              Connect with a lawyer, surveyor, and structural engineer together for the most comprehensive property protection.
            </p>

            <ul className="space-y-3 border-t border-emerald-800/80 pt-4 text-xs text-stone-100">
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-accent-gold)] shrink-0 mt-0.5" />
                <span>Personal introduction to all three professionals</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-accent-gold)] shrink-0 mt-0.5" />
                <span>All three credentials verified</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-accent-gold)] shrink-0 mt-0.5" />
                <span>Single monitored group introduction with all professionals</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-accent-gold)] shrink-0 mt-0.5" />
                <span>Priority matching within 24 hours</span>
              </li>
              <li className="flex items-start space-x-2">
                <Check className="w-4 h-4 text-[var(--color-accent-gold)] shrink-0 mt-0.5" />
                <span>Post-connection check-in at 30 days</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleOpenCompleteBundleCheckout}
            className="mt-6 w-full py-3 bg-[var(--color-accent-gold)] hover:bg-[var(--color-accent-gold)/80] text-[var(--color-brand-deep)] font-semibold text-xs rounded-xl shadow transition cursor-pointer"
          >
            Get Complete Bundle
          </button>

          <CollapsiblePromoCodeSection
            appliesTo="professional_connection"
            planName="complete_bundle"
            baseAmount={120000}
            userId={billingDetails.email.trim() || 'guest-user'}
            userRole="Public"
            darkTheme={true}
            onPromoApplied={(res, code) => {
              setAppliedPromoResult(res);
              setPromoCodeInput(code);
            }}
          />
        </div>

      </div>

      {/* FOOTNOTE DISCLAIMER */}
      <p className="text-center text-[var(--color-text-secondary)] italic text-[11px] max-w-3xl mx-auto pt-2">
        All connection fees are paid only to Unity Homes via Paystack. Professional service fees are agreed directly between you and the professional and are separate. Contact unityhomes.ng for questions.
      </p>

      {/* MODAL / SCREEN: DUAL BUNDLE SELECTION FLOW (FRONTEND STEP TWO) */}
      {showDualSelection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-large)] max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-sm relative border border-stone-200 animate-fade-in">
            <button
              onClick={() => setShowDualSelection(false)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-[var(--color-text-primary)] rounded-full hover:bg-stone-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--color-accent-gold)] block mb-1">
                DUAL BUNDLE PAIRING
              </span>
              <h3 className="font-display font-semibold text-2xl text-[var(--color-brand-deep)]">
                Choose Your Two Professionals
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Select your preferred expert combination below. You get full verified introductions to both experts at NGN 95,000.
              </p>
            </div>

            {/* THREE SELECTABLE COMBINATION CARDS */}
            <div className="space-y-4">
              
              {/* Option 1: Lawyer and Surveyor */}
              <div
                onClick={() => setSelectedDualOption('lawyer_surveyor')}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  selectedDualOption === 'lawyer_surveyor'
                    ? 'border-[var(--color-accent-gold)] bg-amber-50/40 ring-2 ring-[var(--color-accent-gold)]/30'
                    : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[var(--color-brand-deep)] text-white">
                      Lawyer
                    </span>
                    <span className="text-stone-400 text-xs">+</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[var(--color-brand-deep)] text-white">
                      Surveyor
                    </span>
                  </div>
                  <h4 className="font-display font-semibold text-base text-[var(--color-brand-deep)]">
                    Lawyer and Surveyor
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                    Verify title ownership and confirm physical boundaries.
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-3">
                  <span className="font-mono font-semibold text-sm text-[var(--color-brand-deep)]">NGN 95,000</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedDualOption === 'lawyer_surveyor'
                      ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)] text-[var(--color-brand-deep)]'
                      : 'border-stone-300 bg-white'
                  }`}>
                    {selectedDualOption === 'lawyer_surveyor' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Option 2: Lawyer and Structural Engineer */}
              <div
                onClick={() => setSelectedDualOption('lawyer_engineer')}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  selectedDualOption === 'lawyer_engineer'
                    ? 'border-[var(--color-accent-gold)] bg-amber-50/40 ring-2 ring-[var(--color-accent-gold)]/30'
                    : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[var(--color-brand-deep)] text-white">
                      Lawyer
                    </span>
                    <span className="text-stone-400 text-xs">+</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[var(--color-accent-gold)] text-[var(--color-brand-deep)]">
                      Structural Engineer
                    </span>
                  </div>
                  <h4 className="font-display font-semibold text-base text-[var(--color-brand-deep)]">
                    Lawyer and Structural Engineer
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                    Verify legal standing and inspect building safety.
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-3">
                  <span className="font-mono font-semibold text-sm text-[var(--color-brand-deep)]">NGN 95,000</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedDualOption === 'lawyer_engineer'
                      ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)] text-[var(--color-brand-deep)]'
                      : 'border-stone-300 bg-white'
                  }`}>
                    {selectedDualOption === 'lawyer_engineer' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Option 3: Surveyor and Structural Engineer */}
              <div
                onClick={() => setSelectedDualOption('surveyor_engineer')}
                className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  selectedDualOption === 'surveyor_engineer'
                    ? 'border-[var(--color-accent-gold)] bg-amber-50/40 ring-2 ring-[var(--color-accent-gold)]/30'
                    : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[var(--color-brand-deep)] text-white">
                      Surveyor
                    </span>
                    <span className="text-stone-400 text-xs">+</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-[var(--color-accent-gold)] text-[var(--color-brand-deep)]">
                      Structural Engineer
                    </span>
                  </div>
                  <h4 className="font-display font-semibold text-base text-[var(--color-brand-deep)]">
                    Surveyor and Structural Engineer
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] font-normal">
                    Confirm boundaries and inspect structural integrity.
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-3">
                  <span className="font-mono font-semibold text-sm text-[var(--color-brand-deep)]">NGN 95,000</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedDualOption === 'surveyor_engineer'
                      ? 'border-[var(--color-accent-gold)] bg-[var(--color-accent-gold)] text-[var(--color-brand-deep)]'
                      : 'border-stone-300 bg-white'
                  }`}>
                    {selectedDualOption === 'surveyor_engineer' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              </div>

            </div>

            {/* ACTION BUTTON - APPEARS ONLY AFTER SELECTION */}
            {selectedDualOption && (
              <div className="pt-2">
                <button
                  onClick={handleProceedDualToCheckout}
                  className="w-full py-3.5 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)] text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>
                    Proceed to Payment for {
                      selectedDualOption === 'lawyer_surveyor' ? 'Lawyer & Surveyor' :
                      selectedDualOption === 'lawyer_engineer' ? 'Lawyer & Structural Engineer' :
                      'Surveyor & Structural Engineer'
                    } (NGN 95,000)
                  </span>
                  <ArrowRight className="w-4 h-4 text-[var(--color-accent-gold)]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL: PAYSTACK PAYMENT FORM */}
      {activeCheckoutPackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[var(--radius-large)] max-w-lg w-full p-6 md:p-8 space-y-5 shadow-sm relative border border-stone-200 my-8 animate-fade-in">
            <button
              onClick={() => setActiveCheckoutPackage(null)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-[var(--color-text-primary)] rounded-full hover:bg-stone-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[var(--color-brand-deep)]">
                SECURE PAYSTACK CHECKOUT
              </span>
              <h3 className="font-display font-semibold text-2xl text-[var(--color-brand-deep)]">
                {activeCheckoutPackage.title}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {activeCheckoutPackage.detailsText}
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="block text-[10px] font-mono text-emerald-800 uppercase font-semibold">TOTAL PAYABLE TODAY</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-display font-semibold text-[var(--color-brand-deep)]">
                      NGN {finalPayableAmount.toLocaleString()}
                    </span>
                    {appliedPromoResult && appliedPromoResult.valid && (
                      <span className="text-xs line-through text-stone-400 font-mono">
                        NGN {activeCheckoutPackage.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] bg-[var(--color-brand-deep)] text-white px-2.5 py-1 rounded-full font-mono font-semibold">
                  100% Vetted Guarantee
                </span>
              </div>

              {appliedPromoResult && appliedPromoResult.valid && (
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-800 font-semibold flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Promo Applied ({appliedPromoResult.discount_value}% off)</span>
                  </span>
                  <span className="text-emerald-800 font-semibold">
                    -NGN {appliedPromoResult.discount_amount?.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {paymentSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-6 rounded-2xl text-center flex flex-col items-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                <h4 className="font-semibold text-base uppercase font-mono">Payment Successful!</h4>
                <p className="text-xs text-emerald-800">
                  Thank you. Your connection fee of <strong>NGN {finalPayableAmount.toLocaleString()}</strong> has been processed via Paystack. Arranging your personal introduction now.
                </p>
                <span className="text-[10px] text-[var(--color-text-secondary)] animate-pulse font-mono">
                  Arranging introduction in seconds...
                </span>
              </div>
            ) : (
              <form onSubmit={executePaystackCheckout} className="space-y-4">
                
                {/* PROMO CODE INPUT SECTION */}
                <div className="bg-stone-50 border border-stone-200 p-3 rounded-2xl space-y-2">
                  <label className="block text-[10px] font-mono font-semibold text-[var(--color-text-secondary)] uppercase flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-[var(--color-brand-deep)]" />
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
                        className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono uppercase text-[var(--color-brand-deep)] focus:outline-none focus:border-[var(--color-brand-deep)]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromoCode}
                        disabled={isValidatingPromo || !promoCodeInput.trim()}
                        className="px-4 py-2 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)] disabled:bg-stone-300 text-white font-semibold text-xs uppercase rounded-xl transition cursor-pointer shrink-0"
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
                
                {/* Rules Agreement Checkbox */}
                <div className="p-3 bg-amber-50/60 border-l-4 border-[var(--color-accent-gold)] rounded-r-xl space-y-2">
                  <p className="text-[11px] text-[var(--color-brand-deep)] leading-relaxed">
                    Fees cover Unity Homes verified introductions and monitored group access. Professional service fees are agreed separately with the experts.
                  </p>
                  <label className="flex items-start space-x-2 text-[11px] font-semibold text-[var(--color-brand-deep)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 text-[var(--color-brand-deep)] focus:ring-[var(--color-brand-deep)] border-stone-300 rounded cursor-pointer"
                    />
                    <span>I accept the connection charter conditions.</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--color-brand-deep)] uppercase">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      value={billingDetails.name}
                      onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-[var(--color-brand-deep)]"
                      placeholder="e.g. Oluwaseun Adewale"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--color-brand-deep)] uppercase">Active Phone Number</label>
                      <input
                        type="text"
                        required
                        value={billingDetails.phone}
                        onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-[var(--color-brand-deep)]"
                        placeholder="+234 812 000 0000"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--color-brand-deep)] uppercase">Email Address</label>
                      <input
                        type="email"
                        required
                        value={billingDetails.email}
                        onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-[var(--color-brand-deep)]"
                        placeholder="seun@gmail.com"
                      />
                    </div>
                  </div>

                  {/* Card fields */}
                  <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-2">
                    <span className="block text-[9px] font-mono font-semibold text-[var(--color-text-secondary)] uppercase">
                      Paystack Card Information
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <span className="block text-[8px] text-stone-400">Card Number</span>
                        <input
                          type="text"
                          value={billingDetails.cardNumber}
                          onChange={(e) => setBillingDetails({ ...billingDetails, cardNumber: e.target.value })}
                          className="w-full bg-white border border-stone-200 p-1.5 rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="block text-[8px] text-stone-400">Expiry / CVV</span>
                        <input
                          type="text"
                          value={billingDetails.cardExpiry}
                          onChange={(e) => setBillingDetails({ ...billingDetails, cardExpiry: e.target.value })}
                          className="w-full bg-white border border-stone-200 p-1.5 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!termsAgreed || isPaying}
                  className="w-full py-3.5 bg-[var(--color-brand-deep)] hover:bg-[var(--color-brand-deep)] disabled:bg-stone-200 disabled:text-stone-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-md transition"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent-gold)]" />
                      <span>Processing Paystack Payment...</span>
                    </>
                  ) : (
                    <span>Pay NGN {activeCheckoutPackage.amount.toLocaleString()} &amp; Get Connected</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
