// @ts-nocheck
import React, { useState } from 'react';
import { HelpCircle, FileText, MessageSquare, X, ChevronRight, CheckCircle, ExternalLink } from 'lucide-react';
import { SupportCategory } from '../../types';

interface QuickSupportButtonProps {
  currentTab?: string;
  onOpenSupportForm: (category: SupportCategory) => void;
}

export default function QuickSupportButton({
  currentTab = 'Overview',
  onOpenSupportForm
}: QuickSupportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);

  // Determine preselected category based on active dashboard tab
  const getCategoryFromTab = (tab: string): SupportCategory => {
    const t = tab.toLowerCase();
    if (t.includes('payment') || t.includes('billing') || t.includes('servicecharge') || t.includes('charge') || t.includes('earning') || t.includes('collection')) {
      return 'Billing and Subscription';
    }
    if (t.includes('property') || t.includes('building') || t.includes('tenant') || t.includes('unit') || t.includes('intelligence') || t.includes('vault') || t.includes('document')) {
      return 'Data or Record Concern';
    }
    if (t.includes('account') || t.includes('profile') || t.includes('login')) {
      return 'Account and Login Issues';
    }
    if (t.includes('professional') || t.includes('pmc') || t.includes('partner') || t.includes('vendor')) {
      return 'Professional Connection Issue';
    }
    return 'Other';
  };

  const handleContactSupport = () => {
    const category = getCategoryFromTab(currentTab);
    setIsOpen(false);
    onOpenSupportForm(category);
  };

  const faqItems = [
    {
      q: 'How are rent payments verified on Unity Homes?',
      a: 'All tenant payments are processed through bank transfer confirmation or verified gateway receipts. The platform automatically tracks payment status and updates the ledger.'
    },
    {
      q: 'How do I add a new property or unit?',
      a: 'Navigate to the Properties section in your dashboard and click "Add Property" or "Add Unit". Your subscription plan determines your property limit.'
    },
    {
      q: 'Where do I find my tenancy agreements and documents?',
      a: 'All executed contracts, lease deeds, and property documents are stored securely in the Document Vault under the More section.'
    },
    {
      q: 'What should I do if a payment shows an error?',
      a: 'If a payment or ledger record fails to update, click "Contact Support" to submit a ticket under "Billing and Subscription" or "Technical Problem or Bug".'
    },
    {
      q: 'How does escalation work for tenant complaints?',
      a: 'Unresolved property complaints can be escalated after 72 hours. Admin staff will review the complaint and issue a binding resolution directive.'
    }
  ];

  return (
    <div className="relative inline-block font-sans">
      {/* Question Mark Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 border border-stone-200 bg-white rounded-full hover:bg-stone-50 transition relative shadow-xs text-#6B7280 hover:text-[#18452E] cursor-pointer flex items-center justify-center"
        title="Unity Homes Quick Support"
        aria-label="Support options"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Popover Overlay Menu */}
      {isOpen && (
        <>
          {/* Backdrop dismiss */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-sm border border-stone-200 z-50 p-3 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 px-1">
              <span className="font-display font-extrabold text-#132A1D text-xs uppercase tracking-wider flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#18452E]" />
                <span>Support Access</span>
              </span>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-stone-400 hover:text-#132A1D p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              {/* Option 1: View FAQ */}
              <button
                onClick={() => { setIsOpen(false); setShowFaqModal(true); }}
                className="w-full text-left p-2.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-#132A1D text-xs group-hover:text-[#18452E]">View FAQ &amp; Help</strong>
                    <span className="text-[10px] text-#6B7280">Common platform answers</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition" />
              </button>

              {/* Option 2: Contact Support */}
              <button
                onClick={handleContactSupport}
                className="w-full text-left p-2.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200/80 transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-[#18452E] text-white rounded-lg">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block font-bold text-[#18452E] text-xs">Contact Support</strong>
                    <span className="text-[10px] text-emerald-800">
                      Pre-selects: <span className="font-mono font-bold">{getCategoryFromTab(currentTab)}</span>
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#18452E] group-hover:translate-x-0.5 transition" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* FAQ MODAL */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-2xl w-full p-6 space-y-5 border border-stone-200 shadow-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-[#18452E] rounded-2xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-#132A1D text-base uppercase tracking-wider">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs text-#6B7280">
                    Quick answers to common questions about the Unity Homes platform
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFaqModal(false)}
                className="p-2 hover:bg-stone-50 rounded-xl transition text-stone-400 hover:text-#132A1D cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5">
                  <h4 className="font-bold text-#132A1D text-xs flex items-start space-x-2">
                    <span className="text-[#18452E] font-mono font-black">Q{idx + 1}.</span>
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-#6B7280 text-xs pl-6 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-#6B7280">
                Still need help? Submit a support request directly to staff.
              </span>
              <button
                onClick={() => {
                  setShowFaqModal(false);
                  handleContactSupport();
                }}
                className="px-4 py-2 bg-[#18452E] text-white rounded-xl text-xs font-bold hover:bg-[#112d22] transition cursor-pointer flex items-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact Support Center</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
