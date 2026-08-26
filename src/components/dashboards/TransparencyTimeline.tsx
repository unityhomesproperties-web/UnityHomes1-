// @ts-nocheck
import React from 'react';
import { 
  CheckCircle2, Clock, AlertCircle, Sparkles, Send, ShieldCheck, DollarSign 
} from 'lucide-react';

export interface TimelineStep {
  label: string;
  description: string;
  timestamp: string;
  completed: boolean;
  active: boolean;
  operator?: string;
}

interface TransparencyTimelineProps {
  title: string;
  referenceId: string;
  amount: number;
  steps: TimelineStep[];
  onClose?: () => void;
}

export default function TransparencyTimeline({
  title,
  referenceId,
  amount,
  steps,
  onClose
}: TransparencyTimelineProps) {
  return (
    <div className="bg-white border border-teal-100 rounded-[var(--radius-large)] p-6 space-y-5 shadow-sm animate-fade-in text-xs sm:text-sm">
      {/* Header */}
      <div className="flex justify-between items-start pb-3 border-b border-stone-200">
        <div>
          <span className="text-[9px] font-mono font-black text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded uppercase">
            Financial Transparency Center
          </span>
          <h3 className="font-display font-black text-teal-950 text-sm mt-1.5 uppercase leading-tight">
            {title}
          </h3>
          <span className="text-[10px] text-stone-400 font-mono block mt-1">
            Reference Ledger Key: <strong className="text-teal-950 font-bold">{referenceId}</strong>
          </span>
        </div>

        <div className="text-right shrink-0 bg-stone-50 border border-stone-200 p-2.5 rounded-2xl">
          <span className="block text-[9px] uppercase font-bold text-stone-400">Ledger Value</span>
          <strong className="block font-mono font-black text-teal-950 text-base">
            ₦{amount.toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Timeline Steps layout */}
      <div className="relative pl-6 border-l border-stone-200 ml-3 space-y-6 py-2.5">
        {steps.map((step, idx) => {
          return (
            <div key={idx} className="relative">
              {/* Timeline dot */}
              <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border bg-white ${
                step.completed 
                  ? 'border-emerald-500 text-emerald-600' 
                  : step.active 
                    ? 'border-teal-700 text-teal-800 animate-pulse' 
                    : 'border-stone-300 text-stone-400'
              }`}>
                {step.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100" />
                ) : (
                  <span className={`h-1.5 w-1.5 rounded-full ${step.active ? 'bg-teal-700' : 'bg-stone-300'}`} />
                )}
              </span>

              {/* Step info card */}
              <div className={`p-4 rounded-2xl border transition duration-200 ${
                step.completed 
                  ? 'bg-emerald-50/20 border-emerald-100/70 text-[#18452E]' 
                  : step.active 
                    ? 'bg-teal-50/30 border-teal-200 text-teal-950 shadow-xs' 
                    : 'bg-stone-50/50 border-stone-200 text-#6B7280'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <strong className={`text-xs font-bold uppercase ${
                    step.completed ? 'text-emerald-950' : step.active ? 'text-teal-950' : 'text-#6B7280'
                  }`}>
                    {step.label}
                  </strong>
                  <span className="text-[10px] font-mono text-stone-400 block font-bold">
                    {step.timestamp}
                  </span>
                </div>
                <p className="text-[11px] font-light mt-1 text-#6B7280 leading-relaxed">
                  {step.description}
                </p>
                {step.operator && (
                  <span className="text-[9px] font-mono text-stone-400 block mt-2 font-bold uppercase">
                    Operator: <strong className="text-teal-900">{step.operator}</strong>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Disclaimer */}
      <div className="p-3.5 bg-teal-50 border border-teal-100 rounded-xl flex items-start space-x-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
        {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
        <p className="text-[10px] text-teal-800 leading-relaxed">
          <b>Immutable System Guarantee:</b> This financial record ledger cannot be overridden or modified retroactively. All payment confirmations match verified bank transfer references.
        </p>
      </div>

      {onClose && (
        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-800 text-white font-bold rounded-xl text-xs hover:bg-teal-900 transition cursor-pointer"
          >
            Dismiss Ledger Lifecycle
          </button>
        </div>
      )}
    </div>
  );
}
