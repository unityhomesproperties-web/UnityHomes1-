import React, { useState } from 'react';
import { Check, ShieldCheck, HelpCircle, ChevronDown, ChevronUp, AlertCircle, CheckSquare } from 'lucide-react';
import BundleConnectionSection from './BundleConnectionSection';

interface PricingPageProps {
  navigate: (path: string, params?: any) => void;
}

export default function PricingPage({ navigate }: PricingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Why does Unity Homes charge a connection fee?',
      a: 'The connection fee filters out spam, protects our litigation lawyers\' and engineers\' valuable consultation hours, and enables our founder, Olayinka Ayodele, to remain directly accountable for introductions and group-chat oversight.'
    },
    {
      q: 'What happens if a connected professional does not respond?',
      a: 'We operate an absolute guarantee. If your introduced lawyer, structural engineer, or surveyor fails to join your group or respond to inquiries within 48 business hours, we issue a prompt 100% refund of your connection charge.'
    },
    {
      q: 'Are final professional legal/engineering fees included?',
      a: 'No. The connection fee secures your verified, audited introduction. Project specific legal drafting, survey layout drawings, or physical foundation soil reviews are negotiated and paid directly to the individual professional based on standard guidelines.'
    },
    {
      q: 'How does the monitored introduction work?',
      a: 'For quality assurance and peace of mind, our founder Olayinka Ayodele oversees your introduction process. This ensures communication begins cleanly and contracts leverage approved, clean template frameworks.'
    },
    {
      q: 'Can I request to swap a professional after payment?',
      a: 'Yes. If during the initial 7 days of introductory chat you feel you need different representation, we allow one free profile swap to another professional within the same category.'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 max-w-6xl mx-auto w-full">
      
      {/* HEADER GREEN BOX */}
      <div className="bg-[var(--color-brand-deep)] text-white rounded-[var(--radius-large)] p-8 md:p-12 text-center mb-12 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-15 text-[150px] leading-none font-serif select-none pointer-events-none translate-y-20 translate-x-12">
          ₦
        </div>
        <div className="relative z-10 space-y-3">
          <span className="text-xs uppercase font-mono font-semibold tracking-widest text-[var(--color-accent-gold)] bg-black/20 px-3.5 py-1.5 rounded-[var(--radius-pill)] border border-[var(--color-accent-gold)]/25">
            TRANSPARENT VALUE
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-semibold text-white leading-tight">
            Simple Transparent Pricing
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 font-normal max-w-xl mx-auto leading-relaxed">
            Choose the secure introduction track that fits your real estate project. Secured mediation backed by our founder.
          </p>
        </div>
      </div>

      {/* THREE MAIN BUNDLE CARDS SECTION */}
      <div className="mb-16">
        <BundleConnectionSection 
          navigate={navigate} 
          onSelectSingle={() => navigate('/professionals')} 
        />
      </div>

      {/* THREE STEP PROCESS DIAGRAM */}
      <div className="bg-white rounded-[var(--radius-card)] border border-[var(--color-border)] p-8 mb-12">
        <h3 className="font-display font-semibold text-[var(--color-brand-deep)] text-lg text-center mb-6">
          What Happens Instantly After Payment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4 flex flex-col items-center">
            <div className="w-10 h-10 bg-[var(--color-surface-soft)] text-[var(--color-brand-deep)] rounded-full flex items-center justify-center font-semibold font-mono mb-3">
              1
            </div>
            <h4 className="font-display font-semibold text-xs text-[var(--color-brand-deep)]">Pay securely via Paystack</h4>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1.5 leading-relaxed max-w-xs">
              The ₦55,000 connection fee is processed securely. You instantly receive an email containing receipt credentials.
            </p>
          </div>
          <div className="p-4 flex flex-col items-center border-t md:border-t-0 md:border-x border-[var(--color-border)]">
            <div className="w-10 h-10 bg-[var(--color-surface-soft)] text-[var(--color-brand-deep)] rounded-full flex items-center justify-center font-semibold font-mono mb-3">
              2
            </div>
            <h4 className="font-display font-semibold text-xs text-[var(--color-brand-deep)]">Personal Introduction Arranged</h4>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1.5 leading-relaxed max-w-xs">
              Our system notifies our team. The founder reviews your ticket and personally arranges your introduction within 24 to 48 hours.
            </p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="w-10 h-10 bg-[var(--color-surface-soft)] text-[var(--color-brand-deep)] rounded-full flex items-center justify-center font-semibold font-mono mb-3">
              3
            </div>
            <h4 className="font-display font-semibold text-xs text-[var(--color-brand-deep)]">Continuous Quality Monitoring</h4>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-1.5 leading-relaxed max-w-xs">
              Dialogue flows safely. We monitor exchange speed to guarantee your requirements are solved transparently.
            </p>
          </div>
        </div>
      </div>

      {/* REFUND CONDITIONS TABLE IN A CREAM BOX - STEP 11 SPEC */}
      <div className="bg-[var(--color-surface-soft)]/50 border-l-[6px] border-[var(--color-accent-gold)] rounded-r-[var(--radius-card)] p-6 mb-12">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-[var(--color-brand-deep)]" />
          <h3 className="font-mono font-semibold text-xs uppercase tracking-wide text-[var(--color-brand-deep)]">
            OFFICIAL REFUND CHARTER POLICY
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[var(--color-brand-deep)] leading-relaxed">
          <div className="bg-emerald-100/30 p-4 rounded-lg border border-emerald-200/50">
            <span className="block font-semibold text-[var(--color-brand-medium)] uppercase tracking-wider text-[9px] font-mono mb-1.5">
              ✓ QUALIFIES FOR 100% REFUND
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Introduction not yet arranged or professional fails to respond within 48 business hours.</li>
              <li>Professional has active regulatory suspensions not detected on our initial check.</li>
            </ul>
          </div>

          <div className="bg-amber-100/30 p-4 rounded-lg border border-amber-200/50">
            <span className="block font-semibold text-amber-600 uppercase tracking-wider text-[9px] font-mono mb-1.5">
              ⚠ QUALIFIES FOR 50% REFUND
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Initial connection made, but professional declines based on client conflict of interest before project scoping.</li>
            </ul>
          </div>

          <div className="bg-red-100/30 p-4 rounded-lg border border-red-200/50">
            <span className="block font-semibold text-red-600 uppercase tracking-wider text-[9px] font-mono mb-1.5">
              🗙 DOES NOT QUALIFY FOR REFUND
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Introduction completed and client changes their mind about buying the property after connection is established.</li>
              <li>Disagreements over independent professional fee structures later during negotiation.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQS ACCORDION */}
      <div>
        <h3 className="font-display font-semibold text-[var(--color-brand-deep)] text-xl text-center mb-6">
          Frequently Answered Questions
        </h3>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 flex justify-between items-center text-left text-xs sm:text-sm font-semibold text-[var(--color-brand-deep)] cursor-pointer hover:bg-[var(--color-surface-light)]"
                >
                  <span className="flex items-center space-x-2">
                    <HelpCircle className="w-4.5 h-4.5 text-[var(--color-accent-gold)]" />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-1 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
