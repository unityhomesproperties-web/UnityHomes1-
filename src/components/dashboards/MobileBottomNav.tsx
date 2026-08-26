// @ts-nocheck
import React from 'react';
import { Home, PieChart, DollarSign, Bell, CreditCard, Banknote, HelpCircle } from 'lucide-react';

interface MobileBottomNavProps {
  role: 'Admin' | 'Landlord' | 'PMC' | 'Shortlet Manager' | 'Tenant';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowNotifications?: (show: boolean) => void;
  hasUnread?: boolean;
}

export default function MobileBottomNav({ role, activeTab, setActiveTab, setShowNotifications, hasUnread }: MobileBottomNavProps) {
  
  const getFinanceTabInfo = () => {
    switch (role) {
      case 'Landlord':
      case 'PMC':
        return { id: 'Payments', label: 'Rent Payments', icon: DollarSign };
      case 'Shortlet Manager':
        return { id: 'EarningsPortfolio', label: 'My Earnings', icon: Banknote };
      case 'Tenant':
        return { id: 'Payments', label: 'Rent Status', icon: CreditCard };
      case 'Admin':
      default:
        return { id: 'AICollection', label: 'Finance', icon: PieChart };
    }
  };

  const financeTab = getFinanceTabInfo();
  const isSupportActive = activeTab === 'Support' || activeTab === 'Contact Support' || activeTab === 'Support Tickets';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-2 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      <button 
        onClick={() => {
          setActiveTab('Overview');
          setShowNotifications?.(false);
        }}
        className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${activeTab === 'Overview' ? 'text-[#18452E]' : 'text-stone-400'}`}
      >
        <Home className={`w-5 h-5 mb-1 ${activeTab === 'Overview' ? 'fill-[#0E2F1F]/20' : ''}`} />
        <span className="text-[9px] font-semibold">Home</span>
      </button>

      <button 
        onClick={() => {
          setActiveTab(financeTab.id);
          setShowNotifications?.(false);
        }}
        className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${activeTab === financeTab.id ? 'text-[#18452E]' : 'text-stone-400'}`}
      >
        <financeTab.icon className={`w-5 h-5 mb-1 ${activeTab === financeTab.id ? 'fill-[#0E2F1F]/20' : ''}`} />
        <span className="text-[9px] font-semibold">{financeTab.label}</span>
      </button>

      <button 
        onClick={() => {
          setShowNotifications?.(true);
        }}
        className={`flex flex-col items-center justify-center w-16 h-12 transition-colors text-stone-400 hover:text-[#18452E] relative`}
      >
        <div className="relative">
          <Bell className="w-5 h-5 mb-1" />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </div>
        <span className="text-[9px] font-semibold">Alerts</span>
      </button>

      <button 
        onClick={() => {
          setActiveTab(role === 'Admin' ? 'Support Tickets' : 'Support');
          setShowNotifications?.(false);
        }}
        className={`flex flex-col items-center justify-center w-16 h-12 transition-colors ${isSupportActive ? 'text-[#18452E]' : 'text-stone-400'}`}
      >
        <HelpCircle className={`w-5 h-5 mb-1 ${isSupportActive ? 'fill-[#0E2F1F]/20' : ''}`} />
        <span className="text-[9px] font-semibold">More</span>
      </button>
    </div>
  );
}
