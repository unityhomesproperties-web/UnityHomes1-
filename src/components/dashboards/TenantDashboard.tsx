// @ts-nocheck
import MobileBottomNav from "./MobileBottomNav";
import NotificationFeed from "./NotificationFeed";
import React, { useState } from 'react';
import { 
  User, Landmark, ShieldAlert, CheckCircle, FileText, Upload,
  DollarSign, BarChart2, MessageCircle, RefreshCw, Sparkles,
  Building, Phone, Mail, FileLock, Clock, Activity, Wrench, ShieldCheck, MapPin, Search, Bell, Download, Lock
} from 'lucide-react';
import { LandlordUnit, UserSession, PromiseToPay, Complaint } from '../../types';
import { 
  routeComplaintSubmission, 
  ComplaintCategory, 
  isComplaintEscalationEligible, 
  escalateComplaintInStorage, 
  calculateDaysOpen 
} from '../../lib/complaintRouting';
import { initialProperties } from '../../data';
import ImmutableHistory from "./ImmutableHistory";
import { useLiveCollection } from '../../lib/database';
import OperationsBriefingCard from './OperationsBriefingCard';
import SupportCenter from './SupportCenter';
import QuickSupportButton from './QuickSupportButton';
import MoveInReadinessWidget from '../MoveInReadinessWidget';
import { getStoredTenantProfiles, calculateMoveInReadiness, FirestoreTenantProfile } from '../../lib/firestoreArchitecture';

interface TenantDashboardProps {
  session: UserSession;
  landlordUnits: LandlordUnit[];
}

