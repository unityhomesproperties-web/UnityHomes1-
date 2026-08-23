import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, ArrowRight, ShieldCheck, Landmark, Upload, Award, FileText 
} from 'lucide-react';

interface ProfileCompletionIndicatorProps {
  onAddBank: () => void;
  onGoToSubscription: () => void;
  triggerSuccess: (msg: string) => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  actionLabel: string;
  action: () => void;
  icon: any;
}

const STORAGE_KEY = 'uh_pmc_profile_completion_v1';

export default function ProfileCompletionIndicator({
  onAddBank,
  onGoToSubscription,
  triggerSuccess
}: ProfileCompletionIndicatorProps) {
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [addressInputted, setAddressInputted] = useState(false);
  const [cacAttached, setCacAttached] = useState(false);
  const [bankLinked, setBankLinked] = useState(true); // default true from setup
  const [subscriptionActive, setSubscriptionActive] = useState(true); // default true from suite

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLogoUploaded(parsed.logoUploaded || false);
        setAddressInputted(parsed.addressInputted || false);
        setCacAttached(parsed.cacAttached || false);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveState = (updated: Record<string, boolean>) => {
    try {
      const current = {
        logoUploaded,
        addressInputted,
        cacAttached,
        ...updated
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogoUpload = () => {
    setLogoUploaded(true);
    saveState({ logoUploaded: true });
    triggerSuccess('PMC Corporate branding logo uploaded successfully!');
  };

  const handleAddressSubmit = () => {
    setAddressInputted(true);
    saveState({ addressInputted: true });
    triggerSuccess('Registered Address successfully validated with Lagos State Lands Registry!');
  };

  const handleCacAttach = () => {
    setCacAttached(true);
    saveState({ cacAttached: true });
    triggerSuccess('CAC Registration Certificate attached and verified (RC-1849182).');
  };

  const checklist: ChecklistItem[] = [
    { 
      id: 'logo', 
      label: 'Corporate Branding Logo Uploaded', 
      completed: logoUploaded, 
      actionLabel: 'Upload Logo', 
      action: handleLogoUpload, 
      icon: Upload 
    },
    { 
      id: 'address', 
      label: 'Registered Office Address Inputted', 
      completed: addressInputted, 
      actionLabel: 'Set Address', 
      action: handleAddressSubmit, 
      icon: FileText 
    },
    { 
      id: 'cac', 
      label: 'CAC Registration Cert Attached', 
      completed: cacAttached, 
      actionLabel: 'Attach Certificate', 
      action: handleCacAttach, 
      icon: Award 
    },
    { 
      id: 'bank', 
      label: 'Portfolio Bank Account Linked', 
      completed: bankLinked, 
      actionLabel: 'Check Bank Keys', 
      action: onAddBank, 
      icon: Landmark 
    },
    { 
      id: 'subscription', 
      label: 'Professional PMC Subscription Active', 
      completed: subscriptionActive, 
      actionLabel: 'Manage Plan', 
      action: onGoToSubscription, 
      icon: ShieldCheck 
    }
  ];

  const completedCount = checklist.filter(item => item.completed).length;
  const percentage = Math.round((completedCount / checklist.length) * 100);

  // SVG Circular progress metrics
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white border border-teal-100 rounded-[var(--radius-large)] p-6 shadow-xs space-y-5 animate-fade-in text-xs sm:text-sm">
      {/* Header and Ring Row */}
      <div className="flex items-center justify-between pb-3.5 border-b border-stone-200">
        <div>
          <h3 className="font-display font-black text-teal-950 uppercase text-xs tracking-wider">
            PMC PROFILE COMPLETION VETTING
          </h3>
          <p className="text-stone-400 font-light text-[11px] mt-1 leading-relaxed">
            Complete the compliance checklist to authorize unlimited tenant remittances and custom statements.
          </p>
        </div>

        {/* Circular Ring Progress */}
        <div className="relative flex items-center justify-center shrink-0 ml-4">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#0f766e"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span className="absolute font-mono font-black text-xs text-teal-950">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {checklist.map((item) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={item.id} 
              className={`p-3 rounded-2xl border flex items-center justify-between transition duration-150 ${
                item.completed 
                  ? 'bg-emerald-50/40 border-emerald-100 text-[#18452E]' 
                  : 'bg-stone-50/50 border-stone-200 text-#132A1D'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-xl ${
                  item.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-white border text-stone-400'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-xs font-bold">{item.label}</strong>
                  <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider block mt-0.5">
                    {item.completed ? 'COMPLIANT & SECURE' : 'ACTION REQUIRED'}
                  </span>
                </div>
              </div>

              {!item.completed ? (
                <button
                  onClick={item.action}
                  className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition shadow-xs"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="px-2.5 py-1 text-[9px] font-bold text-emerald-850 font-mono uppercase bg-emerald-100 rounded-lg">
                  Passed
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
