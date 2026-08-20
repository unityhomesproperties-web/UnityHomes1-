import MobileBottomNav from "./MobileBottomNav";
import NotificationFeed from "./NotificationFeed";
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { 
  Building, UserCheck, ShieldAlert, CheckCircle, FileText, PlusCircle,
  Users, Landmark, Wrench, BarChart2, ShieldCheck, Mail, Calendar, Trash2, X, ArrowLeft, Award, AlertCircle, Download,
  ArrowUpRight, Clock, MessageSquare, Bell, CheckCircle2, DollarSign, Filter, RefreshCw, ChevronDown, ChevronUp, CheckSquare, Trash, Send
} from 'lucide-react';
import { LandlordUnit, Property, UserSession, Building as BuildingType, BookingLog, DamageReport, ServiceChargeBill, InstallmentEntry } from '../../types';
import { loadTenantRegistrations, initialBuildings } from '../../data';
import PortfolioHealthCenter from './PortfolioHealthCenter';
import ServiceChargeIntelligence from './ServiceChargeIntelligence';
import TenantIntelligenceCenter from './TenantIntelligenceCenter';
import AICollectionCenter from './AICollectionCenter';
import { addDocument, updateDocument, saveCollectionData, preparePromiseToPay, useLiveCollection, getUserTargetId } from '../../lib/database';

// Import newly added PMC features
import RecentlyViewed, { addToRecentlyViewed } from './RecentlyViewed';
import ConnectivityIndicator, { queueOfflineMutation } from './ConnectivityIndicator';
import SavedFilters from './SavedFilters';
import ExportCenter from './ExportCenter';
import BroadcastCenter from './BroadcastCenter';
import TransparencyTimeline from './TransparencyTimeline';
import ProfileCompletionIndicator from './ProfileCompletionIndicator';
import PlatformAnnouncements from './PlatformAnnouncements';
import OperationsBriefingCard from './OperationsBriefingCard';
import AuditHistoryTab, { writeAuditLog } from './AuditHistoryTab';
import SupportCenter from './SupportCenter';
import QuickSupportButton from './QuickSupportButton';

interface PmcDashboardProps {
  session: UserSession;
  properties: Property[];
  setProperties?: React.Dispatch<React.SetStateAction<Property[]>>;
  buildings?: BuildingType[];
  setBuildings?: React.Dispatch<React.SetStateAction<BuildingType[]>>;
  managementCompanyProperties?: any[];
  setManagementCompanyProperties?: React.Dispatch<React.SetStateAction<any[]>>;
  subscriptions?: any[];
  setSubscriptions?: React.Dispatch<React.SetStateAction<any[]>>;
  landlordUnits: LandlordUnit[];
  setLandlordUnits?: React.Dispatch<React.SetStateAction<LandlordUnit[]>>;
  bookings?: BookingLog[];
  damageReports?: DamageReport[];
  serviceCharges?: ServiceChargeBill[];
  setServiceCharges?: React.Dispatch<React.SetStateAction<ServiceChargeBill[]>>;
  navigate?: (path: string, params?: any) => void;
}

