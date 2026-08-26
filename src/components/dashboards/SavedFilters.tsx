// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Trash2, Plus } from 'lucide-react';

export interface FilterConfig {
  id: string;
  listId: 'tenants' | 'payments' | 'charges' | 'maintenance' | 'landlords';
  name: string;
  filters: Record<string, any>;
  isPreset?: boolean;
}

interface SavedFiltersProps {
  listId: 'tenants' | 'payments' | 'charges' | 'maintenance' | 'landlords';
  activeFilters: Record<string, any>;
  onApplyFilter: (filters: Record<string, any>) => void;
  triggerSuccess: (msg: string) => void;
}

const STORAGE_KEY = 'uh_saved_filters_pmc_v2';

const PRESETS: FilterConfig[] = [
  // Tenant presets
  { id: 't-preset-overdue', listId: 'tenants', name: 'Overdue Rent Only', filters: { paymentStatus: 'Overdue' }, isPreset: true },
  { id: 't-preset-expiring', listId: 'tenants', name: 'Lease Expiring Soon', filters: { paymentStatus: 'Lease Expiring Soon' }, isPreset: true },
  { id: 't-preset-vacant', listId: 'tenants', name: 'Vacant Units Only', filters: { paymentStatus: 'Vacant' }, isPreset: true },
  
  // Payment presets
  { id: 'p-preset-installment', listId: 'payments', name: 'Installment Tenancies', filters: { showInstallmentOnly: true }, isPreset: true },
  { id: 'p-preset-cleared', listId: 'payments', name: 'Cleared Collections', filters: { showInstallmentOnly: false }, isPreset: true },
  
  // Service charge presets
  { id: 'c-preset-owing', listId: 'charges', name: 'Owing Charges Only', filters: { filterStatus: 'Unpaid' }, isPreset: true },
  { id: 'c-preset-pending', listId: 'charges', name: 'Pending Verification', filters: { filterStatus: 'Pending Verification' }, isPreset: true },

  // Maintenance presets
  { id: 'm-preset-high', listId: 'maintenance', name: 'High Priority Repairs', filters: { priority: 'High' }, isPreset: true },
  { id: 'm-preset-pending', listId: 'maintenance', name: 'Pending Quotes', filters: { status: 'Pending Inspector Quote' }, isPreset: true },

  // Landlord client presets
  { id: 'l-preset-outstanding', listId: 'landlords', name: 'Outstanding Remittances', filters: { outstandingOnly: true }, isPreset: true },
  { id: 'l-preset-fully-accounted', listId: 'landlords', name: 'Fully Accounted Portfolio', filters: { fullyAccountedOnly: true }, isPreset: true }
];

export default function SavedFilters({
  listId,
  activeFilters,
  onApplyFilter,
  triggerSuccess
}: SavedFiltersProps) {
  const [savedConfigs, setSavedConfigs] = useState<FilterConfig[]>([]);
  const [newFilterName, setNewFilterName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  // Load saved filters on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const userConfigs: FilterConfig[] = stored ? JSON.parse(stored) : [];
      
      // Combine presets and user filters
      const allConfigs = [...PRESETS, ...userConfigs].filter(c => c.listId === listId);
      setSavedConfigs(allConfigs);
    } catch (e) {
      console.error('Error loading saved filters:', e);
    }
  }, [listId]);

  const handleSaveFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const userConfigs: FilterConfig[] = stored ? JSON.parse(stored) : [];

      const newConfig: FilterConfig = {
        id: 'filter-' + Date.now(),
        listId,
        name: newFilterName.trim(),
        filters: { ...activeFilters }
      };

      const updated = [...userConfigs, newConfig];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // Reload combined
      setSavedConfigs([...PRESETS, ...updated].filter(c => c.listId === listId));
      
      triggerSuccess(`Successfully saved filter configuration "${newConfig.name}"!`);
      setNewFilterName('');
      setShowSaveForm(false);
    } catch (e) {
      console.error('Error saving custom filter:', e);
    }
  };

  const handleDeleteFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const userConfigs: FilterConfig[] = stored ? JSON.parse(stored) : [];

      const updated = userConfigs.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      setSavedConfigs([...PRESETS, ...updated].filter(c => c.listId === listId));
      triggerSuccess('Custom filter configuration deleted.');
    } catch (e) {
      console.error('Error deleting filter:', e);
    }
  };

  // Check if active filter matches a configuration
  const isSelected = (configFilters: Record<string, any>) => {
    return Object.keys(configFilters).every(key => activeFilters[key] === configFilters[key]);
  };

  return (
    <div className="space-y-3">
      {/* Pills Container */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-mono font-semibold text-stone-400 uppercase tracking-wider shrink-0 mr-1 flex items-center">
          <Bookmark className="w-3.5 h-3.5 mr-1 text-teal-800" />
          <span>Filters:</span>
        </span>

        {/* Saved Filter Pills */}
        {savedConfigs.map((config) => {
          const active = isSelected(config.filters);
          return (
            <div 
              key={config.id} 
              className={`inline-flex items-center rounded-full text-[10px] font-semibold uppercase transition duration-150 border cursor-pointer select-none ${
                active 
                  ? 'bg-teal-800 text-white border-teal-800 hover:bg-teal-900' 
                  : 'bg-teal-50/50 border-teal-100 text-teal-900 hover:bg-teal-50'
              }`}
              onClick={() => {
                onApplyFilter(config.filters);
                triggerSuccess(`Applied saved filter: "${config.name}"`);
              }}
            >
              <span className="px-3 py-1.5">{config.name}</span>
              {!config.isPreset && (
                <button
                  onClick={(e) => handleDeleteFilter(config.id, e)}
                  className={`px-1.5 py-1 rounded-r-full border-l flex items-center justify-center transition hover:bg-rose-100 hover:text-rose-800 ${
                    active ? 'border-teal-750 text-teal-200' : 'border-teal-100 text-teal-700'
                  }`}
                  title="Delete filter config"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Clear/Reset Option if any filter is active */}
        <button
          onClick={() => {
            onApplyFilter({});
            triggerSuccess('Filters cleared. Showing complete portfolio records.');
          }}
          className="text-[10px] font-semibold uppercase text-stone-400 hover:text-#6B7280 transition underline cursor-pointer"
        >
          Reset All
        </button>

        {/* Save Current Button */}
        {!showSaveForm ? (
          <button
            onClick={() => setShowSaveForm(true)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-full border border-teal-200 bg-white text-teal-800 hover:bg-teal-50 text-[10px] font-semibold uppercase transition ml-auto cursor-pointer shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>Save Current Filters</span>
          </button>
        ) : (
          <form onSubmit={handleSaveFilter} className="flex items-center space-x-2 bg-teal-50 border border-teal-200 rounded-full px-2 py-0.5 shadow-inner ml-auto animate-fade-in">
            <input
              type="text"
              required
              placeholder="Name your filter..."
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              className="bg-transparent text-[10px] text-teal-950 font-semibold uppercase placeholder-teal-600 outline-none w-32 border-none"
            />
            <button
              type="submit"
              className="bg-teal-800 text-white rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase hover:bg-teal-950 transition cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowSaveForm(false)}
              className="text-#6B7280 hover:text-#132A1D text-[10px] font-semibold uppercase px-1.5 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