export default function TenantDashboard({
  session,
  landlordUnits
}: TenantDashboardProps) {

  const [activeTab, setActiveTab] = useState<'Overview' | 'Payments' | 'Services' | 'Support' | 'Vault' | 'Profile'>('Overview');
  const [profileTab, setProfileTab] = useState<'info' | 'history'>('info');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [receiptFile, setReceiptFile] = useState<string>('');

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  const [recentlyViewed, setRecentlyViewed] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('uh_recently_viewed_tenant') || '[]'); } catch { return []; }
  });
  
  const [savedFilters, setSavedFilters] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('uh_saved_filters_tenant') || '[]'); } catch { return []; }
  });
  
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Community Association Meeting', body: 'The annual estate residents meeting will be held on Saturday. Attendance is mandatory for all tenants.', date: 'July 15, 2026' },
    { id: 2, title: 'Waste Collection Update', body: 'LAWMA collection days have been moved to Tuesdays and Fridays effective immediately.', date: 'July 10, 2026' }
  ]);

  const [showFilterNamePrompt, setShowFilterNamePrompt] = useState<{tab: string, filterData: any} | null>(null);
  const [filterNameInput, setFilterNameInput] = useState('');
  
  const [receiptUploadCharge, setReceiptUploadCharge] = useState<{name: string, amount: number} | null>(null);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const addToRecentlyViewed = (record: any) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== record.id);
      const updated = [record, ...filtered].slice(0, 6);
      localStorage.setItem('uh_recently_viewed_tenant', JSON.stringify(updated));
      return updated;
    });
  };

  // --- PROMISE TO PAY STATES & ACTIONS ---
  const [serviceCharges, setServiceCharges] = useState<any[]>(() => {
    try { 
      const existing = JSON.parse(localStorage.getItem("uh_service_charges_v1") || "[]"); 
      if (existing.length > 0) return existing;
    } catch {}
    // Default charges if none exist
    return [
      { id: 'sc-1', name: 'Security Levy', amount: 15000, frequency: 'per month', dueDate: '28 Jun 2026', status: 'Unpaid', verificationDate: null },
      { id: 'sc-2', name: 'Generator Diesel', amount: 45000, frequency: 'per month', dueDate: '28 Jun 2026', status: 'Unpaid', verificationDate: null },
      { id: 'sc-3', name: 'Water & Waste', amount: 5000, frequency: 'per month', dueDate: '28 Jun 2026', status: 'Paid', verificationDate: '15 Jun 2026' }
    ];
  });

  React.useEffect(() => {
    // Write defaults if not present
    if (!localStorage.getItem("uh_service_charges_v1")) {
      localStorage.setItem("uh_service_charges_v1", JSON.stringify(serviceCharges));
    }

    // Polling listener for real-time updates without page refresh
    const interval = setInterval(() => {
      try {
        const current = JSON.parse(localStorage.getItem("uh_service_charges_v1") || "[]");
        if (current && current.length > 0) {
          setServiceCharges(current);
        }
      } catch {}
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const [collectionTenant, setCollectionTenant] = useState<any>(null);
  
  // Live notifications subscription for badge and feed filtering
  const tenantNotifications = useLiveCollection('notifications', [], (allNotifs) => {
    const targetCode = collectionTenant?.tenantCode || '';
    return allNotifs.filter(n => (n as any).role === 'Tenant' && (!targetCode || (n as any).targetId === targetCode || (n as any).targetId === ''));
  });
  const hasUnreadNotifications = tenantNotifications.some(n => !(n as any).read);

  const [promises, setPromises] = useState<PromiseToPay[]>([]);
  const [isPromiseModalOpen, setIsPromiseModalOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'Rent' | 'Service Charge' | 'Both'>('Rent');
  const [promiseOutstandingAmount, setPromiseOutstandingAmount] = useState(0);
  const [promisedAmount, setPromisedAmount] = useState(0);
  const [expectedPaymentDate, setExpectedPaymentDate] = useState('');
  const [reasonForDelay, setReasonForDelay] = useState<'Salary Delay' | 'Business Cash Flow' | 'Medical Emergency' | 'Travel' | 'Bank Transfer Delay' | 'Other'>('Salary Delay');
  const [promiseNote, setPromiseNote] = useState('');
  const [showTenantReceipt, setShowTenantReceipt] = useState<{ tenantName: string; propertyName: string; unitNumber: string; amount: number; paymentType: string; date: string; ref: string } | null>(null);

  const [isCommitmentTicked, setIsCommitmentTicked] = useState(false);
  const [otherReason, setOtherReason] = useState('');
  const [showCancelPromiseConfirmId, setShowCancelPromiseConfirmId] = useState<string | null>(null);
  const [isMoveOutFlowOpen, setIsMoveOutFlowOpen] = useState(false);
  const [moveOutStep, setMoveOutStep] = useState(1);
  const [isMoveOutCheckboxTicked, setIsMoveOutCheckboxTicked] = useState(false);

  React.useEffect(() => {
    // Load collection tenants
    const cachedTenants = localStorage.getItem('uh_collection_tenants_v1');
    let collectionTenants = cachedTenants ? JSON.parse(cachedTenants) : [];
    
    // Ensure Gbenga Daniel (Tenant A) exists
    const hasGbenga = collectionTenants.some((t: any) => t.tenantCode === 'UH-TENANT-GBENGA');
    if (!hasGbenga) {
      collectionTenants.push({
        id: 'tenant-gbenga-id',
        tenantName: 'Gbenga Daniel',
        tenantCode: 'UH-TENANT-GBENGA',
        email: 'gbenga.daniel@unityhomes.ng',
        phone: '+234 803 111 2222',
        propertyName: 'Adebayo Epe Lagoon View Terrace',
        unitNumber: 'Block C3',
        rentAmount: 3500000,
        rentPaid: 2700000, // NGN 800,000 outstanding
        rentStatus: 'Overdue',
        rentDueDate: '2026-07-10', // overdue by 10 days
        leaseExpiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days from today
        tenancyType: 'Annual',
        landlordCode: 'UH-LANDLORD-FUNMI',
        pmcId: 'Prime Property Solutions',
        overdueDays: 10,
        isHighRisk: true,
        isReminderSuspended: false,
        activePromiseId: null
      });
    }

    // Ensure Funke Akindele (Tenant B) exists
    const hasFunke = collectionTenants.some((t: any) => t.tenantCode === 'UH-TENANT-FUNKE');
    if (!hasFunke) {
      collectionTenants.push({
        id: 'tenant-funke-id',
        tenantName: 'Funke Akindele',
        tenantCode: 'UH-TENANT-FUNKE',
        email: 'funke.akindele@unityhomes.ng',
        phone: '+234 809 333 4444',
        propertyName: 'Maryland Cozy Townhouse Suite B',
        unitNumber: 'Suite B',
        rentAmount: 2385600,
        rentPaid: 1585600, // NGN 800,000 outstanding
        rentStatus: 'Overdue',
        rentDueDate: '2026-07-05', // overdue
        leaseExpiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // exactly 45 days from today
        tenancyType: 'Annual',
        landlordCode: 'UH-LANDLORD-FASHOLA',
        pmcId: 'Lagos Realty Partners',
        overdueDays: 15,
        isHighRisk: true,
        isReminderSuspended: false,
        activePromiseId: null
      });
    }

    localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(collectionTenants));

    // Find matching tenant by name or email or fallback
    let match = collectionTenants.find((t: any) => 
      t.email.toLowerCase() === session.email.toLowerCase() || 
      t.tenantName.toLowerCase().includes(session.name.toLowerCase())
    );

    // Fallback to Gbenga Daniel
    if (!match && collectionTenants.length > 0) {
      match = collectionTenants.find((t: any) => t.tenantCode === 'UH-TENANT-GBENGA') || collectionTenants[0];
    }

    if (match) {
      setCollectionTenant(match);
      
      // Load promises for this specific tenant only
      const cachedPromises = localStorage.getItem('uh_promises_to_pay_v1');
      if (cachedPromises) {
        const allPromises = JSON.parse(cachedPromises);
        setPromises(allPromises.filter((p: any) => p.tenantId === match.tenantCode));
      }
    }
  }, [session]);

  const handleSelectDemoPersona = (persona: 'Gbenga' | 'Funke') => {
    const cachedTenants = localStorage.getItem('uh_collection_tenants_v1');
    let collectionTenants = cachedTenants ? JSON.parse(cachedTenants) : [];

    // Remove previous versions if any to ensure clean data
    collectionTenants = collectionTenants.filter((t: any) => t.tenantCode !== 'UH-TENANT-GBENGA' && t.tenantCode !== 'UH-TENANT-FUNKE');

    if (persona === 'Gbenga') {
      const gbenga = {
        id: 'tenant-gbenga-id',
        tenantName: 'Gbenga Daniel',
        tenantCode: 'UH-TENANT-GBENGA',
        email: 'gbenga.daniel@unityhomes.ng',
        phone: '+234 803 111 2222',
        propertyName: 'Adebayo Epe Lagoon View Terrace',
        unitNumber: 'Block C3',
        rentAmount: 3500000,
        rentPaid: 2700000, // NGN 800,000 outstanding
        rentStatus: 'Overdue',
        rentDueDate: '2026-07-10', // overdue by 10 days
        leaseExpiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days from today
        tenancyType: 'Annual',
        landlordCode: 'UH-LANDLORD-FUNMI',
        pmcId: 'Prime Property Solutions',
        overdueDays: 10,
        isHighRisk: true,
        isReminderSuspended: false,
        activePromiseId: null
      };
      collectionTenants.unshift(gbenga);
      localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(collectionTenants));
      setCollectionTenant(gbenga);
      
      const cachedPromises = localStorage.getItem('uh_promises_to_pay_v1');
      const allPromises = cachedPromises ? JSON.parse(cachedPromises) : [];
      setPromises(allPromises.filter((p: any) => p.tenantId === gbenga.tenantCode));
      triggerSuccess('Switched to Gbenga Daniel (Tenant A) Persona. Outstanding Rent: ₦800,000.');
    } else {
      const funke = {
        id: 'tenant-funke-id',
        tenantName: 'Funke Akindele',
        tenantCode: 'UH-TENANT-FUNKE',
        email: 'funke.akindele@unityhomes.ng',
        phone: '+234 809 333 4444',
        propertyName: 'Maryland Cozy Townhouse Suite B',
        unitNumber: 'Suite B',
        rentAmount: 2385600,
        rentPaid: 1585600, // NGN 800,000 outstanding
        rentStatus: 'Overdue',
        rentDueDate: '2026-07-05', // overdue
        leaseExpiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // exactly 45 days from today
        tenancyType: 'Annual',
        landlordCode: 'UH-LANDLORD-FASHOLA',
        pmcId: 'Lagos Realty Partners',
        overdueDays: 15,
        isHighRisk: true,
        isReminderSuspended: false,
        activePromiseId: null
      };
      collectionTenants.unshift(funke);
      localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(collectionTenants));
      setCollectionTenant(funke);
      
      const cachedPromises = localStorage.getItem('uh_promises_to_pay_v1');
      const allPromises = cachedPromises ? JSON.parse(cachedPromises) : [];
      setPromises(allPromises.filter((p: any) => p.tenantId === funke.tenantCode));
      triggerSuccess('Switched to Funke Akindele (Tenant B) Persona. Lease expires in 45 days (Annual). Outstanding Rent: ₦800,000.');
    }
  };

  const handleAdvancePromisePastDate = () => {
    if (!collectionTenant) return;

    const cachedPromises = localStorage.getItem('uh_promises_to_pay_v1');
    if (!cachedPromises) {
      alert('Please create a Promise to Pay first before advancing the date!');
      return;
    }

    const allPromises = JSON.parse(cachedPromises);
    const tenantPromises = allPromises.filter((p: any) => p.tenantId === collectionTenant.tenantCode && p.status === 'Upcoming');

    if (tenantPromises.length === 0) {
      alert('No active Upcoming promise found for this tenant to break. Please click "Promise to Pay" to submit one first!');
      return;
    }

    // Set expected date to 5 days ago
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    const updatedPromises = allPromises.map((p: any) => {
      if (p.tenantId === collectionTenant.tenantCode && p.status === 'Upcoming') {
        return {
          ...p,
          expectedPaymentDate: pastDateStr,
          status: 'Broken Promise' // Force it immediately to simulate daily CF check
        };
      }
      return p;
    });

    localStorage.setItem('uh_promises_to_pay_v1', JSON.stringify(updatedPromises));
    setPromises(updatedPromises.filter((p: any) => p.tenantId === collectionTenant.tenantCode));

    // Reactivate standard reminders
    const cachedTenants = localStorage.getItem('uh_collection_tenants_v1');
    if (cachedTenants) {
      const allTenants = JSON.parse(cachedTenants);
      const updatedTenants = allTenants.map((t: any) => {
        if (t.id === collectionTenant.id) {
          return { ...t, isReminderSuspended: false, rentStatus: 'Payment Commitment Not Met' };
        }
        return t;
      });
      localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(updatedTenants));
      setCollectionTenant(updatedTenants.find((t: any) => t.id === collectionTenant.id));
    }

    // Write Broken Promise entry to activityLog
    const cachedLogs = localStorage.getItem('uh_activityLog_v1') || localStorage.getItem('activityLog') || '[]';
    let activityLog = [];
    try { activityLog = JSON.parse(cachedLogs); } catch {}
    activityLog.unshift({
      id: `act-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actorName: 'System Cloud Scheduler',
      actorRole: 'System',
      actionType: 'Broken Promise',
      recordAffected: `Property Unit: ${collectionTenant.propertyName}`,
      recordId: collectionTenant.tenantCode,
      details: `Daily Cloud Scheduler run: Expected payment date ${pastDateStr} passed without payment. Status set to Broken Promise. Reminders reactivated.`
    });
    localStorage.setItem('uh_activityLog_v1', JSON.stringify(activityLog));

    // Send notifications
    const cachedNotifs = localStorage.getItem('uh_notifications_v1') || '[]';
    let notifications = [];
    try { notifications = JSON.parse(cachedNotifs); } catch {}
    notifications.unshift({
      id: `not-landlord-${Math.random().toString(36).substr(2, 9)}`,
      role: 'Landlord',
      targetId: collectionTenant.landlordCode,
      title: 'Broken Promise Alert',
      message: `Tenant ${collectionTenant.tenantName} missed the promised payment date of ${pastDateStr}. Standard overdue reminder schedule reactivated.`,
      date: new Date().toISOString(),
      isRead: false
    });
    localStorage.setItem('uh_notifications_v1', JSON.stringify(notifications));

    triggerSuccess('Time advanced past expected payment date! Cloud Function simulated: status updated to Broken Promise (Payment Commitment Not Met on tenant view).');
  };

  const handleCancelPromiseConfirm = (promiseId: string) => {
    setShowCancelPromiseConfirmId(promiseId);
  };

  const handleCancelPromise = (promiseId: string) => {
    if (!collectionTenant) return;

    const cachedPromises = localStorage.getItem('uh_promises_to_pay_v1');
    const allPromises = cachedPromises ? JSON.parse(cachedPromises) : [];
    const updatedPromises = allPromises.map((p: any) => {
      if (p.id === promiseId) {
        return { ...p, status: 'Cancelled' };
      }
      return p;
    });
    localStorage.setItem('uh_promises_to_pay_v1', JSON.stringify(updatedPromises));
    setPromises(updatedPromises.filter((p: any) => p.tenantId === collectionTenant.tenantCode));

    const cachedTenants = localStorage.getItem('uh_collection_tenants_v1');
    if (cachedTenants) {
      const allTenants = JSON.parse(cachedTenants);
      const updatedTenants = allTenants.map((t: any) => {
        if (t.id === collectionTenant.id) {
          return { ...t, isReminderSuspended: false, activePromiseId: null };
        }
        return t;
      });
      localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(updatedTenants));
      setCollectionTenant(updatedTenants.find((t: any) => t.id === collectionTenant.id));
    }

    const cachedLogs = localStorage.getItem('uh_activityLog_v1') || localStorage.getItem('activityLog') || '[]';
    let activityLog = [];
    try { activityLog = JSON.parse(cachedLogs); } catch {}
    activityLog.unshift({
      id: `act-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actorName: collectionTenant.tenantName,
      actorRole: 'Tenant',
      actionType: 'Tenant Cancelled Promise to Pay',
      recordAffected: `Property Unit: ${collectionTenant.propertyName}`,
      recordId: collectionTenant.tenantCode,
      details: `Tenant ${collectionTenant.tenantName} withdrew their promise to pay.`
    });
    localStorage.setItem('uh_activityLog_v1', JSON.stringify(activityLog));

    setShowCancelPromiseConfirmId(null);
    triggerSuccess('Payment promise withdrawn. Standard reminders have been resumed.');
  };

  const handleTriggerMoveOutFlow = () => {
    setIsMoveOutFlowOpen(true);
    setMoveOutStep(1);
    setIsMoveOutCheckboxTicked(false);
  };

  const handleConfirmMoveOut = () => {
    if (!collectionTenant) return;

    const noticePeriodMonths = collectionTenant.tenancyType === 'Monthly' ? 1 : 6;
    const legalEndDate = new Date();
    legalEndDate.setMonth(legalEndDate.getMonth() + noticePeriodMonths);
    const legalEndDateStr = legalEndDate.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    const cachedTenants = localStorage.getItem('uh_collection_tenants_v1');
    if (cachedTenants) {
      const allTenants = JSON.parse(cachedTenants);
      const updatedTenants = allTenants.map((t: any) => {
        if (t.id === collectionTenant.id) {
          return {
            ...t,
            renewalIntention: 'vacating',
            noticeStartDate: todayStr,
            legalEndDate: legalEndDateStr
          };
        }
        return t;
      });
      localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(updatedTenants));
      setCollectionTenant(updatedTenants.find((t: any) => t.id === collectionTenant.id));
    }

    const cachedLogs = localStorage.getItem('uh_activityLog_v1') || localStorage.getItem('activityLog') || '[]';
    let activityLog = [];
    try { activityLog = JSON.parse(cachedLogs); } catch {}
    activityLog.unshift({
      id: `act-moveout-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actorName: collectionTenant.tenantName,
      actorRole: 'Tenant',
      actionType: 'Tenant Initiated Move-Out',
      recordAffected: `Property Unit: ${collectionTenant.propertyName}`,
      recordId: collectionTenant.tenantCode,
      details: `Tenant initiated move-out notice today. Lease expiry: ${collectionTenant.leaseExpiryDate}. Notice started: ${todayStr}. Notice statutory period: ${noticePeriodMonths} months. Legal end date (vacate limit): ${legalEndDateStr}.`
    });
    localStorage.setItem('uh_activityLog_v1', JSON.stringify(activityLog));

    const cachedNotifs = localStorage.getItem('uh_notifications_v1') || '[]';
    let notifications = [];
    try { notifications = JSON.parse(cachedNotifs); } catch {}
    notifications.unshift({
      id: `not-landlord-move-${Math.random().toString(36).substr(2, 9)}`,
      role: 'Landlord',
      targetId: collectionTenant.landlordCode,
      title: 'Tenant Initiated Move-Out Notice',
      message: `Tenant ${collectionTenant.tenantName} has initiated move-out process. Notice period ends on ${legalEndDateStr}.`,
      date: new Date().toISOString(),
      isRead: false
    });
    if (collectionTenant.pmcId) {
      notifications.unshift({
        id: `not-pmc-move-${Math.random().toString(36).substr(2, 9)}`,
        role: 'PMC',
        targetId: collectionTenant.pmcId,
        title: 'Tenant Initiated Move-Out Notice',
        message: `Tenant ${collectionTenant.tenantName} has initiated move-out process. Notice period ends on ${legalEndDateStr}.`,
        date: new Date().toISOString(),
        isRead: false
      });
    }
    notifications.unshift({
      id: `not-admin-move-${Math.random().toString(36).substr(2, 9)}`,
      role: 'Admin',
      targetId: 'Admin',
      title: 'Tenant Initiated Move-Out Notice',
      message: `Tenant ${collectionTenant.tenantName} from ${collectionTenant.propertyName} initiated move-out. Legal End Date: ${legalEndDateStr}.`,
      date: new Date().toISOString(),
      isRead: false
    });
    localStorage.setItem('uh_notifications_v1', JSON.stringify(notifications));

    const cachedQuitNotices = localStorage.getItem('uh_pending_quit_notices_v1') || '[]';
    let quitNotices = [];
    try { quitNotices = JSON.parse(cachedQuitNotices); } catch {}
    quitNotices.unshift({
      id: `qn-${Math.random().toString(36).substr(2, 9)}`,
      tenantId: collectionTenant.tenantCode,
      tenantName: collectionTenant.tenantName,
      propertyName: collectionTenant.propertyName,
      unitNumber: collectionTenant.unitNumber,
      noticeStartDate: todayStr,
      legalEndDate: legalEndDateStr,
      status: 'Pending Admin Review'
    });
    localStorage.setItem('uh_pending_quit_notices_v1', JSON.stringify(quitNotices));

    setIsMoveOutFlowOpen(false);
    triggerSuccess(`Notice of Move-Out submitted successfully. Notice period ends on ${legalEndDateStr}.`);
  };

  const handleCreatePromise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionTenant) return;

    if (!isCommitmentTicked) {
      alert('You must tick the mandatory commitment checkbox to submit.');
      return;
    }

    const finalReason = reasonForDelay === 'Other' ? otherReason : reasonForDelay;
    
    // Date constraints check
    const today = new Date();
    today.setHours(0,0,0,0);
    const expected = new Date(expectedPaymentDate);
    expected.setHours(0,0,0,0);
    
    const diffTime = expected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      alert('Expected Payment Date must not be in the past.');
      return;
    }
    if (diffDays > 60) {
      alert('Expected Payment Date must not be more than 60 days in the future.');
      return;
    }

    const newPromise: PromiseToPay = {
      id: `prm-${Math.random().toString(36).substr(2, 9)}`,
      tenantId: collectionTenant.tenantCode,
      tenantName: collectionTenant.tenantName,
      tenantPhone: collectionTenant.phone,
      propertyId: collectionTenant.propertyName,
      propertyName: collectionTenant.propertyName,
      landlordId: collectionTenant.landlordCode,
      managementCompanyId: collectionTenant.pmcId || 'Prime Property Solutions',
      paymentType: selectedPaymentType,
      outstandingAmount: promiseOutstandingAmount,
      promisedAmount: promisedAmount,
      expectedPaymentDate: expectedPaymentDate,
      reasonForDelay: finalReason as any,
      note: promiseNote,
      status: 'Upcoming',
      createdAt: new Date().toISOString(),
      acknowledgedByLandlord: false,
      acknowledgedByPMC: false,
      lastReminderStage: 'Scheduled (3 days before)'
    };

    // Save to localStorage
    const cachedPromises = localStorage.getItem('uh_promises_to_pay_v1');
    const allPromises = cachedPromises ? JSON.parse(cachedPromises) : [];
    const updatedPromises = [newPromise, ...allPromises];
    localStorage.setItem('uh_promises_to_pay_v1', JSON.stringify(updatedPromises));
    setPromises(updatedPromises.filter((p: any) => p.tenantId === collectionTenant.tenantCode));

    // Also write to Ledger (uh_ledger_records_v1)
    const ledgerRecord = {
      id: `led-prm-${Math.random().toString(36).substr(2, 9)}`,
      propertyName: collectionTenant.propertyName,
      unitNumber: collectionTenant.unitNumber,
      tenantName: collectionTenant.tenantName,
      type: 'Tenant Created Promise',
      amount: promisedAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      ref: `PRM-${Math.floor(100000 + Math.random() * 900000)}`
    };
    const cachedLedger = localStorage.getItem('uh_ledger_records_v1');
    const ledger = cachedLedger ? JSON.parse(cachedLedger) : [];
    ledger.unshift(ledgerRecord);
    localStorage.setItem('uh_ledger_records_v1', JSON.stringify(ledger));

    // Write entry to activityLog with exact event type 'Tenant Created Promise to Pay'
    const cachedLogs = localStorage.getItem('uh_activityLog_v1') || localStorage.getItem('activityLog') || '[]';
    let activityLog = [];
    try { activityLog = JSON.parse(cachedLogs); } catch {}
    activityLog.unshift({
      id: `act-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actorName: collectionTenant.tenantName,
      actorRole: 'Tenant',
      actionType: 'Tenant Created Promise to Pay',
      recordAffected: `Property Unit: ${collectionTenant.propertyName}`,
      recordId: collectionTenant.tenantCode,
      details: `Tenant created promise to pay ₦${promisedAmount.toLocaleString()} on ${expectedPaymentDate}. Reason: ${finalReason}. Notes: ${promiseNote}`
    });
    localStorage.setItem('uh_activityLog_v1', JSON.stringify(activityLog));

    // Create notifications for Landlord, PMC, Admin in uh_notifications_v1 (No WhatsApp)
    const notifications = [
      { id: `not-${Math.random().toString(36).substr(2, 9)}`, role: 'Landlord', targetId: collectionTenant.landlordCode, title: 'New Promise to Pay', message: `Tenant ${collectionTenant.tenantName} created a promise to pay ₦${promisedAmount.toLocaleString()} on ${expectedPaymentDate} due to ${finalReason}.`, date: new Date().toISOString(), isRead: false },
      { id: `not-${Math.random().toString(36).substr(2, 9)}`, role: 'PMC', targetId: collectionTenant.pmcId || 'Prime Property Solutions', title: 'New Promise to Pay', message: `Tenant ${collectionTenant.tenantName} created a promise to pay ₦${promisedAmount.toLocaleString()} on ${expectedPaymentDate} due to ${finalReason}.`, date: new Date().toISOString(), isRead: false },
      { id: `not-${Math.random().toString(36).substr(2, 9)}`, role: 'Admin', targetId: 'Admin', title: 'New Promise to Pay', message: `Tenant ${collectionTenant.tenantName} created a promise to pay ₦${promisedAmount.toLocaleString()} on ${expectedPaymentDate} due to ${finalReason}.`, date: new Date().toISOString(), isRead: false }
    ];
    const cachedNotifs = localStorage.getItem('uh_notifications_v1');
    const notifs = cachedNotifs ? JSON.parse(cachedNotifs) : [];
    localStorage.setItem('uh_notifications_v1', JSON.stringify([...notifications, ...notifs]));

    // Update tenant's collection status (suspend standard reminders)
    const cachedTenants = localStorage.getItem('uh_collection_tenants_v1');
    if (cachedTenants) {
      const allTenants = JSON.parse(cachedTenants);
      const updatedTenants = allTenants.map((t: any) => {
        if (t.id === collectionTenant.id) {
          return { ...t, isReminderSuspended: true, activePromiseId: newPromise.id };
        }
        return t;
      });
      localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(updatedTenants));
      setCollectionTenant(updatedTenants.find((t: any) => t.id === collectionTenant.id));
    }

    setIsPromiseModalOpen(false);
    setPromiseNote('');
    setIsCommitmentTicked(false);
    setOtherReason('');
    triggerSuccess(`Promise to Pay of ₦${promisedAmount.toLocaleString()} successfully created! Outstanding reminders have been suspended.`);
  };

  const handleTenantPayNow = (type: 'Rent' | 'Service Charge' | 'Both', amount: number) => {
    if (!collectionTenant) return;

    // Save payment
    const cachedTenants = localStorage.getItem('uh_collection_tenants_v1');
    let updatedTenants = [];
    if (cachedTenants) {
      const allTenants = JSON.parse(cachedTenants);
      updatedTenants = allTenants.map((t: any) => {
        if (t.id === collectionTenant.id) {
          const updated = { ...t };
          if (type === 'Rent' || type === 'Both') {
            updated.rentPaid = t.rentAmount;
            updated.rentStatus = 'Paid';
          }
          if (type === 'Service Charge' || type === 'Both') {
            updated.serviceChargePaid = t.serviceChargeAmount;
            updated.serviceChargeStatus = 'Paid';
          }
          updated.overdueDays = 0;
          updated.isHighRisk = false;
          updated.isReminderSuspended = false;
          updated.activePromiseId = null;
          return updated;
        }
        return t;
      });
      localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(updatedTenants));
      setCollectionTenant(updatedTenants.find((t: any) => t.id === collectionTenant.id));
    }

    // Mark any associated pending promise as fulfilled!
    const cachedPromises = localStorage.getItem('uh_promises_to_pay_v1');
    if (cachedPromises) {
      const allPromises = JSON.parse(cachedPromises);
      const updatedPromises = allPromises.map((p: any) => {
        if (p.tenantId === collectionTenant.tenantCode && p.status === 'Upcoming') {
          return { ...p, status: 'Fulfilled' };
        }
        return p;
      });
      localStorage.setItem('uh_promises_to_pay_v1', JSON.stringify(updatedPromises));
      setPromises(updatedPromises.filter((p: any) => p.tenantId === collectionTenant.tenantCode));
    }

    // Add ledger entry
    const payRef = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const ledgerRecord = {
      id: `led-prm-fulfill-${Math.random().toString(36).substr(2, 9)}`,
      propertyName: collectionTenant.propertyName,
      unitNumber: collectionTenant.unitNumber,
      tenantName: collectionTenant.tenantName,
      type: 'Promise Fulfilled',
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      status: 'Settled',
      ref: payRef
    };
    const cachedLedger = localStorage.getItem('uh_ledger_records_v1');
    const ledger = cachedLedger ? JSON.parse(cachedLedger) : [];
    ledger.unshift(ledgerRecord);
    localStorage.setItem('uh_ledger_records_v1', JSON.stringify(ledger));

    // Also write a reminder log for record keeping
    const cachedLogs = localStorage.getItem('uh_collection_logs_v1');
    const reminderLogs = cachedLogs ? JSON.parse(cachedLogs) : [];
    reminderLogs.unshift({
      id: `log-pay-${Math.random().toString(36).substr(2, 9)}`,
      tenantName: collectionTenant.tenantName,
      propertyName: collectionTenant.propertyName,
      unitNumber: collectionTenant.unitNumber,
      dateSent: new Date().toISOString().split('T')[0],
      timeSent: new Date().toTimeString().slice(0, 5),
      sender: 'AI',
      channel: 'In-App',
      status: 'Delivered',
      readStatus: 'Read',
      paymentStatusAfter: 'Paid',
      outstandingAmt: 0
    });
    localStorage.setItem('uh_collection_logs_v1', JSON.stringify(reminderLogs));

    // Show automatic receipt
    setShowTenantReceipt({
      tenantName: collectionTenant.tenantName,
      propertyName: collectionTenant.propertyName,
      unitNumber: collectionTenant.unitNumber,
      amount: amount,
      paymentType: type,
      date: new Date().toISOString().split('T')[0],
      ref: payRef
    });

    triggerSuccess(`Payment of ₦${amount.toLocaleString()} processed successfully! Receipt and Transparency Certificate auto-generated.`);
  };

  const openPromiseModal = (type: 'Rent' | 'Service Charge' | 'Both', outstanding: number) => {
    setSelectedPaymentType(type);
    setPromiseOutstandingAmount(outstanding);
    setPromisedAmount(outstanding);
    // default expected payment date to 14 days from now
    const fut = new Date();
    fut.setDate(fut.getDate() + 14);
    setExpectedPaymentDate(fut.toISOString().split('T')[0]);
    setIsPromiseModalOpen(true);
  };


  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // Locate the tenant's assigned tenancy registry
  const tenantMatch = (landlordUnits.find(u => 
    u.tenantName.toLowerCase().includes(session.name.toLowerCase()) || 
    session.email === 'sandbox@unityhomes.ng'
  ) || {
    id: 'fallback-tenant-id',
    propertyName: 'Adebayo Epe Lagoon View Terrace',
    unitNumber: 'Suite View',
    tenantName: 'Gbenga Daniel',
    tenantCode: 'UH-TENANT-DUAL-88',
    rentAmount: 3500000,
    paymentStatus: 'Paid',
    dueDate: '2027-04-12',
    leaseExpiryDate: '2027-04-12',
    tenancyType: 'Annual'
  }) as LandlordUnit;

  // Dynamically obtain the verified landlord bank account per property
  const matchedProperty = initialProperties.find(p => 
    p.title === tenantMatch.propertyName || 
    tenantMatch.propertyName.includes(p.title) ||
    p.title.includes(tenantMatch.propertyName)
  );

  const landlordDetails = {
    name: matchedProperty ? matchedProperty.landlordName : 'Mrs Funmi Adebayo',
    code: matchedProperty ? matchedProperty.landlordCode : 'UH-LANDLORD-FUNMI',
    email: matchedProperty ? `${matchedProperty.landlordName.toLowerCase().replace(/\s+/g, '')}@unityhomes.ng` : 'funmi@adebayo.ng',
    verifiedPhone: '+234 805 120 4492',
    bank: matchedProperty ? matchedProperty.verifiedBankName : 'Guaranty Trust Bank (GTB)',
    accountNumber: matchedProperty ? matchedProperty.verifiedAccountNumber : '1022938485',
    beneficiaryName: matchedProperty ? matchedProperty.verifiedAccountName : 'Mrs Funmi Adebayo Verified Collection Account',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=150&h=150&fit=crop'
  };

  const pmcDetails = {
    active: true,
    name: 'Prime Property Solutions',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    phone: '+234 800 PRIME',
    email: 'contact@primeprops.ng',
    code: 'UH-PMC-PRIME-01',
    status: 'Verified PMC'
  };

  // Live Calculator Interactive Input States
  const [savedSoFar, setSavedSoFar] = useState<number>(1200000);
  const [targetRent, setTargetRent] = useState<number>(tenantMatch.rentAmount);
  const [calcDueDate, setCalcDueDate] = useState<string>(
    tenantMatch.dueDate && tenantMatch.dueDate !== '-' ? tenantMatch.dueDate : '2027-04-12'
  );

  // Live Calculations
  const stillNeeded = targetRent - savedSoFar > 0 ? targetRent - savedSoFar : 0;
  
  const getDaysRemaining = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const target = new Date(targetDateStr);
    target.setHours(0,0,0,0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining(calcDueDate);
  const weeksRemaining = daysRemaining > 0 ? Math.ceil(daysRemaining / 7) : 0;
  const suggestedWeeklySaving = weeksRemaining > 0 
    ? Math.round(stillNeeded / weeksRemaining) 
    : stillNeeded;
  const suggestedMonthlySaving = weeksRemaining > 0 
    ? Math.round((stillNeeded / weeksRemaining) * 4) 
    : stillNeeded;

  const percentSaved = targetRent > 0 ? Math.min(100, Math.round((savedSoFar / targetRent) * 100)) : 0;

  const handleUploadReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      alert('Kindly fill in the unique bank transfer reference Memo.');
      return;
    }
    if (receiptUploadCharge) {
      // Update the service charge to 'Pending Verification'
      const updatedCharges = serviceCharges.map(sc => 
        sc.name === receiptUploadCharge.name 
        ? { ...sc, status: 'Pending Verification', verificationDate: new Date().toISOString().split('T')[0] } 
        : sc
      );
      setServiceCharges(updatedCharges);
      localStorage.setItem('uh_service_charges_v1', JSON.stringify(updatedCharges));
      triggerSuccess('Service charge receipt submitted successfully! Pending verification by admin.');
      setReceiptUploadCharge(null);
    } else {
      // DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds.
      triggerSuccess('Payment receipt details recorded successfully! Rent status will be updated to Paid once the landlord confirms receipt on their Ledger.');
    }
    setReceiptFile('');
  };

  const leaseExpiryDateStr = collectionTenant?.leaseExpiryDate || tenantMatch.leaseExpiryDate || '';
  const daysToLeaseEnd = leaseExpiryDateStr ? getDaysRemaining(leaseExpiryDateStr) : 120;
  const isWithin90Days = daysToLeaseEnd <= 90;
  const activePromise = promises.find(p => p.tenantId === collectionTenant?.tenantCode && p.status === 'Upcoming');

  const noticePeriodMonths = collectionTenant?.tenancyType === 'Monthly' ? 1 : 6;
  const earliestVacateDate = new Date();
  earliestVacateDate.setMonth(earliestVacateDate.getMonth() + noticePeriodMonths);
  const earliestVacateDateStr = earliestVacateDate.toISOString().split('T')[0];

  const tabs = ['Overview', 'Payments', 'Services', 'Support', 'Vault', 'Profile'];

  return (
    <div className="space-y-6 pb-16 font-sans tracking-wide animate-fade-in">
      
      {/* CONNECTIVITY INDICATOR HEADER */}
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-end space-x-3">
          <QuickSupportButton 
            currentTab={activeTab}
            onOpenSupportForm={() => setActiveTab('Support')}
          />
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full shadow-xs border border-stone-200">
            {isOffline ? <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> : (isSyncing ? <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div> : <div className="w-2 h-2 rounded-full bg-emerald-500"></div>)}
            <span className="text-[10px] font-mono uppercase font-bold text-#6B7280">{isOffline ? 'Offline' : (isSyncing ? 'Syncing' : 'Online')}</span>
          </div>
          <button onClick={() => setShowNotifications(true)} className="p-2 border border-stone-200 bg-white rounded-full hover:bg-stone-50 transition relative shadow-xs">
            <Bell className="w-4 h-4 text-#6B7280" />
            {hasUnreadNotifications && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>
            )}
          </button>
        </div>
        {isOffline && (
          <div className="mt-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-2 rounded-xl flex items-center justify-between">
            <span>You are offline. Your changes will sync automatically when connection is restored.</span>
          </div>
        )}
      </div>

      {/* COMPLIANCE & AUDIT SANDBOX CONTROL PANEL */}
      <div className="bg-#132A1D text-stone-100 p-5 rounded-[var(--radius-large)] border border-#132A1D space-y-4 shadow-sm mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-#132A1D pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <h3 className="font-display font-black uppercase text-xs tracking-wider text-amber-500">Compliance & Audit Sandbox Control</h3>
          </div>
          <span className="text-[10px] font-mono text-stone-400">Environment Clock: 2026-07-20 UTC</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Persona Switcher */}
          <div className="space-y-2">
            <label className="block text-[9px] font-mono text-stone-400 uppercase font-bold">Select Active Demo Tenant Persona:</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemoPersona('Gbenga')}
                className={`flex-1 p-3 rounded-2xl border text-left transition duration-200 cursor-pointer ${
                  collectionTenant?.tenantCode === 'UH-TENANT-GBENGA'
                    ? 'bg-emerald-950 border-emerald-500 text-white'
                    : 'bg-#132A1D border-#132A1D hover:bg-stone-750 text-stone-300'
                }`}
              >
                <strong className="text-xs block">Gbenga Daniel (Tenant A)</strong>
                <span className="text-[9px] block text-stone-400 font-mono mt-0.5">Outstanding: ₦800,000 | Exp: 120 Days</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoPersona('Funke')}
                className={`flex-1 p-3 rounded-2xl border text-left transition duration-200 cursor-pointer ${
                  collectionTenant?.tenantCode === 'UH-TENANT-FUNKE'
                    ? 'bg-emerald-950 border-emerald-500 text-white'
                    : 'bg-#132A1D border-#132A1D hover:bg-stone-750 text-stone-300'
                }`}
              >
                <strong className="text-xs block">Funke Akindele (Tenant B)</strong>
                <span className="text-[9px] block text-stone-400 font-mono mt-0.5">Outstanding: ₦800,000 | Exp: 45 Days (Annual)</span>
              </button>
            </div>
          </div>

          {/* Cloud Function / Time Simulator */}
          <div className="space-y-2">
            <label className="block text-[9px] font-mono text-stone-400 uppercase font-bold">Time & Status Simulator:</label>
            <div className="flex">
              <button
                type="button"
                onClick={handleAdvancePromisePastDate}
                className="w-full p-3 bg-#132A1D hover:bg-stone-750 border border-#132A1D hover:border-stone-650 rounded-2xl text-left text-xs font-semibold text-stone-100 transition cursor-pointer flex flex-col justify-between"
              >
                <strong className="text-amber-400 block font-display">⚡ Past Due Date Simulator</strong>
                <span className="text-[9px] text-stone-400 block mt-1 font-mono">Simulate daily background Cloud Function run: advance date & trigger Broken Promise check</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs text-emerald-805 tracking-normal shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* PROMPT TWO: FIVE PRIMARY NAVIGATION AREAS FOR TENANT DASHBOARD */}
      <div className="space-y-3 w-full border-b border-stone-200/60 pb-3">
        {/* PRIMARY 5 NAV AREAS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
          {/* AREA 1: HOME */}
          <button
            onClick={() => setActiveTab('Overview')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              activeTab === 'Overview'
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            1. Home / Dashboard
          </button>

          {/* AREA 2: PROPERTY */}
          <button
            onClick={() => setActiveTab('Profile')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              activeTab === 'Profile'
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            2. Property / Lease
          </button>

          {/* AREA 3: MONEY */}
          <button
            onClick={() => setActiveTab('Payments')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              activeTab === 'Payments'
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            3. Money / Payments
          </button>

          {/* AREA 4: OPERATIONS / SUPPORT */}
          <button
            onClick={() => setActiveTab('Services')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              ['Services', 'Support'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            4. Operations &amp; Support
          </button>

          {/* AREA 5: MORE */}
          <button
            onClick={() => setActiveTab('Vault')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer col-span-2 sm:col-span-1 ${
              activeTab === 'Vault'
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            5. More / Vault
          </button>
        </div>

        {/* DYNAMIC SECONDARY SUB-NAVIGATION PILLS FOR ACTIVE AREA */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {activeTab === 'Overview' && (
            <button className="px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl bg-[#18452E] text-white cursor-pointer">
              &bull; Overview &amp; Resident Briefing
            </button>
          )}

          {activeTab === 'Profile' && (
            <button className="px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl bg-[#18452E] text-white cursor-pointer">
              &bull; Lease &amp; Tenant Profile
            </button>
          )}

          {activeTab === 'Payments' && (
            <button className="px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl bg-[#18452E] text-white cursor-pointer">
              &bull; Rent &amp; Service Charge Payments
            </button>
          )}

          {['Services', 'Support'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Services')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Services' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Service Charges &amp; Maintenance
              </button>
              <button 
                onClick={() => setActiveTab('Support')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Support' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Support &amp; Disputes
              </button>
            </>
          )}

          {activeTab === 'Vault' && (
            <button className="px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl bg-[#18452E] text-white cursor-pointer">
              &bull; Document Vault &amp; Receipts
            </button>
          )}
        </div>
      </div>

      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* PROMPT FIVE: OPERATIONS BRIEFING ASSISTANT */}
          <OperationsBriefingCard role="Tenant" userName={session.name} />

          {/* MOVE-IN READINESS CHECKLIST */}
          <MoveInReadinessWidget 
            profile={(() => {
              const profiles = getStoredTenantProfiles();
              const found = profiles.find(p => p.user_id === session.userId || p.id === session.userId || p.email === session.email);
              if (found) return found;
              const fallback: FirestoreTenantProfile = {
                id: session.userId || 'tenant-demo-id',
                user_id: session.userId || 'tenant-demo-id',
                full_name: session.name || 'Active Tenant',
                phone: '+234 803 111 2222',
                email: session.email || 'tenant@unityhomes.ng',
                emergency_contact_name: 'Chief Emergency Contact',
                emergency_contact_phone: '+234 802 333 4444',
                guarantor_name: 'Guarantor Full Name',
                guarantor_phone: '+234 803 555 6666',
                guarantor_confirmed: true,
                current_tenancy_id: 'tenancy-active-01',
                created_at: new Date().toISOString()
              };
              fallback.move_in_readiness = calculateMoveInReadiness(fallback);
              return fallback;
            })()} 
            mode="tenant" 
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* VERIFIED PROPERTY SECTION */}
            <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3">
                <Building className="text-[#18452E] w-5 h-5" />
                <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Verified Property</h3>
              </div>
              
              <div className="space-y-3 text-xs">
                <div className="flex flex-col space-y-1">
                  <span className="text-stone-400 uppercase font-mono text-[9px] font-bold">Property Name</span>
                  <strong className="text-#132A1D text-sm">{tenantMatch.propertyName}</strong>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-stone-400 uppercase font-mono text-[9px] font-bold">Property Address</span>
                  <span className="text-#132A1D">Lagos, Nigeria</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-stone-400 uppercase font-mono text-[9px] font-bold">Unit Number</span>
                    <strong className="text-#132A1D">{tenantMatch.unitNumber}</strong>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-stone-400 uppercase font-mono text-[9px] font-bold">Property Type</span>
                    <span className="text-#132A1D">Residential</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-stone-400 uppercase font-mono text-[9px] font-bold">Lease Start Date</span>
                    <span className="text-#132A1D">2026-04-12</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-stone-400 uppercase font-mono text-[9px] font-bold">Lease End Date</span>
                    <span className="text-#132A1D">2027-04-11</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-stone-200">
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 inline-block">Active Occupancy</span>
                </div>
              </div>
            </div>

            {/* LANDLORD VERIFICATION SECTION */}
            <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3">
                <User className="text-[#18452E] w-5 h-5" />
                <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Landlord Verification</h3>
              </div>
              
              <div className="flex items-start space-x-4">
                <img src={landlordDetails.photo} alt={landlordDetails.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                <div className="space-y-1">
                  <h4 className="font-bold text-#132A1D text-sm">{landlordDetails.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center w-fit">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified Status
                  </span>
                  <span className="text-[#18452E] font-mono block text-xs mt-1">{landlordDetails.code}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono pt-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span>{landlordDetails.verifiedPhone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{landlordDetails.email}</span>
                </div>
              </div>
            </div>

            {/* PROPERTY MANAGEMENT COMPANY SECTION */}
            {pmcDetails.active && (
              <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-4">
                <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3">
                  <Building className="text-teal-700 w-5 h-5" />
                  <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Property Management Company</h3>
                </div>
                
                <div className="flex items-start space-x-4">
                  <img src={pmcDetails.logo} alt={pmcDetails.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-#132A1D text-sm">{pmcDetails.name}</h4>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-teal-100 text-teal-800 flex items-center w-fit">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified PMC
                    </span>
                    <span className="text-teal-700 font-mono block text-xs mt-1">{pmcDetails.code}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono pt-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{pmcDetails.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{pmcDetails.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT DESTINATION CENTER */}
            <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#18452E]/5 rounded-bl-full"></div>
              <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3 relative z-10">
                <Landmark className="text-[#18452E] w-5 h-5" />
                <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Payment Destination Center</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs relative z-10">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="block text-[9px] font-mono text-stone-400 uppercase font-bold">Receives Rent</span>
                  <strong className="text-#132A1D">{landlordDetails.name}</strong>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <span className="block text-[9px] font-mono text-stone-400 uppercase font-bold">Receives Service Charge</span>
                  <strong className="text-#132A1D">{pmcDetails.active ? pmcDetails.name : landlordDetails.name}</strong>
                </div>
              </div>

              <div className="space-y-3 text-xs relative z-10 pt-2">
                <div className="bg-[#18452E]/5 p-3.5 rounded-xl border border-stone-150 relative">
                  <ShieldCheck className="absolute top-3.5 right-3.5 w-4 h-4 text-emerald-600" />
                  <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">VERIFIED BANK ACCOUNT</span>
                  <span className="block font-bold mt-0.5 font-display text-emerald-950 text-sm">{landlordDetails.bank}</span>
                </div>

                <div className="bg-[#18452E]/5 p-3.5 rounded-xl border border-stone-150">
                  <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">ACCOUNT NUMBER</span>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="block font-mono font-black text-emerald-950 text-sm tracking-widest">{landlordDetails.accountNumber}</span>
                    <span 
                      onClick={() => triggerSuccess('Account number copied to clipboard.')}
                      className="text-[9px] uppercase font-mono text-emerald-700 bg-emerald-100 rounded px-2 py-0.5 font-bold cursor-pointer hover:bg-emerald-200 transition"
                    >
                      Copy
                    </span>
                  </div>
                </div>

                <div className="bg-[#18452E]/5 p-3.5 rounded-xl border border-stone-150 relative">
                  <ShieldCheck className="absolute top-3.5 right-3.5 w-4 h-4 text-emerald-600" />
                  <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">BENEFICIARY ACCOUNT NAME</span>
                  <span className="block font-bold text-[#18452E] mt-0.5 text-xs">{landlordDetails.beneficiaryName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RECENTLY VIEWED & ANNOUNCEMENTS */}
          <div className="space-y-6 pt-4">
            <div>
              <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3 mb-4">
                <Clock className="text-stone-400 w-4 h-4" />
                <h3 className="font-display font-black text-#6B7280 uppercase text-xs tracking-wider">Recently Viewed</h3>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-2 snap-x">
                {recentlyViewed.length > 0 ? recentlyViewed.map((item, idx) => (
                  <div key={idx} className="shrink-0 w-48 p-4 bg-white border border-stone-200 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-stone-400 transition snap-start">
                    <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center mb-2">
                       <Activity className="w-4 h-4 text-#6B7280" />
                    </div>
                    <span className="font-bold text-xs text-#132A1D line-clamp-1">{item.name}</span>
                    <span className="text-[9px] font-mono text-stone-400 mt-1 uppercase">{item.type}</span>
                  </div>
                )) : (
                  <div className="w-full p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center text-xs text-#6B7280">No recently viewed items.</div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3 mb-4">
                <Bell className="text-[#18452E] w-4 h-4" />
                <h3 className="font-display font-black text-[#18452E] uppercase text-xs tracking-wider">Platform Announcements</h3>
              </div>
              <div className="space-y-3">
                {announcements.map((ann, idx) => (
                  <div key={idx} className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
                    <div>
                      <h4 className="font-bold text-#132A1D text-sm">{ann.title}</h4>
                      <p className="text-#6B7280 text-xs mt-1 leading-relaxed">{ann.body}</p>
                      <span className="text-[10px] font-mono text-stone-400 mt-2 block">{ann.date}</span>
                    </div>
                    <button onClick={() => setAnnouncements(announcements.filter(a => a.id !== ann.id))} className="shrink-0 px-3 py-1.5 bg-white border border-stone-200 text-#6B7280 rounded-lg text-[9px] font-bold uppercase hover:bg-stone-50 transition">Dismiss</button>
                  </div>
                ))}
                {announcements.length === 0 && <div className="text-xs text-#6B7280 font-mono">No new announcements.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Payments' && (
        <div className="space-y-6">
          {/* TENANT RENT STATUS */}
          <div className="bg-stone-50 border border-stone-200 rounded-[var(--radius-large)] p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-center text-xs">
            <div className="lg:col-span-2">
              <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">Tenant Rent Status</span>
              <h3 className="font-display font-extrabold text-[#18452E] text-sm md:text-base mt-1">
                {collectionTenant ? collectionTenant.propertyName : tenantMatch.propertyName}
              </h3>
              <span className="text-stone-400 block font-light mt-0.5">
                Annual Rent: <strong className="text-#132A1D">₦{collectionTenant ? collectionTenant.rentAmount.toLocaleString() : tenantMatch.rentAmount.toLocaleString()}</strong>
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-stone-400 block">Amount Paid</span>
              <span className="text-lg font-display font-black text-[#18452E] mt-1 block">
                ₦{collectionTenant ? collectionTenant.rentPaid.toLocaleString() : tenantMatch.rentAmount.toLocaleString()}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-stone-400 block">Outstanding Balance</span>
              <span className="text-lg font-display font-black text-rose-600 mt-1 block">
                ₦{collectionTenant ? (collectionTenant.rentAmount - collectionTenant.rentPaid).toLocaleString() : '0'}
              </span>
            </div>

            <div className="space-y-1.5 lg:border-l pl-0 lg:pl-6">
              <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">Next Renewal Date</span>
              <div className="font-display font-black text-[#18452E] text-sm">
                {collectionTenant ? collectionTenant.rentDueDate : (tenantMatch.dueDate === '-' ? 'No target set' : tenantMatch.dueDate)}
              </div>
              <span className="text-[9px] font-bold text-rose-600 font-mono block uppercase">
                {collectionTenant && (collectionTenant.rentAmount - collectionTenant.rentPaid) > 0 ? `${collectionTenant.overdueDays} Days Overdue` : `${daysRemaining} Days Until Due`}
              </span>
            </div>
          </div>

          {/* MOVE OUT TRIGGER / ACTION BANNER */}
          {isWithin90Days && (
            <div className="mt-3">
              {collectionTenant?.renewalIntention === 'vacating' ? (
                <div className="bg-amber-50 border border-amber-300 px-5 py-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fade-in text-amber-900">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-amber-800">Move-Out Process Started</span>
                  </div>
                  <p className="text-stone-650 text-xs">
                    Notice period ends on <strong>{collectionTenant.legalEndDate}</strong>. Contact Unity Homes if you have questions.
                  </p>
                </div>
              ) : (
                /* Only show standalone button if there is NO outstanding rent. If there is outstanding rent, we integrate it into the 3 options on the card */
                !(collectionTenant && (collectionTenant.rentAmount - collectionTenant.rentPaid) > 0) && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleTriggerMoveOutFlow}
                      className="px-4 py-2 border border-amber-500 hover:bg-amber-50 text-amber-700 hover:text-amber-800 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      I Want to Move Out
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* RESPECTFUL OUTSTANDING RENT CARD */}
          {collectionTenant && (collectionTenant.rentAmount - collectionTenant.rentPaid) > 0 && (
            <div className="bg-rose-50/50 border border-rose-200 p-6 rounded-[var(--radius-large)] space-y-4 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <span className="font-display font-extrabold text-rose-700 uppercase text-xs tracking-wider block">
                    {collectionTenant.rentStatus === 'Payment Commitment Not Met' ? 'Payment Commitment Not Met' : 'You Have Outstanding Rent'}
                  </span>
                  <p className="text-stone-650 text-xs">
                    Outstanding Rent: <strong className="text-rose-650 text-sm font-extrabold">₦{(collectionTenant.rentAmount - collectionTenant.rentPaid).toLocaleString()}</strong> | Due Date: <strong>{collectionTenant.rentDueDate || 'N/A'}</strong>
                  </p>
                </div>

                {/* If promise is active, show promise active badge on the right, regardless of 90 days expiry */}
                {activePromise && (
                  <div className="flex items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs w-full md:w-auto">
                    <span className="text-emerald-800 font-medium">
                      <strong>Promise Active:</strong> Will pay <strong>₦{activePromise.promisedAmount.toLocaleString()}</strong> on <strong>{activePromise.expectedPaymentDate}</strong>
                    </span>
                    {showCancelPromiseConfirmId === activePromise.id ? (
                      <div className="flex items-center gap-1.5 border-l border-emerald-200 pl-3">
                        <span className="text-[10px] text-#6B7280">Withdraw?</span>
                        <button
                          onClick={() => handleCancelPromise(activePromise.id)}
                          className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setShowCancelPromiseConfirmId(null)}
                          className="text-[10px] text-#6B7280 font-bold hover:underline cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCancelPromiseConfirm(activePromise.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline transition cursor-pointer"
                      >
                        Cancel Promise
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {/* If no promise is active, show the proper option buttons */}
              {!activePromise && (
                <div className="pt-2 border-t border-rose-100 flex flex-wrap gap-3 w-full justify-start items-center">
                  <button 
                    onClick={() => handleTenantPayNow('Rent', collectionTenant.rentAmount - collectionTenant.rentPaid)}
                    className="px-5 py-2.5 bg-[#18452E] hover:bg-[#18452E] text-white font-bold rounded-xl text-xs uppercase transition tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    Pay Now
                  </button>
                  <button 
                    onClick={() => openPromiseModal('Rent', collectionTenant.rentAmount - collectionTenant.rentPaid)}
                    className="px-5 py-2.5 border border-[#18452E] text-[#18452E] hover:bg-emerald-50/50 font-bold rounded-xl text-xs uppercase transition tracking-wider cursor-pointer"
                  >
                    Promise to Pay
                  </button>
                  {isWithin90Days && collectionTenant.renewalIntention !== 'vacating' && (
                    <button
                      onClick={handleTriggerMoveOutFlow}
                      className="px-5 py-2.5 border border-amber-500 hover:bg-amber-50 text-amber-700 hover:text-amber-800 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      I Want to Move Out
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PAYMENT TIMELINE */}
            <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-6">
              <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3">
                <Clock className="text-[#18452E] w-5 h-5" />
                <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Payment Timeline</h3>
              </div>
              
              <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before: before:from-emerald-500 before:via-stone-200 before:to-stone-200">
                {/* STAGE 1: RECEIPT UPLOADED */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-emerald-500 text-stone-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-6 md:left-1/2">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <div className="w-full md:w-[calc(50%-2rem)] bg-emerald-50 p-3 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-emerald-800 text-xs">Receipt Uploaded</span>
                      <span className="text-[9px] text-emerald-600 font-mono">12 Apr 2026</span>
                    </div>
                    <p className="text-[10px] text-emerald-700">Payment receipt attached successfully.</p>
                  </div>
                </div>

                {/* STAGE 2: BANK REFERENCE (BETWEEN RECEIPT UPLOADED AND VERIFIED) */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-emerald-500 text-stone-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-6 md:left-1/2">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <div className="w-full md:w-[calc(50%-2rem)] bg-emerald-50 p-3 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-emerald-800 text-xs">Bank Reference</span>
                      <span className="text-[9px] text-emerald-600 font-mono">12 Apr 2026</span>
                    </div>
                    <p className="text-[10px] font-mono text-emerald-800 font-bold">GTB/12345/RENT</p>
                  </div>
                </div>

                {/* STAGE 3: VERIFIED */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-emerald-500 text-stone-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-6 md:left-1/2">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <div className="w-full md:w-[calc(50%-2rem)] bg-emerald-50 p-3 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-emerald-800 text-xs">Verified</span>
                      <span className="text-[9px] text-emerald-600 font-mono">13 Apr 2026</span>
                    </div>
                    {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
                    <p className="text-[10px] text-emerald-700">Payment confirmed in landlord ledger.</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-white bg-stone-200 text-stone-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-6 md:left-1/2">
                    <Clock className="w-3 h-3" />
                  </div>
                  <div className="w-full md:w-[calc(50%-2rem)] bg-stone-50 p-3 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-#6B7280 text-xs">Next Payment Due</span>
                      <span className="text-[9px] text-stone-400 font-mono">12 Apr 2027</span>
                    </div>
                    <p className="text-[10px] text-#6B7280">Awaiting next renewal cycle.</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUploadReceipt} className="space-y-4 pt-4 border-t border-stone-200">
                {receiptUploadCharge && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <span className="text-emerald-800 font-bold uppercase tracking-wider text-[10px] block">Settling Charge:</span>
                      <strong className="text-emerald-900 text-sm block">{receiptUploadCharge.name}</strong>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                      <span className="text-emerald-800 font-bold uppercase tracking-wider text-[10px] block">Amount:</span>
                      <strong className="text-emerald-900 text-sm block font-mono">₦{receiptUploadCharge.amount.toLocaleString()}</strong>
                    </div>
                  </div>
                )}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-#6B7280 font-bold uppercase tracking-wider text-[10px]">Bank Transfer Reference:</span>
                    <input 
                      type="text" 
                      placeholder="e.g. GTB/12345/RENT" 
                      value={receiptFile}
                      onChange={(e) => setReceiptFile(e.target.value)}
                      className="p-2 border border-stone-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-[#18452E] outline-none font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-#6B7280 mt-1">
                    Enter the transaction reference or narration from your bank transfer. For example GTB/12345/RENT or TRF-2026-07-001. This field is optional.
                  </p>
                </div>
                <button type="submit" className="w-full py-3 bg-[#18452E] hover:bg-[#18452E] text-white font-bold rounded-xl tracking-wider uppercase cursor-pointer text-xs">
                  {receiptUploadCharge ? "Submit Service Charge Receipt" : "Submit Rent Payment"}
                </button>
              </form>
            </div>

            {/* RENT SAVINGS TRACKER */}
            <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2.5">
                  <BarChart2 className="text-[#18452E] w-5 h-5" />
                  <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Rent Savings Tracker</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#C9A84C] bg-[#C9A84C]/5 px-2.5 py-1 rounded border border-[#C9A84C]/20 uppercase">
                  {percentSaved}% Achievement
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Savings Goal</label>
                  <input 
                    type="number" 
                    value={targetRent} 
                    onChange={(e) => setTargetRent(Number(e.target.value))} 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#18452E] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Current Savings</label>
                  <input 
                    type="number" 
                    value={savedSoFar} 
                    onChange={(e) => setSavedSoFar(Number(e.target.value))} 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#18452E] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl">
                  <span className="text-[9px] font-mono uppercase text-teal-800 block font-bold">Amount Remaining</span>
                  <span className="text-lg font-display font-black text-teal-950 block mt-1">₦{stillNeeded.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-2xl">
                  <span className="text-[9px] font-mono uppercase text-teal-800 block font-bold">Days Remaining</span>
                  <span className="text-lg font-display font-black text-teal-950 block mt-1">{daysRemaining} Days</span>
                </div>
                <div className="p-4 bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-2xl">
                  <span className="text-[9px] font-mono uppercase text-[#C9A84C] block font-bold">Weekly Target</span>
                  <span className="text-base font-display font-black text-[#C9A84C] block mt-1">₦{suggestedWeeklySaving.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-2xl">
                  <span className="text-[9px] font-mono uppercase text-[#C9A84C] block font-bold">Monthly Target</span>
                  <span className="text-base font-display font-black text-[#C9A84C] block mt-1">₦{suggestedMonthlySaving.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="w-full bg-stone-50 h-3 rounded-full overflow-hidden border border-stone-200/50">
                  <div 
                    className="bg-[#18452E] h-full rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
                    style={{ width: `${percentSaved}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT HISTORY */}
          <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <Activity className="text-[#18452E] w-5 h-5" />
                <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Payment History</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {savedFilters.map((f, i) => (
                  <span key={i} className="px-2 py-1 bg-stone-50 border border-stone-200 text-#6B7280 rounded-lg text-[9px] font-bold uppercase cursor-pointer hover:bg-stone-200">{f.name}</span>
                ))}
                <button onClick={() => setShowFilterNamePrompt({tab: "Payments", filterData: {}})} className="px-2 py-1 bg-stone-200 text-#132A1D rounded-lg text-[9px] font-bold uppercase cursor-pointer hover:bg-stone-300">+ Save Filter</button>
                <button onClick={() => triggerSuccess("Exporting Payment History as CSV...")} className="px-3 py-1.5 border border-stone-200 bg-white hover:bg-stone-50 text-#6B7280 rounded-lg text-[10px] font-bold uppercase transition flex items-center space-x-1">
                  <Download className="w-3 h-3" /><span>CSV</span>
                </button>
                <button onClick={() => triggerSuccess("Exporting Payment History as PDF...")} className="px-3 py-1.5 border border-stone-200 bg-white hover:bg-stone-50 text-#6B7280 rounded-lg text-[10px] font-bold uppercase transition flex items-center space-x-1">
                  <Download className="w-3 h-3" /><span>PDF</span>
                </button>
              </div>
            </div>
            <div className="space-y-3 font-mono text-[10px]">
              <div className="p-3 bg-stone-50 border-l-2 border-[#18452E] rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">RENT_PAYMENT_VERIFIED</strong>
                  <span className="text-stone-400">2026-04-13 16:45:00 UTC</span>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase font-bold tracking-wider">Receipt Uploaded</span>
                  <span className="text-stone-400">➔</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase font-bold tracking-wider">Verification Started</span>
                  <span className="text-stone-400">➔</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase font-bold tracking-wider">Verification Completed</span>
                  <span className="text-stone-400">➔</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-700 text-white uppercase font-bold tracking-wider">Confirmed</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* ACTIVE PROMISES TO PAY */}
          {promises.length > 0 && (
            <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-4 animate-fade-in">
              <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3">
                <Clock className="text-amber-500 w-5 h-5" />
                <h3 className="font-display font-black text-[#18452E] uppercase text-sm">My Payment Commitments</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promises.map((p) => {
                  let statusBg = 'bg-stone-50 text-#132A1D border-stone-200';
                  if (p.status === 'Fulfilled') statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  else if (p.status === 'Broken Promise' || p.status === 'Overdue') statusBg = 'bg-rose-50 text-rose-800 border-rose-200';
                  else if (p.status === 'Upcoming' || p.status === 'Due Today') statusBg = 'bg-amber-50 text-amber-800 border-amber-200';

                  return (
                    <div key={p.id} className="p-4 bg-stone-50 border border-stone-150 rounded-2xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-mono bg-stone-200 px-2.5 py-0.5 rounded font-bold text-#132A1D">
                            {p.paymentType} Promise
                          </span>
                          <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${statusBg}`}>
                            {p.status}
                          </span>
                        </div>
                        <h4 className="font-display font-extrabold text-[#18452E] text-sm mt-2">₦{p.promisedAmount.toLocaleString()}</h4>
                        <div className="text-[10px] text-#6B7280 mt-1 space-y-1">
                          <p>Expected On: <strong className="text-#132A1D font-mono">{p.expectedPaymentDate}</strong></p>
                          <p>Reason: <strong className="text-#132A1D">{p.reasonForDelay}</strong></p>
                          {p.note && <p className="italic text-stone-400">"{p.note}"</p>}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200/50 flex justify-between items-center text-[9px] font-mono text-stone-400">
                        <span>Created {new Date(p.createdAt).toLocaleDateString()}</span>
                        {p.status === 'Upcoming' && (
                          <button 
                            onClick={() => handleTenantPayNow(p.paymentType, p.promisedAmount)}
                            className="px-2 py-1 bg-[#18452E] text-white hover:bg-[#18452E] rounded font-bold uppercase transition text-[8px] tracking-wider cursor-pointer"
                          >
                            Pay Dues
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
             <div>
               <h2 className="font-display font-black text-[#18452E] uppercase text-lg">Charges and Levies</h2>
               <p className="text-xs text-#6B7280">Real-time status of all your service charges.</p>
             </div>
             <div className="flex gap-2">
               <button onClick={() => triggerSuccess("Exporting Service Charge Ledger as CSV...")} className="px-3 py-1.5 border border-stone-200 bg-white hover:bg-stone-50 text-#6B7280 rounded-lg text-[10px] font-bold uppercase transition flex items-center space-x-1">
                 <Download className="w-3 h-3" /><span>CSV</span>
               </button>
               <button onClick={() => triggerSuccess("Exporting Service Charge Ledger as PDF...")} className="px-3 py-1.5 border border-stone-200 bg-white hover:bg-stone-50 text-#6B7280 rounded-lg text-[10px] font-bold uppercase transition flex items-center space-x-1">
                 <Download className="w-3 h-3" /><span>PDF</span>
               </button>
             </div>
          </div>

          <div className="space-y-4">
            {serviceCharges.map((sc, idx) => (
              <div key={idx} className={`bg-white border p-5 rounded-[var(--radius-large)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                sc.status === "Unpaid" ? "border-l-4 border-l-red-500 border-stone-200" : 
                sc.status === "Pending Verification" ? "border-l-4 border-l-amber-500 border-stone-200" :
                "border-l-4 border-l-emerald-500 border-stone-200"
              }`}>
                <div>
                  <h4 className="font-display font-black text-#132A1D text-sm">{sc.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <strong className="text-[#18452E] font-mono text-sm">₦{sc.amount.toLocaleString()}</strong>
                    <span className="text-[10px] text-stone-400 font-mono">{sc.frequency}</span>
                  </div>
                  <span className="block text-[10px] text-#6B7280 mt-2 font-mono">Due: {sc.dueDate}</span>
                </div>
                <div className="flex flex-col items-end shrink-0 space-y-2">
                  {sc.status === "Unpaid" && (
                     <div className="flex items-center space-x-3">
                       <span className="text-red-600 font-black font-display uppercase tracking-wider">UNPAID</span>
                       <strong className="text-red-600 font-mono">₦{sc.amount.toLocaleString()}</strong>
                     </div>
                  )}
                  {sc.status === "Unpaid" && (
                     <button 
                       onClick={() => { setReceiptUploadCharge({name: sc.name, amount: sc.amount}); setActiveTab("Payments"); addToRecentlyViewed({ id: sc.id, type: "Service Charge", name: sc.name, time: "Just now", icon: DollarSign }); }}
                       className="px-5 py-2 bg-[#18452E] hover:bg-[#18452E] text-white rounded-xl text-xs font-bold uppercase transition shadow-md"
                     >Pay Now</button>
                  )}
                  {sc.status === "Pending Verification" && (
                     <div className="flex flex-col items-end">
                       <span className="text-amber-500 font-black font-display uppercase tracking-wider">PENDING VERIFICATION</span>
                       <span className="text-stone-400 text-[10px] font-mono mt-1">Receipt Uploaded on {sc.verificationDate}</span>
                     </div>
                  )}
                  {sc.status === "Paid" && (
                     <div className="flex items-center space-x-3">
                       <span className="text-emerald-600 font-black font-display uppercase tracking-wider">PAID</span>
                       <span className="text-emerald-700 text-xs font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Paid {sc.verificationDate}</span>
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* SUMMARY LINE */}
          {serviceCharges.some(sc => sc.status !== "Paid") ? (
             <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex justify-between items-center">
               <span className="text-amber-800 text-xs font-bold uppercase tracking-wider">Total Outstanding</span>
               <strong className="text-amber-900 font-mono text-base">₦{serviceCharges.filter(sc => sc.status !== "Paid").reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} across {serviceCharges.filter(sc => sc.status !== "Paid").length} charges</strong>
             </div>
          ) : (
             <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center space-x-3 justify-center text-emerald-800">
               <CheckCircle className="w-5 h-5" />
               <span className="font-bold text-sm uppercase tracking-wider">All Charges Cleared for This Period</span>
             </div>
          )}
        </div>
      )}
      {activeTab === 'Support' && (
        <div className="space-y-6">
          {/* UNITY HOMES PLATFORM SUPPORT CENTER */}
          <SupportCenter session={session} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MAINTENANCE REQUEST CENTER */}
          <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3">
              <Wrench className="text-[#18452E] w-5 h-5" />
              <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Maintenance Request Center</h3>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              triggerSuccess('Maintenance request submitted successfully. Staff will be assigned shortly.');
            }} className="space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Issue Category</label>
                  <select required className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-[#18452E] font-mono">
                    <option value="">Select category</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="AC">AC / HVAC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Description</label>
                  <textarea required rows={3} className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-[#18452E]" placeholder="Describe the maintenance issue..."></textarea>
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Upload Photos</label>
                  <input type="file" multiple accept="image/*" className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-[#18452E] font-mono" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-[#18452E] hover:bg-[#18452E] text-white font-bold rounded-xl tracking-wider uppercase cursor-pointer text-xs">
                Report Issue
              </button>
            </form>

            <div className="pt-4 border-t border-stone-200 space-y-3">
              <h4 className="font-bold text-xs uppercase text-#6B7280 tracking-wider">Recent Requests</h4>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-#132A1D">Leaking Sink</strong>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800">Assigned</span>
                </div>
                <div className="text-#6B7280 font-mono text-[10px]">Staff: John Doe (Plumber)</div>
                <div className="text-#6B7280 font-mono text-[10px]">Timeline: Logged 23 Jun &bull; Scheduled 26 Jun</div>
              </div>
            </div>
          </div>

          {/* TENANT COMPLAINT CENTER */}
          <TenantComplaintCenterSection session={session} landlordUnits={landlordUnits} triggerSuccess={triggerSuccess} />
          </div>
        </div>
      )}

      {activeTab === 'Vault' && (
        <div className="space-y-6">
          {/* DOCUMENT VAULT */}
          <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3">
              <FileLock className="text-[#18452E] w-5 h-5" />
              <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Tenant Document Vault</h3>
            </div>

            <div className="flex justify-between items-center bg-stone-50 p-2 rounded-xl mb-4">
              <div className="flex gap-2">
                {savedFilters.map((f, i) => (
                  <span key={i} className="px-2 py-1 bg-white border border-stone-200 text-#6B7280 rounded-lg text-[9px] font-bold uppercase cursor-pointer hover:bg-stone-50">{f.name}</span>
                ))}
              </div>
              <button onClick={() => setShowFilterNamePrompt({tab: "Vault", filterData: {}})} className="px-2 py-1 bg-stone-200 text-#132A1D rounded-lg text-[9px] font-bold uppercase cursor-pointer hover:bg-stone-300">+ Save Filter</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-start space-x-3 cursor-pointer hover:border-[#0E2F1F] transition group">
                <FileText className="w-5 h-5 text-[#18452E] shrink-0" />
                <div>
                  <span className="font-bold block text-[#18452E] text-xs">Lease Agreement</span>
                  <span className="text-[10px] text-stone-400 block mb-2 font-mono">Signed: 12 Apr 2026</span>
                  <span className="text-[#18452E] group-hover:underline font-semibold text-[9px] uppercase tracking-wider">Download PDF</span>
                </div>
              </div>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-start space-x-3 cursor-pointer hover:border-[#0E2F1F] transition group">
                <FileText className="w-5 h-5 text-[#18452E] shrink-0" />
                <div>
                  <span className="font-bold block text-[#18452E] text-xs">Rent Receipt</span>
                  <span className="text-[10px] text-stone-400 block mb-2 font-mono">Period: 2026 - 2027</span>
                  <span className="text-[#18452E] group-hover:underline font-semibold text-[9px] uppercase tracking-wider">Download PDF</span>
                </div>
              </div>
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-start space-x-3 cursor-pointer hover:border-[#0E2F1F] transition group">
                <FileText className="w-5 h-5 text-[#18452E] shrink-0" />
                <div>
                  <span className="font-bold block text-[#18452E] text-xs">Move-In Inspection Report</span>
                  <span className="text-[10px] text-stone-400 block mb-2 font-mono">Date: 14 Apr 2026</span>
                  <span className="text-[#18452E] group-hover:underline font-semibold text-[9px] uppercase tracking-wider">Download PDF</span>
                </div>
              </div>
            </div>
          </div>

          {/* TRANSPARENCY LEDGER */}
          <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-6">
            <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3">
              <Activity className="text-[#18452E] w-5 h-5" />
              <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Transparency Ledger</h3>
            </div>
            
            <p className="text-xs text-#6B7280 font-light mt-0.5">Permanent, immutable history of all your interactions.</p>

            <div className="space-y-3 font-mono text-[10px]">
              <div className="p-3 bg-stone-50 border-l-2 border-[#0E2F1F] rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">MAINTENANCE_REQUEST_LOGGED</strong>
                  <span className="text-stone-400">2026-06-23 14:32:01 UTC</span>
                </div>
                <p className="text-#6B7280">Tenant logged issue: Leaking Sink. Category: Plumbing.</p>
              </div>
              <div className="p-3 bg-stone-50 border-l-2 border-emerald-600 rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">SERVICE_CHARGE_CLEARED</strong>
                  <span className="text-stone-400">2026-06-01 10:15:44 UTC</span>
                </div>
                <p className="text-#6B7280">Security Levy ₦25,000 cleared successfully.</p>
              </div>
              <div className="p-3 bg-stone-50 border-l-2 border-[#C9A84C] rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">DOCUMENT_UPLOAD_VERIFIED</strong>
                  <span className="text-stone-400">2026-04-14 09:22:11 UTC</span>
                </div>
                <p className="text-#6B7280">Move-In Inspection Report confirmed and digitally signed by both parties.</p>
              </div>
              <div className="p-3 bg-stone-50 border-l-2 border-[#18452E] rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">RENT_PAYMENT_VERIFIED</strong>
                  <span className="text-stone-400">2026-04-13 16:45:00 UTC</span>
                </div>
                <p className="text-#6B7280">Annual rent ₦3,500,000 verified by landlord. Next due 2027-04-12.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Profile' && (
        <div className="space-y-6">
          {/* Tenancy Record Summary */}
          <div className="bg-[#18452E] text-white p-6 rounded-[var(--radius-large)] space-y-4 shadow-sm border border-stone-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C] font-black">
                  LIFETIME TENANCY SYSTEM PORTAL
                </span>
                <h3 className="font-display font-black text-lg uppercase tracking-wide mt-1">
                  {session.name}&apos;s Permanent Medical Record
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/30 font-bold flex items-center space-x-1">
                <Lock className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Unalterable</span>
              </span>
            </div>

            {/* Lifetime Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-emerald-800/60 text-center">
              <div className="bg-emerald-950/20 p-3 rounded-2xl border border-emerald-800/30">
                <span className="text-[9px] font-mono text-emerald-300 uppercase block tracking-wider">Lifetime Tenure</span>
                <strong className="block text-base font-black font-display text-white mt-1">2 Years, 3 Mos</strong>
                <span className="text-[9px] text-emerald-400 font-light mt-0.5 block">Platform-wide</span>
              </div>
              <div className="bg-emerald-950/20 p-3 rounded-2xl border border-emerald-800/30">
                <span className="text-[9px] font-mono text-emerald-300 uppercase block tracking-wider">Tenanted Properties</span>
                <strong className="block text-base font-black font-display text-white mt-1">2 Properties</strong>
                <span className="text-[9px] text-emerald-400 font-light mt-0.5 block">Distinct assets</span>
              </div>
              <div className="bg-emerald-950/20 p-3 rounded-2xl border border-emerald-800/30">
                <span className="text-[9px] font-mono text-emerald-300 uppercase block tracking-wider">Total Rent Settled</span>
                <strong className="block text-base font-black font-mono text-white mt-1">₦7,000,000</strong>
                <span className="text-[9px] text-emerald-400 font-light mt-0.5 block">100% direct cleared</span>
              </div>
              <div className="bg-emerald-950/20 p-3 rounded-2xl border border-emerald-800/30">
                <span className="text-[9px] font-mono text-emerald-300 uppercase block tracking-wider">Service Charge Bills</span>
                <strong className="block text-base font-black font-display text-white mt-1">18 Bills</strong>
                <span className="text-[9px] text-emerald-400 font-light mt-0.5 block">Across all tenures</span>
              </div>
            </div>
            
            <p className="text-[10px] text-emerald-300/80 italic font-light leading-relaxed text-center">
              Disclaimer: The figures displayed above represent your verified lifetime statistics recorded under the Unity Homes Tenancy Charter.
            </p>
          </div>

          {/* Sub-tab selection */}
          <div className="flex border-b border-stone-200 gap-6 text-xs font-semibold px-2">
            <button
              onClick={() => setProfileTab('info')}
              className={`pb-3 border-b-2 transition-all cursor-pointer ${
                profileTab === 'info'
                  ? 'border-[#18452E] text-[#18452E]'
                  : 'border-transparent text-#6B7280 hover:text-stone-850'
              }`}
            >
              Identity & Completion
            </button>
            <button
              onClick={() => setProfileTab('history')}
              className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                profileTab === 'history'
                  ? 'border-[#18452E] text-[#18452E]'
                  : 'border-transparent text-#6B7280 hover:text-stone-850'
              }`}
              title="This history is permanent and cannot be edited or deleted."
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Audit History</span>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase scale-90">Permanent</span>
            </button>
          </div>

          {profileTab === 'info' ? (
            <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center space-x-2.5">
                  <User className="text-[#18452E] w-5 h-5" />
                  <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Profile Status</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-#6B7280 block mb-1">Profile Completion</span>
                    <span className="text-2xl font-black font-display text-[#18452E]">85%</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#18452E] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 font-bold">Almost Complete</span>
                </div>
                <div className="w-full bg-stone-50 h-3 rounded-full overflow-hidden border border-stone-200/50">
                  <div className="bg-[#18452E] h-full rounded-full transition-all duration-500 shadow-sm" style={{ width: "85%" }}></div>
                </div>
                <div className="space-y-2 mt-4 pt-4 border-t border-stone-200">
                   <div className="flex items-center space-x-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                     <CheckCircle className="w-4 h-4 text-emerald-600" />
                     <span className="text-xs text-#132A1D font-bold">Identity Verified</span>
                   </div>
                   <div className="flex items-center space-x-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                     <CheckCircle className="w-4 h-4 text-emerald-600" />
                     <span className="text-xs text-#132A1D font-bold">Guarantor Added</span>
                   </div>
                   <div className="flex items-center space-x-3 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                     <CheckCircle className="w-4 h-4 text-emerald-600" />
                     <span className="text-xs text-#132A1D font-bold">Work References Uploaded</span>
                   </div>
                   <div className="flex items-center space-x-3 bg-amber-50 p-2.5 rounded-xl border border-amber-200 cursor-pointer hover:bg-amber-100 transition">
                     <div className="w-4 h-4 rounded-full border-2 border-amber-500 shrink-0"></div>
                     <div className="flex justify-between w-full items-center">
                       <span className="text-xs text-amber-900 font-bold">Add Emergency Contact</span>
                       <span className="text-[9px] uppercase font-mono text-amber-700 bg-white px-2 py-0.5 rounded shadow-sm">Action Required</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-4">
              <ImmutableHistory recordId={session.userId || "T1"} recordType="Tenant" />
            </div>
          )}
        </div>
      )}

      {/* PROMISE TO PAY CREATION FORM MODAL */}
      {isPromiseModalOpen && collectionTenant && (
        <div className="fixed inset-0 bg-#132A1D/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-[var(--radius-large)] border border-stone-200 shadow-sm max-w-xl w-full overflow-hidden flex flex-col my-8">
            <div className="p-6 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-widest text-amber-600 font-bold block">Unity Homes Trust &amp; Ledger</span>
                <h3 className="font-display font-black text-[#18452E] text-sm uppercase">Submit Payment Commitment</h3>
              </div>
              <button 
                onClick={() => setIsPromiseModalOpen(false)}
                className="text-stone-400 hover:text-#6B7280 font-bold font-mono text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePromise} className="p-6 space-y-5 text-xs">
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl text-[11px] text-amber-900 leading-relaxed space-y-1">
                <strong className="block text-amber-950 font-bold">⚠️ Notice of Overdue Payment Plan</strong>
                <p>Registering this commitment suspends automated overdue reminders immediately. To keep your payment record in good standing, please complete payment on or before the selected date.</p>
              </div>

              {/* READ ONLY TENANCY DETAILS */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/60">
                <div>
                  <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">Tenant Name</span>
                  <span className="font-bold text-#132A1D block mt-0.5">{collectionTenant.tenantName}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">Property &amp; Unit</span>
                  <span className="font-bold text-#132A1D block mt-0.5">{collectionTenant.propertyName} ({collectionTenant.unitNumber})</span>
                </div>
              </div>

              {/* PAYMENT TYPE SELECTION */}
              <div>
                <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1.5">Payment Type</label>
                <select 
                  required
                  value={selectedPaymentType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setSelectedPaymentType(val);
                    let outstanding = 0;
                    if (val === 'Rent') {
                      outstanding = collectionTenant.rentAmount - collectionTenant.rentPaid;
                    } else if (val === 'Service Charge') {
                      outstanding = serviceCharges.filter(sc => sc.status === 'Unpaid').reduce((sum, sc) => sum + sc.amount, 0) || 60000;
                    } else {
                      const rentOut = collectionTenant.rentAmount - collectionTenant.rentPaid;
                      const scOut = serviceCharges.filter(sc => sc.status === 'Unpaid').reduce((sum, sc) => sum + sc.amount, 0) || 60000;
                      outstanding = rentOut + scOut;
                    }
                    setPromiseOutstandingAmount(outstanding);
                    setPromisedAmount(outstanding);
                  }}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600 font-medium text-#132A1D"
                >
                  <option value="Rent">Outstanding Rent Only</option>
                  <option value="Service Charge">Outstanding Service Charges Only</option>
                  <option value="Both">Both Rent and Service Charges</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1.5">Outstanding Amount</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={`₦${promiseOutstandingAmount.toLocaleString()}`}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-rose-600 outline-none font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1.5">Amount I Will Pay (₦)</label>
                  <input 
                    type="number" 
                    required 
                    min={1}
                    max={promiseOutstandingAmount}
                    value={promisedAmount}
                    onChange={(e) => setPromisedAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600 font-mono font-bold text-#132A1D" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1.5">Expected Payment Date</label>
                  <input 
                    type="date" 
                    required 
                    value={expectedPaymentDate}
                    onChange={(e) => setExpectedPaymentDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600 font-mono font-bold text-#132A1D" 
                  />
                  <span className="text-[10px] text-stone-400 block mt-1">Must be within 60 days from today.</span>
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1.5">Reason for Delay</label>
                  <select 
                    required
                    value={reasonForDelay}
                    onChange={(e) => setReasonForDelay(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600 font-medium text-#132A1D"
                  >
                    <option value="Salary Delay">Salary Delay</option>
                    <option value="Business Cash Flow">Business Cash Flow</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Travel">Travel</option>
                    <option value="Bank Transfer Delay">Bank Transfer Delay</option>
                    <option value="Other">Other (Specify below)</option>
                  </select>
                </div>
              </div>

              {reasonForDelay === 'Other' && (
                <div className="animate-fade-in">
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1.5">Please Specify Reason</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter custom reason for payment delay..."
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600 text-#132A1D font-medium" 
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase">Optional Note</label>
                  <span className="text-[10px] text-stone-400 font-mono">{promiseNote.length}/200 chars</span>
                </div>
                <textarea 
                  rows={2} 
                  maxLength={200}
                  value={promiseNote}
                  onChange={(e) => setPromiseNote(e.target.value)}
                  placeholder="Provide any extra details here (max 200 characters)..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600 text-#132A1D"
                />
              </div>

              {/* MANDATORY CHECKBOX */}
              <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex items-start space-x-3">
                <input 
                  type="checkbox" 
                  id="commitment-checkbox"
                  checked={isCommitmentTicked}
                  onChange={(e) => setIsCommitmentTicked(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500 mt-0.5 cursor-pointer"
                />
                <label htmlFor="commitment-checkbox" className="text-[11px] text-stone-650 font-medium leading-relaxed select-none cursor-pointer">
                  I understand this is a formal commitment to Unity Homes and my Landlord. I commit to making the specified payment of <strong>₦{promisedAmount.toLocaleString()}</strong> on or before <strong>{expectedPaymentDate || 'the selected date'}</strong>.
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsPromiseModalOpen(false)}
                  className="w-1/3 py-3 border border-stone-200 text-#6B7280 hover:bg-stone-50 font-bold rounded-xl tracking-wider uppercase cursor-pointer text-xs transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!isCommitmentTicked}
                  className={`w-2/3 py-3 font-bold rounded-xl tracking-wider uppercase cursor-pointer text-xs flex justify-center items-center gap-1.5 transition ${
                    isCommitmentTicked 
                      ? 'bg-[#18452E] hover:bg-[#18452E] text-white' 
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Promise to Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOVE OUT TWO-STEP CONFIRMATION MODAL */}
      {isMoveOutFlowOpen && collectionTenant && (
        <div className="fixed inset-0 bg-#132A1D/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-[var(--radius-large)] border border-stone-200 shadow-sm max-w-lg w-full overflow-hidden flex flex-col my-8 animate-fade-in">
            <div className="p-6 border-b border-stone-200 bg-stone-50 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-mono tracking-widest text-amber-600 font-bold block">Tenancy Termination System</span>
                <h3 className="font-display font-black text-#132A1D text-sm uppercase">Notice of Intent to Move Out</h3>
              </div>
              <button 
                onClick={() => setIsMoveOutFlowOpen(false)}
                className="text-stone-400 hover:text-#6B7280 font-bold font-mono text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-#132A1D">
              {moveOutStep === 1 ? (
                /* STEP 1: WARNING CARD */
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                      <strong className="text-amber-900 text-xs font-bold uppercase tracking-wider">Crucial Tenancy Warning</strong>
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5 text-stone-650 leading-relaxed text-[11px]">
                      <li>Upon proceeding, formal notice of your intent to vacate will be sent to your Landlord (<strong>{landlordDetails.name}</strong>) and Unity Homes immediately.</li>
                      <li>You remain fully legally responsible for your standard monthly/annual rent payments and utility dues during the entirety of the notice period.</li>
                      <li>Your statutory notice period begins <strong>today (2026-07-20)</strong>. Notice period is <strong>{collectionTenant.tenancyType === 'Monthly' ? '1 Month' : '6 Months'}</strong> as specified by Lagos State tenancy laws.</li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setIsMoveOutFlowOpen(false)}
                      className="px-5 py-2.5 border border-stone-200 text-#6B7280 hover:bg-stone-50 rounded-xl font-bold uppercase transition"
                    >
                      Keep My Tenancy
                    </button>
                    <button
                      onClick={() => setMoveOutStep(2)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold uppercase transition"
                    >
                      I Understand, Proceed
                    </button>
                  </div>
                </div>
              ) : (
                /* STEP 2: STATUTORY FACTS */
                <div className="space-y-4">
                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-3">
                    <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">Termination Parameters</span>
                    
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-stone-400 block">Notice Period Required</span>
                        <strong className="text-#132A1D font-bold block mt-0.5">{collectionTenant.tenancyType === 'Monthly' ? '1 Month' : '6 Months'}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Notice Effective Date</span>
                        <strong className="text-#132A1D font-bold block mt-0.5">Today (2026-07-20)</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Current Lease Expiry</span>
                        <strong className="text-#132A1D font-bold block mt-0.5">{collectionTenant.leaseExpiryDate}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Earliest Legal Vacate Date</span>
                        <strong className="text-emerald-700 font-bold block mt-0.5">{earliestVacateDateStr}</strong>
                      </div>
                    </div>
                  </div>

                  {/* MANDATORY CHECKBOX */}
                  <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl flex items-start space-x-3">
                    <input 
                      type="checkbox" 
                      id="moveout-checkbox"
                      checked={isMoveOutCheckboxTicked}
                      onChange={(e) => setIsMoveOutCheckboxTicked(e.target.checked)}
                      className="w-4 h-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500 mt-0.5 cursor-pointer"
                    />
                    <label htmlFor="moveout-checkbox" className="text-[11px] text-stone-650 font-medium leading-relaxed select-none cursor-pointer">
                      I formally declare my intent to move out. I understand that I am legally committed to vacate the premises on or before <strong>{earliestVacateDateStr}</strong>, and must ensure all outstanding debts are paid in full.
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setMoveOutStep(1)}
                      className="px-5 py-2.5 border border-stone-200 text-#6B7280 hover:bg-stone-50 rounded-xl font-bold uppercase transition"
                    >
                      Back
                    </button>
                    <button
                      disabled={!isMoveOutCheckboxTicked}
                      onClick={handleConfirmMoveOut}
                      className={`px-5 py-2.5 font-bold uppercase rounded-xl transition ${
                        isMoveOutCheckboxTicked
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      Yes, I Want to Move Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AUTOMATIC PAYMENT RECEIPT MODAL */}
      {showTenantReceipt && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] border-2 border-[#0E2F1F] shadow-sm max-w-md w-full overflow-hidden flex flex-col relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none opacity-[0.08]">
              <div className="border-4 border-[#18452E] text-[#18452E] font-display font-black text-4xl p-4 uppercase tracking-widest rounded-[var(--radius-large)]">
                CLEARED
              </div>
            </div>

            <div className="p-6  text-white text-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C] font-extrabold block mb-1">Unity Homes Ledger System</span>
              <h3 className="font-display font-black text-sm uppercase tracking-wider">Clearance Certificate</h3>
              <p className="text-[9px] text-stone-200 font-mono mt-1">Ref: {showTenantReceipt.ref}</p>
            </div>

            <div className="p-6 space-y-4 text-xs text-#132A1D bg-stone-50/50">
              <div className="space-y-2 border-b border-stone-200/60 pb-3">
                <div className="flex justify-between">
                  <span className="text-stone-400">Tenant Name</span>
                  <strong className="text-#132A1D">{showTenantReceipt.tenantName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Property</span>
                  <strong className="text-#132A1D">{showTenantReceipt.propertyName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Unit Number</span>
                  <strong className="text-#132A1D">Unit {showTenantReceipt.unitNumber}</strong>
                </div>
              </div>

              <div className="space-y-2 border-b border-stone-200/60 pb-3">
                <div className="flex justify-between">
                  <span className="text-stone-400">Payment Category</span>
                  <strong className="text-#132A1D uppercase font-mono">{showTenantReceipt.paymentType}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Amount Settled</span>
                  <strong className="text-[#18452E] text-sm font-mono font-extrabold">₦{showTenantReceipt.amount.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Status</span>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800">100% Cleared</span>
                </div>
              </div>

              <div className="flex justify-between text-[10px]">
                <span className="text-stone-400 font-mono">Date Generated</span>
                <span className="font-mono text-#6B7280">{showTenantReceipt.date} 12:00 UTC</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-[10px] text-emerald-800 leading-relaxed text-center font-medium">
                🛡️ This certificate acts as immediate digital verification of ledger reconciliation. Overdue notices have been cleared on all admin interfaces.
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setShowTenantReceipt(null)}
                  className="w-full py-3 bg-[#18452E] hover:bg-[#18452E] text-white font-bold rounded-xl tracking-wider uppercase cursor-pointer text-xs transition"
                >
                  Acknowledge and Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER DISCOVERY CREED */}
      <p className="text-center text-[10px] text-[#C9A84C] font-mono uppercase font-bold tracking-wider pt-8">
        Unity Homes &bull; Secure Rent Ledger Planning Tool &bull; Don&apos;t Buy Wahala
      </p>

      {showNotifications && (
        <NotificationFeed onClose={() => setShowNotifications(false)} role="Tenant" targetId={collectionTenant?.tenantCode} />
      )}

      <MobileBottomNav 
        role="Tenant"
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        setShowNotifications={setShowNotifications}
        hasUnread={hasUnreadNotifications}
      />
    </div>
  );
}

function TenantComplaintCenterSection({
  session,
  landlordUnits,
  triggerSuccess
}: {
  session: UserSession;
  landlordUnits: LandlordUnit[];
  triggerSuccess: (msg: string) => void;
}) {
  const [category, setCategory] = useState<ComplaintCategory>('Property Maintenance or Repairs');
  const [typeOfWasteIssue, setTypeOfWasteIssue] = useState<string>('Waste not collected on scheduled day');
  const [daysSinceLastCollection, setDaysSinceLastCollection] = useState<number>(3);
  const [usualCollectionDay, setUsualCollectionDay] = useState<string>('Tuesday');
  const [details, setDetails] = useState<string>('');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState<string>('');
  const [noticeMessage, setNoticeMessage] = useState<string>('');

  // Load complaints
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const raw = localStorage.getItem('uh_complaints_v1');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [confirmingEscalationComplaint, setConfirmingEscalationComplaint] = useState<Complaint | null>(null);

  React.useEffect(() => {
    const syncComplaints = () => {
      try {
        const raw = localStorage.getItem('uh_complaints_v1');
        if (raw) setComplaints(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', syncComplaints);
    return () => window.removeEventListener('storage', syncComplaints);
  }, []);

  // Find tenant unit
  const tenantUnit = landlordUnits.find(u => 
    u.tenantName?.toLowerCase() === session.name?.toLowerCase() ||
    u.tenantEmail?.toLowerCase() === session.email?.toLowerCase()
  ) || landlordUnits[0];

  const handleAddPhoto = () => {
    if (photoInput && evidencePhotos.length < 3) {
      setEvidencePhotos([...evidencePhotos, photoInput]);
      setPhotoInput('');
    } else if (!photoInput) {
      const samples = [
        'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600',
        'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600'
      ];
      setEvidencePhotos([...evidencePhotos, samples[evidencePhotos.length % samples.length]]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let calculatedUrgency: 'Normal' | 'High' | 'Urgent' = 'Normal';
    if (category === 'Waste and Refuse Collection') {
      if (daysSinceLastCollection >= 14) {
        calculatedUrgency = 'Urgent';
      } else if (daysSinceLastCollection >= 7) {
        calculatedUrgency = 'High';
      }
    }

    const propertyId = tenantUnit?.buildingId || tenantUnit?.id || 'bld-1';
    const propertyName = tenantUnit?.propertyName || tenantUnit?.address || 'Tenant Property';
    const unitName = tenantUnit?.unitName || tenantUnit?.tenantName || session.name + ' Unit';

    const { complaint: newComp, tenantNoticeMessage } = routeComplaintSubmission({
      tenantName: session.name || 'Tenant',
      tenantEmail: session.email,
      unitName,
      unitId: tenantUnit?.id,
      propertyId,
      propertyName,
      complaint_category: category,
      details: details || `${category} reported.`,
      urgency: calculatedUrgency,
      evidencePhotos: evidencePhotos.length > 0 ? evidencePhotos : undefined,
      typeOfWasteIssue: category === 'Waste and Refuse Collection' ? typeOfWasteIssue : undefined,
      daysSinceLastCollection: category === 'Waste and Refuse Collection' ? daysSinceLastCollection : undefined,
      usualCollectionDay: category === 'Waste and Refuse Collection' ? usualCollectionDay : undefined,
      landlordId: tenantUnit?.landlordId,
      landlordName: tenantUnit?.landlordName,
      managementCompanyId: tenantUnit?.managementCompanyId
    });

    const updated = [newComp, ...complaints];
    setComplaints(updated);
    localStorage.setItem('uh_complaints_v1', JSON.stringify(updated));

    setNoticeMessage(tenantNoticeMessage);
    triggerSuccess('Complaint successfully recorded and routed!');
    setDetails('');
    setEvidencePhotos([]);
  };

  // Filter complaints for this tenant
  const myComplaints = complaints.filter(c => 
    c.tenant?.toLowerCase() === session.name?.toLowerCase() ||
    c.unit?.toLowerCase().includes(session.name?.toLowerCase()) ||
    c.tenantCode === tenantUnit?.tenantCode
  );

  return (
    <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-6">
      <div className="flex items-center space-x-2.5 border-b border-stone-200 pb-3">
        <MessageCircle className="text-emerald-800 w-5 h-5" />
        <h3 className="font-display font-black text-[#18452E] uppercase text-sm">Tenant Complaint Center</h3>
      </div>

      {noticeMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-[10px] font-mono font-bold text-#132A1D uppercase mb-1">
            What is your complaint about? *
          </label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
            required 
            className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-semibold text-#132A1D"
          >
            <option value="Property Maintenance or Repairs">Property Maintenance or Repairs</option>
            <option value="Waste and Refuse Collection">Waste and Refuse Collection</option>
            <option value="Property Condition or Safety">Property Condition or Safety</option>
            <option value="Service Charges">Service Charges</option>
            <option value="Noise or Neighbour Issue">Noise or Neighbour Issue</option>
            <option value="Landlord Conduct or Behaviour">Landlord Conduct or Behaviour</option>
            <option value="Property Management Company Conduct">Property Management Company Conduct</option>
            <option value="Something Else">Something Else</option>
          </select>
        </div>

        {category === 'Landlord Conduct or Behaviour' && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl text-xs font-medium space-y-1">
            <strong className="block font-bold text-amber-900 uppercase text-[10px] tracking-wider">🔒 Direct Private Complaint:</strong>
            <p className="text-amber-900">Your complaint about your landlord has been received by Unity Homes directly. We will review this privately.</p>
          </div>
        )}

        {category === 'Property Management Company Conduct' && (
          <div className="p-3.5 bg-blue-50 border border-blue-300 text-blue-950 rounded-2xl text-xs font-medium space-y-1">
            <strong className="block font-bold text-blue-900 uppercase text-[10px] tracking-wider">🛡️ Direct Admin Handling:</strong>
            <p className="text-blue-900">Your complaint regarding your Property Management Company will be handled directly by Unity Homes Admin. Your landlord will also be notified.</p>
          </div>
        )}

        {category === 'Waste and Refuse Collection' && (
          <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/60">
            <div>
              <label className="block text-[9px] font-mono font-bold text-emerald-900 uppercase mb-1">Type of Waste Issue *</label>
              <select 
                value={typeOfWasteIssue}
                onChange={(e) => setTypeOfWasteIssue(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl outline-none text-xs font-medium"
              >
                <option value="Waste not collected on scheduled day">Waste not collected on scheduled day</option>
                <option value="No collection in over seven days">No collection in over seven days</option>
                <option value="Communal bins overflowing">Communal bins overflowing</option>
                <option value="Waste collected from some units but not mine">Waste collected from some units but not mine</option>
                <option value="Health or hygiene concern from uncollected waste">Health or hygiene concern from uncollected waste</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-mono font-bold text-emerald-900 uppercase mb-1">Days Since Last Collection *</label>
                <input 
                  type="number"
                  min="0"
                  max="90"
                  value={daysSinceLastCollection}
                  onChange={(e) => setDaysSinceLastCollection(parseInt(e.target.value) || 0)}
                  required
                  className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl outline-none font-mono text-xs"
                />
                <span className="text-[9px] text-#6B7280 mt-0.5 block">
                  {daysSinceLastCollection >= 14 ? '🔴 Urgent Priority Auto-Assigned (14+ days)' : daysSinceLastCollection >= 7 ? '🟠 High Priority Auto-Assigned (7+ days)' : '🔵 Normal Priority'}
                </span>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-emerald-900 uppercase mb-1">Usual Collection Day *</label>
                <select
                  value={usualCollectionDay}
                  onChange={(e) => setUsualCollectionDay(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl outline-none text-xs font-medium"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                  <option value="I do not know">I do not know</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold text-emerald-900 uppercase mb-1">Upload Evidence Photos (Optional)</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Paste photo URL or click Add Sample Photo..."
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  className="flex-1 p-2 bg-white border border-emerald-200 rounded-xl text-xs"
                />
                <button 
                  type="button" 
                  onClick={handleAddPhoto}
                  className="px-3 py-2 bg-emerald-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-emerald-900 shrink-0"
                >
                  Add Photo
                </button>
              </div>
              <p className="text-[10px] text-#6B7280 mt-1 italic">
                A photo helps resolve this faster.
              </p>
              {evidencePhotos.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {evidencePhotos.map((url, i) => (
                    <img key={i} src={url} alt="Evidence" className="w-14 h-14 object-cover rounded-xl border border-stone-200" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">Detailed Description / Notes</label>
          <textarea 
            rows={3} 
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-700" 
            placeholder="Provide additional details regarding the issue..."
          />
        </div>

        <button type="submit" className="w-full py-3 bg-[#18452E] hover:bg-[#18452E] text-white font-bold rounded-xl tracking-wider uppercase cursor-pointer text-xs">
          Submit Complaint
        </button>
      </form>

      <div className="pt-4 border-t border-stone-200 space-y-3">
        <h4 className="font-bold text-xs uppercase text-#6B7280 tracking-wider">Complaint History</h4>
        <div className="space-y-3">
          {myComplaints.length === 0 ? (
            <p className="text-xs text-stone-400 italic">No complaints logged yet.</p>
          ) : (
            myComplaints.map((comp) => {
              let statusBadgeClass = 'bg-stone-50 text-#132A1D border-stone-200';
              if (comp.status === 'Open') statusBadgeClass = 'bg-red-100 text-red-800 border-red-200';
              else if (comp.status === 'Responded') statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
              else if (comp.status === 'Resolved') statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';

              return (
                <div key={comp.id} className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-#132A1D text-xs block">{comp.complaint_category || comp.category || 'Complaint'}</strong>
                      <span className="text-[10px] text-#6B7280 font-mono">
                        {comp.propertyName} &bull; {comp.unit}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${statusBadgeClass}`}>
                      {comp.status}
                    </span>
                  </div>

                  {comp.typeOfWasteIssue && (
                    <div className="flex gap-2 text-[10px] font-mono text-#6B7280 bg-white p-2 rounded-xl border border-stone-150">
                      <span>Issue: <strong>{comp.typeOfWasteIssue}</strong></span>
                      {comp.daysSinceLastCollection !== undefined && (
                        <>
                          <span>&bull;</span>
                          <span>Days: <strong>{comp.daysSinceLastCollection}</strong></span>
                        </>
                      )}
                    </div>
                  )}

                  <p className="text-#132A1D text-[11px] leading-relaxed">&quot;{comp.text}&quot;</p>

                  {/* Responses */}
                  {comp.landlordResponse && (
                    <div className="text-#132A1D text-[11px] bg-amber-50 p-2.5 rounded-xl border border-amber-200 space-y-1">
                      <strong className="text-amber-900 block font-mono text-[9px] uppercase">LANDLORD RESPONSE ({comp.landlordRespondedAt?.split('T')[0] || 'Recent'}):</strong>
                      <p>{comp.landlordResponse}</p>
                      {comp.landlordActionTaken && (
                        <p className="text-[10px] text-amber-800 italic font-mono">Action Taken: {comp.landlordActionTaken}</p>
                      )}
                    </div>
                  )}

                  {comp.pmcResponse && (
                    <div className="text-#132A1D text-[11px] bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 space-y-1">
                      <strong className="text-emerald-900 block font-mono text-[9px] uppercase">PMC RESPONSE ({comp.pmcRespondedAt?.split('T')[0] || 'Recent'}):</strong>
                      <p>{comp.pmcResponse}</p>
                      {comp.pmcActionTaken && (
                        <p className="text-[10px] text-emerald-800 italic font-mono">Action Taken: {comp.pmcActionTaken}</p>
                      )}
                    </div>
                  )}

                  {comp.adminResponse && (
                    <div className="text-#132A1D text-[11px] bg-blue-50 p-2.5 rounded-xl border border-blue-200 space-y-1">
                      <strong className="text-blue-900 block font-mono text-[9px] uppercase">ADMIN RESPONSE ({comp.adminRespondedAt?.split('T')[0] || 'Recent'}):</strong>
                      <p>{comp.adminResponse}</p>
                    </div>
                  )}

                  <div className="text-[9px] text-stone-400 font-mono pt-1 border-t border-stone-200 flex justify-between">
                    <span>Date Filed: {comp.date} ({calculateDaysOpen(comp.date)} days ago)</span>
                    <span>Routing: {comp.routingPath || 'Standard'}</span>
                  </div>

                  {/* Escalation Eligible Block */}
                  {isComplaintEscalationEligible(comp) && comp.status !== 'Escalated' && comp.status !== 'Resolved' && (
                    <div className="mt-3 p-3 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingEscalationComplaint(comp)}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-#132A1D font-extrabold rounded-xl uppercase text-[11px] tracking-wider transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>⚡ Escalate to Unity Homes</span>
                      </button>
                      <p className="text-[10px] text-amber-900 font-medium leading-normal text-center">
                        Your complaint has been open for more than 7 days without resolution. You can now request Unity Homes admin to review this directly.
                      </p>
                    </div>
                  )}

                  {/* Escalated Status Banner */}
                  {comp.status === 'Escalated' && (
                    <div className="mt-3 p-3 bg-amber-100/80 border border-amber-400 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase">
                        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Escalated to Unity Homes Admin</span>
                      </div>
                      <p className="text-[10px] text-amber-800">
                        This complaint was escalated on {comp.escalated_at ? comp.escalated_at.split('T')[0] : comp.date}. Admin is conducting a statutory review of the complete history.
                      </p>
                      {comp.returned_message && (
                        <div className="p-2 bg-white/80 rounded-xl text-[10px] text-#132A1D font-medium mt-1">
                          <strong>Admin Directive:</strong> Unity Homes has asked your landlord or property manager to resolve this within 48 hours.
                        </div>
                      )}
                      {comp.serious_concern_flagged && (
                        <div className="p-2 bg-red-50 text-red-900 rounded-xl text-[10px] font-medium mt-1">
                          <strong>Formal Review Active:</strong> Unity Homes is conducting a formal review of your complaint. We will update you directly.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Escalation Confirmation Dialog Modal */}
      {confirmingEscalationComplaint && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 bg-amber-100 rounded-2xl">
                <ShieldAlert className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="font-display font-black text-#132A1D text-sm uppercase">Escalate Complaint to Admin</h3>
                <p className="text-[10px] text-#6B7280 font-mono">Statutory Escalation Workflow</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium leading-relaxed">
              You are about to escalate this complaint to Unity Homes admin. This cannot be undone. Admin will review the full complaint history including all responses so far.
            </div>

            <div className="space-y-1 text-xs text-#6B7280">
              <p><strong>Property:</strong> {confirmingEscalationComplaint.propertyName}</p>
              <p><strong>Category:</strong> {confirmingEscalationComplaint.complaint_category || confirmingEscalationComplaint.category}</p>
              <p><strong>Days Open:</strong> {calculateDaysOpen(confirmingEscalationComplaint.date)} days</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingEscalationComplaint(null)}
                className="flex-1 py-3 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = escalateComplaintInStorage(confirmingEscalationComplaint.id, session.name || 'Tenant');
                  if (res.success) {
                    setConfirmingEscalationComplaint(null);
                    setNoticeMessage('Your complaint has been escalated to Unity Homes admin. All parties have been notified.');
                    // Refresh local complaints
                    const raw = localStorage.getItem('uh_complaints_v1');
                    if (raw) setComplaints(JSON.parse(raw));
                  } else {
                    alert(res.message);
                  }
                }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
