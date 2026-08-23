import React, { useState, useEffect } from 'react';
import { 
  Search, Command, Bot, Sparkles, X, ChevronRight, FileText, 
  CheckCircle2, User, Building, Landmark, AlertTriangle, Send, Check 
} from 'lucide-react';
import { CollectionTenant } from './AICollectionCenter';

const LOCAL_STORAGE_TENANTS_KEY = 'uh_collection_tenants_v1';
const LOCAL_STORAGE_LOGS_KEY = 'uh_collection_logs_v1';

export default function GlobalAICommandCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tenants, setTenants] = useState<CollectionTenant[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load live interconnected database when opening modal
  useEffect(() => {
    if (isOpen) {
      const cached = localStorage.getItem(LOCAL_STORAGE_TENANTS_KEY);
      if (cached) {
        setTenants(JSON.parse(cached));
      }
    }
  }, [isOpen]);

  // Toggle with Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- PARSE NATURAL LANGUAGE QUERY TO MATCH REAL-TIME TENANTS ---
  const getQueryResult = () => {
    const norm = query.toLowerCase();
    let matchedTenants: CollectionTenant[] = [];
    let title = '';
    let explanation = '';

    if (norm.includes('60 days') || norm.includes('over 60')) {
      matchedTenants = tenants.filter(t => t.rentStatus === 'Overdue' && t.overdueDays >= 60);
      title = 'Tenants Owing Rent Over 60 Days';
      explanation = 'These tenants currently have outstanding rent cycles overdue by 60 days or more and require immediate legal escalation.';
    } else if (norm.includes('service charge') || norm.includes('servicecharges')) {
      matchedTenants = tenants.filter(t => (t.serviceChargeAmount - t.serviceChargePaid) > 0);
      title = 'Tenants Owing Service Charges';
      explanation = 'Active accounts with outstanding service levies. Schedulers are currently sending weekly reconciliations.';
    } else if (norm.includes('partial') || norm.includes('partial payments')) {
      matchedTenants = tenants.filter(t => t.rentStatus === 'Partially Paid' || t.serviceChargeStatus === 'Partially Paid');
      title = 'Tenants with Partial Payments';
      explanation = 'Tenants who have settled a portion of their monthly ledger (e.g. caution deposits or utility bills) but hold unresolved balances.';
    } else if (norm.includes('default') || norm.includes('likely to default')) {
      matchedTenants = tenants.filter(t => t.isHighRisk);
      title = 'High Risk / Likely to Default Profiles';
      explanation = 'Critical accounts with consecutive late payments or arrears exceeding 60 days. Marked for strict rent holding audits.';
    } else if (norm.includes('not paid') || norm.includes('not paid this month') || norm.includes('who has not')) {
      matchedTenants = tenants.filter(t => t.rentStatus === 'Overdue' || t.serviceChargeStatus === 'Unpaid' || t.serviceChargeStatus === 'Overdue');
      title = 'Unsettled Ledgers This Month';
      explanation = 'Accounts currently in active arrears (rent, service, or both charges). Schedulers are actively dispatching reminders.';
    } else if (norm.includes('reminder') || norm.includes('need reminders') || norm.includes('reminders today')) {
      matchedTenants = tenants.filter(t => t.rentStatus === 'Overdue' || t.serviceChargeStatus === 'Unpaid' || t.serviceChargeStatus === 'Overdue');
      title = 'Tenants Eligible for Reminders Today';
      explanation = 'Tenants with unpaid balances who haven&apos;t settled. Tap "Remind" to dispatch personalized multi-channel alerts.';
    }

    return { matchedTenants, title, explanation };
  };

  const { matchedTenants, title, explanation } = getQueryResult();

  // --- QUICK ONE-TAP DISPATCH FROM SEARCH MODAL ---
  const handleDispatchReminder = (tenant: CollectionTenant) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const cachedLogs = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
    const logs = cachedLogs ? JSON.parse(cachedLogs) : [];

    const outstandingAmt = ((tenant.rentAmount - tenant.rentPaid) + (tenant.serviceChargeAmount - tenant.serviceChargePaid));

    // Dispatch Email and In-App
    const newLogs = [
      {
        id: `rem-gen-${Math.random().toString(36).substr(2, 9)}`,
        tenantName: tenant.tenantName,
        propertyName: tenant.propertyName,
        unitNumber: tenant.unitNumber,
        dateSent: dateStr,
        timeSent: timeStr,
        sender: 'AI',
        channel: 'Email',
        status: 'Delivered',
        readStatus: 'Unread',
        paymentStatusAfter: 'Unpaid',
        outstandingAmt
      },
      {
        id: `rem-gen-${Math.random().toString(36).substr(2, 9)}`,
        tenantName: tenant.tenantName,
        propertyName: tenant.propertyName,
        unitNumber: tenant.unitNumber,
        dateSent: dateStr,
        timeSent: timeStr,
        sender: 'AI',
        channel: 'In-App',
        status: 'Delivered',
        readStatus: 'Unread',
        paymentStatusAfter: 'Unpaid',
        outstandingAmt
      },
      ...logs
    ];

    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(newLogs));
    
    setSuccessMessage(`AI Engine: Instantly dispatched personalized Email & in-app reminders to ${tenant.tenantName}.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#18452E] text-[#C9A84C] rounded-full shadow-sm flex items-center justify-center hover:scale-105 transition-all z-50 cursor-pointer border-2 border-[#C9A84C]"
        title="Open AI Command Center (Cmd+K)"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6 bg-#132A1D/60 backdrop-blur-sm animate-fade-in font-sans tracking-wide">
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>
      
      <div className="relative w-full max-w-3xl bg-[#FAF9F6] rounded-[var(--radius-large)] shadow-sm overflow-hidden flex flex-col max-h-[85vh] border border-stone-200">
        
        {/* Header / Input */}
        <div className="p-4 border-b border-stone-200 flex items-center gap-3 bg-white">
          <Bot className="w-6 h-6 text-[#18452E]" />
          <input 
            type="text" 
            autoFocus
            placeholder="Ask AI... (e.g. 'Show tenants owing rent over 60 days', 'Who is likely to default?')"
            className="flex-1 bg-transparent outline-none text-base text-#132A1D placeholder-stone-400 font-semibold"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:text-#132A1D bg-stone-50 hover:bg-stone-200 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* SUCCESS BANNER */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {query.length > 0 ? (
            <div className="space-y-4">
              {title ? (
                <div className="space-y-3">
                  {/* Matching AI Interpretation Card */}
                  <div className="p-4 bg-white border border-stone-200 rounded-2xl space-y-1">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#C9A84C]" />
                      <h4 className="font-display font-black text-xs text-[#18452E] uppercase">{title}</h4>
                    </div>
                    <p className="text-xs text-stone-550 leading-relaxed pt-1">{explanation}</p>
                  </div>

                  {/* Tenants Result List */}
                  <div className="bg-white border rounded-2xl overflow-hidden divide-y divide-stone-100">
                    <div className="p-3 bg-stone-50 font-mono text-[9px] text-stone-400 uppercase font-black tracking-wider">
                      Live Database Results ({matchedTenants.length} profiles matching)
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto divide-y divide-stone-100">
                      {matchedTenants.map(tenant => {
                        const rentOwing = tenant.rentAmount - tenant.rentPaid;
                        const scOwing = tenant.serviceChargeAmount - tenant.serviceChargePaid;
                        
                        return (
                          <div key={tenant.id} className="p-3.5 hover:bg-stone-50/50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-#132A1D">{tenant.tenantName}</span>
                                {tenant.isHighRisk && (
                                  <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">High Risk</span>
                                )}
                              </div>
                              <span className="text-[10px] text-stone-450 block font-mono">{tenant.propertyName} ({tenant.unitNumber})</span>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <div className="text-right">
                                {rentOwing > 0 && <div className="text-[10px] text-#6B7280">Rent: <strong className="text-rose-700 font-mono">₦{rentOwing.toLocaleString()}</strong></div>}
                                {scOwing > 0 && <div className="text-[10px] text-#6B7280">SC: <strong className="text-rose-700 font-mono">₦{scOwing.toLocaleString()}</strong></div>}
                              </div>

                              <button
                                onClick={() => handleDispatchReminder(tenant)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white rounded-lg text-[9px] font-black uppercase transition cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                <span>Remind</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {matchedTenants.length === 0 && (
                        <div className="p-6 text-center text-stone-400 italic">No tenants currently match this criteria in our database.</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 hover:bg-emerald-100 transition-colors cursor-pointer group">
                    <div className="p-2 bg-[#18452E]/10 text-[#18452E] rounded-xl mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-#132A1D">Ask AI Engine: "{query}"</h4>
                      <p className="text-xs text-#6B7280 mt-1">Submit this natural query to search our active rent &amp; service ledgers</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-#6B7280" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Daily Briefing Card */}
              <div className="p-5 bg-[#18452E] text-white rounded-[var(--radius-large)] relative overflow-hidden border border-[#18452E]">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Bot className="w-32 h-32" />
                </div>
                <h3 className="text-[10px] font-mono uppercase text-[#C9A84C] font-black mb-2.5 tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> AI Daily Collection Briefing
                </h3>
                <ul className="space-y-2 text-xs text-stone-200">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>8 tenants have critical overdue rent cycles exceeding 30 days. Action recommended.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Current overall rent collection rate stands at 89.2% across active properties.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Service charges collections are 74.5% complete this month. Schedulers running.</span>
                  </li>
                </ul>
              </div>

              {/* Quick Suggestion buttons */}
              <h3 className="text-[10px] font-mono uppercase text-stone-400 font-bold mb-2 tracking-widest px-1">Suggested Collections Commands</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { text: 'Show tenants owing rent over 60 days.', sub: 'Immediate escalation list' },
                  { text: 'Show tenants owing service charges.', sub: 'Active service levy balances' },
                  { text: 'Show tenants with partial payments.', sub: 'Partially settled ledgers' },
                  { text: 'Who is likely to default?', sub: 'High risk rent holders' },
                  { text: 'Who has not paid this month?', sub: 'Unpaid invoice cycle check' },
                  { text: 'Which tenants need reminders today?', sub: 'Scheduler queue preview' }
                ].map((cmd, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setQuery(cmd.text)}
                    className="flex items-center gap-3 p-3 text-left rounded-xl hover:bg-stone-50 bg-white border border-stone-200/50 transition-colors group cursor-pointer"
                  >
                    <div className="p-2 bg-stone-50 group-hover:bg-white rounded-lg text-#6B7280 border">
                      <Command className="w-4 h-4 text-#6B7280" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-850">{cmd.text}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{cmd.sub}</div>
                    </div>
                  </button>
                ))}
              </div>

            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-250 text-center flex items-center justify-between">
          <span className="text-[10px] font-mono text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Command className="w-3.5 h-3.5" /> Cmd K to close
          </span>
          <span className="text-[10px] text-[#18452E] font-black uppercase tracking-wider bg-[#18452E]/10 px-2.5 py-1 rounded">
            Unity Homes AI Active
          </span>
        </div>

      </div>
    </div>
  );
}
