// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Building, MapPin, Calendar, DollarSign, TrendingUp, Users, CheckCircle2,
  AlertTriangle, FileText, ChevronDown, List, Download, Activity, FileLock,
  Wifi, WifiOff, RefreshCw, Pin, Archive, Trash2, ArrowRight, Check, Eye, X,
  MessageSquare, ShieldAlert, Award, FileSpreadsheet, Sparkles, UserCheck, CheckCircle, Bell, Clock
} from 'lucide-react';
import { ShortletManagerAgreement, BookingLog, DamageReport, UserSession } from '../../types';
import OperationsBriefingCard from './OperationsBriefingCard';

interface LandlordShortletDashboardProps {
  session: UserSession;
  agreements: ShortletManagerAgreement[];
  bookings: BookingLog[];
  setBookings?: React.Dispatch<React.SetStateAction<BookingLog[]>>;
  triggerSuccess: (msg: string) => void;
  damageReports: DamageReport[];
  setDamageReports: React.Dispatch<React.SetStateAction<DamageReport[]>>;
}

export default function LandlordShortletDashboard({
  session,
  agreements,
  bookings,
  setBookings,
  triggerSuccess,
  damageReports,
  setDamageReports
}: LandlordShortletDashboardProps) {

  const [activeTab, setActiveTab] = useState<'Performance' | 'Directory' | 'Ranking' | 'Bookings' | 'Remittance' | 'Managers' | 'Documents' | 'Ledger' | 'DamageCenter' | 'DepositResolutions' | 'Profile'>('Performance');
  
  // Deposit Resolutions State (Caution Deposit Mediation System)
  const [depositResolutions, setDepositResolutions] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_caution_deposit_resolutions_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error(e); }
    return [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('uh_caution_deposit_resolutions_v1');
        if (stored) setDepositResolutions(JSON.parse(stored));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [selectedResForDisputeModal, setSelectedResForDisputeModal] = useState<any | null>(null);
  const [landlordDisputeReason, setLandlordDisputeReason] = useState('');

  const handleAcknowledgeAndAcceptDeposit = (resId: string) => {
    const updated = depositResolutions.map(r => {
      if (r.id === resId) {
        return {
          ...r,
          status: 'Accepted by Landlord',
          landlordAcceptedAt: new Date().toISOString()
        };
      }
      return r;
    });
    setDepositResolutions(updated);
    localStorage.setItem('uh_caution_deposit_resolutions_v1', JSON.stringify(updated));

    try {
      const targetRes = depositResolutions.find(r => r.id === resId);
      const notifsRaw = localStorage.getItem('uh_notifications_v1') || '[]';
      const notifs = JSON.parse(notifsRaw);
      const newNotif = {
        id: Date.now(),
        type: 'info',
        title: 'Caution Deposit Resolution Accepted',
        message: `Landlord ${session.name} acknowledged and accepted the deposit resolution for ${targetRes?.propertyName || 'shortlet property'}.`,
        time: 'Just Now',
        unread: true,
        date: new Date().toISOString()
      };
      localStorage.setItem('uh_notifications_v1', JSON.stringify([newNotif, ...notifs]));

      const logsRaw = localStorage.getItem('uh_activityLog_v1') || '[]';
      const logs = JSON.parse(logsRaw);
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actorName: session.name,
        actorRole: 'Landlord',
        actionType: 'CAUTION_DEPOSIT_ACCEPTED',
        recordAffected: targetRes?.propertyName || 'Shortlet Unit',
        details: `Landlord accepted caution deposit resolution (Amount retained: ₦${(targetRes?.amountRetained || 0).toLocaleString()}).`
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLog, ...logs]));

      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    triggerSuccess('Caution deposit resolution successfully acknowledged and accepted.');
  };

  const handleEscalateDepositDisputeToAdmin = () => {
    if (!selectedResForDisputeModal) return;
    if (!landlordDisputeReason.trim()) {
      alert('Please enter a clear reason for disputing this caution deposit resolution.');
      return;
    }

    const resId = selectedResForDisputeModal.id;
    const updated = depositResolutions.map(r => {
      if (r.id === resId) {
        return {
          ...r,
          status: 'Disputed - Escalated to Admin Mediation',
          landlordDisputeReason: landlordDisputeReason,
          disputedAt: new Date().toISOString()
        };
      }
      return r;
    });

    setDepositResolutions(updated);
    localStorage.setItem('uh_caution_deposit_resolutions_v1', JSON.stringify(updated));

    try {
      const notifsRaw = localStorage.getItem('uh_notifications_v1') || '[]';
      const notifs = JSON.parse(notifsRaw);
      const adminNotif = {
        id: Date.now(),
        type: 'alert',
        title: 'Caution Deposit Dispute Escalated to Admin',
        message: `Landlord ${session.name} disputed caution deposit resolution for ${selectedResForDisputeModal.propertyName} (${selectedResForDisputeModal.guestName}). Reason: ${landlordDisputeReason}`,
        time: 'Just Now',
        unread: true,
        role: 'Admin',
        date: new Date().toISOString()
      };
      const pmcNotif = {
        id: Date.now() + 1,
        type: 'alert',
        title: 'Caution Deposit Resolution Disputed',
        message: `Landlord ${session.name} disputed caution deposit resolution for ${selectedResForDisputeModal.propertyName}. Escalated to Unity Homes Admin Mediation.`,
        time: 'Just Now',
        unread: true,
        date: new Date().toISOString()
      };
      localStorage.setItem('uh_notifications_v1', JSON.stringify([adminNotif, pmcNotif, ...notifs]));

      const logsRaw = localStorage.getItem('uh_activityLog_v1') || '[]';
      const logs = JSON.parse(logsRaw);
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actorName: session.name,
        actorRole: 'Landlord',
        actionType: 'CAUTION_DEPOSIT_DISPUTED',
        recordAffected: selectedResForDisputeModal.propertyName,
        details: `Landlord escalated caution deposit dispute to Unity Homes Admin. Reason: "${landlordDisputeReason}"`
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLog, ...logs]));

      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    triggerSuccess('Dispute successfully escalated to Unity Homes Admin Mediation Board. An admin officer will review evidence and issue a binding ruling.');
    setSelectedResForDisputeModal(null);
    setLandlordDisputeReason('');
  };
  
  const [selectedDamageProperty, setSelectedDamageProperty] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // --- ADDITION FIVE: CONNECTIVITY ---
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSyncSim = () => {
    setIsSyncing(true);
    triggerSuccess('Connecting to Firestore to sync ledger records and verify account statements...');
    setTimeout(() => {
      setIsSyncing(false);
      triggerSuccess('All shortlet records synchronized with main database.');
    }, 1500);
  };

  // --- ADDITION ONE: RECENTLY VIEWED ---
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('uh_shortlet_recently_viewed') || '[]');
    } catch {
      return [];
    }
  });

  const addToRecentlyViewed = (record: { id: string; type: string; name: string; targetTab: string; extraData?: any }) => {
    const newItem = {
      ...record,
      id: record.id,
      type: record.type,
      name: record.name,
      targetTab: record.targetTab,
      extraData: record.extraData,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRecentlyViewed(prev => {
      const filtered = prev.filter(x => x.id !== record.id || x.type !== record.type);
      const updated = [newItem, ...filtered].slice(0, 6);
      localStorage.setItem('uh_shortlet_recently_viewed', JSON.stringify(updated));
      return updated;
    });
  };

  // --- ADDITION TWO: SAVED FILTERS ---
  const [savedFilters, setSavedFilters] = useState<any[]>(() => {
    try {
      const loaded = localStorage.getItem('uh_shortlet_saved_filters');
      if (loaded) return JSON.parse(loaded);
    } catch (e) { console.error(e); }
    return [
      { id: 'sf-1', tab: 'Bookings', name: "Airbnb Bookings Only", filters: { source: 'Airbnb', status: 'All', prop: 'All' } },
      { id: 'sf-2', tab: 'Bookings', name: "Pending Landlord Action", filters: { source: 'All', status: 'Pending Acknowledgement', prop: 'All' } },
      { id: 'sf-3', tab: 'Remittance', name: "Outstanding Remittances Only", filters: { status: 'Outstanding', prop: 'All' } },
      { id: 'sf-4', tab: 'DamageCenter', name: "Critical Damages Only", filters: { urgency: 'Critical', status: 'All' } }
    ];
  });

  const [filterSaveName, setFilterSaveName] = useState('');
  const [showFilterSaveInputForTab, setShowFilterSaveInputForTab] = useState<'Bookings' | 'Remittance' | 'DamageCenter' | null>(null);

  const saveCurrentFilter = (tabName: 'Bookings' | 'Remittance' | 'DamageCenter', activeFilterObj: any) => {
    if (!filterSaveName.trim()) {
      triggerSuccess('Please enter a name for your filter.');
      return;
    }
    const newFilterObj = {
      id: 'f-' + Math.random().toString(36).substr(2, 9),
      tab: tabName,
      name: filterSaveName,
      filters: activeFilterObj
    };
    const updated = [newFilterObj, ...savedFilters];
    setSavedFilters(updated);
    localStorage.setItem('uh_shortlet_saved_filters', JSON.stringify(updated));
    setFilterSaveName('');
    setShowFilterSaveInputForTab(null);
    triggerSuccess(`Saved filter "${newFilterObj.name}" successfully.`);
  };

  const deleteSavedFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('uh_shortlet_saved_filters', JSON.stringify(updated));
    triggerSuccess('Saved filter removed.');
  };

  // Active filter state variables
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('All');
  const [bookingFilterSource, setBookingFilterSource] = useState<string>('All');
  const [bookingFilterProperty, setBookingFilterProperty] = useState<string>('All');
  const [bookingSearch, setBookingSearch] = useState<string>('');

  const [remitFilterStatus, setRemitFilterStatus] = useState<string>('All');
  const [remitFilterProperty, setRemitFilterProperty] = useState<string>('All');

  const [damageFilterUrgency, setDamageFilterUrgency] = useState<string>('All');
  const [damageFilterStatus, setDamageFilterStatus] = useState<string>('All');

  // --- ADDITION THREE: EXPANDED EXPORT ---
  const [showExportModal, setShowExportModal] = useState<{
    isOpen: boolean;
    tabName: 'Bookings' | 'Remittance' | 'DamageCenter' | 'Earnings';
    dataToExport: any[];
  } | null>(null);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'Excel'>('PDF');
  const [exportIsGenerating, setExportIsGenerating] = useState(false);

  const triggerMockDownload = (tab: string, format: string) => {
    setExportIsGenerating(true);
    setTimeout(() => {
      setExportIsGenerating(false);
      triggerSuccess(`${tab} Log successfully compiled into ${format}. Download initiated.`);
      setShowExportModal(null);

      // Trigger automatic simulated file download
      const element = document.createElement("a");
      const file = new Blob([`Unified Homes Shortlet Dashboard Export\nLandlord: ${session.name}\nDate: 2026-07-14\nTab: ${tab}\nFormat: ${format}\nProperties: ${agreements.map(a => a.propertyName).join(', ')}\nGenerated securely under Don\'t Buy Wahala compliance schema.\n`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `Shortlet_Export_${tab.replace(/\s+/g, '_')}_2026-07-14.${format === 'PDF' ? 'pdf' : 'csv'}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  // --- ADDITION SEVEN: TRANSPARENCY TIMELINE ---
  const [selectedRemittanceBooking, setSelectedRemittanceBooking] = useState<BookingLog | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeInput, setShowDisputeInput] = useState(false);

  const handleDisputeSubmit = (bookingId: string) => {
    if (!disputeReason.trim()) {
      alert('Please state the reason for your dispute.');
      return;
    }
    if (!setBookings) return;
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        try {
          const rawLogs = localStorage.getItem('uh_collection_logs_v1');
          const logs = rawLogs ? JSON.parse(rawLogs) : [];
          const newLog = {
            id: 'log-' + Math.random().toString(36).substr(2, 9),
            eventType: 'SHORTLET_REMITTANCE_DISPUTED',
            details: `Landlord ${session.name} disputed remittance of ₦${b.remittanceAmount.toLocaleString()} for booking of Guest ${b.guestName} at ${b.propertyName}. Reason: ${disputeReason}`,
            sender: 'Landlord',
            channel: 'In-App',
            status: 'Delivered',
            outstandingAmt: 0,
            dateSent: new Date().toISOString().split('T')[0],
            isDemoData: false
          };
          localStorage.setItem('uh_collection_logs_v1', JSON.stringify([newLog, ...logs]));
        } catch (e) {
          console.error(e);
        }

        return {
          ...b,
          status: 'Disputed' as any,
          disputeReason: disputeReason,
          disputeDate: new Date().toISOString().split('T')[0]
        };
      }
      return b;
    }));

    // Update locally selected modal view if open
    setSelectedRemittanceBooking(prev => prev ? { ...prev, status: 'Disputed', disputeReason: disputeReason, disputeDate: new Date().toISOString().split('T')[0] } as any : null);

    triggerSuccess('Remittance successfully marked as Disputed. Operations panel notified for audits.');
    setDisputeReason('');
    setShowDisputeInput(false);
  };

  // --- ADDITION FOUR: AUDIT HISTORY / APARTMENT DETAIL ---
  const [selectedApartment, setSelectedApartment] = useState<ShortletManagerAgreement | null>(null);
  const [apartmentDetailTab, setApartmentDetailTab] = useState<'info' | 'history'>('info');

  // Load audit history items
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    try {
      const existing = localStorage.getItem('uh_activityLog_v1');
      if (existing) return JSON.parse(existing);
    } catch {}
    return [
      { id: 'a1', type: 'RATE_CHANGE', propertyName: "Adebayo Lekki Heights", unitNumber: "Suite A", oldRate: 120000, newRate: 150000, changedBy: "Manager Adeola Johnson", date: "2026-07-10", approvalRequired: true, approved: true, approvedBy: "Babatunde Osei", approvalDate: "2026-07-11" },
      { id: 'a2', type: 'MANAGER_ASSIGNMENT', propertyName: "Adebayo Lekki Heights", unitNumber: "Suite A", manager: "Adeola Johnson", assignedBy: "Admin Panel", date: "2026-01-15" },
      { id: 'a3', type: 'DOCUMENT_UPLOAD', propertyName: "Adebayo Lekki Heights", unitNumber: "Suite A", docName: "Management_Agreement_V2.pdf", uploader: "Adeola Johnson", date: "2026-01-16" },
      { id: 'a4', type: 'RATE_CHANGE', propertyName: "The Oasis Towers", unitNumber: "Unit 4B", oldRate: 90000, newRate: 110000, changedBy: "Prime Property Solutions", date: "2026-07-08", approvalRequired: false, approved: true },
      { id: 'a5', type: 'MANAGER_ASSIGNMENT', propertyName: "The Oasis Towers", unitNumber: "Unit 4B", manager: "Prime Property Solutions", assignedBy: "Admin Panel", date: "2026-02-10" }
    ];
  });

  // --- ADDITION EIGHT: PROFILE COMPLETION ---
  const [profileCompletion, setProfileCompletion] = useState<{
    photoUploaded: boolean;
    phoneVerified: boolean;
    collectionAccountVerified: boolean;
    agreementUploaded: boolean;
    bankNameMatched: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem('uh_shortlet_landlord_profile_completion');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      photoUploaded: true,
      phoneVerified: false,
      collectionAccountVerified: false,
      agreementUploaded: true,
      bankNameMatched: false
    };
  });

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');

  const completeProfileItem = (item: keyof typeof profileCompletion) => {
    if (item === 'phoneVerified' && !showOtpInput) {
      setShowOtpInput(true);
      triggerSuccess('Simulated 4-digit verification SMS OTP code sent to your registered phone number.');
      return;
    }
    const updated = { ...profileCompletion, [item]: true };
    setProfileCompletion(updated);
    localStorage.setItem('uh_shortlet_landlord_profile_completion', JSON.stringify(updated));
    triggerSuccess(`Successfully completed profile requirement!`);
    
    // Write log to ledger
    try {
      const rawLogs = localStorage.getItem('uh_collection_logs_v1') || '[]';
      const logs = JSON.parse(rawLogs);
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        eventType: 'LANDLORD_PROFILE_COMPLETED',
        details: `Landlord ${session.name} updated profile compliance verification: ${String(item)} marked complete.`,
        sender: 'Landlord',
        channel: 'System',
        status: 'Delivered',
        outstandingAmt: 0,
        dateSent: new Date().toISOString().split('T')[0]
      };
      localStorage.setItem('uh_collection_logs_v1', JSON.stringify([newLog, ...logs]));
    } catch {}
  };

  const handleVerifyPhoneWithOtp = () => {
    if (otpValue.trim().length === 4) {
      const updated = { ...profileCompletion, phoneVerified: true };
      setProfileCompletion(updated);
      localStorage.setItem('uh_shortlet_landlord_profile_completion', JSON.stringify(updated));
      triggerSuccess('Phone number verified successfully.');
      setShowOtpInput(false);
      setOtpValue('');
    } else {
      alert('Please enter a valid 4-digit OTP code.');
    }
  };

  // Calculate completeness percentage
  const completenessItems = [
    { key: 'photoUploaded' as const, label: 'Photo uploaded', progressValue: 20 },
    { key: 'phoneVerified' as const, label: 'Phone verified', progressValue: 20 },
    { key: 'collectionAccountVerified' as const, label: 'Collection account verified for shortlet remittances', progressValue: 20 },
    { key: 'agreementUploaded' as const, label: 'Management agreement uploaded for at least one property', progressValue: 20 },
    { key: 'bankNameMatched' as const, label: 'Bank account name confirmed matching real name', progressValue: 20 }
  ];
  const profilePercentage = Object.keys(profileCompletion).reduce((sum, key) => {
    const isDone = profileCompletion[key as keyof typeof profileCompletion];
    return sum + (isDone ? 20 : 0);
  }, 0);

  // --- ADDITION SIX: NOTIFICATION ENHANCEMENTS ---
  const [shortletNotifications, setShortletNotifications] = useState<any[]>(() => {
    try {
      const loaded = localStorage.getItem('uh_shortlet_notifications');
      if (loaded) return JSON.parse(loaded);
    } catch {}
    return [
      { id: 'notif-1', title: 'New Booking Logged', body: 'A booking for Guest Chief Raymond at Adebayo Lekki Heights (Suite A) was logged by Manager Adeola Johnson.', category: 'Bookings', date: 'July 12, 2026', pinned: false, archived: false },
      { id: 'notif-2', title: 'Remittance Record Sent', body: 'Manager Adeola Johnson sent ₦150,000 for BK-REF883. Statement is now awaiting your acknowledgement.', category: 'Remittances', date: 'July 11, 2026', pinned: true, archived: false },
      { id: 'notif-3', title: 'Damage Case Discovery', body: 'Manager reported living room AC compressor breakdown at Oasis Towers Unit 4B. Expected repair: ₦35,000.', category: 'Damage', date: 'July 10, 2026', pinned: false, archived: false },
      { id: 'notif-4', title: 'Agreement Document Ready', body: 'New Shortlet Management and Agency authorization file was uploaded for Adebayo Lekki Heights.', category: 'Documents', date: 'July 09, 2026', pinned: false, archived: false }
    ];
  });

  const [notifTab, setNotifTab] = useState<'All' | 'Bookings' | 'Remittances' | 'Damage' | 'Documents'>('All');
  const [showArchivedNotifs, setShowArchivedNotifs] = useState(false);

  const togglePinNotif = (id: string) => {
    const updated = shortletNotifications.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
    setShortletNotifications(updated);
    localStorage.setItem('uh_shortlet_notifications', JSON.stringify(updated));
    triggerSuccess('Notification pin state toggled.');
  };

  const toggleArchiveNotif = (id: string) => {
    const updated = shortletNotifications.map(n => n.id === id ? { ...n, archived: !n.archived } : n);
    setShortletNotifications(updated);
    localStorage.setItem('uh_shortlet_notifications', JSON.stringify(updated));
    triggerSuccess('Notification archive state toggled.');
  };

  const deleteNotif = (id: string) => {
    const updated = shortletNotifications.filter(n => n.id !== id);
    setShortletNotifications(updated);
    localStorage.setItem('uh_shortlet_notifications', JSON.stringify(updated));
    triggerSuccess('Notification permanently removed.');
  };

  // --- ADDITION NINE: PLATFORM ANNOUNCEMENTS ---
  const [platformAnnouncements] = useState([
    { id: 'ann-1', title: '⚡ Gated shortlet payouts active', body: 'All managers must now enter full transaction reference logs. Money is routed instantly and statements are automatically updated.', date: 'July 13, 2026', author: 'Unity Homes Admin' },
    { id: 'ann-2', title: '⚠️ Mandatory BVN matching required', body: 'To comply with central banking shortlet remittance rules, please ensure your bank collection name exactly matches your BVN record under your profile tab.', date: 'July 05, 2026', author: 'Legal Team' }
  ]);

  const landlordBookings = bookings.filter(b => 
    agreements.some(a => a.propertyName.toLowerCase() === b.propertyName.toLowerCase())
  );

  const handleAcknowledgeRemittance = (bookingId: string) => {
    if (!setBookings) return;
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        // Log the activity
        try {
          const rawLogs = localStorage.getItem('uh_collection_logs_v1');
          const logs = rawLogs ? JSON.parse(rawLogs) : [];
          const newLog = {
            id: 'log-' + Math.random().toString(36).substr(2, 9),
            eventType: 'SHORTLET_REMITTANCE_ACKNOWLEDGED',
            details: `Landlord Babatunde Osei acknowledged receipt of ₦${b.remittanceAmount.toLocaleString()} for booking of Guest ${b.guestName} at ${b.propertyName}.`,
            sender: 'Landlord',
            channel: 'In-App',
            status: 'Delivered',
            outstandingAmt: 0,
            dateSent: new Date().toISOString().split('T')[0],
            isDemoData: false
          };
          localStorage.setItem('uh_collection_logs_v1', JSON.stringify([newLog, ...logs]));
        } catch (e) {
          console.error(e);
        }

        return {
          ...b,
          status: 'Confirmed' as any // confirmed / cleared / acknowledged
        };
      }
      return b;
    }));
    triggerSuccess('Remittance receipt successfully acknowledged!');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: 'uh_activityLog_v1' }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'uh_collection_logs_v1' }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'uh_shortlet_bookings_v1' }));
    }
  };

  // Helper Calculations
  const totalApartments = agreements.length;
  const totalBookings = landlordBookings.length;
  const totalGrossRevenue = landlordBookings.reduce((sum, b) => sum + b.totalPaid, 0);
  const totalRemitted = landlordBookings.filter(b => b.status === 'Confirmed').reduce((sum, b) => sum + b.remittanceAmount, 0);
  
  let expectedLandlordShare = 0;
  let managerCommission = 0;
  let outstandingRemittances = 0;

  landlordBookings.forEach(b => {
    const agreement = agreements.find(a => a.propertyName === b.propertyName);
    const feePct = agreement ? agreement.managementFeePercent : 15;
    const feeAmt = b.managementFeeAmount || (b.totalPaid * (feePct / 100));
    const landlordShare = b.totalPaid - feeAmt;
    
    expectedLandlordShare += landlordShare;
    managerCommission += feeAmt;
    if (b.status === 'Pending') {
      outstandingRemittances += landlordShare;
    }
  });

  const overallOccupancyRate = 78; // Mock overall rate

  const tabs = ['Performance', 'Directory', 'Ranking', 'Bookings', 'Remittance', 'Managers', 'Documents', 'Ledger', 'DamageCenter', 'Profile'];

  // Damage Calculations
  const totalDamageCostThisMonth = damageReports.reduce((sum, r) => sum + r.estimatedCost, 0); // Simplified to total
  const openDamageCost = damageReports.filter(r => r.status !== 'Completed' && r.status !== 'Rejected').reduce((sum, r) => sum + r.estimatedCost, 0);
  const resolvedDamageCost = damageReports.filter(r => r.status === 'Completed').reduce((sum, r) => sum + r.estimatedCost, 0);
  const mostExpensiveRepair = Math.max(0, ...damageReports.map(r => r.estimatedCost));


  // Mock Managers Data
  const mockManagers = [
    { name: 'Adeola Johnson', assigned: 3, commission: 15, responseRate: '98%', bookingAccuracy: '99%', remittanceSpeed: '12 Hours', disputes: 0 },
    { name: 'Prime Property Solutions', assigned: 2, commission: 12, responseRate: '100%', bookingAccuracy: '100%', remittanceSpeed: 'Instant', disputes: 0 }
  ];

  const handleDamageAction = (reportId: string, newStatus: DamageReport['status']) => {
    setDamageReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    triggerSuccess(`Damage report status updated to ${newStatus}. Ledger entry automatically created.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* --- ADDITION FIVE: CONNECTIVITY INDICATOR & HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-50 p-4 rounded-[var(--radius-large)] border border-stone-200">
        <div>
          <span className="text-[10px] font-mono text-#6B7280 uppercase tracking-widest font-semibold">Unity Homes Shortlet</span>
          <h2 className="text-xl font-display font-semibold text-#132A1D">{session?.name || 'Babatunde Osei'}'s Landlord Panel</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-stone-200 text-xs font-medium text-#132A1D shadow-sm">
            {isOffline ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono font-semibold text-red-600">OFFLINE</span>
              </>
            ) : isSyncing ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="font-mono font-semibold text-amber-600">SYNCING</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-mono font-semibold text-emerald-600">ONLINE</span>
              </>
            )}
          </div>
          <button
            onClick={triggerSyncSim}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 rounded-full hover:bg-stone-50 transition-all text-xs font-medium text-#6B7280 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* PROMPT TWO: FIVE PRIMARY NAVIGATION AREAS FOR SHORTLET LANDLORD DASHBOARD */}
      <div className="space-y-3 w-full border-b border-stone-200/60 pb-3">
        {/* PRIMARY 5 NAV AREAS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
          {/* AREA 1: HOME */}
          <button
            onClick={() => setActiveTab('Performance')}
            className={`py-2.5 px-3 font-display text-xs font-semibold rounded-2xl border text-center transition cursor-pointer ${
              ['Performance', 'Ranking'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            1. Home / Dashboard
          </button>

          {/* AREA 2: PROPERTIES & BOOKINGS */}
          <button
            onClick={() => setActiveTab('Directory')}
            className={`py-2.5 px-3 font-display text-xs font-semibold rounded-2xl border text-center transition cursor-pointer ${
              ['Directory', 'Bookings', 'Managers'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            2. Properties &amp; Bookings
          </button>

          {/* AREA 3: MONEY */}
          <button
            onClick={() => setActiveTab('Remittance')}
            className={`py-2.5 px-3 font-display text-xs font-semibold rounded-2xl border text-center transition cursor-pointer ${
              ['Remittance', 'Ledger'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            3. Money &amp; Remittance
          </button>

          {/* AREA 4: OPERATIONS */}
          <button
            onClick={() => setActiveTab('DamageCenter')}
            className={`py-2.5 px-3 font-display text-xs font-semibold rounded-2xl border text-center transition cursor-pointer ${
              activeTab === 'DamageCenter'
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            4. Operations / Damage
          </button>

          {/* AREA 5: MORE */}
          <button
            onClick={() => setActiveTab('Documents')}
            className={`py-2.5 px-3 font-display text-xs font-semibold rounded-2xl border text-center transition cursor-pointer col-span-2 sm:col-span-1 ${
              ['Documents', 'Profile'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            5. More
          </button>
        </div>

        {/* DYNAMIC SECONDARY SUB-NAVIGATION PILLS FOR ACTIVE AREA */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {['Performance', 'Ranking'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Performance')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'Performance' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Performance Overview
              </button>
              <button 
                onClick={() => setActiveTab('Ranking')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'Ranking' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Manager Leaderboard &amp; Rankings
              </button>
            </>
          )}

          {['Directory', 'Bookings', 'Managers'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Directory')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'Directory' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Apartment Directory
              </button>
              <button 
                onClick={() => setActiveTab('Bookings')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'Bookings' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Booking Log
              </button>
              <button 
                onClick={() => setActiveTab('Managers')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'Managers' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Assigned Managers
              </button>
            </>
          )}

          {['Remittance', 'Ledger'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Remittance')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'Remittance' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Remittance Center
              </button>
              <button 
                onClick={() => setActiveTab('Ledger')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'Ledger' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Financial Ledger
              </button>
            </>
          )}

          {['DamageCenter', 'DepositResolutions'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('DamageCenter')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'DamageCenter' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Damage &amp; Expense Center
              </button>
              <button 
                onClick={() => setActiveTab('DepositResolutions')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'DepositResolutions' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Deposit Resolutions &amp; Disputes
              </button>
            </>
          )}

          {['Documents', 'Profile'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Documents')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'Documents' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Document Vault
              </button>
              <button 
                onClick={() => setActiveTab('Profile')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'Profile' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Landlord Profile
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'Performance' && (
        <div className="space-y-6">
          {/* PROMPT FIVE: OPERATIONS BRIEFING ASSISTANT */}
          <OperationsBriefingCard role="Landlord" userName={session.name} />
          {/* --- ADDITION ONE: RECENTLY VIEWED --- */}
          {recentlyViewed.length > 0 && (
            <div className="bg-white p-5 rounded-[var(--radius-large)] border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-#6B7280" />
                  <h4 className="font-display font-semibold text-#132A1D text-sm">Recently Viewed</h4>
                </div>
                <span className="text-[10px] font-mono text-stone-400 uppercase">Last 6 records opened</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {recentlyViewed.map((record, idx) => (
                  <button
                    key={`${record.id}-${record.type}-${idx}`}
                    onClick={() => {
                      setActiveTab(record.targetTab);
                      if (record.type === 'Apartment') {
                        const agr = agreements.find(a => a.propertyId === record.id || a.propertyName === record.name);
                        if (agr) {
                          setSelectedApartment(agr);
                          setApartmentDetailTab('info');
                        }
                      } else if (record.type === 'Booking' || record.type === 'Remittance') {
                        const bk = bookings.find(b => b.id === record.id || b.guestName === record.name);
                        if (bk) {
                          setSelectedRemittanceBooking(bk);
                        }
                      } else if (record.type === 'Damage') {
                        const dm = damageReports.find(d => d.id === record.id);
                        if (dm) {
                          setSelectedDamageProperty(dm.id);
                        }
                      }
                    }}
                    className="flex flex-col items-start p-3 bg-stone-50 hover:bg-stone-50/80 border border-stone-200 rounded-2xl transition-all text-left group cursor-pointer h-full justify-between"
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-[9px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded-md ${
                          record.type === 'Apartment' ? 'bg-amber-100 text-amber-800' :
                          record.type === 'Booking' ? 'bg-indigo-100 text-indigo-800' :
                          record.type === 'Remittance' ? 'bg-emerald-100 text-emerald-800' :
                          record.type === 'Damage' ? 'bg-rose-100 text-rose-800' :
                          'bg-stone-200 text-#132A1D'
                        }`}>
                          {record.type}
                        </span>
                        <span className="text-[9px] font-mono text-stone-400">{record.time}</span>
                      </div>
                      <h5 className="font-display font-semibold text-xs text-#132A1D line-clamp-1 group-hover:text-#132A1D transition-colors">
                        {record.name}
                      </h5>
                    </div>
                    <span className="text-[10px] text-#6B7280 font-mono mt-2 flex items-center gap-1">
                      <span>Go to tab</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-#132A1D rounded-[var(--radius-large)] p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <TrendingUp className="w-48 h-48" />
             </div>
             <div className="relative z-10">
               <h3 className="font-display font-semibold text-2xl uppercase tracking-tight text-stone-100">Top Performance Center</h3>
               <p className="text-stone-400 text-sm mt-1 font-normal max-w-lg">Complete visibility into every booking, manager action, and remittance across your entire shortlet portfolio.</p>
             </div>
             <div className="relative z-10 text-right">
               <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-1">Total Gross Revenue</span>
               <span className="text-4xl font-display font-semibold text-emerald-400">₦{(totalGrossRevenue / 1000000).toFixed(1)}M</span>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
              <span className="text-[10px] font-mono text-stone-400 uppercase font-semibold tracking-widest mb-2">Total Apartments</span>
              <span className="text-2xl font-display font-semibold text-#132A1D">{totalApartments}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
              <span className="text-[10px] font-mono text-stone-400 uppercase font-semibold tracking-widest mb-2">Total Bookings</span>
              <span className="text-2xl font-display font-semibold text-#132A1D">{totalBookings}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
              <span className="text-[10px] font-mono text-stone-400 uppercase font-semibold tracking-widest mb-2">Overall Occupancy</span>
              <span className="text-2xl font-display font-semibold text-[#18452E]">{overallOccupancyRate}%</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
              <span className="text-[10px] font-mono text-stone-400 uppercase font-semibold tracking-widest mb-2">Outstanding Remit</span>
              <span className={`text-2xl font-display font-semibold ${outstandingRemittances > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₦{(outstandingRemittances / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col col-span-2 md:col-span-2">
              <span className="text-[10px] font-mono text-stone-400 uppercase font-semibold tracking-widest mb-2">Expected Landlord Share</span>
              <span className="text-2xl font-display font-semibold text-[#18452E]">₦{expectedLandlordShare.toLocaleString()}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col col-span-2 md:col-span-2">
              <span className="text-[10px] font-mono text-stone-400 uppercase font-semibold tracking-widest mb-2">Manager Commission</span>
              <span className="text-2xl font-display font-semibold text-amber-700">₦{managerCommission.toLocaleString()}</span>
            </div>
          </div>

          {/* --- ADDITION NINE: PLATFORM ANNOUNCEMENTS --- */}
          <div className="bg-amber-50/40 border border-amber-200 rounded-[var(--radius-large)] p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
              <h4 className="font-display font-semibold text-#132A1D text-sm uppercase tracking-wide">Platform Announcements</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {platformAnnouncements.map((ann) => (
                <div key={ann.id} className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <h5 className="font-display font-semibold text-xs text-#132A1D">{ann.title}</h5>
                    <span className="text-[9px] font-mono text-stone-400">{ann.date}</span>
                  </div>
                  <p className="text-[11px] text-#6B7280 leading-relaxed">{ann.body}</p>
                  <div className="text-[9px] font-mono text-stone-400 text-right">— {ann.author}</div>
                </div>
              ))}
            </div>
          </div>

          {/* --- ADDITION SIX: NOTIFICATIONS WITH PIN, ARCHIVE, FILTER --- */}
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-#6B7280" />
                <h4 className="font-display font-semibold text-#132A1D text-sm">Actionable Security & Operational Logs</h4>
              </div>
              <button
                onClick={() => setShowArchivedNotifs(!showArchivedNotifs)}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase font-semibold rounded-lg border transition-all cursor-pointer ${
                  showArchivedNotifs ? 'bg-stone-50 border-stone-300 text-#132A1D' : 'bg-white border-stone-200 text-#6B7280 hover:bg-stone-50'
                }`}
              >
                {showArchivedNotifs ? 'Hide Archived' : 'Show Archived'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-2">
              {(['All', 'Bookings', 'Remittances', 'Damage', 'Documents'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setNotifTab(tab)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    notifTab === tab 
                      ? 'bg-#132A1D text-white shadow-xs' 
                      : 'bg-stone-50 text-#6B7280 hover:bg-stone-50 border border-stone-200/55'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {(() => {
                const filtered = shortletNotifications.filter(n => {
                  const matchesTab = notifTab === 'All' || n.category === notifTab;
                  const matchesArchive = showArchivedNotifs ? n.archived : !n.archived;
                  return matchesTab && matchesArchive;
                });

                const sorted = [...filtered].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

                if (sorted.length === 0) {
                  return (
                    <div className="text-center py-6 text-xs text-stone-400">
                      No matching notifications.
                    </div>
                  );
                }

                return sorted.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3.5 rounded-2xl border transition-all flex justify-between items-start gap-4 ${
                      n.pinned 
                        ? 'bg-amber-50/20 border-amber-200 shadow-2xs' 
                        : 'bg-stone-50/40 border-stone-150 hover:bg-stone-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {n.pinned && (
                          <span className="flex items-center gap-0.5 text-[8px] uppercase tracking-widest font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                            <Pin className="w-2 h-2 fill-amber-800" /> Pinned
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">{n.category}</span>
                        <span className="text-[10px] font-mono text-stone-400">• {n.date}</span>
                      </div>
                      <h5 className="font-display font-semibold text-xs text-#132A1D">{n.title}</h5>
                      <p className="text-[11px] text-#6B7280 leading-relaxed">{n.body}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePinNotif(n.id)}
                        className={`p-1.5 rounded-lg border hover:bg-white transition-all cursor-pointer ${
                          n.pinned ? 'text-amber-600 border-amber-200 bg-white shadow-3xs' : 'text-stone-400 border-stone-200'
                        }`}
                        title={n.pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => toggleArchiveNotif(n.id)}
                        className="p-1.5 rounded-lg border hover:bg-white transition-all text-stone-400 border-stone-200 cursor-pointer"
                        title={n.archived ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteNotif(n.id)}
                        className="p-1.5 rounded-lg border border-rose-100 hover:bg-rose-50 text-rose-500 transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Directory' && (() => {
        // Filter and group agreements
        const managerAgreements = agreements.filter(a => a.managerName && !a.isManagedByMe && !a.isAwaitingAssignment);
        const managedByMe = agreements.filter(a => a.isManagedByMe);
        const awaitingAssignment = agreements.filter(a => a.isAwaitingAssignment);

        // Group manager agreements by manager name
        const managersMap: { [name: string]: {
          managerName: string;
          managerPhoto: string;
          managementCompany: string;
          feePct: number;
          properties: typeof agreements;
        } } = {};

        managerAgreements.forEach(a => {
          if (!managersMap[a.managerName]) {
            managersMap[a.managerName] = {
              managerName: a.managerName,
              managerPhoto: a.managerPhoto,
              managementCompany: a.managementCompany || 'Independent Partner',
              feePct: a.managementFeePercent,
              properties: []
            };
          }
          managersMap[a.managerName].properties.push(a);
        });

        // Sort managers by number of properties (highest first)
        const sortedManagers = Object.values(managersMap).sort((x, y) => y.properties.length - x.properties.length);

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Apartment Directory</h3>
                <p className="text-xs text-#6B7280 font-normal mt-0.5">Every shortlet property grouped by operations structure.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Manager Sections */}
              {sortedManagers.map((manager) => {
                const sectionId = `manager-${manager.managerName}`;
                const isExpanded = !collapsedSections[sectionId];
                return (
                  <div key={sectionId} className="border border-stone-200 rounded-[var(--radius-large)] overflow-hidden bg-stone-50/40 p-4 sm:p-5 space-y-4 shadow-sm">
                    {/* Collapsible Header */}
                    <div 
                      onClick={() => toggleSection(sectionId)}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-stone-50 p-2 rounded-2xl transition duration-150"
                    >
                      <div className="flex items-center space-x-3.5">
                        <img 
                          src={manager.managerPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"} 
                          alt={manager.managerName} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-stone-200 shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-display font-semibold text-#132A1D text-sm leading-tight">{manager.managerName}</h4>
                            <span className="text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-2 py-0.5 rounded-full font-semibold font-mono">
                              {manager.feePct}% Agreed Fee
                            </span>
                          </div>
                          <p className="text-xs text-#6B7280 font-normal mt-0.5">{manager.managementCompany || 'Independent Partner'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 ml-auto sm:ml-0">
                        <span className="text-xs text-#6B7280 bg-stone-50 border border-stone-200/50 px-2.5 py-1 rounded-lg font-mono">
                          {manager.properties.length} {manager.properties.length === 1 ? 'Property' : 'Properties'}
                        </span>
                        <div className="p-1.5 rounded-full bg-stone-50 text-#6B7280 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Property Cards Grid */}
                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                        {manager.properties.map((agreement, idx) => {
                          const pBookings = bookings.filter(b => b.propertyName === agreement.propertyName);
                          const pRev = pBookings.reduce((sum, b) => sum + b.totalPaid, 0);
                          const pOut = pBookings.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.remittanceAmount, 0);
                          return (
                            <div 
                              key={idx} 
                              onClick={() => {
                                setSelectedApartment(agreement);
                                setApartmentDetailTab('info');
                                addToRecentlyViewed({ id: agreement.propertyId || agreement.propertyName, type: 'Apartment', name: agreement.propertyName, targetTab: 'Directory' });
                              }}
                              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:border-[#18452E] transition group cursor-pointer"
                            >
                              <div className="h-32 bg-stone-50 relative overflow-hidden">
                                <img src={agreement.managerPhoto || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"} alt="prop" className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-60" />
                                <div className="absolute inset-0 bg-black/40"></div>
                                <h4 className="absolute bottom-3 left-4 font-display font-semibold text-white text-sm uppercase">{agreement.propertyName}</h4>
                              </div>
                              <div className="p-4 space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-#6B7280 font-normal">Location</span>
                                  <strong className="text-#132A1D">Lagos, Nigeria</strong>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-#6B7280 font-normal">Manager Assigned</span>
                                  <strong className="text-[#18452E] font-semibold">{agreement.managerName}</strong>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-#6B7280 font-normal">Occupancy Rate</span>
                                  <strong className="text-#132A1D">82%</strong>
                                </div>
                                <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-200">
                                  <span className="text-#6B7280 font-normal">Monthly Revenue</span>
                                  <strong className="text-emerald-700 font-mono">₦{(pRev / 2).toLocaleString()}</strong>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-#6B7280 font-normal">Outstanding Remittance</span>
                                  <strong className={`font-mono ${pOut > 0 ? 'text-rose-600' : 'text-stone-400'}`}>₦{pOut.toLocaleString()}</strong>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Managed by Me Section */}
              {managedByMe.length > 0 && (
                <div className="border border-stone-200 rounded-[var(--radius-large)] overflow-hidden bg-stone-50/40 p-4 sm:p-5 space-y-4 shadow-sm">
                  <div 
                    onClick={() => toggleSection('managed-by-me')}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-stone-50 p-2 rounded-2xl transition duration-150"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-[#18452E] border-2 border-stone-200">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-#132A1D text-sm leading-tight">Managed by Me</h4>
                        <p className="text-xs text-#6B7280 font-normal mt-0.5">Shortlet properties you operate directly without an external manager</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-auto sm:ml-0">
                      <span className="text-xs text-#6B7280 bg-stone-50 border border-stone-200/50 px-2.5 py-1 rounded-lg font-mono">
                        {managedByMe.length} {managedByMe.length === 1 ? 'Property' : 'Properties'}
                      </span>
                      <div className="p-1.5 rounded-full bg-stone-50 text-#6B7280 transition-transform duration-200" style={{ transform: !collapsedSections['managed-by-me'] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {!collapsedSections['managed-by-me'] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      {managedByMe.map((agreement, idx) => {
                        const pBookings = bookings.filter(b => b.propertyName === agreement.propertyName);
                        const pRev = pBookings.reduce((sum, b) => sum + b.totalPaid, 0);
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              setSelectedApartment(agreement);
                              setApartmentDetailTab('info');
                              addToRecentlyViewed({ id: agreement.propertyId || agreement.propertyName, type: 'Apartment', name: agreement.propertyName, targetTab: 'Directory' });
                            }}
                            className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:border-[#18452E] transition group cursor-pointer"
                          >
                            <div className="h-32 bg-stone-50 relative overflow-hidden">
                              <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80" alt="prop" className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-60" />
                              <div className="absolute inset-0 bg-black/40"></div>
                              <h4 className="absolute bottom-3 left-4 font-display font-semibold text-white text-sm uppercase">{agreement.propertyName}</h4>
                            </div>
                            <div className="p-4 space-y-3">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-#6B7280 font-normal">Location</span>
                                <strong className="text-#132A1D">Lagos, Nigeria</strong>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-#6B7280 font-normal">Manager Assigned</span>
                                <strong className="text-#6B7280 italic font-normal">None (Direct)</strong>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-#6B7280 font-normal">Occupancy Rate</span>
                                <strong className="text-#132A1D">85%</strong>
                              </div>
                              <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-200">
                                <span className="text-#6B7280 font-normal">Monthly Revenue</span>
                                <strong className="text-emerald-700 font-mono">₦{(pRev / 2).toLocaleString()}</strong>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-#6B7280 font-normal">Outstanding Remittance</span>
                                <strong className="text-stone-400 font-mono">₦0</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Awaiting Manager Assignment Section */}
              {awaitingAssignment.length > 0 && (
                <div className="border border-stone-200 rounded-[var(--radius-large)] overflow-hidden bg-stone-50/40 p-4 sm:p-5 space-y-4 shadow-sm">
                  <div 
                    onClick={() => toggleSection('awaiting-assignment')}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-stone-50 p-2 rounded-2xl transition duration-150"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 border-2 border-amber-200/50">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-#132A1D text-sm leading-tight">Awaiting Manager Assignment</h4>
                        <p className="text-xs text-#6B7280 font-normal mt-0.5">Properties ready for shortlet but pending contract activation</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-auto sm:ml-0">
                      <span className="text-xs text-#6B7280 bg-stone-50 border border-stone-200/50 px-2.5 py-1 rounded-lg font-mono">
                        {awaitingAssignment.length} {awaitingAssignment.length === 1 ? 'Property' : 'Properties'}
                      </span>
                      <div className="p-1.5 rounded-full bg-stone-50 text-#6B7280 transition-transform duration-200" style={{ transform: !collapsedSections['awaiting-assignment'] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {!collapsedSections['awaiting-assignment'] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      {awaitingAssignment.map((agreement, idx) => {
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              setSelectedApartment(agreement);
                              setApartmentDetailTab('info');
                              addToRecentlyViewed({ id: agreement.propertyId || agreement.propertyName, type: 'Apartment', name: agreement.propertyName, targetTab: 'Directory' });
                            }}
                            className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:border-amber-500 transition group cursor-pointer opacity-75 hover:opacity-100"
                          >
                            <div className="h-32 bg-stone-50 relative overflow-hidden">
                              <img src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=400&q=80" alt="prop" className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-60" />
                              <div className="absolute inset-0 bg-black/40"></div>
                              <h4 className="absolute bottom-3 left-4 font-display font-semibold text-white text-sm uppercase">{agreement.propertyName}</h4>
                              <span className="absolute top-3 right-3 text-[10px] uppercase font-semibold bg-amber-500 text-white px-2.5 py-0.5 rounded-full font-mono">Pending Partner</span>
                            </div>
                            <div className="p-4 space-y-3">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-#6B7280 font-normal">Location</span>
                                <strong className="text-#132A1D">Lagos, Nigeria</strong>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-#6B7280 font-normal">Status</span>
                                <strong className="text-amber-700 font-semibold">Unassigned</strong>
                              </div>
                              <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-200">
                                <span className="text-#6B7280 font-normal">Setup Progress</span>
                                <strong className="text-#6B7280">80% Ready</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {activeTab === 'Ranking' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Property Performance Ranking</h3>
              <p className="text-xs text-#6B7280 font-normal mt-0.5">Top performing units ranked by revenue and occupancy.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-xl flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] uppercase font-semibold font-mono">Top</span>
                <span className="text-sm font-semibold">#1</span>
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Highest Revenue</span>
                <strong className="block text-sm text-[#18452E]">Adebayo Lekki Heights</strong>
              </div>
              <strong className="text-emerald-700 font-mono">₦2.4M</strong>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#18452E]/10 text-[#18452E] rounded-xl flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] uppercase font-semibold font-mono">Top</span>
                <span className="text-sm font-semibold">#1</span>
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Highest Occupancy</span>
                <strong className="block text-sm text-[#18452E]">The Oasis Towers</strong>
              </div>
              <strong className="text-[#18452E] font-mono">94%</strong>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-xl flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] uppercase font-semibold font-mono">Top</span>
                <span className="text-sm font-semibold">#1</span>
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Highest Avg Nightly Rate</span>
                <strong className="block text-sm text-[#18452E]">Adebayo Lekki Heights</strong>
              </div>
              <strong className="text-amber-700 font-mono">₦150k</strong>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-800 rounded-xl flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] uppercase font-semibold font-mono">Alert</span>
                <span className="text-sm font-semibold">⬇</span>
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono block">Lowest Performing</span>
                <strong className="block text-sm text-[#18452E]">Mainland Suite B2</strong>
              </div>
              <strong className="text-rose-700 font-mono">30% Occ.</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Booking Transparency Center</h3>
              <p className="text-xs text-#6B7280 font-normal mt-0.5">Real-time log of every booking across your portfolio.</p>
            </div>
            <button
              onClick={() => {
                const currentFiltered = landlordBookings.filter(b => {
                  const matchesSearch = b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) || b.id.toLowerCase().includes(bookingSearch.toLowerCase());
                  const matchesProperty = bookingFilterProperty === 'All' || b.propertyName === bookingFilterProperty;
                  const matchesSource = bookingFilterSource === 'All' || (b.bookingSource || 'Direct') === bookingFilterSource;
                  const matchesStatus = bookingFilterStatus === 'All' || b.status === bookingFilterStatus;
                  return matchesSearch && matchesProperty && matchesSource && matchesStatus;
                });
                setShowExportModal({ isOpen: true, tabName: 'Bookings', dataToExport: currentFiltered });
              }}
              className="flex items-center gap-1 px-3.5 py-2 bg-[#18452E] hover:bg-[#18452E] text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Bookings</span>
            </button>
          </div>

          {/* --- ADDITION TWO: SAVED FILTERS FOR BOOKINGS --- */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-#132A1D">Saved Filters:</span>
              <button
                onClick={() => setShowFilterSaveInputForTab(showFilterSaveInputForTab === 'Bookings' ? null : 'Bookings')}
                className="text-[11px] font-semibold text-[#18452E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showFilterSaveInputForTab === 'Bookings' ? 'Cancel' : '+ Save Current Filter'}
              </button>
            </div>

            {/* Render Saved Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {savedFilters.filter(sf => sf.tab === 'Bookings').map((sf) => (
                <div key={sf.id} className="flex items-center bg-white border border-stone-200 rounded-full px-3 py-1 shadow-2xs">
                  <button
                    onClick={() => {
                      setBookingFilterSource(sf.filters.source || 'All');
                      setBookingFilterStatus(sf.filters.status || 'All');
                      setBookingFilterProperty(sf.filters.prop || 'All');
                      triggerSuccess(`Applied saved filter: ${sf.name}`);
                    }}
                    className="text-xs font-medium text-#6B7280 hover:text-#132A1D cursor-pointer mr-1.5"
                  >
                    {sf.name}
                  </button>
                  <button onClick={(e) => deleteSavedFilter(sf.id, e)} className="text-stone-400 hover:text-#6B7280 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {savedFilters.filter(sf => sf.tab === 'Bookings').length === 0 && (
                <span className="text-xs text-stone-400 italic">No custom filters saved. Use filters below and click Save.</span>
              )}
            </div>

            {/* Save filter name input */}
            {showFilterSaveInputForTab === 'Bookings' && (
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs max-w-md">
                <input
                  type="text"
                  placeholder="e.g. Airbnb Bookings Only"
                  value={filterSaveName}
                  onChange={(e) => setFilterSaveName(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                />
                <button
                  onClick={() => saveCurrentFilter('Bookings', { source: bookingFilterSource, status: bookingFilterStatus, prop: bookingFilterProperty })}
                  className="px-3 py-1 bg-[#18452E] text-white font-semibold rounded-lg text-xs cursor-pointer hover:bg-[#18452E]"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Interactive filter select controls */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Search Guest/ID</label>
              <input
                type="text"
                placeholder="Search..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-#132A1D focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Property</label>
              <select
                value={bookingFilterProperty}
                onChange={(e) => setBookingFilterProperty(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-#132A1D focus:outline-none cursor-pointer"
              >
                <option value="All">All Properties</option>
                {agreements.map((a, idx) => (
                  <option key={idx} value={a.propertyName}>{a.propertyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Source</label>
              <select
                value={bookingFilterSource}
                onChange={(e) => setBookingFilterSource(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-#132A1D focus:outline-none cursor-pointer"
              >
                <option value="All">All Sources</option>
                <option value="Airbnb">Airbnb</option>
                <option value="Booking.com">Booking.com</option>
                <option value="Direct">Direct</option>
                <option value="Instagram">Instagram</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Status</label>
              <select
                value={bookingFilterStatus}
                onChange={(e) => setBookingFilterStatus(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-#132A1D focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Active</option>
                <option value="Pending Acknowledgement">Unacknowledged</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto bg-white border border-stone-200 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-150 text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  <th className="p-4">Booking ID / Ref</th>
                  <th className="p-4">Apartment</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Nights / Rate</th>
                  <th className="p-4 text-right">Gross Rev</th>
                  <th className="p-4 text-right">Mgr Fee</th>
                  <th className="p-4 text-right">Net Landlord</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {(() => {
                  const filtered = landlordBookings.filter(b => {
                    const matchesSearch = b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) || b.id.toLowerCase().includes(bookingSearch.toLowerCase());
                    const matchesProperty = bookingFilterProperty === 'All' || b.propertyName === bookingFilterProperty;
                    const matchesSource = bookingFilterSource === 'All' || (b.bookingSource || 'Direct') === bookingFilterSource;
                    const matchesStatus = bookingFilterStatus === 'All' || b.status === bookingFilterStatus;
                    return matchesSearch && matchesProperty && matchesSource && matchesStatus;
                  });

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-stone-400">
                          No bookings matching active filter conditions.
                        </td>
                      </tr>
                    );
                  }

                  return filtered.map((b, i) => {
                    const agreement = agreements.find(a => a.propertyName === b.propertyName);
                    const feePct = agreement ? agreement.managementFeePercent : 15;
                    const feeAmt = b.managementFeeAmount || (b.totalPaid * (feePct / 100));
                    const landlordShare = b.totalPaid - feeAmt;
                    const checkIn = new Date(b.checkInDate).getTime();
                    const checkOut = new Date(b.checkOutDate).getTime();
                    const nights = Math.max(1, Math.round((checkOut - checkIn) / (24 * 60 * 60 * 1000))) || 3;
                    const rate = Math.round(b.totalPaid / nights);

                    return (
                      <tr 
                        key={b.id} 
                        onClick={() => {
                          addToRecentlyViewed({ id: b.id, type: 'Booking', name: b.guestName, targetTab: 'Bookings' });
                          setSelectedRemittanceBooking(b);
                        }}
                        className="hover:bg-stone-50/50 transition cursor-pointer"
                      >
                        <td className="p-4">
                          <strong className="block text-#132A1D">BK-{b.id.substring(0,6).toUpperCase()}</strong>
                          <span className="text-[10px] text-stone-400">Ref: {b.guestName}</span>
                        </td>
                        <td className="p-4 font-medium text-#132A1D">{b.propertyName} ({b.unitNumber})</td>
                        <td className="p-4 text-#6B7280 text-[10px]">
                          <span className="block">{b.checkInDate}</span>
                          <span className="block">{b.checkOutDate}</span>
                        </td>
                        <td className="p-4 text-#6B7280">
                          <span className="block">{nights} Nights</span>
                          <span className="block text-[10px] font-mono text-stone-400">@ ₦{rate.toLocaleString()}/nt</span>
                        </td>
                        <td className="p-4 text-right font-mono font-semibold text-#132A1D">₦{b.totalPaid.toLocaleString()}</td>
                        <td className="p-4 text-right font-mono text-amber-700 text-[10px]">₦{feeAmt.toLocaleString()}<br/>({feePct}%)</td>
                        <td className="p-4 text-right font-mono font-semibold text-[#18452E]">₦{landlordShare.toLocaleString()}</td>
                        <td className="p-4"><span className="px-2 py-0.5 bg-stone-50 rounded text-[9px] font-mono">{b.bookingSource || 'Direct'}</span></td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[9px] font-semibold uppercase ${
                            b.status === 'Pending' 
                              ? 'bg-amber-100 text-amber-800' 
                              : b.status === 'Pending Acknowledgement'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {b.status === 'Pending' ? 'Active' : b.status === 'Pending Acknowledgement' ? 'Unacknowledged' : 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Remittance' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Remittance Center</h3>
              <p className="text-xs text-#6B7280 font-normal mt-0.5">Track expected vs submitted remittances from managers.</p>
            </div>
            <button
              onClick={() => {
                const currentFiltered = landlordBookings.filter(b => {
                  const agreement = agreements.find(a => a.propertyName === b.propertyName);
                  const isPending = b.status === 'Pending';
                  const isPendingAck = b.status === 'Pending Acknowledgement';
                  const isCleared = b.status === 'Confirmed' || b.status === 'Acknowledged';
                  const isDisputed = b.status === 'Disputed';
                  
                  const computedStatus = isPending ? 'Outstanding' : isPendingAck ? 'Pending Acknowledgement' : isCleared ? 'Cleared' : isDisputed ? 'Disputed' : b.status;
                  const matchesStatus = remitFilterStatus === 'All' || computedStatus === remitFilterStatus;
                  const matchesProperty = remitFilterProperty === 'All' || b.propertyName === remitFilterProperty;
                  return matchesStatus && matchesProperty;
                });
                setShowExportModal({ isOpen: true, tabName: 'Remittance', dataToExport: currentFiltered });
              }}
              className="flex items-center gap-1 px-3.5 py-2 bg-[#18452E] hover:bg-[#18452E] text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Remittances</span>
            </button>
          </div>

          {/* --- ADDITION TWO: SAVED FILTERS FOR REMITTANCES --- */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-#132A1D">Saved Filters:</span>
              <button
                onClick={() => setShowFilterSaveInputForTab(showFilterSaveInputForTab === 'Remittance' ? null : 'Remittance')}
                className="text-[11px] font-semibold text-[#18452E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showFilterSaveInputForTab === 'Remittance' ? 'Cancel' : '+ Save Current Filter'}
              </button>
            </div>

            {/* Render Saved Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {savedFilters.filter(sf => sf.tab === 'Remittance').map((sf) => (
                <div key={sf.id} className="flex items-center bg-white border border-stone-200 rounded-full px-3 py-1 shadow-2xs">
                  <button
                    onClick={() => {
                      setRemitFilterStatus(sf.filters.status || 'All');
                      setRemitFilterProperty(sf.filters.prop || 'All');
                      triggerSuccess(`Applied saved filter: ${sf.name}`);
                    }}
                    className="text-xs font-medium text-#6B7280 hover:text-#132A1D cursor-pointer mr-1.5"
                  >
                    {sf.name}
                  </button>
                  <button onClick={(e) => deleteSavedFilter(sf.id, e)} className="text-stone-400 hover:text-#6B7280 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {savedFilters.filter(sf => sf.tab === 'Remittance').length === 0 && (
                <span className="text-xs text-stone-400 italic">No custom filters saved. Use filters below and click Save.</span>
              )}
            </div>

            {/* Save filter name input */}
            {showFilterSaveInputForTab === 'Remittance' && (
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs max-w-md">
                <input
                  type="text"
                  placeholder="e.g. Outstanding Remittances Only"
                  value={filterSaveName}
                  onChange={(e) => setFilterSaveName(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                />
                <button
                  onClick={() => saveCurrentFilter('Remittance', { status: remitFilterStatus, prop: remitFilterProperty })}
                  className="px-3 py-1 bg-[#18452E] text-white font-semibold rounded-lg text-xs cursor-pointer hover:bg-[#18452E]"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Interactive filter selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Filter by Property</label>
              <select
                value={remitFilterProperty}
                onChange={(e) => setRemitFilterProperty(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-#132A1D focus:outline-none cursor-pointer"
              >
                <option value="All">All Properties</option>
                {agreements.map((a, idx) => (
                  <option key={idx} value={a.propertyName}>{a.propertyName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Filter by Status</label>
              <select
                value={remitFilterStatus}
                onChange={(e) => setRemitFilterStatus(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-#132A1D focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Outstanding">Outstanding</option>
                <option value="Pending Acknowledgement">Pending Acknowledgement</option>
                <option value="Cleared">Cleared</option>
                <option value="Disputed">Disputed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto bg-white border border-stone-200 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-150 text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Apartment</th>
                  <th className="p-4">Manager</th>
                  <th className="p-4">Date Submitted</th>
                  <th className="p-4 text-right">Expected Remit</th>
                  <th className="p-4 text-right">Submitted Amt</th>
                  <th className="p-4 text-right">Outstanding</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {(() => {
                  const filtered = landlordBookings.filter(b => {
                    const matchesProperty = remitFilterProperty === 'All' || b.propertyName === remitFilterProperty;
                    
                    const isPending = b.status === 'Pending';
                    const isPendingAck = b.status === 'Pending Acknowledgement';
                    const isCleared = b.status === 'Confirmed' || b.status === 'Acknowledged';
                    const isDisputed = b.status === 'Disputed';
                    
                    const computedStatus = isPending ? 'Outstanding' : isPendingAck ? 'Pending Acknowledgement' : isCleared ? 'Cleared' : isDisputed ? 'Disputed' : b.status;
                    const matchesStatus = remitFilterStatus === 'All' || computedStatus === remitFilterStatus;
                    
                    return matchesProperty && matchesStatus;
                  });

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-stone-400">
                          No remittance statements match selected filters.
                        </td>
                      </tr>
                    );
                  }

                  return filtered.map((b) => {
                    const agreement = agreements.find(a => a.propertyName === b.propertyName);
                    const feePct = agreement ? agreement.managementFeePercent : 15;
                    const feeAmt = b.managementFeeAmount || (b.totalPaid * (feePct / 100));
                    const expected = b.totalPaid - feeAmt;
                    
                    const isPending = b.status === 'Pending';
                    const isPendingAck = b.status === 'Pending Acknowledgement';
                    const isCleared = b.status === 'Confirmed' || b.status === 'Acknowledged';
                    const isDisputed = b.status === 'Disputed';
                    const outstanding = isPending ? expected : 0;

                    return (
                      <tr 
                        key={`remit-${b.id}`} 
                        onClick={() => {
                          addToRecentlyViewed({ id: b.id, type: 'Remittance', name: b.guestName, targetTab: 'Remittance' });
                          setSelectedRemittanceBooking(b);
                        }}
                        className="hover:bg-stone-50/50 transition cursor-pointer"
                      >
                        <td className="p-4 font-mono font-semibold text-#132A1D">BK-{b.id.substring(0,6).toUpperCase()}</td>
                        <td className="p-4 text-#6B7280">{b.propertyName} ({b.unitNumber})</td>
                        <td className="p-4 text-#6B7280">{agreement?.managerName}</td>
                        <td className="p-4 text-#6B7280">{b.remittanceDateSent || 'Awaiting'}</td>
                        <td className="p-4 text-right font-mono font-semibold text-#132A1D">₦{expected.toLocaleString()}</td>
                        <td className="p-4 text-right font-mono text-emerald-700">{isPending ? '-' : `₦${b.remittanceAmount.toLocaleString()}`}</td>
                        <td className="p-4 text-right font-mono text-rose-600 font-semibold">{outstanding > 0 ? `₦${outstanding.toLocaleString()}` : '0'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[9px] font-semibold uppercase ${
                            isPending 
                              ? 'bg-amber-100 text-amber-800' 
                              : isPendingAck 
                              ? 'bg-rose-600 text-white animate-pulse' 
                              : isDisputed
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isPending ? 'Outstanding' : isPendingAck ? 'Pending Acknowledgement' : isDisputed ? 'Disputed' : 'Cleared'}
                          </span>
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              addToRecentlyViewed({ id: b.id, type: 'Remittance', name: b.guestName, targetTab: 'Remittance' });
                              setSelectedRemittanceBooking(b);
                            }} 
                            className="px-3 py-1 bg-#132A1D hover:bg-#132A1D text-white border border-stone-200 rounded text-[9px] font-semibold uppercase cursor-pointer"
                          >
                            Timeline & Audits
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Managers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Manager Oversight Center</h3>
              <p className="text-xs text-#6B7280 font-normal mt-0.5">KPIs and operational metrics for assigned Shortlet PMCs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {mockManagers.map((m, i) => (
              <div key={i} className="bg-white p-5 border border-stone-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-[#18452E] text-sm">{m.name}</h4>
                  <span className="text-[10px] font-mono text-#6B7280">Assigned Apartments: {m.assigned}</span>
                </div>
                <div className="flex flex-wrap gap-6 text-xs">
                  <div><span className="block text-[9px] text-stone-400 uppercase mb-1">Commission</span><strong className="font-mono">{m.commission}%</strong></div>
                  <div><span className="block text-[9px] text-stone-400 uppercase mb-1">Response Rate</span><strong className="font-mono text-emerald-600">{m.responseRate}</strong></div>
                  <div><span className="block text-[9px] text-stone-400 uppercase mb-1">Booking Accuracy</span><strong className="font-mono text-emerald-600">{m.bookingAccuracy}</strong></div>
                  <div><span className="block text-[9px] text-stone-400 uppercase mb-1">Remittance Speed</span><strong className="font-mono text-#132A1D">{m.remittanceSpeed}</strong></div>
                  <div><span className="block text-[9px] text-stone-400 uppercase mb-1">Disputes</span><strong className="font-mono text-#132A1D">{m.disputes}</strong></div>
                </div>
                <button onClick={() => triggerSuccess('Manager details opened')} className="px-4 py-2 bg-stone-50 hover:bg-stone-200 text-#132A1D text-[10px] font-semibold uppercase rounded-xl border border-stone-200 cursor-pointer">
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Shortlet Document Vault</h3>
              <p className="text-xs text-#6B7280 font-normal mt-0.5">Management Agreements, Receipts, and Reports.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-stone-200 rounded-2xl flex items-start space-x-3 cursor-pointer hover:border-[#0E2F1F] transition">
              <FileLock className="w-5 h-5 text-[#18452E] shrink-0" />
              <div>
                <span className="font-semibold block text-[#18452E] text-xs">Management Agreement</span>
                <span className="text-[10px] text-stone-400 block mb-2">Prime Property Solutions</span>
                <span className="text-[#18452E] hover:underline font-semibold text-[9px] uppercase tracking-wider">Download PDF</span>
              </div>
            </div>
            <div className="p-4 bg-white border border-stone-200 rounded-2xl flex items-start space-x-3 cursor-pointer hover:border-[#0E2F1F] transition">
              <FileText className="w-5 h-5 text-[#18452E] shrink-0" />
              <div>
                <span className="font-semibold block text-[#18452E] text-xs">Booking Report (May 2026)</span>
                <span className="text-[10px] text-stone-400 block mb-2">Adebayo Lekki Heights</span>
                <span className="text-[#18452E] hover:underline font-semibold text-[9px] uppercase tracking-wider">Download PDF</span>
              </div>
            </div>
            <div className="p-4 bg-white border border-stone-200 rounded-2xl flex items-start space-x-3 cursor-pointer hover:border-[#0E2F1F] transition">
              <Activity className="w-5 h-5 text-[#18452E] shrink-0" />
              <div>
                <span className="font-semibold block text-[#18452E] text-xs">Inspection &amp; Maintenance</span>
                <span className="text-[10px] text-stone-400 block mb-2">The Oasis Towers Q1</span>
                <span className="text-[#18452E] hover:underline font-semibold text-[9px] uppercase tracking-wider">Download PDF</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Ledger' && (
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Transparency Ledger</h3>
              <p className="text-xs text-#6B7280 font-normal mt-0.5">Permanent, immutable history of every shortlet operation.</p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6">
            <div className="space-y-3 font-mono text-[10px]">
              <div className="p-3 bg-stone-50 border-l-2 border-[#0E2F1F] rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">REMITTANCE_CONFIRMED</strong>
                  <span className="text-stone-400">2026-06-25 14:32:01 UTC</span>
                </div>
                <p className="text-#6B7280">Landlord acknowledged remittance of ₦145,000 for BK-9382AB from Adeola Johnson.</p>
              </div>

              <div className="p-3 bg-stone-50 border-l-2 border-amber-500 rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">REMITTANCE_SUBMITTED</strong>
                  <span className="text-stone-400">2026-06-24 10:15:44 UTC</span>
                </div>
                <p className="text-#6B7280">Manager Adeola Johnson submitted remittance of ₦145,000 for BK-9382AB. Status: Pending.</p>
              </div>

              <div className="p-3 bg-stone-50 border-l-2 border-[#C9A84C] rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">BOOKING_LOGGED</strong>
                  <span className="text-stone-400">2026-06-20 09:22:11 UTC</span>
                </div>
                <p className="text-#6B7280">Manager Adeola Johnson logged new direct booking (Guest: John Doe). Gross: ₦170,000.</p>
              </div>

              <div className="p-3 bg-stone-50 border-l-2 border-stone-400 rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">DOCUMENT_UPLOADED</strong>
                  <span className="text-stone-400">2026-06-15 16:45:00 UTC</span>
                </div>
                <p className="text-#6B7280">Manager Adeola Johnson uploaded Maintenance Receipt (AC Repair - ₦15,000).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'DamageCenter' && (
        <div className="space-y-6">
          
          <div className="bg-#132A1D rounded-[var(--radius-large)] p-6 text-white shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <AlertTriangle className="w-48 h-48 text-amber-500" />
             </div>
             <div className="relative z-10">
               <h3 className="font-display font-semibold text-2xl uppercase tracking-tight text-stone-100 mb-4">Damage & Repair Center</h3>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-1">Total Damage This Month</span>
                    <span className="text-xl font-display font-semibold text-amber-400">₦{totalDamageCostThisMonth.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-1">Open Cases Value</span>
                    <span className="text-xl font-display font-semibold text-amber-200">₦{openDamageCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-1">Resolved Value</span>
                    <span className="text-xl font-display font-semibold text-emerald-400">₦{resolvedDamageCost.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-1">Most Expensive Repair</span>
                    <span className="text-xl font-display font-semibold text-red-400">₦{mostExpensiveRepair.toLocaleString()}</span>
                  </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* APARTMENT DIRECTORY */}
            <div className="md:col-span-1 space-y-4">
              <h4 className="font-display font-semibold text-[#18452E] text-sm uppercase">Damage History by Apartment</h4>
              <div className="space-y-3">
                {agreements.map(apt => {
                  const aptReports = damageReports.filter(r => r.propertyId === apt.propertyId);
                  const openCount = aptReports.filter(r => r.status !== 'Completed' && r.status !== 'Rejected').length;
                  const totalCost = aptReports.reduce((sum, r) => sum + r.estimatedCost, 0);

                  return (
                    <div 
                      key={apt.propertyId}
                      onClick={() => setSelectedDamageProperty(apt.propertyId)}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${selectedDamageProperty === apt.propertyId ? 'bg-[#18452E] border-[#0E2F1F] text-white shadow-sm' : 'bg-white border-stone-200 hover:border-[#0E2F1F]'}`}
                    >
                      <h5 className={`font-semibold text-sm ${selectedDamageProperty === apt.propertyId ? 'text-white' : 'text-[#18452E]'}`}>{apt.propertyName}</h5>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <span className={`block text-[10px] font-mono uppercase ${selectedDamageProperty === apt.propertyId ? 'text-stone-300' : 'text-#6B7280'}`}>Total Cost</span>
                          <span className={`font-semibold ${selectedDamageProperty === apt.propertyId ? 'text-white' : 'text-#132A1D'}`}>₦{totalCost.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className={`block text-[10px] font-mono uppercase ${selectedDamageProperty === apt.propertyId ? 'text-stone-300' : 'text-#6B7280'}`}>Open Cases</span>
                          <span className={`font-semibold ${selectedDamageProperty === apt.propertyId ? 'text-amber-300' : 'text-amber-600'}`}>{openCount} Active</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FULL DAMAGE HISTORY PANEL */}
            <div className="md:col-span-2 space-y-4">
              {selectedDamageProperty ? (
                <>
                  <h4 className="font-display font-semibold text-[#18452E] text-sm uppercase">Incident Ledger &amp; Approvals</h4>
                  <div className="space-y-4">
                    {damageReports.filter(r => r.propertyId === selectedDamageProperty).length === 0 ? (
                      <div className="p-8 text-center bg-stone-50 rounded-[var(--radius-large)] border border-stone-200">
                        <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                        <p className="text-#6B7280 font-medium">No damage reports for this apartment.</p>
                      </div>
                    ) : (
                      damageReports.filter(r => r.propertyId === selectedDamageProperty).map(report => (
                        <div key={report.id} className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-5 shadow-sm space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded ${
                                  report.urgencyLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                                  report.urgencyLevel === 'High' ? 'bg-amber-100 text-amber-800' :
                                  'bg-stone-50 text-#6B7280'
                                }`}>{report.urgencyLevel} Urgency</span>
                                <span className="text-[10px] font-mono text-#6B7280 uppercase">{report.dateDiscovered}</span>
                              </div>
                              <h5 className="font-semibold text-[#18452E] text-base">{report.damageCategory} Damage</h5>
                              <p className="text-#6B7280 text-xs">Reported by: {report.managerName} &bull; Ref: {report.guestStay}</p>
                            </div>
                            <span className={`px-3 py-1 text-[10px] font-semibold uppercase rounded-lg border ${
                              report.status === 'Pending Approval' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                              report.status === 'Approved' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                              report.status === 'In Progress' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
                              report.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                              'bg-stone-50 border-stone-200 text-#6B7280'
                            }`}>{report.status}</span>
                          </div>

                          <div className="p-3 bg-stone-50 rounded-xl text-sm text-#132A1D leading-relaxed border border-stone-200">
                            {report.description}
                          </div>
                          
                          {(report.rootCause || report.repairVendor) && (
                            <div className="flex flex-wrap gap-4 px-3">
                              {report.rootCause && (
                                <div><span className="block text-[9px] uppercase font-mono text-stone-400">Root Cause</span><span className="text-xs font-semibold text-#132A1D">{report.rootCause}</span></div>
                              )}
                              {report.repairVendor && (
                                <div><span className="block text-[9px] uppercase font-mono text-stone-400">Vendor</span><span className="text-xs font-semibold text-#132A1D">{report.repairVendor}</span></div>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#18452E]/5 p-4 rounded-xl border border-[#0E2F1F]/10">
                            <div>
                              <span className="block text-[10px] font-mono text-#6B7280 uppercase">Estimated Cost</span>
                              <span className="font-semibold text-[#18452E] text-sm">₦{report.estimatedCost.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-mono text-#6B7280 uppercase">Evidence</span>
                              <span className="text-sm font-semibold text-[#18452E] cursor-pointer hover:underline">View Uploads ({report.photos?.length || 2})</span>
                            </div>
                            <div>
                              <span className="block text-[10px] font-mono text-#6B7280 uppercase">Contractor Quotes</span>
                              <span className="text-sm font-semibold text-#6B7280">Available (1)</span>
                            </div>
                          </div>
                          
                          {report.status === 'Pending Approval' && (
                            <div className="pt-2 flex flex-wrap gap-2 border-t border-stone-200 mt-2">
                              <button onClick={() => handleDamageAction(report.id, 'Approved')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold uppercase rounded-xl shadow-md transition-colors flex-1">
                                Approve Repair
                              </button>
                              <button onClick={() => handleDamageAction(report.id, 'Rejected')} className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-semibold uppercase rounded-xl transition-colors flex-1">
                                Reject Repair
                              </button>
                              <button onClick={() => triggerSuccess('Information requested')} className="px-4 py-2 bg-stone-50 hover:bg-stone-200 text-#132A1D text-[10px] font-semibold uppercase rounded-xl transition-colors flex-1">
                                Request More Info
                              </button>
                            </div>
                          )}
                          {report.status === 'Approved' && (
                            <div className="flex gap-2 pt-2 border-t border-stone-200 mt-2">
                              <button onClick={() => handleDamageAction(report.id, 'In Progress')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-semibold transition">Mark In-Progress</button>
                            </div>
                          )}
                          {report.status === 'In Progress' && (
                            <div className="flex gap-2 pt-2 border-t border-stone-200">
                              <button onClick={() => handleDamageAction(report.id, 'Completed')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold transition">Verify &amp; Mark Completed</button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-12 bg-stone-50 rounded-[var(--radius-large)] border border-stone-200 text-center">
                  <Building className="w-16 h-16 text-stone-300 mb-4" />
                  <h4 className="font-display font-semibold text-stone-400 text-lg">Select an Apartment</h4>
                  <p className="text-stone-400 text-sm mt-2 max-w-sm">Click on any apartment from the directory to view its full damage history, active repairs, and financial approvals.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- CAUTION DEPOSIT RESOLUTIONS TAB --- */}
      {activeTab === 'DepositResolutions' && (
        <div className="space-y-6">
          <div className="bg-[#18452E] rounded-[var(--radius-large)] p-6 text-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldAlert className="w-48 h-48 text-emerald-200" />
            </div>
            <div className="relative z-10 max-w-3xl">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-semibold block mb-1">
                Caution Deposit Accountability &amp; Mediation
              </span>
              <h3 className="font-display font-semibold text-2xl uppercase tracking-tight text-white mb-2">
                Deposit Resolutions &amp; Dispute Log
              </h3>
              <p className="text-emerald-100 text-xs leading-relaxed font-normal">
                Unity Homes never holds or routes caution deposit money. Managers handle deposit collection and checkout returns directly with guests. Landlords can review checkout condition reports, verified damage evidence, and deposit decisions below. If a manager unjustly retains deposit funds, landlords can escalate the case to Unity Homes Admin for binding mediation.
              </p>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="block text-[10px] font-mono text-stone-400 uppercase">Total Resolutions</span>
              <span className="text-xl font-display font-semibold text-#132A1D">{depositResolutions.length}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="block text-[10px] font-mono text-stone-400 uppercase font-semibold">Total Retained</span>
              <span className="text-xl font-display font-semibold text-amber-600">
                ₦{depositResolutions.reduce((sum, r) => sum + (r.amountRetained || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="block text-[10px] font-mono text-stone-400 uppercase">Disputed / Escalated</span>
              <span className="text-xl font-display font-semibold text-rose-600">
                {depositResolutions.filter(r => r.status?.includes('Disputed')).length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <span className="block text-[10px] font-mono text-stone-400 uppercase">Accepted / Ruled</span>
              <span className="text-xl font-display font-semibold text-emerald-600">
                {depositResolutions.filter(r => r.status === 'Accepted by Landlord' || r.status === 'Ruled by Admin').length}
              </span>
            </div>
          </div>

          {/* Resolutions list */}
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h4 className="font-display font-semibold text-[#18452E] text-sm uppercase">Checkout Deposit Resolutions Log</h4>
              <span className="text-xs font-mono text-stone-400">{depositResolutions.length} Cases Recorded</span>
            </div>

            {depositResolutions.length === 0 ? (
              <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-60" />
                <h5 className="font-semibold text-#132A1D text-sm">No Deposit Resolutions Logged Yet</h5>
                <p className="text-xs text-stone-400 mt-1">
                  When shortlet managers complete checkout inspections and record caution deposit returns or retentions, they will appear here for review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {depositResolutions.map((res) => {
                  const isDisputed = res.status?.includes('Disputed');
                  const isAccepted = res.status === 'Accepted by Landlord';
                  const isRuled = res.status === 'Ruled by Admin';

                  return (
                    <div key={res.id} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-stone-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#18452E]">{res.propertyName}</span>
                            <span className="text-[10px] font-mono bg-stone-200 text-#132A1D px-2 py-0.5 rounded font-semibold">
                              Booking #{res.bookingId}
                            </span>
                          </div>
                          <p className="text-xs text-#6B7280 mt-0.5">
                            Guest: <strong>{res.guestName}</strong> &bull; Manager: <strong>{res.managerName || 'Vantage Shortlets'}</strong>
                          </p>
                        </div>

                        <span className={`px-3 py-1 text-[10px] font-semibold uppercase rounded-full border ${
                          isRuled ? 'bg-purple-100 text-purple-900 border-purple-300' :
                          isDisputed ? 'bg-rose-100 text-rose-900 border-rose-300' :
                          isAccepted ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                          'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          {res.status || 'Pending Landlord Review'}
                        </span>
                      </div>

                      {/* Financial & condition summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
                        <div>
                          <span className="block text-[9px] font-mono text-stone-400 uppercase">Caution Deposit Collected</span>
                          <span className="font-semibold font-mono text-#132A1D">₦{(res.depositAmount || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-mono text-stone-400 uppercase">Checkout Condition</span>
                          <span className={`font-semibold uppercase ${
                            res.condition === 'No Damage Observed' || res.condition === 'Clean' ? 'text-emerald-600' :
                            res.condition === 'Minor Damage' ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {res.condition || 'Inspected'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-mono text-stone-400 uppercase">Amount Returned to Guest</span>
                          <span className="font-semibold font-mono text-emerald-600">₦{(res.amountReturned || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-mono text-stone-400 uppercase">Amount Retained for Damage</span>
                          <span className="font-semibold font-mono text-rose-600">₦{(res.amountRetained || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Retention justification & evidence */}
                      {res.amountRetained > 0 && (
                        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2 text-xs text-amber-900">
                          <strong className="block font-display font-semibold uppercase text-[11px] text-amber-800">
                            Manager Retention Justification &amp; Cost Breakdown
                          </strong>
                          <p className="leading-relaxed">{res.retentionJustification || 'No justification text provided.'}</p>
                          {res.repairCostEstimate > 0 && (
                            <p className="text-[11px] font-mono text-amber-800">
                              Estimated Repair Cost: <strong>₦{(res.repairCostEstimate).toLocaleString()}</strong>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Landlord Dispute Reason if logged */}
                      {res.landlordDisputeReason && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                          <strong className="block font-semibold text-[11px] uppercase text-rose-800">
                            Landlord Dispute Grounds (Escalated to Admin)
                          </strong>
                          <p className="italic">"{res.landlordDisputeReason}"</p>
                        </div>
                      )}

                      {/* Admin Ruling if issued */}
                      {res.adminRuling && (
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-2">
                          <div className="flex justify-between items-center">
                            <strong className="font-semibold uppercase text-xs text-purple-950 flex items-center gap-1">
                              <Award className="w-4 h-4 text-purple-700" /> Unity Homes Admin Binding Ruling
                            </strong>
                            <span className="text-[10px] font-mono text-purple-600">{res.adminRuling.ruledAt?.substring(0, 10)}</span>
                          </div>
                          <p className="leading-relaxed font-medium">{res.adminRuling.justification}</p>
                          <div className="flex gap-4 font-mono text-[11px] pt-1 border-t border-purple-200/60">
                            <span>Final Retained: <strong>₦{(res.adminRuling.amountRetained || 0).toLocaleString()}</strong></span>
                            <span>Final Returned to Guest: <strong>₦{(res.adminRuling.amountReturned || 0).toLocaleString()}</strong></span>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {!isAccepted && !isRuled && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
                          <button
                            onClick={() => handleAcknowledgeAndAcceptDeposit(res.id)}
                            className="px-4 py-2 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Acknowledge &amp; Accept Resolution</span>
                          </button>

                          {!isDisputed && (
                            <button
                              onClick={() => setSelectedResForDisputeModal(res)}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Dispute &amp; Request Admin Mediation</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* LANDLORD DISPUTE MODAL */}
          {selectedResForDisputeModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[var(--radius-large)] max-w-lg w-full p-6 space-y-4 shadow-sm border border-stone-200">
                <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-[9px] font-mono text-rose-600 font-semibold uppercase block">Unity Homes Dispute Escalation</span>
                    <h4 className="font-display font-semibold text-[#18452E] text-base">Dispute Caution Deposit Resolution</h4>
                  </div>
                  <button 
                    onClick={() => { setSelectedResForDisputeModal(null); setLandlordDisputeReason(''); }}
                    className="p-1 rounded-full hover:bg-stone-50 text-stone-400 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 leading-relaxed space-y-1">
                  <p className="font-semibold">Property: {selectedResForDisputeModal.propertyName} (Guest: {selectedResForDisputeModal.guestName})</p>
                  <p>Manager Retained: <strong>₦{(selectedResForDisputeModal.amountRetained || 0).toLocaleString()}</strong> of ₦{(selectedResForDisputeModal.depositAmount || 0).toLocaleString()} deposit.</p>
                  <p className="text-[11px] text-amber-800">
                    Escalating this dispute submits the case to the Unity Homes Admin Mediation Board. An administrator will review inspection evidence, damage photos, and manager notes to issue a binding ruling.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-#132A1D uppercase font-mono">
                    Grounds for Dispute <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={landlordDisputeReason}
                    onChange={(e) => setLandlordDisputeReason(e.target.value)}
                    placeholder="Provide specific reasons why you dispute this deposit resolution (e.g., manager retained deposit without providing valid proof, repair estimate is inflated, or guest was wrongfully penalized)..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-stone-200">
                  <button
                    onClick={() => { setSelectedResForDisputeModal(null); setLandlordDisputeReason(''); }}
                    className="px-4 py-2 bg-stone-50 hover:bg-stone-200 text-#132A1D font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEscalateDepositDisputeToAdmin}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-sm"
                  >
                    Escalate to Admin Mediation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Profile' && (
        <div className="space-y-6">
          <div className="bg-#132A1D rounded-[var(--radius-large)] p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <UserCheck className="w-48 h-48" />
             </div>
             <div className="relative z-10">
               <h3 className="font-display font-semibold text-2xl uppercase tracking-tight text-stone-100">Profile & Compliance Center</h3>
               <p className="text-stone-400 text-sm mt-1 font-normal max-w-lg">Manage your personal information, link your bank accounts, and complete compliance checklists to unlock seamless shortlet remittances.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: General info */}
            <div className="md:col-span-1 bg-white border border-stone-200 rounded-[var(--radius-large)] p-5 space-y-4 shadow-sm h-fit">
              <div className="flex flex-col items-center text-center pb-4 border-b border-stone-200">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-[#18452E] font-display font-semibold text-2xl border-2 border-stone-200 relative">
                  {session.name.substring(0, 2).toUpperCase()}
                  {profileCompletion.photoUploaded && (
                    <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-full text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <h4 className="font-display font-semibold text-#132A1D text-base mt-3">{session.name}</h4>
                <span className="text-xs text-stone-400 font-mono uppercase mt-0.5">{session.role}</span>
              </div>

              <div className="space-y-3.5 text-xs text-#6B7280">
                <div>
                  <span className="block text-[9px] font-mono text-stone-400 uppercase">Registered Email</span>
                  <span className="font-medium text-#132A1D">{session.email || 'landlord@unityhomes.com'}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-stone-400 uppercase">Landlord ID</span>
                  <span className="font-mono text-#132A1D font-semibold">UH-LL-840294</span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-stone-400 uppercase">BVN Status</span>
                  <span className={`font-mono font-semibold ${profileCompletion.bankNameMatched ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {profileCompletion.bankNameMatched ? '● Verified Match' : '● Verification Required'}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-stone-400 uppercase">Compliance Tier</span>
                  <span className="font-mono text-#132A1D font-semibold">Tier 2 Shortlet Landlord</span>
                </div>
              </div>
            </div>

            {/* Right: Checklist & progress */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile Completion Card (Addition Eight) */}
              <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h4 className="font-display font-semibold text-#132A1D text-sm">Remittance Suitability Checklist</h4>
                  <span className="text-sm font-display font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{profilePercentage}% Completed</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-50 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profilePercentage}%` }}
                  ></div>
                </div>

                {/* Requirements items */}
                <div className="space-y-2.5 pt-2">
                  {completenessItems.map((item) => {
                    const isDone = profileCompletion[item.key];
                    return (
                      <div 
                        key={item.key} 
                        className={`p-3.5 rounded-2xl border transition flex justify-between items-center gap-4 ${
                          isDone ? 'bg-emerald-50/10 border-emerald-100' : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-stone-400" />
                            )}
                          </div>
                          <div>
                            <span className={`text-xs font-semibold ${isDone ? 'text-#132A1D line-through' : 'text-#132A1D'}`}>
                              {item.label}
                            </span>
                            <p className="text-[10px] text-stone-400 mt-0.5">Adds {item.progressValue}% to compliance tier</p>
                          </div>
                        </div>

                        {!isDone && (
                          <div className="flex items-center gap-2">
                            {item.key === 'phoneVerified' && showOtpInput ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder="OTP"
                                  value={otpValue}
                                  onChange={(e) => setOtpValue(e.target.value)}
                                  className="w-14 bg-white border border-stone-200 rounded-lg px-2 py-0.5 text-xs text-center font-mono focus:outline-none"
                                />
                                <button
                                  onClick={handleVerifyPhoneWithOtp}
                                  className="px-2.5 py-1 bg-[#18452E] text-white font-semibold rounded-lg text-[10px] uppercase cursor-pointer"
                                >
                                  Submit
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => completeProfileItem(item.key)}
                                className="px-3 py-1 bg-white hover:bg-stone-50 border border-stone-200 text-#132A1D font-semibold rounded-xl text-[10px] uppercase cursor-pointer transition shadow-2xs"
                              >
                                Complete Now
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- APARTMENT DETAIL MODAL (ADDITION FOUR: AUDIT HISTORY) --- */}
      {selectedApartment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-large)] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-sm border border-stone-200 relative overflow-hidden">
            {/* Header */}
            <div className="bg-#132A1D p-5 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block mb-0.5">Apartment Detail Inspector</span>
                <h3 className="font-display font-semibold text-lg uppercase leading-tight">{selectedApartment.propertyName}</h3>
              </div>
              <button 
                onClick={() => setSelectedApartment(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2">
              <button
                onClick={() => setApartmentDetailTab('info')}
                className={`px-4 py-2 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  apartmentDetailTab === 'info' ? 'border-[#0E2F1F] text-[#18452E]' : 'border-transparent text-stone-400 hover:text-#6B7280'
                }`}
              >
                Property Info
              </button>
              <button
                onClick={() => setApartmentDetailTab('history')}
                className={`px-4 py-2 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                  apartmentDetailTab === 'history' ? 'border-[#0E2F1F] text-[#18452E]' : 'border-transparent text-stone-400 hover:text-#6B7280'
                }`}
              >
                Audit History
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {apartmentDetailTab === 'info' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <span className="block text-[9px] font-mono text-stone-400 uppercase">Assigned Manager</span>
                      <strong className="text-xs text-#132A1D">{selectedApartment.managerName || 'Awaiting PMC'}</strong>
                    </div>
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <span className="block text-[9px] font-mono text-stone-400 uppercase">Management Fee</span>
                      <strong className="text-xs text-#132A1D font-mono">{selectedApartment.managementFeePercent}% gross revenue</strong>
                    </div>
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <span className="block text-[9px] font-mono text-stone-400 uppercase">Occupancy Target</span>
                      <strong className="text-xs text-#132A1D">80% Monthly Average</strong>
                    </div>
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                      <span className="block text-[9px] font-mono text-stone-400 uppercase">Agreement Status</span>
                      <strong className="text-xs text-[#18452E] uppercase font-mono">Active & Verified</strong>
                    </div>
                  </div>

                  <div className="bg-amber-50/30 border border-amber-200/80 p-4 rounded-2xl space-y-2">
                    <h5 className="font-display font-semibold text-xs text-amber-800">Contractual Details</h5>
                    <p className="text-[11px] text-#6B7280 leading-relaxed">
                      This property is managed securely under the Unity Homes Shortlet Management framework. All remittances are calculated and transferred in real-time, subject to the standard management fee.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-display font-semibold text-#132A1D text-xs uppercase tracking-wide">Chronological Audit History</h4>
                  
                  <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-3 before:w-0.5 before:bg-stone-200 pl-8">
                    {auditLogs
                      .filter(log => log.propertyName === selectedApartment.propertyName)
                      .map((log) => (
                        <div key={log.id} className="relative space-y-1">
                          {/* Circle indicator */}
                          <div className="absolute -left-8 top-1.5 w-2 h-2 rounded-full bg-[#18452E] ring-4 ring-emerald-50" />
                          
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono text-stone-400 font-semibold uppercase">{log.type.replace('_', ' ')}</span>
                            <span className="text-[9px] font-mono text-stone-400">{log.date}</span>
                          </div>

                          {log.type === 'RATE_CHANGE' && (
                            <p className="text-xs text-#132A1D leading-relaxed">
                              Rate updated from <strong className="font-mono">₦{log.oldRate.toLocaleString()}</strong> to <strong className="font-mono">₦{log.newRate.toLocaleString()}</strong> per night. Changed by <strong>{log.changedBy}</strong>.
                            </p>
                          )}
                          {log.type === 'MANAGER_ASSIGNMENT' && (
                            <p className="text-xs text-#132A1D leading-relaxed">
                              Manager <strong>{log.manager}</strong> assigned to property. Action logged by <strong>{log.assignedBy}</strong>.
                            </p>
                          )}
                          {log.type === 'DOCUMENT_UPLOAD' && (
                            <p className="text-xs text-#132A1D leading-relaxed">
                              Uploaded <strong>{log.docName}</strong> contract. Action logged by <strong>{log.uploader}</strong>.
                            </p>
                          )}

                          {log.approved && (
                            <div className="text-[9px] font-mono text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Approved by {log.approvedBy || 'System Audit Office'}
                            </div>
                          )}
                        </div>
                      ))}

                    {auditLogs.filter(log => log.propertyName === selectedApartment.propertyName).length === 0 && (
                      <div className="text-center py-6 text-xs text-stone-400 italic">
                        No auditable operational events logged yet for this property.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button 
                onClick={() => setSelectedApartment(null)}
                className="px-4 py-2 bg-#132A1D hover:bg-#132A1D text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- TRANSPARENCY TIMELINE MODAL (ADDITION SEVEN) --- */}
      {selectedRemittanceBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-large)] max-w-xl w-full flex flex-col shadow-sm border border-stone-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#18452E] p-5 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block mb-0.5">Remittance Audit Timeline</span>
                <h3 className="font-display font-semibold text-base uppercase">Booking: BK-{selectedRemittanceBooking.id.substring(0, 6).toUpperCase()}</h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedRemittanceBooking(null);
                  setShowDisputeInput(false);
                  setDisputeReason('');
                }}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="p-5 bg-stone-50 border-b border-stone-200 grid grid-cols-3 gap-2.5 text-xs">
              <div>
                <span className="block text-[9px] font-mono text-stone-400 uppercase">Guest Name</span>
                <strong className="text-#132A1D block truncate">{selectedRemittanceBooking.guestName}</strong>
              </div>
              <div>
                <span className="block text-[9px] font-mono text-stone-400 uppercase">Property</span>
                <strong className="text-#132A1D block truncate">{selectedRemittanceBooking.propertyName}</strong>
              </div>
              <div>
                <span className="block text-[9px] font-mono text-stone-400 uppercase">Gross Rent</span>
                <strong className="text-#132A1D block font-mono">₦{selectedRemittanceBooking.totalPaid.toLocaleString()}</strong>
              </div>
            </div>

            {/* Timeline Steps Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="space-y-5 relative before:absolute before:top-2 before:bottom-2 before:left-3 before:w-0.5 before:bg-stone-200 pl-8 text-xs">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-8 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                  <div className="flex justify-between font-semibold text-#132A1D">
                    <span>1. Remittance Calculated</span>
                    <span className="font-mono text-[9px] text-stone-400">Checked</span>
                  </div>
                  <p className="text-#6B7280 mt-0.5 text-[11px]">System computed management fee &amp; landlord share automatically.</p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-8 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                  <div className="flex justify-between font-semibold text-#132A1D">
                    <span>2. Transfer Reference Logged</span>
                    <span className="font-mono text-[9px] text-stone-400">Complete</span>
                  </div>
                  <p className="text-#6B7280 mt-0.5 text-[11px]">Manager linked bank transaction ID: <strong className="font-mono">UH-TXN-4919401</strong></p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-8 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                  <div className="flex justify-between font-semibold text-#132A1D">
                    <span>3. Compliance Sign-off</span>
                    <span className="font-mono text-[9px] text-stone-400">Complete</span>
                  </div>
                  <p className="text-#6B7280 mt-0.5 text-[11px]">Audit verification checklist marked complete by PMC supervisor.</p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-8 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                  <div className="flex justify-between font-semibold text-#132A1D">
                    <span>4. Landlord Notified</span>
                    <span className="font-mono text-[9px] text-stone-400">Sent</span>
                  </div>
                  <p className="text-#6B7280 mt-0.5 text-[11px]">Remittance file made visible in your dashboard for compliance check.</p>
                </div>

                {/* Step 5 */}
                <div className="relative">
                  {(() => {
                    const isPending = selectedRemittanceBooking.status === 'Pending';
                    const isPendingAck = selectedRemittanceBooking.status === 'Pending Acknowledgement';
                    const isCleared = selectedRemittanceBooking.status === 'Confirmed' || selectedRemittanceBooking.status === 'Acknowledged';
                    const isDisputed = selectedRemittanceBooking.status === 'Disputed';

                    let circleBg = 'bg-stone-300';
                    if (isCleared) circleBg = 'bg-emerald-500 ring-4 ring-emerald-50';
                    if (isDisputed) circleBg = 'bg-rose-500 ring-4 ring-rose-50';
                    if (isPendingAck) circleBg = 'bg-amber-500 ring-4 ring-amber-50';

                    return (
                      <>
                        <div className={`absolute -left-8 top-1 w-2.5 h-2.5 rounded-full ${circleBg}`} />
                        <div className="flex justify-between font-semibold text-#132A1D">
                          <span>5. Landlord Acknowledgment</span>
                          <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded uppercase ${
                            isCleared ? 'bg-emerald-100 text-emerald-800' :
                            isDisputed ? 'bg-red-100 text-red-800' :
                            'bg-stone-50 text-#6B7280'
                          }`}>{selectedRemittanceBooking.status}</span>
                        </div>

                        {isCleared && (
                          <div className="mt-2 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-800 space-y-1">
                            <strong className="block">Cleared &amp; Confirmed Successfully</strong>
                            <p>You verified this bank receipt on {selectedRemittanceBooking.remittanceDateSent || 'July 14, 2026'}. No actions required.</p>
                          </div>
                        )}

                        {isDisputed && (
                          <div className="mt-2 bg-red-50 border border-red-200 p-3 rounded-xl text-[11px] text-red-800 space-y-1">
                            <strong className="block">Disputed by Landlord</strong>
                            <p><strong>Reason stated:</strong> {selectedRemittanceBooking.disputeReason || 'Disagreement with calculation.'}</p>
                            <span className="text-[10px] font-mono text-stone-400 block mt-1">Disputed Date: {selectedRemittanceBooking.disputeDate || '2026-07-14'}</span>
                          </div>
                        )}

                        {isPendingAck && (
                          <div className="mt-3 space-y-3.5">
                            <p className="text-#6B7280 text-[11px]">Awaiting your check. Please acknowledge if the funds are fully received, or raise an audit dispute.</p>
                            
                            {!showDisputeInput ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcknowledgeRemittance(selectedRemittanceBooking.id)}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-[10px] uppercase cursor-pointer flex-1 transition"
                                >
                                  Acknowledge Receipt
                                </button>
                                <button
                                  onClick={() => setShowDisputeInput(true)}
                                  className="px-4 py-2 bg-stone-50 hover:bg-stone-200 text-#132A1D border border-stone-200 font-semibold rounded-xl text-[10px] uppercase cursor-pointer flex-1 transition"
                                >
                                  Raise Dispute
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                                <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider">Dispute Audit Reason</label>
                                <textarea
                                  placeholder="Type the audit issue, e.g. amount doesn't match bank receipt."
                                  value={disputeReason}
                                  onChange={(e) => setDisputeReason(e.target.value)}
                                  className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none h-16"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDisputeSubmit(selectedRemittanceBooking.id)}
                                    className="px-3 py-1.5 bg-rose-600 text-white font-semibold rounded-lg text-[10px] uppercase cursor-pointer hover:bg-rose-700"
                                  >
                                    Submit Dispute
                                  </button>
                                  <button
                                    onClick={() => setShowDisputeInput(false)}
                                    className="px-3 py-1.5 bg-stone-50 text-#132A1D border border-stone-200 rounded-lg text-[10px] uppercase cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {isPending && (
                          <p className="text-stone-400 mt-1 italic text-[11px]">Awaiting remittance transfer by the assigned PMC.</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button 
                onClick={() => {
                  setSelectedRemittanceBooking(null);
                  setShowDisputeInput(false);
                  setDisputeReason('');
                }}
                className="px-4 py-2 bg-#132A1D hover:bg-#132A1D text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- EXPORT CONFIRMATION MODAL (ADDITION THREE: EXPANDED EXPORT) --- */}
      {showExportModal && showExportModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full shadow-sm border border-stone-200 overflow-hidden space-y-4 p-6">
            <div className="flex justify-between items-center pb-3 border-b border-stone-150">
              <div>
                <h4 className="font-display font-semibold text-#132A1D text-sm uppercase tracking-wide">Export Document Builder</h4>
                <p className="text-[11px] text-stone-400">Compliance document builder for Nigerian Shortlet Operators.</p>
              </div>
              <button 
                onClick={() => setShowExportModal(null)}
                className="p-1 rounded-full text-stone-400 hover:text-#6B7280 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Export Details Metadata Box */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div>
                <span className="block text-[9px] font-mono text-stone-400 uppercase">Covered Operator (Landlord)</span>
                <strong className="text-#132A1D font-semibold">{session.name}</strong>
              </div>
              <div>
                <span className="block text-[9px] font-mono text-stone-400 uppercase">Target View / Log</span>
                <strong className="text-#132A1D font-semibold">{showExportModal.tabName}</strong>
              </div>
              <div>
                <span className="block text-[9px] font-mono text-stone-400 uppercase">Covered Properties</span>
                <strong className="text-#132A1D font-semibold block truncate">
                  {agreements.map(a => a.propertyName).join(', ')}
                </strong>
              </div>
              <div>
                <span className="block text-[9px] font-mono text-stone-400 uppercase">Generation Timestamp</span>
                <strong className="text-#132A1D font-mono">July 14, 2026 • 14:00 UTC</strong>
              </div>
            </div>

            {/* Select Export Format */}
            <div className="space-y-2">
              <span className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider">Select Export Format</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportFormat('PDF')}
                  className={`p-3 rounded-2xl border text-center font-display font-semibold text-xs transition-all cursor-pointer ${
                    exportFormat === 'PDF' 
                      ? 'bg-#132A1D border-#132A1D text-white shadow-md' 
                      : 'bg-white border-stone-200 text-#6B7280 hover:bg-stone-50'
                  }`}
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setExportFormat('Excel')}
                  className={`p-3 rounded-2xl border text-center font-display font-semibold text-xs transition-all cursor-pointer ${
                    exportFormat === 'Excel' 
                      ? 'bg-#132A1D border-#132A1D text-white shadow-md' 
                      : 'bg-white border-stone-200 text-#6B7280 hover:bg-stone-50'
                  }`}
                >
                  Download Excel
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-3">
              <button
                disabled={exportIsGenerating}
                onClick={() => triggerMockDownload(showExportModal.tabName, exportFormat)}
                className="flex-1 py-2.5 bg-[#18452E] hover:bg-[#18452E] text-white rounded-xl text-xs font-semibold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {exportIsGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling File...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Generate &amp; Download</span>
                  </>
                )}
              </button>
              <button
                disabled={exportIsGenerating}
                onClick={() => setShowExportModal(null)}
                className="py-2.5 px-4 bg-stone-50 hover:bg-stone-200 text-#132A1D rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