export default function PmcDashboard({
  session,
  properties,
  setProperties,
  buildings = [],
  setBuildings,
  managementCompanyProperties = [],
  setManagementCompanyProperties,
  subscriptions = [],
  setSubscriptions,
  landlordUnits,
  setLandlordUnits,
  bookings = [],
  damageReports = [],
  serviceCharges = [],
  setServiceCharges,
  navigate
}: PmcDashboardProps) {

  const [activeTab, setActiveTab] = useState<'Portfolio' | 'Clients' | 'Payments' | 'Maintenance' | 'WasteComplaints' | 'Reports' | 'Staff' | 'Subscription' | 'PortfolioHealth' | 'ServiceCharges' | 'TenantIntelligence' | 'AICollection' | 'LeaseRenewal' | 'Broadcast'>('Portfolio');
  const [expandedLandlords, setExpandedLandlords] = useState<string[]>([]);
  const toggleLandlordExpand = (name: string) => setExpandedLandlords(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Real-time listener for PMC notifications
  const pmcNotifications = useLiveCollection('notifications', [], (allNotifs) => {
    return allNotifs.filter(n => n.role === 'PMC' && (n.targetId === 'Prime Property Solutions' || n.targetId === ''));
  });
  const hasUnreadNotifications = pmcNotifications.some(n => !n.read);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showAddPmcProperty, setShowAddPmcProperty] = useState(false);
  const [pmcNewPropertyName, setPmcNewPropertyName] = useState('');
  const [pmcNewPropertyAddress, setPmcNewPropertyAddress] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<LandlordUnit | null>(null);
  const [showFeeChangeForm, setShowFeeChangeForm] = useState(false);
  const [proposedFee, setProposedFee] = useState('');
  const [proposedFeeReason, setProposedFeeReason] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [perfSortCriteria, setPerfSortCriteria] = useState<'Combined' | 'Occupancy' | 'Payment'>('Combined');

  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    const loadReports = () => {
      try {
        const stored = localStorage.getItem('uh_management_company_reports_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          setReports(parsed.filter((r: any) => r.pmcId === 'Prime Property Solutions'));
        } else {
          setReports([]);
        }
      } catch {}
    };

    loadReports();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'uh_management_company_reports_v1') {
        loadReports();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleOpenReport = (report: any) => {
    if (report.pdfContent) {
      try {
        const stored = localStorage.getItem('uh_management_company_reports_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          const found = parsed.find((r: any) => r.id === report.id);
          if (found) {
            found.downloaded = true;
            localStorage.setItem('uh_management_company_reports_v1', JSON.stringify(parsed));
            setReports(parsed.filter((r: any) => r.pmcId === 'Prime Property Solutions'));
          }
        }
      } catch (e) {
        console.error('Error saving PMC report download status:', e);
      }
    }
    setSelectedReport(report);
  };

  // Installments state
  const [showInstallmentOnly, setShowInstallmentOnly] = useState(false);
  const [showConfirmInstallmentModal, setShowConfirmInstallmentModal] = useState<{ unit: LandlordUnit; installment: InstallmentEntry } | null>(null);
  const [receiptMemo, setReceiptMemo] = useState('');
  const [showPromiseModal, setShowPromiseModal] = useState<{ unit: LandlordUnit; installment: InstallmentEntry } | null>(null);
  const [promiseDate, setPromiseDate] = useState('');
  const [promiseNote, setPromiseNote] = useState('');

  // Lease Renewal Center states
  const [renewalSortCol, setRenewalSortCol] = useState<'tenantName' | 'propertyName' | 'leaseExpiryDate' | 'daysRemaining' | 'renewalIntention'>('daysRemaining');
  const [renewalSortDirection, setRenewalSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showNotifyModal, setShowNotifyModal] = useState<LandlordUnit | null>(null);
  const [notifyChannel, setNotifyChannel] = useState<'WhatsApp' | 'Email' | 'SMS'>('WhatsApp');
  const [notifyCustomMessage, setNotifyCustomMessage] = useState('');
  const [showTenancyModal, setShowTenancyModal] = useState<LandlordUnit | null>(null);
  
  // Staff simulation state
  const [staffList, setStaffList] = useState([
    { id: '1', name: 'Ogunlesi Lekan', role: 'Chief Caretaker', phone: '+234 805 111 2233' },
    { id: '2', name: 'Bose Adeoye', role: 'Property Inspector', phone: '+234 812 444 8899' }
  ]);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Caretaker', phone: '' });

  // Maintenance simulation state
  const [maintenanceJobs, setMaintenanceJobs] = useState([
    { id: 'job-1', property: 'Osei Gbagada Flat A', issue: 'Leaking ceiling panel in master bathroom', priority: 'High', status: 'Pending Inspector Quote' },
    { id: 'job-2', property: 'Lekki Rosewood Duplex 1', issue: 'Borehole filter sand replacement', priority: 'Medium', status: 'Approved & Funded' }
  ]);

  // Added PMC enhancements state variables
  const [clientsActiveFilters, setClientsActiveFilters] = useState<Record<string, any>>({});
  const [clientsSearch, setClientsSearch] = useState('');
  const [isClientsExportOpen, setIsClientsExportOpen] = useState(false);

  const [paymentsActiveFilters, setPaymentsActiveFilters] = useState<Record<string, any>>({});
  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [isPaymentsExportOpen, setIsPaymentsExportOpen] = useState(false);
  const [paymentsBulkMode, setPaymentsBulkMode] = useState(false);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);

  const [maintActiveFilters, setMaintActiveFilters] = useState<Record<string, any>>({});
  const [maintSearch, setMaintSearch] = useState('');
  const [isMaintExportOpen, setIsMaintExportOpen] = useState(false);
  const [maintBulkMode, setMaintBulkMode] = useState(false);
  const [selectedMaintIds, setSelectedMaintIds] = useState<string[]>([]);

  const [staffSearch, setStaffSearch] = useState('');
  const [isStaffExportOpen, setIsStaffExportOpen] = useState(false);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.phone) {
      alert('Kindly specify staff metrics.');
      return;
    }
    const created = {
      id: Math.random().toString(36).substr(2, 9),
      name: newStaff.name,
      role: newStaff.role,
      phone: newStaff.phone
    };
    setStaffList([...staffList, created]);
    setNewStaff({ name: '', role: 'Caretaker', phone: '' });
    triggerSuccess(`Successfully added ${created.name} as ${created.role}. Access key dispatched to their phone.`);
  };

  const handleResolveJob = (id: string) => {
    const updated = maintenanceJobs.map(job => job.id === id ? { ...job, status: 'Resolved & Closed' } : job);
    setMaintenanceJobs(updated);
    triggerSuccess('Maintenance order successfully closed. Capital reserves log audited.');
  };

  // Helper to parse dates and calculate days remaining (today is 2026-07-05)
  const getDaysRemaining = (dateStr?: string) => {
    if (!dateStr) return 365;
    const today = new Date('2026-07-05');
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to parse dates and calculate days overdue
  const getDaysOverdue = (dateStr: string) => {
    const today = new Date('2026-07-05');
    const due = new Date(dateStr);
    const diffTime = today.getTime() - due.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleSendReminder = (unit: LandlordUnit, installment: InstallmentEntry) => {
    triggerSuccess(`Installment collection reminder dispatched via WhatsApp, Email, and SMS for ₦${installment.amount.toLocaleString()}.`);
    
    // Add real notification to system database
    try {
      addDocument('notifications', {
        id: 'notif-' + Date.now(),
        title: 'Installment Payment Overdue',
        message: `Dear ${unit.tenantName}, your rent installment of ₦${installment.amount.toLocaleString()} is overdue. Please settle this payment.`,
        tenantName: unit.tenantName,
        tenantCode: unit.tenantCode,
        date: new Date().toISOString().split('T')[0],
        isRead: false
      });
    } catch (e) {
      console.log("Error logging reminder notification:", e);
    }
  };

  const handleConfirmInstallmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showConfirmInstallmentModal || !setLandlordUnits) return;
    const { unit, installment } = showConfirmInstallmentModal;
    
    const updatedUnits = landlordUnits.map(u => {
      if (u.id === unit.id) {
        const updatedInsts = u.installments?.map(inst => {
          if (inst.id === installment.id) {
            return { ...inst, status: 'Paid' as const };
          }
          return inst;
        }) || [];
        
        const newPaid = (u.rentPaid || 0) + installment.amount;
        
        const allPaid = updatedInsts.every(inst => inst.status === 'Paid');
        const anyOverdue = updatedInsts.some(inst => inst.status === 'Overdue');
        let newStatus = u.paymentStatus;
        if (allPaid) {
          newStatus = 'Paid';
        } else if (anyOverdue) {
          newStatus = 'Overdue';
        } else {
          newStatus = 'Paid';
        }
        
        return {
          ...u,
          installments: updatedInsts,
          rentPaid: newPaid,
          paymentStatus: newStatus
        };
      }
      return u;
    });

    setLandlordUnits(updatedUnits);
    saveCollectionData('collection_tenants', updatedUnits);
    
    triggerSuccess(`Successfully confirmed receipt collection of ₦${installment.amount.toLocaleString()} from ${unit.tenantName}.`);
    setShowConfirmInstallmentModal(null);
    setReceiptMemo('');
  };

  const handlePromiseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPromiseModal || !promiseDate) return;
    const { unit, installment } = showPromiseModal;

    try {
      const newPromise = preparePromiseToPay({
        promisedAmount: installment.amount,
        expectedPaymentDate: promiseDate,
        note: promiseNote || 'Logged by Property Management Company',
        status: 'Upcoming' as const
      }, unit);
      
      addDocument('promises_to_pay', newPromise);
      triggerSuccess(`Promise to Pay successfully logged for ₦${installment.amount.toLocaleString()} due on ${promiseDate}.`);
    } catch (err) {
      console.log("Error logging Promise to Pay:", err);
      triggerSuccess(`Promise to Pay logged for ₦${installment.amount.toLocaleString()} due on ${promiseDate}.`);
    }

    setShowPromiseModal(null);
  };

  const handleAddPmcPropertySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmcNewPropertyName || !pmcNewPropertyAddress) {
      alert('Please fill out the property name and address.');
      return;
    }

    const activePmcName = session.name === 'prime@unityhomes.ng' || session.email.includes('prime') || session.email.includes('pmc') 
      ? 'Prime Property Solutions' 
      : 'Lagos Realty Partners';

    const currentPmcProperties = (managementCompanyProperties || []).filter(
      m => m.company_id === activePmcName && m.is_active === true
    );
    const pmcActiveCount = currentPmcProperties.length;
    const pmcSub = (subscriptions || []).find(s => s.entityId === activePmcName);
    const pmcLimit = pmcSub ? pmcSub.property_limit : 10;

    if (pmcActiveCount >= pmcLimit) {
      setShowLimitModal(true);
      return;
    }

    const newBuilding: BuildingType = {
      id: 'bld-' + Math.random().toString(36).substr(2, 9),
      name: pmcNewPropertyName,
      blockLabel: 'Block A',
      address: pmcNewPropertyAddress,
      coverPhoto: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      landlordCode: activePmcName.includes('Prime') ? 'UH-LANDLORD-OSEI' : 'UH-LANDLORD-MUSA'
    };

    const newMcp = {
      id: 'mcp-' + Math.random().toString(36).substr(2, 9),
      company_id: activePmcName,
      property_id: newBuilding.id,
      is_active: true,
      created_at: new Date().toISOString()
    };

    try {
      addDocument('management_company_properties', newMcp, []);
    } catch (err: any) {
      setShowLimitModal(true);
      return;
    }

    try {
      addDocument('buildings', newBuilding, initialBuildings);
    } catch (err) {}

    if (setBuildings) {
      setBuildings([newBuilding, ...buildings]);
    }
    if (setManagementCompanyProperties) {
      setManagementCompanyProperties([newMcp, ...managementCompanyProperties]);
    }

    try {
      const storedLogs = localStorage.getItem('uh_activityLog_v1');
      const parsedLogs = storedLogs ? JSON.parse(storedLogs) : [];
      const newLogEntry = {
        id: `log-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actorName: session.name,
        actorRole: 'PMC Representative',
        actionType: 'PROPERTY_CREATED',
        recordAffected: `${pmcNewPropertyName} Registered`,
        recordId: newBuilding.id,
        previousValue: 'None',
        newValue: 'Registered',
        details: `PMC ${activePmcName} registered new property '${pmcNewPropertyName}' at ${pmcNewPropertyAddress} under subscription allocation.`
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLogEntry, ...parsedLogs]));
      window.dispatchEvent(new Event('storage'));
    } catch (logErr) {
      console.error('Error logging PMC property creation:', logErr);
    }

    setShowAddPmcProperty(false);
    setPmcNewPropertyName('');
    setPmcNewPropertyAddress('');
    triggerSuccess(`Successfully registered managed property '${pmcNewPropertyName}' under subscription allocation.`);
  };

  const handleRequestFeeChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    const proposed = parseFloat(proposedFee);
    if (isNaN(proposed) || proposed < 1 || proposed > 50) {
      alert("Management fee must be between 1% and 50%.");
      return;
    }
    
    const currentPct = getPropertyFeePercentage(selectedUnit.propertyName) || 10;
    const newRequest = {
      id: `req-${Date.now()}`,
      propertyId: selectedUnit.id,
      propertyName: selectedUnit.propertyName,
      pmcName: activePmcName,
      currentPercentage: currentPct,
      proposedPercentage: proposed,
      reason: proposedFeeReason,
      status: 'Pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    try {
      const stored = localStorage.getItem('uh_fee_change_requests_v1');
      const requests = stored ? JSON.parse(stored) : [];
      localStorage.setItem('uh_fee_change_requests_v1', JSON.stringify([newRequest, ...requests]));
      
      // Also log proposal to activity log
      const storedLogs = localStorage.getItem('uh_activityLog_v1');
      const parsedLogs = storedLogs ? JSON.parse(storedLogs) : [];
      const newLogEntry = {
        id: `log-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actorName: session.name,
        actorRole: 'PMC Representative',
        actionType: 'FEE_CHANGE_REQUESTED',
        recordAffected: selectedUnit.propertyName,
        recordId: selectedUnit.id,
        previousValue: `${currentPct}%`,
        newValue: `${proposed}%`,
        details: `PMC ${activePmcName} requested fee percentage change for '${selectedUnit.propertyName}' from ${currentPct}% to ${proposed}% due to: "${proposedFeeReason}"`
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLogEntry, ...parsedLogs]));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }

    setShowFeeChangeForm(false);
    setProposedFeeReason('');
    triggerSuccess(`Successfully requested management fee change to ${proposed}% for '${selectedUnit.propertyName}'. Awaiting Admin approval.`);
  };

  const loggedInPmcId = session.userId || 'sandbox-user-9999';
  const activePmcName = session.name === 'prime@unityhomes.ng' || session.email.includes('prime') || session.email.includes('pmc') 
    ? 'Prime Property Solutions' 
    : 'Lagos Realty Partners';

  function getPMCIdFromProperty(propertyName: string): string {
    const nameLower = propertyName.toLowerCase();
    if (nameLower.includes('rosewood') || nameLower.includes('gbagada estate') || nameLower.includes('osei')) {
      return 'Prime Property Solutions';
    }
    if (nameLower.includes('wuse') || nameLower.includes('maitama') || nameLower.includes('gwarinpa') || nameLower.includes('ibrahim') || nameLower.includes('musa')) {
      return 'Lagos Realty Partners';
    }
    return 'Prime Property Solutions';
  }

  // Active properties managed by this PMC, querying by managementCompanyId matching the logged in PMC user
  const pmcActivePropertiesCount = properties.filter(p => {
    const pPmcId = p.managementCompanyId || getPMCIdFromProperty(p.title);
    const isActive = (p as any).is_active !== false;
    return (pPmcId === activePmcName || pPmcId === loggedInPmcId) && isActive;
  }).length;

  const pmcSubscriptionLimit = 100;

  // Filter managed properties/tenancies depending on PMC company, filtering by managementCompanyId field
  const pmcManagedUnits = landlordUnits.filter(u => {
    const uPmcId = u.managementCompanyId || getPMCIdFromProperty(u.propertyName);
    return uPmcId === activePmcName || uPmcId === loggedInPmcId;
  });

  // Helper to lookup Landlord Owner Name
  const getLandlordName = (propertyName: string) => {
    const lower = propertyName.toLowerCase();
    if (lower.includes('osei')) return 'Mr. Babatunde Osei';
    if (lower.includes('ibrahim') || lower.includes('wuse')) return 'Alhaji Musa Ibrahim';
    if (lower.includes('adebayo') || lower.includes('lekki')) return 'Chief Funmi Adebayo';
    if (lower.includes('okafor') || lower.includes('cozy') || lower.includes('maryland')) return 'Dr. Chioma Okafor';
    if (lower.includes('adeyinka') || lower.includes('bode thomas') || lower.includes('toyin') || lower.includes('sanusi')) return 'Chief Emmanuel Adeyinka';
    return 'Mr. Babatunde Osei'; // fallback
  };

  // Lease Renewal Center Metrics Calculations
  const pmcTenantsWhoWillRenew = pmcManagedUnits.filter(u => u.renewalIntention === 'renewing').length;
  const pmcTenantsWhoWillVacate = pmcManagedUnits.filter(u => u.renewalIntention === 'vacating').length;
  const pmcTenantsInNoticePeriod = pmcManagedUnits.filter(u => u.quitNoticeGenerated && u.quitNoticeStatus === 'Notice Period Active').length;
  const pmcAwaitingDecision = pmcManagedUnits.filter(u => {
    if (!u.leaseExpiryDate || u.renewalIntention) return false;
    const daysLeft = getDaysRemaining(u.leaseExpiryDate);
    return daysLeft <= 90 && daysLeft >= 0;
  }).length;

  // Helper to get property fee percentage from managementCompanyProperties (Prompt Two)
  const getPropertyFeePercentage = (propertyName: string): number | undefined => {
    const mcp = (managementCompanyProperties || []).find(
      m => m.propertyName === propertyName && m.company_id === activePmcName && m.is_active !== false
    );
    return mcp?.management_fee_percentage;
  };

  // Compliance: filter out units whose property is missing the management fee percentage from all profit calculations (Step 1)
  const compliantPmcManagedUnits = pmcManagedUnits.filter(u => {
    const pct = getPropertyFeePercentage(u.propertyName);
    return pct !== undefined;
  });

  // Portfolio Totals Mathematical Formulations (Fix Six) using compliant properties
  const pmcTotalPortfolioValue = compliantPmcManagedUnits.reduce((sum, u) => sum + u.rentAmount, 0);
  const pmcTotalCollected = compliantPmcManagedUnits
    .filter(u => u.paymentStatus === 'Paid')
    .reduce((sum, u) => sum + u.rentAmount, 0);
  const pmcTotalOutstanding = compliantPmcManagedUnits
    .filter(u => u.paymentStatus === 'Overdue' || u.paymentStatus === 'Due Soon')
    .reduce((sum, u) => sum + u.rentAmount, 0);
  const pmcOccupancyRate = pmcManagedUnits.length > 0
    ? Math.round((pmcManagedUnits.filter(u => u.paymentStatus !== 'Vacant').length / pmcManagedUnits.length) * 100)
    : 85;

  // Real-time Remittance Calculations (Fix Two)
  const pmcBookings = bookings.filter(b => {
    return getPMCIdFromProperty(b.propertyName) === activePmcName;
  });

  const shortletCollected = pmcBookings.reduce((sum, b) => sum + b.totalPaid, 0);
  const shortletRemitted = pmcBookings
    .filter(b => b.status === 'Acknowledged' || b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.remittanceAmount, 0);

  const longTermCollected = pmcTotalCollected;
  // Calculate dynamic long term remittance (sum of rentAmount * (1 - feePct / 100) for each paid unit) (Step 4)
  const longTermRemitted = compliantPmcManagedUnits
    .filter(u => u.paymentStatus === 'Paid')
    .reduce((sum, u) => {
      const pct = getPropertyFeePercentage(u.propertyName) || 10;
      return sum + u.rentAmount * (1 - pct / 100);
    }, 0);

  const totalCollectedAcrossPortfolio = shortletCollected + longTermCollected;
  const totalAlreadyRemittedToLandlords = shortletRemitted + longTermRemitted;
  const awaitingRemittanceAmt = Math.max(0, totalCollectedAcrossPortfolio - totalAlreadyRemittedToLandlords);

  // Helper lookup for property photograph matches
  const getPropertyPhoto = (propertyName: string) => {
    const prop = properties.find(p => p.title === propertyName || propertyName.includes(p.title) || p.title.includes(propertyName));
    if (prop && prop.photos && prop.photos.length > 0) {
      return prop.photos[0];
    }
    return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
  };

  // Helper collection bank routing accounts lookups (Fix Two)
  const getCollectionAccountName = (propertyName: string) => {
    const prop = properties.find(p => p.title === propertyName || propertyName.includes(p.title) || p.title.includes(propertyName));
    if (prop) {
      const digits = prop.verifiedAccountNumber.slice(-4);
      return `${prop.verifiedBankName} (AC ending ***${digits})`;
    }
    return 'Zenith Bank (AC ending ***4853)';
  };

  // Helper to obtain tenant and guarantor metrics (Fix Seven)
  const getSortedPerformers = () => {
    let pmcBuildings = initialBuildings.filter(b => {
      return pmcManagedUnits.some(u => u.buildingId === b.id);
    });
    
    if (pmcBuildings.length === 0) {
      pmcBuildings = initialBuildings.filter(b => {
        if (activePmcName.includes('Prime')) return b.landlordCode === 'UH-LANDLORD-OSEI';
        return b.landlordCode === 'UH-LANDLORD-MUSA';
      });
    }
    
    return pmcBuildings.map(b => {
      const bldUnits = pmcManagedUnits.filter(u => u.buildingId === b.id);
      if (bldUnits.length === 0) {
        const occRate = b.landlordCode === 'UH-LANDLORD-OSEI' ? 95 : 80;
        const payRate = b.landlordCode === 'UH-LANDLORD-OSEI' ? 90 : 75;
        return {
          b,
          occ: occRate,
          pay: payRate,
          score: occRate * 0.6 + payRate * 0.4
        };
      }
      const occupied = bldUnits.filter(u => u.paymentStatus !== 'Vacant').length;
      const occRate = (occupied / bldUnits.length) * 100;
      const onTime = bldUnits.filter(u => u.paymentStatus !== 'Overdue').length;
      const payRate = (onTime / bldUnits.length) * 100;
      return {
        b,
        occ: occRate,
        pay: payRate,
        score: occRate * 0.6 + payRate * 0.4
      };
    }).sort((x, y) => {
      if (perfSortCriteria === 'Occupancy') return y.occ - x.occ;
      if (perfSortCriteria === 'Payment') return y.pay - x.pay;
      return y.score - x.score;
    });
  };

  const sortedPerformers = getSortedPerformers();

  const getTenantDetails = (tenantName: string, tenantCode: string, rentAmount: number, propertyName: string) => {
    try {
      const registrations = loadTenantRegistrations();
      const matched = registrations.find(r => r.fullName.toLowerCase() === tenantName.toLowerCase());
      
      // Choose relationship to display
      const relations = ['parent', 'sibling', 'employer', 'spouse', 'other'];
      const index = Math.abs(tenantName.charCodeAt(0) + tenantName.charCodeAt(tenantName.length - 1 || 0)) % relations.length;
      const randomizedRelation = relations[index];

      if (matched) {
        return {
          fullName: matched.fullName,
          phone: matched.phone || '+234 812 345 6789',
          occupation: matched.occupation || 'Consultant',
          passportPhoto: matched.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          guarantorName: matched.guarantorName || 'Dr. Arthur Mokeme',
          guarantorPhone: matched.guarantorPhone || '+234 805 111 2222',
          relationship: 'other'
        };
      }
    } catch (error) {
      console.error("Error fetching tenant details:", error);
      return {
        fullName: 'Tenant details unavailable',
        phone: 'N/A',
        occupation: 'N/A',
        passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        guarantorName: 'N/A',
        guarantorPhone: 'N/A',
        relationship: 'other'
      };
    }

    // Default seeded details
    let defaultOccup = 'Corporate Executive';
    let defaultGuar = 'Alhaji Gidado Bello';
    let defaultGuarPhone = '+234 803 222 1100';
    let defaultPhoto = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';

    if (tenantName === 'Aisha Bello') {
      defaultOccup = 'Content Lead @ GidiMedia';
      defaultGuar = 'Senator Gidado Bello';
      defaultGuarPhone = '+234 803 222 1100';
      defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
    } else if (tenantName === 'Damola Olatunji') {
      defaultOccup = 'Financial Advisory Lead @ KPMG';
      defaultGuar = 'Chief Bode Olatunji';
      defaultGuarPhone = '+234 803 111 0049';
      defaultPhoto = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80';
    } else if (tenantName === 'Fatima Yusuf') {
      defaultOccup = 'UX Designer @ Paystack';
      defaultGuar = 'Mrs. Amina Yusuf';
      defaultGuarPhone = '+234 802 888 1122';
      defaultPhoto = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80';
    } else if (tenantName === 'Kola Abiodun') {
      defaultOccup = 'Lead Civil Engineer';
      defaultGuar = 'Engr. Jide Abiodun';
      defaultGuarPhone = '+234 809 333 4455';
      defaultPhoto = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';
    } else if (tenantName === 'Funke Akindele') {
      defaultOccup = 'Creative Director @ SceneOne';
      defaultGuar = 'Chief Adebayo Akindele';
      defaultGuarPhone = '+234 815 333 4444';
      defaultPhoto = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80';
    }

    return {
      fullName: tenantName,
      phone: '+234 81' + Math.floor(1000000 + Math.random() * 9000000),
      occupation: defaultOccup,
      passportPhoto: defaultPhoto,
      guarantorName: defaultGuar,
      guarantorPhone: defaultGuarPhone,
      relationship: 'other'
    };
  };

  return (
    <ErrorBoundary>
    <div className="space-y-8 pb-16 text-xs sm:text-sm font-sans theme-teal tracking-wide">
      
      {/* HIGH VISIBILITY SUBSCRIPTION LIMIT BANNER */}
      <div className="bg-teal-950 text-white rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-center gap-3 border border-teal-900 shadow-lg">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
          <span>PMC Corporate License Verified: <strong className="text-teal-200">{activePmcName}</strong></span>
        </div>
        <div className="flex items-center space-x-3">
          <QuickSupportButton 
            currentTab={activeTab}
            onOpenSupportForm={() => setActiveTab('Support')}
          />
          <div className="bg-teal-900 border border-teal-800 px-3.5 py-1.5 rounded-xl text-[11px] font-mono">
            Allocation Quota: <strong className="text-[#C9A84C]">{pmcActivePropertiesCount} / {pmcSubscriptionLimit} properties used</strong>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs text-emerald-805 tracking-normal">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* PROMPT TWO: FIVE PRIMARY NAVIGATION AREAS FOR PMC DASHBOARD */}
      <div className="space-y-3 w-full border-b border-stone-200/60 pb-3">
        {/* PRIMARY 5 NAV AREAS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
          {/* AREA 1: HOME */}
          <button
            onClick={() => setActiveTab('Portfolio')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              ['Portfolio', 'PortfolioHealth'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            1. Home / Dashboard
          </button>

          {/* AREA 2: PROPERTIES */}
          <button
            onClick={() => setActiveTab('Clients')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              ['Clients', 'TenantIntelligence', 'LeaseRenewal'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            2. Properties
          </button>

          {/* AREA 3: MONEY */}
          <button
            onClick={() => setActiveTab('Payments')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              ['Payments', 'ServiceCharges', 'AICollection', 'Subscription'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            3. Money / Payments
          </button>

          {/* AREA 4: OPERATIONS */}
          <button
            onClick={() => setActiveTab('Maintenance')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              ['Maintenance', 'Staff', 'Reports'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            4. Operations
          </button>

          {/* AREA 5: MORE */}
          <button
            onClick={() => setActiveTab('Broadcast')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer col-span-2 sm:col-span-1 ${
              ['Broadcast'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            5. More
          </button>
        </div>

        {/* DYNAMIC SECONDARY SUB-NAVIGATION PILLS FOR ACTIVE AREA */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {['Portfolio', 'PortfolioHealth'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Portfolio')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Portfolio' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; My Portfolio
              </button>
              <button 
                onClick={() => setActiveTab('PortfolioHealth')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'PortfolioHealth' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Portfolio Health
              </button>
            </>
          )}

          {['Clients', 'TenantIntelligence', 'LeaseRenewal'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Clients')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Clients' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Landlord Clients
              </button>
              <button 
                onClick={() => setActiveTab('TenantIntelligence')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'TenantIntelligence' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Tenant Records
              </button>
              <button 
                onClick={() => setActiveTab('LeaseRenewal')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'LeaseRenewal' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Lease Renewal Center
              </button>
            </>
          )}

          {['Payments', 'ServiceCharges', 'AICollection', 'Subscription'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Payments')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Payments' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Rent Payments
              </button>
              <button 
                onClick={() => setActiveTab('ServiceCharges')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'ServiceCharges' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Service Charges
              </button>
              <button 
                onClick={() => setActiveTab('AICollection')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'AICollection' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Collections
              </button>
              <button 
                onClick={() => setActiveTab('Subscription')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Subscription' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; My Subscription
              </button>
            </>
          )}

          {['Maintenance', 'WasteComplaints', 'Staff', 'Reports'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Maintenance')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Maintenance' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Maintenance &amp; Damage
              </button>
              <button 
                onClick={() => setActiveTab('WasteComplaints')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'WasteComplaints' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Waste &amp; Refuse Complaints
              </button>
              <button 
                onClick={() => setActiveTab('Staff')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Staff' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Staff Caretakers
              </button>
              <button 
                onClick={() => setActiveTab('Reports')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Reports' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Reports Generator
              </button>
            </>
          )}

          {['Broadcast', 'Support'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Broadcast')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl cursor-pointer ${
                  activeTab === 'Broadcast' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Broadcast Center
              </button>
              <button 
                onClick={() => setActiveTab('Support')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl cursor-pointer ${
                  activeTab === 'Support' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Contact Unity Homes Support
              </button>
            </>
          )}
        </div>
      </div>

      {/* NEW PMC INTEGRATIONS GLOBAL BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start bg-stone-50/50 p-4 rounded-3xl border border-stone-150">
        <div className="lg:col-span-5">
          <ConnectivityIndicator triggerSuccess={triggerSuccess} />
        </div>
        <div className="lg:col-span-7">
          <RecentlyViewed onNavigate={(item) => {
            if (item.type === 'landlord') setActiveTab('Clients');
            if (item.type === 'tenant') setActiveTab('TenantIntelligence');
            if (item.type === 'property') setActiveTab('Portfolio');
            if (item.type === 'payment') setActiveTab('Payments');
            if (item.type === 'maintenance') setActiveTab('Maintenance');
            if (item.type === 'report') setActiveTab('Reports');
            triggerSuccess(`Navigated to recently viewed record: ${item.name}`);
          }} />
        </div>
      </div>

      {/* TAB 1: PORTFOLIO */}
      {activeTab === 'Portfolio' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* PMC PORTFOLIO OVERVIEW CARD IN TEAL (Fix Six) */}
          <div className="bg-teal-950 text-white p-6 md:p-8 rounded-3xl space-y-4 shadow-xl border border-teal-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A84C]/5 rounded-bl-full"></div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C] font-semibold">
                MANAGED PORTFOLIO VALUE
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-black text-white mt-1">
                ₦{pmcTotalPortfolioValue.toLocaleString()}
              </h2>
              <span className="text-[10px] text-teal-300/80 font-light block mt-1 tracking-normal">
                Aggregate expected contract rent value across other represented landlord client files managed.
              </span>
            </div>

            {/* METRICS GRID */}
            <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-2 pt-4 border-t border-teal-900 scrollbar-thin">
              <div className="bg-teal-900/50 border border-teal-850 rounded-2xl p-4 shrink-0 w-64 md:w-auto">
                <span className="text-[9px] uppercase font-mono text-[#C9A84C] block font-bold">Occupancy Rate</span>
                <span className="text-xl font-display font-bold mt-1 block">{pmcOccupancyRate}% Occupied</span>
                <div className="w-full bg-teal-800 h-1.5 mt-2 rounded-full overflow-hidden">
                  <div className="bg-[#C9A84C] h-full" style={{ width: `${pmcOccupancyRate}%` }}></div>
                </div>
              </div>

              {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
              {/* RENT CONFIRMATION METRICS (Fix Three) */}
              <div className="bg-teal-900/50 border border-teal-850 rounded-2xl p-4 shrink-0 w-64 md:w-auto flex flex-col justify-between">
                <div>
                  <span className="text-[9px] uppercase font-mono text-teal-300 block mb-2">Rent Payment Metrics</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[8px] uppercase font-mono text-teal-400 block font-bold">Collected</span>
                      <strong className="text-xs font-display block mt-0.5">₦{pmcTotalCollected.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase font-mono text-rose-300 block font-bold">Outstanding</span>
                      <strong className="text-xs font-display block text-rose-300 mt-0.5">₦{pmcTotalOutstanding.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase font-mono text-[#C9A84C] block font-bold">Rate</span>
                      <strong className="text-xs font-display block text-[#C9A84C] mt-0.5">
                        {pmcTotalCollected + pmcTotalOutstanding > 0 
                          ? Math.round((pmcTotalCollected / (pmcTotalCollected + pmcTotalOutstanding)) * 100) 
                          : 100}%
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-teal-900/50 border border-teal-850 rounded-2xl p-4 shrink-0 w-64 md:w-auto">
                <span className="text-[9px] uppercase font-mono text-rose-300 block">Rent Outstanding Balance</span>
                <span className="text-xl font-display font-bold mt-1 block text-rose-300">₦{pmcTotalOutstanding.toLocaleString()}</span>
                <span className="text-[9px] text-red-300 font-mono italic leading-none">&bull; Due Soon/Overdue</span>
              </div>
            </div>
          </div>

          {/* PMC SUBSCRIPTION CAPACITY PROGRESS BAR */}
          <div className="bg-white border border-stone-200 p-6 rounded-3xl space-y-3 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center text-xs">
              <span className="font-display font-bold text-teal-950 uppercase tracking-wider">PMC Managed Properties Capacity Tracker</span>
              <span className="font-mono font-bold text-#6B7280">
                {(managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length} of {((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)} properties ({Math.round(((managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length / ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)) * 100)}%)
              </span>
            </div>
            
            <div className="w-full bg-stone-50 h-3 rounded-full overflow-hidden border border-stone-200">
              <div 
                className={`h-full ${
                  Math.round(((managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length / ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)) * 100) >= 90
                    ? "bg-rose-600"
                    : Math.round(((managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length / ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)) * 100) >= 70
                    ? "bg-amber-500"
                    : "bg-teal-700"
                } transition-all duration-500`} 
                style={{ width: `${Math.min(Math.round(((managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length / ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)) * 100), 100)}%` }}
              ></div>
            </div>

            {Math.round(((managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length / ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)) * 100) >= 70 && (
              <p className={`text-xs mt-1 animate-pulse ${
                Math.round(((managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length / ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)) * 100) >= 100
                  ? "text-rose-600 font-black uppercase"
                  : Math.round(((managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length / ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)) * 100) >= 90
                  ? "text-rose-600 font-bold"
                  : "text-amber-600 font-medium"
              }`}>
                &bull; {
                  Math.round(((managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length / ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)) * 100) >= 100
                    ? "Subscription limit reached. Your PMC organization cannot add properties until you upgrade."
                    : Math.round(((managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length / ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)) * 100) >= 90
                    ? `Only ${((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10) - (managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length} properties remaining in your PMC plan.`
                    : "Your organization is approaching its subscription property limit. Consider upgrading soon."
                }
              </p>
            )}
          </div>

          {/* PMC SUBSCRIPTION LIMIT REACHED FULL-SCREEN MODAL */}
          {showLimitModal && (
            <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-stone-200 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-scale-up">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-display font-black text-xl text-#132A1D uppercase tracking-tight">
                    Subscription Limit Reached
                  </h3>
                  <p className="text-xs text-#6B7280 leading-relaxed">
                    Your PMC organization's current plan allows up to <strong className="text-#132A1D">{((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)} active managed properties</strong>. You have reached this limit. To represent or add more properties, upgrade your subscription plan.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowLimitModal(false);
                      if (navigate) navigate('/pricing-and-services');
                    }}
                    className="w-full py-3 bg-[#C9A84C] hover:bg-[#b8973b] text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-lg shadow-amber-950/10"
                  >
                    Upgrade Plan
                  </button>
                  <button
                    onClick={() => setShowLimitModal(false)}
                    className="w-full py-3 bg-white hover:bg-stone-50 text-#6B7280 border border-stone-200 text-xs font-extrabold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MONEY AWAITING REMITTANCE CARD (Fix Two) */}
          <div className="bg-white border border-stone-200 p-6 md:p-8 rounded-3xl space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#18452E] font-semibold">
                  MONEY AWAITING REMITTANCE
                </span>
                <h3 className="text-2xl md:text-3xl font-display font-black text-#132A1D mt-1">
                  ₦{awaitingRemittanceAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-#6B7280 font-light mt-0.5">
                  Aggregate ledger delta between verified customer payments and processed landlord disbursements.
                </p>
              </div>

              {/* Dynamic status badge */}
              <div>
                {awaitingRemittanceAmt > 0 ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono">
                    <span className="w-2 h-2 rounded-full bg-rose-600 mr-1.5 animate-pulse"></span>
                    ₦{awaitingRemittanceAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })} AWAITING
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mr-1.5"></span>
                    ALL REMITTANCES SETTLED
                  </span>
                )}
              </div>
            </div>

            {/* THE THREE FIGURES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-stone-200 pt-4">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                <span className="text-[9px] uppercase font-mono text-#6B7280 block font-bold">Total Collected</span>
                <span className="text-lg font-display font-bold text-#132A1D mt-1 block">
                  ₦{totalCollectedAcrossPortfolio.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] text-stone-400 font-mono block mt-1">
                  Verified rent & shortlet bookings
                </span>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                <span className="text-[9px] uppercase font-mono text-#6B7280 block font-bold">Already Remitted</span>
                <span className="text-lg font-display font-bold text-emerald-700 mt-1 block">
                  ₦{totalAlreadyRemittedToLandlords.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] text-stone-400 font-mono block mt-1">
                  Disbursed & settled to landlords
                </span>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4">
                <span className="text-[9px] uppercase font-mono text-#6B7280 block font-bold">Net Awaiting Remittance</span>
                <span className="text-lg font-display font-bold text-rose-600 mt-1 block">
                  ₦{awaitingRemittanceAmt.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
                <span className="text-[9px] text-stone-400 font-mono block mt-1 font-semibold">
                  Collected minus Already Remitted
                </span>
              </div>
            </div>
          </div>

          {/* PROMPT FIVE: OPERATIONS BRIEFING ASSISTANT */}
          <OperationsBriefingCard role="PMC" userName={session.name} properties={properties} />

          {/* PROFILE COMPLETENESS & ANNOUNCEMENTS BENTO SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <ProfileCompletionIndicator 
                onAddBank={() => {
                  triggerSuccess("Corporate bank account added successfully to your PMC billing profile.");
                  writeAuditLog(
                    'BANK_ADDED',
                    'Linked new corporate FCMB Settlement Account for auto-remittance routing.',
                    'bank',
                    'FCMB-309',
                    'None',
                    'FCMB-309200',
                    'Finance Director'
                  );
                }}
                onGoToSubscription={() => setActiveTab('Subscription')}
                triggerSuccess={triggerSuccess}
              />
            </div>
            <div className="lg:col-span-7">
              <PlatformAnnouncements />
            </div>
          </div>

          {/* DASHBOARD WIDGETS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* TOP PERFORMING PROPERTIES (Fix Eight) */}
            <div className="space-y-6">
              {sortedPerformers.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 space-y-4 shadow-xs relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-amber-800 font-bold flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Top Performing Properties</span>
                    </div>
                    <select 
                      value={perfSortCriteria} 
                      onChange={(e) => setPerfSortCriteria(e.target.value as any)}
                      className="text-[9px] font-mono p-1 rounded border border-amber-300 bg-white text-amber-900 outline-none"
                    >
                      <option value="Combined">Sort: Overall Score</option>
                      <option value="Occupancy">Sort: Occupancy Rate</option>
                      <option value="Payment">Sort: Payment Reliability</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    {sortedPerformers.map((perf, idx) => {
                      const isLowest = idx === sortedPerformers.length - 1 && sortedPerformers.length > 1;
                      return (
                        <div key={perf.b.id} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-amber-100 shadow-sm relative">
                          {idx === 0 && (
                             <div className="absolute -top-2 -right-2 bg-amber-400 text-#132A1D font-bold px-2 py-0.5 rounded-full text-[8px] uppercase font-mono tracking-widest shadow-sm">
                               Top Performer
                             </div>
                          )}
                          {isLowest && (
                             <div className="absolute -top-2 -right-2 bg-rose-100 text-rose-700 font-bold px-2.5 py-0.5 rounded-full text-[8px] uppercase font-mono tracking-widest shadow-sm border border-rose-200 font-semibold">
                               Needs Attention
                             </div>
                          )}
                          <img 
                            src={perf.b.coverPhoto} 
                            alt={perf.b.name} 
                            className="w-12 h-12 rounded-lg object-cover border border-amber-200"
                          />
                          <div className="text-xs flex-1">
                            <h4 className="font-display font-black text-#132A1D text-xs uppercase leading-tight">{perf.b.name}</h4>
                            <div className="grid grid-cols-2 gap-2 mt-1 text-[9px] text-#6B7280 font-mono">
                              <div>Occ: <strong className="text-#132A1D">{Math.round(perf.occ)}%</strong></div>
                              <div>Pay: <strong className="text-#132A1D">{Math.round(perf.pay)}%</strong></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* TENANT COMPLAINTS WIDGET (Fix Seven) */}
            <div className="space-y-6">
              <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
                    <h4 className="font-display font-extrabold text-xs text-#132A1D uppercase">Tenant Complaints</h4>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <strong className="text-teal-950 block">Plumbing / Water</strong>
                      <span className="text-#6B7280 font-light block mt-0.5">Reported by: Kola Abiodun</span>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[9px] uppercase tracking-wider">Under Review</span>
                  </div>
                  <div className="text-[9px] font-mono text-stone-400">
                    Complaints are mediated exclusively by Unity Homes admin. Direct messaging is disabled to maintain zero-wahala guarantees.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {selectedBuildingId === null ? (
            /* LEVEL 1: GRID OF BUILDING CARDS */
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b pb-4">
                <div>
                  <h3 className="font-display font-black text-teal-950 uppercase text-sm">Managed Buildings Portfolio</h3>
                  <p className="text-#6B7280 font-light leading-relaxed text-xs">
                    Every building listed here is synchronized with your management license. Select a building below to review internal unit configurations and occupant parameters.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => {
                      const pmcActiveCount = (managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length;
                      const limit = (subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10;
                      if (pmcActiveCount >= limit) {
                        setShowLimitModal(true);
                        return;
                      }
                      setShowAddPmcProperty(!showAddPmcProperty);
                    }}
                    disabled={(managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length >= ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)}
                    title={(managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length >= ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10) ? "Subscription limit reached" : ""}
                    className={`px-4 py-2.5 text-xs font-extrabold rounded-xl flex items-center space-x-1 cursor-pointer transition ${
                      (managementCompanyProperties || []).filter(m => m.company_id === activePmcName && m.is_active === true).length >= ((subscriptions || []).find(s => s.entityId === activePmcName)?.property_limit || 10)
                        ? "bg-stone-50 text-stone-400 border border-stone-200 cursor-not-allowed"
                        : "bg-teal-800 text-white hover:bg-teal-950 shadow-md shadow-teal-950/10"
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Register Managed Property</span>
                  </button>
                </div>
              </div>

              {showAddPmcProperty && (
                <div className="bg-white border border-stone-200 p-6 rounded-3xl max-w-xl space-y-4 animate-scale-up">
                  <h4 className="font-display font-black text-xs text-teal-900 uppercase border-b pb-2">
                    Register New Property Under Management License
                  </h4>
                  <form onSubmit={handleAddPmcPropertySubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">PROPERTY NAME</label>
                      <input 
                        type="text" 
                        required
                        value={pmcNewPropertyName}
                        onChange={(e) => setPmcNewPropertyName(e.target.value)}
                        placeholder="e.g. Lekki Horizon Residences" 
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">STREET ADDRESS</label>
                      <input 
                        type="text" 
                        required
                        value={pmcNewPropertyAddress}
                        onChange={(e) => setPmcNewPropertyAddress(e.target.value)}
                        placeholder="e.g. 24 Adu Street, Lekki Phase 1, Lagos" 
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-700"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-teal-950 transition">
                        Confirm Registration
                      </button>
                      <button type="button" onClick={() => setShowAddPmcProperty(false)} className="px-4 py-2 bg-stone-50 text-#6B7280 rounded-xl text-xs font-bold cursor-pointer hover:bg-stone-200 transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(buildings && buildings.length > 0 ? buildings : initialBuildings).filter(b => {
                  if (activePmcName.includes('Prime')) return b.landlordCode === 'UH-LANDLORD-OSEI';
                  return b.landlordCode === 'UH-LANDLORD-MUSA';
                }).map((bld) => {
                  const bldUnits = pmcManagedUnits.filter(u => u.buildingId === bld.id);
                  const totalUnitsCount = bldUnits.length;
                  const occupiedCount = bldUnits.filter(u => u.paymentStatus !== 'Vacant').length;
                  const vacantCount = bldUnits.filter(u => u.paymentStatus === 'Vacant').length;

                  return (
                    <div 
                      key={bld.id}
                      onClick={() => setSelectedBuildingId(bld.id)}
                      className="bg-white border border-teal-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-teal-700 transition duration-300 cursor-pointer flex flex-col group"
                    >
                      <div className="h-40 w-full overflow-hidden relative">
                        <img 
                          src={bld.coverPhoto} 
                          alt={bld.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                        />
                        <div className="absolute top-3 right-3 bg-teal-950/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase text-white tracking-widest">
                          {bld.blockLabel}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="font-display font-extrabold text-teal-950 text-sm md:text-base leading-tight group-hover:text-teal-700 transition">
                            {bld.name}
                          </h4>
                          <p className="text-[11px] text-stone-400 mt-1 leading-normal font-light">
                            {bld.address}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 border-t border-teal-50 pt-3 text-center text-xs">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-stone-400 block">Total</span>
                            <strong className="text-#132A1D font-bold block">{totalUnitsCount} Units</strong>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-mono text-teal-600 block">Occupied</span>
                            <strong className="text-teal-700 font-bold block">{occupiedCount} Flats</strong>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-mono text-stone-400 block">Vacant</span>
                            <strong className="text-#6B7280 font-bold block">{vacantCount} Flats</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* LEVEL 2: SCUPED UNITS PAGE */
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setSelectedBuildingId(null)}
                  className="p-2 border border-teal-100 rounded-xl hover:bg-teal-50 cursor-pointer transition text-teal-850"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[9px] uppercase font-mono text-teal-600 font-bold tracking-wider block">
                    Building Unit Allocations
                  </span>
                  <h3 className="font-display font-black text-sm text-teal-950 uppercase">
                    {(buildings && buildings.length > 0 ? buildings : initialBuildings).find(b => b.id === selectedBuildingId)?.name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pmcManagedUnits.filter(u => u.buildingId === selectedBuildingId).map((u) => {
                  const photo = getPropertyPhoto(u.propertyName);
                  return (
                    <div 
                      key={u.id}
                      onClick={() => setSelectedUnit(u)} // LEVEL 3: Modal opens on card click
                      className="bg-white border border-teal-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-teal-700 transition duration-200 cursor-pointer flex flex-col group"
                    >
                      <div className="h-40 w-full overflow-hidden relative">
                        <img 
                          src={photo} 
                          alt={u.propertyName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                        />
                        <div className="absolute top-3 right-3 bg-teal-950/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase text-white tracking-widest">
                          {u.unitNumber}
                        </div>
                      </div>

                      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-display font-extrabold text-teal-950 text-sm md:text-base leading-tight">
                            {u.propertyName}
                          </h4>
                          <p className="text-[9px] text-teal-600 font-mono tracking-wider mt-1">{getCollectionAccountName(u.propertyName).split(' (AC')[0]}</p>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs pt-3 border-t border-teal-50/50">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-stone-400 block">Tenant Assigned</span>
                            <strong className="text-#6B7280 font-medium block">{u.tenantName}</strong>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] uppercase font-mono text-stone-400 block">Payout value</span>
                            <div className="flex items-center space-x-1.5 justify-end">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                                u.paymentStatus === 'Paid' ? 'bg-emerald-100 text-[#18452E]' : 'bg-amber-100 text-amber-900'
                              }`}>{u.paymentStatus}</span>
                              <strong className="font-mono font-black text-teal-700">₦{u.rentAmount.toLocaleString()}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LANDLORD CLIENTS */}
      {activeTab === 'Clients' && (
        <div className="bg-white border border-teal-100 rounded-3xl p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="font-display font-black text-teal-950 uppercase text-sm">Landlord Client Parameters</h3>
            {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
            <p className="text-#6B7280 font-light mt-1">
              Track payouts, payment logs, and review tenant dossiers for property owners represented under your management license:
            </p>
          </div>

          {/* SEARCH & FILTERS CONTROLS */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-3 text-xs">
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Search landlord by name..."
                value={clientsSearch}
                onChange={(e) => setClientsSearch(e.target.value)}
                className="flex-1 p-3 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-700 font-medium"
              />
              <button
                onClick={() => setIsClientsExportOpen(true)}
                className="px-4 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Export Client Records</span>
              </button>
            </div>
            
            <div className="pt-2 border-t border-stone-150">
              <SavedFilters
                listId="landlords"
                activeFilters={clientsActiveFilters}
                onApplyFilter={(f) => setClientsActiveFilters(f)}
                triggerSuccess={triggerSuccess}
              />
            </div>
          </div>

          {/* EXPORT DIALOG */}
          <ExportCenter
            title="Landlord Representative Directory"
            data={Array.from(new Set(pmcManagedUnits.map(u => getLandlordName(u.propertyName)))).filter(landlordName => landlordName.toLowerCase().includes(clientsSearch.toLowerCase()))}
            columns={[
              { header: 'Landlord Partner', accessor: (l: string) => l },
              { header: 'Allocated Units', accessor: (l: string) => pmcManagedUnits.filter(u => getLandlordName(u.propertyName) === l).length },
              { header: 'Aggregated Asset Portfolio Value', accessor: (l: string) => `₦${pmcManagedUnits.filter(u => getLandlordName(u.propertyName) === l).reduce((sum, u) => sum + u.rentAmount, 0).toLocaleString()}` }
            ]}
            activeFiltersDesc={clientsActiveFilters.filterStatus || 'All Clients'}
            isOpen={isClientsExportOpen}
            onClose={() => setIsClientsExportOpen(false)}
            triggerSuccess={triggerSuccess}
          />

          <div className="space-y-6">
            {/* Group properties for Landlord Clients View (Step 3) */}
            {(() => {
              const landlordNames = Array.from(new Set(pmcManagedUnits.map(u => getLandlordName(u.propertyName))));
              const filteredLandlords = landlordNames.filter(landlordName => {
                const matchesSearch = landlordName.toLowerCase().includes(clientsSearch.toLowerCase());
                
                // ONLY include properties that HAVE a set management fee percentage (Step 1 compliance check)
                const unitsInLandlord = pmcManagedUnits.filter(u => 
                  getLandlordName(u.propertyName) === landlordName &&
                  getPropertyFeePercentage(u.propertyName) !== undefined
                );
                const collectedRent = unitsInLandlord.filter(u => u.paymentStatus === 'Paid').reduce((sum, u) => sum + u.rentAmount, 0);
                const landlordRemittances = bookings.filter(b => getLandlordName(b.propertyName) === landlordName);
                const actualRemitted = landlordRemittances
                  .filter(b => b.status === 'Acknowledged' || b.status === 'Pending Acknowledgement')
                  .reduce((sum, b) => sum + b.remittanceAmount, 0);
                
                // Calculate management fee dynamically based on each property's fee %
                const managementFee = unitsInLandlord
                  .filter(u => u.paymentStatus === 'Paid')
                  .reduce((sum, u) => {
                    const pct = getPropertyFeePercentage(u.propertyName) || 10;
                    return sum + u.rentAmount * (pct / 100);
                  }, 0);

                const awaitingRemittance = collectedRent > 0 ? (collectedRent - actualRemitted - managementFee) : 0;

                let matchesFilter = true;
                if (clientsActiveFilters.filterStatus === 'Action Required') {
                  matchesFilter = awaitingRemittance > 0;
                } else if (clientsActiveFilters.filterStatus === 'Nothing Outstanding') {
                  matchesFilter = awaitingRemittance === 0;
                }
                
                return matchesSearch && matchesFilter;
              });

              return filteredLandlords.map(landlordName => {
                // Compliance check: exclude units without a management fee percentage
                const unitsInLandlord = pmcManagedUnits.filter(u => 
                  getLandlordName(u.propertyName) === landlordName &&
                  getPropertyFeePercentage(u.propertyName) !== undefined
                );
                const expectedRent = unitsInLandlord.reduce((sum, u) => sum + u.rentAmount, 0);
                const collectedRent = unitsInLandlord.filter(u => u.paymentStatus === 'Paid').reduce((sum, u) => sum + u.rentAmount, 0);
                
                // Calculate management fee dynamically
                const managementFee = unitsInLandlord
                  .filter(u => u.paymentStatus === 'Paid')
                  .reduce((sum, u) => {
                    const pct = getPropertyFeePercentage(u.propertyName) || 10;
                    return sum + u.rentAmount * (pct / 100);
                  }, 0);
                
                // NEW LIVE CALCULATION FOR REMITTANCE AND FULLY ACCOUNTED STATUS
                const landlordRemittances = bookings.filter(b => getLandlordName(b.propertyName) === landlordName);
                const actualRemitted = landlordRemittances
                  .filter(b => b.status === 'Acknowledged' || b.status === 'Pending Acknowledgement')
                  .reduce((sum, b) => sum + b.remittanceAmount, 0);

                const hasOutstandingRemittances = landlordRemittances.some(b => !b.remittanceFormSent || b.status === 'Pending');

                // The Fully Accounted status check (Step 4)
                const isFullyAccounted = 
                  collectedRent > 0 && 
                  Math.abs(actualRemitted + managementFee - collectedRent) < 1 && 
                  !hasOutstandingRemittances;
                
                const awaitingRemittance = collectedRent > 0 ? (collectedRent - actualRemitted - managementFee) : 0;
                const isExpanded = expandedLandlords.includes(landlordName);
                const hasActiveTenants = unitsInLandlord.some(u => u.paymentStatus !== 'Vacant');

                // Determine agreed fee percentage range/label for landlord card
                const landlordProperties = (managementCompanyProperties || []).filter(
                  m => m.company_id === activePmcName && 
                       m.is_active !== false && 
                       getLandlordName(m.propertyName) === landlordName &&
                       m.management_fee_percentage !== undefined
                );
                const feePercentages = landlordProperties.map(m => m.management_fee_percentage);
                let feePercentageLabel = "No Fee Set";
                if (feePercentages.length > 0) {
                  const uniquePcts = Array.from(new Set(feePercentages)).sort((a, b) => a - b);
                  if (uniquePcts.length === 1) {
                    feePercentageLabel = `Agreed Fee: ${uniquePcts[0]}%`;
                  } else {
                    feePercentageLabel = `Agreed Fee: ${uniquePcts[0]}% to ${uniquePcts[uniquePcts.length - 1]}%`;
                  }
                }

              return (
                <div key={landlordName} className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
                  <div 
                    onClick={() => toggleLandlordExpand(landlordName)}
                    className="p-5 flex justify-between items-center cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                        <div>
                          <h4 className="font-display font-black text-[#18452E] text-sm uppercase flex items-center gap-2 flex-wrap">
                            <span>{landlordName}</span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] rounded-full font-mono font-bold tracking-wider uppercase">
                              {feePercentageLabel}
                            </span>
                          </h4>
                          <span className="text-[10px] text-stone-400 font-mono">
                            Properties: {Array.from(new Set(unitsInLandlord.map(u => u.propertyName))).length} &bull; Units: {unitsInLandlord.length}
                          </span>
                        </div>
                        {/* Money Awaiting Remittance Card included inline as per Step 3 focused view */}
                        <div className="text-right flex items-center space-x-3 bg-stone-50 p-2 rounded-lg border border-stone-200">
                           <div className="text-right">
                             <span className="block text-[9px] uppercase font-bold text-stone-400">Awaiting Remittance</span>
                             <span className="block font-mono font-black text-#132A1D">₦{awaitingRemittance.toLocaleString()}</span>
                           </div>
                           {awaitingRemittance > 0 ? (
                             <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded tracking-wider shadow-sm border border-red-200">
                               Action Required
                             </span>
                           ) : (
                             <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded tracking-wider shadow-sm border border-emerald-200">
                               Nothing Outstanding
                             </span>
                           )}
                        </div>
                      </div>
                      {/* Landlord Transparency Center figures (Step 3) */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="block text-[9px] uppercase font-bold text-#6B7280 mb-1">Portfolio Value</span>
                          <span className="block font-mono font-bold text-#132A1D text-xs">₦{expectedRent.toLocaleString()}</span>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="block text-[9px] uppercase font-bold text-#6B7280 mb-1">Collected Rent</span>
                          <span className="block font-mono font-bold text-#132A1D text-xs">₦{collectedRent.toLocaleString()}</span>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="block text-[9px] uppercase font-bold text-#6B7280 mb-1">Remitted Rent</span>
                          <span className="block font-mono font-bold text-#132A1D text-xs">₦{actualRemitted.toLocaleString()}</span>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="block text-[9px] uppercase font-bold text-#6B7280 mb-1">Management Fee</span>
                          <span className="block font-mono font-bold text-#132A1D text-xs">₦{managementFee.toLocaleString()}</span>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col justify-center items-start">
                          <span className="block text-[9px] uppercase font-bold text-#6B7280 mb-1">Status</span>
                          {collectedRent === 0 ? (
                            <span className="text-[10px] bg-stone-50 text-#6B7280 px-2 py-0.5 rounded font-bold uppercase border border-stone-200">No Payments Recorded</span>
                          ) : isFullyAccounted ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase border border-emerald-200">{'Fully Accounted'}</span>
                          ) : (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase border border-amber-200">Discrepancy</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex items-center justify-center">
                      <ChevronDown className={`w-6 h-6 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t border-stone-200 bg-stone-50/50 p-5 space-y-3">
                      {!hasActiveTenants ? (
                        <div className="text-center py-6">
                          <span className="text-stone-400 font-mono text-sm">No active tenancies for this landlord. All units may be vacant.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h5 className="text-[10px] uppercase font-bold text-#6B7280 mb-2">Tenant Roster</h5>
                          {unitsInLandlord.filter(u => u.paymentStatus !== 'Vacant').map(u => {
                              let tenantDetails;
                              try {
                                tenantDetails = getTenantDetails(u.tenantName, u.tenantCode, u.rentAmount, u.propertyName);
                              } catch (e) {
                                console.error(e);
                                tenantDetails = { passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', fullName: 'Tenant details unavailable' };
                              }
                              return (
                            <div 
                              key={u.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedUnit(u); }}
                              className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={getTenantDetails(u.tenantName, u.tenantCode, u.rentAmount, u.propertyName).passportPhoto} 
                                  alt={u.tenantName} 
                                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                                />
                                <div>
                                  <strong className="block text-[#18452E] font-bold text-sm">{u.tenantName}</strong>
                                  <span className="block text-#6B7280 text-[10px] mt-0.5">{u.propertyName} ({u.unitNumber})</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                {u.paymentStatus === 'Paid' ? (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-bold uppercase">Paid</span>
                                ) : u.paymentStatus === 'Due Soon' ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold uppercase">Due Soon</span>
                                ) : u.paymentStatus === 'Overdue' ? (
                                  <div className="text-right">
                                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-1 rounded font-bold uppercase block mb-1">Overdue</span>
                                    <span className="text-xs font-mono font-black text-red-700 block">₦{u.rentAmount.toLocaleString()}</span>
                                  </div>
                                ) : u.paymentStatus === 'Lease Expiring Soon' ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-bold uppercase">Expiring</span>
                                ) : (
                                  <span className="text-[10px] bg-stone-50 text-#132A1D px-2 py-1 rounded font-bold uppercase">{u.paymentStatus}</span>
                                )}
                              </div>
                            </div>
                          );
                          })}
                        </div>
                      )}

                      {/* Landlord Audit history */}
                      <div className="pt-4 border-t border-stone-200 mt-4">
                        <AuditHistoryTab recordType="landlord" recordId={landlordName} />
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
          </div>
          {/* PRIVATE REPRESENTED TENANT DOSSIER MATRIX (Fix Seven) */}
          <div className="space-y-3 pt-4 border-t border-teal-50">
            <h4 className="font-display font-black text-teal-950 uppercase text-xs tracking-wider">Represented Tenant Dossiers</h4>
            <p className="text-stone-400 text-xs font-light">Directly review complete dossiers, verified guarantor parameters, and historical clearances:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pmcManagedUnits.map((u) => {
                  let tenantDetails;
                  try {
                    tenantDetails = getTenantDetails(u.tenantName, u.tenantCode, u.rentAmount, u.propertyName);
                  } catch (e) {
                    tenantDetails = { passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', fullName: 'Tenant details unavailable' };
                  }
                  return (
                <div 
                  key={u.id}
                  onClick={() => setSelectedUnit(u)} // Modal opens on client list click (Fix Seven)
                  className="p-4 bg-white border border-teal-50 hover:border-teal-400 hover:shadow-xs transition duration-200 rounded-2xl flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <img 
                      src={tenantDetails.passportPhoto} 
                      alt={u.tenantName} 
                      className="w-10 h-10 rounded-full object-cover border border-teal-100 shrink-0" 
                    />
                    <div>
                      <strong className="block text-teal-955 text-xs font-semibold">{u.tenantName}</strong>
                      <span className="text-[10px] text-stone-400 block">{u.propertyName} ({u.unitNumber})</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl font-bold uppercase">
                    Review File
                  </span>
                </div>
              );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: RENT PAYMENTS */}
      {activeTab === 'Payments' && (
        <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
          
          {/* SEARCH & FILTERS CONTROLS */}
          <div className="bg-white border border-teal-100 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
                <h3 className="font-display font-black text-teal-950 uppercase text-sm">Rent confirmed payments log</h3>
                <p className="text-#6B7280 font-light text-xs mt-0.5">Mirror of active confirmed rent entries under validated verification:</p>
              </div>
              <div className="flex items-center space-x-2 bg-teal-50/60 px-4 py-2.5 rounded-2xl border border-teal-100">
                <input 
                  id="installment-filter-checkbox"
                  type="checkbox" 
                  checked={showInstallmentOnly} 
                  onChange={(e) => setShowInstallmentOnly(e.target.checked)}
                  className="w-4 h-4 text-teal-700 border-stone-300 rounded focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="installment-filter-checkbox" className="text-xs font-bold text-teal-950 cursor-pointer select-none">
                  Show Installment Tenancies Only
                </label>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-stone-200">
              <input 
                type="text" 
                placeholder="Search rent log by tenant, property, or unit..."
                value={paymentsSearch}
                onChange={(e) => setPaymentsSearch(e.target.value)}
                className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-700 font-medium"
              />
              <button
                onClick={() => setIsPaymentsExportOpen(true)}
                className="px-4 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Export Payments</span>
              </button>
              <button
                onClick={() => {
                  setPaymentsBulkMode(!paymentsBulkMode);
                  setSelectedPaymentIds([]);
                }}
                className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  paymentsBulkMode ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-50 border border-stone-200 text-#132A1D hover:bg-stone-150'
                }`}
              >
                <span>{paymentsBulkMode ? 'Exit Bulk Selection' : 'Bulk Operations'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-stone-200">
              <SavedFilters
                listId="payments"
                activeFilters={paymentsActiveFilters}
                onApplyFilter={(f) => setPaymentsActiveFilters(f)}
                triggerSuccess={triggerSuccess}
              />
            </div>
          </div>

          {/* EXPORT CENTER FOR PAYMENTS */}
          {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
          <ExportCenter
            title="Rent Confirmation & Payments Ledger"
            data={(() => {
              const regularPayments = pmcManagedUnits.filter(u => u.paymentStatus === 'Paid' && !u.hasInstallmentSchedule).map(u => ({
                id: `reg-${u.id}`,
                tenantName: u.tenantName,
                propertyName: u.propertyName,
                unitNumber: u.unitNumber,
                type: 'Regular Lease',
                amount: u.rentAmount,
                dueDate: '25th Aug 2026',
                status: 'Paid'
              }));

              const installmentPayments: any[] = [];
              pmcManagedUnits.filter(u => u.hasInstallmentSchedule).forEach(u => {
                u.installments?.forEach((inst, index) => {
                  installmentPayments.push({
                    id: `inst-${u.id}-${index}`,
                    tenantName: u.tenantName,
                    propertyName: u.propertyName,
                    unitNumber: u.unitNumber,
                    type: 'Installment',
                    amount: inst.amount,
                    dueDate: inst.dueDate,
                    status: inst.status
                  });
                });
              });

              const allPayments = [...regularPayments, ...installmentPayments];
              return allPayments.filter(p => {
                const matchesSearch = p.tenantName.toLowerCase().includes(paymentsSearch.toLowerCase()) ||
                                      p.propertyName.toLowerCase().includes(paymentsSearch.toLowerCase()) ||
                                      p.unitNumber.toLowerCase().includes(paymentsSearch.toLowerCase()) ||
                                      (p.transfer_reference && p.transfer_reference.toLowerCase().includes(paymentsSearch.toLowerCase())) ||
                                      (p.bankReference && p.bankReference.toLowerCase().includes(paymentsSearch.toLowerCase()));
                
                let matchesFilter = true;
                if (paymentsActiveFilters.filterStatus === 'Paid Only') {
                  {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
                  matchesFilter = p.status === 'Paid' || p.status === 'Verified & Confirmed';
                } else if (paymentsActiveFilters.filterStatus === 'Unpaid / Arrears') {
                  matchesFilter = p.status === 'Unpaid' || p.status === 'Overdue';
                }

                let matchesInstallment = true;
                if (showInstallmentOnly) {
                  matchesInstallment = p.type === 'Installment';
                }

                return matchesSearch && matchesFilter && matchesInstallment;
              });
            })()}
            columns={[
              { header: 'Tenant', accessor: (p: any) => p.tenantName },
              { header: 'Property Asset', accessor: (p: any) => `${p.propertyName} (${p.unitNumber})` },
              { header: 'Category', accessor: (p: any) => p.type },
              { header: 'Amount Due/Paid', accessor: (p: any) => `₦${p.amount.toLocaleString()}` },
              { header: 'Due Date', accessor: (p: any) => p.dueDate },
              { header: 'Status', accessor: (p: any) => p.status }
            ]}
            activeFiltersDesc={paymentsActiveFilters.filterStatus || 'All Payments'}
            isOpen={isPaymentsExportOpen}
            onClose={() => setIsPaymentsExportOpen(false)}
            triggerSuccess={triggerSuccess}
          />

          {/* BULK ACTIONS BAR */}
          {paymentsBulkMode && (
            <div className="bg-amber-50 border border-amber-300 rounded-3xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-in">
              <div>
                <strong className="text-amber-950 font-bold block text-xs uppercase font-mono">BULK PAYMENT OPERATIONS ACTIVE</strong>
                <span className="text-[10px] text-amber-800">Selected <strong className="font-mono">{selectedPaymentIds.length}</strong> items.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    triggerSuccess(`Bulk marked ${selectedPaymentIds.length} rent payments as Cleared & Settled.`);
                    setSelectedPaymentIds([]);
                    setPaymentsBulkMode(false);
                  }}
                  className="px-3 py-1.5 bg-teal-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider"
                >
                  Confirm &amp; Settle
                </button>
                <button
                  onClick={() => {
                    triggerSuccess(`Dispatched bulk WhatsApp payment reminders to ${selectedPaymentIds.length} tenants.`);
                    setSelectedPaymentIds([]);
                    setPaymentsBulkMode(false);
                  }}
                  className="px-3 py-1.5 bg-teal-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider"
                >
                  Send Reminders
                </button>
                <button
                  onClick={() => {
                    setSelectedPaymentIds([]);
                    setPaymentsBulkMode(false);
                  }}
                  className="px-3 py-1.5 bg-stone-200 text-#132A1D rounded-lg font-bold text-[10px] uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showInstallmentOnly ? (
            <div className="bg-white border border-teal-100 rounded-3xl p-6 space-y-4">
              <div className="space-y-3">
                {pmcManagedUnits
                  .filter(u => u.paymentStatus === 'Paid' && !u.hasInstallmentSchedule)
                  .filter(u => {
                    return u.tenantName.toLowerCase().includes(paymentsSearch.toLowerCase()) ||
                           u.propertyName.toLowerCase().includes(paymentsSearch.toLowerCase());
                  })
                  .map((u) => (
                    <div key={u.id} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="block text-teal-950 text-sm">{u.tenantName} - {u.propertyName}</strong>
                        <span className="block text-stone-400 text-[10px] mt-0.5">{u.unitNumber} &bull; {getCollectionAccountName(u.propertyName)}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-[#18452E] text-base block">₦{u.rentAmount.toLocaleString()}</span>
                        <span className="text-[9px] font-mono text-emerald-800 font-bold bg-emerald-100 rounded px-1.5 py-0.5 inline-block mt-1">Payment Confirmed</span>
                      </div>
                    </div>
                  ))}
                {pmcManagedUnits.filter(u => u.paymentStatus === 'Paid' && !u.hasInstallmentSchedule).length === 0 && (
                  <p className="text-stone-400 italic text-center py-6 text-xs">No confirmed regular rent payments to show.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* RUNNING TOTALS METRIC ROW */}
              {(() => {
                const installmentUnits = pmcManagedUnits
                  .filter(u => u.hasInstallmentSchedule)
                  .filter(u => {
                    return u.tenantName.toLowerCase().includes(paymentsSearch.toLowerCase()) ||
                           u.propertyName.toLowerCase().includes(paymentsSearch.toLowerCase());
                  });
                const totalAnnualRent = installmentUnits.reduce((sum, u) => sum + u.rentAmount, 0);
                const totalReceived = installmentUnits.reduce((sum, u) => sum + (u.rentPaid || 0), 0);
                const outstandingBalance = totalAnnualRent - totalReceived;
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#C9A84C] block">Total Annual Rent Expected</span>
                      <strong className="text-2xl font-display font-black text-teal-950 block mt-1">₦{totalAnnualRent.toLocaleString()}</strong>
                      <span className="text-[10px] text-stone-400 mt-1 block">Sum of all active lease values</span>
                    </div>
                    <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">Total Received to Date</span>
                      <strong className="text-2xl font-display font-black text-emerald-600 block mt-1">₦{totalReceived.toLocaleString()}</strong>
                      <span className="text-[10px] text-stone-400 mt-1 block">Cleared ledger collection amounts</span>
                    </div>
                    <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-600 block">Outstanding Balance</span>
                      <strong className="text-2xl font-display font-black text-rose-600 block mt-1">₦{outstandingBalance.toLocaleString()}</strong>
                      <span className="text-[10px] text-stone-400 mt-1 block">Expected upcoming collections</span>
                    </div>
                  </div>
                );
              })()}

              {/* INSTALLMENT SCHEDULE LIST BY TENANT */}
              <div className="space-y-4">
                {pmcManagedUnits
                  .filter(u => u.hasInstallmentSchedule)
                  .filter(u => {
                    return u.tenantName.toLowerCase().includes(paymentsSearch.toLowerCase()) ||
                           u.propertyName.toLowerCase().includes(paymentsSearch.toLowerCase());
                  })
                  .map((u) => {
                  const pctPaid = u.rentAmount > 0 ? Math.round(((u.rentPaid || 0) / u.rentAmount) * 100) : 0;
                  return (
                    <div key={u.id} className="bg-white border border-teal-100 rounded-3xl p-6 shadow-sm space-y-4">
                      
                      {/* HEADER */}
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-stone-200">
                        <div>
                          <h4 className="font-display font-black text-teal-950 text-sm uppercase">{u.tenantName}</h4>
                          <span className="text-[11px] text-#6B7280 font-mono mt-0.5 block">{u.propertyName} ({u.unitNumber}) &bull; Landlord: {getLandlordName(u.propertyName)}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-stone-400 uppercase">Lease Term Progress</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-mono text-xs font-bold text-teal-900">₦{(u.rentPaid || 0).toLocaleString()} / ₦{u.rentAmount.toLocaleString()} ({pctPaid}%)</span>
                          </div>
                          <div className="w-48 bg-stone-50 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-teal-700 h-full" style={{ width: `${pctPaid}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* INSTALLMENTS TIMELINE */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-stone-200 text-[9px] font-mono text-stone-400 uppercase">
                              <th className="py-2">Installment ID</th>
                              <th className="py-2">Due Date</th>
                              <th className="py-2">Expected Amount</th>
                              <th className="py-2">Status</th>
                              <th className="py-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {u.installments?.map((inst, index) => {
                              const overdueDays = getDaysOverdue(inst.dueDate);
                              const isOverdue = inst.status === 'Overdue';
                              
                              return (
                                <tr key={inst.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                                  <td className="py-3 font-mono font-bold text-teal-950 flex items-center">
                                    {paymentsBulkMode && (
                                      <input 
                                        type="checkbox" 
                                        checked={selectedPaymentIds.includes(inst.id)}
                                        onChange={() => {
                                          setSelectedPaymentIds(prev => prev.includes(inst.id) ? prev.filter(id => id !== inst.id) : [...prev, inst.id]);
                                        }}
                                        className="w-3.5 h-3.5 text-teal-700 border-stone-300 rounded focus:ring-teal-500 cursor-pointer mr-2.5"
                                      />
                                    )}
                                    <span>Installment #{index + 1}</span>
                                  </td>
                                  <td className="py-3 font-mono text-#6B7280">{inst.dueDate}</td>
                                  <td className="py-3 font-mono font-bold text-teal-950">₦{inst.amount.toLocaleString()}</td>
                                  <td className="py-3">
                                    {isOverdue ? (
                                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[10px] font-bold">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>Overdue ({overdueDays} Days)</span>
                                      </span>
                                    ) : inst.status === 'Paid' ? (
                                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span>Paid & Cleared</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-stone-50 text-#6B7280 border border-stone-200 rounded-full text-[10px] font-bold">
                                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                        <span>Unpaid</span>
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 text-right space-x-1.5">
                                    {isOverdue && (
                                      <div className="flex justify-end gap-1.5">
                                        <button 
                                          onClick={() => setShowConfirmInstallmentModal({ unit: u, installment: inst })}
                                          className="px-2.5 py-1 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg text-[10px] transition cursor-pointer inline-flex items-center space-x-1"
                                        >
                                          <CheckCircle className="w-3 h-3" />
                                          <span>Confirm Payment</span>
                                        </button>
                                        <button 
                                          onClick={() => handleSendReminder(u, inst)}
                                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold rounded-lg text-[10px] transition cursor-pointer inline-flex items-center space-x-1"
                                        >
                                          <Bell className="w-3 h-3" />
                                          <span>Send Reminder</span>
                                        </button>
                                        <button 
                                          onClick={() => {
                                            setShowPromiseModal({ unit: u, installment: inst });
                                            setPromiseDate(inst.dueDate);
                                            setPromiseNote('');
                                          }}
                                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-lg text-[10px] transition cursor-pointer inline-flex items-center space-x-1"
                                        >
                                          <MessageSquare className="w-3 h-3" />
                                          <span>Promise to Pay</span>
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MAINTENANCE & DAMAGE */}
      {activeTab === 'Maintenance' && (
        <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
          
          {/* SEARCH & FILTERS CONTROLS */}
          <div className="bg-white border border-teal-100 rounded-3xl p-5 space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-display font-black text-teal-950 uppercase text-sm">Maintenance &amp; Repair Work orders</h3>
                <p className="text-#6B7280 font-light text-xs mt-0.5">Track, schedule, and execute building repairs under PMC supervision:</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-stone-200">
              <input 
                type="text" 
                placeholder="Search work orders by asset, issue, priority, or status..."
                value={maintSearch}
                onChange={(e) => setMaintSearch(e.target.value)}
                className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-700 font-medium"
              />
              <button
                onClick={() => setIsMaintExportOpen(true)}
                className="px-4 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Export Jobs</span>
              </button>
              <button
                onClick={() => {
                  setMaintBulkMode(!maintBulkMode);
                  setSelectedMaintIds([]);
                }}
                className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition ${
                  maintBulkMode ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-50 border border-stone-200 text-#132A1D hover:bg-stone-150'
                }`}
              >
                <span>{maintBulkMode ? 'Exit Bulk Selection' : 'Bulk Operations'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-stone-200">
              <SavedFilters
                listId="maintenance"
                activeFilters={maintActiveFilters}
                onApplyFilter={(f) => setMaintActiveFilters(f)}
                triggerSuccess={triggerSuccess}
              />
            </div>
          </div>

          {/* EXPORT CENTER FOR MAINTENANCE */}
          <ExportCenter
            title="Building Maintenance Work Orders Ledger"
            data={(() => {
              return maintenanceJobs.filter(job => {
                const matchesSearch = job.property.toLowerCase().includes(maintSearch.toLowerCase()) ||
                                      job.issue.toLowerCase().includes(maintSearch.toLowerCase()) ||
                                      job.priority.toLowerCase().includes(maintSearch.toLowerCase()) ||
                                      job.status.toLowerCase().includes(maintSearch.toLowerCase());
                
                let matchesFilter = true;
                if (maintActiveFilters.filterStatus === 'High Priority Only') {
                  matchesFilter = job.priority === 'High';
                } else if (maintActiveFilters.filterStatus === 'Resolved Jobs') {
                  matchesFilter = job.status === 'Resolved & Closed';
                } else if (maintActiveFilters.filterStatus === 'Pending / Active') {
                  matchesFilter = job.status !== 'Resolved & Closed';
                }

                return matchesSearch && matchesFilter;
              });
            })()}
            columns={[
              { header: 'Property Asset', accessor: (j: any) => j.property },
              { header: 'Reported Issue', accessor: (j: any) => j.issue },
              { header: 'Priority Rating', accessor: (j: any) => j.priority },
              { header: 'Current Status', accessor: (j: any) => j.status }
            ]}
            activeFiltersDesc={maintActiveFilters.filterStatus || 'All Work Orders'}
            isOpen={isMaintExportOpen}
            onClose={() => setIsMaintExportOpen(false)}
            triggerSuccess={triggerSuccess}
          />

          {/* BULK ACTIONS BAR */}
          {maintBulkMode && (
            <div className="bg-amber-50 border border-amber-300 rounded-3xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-in">
              <div>
                <strong className="text-amber-950 font-bold block text-xs uppercase font-mono">BULK MAINTENANCE ACTIONS ACTIVE</strong>
                <span className="text-[10px] text-amber-800">Selected <strong className="font-mono">{selectedMaintIds.length}</strong> items.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const updated = maintenanceJobs.map(job => 
                      selectedMaintIds.includes(job.id) ? { ...job, status: 'Resolved & Closed' } : job
                    );
                    setMaintenanceJobs(updated);
                    triggerSuccess(`Bulk approved estimates and closed ${selectedMaintIds.length} maintenance tickets.`);
                    setSelectedMaintIds([]);
                    setMaintBulkMode(false);
                  }}
                  className="px-3 py-1.5 bg-teal-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider"
                >
                  Bulk Resolve
                </button>
                <button
                  onClick={() => {
                    triggerSuccess(`Dispatched bulk caretaker instructions to field operators for ${selectedMaintIds.length} properties.`);
                    setSelectedMaintIds([]);
                    setMaintBulkMode(false);
                  }}
                  className="px-3 py-1.5 bg-teal-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider"
                >
                  Bulk Notify
                </button>
                <button
                  onClick={() => {
                    setSelectedMaintIds([]);
                    setMaintBulkMode(false);
                  }}
                  className="px-3 py-1.5 bg-stone-200 text-#132A1D rounded-lg font-bold text-[10px] uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* JOBS LIST CONTAINER */}
          <div className="bg-white border border-teal-100 rounded-3xl p-6 space-y-4">
            <div className="space-y-3">
              {(() => {
                const filteredJobs = maintenanceJobs.filter(job => {
                  const matchesSearch = job.property.toLowerCase().includes(maintSearch.toLowerCase()) ||
                                        job.issue.toLowerCase().includes(maintSearch.toLowerCase()) ||
                                        job.priority.toLowerCase().includes(maintSearch.toLowerCase()) ||
                                        job.status.toLowerCase().includes(maintSearch.toLowerCase());
                  
                  let matchesFilter = true;
                  if (maintActiveFilters.filterStatus === 'High Priority Only') {
                    matchesFilter = job.priority === 'High';
                  } else if (maintActiveFilters.filterStatus === 'Resolved Jobs') {
                    matchesFilter = job.status === 'Resolved & Closed';
                  } else if (maintActiveFilters.filterStatus === 'Pending / Active') {
                    matchesFilter = job.status !== 'Resolved & Closed';
                  }

                  return matchesSearch && matchesFilter;
                });

                return (
                  <>
                    {filteredJobs.map((job) => (
                      <div key={job.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-3">
                          {maintBulkMode && (
                            <input 
                              type="checkbox" 
                              checked={selectedMaintIds.includes(job.id)}
                              onChange={() => {
                                setSelectedMaintIds(prev => prev.includes(job.id) ? prev.filter(id => id !== job.id) : [...prev, job.id]);
                              }}
                              className="w-4 h-4 text-teal-700 border-stone-300 rounded focus:ring-teal-500 cursor-pointer mt-1"
                            />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <strong className="text-[#18452E]">{job.property}</strong>
                              <span className={`text-[9px] font-bold px-1.5 rounded ${job.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'}`}>
                                {job.priority} Priority
                              </span>
                            </div>
                            <p className="text-#6B7280 font-light mt-1">&quot;{job.issue}&quot;</p>
                            <span className="text-[10px] text-stone-400 block mt-0.5">Status Check: {job.status}</span>
                          </div>
                        </div>
                        
                        {job.status !== 'Resolved & Closed' && (
                          <button onClick={() => handleResolveJob(job.id)} className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded text-xs cursor-pointer shrink-0">
                            Approve Estimate / Close Job
                          </button>
                        )}
                      </div>
                    ))}
                    {filteredJobs.length === 0 && (
                      <p className="text-stone-400 italic text-center py-6 text-xs">No matching maintenance tickets found.</p>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* INTEGRATED AUDIT HISTORY FOR MAINTENANCE */}
          <div className="bg-white border border-teal-100 rounded-3xl p-6 space-y-3">
            <div>
              <h4 className="font-display font-black text-teal-950 uppercase text-xs">System Activity &amp; Maintenance Audit</h4>
              <p className="text-stone-400 text-[10px] font-light">Authenticated audit log record of operations executed under the maintenance module.</p>
            </div>
            <div className="pt-2 border-t border-stone-200">
              <AuditHistoryTab recordType="maintenance" recordId="maintenance" />
            </div>
          </div>

        </div>
      )}

      {/* TAB 4b: WASTE & REFUSE COMPLAINTS */}
      {activeTab === 'WasteComplaints' && (
        <PmcWasteComplaintsSection triggerSuccess={triggerSuccess} />
      )}

      {/* TAB 5: REPORTS GENERATOR */}
      {activeTab === 'Reports' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
            {/* GENERATE CARD */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs flex flex-col justify-center space-y-4">
              <div className="flex items-center space-x-3 text-[#18452E]">
                <FileText className="w-6 h-6 text-teal-800" />
                <h4 className="font-display font-black text-sm text-teal-950 uppercase">Generate New Payout Summary</h4>
              </div>
              <p className="text-#6B7280 font-light text-xs leading-relaxed">
                Log financial metrics and dispatch completely branded PDF payout summaries directly to represented landlords. All certifications are embedded automatically.
              </p>
              <button 
                onClick={() => triggerSuccess('Branded PMC PDF statements generated and dispatched successfully to customer landlord folders.')}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs uppercase transition tracking-wide cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Branded PDF Payout Sheet</span>
              </button>
            </div>

            {/* TRACKING LOG */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
              <h4 className="font-display font-black text-xs text-teal-950 uppercase mb-4">Report Delivery Tracking</h4>
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-stone-150 rounded-2xl text-stone-400 text-xs leading-relaxed">
                    No automated Monthly Portfolio Summaries generated yet.<br/>
                    <span className="text-[10px] text-stone-400 font-mono">Use the Admin Control Panel Settings to run the scheduled Cloud Function trigger simulation.</span>
                  </div>
                ) : (
                  reports.map((report) => (
                    <div key={report.id} className="p-3 bg-amber-500/5 border border-amber-200/50 hover:border-amber-400 rounded-xl transition-all duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="block font-bold text-teal-950 text-xs">Monthly Portfolio Summary &bull; {report.monthCovered}</span>
                          <span className="block text-[9px] font-mono text-stone-400 mt-0.5">Ref: {report.id} &bull; Sent: {new Date(report.sentAt).toLocaleString()}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${report.downloaded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'}`}>
                          {report.downloaded ? 'Downloaded' : 'Pending Download'}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-#6B7280 border-t border-stone-150 pt-2 mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Emailed to {report.pmcEmail}</span>
                        </div>
                        <button
                          onClick={() => handleOpenReport(report)}
                          className="text-[10px] text-amber-700 font-bold uppercase hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>Open &amp; Download</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STAFF CARETAKERS */}
      {activeTab === 'Staff' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-fade-in">
          
          <div className="md:col-span-4 bg-stone-50 p-5 rounded-2xl space-y-4">
            <h4 className="font-display font-black text-teal-950 uppercase text-xs">Add Field Operator</h4>
            
            <form onSubmit={handleAddStaffSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">OPERATOR NAME</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe" 
                  value={newStaff.name}
                  onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 bg-white border border-stone-200 rounded text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">PHONE NO</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="+234..." 
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 bg-white border border-stone-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-stone-400 uppercase mb-1">ROLE</label>
                  <select 
                    value={newStaff.role}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none"
                  >
                    <option value="Caretaker">Caretaker</option>
                    <option value="Inspector">Inspector</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-[100%] py-2 bg-teal-700 text-white rounded font-bold cursor-pointer">
                Submit Staff Access Vouch
              </button>
            </form>
          </div>

          <div className="md:col-span-8 space-y-3">
            <h4 className="font-display font-black text-teal-950 uppercase text-xs">Active Field Operators List</h4>
            <div className="space-y-3">
              {staffList.map((st) => (
                <div key={st.id} className="p-4 bg-white border border-stone-200 rounded-3xl flex justify-between items-center text-xs">
                  <div>
                    <strong className="block text-teal-955 font-display text-sm">{st.name}</strong>
                    <span className="text-stone-400 block font-light">Role: {st.role} &bull; Hotline: {st.phone}</span>
                  </div>
                  <span className="text-[9px] uppercase font-mono bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded">Active Key</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 7: SUBSCRIPTION SUMMARY */}
      {activeTab === 'Subscription' && (
        <div className="bg-white border border-teal-100 rounded-3xl p-6 space-y-4 animate-fade-in">
          <h3 className="font-display font-black text-teal-950 uppercase text-sm">PMC License Subscriptions</h3>
          <p className="text-#6B7280 font-light">Your current membership is on the <strong>PMC Professional Suite</strong>, giving you up to 100 concurrently managed property units:</p>

          <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex justify-between items-center text-xs md:text-sm">
            <div>
              <strong className="block text-teal-900 font-display">PMC Professional Suite</strong>
              <span className="text-stone-400 block font-light">Annual clearance rate: Unlimited Portfolio</span>
            </div>
            <div className="text-right">
              <span className="font-mono font-extrabold text-teal-950 block">₦45,000 / month</span>
              <span className="text-[10px] text-emerald-800 font-bold block">Status: Paid &amp; Active</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: BROADCAST CENTER */}
      {activeTab === 'Broadcast' && (
        <BroadcastCenter 
          landlordUnits={landlordUnits}
          properties={properties}
          triggerSuccess={triggerSuccess}
        />
      )}

      {/* REVOLUTIONARY DETAIL VIEW MODAL (Fix Four / Fix Seven) */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200/80 shadow-2xl relative flex flex-col p-6 space-y-5 animate-scale-up text-xs sm:text-sm">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => { setSelectedUnit(null); setShowFeeChangeForm(false); }}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER DESIGN WITH PHOTO AND BACKGROUND GLOSS */}
            <div className="border-b border-teal-100 pb-4 space-y-4">
              <span className="text-[9px] uppercase font-mono font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md tracking-widest font-bold">
                VERIFIED PROFILE DOCKET
              </span>
              
              <div className="flex items-center space-x-4">
                {selectedUnit.paymentStatus !== 'Vacant' ? (
                  <img 
                    src={getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).passportPhoto} 
                    alt={selectedUnit.tenantName} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-teal-500 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-stone-50 border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-xs shrink-0 font-mono font-bold uppercase">
                    VAC
                  </div>
                )}
                <div>
                  <h3 className="font-display font-black text-teal-950 text-lg leading-tight uppercase tracking-wider">
                    {selectedUnit.paymentStatus !== 'Vacant' ? selectedUnit.tenantName : 'VACANT UNIT'}
                  </h3>
                  <span className="text-[10px] font-mono text-teal-800 uppercase tracking-wider font-bold">
                    {selectedUnit.paymentStatus !== 'Vacant' ? selectedUnit.tenantCode : `Unit: ${selectedUnit.unitNumber}`}
                  </span>
                  <span className="block text-stone-400 font-light mt-0.5">{selectedUnit.propertyName}</span>
                </div>
              </div>
            </div>

            {/* TENANT METRICS */}
            {selectedUnit.paymentStatus !== 'Vacant' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50/50 p-3 rounded-2xl border border-stone-200">
                    <span className="text-[9px] font-mono text-stone-400 uppercase font-black block tracking-widest">PHONE NUMBER</span>
                    <strong className="block text-stone-850 mt-0.5 font-medium">
                      {getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).phone}
                    </strong>
                  </div>
                  <div className="bg-stone-50/50 p-3 rounded-2xl border border-stone-200">
                    <span className="text-[9px] font-mono text-stone-400 uppercase font-black block tracking-widest">OCCUPATION</span>
                    <strong className="block text-stone-850 mt-0.5 truncate font-medium">
                      {getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).occupation}
                    </strong>
                  </div>
                </div>

                {/* GUARANTOR SEGMENTATION */}
                <div className="p-4 bg-teal-50/30 border border-teal-100 rounded-2xl space-y-2">
                  <span className="text-[9px] font-mono text-teal-800 uppercase font-black block tracking-widest">GUARANTOR INFORMATION</span>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400">Guarantor Name:</span>
                      <strong className="text-#132A1D text-right">
                        {getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).guarantorName}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400">Contact Line:</span>
                      <strong className="text-#132A1D text-right">
                        {getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).guarantorPhone}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-400">Guarantor Relationship:</span>
                      <span className="text-[10px] uppercase font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-bold">
                        {getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).relationship}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AGREED MANAGEMENT FEE (PROMPT TWO) */}
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono text-[#18452E] uppercase font-black block tracking-widest">MANAGEMENT AGREEMENT</span>
                      <span className="text-#132A1D font-bold text-xs">Agreed Management Fee:</span>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-black text-[#18452E] text-base">
                        {getPropertyFeePercentage(selectedUnit.propertyName) !== undefined 
                          ? `${getPropertyFeePercentage(selectedUnit.propertyName)}%` 
                          : 'Not Set'}
                      </span>
                    </div>
                  </div>

                  {/* Request Fee Change Form toggle */}
                  {showFeeChangeForm ? (
                    <form onSubmit={handleRequestFeeChange} className="mt-3 pt-3 border-t border-amber-200/50 space-y-3">
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">Proposed Fee Percentage (%)</label>
                        <input 
                          type="number" 
                          required 
                          min="1" 
                          max="50" 
                          step="0.1"
                          placeholder="e.g. 10.5" 
                          value={proposedFee} 
                          onChange={(e) => setProposedFee(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs outline-none font-mono"
                        />
                        <span className="text-[9px] text-stone-400 font-mono block mt-1">Must be between 1% and 50%.</span>
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">Reason for Proposal</label>
                        <textarea 
                          required 
                          rows={2}
                          placeholder="Explain the reason for this percentage change request..." 
                          value={proposedFeeReason} 
                          onChange={(e) => setProposedFeeReason(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs outline-none"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          type="submit" 
                          className="flex-1 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white font-bold rounded-lg text-xs transition cursor-pointer"
                        >
                          Submit Proposal
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setShowFeeChangeForm(false)}
                          className="px-3 py-1.5 bg-stone-50 hover:bg-stone-200 text-#6B7280 rounded-lg text-xs transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-amber-200/30 gap-2">
                      <span className="text-[9px] text-#6B7280 font-light leading-snug">
                        Rate represents your cut of rent. Propose a new rate for landlord/admin approval.
                      </span>
                      <button 
                        onClick={() => {
                          setProposedFee(String(getPropertyFeePercentage(selectedUnit.propertyName) || 10));
                          setShowFeeChangeForm(true);
                        }}
                        className="px-3 py-1 bg-white hover:bg-amber-50 text-[#18452E] hover:text-[#18452E] font-bold rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer border border-[#18452E] shadow-xs shrink-0"
                      >
                        Request Fee Change
                      </button>
                    </div>
                  )}
                </div>

                {/* HISTORIC LEDGER RECORD */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-stone-400 uppercase font-black block tracking-widest">BILLING & PAYMENT HISTORY</span>
                  
                  <div className="space-y-2 max-h-[140px] overflow-y-auto border border-stone-200 rounded-xl divide-y">
                    
                    {/* CURRENT YEAR CYCLE */}
                    <div className="p-2.5 flex justify-between items-center bg-stone-50/20 text-xs">
                      <div>
                        <span className="font-bold text-stone-850 block">Cycle: 2026 - 2027</span>
                        <span className="text-[10px] text-stone-400 block font-mono">Reference: NGN_CYC_0012_UH</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-#132A1D block font-mono">₦{selectedUnit.rentAmount.toLocaleString()}</span>
                        <span className={`inline-block px-1 rounded text-[8px] font-mono font-bold uppercase ${
                          selectedUnit.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>{selectedUnit.paymentStatus}</span>
                      </div>
                    </div>

                    {/* PREVIOUS YEAR CYCLE */}
                    <div className="p-2.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-stone-500 block">Cycle: 2025 - 2026</span>
                        <span className="text-[10px] text-stone-400 block font-mono">Reference: NGN_CYC_9981_UH</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-#6B7280 block font-mono">₦{selectedUnit.rentAmount.toLocaleString()}</span>
                        <span className="inline-block px-1 rounded text-[8px] font-mono font-bold uppercase bg-stone-50 text-stone-550">PAID</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Audit History inside Unit Modal */}
                <div className="pt-3 border-t border-stone-200">
                  <AuditHistoryTab recordType="property" recordId={selectedUnit.propertyName} />
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-#6B7280">
                This unit is currently vacant. No registered tenant is assigned yet. Rent is set to ₦{selectedUnit.rentAmount.toLocaleString()} annually.
              </div>
            )}

            {/* DISMISS ACTION */}
            <div className="pt-3 border-t flex justify-end">
              <button 
                onClick={() => setSelectedUnit(null)}
                className="px-5 py-2 bg-teal-800 text-white font-medium hover:bg-teal-700 rounded-xl text-xs cursor-pointer"
              >
                Dismiss Case File
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PORTFOLIO HEALTH TAB */}
      {activeTab === 'PortfolioHealth' && (
        <PortfolioHealthCenter 
          properties={properties}
          landlordUnits={landlordUnits}
          bookings={bookings}
          damageReports={damageReports}
          serviceCharges={serviceCharges}
        />
      )}

      {/* SERVICE CHARGES TAB */}
      {activeTab === 'ServiceCharges' && (
        <ServiceChargeIntelligence 
          properties={properties}
          landlordUnits={landlordUnits}
          serviceCharges={serviceCharges}
          setServiceCharges={setServiceCharges as React.Dispatch<React.SetStateAction<ServiceChargeBill[]>>}
          role="PMC"
          userId={session.userId}
        />
      )}

      {/* TENANT INTELLIGENCE TAB */}
      {activeTab === 'TenantIntelligence' && (
        <TenantIntelligenceCenter 
          landlordUnits={landlordUnits}
          properties={properties}
          serviceCharges={serviceCharges}
          role="PMC"
        />
      )}

      {/* AI COLLECTIONS TAB */}
      {activeTab === 'AICollection' && (
        <AICollectionCenter 
          role="PMC"
          userId={session.userId}
        />
      )}

      {/* TAB: LEASE RENEWAL CENTER */}
      {activeTab === 'LeaseRenewal' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* TITLE & METADATA */}
          <div className="bg-white border border-teal-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-display font-black text-teal-950 uppercase">Lease Renewal Center</h2>
              <p className="text-#6B7280 font-light text-xs mt-1">Portfolio-wide operations dashboard for tracking multi-property tenancies, notice timelines, and upcoming move-outs.</p>
            </div>
            <div className="text-stone-400 font-mono text-[10px] bg-stone-50 border border-stone-200 px-3.5 py-1.5 rounded-xl uppercase">
              Operational Timeline: <strong className="text-teal-900">FY 2026 / 2027</strong>
            </div>
          </div>

          {/* SUMMARY ROW (FOUR COUNT TILES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">Tenants Who Will Renew</span>
                <strong className="text-2xl font-display font-black text-teal-950 block mt-0.5">{pmcTenantsWhoWillRenew}</strong>
                <span className="text-[10px] text-#6B7280 font-light mt-0.5 block">Renewal intention logged</span>
              </div>
            </div>

            <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-rose-50 rounded-xl">
                <X className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">Tenants Who Will Vacate</span>
                <strong className="text-2xl font-display font-black text-teal-950 block mt-0.5">{pmcTenantsWhoWillVacate}</strong>
                <span className="text-[10px] text-#6B7280 font-light mt-0.5 block">Vacating intention logged</span>
              </div>
            </div>

            <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-50 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">Tenants In Notice Period</span>
                <strong className="text-2xl font-display font-black text-teal-950 block mt-0.5">{pmcTenantsInNoticePeriod}</strong>
                <span className="text-[10px] text-#6B7280 font-light mt-0.5 block">Legal quit notice active</span>
              </div>
            </div>

            <div className="bg-white border border-teal-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">Awaiting Decision</span>
                <strong className="text-2xl font-display font-black text-teal-950 block mt-0.5">{pmcAwaitingDecision}</strong>
                <span className="text-[10px] text-#6B7280 font-light mt-0.5 block">&lt; 90 days from expiry</span>
              </div>
            </div>

          </div>

          {/* MAIN SORTABLE LEASE EXPIRY TABLE */}
          <div className="bg-white border border-teal-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-display font-black text-teal-950 uppercase text-sm">Approaching Expiries &amp; Decision Logs</h3>
                <p className="text-#6B7280 font-light text-xs mt-0.5">Sortable directory of active corporate tenancies nearing the 2026/2027 contract boundary.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] font-mono text-stone-400 uppercase">
                    {[
                      { key: 'tenantName', label: 'Tenant Name' },
                      { key: 'propertyName', label: 'Property & Unit' },
                      { key: 'landlord', label: 'Landlord Owner' },
                      { key: 'leaseExpiryDate', label: 'Lease End Date' },
                      { key: 'daysRemaining', label: 'Days Remaining' },
                      { key: 'renewalIntention', label: 'Decision Status' }
                    ].map((col) => {
                      const isSorted = col.key === renewalSortCol || (col.key === 'landlord' && renewalSortCol === 'propertyName');
                      return (
                        <th 
                          key={col.key} 
                          onClick={() => {
                            if (col.key === 'landlord') return;
                            const newDir = (renewalSortCol === col.key && renewalSortDirection === 'asc') ? 'desc' : 'asc';
                            setRenewalSortCol(col.key as any);
                            setRenewalSortDirection(newDir);
                          }}
                          className={`py-3 px-4 font-bold select-none uppercase tracking-wider ${col.key !== 'landlord' ? 'cursor-pointer hover:bg-stone-50 text-teal-950' : 'text-stone-400'}`}
                        >
                          <div className="flex items-center space-x-1.5">
                            <span>{col.label}</span>
                            {isSorted && (
                              <span className="text-[9px] font-mono font-black text-teal-800">
                                {renewalSortDirection === 'asc' ? '▲' : '▼'}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const renewalTenancies = pmcManagedUnits.filter(u => u.leaseExpiryDate);
                    const sortedRenewals = [...renewalTenancies].sort((a, b) => {
                      let valA: any = a[renewalSortCol as keyof LandlordUnit];
                      let valB: any = b[renewalSortCol as keyof LandlordUnit];

                      if (renewalSortCol === 'daysRemaining') {
                        valA = getDaysRemaining(a.leaseExpiryDate);
                        valB = getDaysRemaining(b.leaseExpiryDate);
                      }

                      if (valA === undefined || valA === null) return 1;
                      if (valB === undefined || valB === null) return -1;

                      if (typeof valA === 'string') {
                        return renewalSortDirection === 'asc' 
                          ? valA.localeCompare(valB) 
                          : valB.localeCompare(valA);
                      } else {
                        return renewalSortDirection === 'asc' 
                          ? valA - valB 
                          : valB - valA;
                      }
                    });

                    return sortedRenewals.map((u) => {
                      const daysLeft = getDaysRemaining(u.leaseExpiryDate);
                      const landlordName = getLandlordName(u.propertyName);
                      
                      return (
                        <tr key={u.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                          <td className="py-3 px-4 font-bold text-teal-950 text-sm">{u.tenantName}</td>
                          <td className="py-3 px-4 text-#6B7280">
                            <strong className="text-#132A1D block font-normal">{u.propertyName}</strong>
                            <span className="text-[10px] text-stone-400 font-mono block mt-0.5">{u.unitNumber}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-teal-950">{landlordName}</td>
                          <td className="py-3 px-4 font-mono text-#6B7280">{u.leaseExpiryDate || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              daysLeft <= 30 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              daysLeft <= 90 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-teal-50 text-teal-700 border border-teal-200'
                            }`}>
                              {daysLeft} Days Left
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {u.renewalIntention === 'renewing' ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold uppercase font-mono">
                                Renewing
                              </span>
                            ) : u.renewalIntention === 'vacating' ? (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold uppercase font-mono">
                                Vacating
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-stone-50 text-#6B7280 border border-stone-200 rounded text-[10px] font-bold uppercase font-mono">
                                Awaiting Decision
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => setShowTenancyModal(u)}
                                className="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                View Tenancy
                              </button>
                              {!u.renewalIntention && (
                                <button 
                                  onClick={() => {
                                    setShowNotifyModal(u);
                                    setNotifyChannel('WhatsApp');
                                    setNotifyCustomMessage(`Dear ${u.tenantName}, your lease expiry for ${u.propertyName} (${u.unitNumber}) is approaching on ${u.leaseExpiryDate}. Kindly log in to your portal and confirm your lease renewal decision.`);
                                  }}
                                  className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                                >
                                  Notify Tenant
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                  {pmcManagedUnits.filter(u => u.leaseExpiryDate).length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-stone-400 italic">No approaching expiries logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* READ-ONLY QUIT NOTICES REGISTER (PMC SOURCING PIPELINE PLANNING) */}
          <div className="bg-white border border-teal-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-black text-teal-950 uppercase text-sm">Quit Notices Register (Read-Only)</h3>
              <p className="text-#6B7280 font-light text-xs mt-0.5">
                This read-only operational registry tracks quit notices across all managed tenancies. The PMC uses this view for vacancy planning and prospective tenant pipeline management. Approval and release controls are restricted to System Administrators.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[10px] font-mono text-stone-400 uppercase">
                    <th className="py-3 px-4">Tenant Name</th>
                    <th className="py-3 px-4">Property &amp; Unit</th>
                    <th className="py-3 px-4">Notice Initiation</th>
                    <th className="py-3 px-4">Legal Notice Period</th>
                    <th className="py-3 px-4">Calculated End Date</th>
                    <th className="py-3 px-4">Notice Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pmcManagedUnits.filter(u => u.quitNoticeGenerated).map((u) => {
                    const daysLeft = getDaysRemaining(u.quitNoticeEndDate);
                    return (
                      <tr key={u.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                        <td className="py-3 px-4 font-bold text-teal-950 text-sm">{u.tenantName}</td>
                        <td className="py-3 px-4 text-#6B7280">
                          <strong className="text-#132A1D block font-normal">{u.propertyName}</strong>
                          <span className="text-[10px] text-stone-400 font-mono block mt-0.5">{u.unitNumber}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-#6B7280">{u.quitNoticeInitiationDate || 'N/A'}</td>
                        <td className="py-3 px-4 font-mono font-bold text-teal-950">{u.quitNoticeLegalPeriod || '6 Months'}</td>
                        <td className="py-3 px-4 font-mono text-#6B7280">{u.quitNoticeEndDate || 'N/A'}</td>
                        <td className="py-3 px-4">
                          {u.quitNoticeStatus === 'Pending Admin Review' ? (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold uppercase font-mono">
                              Pending Admin Review
                            </span>
                          ) : u.quitNoticeStatus === 'Released to Both Parties' ? (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold uppercase font-mono">
                              Released to Both Parties
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold uppercase font-mono inline-flex items-center space-x-1">
                              <span>Notice Period Active ({daysLeft} Days Left)</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {pmcManagedUnits.filter(u => u.quitNoticeGenerated).length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-stone-400 italic">No active quit notices in circulation.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* CONFIRM INSTALLMENT RECEIPT MODAL */}
      {showConfirmInstallmentModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200/80 shadow-2xl relative flex flex-col p-6 space-y-4 animate-scale-up text-xs sm:text-sm">
            
            <button 
              onClick={() => setShowConfirmInstallmentModal(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-teal-100 pb-3 space-y-1.5">
              <span className="text-[9px] uppercase font-mono font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md tracking-widest font-bold">
                Confirm Installment Receipt
              </span>
              <h3 className="font-display font-black text-teal-950 text-base leading-tight uppercase">
                Confirm Bank Collection
              </h3>
            </div>

            <form onSubmit={handleConfirmInstallmentSubmit} className="space-y-4">
              <div>
                <span className="block text-[10px] font-mono text-stone-400 uppercase">Tenant &amp; Unit</span>
                <strong className="text-#132A1D text-sm block mt-0.5">{showConfirmInstallmentModal.unit.tenantName}</strong>
                <span className="text-[11px] text-#6B7280 font-mono block mt-0.5">{showConfirmInstallmentModal.unit.propertyName} ({showConfirmInstallmentModal.unit.unitNumber})</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] font-mono text-stone-400 uppercase">Pre-filled Amount</span>
                  <strong className="text-teal-900 text-base font-mono block mt-1">₦{showConfirmInstallmentModal.installment.amount.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-mono text-stone-400 uppercase">Installment Due Date</span>
                  <span className="text-#6B7280 text-sm font-mono block mt-1">{showConfirmInstallmentModal.installment.dueDate}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Bank Reference / Ledger Memo</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. NGN_GTB_REF_99" 
                  value={receiptMemo}
                  onChange={(e) => setReceiptMemo(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                <strong>Attention:</strong> Confirmed receipts are logged instantly under corporate ledger confirmation awaiting final admin verification.
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowConfirmInstallmentModal(null)}
                  className="px-4 py-2 bg-stone-50 hover:bg-stone-200 text-#6B7280 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Confirm Receipt Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROMISE TO PAY MODAL */}
      {showPromiseModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200/80 shadow-2xl relative flex flex-col p-6 space-y-4 animate-scale-up text-xs sm:text-sm">
            
            <button 
              onClick={() => setShowPromiseModal(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-teal-100 pb-3 space-y-1.5">
              <span className="text-[9px] uppercase font-mono font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md tracking-widest font-bold">
                Flag Promise To Pay
              </span>
              <h3 className="font-display font-black text-teal-950 text-base leading-tight uppercase">
                Log Tenant Promise
              </h3>
            </div>

            <form onSubmit={handlePromiseSubmit} className="space-y-4">
              <div>
                <span className="block text-[10px] font-mono text-stone-400 uppercase">Tenant</span>
                <strong className="text-#132A1D text-sm block mt-0.5">{showPromiseModal.unit.tenantName}</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] font-mono text-stone-400 uppercase">Promise Amount</span>
                  <strong className="text-amber-800 text-base font-mono block mt-1">₦{showPromiseModal.installment.amount.toLocaleString()}</strong>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Expected Pay Date</label>
                  <input 
                    type="date"
                    required
                    value={promiseDate}
                    onChange={(e) => setPromiseDate(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Promise Notes / Memo</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Spoke with tenant, promised to pay via bank transfer..." 
                  value={promiseNote}
                  onChange={(e) => setPromiseNote(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowPromiseModal(null)}
                  className="px-4 py-2 bg-stone-50 hover:bg-stone-200 text-#6B7280 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-amber-750 hover:bg-amber-850 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Submit Promise to Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFY LEASE EXPIRY MODAL */}
      {showNotifyModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200/80 shadow-2xl relative flex flex-col p-6 space-y-4 animate-scale-up text-xs sm:text-sm">
            
            <button 
              onClick={() => setShowNotifyModal(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-teal-100 pb-3 space-y-1.5">
              <span className="text-[9px] uppercase font-mono font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md tracking-widest font-bold">
                Lease Expiry Notice Dispatch
              </span>
              <h3 className="font-display font-black text-teal-950 text-base leading-tight uppercase">
                Notify Tenant Decision Awaiting
              </h3>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              triggerSuccess(`Lease renewal reminder successfully dispatched to ${showNotifyModal.tenantName} via ${notifyChannel}.`);
              setShowNotifyModal(null);
            }} className="space-y-4">
              <div>
                <span className="block text-[10px] font-mono text-stone-400 uppercase">Recipient</span>
                <strong className="text-#132A1D text-sm block mt-0.5">{showNotifyModal.tenantName}</strong>
                <span className="text-[11px] text-#6B7280 block mt-0.5 font-mono">{showNotifyModal.propertyName} ({showNotifyModal.unitNumber}) &bull; Ends: {showNotifyModal.leaseExpiryDate}</span>
              </div>

              <div>
                <span className="block text-[10px] font-mono text-stone-400 uppercase mb-1.5">Notification Channel</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['WhatsApp', 'Email', 'SMS'] as const).map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => setNotifyChannel(channel)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                        notifyChannel === channel 
                          ? 'bg-teal-800 text-white border-teal-800 shadow-sm' 
                          : 'bg-stone-50 text-#6B7280 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase mb-1">Message Body</label>
                <textarea 
                  rows={4}
                  value={notifyCustomMessage}
                  onChange={(e) => setNotifyCustomMessage(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-teal-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button 
                  type="button"
                  onClick={() => setShowNotifyModal(null)}
                  className="px-4 py-2 bg-stone-50 hover:bg-stone-200 text-#6B7280 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Dispatch Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TENANCY MODAL */}
      {showTenancyModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200/80 shadow-2xl relative flex flex-col p-6 space-y-4 animate-scale-up text-xs sm:text-sm">
            
            <button 
              onClick={() => setShowTenancyModal(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-teal-100 pb-3 space-y-1.5">
              <span className="text-[9px] uppercase font-mono font-black text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md tracking-widest font-bold">
                Lease Details Profile
              </span>
              <h3 className="font-display font-black text-teal-950 text-base leading-tight uppercase">
                {showTenancyModal.tenantName}
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 font-mono block text-[9px] uppercase">Tenant Code</span>
                  <strong className="text-#132A1D block mt-0.5">{showTenancyModal.tenantCode}</strong>
                </div>
                <div>
                  <span className="text-stone-400 font-mono block text-[9px] uppercase">Contact Phone</span>
                  <strong className="text-#132A1D block mt-0.5">{getTenantDetails(showTenancyModal.tenantName, showTenancyModal.tenantCode, showTenancyModal.rentAmount, showTenancyModal.propertyName).phone}</strong>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl space-y-1">
                <span className="text-stone-400 font-mono block text-[9px] uppercase">Assigned Property</span>
                <strong className="text-[#18452E] block">{showTenancyModal.propertyName}</strong>
                <span className="text-[10px] text-stone-400 font-mono block">Unit: {showTenancyModal.unitNumber} &bull; Landlord: {getLandlordName(showTenancyModal.propertyName)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 font-mono block text-[9px] uppercase font-bold">Lease End Date</span>
                  <strong className="text-#132A1D font-mono block mt-0.5">{showTenancyModal.leaseExpiryDate || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-stone-400 font-mono block text-[9px] uppercase font-bold">Days Remaining</span>
                  <strong className="text-#132A1D font-mono block mt-0.5">{getDaysRemaining(showTenancyModal.leaseExpiryDate)} Days</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3">
                <div>
                  <span className="text-stone-400 font-mono block text-[9px] uppercase font-bold">Decision Status</span>
                  <strong className="text-#132A1D block mt-0.5 capitalize">{showTenancyModal.renewalIntention || 'Awaiting decision'}</strong>
                </div>
                <div>
                  <span className="text-stone-400 font-mono block text-[9px] uppercase font-bold">Annual Rent Value</span>
                  <strong className="text-teal-900 font-mono block mt-0.5">₦{showTenancyModal.rentAmount.toLocaleString()}</strong>
                </div>
              </div>

              {showTenancyModal.quitNoticeGenerated && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl space-y-1">
                  <span className="font-mono block text-[9px] uppercase font-bold">Active Quit Notice</span>
                  <p className="text-[11px] leading-relaxed">
                    Notice of intent to vacate was generated on <strong>{showTenancyModal.quitNoticeInitiationDate}</strong> with a legal period of <strong>{showTenancyModal.quitNoticeLegalPeriod}</strong>. End Date is set to <strong>{showTenancyModal.quitNoticeEndDate}</strong>.
                  </p>
                  <span className="inline-block mt-1 font-mono text-[9px] bg-rose-100 px-1.5 py-0.5 rounded font-bold uppercase">
                    Status: {showTenancyModal.quitNoticeStatus}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button 
                onClick={() => setShowTenancyModal(null)}
                className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTFOLIO HEALTH TAB */}
      {activeTab === 'PortfolioHealth' && (
        <PortfolioHealthCenter 
          properties={properties}
          landlordUnits={landlordUnits}
          bookings={bookings}
          damageReports={damageReports}
          serviceCharges={serviceCharges}
        />
      )}

      {/* SERVICE CHARGES TAB */}
      {activeTab === 'ServiceCharges' && (
        <ServiceChargeIntelligence 
          properties={properties}
          landlordUnits={landlordUnits}
          serviceCharges={serviceCharges}
          setServiceCharges={setServiceCharges as React.Dispatch<React.SetStateAction<ServiceChargeBill[]>>}
          role="PMC"
          userId={session.userId}
        />
      )}

      {/* TENANT INTELLIGENCE TAB */}
      {activeTab === 'TenantIntelligence' && (
        <TenantIntelligenceCenter 
          landlordUnits={landlordUnits}
          properties={properties}
          serviceCharges={serviceCharges}
          role="PMC"
        />
      )}

      {/* AI COLLECTIONS TAB */}
      {activeTab === 'AICollection' && (
        <AICollectionCenter 
          role="PMC"
          userId={session.userId}
        />
      )}

      {/* FOOTER */}
      <p className="text-center text-[10px] text-[#C9A84C] font-mono uppercase font-bold tracking-wider">
        Unity Homes PMC Management Network &bull; Don&apos;t Buy Wahala
      </p>

      {showNotifications && (
        <NotificationFeed onClose={() => setShowNotifications(false)} role="PMC" targetId="Prime Property Solutions" />
      )}

      {/* REPORT PREVIEW MODAL */}
      {selectedReport && (
        <div id="report-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#18452E]" />
                <span className="font-display font-bold text-#132A1D text-sm">Monthly Summary Report Preview</span>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-full hover:bg-stone-200 text-#6B7280 hover:text-#132A1D cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
              {selectedReport.pdfContent ? (
                <div 
                  className="bg-white rounded-2xl shadow-sm border border-stone-150 p-2 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: selectedReport.pdfContent }} 
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-stone-150 p-8 text-center space-y-4">
                  <h3 className="font-display font-bold text-lg text-#132A1D">{selectedReport.name || selectedReport.title}</h3>
                  <p className="text-xs text-#6B7280">Legacy PDF Document reference securely catalogued in Unity Homes Ledger.</p>
                  <div className="p-4 bg-stone-50 border border-stone-150 rounded-xl inline-block text-[11px] font-mono text-#6B7280">
                    Document Ref: {selectedReport.id || 'DOC-LEGACY-001'}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex justify-end space-y-2 sm:space-y-0 sm:space-x-3 flex-col sm:flex-row">
              <button
                onClick={() => {
                  triggerSuccess('Document downloaded to local storage registers successfully!');
                  setSelectedReport(null);
                }}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Download PDF File
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2.5 border border-stone-300 hover:bg-stone-50 text-#132A1D font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT TAB */}
      {activeTab === 'Support' && (
        <SupportCenter session={session} />
      )}

      <MobileBottomNav 
        role="PMC"
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        setShowNotifications={setShowNotifications}
        hasUnread={hasUnreadNotifications}
      />
    </div>
    </ErrorBoundary>
  );
}

function PmcWasteComplaintsSection({ triggerSuccess }: { triggerSuccess: (msg: string) => void }) {
  const [complaints, setComplaints] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('uh_complaints_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('Action Being Taken');
  const [filterMode, setFilterMode] = useState<'open' | 'all' | 'resolved'>('open');

  const pmcComplaints = complaints.filter(c => {
    // SECURITY RULE: PMC CANNOT see PMC Conduct or Landlord Conduct complaints
    if (c.routingPath === 'path_4_pmc_conduct' || c.complaint_category === 'Property Management Company Conduct') return false;
    if (c.routingPath === 'path_3_landlord_conduct' || c.complaint_category === 'Landlord Conduct or Behaviour') return false;

    // Must be assigned to PMC or be a PMC-managed property complaint
    const isPMCRecipient = c.primaryRecipientRole === 'PMC' || c.secondaryRecipientRole === 'PMC' || c.managementCompanyId === 'Prime Property Solutions';
    return isPMCRecipient || c.category === 'Waste and Refuse Collection';
  });

  const filtered = pmcComplaints.filter(c => {
    if (filterMode === 'open') return c.status !== 'Resolved';
    if (filterMode === 'resolved') return c.status === 'Resolved';
    return true;
  });

  // Sort by urgency first (Urgent > High > Normal), then by days outstanding descending
  const urgencyWeight: { [key: string]: number } = { 'Urgent': 1, 'High': 2, 'Normal': 3 };

  const sorted = [...filtered].sort((a, b) => {
    const uA = urgencyWeight[a.urgency || 'Normal'] || 3;
    const uB = urgencyWeight[b.urgency || 'Normal'] || 3;
    if (uA !== uB) return uA - uB;
    const daysA = a.daysSinceLastCollection || 0;
    const daysB = b.daysSinceLastCollection || 0;
    return daysB - daysA;
  });

  const handleUpdateComplaint = (complaintId: string) => {
    if (!resolutionNote.trim() && newStatus === 'Resolved') {
      alert('A resolution note is required when marking a complaint as Resolved.');
      return;
    }

    const updated = complaints.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: newStatus,
          resolutionNote: resolutionNote.trim() || c.resolutionNote,
          resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : c.resolvedAt
        };
      }
      return c;
    });

    setComplaints(updated);
    localStorage.setItem('uh_complaints_v1', JSON.stringify(updated));

    // Notify tenant
    const targetComp = complaints.find(c => c.id === complaintId);
    if (targetComp) {
      try {
        const rawNotifs = localStorage.getItem('uh_notifications_v1');
        const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
        const tenantNotif = {
          id: 'notif-res-' + Date.now(),
          recipientRole: 'Tenant',
          recipientId: targetComp.tenant,
          title: `🗑️ Waste Complaint Status Updated: ${newStatus}`,
          message: `Your waste complaint for ${targetComp.propertyName || targetComp.unit} is now ${newStatus}. Note: "${resolutionNote || 'PMC updated complaint status.'}"`,
          timestamp: new Date().toISOString(),
          read: false
        };
        localStorage.setItem('uh_notifications_v1', JSON.stringify([tenantNotif, ...notifs]));
      } catch (err) {
        console.error(err);
      }
    }

    triggerSuccess(`Complaint status updated to "${newStatus}" and resolution dispatch sent to tenant.`);
    setSelectedComplaintId(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="bg-white border border-teal-100 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-display font-black text-teal-950 uppercase text-sm flex items-center gap-2">
              <span>🗑️ Waste & Refuse Complaints Ledger</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full text-[10px] font-mono">
                {pmcComplaints.filter(c => c.status !== 'Resolved').length} Active
              </span>
            </h3>
            <p className="text-#6B7280 font-light text-xs mt-0.5">
              Direct municipal LAWMA & refuse management tickets across managed portfolio. Sorted by urgency &amp; days outstanding.
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setFilterMode('open')}
              className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[10px] uppercase cursor-pointer ${filterMode === 'open' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'}`}
            >
              Open Complaints
            </button>
            <button 
              onClick={() => setFilterMode('resolved')}
              className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[10px] uppercase cursor-pointer ${filterMode === 'resolved' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'}`}
            >
              Resolved
            </button>
            <button 
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl font-bold font-mono text-[10px] uppercase cursor-pointer ${filterMode === 'all' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'}`}
            >
              All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pt-2 border-t border-stone-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] font-mono uppercase text-stone-400 bg-stone-50/50">
                <th className="p-3">Tenant Name</th>
                <th className="p-3">Property &amp; Unit</th>
                <th className="p-3">Issue Type</th>
                <th className="p-3">Urgency Rating</th>
                <th className="p-3 text-center">Days Outstanding</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-400 italic">
                    No waste complaints matching filter &quot;{filterMode}&quot;.
                  </td>
                </tr>
              ) : (
                sorted.map((comp) => {
                  const isUrgent = comp.urgency === 'Urgent';
                  const isHigh = comp.urgency === 'High';

                  return (
                    <React.Fragment key={comp.id}>
                      <tr className={`hover:bg-stone-50/80 transition ${isUrgent ? 'bg-red-50/30' : ''}`}>
                        <td className="p-3 font-bold text-teal-950">{comp.tenant}</td>
                        <td className="p-3">
                          <strong className="block text-#132A1D">{comp.propertyName || 'Portfolio Asset'}</strong>
                          <span className="text-[10px] text-stone-400 font-mono">{comp.unit}</span>
                        </td>
                        <td className="p-3 max-w-xs">
                          <span className="font-semibold text-#132A1D block">{comp.typeOfWasteIssue || comp.category}</span>
                          <span className="text-[10px] text-#6B7280 line-clamp-1 italic">&quot;{comp.text}&quot;</span>
                        </td>
                        <td className="p-3">
                          {isUrgent && (
                            <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full font-mono text-[9px] font-bold uppercase inline-flex items-center gap-1">
                              <span>🚨 Urgent Escalation</span>
                            </span>
                          )}
                          {isHigh && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-mono text-[9px] font-bold uppercase inline-flex items-center gap-1">
                              <span>⚠️ High Priority</span>
                            </span>
                          )}
                          {!isUrgent && !isHigh && (
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-mono text-[9px] font-bold uppercase">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-#132A1D">
                          {comp.daysSinceLastCollection ? (
                            <span className={comp.daysSinceLastCollection >= 7 ? 'text-red-700 font-black' : ''}>
                              {comp.daysSinceLastCollection} Days
                            </span>
                          ) : (
                            'Filed ' + comp.date
                          )}
                        </td>
                        <td className="p-3 font-mono text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                            comp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                            comp.status === 'Action Being Taken' ? 'bg-amber-100 text-amber-800' : 'bg-stone-50 text-#132A1D'
                          }`}>
                            {comp.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              if (selectedComplaintId === comp.id) {
                                setSelectedComplaintId(null);
                              } else {
                                setSelectedComplaintId(comp.id);
                                setNewStatus(comp.status === 'Resolved' ? 'Resolved' : 'Action Being Taken');
                                setResolutionNote(comp.resolutionNote || '');
                              }
                            }}
                            className="px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            {selectedComplaintId === comp.id ? 'Close Panel' : 'Resolve / Update'}
                          </button>
                        </td>
                      </tr>

                      {/* INLINE RESOLUTION FORM */}
                      {selectedComplaintId === comp.id && (
                        <tr className="bg-emerald-50/60 border-b border-emerald-200">
                          <td colSpan={7} className="p-4 space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <strong className="text-emerald-950 text-xs font-mono uppercase">
                                UPDATE RESOLUTION FOR: {comp.tenant} ({comp.propertyName})
                              </strong>
                              <div className="flex items-center gap-2">
                                <label className="text-[10px] font-mono font-bold uppercase text-#6B7280">Update Status:</label>
                                <select 
                                  value={newStatus}
                                  onChange={(e) => setNewStatus(e.target.value)}
                                  className="p-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold"
                                >
                                  <option value="Received by Property Manager">Received by Property Manager</option>
                                  <option value="Action Being Taken">Action Being Taken</option>
                                  <option value="Resolved">Resolved</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono font-bold text-emerald-900 uppercase mb-1">
                                Resolution / Action Note * (Mandatory for resolving)
                              </label>
                              <textarea 
                                rows={2}
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                placeholder="e.g. PMC contacted LAWMA emergency team; private refuse tractor dispatched and bins evacuated."
                                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => setSelectedComplaintId(null)}
                                className="px-3 py-1.5 bg-stone-200 text-#132A1D rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleUpdateComplaint(comp.id)}
                                className="px-4 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer font-mono"
                              >
                                Save &amp; Dispatch Resolution
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
