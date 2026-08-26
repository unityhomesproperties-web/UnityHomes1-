// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Tag, PlusCircle, CheckCircle2, XCircle, Search, Filter, Copy, Check, 
  ArrowUpDown, Eye, Edit3, Power, Gift, Calendar, DollarSign, Award,
  Users, Layers, AlertCircle, ShieldCheck, RefreshCw, X
} from 'lucide-react';
import { PromoCode, PromoCodeRedemption, DiscountType, AppliesToScope } from '../../types';
import { 
  getPromoCodes, savePromoCodes, getPromoCodeRedemptions, savePromoCodeRedemptions 
} from '../../lib/promoCodeSystem';

interface PromoCodesAdminSectionProps {
  triggerSuccess: (msg: string) => void;
}

export default function PromoCodesAdminSection({ triggerSuccess }: PromoCodesAdminSectionProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [redemptions, setRedemptions] = useState<PromoCodeRedemption[]>([]);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'professional_connection' | 'subscription'>('all');

  // Sorting state
  const [sortField, setSortField] = useState<keyof PromoCode>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [viewRedemptionsCode, setViewRedemptionsCode] = useState<PromoCode | null>(null);
  const [copiedCodeSuccess, setCopiedCodeSuccess] = useState<string | null>(null);

  // Created Code Success Banner Modal
  const [createdCodeNotification, setCreatedCodeNotification] = useState<{ code: string; desc: string } | null>(null);

  // Form inputs state
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<DiscountType>('percentage');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(20);
  const [formAppliesTo, setFormAppliesTo] = useState<AppliesToScope>('all');
  const [formSpecificPlan, setFormSpecificPlan] = useState<string>('');
  const [formEligibleRoles, setFormEligibleRoles] = useState<string[]>(['all']);
  const [formMaxUsesUnlimited, setFormMaxUsesUnlimited] = useState<boolean>(true);
  const [formMaxUses, setFormMaxUses] = useState<number>(100);
  const [formValidFrom, setFormValidFrom] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [formNoExpiry, setFormNoExpiry] = useState<boolean>(true);
  const [formExpiresAt, setFormExpiresAt] = useState<string>(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );

  // Load data on mount & subscribe to storage events
  const loadData = () => {
    setPromoCodes(getPromoCodes());
    setRedemptions(getPromoCodeRedemptions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Summary Metrics calculations
  const now = new Date();
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const activeCodesCount = promoCodes.filter(c => c.is_active).length;

  const redemptionsThisMonth = redemptions.filter(r => {
    if (!r.redeemed_at) return false;
    return r.redeemed_at.startsWith(currentMonthYear) && r.status === 'applied';
  });

  const totalRedemptionsThisMonth = redemptionsThisMonth.length;

  const totalDiscountGivenThisMonth = redemptionsThisMonth.reduce(
    (sum, r) => sum + (r.discount_amount || 0), 0
  );

  // Calculate most used code this month
  const codeRedemptionCountsThisMonth: Record<string, number> = {};
  redemptionsThisMonth.forEach(r => {
    codeRedemptionCountsThisMonth[r.code] = (codeRedemptionCountsThisMonth[r.code] || 0) + 1;
  });

  let mostUsedCodeThisMonth = 'None';
  let maxCountThisMonth = 0;
  Object.entries(codeRedemptionCountsThisMonth).forEach(([code, count]) => {
    if (count > maxCountThisMonth) {
      maxCountThisMonth = count;
      mostUsedCodeThisMonth = code;
    }
  });

  // Sorting handler
  const handleSort = (field: keyof PromoCode) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted promo codes
  const filteredCodes = promoCodes.filter(c => {
    const matchesSearch = 
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.specific_plan && c.specific_plan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? c.is_active :
      !c.is_active;

    const matchesScope = 
      scopeFilter === 'all' ? true :
      c.applies_to === scopeFilter || c.applies_to === 'all';

    return matchesSearch && matchesStatus && matchesScope;
  }).sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (valA === null || valA === undefined) valA = '';
    if (valB === null || valB === undefined) valB = '';

    if (typeof valA === 'string') {
      const cmp = valA.localeCompare(String(valB));
      return sortDirection === 'asc' ? cmp : -cmp;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Reset form inputs
  const resetForm = () => {
    setFormCode('');
    setFormDescription('');
    setFormDiscountType('percentage');
    setFormDiscountValue(20);
    setFormAppliesTo('all');
    setFormSpecificPlan('');
    setFormEligibleRoles(['all']);
    setFormMaxUsesUnlimited(true);
    setFormMaxUses(100);
    setFormValidFrom(new Date().toISOString().split('T')[0]);
    setFormNoExpiry(true);
    setFormExpiresAt(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (code: PromoCode) => {
    setEditingCode(code);
    setFormDescription(code.description);
    setFormDiscountType(code.discount_type);
    setFormDiscountValue(code.discount_value);
    setFormAppliesTo(code.applies_to);
    setFormSpecificPlan(code.specific_plan || '');
    setFormEligibleRoles(code.eligible_roles || ['all']);
    setFormMaxUsesUnlimited(code.max_uses === null);
    setFormMaxUses(code.max_uses || 100);
    setFormValidFrom(code.valid_from ? code.valid_from.split('T')[0] : new Date().toISOString().split('T')[0]);
    setFormNoExpiry(code.expires_at === null);
    setFormExpiresAt(code.expires_at ? code.expires_at.split('T')[0] : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  };

  // Toggle role selection
  const handleToggleRole = (role: string) => {
    if (role === 'all') {
      setFormEligibleRoles(['all']);
      return;
    }

    let updated = formEligibleRoles.filter(r => r !== 'all');
    if (updated.includes(role)) {
      updated = updated.filter(r => r !== role);
    } else {
      updated.push(role);
    }

    if (updated.length === 0) {
      updated = ['all'];
    }
    setFormEligibleRoles(updated);
  };

  // Submit Add Promo Code
  const handleSaveNewCode = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = formCode.trim().toUpperCase();
    if (!cleanCode) {
      alert('Please enter a valid promo code string.');
      return;
    }

    // Check code uniqueness
    if (promoCodes.some(c => c.code.toUpperCase() === cleanCode)) {
      alert(`Promo code "${cleanCode}" already exists. Code strings must be unique.`);
      return;
    }

    if (!formDescription.trim()) {
      alert('Internal description is required for administrative tracking.');
      return;
    }

    const newCodeDoc: PromoCode = {
      id: `PROMO-${Math.floor(100000 + Math.random() * 900000)}`,
      code: cleanCode,
      description: formDescription.trim(),
      discount_type: formDiscountType,
      discount_value: Number(formDiscountValue),
      applies_to: formAppliesTo,
      specific_plan: formSpecificPlan.trim() ? formSpecificPlan.trim() : null,
      eligible_roles: formEligibleRoles,
      max_uses: formMaxUsesUnlimited ? null : Number(formMaxUses),
      current_uses: 0,
      valid_from: new Date(formValidFrom).toISOString(),
      expires_at: formNoExpiry ? null : new Date(`${formExpiresAt}T23:59:59`).toISOString(),
      is_active: true,
      created_by: 'Admin (Dami Joshua)',
      created_at: new Date().toISOString()
    };

    const updated = [newCodeDoc, ...promoCodes];
    setPromoCodes(updated);
    savePromoCodes(updated);

    setShowAddModal(false);
    setCreatedCodeNotification({ code: cleanCode, desc: formDescription.trim() });
    triggerSuccess(`Promo code "${cleanCode}" successfully created and activated!`);
  };

  // Submit Edit Promo Code
  const handleSaveEditCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;

    if (!formDescription.trim()) {
      alert('Internal description is required for administrative tracking.');
      return;
    }

    const updatedCodeDoc: PromoCode = {
      ...editingCode,
      description: formDescription.trim(),
      discount_type: formDiscountType,
      discount_value: Number(formDiscountValue),
      applies_to: formAppliesTo,
      specific_plan: formSpecificPlan.trim() ? formSpecificPlan.trim() : null,
      eligible_roles: formEligibleRoles,
      max_uses: formMaxUsesUnlimited ? null : Number(formMaxUses),
      valid_from: new Date(formValidFrom).toISOString(),
      expires_at: formNoExpiry ? null : new Date(`${formExpiresAt}T23:59:59`).toISOString()
    };

    const updated = promoCodes.map(c => c.id === editingCode.id ? updatedCodeDoc : c);
    setPromoCodes(updated);
    savePromoCodes(updated);

    setEditingCode(null);
    triggerSuccess(`Promo code "${editingCode.code}" updated successfully.`);
  };

  // Immediate Deactivate action
  const handleDeactivateCode = (code: PromoCode) => {
    if (!confirm(`Are you sure you want to deactivate promo code "${code.code}"? It will no longer be redeemable by users.`)) {
      return;
    }

    const updated = promoCodes.map(c => {
      if (c.id === code.id) {
        return { ...c, is_active: false };
      }
      return c;
    });

    setPromoCodes(updated);
    savePromoCodes(updated);
    triggerSuccess(`Promo code "${code.code}" has been deactivated.`);
  };

  // Immediate Reactivate action
  const handleReactivateCode = (code: PromoCode) => {
    const updated = promoCodes.map(c => {
      if (c.id === code.id) {
        return { ...c, is_active: true };
      }
      return c;
    });

    setPromoCodes(updated);
    savePromoCodes(updated);
    triggerSuccess(`Promo code "${code.code}" has been reactivated.`);
  };

  // Copy code to clipboard helper
  const handleCopyCode = (codeStr: string) => {
    try {
      navigator.clipboard.writeText(codeStr);
      setCopiedCodeSuccess(codeStr);
      setTimeout(() => setCopiedCodeSuccess(null), 2500);
    } catch (e) {
      console.error('Clipboard write failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION HEADER */}
      <div className="bg-[#18452E] text-white rounded-[var(--radius-large)] p-6 md:p-8 shadow-sm border border-[#18452E]/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2 text-[#C9A84C]">
            <Tag className="w-5 h-5" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase">
              Fee Management & Promotion Engine
            </span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-white">
            Promo Code Management
          </h2>
          <p className="text-xs text-stone-200 max-w-2xl font-light leading-relaxed">
            Configure, validate, and track promotional codes for Unity Homes connection fees and platform subscription charges. Promo codes strictly apply to platform fees and never touch landlord rent, caution deposits, or service charges.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="relative z-10 px-6 py-3.5 bg-[#C9A84C] hover:bg-[#b5953e] text-[#18452E] font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center space-x-2 shrink-0 border border-white/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Promo Code</span>
        </button>

        {/* Decorative background circle */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#18452E]/30 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* TOP SUMMARY FIGURES (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Active Codes */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-stone-400 block tracking-wider">
              Total Active Codes
            </span>
            <span className="font-display font-black text-2xl text-[#18452E] mt-1 block">
              {activeCodesCount}
            </span>
            <span className="text-[10px] text-#6B7280 font-light mt-0.5 block">
              Out of {promoCodes.length} total codes created
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Redemptions This Month */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-stone-400 block tracking-wider">
              Redemptions This Month
            </span>
            <span className="font-display font-black text-2xl text-[#18452E] mt-1 block">
              {totalRedemptionsThisMonth}
            </span>
            <span className="text-[10px] text-#6B7280 font-light mt-0.5 block">
              {redemptions.length} total lifetime uses
            </span>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-800 rounded-2xl border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Discount Value Given This Month */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-stone-400 block tracking-wider">
              Discounts Given This Month
            </span>
            <span className="font-display font-black text-2xl text-[#18452E] mt-1 block">
              ₦{totalDiscountGivenThisMonth.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-800 font-medium mt-0.5 block">
              Total value saved by users
            </span>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100">
            <Gift className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Most Used Code This Month */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-stone-400 block tracking-wider">
              Most Used Code (This Month)
            </span>
            <span className="font-display font-black text-xl text-[#C9A84C] font-mono mt-1 block uppercase">
              {mostUsedCodeThisMonth}
            </span>
            <span className="text-[10px] text-#6B7280 font-light mt-0.5 block">
              {maxCountThisMonth > 0 ? `${maxCountThisMonth} redemptions recorded` : 'No redemptions this month'}
            </span>
          </div>
          <div className="p-3.5 bg-purple-50 text-purple-800 rounded-2xl border border-purple-100">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search promo code string, description, or target plan..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-#132A1D placeholder-stone-400 focus:outline-none focus:border-[#18452E] focus:bg-white transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-stone-400">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-[#18452E] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Scope Filter */}
          <div className="flex items-center space-x-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-stone-400">Scope:</span>
            <select
              value={scopeFilter}
              onChange={e => setScopeFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-[#18452E] focus:outline-none cursor-pointer"
            >
              <option value="all">All Scopes</option>
              <option value="professional_connection">Connection Fees</option>
              <option value="subscription">Subscription Fees</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'all' || scopeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setScopeFilter('all');
              }}
              className="px-3 py-2 text-xs font-bold text-#6B7280 hover:text-#132A1D underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}

        </div>

      </div>

      {/* PROMO CODES TABLE */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-mono font-extrabold uppercase text-#6B7280 tracking-wider">
                <th onClick={() => handleSort('code')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-50 transition">
                  <div className="flex items-center space-x-1">
                    <span>Code</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('description')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-50 transition min-w-[200px]">
                  <div className="flex items-center space-x-1">
                    <span>Description (Admin Eyes Only)</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('discount_type')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-50 transition">
                  <div className="flex items-center space-x-1">
                    <span>Discount Value</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('applies_to')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-50 transition">
                  <div className="flex items-center space-x-1">
                    <span>Applies To</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4">
                  <span>Eligible Roles</span>
                </th>
                <th onClick={() => handleSort('current_uses')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-50 transition">
                  <div className="flex items-center space-x-1">
                    <span>Uses (Used/Max)</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('valid_from')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-50 transition">
                  <div className="flex items-center space-x-1">
                    <span>Valid From</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('expires_at')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-50 transition">
                  <div className="flex items-center space-x-1">
                    <span>Expires At</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('is_active')} className="py-3.5 px-4 cursor-pointer hover:bg-stone-50 transition">
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-stone-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150 text-xs">
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400 font-light">
                    No promo codes found matching search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCodes.map(code => {
                  const isExpired = code.expires_at ? new Date().getTime() > new Date(code.expires_at).getTime() : false;
                  
                  return (
                    <tr key={code.id} className="hover:bg-stone-50/80 transition">
                      
                      {/* Code string with Copy button */}
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-[#18452E]">
                        <div className="flex items-center space-x-2">
                          <span className="bg-[#18452E]/5 px-2.5 py-1 rounded-lg border border-[#0E2F1F]/10 tracking-wider">
                            {code.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(code.code)}
                            title="Copy Promo Code"
                            className="p-1 text-stone-400 hover:text-[#18452E] transition cursor-pointer"
                          >
                            {copiedCodeSuccess === code.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-#132A1D text-xs line-clamp-2 leading-relaxed">
                          {code.description}
                        </p>
                        {code.specific_plan && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded text-[9px] font-mono font-bold">
                            Plan Restriction: {code.specific_plan}
                          </span>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-3.5 px-4 font-bold text-#132A1D">
                        {code.discount_type === 'percentage' && (
                          <span className="text-emerald-700 font-mono font-black text-sm">
                            {code.discount_value}% Off
                          </span>
                        )}
                        {code.discount_type === 'fixed_amount' && (
                          <span className="text-emerald-700 font-mono font-black text-sm">
                            ₦{code.discount_value.toLocaleString()} Off
                          </span>
                        )}
                        {code.discount_type === 'free_months' && (
                          <span className="text-purple-700 font-mono font-black text-xs">
                            {code.discount_value} Month(s) Free
                          </span>
                        )}
                      </td>

                      {/* Applies To */}
                      <td className="py-3.5 px-4">
                        {code.applies_to === 'all' && (
                          <span className="px-2 py-0.5 bg-stone-50 text-#132A1D rounded text-[10px] font-mono font-bold uppercase">
                            All Platform Fees
                          </span>
                        )}
                        {code.applies_to === 'professional_connection' && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-mono font-bold uppercase">
                            Connections Only
                          </span>
                        )}
                        {code.applies_to === 'subscription' && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-mono font-bold uppercase">
                            Subscriptions Only
                          </span>
                        )}
                      </td>

                      {/* Eligible Roles */}
                      <td className="py-3.5 px-4 text-[10px] font-mono text-#6B7280">
                        {code.eligible_roles.includes('all') ? (
                          <span className="text-#6B7280 font-bold">Any Role</span>
                        ) : (
                          <span>{code.eligible_roles.join(', ')}</span>
                        )}
                      </td>

                      {/* Uses */}
                      <td className="py-3.5 px-4 font-mono font-bold text-#132A1D">
                        <span>{code.current_uses}</span>
                        <span className="text-stone-400 font-normal"> / </span>
                        <span>{code.max_uses === null ? '∞' : code.max_uses}</span>
                      </td>

                      {/* Valid From */}
                      <td className="py-3.5 px-4 text-#6B7280 font-mono text-[11px]">
                        {code.valid_from ? code.valid_from.split('T')[0] : 'Immediate'}
                      </td>

                      {/* Expires At */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {code.expires_at ? (
                          <span className={isExpired ? 'text-red-600 font-bold' : 'text-#6B7280'}>
                            {code.expires_at.split('T')[0]} {isExpired && '(Expired)'}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">No Expiry</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {code.is_active && !isExpired ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-mono font-bold uppercase">
                            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                            <span>Active</span>
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full text-[10px] font-mono font-bold uppercase">
                            <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                            <span>Expired</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-stone-50 text-#6B7280 border border-stone-200 rounded-full text-[10px] font-mono font-bold uppercase">
                            <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span>
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* View Redemptions */}
                          <button
                            onClick={() => setViewRedemptionsCode(code)}
                            title="View Redemptions Log"
                            className="p-1.5 bg-stone-50 hover:bg-stone-200 text-#132A1D rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Redemptions</span>
                          </button>

                          {/* Edit Code */}
                          <button
                            onClick={() => handleOpenEditModal(code)}
                            title="Edit Promo Code Parameters"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 border border-blue-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Edit</span>
                          </button>

                          {/* Deactivate or Reactivate */}
                          {code.is_active ? (
                            <button
                              onClick={() => handleDeactivateCode(code)}
                              title="Deactivate Promo Code"
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 border border-red-200"
                            >
                              <Power className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Deactivate</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivateCode(code)}
                              title="Reactivate Promo Code"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 border border-emerald-200"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Reactivate</span>
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD NEW PROMO CODE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] max-w-2xl w-full p-6 md:p-8 shadow-sm space-y-6 my-8">
            
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 bg-[#18452E] text-[#C9A84C] rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#18452E]">Create New Promo Code</h3>
                  <p className="text-xs text-#6B7280 font-light">Set discount type, rules, role access, and expiry constraints.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-stone-400 hover:text-#132A1D transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCode} className="space-y-4">
              
              {/* Promo Code string (Auto Uppercase) */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                  Promo Code String *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LAUNCH20, WELCOME50"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl font-mono font-black text-base tracking-wider text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none uppercase"
                />
                <p className="text-[10px] text-#6B7280 font-light mt-1">
                  Enforced in uppercase automatically. Must be unique across all promo codes.
                </p>
              </div>

              {/* Internal Description */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                  Description (Internal Admin Note Only) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain what this code is for and who it was distributed to. Not visible to end-users."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-#132A1D focus:bg-white focus:border-[#18452E] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Discount Type & Value Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={e => setFormDiscountType(e.target.value as DiscountType)}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed_amount">Fixed Amount Reduction (₦)</option>
                    <option value="free_months">Free Months (Subscription Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formDiscountValue}
                    onChange={e => setFormDiscountValue(Number(e.target.value))}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none"
                  />
                  <p className="text-[10px] text-#6B7280 font-light mt-1">
                    {formDiscountType === 'percentage' && 'Enter percentage discount (1 - 100)'}
                    {formDiscountType === 'fixed_amount' && 'Enter naira amount to subtract'}
                    {formDiscountType === 'free_months' && 'Enter number of free subscription months'}
                  </p>
                </div>
              </div>

              {/* Applies To Scope & Specific Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                    Applies To Scope *
                  </label>
                  <select
                    value={formAppliesTo}
                    onChange={e => setFormAppliesTo(e.target.value as AppliesToScope)}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none"
                  >
                    <option value="all">All Fee Types (Connections & Subscriptions)</option>
                    <option value="professional_connection">Professional Connection Fees Only</option>
                    <option value="subscription">Subscription Fees Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                    Specific Plan Restriction (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. complete_bundle, pmc_starter (or leave blank)"
                    value={formSpecificPlan}
                    onChange={e => setFormSpecificPlan(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-#132A1D focus:bg-white focus:border-[#18452E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Eligible User Roles */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1.5">
                  Eligible User Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Roles (Default)' },
                    { id: 'Landlord', label: 'Landlord' },
                    { id: 'Tenant', label: 'Tenant' },
                    { id: 'PMC', label: 'Property Management Co. (PMC)' },
                    { id: 'Shortlet Manager', label: 'Shortlet Manager' },
                    { id: 'Public', label: 'Public / Guest Users' }
                  ].map(role => {
                    const isSelected = formEligibleRoles.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleToggleRole(role.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          isSelected 
                            ? 'bg-[#18452E] text-white border-[#0E2F1F]' 
                            : 'bg-stone-50 text-#6B7280 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Max Uses Constraint */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-#132A1D">Usage Limit (Max Uses)</span>
                  <label className="flex items-center space-x-2 text-xs font-medium text-#6B7280 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formMaxUsesUnlimited}
                      onChange={e => setFormMaxUsesUnlimited(e.target.checked)}
                      className="rounded text-[#18452E] focus:ring-0 cursor-pointer"
                    />
                    <span>Unlimited Total Uses</span>
                  </label>
                </div>
                {!formMaxUsesUnlimited && (
                  <input
                    type="number"
                    min={1}
                    value={formMaxUses}
                    onChange={e => setFormMaxUses(Number(e.target.value))}
                    placeholder="Enter maximum redemptions count"
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-[#18452E] focus:outline-none"
                  />
                )}
              </div>

              {/* Dates: Valid From & Expires At */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                    Valid From Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formValidFrom}
                    onChange={e => setFormValidFrom(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono font-bold uppercase text-#132A1D">
                      Expiration Date
                    </label>
                    <label className="flex items-center space-x-1.5 text-[11px] text-#6B7280 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formNoExpiry}
                        onChange={e => setFormNoExpiry(e.target.checked)}
                        className="rounded text-[#18452E] focus:ring-0 cursor-pointer"
                      />
                      <span>No Expiry</span>
                    </label>
                  </div>
                  {!formNoExpiry && (
                    <input
                      type="date"
                      required
                      value={formExpiresAt}
                      onChange={e => setFormExpiresAt(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#18452E] hover:bg-[#18452E] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
                >
                  Save &amp; Activate Promo Code
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: EDIT PROMO CODE */}
      {editingCode && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] max-w-2xl w-full p-6 md:p-8 shadow-sm space-y-6 my-8">
            
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#C9A84C] uppercase tracking-wider">
                  Editing Code Parameters
                </span>
                <h3 className="font-display font-black text-xl text-[#18452E]">
                  Code: {editingCode.code}
                </h3>
              </div>
              <button
                onClick={() => setEditingCode(null)}
                className="p-2 text-stone-400 hover:text-#132A1D transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCode} className="space-y-4">
              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed font-light">
                Note: The code string (<strong>{editingCode.code}</strong>) and current redemption count (<strong>{editingCode.current_uses}</strong>) are fixed to maintain historical ledger integrity.
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                  Description (Internal Admin Note) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-#132A1D focus:bg-white focus:border-[#18452E] focus:outline-none"
                />
              </div>

              {/* Discount Type & Value Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={e => setFormDiscountType(e.target.value as DiscountType)}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none"
                  >
                    <option value="percentage">Percentage Off (%)</option>
                    <option value="fixed_amount">Fixed Amount Reduction (₦)</option>
                    <option value="free_months">Free Months (Subscription Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formDiscountValue}
                    onChange={e => setFormDiscountValue(Number(e.target.value))}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Applies To Scope & Specific Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                    Applies To Scope *
                  </label>
                  <select
                    value={formAppliesTo}
                    onChange={e => setFormAppliesTo(e.target.value as AppliesToScope)}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none"
                  >
                    <option value="all">All Fee Types (Connections & Subscriptions)</option>
                    <option value="professional_connection">Professional Connection Fees Only</option>
                    <option value="subscription">Subscription Fees Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                    Specific Plan Restriction (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. complete_bundle, pmc_starter"
                    value={formSpecificPlan}
                    onChange={e => setFormSpecificPlan(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs text-#132A1D focus:bg-white focus:border-[#18452E] focus:outline-none"
                  />
                </div>
              </div>

              {/* Eligible User Roles */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1.5">
                  Eligible User Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Roles (Default)' },
                    { id: 'Landlord', label: 'Landlord' },
                    { id: 'Tenant', label: 'Tenant' },
                    { id: 'PMC', label: 'Property Management Co. (PMC)' },
                    { id: 'Shortlet Manager', label: 'Shortlet Manager' },
                    { id: 'Public', label: 'Public / Guest Users' }
                  ].map(role => {
                    const isSelected = formEligibleRoles.includes(role.id);
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleToggleRole(role.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          isSelected 
                            ? 'bg-[#18452E] text-white border-[#0E2F1F]' 
                            : 'bg-stone-50 text-#6B7280 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Max Uses Constraint */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-#132A1D">Max Uses Limit</span>
                  <label className="flex items-center space-x-2 text-xs font-medium text-#6B7280 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formMaxUsesUnlimited}
                      onChange={e => setFormMaxUsesUnlimited(e.target.checked)}
                      className="rounded text-[#18452E] focus:ring-0 cursor-pointer"
                    />
                    <span>Unlimited Total Uses</span>
                  </label>
                </div>
                {!formMaxUsesUnlimited && (
                  <input
                    type="number"
                    min={editingCode.current_uses}
                    value={formMaxUses}
                    onChange={e => setFormMaxUses(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-[#18452E] focus:outline-none"
                  />
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-#132A1D mb-1">
                    Valid From Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formValidFrom}
                    onChange={e => setFormValidFrom(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono font-bold uppercase text-#132A1D">
                      Expiration Date
                    </label>
                    <label className="flex items-center space-x-1.5 text-[11px] text-#6B7280 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formNoExpiry}
                        onChange={e => setFormNoExpiry(e.target.checked)}
                        className="rounded text-[#18452E] focus:ring-0 cursor-pointer"
                      />
                      <span>No Expiry</span>
                    </label>
                  </div>
                  {!formNoExpiry && (
                    <input
                      type="date"
                      required
                      value={formExpiresAt}
                      onChange={e => setFormExpiresAt(e.target.value)}
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-[#18452E] focus:bg-white focus:border-[#18452E] focus:outline-none"
                    />
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingCode(null)}
                  className="px-5 py-3 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#18452E] hover:bg-[#18452E] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* PANEL: VIEW REDEMPTIONS */}
      {viewRedemptionsCode && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] max-w-4xl w-full p-6 md:p-8 shadow-sm space-y-6 my-8">
            
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#C9A84C] uppercase tracking-wider">
                  Redemption History Panel
                </span>
                <h3 className="font-display font-black text-2xl text-[#18452E]">
                  Code: {viewRedemptionsCode.code}
                </h3>
                <p className="text-xs text-#6B7280 font-light mt-0.5">
                  Showing all individual promoCodeRedemptions documents recorded for this code.
                </p>
              </div>
              <button
                onClick={() => setViewRedemptionsCode(null)}
                className="p-2 text-stone-400 hover:text-#132A1D transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Redemptions Table */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-[10px] font-mono font-bold uppercase text-#6B7280">
                      <th className="py-3 px-4">User Name</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Applied To / Context</th>
                      <th className="py-3 px-4">Original Amount</th>
                      <th className="py-3 px-4">Discount Applied</th>
                      <th className="py-3 px-4">Final Amount</th>
                      <th className="py-3 px-4">Redeemed At</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150 text-xs">
                    {redemptions.filter(r => r.promo_code_id === viewRedemptionsCode.id || r.code === viewRedemptionsCode.code).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-stone-400 font-light">
                          No redemptions recorded for this code yet.
                        </td>
                      </tr>
                    ) : (
                      redemptions.filter(r => r.promo_code_id === viewRedemptionsCode.id || r.code === viewRedemptionsCode.code).map(r => (
                        <tr key={r.id} className="hover:bg-stone-50/80 transition">
                          <td className="py-3 px-4 font-bold text-#132A1D">
                            {r.userName || r.user_id}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-#6B7280">
                            {r.user_role}
                          </td>
                          <td className="py-3 px-4 text-[11px]">
                            <span className="font-bold text-[#18452E] block uppercase">
                              {r.applied_to}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              Ref: {r.related_id}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-#6B7280">
                            ₦{r.original_amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                            -₦{r.discount_amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono font-black text-[#18452E]">
                            ₦{r.final_amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-[10px] text-#6B7280">
                            {r.redeemed_at ? new Date(r.redeemed_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9px] font-mono font-bold uppercase">
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewRedemptionsCode(null)}
                className="px-6 py-2.5 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold text-xs uppercase rounded-xl transition cursor-pointer"
              >
                Close Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: SUCCESS CREATED CODE NOTIFICATION WITH COPY BUTTON */}
      {createdCodeNotification && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] max-w-md w-full p-6 text-center space-y-5 shadow-sm">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#C9A84C] uppercase tracking-widest block">
                Promo Code Successfully Generated
              </span>
              <h3 className="font-display font-black text-2xl text-[#18452E] mt-1">
                {createdCodeNotification.code}
              </h3>
              <p className="text-xs text-#6B7280 font-light mt-2 leading-relaxed">
                {createdCodeNotification.desc}
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
              <span className="font-mono font-black text-lg text-[#18452E]">
                {createdCodeNotification.code}
              </span>
              <button
                onClick={() => handleCopyCode(createdCodeNotification.code)}
                className="px-4 py-2 bg-[#18452E] text-white rounded-xl text-xs font-bold hover:bg-[#18452E] transition cursor-pointer flex items-center space-x-1.5"
              >
                {copiedCodeSuccess === createdCodeNotification.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setCreatedCodeNotification(null)}
              className="w-full py-3 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold text-xs uppercase rounded-xl transition cursor-pointer"
            >
              Done &amp; Return to List
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
