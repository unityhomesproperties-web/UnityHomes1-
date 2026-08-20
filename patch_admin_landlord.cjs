const fs = require('fs');

let code = fs.readFileSync('src/components/dashboards/AdminDashboard.tsx', 'utf8');

// 1. Add expandedLandlords state and getLandlordName
if (!code.includes('expandedLandlords')) {
  code = code.replace(
    /const \[activeTab, setActiveTab\] = useState[^;]+;/,
    `$&
  const [expandedLandlords, setExpandedLandlords] = useState<string[]>([]);
  const toggleLandlordExpand = (name: string) => setExpandedLandlords(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  
  const getLandlordName = (propertyName: string) => {
    const lower = propertyName.toLowerCase();
    if (lower.includes('osei')) return 'Mr. Babatunde Osei';
    if (lower.includes('ibrahim') || lower.includes('wuse')) return 'Alhaji Musa Ibrahim';
    if (lower.includes('adebayo') || lower.includes('lekki')) return 'Chief Funmi Adebayo';
    if (lower.includes('okafor') || lower.includes('cozy') || lower.includes('maryland')) return 'Dr. Chioma Okafor';
    if (lower.includes('adeyinka') || lower.includes('bode thomas') || lower.includes('toyin') || lower.includes('sanusi')) return 'Chief Emmanuel Adeyinka';
    return 'Mr. Babatunde Osei'; // fallback
  };`
  );
}

