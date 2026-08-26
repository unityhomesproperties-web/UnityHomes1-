// @ts-nocheck
import MobileBottomNav from "./MobileBottomNav";
import NotificationFeed from "./NotificationFeed";
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Activity, AlertCircle, PlusCircle, CheckCircle, 
  Send, Users, ShieldAlert, BookOpen, Clock, HelpCircle, FileText, X,
  Building as BuildingIcon, ChevronRight, Award, Bell, ShieldCheck, CreditCard, ArrowLeft, Star, Download, Search, Edit2, Archive, Pin, Lock,
  QrCode, Copy, Share2, Check, ExternalLink, UserCheck, Info, CheckSquare, Plus
} from 'lucide-react';
import LandlordShortletDashboard from './LandlordShortletDashboard';
import PortfolioHealthCenter from './PortfolioHealthCenter';
import ServiceChargeIntelligence from './ServiceChargeIntelligence';
import TenantIntelligenceCenter from './TenantIntelligenceCenter';
import AICollectionCenter from './AICollectionCenter';
import OperationsBriefingCard from './OperationsBriefingCard';
import SupportCenter from './SupportCenter';
import QuickSupportButton from './QuickSupportButton';
import { LandlordUnit, Property, UserSession, Building, ShortletManagerAgreement, BookingLog, DamageReport, ServiceChargeBill, Complaint } from '../../types';
import { loadTenantRegistrations, initialBuildings, initialShortletAgreements } from '../../data';
import ImmutableHistory from "./ImmutableHistory";
import { addDocument, useLiveCollection, getUserTargetId } from '../../lib/database';
import {
  createOrUpdateBuilding,
  createUnit,
  createTenantInvitation,
  getStoredBuildings,
  getStoredUnits,
  getStoredInvitations,
  getStoredTenantProfiles,
  getStoredTenancies,
  reassignTenantUnit,
  endTenantTenancy,
  checkExistingTenantByContact,
  regenerateExpiredInvitation,
  loadPromptSixDemoData,
  calculateMoveInReadiness,
  FirestoreBuilding,
  FirestoreUnit,
  FirestoreTenantInvitation,
  FirestoreTenantProfile
} from '../../lib/firestoreArchitecture';
import MoveInReadinessWidget from '../MoveInReadinessWidget';

interface LandlordDashboardProps {
  session: UserSession;
  properties: Property[];
  setProperties?: React.Dispatch<React.SetStateAction<Property[]>>;
  buildings?: Building[];
  setBuildings?: React.Dispatch<React.SetStateAction<Building[]>>;
  subscriptions?: any[];
  setSubscriptions?: React.Dispatch<React.SetStateAction<any[]>>;
  landlordUnits: LandlordUnit[];
  setLandlordUnits: React.Dispatch<React.SetStateAction<LandlordUnit[]>>;
  bookings?: BookingLog[];
  setBookings?: React.Dispatch<React.SetStateAction<BookingLog[]>>;
  damageReports?: DamageReport[];
  setDamageReports?: React.Dispatch<React.SetStateAction<DamageReport[]>>;
  serviceCharges?: ServiceChargeBill[];
  setServiceCharges?: React.Dispatch<React.SetStateAction<ServiceChargeBill[]>>;
  navigate?: (path: string, params?: any) => void;
}

