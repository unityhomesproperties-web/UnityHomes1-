import React, { useState, useEffect } from 'react';
import { 
  Megaphone, AlertTriangle, Sparkles, Info, X, Check 
} from 'lucide-react';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  urgency: 'Informational' | 'Important' | 'Urgent';
  expiryDate: string; // YYYY-MM-DD
  targetGroup: 'All Users' | 'All Landlords Only' | 'All Tenants Only' | 'All PMCs Only' | 'All Shortlet Managers Only' | 'All Users on Platform';
  announcement_type?: 'platform' | 'property' | 'direct';
  source_badge?: string;
  status: 'Active' | 'Upcoming' | 'Archived';
  viewCount: number;
  dismissCount: number;
  createdAt: string;
}

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Platform Maintenance Schedule',
    body: 'System database off-site redundancy upgrades are scheduled for Saturday at 02:00 AM WAT. Expect zero platform downtime or ledger interruptions.',
    urgency: 'Informational',
    expiryDate: '2026-12-31',
    targetGroup: 'All Users',
    announcement_type: 'platform',
    source_badge: 'Unity Homes Platform',
    status: 'Active',
    viewCount: 142,
    dismissCount: 12,
    createdAt: '2026-07-04'
  },
  {
    id: 'ann-2',
    title: 'Lagos State FIRS Tax Remittance Circular',
    body: 'New digital withholding tax audit directives on residential property payouts require complete tax ID inputs for represented landlords by July 30.',
    urgency: 'Urgent',
    expiryDate: '2026-07-30',
    targetGroup: 'All Landlords Only',
    announcement_type: 'platform',
    source_badge: 'Unity Homes Platform',
    status: 'Active',
    viewCount: 89,
    dismissCount: 4,
    createdAt: '2026-07-01'
  },
  {
    id: 'ann-3',
    title: 'Water Facility Routine Inspection & Cleaning',
    body: 'Central water treatment tank flushing will occur on Thursday 10:00 AM to 01:00 PM. Please store adequate water for morning use.',
    urgency: 'Important',
    expiryDate: '2026-08-15',
    targetGroup: 'All Tenants Only',
    announcement_type: 'property',
    source_badge: 'Property Manager - Prime Property Solutions',
    status: 'Active',
    viewCount: 56,
    dismissCount: 2,
    createdAt: '2026-06-28'
  },
  {
    id: 'ann-4',
    title: 'Elevator Maintenance Notice - Eko Atlantic',
    body: 'South tower passenger elevator undergoes bi-monthly cable and safety brake inspection tomorrow morning.',
    urgency: 'Informational',
    expiryDate: '2026-08-10',
    targetGroup: 'All Tenants Only',
    announcement_type: 'direct',
    source_badge: 'Direct Landlord - Chief Emeka Obiora',
    status: 'Active',
    viewCount: 38,
    dismissCount: 1,
    createdAt: '2026-07-02'
  }
];

interface PlatformAnnouncementsProps {
  userRole?: string; // 'Admin' | 'Landlord' | 'Tenant' | 'PMC' | 'Shortlet Manager'
  userId?: string;
}

