import React, { useEffect, useState } from 'react';
import { 
  Building, UserCheck, Users, DollarSign, Wrench, FileText, ChevronRight 
} from 'lucide-react';

export interface RecentlyViewedItem {
  id: string;
  type: 'landlord' | 'tenant' | 'property' | 'payment' | 'maintenance' | 'report';
  name: string;
  subtext: string;
  timestamp: number;
}

interface RecentlyViewedProps {
  onNavigate: (item: RecentlyViewedItem) => void;
  triggerRefreshKey?: number;
}

const STORAGE_KEY = 'uh_recently_viewed_pmc_v1';

export function addToRecentlyViewed(item: Omit<RecentlyViewedItem, 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    let items: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];
    
    // Remove if duplicate exists
    items = items.filter(i => !(i.id === item.id && i.type === item.type));
    
    // Prepend new item
    const newItem: RecentlyViewedItem = {
      ...item,
      timestamp: Date.now()
    };
    items.unshift(newItem);
    
    // Limit to 8
    items = items.slice(0, 8);
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('uh_recently_viewed_updated'));
  } catch (e) {
    console.error('Error writing recently viewed item:', e);
  }
}

export default function RecentlyViewed({ onNavigate, triggerRefreshKey }: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  const loadItems = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error('Error loading recently viewed items:', e);
    }
  };

  useEffect(() => {
    loadItems();
    
    const handleUpdate = () => {
      loadItems();
    };

    window.addEventListener('uh_recently_viewed_updated', handleUpdate);
    return () => {
      window.removeEventListener('uh_recently_viewed_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    loadItems();
  }, [triggerRefreshKey]);

  if (items.length === 0) return null;

  const getIcon = (type: RecentlyViewedItem['type']) => {
    switch (type) {
      case 'landlord':
        return <UserCheck className="w-4 h-4 text-teal-700" />;
      case 'tenant':
        return <Users className="w-4 h-4 text-blue-700" />;
      case 'property':
        return <Building className="w-4 h-4 text-emerald-700" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-green-700" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-amber-700" />;
      case 'report':
        return <FileText className="w-4 h-4 text-purple-700" />;
      default:
        return <FileText className="w-4 h-4 text-#132A1D" />;
    }
  };

  const getBgColor = (type: RecentlyViewedItem['type']) => {
    switch (type) {
      case 'landlord':
        return 'bg-teal-50 border-teal-100 hover:border-teal-300';
      case 'tenant':
        return 'bg-blue-50 border-blue-100 hover:border-blue-300';
      case 'property':
        return 'bg-emerald-50 border-emerald-100 hover:border-emerald-300';
      case 'payment':
        return 'bg-green-50 border-green-100 hover:border-green-300';
      case 'maintenance':
        return 'bg-amber-50 border-amber-100 hover:border-amber-300';
      case 'report':
        return 'bg-purple-50 border-purple-100 hover:border-purple-300';
      default:
        return 'bg-stone-50 border-stone-200 hover:border-stone-300';
    }
  };

  return (
    <div className="space-y-2 animate-fade-in">
      <h4 className="text-[10px] uppercase font-bold text-stone-400 font-mono tracking-wider flex items-center space-x-1.5">
        <span>Recently Viewed Records (Session)</span>
      </h4>
      <div className="flex overflow-x-auto pb-1.5 gap-3 scrollbar-none snap-x touch-pan-x">
        {items.map((item) => (
          <button
            key={`${item.type}-${item.id}`}
            onClick={() => onNavigate(item)}
            className={`flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl border text-left shrink-0 transition duration-200 cursor-pointer select-none snap-start ${getBgColor(item.type)}`}
          >
            <div className="p-1.5 rounded-xl bg-white shadow-xs shrink-0">
              {getIcon(item.type)}
            </div>
            <div className="max-w-[150px]">
              <strong className="block text-teal-950 font-bold text-xs truncate leading-tight">
                {item.name}
              </strong>
              <span className="block text-[9px] text-stone-400 capitalize mt-0.5 truncate">
                {item.subtext}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