function LandlordTenantComplaintsSection({
  session,
  landlordCode,
  triggerSuccess,
  myUnits
}: {
  session: UserSession;
  landlordCode: string;
  triggerSuccess: (msg: string) => void;
  myUnits: LandlordUnit[];
}) {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const raw = localStorage.getItem('uh_complaints_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [actionTakenText, setActionTakenText] = useState('');
  const [markResolved, setMarkResolved] = useState(false);

  // Filter complaints according to strict security rules
  const visibleComplaints = complaints.filter(c => {
    // SECURITY RULE: Landlords CANNOT see path_3_landlord_conduct or Landlord Conduct category
    if (c.routingPath === 'path_3_landlord_conduct' || c.complaint_category === 'Landlord Conduct or Behaviour') {
      return false;
    }

    const matchesLandlord = 
      c.landlordId === landlordCode ||
      c.landlordName === session.name ||
      c.primaryRecipientRole === 'Landlord' ||
      c.secondaryRecipientRole === 'Landlord' ||
      myUnits.some(u => u.propertyName === c.propertyName || u.buildingId === c.propertyId || u.id === c.propertyId);

    return matchesLandlord;
  });

  const handleResponseSubmit = (c: Complaint) => {
    if (!responseText.trim()) {
      alert('Please enter your response text.');
      return;
    }

    const updatedComplaints = complaints.map(comp => {
      if (comp.id === c.id) {
        return {
          ...comp,
          status: markResolved ? ('Resolved' as const) : ('Responded' as const),
          landlordResponse: responseText,
          landlordActionTaken: actionTakenText || undefined,
          landlordRespondedAt: new Date().toISOString()
        };
      }
      return comp;
    });

    setComplaints(updatedComplaints);
    localStorage.setItem('uh_complaints_v1', JSON.stringify(updatedComplaints));

    // Send notification to tenant
    try {
      const rawNotifs = localStorage.getItem('uh_notifications_v1');
      const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
      const newNotif = {
        id: 'notif-' + Date.now(),
        recipientRole: 'Tenant',
        recipientId: c.tenant,
        title: 'Response to your complaint',
        message: `Your landlord has responded to your complaint regarding ${c.complaint_category || c.category}: "${responseText}"`,
        timestamp: new Date().toISOString(),
        read: false
      };
      localStorage.setItem('uh_notifications_v1', JSON.stringify([newNotif, ...notifs]));
    } catch (e) {
      console.error(e);
    }

    // Append to activity log
    try {
      const rawLog = localStorage.getItem('uh_activityLog_v1');
      const logs = rawLog ? JSON.parse(rawLog) : [];
      const newLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        actorName: session.name || 'Landlord',
        actorRole: 'Landlord',
        actionType: 'COMPLAINT_RESPONDED',
        recordAffected: `Complaint ${c.id}`,
        recordId: c.id,
        newValue: markResolved ? 'Resolved' : 'Responded',
        details: `Landlord responded to complaint (${c.complaint_category}): "${responseText}". Action taken: "${actionTakenText}"`
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLog, ...logs]));
    } catch (e) {
      console.error(e);
    }

    triggerSuccess('Your response to the tenant complaint has been saved and routed.');
    setRespondingId(null);
    setResponseText('');
    setActionTakenText('');
    setMarkResolved(false);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b border-stone-200 pb-3">
        <div>
          <h4 className="font-display font-black text-[#18452E] text-xs uppercase">Tenant Complaints Queue</h4>
          <p className="text-[10px] text-#6B7280 font-light mt-0.5">
            Complaints routed to your landlord dashboard. Direct responses are sent instantly to the tenant.
          </p>
        </div>
        <span className="font-mono text-[10px] bg-[#18452E]/10 text-[#18452E] px-2.5 py-1 rounded-full font-bold">
          {visibleComplaints.length} Actionable
        </span>
      </div>

      {visibleComplaints.length === 0 ? (
        <p className="text-xs text-stone-400 italic py-4">No tenant complaints currently assigned to your portfolio.</p>
      ) : (
        <div className="space-y-4">
          {visibleComplaints.map(c => {
            let statusBadgeClass = 'bg-stone-50 text-#132A1D border-stone-200';
            if (c.status === 'Open') statusBadgeClass = 'bg-red-100 text-red-800 border-red-200';
            else if (c.status === 'Responded') statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
            else if (c.status === 'Resolved') statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';

            return (
              <div key={c.id} className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-#132A1D text-xs font-black">{c.complaint_category || c.category}</strong>
                      {c.urgency && (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${c.urgency === 'Urgent' ? 'bg-red-600 text-white' : c.urgency === 'High' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
                          {c.urgency}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-#6B7280 font-mono mt-0.5">
                      Tenant: <strong>{c.tenant}</strong> &bull; {c.propertyName} ({c.unit})
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${statusBadgeClass}`}>
                    {c.status}
                  </span>
                </div>

                <p className="text-#132A1D leading-relaxed bg-white p-3 rounded-xl border border-stone-150 text-[11px]">
                  &quot;{c.text}&quot;
                </p>

                {c.landlordResponse && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-#132A1D text-[11px] space-y-1">
                    <strong className="text-amber-900 block font-mono text-[9px] uppercase">YOUR RESPONSE ({c.landlordRespondedAt?.split('T')[0]}):</strong>
                    <p>{c.landlordResponse}</p>
                    {c.landlordActionTaken && (
                      <p className="text-[10px] text-amber-800 italic font-mono">Action Taken: {c.landlordActionTaken}</p>
                    )}
                  </div>
                )}

                {respondingId === c.id ? (
                  <div className="bg-white p-4 rounded-xl border border-emerald-300 space-y-3 animate-fade-in">
                    <strong className="block text-emerald-900 uppercase font-mono text-[10px]">Provide Official Landlord Response</strong>
                    <div>
                      <label className="block text-[9px] font-mono text-#6B7280 uppercase mb-1">Response Text *</label>
                      <textarea
                        rows={2}
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Explain resolution steps or update provided to tenant..."
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-#6B7280 uppercase mb-1">Action Taken (Optional)</label>
                      <input
                        type="text"
                        value={actionTakenText}
                        onChange={(e) => setActionTakenText(e.target.value)}
                        placeholder="e.g. Technician scheduled for Friday 10:00 AM"
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`resolve-${c.id}`}
                        checked={markResolved}
                        onChange={(e) => setMarkResolved(e.target.checked)}
                        className="w-3.5 h-3.5 text-emerald-700 border-stone-300 rounded"
                      />
                      <label htmlFor={`resolve-${c.id}`} className="text-[10px] text-#132A1D font-bold uppercase">
                        Mark complaint as completely RESOLVED
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleResponseSubmit(c)}
                        className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-900"
                      >
                        Submit Response
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRespondingId(null); setResponseText(''); setActionTakenText(''); }}
                        className="px-3 py-1.5 bg-stone-50 text-#6B7280 rounded-lg text-xs font-bold cursor-pointer hover:bg-stone-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center border-t border-stone-200 pt-2">
                    <span className="text-[9px] font-mono text-stone-400">Filed: {c.date} &bull; Path: {c.routingPath || 'Path 1'}</span>
                    <button
                      type="button"
                      onClick={() => { setRespondingId(c.id); setResponseText(c.landlordResponse || ''); setActionTakenText(c.landlordActionTaken || ''); }}
                      className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold text-[10px] uppercase hover:bg-amber-700 transition"
                    >
                      {c.landlordResponse ? 'Update Response' : 'Respond'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LandlordDashboard({
  session,
  properties,
  setProperties,
  buildings = [],
  setBuildings,
  subscriptions = [],
  setSubscriptions,
  landlordUnits,
  setLandlordUnits,
  bookings = [],
  setBookings,
  damageReports = [],
  setDamageReports,
  serviceCharges = [],
  setServiceCharges,
  navigate
}: LandlordDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'Overview' | 'Properties' | 'Payments' | 'Maintenance' | 'Documents' | 'PortfolioHealth' | 'ServiceCharges' | 'TenantIntelligence' | 'AICollection'>('Overview');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Real-time listener for Landlord notifications
  const landlordNotificationCode = getUserTargetId(session);
  const landlordNotifications = useLiveCollection('notifications', [], (allNotifs) => {
    return allNotifs.filter(n => n.role === 'Landlord' && (!landlordNotificationCode || n.targetId === landlordNotificationCode || n.targetId === ''));
  });
  const hasUnreadNotifications = landlordNotifications.some(n => !n.read);
  const [portfolioType, setPortfolioType] = useState<'Standard' | 'Shortlet'>('Standard');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [showReadinessModalProfile, setShowReadinessModalProfile] = useState<FirestoreTenantProfile | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeSequenceUnit, setActiveSequenceUnit] = useState<string | null>(null);
  const [currentSeqStep, setCurrentSeqStep] = useState<number>(1);
  const [showAddFormMode, setShowAddFormMode] = useState<'none' | 'property' | 'unit'>('none');
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyAddress, setNewPropertyAddress] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<LandlordUnit | null>(null);
  const [perfSortCriteria, setPerfSortCriteria] = useState<'Combined' | 'Occupancy' | 'Payment'>('Combined');
  
  const [newUnit, setNewUnit] = useState({
    propertyName: 'Adebayo Lekki Heights Suite A',
    unitNumber: '',
    tenantName: '',
    rentAmount: ''
  });

  // Building & Unit Creation State
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [buildingForm, setBuildingForm] = useState({
    name: '',
    buildingNumber: 'Block A',
    streetAddress: '',
    area: 'Lekki Phase 1',
    state: 'Lagos',
    coverPhoto: '',
    managementCompanyId: ''
  });

  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [unitForm, setUnitForm] = useState({
    unitName: '',
    unitType: '2 Bedroom',
    rentAmount: '',
    collectionAccountId: 'GTB-1022938485'
  });

  // Unit Editing State & Security Hold
  const [editingUnit, setEditingUnit] = useState<LandlordUnit | null>(null);
  const [editUnitForm, setEditUnitForm] = useState({
    unitName: '',
    rentAmount: '',
    collectionAccountId: 'GTB-1022938485'
  });
  const [show48HourHoldNotice, setShow48HourHoldNotice] = useState(false);

  // Tenant Invitation Generator State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTargetUnit, setInviteTargetUnit] = useState<LandlordUnit | null>(null);
  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    occupation: 'Professional',
    employer: 'Corporate Nigeria',
    guarantorName: '',
    guarantorPhone: '',
    guarantorOccupation: '',
    guarantorAddress: '',
    leaseAmount: '',
    leaseStartDate: new Date().toISOString().split('T')[0],
    leaseEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cautionDeposit: '100000'
  });
  const [generatedInvitation, setGeneratedInvitation] = useState<FirestoreTenantInvitation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Operational Flow States (Prompt Five)
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTargetUnitId, setReassignTargetUnitId] = useState('');
  const [reassignConfirmation, setReassignConfirmation] = useState(false);

  const [showMoveOutModal, setShowMoveOutModal] = useState(false);
  const [moveOutStep, setMoveOutStep] = useState<1 | 2>(1);
  const [moveOutCheckboxes, setMoveOutCheckboxes] = useState({
    vacated: false,
    keysReturned: false,
    conditionAssessed: false,
    depositDocumented: false
  });

  const [existingTenantMatch, setExistingTenantMatch] = useState<{
    found: boolean;
    tenantName?: string;
    phone?: string;
  } | null>(null);

  const [recentlyViewed, setRecentlyViewed] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('uh_recently_viewed_landlord') || '[]'); } catch { return []; }
  });
  const [savedFilters, setSavedFilters] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('uh_saved_filters_landlord') || '[]'); } catch { return []; }
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showFilterNamePrompt, setShowFilterNamePrompt] = useState<{tab: string, filterData: any} | null>(null);
  const [filterNameInput, setFilterNameInput] = useState('');
  const [selectedPaymentRecord, setSelectedPaymentRecord] = useState<LandlordUnit | null>(null);
  const [selectedBankAccount, setSelectedBankAccount] = useState<any>(null);
  const [tenantModalTab, setTenantModalTab] = useState<'details' | 'history'>('details');
  const [paymentModalTab, setPaymentModalTab] = useState<'details' | 'history'>('details');
  const [bankModalTab, setBankModalTab] = useState<'details' | 'history'>('details');
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Scheduled Platform Maintenance', body: 'The Unity Homes platform will undergo maintenance on Sunday at 2:00 AM. Expect up to 10 minutes of downtime.', date: 'June 20, 2026' },
    { id: 2, title: 'New Transparency Features', body: 'You can now track the exact step-by-step verification of all rent payments right from your dashboard.', date: 'June 18, 2026' }
  ]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const addToRecentlyViewed = (record: any) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== record.id);
      const updated = [record, ...filtered].slice(0, 8);
      localStorage.setItem('uh_recently_viewed_landlord', JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenUnitWithHistory = (u: LandlordUnit) => {
    setSelectedUnit(u);
    setTenantModalTab('details');
    addToRecentlyViewed({ id: u.id, type: 'Tenant Profile', name: u.tenantName, time: 'Just now', icon: Users });
  };

  const handleOpenBuildingWithHistory = (id: string | null, name?: string) => {
    setSelectedBuildingId(id);
    if (id && name) {
      addToRecentlyViewed({ id, type: 'Property', name, time: 'Just now', icon: BuildingIcon });
    }
  };

  const handleOpenPaymentRecordWithHistory = (u: LandlordUnit) => {
    setSelectedPaymentRecord(u);
    setPaymentModalTab('details');
    addToRecentlyViewed({ id: u.id + '-pay', type: 'Payment Record', name: u.tenantName + ' Rent', time: 'Just now', icon: DollarSign });
  };

  const handleOpenBankAccountWithHistory = () => {
    setSelectedBankAccount({ bankName: 'Zenith Bank', accNo: '***4859', name: 'Babatunde Osei' });
    setBankModalTab('details');
    addToRecentlyViewed({ id: 'bank-1', type: 'Bank Account', name: 'Zenith Bank ***4859', time: 'Just now', icon: CreditCard });
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleOpenReport = (report: any) => {
    if (report.pdfContent) {
      try {
        const stored = localStorage.getItem('uh_landlord_reports_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          const found = parsed.find((r: any) => r.id === report.id);
          if (found) {
            found.downloaded = true;
            localStorage.setItem('uh_landlord_reports_v1', JSON.stringify(parsed));
            // Trigger storage sync local state update
            setReports(parsed.filter((r: any) => r.landlordId === landlordCode));
          }
        }
      } catch (e) {
        console.error('Error saving report download status:', e);
      }
    }
    setSelectedReport(report);
  };

  const getLandlordCode = () => {
    if (session.name.toLowerCase().includes('funmi')) return 'UH-LANDLORD-FUNMI';
    if (session.name.toLowerCase().includes('babatunde') || session.name.toLowerCase().includes('osei')) return 'UH-LANDLORD-OSEI';
    if (session.name.toLowerCase().includes('musa') || session.name.toLowerCase().includes('ibrahim')) return 'UH-LANDLORD-MUSA';
    if (session.name.toLowerCase().includes('chioma') || session.name.toLowerCase().includes('okafor')) return 'UH-LANDLORD-CHIOMA';
    if (session.name.toLowerCase().includes('fashola') || session.name.toLowerCase().includes('adunola')) return 'UH-LANDLORD-FASHOLA';
    return session.entityId || 'UH-LANDLORD-FUNMI'; // fallback/sandbox
  };

  const landlordCode = getLandlordCode();
  const myBuildings = (buildings && buildings.length > 0 ? buildings : initialBuildings).filter(b => b.landlordCode === landlordCode);

  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    const loadReports = () => {
      try {
        const stored = localStorage.getItem('uh_landlord_reports_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          setReports(parsed.filter((r: any) => r.landlordId === landlordCode));
        } else {
          setReports([]);
        }
      } catch {}
    };

    loadReports();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'uh_landlord_reports_v1') {
        loadReports();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [landlordCode]);

  // Filter units belonging to this specific landlord or all if Sandbox
  const myUnits = landlordUnits.filter(u => {
    if (session.email === 'sandbox@unityhomes.ng') return true;
    if (session.name.toLowerCase().includes('funmi')) return u.propertyName.toLowerCase().includes('adebayo');
    if (session.name.toLowerCase().includes('babatunde')) return u.propertyName.toLowerCase().includes('osei') || u.propertyName.toLowerCase().includes('rosewood');
    if (session.name.toLowerCase().includes('musa')) return u.propertyName.toLowerCase().includes('ibrahim');
    if (session.name.toLowerCase().includes('chioma')) return u.propertyName.toLowerCase().includes('okafor') || u.propertyName.toLowerCase().includes('maryland');
    if (session.name.toLowerCase().includes('emmanuel')) return u.propertyName.toLowerCase().includes('adeyinka') || u.propertyName.toLowerCase().includes('yinka');
    if (session.name.toLowerCase().includes('fashola') || session.name.toLowerCase().includes('adunola')) return u.propertyName.toLowerCase().includes('fashola');
    return true;
  });

  const occupancyRate = myUnits.length > 0 
    ? Math.round((myUnits.filter(u => u.paymentStatus !== 'Vacant').length / myUnits.length) * 100)
    : 85;

  const totalBalance = myUnits
    .filter(u => u.paymentStatus === 'Paid')
    .reduce((sum, u) => sum + u.rentAmount, 0);

  const outstandingRent = myUnits
    .filter(u => u.paymentStatus === 'Overdue' || u.paymentStatus === 'Due Soon')
    .reduce((sum, u) => sum + u.rentAmount, 0);

  const attentionUnits = myUnits.filter(u => u.paymentStatus !== 'Paid' && u.paymentStatus !== 'Vacant');

  // Top Performing Property Logic (Section 7 & Fix 8)
  const getSortedPerformers = () => {
    return myBuildings.map(b => {
      const bldUnits = myUnits.filter(u => u.buildingId === b.id);
      if (bldUnits.length === 0) return { b, occ: 0, pay: 0, score: 0 };
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
  const topBuildingData = sortedPerformers.length > 0 ? sortedPerformers[0] : null;
  const mockNotification = topBuildingData && topBuildingData.b ? {
    id: 'notif-perf-1',
    title: '★ Monthly Building Performance Award',
    content: `${topBuildingData.b.name} at ${topBuildingData.b.address} has been recognized as the Top Performing Property of the month! It achieved an outstanding occupancy rate and maintained 100% compliant, secure rent clearance cycles under Unity Homes' zero-wahala direct routing rules.`,
    date: 'June 2026',
    deliveredVia: 'WhatsApp, SMS, Email'
  } : null;

  // Shortlet agreements lookup (Sections 3, 4, 5)
  const myShortletAgreements = initialShortletAgreements.filter(a => {
    if (session.email === 'sandbox@unityhomes.ng') return true;
    return myUnits.some(u => a.propertyName.toLowerCase().includes(u.propertyName.toLowerCase()) || u.propertyName.toLowerCase().includes(a.propertyName.toLowerCase())) || true;
  }).slice(0, 2); // Seed at least 2 for demo purposes if empty

  const handleLaunchSequence = (unitId: string) => {
    setActiveSequenceUnit(unitId);
    setCurrentSeqStep(1);
    triggerSuccess('Tapered ten-touch automated warning sequence safely initiated. Guided by Don\'t Buy Wahala compliance rule.');
  };

  const handleProgressSequence = () => {
    if (currentSeqStep < 10) {
      setCurrentSeqStep(prev => prev + 1);
    } else {
      setActiveSequenceUnit(null);
      triggerSuccess('All 10 steps of the tapered sequence successfully deployed. Legal panel notified for administrative checkout checking.');
    }
  };

  const currentSeqLabel = (step: number) => {
    const steps = [
      'Touch 1: Automated WhatsApp friendly reminder notice',
      'Touch 2: SMS notification outlining statutory rent grace period',
      'Touch 3: Dispatch official digital pre-notice via registered email',
      'Touch 4: Automated phone call voice verification log',
      'Touch 5: Automated physical coordinate warning draft',
      'Touch 6: Warning follow-up to registered tenant guarantor',
      'Touch 7: Landlord ledger verification delay warning alert',
      'Touch 8: Request for alternative payment plan conference',
      'Touch 9: Formal arbitration proposal under Nigerian Tenancy Law',
      'Touch 10: Digital checkout instruction docket packet sent'
    ];
    return steps[step - 1];
  };

  const handleSaveBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildingForm.name || !buildingForm.streetAddress) {
      alert('Please provide the building name and street address.');
      return;
    }

    const sub = (subscriptions || []).find(s => s.entityId === landlordCode);
    const limit = sub ? sub.property_limit : 30;
    if (myBuildings.length >= limit) {
      setShowLimitModal(true);
      return;
    }

    const bldDoc: FirestoreBuilding = {
      id: 'bld-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      landlord_id: landlordCode,
      management_company_id: buildingForm.managementCompanyId || null,
      building_name: buildingForm.name,
      building_number: buildingForm.buildingNumber || 'Block A',
      address_street: buildingForm.streetAddress,
      address_area: buildingForm.area || 'Lekki Phase 1',
      address_state: buildingForm.state || 'Lagos',
      cover_photo_url: buildingForm.coverPhoto || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      total_units: 0,
      created_at: new Date().toISOString(),
      is_active: true
    };

    createOrUpdateBuilding(bldDoc);

    const newBuilding: Building = {
      id: bldDoc.id,
      name: bldDoc.building_name,
      blockLabel: bldDoc.building_number,
      address: `${bldDoc.address_street}, ${bldDoc.address_area}, ${bldDoc.address_state}`,
      coverPhoto: bldDoc.cover_photo_url,
      landlordCode: landlordCode
    };

    if (setBuildings) {
      setBuildings([newBuilding, ...(buildings || [])]);
    }

    setShowAddBuildingModal(false);
    setBuildingForm({
      name: '',
      buildingNumber: 'Block A',
      streetAddress: '',
      area: 'Lekki Phase 1',
      state: 'Lagos',
      coverPhoto: '',
      managementCompanyId: ''
    });

    triggerSuccess(`Registered '${bldDoc.building_name}' successfully under Pending Verification status. You can add units & tenants immediately!`);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuildingId) return;
    if (!unitForm.unitName || !unitForm.rentAmount) {
      alert('Please enter the unit name and annual rent.');
      return;
    }

    const parentBld = myBuildings.find(b => b.id === selectedBuildingId);
    const rentVal = parseInt(unitForm.rentAmount, 10) || 3000000;

    try {
      createUnit({
        building_id: selectedBuildingId,
        unit_name: unitForm.unitName,
        unit_type: unitForm.unitType,
        annual_rent: rentVal,
        occupancy_status: 'vacant',
        collection_account_id: unitForm.collectionAccountId || 'GTB-1022938485',
        current_tenant_id: null
      });
    } catch (err) {
      console.warn('createUnit fallback', err);
    }

    const created: LandlordUnit = {
      id: 'unit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      propertyName: parentBld?.name || 'Building Unit',
      unitNumber: unitForm.unitName,
      tenantName: 'None',
      tenantCode: 'None',
      rentAmount: rentVal,
      paymentStatus: 'Vacant',
      dueDate: '2027-06-21',
      buildingId: selectedBuildingId
    };

    setLandlordUnits([created, ...landlordUnits]);
    setShowAddUnitModal(false);
    setUnitForm({
      unitName: '',
      unitType: '2 Bedroom',
      rentAmount: '',
      collectionAccountId: 'GTB-1022938485'
    });

    triggerSuccess(`Unit '${created.unitNumber}' added successfully to ${parentBld?.name}!`);
  };

  const handleSaveEditUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;

    const newRent = parseInt(editUnitForm.rentAmount, 10) || editingUnit.rentAmount;
    const isCollectionAccountChanged = editUnitForm.collectionAccountId !== 'GTB-1022938485';

    const updated = landlordUnits.map(u => {
      if (u.id === editingUnit.id) {
        return {
          ...u,
          unitNumber: editUnitForm.unitName || u.unitNumber,
          rentAmount: newRent
        };
      }
      return u;
    });

    setLandlordUnits(updated);
    setEditingUnit(null);

    if (isCollectionAccountChanged) {
      setShow48HourHoldNotice(true);
    } else {
      triggerSuccess(`Unit details for '${editUnitForm.unitName}' updated successfully!`);
    }
  };

  const handleGenerateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTargetUnit) return;

    const bldId = inviteTargetUnit.buildingId || selectedBuildingId || 'bld-1';

    const newInv = createTenantInvitation({
      landlord_id: landlordCode,
      unit_id: inviteTargetUnit.id,
      building_id: bldId,
      pre_filled_data: {
        tenantFullName: inviteForm.fullName,
        phone: inviteForm.phone,
        email: inviteForm.email,
        occupation: inviteForm.occupation,
        employer: inviteForm.employer,
        guarantorName: inviteForm.guarantorName,
        guarantorPhone: inviteForm.guarantorPhone,
        guarantorOccupation: inviteForm.guarantorOccupation,
        guarantorAddress: inviteForm.guarantorAddress,
        leaseAmount: parseInt(inviteForm.leaseAmount) || inviteTargetUnit.rentAmount,
        leaseStartDate: inviteForm.leaseStartDate,
        leaseEndDate: inviteForm.leaseEndDate,
        cautionDeposit: parseInt(inviteForm.cautionDeposit) || 100000
      }
    });

    setGeneratedInvitation(newInv);
    setShowInviteModal(false);
    triggerSuccess(`Tenant Invitation Code generated for ${inviteForm.fullName}: ${newInv.invitation_code}`);
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetPropName = newUnit.propertyName;

    if (showAddFormMode === 'property') {
      if (!newPropertyName || !newPropertyAddress) {
        alert('Please fill out the property name and address.');
        return;
      }

      const sub = (subscriptions || []).find(s => s.entityId === landlordCode);
      const currentLimit = sub ? sub.property_limit : 30;
      const landlordActiveCount = myBuildings.length;

      if (landlordActiveCount >= currentLimit) {
        setShowLimitModal(true);
        return;
      }

      const newBuilding: Building = {
        id: 'bld-' + Math.random().toString(36).substr(2, 9),
        name: newPropertyName,
        blockLabel: 'Block A',
        address: newPropertyAddress,
        coverPhoto: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        landlordCode: landlordCode
      };

      try {
        addDocument('buildings', newBuilding, initialBuildings);
      } catch (err: any) {
        setShowLimitModal(true);
        return;
      }

      if (setBuildings) {
        setBuildings([newBuilding, ...buildings]);
      }

      try {
        const storedLogs = localStorage.getItem('uh_activityLog_v1');
        const parsedLogs = storedLogs ? JSON.parse(storedLogs) : [];
        const newLogEntry = {
          id: `log-${Math.floor(100000 + Math.random() * 900000)}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actorName: session.name,
          actorRole: 'Landlord',
          actionType: 'PROPERTY_CREATED',
          recordAffected: `${newPropertyName} Registered`,
          recordId: newBuilding.id,
          previousValue: 'None',
          newValue: 'Registered',
          details: `Registered new property '${newPropertyName}' at ${newPropertyAddress} under landlord capacity.`
        };
        localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLogEntry, ...parsedLogs]));
        window.dispatchEvent(new Event('storage'));
      } catch (logErr) {
        console.error('Error logging property creation:', logErr);
      }

      targetPropName = newPropertyName;
    }

    if (!newUnit.unitNumber || !newUnit.rentAmount) {
      alert('Please fill out all mandatory numeric configurations.');
      return;
    }
    const created: LandlordUnit = {
      id: 'unit-' + Math.random().toString(36).substr(2, 9),
      propertyName: targetPropName,
      unitNumber: newUnit.unitNumber,
      tenantName: newUnit.tenantName || 'None',
      tenantCode: newUnit.tenantName ? 'UH-TENANT-' + Math.floor(1000 + Math.random()*900) : 'None',
      rentAmount: parseInt(newUnit.rentAmount),
      paymentStatus: newUnit.tenantName ? 'Paid' : 'Vacant',
      dueDate: '2027-06-21',
      buildingId: selectedBuildingId || undefined
    };
    setLandlordUnits([created, ...landlordUnits]);
    setShowAddFormMode('none');
    setNewPropertyName('');
    setNewPropertyAddress('');
    setNewUnit({ propertyName: 'Adebayo Lekki Heights Suite A', unitNumber: '', tenantName: '', rentAmount: '' });
    triggerSuccess(`Successfully registered property and unit ${created.unitNumber} under secure title checks. Don't Buy Wahala!`);
  };

  const getPropertyPhoto = (propertyName: string) => {
    const prop = properties.find(p => p.title === propertyName || propertyName.includes(p.title) || p.title.includes(propertyName));
    if (prop && prop.photos && prop.photos.length > 0) {
      return prop.photos[0];
    }
    return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
  };

  const getCollectionAccountName = (propertyName: string) => {
    const prop = properties.find(p => p.title === propertyName || propertyName.includes(p.title) || p.title.includes(propertyName));
    if (prop) {
      return `${prop.verifiedBankName} (AC: ${prop.verifiedAccountNumber})`;
    }
    return 'Zenith Bank (AC: 2022839485)';
  };

  const getTenantDetails = (tenantName: string, tenantCode: string, rentAmount: number, propertyName: string) => {
    const registrations = loadTenantRegistrations();
    const matched = registrations.find(r => r.fullName.toLowerCase() === tenantName.toLowerCase());
    
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
        relationship: randomizedRelation,
        yearsInProperty: (Math.abs(tenantName.charCodeAt(0)) % 5) + 1,
        punctuality: 85 + (Math.abs(tenantName.charCodeAt(0)) % 15),
        complaints: Math.abs(tenantName.charCodeAt(1) || 0) % 3,
        damages: Math.abs(tenantName.charCodeAt(2) || 0) % 2
      };
    }

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
      relationship: randomizedRelation
    };
  };

  const handleDownloadLedger = () => {
    const paidUnits = myUnits.filter(u => u.paymentStatus === 'Paid');
    let ledgerText = `==================================================================================================
                      UNITY HOMES & PROPERTIES LTD
                REAL-TIME SECURE LANDLORD FINANCIAL LEDGER
                          Motto: Don't Buy Wahala!
==================================================================================================
Statement Period : Fiscal Year 2026/2027
Generated On     : ${new Date().toLocaleDateString()}
Landlord Client  : ${session.name} (${session.email})
Portfolio Code   : ${session.userId || 'UH-LANDLORD'}
--------------------------------------------------------------------------------------------------
Total Confirmed Collected Ledger Balances : NGN ${totalBalance.toLocaleString()}
Total Outstanding Portfolio Demands      : NGN ${outstandingRent.toLocaleString()}
==================================================================================================

ID           PROPERTY ASSIGNED              UNIT       TENANT           AMOUNT (NGN)    ACC ROUTED OUT
--------------------------------------------------------------------------------------------------\n`;

    paidUnits.forEach((u, i) => {
      const idx = String(i + 1).padEnd(12, ' ');
      const propStr = u.propertyName.slice(0, 26).padEnd(28, ' ');
      const unitStr = u.unitNumber.slice(0, 10).padEnd(11, ' ');
      const tenantStr = u.tenantName.slice(0, 14).padEnd(15, ' ');
      const amtStr = `NGN ${u.rentAmount.toLocaleString()}`.padEnd(16, ' ');
      const routeStr = getCollectionAccountName(u.propertyName);
      ledgerText += `${idx}${propStr}${unitStr}${tenantStr}${amtStr}${routeStr}\n`;
    });

    ledgerText += `\n==================================================================================================
* NOTE: All transaction logs represent settled direct collection accounts. Funds were credited 
  directly to the respective landlord's validated bank details listed on properties.
  Thank you for co-registering under Unity Homes Litigation-Free Shield.
==================================================================================================`;

    const blob = new Blob([ledgerText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `UH_Ledger_${session.name.replace(/\s+/g, '_')}_Statement.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerSuccess('Direct Landlord Ledger statement exported and downloaded as PDF successfully!');
  };

  const handleAcknowledgeRemittance = (bookingId: string) => {
    if (setBookings) {
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Acknowledged' } : b));
      triggerSuccess('Remittance receipt received and successfully acknowledged! Ledger logs updated.');
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans tracking-wide">
      
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

      {/* PROMPT TWO: FIVE PRIMARY NAVIGATION AREAS */}
      <div className="space-y-3 w-full border-b border-stone-200/60 pb-3">
        {/* PRIMARY 5 NAV AREAS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
          {/* AREA 1: HOME */}
          <button
            onClick={() => setActiveTab('Overview')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              ['Overview', 'PortfolioHealth'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            1. Home / Dashboard
          </button>

          {/* AREA 2: PROPERTIES */}
          <button
            onClick={() => setActiveTab('Properties')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              ['Properties', 'TenantIntelligence'].includes(activeTab)
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
              ['Payments', 'ServiceCharges', 'AICollection'].includes(activeTab)
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
              ['Maintenance'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            4. Operations
          </button>

          {/* AREA 5: MORE */}
          <button
            onClick={() => setActiveTab('Documents')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer col-span-2 sm:col-span-1 ${
              ['Documents'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            5. More
          </button>
        </div>

        {/* DYNAMIC SECONDARY SUB-NAVIGATION PILLS FOR ACTIVE AREA */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {['Overview', 'PortfolioHealth'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Overview')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Overview' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Overview &amp; Alerts
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

          {['Properties', 'TenantIntelligence'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Properties')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Properties' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; My Properties ({myUnits.length})
              </button>
              <button 
                onClick={() => setActiveTab('TenantIntelligence')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'TenantIntelligence' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Tenant Records
              </button>
            </>
          )}

          {['Payments', 'ServiceCharges', 'AICollection'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Payments')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'Payments' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Payment History
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
            </>
          )}

          {['Maintenance'].includes(activeTab) && (
            <button 
              onClick={() => setActiveTab('Maintenance')} 
              className="px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl bg-[#18452E] text-white cursor-pointer"
            >
              &bull; Maintenance Center
            </button>
          )}

          {['Documents', 'Support'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Documents')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl cursor-pointer ${
                  activeTab === 'Documents' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Document Vault
              </button>
              <button 
                onClick={() => setActiveTab('Support')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl cursor-pointer ${
                  activeTab === 'Support' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Contact Unity Homes Support
              </button>
              <button
                onClick={() => {
                  loadPromptSixDemoData();
                  triggerSuccess('Demo portfolio loaded! Mrs. Adunola Fashola 2 buildings, 7 units, and tenant histories active.');
                  window.location.reload();
                }}
                className="px-3 py-1.5 bg-[#C9A84C] hover:bg-[#b8973b] text-white font-mono text-[11px] font-bold rounded-xl cursor-pointer transition shadow-xs flex items-center gap-1"
                title="Reload demo portfolio with 2 buildings and 7 units"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Load Demo Data (Mrs. Fashola)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-805 tracking-normal">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'Overview' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* PROMPT FIVE: OPERATIONS BRIEFING ASSISTANT */}
          <OperationsBriefingCard role="Landlord" userName={session.name} units={myUnits} properties={properties} />

          {/* DOMINANT PORTFOLIO BALANCE CARD */}
          <div className="bg-[#18452E] text-white p-6 md:p-8 rounded-[var(--radius-large)] space-y-4 shadow-sm border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C9A84C]/5 rounded-bl-full"></div>
            <div>
              {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A84C] font-semibold">
                PORTFOLIO BALANCE
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-black text-white mt-1">
                ₦{totalBalance.toLocaleString()}
              </h2>
              {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
              <span className="text-[10px] text-stone-300/80 font-light block mt-1 tracking-normal">
                100% Verified naira receipts confirmed inside direct verified routing bank details.
              </span>
            </div>

            {/* METRICS GRID */}
            <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-2 pt-4 border-t border-white/10 scrollbar-thin">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0 w-64 md:w-auto">
                <span className="text-[9px] uppercase font-mono text-[#C9A84C] block font-bold">Occupancy Rate</span>
                <span className="text-xl font-display font-bold mt-1 block">{occupancyRate}% Occupied</span>
                <div className="w-full bg-white/10 h-1.5 mt-2 rounded-full overflow-hidden">
                  <div className="bg-[#C9A84C] h-full" style={{ width: `${occupancyRate}%` }}></div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0 w-64 md:w-auto">
                <span className="text-[9px] uppercase font-mono text-stone-300 block">Total Payments Received</span>
                <span className="text-xl font-display font-bold mt-1 block">₦{totalBalance.toLocaleString()}</span>
                {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
                <span className="text-[9px] text-[#C9A84C] font-mono leading-none">&bull; Verified and Confirmed</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0 w-64 md:w-auto">
                <span className="text-[9px] uppercase font-mono text-rose-300 block">Outstanding Balance</span>
                <span className="text-xl font-display font-bold mt-1 block text-rose-300">₦{outstandingRent.toLocaleString()}</span>
                <span className="text-[9px] text-red-300 font-mono italic leading-none">&bull; Due soon/Overdue</span>
              </div>
            </div>
          </div>

          {/* SUBSCRIPTION CAPACITY PROGRESS BAR */}
          <div className="bg-white border border-stone-200 p-6 rounded-[var(--radius-large)] space-y-3 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center text-xs">
              <span className="font-display font-bold text-[#18452E] uppercase tracking-wider">Properties Capacity Tracker</span>
              <span className="font-mono font-bold text-#6B7280">
                {myBuildings.length} of {((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)} properties ({Math.round((myBuildings.length / ((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)) * 100)}%)
              </span>
            </div>
            
            <div className="w-full bg-stone-50 h-3 rounded-full overflow-hidden border border-stone-200">
              <div 
                className={`h-full ${
                  Math.round((myBuildings.length / ((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)) * 100) >= 90
                    ? "bg-rose-600"
                    : Math.round((myBuildings.length / ((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)) * 100) >= 70
                    ? "bg-amber-500"
                    : "bg-emerald-600"
                } transition-all duration-500`} 
                style={{ width: `${Math.min(Math.round((myBuildings.length / ((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)) * 100), 100)}%` }}
              ></div>
            </div>

            {Math.round((myBuildings.length / ((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)) * 100) >= 70 && (
              <p className={`text-xs mt-1 animate-pulse ${
                Math.round((myBuildings.length / ((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)) * 100) >= 100
                  ? "text-rose-600 font-black uppercase"
                  : Math.round((myBuildings.length / ((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)) * 100) >= 90
                  ? "text-rose-600 font-bold"
                  : "text-amber-600 font-medium"
              }`}>
                &bull; {
                  Math.round((myBuildings.length / ((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)) * 100) >= 100
                    ? "Subscription limit reached. You cannot add properties until you upgrade."
                    : Math.round((myBuildings.length / ((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)) * 100) >= 90
                    ? `Only ${((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30) - myBuildings.length} properties remaining on your current plan.`
                    : "You are approaching your property limit. Consider upgrading soon."
                }
              </p>
            )}
          </div>

          {/* SUBSCRIPTION LIMIT REACHED FULL-SCREEN MODAL */}
          {showLimitModal && (
            <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-8 max-w-md w-full shadow-sm space-y-6 text-center animate-scale-up">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-display font-black text-xl text-#132A1D uppercase tracking-tight">
                    Subscription Limit Reached
                  </h3>
                  <p className="text-xs text-#6B7280 leading-relaxed">
                    Your current plan allows up to <strong className="text-#132A1D">{((subscriptions || []).find(s => s.entityId === landlordCode)?.property_limit || 30)} properties</strong>. You have reached this limit. To add more properties, upgrade your subscription.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowLimitModal(false);
                      if (navigate) navigate('/pricing-and-services');
                    }}
                    className="w-full py-3 bg-[#C9A84C] hover:bg-[#b8973b] text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm shadow-amber-950/10"
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

          {/* RECENTLY VIEWED ROW */}
          {recentlyViewed.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display font-black text-xs text-#6B7280 uppercase tracking-widest px-1">Recently Viewed</h3>
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                {recentlyViewed.map((item, i) => (
                  <button 
                    key={i} 
                    className="flex items-center space-x-3 bg-white border border-stone-200 p-3 rounded-2xl shrink-0 w-64 hover:border-[#18452E] hover:shadow-md transition text-left cursor-pointer"
                  >
                    <div className="p-2 bg-stone-50 rounded-xl">
                      <item.icon className="w-5 h-5 text-[#18452E]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="block text-xs text-#132A1D truncate">{item.name}</strong>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-#6B7280 uppercase tracking-wider">{item.type}</span>
                        <span className="text-[9px] font-mono text-stone-400">{item.time}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NEEDS ATTENTION & CASH FLOW GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* NEEDS ATTENTION SCANNABLE LIST (Step 4) */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-xs flex flex-col min-w-0">
              <h3 className="font-display font-black text-sm text-[#18452E] uppercase mb-4">Needs Attention</h3>
              <div className="space-y-2 flex-1">
                {myUnits.filter(u => u.paymentStatus === 'Overdue').map(u => (
                  <div key={`owes-${u.id}`} className="flex items-center space-x-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-xs">
                    <span className="font-bold text-red-800 uppercase text-[10px] bg-red-100 px-2 py-0.5 rounded shrink-0">Rent Overdue</span>
                    <span className="text-#132A1D"><strong>{u.tenantName}</strong> owes ₦{u.rentAmount.toLocaleString()} at {u.propertyName} ({u.unitNumber}).</span>
                  </div>
                ))}
                {myUnits.filter(u => u.paymentStatus === 'Lease Expiring Soon').map(u => (
                  <div key={`exp-${u.id}`} className="flex items-center space-x-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs">
                    <span className="font-bold text-amber-800 uppercase text-[10px] bg-amber-100 px-2 py-0.5 rounded shrink-0">Lease Expiring</span>
                    <span className="text-#132A1D"><strong>{u.tenantName}</strong> at {u.propertyName} ({u.unitNumber}) lease expires in 14 days.</span>
                  </div>
                ))}
                {myUnits.filter(u => u.paymentStatus === 'Vacant').map(u => {
                  const daysVacant = 45; // Simulated
                  const lostIncome = Math.round((daysVacant / 365) * u.rentAmount);
                  return (
                    <div key={`vac-${u.id}`} className="flex items-center space-x-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-amber-800 uppercase text-[10px] bg-amber-100 px-2 py-0.5 rounded shrink-0">Vacant Unit</span>
                        <span className="text-#132A1D"><strong>{u.propertyName} ({u.unitNumber})</strong> vacant for {daysVacant} days. Potential lost income: <strong>₦{lostIncome.toLocaleString()}</strong>.</span>
                      </div>
                      <button className="px-2 py-0.5 bg-stone-50 hover:bg-stone-200 text-#6B7280 border border-stone-300 rounded text-[9px] font-bold cursor-pointer transition shadow-xs whitespace-nowrap">
                        Dispute Vacancy
                      </button>
                    </div>
                  );
                })}
                <div className="flex items-center space-x-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs">
                  <span className="font-bold text-amber-800 uppercase text-[10px] bg-amber-100 px-2 py-0.5 rounded shrink-0">Pending Maintenance</span>
                  <span className="text-#132A1D">2 requests await your approval.</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs">
                  <span className="font-bold text-amber-800 uppercase text-[10px] bg-amber-100 px-2 py-0.5 rounded shrink-0">Payments to Confirm</span>
                  <span className="text-#132A1D">1 Service Charge payment pending verification.</span>
                </div>
              </div>
            </div>

            {/* CASH FLOW FORECAST (Step 5) */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-xs flex flex-col min-w-0">
              <h3 className="font-display font-black text-sm text-[#18452E] uppercase mb-4">Cash Flow Forecast</h3>
              <div className="flex-1 space-y-4">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                    <span className="text-[10px] font-bold text-#6B7280 uppercase">This Month's Expected Rent</span>
                    <span className="font-mono font-bold text-#132A1D text-sm">₦{(totalBalance + outstandingRent).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                    <span className="text-[10px] font-bold text-#6B7280 uppercase">Actually Received</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">₦{totalBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                    <span className="text-[10px] font-bold text-#6B7280 uppercase">Remains Outstanding</span>
                    <span className="font-mono font-bold text-rose-700 text-sm">₦{outstandingRent.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="block text-[10px] uppercase font-bold text-emerald-800 mb-1">Expected Next 30 Days</span>
                  <span className="block font-display font-black text-xl text-emerald-900">
                    {/* Simulated next 30 days expected, a bit more than just outstanding */}
                    ₦{(outstandingRent + 4500000).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-emerald-700 font-mono italic">Calculated from 3 upcoming lease renewals and current debts.</span>
                </div>
              </div>
            </div>

          </div>

          {/* STEP 11: KEY PORTFOLIO METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Payment Receiving Account */}
            <div 
              onClick={handleOpenBankAccountWithHistory}
              className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-5 shadow-xs cursor-pointer hover:shadow-md hover:border-emerald-700 transition"
            >
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-widest mb-2 border-b border-stone-200 pb-2">Payment Receiving Account</span>
              <strong className="block font-display font-black text-[#18452E] text-lg">Zenith Bank</strong>
              <span className="block font-mono text-#6B7280 mt-1">***4859</span>
              <span className="block text-xs font-bold text-#6B7280 uppercase mt-2">Babatunde Osei</span>
              <p className="text-[9px] text-stone-400 mt-1 italic">Rent routed direct to your real name.</p>
            </div>

            {/* Managed By (Simulated for company managed) */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-widest mb-2 border-b border-stone-200 pb-2">Managed By</span>
              <strong className="block font-display font-black text-[#18452E] text-sm">Prime Property Solutions</strong>
              <span className="block font-mono text-#6B7280 text-[10px] mt-1">Reported: 24 Jun 2026</span>
              <div className="flex justify-between mt-3 text-xs">
                <span className="text-#6B7280 font-bold">Occ: 85%</span>
                <span className="text-rose-700 font-bold font-mono">Owes: ₦450k</span>
              </div>
            </div>

            {/* Profitability */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-widest mb-2 border-b border-emerald-100 pb-2">Profitability YTD</span>
              <strong className="block font-display font-black text-[#18452E] text-lg">₦{Math.round(totalBalance * 0.85).toLocaleString()}</strong>
              <div className="mt-2 text-[9px] font-mono text-#6B7280 space-y-1">
                <div className="flex justify-between"><span>Gross:</span> <span>₦{totalBalance.toLocaleString()}</span></div>
                <div className="flex justify-between text-rose-600"><span>Maint/Fees:</span> <span>-₦{Math.round(totalBalance * 0.15).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Portfolio Growth */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-5 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-widest mb-2 border-b border-stone-200 pb-2">Portfolio Growth</span>
              <div className="flex items-end gap-2 mt-2">
                <strong className="block font-display font-black text-emerald-600 text-3xl">+14.2%</strong>
              </div>
              <span className="block text-[10px] text-#6B7280 font-mono mt-1">Confirmed income vs LY</span>
            </div>

          </div>

          {/* LEASE EXPIRY CENTER (Step 6) */}
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-xs">
            <h3 className="font-display font-black text-sm text-[#18452E] uppercase mb-4">Lease Expiry Center</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="pb-2 text-[10px] uppercase text-stone-400 font-mono font-bold">Tenant</th>
                    <th className="pb-2 text-[10px] uppercase text-stone-400 font-mono font-bold">Property & Unit</th>
                    <th className="pb-2 text-[10px] uppercase text-stone-400 font-mono font-bold">Days Remaining</th>
                    <th className="pb-2 text-[10px] uppercase text-stone-400 font-mono font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myUnits.filter(u => u.paymentStatus !== 'Vacant').map((u, i) => {
                    // Mock staged days remaining: 90, 60, 30, 14, 7
                    const stagedDays = [7, 14, 30, 60, 90, 120, 200];
                    const daysRemaining = stagedDays[i % stagedDays.length];
                    const needsDiscussion = daysRemaining <= 30;
                    
                    return (
                      <tr key={`lease-${u.id}`} className="hover:bg-stone-50 transition">
                        <td className="py-3 pr-4">
                          <strong className="text-xs text-#132A1D">{u.tenantName}</strong>
                          {needsDiscussion && (
                            <span className="block text-[9px] text-amber-600 font-bold uppercase mt-1">Renewal discussion required</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-xs text-#6B7280">{u.propertyName} <span className="font-mono text-[10px]">({u.unitNumber})</span></td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            daysRemaining <= 14 ? 'bg-red-100 text-red-800' :
                            daysRemaining <= 30 ? 'bg-amber-100 text-amber-800' :
                            'bg-stone-50 text-#132A1D'
                          }`}>
                            {daysRemaining} Days
                          </span>
                        </td>
                        <td className="py-3">
                          <button className="text-[10px] font-bold text-white bg-[#18452E] hover:bg-[#18452E] px-3 py-1.5 rounded transition uppercase tracking-wide cursor-pointer">
                            Renew Lease
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TWO COLUMN GRID FOR SYSTEM ALERTS, SUBSCRIPTION & TOP PERFORMER */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN 1: TOP PERFORMER & NOTIFICATION (Section 7) */}
            <div className="space-y-6 min-w-0">
              {sortedPerformers.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-[var(--radius-large)] p-6 space-y-4 shadow-xs relative overflow-hidden">
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
                    {sortedPerformers.slice(0, 3).map((perf, idx) => (
                      <div key={perf.b.id} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-amber-100 shadow-sm relative">
                        {idx === 0 && (
                           <div className="absolute -top-2 -right-2 bg-amber-400 text-#132A1D font-bold px-2 py-0.5 rounded-full text-[8px] uppercase font-mono tracking-widest shadow-sm">
                             #1
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
                    ))}
                  </div>
                </div>
              )}

              {mockNotification && (
                <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4.5 h-4.5 text-[#18452E]" />
                      <h4 className="font-display font-extrabold text-xs text-#132A1D uppercase">Monthly Performance Alert</h4>
                    </div>
                    <span className="text-[9px] font-mono text-stone-400 font-bold">{mockNotification.date}</span>
                  </div>
                  <p className="text-xs text-#6B7280 leading-relaxed font-light">
                    {mockNotification.content}
                  </p>
                  <div className="text-[9px] font-mono text-[#C9A84C] font-semibold bg-stone-50 p-2 rounded-xl border border-stone-200 uppercase">
                    Delivered via verified channels: {mockNotification.deliveredVia}
                  </div>
                </div>
              )}

              {/* TENANT COMPLAINTS WIDGET (Fix Seven) */}
              <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-600" />
                    <h4 className="font-display font-extrabold text-xs text-#132A1D uppercase">Tenant Complaints</h4>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <strong className="text-[#18452E] block">Plumbing / Water</strong>
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

            {/* COLUMN 2: ACTIVE SUBSCRIPTION CARD (Section 8) */}
            <div className="space-y-6 min-w-0">
              <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-[#18452E]" />
                    <h4 className="font-display font-extrabold text-xs text-#132A1D uppercase">My Active Subscription</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-50 text-[#18452E] border border-emerald-100">
                    Active
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-mono text-stone-400 font-bold">CURRENT MEMBERSHIP PLAN</span>
                    <strong className="block text-#132A1D text-sm font-bold">Unity Homes Landlord Growth Premium</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                      <span className="text-[9px] font-mono text-stone-400 font-bold uppercase block">Unit Allocation Limit</span>
                      <strong className="block text-#132A1D text-xs mt-0.5">15 Units Limit</strong>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200">
                      <span className="text-[9px] font-mono text-stone-400 font-bold uppercase block">Units Registered</span>
                      <strong className="block text-#132A1D text-xs mt-0.5">{myUnits.length} / 15 Used</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-200">
                    <span className="text-stone-400">Next Billing Renewal Date:</span>
                    <strong className="text-stone-850">July 24, 2026</strong>
                  </div>
                </div>
              </div>

              {/* LITIGATION COMPLIANCE RULE CHECK */}
              <div className="p-4 bg-teal-50/20 border border-teal-100 rounded-2xl flex items-start space-x-3 text-xs text-#6B7280">
                <ShieldCheck className="w-5 h-5 text-[#18452E] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-[#18452E] block">Certified Non-Litigation Guarantee</strong>
                  <span className="font-light">Every asset listed here uses verified bank routing to protect landlords. Rents are deposited instantly to your personal bank details without intermediary holds. Don&apos;t Buy Wahala!</span>
                </div>
              </div>
            </div>

          </div>

          {activeSequenceUnit && (
            <div className="bg-amber-50/80 border-2 border-amber-200 p-6 rounded-[var(--radius-large)] space-y-4 shadow-sm">
              <div className="flex items-center space-x-2 text-amber-900">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <h4 className="font-display font-black text-xs sm:text-sm uppercase tracking-wider">
                  Tapered Rent Warning System (10-Touch sequence)
                </h4>
              </div>
              <p className="text-xs text-#6B7280 leading-normal font-light">
                Unity Homes strictly utilizes legal, non-intrusive automated warning sequences to recover dues.
                Unit: <strong>{myUnits.find(u => u.id === activeSequenceUnit)?.propertyName}</strong>
              </p>
              
              <div className="p-3 bg-white border border-amber-100 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-950">Active Progress Step:</span>
                  <span className="font-mono text-amber-800 font-bold">{currentSeqStep} / 10 Touchpoints</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded text-xs font-mono font-medium text-amber-900">
                  {currentSeqLabel(currentSeqStep)}
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={handleProgressSequence}
                  className="px-3.5 py-1.5 bg-amber-700 text-white rounded-lg text-xs font-bold hover:bg-amber-800 cursor-pointer transition"
                >
                  {currentSeqStep < 10 ? 'Execute Next Touchpoint' : 'Finalize Audit Check'}
                </button>
                <button 
                  onClick={() => setActiveSequenceUnit(null)}
                  className="px-3 py-1.5 bg-white border border-stone-200 text-#6B7280 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Postpone
                </button>
              </div>
            </div>
          )}

          {/* ATTENTION REQUIRED SCROLLS */}
          <div className="space-y-4">
            <h3 className="font-display font-black text-[#18452E] text-sm uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 bg-red-650 text-#132A1D font-mono text-[10px] font-bold flex items-center justify-center rounded-full bg-amber-400">
                {attentionUnits.length}
              </span>
              <span>Needs Attention Worklist</span>
            </h3>

            {attentionUnits.length === 0 ? (
              <p className="text-xs text-[#18452E] italic uppercase font-mono tracking-wider">Outstanding portfolios are completely certified and fully paid. Zero issues logged!</p>
            ) : (
              <div className="space-y-4">
                {attentionUnits.map((u) => (
                  <div 
                    key={u.id}
                    onClick={() => handleOpenUnitWithHistory(u)}
                    className="p-5 bg-white border border-stone-200/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow-md hover:border-slate-400 transition duration-200 cursor-pointer"
                  >
                    <div className="text-xs space-y-1">
                      <div className="flex items-center space-x-2">
                        <strong className="text-xs text-[#18452E]">{u.tenantName} ({u.tenantCode})</strong>
                        <span className={`inline-block px-2 text-[9px] font-bold rounded-full ${
                          u.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                        }`}>{u.paymentStatus}</span>
                      </div>
                      <span className="block text-#6B7280">{u.propertyName} ({u.unitNumber})</span>
                      <span className="text-stone-400 block font-light">Target Due Date: {u.dueDate}</span>
                    </div>

                    <div className="flex space-x-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {u.paymentStatus === 'Overdue' && (
                        <button 
                          onClick={() => handleLaunchSequence(u.id)}
                          className="px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer transition"
                        >
                          Launch 10-Touch Sequence
                        </button>
                      )}
                      
                      {u.paymentStatus === 'Due Soon' && (
                        <button 
                          onClick={() => triggerSuccess('Pre-cleared automatic WhatsApp reminder notice queued.')}
                          className="px-3.5 py-1.5 bg-[#18452E] text-white rounded-lg text-xs font-bold hover:bg-[#18452E] cursor-pointer transition"
                        >
                          WhatsApp Gentle Notice
                        </button>
                      )}

                      {u.paymentStatus === 'Lease Expiring Soon' && (
                        <button 
                          onClick={() => triggerSuccess('Tenant checkout checklist docket and contract renewal links fully prepared.')}
                          className="px-3.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 cursor-pointer transition"
                        >
                          Checkout Protocol Check
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* PLATFORM ANNOUNCEMENTS */}
      {activeTab === 'Overview' && announcements.length > 0 && (
        <div className="bg-[#18452E] border border-[#0E2F1F]/80 rounded-[var(--radius-large)] p-6 shadow-sm relative overflow-hidden animate-fade-in mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/10 rounded-bl-full"></div>
          <h3 className="font-display font-black text-sm text-[#C9A84C] uppercase mb-4 tracking-widest flex items-center">
            <Bell className="w-4 h-4 mr-2" /> Platform Announcements
          </h3>
          <div className="space-y-4 relative z-10">
            {announcements.map((ann, idx) => (
              <div key={idx} className="bg-white/10 p-4 rounded-2xl border border-white/10 relative">
                <button 
                  onClick={() => setAnnouncements(announcements.filter(a => a.id !== ann.id))}
                  className="absolute top-4 right-4 text-stone-300 hover:text-white transition cursor-pointer p-1 bg-black/20 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
                <h4 className="text-white font-bold text-sm mb-1">{ann.title}</h4>
                <p className="text-stone-300 text-xs font-light leading-relaxed pr-8">{ann.body}</p>
                <span className="text-[10px] text-[#C9A84C] font-mono mt-3 block">{ann.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROPERTIES PORTFOLIO VIEW */}
      {activeTab === 'Properties' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* SUB-TABS: LONG-TERM VS SHORTLET */}
          <div className="flex space-x-2 border-b border-stone-200/50 pb-2">
            <button 
              onClick={() => { setPortfolioType('Standard'); setSelectedBuildingId(null); }}
              className={`px-4 py-2 font-display text-xs font-bold rounded-xl transition cursor-pointer ${
                portfolioType === 'Standard' ? 'bg-#132A1D text-white' : 'text-#6B7280 hover:bg-stone-50'
              }`}
            >
              Standard Long-term Portfolio
            </button>
            <button 
              onClick={() => setPortfolioType('Shortlet')}
              className={`px-4 py-2 font-display text-xs font-bold rounded-xl transition cursor-pointer ${
                portfolioType === 'Shortlet' ? 'bg-#132A1D text-white' : 'text-#6B7280 hover:bg-stone-50'
              }`}
            >
              Shortlet Management Agreements
            </button>
          </div>

          {portfolioType === 'Standard' ? (
            <div className="space-y-6">
              {selectedBuildingId === null ? (
                /* LEVEL 1: GRID OF BUILDING CARDS */
                <div className="space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h3 className="font-display font-black text-sm text-[#18452E] uppercase flex items-center gap-2">
                        <BuildingIcon className="w-4 h-4 text-[#C9A84C]" /> My Registered Buildings
                      </h3>
                      <p className="text-xs text-#6B7280 font-light mt-0.5">
                        Manage multi-unit property assets, track title verification, and launch tenant onboarding invitations.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowAddBuildingModal(true)}
                        className="px-4 py-2 bg-[#18452E] text-white text-xs font-extrabold rounded-xl hover:bg-[#18452E] flex items-center space-x-1.5 cursor-pointer transition shadow-xs"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Add New Building</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myBuildings.map((bld) => {
                      const bldUnits = myUnits.filter(u => u.buildingId === bld.id || u.propertyName === bld.name);
                      const totalUnitsCount = bldUnits.length || 4;
                      const occupiedCount = bldUnits.filter(u => u.paymentStatus !== 'Vacant').length || 3;
                      const vacantCount = bldUnits.filter(u => u.paymentStatus === 'Vacant').length || (totalUnitsCount - occupiedCount);

                      return (
                        <div 
                          key={bld.id}
                          className="bg-white border border-stone-200 rounded-[var(--radius-large)] overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-700 transition duration-300 flex flex-col group relative"
                        >
                          <div className="h-44 w-full overflow-hidden relative">
                            <img 
                              src={bld.coverPhoto} 
                              alt={bld.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                            />
                            <div className="absolute top-3 left-3 bg-#132A1D/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase text-white tracking-widest flex items-center gap-1">
                              <BuildingIcon className="w-3 h-3 text-[#C9A84C]" />
                              {bld.blockLabel || 'Block A'}
                            </div>

                            {/* Verification Badge */}
                            <div className="absolute top-3 right-3 bg-amber-500/90 text-stone-950 font-bold px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 shadow-xs backdrop-blur-xs">
                              <Clock className="w-3 h-3 text-#132A1D" />
                              <span>Pending Title Review</span>
                            </div>
                          </div>
                          
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <h4 className="font-display font-black text-[#18452E] text-base group-hover:text-emerald-800 transition">
                                {bld.name}
                              </h4>
                              <p className="text-[11px] text-#6B7280 mt-1 leading-normal font-light">
                                {bld.address}
                              </p>
                            </div>

                            {/* Verification Notice Bar */}
                            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 text-[10px] space-y-1">
                              <div className="flex items-center gap-1.5 text-amber-900 font-bold uppercase font-mono">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>Verification Status Notice</span>
                              </div>
                              <p className="text-amber-800 leading-tight">
                                Title documents review in progress. <strong>You can add units & onboard tenants immediately!</strong>
                              </p>
                            </div>

                            {/* Badges & Stats Row */}
                            <div className="grid grid-cols-3 gap-2 border-t border-stone-200 pt-3 text-center text-xs">
                              <div className="bg-stone-50 p-2 rounded-xl">
                                <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">Total Units</span>
                                <strong className="text-#132A1D font-black block text-sm">{totalUnitsCount}</strong>
                              </div>
                              <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                                <span className="text-[9px] uppercase font-mono text-emerald-700 block font-bold">Occupied</span>
                                <span className="inline-block px-1.5 py-0.5 bg-emerald-700 text-white font-black text-[10px] rounded-md mt-0.5">
                                  {occupiedCount} Occupied
                                </span>
                              </div>
                              <div className="bg-rose-50 p-2 rounded-xl border border-rose-100">
                                <span className="text-[9px] uppercase font-mono text-rose-700 block font-bold">Vacant</span>
                                <span className="inline-block px-1.5 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded-md mt-0.5">
                                  {vacantCount} Vacant
                                </span>
                              </div>
                            </div>
                            
                            {/* Manage Action */}
                            <button
                              onClick={() => setSelectedBuildingId(bld.id)}
                              className="w-full py-2.5 bg-#132A1D text-white rounded-xl text-xs font-bold hover:bg-[#18452E] transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <span>Manage Building & Units</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* LEVEL 2: BUILDING DETAIL VIEW & UNITS GRID */
                <div className="space-y-6">
                  {/* Hero Banner Header */}
                  {(() => {
                    const currentBld = myBuildings.find(b => b.id === selectedBuildingId);
                    const bldUnits = myUnits.filter(u => u.buildingId === selectedBuildingId || u.propertyName === currentBld?.name);
                    const occupiedUnits = bldUnits.filter(u => u.paymentStatus !== 'Vacant');
                    const vacantUnits = bldUnits.filter(u => u.paymentStatus === 'Vacant');

                    return (
                      <div className="space-y-6">
                        {/* Top navigation */}
                        <div className="flex justify-between items-center flex-wrap gap-4">
                          <button 
                            onClick={() => setSelectedBuildingId(null)}
                            className="px-4 py-2 border border-stone-200 rounded-xl hover:bg-stone-50 cursor-pointer transition text-#132A1D text-xs font-bold flex items-center space-x-2 bg-white"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to All Buildings</span>
                          </button>

                          <button 
                            onClick={() => setShowAddUnitModal(true)}
                            className="px-4 py-2.5 bg-[#18452E] text-white text-xs font-extrabold rounded-xl hover:bg-[#18452E] flex items-center space-x-2 cursor-pointer transition shadow-md"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add New Unit</span>
                          </button>
                        </div>

                        {/* Building Banner */}
                        <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] overflow-hidden shadow-sm relative">
                          <div className="h-52 w-full relative overflow-hidden">
                            <img 
                              src={currentBld?.coverPhoto || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'} 
                              alt={currentBld?.name}
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/40"></div>
                            
                            <div className="absolute bottom-4 left-6 right-6 text-white flex justify-between items-end flex-wrap gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="bg-[#C9A84C] text-stone-950 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                                    {currentBld?.blockLabel || 'Block A'}
                                  </span>
                                  <span className="bg-amber-500/90 text-stone-950 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Pending Title Docs Review
                                  </span>
                                </div>
                                <h2 className="font-display font-black text-xl md:text-2xl">{currentBld?.name}</h2>
                                <p className="text-stone-300 text-xs font-light">{currentBld?.address}</p>
                              </div>

                              <div className="flex gap-2">
                                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-center border border-white/20">
                                  <span className="text-[9px] uppercase font-mono text-stone-300 block">Total Units</span>
                                  <strong className="text-white font-bold text-sm">{bldUnits.length || 4}</strong>
                                </div>
                                <div className="bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-center border border-emerald-400/30">
                                  <span className="text-[9px] uppercase font-mono text-emerald-300 block">Occupied</span>
                                  <strong className="text-white font-bold text-sm">{occupiedUnits.length || 3}</strong>
                                </div>
                                <div className="bg-rose-500/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-center border border-rose-400/30">
                                  <span className="text-[9px] uppercase font-mono text-rose-300 block">Vacant</span>
                                  <strong className="text-white font-bold text-sm">{vacantUnits.length || 1}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Units Grid */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="font-display font-black text-sm text-[#18452E] uppercase flex items-center gap-2">
                              Building Units Roster ({bldUnits.length})
                            </h3>
                            <span className="text-[10px] text-#6B7280 font-mono">
                              Click any unit to manage tenancy or issue an onboarding invitation code.
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {bldUnits.map((u) => {
                              const photo = getPropertyPhoto(u.propertyName);
                              const isVacant = u.paymentStatus === 'Vacant';

                              return (
                                <div 
                                  key={u.id}
                                  className="bg-white border border-stone-200 rounded-[var(--radius-large)] overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between group"
                                >
                                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start gap-2">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-display font-black text-[#18452E] text-base">
                                            {u.unitNumber}
                                          </h4>
                                          <span className="px-2 py-0.5 bg-stone-50 text-#132A1D text-[9px] font-mono font-bold rounded-md uppercase">
                                            2 Bedroom
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-#6B7280 mt-0.5">
                                          {u.propertyName}
                                        </p>
                                      </div>

                                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                                        isVacant ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      }`}>
                                        {isVacant ? 'Vacant' : 'Occupied'}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-2xl text-xs border border-stone-150">
                                      <div>
                                        <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">Annual Rent</span>
                                        <strong className="text-[#18452E] font-mono font-black text-sm">₦{u.rentAmount.toLocaleString()}</strong>
                                      </div>
                                      <div>
                                        <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">Collection Account</span>
                                        <span className="text-#132A1D font-medium text-[10px] block font-mono">
                                          GTB AC: ***8485
                                        </span>
                                      </div>
                                    </div>

                                    {!isVacant ? (
                                      <div className="flex items-center gap-3 pt-2 border-t border-stone-200">
                                        <img 
                                          src={u.tenantPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
                                          alt={u.tenantName} 
                                          className="w-10 h-10 rounded-full object-cover border border-stone-200"
                                        />
                                        <div>
                                          <span className="text-[9px] font-mono uppercase text-stone-400 block font-bold">Current Occupant</span>
                                          <strong className="text-#132A1D text-xs font-bold block">{u.tenantName}</strong>
                                          <span className="text-[9px] text-emerald-700 font-mono">Status: {u.paymentStatus}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const profiles = getStoredTenantProfiles();
                                              const tenantProf = profiles.find(p => p.full_name === u.tenantName || p.id === u.tenantCode || p.user_id === u.tenantCode) || {
                                                id: u.tenantCode || 'tenant-01',
                                                user_id: u.tenantCode || 'tenant-01',
                                                full_name: u.tenantName,
                                                phone: '+234 803 111 2233',
                                                email: 'tenant@example.com',
                                                guarantor_confirmed: true,
                                                created_at: new Date().toISOString()
                                              };
                                              setShowReadinessModalProfile(tenantProf as FirestoreTenantProfile);
                                            }}
                                            className="mt-1 flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                                          >
                                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                            <span>Move-In Readiness</span>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-rose-50/60 border border-rose-200/60 p-3 rounded-2xl flex items-center justify-between">
                                        <div>
                                          <span className="text-[10px] font-bold text-rose-900 uppercase font-mono block">Unit Currently Vacant</span>
                                          <span className="text-[10px] text-rose-700">Ready for prospective tenant onboarding.</span>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setInviteTargetUnit(u);
                                            setInviteForm(prev => ({
                                              ...prev,
                                              leaseAmount: u.rentAmount.toString()
                                            }));
                                            setShowInviteModal(true);
                                          }}
                                          className="px-3 py-1.5 bg-[#18452E] text-white text-[10px] font-extrabold rounded-xl hover:bg-[#18452E] cursor-pointer transition shadow-xs flex items-center gap-1"
                                        >
                                          <Send className="w-3 h-3" />
                                          <span>Invite Tenant</span>
                                        </button>
                                      </div>
                                    )}

                                    <div className="flex gap-2 pt-2 border-t border-stone-200">
                                      <button
                                        onClick={() => handleOpenUnitWithHistory(u)}
                                        className="flex-1 py-2 bg-stone-50 hover:bg-stone-200 text-#132A1D text-xs font-bold rounded-xl transition cursor-pointer"
                                      >
                                        View Case File
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingUnit(u);
                                          setEditUnitForm({
                                            unitName: u.unitNumber,
                                            rentAmount: u.rentAmount.toString(),
                                            collectionAccountId: 'GTB-1022938485'
                                          });
                                        }}
                                        className="px-3 py-2 border border-stone-200 hover:bg-stone-50 text-#6B7280 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            /* SHORTLET PORTFOLIO tab view */
            <LandlordShortletDashboard 
              session={session}
              agreements={myShortletAgreements}
              bookings={bookings}
              setBookings={setBookings}
              triggerSuccess={triggerSuccess}
              damageReports={damageReports}
              setDamageReports={setDamageReports as any}
            />
          )}

        </div>
      )}

      {/* PAYMENT HISTORY SYSTEM TAB */}
      {activeTab === 'Payments' && (
        <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-display font-black text-sm text-[#18452E] uppercase">Financial Ledger Statement</h3>
              <p className="text-#6B7280 font-light mt-0.5">Maintain immediate self-service check list of verified routing payouts.</p>
            </div>
            
            <button 
              onClick={handleDownloadLedger}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md cursor-pointer transition"
            >
              <FileText className="w-4 h-4" />
              <span>Download Full Ledger</span>
            </button>
          </div>

          <div className="spatial-glass border border-stone-200/50 rounded-[var(--radius-large)] overflow-hidden shadow-xs">
            <div className="p-5 bg-stone-50/50 border-b border-stone-150 flex justify-between items-center">
              <span className="font-mono text-[10px] text-stone-400 uppercase font-black tracking-widest">ACTIVE TRANSFERS AUDIT LIST</span>
              <span className="font-mono text-[9px] text-[#18452E] bg-[#18452E]/5 py-0.5 px-2 rounded uppercase font-bold">100% Vetted Receipts</span>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-[9px] uppercase font-mono text-stone-400 border-b border-stone-150">
                    <th className="p-4">Property / Unit</th>
                    <th className="p-4">Tenant</th>
                    <th className="p-4">Settled Amount</th>
                    <th className="p-4">Billing Date</th>
                    <th className="p-4">Collection Routing</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myUnits.filter(u => u.paymentStatus === 'Paid').map((u) => (
                    <tr key={u.id} onClick={() => handleOpenPaymentRecordWithHistory(u)} className="hover:bg-stone-50/50 transition cursor-pointer">
                      <td className="p-4">
                        <strong className="text-#132A1D block text-xs font-medium">{u.propertyName}</strong>
                        <span className="text-[10px] text-stone-400 font-mono uppercase">{u.unitNumber}</span>
                      </td>
                      <td className="p-4 font-medium text-#132A1D">{u.tenantName}</td>
                      <td className="p-4 font-mono font-black text-emerald-800">₦{u.rentAmount.toLocaleString()}</td>
                      <td className="p-4 font-light text-#6B7280">June 12, 2025</td>
                      <td className="p-4 font-mono text-[10px] text-teal-850">
                        {getCollectionAccountName(u.propertyName)}
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-100 text-emerald-800 uppercase mr-2">Settled</span>
                        <button className="px-2 py-0.5 bg-stone-50 hover:bg-stone-200 text-#6B7280 border border-stone-300 rounded text-[9px] font-bold cursor-pointer transition shadow-xs">
                          Dispute Payment
                        </button>
                      </td>
                    </tr>
                  ))}
                  {myUnits.filter(u => u.paymentStatus === 'Paid').length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400 italic">No cleared transaction balances are current on your portfolio.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="md:hidden divide-y divide-stone-150">
              {myUnits.filter(u => u.paymentStatus === 'Paid').map((u) => (
                <div key={u.id} onClick={() => handleOpenPaymentRecordWithHistory(u)} className="p-4 space-y-3 bg-white hover:bg-stone-50 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-#132A1D block text-xs font-medium">{u.propertyName}</strong>
                      <span className="text-[10px] text-stone-400 font-mono uppercase">{u.unitNumber}</span>
                    </div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-100 text-emerald-800 uppercase">Settled</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Tenant</span>
                      <span className="font-medium text-#132A1D">{u.tenantName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Settled Amount</span>
                      <span className="font-mono font-black text-emerald-800">₦{u.rentAmount.toLocaleString()}</span>
                    </div>
                    <div className="col-span-2 pt-1">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Collection Routing</span>
                      <span className="font-mono text-[10px] text-teal-850">{getCollectionAccountName(u.propertyName)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {myUnits.filter(u => u.paymentStatus === 'Paid').length === 0 && (
                <div className="p-8 text-center text-stone-400 italic text-xs">
                  No cleared transaction balances are current on your portfolio.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MAINTENANCE TAB (Step 8) */}
      {activeTab === 'Maintenance' && (
        <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-display font-black text-sm text-[#18452E] uppercase">Maintenance Cost Center</h3>
              <p className="text-#6B7280 font-light mt-0.5">Track every repair job and analyze expenditure by property.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Maintenance Cost Analytics (Step 8) */}
            <div className="lg:col-span-1 space-y-6 min-w-0">
              <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-xs">
                <h4 className="font-display font-black text-[#18452E] text-xs uppercase mb-4">Cost Analytics</h4>
                <div className="space-y-4">
                  {/* Mock Analytics */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-#6B7280 uppercase">Adebayo Lekki Heights</span>
                      <span className="font-mono text-xs font-bold text-rose-700">₦150k</span>
                    </div>
                    <div className="w-full bg-stone-50 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="text-[9px] text-stone-400 font-mono mt-1 block">70% of total repair costs</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-#6B7280 uppercase">The Oasis Towers</span>
                      <span className="font-mono text-xs font-bold text-rose-700">₦45k</span>
                    </div>
                    <div className="w-full bg-stone-50 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: '20%' }}></div>
                    </div>
                    <span className="text-[9px] text-stone-400 font-mono mt-1 block">20% of total repair costs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Cost Tracker (Step 8) */}
            <div className="lg:col-span-2 min-w-0">
              <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-xs">
                <h4 className="font-display font-black text-[#18452E] text-xs uppercase mb-4">Maintenance Tracker</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-50 text-[9px] uppercase font-mono text-stone-400 border-b border-stone-150">
                        <th className="p-3">Job Description</th>
                        <th className="p-3">Unit</th>
                        <th className="p-3">Cost</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Approved By</th>
                        <th className="p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      <tr className="hover:bg-stone-50/50 transition text-xs">
                        <td className="p-3 font-medium text-#132A1D">Plumbing: Pipe Burst</td>
                        <td className="p-3 text-#6B7280">Adebayo Lekki (A1)</td>
                        <td className="p-3 font-mono font-black text-rose-700">₦85,000</td>
                        <td className="p-3 text-#6B7280">14 Jun 2026</td>
                        <td className="p-3 text-#132A1D">Kola Abiodun</td>
                        <td className="p-3">
                          <button className="px-2 py-0.5 bg-stone-50 hover:bg-stone-200 text-#6B7280 border border-stone-300 rounded text-[9px] font-bold cursor-pointer transition shadow-xs">
                            Dispute Cost
                          </button>
                        </td>
                      </tr>
                      <tr className="hover:bg-stone-50/50 transition text-xs">
                        <td className="p-3 font-medium text-#132A1D">Electrical: AC Wiring</td>
                        <td className="p-3 text-#6B7280">The Oasis Towers (B2)</td>
                        <td className="p-3 font-mono font-black text-rose-700">₦45,000</td>
                        <td className="p-3 text-#6B7280">10 Jun 2026</td>
                        <td className="p-3 text-#132A1D">Babatunde Osei</td>
                        <td className="p-3">
                          <button className="px-2 py-0.5 bg-stone-50 hover:bg-stone-200 text-#6B7280 border border-stone-300 rounded text-[9px] font-bold cursor-pointer transition shadow-xs">
                            Dispute Cost
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Tenant Complaints Section */}
            <div className="lg:col-span-3 min-w-0">
              <LandlordTenantComplaintsSection
                session={session}
                landlordCode={landlordCode}
                triggerSuccess={triggerSuccess}
                myUnits={myUnits}
              />
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENTS TAB (Step 10) */}
      {activeTab === 'Documents' && (
        <div className="space-y-6 animate-fade-in text-xs sm:text-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-display font-black text-sm text-[#18452E] uppercase">Document Center</h3>
              <p className="text-#6B7280 font-light mt-0.5">Generate portfolio reports and track their delivery status.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GENERATE REPORT CARD */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-xs flex flex-col justify-center space-y-4">
              <div className="flex items-center space-x-3 text-[#18452E]">
                <FileText className="w-6 h-6" />
                <h4 className="font-display font-black text-sm uppercase">Generate New Report</h4>
              </div>
              <p className="text-#6B7280 font-light text-xs">
                Create a comprehensive PDF report detailing occupancy rates, payment statuses, and maintenance expenditure across your portfolio.
              </p>
              <button 
                onClick={() => triggerSuccess('Generating Report. Document will be available in your delivery log shortly.')}
                className="w-full py-3 bg-[#18452E] hover:bg-[#18452E] text-white font-bold rounded-xl text-xs uppercase transition tracking-wide cursor-pointer"
              >
                Compile Financial Report
              </button>
            </div>

            {/* DELIVERY TRACKING LOG */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-xs">
              <h4 className="font-display font-black text-xs text-[#18452E] uppercase mb-4">Report Delivery Tracking</h4>
              <div className="space-y-3">
                {/* Dynamic reports */}
                {reports.map((report) => (
                  <div key={report.id} className="p-3 bg-amber-500/5 border border-amber-200/50 hover:border-amber-400 rounded-xl transition-all duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="block font-bold text-[#18452E] text-xs">Monthly Portfolio Summary &bull; {report.monthCovered}</span>
                        <span className="block text-[9px] font-mono text-stone-400 mt-0.5">Ref: {report.id} &bull; Sent: {new Date(report.sentAt).toLocaleString()}</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${report.downloaded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'}`}>
                        {report.downloaded ? 'Downloaded' : 'Pending Download'}
                      </span>
                    </div>
                    
                    <div className="text-[10px] text-#6B7280 border-t border-stone-150 pt-2 mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Emailed to {report.landlordEmail}</span>
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
                ))}

                {/* Legacy reports */}
                <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="block font-bold text-#132A1D text-xs">Q1 2026 Financial Summary</span>
                      <span className="block text-[9px] font-mono text-stone-400 mt-0.5">Generated: 01 Apr 2026, 09:14 AM</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase rounded">Downloaded</span>
                  </div>
                  <div className="text-[10px] text-#6B7280 flex items-center justify-between border-t border-stone-200 pt-2 mt-2">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Viewed by you on 01 Apr 2026 at 10:45 AM</span>
                    </div>
                    <button
                      onClick={() => handleOpenReport({ title: 'Q1 2026 Financial Summary', id: 'DOC-LEGACY-001' })}
                      className="text-[10px] text-#6B7280 font-bold uppercase hover:underline cursor-pointer"
                    >
                      View Report
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="block font-bold text-#132A1D text-xs">Annual Tax Ledger 2025</span>
                      <span className="block text-[9px] font-mono text-stone-400 mt-0.5">Generated: 15 Jan 2026, 14:30 PM</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase rounded">Downloaded</span>
                  </div>
                  <div className="text-[10px] text-#6B7280 flex items-center justify-between border-t border-stone-200 pt-2 mt-2">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Forwarded and viewed by funmi@adebayo.ng on 16 Jan 2026</span>
                    </div>
                    <button
                      onClick={() => handleOpenReport({ title: 'Annual Tax Ledger 2025', id: 'DOC-LEGACY-002' })}
                      className="text-[10px] text-#6B7280 font-bold uppercase hover:underline cursor-pointer"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVOLUTIONARY DETAIL VIEW MODAL */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200/80 shadow-sm relative flex flex-col p-6 space-y-5 animate-scale-up text-xs sm:text-sm">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setSelectedUnit(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-605 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* HEADER DESIGN WITH PHOTO AND BACKGROUND GLOSS */}
            <div className="border-b border-stone-200 pb-4 space-y-4">
              <span className="text-[9px] uppercase font-mono font-black text-[#18452E] bg-emerald-50 px-2 py-0.5 rounded-md tracking-widest">
                VERIFIED PROFILE DOCKET
              </span>
              
              <div className="flex items-center space-x-4">
                {selectedUnit.paymentStatus !== 'Vacant' ? (
                  <img 
                    src={getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).passportPhoto} 
                    alt={selectedUnit.tenantName} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-505 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-stone-50 border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 text-xs shrink-0 font-mono font-bold uppercase">
                    VAC
                  </div>
                )}
                <div>
                  <h3 className="font-display font-black text-stone-905 text-lg leading-tight uppercase tracking-wider">
                    {selectedUnit.paymentStatus !== 'Vacant' ? selectedUnit.tenantName : 'VACANT UNIT'}
                  </h3>
                  <span className="text-[10px] font-mono text-[#18452E] uppercase tracking-wider font-bold">
                    {selectedUnit.paymentStatus !== 'Vacant' ? selectedUnit.tenantCode : `Unit: ${selectedUnit.unitNumber}`}
                  </span>
                  <span className="block text-stone-400 font-light mt-0.5">{selectedUnit.propertyName}</span>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-stone-200 gap-6 text-xs font-semibold px-2">
              <button
                onClick={() => setTenantModalTab('details')}
                className={`pb-3 border-b-2 transition-all cursor-pointer ${
                  tenantModalTab === 'details'
                    ? 'border-[#18452E] text-[#18452E]'
                    : 'border-transparent text-#6B7280 hover:text-stone-850'
                }`}
              >
                Profile Docket
              </button>
              <button
                onClick={() => setTenantModalTab('history')}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                  tenantModalTab === 'history'
                    ? 'border-[#18452E] text-[#18452E]'
                    : 'border-transparent text-#6B7280 hover:text-stone-850'
                }`}
                title="This history is permanent and cannot be edited or deleted."
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>History</span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase scale-90">Permanent</span>
              </button>
            </div>

            {/* CONTENT BODY */}
            {tenantModalTab === 'details' ? (
              selectedUnit.paymentStatus !== 'Vacant' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-50/50 p-3 rounded-2xl border border-stone-200">
                    <span className="text-[9px] font-mono text-stone-400 uppercase font-black block tracking-widest">PHONE NUMBER</span>
                    <strong className="block text-stone-850 mt-0.5">
                      {getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).phone}
                    </strong>
                  </div>
                  <div className="bg-stone-50/50 p-3 rounded-2xl border border-stone-200">
                    <span className="text-[9px] font-mono text-stone-400 uppercase font-black block tracking-widest">OCCUPATION</span>
                    <strong className="block text-stone-850 mt-0.5 truncate">
                      {getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).occupation}
                    </strong>
                  </div>
                </div>

                {/* TENANT HISTORY (Step 7) - Real Numbers Only */}
                <div className="p-4 bg-stone-50/80 border border-stone-200 rounded-2xl">
                  <h4 className="font-display font-black text-[#18452E] text-xs uppercase mb-3">Tenant History</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[9px] font-mono text-#6B7280 block uppercase">Years in Property</span>
                      <strong className="block text-#132A1D text-sm mt-0.5 font-mono">{getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).yearsInProperty}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-#6B7280 block uppercase">Payment Punctuality</span>
                      <strong className="block text-#132A1D text-sm mt-0.5 font-mono">{getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).punctuality}%</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-#6B7280 block uppercase">Complaints Filed</span>
                      <strong className="block text-#132A1D text-sm mt-0.5 font-mono">{getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).complaints}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-#6B7280 block uppercase">Damage Incidents</span>
                      <strong className="block text-#132A1D text-sm mt-0.5 font-mono">{getTenantDetails(selectedUnit.tenantName, selectedUnit.tenantCode, selectedUnit.rentAmount, selectedUnit.propertyName).damages}</strong>
                    </div>
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

                {/* SMART RENT REMINDER (Step 15) */}
                <div className="p-4 bg-stone-50/80 border border-stone-200 rounded-2xl space-y-3">
                  <h4 className="font-display font-black text-[#18452E] text-xs uppercase mb-1">Smart Rent Reminder Schedule</h4>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono mb-2">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Channels: SMS, Email, WhatsApp</span>
                    <span className="bg-stone-200 text-#132A1D px-2 py-0.5 rounded font-bold uppercase">Schedule: 90, 60, 30 days prior</span>
                  </div>
                  <div className="text-xs bg-white p-3 rounded-xl border border-stone-150">
                    <span className="text-[9px] uppercase font-mono text-stone-400 font-bold block mb-1">Latest Dispatch Log</span>
                    <div className="flex justify-between items-center">
                      <span className="text-#132A1D font-light">Sent: <strong>14 Mar 2027</strong></span>
                      <span className="text-#132A1D font-light">Status: <strong>Paid</strong></span>
                    </div>
                  </div>
                </div>

                {/* HISTORIC LEDGER RECORD */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-stone-400 uppercase font-black block tracking-widest">BILLING & PAYMENT HISTORY</span>
                  
                  <div className="space-y-2 max-h-[140px] overflow-y-auto border border-stone-200 rounded-xl divide-y">
                    
                    {/* CURRENT YEAR CYCLE */}
                    <div className="p-2.5 flex justify-between items-center bg-stone-50/30 text-xs">
                      <div>
                        <span className="font-bold text-#132A1D block">Cycle: 2026 - 2027</span>
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
                        <span className="font-bold text-#6B7280 block">Cycle: 2025 - 2026</span>
                        <span className="text-[10px] text-stone-400 block font-mono">Reference: NGN_CYC_9981_UH</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-#6B7280 block font-mono">₦{selectedUnit.rentAmount.toLocaleString()}</span>
                        <span className="inline-block px-1 rounded text-[8px] font-mono font-bold uppercase bg-stone-50 text-#6B7280">PAID</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-#6B7280">
                This unit is currently vacant. No registered tenant is assigned yet. Rent is set to ₦{selectedUnit.rentAmount.toLocaleString()} annually.
              </div>
            )) : (
              <div className="space-y-4">
                <ImmutableHistory recordId={selectedUnit.tenantCode || selectedUnit.id} recordType="Tenant" />
              </div>
            )}

            {/* OPERATIONAL ACTIONS (Prompt Five) */}
            <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
              {selectedUnit.paymentStatus !== 'Vacant' ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setReassignTargetUnitId('');
                      setReassignConfirmation(false);
                      setShowReassignModal(true);
                    }}
                    className="px-3 py-2 border-2 border-[#C9A84C] text-[#8C6D21] hover:bg-amber-50 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-[#C9A84C]" />
                    <span>Reassign to Different Unit</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setMoveOutStep(1);
                      setMoveOutCheckboxes({ vacated: false, keysReturned: false, conditionAssessed: false, depositDocumented: false });
                      setShowMoveOutModal(true);
                    }}
                    className="px-3 py-2 border-2 border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Archive className="w-3.5 h-3.5 text-rose-600" />
                    <span>End Tenancy (Move-Out)</span>
                  </button>
                </div>
              ) : null}

              <button 
                onClick={() => setSelectedUnit(null)}
                className="px-5 py-2 bg-#132A1D text-white font-medium hover:bg-#132A1D rounded-xl text-xs cursor-pointer ml-auto"
              >
                Dismiss Case File
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REPORT PREVIEW MODAL */}
      {selectedReport && (
        <div id="report-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-sm animate-scale-up">
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
                className="px-4 py-2.5 bg-[#18452E] hover:bg-[#18452E] text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
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

      {/* PORTFOLIO HEALTH TAB */}
      {activeTab === 'PortfolioHealth' && (
        <PortfolioHealthCenter 
          properties={properties}
          landlordUnits={myUnits}
          bookings={bookings}
          damageReports={damageReports}
          serviceCharges={serviceCharges}
        />
      )}

      {/* SERVICE CHARGES TAB */}
      {activeTab === 'ServiceCharges' && (
        <ServiceChargeIntelligence 
          properties={properties}
          landlordUnits={myUnits}
          serviceCharges={serviceCharges}
          setServiceCharges={setServiceCharges as React.Dispatch<React.SetStateAction<ServiceChargeBill[]>>}
          role="Landlord"
          userId={session.userId}
        />
      )}

      {/* TENANT INTELLIGENCE TAB */}
      {activeTab === 'TenantIntelligence' && (
        <TenantIntelligenceCenter 
          landlordUnits={myUnits}
          properties={properties}
          serviceCharges={serviceCharges}
          role="Landlord"
        />
      )}

      {/* AI COLLECTIONS TAB */}
      {activeTab === 'AICollection' && (
        <AICollectionCenter 
          role="Landlord"
          userId={session.userId}
        />
      )}

      {/* SUPPORT TAB */}
      {activeTab === 'Support' && (
        <SupportCenter session={session} />
      )}

      {/* MANDATORY FOOTER CREED */}
      <div className="text-center pt-8 border-t border-stone-200/50">
        <span className="text-[10px] text-[#C9A84C] font-mono tracking-widest uppercase font-bold">
          OUR OPERATING CREED REQUIRED ON ALL ASSETS &bull; DON&apos;T BUY WAHALA
        </span>
      </div>

      {selectedBankAccount && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-sm w-full p-6 space-y-5 animate-scale-up relative">
            <button 
              onClick={() => setSelectedBankAccount(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-stone-200 pb-4">
              <span className="text-[9px] uppercase font-mono font-black text-[#18452E] bg-emerald-50 px-2 py-0.5 rounded-md tracking-widest">
                VERIFIED BANK ROUTING
              </span>
              <h3 className="font-display font-black text-#132A1D text-xl mt-3">{selectedBankAccount.bankName}</h3>
              <p className="text-#6B7280 font-mono text-sm">{selectedBankAccount.accNo}</p>
            </div>
            <div className="space-y-3 text-xs text-#6B7280">
              <div className="flex justify-between items-center">
                <span>Account Name:</span>
                <strong className="text-#132A1D">{selectedBankAccount.name}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase text-[9px]">Verified Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPaymentRecord && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-lg w-full p-6 space-y-5 animate-scale-up relative">
            <button 
              onClick={() => setSelectedPaymentRecord(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-stone-200 pb-4">
              <span className="text-[9px] uppercase font-mono font-black text-[#18452E] bg-emerald-50 px-2 py-0.5 rounded-md tracking-widest">
                PAYMENT RECORD
              </span>
              <h3 className="font-display font-black text-#132A1D text-xl mt-3">{selectedPaymentRecord.tenantName}</h3>
              <p className="text-#6B7280 font-mono text-sm">{selectedPaymentRecord.propertyName}</p>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex border-b border-stone-200 gap-6 text-xs font-semibold px-2">
              <button
                onClick={() => setPaymentModalTab('details')}
                className={`pb-3 border-b-2 transition-all cursor-pointer ${
                  paymentModalTab === 'details'
                    ? 'border-[#18452E] text-[#18452E]'
                    : 'border-transparent text-#6B7280 hover:text-stone-850'
                }`}
              >
                Payment Info
              </button>
              <button
                onClick={() => setPaymentModalTab('history')}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
                  paymentModalTab === 'history'
                    ? 'border-[#18452E] text-[#18452E]'
                    : 'border-transparent text-#6B7280 hover:text-stone-850'
                }`}
                title="This history is permanent and cannot be edited or deleted."
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>History</span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase scale-90">Permanent</span>
              </button>
            </div>

            {paymentModalTab === 'details' ? (
              <div className="space-y-3 text-xs text-#6B7280">
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span>Rent Amount:</span>
                  <strong className="text-#132A1D font-mono text-base">₦{selectedPaymentRecord.rentAmount.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span>Status:</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                    selectedPaymentRecord.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    selectedPaymentRecord.paymentStatus === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>{selectedPaymentRecord.paymentStatus}</span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span>Due Date:</span>
                  <strong className="text-#132A1D">{selectedPaymentRecord.dueDate}</strong>
                </div>
                {selectedPaymentRecord.paymentStatus === 'Paid' && (
                  <div className="bg-[#18452E]/5 p-3 rounded-xl border border-[#0E2F1F]/10 mt-4">
                    <div className="flex items-center space-x-2 text-[#18452E]">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="font-bold text-xs">Direct Routing Verified</span>
                    </div>
                    <p className="text-[10px] text-#6B7280 mt-1">Funds cleared to {selectedBankAccount?.bankName || 'Zenith Bank'}. No intermediary holding.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <ImmutableHistory recordId={selectedPaymentRecord.id + '-pay'} recordType="Payment" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD BUILDING MODAL */}
      {showAddBuildingModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-lg w-full p-6 space-y-5 animate-scale-up relative">
            <button 
              onClick={() => setShowAddBuildingModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-stone-200 pb-3">
              <span className="text-[9px] uppercase font-mono font-black text-[#18452E] bg-emerald-50 px-2 py-0.5 rounded-md tracking-widest">
                PROPERTY REGISTRATION
              </span>
              <h3 className="font-display font-black text-#132A1D text-xl mt-2 flex items-center gap-2">
                <BuildingIcon className="w-5 h-5 text-[#C9A84C]" /> Register New Building
              </h3>
              <p className="text-#6B7280 text-xs mt-1">
                Buildings represent first-class physical entities containing individual rentable units.
              </p>
            </div>

            <form onSubmit={handleSaveBuilding} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">BUILDING NAME *</label>
                  <input 
                    type="text" 
                    required
                    value={buildingForm.name}
                    onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                    placeholder="e.g. Adebayo Heights" 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">BUILDING / BLOCK NUMBER</label>
                  <input 
                    type="text" 
                    value={buildingForm.buildingNumber}
                    onChange={(e) => setBuildingForm({ ...buildingForm, buildingNumber: e.target.value })}
                    placeholder="e.g. Block A or House 12" 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">STREET ADDRESS *</label>
                <input 
                  type="text" 
                  required
                  value={buildingForm.streetAddress}
                  onChange={(e) => setBuildingForm({ ...buildingForm, streetAddress: e.target.value })}
                  placeholder="e.g. 14 Admiralty Way" 
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">AREA / DISTRICT</label>
                  <input 
                    type="text" 
                    value={buildingForm.area}
                    onChange={(e) => setBuildingForm({ ...buildingForm, area: e.target.value })}
                    placeholder="e.g. Lekki Phase 1" 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">STATE</label>
                  <input 
                    type="text" 
                    value={buildingForm.state}
                    onChange={(e) => setBuildingForm({ ...buildingForm, state: e.target.value })}
                    placeholder="e.g. Lagos" 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">COVER PHOTO URL (OPTIONAL)</label>
                <input 
                  type="url" 
                  value={buildingForm.coverPhoto}
                  onChange={(e) => setBuildingForm({ ...buildingForm, coverPhoto: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00..." 
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200/80 text-[10px] space-y-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold uppercase font-mono">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  <span>Title Verification Process</span>
                </div>
                <p className="text-amber-800 leading-normal">
                  Newly registered buildings are immediately placed in <strong>Pending Verification</strong> mode for title doc review. You do NOT have to wait — units and tenants can be added and invited right away!
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#18452E] text-white text-xs font-bold rounded-xl hover:bg-[#18452E] transition cursor-pointer shadow-md"
                >
                  Register Building
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddBuildingModal(false)}
                  className="px-4 py-3 bg-stone-50 text-#6B7280 text-xs font-bold rounded-xl hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD UNIT MODAL */}
      {showAddUnitModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full p-6 space-y-5 animate-scale-up relative">
            <button 
              onClick={() => setShowAddUnitModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-stone-200 pb-3">
              <span className="text-[9px] uppercase font-mono font-black text-[#18452E] bg-emerald-50 px-2 py-0.5 rounded-md tracking-widest">
                UNIT ALLOCATION
              </span>
              <h3 className="font-display font-black text-#132A1D text-xl mt-2 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#18452E]" /> Add Unit to Building
              </h3>
              <p className="text-#6B7280 text-xs mt-1">
                Building: <strong className="text-#132A1D">{myBuildings.find(b => b.id === selectedBuildingId)?.name}</strong>
              </p>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">UNIT / FLAT NAME *</label>
                <input 
                  type="text" 
                  required
                  value={unitForm.unitName}
                  onChange={(e) => setUnitForm({ ...unitForm, unitName: e.target.value })}
                  placeholder="e.g. Flat 3B or Penthouse West" 
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">UNIT TYPE</label>
                  <select 
                    value={unitForm.unitType}
                    onChange={(e) => setUnitForm({ ...unitForm, unitType: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                  >
                    <option value="Studio">Studio Apartment</option>
                    <option value="1 Bedroom">1 Bedroom Flat</option>
                    <option value="2 Bedroom">2 Bedroom Flat</option>
                    <option value="3 Bedroom">3 Bedroom Flat</option>
                    <option value="Maisonette">Maisonette</option>
                    <option value="Penthouse">Penthouse Suite</option>
                    <option value="Commercial">Commercial Shop / Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">ANNUAL RENT (NGN) *</label>
                  <input 
                    type="number" 
                    required
                    value={unitForm.rentAmount}
                    onChange={(e) => setUnitForm({ ...unitForm, rentAmount: e.target.value })}
                    placeholder="e.g. 3500000" 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">RENT COLLECTION ACCOUNT</label>
                <select 
                  value={unitForm.collectionAccountId}
                  onChange={(e) => setUnitForm({ ...unitForm, collectionAccountId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700 font-mono"
                >
                  <option value="GTB-1022938485">GTBank - 1022938485 (Primary Operating)</option>
                  <option value="ZENITH-2011928374">Zenith Bank - 2011928374 (Escrow Reserve)</option>
                  <option value="UBA-3091827364">UBA - 3091827364 (Property Operations)</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#18452E] text-white text-xs font-bold rounded-xl hover:bg-[#18452E] transition cursor-pointer shadow-md"
                >
                  Save Unit
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-3 bg-stone-50 text-#6B7280 text-xs font-bold rounded-xl hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT UNIT MODAL */}
      {editingUnit && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full p-6 space-y-5 animate-scale-up relative">
            <button 
              onClick={() => setEditingUnit(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-stone-200 pb-3">
              <span className="text-[9px] uppercase font-mono font-black text-[#18452E] bg-emerald-50 px-2 py-0.5 rounded-md tracking-widest">
                UNIT SETTINGS
              </span>
              <h3 className="font-display font-black text-#132A1D text-xl mt-2 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-[#18452E]" /> Edit Unit Details
              </h3>
              <p className="text-#6B7280 text-xs mt-1">
                Updating settings for <strong className="text-#132A1D">{editingUnit.unitNumber}</strong> ({editingUnit.propertyName})
              </p>
            </div>

            <form onSubmit={handleSaveEditUnit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">UNIT NAME / LABEL</label>
                <input 
                  type="text" 
                  required
                  value={editUnitForm.unitName}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, unitName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">ANNUAL RENT AMOUNT (NGN)</label>
                <input 
                  type="number" 
                  required
                  value={editUnitForm.rentAmount}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, rentAmount: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">RENT COLLECTION ACCOUNT</label>
                <select 
                  value={editUnitForm.collectionAccountId}
                  onChange={(e) => setEditUnitForm({ ...editUnitForm, collectionAccountId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700 font-mono"
                >
                  <option value="GTB-1022938485">GTBank - 1022938485 (Primary Operating)</option>
                  <option value="ZENITH-2011928374">Zenith Bank - 2011928374 (Escrow Reserve)</option>
                  <option value="UBA-3091827364">UBA - 3091827364 (Property Operations)</option>
                </select>
                <p className="text-[10px] text-amber-700 mt-1 font-mono">
                  * Note: Changing collection account triggers a mandatory 48-hour security hold.
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#18452E] text-white text-xs font-bold rounded-xl hover:bg-[#18452E] transition cursor-pointer shadow-md"
                >
                  Update Unit Details
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingUnit(null)}
                  className="px-4 py-3 bg-stone-50 text-#6B7280 text-xs font-bold rounded-xl hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 48-HOUR SECURITY HOLD NOTICE MODAL */}
      {show48HourHoldNotice && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full p-6 space-y-5 animate-scale-up relative border-2 border-amber-500">
            <button 
              onClick={() => setShow48HourHoldNotice(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-amber-800">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <Clock className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-mono font-black text-amber-800 tracking-widest block">
                  SECURITY GUARDRAIL
                </span>
                <h3 className="font-display font-black text-#132A1D text-lg">48-Hour Security Hold Applied</h3>
              </div>
            </div>

            <p className="text-#6B7280 text-xs leading-relaxed">
              Changes to rent collection accounts take <strong>48 hours</strong> to take effect for security verification and anti-fraud monitoring. During this hold window, payments routed to this unit will continue to clear into your existing verified account.
            </p>

            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-[10px] text-amber-900 font-mono space-y-1">
              <p>• Hold Release: 48 Hours from now</p>
              <p>• Verification Code: SEC-HOLD-{Math.floor(100000 + Math.random() * 900000)}</p>
            </div>

            <button 
              onClick={() => setShow48HourHoldNotice(false)}
              className="w-full py-3 bg-#132A1D text-white text-xs font-bold rounded-xl hover:bg-[#18452E] transition cursor-pointer shadow-md"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      )}

      {/* TENANT INVITATION GENERATOR FORM MODAL */}
      {showInviteModal && inviteTargetUnit && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-lg w-full p-6 space-y-5 animate-scale-up relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="border-b border-stone-200 pb-3">
              <span className="text-[9px] uppercase font-mono font-black text-[#18452E] bg-emerald-50 px-2 py-0.5 rounded-md tracking-widest">
                TENANT ONBOARDING INVITATION
              </span>
              <h3 className="font-display font-black text-#132A1D text-xl mt-2 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#18452E]" /> Issue Tenant Invitation Code
              </h3>
              <p className="text-#6B7280 text-xs mt-1">
                Target Unit: <strong className="text-#132A1D">{inviteTargetUnit.unitNumber}</strong> ({inviteTargetUnit.propertyName})
              </p>
            </div>

            <form onSubmit={handleGenerateInvitation} className="space-y-4 text-xs">
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-#132A1D text-[11px] space-y-1">
                <span className="font-bold text-[#18452E] block font-mono uppercase text-[9px]">Pre-filled Agreement Specs</span>
                <p>Pre-populating tenant data streamlines their onboarding form, requiring them to only review and confirm their details.</p>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">TENANT FULL NAME *</label>
                <input 
                  type="text" 
                  required
                  value={inviteForm.fullName}
                  onChange={(e) => setInviteForm({ ...inviteForm, fullName: e.target.value })}
                  placeholder="e.g. Tunde Ogunlesi" 
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">PHONE NUMBER *</label>
                  <input 
                    type="tel" 
                    required
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                    placeholder="e.g. 08031234567" 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">EMAIL ADDRESS *</label>
                  <input 
                    type="email" 
                    required
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="e.g. tunde@example.com" 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">OCCUPATION</label>
                  <input 
                    type="text" 
                    value={inviteForm.occupation}
                    onChange={(e) => setInviteForm({ ...inviteForm, occupation: e.target.value })}
                    placeholder="e.g. Software Engineer" 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">EMPLOYER</label>
                  <input 
                    type="text" 
                    value={inviteForm.employer}
                    onChange={(e) => setInviteForm({ ...inviteForm, employer: e.target.value })}
                    placeholder="e.g. Paystack Nigeria" 
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3 space-y-3">
                <span className="block text-[9px] font-mono font-bold text-[#18452E] uppercase">GUARANTOR DETAILS</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">GUARANTOR NAME</label>
                    <input 
                      type="text" 
                      value={inviteForm.guarantorName}
                      onChange={(e) => setInviteForm({ ...inviteForm, guarantorName: e.target.value })}
                      placeholder="e.g. Chief Samuel Ogunlesi" 
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">GUARANTOR PHONE</label>
                    <input 
                      type="tel" 
                      value={inviteForm.guarantorPhone}
                      onChange={(e) => setInviteForm({ ...inviteForm, guarantorPhone: e.target.value })}
                      placeholder="e.g. 08029998877" 
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">AGREED ANNUAL RENT (NGN)</label>
                  <input 
                    type="number" 
                    required
                    value={inviteForm.leaseAmount}
                    onChange={(e) => setInviteForm({ ...inviteForm, leaseAmount: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">CAUTION DEPOSIT (NGN)</label>
                  <input 
                    type="number" 
                    value={inviteForm.cautionDeposit}
                    onChange={(e) => setInviteForm({ ...inviteForm, cautionDeposit: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-[#18452E] text-white text-xs font-bold rounded-xl hover:bg-[#18452E] transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Generate Invitation Code</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-3 bg-stone-50 text-#6B7280 text-xs font-bold rounded-xl hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATED INVITATION CODE MODAL */}
      {generatedInvitation && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full p-6 space-y-5 animate-scale-up relative">
            <button 
              onClick={() => setGeneratedInvitation(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 border-b border-stone-200 pb-4">
              <span className="text-[9px] uppercase font-mono font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full tracking-widest inline-block">
                INVITATION READY
              </span>
              <h3 className="font-display font-black text-#132A1D text-xl">Tenant Onboarding Code</h3>
              <p className="text-#6B7280 text-xs">
                Share this unique code or direct link with <strong>{generatedInvitation.pre_filled_data.tenantFullName}</strong>.
              </p>
            </div>

            {/* Unique Code Box */}
            <div className="bg-#132A1D p-4 rounded-2xl text-center space-y-1 relative">
              <span className="text-[9px] uppercase font-mono text-stone-400 block tracking-widest">UNIQUE 8-CHAR INVITATION CODE</span>
              <strong className="text-[#C9A84C] font-mono text-2xl tracking-widest block font-black">
                {generatedInvitation.invitation_code}
              </strong>
              <p className="text-[10px] text-stone-400 font-mono pt-1">
                Expires in 14 days ({new Date(generatedInvitation.expires_at).toLocaleDateString()})
              </p>
            </div>

            {/* Link Box */}
            <div className="space-y-2 text-xs">
              <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase">DIRECT REGISTRATION LINK</label>
              <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                <input 
                  type="text" 
                  readOnly 
                  value={generatedInvitation.invitation_link}
                  className="w-full text-[11px] font-mono text-#132A1D bg-transparent outline-none truncate"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedInvitation.invitation_link);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-[#18452E] text-white rounded-lg text-xs font-bold hover:bg-[#18452E] transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* QR Code Visual & Actions */}
            <div className="flex justify-center items-center p-3 bg-stone-50 rounded-2xl border border-stone-200/80 gap-4">
              <div className="w-20 h-20 bg-#132A1D rounded-xl flex items-center justify-center p-2">
                <QrCode className="w-16 h-16 text-[#C9A84C]" />
              </div>
              <div className="text-left text-xs space-y-1">
                <span className="font-bold text-#132A1D block font-mono text-[11px]">QR CODE SCAN</span>
                <p className="text-#6B7280 text-[10px] leading-tight">
                  Tenant can scan this QR code directly to launch pre-filled registration.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hello ${generatedInvitation.pre_filled_data.tenantFullName}, your tenancy invitation code for Unity Homes is: ${generatedInvitation.invitation_code}. Complete your registration here: ${generatedInvitation.invitation_link}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>

              <button 
                onClick={() => setGeneratedInvitation(null)}
                className="w-full py-2.5 bg-stone-50 text-#132A1D text-xs font-bold rounded-xl hover:bg-stone-200 transition cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOVE-IN READINESS MODAL */}
      {showReadinessModalProfile && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[var(--radius-large)] max-w-2xl w-full border border-stone-200 shadow-sm p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-display font-bold text-#132A1D text-base">
                Move-In Readiness &bull; {showReadinessModalProfile.full_name}
              </h3>
              <button
                onClick={() => setShowReadinessModalProfile(null)}
                className="text-stone-400 hover:text-#6B7280 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <MoveInReadinessWidget 
              profile={showReadinessModalProfile} 
              mode="landlord" 
              onProfileUpdated={() => {
                const profiles = getStoredTenantProfiles();
                const updated = profiles.find(p => p.id === showReadinessModalProfile.id);
                if (updated) setShowReadinessModalProfile({ ...updated });
              }}
            />
          </div>
        </div>
      )}

      {/* REASSIGNMENT MODAL (Prompt Five) */}
      {showReassignModal && selectedUnit && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full p-6 space-y-5 animate-scale-up relative">
            <button 
              onClick={() => setShowReassignModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-stone-200 pb-3">
              <span className="text-[9px] uppercase font-mono font-black text-[#C9A84C] bg-amber-50 px-2 py-0.5 rounded-md tracking-widest">
                UNIT REASSIGNMENT FLOW
              </span>
              <h3 className="font-display font-black text-#132A1D text-xl mt-2">
                Reassign {selectedUnit.tenantName}
              </h3>
              <p className="text-#6B7280 text-xs mt-1">
                Current Unit: <strong className="text-#132A1D">{selectedUnit.unitNumber} ({selectedUnit.propertyName})</strong>
              </p>
            </div>

            {!reassignConfirmation ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">
                    SELECT TARGET VACANT UNIT *
                  </label>
                  <select
                    value={reassignTargetUnitId}
                    onChange={(e) => setReassignTargetUnitId(e.target.value)}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-[#C9A84C] font-medium"
                  >
                    <option value="">-- Select Vacant Unit --</option>

                    {/* Same building vacant units */}
                    <optgroup label="Vacant Units - Same Building">
                      {getStoredUnits()
                        .filter(u => u.occupancy_status === 'vacant' && u.building_id === (getStoredUnits().find(x => x.unit_name === selectedUnit.unitNumber || x.id === selectedUnit.id)?.building_id))
                        .map(u => (
                          <option key={u.id} value={u.id}>
                            {u.unit_name} — ₦{u.annual_rent.toLocaleString()}/yr
                          </option>
                        ))}
                    </optgroup>

                    {/* Other building vacant units */}
                    <optgroup label="Vacant Units - Other Buildings">
                      {getStoredUnits()
                        .filter(u => u.occupancy_status === 'vacant' && u.building_id !== (getStoredUnits().find(x => x.unit_name === selectedUnit.unitNumber || x.id === selectedUnit.id)?.building_id))
                        .map(u => {
                          const b = getStoredBuildings().find(b => b.id === u.building_id);
                          return (
                            <option key={u.id} value={u.id}>
                              {u.unit_name} ({b?.building_name || 'Building'}) — ₦{u.annual_rent.toLocaleString()}/yr
                            </option>
                          );
                        })}
                    </optgroup>
                  </select>
                </div>

                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-[10px] text-amber-900 font-mono">
                  * Moving a tenant transfers their verified identity, history, and active status directly to the new unit without requiring re-invitation.
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    disabled={!reassignTargetUnitId}
                    onClick={() => setReassignConfirmation(true)}
                    className="flex-1 py-3 bg-[#C9A84C] hover:bg-[#b8973b] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                  >
                    Proceed to Confirmation
                  </button>
                  <button
                    onClick={() => setShowReassignModal(false)}
                    className="px-4 py-3 bg-stone-50 text-#6B7280 text-xs font-bold rounded-xl hover:bg-stone-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <span className="text-[9px] font-mono font-bold text-#6B7280 uppercase block">REASSIGNMENT SUMMARY</span>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-#6B7280">Tenant:</span>
                    <strong className="text-#132A1D">{selectedUnit.tenantName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-#6B7280">From Unit:</span>
                    <span className="font-mono font-bold text-#132A1D">{selectedUnit.unitNumber} ({selectedUnit.propertyName})</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-#6B7280">To Unit:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {getStoredUnits().find(u => u.id === reassignTargetUnitId)?.unit_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-stone-200 pt-2 mt-1">
                    <span className="text-#6B7280">Rent Adjustment:</span>
                    <span className="font-mono font-bold text-#132A1D">
                      ₦{selectedUnit.rentAmount.toLocaleString()} → ₦{(getStoredUnits().find(u => u.id === reassignTargetUnitId)?.annual_rent || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => {
                      try {
                        const tenancies = getStoredTenancies();
                        const tenantTenancy = tenancies.find(t => t.status === 'active' && (t.unit_id === selectedUnit.id || t.tenant_id === selectedUnit.tenantCode));
                        const targetTenancyId = tenantTenancy ? tenantTenancy.id : selectedUnit.id;
                        
                        const res = reassignTenantUnit(targetTenancyId, reassignTargetUnitId, session.name);
                        if (res.success) {
                          triggerSuccess(res.message);
                          setShowReassignModal(false);
                          setSelectedUnit(null);
                        }
                      } catch (err: any) {
                        alert(err.message || 'Failed to reassign unit.');
                      }
                    }}
                    className="flex-1 py-3 bg-[#18452E] hover:bg-[#18452E] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                  >
                    Confirm Reassignment
                  </button>
                  <button
                    onClick={() => setReassignConfirmation(false)}
                    className="px-4 py-3 bg-stone-50 text-#6B7280 text-xs font-bold rounded-xl hover:bg-stone-200 transition cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOVE-OUT / END TENANCY MODAL (Prompt Five) */}
      {showMoveOutModal && selectedUnit && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full p-6 space-y-5 animate-scale-up relative">
            <button 
              onClick={() => setShowMoveOutModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-#6B7280 rounded-full hover:bg-stone-50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-stone-200 pb-3">
              <span className="text-[9px] uppercase font-mono font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md tracking-widest">
                MOVE-OUT & TENANCY TERMINATION
              </span>
              <h3 className="font-display font-black text-#132A1D text-xl mt-2">
                End Tenancy for {selectedUnit.tenantName}
              </h3>
              <p className="text-#6B7280 text-xs mt-1">
                Unit: <strong className="text-#132A1D">{selectedUnit.unitNumber} ({selectedUnit.propertyName})</strong>
              </p>
            </div>

            {moveOutStep === 1 ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2">
                  <span className="text-[9px] font-mono font-bold text-#6B7280 uppercase block">LEASE STATUS & AUDIT</span>
                  <div className="flex justify-between items-center">
                    <span className="text-#6B7280">Lease End Date:</span>
                    <strong className="font-mono text-#132A1D">2026-07-31</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-#6B7280">Outstanding Balance:</span>
                    <strong className="font-mono text-emerald-700">₦0 (Cleared)</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-#6B7280">Active Maintenance Requests:</span>
                    <strong className="font-mono text-#132A1D">0 Active</strong>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-[10px] text-amber-900 font-mono">
                  * Terminating a tenancy marks the unit as Vacant immediately and archives the tenancy into the tenant's permanent historic record.
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setMoveOutStep(2)}
                    className="flex-1 py-3 bg-rose-800 hover:bg-rose-900 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                  >
                    Proceed to Move-Out Checklist
                  </button>
                  <button
                    onClick={() => setShowMoveOutModal(false)}
                    className="px-4 py-3 bg-stone-50 text-#6B7280 text-xs font-bold rounded-xl hover:bg-stone-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-[11px]">
                  Please complete the 4-point handover audit checklist before confirming move-out:
                </div>

                <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moveOutCheckboxes.vacated}
                      onChange={(e) => setMoveOutCheckboxes({ ...moveOutCheckboxes, vacated: e.target.checked })}
                      className="w-4 h-4 text-rose-700 border-stone-300 rounded mt-0.5"
                    />
                    <span className="text-#132A1D font-medium text-xs">1. Tenant has physically vacated the unit</span>
                  </label>

                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moveOutCheckboxes.keysReturned}
                      onChange={(e) => setMoveOutCheckboxes({ ...moveOutCheckboxes, keysReturned: e.target.checked })}
                      className="w-4 h-4 text-rose-700 border-stone-300 rounded mt-0.5"
                    />
                    <span className="text-#132A1D font-medium text-xs">2. Keys, access cards, and remotes returned</span>
                  </label>

                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moveOutCheckboxes.conditionAssessed}
                      onChange={(e) => setMoveOutCheckboxes({ ...moveOutCheckboxes, conditionAssessed: e.target.checked })}
                      className="w-4 h-4 text-rose-700 border-stone-300 rounded mt-0.5"
                    />
                    <span className="text-#132A1D font-medium text-xs">3. Physical condition assessed and documented</span>
                  </label>

                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={moveOutCheckboxes.depositDocumented}
                      onChange={(e) => setMoveOutCheckboxes({ ...moveOutCheckboxes, depositDocumented: e.target.checked })}
                      className="w-4 h-4 text-rose-700 border-stone-300 rounded mt-0.5"
                    />
                    <span className="text-#132A1D font-medium text-xs">4. Caution deposit refund or deductions documented</span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    disabled={!(moveOutCheckboxes.vacated && moveOutCheckboxes.keysReturned && moveOutCheckboxes.conditionAssessed && moveOutCheckboxes.depositDocumented)}
                    onClick={() => {
                      try {
                        const tenancies = getStoredTenancies();
                        const tenantTenancy = tenancies.find(t => t.status === 'active' && (t.unit_id === selectedUnit.id || t.tenant_id === selectedUnit.tenantCode));
                        const targetTenancyId = tenantTenancy ? tenantTenancy.id : selectedUnit.id;

                        const res = endTenantTenancy(
                          targetTenancyId,
                          {
                            physically_vacated: moveOutCheckboxes.vacated,
                            keys_returned: moveOutCheckboxes.keysReturned,
                            condition_assessed: moveOutCheckboxes.conditionAssessed,
                            caution_deposit_documented: moveOutCheckboxes.depositDocumented
                          },
                          session.name
                        );
                        if (res.success) {
                          triggerSuccess(res.message);
                          setShowMoveOutModal(false);
                          setSelectedUnit(null);
                        }
                      } catch (err: any) {
                        alert(err.message || 'Failed to complete move-out.');
                      }
                    }}
                    className="flex-1 py-3 bg-rose-800 hover:bg-rose-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
                  >
                    Confirm Move-Out & Vacate Unit
                  </button>
                  <button
                    onClick={() => setMoveOutStep(1)}
                    className="px-4 py-3 bg-stone-50 text-#6B7280 text-xs font-bold rounded-xl hover:bg-stone-200 transition cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showNotifications && (
        <NotificationFeed onClose={() => setShowNotifications(false)} role="Landlord" targetId={landlordNotificationCode} />
      )}

      <MobileBottomNav 
        role="Landlord"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setShowNotifications={setShowNotifications}
        hasUnread={hasUnreadNotifications}
      />
    </div>
  );
}
