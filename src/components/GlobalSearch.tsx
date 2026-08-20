import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronRight, X, Building, Users, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { UserSession, LandlordUnit, BookingLog, DamageReport, ServiceChargeBill, PMCApplication, TenantRegistration, VerificationInquiry, Property, Professional } from '../types';

interface GlobalSearchProps {
  session: UserSession;
  landlordUnits: LandlordUnit[];
  bookings: BookingLog[];
  damageReports: DamageReport[];
  serviceCharges: ServiceChargeBill[];
  pmcApps: PMCApplication[];
  tenantApps: TenantRegistration[];
  inquiries: VerificationInquiry[];
  properties: Property[];
  professionals: Professional[];
  onNavigate: (type: string, id: string) => void;
}

export default function GlobalSearch({
  session,
  landlordUnits,
  bookings,
  damageReports,
  serviceCharges,
  pmcApps,
  tenantApps,
  inquiries,
  properties,
  professionals,
  onNavigate
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Helper for human-readable dates is not strictly needed for just matching, but good to have
  const isDateThisWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.abs(today.getTime() - date.getTime());
    return diff <= 7 * 24 * 60 * 60 * 1000;
  };

  const results = useMemo(() => {
    if (!query.trim()) return null;

    const lowerQuery = query.toLowerCase();
    const isNaturalLanguage = lowerQuery.includes('show me') || lowerQuery.includes('list') || lowerQuery.includes('generate') || lowerQuery.includes('open');

    let matchedTenants: LandlordUnit[] = [];
    let matchedProperties: (LandlordUnit | Property)[] = [];
    let matchedBookings: BookingLog[] = [];
    let matchedDamageReports: DamageReport[] = [];
    let matchedPayments: ServiceChargeBill[] = [];

    // "Show me tenants owing rent over sixty days"
    if (lowerQuery.includes('tenant') && (lowerQuery.includes('owing') || lowerQuery.includes('overdue'))) {
      matchedTenants = landlordUnits.filter(u => u.paymentStatus === 'Overdue' && u.tenantName);
    }
    
    // "Open Flat B12"
    if (lowerQuery.includes('open flat') || lowerQuery.includes('open unit')) {
      const match = lowerQuery.replace('open flat', '').replace('open unit', '').trim();
      matchedProperties = landlordUnits.filter(u => u.unitNumber.toLowerCase().includes(match));
    }

    // "Show Funmi Adebayo's properties"
    if (lowerQuery.includes('funmi') || lowerQuery.includes('adebayo')) {
      matchedProperties = landlordUnits.filter(u => u.propertyName.toLowerCase().includes('adebayo') || u.propertyName.toLowerCase().includes('funmi'));
    }

    // "List bookings this week"
    if (lowerQuery.includes('booking') && lowerQuery.includes('this week')) {
      matchedBookings = bookings.filter(b => isDateThisWeek(b.checkInDate));
    }

    // "Show damage reports awaiting approval"
    if (lowerQuery.includes('damage') && (lowerQuery.includes('awaiting') || lowerQuery.includes('pending'))) {
      matchedDamageReports = damageReports.filter(d => d.status.toLowerCase().includes('pending') || d.status.toLowerCase().includes('awaiting'));
    }

    // If no specific natural language pattern matched, do a generic keyword search
    if (matchedTenants.length === 0 && matchedProperties.length === 0 && matchedBookings.length === 0 && matchedDamageReports.length === 0 && matchedPayments.length === 0) {
      matchedTenants = landlordUnits.filter(u => u.tenantName?.toLowerCase().includes(lowerQuery));
      matchedProperties = landlordUnits.filter(u => u.propertyName.toLowerCase().includes(lowerQuery) || u.unitNumber.toLowerCase().includes(lowerQuery));
      matchedBookings = bookings.filter(b => b.guestName.toLowerCase().includes(lowerQuery) || b.propertyName.toLowerCase().includes(lowerQuery));
      matchedDamageReports = damageReports.filter(d => d.propertyName.toLowerCase().includes(lowerQuery) || d.description.toLowerCase().includes(lowerQuery));
      matchedPayments = serviceCharges.filter(s => s.categoryId.toLowerCase().includes(lowerQuery) || s.tenantName.toLowerCase().includes(lowerQuery));
    }

    return {
      tenants: matchedTenants,
      properties: matchedProperties,
      bookings: matchedBookings,
      damageReports: matchedDamageReports,
      payments: matchedPayments
    };
  }, [query, landlordUnits, bookings, damageReports, serviceCharges]);

  useEffect(() => {
    if (query) setIsOpen(true);
    else setIsOpen(false);
  }, [query]);

  return (
    <div className="relative z-50 mb-6 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 mt-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input 
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tenants, properties, bookings, or try 'Show damage reports awaiting approval'..."
          className="w-full bg-white border border-stone-200 rounded-full py-3 pl-12 pr-12 text-sm text-#132A1D focus:outline-none focus:ring-2 focus:ring-[#18452E] focus:border-transparent shadow-sm placeholder:text-stone-400 font-sans"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-50 rounded-full"
          >
            <X className="w-4 h-4 text-#6B7280" />
          </button>
        )}
      </div>

      {isOpen && results && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden max-h-[70vh] overflow-y-auto">
          {Object.values(results).every((arr: any) => arr.length === 0) ? (
            <div className="p-8 text-center text-#6B7280 text-sm">
              No results found for "{query}". Try a different keyword or command.
            </div>
          ) : (
            <div className="py-2">
              {results.tenants.length > 0 && (
                <div className="px-4 py-2">
                  <h4 className="text-xs font-bold text-#6B7280 uppercase tracking-wider mb-2 flex items-center"><Users className="w-3 h-3 mr-1" /> Tenants</h4>
                  {results.tenants.map(t => (
                    <button key={t.id} onClick={() => { setIsOpen(false); onNavigate('tenant', t.id); }} className="w-full text-left p-3 hover:bg-stone-50 rounded-xl flex items-center justify-between mb-1">
                      <div>
                        <div className="text-sm font-medium text-#132A1D">{t.tenantName}</div>
                        <div className="text-xs text-#6B7280">{t.propertyName} - Unit {t.unitNumber}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}
                </div>
              )}

              {results.properties.length > 0 && (
                <div className="px-4 py-2 border-t border-stone-200">
                  <h4 className="text-xs font-bold text-#6B7280 uppercase tracking-wider mb-2 flex items-center"><Building className="w-3 h-3 mr-1" /> Properties</h4>
                  {results.properties.map((p: any) => (
                    <button key={p.id} onClick={() => { setIsOpen(false); onNavigate('property', p.id); }} className="w-full text-left p-3 hover:bg-stone-50 rounded-xl flex items-center justify-between mb-1">
                      <div>
                        <div className="text-sm font-medium text-#132A1D">{p.propertyName || p.name} {p.unitNumber ? `- Unit ${p.unitNumber}` : ''}</div>
                        <div className="text-xs text-#6B7280">{p.landlordName || 'Unity Homes Platform'}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}
                </div>
              )}

              {results.bookings.length > 0 && (
                <div className="px-4 py-2 border-t border-stone-200">
                  <h4 className="text-xs font-bold text-#6B7280 uppercase tracking-wider mb-2 flex items-center"><FileText className="w-3 h-3 mr-1" /> Bookings</h4>
                  {results.bookings.map(b => (
                    <button key={b.id} onClick={() => { setIsOpen(false); onNavigate('booking', b.id); }} className="w-full text-left p-3 hover:bg-stone-50 rounded-xl flex items-center justify-between mb-1">
                      <div>
                        <div className="text-sm font-medium text-#132A1D">{b.guestName}</div>
                        <div className="text-xs text-#6B7280">{b.propertyName} ({b.checkIn} to {b.checkOut})</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}
                </div>
              )}

              {results.damageReports.length > 0 && (
                <div className="px-4 py-2 border-t border-stone-200">
                  <h4 className="text-xs font-bold text-#6B7280 uppercase tracking-wider mb-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Damage Reports</h4>
                  {results.damageReports.map(d => (
                    <button key={d.id} onClick={() => { setIsOpen(false); onNavigate('damage', d.id); }} className="w-full text-left p-3 hover:bg-stone-50 rounded-xl flex items-center justify-between mb-1">
                      <div>
                        <div className="text-sm font-medium text-#132A1D">{d.description}</div>
                        <div className="text-xs text-#6B7280">{d.propertyName} - {d.status}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
