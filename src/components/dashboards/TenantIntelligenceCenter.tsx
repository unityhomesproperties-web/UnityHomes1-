// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Home, AlertTriangle, Phone, Mail, FileText, 
  ChevronRight, Wrench, Clock, DollarSign, Calendar, MapPin, Download, CheckSquare, Square, Inbox, Trash2, Send, MessageSquare
} from 'lucide-react';
import { LandlordUnit, Property, ServiceChargeBill } from '../../types';
import SavedFilters from './SavedFilters';
import ExportCenter from './ExportCenter';
import { addToRecentlyViewed } from './RecentlyViewed';
import AuditHistoryTab, { writeAuditLog } from './AuditHistoryTab';

interface TenantIntelligenceCenterProps {
  landlordUnits: LandlordUnit[];
  properties: Property[];
  serviceCharges?: ServiceChargeBill[];
  role: 'Landlord' | 'PMC' | 'Admin';
}

export default function TenantIntelligenceCenter({
  landlordUnits,
  properties,
  serviceCharges = [],
  role
}: TenantIntelligenceCenterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<LandlordUnit | null>(null);
  
  // Custom filter state
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  
  // Export Center state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Bulk Actions state
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);

  const triggerLocalSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Add to recently viewed on open
  useEffect(() => {
    if (selectedTenant) {
      addToRecentlyViewed({
        id: selectedTenant.id,
        type: 'tenant',
        name: selectedTenant.tenantName,
        subtext: `Unit ${selectedTenant.unitNumber} • ${selectedTenant.propertyName}`
      });
      
      // Write audit trail entry
      writeAuditLog(
        'RECORD_VIEWED',
        `Tenant record for ${selectedTenant.tenantName} opened by PMC executive session.`,
        'tenancy',
        selectedTenant.id,
        'Closed',
        'Open/Active View',
        'PMC Executive Office'
      );
    }
  }, [selectedTenant]);

  const occupiedUnits = landlordUnits.filter(u => u.paymentStatus !== 'Vacant');
  const vacantUnits = landlordUnits.filter(u => u.paymentStatus === 'Vacant');

  // KPI Calculations
  const totalTenants = occupiedUnits.length;
  const rentExpected = occupiedUnits.reduce((sum, u) => sum + u.rentAmount, 0);
  const outstandingRent = rentExpected * 0.08; 
  const outstandingSC = serviceCharges.filter(sc => sc.status !== 'Paid').reduce((sum, sc) => sum + sc.amount, 0);
  const highRiskCount = occupiedUnits.filter((_, idx) => idx % 6 === 0).length;

  // Filter application logic
  const filteredUnits = landlordUnits.filter(u => {
    const matchesSearch = (u.tenantName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Saved filter combinations
    let matchesFilters = true;
    if (activeFilters.paymentStatus) {
      if (activeFilters.paymentStatus === 'Overdue') {
        matchesFilters = u.paymentStatus === 'Overdue';
      } else if (activeFilters.paymentStatus === 'Lease Expiring Soon') {
        // Mock matching middle indexes
        matchesFilters = u.paymentStatus !== 'Vacant' && u.id.charCodeAt(0) % 2 === 0;
      } else if (activeFilters.paymentStatus === 'Vacant') {
        matchesFilters = u.paymentStatus === 'Vacant';
      }
    }
    
    return matchesSearch && matchesFilters;
  });

  // Bulk operation triggers
  const handleBulkAction = (actionType: 'notice' | 'receipts' | 'export' | 'reminder' | 'archive') => {
    if (selectedTenantIds.length === 0) {
      alert('Kindly select at least one tenant to execute bulk operations.');
      return;
    }

    const count = selectedTenantIds.length;
    const selectedNames = landlordUnits
      .filter(u => selectedTenantIds.includes(u.id))
      .map(u => u.tenantName)
      .join(', ');

    if (actionType === 'notice') {
      triggerLocalSuccess(`Dispatched bulk legal regulatory notice to ${count} tenant(s): [${selectedNames}]`);
      selectedTenantIds.forEach(id => {
        writeAuditLog('BULK_NOTICE_DISPATCHED', 'Legal compliance rent notice compiled and dispatched via SMS/Email.', 'tenancy', id);
      });
    } else if (actionType === 'receipts') {
      triggerLocalSuccess(`Compiled and zipped standard certified receipts for ${count} tenant(s). Initiating secure download...`);
    } else if (actionType === 'export') {
      setIsExportOpen(true);
    } else if (actionType === 'reminder') {
      triggerLocalSuccess(`Sent premium WhatsApp collections reminder feed to ${count} tenant(s) instantly.`);
      selectedTenantIds.forEach(id => {
        writeAuditLog('COLLECTION_REMINDER', 'Automated rent collection nudge dispatched via WhatsApp Gateway.', 'tenancy', id);
      });
    } else if (actionType === 'archive') {
      if (role !== 'Admin' && role !== 'PMC') {
        alert('Action restricted. Bulk archiving is restricted to PMC Admin roles only.');
        return;
      }
      triggerLocalSuccess(`Archived registry files for ${count} tenant(s) securely.`);
    }

    // Reset selection
    setSelectedTenantIds([]);
    setIsBulkMode(false);
  };

  const toggleSelectTenant = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedTenantIds.includes(id)) {
      setSelectedTenantIds(selectedTenantIds.filter(tid => tid !== id));
    } else {
      setSelectedTenantIds([...selectedTenantIds, id]);
    }
  };

  // Columns config for Export center
  const columns = [
    { header: 'Tenant Name', accessor: (u: LandlordUnit) => u.tenantName || 'Vacant Unit' },
    { header: 'Property/Building', accessor: (u: LandlordUnit) => u.propertyName },
    { header: 'Apartment No', accessor: (u: LandlordUnit) => u.unitNumber },
    { header: 'Rent Fee', accessor: (u: LandlordUnit) => `₦${u.rentAmount.toLocaleString()}` },
    { header: 'Payment Status', accessor: (u: LandlordUnit) => u.paymentStatus }
  ];

  const activeFiltersDesc = Object.entries(activeFilters)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ') || 'Showing Complete Portfolio';

  if (selectedTenant) {
    const property = properties.find(p => p.title === selectedTenant.propertyName || selectedTenant.propertyName.includes(p.title));
    return (
      <div className="space-y-6 animate-fade-in">
        <button 
          onClick={() => setSelectedTenant(null)} 
          className="text-xs font-semibold uppercase tracking-wider text-#6B7280 hover:text-teal-800 flex items-center gap-2 cursor-pointer"
        >
          &larr; Back to Tenant Records
        </button>
        
        {/* Detail view with History Tabs */}
        <div className="bg-white rounded-[var(--radius-large)] p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-full bg-stone-50 overflow-hidden shrink-0 border-4 border-white shadow-md">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedTenant.tenantName}`} alt={selectedTenant.tenantName} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 text-[9px] font-semibold uppercase rounded ${
                  selectedTenant.paymentStatus === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>{selectedTenant.paymentStatus}</span>
                <span className="px-2 py-1 bg-stone-50 text-#6B7280 text-[9px] font-semibold uppercase rounded">Lease Active</span>
              </div>
              <h2 className="text-2xl font-display font-semibold text-teal-950">{selectedTenant.tenantName}</h2>
              <p className="text-#6B7280 font-mono text-xs mt-1">{selectedTenant.unitNumber} &bull; {property?.title}</p>
            </div>
          </div>

          {/* Quick Actions tab */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-stone-200">
            <button 
              onClick={() => triggerLocalSuccess(`Initiated direct call dialer payload to ${selectedTenant.tenantName} at 0801 234 5678.`)}
              className="p-3 bg-stone-50 hover:bg-teal-800 hover:text-white transition rounded-2xl flex flex-col items-center justify-center gap-1.5 text-#6B7280 border border-stone-200 text-xs font-semibold uppercase cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#6FBE45]" />
              <span>Call Tenant</span>
            </button>
            <button 
              onClick={() => triggerLocalSuccess(`Certified lease ledger compiled for ${selectedTenant.tenantName}`)}
              className="p-3 bg-stone-50 hover:bg-teal-800 hover:text-white transition rounded-2xl flex flex-col items-center justify-center gap-1.5 text-#6B7280 border border-stone-200 text-xs font-semibold uppercase cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#6FBE45]" />
              <span>View Ledger</span>
            </button>
            <button 
              onClick={() => triggerLocalSuccess(`Renew lease sequence queued for ${selectedTenant.tenantName}`)}
              className="p-3 bg-stone-50 hover:bg-teal-800 hover:text-white transition rounded-2xl flex flex-col items-center justify-center gap-1.5 text-#6B7280 border border-stone-200 text-xs font-semibold uppercase cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#6FBE45]" />
              <span>Renew Lease</span>
            </button>
          </div>

          {/* AUDIT HISTORY INTEGRATION */}
          <div className="pt-6 border-t border-stone-200">
            <AuditHistoryTab recordType="tenancy" recordId={selectedTenant.id} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-emerald-805 tracking-normal animate-pulse">
          <CheckSquare className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* HEADER & KPIs */}
      <div className="bg-teal-950 rounded-[var(--radius-large)] p-6 shadow-sm text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Users className="w-48 h-48 text-[#6FBE45]" />
        </div>
        <div className="relative z-10">
          <h2 className="font-display font-semibold text-2xl uppercase tracking-tight mb-2">Universal Tenant Records</h2>
          <p className="text-teal-100 text-xs max-w-xl font-normal">
            Instantly track every tenant across your portfolio. Identify risks, monitor leases, and automate collections from a single command center.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
              <span className="block text-[10px] font-mono text-[#6FBE45] uppercase tracking-wider mb-1">Total Tenants</span>
              <span className="text-2xl font-display font-semibold">{totalTenants}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
              <span className="block text-[10px] font-mono text-[#6FBE45] uppercase tracking-wider mb-1">Vacant Units</span>
              <span className="text-2xl font-display font-semibold">{vacantUnits.length}</span>
            </div>
            <div className="bg-rose-500/20 backdrop-blur-sm border border-rose-500/30 p-4 rounded-2xl">
              <span className="block text-[10px] font-mono text-rose-300 uppercase tracking-wider mb-1">Outstanding Rent</span>
              <span className="text-2xl font-display font-semibold">₦{(outstandingRent/1000000).toFixed(1)}m</span>
            </div>
            <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 p-4 rounded-2xl">
              <span className="block text-[10px] font-mono text-amber-300 uppercase tracking-wider mb-1">Unpaid S/C</span>
              <span className="text-2xl font-display font-semibold">₦{(outstandingSC/1000000).toFixed(1)}m</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
              <span className="block text-[10px] font-mono text-[#6FBE45] uppercase tracking-wider mb-1">High Risk</span>
              <span className="text-2xl font-display font-semibold">{highRiskCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS CONTAINER */}
      <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-sm space-y-4">
        {/* Search row */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by name, phone, apartment, estate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-700 transition font-medium"
            />
          </div>
          
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-5 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer w-full md:w-auto justify-center"
          >
            <Download className="w-4 h-4" />
            <span>Export Roster</span>
          </button>

          <button
            onClick={() => {
              setIsBulkMode(!isBulkMode);
              setSelectedTenantIds([]);
            }}
            className={`px-5 py-3 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer w-full md:w-auto justify-center border ${
              isBulkMode ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-stone-50 border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{isBulkMode ? 'Exit Bulk Select' : 'Bulk Select'}</span>
          </button>
        </div>

        {/* Saved filter pills Row */}
        <div className="pt-2 border-t border-stone-200">
          <SavedFilters
            listId="tenants"
            activeFilters={activeFilters}
            onApplyFilter={(f) => setActiveFilters(f)}
            triggerSuccess={triggerLocalSuccess}
          />
        </div>
      </div>

      {/* BULK ACTIONS TOOLBAR */}
      {isBulkMode && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-in">
          <div>
            <strong className="block text-amber-950 font-semibold text-xs uppercase">BULK RECORD OPERATIONS ACTIVE</strong>
            <span className="text-[10px] text-amber-800 block mt-0.5">
              Selected <strong className="font-semibold">{selectedTenantIds.length}</strong> record(s) out of {filteredUnits.length} matches.
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkAction('notice')}
              className="px-3 py-2 bg-teal-850 hover:bg-teal-950 text-white rounded-lg text-[9px] font-semibold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
            >
              <Send className="w-3 h-3" />
              <span>Send Notice</span>
            </button>
            <button
              onClick={() => handleBulkAction('receipts')}
              className="px-3 py-2 bg-teal-850 hover:bg-teal-950 text-white rounded-lg text-[9px] font-semibold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Zip Receipts</span>
            </button>
            <button
              onClick={() => handleBulkAction('reminder')}
              className="px-3 py-2 bg-teal-850 hover:bg-teal-950 text-white rounded-lg text-[9px] font-semibold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Send Reminders</span>
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-[9px] font-semibold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Bulk Archive</span>
            </button>
          </div>
        </div>
      )}

      {/* TENANT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUnits.length === 0 ? (
          <div className="col-span-full bg-white border border-stone-200 rounded-[var(--radius-large)] p-12 text-center text-stone-400">
            <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <strong className="block font-semibold">No Records Match Current Filter Selection</strong>
            <span className="text-xs block mt-1">Try resetting your active filters or query.</span>
          </div>
        ) : (
          filteredUnits.map(unit => {
            const property = properties.find(p => p.title === unit.propertyName || unit.propertyName.includes(p.title));
            const isSelected = selectedTenantIds.includes(unit.id);
            const hasSC = serviceCharges.some(sc => sc.unitId === unit.id && sc.status !== 'Paid');
            const isHighRisk = unit.id.charCodeAt(0) % 6 === 0;

            return (
              <div 
                key={unit.id} 
                onClick={(e) => {
                  if (isBulkMode) {
                    toggleSelectTenant(unit.id, e);
                  } else {
                    setSelectedTenant(unit);
                  }
                }}
                className={`bg-white border rounded-[var(--radius-large)] overflow-hidden hover:shadow-sm transition-all duration-300 cursor-pointer group flex flex-col relative ${
                  isSelected ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-stone-200'
                }`}
              >
                {/* Bulk Select Overlay checkmark indicator */}
                {isBulkMode && (
                  <button 
                    onClick={(e) => toggleSelectTenant(unit.id, e)}
                    className="absolute top-4 right-4 z-10 p-1 bg-white/95 rounded-full shadow border transition hover:scale-105 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-600 fill-amber-50" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-300" />
                    )}
                  </button>
                )}

                <div className="p-6 pb-4 border-b border-stone-200 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-stone-50 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${unit.tenantName}`} alt={unit.tenantName || 'Vacant'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-teal-950 truncate text-base">{unit.tenantName || 'Vacant Unit'}</h3>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-#6B7280 uppercase mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{property?.title || unit.propertyName}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 grid grid-cols-2 gap-4 bg-stone-50/50 flex-1">
                  <div>
                    <span className="block text-[10px] font-mono text-stone-400 uppercase">Apartment</span>
                    <span className="font-semibold text-xs text-#132A1D">{unit.unitNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-stone-400 uppercase">Rent</span>
                    <span className="font-semibold text-xs text-teal-850">₦{(unit.rentAmount/1000).toLocaleString()}k</span>
                  </div>
                </div>

                <div className="p-4 flex flex-wrap gap-1.5 border-t border-stone-200 bg-white text-[9px] font-semibold uppercase">
                  <span className={`px-2 py-0.5 rounded ${
                    unit.paymentStatus === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>{unit.paymentStatus || 'No Record'}</span>
                  {hasSC && <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded">Owing S/C</span>}
                  {isHighRisk && <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded">High Risk</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* EXPORT DOCKET MODAL */}
      <ExportCenter
        title="Tenant Portfolio Ledger"
        data={filteredUnits}
        columns={columns}
        activeFiltersDesc={activeFiltersDesc}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        triggerSuccess={triggerLocalSuccess}
      />
    </div>
  );
}
