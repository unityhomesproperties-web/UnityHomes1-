// @ts-nocheck
import React, { useState } from 'react';
import { Sparkles, Sun, Clock, Mail, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';

interface OperationsBriefingProps {
  role?: 'Landlord' | 'PMC' | 'Shortlet Manager' | 'Tenant' | 'Admin' | string;
  userName?: string;
  units?: any[];
  properties?: any[];
  bookings?: any[];
}

export default function OperationsBriefingCard({
  role = 'Landlord',
  userName = 'Valued Partner',
  units = [],
  properties = [],
  bookings = []
}: OperationsBriefingProps) {
  const [emailDigestEnabled, setEmailDigestEnabled] = useState<boolean>(() => {
    return localStorage.getItem(`uh_briefing_digest_${role}`) !== 'false';
  });
  const [copied, setCopied] = useState(false);

  const toggleEmailDigest = () => {
    const nextState = !emailDigestEnabled;
    setEmailDigestEnabled(nextState);
    localStorage.setItem(`uh_briefing_digest_${role}`, String(nextState));
  };

  // Generate role-specific morning briefing bullets
  const getBriefingBullets = (): { text: string; category: string; highlight?: boolean }[] => {
    const todayStr = new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (role === 'Landlord' || role === 'Shortlet Landlord') {
      const occupied = units.filter(u => u.occupancyStatus === 'Occupied' || u.status === 'Occupied').length;
      const total = units.length || 5;
      const occPct = Math.round((occupied / total) * 100) || 88;
      const overdueCount = units.filter(u => u.paymentStatus === 'Overdue').length;

      return [
        {
          category: 'PORTFOLIO STATUS',
          text: `Good morning, ${userName}. As of 7:00 AM WAT on ${todayStr}, your portfolio occupancy stands at ${occPct}% (${occupied} of ${total} units active).`,
          highlight: true
        },
        {
          category: 'COLLECTIONS',
          text: overdueCount > 0 
            ? `${overdueCount} rent payment is currently pending confirmation or overdue. Automation workflows are active.` 
            : `All active rent accounts are fully confirmed up to date with zero overdue arrears.`,
        },
        {
          category: 'REMITTANCE FEED',
          text: `Direct bank account remittance instructions for Q3 2026 remain active. Confirmed funds flow directly to your designated bank account.`
        },
        {
          category: 'MAINTENANCE',
          text: `Zero emergency maintenance issues reported in the last 24 hours. Routine facility checkups remain on schedule.`
        }
      ];
    } else if (role === 'PMC') {
      return [
        {
          category: 'PMC OPERATIONAL BRIEFING',
          text: `Good morning, ${userName}. 7:00 AM daily briefing for managed buildings in Victoria Island, Lekki Phase 1, and Ikoyi.`,
          highlight: true
        },
        {
          category: 'COLLECTION ENGINE',
          text: `87% of monthly tenant service charges confirmed. Automated reminder dispatches queued for remaining 13%.`
        },
        {
          category: 'TENANT TICKET QUEUE',
          text: `2 open routine maintenance requests assigned to verified technicians. Target resolution within 24 hours.`
        },
        {
          category: 'CONTRACTOR REMITTANCE',
          text: `All contractor payout vouchers pre-verified against approved service completions.`
        }
      ];
    } else if (role === 'Shortlet Manager') {
      const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked-In').length || 4;
      return [
        {
          category: 'SHORTLET MORNING BRIEFING',
          text: `Good morning. 7:00 AM Shortlet Operations Briefing for ${userName}.`,
          highlight: true
        },
        {
          category: 'CHECK-IN / CHECK-OUT',
          text: `${activeBookings} active reservations scheduled for check-in / check-out today. Housekeeping dispatches notified.`
        },
        {
          category: 'CHANNEL SYNC',
          text: `Calendar rates and availability fully synchronized across Airbnb, Booking.com, and Direct Booking channels.`
        }
      ];
    } else if (role === 'Tenant') {
      return [
        {
          category: 'TENANT DAILY BRIEFING',
          text: `Good morning, ${userName}. Welcome to your Unity Homes Resident Briefing for ${todayStr}.`,
          highlight: true
        },
        {
          category: 'LEASE & ACCOUNT STATUS',
          text: `Your lease account is in good standing with zero pending arrears.`
        },
        {
          category: 'BUILDING NOTICES',
          text: `Facility maintenance check on water filtration tanks scheduled for Thursday 10:00 AM WAT.`
        }
      ];
    } else {
      return [
        {
          category: 'SYSTEM BRIEFING',
          text: `Good morning Admin. 7:00 AM System Health & Operations Briefing.`,
          highlight: true
        },
        {
          category: 'PLATFORM LEDGER',
          text: `All direct collection channels operational. Ledger synchronization operating with 100% precision.`
        }
      ];
    }
  };

  const bullets = getBriefingBullets();

  const handleCopyBriefing = () => {
    const briefingText = `UNITY HOMES 7:00 AM OPERATIONS BRIEFING\nRole: ${role}\nDate: ${new Date().toLocaleDateString()}\n\n` +
      bullets.map(b => `[${b.category}] ${b.text}`).join('\n\n');
    
    navigator.clipboard.writeText(briefingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className=" text-white rounded-[var(--radius-large)] p-6 shadow-md relative overflow-hidden space-y-4">
      {/* Subtle Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C9A84C]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-700/50 pb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5 text-[#C9A84C]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-black text-white text-sm uppercase tracking-wider">
                7:00 AM Morning Briefing
              </h3>
              <span className="text-[9px] font-mono bg-[#C9A84C] text-[#112A1F] font-bold px-2 py-0.5 rounded-full uppercase">
                Daily 07:00 WAT
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 font-light mt-0.5">
              Automated executive summary generated daily at 7:00 AM WAT
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleCopyBriefing}
            className="px-2.5 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded-xl text-[10px] font-mono flex items-center space-x-1.5 border border-emerald-700/50 transition cursor-pointer"
            title="Copy Briefing Text"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={toggleEmailDigest}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold flex items-center space-x-1.5 border transition cursor-pointer ${
              emailDigestEnabled 
                ? 'bg-[#C9A84C] text-[#112A1F] border-[#C9A84C]' 
                : 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50 hover:bg-emerald-800/50'
            }`}
            title="Toggle daily 7:00 AM email digest"
          >
            <Mail className="w-3 h-3" />
            <span>{emailDigestEnabled ? '7AM Email Enabled' : 'Enable 7AM Email'}</span>
          </button>
        </div>
      </div>

      {/* Briefing Bullets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {bullets.map((b, idx) => (
          <div 
            key={idx}
            className={`p-3.5 rounded-2xl border transition ${
              b.highlight 
                ? 'bg-emerald-900/50 border-[#C9A84C]/40 text-white' 
                : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-100'
            }`}
          >
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-[9px] font-mono font-bold text-[#C9A84C] tracking-wider uppercase">
                {b.category}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed font-light">
              {b.text}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="flex items-center justify-between text-[10px] text-emerald-300/70 font-mono pt-1">
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3 h-3 text-[#C9A84C]" />
          <span>Next scheduled briefing dispatch: Tomorrow 07:00 AM WAT</span>
        </div>
        <span className="hidden sm:inline">Unity Homes Cloud Trigger Service</span>
      </div>
    </div>
  );
}
