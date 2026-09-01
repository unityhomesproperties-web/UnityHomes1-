import React, { useState } from 'react';
import { Tag, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { validatePromoCode, ValidatePromoCodeOutput } from '../lib/promoCodeSystem';

interface CollapsiblePromoCodeSectionProps {
  appliesTo: 'professional_connection' | 'subscription';
  planName: string;
  baseAmount: number;
  userId?: string;
  userRole?: string;
  onPromoApplied: (result: ValidatePromoCodeOutput | null, code: string) => void;
  darkTheme?: boolean;
}

export default function CollapsiblePromoCodeSection({
  appliesTo,
  planName,
  baseAmount,
  userId = 'guest-user',
  userRole = 'Public',
  onPromoApplied,
  darkTheme = false
}: CollapsiblePromoCodeSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedResult, setAppliedResult] = useState<ValidatePromoCodeOutput | null>(null);

  const handleApply = () => {
    const cleanCode = promoCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setPromoError('Please enter a promo code.');
      return;
    }

    setIsValidating(true);
    setPromoError(null);

    // Simulate async function execution
    setTimeout(() => {
      setIsValidating(false);
      const res = validatePromoCode({
        code: cleanCode,
        applies_to: appliesTo,
        plan_name: planName,
        order_amount: baseAmount,
        user_id: userId,
        user_role: userRole
      });

      if (res.valid) {
        setAppliedResult(res);
        setPromoError(null);
        onPromoApplied(res, cleanCode);
      } else {
        setAppliedResult(null);
        setPromoError(res.message);
        onPromoApplied(null, '');
      }
    }, 400);
  };

  const handleRemove = () => {
    setAppliedResult(null);
    setPromoCodeInput('');
    setPromoError(null);
    onPromoApplied(null, '');
  };

  return (
    <div className="w-full my-3">
      {!isExpanded && !appliedResult ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className={`min-h-[44px] py-2 px-3 flex items-center justify-center space-x-1.5 text-xs font-mono font-semibold cursor-pointer transition rounded-xl ${
            darkTheme
              ? 'text-[#6FBE45] hover:text-amber-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-[#6FBE45]/30'
              : 'text-[#18452E] hover:text-[#18452E] bg-stone-50/80 hover:bg-stone-200/80 border border-stone-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Have a promo code? <span className="underline decoration-1 underline-offset-2">Tap to enter promo code</span></span>
          <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
        </button>
      ) : (
        <div className={`p-3.5 rounded-2xl border transition-all text-xs ${
          darkTheme 
            ? 'bg-emerald-950/60 border-emerald-800 text-white' 
            : 'bg-stone-50 border-stone-200 text-[#18452E]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center space-x-1 ${
              darkTheme ? 'text-[#6FBE45]' : 'text-[#18452E]'
            }`}>
              <Tag className="w-3 h-3" />
              <span>Have a promo code?</span>
            </span>
            {!appliedResult && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-[10px] text-stone-400 hover:text-#6B7280 min-h-[30px] px-2 flex items-center"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {appliedResult && appliedResult.valid ? (
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-3 text-#132A1D space-y-2 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono font-semibold text-xs text-emerald-900 tracking-wider uppercase block">
                      {appliedResult.code || promoCodeInput.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-800 block">
                      {appliedResult.discount_type === 'percentage'
                        ? `Save ${appliedResult.discount_value}% on your ${appliesTo === 'professional_connection' ? 'connection' : 'subscription'}`
                        : appliedResult.discount_type === 'fixed_amount'
                        ? `Save ₦${appliedResult.discount_value?.toLocaleString()} on your ${appliesTo === 'professional_connection' ? 'connection' : 'subscription'}`
                        : appliedResult.sanitized_description || 'Discount Applied'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemove}
                  className="min-h-[44px] min-w-[44px] px-2 py-1 text-xs font-semibold text-red-600 hover:text-red-800 hover:underline cursor-pointer shrink-0 flex items-center justify-center"
                >
                  Remove
                </button>
              </div>

              <div className="pt-2 border-t border-emerald-200/70 flex items-baseline justify-between font-mono">
                <div>
                  <span className="text-[10px] text-#6B7280 line-through mr-2">
                    ₦{baseAmount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    -₦{appliedResult.discount_amount?.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block font-sans">FINAL PRICE</span>
                  <span className="font-display font-semibold text-base text-emerald-700">
                    ₦{(appliedResult.final_amount ?? appliedResult.discounted_amount ?? (baseAmount - (appliedResult.discount_amount || 0))).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your code"
                  value={promoCodeInput}
                  onChange={e => {
                    setPromoCodeInput(e.target.value.toUpperCase());
                    setPromoError(null);
                  }}
                  className={`flex-1 h-11 px-3.5 text-xs font-mono uppercase rounded-xl border-2 transition focus:outline-none ${
                    darkTheme
                      ? 'bg-emerald-900/40 border-emerald-600 text-white placeholder-emerald-300/50 focus:border-[#6FBE45]'
                      : 'bg-white border-emerald-600 text-[#18452E] placeholder-stone-400 focus:border-[#0E2F1F]'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isValidating || !promoCodeInput.trim()}
                  className="h-11 min-w-[80px] px-4 bg-[#18452E] hover:bg-[#18452E] disabled:bg-stone-300 disabled:text-#6B7280 text-white font-semibold text-xs uppercase rounded-xl transition cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>

              {promoError && (
                <div className="mt-2 text-[11px] font-mono text-red-600 font-semibold bg-red-50/90 border border-red-200 p-2 rounded-lg animate-fade-in">
                  {promoError}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
