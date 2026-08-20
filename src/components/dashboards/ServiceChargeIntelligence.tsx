import React, { useState } from 'react';
import { 
  DollarSign, Activity, FileText, Filter, CheckCircle2, AlertTriangle, ChevronRight, XCircle, Users, BarChart2, Download, CheckSquare, Square, Inbox, Trash2, Send, ShieldCheck
} from 'lucide-react';
import { ServiceChargeBill, LandlordUnit, Property } from '../../types';
import SavedFilters from './SavedFilters';
import ExportCenter from './ExportCenter';
import TransparencyTimeline, { TimelineStep } from './TransparencyTimeline';
import { addToRecentlyViewed } from './RecentlyViewed';
import { writeAuditLog } from './AuditHistoryTab';

interface ServiceChargeIntelligenceProps {
  serviceCharges: ServiceChargeBill[];
  setServiceCharges: React.Dispatch<React.SetStateAction<ServiceChargeBill[]>>;
  landlordUnits: LandlordUnit[];
  properties: Property[];
  role: 'Landlord' | 'PMC' | 'Admin' | 'Tenant';
  userId?: string;
}

export default function ServiceChargeIntelligence({
  serviceCharges,
  setServiceCharges,
  landlordUnits,
  properties,
  role,
  userId
}: ServiceChargeIntelligenceProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // Added interactive states
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);
  const [activeTimelineBill, setActiveTimelineBill] = useState<ServiceChargeBill | null>(null);

  const triggerLocalSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Helper calculations
  const totalExpected = serviceCharges.reduce((sum, sc) => sum + sc.amount, 0);
  const totalCollected = serviceCharges.filter(sc => sc.status === 'Paid').reduce((sum, sc) => sum + sc.amount, 0);
  const totalOutstanding = serviceCharges.filter(sc => sc.status !== 'Paid').reduce((sum, sc) => sum + sc.amount, 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // Combine standard state filter with saved filters
  const filteredCharges = serviceCharges.filter(sc => {
    const matchesSearch = sc.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sc.categoryId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filters
    let effectiveStatus = filterStatus;
    if (activeFilters.filterStatus) {
      effectiveStatus = activeFilters.filterStatus;
    }
    const matchesStatus = effectiveStatus === 'All' || sc.status === effectiveStatus;
    const matchesUnit = !selectedUnit || sc.unitId === selectedUnit;
    
    return matchesSearch && matchesStatus && matchesUnit;
  });

  const handleVerify = (id: string) => {
    setServiceCharges(prev => prev.map(sc => sc.id === id ? { ...sc, status: 'Paid', dateVerified: new Date().toISOString().split('T')[0], verifiedBy: userId } : sc));
    triggerLocalSuccess('Service charge verified successfully. Central ledger updated.');
    
    // Audit log
    writeAuditLog(
      'SERVICE_CHARGE_VERIFIED',
      `Service charge bill reference ${id} verified and marked as PAID.`,
      'tenancy',
      id,
      'Pending Verification',
      'Paid',
      'Central Finance Team'
    );
  };

  const handleApplySavedFilter = (f: Record<string, any>) => {
    setActiveFilters(f);
    if (f.filterStatus) {
      setFilterStatus(f.filterStatus);
    } else {
      setFilterStatus('All');
    }
  };

  const handleBulkAction = (actionType: 'notice' | 'receipts' | 'reminder' | 'archive') => {
    if (selectedBillIds.length === 0) {
      alert('Kindly select at least one billing record.');
      return;
    }

    const count = selectedBillIds.length;
    if (actionType === 'notice') {
      triggerLocalSuccess(`Dispatched demand notices to ${count} tenants regarding outstanding levy charges.`);
    } else if (actionType === 'receipts') {
      triggerLocalSuccess(`Zipped and exported ${count} service charge receipts successfully.`);
    } else if (actionType === 'reminder') {
      triggerLocalSuccess(`Dispatched recurring levy settlement nudges to ${count} tenants.`);
    } else if (actionType === 'archive') {
      triggerLocalSuccess(`Archived ${count} historical service charge billing entries.`);
    }

    setSelectedBillIds([]);
    setIsBulkMode(false);
  };

  const toggleSelectBill = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedBillIds.includes(id)) {
      setSelectedBillIds(selectedBillIds.filter(bid => bid !== id));
    } else {
      setSelectedBillIds([...selectedBillIds, id]);
    }
  };

  // Timeline generator for specific bill
  const getTimelineStepsForBill = (sc: ServiceChargeBill): TimelineStep[] => {
    const isPaid = sc.status === 'Paid';
    const isPending = sc.status === 'Pending Verification';
    
    return [
      {
        label: 'Bill Created',
        description: `Service charge bill of ₦${sc.amount.toLocaleString()} generated for ${sc.tenantName}.`,
        timestamp: `${sc.dueDate.split('-')[0]}-01-05`,
        completed: true,
        active: false,
        operator: 'Unity Homes Automated Billing Service'
      },
      {
        label: 'Invoiced & Sent',
        description: `Demand notice digital copy emailed to tenant with pay-link.`,
        timestamp: `${sc.dueDate.split('-')[0]}-01-06`,
        completed: true,
        active: false,
        operator: 'Lagos Realty Partners System'
      },
      {
        label: 'Payment Logged',
        description: isPaid 
          ? `Direct bank transfer payment detected and logged.`
          : isPending
            ? `Direct bank transfer slip uploaded. Awaiting validation.`
            : `No payment recorded. Overdue timeline started.`,
        timestamp: isPaid || isPending ? sc.dateVerified || sc.dueDate : 'Unresolved',
        completed: isPaid || isPending,
        active: !isPaid && !isPending,
        operator: 'Interswitch Gateway Integration'
      },
      {
        label: 'Audited & Cleared',
        description: isPaid 
          ? `Settled cash credited to PMC operations pool ledger.` 
          : `Pending central clearance confirmation.`,
        timestamp: isPaid ? sc.dateVerified || 'Cleared' : 'Unresolved',
        completed: isPaid,
        active: isPending,
        operator: 'Bose Adeoye (PMC Lead Accountant)'
      }
    ];
  };

  const columns = [
    { header: 'Tenant Name', accessor: (sc: ServiceChargeBill) => sc.tenantName },
    { header: 'Service Category', accessor: (sc: ServiceChargeBill) => sc.categoryId.toUpperCase() },
    { header: 'Expected Fee', accessor: (sc: ServiceChargeBill) => `₦${sc.amount.toLocaleString()}` },
    { header: 'Due Date', accessor: (sc: ServiceChargeBill) => sc.dueDate },
    { header: 'Clearance Status', accessor: (sc: ServiceChargeBill) => sc.status }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-emerald-805 tracking-normal">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI GRID */}
      <div className="bg-teal-950 border rounded-3xl p-6 shadow-sm relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <DollarSign className="w-32 h-32 text-[#C9A84C]" />
        </div>
        <div className="relative z-10">
          <h2 className="font-display font-black text-2xl text-white uppercase mb-1">Service Charge Intelligence</h2>
          <p className="text-teal-200 text-xs mb-6 font-light">Real-time monitoring and collection tracking across your portfolio.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/25">
              <span className="block text-[10px] font-mono text-[#C9A84C] uppercase mb-1">Total Expected</span>
              <span className="text-xl font-display font-black">₦{totalExpected.toLocaleString()}</span>
            </div>
            <div className="bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/30">
              <span className="block text-[10px] font-mono text-emerald-300 uppercase mb-1">Total Collected</span>
              <span className="text-xl font-display font-black">₦{totalCollected.toLocaleString()}</span>
            </div>
            <div className="bg-rose-500/20 p-4 rounded-2xl border border-rose-500/30">
              <span className="block text-[10px] font-mono text-rose-300 uppercase mb-1">Outstanding Balance</span>
              <span className="text-xl font-display font-black">₦{totalOutstanding.toLocaleString()}</span>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/25">
              <span className="block text-[10px] font-mono text-[#C9A84C] uppercase mb-1">Collection Rate</span>
              <span className="text-xl font-display font-black">{collectionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSPARENCY TIMELINE MODAL OVERLAY */}
      {activeTimelineBill && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="max-w-xl w-full">
            <TransparencyTimeline
              title={`${activeTimelineBill.categoryId.replace('cat-', '').toUpperCase()} Levy Cycle`}
              referenceId={activeTimelineBill.id}
              amount={activeTimelineBill.amount}
              steps={getTimelineStepsForBill(activeTimelineBill)}
              onClose={() => setActiveTimelineBill(null)}
            />
          </div>
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search tenant or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#18452E]"
          />
          <select 
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setActiveFilters(prev => ({ ...prev, filterStatus: e.target.value }));
            }}
            className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold uppercase outline-none text-teal-950"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>

          <button
            onClick={() => setIsExportOpen(true)}
            className="px-4 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Levy Ledger</span>
          </button>

          <button
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              setSelectedBillIds([]);
            }}
            className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border ${
              isBulkMode ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-stone-50 border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{isBulkMode ? 'Exit Bulk' : 'Bulk Select'}</span>
          </button>
        </div>

        {/* Saved filters component */}
        <div className="pt-2 border-t border-stone-150">
          <SavedFilters
            listId="charges"
            activeFilters={activeFilters}
            onApplyFilter={handleApplySavedFilter}
            triggerSuccess={triggerLocalSuccess}
          />
        </div>
      </div>

      {/* BULK ACTIONS TOOLBAR */}
      {isBulkMode && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-in">
          <div>
            <strong className="block text-amber-950 font-bold text-xs uppercase">BULK LEVY ACTIONS ACTIVE</strong>
            <span className="text-[10px] text-amber-800 block mt-0.5">
              Selected <strong className="font-bold">{selectedBillIds.length}</strong> bill(s) out of {filteredCharges.length} matches.
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('notice')}
              className="px-3 py-2 bg-teal-850 hover:bg-teal-950 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Send Notice</span>
            </button>
            <button
              onClick={() => handleBulkAction('receipts')}
              className="px-3 py-2 bg-teal-850 hover:bg-teal-950 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Zip Receipts</span>
            </button>
            <button
              onClick={() => handleBulkAction('reminder')}
              className="px-3 py-2 bg-teal-850 hover:bg-teal-950 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Send Reminders</span>
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Bulk Archive</span>
            </button>
          </div>
        </div>
      )}

      {/* BILLS TABLE VIEW */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                {isBulkMode && <th className="p-3 w-8">Select</th>}
                <th className="p-3">Tenant</th>
                <th className="p-3">Property Details</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCharges.map(sc => {
                const unit = landlordUnits.find(u => u.id === sc.unitId);
                const property = properties.find(p => p.title === unit?.propertyName || unit?.propertyName.includes(p.title));
                const isSelected = selectedBillIds.includes(sc.id);

                const amountPaid = sc.status === 'Paid' ? sc.amount : 0;
                const balance = sc.amount - amountPaid;
                
                let statusColor = 'bg-stone-50 text-#6B7280';
                let statusText: string = sc.status;
                
                if (sc.status === 'Paid') {
                  statusColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                } else if (sc.status === 'Overdue' || sc.status === 'Unpaid') {
                  statusColor = 'bg-rose-100 text-rose-800 border border-rose-200';
                  statusText = 'Owing';
                } else if (sc.status === 'Pending Verification') {
                  statusColor = 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse';
                }

                return (
                  <tr 
                    key={sc.id} 
                    onClick={(e) => {
                      if (isBulkMode) {
                        toggleSelectBill(sc.id, e);
                      } else {
                        // Log to recently viewed on click
                        addToRecentlyViewed({
                          id: sc.id,
                          type: 'payment',
                          name: `${sc.categoryId.replace('cat-', '').toUpperCase()} Levy: ${sc.tenantName}`,
                          subtext: `Amount ₦${sc.amount.toLocaleString()} • Due ${sc.dueDate}`
                        });
                        // Set active timeline
                        setActiveTimelineBill(sc);
                      }
                    }}
                    className={`border-b border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    {isBulkMode && (
                      <td className="p-3">
                        <button 
                          onClick={(e) => toggleSelectBill(sc.id, e)}
                          className="p-0.5 bg-transparent border-none cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-300" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-50 overflow-hidden shrink-0 border border-white shadow-xs">
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${sc.tenantName}`} alt={sc.tenantName} className="w-full h-full object-cover" />
                        </div>
                        <div className="font-bold text-[#18452E]">{sc.tenantName}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-xs text-teal-950 font-bold">{property?.title || unit?.propertyName || 'Unknown Property'}</div>
                      <div className="text-[10px] text-stone-400 font-mono">Apt: {unit?.unitNumber || 'TBD'} &bull; {property?.location || 'Lagos'}</div>
                    </td>
                    <td className="p-3 text-xs font-mono text-#6B7280 font-bold">{sc.categoryId.replace('cat-', '').toUpperCase()}</td>
                    <td className="p-3 font-bold text-#132A1D text-right">₦{sc.amount.toLocaleString()}</td>
                    <td className="p-3 font-bold text-emerald-600 text-right">₦{amountPaid.toLocaleString()}</td>
                    <td className="p-3 font-bold text-rose-600 text-right">₦{balance.toLocaleString()}</td>
                    <td className="p-3 text-xs text-#6B7280 font-mono">{sc.dueDate}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded ${statusColor}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        {role !== 'Tenant' && balance > 0 && sc.status !== 'Pending Verification' && (
                          <button 
                            onClick={() => triggerLocalSuccess(`WhatsApp/Email collection nudge dispatched for ${sc.tenantName}.`)}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-bold hover:bg-rose-700 shadow-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
                          >
                            SEND REMINDER
                          </button>
                        )}
                        {role !== 'Tenant' && sc.status === 'Pending Verification' && (
                          <button onClick={() => handleVerify(sc.id)} className="px-3 py-1.5 bg-[#18452E] text-white rounded-lg text-[9px] font-bold hover:bg-[#18452E] shadow-xs uppercase tracking-wider transition active:scale-95 cursor-pointer">
                            VERIFY
                          </button>
                        )}
                        <button 
                          onClick={() => setActiveTimelineBill(sc)}
                          className="p-1.5 text-stone-400 hover:text-teal-800 hover:bg-stone-50 rounded-xl transition cursor-pointer" 
                          title="View Transparency Timeline"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCharges.length === 0 && (
            <div className="p-12 text-center text-stone-400 font-medium">
              <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <span>No service charges found matching criteria.</span>
            </div>
          )}
        </div>
      </div>

      {/* EXPORT MODAL */}
      <ExportCenter
        title="Service Charges & Defaulters Ledger"
        data={filteredCharges}
        columns={columns}
        activeFiltersDesc={Object.entries(activeFilters).map(([k,v]) => `${k}:${v}`).join(', ') || 'All Service Charges'}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        triggerSuccess={triggerLocalSuccess}
      />
    </div>
  );
}