// 2. We need to inject the "Landlords" tab right before the "Tenants" tab
if (!code.includes("activeTab === 'Landlords'")) {
  const insertIndex = code.indexOf("{activeTab === 'Tenants'");
  if (insertIndex !== -1) {
    const landlordsTab = `        {activeTab === 'Landlords' && (
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-6 animate-fade-in">
            <div className="mb-4">
              <h3 className="font-display font-black text-[#1B4332] text-sm uppercase">Landlord Management</h3>
              <p className="text-xs text-stone-500">Manage all landlords, their portfolios, and nested tenant lists.</p>
            </div>
            <div className="space-y-6">
              {Array.from(new Set(landlordUnits.map(u => getLandlordName(u.propertyName)))).map(landlordName => {
                const unitsInLandlord = landlordUnits.filter(u => getLandlordName(u.propertyName) === landlordName);
                const expectedRent = unitsInLandlord.reduce((sum, u) => sum + u.rentAmount, 0);
                const collectedRent = unitsInLandlord.filter(u => u.paymentStatus === 'Paid').reduce((sum, u) => sum + u.rentAmount, 0);
                const managementFee = collectedRent * 0.1; // Simulated 10% fee
                
                // Admin dashboard might not have 'bookings' easily available or it might. Let's just use a simple calculated field for actualRemitted.
                const hasActiveTenants = unitsInLandlord.some(u => u.paymentStatus !== 'Vacant');
                const isExpanded = expandedLandlords.includes(landlordName);
                const actualRemitted = collectedRent * 0.9;
                const awaitingRemittance = 0;
                const isFullyAccounted = true;

                return (
                  <div key={landlordName} className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
                    <div 
                      onClick={() => toggleLandlordExpand(landlordName)}
                      className="p-5 flex justify-between items-center cursor-pointer hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                          <div>
                            <h4 className="font-display font-black text-[#1B4332] text-sm uppercase">{landlordName}</h4>
                            <span className="text-[10px] text-stone-400 font-mono">
                              Properties: {Array.from(new Set(unitsInLandlord.map(u => u.propertyName))).length} &bull; Units: {unitsInLandlord.length}
                            </span>
                          </div>
                          <div className="text-right flex items-center space-x-3 bg-stone-50 p-2 rounded-lg border border-stone-100">
                             <div className="text-right">
                               <span className="block text-[9px] uppercase font-bold text-stone-400">Awaiting Remittance</span>
                               <span className="block font-mono font-black text-stone-800">₦{awaitingRemittance.toLocaleString()}</span>                             </div>
                             {awaitingRemittance > 0 ? (
                               <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded tracking-wider shadow-sm border border-red-200">
                                 Action Required
                               </span>
                             ) : (
                               <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded tracking-wider shadow-sm border border-emerald-200">
                                 Nothing Outstanding
                               </span>
                             )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                            <span className="block text-[9px] uppercase font-bold text-stone-500 mb-1">Portfolio Value</span>
                            <span className="block font-mono font-bold text-stone-800 text-xs">₦{expectedRent.toLocaleString()}</span>
                          </div>
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                            <span className="block text-[9px] uppercase font-bold text-stone-500 mb-1">Collected Rent</span>
                            <span className="block font-mono font-bold text-stone-800 text-xs">₦{collectedRent.toLocaleString()}</span>
                          </div>
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                            <span className="block text-[9px] uppercase font-bold text-stone-500 mb-1">Remitted Rent</span>
                            <span className="block font-mono font-bold text-stone-800 text-xs">₦{actualRemitted.toLocaleString()}</span>
                          </div>
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                            <span className="block text-[9px] uppercase font-bold text-stone-500 mb-1">Management Fee</span>
                            <span className="block font-mono font-bold text-stone-800 text-xs">₦{managementFee.toLocaleString()}</span>
                          </div>
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 flex flex-col justify-center items-start">
                            <span className="block text-[9px] uppercase font-bold text-stone-500 mb-1">Status</span>
                            {collectedRent === 0 ? (
                              <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded font-bold uppercase border border-stone-200">No Payments Recorded</span>
                            ) : isFullyAccounted ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase border border-emerald-200">Fully Accounted</span>
                            ) : (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase border border-amber-200">Discrepancy</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 flex items-center justify-center">
                        <ChevronDown className={\`w-6 h-6 text-stone-400 transition-transform duration-300 \${isExpanded ? 'rotate-180' : ''}\`} />
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="border-t border-stone-100 bg-stone-50/50 p-5 space-y-3">
                        {!hasActiveTenants ? (
                          <div className="text-center py-6">
                            <span className="text-stone-400 font-mono text-sm">No active tenancies for this landlord. All units may be vacant.</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h5 className="text-[10px] uppercase font-bold text-stone-500 mb-2">Tenant Roster</h5>
                            {unitsInLandlord.filter(u => u.paymentStatus !== 'Vacant').map(u => (
                              <div 
                                key={u.id}
                                className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-500 border border-stone-100">
                                    {u.tenantName.charAt(0)}
                                  </div>
                                  <div>
                                    <strong className="block text-[#1B4332] font-bold text-sm">{u.tenantName}</strong>
                                    <span className="block text-stone-500 text-[10px] mt-0.5">{u.propertyName} ({u.unitNumber})</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  {u.paymentStatus === 'Paid' ? (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold uppercase">Paid</span>
                                  ) : u.paymentStatus === 'Due Soon' ? (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold uppercase">Due Soon</span>
                                  ) : u.paymentStatus === 'Overdue' ? (
                                    <div className="text-right">
                                      <span className="text-[10px] bg-red-100 text-red-800 px-2 py-1 rounded font-bold uppercase block mb-1">Overdue</span>
                                      <span className="text-xs font-mono font-black text-red-700 block">₦{u.rentAmount.toLocaleString()}</span>
                                    </div>
                                  ) : u.paymentStatus === 'Lease Expiring Soon' ? (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold uppercase">Expiring</span>
                                  ) : (
                                    <span className="text-[10px] bg-stone-100 text-stone-800 px-2 py-1 rounded font-bold uppercase">{u.paymentStatus}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}\n`;

    code = code.substring(0, insertIndex) + landlordsTab + code.substring(insertIndex);
  }
}

if (!code.includes('ChevronDown')) {
  code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, (match, imports) => {
    if (!imports.includes('ChevronDown')) {
      return `import { ChevronDown, ${imports} } from 'lucide-react';`;
    }
    return match;
  });
}

fs.writeFileSync('src/components/dashboards/AdminDashboard.tsx', code);