export default function PlatformAnnouncements({ userRole = 'All', userId = 'anonymous' }: PlatformAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [tenantTab, setTenantTab] = useState<'platform' | 'property'>('platform');

  useEffect(() => {
    // Load announcements from localStorage
    const loadAnnouncements = () => {
      try {
        const stored = localStorage.getItem('uh_platform_announcements');
        let list: Announcement[] = [];
        if (stored) {
          list = JSON.parse(stored);
        } else {
          list = SEED_ANNOUNCEMENTS;
          localStorage.setItem('uh_platform_announcements', JSON.stringify(SEED_ANNOUNCEMENTS));
        }

        // Load dismissed announcements for this user
        const dismissedKey = `uh_dismissed_announcements_${userId}`;
        const storedDismissed = localStorage.getItem(dismissedKey);
        const dismissed: string[] = storedDismissed ? JSON.parse(storedDismissed) : [];
        setDismissedIds(dismissed);

        // Filter and increment viewCount for newly viewed active announcements
        const todayStr = new Date().toISOString().split('T')[0];
        let updated = false;

        const viewKey = `uh_viewed_announcements_${userId}`;
        const storedViewed = localStorage.getItem(viewKey);
        const viewedList: string[] = storedViewed ? JSON.parse(storedViewed) : [];
        const newViewedList = [...viewedList];

        const newList = list.map(ann => {
          // Auto-expire if past expiry date
          let currentStatus = ann.status;
          if (ann.expiryDate && ann.expiryDate < todayStr && currentStatus === 'Active') {
            currentStatus = 'Archived';
            updated = true;
          }

          // Check if matches role target
          const matchesRole = checkRoleMatch(ann.targetGroup, userRole);
          const isEligible = currentStatus === 'Active' && matchesRole && !dismissed.includes(ann.id);

          if (isEligible && !viewedList.includes(ann.id)) {
            newViewedList.push(ann.id);
            updated = true;
            return { ...ann, status: currentStatus, viewCount: (ann.viewCount || 0) + 1 };
          }

          if (ann.status !== currentStatus) {
            return { ...ann, status: currentStatus };
          }

          return ann;
        });

        if (updated) {
          localStorage.setItem('uh_platform_announcements', JSON.stringify(newList));
          localStorage.setItem(viewKey, JSON.stringify(newViewedList));
        }

        setAnnouncements(newList);
      } catch (e) {
        console.error('Error loading platform announcements:', e);
      }
    };

    loadAnnouncements();

    // Set up storage listener to sync announcements in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'uh_platform_announcements') {
        loadAnnouncements();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userRole, userId]);

  const checkRoleMatch = (targetGroup: Announcement['targetGroup'], role: string) => {
    if (role === 'Admin' || role === 'All') return true;
    if (targetGroup === 'All Users' || targetGroup === 'All Users on Platform') return true;
    
    const roleLower = role.toLowerCase();
    if (targetGroup === 'All Landlords Only' && (roleLower === 'landlord' || roleLower === 'shortlet landlord')) return true;
    if (targetGroup === 'All Tenants Only' && roleLower === 'tenant') return true;
    if (targetGroup === 'All PMCs Only' && roleLower === 'pmc') return true;
    if (targetGroup === 'All Shortlet Managers Only' && (roleLower === 'shortlet manager' || roleLower === 'manager')) return true;
    
    return false;
  };

  const handleDismiss = (id: string) => {
    try {
      // Add to dismissed list
      const dismissedKey = `uh_dismissed_announcements_${userId}`;
      const updatedDismissed = [...dismissedIds, id];
      setDismissedIds(updatedDismissed);
      localStorage.setItem(dismissedKey, JSON.stringify(updatedDismissed));

      // Increment dismissCount in master list
      const stored = localStorage.getItem('uh_platform_announcements');
      if (stored) {
        const list: Announcement[] = JSON.parse(stored);
        const newList = list.map(ann => {
          if (ann.id === id) {
            return { ...ann, dismissCount: (ann.dismissCount || 0) + 1 };
          }
          return ann;
        });
        localStorage.setItem('uh_platform_announcements', JSON.stringify(newList));
        setAnnouncements(newList);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getUrgencyBadge = (urgency: Announcement['urgency']) => {
    switch (urgency) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Important':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Informational':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-stone-50 text-#132A1D border-stone-200';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isTenant = userRole.toLowerCase().includes('tenant');

  const activeFiltered = announcements.filter(ann => {
    const isNotDismissed = !dismissedIds.includes(ann.id);
    const isActive = ann.status === 'Active';
    const matchesRole = checkRoleMatch(ann.targetGroup, userRole);
    const notExpired = !ann.expiryDate || ann.expiryDate >= todayStr;

    if (!isNotDismissed || !isActive || !matchesRole || !notExpired) {
      return false;
    }

    if (isTenant) {
      if (tenantTab === 'platform') {
        return !ann.announcement_type || ann.announcement_type === 'platform';
      } else {
        return ann.announcement_type === 'property' || ann.announcement_type === 'direct';
      }
    }

    return true;
  });

  if (activeFiltered.length === 0 && !isTenant) {
    return null; // Don't show if there are no announcements to show
  }

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <Megaphone className="w-4 h-4 text-[#18452E]" />
          <h3 className="font-display font-black text-[#18452E] uppercase text-xs tracking-wider">
            Announcements &amp; Broadcasts
          </h3>
        </div>

        {/* TENANT RESTRUCTURE: PLATFORM vs PROPERTY TABS */}
        {isTenant && (
          <div className="flex items-center space-x-1 bg-stone-50 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
            <button
              onClick={() => setTenantTab('platform')}
              className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold transition ${
                tenantTab === 'platform'
                  ? 'bg-[#18452E] text-white shadow-xs'
                  : 'text-#6B7280 hover:text-#132A1D'
              }`}
            >
              Platform
            </button>
            <button
              onClick={() => setTenantTab('property')}
              className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold transition ${
                tenantTab === 'property'
                  ? 'bg-[#18452E] text-white shadow-xs'
                  : 'text-#6B7280 hover:text-#132A1D'
              }`}
            >
              Property
            </button>
          </div>
        )}
      </div>

      {activeFiltered.length === 0 ? (
        <div className="p-4 border border-dashed border-stone-200 rounded-2xl text-center text-stone-400 font-mono text-[11px]">
          No active {tenantTab} announcements at this time.
        </div>
      ) : (
        <div className="space-y-3.5">
          {activeFiltered.map((ann) => {
            const sourceBadgeText = ann.source_badge || (
              ann.announcement_type === 'property' ? 'Property Manager' :
              ann.announcement_type === 'direct' ? 'Direct Landlord' : 'Unity Homes Platform'
            );

            return (
              <div key={ann.id} className="p-4 bg-stone-50 border border-stone-150 rounded-2xl space-y-2 relative group hover:bg-stone-50/50 transition">
                <button
                  onClick={() => handleDismiss(ann.id)}
                  className="absolute top-3.5 right-3.5 p-1 rounded-full text-stone-400 hover:text-#132A1D hover:bg-stone-200/50 transition cursor-pointer"
                  title="Dismiss announcement"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="pr-6 space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded-md border ${getUrgencyBadge(ann.urgency)}`}>
                      {ann.urgency}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                      Source: {sourceBadgeText}
                    </span>
                    <strong className="text-#132A1D font-bold text-xs block">{ann.title}</strong>
                  </div>
                  <p className="text-#6B7280 font-light leading-relaxed text-[11px]">
                    {ann.body}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-stone-400 font-mono pt-1">
                    <span>Published: {ann.createdAt}</span>
                    {ann.expiryDate && <span>• Expires: {ann.expiryDate}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
