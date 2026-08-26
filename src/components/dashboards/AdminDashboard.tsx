// @ts-nocheck
import MobileBottomNav from "./MobileBottomNav";
import NotificationFeed from "./NotificationFeed";
import React, { useState, useEffect } from 'react';
import { 
  Building, UserCheck, Inbox, ShieldAlert, Award, FileSpreadsheet, PlusCircle, 
  Send, Users, Landmark, FileText, CheckCircle2, ChevronDown, Check,
  XCircle, AlertTriangle, HelpCircle, ArrowUpRight, DollarSign, Calendar, RefreshCw,
  Gift, Settings, BarChart2, ShieldCheck, Mail, Map, Clock, FileLock, Search, FolderOpen, Activity,
  Download, Globe, Wifi, WifiOff, Lock, Info, X, Eye, Megaphone, Tag
} from 'lucide-react';
import { PMCApplication, TenantRegistration, LandlordUnit, BookingLog, VerificationInquiry, Property, Professional, ProfessionalConnection, DamageReport, ServiceChargeBill, Complaint } from '../../types';
import PortfolioHealthCenter from './PortfolioHealthCenter';
import ServiceChargeIntelligence from './ServiceChargeIntelligence';
import AICollectionCenter from './AICollectionCenter';
import TransparencyTimeline from './TransparencyTimeline';
import ImmutableHistory from './ImmutableHistory';
import AdminSupportCenter from './AdminSupportCenter';
import QuickSupportButton from './QuickSupportButton';
import SupportCenter from './SupportCenter';
import PromoCodesAdminSection from './PromoCodesAdminSection';
import { EMAIL_TEMPLATE_FOOTER, loadProfessionalConnections, saveProfessionalConnection } from '../../data';
import { calculateDaysOpen, handleAdminEscalationAction } from '../../lib/complaintRouting';
import { generateDemoDataset, removeDemoDataset } from '../../lib/demoData';
import { getEmailFailureMode, setEmailFailureMode } from '../../lib/emailReceiptSystem';
import { triggerMonthlySummaryReportCloudFunction } from '../../lib/monthlyPerformanceReport';
import { updateDocument, useLiveCollection, triggerNotificationCloudEvent } from '../../lib/database';
import { 
  getStoredVerificationRequests, 
  reviewLevel2VerificationRequest, 
  getStoredTenantProfiles, 
  Level2VerificationRequest,
  FirestoreTenantProfile
} from '../../lib/firestoreArchitecture';

interface AdminDashboardProps {
  pmcApps: PMCApplication[];
  setPmcApps: React.Dispatch<React.SetStateAction<PMCApplication[]>>;
  tenantApps: TenantRegistration[];
  setTenantApps: React.Dispatch<React.SetStateAction<TenantRegistration[]>>;
  inquiries: VerificationInquiry[];
  setInquiries: React.Dispatch<React.SetStateAction<VerificationInquiry[]>>;
  landlordUnits: LandlordUnit[];
  setLandlordUnits: React.Dispatch<React.SetStateAction<LandlordUnit[]>>;
  bookings: BookingLog[];
  setBookings: React.Dispatch<React.SetStateAction<BookingLog[]>>;
  properties: Property[];
  setProperties?: React.Dispatch<React.SetStateAction<Property[]>>;
  buildings?: any[];
  setBuildings?: React.Dispatch<React.SetStateAction<any[]>>;
  managementCompanyProperties?: any[];
  setManagementCompanyProperties?: React.Dispatch<React.SetStateAction<any[]>>;
  professionals: Professional[];
  damageReports: DamageReport[];
  serviceCharges?: ServiceChargeBill[];
  setServiceCharges?: React.Dispatch<React.SetStateAction<ServiceChargeBill[]>>;
  subscriptions?: any[];
  setSubscriptions?: React.Dispatch<React.SetStateAction<any[]>>;
  navigate?: (path: string, params?: any) => void;
}

function AdminComplaintOversightSection({
  triggerSuccess
}: {
  triggerSuccess: (msg: string) => void;
}) {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const raw = localStorage.getItem('uh_complaints_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [pathFilter, setPathFilter] = useState<string>('All Paths');
  const [statusFilter, setStatusFilter] = useState<string>('All Statuses');

  // Reassignment Modal State
  const [reassigningComplaint, setReassigningComplaint] = useState<Complaint | null>(null);
  const [newPrimaryRole, setNewPrimaryRole] = useState<'Admin' | 'Landlord' | 'PMC'>('Admin');
  const [reassignReason, setReassignReason] = useState<string>('');

  // Admin Response Modal State
  const [respondingComplaint, setRespondingComplaint] = useState<Complaint | null>(null);
  const [adminResponseText, setAdminResponseText] = useState<string>('');
  const [adminActionTaken, setAdminActionTaken] = useState<string>('');
  const [adminNewStatus, setAdminNewStatus] = useState<'Responded' | 'Resolved'>('Responded');

  // Escalation Action Modal State
  const [escalatingActionComplaint, setEscalatingActionComplaint] = useState<Complaint | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<'Resolved by Admin' | 'Returned to Primary Handler' | 'Serious Concern Flagged'>('Resolved by Admin');
  const [resolutionNoteInput, setResolutionNoteInput] = useState<string>('');
  const [returnedMessageInput, setReturnedMessageInput] = useState<string>('');

  // Timeline Expand State
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem('uh_complaints_v1');
        if (raw) setComplaints(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (categoryFilter !== 'All Categories' && (c.complaint_category || c.category) !== categoryFilter) {
      return false;
    }
    if (pathFilter !== 'All Paths' && c.routingPath !== pathFilter) {
      return false;
    }
    if (statusFilter !== 'All Statuses' && c.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningComplaint) return;
    if (!reassignReason.trim()) {
      alert('A reason for reassignment is required.');
      return;
    }

    const prevRole = reassigningComplaint.primaryRecipientRole || 'Admin';

    const updatedComplaints = complaints.map(c => {
      if (c.id === reassigningComplaint.id) {
        return {
          ...c,
          primaryRecipientRole: newPrimaryRole,
          secondaryRecipientRole: prevRole !== newPrimaryRole ? prevRole : c.secondaryRecipientRole
        };
      }
      return c;
    });

    setComplaints(updatedComplaints);
    localStorage.setItem('uh_complaints_v1', JSON.stringify(updatedComplaints));

    // Append to activity log
    try {
      const rawLogs = localStorage.getItem('uh_activityLog_v1');
      const logs = rawLogs ? JSON.parse(rawLogs) : [];
      const newLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        actorName: 'Dami Joshua',
        actorRole: 'Admin',
        actionType: 'COMPLAINT_REASSIGNED',
        recordAffected: `Complaint ${reassigningComplaint.id}`,
        recordId: reassigningComplaint.id,
        previousValue: prevRole,
        newValue: newPrimaryRole,
        details: `Admin reassigned routing from ${prevRole} to ${newPrimaryRole}. Reason: "${reassignReason}"`
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLog, ...logs]));
    } catch (e) {
      console.error(e);
    }

    // Trigger notifications to previous and new recipient
    try {
      const rawNotifs = localStorage.getItem('uh_notifications_v1');
      const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
      const notifOld = {
        id: 'notif-' + Date.now() + '-1',
        recipientRole: prevRole,
        recipientId: prevRole === 'Landlord' ? (reassigningComplaint.landlordId || '') : prevRole === 'PMC' ? (reassigningComplaint.managementCompanyId || '') : 'Admin',
        title: 'Complaint Routing Reassigned',
        message: `Complaint ${reassigningComplaint.id} (${reassigningComplaint.complaint_category || reassigningComplaint.category}) was reassigned away to ${newPrimaryRole}. Reason: ${reassignReason}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      const notifNew = {
        id: 'notif-' + Date.now() + '-2',
        recipientRole: newPrimaryRole,
        recipientId: newPrimaryRole === 'Landlord' ? (reassigningComplaint.landlordId || '') : newPrimaryRole === 'PMC' ? (reassigningComplaint.managementCompanyId || '') : 'Admin',
        title: 'Complaint Assigned to Your Dashboard',
        message: `Complaint ${reassigningComplaint.id} (${reassigningComplaint.complaint_category || reassigningComplaint.category}) was assigned to you by Admin. Reason: ${reassignReason}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      localStorage.setItem('uh_notifications_v1', JSON.stringify([notifOld, notifNew, ...notifs]));
    } catch (e) {
      console.error(e);
    }

    triggerSuccess(`Complaint ${reassigningComplaint.id} reassigned from ${prevRole} to ${newPrimaryRole}. Notifications & audit logs recorded.`);
    setReassigningComplaint(null);
    setReassignReason('');
  };

  const handleAdminResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingComplaint) return;
    if (!adminResponseText.trim()) {
      alert('Please enter response text.');
      return;
    }

    const updatedComplaints = complaints.map(c => {
      if (c.id === respondingComplaint.id) {
        return {
          ...c,
          status: adminNewStatus,
          adminResponse: adminResponseText,
          adminActionTaken: adminActionTaken || undefined,
          adminRespondedAt: new Date().toISOString()
        };
      }
      return c;
    });

    setComplaints(updatedComplaints);
    localStorage.setItem('uh_complaints_v1', JSON.stringify(updatedComplaints));

    // Append to activity log
    try {
      const rawLogs = localStorage.getItem('uh_activityLog_v1');
      const logs = rawLogs ? JSON.parse(rawLogs) : [];
      const newLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        actorName: 'Dami Joshua',
        actorRole: 'Admin',
        actionType: 'COMPLAINT_RESPONDED',
        recordAffected: `Complaint ${respondingComplaint.id}`,
        recordId: respondingComplaint.id,
        newValue: adminNewStatus,
        details: `Admin responded: "${adminResponseText}". Action: "${adminActionTaken}". Status: ${adminNewStatus}`
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLog, ...logs]));
    } catch (e) {
      console.error(e);
    }

    // Trigger notification to tenant
    try {
      const rawNotifs = localStorage.getItem('uh_notifications_v1');
      const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
      const tenantNotif = {
        id: 'notif-' + Date.now(),
        recipientRole: 'Tenant',
        recipientId: respondingComplaint.tenant,
        title: 'Official Admin Response to Complaint',
        message: `Admin has responded to your complaint regarding ${respondingComplaint.complaint_category || respondingComplaint.category}: "${adminResponseText}"`,
        timestamp: new Date().toISOString(),
        read: false
      };
      localStorage.setItem('uh_notifications_v1', JSON.stringify([tenantNotif, ...notifs]));
    } catch (e) {
      console.error(e);
    }

    triggerSuccess(`Admin response published for Complaint ${respondingComplaint.id}. Status updated to ${adminNewStatus}.`);
    setRespondingComplaint(null);
    setAdminResponseText('');
    setAdminActionTaken('');
  };

  const handleEscalationActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalatingActionComplaint) return;

    const res = handleAdminEscalationAction(
      escalatingActionComplaint.id,
      selectedOutcome,
      {
        resolutionNote: resolutionNoteInput,
        returnedMessage: returnedMessageInput,
        adminName: 'Unity Homes Admin'
      }
    );

    if (res.success) {
      triggerSuccess(`Escalation outcome "${selectedOutcome}" applied successfully.`);
      setEscalatingActionComplaint(null);
      setResolutionNoteInput('');
      setReturnedMessageInput('');
      const raw = localStorage.getItem('uh_complaints_v1');
      if (raw) setComplaints(JSON.parse(raw));
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6 animate-fade-in shadow-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 pb-4">
        <div>
          <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase flex items-center gap-2">
            <span>🛡️ Complaint Routing & Statutory Oversight Master Ledger</span>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] rounded-full font-mono font-semibold">
              {complaints.length} Total Registered
            </span>
          </h3>
          <p className="text-xs text-#6B7280 font-normal mt-0.5">
            Real-time oversight of all platform complaints. Reassign routing paths, issue binding admin responses, and audit complete timelines.
          </p>
        </div>
      </div>

      {/* ESCALATED COMPLAINTS DEDICATED SECTION */}
      {(() => {
        const escalatedList = complaints.filter(c => c.status === 'Escalated' || c.escalated_at || c.is_escalation_eligible);
        if (escalatedList.length === 0) return null;

        return (
          <div className=" border-2 border-amber-400 rounded-[var(--radius-large)] p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500 text-stone-950 font-semibold rounded-xl text-xs shrink-0 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-stone-950" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-amber-950 uppercase text-xs tracking-wider flex items-center gap-2">
                    <span>⚡ Escalated Complaints (Admin Review & Resolution Required)</span>
                    <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded-full font-mono text-[10px] font-semibold">
                      {escalatedList.length} Case{escalatedList.length > 1 ? 's' : ''}
                    </span>
                  </h4>
                  <p className="text-[11px] text-amber-900/80 font-medium">
                    Complaints escalated by tenants after 7+ days without resolution. Admin decisions are binding across all parties.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {escalatedList.map(c => {
                const daysOpen = calculateDaysOpen(c.date);

                return (
                  <div key={c.id} className="p-4 bg-white border border-amber-300 rounded-2xl shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-200 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                            {c.id}
                          </span>
                          <strong className="text-#132A1D text-xs">{c.propertyName} &bull; {c.unit}</strong>
                        </div>
                        <p className="text-[10px] text-#6B7280 mt-0.5 font-mono">
                          Tenant: <strong>{c.tenant}</strong> ({c.tenantEmail || 'tenant@unityhomes.com'}) &bull; Category: <strong>{c.complaint_category || c.category}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-amber-500 text-stone-950 rounded font-mono font-semibold text-[10px] uppercase">
                          {c.status === 'Escalated' ? `Escalated (${daysOpen} days open)` : `Status: ${c.status}`}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200 text-xs">
                      <p className="text-#132A1D italic">&quot;{c.text}&quot;</p>
                    </div>

                    {/* Response History */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/60">
                        <span className="block font-mono text-[9px] font-semibold text-amber-900 uppercase mb-1">
                          Landlord Response ({c.landlordName || 'Landlord'})
                        </span>
                        {c.landlordResponse ? (
                          <p className="text-#132A1D text-[11px]">{c.landlordResponse}</p>
                        ) : (
                          <p className="text-stone-400 italic text-[10px]">No response provided by landlord.</p>
                        )}
                      </div>

                      <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60">
                        <span className="block font-mono text-[9px] font-semibold text-emerald-900 uppercase mb-1">
                          PMC Response ({c.managementCompanyId || 'PMC Handler'})
                        </span>
                        {c.pmcResponse ? (
                          <p className="text-#132A1D text-[11px]">{c.pmcResponse}</p>
                        ) : (
                          <p className="text-stone-400 italic text-[10px]">No response provided by PMC.</p>
                        )}
                      </div>
                    </div>

                    {/* Escalation Metadata */}
                    <div className="p-2.5 bg-amber-100/50 rounded-xl text-[10px] text-amber-950 font-mono flex flex-wrap justify-between items-center gap-2">
                      <span>Escalated by: <strong>{c.escalated_by || c.tenant}</strong> on {c.escalated_at ? c.escalated_at.split('T')[0] : c.date}</span>
                      <span>Reason: {c.escalation_reason || `Open for ${daysOpen} days without resolution`}</span>
                    </div>

                    {/* Action Outcomes */}
                    {c.escalation_outcome ? (
                      <div className="p-3 bg-#132A1D text-white rounded-xl text-xs space-y-1">
                        <span className="text-[10px] font-mono font-semibold uppercase text-amber-400 block">
                          Outcome Applied: {c.escalation_outcome}
                        </span>
                        {c.resolutionNote && <p className="text-stone-200 text-[11px]">&quot;{c.resolutionNote}&quot;</p>}
                        {c.returned_message && <p className="text-stone-200 text-[11px]">Directive: &quot;{c.returned_message}&quot;</p>}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEscalatingActionComplaint(c);
                            setSelectedOutcome('Resolved by Admin');
                          }}
                          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-xs"
                        >
                          1. Resolved by Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEscalatingActionComplaint(c);
                            setSelectedOutcome('Returned to Primary Handler');
                          }}
                          className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-xs"
                        >
                          2. Return to Primary Handler (48h)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEscalatingActionComplaint(c);
                            setSelectedOutcome('Serious Concern Flagged');
                          }}
                          className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-xs"
                        >
                          3. Flag Serious Concern
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-amber-50/80 p-4 rounded-2xl border border-stone-200 text-xs">
        <div>
          <label className="block text-[10px] font-mono font-semibold text-#6B7280 uppercase mb-1">Filter by Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2 bg-white border border-stone-200 rounded-xl font-medium outline-none"
          >
            <option value="All Categories">All Categories (8 Options)</option>
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

        <div>
          <label className="block text-[10px] font-mono font-semibold text-#6B7280 uppercase mb-1">Filter by Routing Path</label>
          <select
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
            className="w-full p-2 bg-white border border-stone-200 rounded-xl font-medium outline-none"
          >
            <option value="All Paths">All Routing Paths (5 Paths)</option>
            <option value="path_1_maintenance">Path 1: Self-Managed Maintenance/Waste/Noise (Landlord Primary)</option>
            <option value="path_2_pmc_managed">Path 2: PMC-Managed Maintenance/Waste/Noise (PMC Primary)</option>
            <option value="path_3_landlord_conduct">Path 3: Landlord Conduct (Admin Primary)</option>
            <option value="path_4_pmc_conduct">Path 4: PMC Conduct (Admin Primary)</option>
            <option value="path_5_something_else">Path 5: Something Else (Admin Primary)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono font-semibold text-#6B7280 uppercase mb-1">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 bg-white border border-stone-200 rounded-xl font-medium outline-none"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Responded">Responded</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <p className="text-stone-400 italic text-center py-8 text-xs">
            No complaints found matching selected category, routing path, or status filters.
          </p>
        ) : (
          filteredComplaints.map(c => {
            let statusBadgeClass = 'bg-amber-50/80 text-#132A1D border-stone-200';
            if (c.status === 'Open') statusBadgeClass = 'bg-red-100 text-red-800 border-red-300';
            else if (c.status === 'Responded') statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
            else if (c.status === 'Resolved') statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';

            return (
              <div key={c.id} className="p-5 bg-amber-50/80 border border-stone-200 rounded-2xl space-y-4 text-xs">
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-200/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-#132A1D font-semibold text-sm">{c.complaint_category || c.category}</strong>
                      <span className="font-mono text-[10px] text-stone-400">({c.id})</span>
                      {c.urgency && (
                        <span className={`px-2 py-0.5 rounded text-[8px] font-semibold uppercase ${c.urgency === 'Urgent' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                          {c.urgency}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-#6B7280 font-mono">
                      Tenant: <strong className="text-#132A1D">{c.tenant}</strong> &bull; Property: <strong>{c.propertyName} ({c.unit})</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded text-[9px] font-semibold uppercase border ${statusBadgeClass}`}>
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Routing info & Primary/Secondary Recipients */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-stone-150 text-[10px] font-mono">
                  <div>
                    <span className="text-stone-400 uppercase block font-semibold">Routing Path</span>
                    <span className="text-#132A1D font-semibold">{c.routingPath || 'Path 1'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 uppercase block font-semibold">Primary Recipient</span>
                    <span className="text-emerald-800 font-semibold uppercase">{c.primaryRecipientRole || 'Admin'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 uppercase block font-semibold">Secondary Recipient</span>
                    <span className="text-#132A1D uppercase">{c.secondaryRecipientRole || 'None (Oversight)'}</span>
                  </div>
                </div>

                {/* Complaint Body */}
                <div className="bg-white p-3.5 rounded-xl border border-stone-150 text-#132A1D text-[11px] leading-relaxed">
                  &quot;{c.text}&quot;
                </div>

                {/* Existing Responses */}
                {(c.landlordResponse || c.pmcResponse || c.adminResponse) && (
                  <div className="space-y-2 pt-1">
                    {c.landlordResponse && (
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[10px]">
                        <strong className="text-amber-900 block font-mono uppercase">LANDLORD RESPONSE ({c.landlordRespondedAt?.split('T')[0]}):</strong>
                        <p className="text-#132A1D mt-0.5">&quot;{c.landlordResponse}&quot;</p>
                      </div>
                    )}
                    {c.pmcResponse && (
                      <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 text-[10px]">
                        <strong className="text-teal-900 block font-mono uppercase">PMC RESPONSE ({c.pmcRespondedAt?.split('T')[0]}):</strong>
                        <p className="text-#132A1D mt-0.5">&quot;{c.pmcResponse}&quot;</p>
                      </div>
                    )}
                    {c.adminResponse && (
                      <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-[10px]">
                        <strong className="text-purple-900 block font-mono uppercase">ADMIN DIRECT RESPONSE ({c.adminRespondedAt?.split('T')[0]}):</strong>
                        <p className="text-#132A1D mt-0.5">&quot;{c.adminResponse}&quot;</p>
                        {c.adminActionTaken && (
                          <p className="text-[9px] text-purple-800 italic font-mono mt-0.5">Action Taken: {c.adminActionTaken}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/80 pt-3">
                  <span className="text-[9px] font-mono text-stone-400">Filed Date: {c.date}</span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReassigningComplaint(c);
                        setNewPrimaryRole((c.primaryRecipientRole as any) || 'Admin');
                        setReassignReason('');
                      }}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-#132A1D font-semibold rounded-lg text-[10px] uppercase font-mono transition cursor-pointer"
                    >
                      🔄 Reassign Routing
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRespondingComplaint(c);
                        setAdminResponseText(c.adminResponse || '');
                        setAdminActionTaken(c.adminActionTaken || '');
                        setAdminNewStatus(c.status === 'Resolved' ? 'Resolved' : 'Responded');
                      }}
                      className="px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-lg text-[10px] uppercase font-mono transition cursor-pointer"
                    >
                      💬 Admin Direct Response
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedTimelineId(expandedTimelineId === c.id ? null : c.id)}
                      className="px-3 py-1.5 bg-amber-50/80 hover:bg-stone-200 text-#132A1D font-semibold rounded-lg text-[10px] uppercase font-mono transition cursor-pointer"
                    >
                      {expandedTimelineId === c.id ? 'Hide Audit Log' : '📜 View Activity Log'}
                    </button>
                  </div>
                </div>

                {/* Expandable Activity Log / Audit Trail */}
                {expandedTimelineId === c.id && (
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 animate-fade-in text-[10px]">
                    <strong className="block font-mono uppercase text-#6B7280 font-semibold">Activity Log &amp; Routing Timeline</strong>
                    <div className="space-y-1.5 border-l-2 border-emerald-500 pl-3 pt-1">
                      <div className="text-#132A1D">
                        <span className="font-mono text-stone-400 block">{c.date} 09:00</span>
                        <strong>Complaint Submitted</strong> by {c.tenant} &bull; Category: {c.complaint_category || c.category} &bull; Path: {c.routingPath || 'Path 1'}
                      </div>
                      {c.landlordRespondedAt && (
                        <div className="text-amber-900 pt-1">
                          <span className="font-mono text-stone-400 block">{c.landlordRespondedAt.split('T')[0]}</span>
                          <strong>Landlord Responded</strong>: &quot;{c.landlordResponse}&quot;
                        </div>
                      )}
                      {c.pmcRespondedAt && (
                        <div className="text-teal-900 pt-1">
                          <span className="font-mono text-stone-400 block">{c.pmcRespondedAt.split('T')[0]}</span>
                          <strong>PMC Responded</strong>: &quot;{c.pmcResponse}&quot;
                        </div>
                      )}
                      {c.adminRespondedAt && (
                        <div className="text-purple-900 pt-1">
                          <span className="font-mono text-stone-400 block">{c.adminRespondedAt.split('T')[0]}</span>
                          <strong>Admin Responded</strong>: &quot;{c.adminResponse}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* REASSIGNMENT MODAL */}
      {reassigningComplaint && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={handleReassignSubmit} className="bg-white rounded-[var(--radius-large)] max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-sm text-xs">
            <h4 className="font-display font-semibold text-[#18452E] text-sm uppercase">
              Reassign Complaint Routing Path
            </h4>
            <p className="text-#6B7280 text-[11px] font-normal">
              Reassign complaint <strong className="font-mono">{reassigningComplaint.id}</strong> ({reassigningComplaint.complaint_category}) to a new primary recipient role.
            </p>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-#6B7280 uppercase mb-1">
                New Primary Recipient Role *
              </label>
              <select
                value={newPrimaryRole}
                onChange={(e) => setNewPrimaryRole(e.target.value as any)}
                className="w-full p-2.5 bg-amber-50/80 border border-stone-200 rounded-xl font-semibold outline-none"
              >
                <option value="Admin">Admin (System Controller)</option>
                <option value="Landlord">Landlord (Property Owner)</option>
                <option value="PMC">PMC (Property Management Company)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-#6B7280 uppercase mb-1">
                Reason for Reassignment * (Mandatory for compliance audit)
              </label>
              <textarea
                rows={3}
                required
                value={reassignReason}
                onChange={(e) => setReassignReason(e.target.value)}
                placeholder="e.g. PMC failed to respond within statutory 48-hour window; reallocating directly to Admin for enforcement."
                className="w-full p-2.5 bg-amber-50/80 border border-stone-200 rounded-xl font-sans outline-none focus:ring-1 focus:ring-[#18452E]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setReassigningComplaint(null)}
                className="px-4 py-2 bg-amber-50/80 hover:bg-stone-200 text-#132A1D font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl cursor-pointer"
              >
                Confirm Reassignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADMIN RESPONSE MODAL */}
      {respondingComplaint && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={handleAdminResponseSubmit} className="bg-white rounded-[var(--radius-large)] max-w-lg w-full p-6 space-y-4 border border-stone-200 shadow-sm text-xs">
            <h4 className="font-display font-semibold text-[#18452E] text-sm uppercase">
              Submit Direct Admin Response / Binding Ruling
            </h4>
            <p className="text-#6B7280 text-[11px] font-normal">
              Publish official Admin response for complaint <strong className="font-mono">{respondingComplaint.id}</strong> filed by {respondingComplaint.tenant}.
            </p>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-#6B7280 uppercase mb-1">
                Response / Ruling Text *
              </label>
              <textarea
                rows={3}
                required
                value={adminResponseText}
                onChange={(e) => setAdminResponseText(e.target.value)}
                placeholder="State official findings, warning citations issued, or binding resolution instructions..."
                className="w-full p-2.5 bg-amber-50/80 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-[#18452E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-#6B7280 uppercase mb-1">
                Action Taken / Statutory Order (Optional)
              </label>
              <input
                type="text"
                value={adminActionTaken}
                onChange={(e) => setAdminActionTaken(e.target.value)}
                placeholder="e.g. Dispatched formal warning notice to landlord; escrowed upcoming rent disbursement."
                className="w-full p-2.5 bg-amber-50/80 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-[#18452E]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-#6B7280 uppercase mb-1">
                Update Status To
              </label>
              <select
                value={adminNewStatus}
                onChange={(e) => setAdminNewStatus(e.target.value as any)}
                className="w-full p-2.5 bg-amber-50/80 border border-stone-200 rounded-xl font-semibold outline-none"
              >
                <option value="Responded">Responded (Under Active Administrative Monitoring)</option>
                <option value="Resolved">Resolved (Case Formally Closed)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setRespondingComplaint(null)}
                className="px-4 py-2 bg-amber-50/80 hover:bg-stone-200 text-#132A1D font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl cursor-pointer font-mono"
              >
                Publish Admin Response
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ESCALATION ACTION MODAL */}
      {escalatingActionComplaint && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={handleEscalationActionSubmit} className="bg-white rounded-[var(--radius-large)] max-w-lg w-full p-6 space-y-4 border border-stone-200 shadow-sm text-xs">
            <div className="flex items-center gap-2 text-amber-700">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="font-display font-semibold text-#132A1D text-sm uppercase">
                Resolve Escalated Complaint #{escalatingActionComplaint.id}
              </h4>
            </div>

            <p className="text-#6B7280 text-[11px]">
              Tenant <strong>{escalatingActionComplaint.tenant}</strong> escalated this complaint for {escalatingActionComplaint.propertyName}. Select the statutory outcome below:
            </p>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-#132A1D uppercase mb-1">
                Select Resolution Outcome *
              </label>
              <select
                value={selectedOutcome}
                onChange={(e) => setSelectedOutcome(e.target.value as any)}
                className="w-full p-3 bg-amber-50/80 border border-stone-300 rounded-xl font-semibold text-xs outline-none"
              >
                <option value="Resolved by Admin">1. Resolved by Admin (Direct Admin Closure)</option>
                <option value="Returned to Primary Handler">2. Returned to Primary Handler (48-Hour Directive)</option>
                <option value="Serious Concern Flagged">3. Serious Concern Flagged (Formal Review Elevated)</option>
              </select>
            </div>

            {selectedOutcome === 'Resolved by Admin' && (
              <div>
                <label className="block text-[10px] font-mono font-semibold text-emerald-900 uppercase mb-1">
                  Resolution Note * (Sent to Tenant, Landlord, and PMC)
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNoteInput}
                  onChange={(e) => setResolutionNoteInput(e.target.value)}
                  placeholder="e.g. Unity Homes arranged emergency borehole repair contractor. Water supply restored and verified."
                  className="w-full p-2.5 bg-amber-50/80 border border-emerald-300 rounded-xl outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                />
              </div>
            )}

            {selectedOutcome === 'Returned to Primary Handler' && (
              <div>
                <label className="block text-[10px] font-mono font-semibold text-amber-900 uppercase mb-1">
                  Directive Message to Handler * (Must resolve within 48 hours)
                </label>
                <textarea
                  rows={3}
                  required
                  value={returnedMessageInput}
                  onChange={(e) => setReturnedMessageInput(e.target.value)}
                  placeholder="e.g. You are hereby directed to dispatch a plumber within 48 hours and submit proof of repair to admin."
                  className="w-full p-2.5 bg-amber-50/80 border border-amber-300 rounded-xl outline-none focus:ring-1 focus:ring-amber-700 font-sans"
                />
              </div>
            )}

            {selectedOutcome === 'Serious Concern Flagged' && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-[11px] leading-relaxed font-medium">
                <strong>🔒 Formal Review Lock:</strong> This complaint will be elevated to the highest administrative review tier. Status will update to Under Review and further modifications will be locked until formal investigation completes.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setEscalatingActionComplaint(null)}
                className="px-4 py-2.5 bg-amber-50/80 hover:bg-stone-200 text-#132A1D font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-xl cursor-pointer shadow-md uppercase tracking-wider"
              >
                Apply Outcome & Send Notifications
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function AdminLevel2VerificationQueue() {
  const [requests, setRequests] = useState<Level2VerificationRequest[]>(() => getStoredVerificationRequests());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshRequests = () => {
    setRequests(getStoredVerificationRequests());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const profiles = getStoredTenantProfiles();

  const handleApprove = (req: Level2VerificationRequest) => {
    const duplicates = profiles.filter(p => p.nin && req.nin && p.nin.trim() === req.nin.trim() && p.id !== req.tenant_id);
    if (duplicates.length > 0) {
      const confirmOverride = window.confirm(
        `WARNING: Duplicate NIN (${req.nin}) detected! Existing user: ${duplicates[0].full_name} (${duplicates[0].id}). Are you sure you want to approve this verification?`
      );
      if (!confirmOverride) return;
    }

    reviewLevel2VerificationRequest(req.id, 'Approved');
    showToast(`Level 2 Verification Approved for tenant! Verified Badge granted.`);
    refreshRequests();
  };

  const handleReject = (req: Level2VerificationRequest) => {
    const reason = window.prompt('Please enter the rejection reason for the tenant:', 'ID document unreadable or mismatched name');
    if (reason === null) return;

    reviewLevel2VerificationRequest(req.id, 'Rejected', reason || 'Document unreadable');
    showToast(`Verification request rejected.`);
    refreshRequests();
  };

  if (pendingRequests.length === 0) return null;

  return (
    <div className="bg-amber-50/80 border-2 border-amber-300 rounded-[var(--radius-large)] p-6 space-y-4 shadow-sm animate-fade-in mb-6">
      {toastMessage && (
        <div className="p-3 bg-emerald-800 text-white text-xs font-semibold rounded-2xl shadow-sm">
          {toastMessage}
        </div>
      )}

      <div className="flex items-center justify-between border-b border-amber-200 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-700" />
          <h3 className="font-display font-semibold text-amber-950 text-sm uppercase">
            Level 2 Tenant Identity Verification Queue
          </h3>
        </div>
        <span className="px-2.5 py-1 bg-amber-200 text-amber-900 font-mono font-semibold text-[10px] rounded-full">
          {pendingRequests.length} Pending
        </span>
      </div>

      <div className="space-y-4">
        {pendingRequests.map((req) => {
          const tenantProfile = profiles.find(p => p.id === req.tenant_id || p.user_id === req.tenant_id);
          const tenantName = tenantProfile?.full_name || 'Tenant';
          const duplicates = profiles.filter(p => p.nin && req.nin && p.nin.trim() === req.nin.trim() && p.id !== req.tenant_id);

          return (
            <div key={req.id} className="bg-white rounded-2xl border border-amber-200 p-4 space-y-3 shadow-xs">
              {duplicates.length > 0 && (
                <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>
                    DUPLICATE NIN WARNING: NIN ({req.nin}) matches existing profile "{duplicates[0].full_name}" ({duplicates[0].id})!
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-200 pb-2">
                <div>
                  <strong className="text-#132A1D text-xs font-semibold block">{tenantName}</strong>
                  <span className="text-[10px] text-#6B7280 font-mono">
                    ID: {req.tenant_id} &bull; Submitted: {new Date(req.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-semibold bg-amber-50/80 px-2 py-0.5 rounded-lg text-#132A1D">
                    Type: {req.id_type || 'NIN'}
                  </span>
                  <span className="text-[9px] font-mono font-semibold bg-amber-50/80 px-2 py-0.5 rounded-lg text-#132A1D">
                    NIN: {req.nin || 'Not provided'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-stone-400 block font-semibold">Government ID Document</span>
                  <a href={req.government_id_photo} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={req.government_id_photo} 
                      alt="Government ID" 
                      className="w-full h-32 object-cover rounded-xl border border-stone-200 hover:opacity-90 transition" 
                    />
                  </a>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-stone-400 block font-semibold">Verification Selfie Photo</span>
                  <a href={req.verification_selfie_photo} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={req.verification_selfie_photo} 
                      alt="Verification Selfie" 
                      className="w-full h-32 object-cover rounded-xl border border-stone-200 hover:opacity-90 transition" 
                    />
                  </a>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-200">
                <button
                  onClick={() => handleApprove(req)}
                  className="flex-1 py-2 bg-emerald-800 text-white font-semibold rounded-xl hover:bg-emerald-900 text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Grant Verified Badge</span>
                </button>
                <button
                  onClick={() => handleReject(req)}
                  className="flex-1 py-2 bg-rose-100 text-rose-800 font-semibold rounded-xl hover:bg-rose-200 text-xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Request</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminDashboard({
  pmcApps, setPmcApps,
  tenantApps, setTenantApps,
  inquiries, setInquiries,
  landlordUnits, setLandlordUnits,
  bookings, setBookings,
  properties,
  setProperties,
  buildings = [],
  setBuildings,
  managementCompanyProperties = [],
  setManagementCompanyProperties,
  professionals,
  damageReports,
  serviceCharges = [],
  setServiceCharges,
  subscriptions = [],
  setSubscriptions,
  navigate
}: AdminDashboardProps) {

  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [expandedLandlords, setExpandedLandlords] = useState<string[]>([]);
  const toggleLandlordExpand = (name: string) => setExpandedLandlords(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  
  const getLandlordName = (propertyName: string) => {
    const lower = propertyName.toLowerCase();
    if (lower.includes('osei')) return 'Mr. Babatunde Osei';
    if (lower.includes('ibrahim') || lower.includes('wuse')) return 'Alhaji Musa Ibrahim';
    if (lower.includes('adebayo') || lower.includes('lekki')) return 'Chief Funmi Adebayo';
    if (lower.includes('okafor') || lower.includes('cozy') || lower.includes('maryland')) return 'Dr. Chioma Okafor';
    if (lower.includes('adeyinka') || lower.includes('bode thomas') || lower.includes('toyin') || lower.includes('sanusi')) return 'Chief Emmanuel Adeyinka';
    return 'Mr. Babatunde Osei'; // fallback
  };
  const getTenantPhoto = (name: string) => {
    if (name === 'Aisha Bello') return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
    if (name === 'Chidi Okafor') return 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80';
    if (name === 'Ngozi Eze') return 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=80';
    if (name.includes('Emeka')) return 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80';
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminPaymentSearch, setAdminPaymentSearch] = useState('');
  
  // Real-time listener for Admin notifications
  const adminNotifications = useLiveCollection('notifications', [], (allNotifs) => {
    return allNotifs.filter(n => n.role === 'Admin' || n.targetId === 'Admin');
  });
  const hasUnreadNotifications = adminNotifications.some(n => !n.read);
  
  // Compliance and Assignment states (Prompt Two)
  const [assignPropertyId, setAssignPropertyId] = useState('');
  const [assignPmcId, setAssignPmcId] = useState('');
  const [assignFeePct, setAssignFeePct] = useState<string>('');
  
  // Pending fee change requests state
  const [feeRequests, setFeeRequests] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_fee_change_requests_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('uh_fee_change_requests_v1');
        if (stored) {
          setFeeRequests(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to parse fee change requests: ", err);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Also set a small periodic timer to capture changes within the same tab context
    const interval = setInterval(handleStorageChange, 1500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const [successMsg, setSuccessMsg] = useState<string>('');

  const getCollectionAccountTextForAdmin = (propertyName: string) => {
    const prop = properties.find(p => p.title === propertyName || propertyName.includes(p.title) || p.title.includes(propertyName));
    if (prop) {
      const digits = prop.verifiedAccountNumber.slice(-4);
      return `Paid to ${prop.verifiedBankName} (AC ending ***${digits})`;
    }
    return 'Paid to Verified Landlord Collection Account';
  };
  
  // States of some operations
  const [matchingClient, setMatchingClient] = useState({ client: '', prof: '' });
  const [selectedSubInquiry, setSelectedSubInquiry] = useState<string | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    { id: '1', level: 'Tenant Verification Token', price: 5000, clientCount: 'Per Check' },
    { id: '2', level: 'Landlord Growth Profile Pack', price: 15000, clientCount: 'Per Property/Mo' },
    { id: '3', level: 'PMC Professional Suite', price: 45000, clientCount: 'Unlimited Portfolio' }
  ]);
  
  // Complaints and Damages mock lists
  const [complaints, setComplaints] = useState([
    { id: 'c-1', tenant: 'Aisha Bello', unit: 'Flat 4, Ikeja Studio', text: 'Water pump has been offline for 48 hours. Landlord did not answer.', date: '2026-06-20', status: 'Pending Verification' },
    { id: 'c-2', tenant: 'Kola Abiodun', unit: 'Suite B, Maryland Cozy', text: 'Power lines hum loudly from electrical panel close to the doorway.', date: '2026-06-19', status: 'In Ledger Dispute' }
  ]);
  const [damages, setDamages] = useState([
    { id: 'd-1', tenant: 'Damola Olatunji', property: 'Osei Gbagada Flat A', type: 'Broken glass pane in master bedroom during heavy wind', value: 45000, status: 'Awaiting Estimate' }
  ]);

  const [birthdays, setBirthdays] = useState([
    { name: 'Chidi Mokeme', bday: 'August 15', age: 32, phone: '+234 812 345 6789' },
    { name: 'Damola Olatunji', bday: 'November 20', age: 34, phone: '+234 803 222 3841' }
  ]);

  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [tempOverrideLimit, setTempOverrideLimit] = useState<number>(10);
  const [revertPeriod, setRevertPeriod] = useState<string>('24_hours');
  const [overrideReason, setOverrideReason] = useState<string>('');

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntity || !tempOverrideLimit || !overrideReason) {
      alert('Please fill out all override parameters.');
      return;
    }

    const sub = (subscriptions || []).find(s => s.entityId === selectedEntity);
    if (!sub) {
      alert('Subscription entity not found.');
      return;
    }

    const previousValue = sub.property_limit;
    const now = Date.now();
    let expiryTime: string | null = null;
    if (revertPeriod === '24_hours') {
      expiryTime = new Date(now + 24 * 3600 * 1000).toISOString();
    } else if (revertPeriod === '7_days') {
      expiryTime = new Date(now + 7 * 24 * 3600 * 1000).toISOString();
    } else if (revertPeriod === '30_days') {
      expiryTime = new Date(now + 30 * 24 * 3600 * 1000).toISOString();
    }

    const updatedSub = {
      ...sub,
      property_limit: Number(tempOverrideLimit),
      is_overridden: true,
      original_limit: previousValue,
      override_expiry: expiryTime,
      override_reason: overrideReason
    };

    try {
      updateDocument('subscriptions', updatedSub.id, updatedSub);
    } catch (err) {}

    if (setSubscriptions) {
      setSubscriptions((subscriptions || []).map(s => s.entityId === selectedEntity ? updatedSub : s));
    }

    try {
      const storedLogs = localStorage.getItem('uh_activityLog_v1');
      const parsedLogs = storedLogs ? JSON.parse(storedLogs) : [];
      const newLogEntry = {
        id: `log-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actorName: 'Unity Homes Admin',
        actorRole: 'System Administrator',
        actionType: 'SUBSCRIPTION_LIMIT_OVERRIDE',
        recordAffected: selectedEntity,
        recordId: selectedEntity,
        previousValue: String(previousValue),
        newValue: String(tempOverrideLimit),
        details: overrideReason
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLogEntry, ...parsedLogs]));
      window.dispatchEvent(new Event('storage'));
    } catch (logErr) {
      console.error('Error logging override action:', logErr);
    }

    setSelectedEntity('');
    setOverrideReason('');
    triggerSuccess(`Successfully applied override limit of ${tempOverrideLimit} to '${selectedEntity}'.`);
  };

  const handleForceRevert = (entityId: string) => {
    const sub = (subscriptions || []).find(s => s.entityId === entityId);
    if (!sub) return;

    const previousValue = sub.property_limit;
    const originalLimit = sub.original_limit !== undefined && sub.original_limit !== null ? sub.original_limit : (sub.entityType === 'PMC' ? 10 : 5);

    const revertedSub = {
      ...sub,
      property_limit: originalLimit,
      is_overridden: false,
      original_limit: null,
      override_expiry: null,
      override_reason: null
    };

    try {
      updateDocument('subscriptions', revertedSub.id, revertedSub);
    } catch (err) {}

    if (setSubscriptions) {
      setSubscriptions((subscriptions || []).map(s => s.entityId === entityId ? revertedSub : s));
    }

    try {
      const storedLogs = localStorage.getItem('uh_activityLog_v1');
      const parsedLogs = storedLogs ? JSON.parse(storedLogs) : [];
      const newLogEntry = {
        id: `log-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actorName: 'Unity Homes Admin',
        actorRole: 'System Administrator',
        actionType: 'SUBSCRIPTION_LIMIT_REVERTED',
        recordAffected: entityId,
        recordId: entityId,
        previousValue: String(previousValue),
        newValue: String(originalLimit),
        details: 'Manual force reversion by system administrator.'
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLogEntry, ...parsedLogs]));
      window.dispatchEvent(new Event('storage'));
    } catch (logErr) {
      console.error('Error logging reversion action:', logErr);
    }

    triggerSuccess(`Successfully reverted subscription limit for '${entityId}' back to baseline of ${originalLimit}.`);
  };

  const [selectedLandlordModal, setSelectedLandlordModal] = useState<any | null>(null);
  const [selectedTenantModal, setSelectedTenantModal] = useState<any | null>(null);
  const [selectedPMCModal, setSelectedPMCModal] = useState<any | null>(null);
  const [selectedShortletModal, setSelectedShortletModal] = useState<any | null>(null);

  const [landlordModalTab, setLandlordModalTab] = useState<'details' | 'history'>('details');
  const [tenantModalTab, setTenantModalTab] = useState<'details' | 'history'>('details');
  const [pmcModalTab, setPmcModalTab] = useState<'details' | 'history'>('details');
  const [shortletModalTab, setShortletModalTab] = useState<'details' | 'history'>('details');

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleApprovePMC = (id: string) => {
    const updated = pmcApps.map(app => app.id === id ? { ...app, status: 'Approved' as const } : app);
    setPmcApps(updated);
    localStorage.setItem('uh_pmc_applications', JSON.stringify(updated));
    triggerSuccess('PMC Application successfully approved! WhatsApp verification dispatch sent.');
  };

  const handleRejectPMC = (id: string) => {
    const updated = pmcApps.map(app => app.id === id ? { ...app, status: 'Rejected' as const } : app);
    setPmcApps(updated);
    localStorage.setItem('uh_pmc_applications', JSON.stringify(updated));
    triggerSuccess('PMC Application marked as Rejected.');
  };

  const handleApproveTenant = (id: string) => {
    const updated = tenantApps.map(app => app.id === id ? { ...app, status: 'Approved' as const } : app);
    setTenantApps(updated);
    localStorage.setItem('uh_tenant_registrations', JSON.stringify(updated));
    triggerSuccess('Tenant profile fully certified. Ledger ledger profile setup is complete.');
  };

  const handleTriggerBdayAlert = (name: string, phone: string) => {
    triggerSuccess(`SMS Congratulations launched to ${name} (${phone}): "Happy Birthday from Unity Homes! Don't Buy Wahala, your tenancy continues seamlessly."`);
  };

  const handleProcessInquiry = (id: string) => {
    const updated = inquiries.map(inq => inq.id === id ? { ...inq, status: 'Contacted' as const } : inq);
    setInquiries(updated);
    localStorage.setItem('uh_inquiries', JSON.stringify(updated));
    triggerSuccess('Subscription Verification callback triggered via official WhatsApp Hotline.');
  };

  const isDemoActive = landlordUnits.some(u => u.isDemoData && (
    u.propertyName?.includes('Obiora') || 
    u.propertyName?.includes('Fashola') || 
    u.propertyName?.includes('Magaji') || 
    u.propertyName?.includes('Lekki Phase 1') || 
    u.propertyName?.includes('Nwosu')
  ));

  const mockLandlords = isDemoActive ? [
    { id: 'L1', name: 'Mrs Adunola Fashola', phone: '+234 802 111 2222', email: 'adunola.fashola@gmail.com', type: 'Self Managed', propertyCount: 8, tenantCount: 7, portfolioValue: 1640000, outstanding: 360000, photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=150&h=150&fit=crop' },
    { id: 'L2', name: 'Chief Emeka Obiora', phone: '+234 813 455 6789', email: 'chief.obiora@gmail.com', type: 'Combined', propertyCount: 11, tenantCount: 9, portfolioValue: 44800000, outstanding: 760000, photo: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop' },
    { id: 'L3', name: 'Alhaji Sule Magaji', phone: '+234 706 111 2222', email: 'sule.magaji@yahoo.com', type: 'PMC Managed', propertyCount: 4, tenantCount: 4, portfolioValue: 552000, outstanding: 168000, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
    { id: 'L4', name: 'Dr Bimbo Adeyemi', phone: '+234 809 999 8888', email: 'bimbo.adeyemi@gmail.com', type: 'PMC Managed', propertyCount: 6, tenantCount: 0, portfolioValue: 29600000, outstanding: 0, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop' },
    { id: 'L5', name: 'Mrs Grace Nwosu', phone: '+234 818 777 6666', email: 'grace.nwosu@gmail.com', type: 'PMC Managed', propertyCount: 4, tenantCount: 0, portfolioValue: 6400000, outstanding: 0, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' },
  ] : [
    { id: 'L1', name: 'Mrs Funmi Adebayo', phone: '+234 802 333 4444', email: 'funmi@adebayo.ng', type: 'Self Managed', propertyCount: 8, tenantCount: 6, portfolioValue: 29000000, outstanding: 0, photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=150&h=150&fit=crop' },
    { id: 'L2', name: 'Mr Babatunde Osei', phone: '+234 813 455 6789', email: 'baba.osei@gmail.com', type: 'Combined', propertyCount: 7, tenantCount: 7, portfolioValue: 56000000, outstanding: 90000, photo: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop' },
    { id: 'L3', name: 'Alhaji Musa Ibrahim', phone: '+234 706 111 2222', email: 'musa.ibr@yahoo.com', type: 'PMC Managed', propertyCount: 6, tenantCount: 6, portfolioValue: 62000000, outstanding: 0, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop' },
    { id: 'L4', name: 'Dr Chioma Okafor', phone: '+234 809 999 8888', email: 'chioma.med@gmail.com', type: 'Self Managed', propertyCount: 5, tenantCount: 4, portfolioValue: 19000000, outstanding: 24000, photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop' },
    { id: 'L5', name: 'Chief Emmanuel Adeyinka', phone: '+234 818 777 6666', email: 'emmanuel.ade@yinka.com', type: 'Self Managed', propertyCount: 4, tenantCount: 4, portfolioValue: 13000000, outstanding: 0, photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' },
  ];

  const mockTenants = [
    { id: 'T1', name: 'Kola Abiodun', gender: 'Male', dob: '1992-04-12', relationship: 'Single', occupation: 'Software Engineer', employer: 'Paystack', phone: '+234 812 345 6789', email: 'kola.ab@gmail.com', property: 'Adebayo Lekki Heights', unit: 'A1', leaseStart: '2025-01-01', leaseEnd: '2026-12-31', rentAmount: 2500000, paymentHistory: 'Good', guarantor: { name: 'Mr Samuel Abiodun', relationship: 'Father', phone: '+234 803 111 2222', occupation: 'Retired Civil Servant', address: '14 Unity Road, Ikeja' }, photo: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=150&h=150&fit=crop' }
  ];

  const mockPMCs = isDemoActive ? [
    { id: 'P1', name: 'Prime Property Solutions', address: 'Victoria Island, Lagos', phone: '+234 800 PRIME', email: 'contact@primeprops.ng', propertiesManaged: 14, landlordsManaged: 3, tenantsManaged: 45, staffCount: 12, subscription: 'Growth Suite', collectionHistory: '₦450.2M YTD' },
    { id: 'P2', name: 'Lagos Realty Partners', address: 'Ikeja, Lagos', phone: '+234 800 LAGOS', email: 'hello@lagosrealty.com', propertiesManaged: 7, landlordsManaged: 2, tenantsManaged: 7, staffCount: 5, subscription: 'Starter Suite', collectionHistory: '₦180.5M YTD' }
  ] : [
    { id: 'P1', name: 'Prime Property Solutions', address: 'Victoria Island, Lagos', phone: '+234 800 PRIME', email: 'contact@primeprops.ng', propertiesManaged: 14, landlordsManaged: 3, tenantsManaged: 45, staffCount: 12, subscription: 'Enterprise PMC', collectionHistory: '₦450.2M YTD' },
    { id: 'P2', name: 'Lagos Realty Partners', address: 'Ikeja, Lagos', phone: '+234 800 LAGOS', email: 'hello@lagosrealty.com', propertiesManaged: 8, landlordsManaged: 2, tenantsManaged: 22, staffCount: 5, subscription: 'Professional', collectionHistory: '₦180.5M YTD' }
  ];

  const mockShortlets = [
    { id: 'S1', name: 'Vantage Shortlets', manager: 'Adeola Johnson', propertiesManaged: 5, bookingsLogged: 142, revenueManaged: 12500000, commissionEarned: 1875000, remittancePerformance: '98%' }
  ];

  // --- CORE DYNAMIC RECORDS STATE OVERRIDES ---
  const [landlords, setLandlords] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_admin_landlords_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return mockLandlords.map(l => ({ ...l, status: 'Active' }));
  });

  const [tenants, setTenants] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_admin_tenants_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return mockTenants.map(t => ({ ...t, status: 'Active' }));
  });

  const [pmcs, setPmcs] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_admin_pmcs_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return mockPMCs.map(p => ({ ...p, status: 'Active' }));
  });

  const [shortlets, setShortlets] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_admin_shortlets_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return mockShortlets.map(s => ({ ...s, status: 'Active' }));
  });

  // Save changes helper
  const persistRecords = (key: string, data: any[], setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --- EMAIL RECEIPT SYSTEM STATES ---
  const [rentPayments, setRentPayments] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_rent_payments_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [sentEmails, setSentEmails] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_sent_emails_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [emailFailureSimulation, setEmailFailureSimulation] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('uh_email_fail_simulation_active');
      return stored === 'true';
    } catch {}
    return false;
  });

  const [selectedEmailPreview, setSelectedEmailPreview] = useState<any | null>(null);

  // Sync state modifications in real-time
  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      try {
        if (e.key === 'uh_rent_payments_v1' && e.newValue) {
          setRentPayments(JSON.parse(e.newValue));
        }
        if (e.key === 'uh_sent_emails_v1' && e.newValue) {
          setSentEmails(JSON.parse(e.newValue));
        }
        if (e.key === 'uh_email_fail_simulation_active' && e.newValue) {
          setEmailFailureSimulation(e.newValue === 'true');
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleConfirmRentPayment = (paymentId: string) => {
    const updatedPayments = rentPayments.map(p => {
      if (p.id === paymentId) {
        return { 
          ...p, 
          status: 'confirmed', 
          paymentDate: new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }) 
        };
      }
      return p;
    });
    setRentPayments(updatedPayments);
    localStorage.setItem('uh_rent_payments_v1', JSON.stringify(updatedPayments));

    const targetPayment = rentPayments.find(p => p.id === paymentId);
    if (targetPayment) {
      const updatedUnits = landlordUnits.map(unit => {
        if (unit.tenantName === targetPayment.tenantName || unit.id === targetPayment.tenantId) {
          return { ...unit, paymentStatus: 'Paid' as const, rentPaid: targetPayment.amount };
        }
        return unit;
      });
      setLandlordUnits(updatedUnits);
      localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(updatedUnits));
    }

    triggerSuccess('Rent payment receipt cleared and certified successfully. Central ledger updated.');
  };

  // --- ADDITION THREE & EIGHT: SYSTEM HEALTH BANNER & CONNECTIVITY ---
  const [firestoreStatus, setFirestoreStatus] = useState<'Connected' | 'Error'>('Connected');
  const [authStatus, setAuthStatus] = useState<'Active' | 'Issue'>('Active');
  const [paystackStatus, setPaystackStatus] = useState<'Connected' | 'Unreachable'>('Connected');
  const [emailStatus, setEmailStatus] = useState<'Sending' | 'Delayed' | 'Down'>('Sending');
  const [storageStatus, setStorageStatus] = useState<'Available' | 'Error'>('Available');
  const [issueDetectedTimes, setIssueDetectedTimes] = useState<Record<string, string>>({});

  const setHealthStatusWithTimestamp = (service: string, status: string) => {
    const isGreen = status === 'Connected' || status === 'Active' || status === 'Sending' || status === 'Available';
    if (!isGreen) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setIssueDetectedTimes(prev => ({ ...prev, [service]: now }));
    }
  };

  // Simulated Paystack lightweight ping
  const [isPingActive, setIsPingActive] = useState(false);
  const triggerPaystackPing = () => {
    setIsPingActive(true);
    setTimeout(() => {
      setIsPingActive(false);
      triggerSuccess('Lightweight ping to Paystack status endpoint succeeded: Response 200 OK.');
    }, 1200);
  };

  // --- ADDITION ONE: PLATFORM ANNOUNCEMENTS STATE ---
  const [announcements, setAnnouncements] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_platform_announcements');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'ann-1', title: 'End of Quarter Tax Filings Update', body: 'All landlords must upload their updated C of O documents by the end of this month to ensure compliance with Lagos State tax regulations.', urgency: 'Important', expiryDate: '2026-08-31', targetGroup: 'All Landlords Only', status: 'Published', views: 24, dismissals: 2, dateCreated: '2026-07-01' },
      { id: 'ann-2', title: 'System Infrastructure Upgrade Notification', body: 'Unity Homes will undergo standard maintenance on Sunday between 2:00 AM and 4:00 AM. Expect momentary latency on payment gateway callbacks.', urgency: 'Informational', expiryDate: '2026-07-20', targetGroup: 'All Users on Platform', status: 'Published', views: 98, dismissals: 15, dateCreated: '2026-07-12' }
    ];
  });

  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annUrgency, setAnnUrgency] = useState<'Informational' | 'Important' | 'Urgent'>('Informational');
  const [annExpiry, setAnnExpiry] = useState('');
  const [annTarget, setAnnTarget] = useState('All Users on Platform');
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  const saveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annBody) {
      alert('Title and Body are required.');
      return;
    }
    const words = annBody.trim().split(/\s+/).length;
    if (words > 300) {
      alert('Announcement body must be under 300 words.');
      return;
    }

    let updated;
    if (editingAnnId) {
      updated = announcements.map(ann => ann.id === editingAnnId ? { ...ann, title: annTitle, body: annBody, urgency: annUrgency, expiryDate: annExpiry, targetGroup: annTarget } : ann);
      triggerSuccess('Announcement successfully edited and republished!');
    } else {
      const newAnn = {
        id: `ann-${Math.floor(1000 + Math.random() * 9000)}`,
        title: annTitle,
        body: annBody,
        urgency: annUrgency,
        expiryDate: annExpiry || '2026-12-31',
        targetGroup: annTarget,
        status: 'Published',
        views: 0,
        dismissals: 0,
        dateCreated: new Date().toISOString().split('T')[0]
      };
      updated = [newAnn, ...announcements];
      triggerSuccess('New passive announcement published successfully across user dashboards.');
    }
    setAnnouncements(updated);
    localStorage.setItem('uh_platform_announcements', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage')); // sync components
    setAnnTitle('');
    setAnnBody('');
    setAnnUrgency('Informational');
    setAnnExpiry('');
    setAnnTarget('All Users on Platform');
    setEditingAnnId(null);
  };

  const deleteAnnouncement = (id: string) => {
    const updated = announcements.filter(ann => ann.id !== id);
    setAnnouncements(updated);
    localStorage.setItem('uh_platform_announcements', JSON.stringify(updated));
    triggerSuccess('Announcement successfully deleted.');
  };

  const archiveAnnouncement = (id: string) => {
    const updated = announcements.map(ann => ann.id === id ? { ...ann, status: 'Archived' } : ann);
    setAnnouncements(updated);
    localStorage.setItem('uh_platform_announcements', JSON.stringify(updated));
    triggerSuccess('Announcement archived early. It will no longer display on user feeds.');
  };

  // --- ADDITION TWO: BROADCAST CENTER ---
  const [broadcastsHistory, setBroadcastsHistory] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_admin_broadcasts');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'bcast-1', title: 'Emergency Water Tank Cleanup', message: 'Main reservoir system maintenance in progress. Water supply is paused for 2 hours.', segment: 'All Tenants', recipientCount: 1, seenCount: 1, timestamp: '2026-07-13 14:00' },
      { id: 'bcast-2', title: 'Paystack Settlements Complete', message: 'All outstanding weekend remittances have been disbursed successfully to your bank accounts.', segment: 'All Landlords', recipientCount: 5, seenCount: 3, timestamp: '2026-07-14 09:15' }
    ];
  });

  const [bcastTitle, setBcastTitle] = useState('');
  const [bcastMessage, setBcastMessage] = useState('');
  const [bcastTarget, setBcastTarget] = useState('All Landlords');
  const [bcastPropId, setBcastPropId] = useState('');
  const [bcastLandlordId, setBcastLandlordId] = useState('');
  const [bcastUserName, setBcastUserName] = useState('');
  const [bcastUrgency, setBcastUrgency] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [bcastScheduleLater, setBcastScheduleLater] = useState(false);
  const [bcastScheduleTime, setBcastScheduleTime] = useState('');
  const [bcastPreviewRecipient, setBcastPreviewRecipient] = useState<any | null>(null);

  const sendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcastTitle || !bcastMessage) {
      alert('Title and Message are required.');
      return;
    }

    // Determine target users to generate notifications
    let targets: string[] = [];
    let roleType = 'Tenant';
    if (bcastTarget === 'All Landlords') {
      targets = landlords.map(l => l.name);
      roleType = 'Landlord';
    } else if (bcastTarget === 'All Tenants') {
      targets = tenants.map(t => t.name);
      roleType = 'Tenant';
    } else if (bcastTarget === 'All PMCs') {
      targets = pmcs.map(p => p.name);
      roleType = 'PMC';
    } else if (bcastTarget === 'Specific Landlord') {
      const found = landlords.find(l => l.id === bcastLandlordId || l.name === bcastLandlordId);
      if (found) {
        targets = [found.name];
        roleType = 'Landlord';
      }
    } else if (bcastTarget === 'Individually named users') {
      targets = [bcastUserName];
      roleType = 'Tenant'; // Default role assumption for individual name
    } else {
      targets = tenants.map(t => t.name);
      roleType = 'Tenant';
    }

    // Map targets to addressedTo format
    const addressedTo = targets.map(t => {
      let targetId = '';
      if (roleType === 'Landlord') {
        const found = landlords.find(l => l.name === t);
        targetId = found?.id || t;
      } else if (roleType === 'PMC') {
        const found = pmcs.find(p => p.name === t);
        targetId = found?.id || t;
      } else {
        const found = tenants.find(ten => ten.name === t);
        targetId = found?.id || t;
      }
      return { role: roleType, targetId };
    });

    // Create unique broadcast ID
    const bcastId = `bcast-${Math.floor(1000 + Math.random() * 9000)}`;

    // Rule compliance: Dispatches general broadcasts to In-App & Email only! Never WhatsApp or SMS.
    triggerNotificationCloudEvent(
      'broadcast',
      `[${bcastUrgency} Broadcast] ${bcastTitle}: ${bcastMessage}`,
      bcastId,
      addressedTo,
      ['In-App', 'Email']
    );

    // Save broadcast to broadcasts collection / history
    const newBroadcastRecord = {
      id: bcastId,
      title: bcastTitle,
      message: bcastMessage,
      urgency: bcastUrgency,
      segment: bcastTarget === 'Specific Landlord' ? `Landlord: ${bcastLandlordId}` : bcastTarget,
      recipientCount: targets.length || 1,
      seenCount: 0,
      timestamp: new Date().toLocaleString([], { hour12: false }).replace(',', ''),
      isScheduled: bcastScheduleLater,
      scheduleTime: bcastScheduleLater ? bcastScheduleTime : 'Immediate'
    };

    const updated = [newBroadcastRecord, ...broadcastsHistory];
    setBroadcastsHistory(updated);
    localStorage.setItem('uh_admin_broadcasts', JSON.stringify(updated));

    // Append to compliance audit log
    appendAuditLog({
      actionType: 'BROADCAST_SENT',
      recordAffected: bcastTitle,
      recordId: newBroadcastRecord.id,
      newValue: bcastTarget,
      details: `Admin dispatched system broadcast: "${bcastTitle}" (Urgency: ${bcastUrgency}, Scheduled: ${bcastScheduleLater ? bcastScheduleTime : 'Immediate'}) targeting ${targets.length} users via In-App/Email only.`
    });

    triggerSuccess(
      bcastScheduleLater
        ? `Broadcast "${bcastTitle}" successfully scheduled for ${bcastScheduleTime} to ${targets.length} verified In-App/Email feeds!`
        : `Broadcast "${bcastTitle}" sent successfully to ${targets.length} verified In-App/Email feeds!`
    );
    
    setBcastTitle('');
    setBcastMessage('');
    setBcastScheduleLater(false);
    setBcastScheduleTime('');
    setBcastPreviewRecipient(null);
  };

  // --- ADDITION FIVE: COMPLIANCE AUDIT LOG ---
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('uh_activityLog_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'log-1', timestamp: '2026-07-14 08:05', actorName: 'Dami Joshua', actorRole: 'Admin', actionType: 'PROFILE_COMPLETED', recordAffected: 'Chief Emmanuel Adeyinka Profile', recordId: 'L5', previousValue: '75%', newValue: '100%', details: 'Landlord completed profile compliance vetting successfully' },
      { id: 'log-2', timestamp: '2026-07-13 14:30', actorName: 'Adeola Johnson', actorRole: 'Shortlet Manager', actionType: 'RATE_CHANGE', recordAffected: 'Adebayo Lekki Heights Suite A', recordId: 'S1', previousValue: '₦120,000', newValue: '₦150,000', details: 'Shortlet Manager updated nightly rate for Adebayo Lekki Heights' },
      { id: 'log-3', timestamp: '2026-07-12 11:15', actorName: 'Kola Abiodun', actorRole: 'Tenant', actionType: 'SUB_PAYMENT', recordAffected: 'Tenant Subscription - Tenant Verification Token', recordId: 'T1', previousValue: 'Pending', newValue: 'Paid', details: 'Tenant successfully cleared Tenant Verification Token charge via Paystack' },
      { id: 'log-4', timestamp: '2026-07-11 19:00', actorName: 'Prime Property Solutions', actorRole: 'PMC', actionType: 'REMITTANCE_DISPUTE', recordAffected: 'Surulere Flat B Remittance', recordId: 'P1', previousValue: 'Awaiting Settlement', newValue: 'In Dispute', details: 'PMC flagged Surulere Flat B remittance due to discrepancy in service charge calculation' },
      { id: 'log-5', timestamp: '2026-07-10 16:45', actorName: 'Babatunde Osei', actorRole: 'Landlord', actionType: 'CONTRACT_VERIFIED', recordAffected: 'Landlord Agreement - Osei Gbagada Flat A', recordId: 'L2', previousValue: 'Pending', newValue: 'Verified', details: 'Landlord signed and uploaded deed of assignment for Gbagada Flat A' },
      { id: 'log-6', timestamp: '2026-07-09 13:20', actorName: 'Aisha Bello', actorRole: 'Tenant', actionType: 'COMPLAINT_SUBMITTED', recordAffected: 'Complaint Report - Flat 4, Ikeja Studio', recordId: 'c-1', previousValue: 'None', newValue: 'Pending Verification', details: 'Tenant lodged complaint about Water Pump offline issue' }
    ];
  });

  const appendAuditLog = (entry: { actionType: string, recordAffected: string, recordId: string, previousValue?: string, newValue?: string, details: string }) => {
    const newEntry = {
      id: `log-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actorName: 'Dami Joshua',
      actorRole: 'Admin',
      ...entry
    };
    const updated = [newEntry, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('uh_activityLog_v1', JSON.stringify(updated));
  };

  // Audit Log Filter States
  const [auditUser, setAuditUser] = useState('');
  const [auditRole, setAuditRole] = useState('All');
  const [auditAction, setAuditAction] = useState('All');
  const [auditDateStart, setAuditDateStart] = useState('');
  const [auditDateEnd, setAuditDateEnd] = useState('');
  const [auditProperty, setAuditProperty] = useState('');
  const [auditRecordId, setAuditRecordId] = useState('');

  // --- ADDITION SEVEN: SAVED FILTERS ---
  const [savedFilters, setSavedFilters] = useState<Record<string, { name: string, criteria: any }[]>>(() => {
    try {
      const stored = localStorage.getItem('uh_admin_saved_filters_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      Landlords: [
        { name: 'Self Managed Only', criteria: { type: 'Self Managed' } },
        { name: 'Awaiting Remittance', criteria: { outstanding: 50000 } }
      ],
      Tenants: [
        { name: 'Good Payment History', criteria: { paymentHistory: 'Good' } },
        { name: 'Pending Tenant Approvals', criteria: { status: 'Pending' } }
      ],
      'Rent Payments': [
        { name: 'Disputed Payments This Month', criteria: { status: 'Disputed' } }
      ]
    };
  });

  const [activeFilterName, setActiveFilterName] = useState<string | null>(null);
  const [activeFilterCriteria, setActiveFilterCriteria] = useState<any>(null);

  const saveCurrentFilter = (tab: string, name: string, criteria: any) => {
    if (!name.trim()) return;
    const tabFilters = savedFilters[tab] || [];
    const updatedTabFilters = [...tabFilters, { name, criteria }];
    const updated = { ...savedFilters, [tab]: updatedTabFilters };
    setSavedFilters(updated);
    localStorage.setItem('uh_admin_saved_filters_v1', JSON.stringify(updated));
    triggerSuccess(`Successfully saved filter combination: "${name}"`);
  };

  const deleteSavedFilter = (tab: string, name: string) => {
    const tabFilters = savedFilters[tab] || [];
    const updatedTabFilters = tabFilters.filter(f => f.name !== name);
    const updated = { ...savedFilters, [tab]: updatedTabFilters };
    setSavedFilters(updated);
    localStorage.setItem('uh_admin_saved_filters_v1', JSON.stringify(updated));
    if (activeFilterName === name) {
      setActiveFilterName(null);
      setActiveFilterCriteria(null);
    }
  };

  // --- ADDITION FOUR: BULK ACTION SELECTIONS ---
  const [bulkMode, setBulkMode] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Record<string, string[]>>({});
  const [suspensionReason, setSuspensionReason] = useState('');
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [bulkActionTargetTab, setBulkActionTargetTab] = useState('');

  const toggleBulkMode = (tab: string) => {
    setBulkMode(prev => ({ ...prev, [tab]: !prev[tab] }));
    setSelectedIds(prev => ({ ...prev, [tab]: [] }));
  };

  const toggleRowSelected = (tab: string, id: string) => {
    const current = selectedIds[tab] || [];
    const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    setSelectedIds(prev => ({ ...prev, [tab]: updated }));
  };

  const executeBulkSuspend = () => {
    if (!suspensionReason.trim()) {
      alert('Suspension reason is mandatory.');
      return;
    }
    const ids = selectedIds[bulkActionTargetTab] || [];
    if (ids.length === 0) return;

    if (bulkActionTargetTab === 'Landlords') {
      const updated = landlords.map(l => ids.includes(l.id) ? { ...l, status: 'Suspended' } : l);
      persistRecords('uh_admin_landlords_v1', updated, setLandlords);
    } else if (bulkActionTargetTab === 'Tenants') {
      const updated = tenants.map(t => ids.includes(t.id) ? { ...t, status: 'Suspended' } : t);
      persistRecords('uh_admin_tenants_v1', updated, setTenants);
    } else if (bulkActionTargetTab === 'Property Management Companies') {
      const updated = pmcs.map(p => ids.includes(p.id) ? { ...p, status: 'Suspended' } : p);
      persistRecords('uh_admin_pmcs_v1', updated, setPmcs);
    } else if (bulkActionTargetTab === 'Shortlet Management') {
      const updated = shortlets.map(s => ids.includes(s.id) ? { ...s, status: 'Suspended' } : s);
      persistRecords('uh_admin_shortlets_v1', updated, setShortlets);
    }

    // Generate notifications to each suspended user
    try {
      const existingNotifsRaw = localStorage.getItem('uh_notifications_v1') || '[]';
      const existingNotifs = JSON.parse(existingNotifsRaw);
      const newNotifs = ids.map((id, index) => ({
        id: Date.now() + index,
        type: 'alert',
        title: 'Account Temporarily Suspended',
        message: `Your account has been suspended by Admin. Reason: ${suspensionReason}`,
        time: 'Just Now',
        unread: true,
        date: new Date().toISOString()
      }));
      localStorage.setItem('uh_notifications_v1', JSON.stringify([...newNotifs, ...existingNotifs]));
    } catch {}

    appendAuditLog({
      actionType: 'BULK_ACCOUNT_SUSPENSION',
      recordAffected: `${ids.length} Accounts in ${bulkActionTargetTab}`,
      recordId: ids.join(','),
      newValue: 'Suspended',
      details: `Admin bulk suspended accounts. Reason: "${suspensionReason}"`
    });

    triggerSuccess(`Successfully suspended ${ids.length} selected accounts! Audit log appended.`);
    setSelectedIds(prev => ({ ...prev, [bulkActionTargetTab]: [] }));
    setSuspensionReason('');
    setShowSuspensionModal(false);
  };

  const executeBulkArchive = (tab: string) => {
    const ids = selectedIds[tab] || [];
    if (ids.length === 0) return;

    if (tab === 'Landlords') {
      const updated = landlords.map(l => ids.includes(l.id) ? { ...l, status: 'Archived' } : l);
      persistRecords('uh_admin_landlords_v1', updated, setLandlords);
    } else if (tab === 'Tenants') {
      const updated = tenants.map(t => ids.includes(t.id) ? { ...t, status: 'Archived' } : t);
      persistRecords('uh_admin_tenants_v1', updated, setTenants);
    } else if (tab === 'Property Management Companies') {
      const updated = pmcs.map(p => ids.includes(p.id) ? { ...p, status: 'Archived' } : p);
      persistRecords('uh_admin_pmcs_v1', updated, setPmcs);
    } else if (tab === 'Shortlet Management') {
      const updated = shortlets.map(s => ids.includes(s.id) ? { ...s, status: 'Archived' } : s);
      persistRecords('uh_admin_shortlets_v1', updated, setShortlets);
    }

    appendAuditLog({
      actionType: 'BULK_ACCOUNT_ARCHIVE',
      recordAffected: `${ids.length} Accounts in ${tab}`,
      recordId: ids.join(','),
      newValue: 'Archived',
      details: `Admin archived selected accounts to inactive records.`
    });

    triggerSuccess(`Successfully archived ${ids.length} accounts. Active list updated.`);
    setSelectedIds(prev => ({ ...prev, [tab]: [] }));
  };

  const executeBulkApproveTenants = () => {
    const ids = selectedIds['Tenants-Pending'] || [];
    if (ids.length === 0) return;

    const updated = tenantApps.map(app => ids.includes(app.id) ? { ...app, status: 'Approved' as const } : app);
    setTenantApps(updated);
    localStorage.setItem('uh_tenant_registrations', JSON.stringify(updated));

    appendAuditLog({
      actionType: 'BULK_TENANT_APPROVAL',
      recordAffected: `${ids.length} Pending Tenant Onboarding Apps`,
      recordId: ids.join(','),
      newValue: 'Approved',
      details: `Admin bulk approved registrations in one action.`
    });

    triggerSuccess(`Successfully approved all ${ids.length} checked tenant applications!`);
    setSelectedIds(prev => ({ ...prev, ['Tenants-Pending']: [] }));
  };

  const [showBulkBroadcastModal, setShowBulkBroadcastModal] = useState(false);
  const [bulkBcastTitle, setBulkBcastTitle] = useState('');
  const [bulkBcastMsg, setBulkBcastMsg] = useState('');

  const executeBulkBroadcast = () => {
    if (!bulkBcastTitle || !bulkBcastMsg) {
      alert('Title and Message are required.');
      return;
    }
    const ids = selectedIds[bulkActionTargetTab] || [];
    if (ids.length === 0) return;

    // Find names
    let names: string[] = [];
    if (bulkActionTargetTab === 'Landlords') {
      names = landlords.filter(l => ids.includes(l.id)).map(l => l.name);
    } else if (bulkActionTargetTab === 'Tenants') {
      names = tenants.filter(t => ids.includes(t.id)).map(t => t.name);
    } else if (bulkActionTargetTab === 'Property Management Companies') {
      names = pmcs.filter(p => ids.includes(p.id)).map(p => p.name);
    } else if (bulkActionTargetTab === 'Shortlet Management') {
      names = shortlets.filter(s => ids.includes(s.id)).map(s => s.name);
    }

    try {
      const existingNotifsRaw = localStorage.getItem('uh_notifications_v1') || '[]';
      const existingNotifs = JSON.parse(existingNotifsRaw);
      const newNotifs = names.map((name, index) => ({
        id: Date.now() + index,
        type: 'system',
        title: bulkBcastTitle,
        message: bulkBcastMsg,
        time: 'Just Now',
        unread: true,
        date: new Date().toISOString()
      }));
      localStorage.setItem('uh_notifications_v1', JSON.stringify([...newNotifs, ...existingNotifs]));
    } catch {}

    appendAuditLog({
      actionType: 'BULK_BROADCAST_SENT',
      recordAffected: bulkBcastTitle,
      recordId: ids.join(','),
      newValue: `Targeted ${ids.length} selected users`,
      details: `Admin bulk broadcasted notification to ${ids.length} selected accounts.`
    });

    triggerSuccess(`Successfully sent broadcast notification to the ${ids.length} selected users!`);
    setSelectedIds(prev => ({ ...prev, [bulkActionTargetTab]: [] }));
    setBulkBcastTitle('');
    setBulkBcastMsg('');
    setShowBulkBroadcastModal(false);
  };

  // --- ADDITION SIX: BRANDED EXPORT SYSTEM ---
  const [exportModal, setExportModal] = useState<{ isOpen: boolean, tableName: string, data: any[], filtersDescription: string } | null>(null);

  const triggerBrandedExport = (tableName: string, data: any[], filterDesc: string = 'None') => {
    setExportModal({
      isOpen: true,
      tableName,
      data,
      filtersDescription: filterDesc
    });
  };

  const handleDownloadFile = (type: 'CSV' | 'Excel' | 'PDF') => {
    if (!exportModal) return;
    const { tableName, data } = exportModal;
    
    // Generate actual downloadable CSV file
    const headers = Object.keys(data[0] || {});
    const csvContent = "data:text/csv;charset=utf-8," 
      + `Unity Homes and Properties Ltd - Operational Export\n`
      + `Table: ${tableName}\n`
      + `Generated By: Administrator (Dami Joshua)\n`
      + `Date: ${new Date().toLocaleString()}\n`
      + `Filters: ${exportModal.filtersDescription}\n\n`
      + headers.join(",") + "\n"
      + data.map(e => headers.map(h => {
          const val = e[h];
          return typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${String(val).replace(/"/g, '""')}"`;
        }).join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Unity_Homes_${tableName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${type.toLowerCase() === 'csv' ? 'csv' : type.toLowerCase() === 'excel' ? 'xlsx' : 'pdf'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerSuccess(`Successfully downloaded high-fidelity ${type} report for ${tableName}!`);
    setExportModal(null);
  };

  // --- ADDITION TEN: TRANSPARENCY TIMELINE ---
  const [timelineConfig, setTimelineConfig] = useState<{
    isOpen: boolean;
    title: string;
    referenceId: string;
    amount: number;
    steps: any[];
  } | null>(null);

  const openTimelineForRecord = (type: 'payment' | 'remittance' | 'service' | 'damage' | 'quit', record: any) => {
    let title = '';
    let referenceId = '';
    let amount = 0;
    let steps: any[] = [];

    if (type === 'payment') {
      title = `Rent Clearance: Unit ${record.unit} (${record.propertyName || 'Verified Property'})`;
      referenceId = record.id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      amount = record.rentAmount || 450000;
      steps = [
        { label: 'Payment Initialized', description: 'Tenant triggered standard payment protocol via Paystack core API.', timestamp: '2026-07-14 08:00', completed: true, active: false },
        { label: 'Bank Settlement Vetted', description: 'Central bank routing matched deposit to Unity Homes ledger accounts.', timestamp: '2026-07-14 08:02', completed: true, active: false },
        { label: 'Rent Credited', description: 'Internal ledger updated showing 100% rent cleared.', timestamp: '2026-07-14 08:05', completed: true, active: true, operator: 'System Auto-Processor' }
      ];
    } else if (type === 'remittance') {
      title = `Landlord Remittance: ${record.name}`;
      referenceId = `REMIT-${record.id || '29381'}`;
      amount = record.portfolioValue - (record.outstanding || 0);
      steps = [
        { label: 'Rent Collection Cycle Closed', description: 'All active tenants cleared monthly rent cycles.', timestamp: '2026-07-01 23:59', completed: true, active: false },
        { label: 'PMC Management Audit Passed', description: 'Property Management Company authorized final ledger balance sheets.', timestamp: '2026-07-02 10:14', completed: true, active: false },
        { label: 'CBN Direct Remittance Triggered', description: 'Remittance dispatched to landlord local bank account.', timestamp: '2026-07-03 14:00', completed: true, active: true, operator: 'CBN Gateway Operator' }
      ];
    } else if (type === 'service') {
      title = `Service Charge Confirmation: Unit ${record.propertyName}`;
      referenceId = `SC-${record.id || '7721'}`;
      amount = record.amount || 35000;
      steps = [
        { label: 'Utility Bill Apportioned', description: 'Admin calculated real-time diesel generator and facility usage rates.', timestamp: '2026-07-01 09:00', completed: true, active: false },
        { label: 'Notification Dispatched', description: 'SMS and email bills successfully delivered to active units.', timestamp: '2026-07-01 10:00', completed: true, active: false },
        { label: 'Collection Account Cleared', description: 'Funds received and logged in system maintenance wallet.', timestamp: '2026-07-05 12:30', completed: true, active: true, operator: 'Dami Joshua (Admin)' }
      ];
    } else if (type === 'damage') {
      title = `Damage Mitigation Lifecycle: ${record.tenant}`;
      referenceId = record.id || 'DMG-3918';
      amount = record.value || 45000;
      steps = [
        { label: 'Tenant Dispute Logged', description: `Tenant reported defect: "${record.type}" with photos uploaded.`, timestamp: '2026-07-08 10:05', completed: true, active: false },
        { label: 'Onsite Vetting Inspection', description: 'Facility manager verified extent and authorized repair budget.', timestamp: '2026-07-09 11:30', completed: true, active: false },
        { label: 'Funding Resolved', description: 'Repair budget transferred to maintenance team wallet.', timestamp: '2026-07-10 16:00', completed: true, active: true, operator: 'Prime Property Solutions' }
      ];
    } else if (type === 'quit') {
      title = `Disputed Tenancy Quit Notice Review`;
      referenceId = `QUIT-${Math.floor(1000 + Math.random() * 9000)}`;
      amount = 0;
      steps = [
        { label: 'Owner Intent Filed', description: 'Landlord requested unit repossession due to personal occupancy clause.', timestamp: '2026-06-15 14:00', completed: true, active: false },
        { label: 'Admin Legal Review Passed', description: 'Unity Homes legal officers verified that a 6-month statutory notice is active.', timestamp: '2026-06-17 11:00', completed: true, active: false },
        { label: 'Tenancy Quit Notice Delivered', description: 'Bailiff confirmed physical and electronic delivery to unit.', timestamp: '2026-06-20 09:15', completed: true, active: true, operator: 'Court Bailiff Envoy' }
      ];
    }

    setTimelineConfig({
      isOpen: true,
      title,
      referenceId,
      amount,
      steps
    });
  };

  // Caution Deposit Mediation State (Prompt Two)
  const [adminDepositResolutions, setAdminDepositResolutions] = useState<any[]>(() => {
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
        if (stored) setAdminDepositResolutions(JSON.parse(stored));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [adjudicatingRes, setAdjudicatingRes] = useState<any | null>(null);
  const [adminRulingDecision, setAdminRulingDecision] = useState<'Uphold Manager' | 'Full Refund Guest' | 'Custom Split'>('Uphold Manager');
  const [adminCustomRetained, setAdminCustomRetained] = useState<number>(0);
  const [adminRulingJustification, setAdminRulingJustification] = useState<string>('');

  const handleIssueAdminBindingRuling = () => {
    if (!adjudicatingRes) return;
    if (!adminRulingJustification.trim()) {
      alert('Please provide a comprehensive legal/operational justification for this binding ruling.');
      return;
    }

    let finalRetained = adjudicatingRes.amountRetained || 0;
    let finalReturned = adjudicatingRes.amountReturned || 0;

    if (adminRulingDecision === 'Full Refund Guest') {
      finalRetained = 0;
      finalReturned = adjudicatingRes.depositAmount || 0;
    } else if (adminRulingDecision === 'Custom Split') {
      finalRetained = Math.min(adminCustomRetained, adjudicatingRes.depositAmount || 0);
      finalReturned = Math.max(0, (adjudicatingRes.depositAmount || 0) - finalRetained);
    }

    const updated = adminDepositResolutions.map(r => {
      if (r.id === adjudicatingRes.id) {
        return {
          ...r,
          status: 'Ruled by Admin',
          amountRetained: finalRetained,
          amountReturned: finalReturned,
          adminRuling: {
            decision: adminRulingDecision,
            amountRetained: finalRetained,
            amountReturned: finalReturned,
            justification: adminRulingJustification,
            ruledAt: new Date().toISOString(),
            ruledBy: 'Unity Homes Admin Mediation Office'
          }
        };
      }
      return r;
    });

    setAdminDepositResolutions(updated);
    localStorage.setItem('uh_caution_deposit_resolutions_v1', JSON.stringify(updated));

    try {
      const notifsRaw = localStorage.getItem('uh_notifications_v1') || '[]';
      const notifs = JSON.parse(notifsRaw);
      const newNotif1 = {
        id: Date.now(),
        type: 'info',
        title: 'Binding Deposit Mediation Ruling Issued',
        message: `Unity Homes Admin issued a binding mediation ruling for ${adjudicatingRes.propertyName} (${adjudicatingRes.guestName}). Final Retained: ₦${finalRetained.toLocaleString()}, Final Refund: ₦${finalReturned.toLocaleString()}.`,
        time: 'Just Now',
        unread: true,
        date: new Date().toISOString()
      };
      localStorage.setItem('uh_notifications_v1', JSON.stringify([newNotif1, ...notifs]));

      const logsRaw = localStorage.getItem('uh_activityLog_v1') || '[]';
      const logs = JSON.parse(logsRaw);
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actorName: 'Unity Homes Admin',
        actorRole: 'System Administrator',
        actionType: 'CAUTION_DEPOSIT_ADMIN_RULING',
        recordAffected: adjudicatingRes.propertyName,
        details: `Issued binding ruling on caution deposit dispute for Booking #${adjudicatingRes.bookingId}. Justification: "${adminRulingJustification}"`
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLog, ...logs]));

      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    triggerSuccess('Binding caution deposit mediation ruling successfully published. Formal notifications delivered to Landlord and Shortlet Manager.');
    setAdjudicatingRes(null);
    setAdminRulingJustification('');
  };

  const sidebarTabs = [
    'Global Search', 'Overview', 'Support Tickets', 'Contact Support', 'Platform Announcements', 'Broadcast Center', 'Audit Log', 'Portfolio Health', 'Service Charges', 'Collections', 'Landlords', 'Properties', 'Tenants', 'Rent Payments',
    'Professionals', 'Professional Connections', 'Property Management Companies',
    'Company Applications', 'Shortlet Management', 'Caution Deposit Mediation', 'Subscription Inquiries',
    'Subscription Management', 'Promo Codes', 'Partner Network', 'Complaint Reports',
    'Damage Reports', 'Document Vault', 'Birthday Alerts', 'Platform Stats', 'Compliance', 'Transparency Ledger', 'Settings'
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      
      {/* SIDEBAR TABS */}
      <div className="w-full lg:w-72 shrink-0 spatial-glass border border-stone-200/50 rounded-2xl p-4 space-y-2 overflow-y-auto max-h-[90vh]">
        <div className="border-b border-stone-200/50 pb-3 mb-3 text-center">
          <span className="text-[10px] font-mono font-semibold tracking-widest text-[#C9A84C] block uppercase">
            ADMINISTRATOR COMMAND
          </span>
          <h2 className="font-display font-semibold text-xs text-[#18452E]">SYSTEM CONTROLLER</h2>
        </div>
        
        {sidebarTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { 
                setActiveTab(tab); 
                try {
                  window.scrollTo({ top: 320, behavior: 'smooth' }); 
                } catch (e) {
                  console.warn('scrollTo blocked in current environment', e);
                }
              }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                isActive 
                  ? 'bg-[#18452E] text-white font-semibold shadow-md transform translate-x-1' 
                  : 'text-#6B7280 hover:bg-[#18452E]/5 hover:text-[#18452E]'
              }`}
            >
              <span>{tab}</span>
              {isActive && <div className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full"></div>}
            </button>
          );
        })}
      </div>

      {/* DASHBOARD CONTENT PANEL */}
      <div className="flex-1 w-full space-y-6">

        {/* SYSTEM HEALTH BANNER & CONNECTIVITY STATUS CONTROLS */}
        <section className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Health and Live Feeds Status */}
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-emerald-50 rounded-xl">
                <Activity className="w-5 h-5 text-emerald-800 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-display font-semibold text-[#18452E] text-xs uppercase">Core Services Vitals</h4>
                  
                  {/* ADDITION EIGHT: CONNECTIVITY INDICATOR (Ties into Firestore health) */}
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-50/80 border border-stone-200">
                    <span className={`w-2 h-2 rounded-full ${firestoreStatus === 'Error' ? 'bg-rose-600 animate-ping' : 'bg-emerald-600'}`}></span>
                    <span className="text-[9px] font-mono font-semibold text-#6B7280 uppercase">
                      {firestoreStatus === 'Error' ? 'Offline' : 'Online'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-#6B7280 font-normal">Real-time status monitoring of critical integrated service APIs.</p>
              </div>
            </div>

            {/* Right: Five Dot Status Monitors & Quick Support Button */}
            <div className="flex flex-wrap gap-2 items-center">
              <QuickSupportButton 
                currentTab={activeTab}
                onOpenSupportForm={() => setActiveTab('Contact Support')}
              />
              {/* Firestore Indicator */}
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-amber-50/80 border border-stone-150 rounded-lg text-[10px] font-mono">
                <span className={`w-2 h-2 rounded-full ${firestoreStatus === 'Connected' ? 'bg-emerald-600' : 'bg-rose-600 animate-pulse'}`}></span>
                <span className="text-#6B7280">Firestore</span>
              </div>
              {/* Auth Indicator */}
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-amber-50/80 border border-stone-150 rounded-lg text-[10px] font-mono">
                <span className={`w-2 h-2 rounded-full ${authStatus === 'Active' ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}`}></span>
                <span className="text-#6B7280">Auth</span>
              </div>
              {/* Paystack Indicator */}
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-amber-50/80 border border-stone-150 rounded-lg text-[10px] font-mono">
                <span className={`w-2 h-2 rounded-full ${paystackStatus === 'Connected' ? 'bg-emerald-600' : 'bg-rose-600 animate-pulse'}`}></span>
                <span className="text-#6B7280">Paystack</span>
              </div>
              {/* Email Indicator */}
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-amber-50/80 border border-stone-150 rounded-lg text-[10px] font-mono">
                <span className={`w-2 h-2 rounded-full ${emailStatus === 'Sending' ? 'bg-emerald-600' : emailStatus === 'Delayed' ? 'bg-amber-500 animate-pulse' : 'bg-rose-600'}`}></span>
                <span className="text-#6B7280">Email</span>
              </div>
              {/* Storage Indicator */}
              <div className="flex items-center space-x-1.5 px-2 py-1 bg-amber-50/80 border border-stone-150 rounded-lg text-[10px] font-mono">
                <span className={`w-2 h-2 rounded-full ${storageStatus === 'Available' ? 'bg-emerald-600' : 'bg-rose-600 animate-pulse'}`}></span>
                <span className="text-#6B7280">Storage</span>
              </div>
            </div>
          </div>

          {/* ADDITION THREE: EXPANDABLE WARNING BANNER IF ANY UNHEALTHY */}
          {(firestoreStatus === 'Error' || authStatus === 'Issue' || paystackStatus === 'Unreachable' || emailStatus !== 'Sending' || storageStatus === 'Error') ? (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 text-xs animate-fade-in">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="font-semibold text-rose-950 uppercase tracking-wider text-[10px] font-mono">ALERT: Degradation of Core System Subservices</h5>
                  <div className="mt-2 space-y-2 text-[11px] text-rose-900 leading-relaxed font-normal">
                    {firestoreStatus === 'Error' && (
                      <p>
                        &bull; <strong>Firestore Database Outage:</strong> Direct writes are blocked. Local operations will be cached offline. 
                        {issueDetectedTimes.Firestore && <span className="font-mono text-xs ml-1 bg-rose-100 px-1 py-0.5 rounded text-rose-950">Detected: {issueDetectedTimes.Firestore}</span>}
                      </p>
                    )}
                    {authStatus === 'Issue' && (
                      <p>
                        &bull; <strong>Identity Provider Lag:</strong> Standard landlord/tenant logins experiencing transient handshake delays. 
                        {issueDetectedTimes.Auth && <span className="font-mono text-xs ml-1 bg-rose-100 px-1 py-0.5 rounded text-rose-950">Detected: {issueDetectedTimes.Auth}</span>}
                      </p>
                    )}
                    {paystackStatus === 'Unreachable' && (
                      <p>
                        &bull; <strong>Paystack Link Down:</strong> Direct tenant verification checks and subscriptions failing card validations. 
                        {issueDetectedTimes.Paystack && <span className="font-mono text-xs ml-1 bg-rose-100 px-1 py-0.5 rounded text-rose-950">Detected: {issueDetectedTimes.Paystack}</span>}
                      </p>
                    )}
                    {emailStatus !== 'Sending' && (
                      <p>
                        &bull; <strong>Email Dispatch Interrupted ({emailStatus}):</strong> Automated rental billing receipts queued in retry pools. 
                        {issueDetectedTimes.Email && <span className="font-mono text-xs ml-1 bg-rose-100 px-1 py-0.5 rounded text-rose-950">Detected: {issueDetectedTimes.Email}</span>}
                      </p>
                    )}
                    {storageStatus === 'Error' && (
                      <p>
                        &bull; <strong>S3 Document Bucket Read Failure:</strong> Tenancy lease contract downloads might trigger timeouts. 
                        {issueDetectedTimes.Storage && <span className="font-mono text-xs ml-1 bg-rose-100 px-1 py-0.5 rounded text-rose-950">Detected: {issueDetectedTimes.Storage}</span>}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 py-1.5 px-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl text-[10px] font-mono flex justify-between items-center">
              <span>&bull; Status Check: ALL CENTRAL DATA LINKS SECURE</span>
              <span className="font-semibold text-emerald-700">100% DISPATCH OK</span>
            </div>
          )}

          {/* Interactive Simulation Controls Panel */}
          <div className="mt-3 border-t border-stone-200 pt-3">
            <details className="outline-none">
              <summary className="text-[10px] font-semibold text-#6B7280 uppercase cursor-pointer hover:text-#132A1D select-none">
                Interactive Service Testing Controls &bull; Toggle Health Vitals
              </summary>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button 
                  onClick={() => {
                    const next = firestoreStatus === 'Connected' ? 'Error' : 'Connected';
                    setFirestoreStatus(next);
                    setHealthStatusWithTimestamp('Firestore', next);
                  }}
                  className={`py-1 px-2 rounded-lg text-[9px] font-mono font-semibold transition ${
                    firestoreStatus === 'Connected' ? 'bg-[#18452E]/10 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Firestore: {firestoreStatus}
                </button>
                <button 
                  onClick={() => {
                    const next = authStatus === 'Active' ? 'Issue' : 'Active';
                    setAuthStatus(next);
                    setHealthStatusWithTimestamp('Auth', next);
                  }}
                  className={`py-1 px-2 rounded-lg text-[9px] font-mono font-semibold transition ${
                    authStatus === 'Active' ? 'bg-[#18452E]/10 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Auth: {authStatus}
                </button>
                <button 
                  onClick={() => {
                    const next = paystackStatus === 'Connected' ? 'Unreachable' : 'Connected';
                    setPaystackStatus(next);
                    setHealthStatusWithTimestamp('Paystack', next);
                  }}
                  className={`py-1 px-2 rounded-lg text-[9px] font-mono font-semibold transition ${
                    paystackStatus === 'Connected' ? 'bg-[#18452E]/10 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Paystack: {paystackStatus}
                </button>
                <button 
                  onClick={() => {
                    const next = emailStatus === 'Sending' ? 'Delayed' : emailStatus === 'Delayed' ? 'Down' : 'Sending';
                    setEmailStatus(next);
                    setHealthStatusWithTimestamp('Email', next);
                  }}
                  className={`py-1 px-2 rounded-lg text-[9px] font-mono font-semibold transition ${
                    emailStatus === 'Sending' ? 'bg-[#18452E]/10 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Email: {emailStatus}
                </button>
                <button 
                  onClick={() => {
                    const next = storageStatus === 'Available' ? 'Error' : 'Available';
                    setStorageStatus(next);
                    setHealthStatusWithTimestamp('Storage', next);
                  }}
                  className={`py-1 px-2 rounded-lg text-[9px] font-mono font-semibold transition ${
                    storageStatus === 'Available' ? 'bg-[#18452E]/10 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Storage: {storageStatus}
                </button>
              </div>
              <div className="mt-2 text-[9px] text-stone-400 leading-relaxed font-normal flex items-center justify-between">
                <span>Toggle keys to test Firestore offline routing or email latency scenarios.</span>
                <button 
                  type="button" 
                  onClick={triggerPaystackPing}
                  disabled={isPingActive}
                  className="px-2 py-0.5 bg-[#18452E] text-white rounded hover:bg-[#18452E] text-[9px]"
                >
                  {isPingActive ? 'Ping Active...' : 'Send Paystack Gateway Ping'}
                </button>
              </div>
            </details>
          </div>
        </section>
        
        {/* SUCCESS ALERTS WITH GREEN CHECKMARKS */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-3 text-emerald-950 font-sans text-xs animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block">COMMUNITY LOG OPERATION SUCCESSFUL</strong>
              <span>{successMsg}</span>
            </div>
          </div>
        )}

        <AdminLevel2VerificationQueue />

        {/* TAB: SUPPORT TICKETS (ADMIN COMMAND CENTER) */}
        {activeTab === 'Support Tickets' && (
          <div className="space-y-6 animate-fade-in">
            <AdminSupportCenter session={{ role: 'Admin', name: 'Unity Homes Admin', email: 'admin@unityhomes.ng', entityId: 'admin', userId: 'UH-ADMIN-MASTER' }} />
          </div>
        )}

        {/* TAB: CONTACT SUPPORT (SUBMIT / TEST AS ADMIN) */}
        {activeTab === 'Contact Support' && (
          <div className="space-y-6 animate-fade-in">
            <SupportCenter session={{ role: 'Admin', name: 'Unity Homes Admin', email: 'admin@unityhomes.ng', entityId: 'admin', userId: 'UH-ADMIN-MASTER' }} />
          </div>
        )}

        {/* TAB 0: GLOBAL SEARCH */}
        {activeTab === 'Platform Announcements' && (
          <div className="space-y-6 animate-fade-in pb-20 md:pb-8">
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-stone-200 pb-4">
                <div>
                  <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Platform Announcements Manager</h3>
                  <p className="text-xs text-#6B7280 mt-1">Publish role-scoped passive notices that appear on user dashboards.</p>
                </div>
                <button 
                  onClick={() => triggerBrandedExport('Platform Announcements', announcements, 'All Active & Archived')} 
                  className="px-3 py-1.5 bg-amber-50/80 hover:bg-stone-200 text-#132A1D font-semibold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Export Announcements</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Announcement Creation Form */}
                <form onSubmit={saveAnnouncement} className="lg:col-span-1 bg-amber-50/80 border border-stone-200 rounded-2xl p-5 space-y-4">
                  <h4 className="font-display font-semibold text-xs uppercase text-[#18452E] flex items-center space-x-1.5">
                    <PlusCircle className="w-4 h-4" />
                    <span>{editingAnnId ? 'Edit Announcement' : 'New Announcement'}</span>
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-#6B7280 uppercase">Announcement Title</label>
                    <input 
                      type="text" 
                      value={annTitle} 
                      onChange={(e) => setAnnTitle(e.target.value)} 
                      placeholder="e.g. Mandatory Tax filings notice" 
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#18452E]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-#6B7280 uppercase">Target Audience</label>
                      <select 
                        value={annTarget} 
                        onChange={(e) => setAnnTarget(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-sans outline-none"
                      >
                        <option value="All Users on Platform">All Users on Platform</option>
                        <option value="All Landlords Only">All Landlords Only</option>
                        <option value="All Tenants Only">All Tenants Only</option>
                        <option value="All PMCs Only">All PMCs Only</option>
                        <option value="All Shortlet Managers Only">All Shortlet Managers Only</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-#6B7280 uppercase">Urgency Level</label>
                      <select 
                        value={annUrgency} 
                        onChange={(e) => setAnnUrgency(e.target.value as any)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-sans outline-none"
                      >
                        <option value="Informational">Informational</option>
                        <option value="Important">Important</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-#6B7280 uppercase">Expiry Date</label>
                    <input 
                      type="date" 
                      value={annExpiry} 
                      onChange={(e) => setAnnExpiry(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-sans outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-semibold text-#6B7280 uppercase">Announcement Body</label>
                      <span className={`text-[10px] font-mono ${annBody.trim().split(/\s+/).filter(Boolean).length > 300 ? 'text-rose-600 font-semibold' : 'text-stone-400'}`}>
                        {annBody.trim().split(/\s+/).filter(Boolean).length} / 300 words
                      </span>
                    </div>
                    <textarea 
                      value={annBody} 
                      onChange={(e) => setAnnBody(e.target.value)} 
                      placeholder="Type announcement copy here..." 
                      rows={5}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#18452E]"
                      required
                    ></textarea>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button 
                      type="submit" 
                      className="flex-1 py-2 bg-[#18452E] hover:bg-[#18452E] text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition cursor-pointer"
                    >
                      {editingAnnId ? 'Update Notice' : 'Publish Notice'}
                    </button>
                    {editingAnnId && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingAnnId(null);
                          setAnnTitle('');
                          setAnnBody('');
                        }}
                        className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-#132A1D text-xs font-semibold rounded-xl"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Announcement Dashboard List */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-display font-semibold text-xs uppercase text-#6B7280">Live &amp; Active Notices</h4>
                  
                  {announcements.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-stone-200 rounded-2xl text-center text-stone-400">
                      No active announcements.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="p-4 bg-white border border-stone-200 rounded-2xl hover:shadow-xs transition space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full ${
                                  ann.urgency === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                                  ann.urgency === 'Important' ? 'bg-amber-100 text-amber-800' :
                                  'bg-sky-100 text-sky-800'
                                }`}>
                                  {ann.urgency}
                                </span>
                                <span className="text-[10px] font-mono text-stone-400">Target: {ann.targetGroup}</span>
                              </div>
                              <h5 className="font-display font-semibold text-xs text-[#18452E] mt-1">{ann.title}</h5>
                            </div>
                            <span className={`px-2 py-0.5 text-[9px] font-semibold rounded ${
                              ann.status === 'Published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50/80 text-#6B7280'
                            }`}>
                              {ann.status}
                            </span>
                          </div>

                          <p className="text-xs text-#6B7280 leading-relaxed font-normal">{ann.body}</p>

                          <div className="flex justify-between items-center pt-2 border-t border-stone-200 text-[10px] text-stone-400">
                            <span>Expiry: <strong>{ann.expiryDate}</strong> &bull; Created: {ann.dateCreated}</span>
                            <div className="flex items-center space-x-4">
                              <span>Views: <strong>{ann.views}</strong></span>
                              <span>Dismissals: <strong>{ann.dismissals}</strong></span>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2 pt-2">
                            <button 
                              onClick={() => {
                                setEditingAnnId(ann.id);
                                setAnnTitle(ann.title);
                                setAnnBody(ann.body);
                                setAnnUrgency(ann.urgency);
                                setAnnExpiry(ann.expiryDate);
                                setAnnTarget(ann.targetGroup);
                              }}
                              className="px-2.5 py-1 text-[10px] font-semibold text-#132A1D bg-amber-50/80 hover:bg-stone-200 rounded-lg cursor-pointer"
                            >
                              Edit
                            </button>
                            {ann.status === 'Published' && (
                              <button 
                                onClick={() => archiveAnnouncement(ann.id)}
                                className="px-2.5 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer"
                              >
                                Archive Early
                              </button>
                            )}
                            <button 
                              onClick={() => deleteAnnouncement(ann.id)}
                              className="px-2.5 py-1 text-[10px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Broadcast Center' && (
          <div className="space-y-6 animate-fade-in pb-20 md:pb-8">
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-stone-200 pb-4">
                <div>
                  <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Active Broadcast Command</h3>
                  <p className="text-xs text-#6B7280 mt-1">Dispatches persistent, high-priority real-time alerts into selected recipient notification streams.</p>
                </div>
                <button 
                  onClick={() => triggerBrandedExport('Dispatched Broadcasts', broadcastsHistory, 'All History')} 
                  className="px-3 py-1.5 bg-amber-50/80 hover:bg-stone-200 text-#132A1D font-semibold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Export History</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Broadcast Composor */}
                <form onSubmit={(e) => { e.preventDefault(); setBcastPreviewRecipient({ title: bcastTitle, message: bcastMessage, urgency: bcastUrgency, target: bcastTarget, scheduleLater: bcastScheduleLater, scheduleTime: bcastScheduleTime }); }} className="lg:col-span-1 bg-amber-50/80 border border-stone-200 rounded-2xl p-5 space-y-4">
                  <h4 className="font-display font-semibold text-xs uppercase text-[#18452E] flex items-center space-x-1.5">
                    <Send className="w-4 h-4" />
                    <span>Compose Active Broadcast</span>
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-#6B7280 uppercase">Recipient Target Group</label>
                    <select 
                      value={bcastTarget} 
                      onChange={(e) => setBcastTarget(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-sans outline-none font-semibold"
                    >
                      <option value="All Landlords">All Landlords (Passive + Active)</option>
                      <option value="All Tenants">All Tenants (Direct Verification Tenants)</option>
                      <option value="All PMCs">All Corporate PMCs</option>
                      <option value="Specific Landlord">Specific Verified Landlord</option>
                      <option value="Individually named users">Individually Named Platform User</option>
                    </select>
                  </div>

                  {/* Conditional dropdowns based on recipient selector */}
                  {bcastTarget === 'Specific Landlord' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-#6B7280 uppercase">Select Landlord</label>
                      <select 
                        value={bcastLandlordId} 
                        onChange={(e) => setBcastLandlordId(e.target.value)}
                        className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-sans outline-none"
                      >
                        <option value="">-- Choose Landlord --</option>
                        {landlords.map(l => (
                          <option key={l.id} value={l.name}>{l.name} ({l.type})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {bcastTarget === 'Individually named users' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-#6B7280 uppercase">Enter User's Name</label>
                      <input 
                        type="text" 
                        value={bcastUserName} 
                        onChange={(e) => setBcastUserName(e.target.value)}
                        placeholder="e.g. Kola Abiodun" 
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#18452E]"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-#6B7280 uppercase">Urgency Level</label>
                    <select 
                      value={bcastUrgency} 
                      onChange={(e: any) => setBcastUrgency(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-sans outline-none font-semibold text-#132A1D"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent / Critical</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-#6B7280 uppercase">Broadcast Title Header (100 Chars Limit)</label>
                    <input 
                      type="text" 
                      maxLength={100}
                      value={bcastTitle} 
                      onChange={(e) => setBcastTitle(e.target.value)} 
                      placeholder="e.g. Action Required: Settlement portal updates" 
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#18452E] font-semibold"
                      required
                    />
                    <span className="text-[9px] text-stone-400 font-mono block text-right">
                      {100 - bcastTitle.length} characters remaining
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-#6B7280 uppercase">Message Text (500 Chars Limit)</label>
                    <textarea 
                      value={bcastMessage} 
                      onChange={(e) => setBcastMessage(e.target.value)} 
                      maxLength={500}
                      placeholder="Enter urgent dispatch message..." 
                      rows={4}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#18452E] font-mono leading-relaxed"
                      required
                    ></textarea>
                    <span className="text-[9px] text-stone-400 font-mono block text-right">
                      {500 - bcastMessage.length} characters remaining
                    </span>
                  </div>

                  {/* Scheduling Engine */}
                  <div className="p-3 bg-amber-50/80 border border-stone-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-#6B7280 uppercase">Schedule for later</span>
                      <input 
                        type="checkbox"
                        checked={bcastScheduleLater}
                        onChange={(e) => setBcastScheduleLater(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#0E2F1F] cursor-pointer"
                      />
                    </div>
                    {bcastScheduleLater && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-[8px] font-mono font-semibold text-stone-400 uppercase">Target Date &amp; Time</label>
                        <input 
                          type="datetime-local"
                          required
                          value={bcastScheduleTime}
                          onChange={(e) => setBcastScheduleTime(e.target.value)}
                          className="w-full p-1.5 bg-white border border-stone-200 rounded-lg text-[10px] outline-none font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        if (!bcastTitle || !bcastMessage) {
                          alert('Title and Message are required for preview.');
                          return;
                        }
                        setBcastPreviewRecipient({
                          title: bcastTitle,
                          message: bcastMessage,
                          urgency: bcastUrgency,
                          target: bcastTarget,
                          scheduleLater: bcastScheduleLater,
                          scheduleTime: bcastScheduleTime
                        });
                      }}
                      className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-#132A1D text-[10px] font-semibold rounded-lg uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-2 bg-[#18452E] hover:bg-[#18452E] text-white text-[10px] font-semibold rounded-lg uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Dispatch</span>
                    </button>
                  </div>
                </form>

                {/* Broadcast Dispatch History */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-display font-semibold text-xs uppercase text-#6B7280">Dispatch Audit Log</h4>
                  
                  <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                    <table className="w-full text-xs text-left text-#6B7280">
                      <thead className="text-[9px] uppercase font-mono text-stone-400 bg-amber-50/80 border-b border-stone-200">
                        <tr>
                          <th className="p-3">Timestamp</th>
                          <th className="p-3">Broadcast Title</th>
                          <th className="p-3">Audience Segment</th>
                          <th className="p-3 text-center">Delivered</th>
                          <th className="p-3 text-center">Seen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 font-sans">
                        {broadcastsHistory.map((bc) => (
                          <tr key={bc.id} className="hover:bg-amber-50/80/50">
                            <td className="p-3 font-mono text-[10px] text-stone-400 whitespace-nowrap">{bc.timestamp}</td>
                            <td className="p-3">
                              <strong className="block text-[#18452E]">{bc.title}</strong>
                              <span className="text-[10px] font-normal block text-#6B7280 mt-0.5">{bc.message}</span>
                            </td>
                            <td className="p-3">
                              <span className="bg-emerald-55 text-emerald-800 text-[9px] font-semibold px-2 py-0.5 rounded font-mono uppercase">
                                {bc.segment}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-semibold text-#132A1D">{bc.recipientCount}</td>
                            <td className="p-3 text-center">
                              <span className={`font-mono font-semibold text-xs ${bc.seenCount > 0 ? 'text-emerald-600' : 'text-stone-400'}`}>
                                {bc.seenCount}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            {/* PREVIEW MODAL */}
            {bcastPreviewRecipient && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-sm">
                <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full overflow-hidden flex flex-col shadow-sm animate-scale-up border border-stone-200 text-left">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#18452E] text-white">
                    <div className="flex items-center space-x-2">
                      <Megaphone className="w-5 h-5" />
                      <span className="font-display font-semibold uppercase">Admin Broadcast Preview</span>
                    </div>
                    <button onClick={() => setBcastPreviewRecipient(null)} className="p-1 rounded-full hover:bg-white/20 transition-all text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-4 bg-amber-50/80">
                    <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-xs">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-semibold uppercase ${
                          bcastPreviewRecipient.urgency === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                          bcastPreviewRecipient.urgency === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-amber-50/80 text-#6B7280'
                        }`}>
                          Urgency: {bcastPreviewRecipient.urgency}
                        </span>
                        <span className="text-stone-400 font-mono font-semibold uppercase">
                          Target: {bcastPreviewRecipient.target}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-stone-850 text-sm border-b border-stone-200 pb-2">{bcastPreviewRecipient.title || '(No title entered)'}</h4>
                      
                      <p className="text-xs text-#132A1D leading-relaxed font-mono bg-amber-50/80 p-2.5 rounded-xl border border-stone-150">
                        {bcastPreviewRecipient.message || '(No message content entered)'}
                      </p>

                      <div className="flex items-center space-x-1.5 mt-2 text-[9px] font-mono text-stone-400">
                        <span>Routing Channels:</span>
                        <span className="px-1.5 bg-amber-50/80 text-#6B7280 rounded border border-stone-200">In-App</span>
                        <span className="px-1.5 bg-amber-50/80 text-#6B7280 rounded border border-stone-200">Email</span>
                        <span className="text-rose-500 line-through px-1 font-semibold">WhatsApp/SMS Restricted</span>
                      </div>
                    </div>

                    {bcastPreviewRecipient.scheduleLater && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 font-mono flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span><strong>Scheduled Dispatch:</strong> {bcastPreviewRecipient.scheduleTime || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 bg-amber-50/80 border-t border-stone-200 flex justify-end space-x-2">
                    <button
                      onClick={() => setBcastPreviewRecipient(null)}
                      className="px-4 py-2 border border-stone-300 hover:bg-amber-50/80 text-#132A1D font-semibold rounded-xl text-xs uppercase cursor-pointer"
                    >
                      Back to Edit
                    </button>
                    <button
                      onClick={(e) => {
                        setBcastPreviewRecipient(null);
                        sendBroadcast(e);
                      }}
                      className="px-4 py-2 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-xs uppercase cursor-pointer"
                    >
                      Confirm &amp; Launch
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Audit Log' && (
          <div className="space-y-6 animate-fade-in pb-20 md:pb-8">
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-stone-200 pb-4">
                <div>
                  <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Compliance Audit Trail</h3>
                  <p className="text-xs text-#6B7280 mt-1">Unified append-only regulatory register recording all administrative and operational activities.</p>
                </div>
                <button 
                  onClick={() => triggerBrandedExport('Compliance Audit Log', auditLogs, 'Filtered compliance records')} 
                  className="px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-xs flex items-center space-x-1 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Audit Log</span>
                </button>
              </div>

              {/* Advanced Filter Box */}
              <div className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-stone-200/50 pb-2">
                  <span className="font-semibold text-[#18452E] uppercase text-[10px] font-mono">Dynamic Log Filters</span>
                  <button 
                    onClick={() => {
                      setAuditUser('');
                      setAuditRole('All');
                      setAuditAction('All');
                      setAuditDateStart('');
                      setAuditDateEnd('');
                      setAuditProperty('');
                      setAuditRecordId('');
                    }}
                    className="text-[10px] text-#6B7280 hover:text-rose-600 underline"
                  >
                    Reset Filter Params
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-stone-400 uppercase">Actor Name</label>
                    <input 
                      type="text" 
                      value={auditUser} 
                      onChange={(e) => setAuditUser(e.target.value)} 
                      placeholder="e.g. Babatunde" 
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#18452E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-stone-400 uppercase">Actor Role</label>
                    <select 
                      value={auditRole} 
                      onChange={(e) => setAuditRole(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                    >
                      <option value="All">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Landlord">Landlord</option>
                      <option value="Tenant">Tenant</option>
                      <option value="PMC">PMC</option>
                      <option value="Shortlet Manager">Shortlet Manager</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-stone-400 uppercase">Action Type</label>
                    <select 
                      value={auditAction} 
                      onChange={(e) => setAuditAction(e.target.value)}
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                    >
                      <option value="All">All Actions</option>
                      <option value="RATE_CHANGE">Nightly Rate Update</option>
                      <option value="REMITTANCE_DISPUTE">Remittance Dispute</option>
                      <option value="ACCOUNT_SUSPENSION">Account Suspension</option>
                      <option value="PROFILE_COMPLETED">Compliance Verification</option>
                      <option value="SUB_PAYMENT">Paystack Subscription payment</option>
                      <option value="CONTRACT_VERIFIED">Contract Signing</option>
                      <option value="COMPLAINT_SUBMITTED">Complaint Report</option>
                      <option value="BROADCAST_SENT">Broadcast Dispatched</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-stone-400 uppercase">Target Record ID</label>
                    <input 
                      type="text" 
                      value={auditRecordId} 
                      onChange={(e) => setAuditRecordId(e.target.value)} 
                      placeholder="e.g. L5" 
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#18452E]"
                    />
                  </div>
                </div>
              </div>

              {/* Log Table */}
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-xs text-left text-#6B7280">
                  <thead className="text-[9px] uppercase font-mono text-stone-400 bg-amber-50/80 border-b border-stone-200">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Actor (Role)</th>
                      <th className="p-3">Action Type</th>
                      <th className="p-3">Affected Ledger Record</th>
                      <th className="p-3">Previous / New State</th>
                      <th className="p-3">Action Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {auditLogs
                      .filter(log => {
                        if (auditUser && !log.actorName.toLowerCase().includes(auditUser.toLowerCase())) return false;
                        if (auditRole !== 'All' && log.actorRole !== auditRole) return false;
                        if (auditAction !== 'All' && log.actionType !== auditAction) return false;
                        if (auditRecordId && log.recordId !== auditRecordId) return false;
                        return true;
                      })
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-amber-50/80/40 text-xs">
                          <td className="p-3 font-mono text-[10px] text-stone-400 whitespace-nowrap">{log.timestamp}</td>
                          <td className="p-3">
                            <strong className="block text-#132A1D">{log.actorName}</strong>
                            <span className="text-[9px] uppercase font-mono text-stone-400 block">{log.actorRole}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                              log.actionType.includes('SUSPENSION') ? 'bg-rose-100 text-rose-800' :
                              log.actionType.includes('DISPUTE') ? 'bg-amber-100 text-amber-800' :
                              'bg-amber-50/80 text-#132A1D'
                            }`}>
                              {log.actionType}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-1.5">
                              <div>
                                <strong className="block text-#132A1D text-[11px]">{log.recordAffected}</strong>
                                <span className="text-[9px] text-stone-400 font-mono">ID: {log.recordId}</span>
                              </div>
                              {/* Direct action link triggers Transparency Timeline */}
                              <button 
                                onClick={() => openTimelineForRecord('payment', { id: log.recordId, unit: 'Master Block', rentAmount: 2500000 })}
                                className="p-1 hover:bg-amber-50/80 text-teal-800 rounded cursor-pointer"
                                title="View Transparency Timeline Link"
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[10px]">
                            {log.previousValue ? (
                              <div className="space-y-0.5">
                                <span className="text-stone-400 block line-through">{log.previousValue}</span>
                                <span className="text-emerald-700 block font-semibold">{log.newValue}</span>
                              </div>
                            ) : (
                              <span className="text-#132A1D font-semibold">{log.newValue || '-'}</span>
                            )}
                          </td>
                          <td className="p-3 text-[11px] text-#6B7280 font-normal">{log.details}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 0: GLOBAL SEARCH */}
        {activeTab === 'Global Search' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6">
            <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Global Master Search</h3>
            <p className="text-xs text-#6B7280">Search Landlord, Tenant, PMC, Property, Unit, Booking, Document, Phone Number.</p>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter any keyword, name, ID, or phone number..." 
                className="w-full p-4 pl-12 bg-amber-50/80 border border-stone-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-[#18452E] font-mono shadow-inner"
              />
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-[#18452E] text-white text-[10px] font-semibold rounded-xl uppercase tracking-wider hover:bg-[#18452E] transition shadow-md cursor-pointer">
                Scan Platform
              </button>
            </div>
            
            <div className="p-10 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-center text-stone-400">
              <Search className="w-10 h-10 mb-3 text-stone-300" />
              <p className="text-xs font-mono font-semibold uppercase tracking-widest">Awaiting Query</p>
              <p className="text-[10px] mt-2">Enter parameters above to scan the unified database.</p>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'Overview' && (
          <div className="space-y-8 animate-fade-in pb-20 md:pb-8">
            
            {/* TODAY'S SUMMARY CARDS */}
            <section>
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase mb-4 tracking-wider">Today's Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <button onClick={() => triggerSuccess('Total Users view opened')} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#18452E] transition-colors text-left">
                  <span className="text-2xl font-display font-semibold text-[#18452E] mb-1">
                    {mockLandlords.length + mockTenants.length + mockPMCs.length + mockShortlets.length + 15}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-#6B7280 font-semibold">Total Active Users</span>
                </button>
                <button onClick={() => setActiveTab('Landlords')} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#18452E] transition-colors text-left">
                  <span className="text-2xl font-display font-semibold text-[#18452E] mb-1">{mockLandlords.length}</span>
                  <span className="text-[10px] uppercase font-mono text-#6B7280 font-semibold">Active Landlords</span>
                </button>
                <button onClick={() => setActiveTab('PMCs')} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#18452E] transition-colors text-left">
                  <span className="text-2xl font-display font-semibold text-[#18452E] mb-1">{mockPMCs.length}</span>
                  <span className="text-[10px] uppercase font-mono text-#6B7280 font-semibold">Active PMCs</span>
                </button>
                <button onClick={() => setActiveTab('Properties')} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#18452E] transition-colors text-left">
                  <span className="text-2xl font-display font-semibold text-[#18452E] mb-1">{properties.length}</span>
                  <span className="text-[10px] uppercase font-mono text-#6B7280 font-semibold">Properties on Platform</span>
                </button>
                <button onClick={() => setActiveTab('Finance')} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#18452E] transition-colors text-left">
                  <span className="text-lg font-display font-semibold text-[#18452E] mb-1">₦4.2M</span>
                  <span className="text-[10px] uppercase font-mono text-#6B7280 font-semibold">Platform Revenue (Mo)</span>
                </button>
                <button onClick={() => setShowNotifications(true)} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-center shadow-sm cursor-pointer hover:border-[#18452E] transition-colors text-left">
                  <span className="text-2xl font-display font-semibold text-rose-600 mb-1">8</span>
                  <span className="text-[10px] uppercase font-mono text-#6B7280 font-semibold">Open Support Issues</span>
                </button>
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section>
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase mb-4 tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Approve Pending Users', icon: UserCheck },
                  { label: 'Review Quit Notices', icon: AlertTriangle },
                  { label: 'Monitor Payments', icon: DollarSign },
                  { label: 'Generate Reports', icon: FileSpreadsheet },
                  { label: 'View Audit Logs', icon: FileText },
                  { label: 'Manage Subscriptions', icon: Settings },
                  { label: 'Platform Stats', icon: BarChart2 },
                  { label: 'Security Review', icon: ShieldCheck },
                ].map((action, i) => (
                  <button 
                    key={i}
                    onClick={() => triggerSuccess(`${action.label} panel opened.`)}
                    className="flex items-center space-x-3 p-3 bg-white border border-stone-200 hover:border-[#0E2F1F] hover:shadow-md transition-all rounded-xl cursor-pointer text-left group"
                  >
                    <div className="p-2 bg-amber-50/80 rounded-lg group-hover:bg-[#18452E]/10 transition-colors">
                      <action.icon className="w-4 h-4 text-[#18452E]" />
                    </div>
                    <span className="text-xs font-semibold text-#132A1D group-hover:text-[#18452E] leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* PORTFOLIO INSIGHTS */}
              <section className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-sm">
                <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase mb-5 tracking-wider flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Platform Insights
                </h3>
                <ul className="space-y-4">
                  {[
                    `${inquiries.length} new landlord subscription inquiries received this week.`,
                    `Platform occupancy across all managed properties is ${properties.length > 0 ? Math.round(properties.filter(p => p.type !== 'New Listing').length / properties.length * 100) : 0} percent.`,
                    `${damageReports.length} damage reports are pending admin review.`,
                    `${tenantApps.filter(t => t.status === 'Pending').length} tenant applications are awaiting review.`,
                    `${pmcApps.filter(p => p.status === 'Pending').length} PMC applications are awaiting approval.`
                  ].map((insight, i) => (
                    <li key={i} className="flex items-start space-x-3 text-xs text-#6B7280 hover:bg-amber-50/80 p-2 -mx-2 rounded-lg cursor-pointer transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* PRIORITY ALERTS */}
              <section className="bg-white border border-rose-200 rounded-[var(--radius-large)] p-6 shadow-sm">
                <h3 className="font-display font-semibold text-rose-700 text-sm uppercase mb-5 tracking-wider flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Priority Alerts
                </h3>
                <div className="space-y-3">
                  { [
                    { text: `${damageReports.length} pending damage reports awaiting review before release.`, tab: 'Properties' },
                    { text: `${inquiries.filter(i => i.status === 'Pending').length} pending property inquiries from landlords.`, tab: 'Properties' },
                    { text: `1 pending bank account change requests with hours remaining on 48-hour hold.`, tab: 'Finance' },
                    { text: `3 overdue subscription payments.`, tab: 'Finance' },
                    { text: `${tenantApps.filter(t => t.status === 'Pending').length} pending tenant registration approvals.`, tab: 'Tenants' },
                    { text: `${pmcApps.filter(p => p.status === 'Pending').length} pending PMC applications awaiting admin review.`, tab: 'PMCs' }
                  ].map((alert, i) => (
                    <div key={i} onClick={() => setActiveTab(alert.tab)} className="flex items-start space-x-3 p-3 bg-rose-50 border border-rose-100 rounded-xl cursor-pointer hover:bg-rose-100 transition-colors">
                      <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                      <span className="text-xs font-semibold text-rose-900 leading-snug">{alert.text}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TAB 4: TENANTS */}
                {activeTab === 'Landlords' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6 animate-fade-in">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-stone-200 pb-4 gap-4">
              <div>
                <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Landlord Management</h3>
                <p className="text-xs text-#6B7280 mt-0.5">Manage all landlords, their portfolios, and nested tenant lists.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => toggleBulkMode('Landlords')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer ${
                    bulkMode['Landlords'] ? 'bg-rose-600 text-white' : 'bg-amber-50/80 hover:bg-stone-200 text-#132A1D'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{bulkMode['Landlords'] ? 'Disable Bulk Select' : 'Enable Bulk Select'}</span>
                </button>
                <button 
                  onClick={() => triggerBrandedExport('Landlords List', landlords, activeFilterName ? `Filter: ${activeFilterName}` : 'All Active')}
                  className="px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-xs flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* ADDITION SEVEN: SAVED FILTERS PILLS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-stone-400 uppercase tracking-wider">
                <span>Quick Saved Filters</span>
                <button 
                  onClick={() => {
                    const name = prompt('Enter a name for this custom filter combination:');
                    if (name) saveCurrentFilter('Landlords', name, { type: 'Self Managed' });
                  }}
                  className="text-#6B7280 hover:text-emerald-700 underline"
                >
                  + Save Current View
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-3">
                {(savedFilters['Landlords'] || []).map((sf, idx) => {
                  const isActive = activeFilterName === sf.name;
                  return (
                    <div key={idx} className="flex items-center space-x-1">
                      <button 
                        onClick={() => {
                          if (isActive) {
                            setActiveFilterName(null);
                            setActiveFilterCriteria(null);
                          } else {
                            setActiveFilterName(sf.name);
                            setActiveFilterCriteria(sf.criteria);
                            triggerSuccess(`Applied saved filter: "${sf.name}"`);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer border ${
                          isActive 
                            ? 'bg-[#18452E] text-white border-[#0E2F1F]' 
                            : 'bg-amber-50/80 hover:bg-amber-50/80 text-#6B7280 border-stone-200'
                        }`}
                      >
                        {sf.name}
                      </button>
                      <button 
                        onClick={() => deleteSavedFilter('Landlords', sf.name)}
                        className="text-stone-400 hover:text-rose-600 text-xs px-1"
                        title="Delete filter"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              {Array.from(new Set(landlordUnits.map(u => getLandlordName(u.propertyName)))).map(landlordName => {
                const unitsInLandlord = landlordUnits.filter(u => getLandlordName(u.propertyName) === landlordName);
                const expectedRent = unitsInLandlord.reduce((sum, u) => sum + u.rentAmount, 0);
                const collectedRent = unitsInLandlord.filter(u => u.paymentStatus === 'Paid').reduce((sum, u) => sum + u.rentAmount, 0);
                const managementFee = collectedRent * 0.1; // Simulated 10% fee
                
                // Admin dashboard might not have 'bookings' easily available or it might. Let's just use a simple calculated field for actualRemitted.
                const hasActiveTenants = unitsInLandlord.some(u => u.paymentStatus !== 'Vacant');
                const isExpanded = expandedLandlords.includes(landlordName);
                const actualRemitted = collectedRent * 0.9;
                const awaitingRemittance = 0;
                const isFullyAccounted = true;

                const isSelected = (selectedIds['Landlords'] || []).includes(landlordName);
                return (
                  <div key={landlordName} className={`bg-white border rounded-2xl shadow-xs overflow-hidden transition-all duration-200 ${
                    isSelected ? 'border-[#0E2F1F] bg-emerald-50/10' : 'border-stone-200'
                  }`}>
                    <div className="flex items-center pl-4 bg-amber-50/80/30">
                      {bulkMode['Landlords'] && (
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleRowSelected('Landlords', landlordName);
                          }}
                          className="w-4 h-4 text-[#18452E] border-stone-300 rounded focus:ring-[#18452E] mr-1 cursor-pointer"
                        />
                      )}
                      <div 
                        onClick={() => toggleLandlordExpand(landlordName)}
                        className="flex-1 p-5 flex justify-between items-center cursor-pointer hover:bg-amber-50/80/70 transition-colors"
                      >
                        <div className="flex-1">
                        <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                          <div>
                            <h4 className="font-display font-semibold text-[#18452E] text-sm uppercase">{landlordName}</h4>
                            <span className="text-[10px] text-stone-400 font-mono">
                              Properties: {Array.from(new Set(unitsInLandlord.map(u => u.propertyName))).length} &bull; Units: {unitsInLandlord.length}
                            </span>
                          </div>
                          <div className="text-right flex items-center space-x-3 bg-amber-50/80 p-2 rounded-lg border border-stone-200">
                             <div className="text-right">
                               <span className="block text-[9px] uppercase font-semibold text-stone-400">Awaiting Remittance</span>
                               <span className="block font-mono font-semibold text-#132A1D">₦{awaitingRemittance.toLocaleString()}</span>                             </div>
                             {awaitingRemittance > 0 ? (
                               <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-semibold uppercase rounded tracking-wider shadow-sm border border-red-200">
                                 Action Required
                               </span>
                             ) : (
                               <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-semibold uppercase rounded tracking-wider shadow-sm border border-emerald-200">
                                 Nothing Outstanding
                               </span>
                             )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                          <div className="bg-amber-50/80 p-3 rounded-xl border border-stone-200">
                            <span className="block text-[9px] uppercase font-semibold text-#6B7280 mb-1">Portfolio Value</span>
                            <span className="block font-mono font-semibold text-#132A1D text-xs">₦{expectedRent.toLocaleString()}</span>
                          </div>
                          <div className="bg-amber-50/80 p-3 rounded-xl border border-stone-200">
                            <span className="block text-[9px] uppercase font-semibold text-#6B7280 mb-1">Collected Rent</span>
                            <span className="block font-mono font-semibold text-#132A1D text-xs">₦{collectedRent.toLocaleString()}</span>
                          </div>
                          <div className="bg-amber-50/80 p-3 rounded-xl border border-stone-200">
                            <span className="block text-[9px] uppercase font-semibold text-#6B7280 mb-1">Remitted Rent</span>
                            <span className="block font-mono font-semibold text-#132A1D text-xs">₦{actualRemitted.toLocaleString()}</span>
                          </div>
                          <div className="bg-amber-50/80 p-3 rounded-xl border border-stone-200">
                            <span className="block text-[9px] uppercase font-semibold text-#6B7280 mb-1">Management Fee</span>
                            <span className="block font-mono font-semibold text-#132A1D text-xs">₦{managementFee.toLocaleString()}</span>
                          </div>
                          <div className="bg-amber-50/80 p-3 rounded-xl border border-stone-200 flex flex-col justify-center items-start">
                            <span className="block text-[9px] uppercase font-semibold text-#6B7280 mb-1">Status</span>
                            {collectedRent === 0 ? (
                              <span className="text-[10px] bg-amber-50/80 text-#6B7280 px-2 py-0.5 rounded font-semibold uppercase border border-stone-200">No Payments Recorded</span>
                            ) : isFullyAccounted ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold uppercase border border-emerald-200">Fully Accounted</span>
                            ) : (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold uppercase border border-amber-200">Discrepancy</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 flex items-center justify-center">
                        <ChevronDown className={`w-6 h-6 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                    
                    {isExpanded && (
                      <div className="border-t border-stone-200 bg-amber-50/80/50 p-5 space-y-3">
                        {!hasActiveTenants ? (
                          <div className="text-center py-6">
                            <span className="text-stone-400 font-mono text-sm">No active tenancies for this landlord. All units may be vacant.</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <h5 className="text-[10px] uppercase font-semibold text-#6B7280 mb-2">Tenant Roster</h5>
                            {unitsInLandlord.filter(u => u.paymentStatus !== 'Vacant').map(u => (
                              <div 
                                key={u.id}
                                className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center space-x-3">
                                  <img 
    src={`${getTenantPhoto(u.tenantName)}`} 
    alt={u.tenantName} 
    className="w-10 h-10 rounded-full object-cover border border-stone-200"
  />
                                  <div>
                                    <strong className="block text-[#18452E] font-semibold text-sm">{u.tenantName}</strong>
                                    <span className="block text-#6B7280 text-[10px] mt-0.5">{u.propertyName} ({u.unitNumber})</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  {u.paymentStatus === 'Paid' ? (
                                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-semibold uppercase">Paid</span>
                                  ) : u.paymentStatus === 'Due Soon' ? (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-semibold uppercase">Due Soon</span>
                                  ) : u.paymentStatus === 'Overdue' ? (
                                    <div className="text-right">
                                      <span className="text-[10px] bg-red-100 text-red-800 px-2 py-1 rounded font-semibold uppercase block mb-1">Overdue</span>
                                      <span className="text-xs font-mono font-semibold text-red-700 block">₦{u.rentAmount.toLocaleString()}</span>
                                    </div>
                                  ) : u.paymentStatus === 'Lease Expiring Soon' ? (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded font-semibold uppercase">Expiring</span>
                                  ) : (
                                    <span className="text-[10px] bg-amber-50/80 text-#132A1D px-2 py-1 rounded font-semibold uppercase">{u.paymentStatus}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* STICKY FLOATING BULK ACTIONS BAR */}
            {bulkMode['Landlords'] && (selectedIds['Landlords'] || []).length > 0 && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-#132A1D border border-#132A1D text-white px-6 py-4 rounded-2xl shadow-sm flex items-center space-x-6 z-50 animate-bounce-short">
                <div className="flex items-center space-x-2 border-r border-#132A1D pr-6">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-xs font-mono font-semibold text-stone-300 uppercase">
                    {(selectedIds['Landlords'] || []).length} Checked
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setBulkActionTargetTab('Landlords');
                      setShowBulkBroadcastModal(true);
                    }}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-stone-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Send Broadcast
                  </button>
                  <button 
                    onClick={() => triggerBrandedExport('Bulk Selected Landlords', landlords.filter(l => (selectedIds['Landlords'] || []).includes(l.name)))}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-stone-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Export
                  </button>
                  <button 
                    onClick={() => {
                      setBulkActionTargetTab('Landlords');
                      setShowSuspensionModal(true);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Suspend
                  </button>
                  <button 
                    onClick={() => executeBulkArchive('Landlords')}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-[#C9A84C] text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Archive
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedIds(prev => ({ ...prev, Landlords: [] }))}
                  className="text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
{activeTab === 'Tenants' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6 animate-fade-in">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-stone-200 pb-4 gap-4">
              <div>
                <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Active Tenancies Verified</h3>
                <p className="text-xs text-#6B7280 mt-0.5">Current tenants registered under zero-trust direct-routing logs.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => toggleBulkMode('Tenants')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer ${
                    bulkMode['Tenants'] ? 'bg-rose-600 text-white' : 'bg-amber-50/80 hover:bg-stone-200 text-#132A1D'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{bulkMode['Tenants'] ? 'Disable Bulk Select' : 'Enable Bulk Select'}</span>
                </button>
                <button 
                  onClick={() => triggerBrandedExport('Active Tenants List', mockTenants, activeFilterName ? `Filter: ${activeFilterName}` : 'All Verified')}
                  className="px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-xs flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* ADDITION SEVEN: SAVED FILTERS PILLS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-stone-400 uppercase tracking-wider">
                <span>Quick Saved Filters</span>
                <button 
                  onClick={() => {
                    const name = prompt('Enter a name for this custom filter combination:');
                    if (name) saveCurrentFilter('Tenants', name, { type: 'Active' });
                  }}
                  className="text-#6B7280 hover:text-emerald-700 underline"
                >
                  + Save Current View
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-3">
                {(savedFilters['Tenants'] || []).map((sf, idx) => {
                  const isActive = activeFilterName === sf.name;
                  return (
                    <div key={idx} className="flex items-center space-x-1">
                      <button 
                        onClick={() => {
                          if (isActive) {
                            setActiveFilterName(null);
                            setActiveFilterCriteria(null);
                          } else {
                            setActiveFilterName(sf.name);
                            setActiveFilterCriteria(sf.criteria);
                            triggerSuccess(`Applied saved filter: "${sf.name}"`);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer border ${
                          isActive 
                            ? 'bg-[#18452E] text-white border-[#0E2F1F]' 
                            : 'bg-amber-50/80 hover:bg-amber-50/80 text-#6B7280 border-stone-200'
                        }`}
                      >
                        {sf.name}
                      </button>
                      <button 
                        onClick={() => deleteSavedFilter('Tenants', sf.name)}
                        className="text-stone-400 hover:text-rose-600 text-xs px-1"
                        title="Delete filter"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tenant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockTenants.map((tenant) => {
                const isSelected = (selectedIds['Tenants'] || []).includes(tenant.id);
                
                // Saved Filter checks
                if (activeFilterName === 'Overdue Rent Only' && tenant.paymentHistory.includes('Perfect')) return null;

                return (
                  <div 
                    key={tenant.id} 
                    className={`p-5 border rounded-2xl transition duration-200 flex flex-col justify-between ${
                      isSelected 
                        ? 'border-[#0E2F1F] bg-emerald-50/10' 
                        : 'bg-amber-50/80 border-stone-200 hover:border-[#0E2F1F] cursor-pointer'
                    }`}
                    onClick={() => {
                      if (bulkMode['Tenants']) {
                        toggleRowSelected('Tenants', tenant.id);
                      } else {
                        setSelectedTenantModal(tenant);
                      }
                    }}
                  >
                    <div>
                      <div className="flex items-start justify-between border-b border-stone-200 pb-4 mb-4">
                        <div className="flex items-center space-x-4">
                          {bulkMode['Tenants'] && (
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleRowSelected('Tenants', tenant.id);
                              }}
                              className="w-4 h-4 text-[#18452E] border-stone-300 rounded focus:ring-[#18452E] cursor-pointer mr-1"
                            />
                          )}
                          <img src={tenant.photo} alt={tenant.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                          <div>
                            <span className="block font-semibold text-[#18452E] text-sm uppercase">{tenant.name}</span>
                            <span className="block text-[10px] text-#6B7280 font-mono mt-0.5">{tenant.occupation} at {tenant.employer}</span>
                            <span className="block text-[10px] text-#6B7280 font-mono">{tenant.phone} | {tenant.email}</span>
                          </div>
                        </div>
                        
                        {/* Detail Modal button */}
                        {!bulkMode['Tenants'] && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTenantModal(tenant);
                            }}
                            className="text-stone-400 hover:text-[#18452E] text-xs font-mono font-semibold"
                          >
                            Review &bull; View Profile
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Property</span>
                          <strong className="font-mono text-#132A1D text-[10px]">{tenant.property} ({tenant.unit})</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Rent Amount</span>
                          <strong className="font-mono text-#132A1D">₦{tenant.rentAmount.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Lease End</span>
                          <strong className="font-mono text-#132A1D">{tenant.leaseEnd}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Payment History</span>
                          <strong className="font-mono text-emerald-600">{tenant.paymentHistory}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200/50 flex justify-between items-center">
                      <span className="text-[9px] text-stone-400 font-mono">Transparency Records</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openTimelineForRecord('payment', { name: tenant.name, id: tenant.id, property: tenant.property });
                        }}
                        className="px-2 py-1 bg-stone-150 hover:bg-stone-200 text-[#18452E] font-mono text-[9px] rounded-lg transition flex items-center space-x-1"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STICKY FLOATING BULK ACTIONS BAR */}
            {bulkMode['Tenants'] && (selectedIds['Tenants'] || []).length > 0 && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-#132A1D border border-#132A1D text-white px-6 py-4 rounded-2xl shadow-sm flex items-center space-x-6 z-50 animate-bounce-short">
                <div className="flex items-center space-x-2 border-r border-#132A1D pr-6">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-xs font-mono font-semibold text-stone-300 uppercase">
                    {(selectedIds['Tenants'] || []).length} Checked
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setBulkActionTargetTab('Tenants');
                      setShowBulkBroadcastModal(true);
                    }}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-stone-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Send Broadcast
                  </button>
                  <button 
                    onClick={() => triggerBrandedExport('Bulk Selected Tenants', mockTenants.filter(t => (selectedIds['Tenants'] || []).includes(t.id)))}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-stone-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Export
                  </button>
                  <button 
                    onClick={() => {
                      setBulkActionTargetTab('Tenants');
                      setShowSuspensionModal(true);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Suspend
                  </button>
                  <button 
                    onClick={() => executeBulkArchive('Tenants')}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-[#C9A84C] text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Archive
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedIds(prev => ({ ...prev, Tenants: [] }))}
                  className="text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: RENT PAYMENTS */}
        {activeTab === 'Rent Payments' && (
          <div className="space-y-6 animate-fade-in">
            {/* 1. SMTP GATEWAY & FLOW SIMULATION */}
            <div className=" border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h4 className="font-display font-semibold text-[#18452E] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                    <Mail className="w-4 h-4 text-[#C9A84C]" />
                    <span>Payment Receipt Email Simulator</span>
                  </h4>
                  <p className="text-[10px] text-#6B7280 mt-0.5">Configure emulated Cloud Function SMTP gateway failure or successful delivery states.</p>
                </div>
                
                {/* Failure Toggle switch */}
                <div className="flex items-center space-x-2.5">
                  <span className="text-[10px] font-mono font-semibold text-#6B7280 uppercase tracking-wider">
                    {emailFailureSimulation ? "SMTP Failure Active" : "SMTP Success Active"}
                  </span>
                  <button
                    onClick={() => {
                      const newState = !emailFailureSimulation;
                      setEmailFailureSimulation(newState);
                      localStorage.setItem('uh_email_fail_simulation_active', newState ? 'true' : 'false');
                      triggerSuccess(newState ? 'SMTP Failure Simulation Activated.' : 'SMTP Successful Dispatch Restored.');
                    }}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      emailFailureSimulation ? 'bg-rose-500' : 'bg-emerald-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        emailFailureSimulation ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Informational Alerts */}
              {emailFailureSimulation ? (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl flex items-start space-x-2 text-[11px] text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Gateway Obstruction Triggered:</span> All receipt dispatch attempts will fail to connect with the remote SMTP server. An immediate high-priority Admin Notification alert will flag on the dashboard to warn staff of customer invoice communication outages.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/50 border border-emerald-150 rounded-xl flex items-start space-x-2 text-[11px] text-[#18452E]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Gateway Healthy:</span> Confirmation will generate a branded email, trigger automatic PDF Transparency Certificate generation, upload to the Document Vault, and append an immutable transaction log entry to the platform.
                  </div>
                </div>
              )}
            </div>

            {/* 2. PENDING CLEARANCE QUEUE */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4">
              <div>
                <h4 className="font-display font-semibold text-[#18452E] text-xs uppercase tracking-wider">
                  Pending Receipt Verification Queue
                </h4>
                <p className="text-[10px] text-#6B7280 mt-0.5">Incoming payments awaiting admin verification before ledger certification.</p>
              </div>

              {rentPayments.filter(p => p.status === 'pending_confirmation').length === 0 ? (
                <div className="p-6 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 font-medium">
                  No rent payments currently pending clearance in the confirmation pipeline.
                </div>
              ) : (
                <div className="space-y-3">
                  {rentPayments.filter(p => p.status === 'pending_confirmation').map((p) => (
                    <div key={p.id} className="p-4 bg-amber-50/40 border border-amber-150 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-#132A1D">{p.tenantName}</span>
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase">
                            Awaiting Audit
                          </span>
                        </div>
                        <p className="text-#6B7280 text-[11px]">
                          Property: <span className="font-semibold text-#6B7280">{p.propertyName}</span> &bull; Unit: <span className="font-semibold text-#6B7280">{p.unitNumber}</span>
                        </p>
                        <p className="text-stone-400 text-[10px]">
                          Target Clearance Bank: <span className="font-mono">{p.receivingBankName} ({p.receivingAccountNumber})</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                        <div className="text-right">
                          <span className="block font-mono font-semibold text-[#18452E] text-sm">
                            ₦{p.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">Ref: {p.ref}</span>
                        </div>

                        <button
                          onClick={() => handleConfirmRentPayment(p.id)}
                          className="px-4 py-2 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-xs flex items-center space-x-1 cursor-pointer transition shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Clear & Certified</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. ORIGINAL RENT SETTLEMENTS LIST CARD */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-stone-150 pb-3 gap-4">
                <div>
                  <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Ledger Rental Payments</h3>
                  {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
                  <p className="text-xs text-#6B7280 mt-0.5">Real-time ledger entries of verified rent confirmations.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text"
                    placeholder="Search tenant, property or bank reference..."
                    value={adminPaymentSearch}
                    onChange={(e) => setAdminPaymentSearch(e.target.value)}
                    className="px-3 py-1.5 bg-amber-50/80 border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-600 font-mono w-64"
                  />
                  <button 
                    onClick={() => triggerBrandedExport('Rent Payments Ledger', landlordUnits.filter(u => u.paymentStatus === 'Paid'), activeFilterName ? `Filter: ${activeFilterName}` : 'All Confirmations')}
                    className="px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Ledger</span>
                  </button>
                </div>
              </div>

              {/* ADDITION SEVEN: SAVED FILTERS PILLS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-stone-400 uppercase tracking-wider">
                  <span>Quick Saved Filters</span>
                  <button 
                    onClick={() => {
                      const name = prompt('Enter a name for this custom filter combination:');
                      if (name) saveCurrentFilter('Rent Payments', name, { type: 'Paid' });
                    }}
                    className="text-#6B7280 hover:text-emerald-700 underline text-[9px]"
                  >
                    + Save Current View
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(savedFilters['Rent Payments'] || []).map((sf, idx) => {
                    const isActive = activeFilterName === sf.name;
                    return (
                      <div key={idx} className="flex items-center space-x-1">
                        <button 
                          onClick={() => {
                            if (isActive) {
                              setActiveFilterName(null);
                              setActiveFilterCriteria(null);
                            } else {
                              setActiveFilterName(sf.name);
                              setActiveFilterCriteria(sf.criteria);
                              triggerSuccess(`Applied saved filter: "${sf.name}"`);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer border ${
                            isActive 
                              ? 'bg-[#18452E] text-white border-[#0E2F1F]' 
                              : 'bg-amber-50/80 hover:bg-amber-50/80 text-#6B7280 border-stone-200'
                          }`}
                        >
                          {sf.name}
                        </button>
                        <button 
                          onClick={() => deleteSavedFilter('Rent Payments', sf.name)}
                          className="text-stone-400 hover:text-rose-600 text-xs px-1"
                          title="Delete filter"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="space-y-3">
                {landlordUnits.filter(u => u.paymentStatus === 'Paid').map((u) => {
                  // If filter matches
                  if (activeFilterName === 'Disputed Payments This Month' && u.tenantName !== 'Fatima Usman') return null;

                  if (adminPaymentSearch) {
                    const q = adminPaymentSearch.toLowerCase();
                    const matchTenant = u.tenantName?.toLowerCase().includes(q);
                    const matchProp = u.propertyName?.toLowerCase().includes(q);
                    const matchRef = ((u as any).transfer_reference && (u as any).transfer_reference.toLowerCase().includes(q)) || ((u as any).bankReference && (u as any).bankReference.toLowerCase().includes(q));
                    if (!matchTenant && !matchProp && !matchRef) return null;
                  }

                  return (
                    <div key={u.id} className="p-4 bg-emerald-50/50 border border-emerald-150 rounded-xl flex items-center justify-between text-xs hover:shadow-xs transition duration-150">
                      <div>
                        <span className="font-semibold text-[#18452E]">{u.tenantName} - {u.propertyName}</span>
                        <span className="block text-[10px] text-stone-400 mt-0.5">{getCollectionAccountTextForAdmin(u.propertyName)}</span>
                        {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
                        <span className="block text-[9px] font-mono font-semibold text-[#C9A84C] mt-1">Rent Period &bull; Q3 2026 Confirmation</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="block font-mono font-semibold text-[#18452E] text-sm">₦{u.rentAmount.toLocaleString()}</span>
                          {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
                          <span className="text-[9px] font-mono text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5 inline-block uppercase font-semibold mt-1">Verified Payment</span>
                        </div>
                        
                        {/* ADDITION TEN: TRANSPARENCY TIMELINE FOR PAYMENT RECORD */}
                        <button 
                          onClick={() => openTimelineForRecord('payment', { name: u.tenantName, amount: u.rentAmount, property: u.propertyName, period: 'Q3 2026' })}
                          className="p-1.5 bg-amber-50/80 hover:bg-[#18452E]/10 text-[#18452E] rounded-lg transition"
                          title="View Transparency Timeline"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. AUTOMATED EMAIL DISPATCH LOGS */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4">
              <div>
                <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Automated Receipt Email Logs (SMTP Dispatch)</h3>
                <p className="text-xs text-#6B7280 mt-0.5">A complete, scannable history of automated payment receipt emails generated by the server side Cloud Function.</p>
              </div>

              {sentEmails.length === 0 ? (
                <div className="p-6 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400 font-medium">
                  No automated email records found in the SMTP gateway log.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 font-mono font-semibold uppercase text-[9px] tracking-wider">
                        <th className="pb-2">Recipient</th>
                        <th className="pb-2">Subject Header</th>
                        <th className="pb-2">Dispatch Timestamp</th>
                        <th className="pb-2 text-center">Status</th>
                        <th className="pb-2 text-right">Receipt Attachment</th>
                        <th className="pb-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-#132A1D">
                      {sentEmails.map((email) => (
                        <tr key={email.id} className="hover:bg-amber-50/80/50">
                          <td className="py-2.5 font-mono text-[11px]">{email.recipientEmail}</td>
                          <td className="py-2.5 max-w-xs truncate">{email.subject}</td>
                          <td className="py-2.5 font-mono text-[10px] text-#6B7280">
                            {new Date(email.sentAt).toLocaleString()}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-[9px] uppercase ${
                              email.status === 'delivered' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {email.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-mono text-[10px] text-[#C9A84C] font-semibold">
                            {email.attachments?.[0]?.fileName || 'None'}
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => setSelectedEmailPreview(email)}
                              className="px-2.5 py-1 bg-amber-50/80 hover:bg-[#18452E]/10 text-[#18452E] font-semibold rounded-lg text-[10px] cursor-pointer transition"
                            >
                              Inspect Email
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: PROFESSIONALS */}
        {activeTab === 'Professionals' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4">
            <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Professional Directory</h3>
            <p className="text-xs text-#6B7280">6 accredited legal and engineering experts currently in active founding roles:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {professionals.map((prof) => (
                <div key={prof.id} className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex items-center space-x-3">
                  <img src={prof.avatarUrl} alt={prof.name} className="w-12 h-12 rounded-full object-cover border border-stone-200" />
                  <div className="text-xs">
                    <span className="block font-semibold text-[#18452E]">{prof.name}</span>
                    <span className="block text-[10px] text-[#C9A84C] font-mono">{prof.category} &bull; Reg: {prof.regNumber}</span>
                    <span className="block text-stone-400 font-normal mt-0.5">{prof.statesCovered.join(', ')} Coverage-area</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: PROFESSIONAL CONNECTIONS */}
        {activeTab === 'Professional Connections' && (() => {
          const [pkgTypeFilter, setPkgTypeFilter] = useState<string>('All Types');
          const [connectionSearch, setConnectionSearch] = useState<string>('');
          const [allConnections, setAllConnections] = useState<ProfessionalConnection[]>(() => loadProfessionalConnections());

          const filteredConnections = allConnections.filter(conn => {
            // Package type filter
            if (pkgTypeFilter === 'Single Connections' && conn.packageType !== 'SINGLE') return false;
            if (pkgTypeFilter === 'Dual Bundles' && conn.packageType !== 'DUAL_BUNDLE') return false;
            if (pkgTypeFilter === 'Complete Bundles' && conn.packageType !== 'COMPLETE_BUNDLE') return false;

            // Search filter
            if (connectionSearch) {
              const q = connectionSearch.toLowerCase();
              return (
                conn.clientName.toLowerCase().includes(q) ||
                conn.clientEmail.toLowerCase().includes(q) ||
                conn.clientPhone.toLowerCase().includes(q) ||
                conn.paystackReference.toLowerCase().includes(q)
              );
            }

            return true;
          });

          // Metrics
          const totalRevenue = allConnections.reduce((sum, c) => sum + (c.amountPaid || 0), 0);
          const singleCount = allConnections.filter(c => c.packageType === 'SINGLE').length;
          const dualCount = allConnections.filter(c => c.packageType === 'DUAL_BUNDLE').length;
          const completeCount = allConnections.filter(c => c.packageType === 'COMPLETE_BUNDLE').length;

          return (
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h3 className="font-display font-semibold text-[#18452E] text-lg uppercase tracking-tight">
                    Professional Connections &amp; Bundle Management
                  </h3>
                  <p className="text-xs text-#6B7280 font-normal mt-0.5">
                    Track client bundle selections, Paystack connection fee payments, and expert assignments.
                  </p>
                </div>
                <button
                  onClick={() => setAllConnections(loadProfessionalConnections())}
                  className="px-3 py-1.5 bg-amber-50/80 hover:bg-stone-200 text-[#18452E] text-xs font-mono font-semibold rounded-xl flex items-center space-x-1.5 self-start md:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#18452E]" />
                  <span>Refresh Connections</span>
                </button>
              </div>

              {/* SUMMARY METRICS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl">
                  <span className="block text-[9px] font-mono font-semibold text-emerald-800 uppercase tracking-wider">Total Revenue</span>
                  <span className="text-xl md:text-2xl font-semibold text-[#18452E] font-display block mt-1">
                    ₦{totalRevenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-#6B7280 font-mono mt-0.5 block">{allConnections.length} Total Paid Links</span>
                </div>

                <div className="bg-amber-50/80 border border-stone-200 p-4 rounded-2xl">
                  <span className="block text-[9px] font-mono font-semibold text-#6B7280 uppercase tracking-wider">Single Connections</span>
                  <span className="text-xl md:text-2xl font-semibold text-[#18452E] font-display block mt-1">
                    {singleCount}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">₦55,000 / link</span>
                </div>

                <div className="bg-emerald-50/40 border border-emerald-200 p-4 rounded-2xl">
                  <span className="block text-[9px] font-mono font-semibold text-[#18452E] uppercase tracking-wider">Dual Bundles</span>
                  <span className="text-xl md:text-2xl font-semibold text-[#18452E] font-display block mt-1">
                    {dualCount}
                  </span>
                  <span className="text-[10px] text-#6B7280 font-mono mt-0.5 block">₦95,000 / bundle</span>
                </div>

                <div className="bg-[#18452E] text-white p-4 rounded-2xl border border-amber-400/30 relative overflow-hidden">
                  <span className="block text-[9px] font-mono font-semibold text-[#C9A84C] uppercase tracking-wider">Complete Bundles</span>
                  <span className="text-xl md:text-2xl font-semibold text-[#C9A84C] font-display block mt-1">
                    {completeCount}
                  </span>
                  <span className="text-[10px] text-stone-300 font-mono mt-0.5 block">₦120,000 / full shield</span>
                </div>
              </div>

              {/* FILTER TOOLBAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50/80 p-3.5 rounded-2xl border border-stone-200">
                <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {['All Types', 'Single Connections', 'Dual Bundles', 'Complete Bundles'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPkgTypeFilter(tab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition shrink-0 cursor-pointer ${
                        pkgTypeFilter === tab
                          ? 'bg-[#18452E] text-white shadow-xs'
                          : 'bg-white text-#6B7280 hover:bg-amber-50/80 border border-stone-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, phone, ref..."
                    value={connectionSearch}
                    onChange={(e) => setConnectionSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-[#18452E] outline-none"
                  />
                </div>
              </div>

              {/* CONNECTIONS TABLE */}
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-amber-50/80/70 border-b border-stone-200 text-[10px] font-mono uppercase text-#6B7280">
                    <tr>
                      <th className="p-3.5">Client Details</th>
                      <th className="p-3.5">Package Type</th>
                      <th className="p-3.5">Promo Code</th>
                      <th className="p-3.5">Amount Paid</th>
                      <th className="p-3.5">Status &amp; Reference</th>
                      <th className="p-3.5">Selected Experts</th>
                      <th className="p-3.5">Date Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredConnections.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400 font-normal">
                          No professional connections found matching current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredConnections.map((conn) => (
                        <tr key={conn.id} className="hover:bg-amber-50/80/80 transition">
                          <td className="p-3.5">
                            <span className="font-semibold text-[#18452E] block">{conn.clientName}</span>
                            <span className="text-[10px] text-#6B7280 font-mono block">{conn.clientEmail}</span>
                            <span className="text-[10px] text-stone-400 font-mono block">{conn.clientPhone}</span>
                          </td>
                          <td className="p-3.5">
                            {conn.packageType === 'SINGLE' && (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold">
                                Single Connection
                              </span>
                            )}
                            {conn.packageType === 'DUAL_BUNDLE' && (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-100 text-[#18452E] border border-emerald-300 text-[10px] font-mono font-semibold">
                                Dual Bundle
                              </span>
                            )}
                            {conn.packageType === 'COMPLETE_BUNDLE' && (
                              <span className="inline-block px-2.5 py-1 rounded-full bg-[#18452E] text-[#C9A84C] border border-amber-400/40 text-[10px] font-mono font-semibold">
                                Complete Bundle
                              </span>
                            )}
                            {conn.selectedCategories && conn.selectedCategories.length > 0 && (
                              <span className="block text-[9px] text-#6B7280 mt-1 font-mono">
                                ({conn.selectedCategories.join(' + ')})
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {conn.promoCode ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-100 text-[#18452E] text-[10px] font-mono font-semibold border border-amber-300">
                                  <Tag className="w-3 h-3 text-[#C9A84C]" />
                                  <span>{conn.promoCode}</span>
                                </span>
                                {conn.discountAmount && conn.discountAmount > 0 ? (
                                  <span className="block text-[9px] text-emerald-700 font-mono font-semibold">
                                    -₦{conn.discountAmount.toLocaleString()}
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-stone-400 font-mono text-[10px]">None</span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono font-semibold text-[#18452E]">
                            ₦{(conn.amountPaid || 0).toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-semibold uppercase">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{conn.status || 'CONFIRMED'}</span>
                            </span>
                            <span className="block text-[9px] font-mono text-stone-400 mt-1">
                              Ref: {conn.paystackReference}
                            </span>
                          </td>
                          <td className="p-3.5 text-#6B7280">
                            {conn.assignedProfessionalNames && conn.assignedProfessionalNames.length > 0 ? (
                              <div className="space-y-0.5">
                                {conn.assignedProfessionalNames.map((pName, idx) => (
                                  <span key={idx} className="block text-[10px] font-mono text-[#18452E]">
                                    &bull; {pName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-amber-600 font-mono italic">
                                Panel expert pending assignment
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-stone-400 font-mono text-[10px]">
                            {new Date(conn.createdAt).toLocaleDateString('en-NG', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* MANUAL MATCH ASSIGNMENT FORM */}
              <div className="pt-4 border-t border-stone-200">
                <h4 className="font-display font-semibold text-[#18452E] text-xs uppercase mb-2">
                  Assign Panel Member to Client Dossier
                </h4>
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (!matchingClient.client || !matchingClient.prof) {
                      alert('Please select both a client name/connection and panel professional.');
                      return;
                    }
                    triggerSuccess(`Successfully matched client ${matchingClient.client} with panel investigator ${matchingClient.prof}. Match invitation logged.`); 
                  }} 
                  className="space-y-3 p-4 bg-amber-50/80 border border-stone-200 rounded-2xl text-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-semibold text-stone-400 uppercase mb-1">CLIENT / DOSSIER NAME</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Alhaji Musa or Select Client..." 
                        value={matchingClient.client}
                        onChange={(e) => setMatchingClient(prev => ({ ...prev, client: e.target.value }))}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-semibold text-stone-400 uppercase mb-1">PANEL PROFESSIONAL</label>
                      <select 
                        value={matchingClient.prof}
                        onChange={(e) => setMatchingClient(prev => ({ ...prev, prof: e.target.value }))}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                      >
                        <option value="">Select from panel members...</option>
                        {professionals.map(p => (
                          <option key={p.id} value={p.name}>{p.name} ({p.category})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl cursor-pointer transition">
                    Confirm Match Assignment
                  </button>
                </form>
              </div>
            </div>
          );
        })()}

        {/* TAB 8: PROPERTY MANAGEMENT COMPANIES */}
        {activeTab === 'Property Management Companies' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6 animate-fade-in">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-stone-200 pb-4 gap-4">
              <div>
                <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Accredited PM Companies</h3>
                <p className="text-xs text-#6B7280 mt-0.5">Authorized PMC agents operating registered properties.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => toggleBulkMode('Property Management Companies')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer ${
                    bulkMode['Property Management Companies'] ? 'bg-rose-600 text-white' : 'bg-amber-50/80 hover:bg-stone-200 text-#132A1D'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{bulkMode['Property Management Companies'] ? 'Disable Bulk Select' : 'Enable Bulk Select'}</span>
                </button>
                <button 
                  onClick={() => triggerBrandedExport('Property Management Companies', mockPMCs, activeFilterName ? `Filter: ${activeFilterName}` : 'All Accredited')}
                  className="px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-xs flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* ADDITION SEVEN: SAVED FILTERS PILLS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-stone-400 uppercase tracking-wider">
                <span>Quick Saved Filters</span>
                <button 
                  onClick={() => {
                    const name = prompt('Enter a name for this custom filter combination:');
                    if (name) saveCurrentFilter('Property Management Companies', name, { type: 'PMC' });
                  }}
                  className="text-#6B7280 hover:text-emerald-700 underline"
                >
                  + Save Current View
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-3">
                {(savedFilters['Property Management Companies'] || []).map((sf, idx) => {
                  const isActive = activeFilterName === sf.name;
                  return (
                    <div key={idx} className="flex items-center space-x-1">
                      <button 
                        onClick={() => {
                          if (isActive) {
                            setActiveFilterName(null);
                            setActiveFilterCriteria(null);
                          } else {
                            setActiveFilterName(sf.name);
                            setActiveFilterCriteria(sf.criteria);
                            triggerSuccess(`Applied saved filter: "${sf.name}"`);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer border ${
                          isActive 
                            ? 'bg-[#18452E] text-white border-[#0E2F1F]' 
                            : 'bg-amber-50/80 hover:bg-amber-50/80 text-#6B7280 border-stone-200'
                        }`}
                      >
                        {sf.name}
                      </button>
                      <button 
                        onClick={() => deleteSavedFilter('Property Management Companies', sf.name)}
                        className="text-stone-400 hover:text-rose-600 text-xs px-1"
                        title="Delete filter"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PMC Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockPMCs.map(pmc => {
                const isSelected = (selectedIds['Property Management Companies'] || []).includes(pmc.id);

                // Filter logic
                if (activeFilterName === 'High Rent Performance Only' && pmc.name.includes('Lagos')) return null;

                return (
                  <div 
                    key={pmc.id} 
                    className={`p-5 border rounded-2xl transition duration-200 flex flex-col justify-between ${
                      isSelected 
                        ? 'border-[#0E2F1F] bg-emerald-50/10' 
                        : 'bg-amber-50/80 border-stone-200 hover:border-[#0E2F1F] cursor-pointer'
                    }`}
                    onClick={() => {
                      if (bulkMode['Property Management Companies']) {
                        toggleRowSelected('Property Management Companies', pmc.id);
                      } else {
                        setSelectedPMCModal(pmc);
                      }
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-start border-b border-stone-200 pb-3 mb-3">
                        <div className="flex items-center space-x-2">
                          {bulkMode['Property Management Companies'] && (
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleRowSelected('Property Management Companies', pmc.id);
                              }}
                              className="w-4 h-4 text-[#18452E] border-stone-300 rounded focus:ring-[#18452E] cursor-pointer mr-2"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-sm text-[#18452E] uppercase">{pmc.name}</h4>
                            <span className="block text-[10px] font-mono text-#6B7280 mt-0.5">{pmc.address} | {pmc.phone}</span>
                          </div>
                        </div>
                        <span className="text-[9px] uppercase font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">Active</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Landlords Managed</span>
                          <strong className="font-mono text-#132A1D">{pmc.landlordsManaged}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Properties Managed</span>
                          <strong className="font-mono text-#132A1D">{pmc.propertiesManaged}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Tenants Managed</span>
                          <strong className="font-mono text-#132A1D">{pmc.tenantsManaged}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Collection History</span>
                          <strong className="font-mono text-emerald-600">{pmc.collectionHistory}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200/50 flex justify-between items-center">
                      <span className="text-[9px] text-stone-400 font-mono">Operations Timeline</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openTimelineForRecord('remittance', { name: pmc.name, id: pmc.id, portfolioValue: pmc.propertiesManaged * 1000000 });
                        }}
                        className="px-2 py-1 bg-stone-150 hover:bg-stone-200 text-[#18452E] font-mono text-[9px] rounded-lg transition flex items-center space-x-1"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STICKY FLOATING BULK ACTIONS BAR */}
            {bulkMode['Property Management Companies'] && (selectedIds['Property Management Companies'] || []).length > 0 && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-#132A1D border border-#132A1D text-white px-6 py-4 rounded-2xl shadow-sm flex items-center space-x-6 z-50 animate-bounce-short">
                <div className="flex items-center space-x-2 border-r border-#132A1D pr-6">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-xs font-mono font-semibold text-stone-300 uppercase">
                    {(selectedIds['Property Management Companies'] || []).length} Checked
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setBulkActionTargetTab('Property Management Companies');
                      setShowBulkBroadcastModal(true);
                    }}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-stone-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Send Broadcast
                  </button>
                  <button 
                    onClick={() => triggerBrandedExport('Bulk Selected PMCs', mockPMCs.filter(p => (selectedIds['Property Management Companies'] || []).includes(p.id)))}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-stone-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Export
                  </button>
                  <button 
                    onClick={() => {
                      setBulkActionTargetTab('Property Management Companies');
                      setShowSuspensionModal(true);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Suspend
                  </button>
                  <button 
                    onClick={() => executeBulkArchive('Property Management Companies')}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-[#C9A84C] text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Archive
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedIds(prev => ({ ...prev, 'Property Management Companies': [] }))}
                  className="text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 9: COMPANY APPLICATIONS */}
        {activeTab === 'Company Applications' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4">
            <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Validate PM Corporate Filings</h3>
            <p className="text-xs text-#6B7280">Review, vet legal CAC declarations, and approve pending PM Company access:</p>
            
            <div className="space-y-4">
              {pmcApps.map((app) => (
                <div key={app.id} className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="text-xs space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <strong className="text-sm text-[#18452E]">{app.companyName}</strong>
                      <span className="text-[10px] bg-[#C9A84C]/10 text-[#C9A84C] font-mono px-2 py-0.5 rounded">{app.cacNumber}</span>
                    </div>
                    <span className="block text-#6B7280 font-normal">Officer: {app.contactName} ({app.phone})</span>
                    <span className="block text-#6B7280">Address: {app.address}</span>
                    <span className="block text-stone-400 text-[10px]">Managed Assets Queue: {app.propertiesManaged} Properties / {app.yearsOperating} Years Operating</span>
                  </div>
                  
                  <div className="flex space-x-2 shrink-0">
                    <span className={`px-2 py-1 text-[10px] font-mono font-semibold rounded ${
                      app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>{app.status}</span>
                    
                    {app.status === 'Pending' && (
                      <div className="flex space-x-1">
                        <button onClick={() => handleApprovePMC(app.id)} className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-semibold cursor-pointer">
                          Approve Corporate Pack
                        </button>
                        <button onClick={() => handleRejectPMC(app.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-semibold cursor-pointer">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: SHORTLET MANAGEMENT */}
        {/* TAB 10: SHORTLET MANAGEMENT */}
        {activeTab === 'Shortlet Management' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6 animate-fade-in">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-stone-200 pb-4 gap-4">
              <div>
                <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Shortlet Managers Overview</h3>
                <p className="text-xs text-#6B7280 mt-0.5">Monitor registered shortlet managers and performance.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => toggleBulkMode('Shortlet Management')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer ${
                    bulkMode['Shortlet Management'] ? 'bg-rose-600 text-white' : 'bg-amber-50/80 hover:bg-stone-200 text-#132A1D'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{bulkMode['Shortlet Management'] ? 'Disable Bulk Select' : 'Enable Bulk Select'}</span>
                </button>
                <button 
                  onClick={() => triggerBrandedExport('Shortlet Managers List', mockShortlets, activeFilterName ? `Filter: ${activeFilterName}` : 'All Managers')}
                  className="px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-xs flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* ADDITION SEVEN: SAVED FILTERS PILLS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-stone-400 uppercase tracking-wider">
                <span>Quick Saved Filters</span>
                <button 
                  onClick={() => {
                    const name = prompt('Enter a name for this custom filter combination:');
                    if (name) saveCurrentFilter('Shortlet Management', name, { type: 'Shortlet' });
                  }}
                  className="text-#6B7280 hover:text-emerald-700 underline text-[9px]"
                >
                  + Save Current View
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-3">
                {(savedFilters['Shortlet Management'] || []).map((sf, idx) => {
                  const isActive = activeFilterName === sf.name;
                  return (
                    <div key={idx} className="flex items-center space-x-1">
                      <button 
                        onClick={() => {
                          if (isActive) {
                            setActiveFilterName(null);
                            setActiveFilterCriteria(null);
                          } else {
                            setActiveFilterName(sf.name);
                            setActiveFilterCriteria(sf.criteria);
                            triggerSuccess(`Applied saved filter: "${sf.name}"`);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition cursor-pointer border ${
                          isActive 
                            ? 'bg-[#18452E] text-white border-[#0E2F1F]' 
                            : 'bg-amber-50/80 hover:bg-amber-50/80 text-#6B7280 border-stone-200'
                        }`}
                      >
                        {sf.name}
                      </button>
                      <button 
                        onClick={() => deleteSavedFilter('Shortlet Management', sf.name)}
                        className="text-stone-400 hover:text-rose-600 text-xs px-1"
                        title="Delete filter"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockShortlets.map(shortlet => {
                const isSelected = (selectedIds['Shortlet Management'] || []).includes(shortlet.id);

                // Saved Filter checks
                if (activeFilterName === 'High Performance Only' && shortlet.propertiesManaged < 4) return null;

                return (
                  <div 
                    key={shortlet.id} 
                    className={`p-5 border rounded-2xl transition duration-200 flex flex-col justify-between ${
                      isSelected 
                        ? 'border-[#0E2F1F] bg-emerald-50/10' 
                        : 'bg-amber-50/80 border-stone-200 hover:border-[#0E2F1F] cursor-pointer'
                    }`}
                    onClick={() => {
                      if (bulkMode['Shortlet Management']) {
                        toggleRowSelected('Shortlet Management', shortlet.id);
                      } else {
                        setSelectedShortletModal(shortlet);
                      }
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-start border-b border-stone-200 pb-3 mb-3">
                        <div className="flex items-center space-x-2">
                          {bulkMode['Shortlet Management'] && (
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleRowSelected('Shortlet Management', shortlet.id);
                              }}
                              className="w-4 h-4 text-[#18452E] border-stone-300 rounded focus:ring-[#18452E] cursor-pointer mr-2"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-sm text-[#18452E] uppercase">{shortlet.name}</h4>
                            <span className="block text-[10px] font-mono text-#6B7280 mt-0.5">Manager: {shortlet.manager}</span>
                          </div>
                        </div>
                        <span className="text-[9px] uppercase font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">Active</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Properties Managed</span>
                          <strong className="font-mono text-#132A1D">{shortlet.propertiesManaged}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Bookings Logged</span>
                          <strong className="font-mono text-#132A1D">{shortlet.bookingsLogged}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Revenue Managed</span>
                          <strong className="font-mono text-#132A1D">₦{(shortlet.revenueManaged).toLocaleString()}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Commission Earned</span>
                          <strong className="font-mono text-emerald-600">₦{(shortlet.commissionEarned).toLocaleString()}</strong>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">Remittance Performance</span>
                          <strong className="font-mono text-teal-600">{shortlet.remittancePerformance} Success Rate</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200/50 flex justify-between items-center">
                      <span className="text-[9px] text-stone-400 font-mono">Operations Timeline</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openTimelineForRecord('remittance', { name: shortlet.name, id: shortlet.id, portfolioValue: shortlet.revenueManaged });
                        }}
                        className="px-2 py-1 bg-stone-150 hover:bg-stone-200 text-[#18452E] font-mono text-[9px] rounded-lg transition flex items-center space-x-1"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STICKY FLOATING BULK ACTIONS BAR */}
            {bulkMode['Shortlet Management'] && (selectedIds['Shortlet Management'] || []).length > 0 && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-#132A1D border border-#132A1D text-white px-6 py-4 rounded-2xl shadow-sm flex items-center space-x-6 z-50 animate-bounce-short">
                <div className="flex items-center space-x-2 border-r border-#132A1D pr-6">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-xs font-mono font-semibold text-stone-300 uppercase">
                    {(selectedIds['Shortlet Management'] || []).length} Checked
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setBulkActionTargetTab('Shortlet Management');
                      setShowBulkBroadcastModal(true);
                    }}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-stone-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Send Broadcast
                  </button>
                  <button 
                    onClick={() => triggerBrandedExport('Bulk Selected Shortlet Managers', mockShortlets.filter(s => (selectedIds['Shortlet Management'] || []).includes(s.id)))}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-stone-200 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Export
                  </button>
                  <button 
                    onClick={() => {
                      setBulkActionTargetTab('Shortlet Management');
                      setShowSuspensionModal(true);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Suspend
                  </button>
                  <button 
                    onClick={() => executeBulkArchive('Shortlet Management')}
                    className="px-3 py-1.5 bg-#132A1D hover:bg-#132A1D text-[#C9A84C] text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Archive
                  </button>
                </div>
                <button 
                  onClick={() => setSelectedIds(prev => ({ ...prev, 'Shortlet Management': [] }))}
                  className="text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: CAUTION DEPOSIT MEDIATION */}
        {activeTab === 'Caution Deposit Mediation' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6 animate-fade-in">
            <div className="bg-[#18452E] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Award className="w-48 h-48 text-emerald-200" />
              </div>
              <div className="relative z-10 max-w-3xl">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A84C] font-semibold block mb-1">
                  Official Administrative Board
                </span>
                <h3 className="font-display font-semibold text-2xl uppercase tracking-tight text-white mb-2">
                  Caution Deposit Mediation Panel
                </h3>
                <p className="text-emerald-100 text-xs leading-relaxed font-normal">
                  Unity Homes acts as an impartial third-party mediator for shortlet caution deposit disputes. While Unity Homes never holds or touches deposit funds, administrators review landlord dispute claims, manager checkout logs, and photo evidence to issue final, binding rulings.
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-stone-200">
                <span className="block text-[10px] font-mono text-stone-400 uppercase font-semibold">Total Escalated Disputes</span>
                <span className="text-xl font-display font-semibold text-#132A1D">{adminDepositResolutions.length}</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <span className="block text-[10px] font-mono text-amber-700 uppercase font-semibold">Pending Admin Rulings</span>
                <span className="text-xl font-display font-semibold text-amber-900">
                  {adminDepositResolutions.filter(r => r.status?.includes('Disputed')).length}
                </span>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
                <span className="block text-[10px] font-mono text-purple-700 uppercase font-semibold">Binding Rulings Issued</span>
                <span className="text-xl font-display font-semibold text-purple-900">
                  {adminDepositResolutions.filter(r => r.status === 'Ruled by Admin').length}
                </span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="block text-[10px] font-mono text-emerald-700 uppercase font-semibold">Accepted by Landlords</span>
                <span className="text-xl font-display font-semibold text-emerald-900">
                  {adminDepositResolutions.filter(r => r.status === 'Accepted by Landlord').length}
                </span>
              </div>
            </div>

            {/* Cases list */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <h4 className="font-display font-semibold text-[#18452E] text-sm uppercase">Caution Deposit Dispute Docket</h4>
                <span className="text-xs font-mono text-stone-400">{adminDepositResolutions.length} Docket Records</span>
              </div>

              {adminDepositResolutions.length === 0 ? (
                <div className="p-12 text-center bg-amber-50/80 rounded-2xl border border-stone-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3 opacity-60" />
                  <h5 className="font-semibold text-#132A1D text-sm">No Active Caution Deposit Disputes</h5>
                  <p className="text-xs text-stone-400 mt-1">
                    When landlords escalate a deposit dispute against a shortlet manager, the case will immediately populate here for administrative mediation.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminDepositResolutions.map((res) => {
                    const isPendingDispute = res.status?.includes('Disputed');
                    const isRuled = res.status === 'Ruled by Admin';
                    const isAccepted = res.status === 'Accepted by Landlord';

                    return (
                      <div key={res.id} className="p-5 bg-amber-50/80 rounded-2xl border border-stone-200 space-y-4 shadow-2xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-stone-200">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[#18452E]">{res.propertyName}</span>
                              <span className="text-[10px] font-mono bg-stone-200 text-#132A1D px-2 py-0.5 rounded font-semibold">
                                Booking #{res.bookingId}
                              </span>
                            </div>
                            <p className="text-xs text-#6B7280 mt-0.5">
                              Guest: <strong>{res.guestName}</strong> &bull; Manager: <strong>{res.managerName || 'Vantage Shortlets'}</strong> &bull; Landlord: <strong>{res.landlordName || 'Property Owner'}</strong>
                            </p>
                          </div>

                          <span className={`px-3 py-1 text-[10px] font-semibold uppercase rounded-full border ${
                            isRuled ? 'bg-purple-100 text-purple-900 border-purple-300' :
                            isPendingDispute ? 'bg-rose-100 text-rose-900 border-rose-300' :
                            isAccepted ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                            'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            {res.status}
                          </span>
                        </div>

                        {/* Deposit breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
                          <div>
                            <span className="block text-[9px] font-mono text-stone-400 uppercase">Caution Deposit</span>
                            <span className="font-semibold font-mono text-#132A1D">₦{(res.depositAmount || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-mono text-stone-400 uppercase">Checkout Condition</span>
                            <span className="font-semibold uppercase text-#132A1D">{res.condition || 'Inspected'}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-mono text-stone-400 uppercase">Manager Retained</span>
                            <span className="font-semibold font-mono text-rose-600">₦{(res.amountRetained || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-mono text-stone-400 uppercase">Manager Returned</span>
                            <span className="font-semibold font-mono text-emerald-600">₦{(res.amountReturned || 0).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Manager retention rationale */}
                        {res.retentionJustification && (
                          <div className="p-3 bg-amber-50/80 rounded-xl text-xs text-#132A1D space-y-1">
                            <strong className="block font-semibold text-[10px] text-#6B7280 uppercase">Manager Retention Notes</strong>
                            <p>{res.retentionJustification}</p>
                          </div>
                        )}

                        {/* Landlord dispute rationale */}
                        {res.landlordDisputeReason && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                            <strong className="block font-semibold text-[10px] text-rose-800 uppercase">Landlord Dispute Claim</strong>
                            <p className="italic">"{res.landlordDisputeReason}"</p>
                          </div>
                        )}

                        {/* Admin ruling output */}
                        {res.adminRuling && (
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 space-y-2">
                            <div className="flex justify-between items-center">
                              <strong className="font-semibold uppercase text-xs text-purple-950 flex items-center gap-1">
                                <Award className="w-4 h-4 text-purple-700" /> Unity Homes Official Binding Ruling
                              </strong>
                              <span className="text-[10px] font-mono text-purple-700">{res.adminRuling.ruledAt?.substring(0, 10)}</span>
                            </div>
                            <p className="leading-relaxed font-medium">{res.adminRuling.justification}</p>
                            <div className="flex gap-4 font-mono text-[11px] pt-1 border-t border-purple-200">
                              <span>Final Retained: <strong>₦{(res.adminRuling.amountRetained || 0).toLocaleString()}</strong></span>
                              <span>Final Returned: <strong>₦{(res.adminRuling.amountReturned || 0).toLocaleString()}</strong></span>
                            </div>
                          </div>
                        )}

                        {/* Adjudicate Action */}
                        {isPendingDispute && (
                          <div className="pt-2 border-t border-stone-200 flex justify-end">
                            <button
                              onClick={() => {
                                setAdjudicatingRes(res);
                                setAdminCustomRetained(res.amountRetained || 0);
                                setAdminRulingJustification('');
                              }}
                              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Adjudicate &amp; Issue Binding Ruling</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ADMIN ADJUDICATION MODAL */}
            {adjudicatingRes && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[var(--radius-large)] max-w-xl w-full p-6 space-y-5 shadow-sm border border-stone-200">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-purple-700 font-semibold uppercase block">Unity Homes Dispute Adjudication Board</span>
                      <h4 className="font-display font-semibold text-[#18452E] text-base">Issue Binding Caution Deposit Ruling</h4>
                    </div>
                    <button 
                      onClick={() => setAdjudicatingRes(null)}
                      className="p-1 rounded-full hover:bg-amber-50/80 text-stone-400 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Summary card */}
                  <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl text-xs text-purple-950 space-y-1">
                    <p className="font-semibold">{adjudicatingRes.propertyName} (Booking #{adjudicatingRes.bookingId})</p>
                    <p>Total Deposit: <strong>₦{(adjudicatingRes.depositAmount || 0).toLocaleString()}</strong> &bull; Manager Retained: <strong>₦{(adjudicatingRes.amountRetained || 0).toLocaleString()}</strong></p>
                    <p className="text-[11px] text-purple-800 italic mt-1">Landlord Claim: "{adjudicatingRes.landlordDisputeReason}"</p>
                  </div>

                  {/* Decision selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-#132A1D uppercase font-mono">
                      Select Binding Decision
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-stone-200 hover:bg-amber-50/80 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="adminRulingDecision"
                          checked={adminRulingDecision === 'Uphold Manager'}
                          onChange={() => setAdminRulingDecision('Uphold Manager')}
                          className="text-purple-700 focus:ring-purple-500"
                        />
                        <div>
                          <strong className="block text-#132A1D">Uphold Manager's Resolution</strong>
                          <span className="text-[10px] text-#6B7280">Confirm manager's retention of ₦{(adjudicatingRes.amountRetained || 0).toLocaleString()} based on inspection notes.</span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-stone-200 hover:bg-amber-50/80 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="adminRulingDecision"
                          checked={adminRulingDecision === 'Full Refund Guest'}
                          onChange={() => setAdminRulingDecision('Full Refund Guest')}
                          className="text-purple-700 focus:ring-purple-500"
                        />
                        <div>
                          <strong className="block text-#132A1D">Full Refund to Guest (0 Retained)</strong>
                          <span className="text-[10px] text-#6B7280">Rule that damage evidence is insufficient and full ₦{(adjudicatingRes.depositAmount || 0).toLocaleString()} deposit must be returned.</span>
                        </div>
                      </label>

                      <label className="flex items-center space-x-2.5 p-3 rounded-xl border border-stone-200 hover:bg-amber-50/80 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="adminRulingDecision"
                          checked={adminRulingDecision === 'Custom Split'}
                          onChange={() => setAdminRulingDecision('Custom Split')}
                          className="text-purple-700 focus:ring-purple-500"
                        />
                        <div>
                          <strong className="block text-#132A1D">Custom Adjusted Split Ruling</strong>
                          <span className="text-[10px] text-#6B7280">Set a revised custom amount to retain for verified repairs.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Custom amount input if selected */}
                  {adminRulingDecision === 'Custom Split' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-#132A1D uppercase font-mono">
                        Custom Amount to Retain (₦)
                      </label>
                      <input
                        type="number"
                        value={adminCustomRetained}
                        onChange={(e) => setAdminCustomRetained(Number(e.target.value))}
                        className="w-full bg-amber-50/80 border border-stone-200 rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  {/* Justification textarea */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-#132A1D uppercase font-mono">
                      Binding Ruling Justification &amp; Rationale <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={adminRulingJustification}
                      onChange={(e) => setAdminRulingJustification(e.target.value)}
                      placeholder="State official rationale behind this binding ruling (e.g. verified contractor quote uploaded supports ₦15,000 repair cost; excess deposit of ₦35,000 ordered returned)..."
                      className="w-full bg-amber-50/80 border border-stone-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-stone-200">
                    <button
                      onClick={() => setAdjudicatingRes(null)}
                      className="px-4 py-2 bg-amber-50/80 hover:bg-stone-200 text-#132A1D font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleIssueAdminBindingRuling}
                      className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-sm"
                    >
                      Publish Binding Ruling
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 11: SUBSCRIPTION INQUIRIES */}
        {activeTab === 'Subscription Inquiries' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4">
            <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Incoming Verification Callbacks</h3>
            <p className="text-xs text-#6B7280">Validate the active pipeline of client profile subscriptions via telephone/WhatsApp checks:</p>
            
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center space-x-2">
                      <strong className="text-sm text-[#18452E]">{inq.targetName}</strong>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 rounded-full">{inq.type}</span>
                    </div>
                    <span className="block font-normal text-#6B7280">Submitted by: {inq.requesterName} &bull; Hotline: {inq.requesterPhone}</span>
                    <span className="block text-stone-400 text-[10px]">Contact Date: {inq.dateCreated}</span>
                    {inq.promo_code && (
                      <div className="mt-1.5 flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-100 text-[#18452E] text-[10px] font-mono font-semibold border border-amber-300">
                          <Tag className="w-3 h-3 text-[#C9A84C]" />
                          <span>Promo Code: {inq.promo_code}</span>
                        </span>
                        {inq.promo_discount_text && (
                          <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                            ({inq.promo_discount_text})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-[10px] font-mono font-semibold rounded ${
                      inq.status === 'Contacted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>{inq.status}</span>
                    {inq.status === 'Pending' && (
                      <button onClick={() => handleProcessInquiry(inq.id)} className="px-3 py-1.5 bg-[#18452E] text-white text-[10px] font-semibold rounded-lg cursor-pointer">
                        Mark Callback Initiated
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 12: SUBSCRIPTION MANAGEMENT */}
        {activeTab === 'Subscription Management' && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4 shadow-sm animate-fade-in">
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Configure Subscription Tiers</h3>
              <p className="text-xs text-#6B7280">Edit billing tiers securely. Note: Larger accounts are dynamically priced to ensure legal equity.</p>
              
              <div className="space-y-3">
                {subscriptionPlans.map((plan) => (
                  <div key={plan.id} className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <strong className="block text-[#18452E] font-display text-sm">{plan.level}</strong>
                      <span className="text-stone-400 font-normal block mt-0.5">{plan.clientCount} Rate Metric</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-base text-[#18452E] block">₦{plan.price.toLocaleString()}</span>
                      <button 
                        onClick={() => triggerSuccess(`Billing price updated for plan '${plan.level}'`)}
                        className="text-[#C9A84C] hover:underline font-mono text-[10px] font-semibold cursor-pointer"
                      >
                        Configure Price
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ADMIN SUBSCRIPTION OVERRIDES & SYSTEM ALLOCATIONS */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6 shadow-sm animate-fade-in">
              <div>
                <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-5 h-5 text-[#C9A84C]" />
                  <span>Subscription Capacity Enforcement & Override Controller</span>
                </h3>
                <p className="text-xs text-#6B7280 mt-1">
                  Enforce database-level capacity limits, view real-time landlord/PMC usage allocations, or securely apply temporary admin limit overrides with full audit logging.
                </p>
              </div>

              {/* OVERRIDE FORM */}
              <div className="bg-amber-50/80 border border-stone-200 p-6 rounded-2xl">
                <h4 className="font-display font-semibold text-xs text-#132A1D uppercase border-b pb-2 mb-4">
                  Configure Capacity Override
                </h4>
                <form onSubmit={handleApplyOverride} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-mono font-semibold text-stone-400 uppercase mb-1">SELECT SUBSCRIPTION ENTITY</label>
                      <select
                        required
                        value={selectedEntity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSelectedEntity(val);
                          const sub = (subscriptions || []).find(s => s.entityId === val);
                          if (sub) {
                            setTempOverrideLimit(sub.property_limit);
                          }
                        }}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-teal-700 font-medium font-sans"
                      >
                        <option value="">-- Choose Landlord or PMC --</option>
                        {(subscriptions || []).map((s) => (
                          <option key={s.id} value={s.entityId}>
                            [{s.entityType}] {s.entityId} (Current: {s.property_limit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-semibold text-stone-400 uppercase mb-1">TEMPORARY OVERRIDE LIMIT (PROPERTIES)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={tempOverrideLimit}
                        onChange={(e) => setTempOverrideLimit(Number(e.target.value))}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-teal-700 font-medium font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-semibold text-stone-400 uppercase mb-1">AUTO-REVERT EXPIRY PERIOD</label>
                      <select
                        value={revertPeriod}
                        onChange={(e) => setRevertPeriod(e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-teal-700 font-medium"
                      >
                        <option value="24_hours">24 Hours (Instant Demo Period)</option>
                        <option value="7_days">7 Days</option>
                        <option value="30_days">30 Days</option>
                        <option value="no_expiry">No Expiry (Permanent Adjust)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="block text-[9px] font-mono font-semibold text-stone-400 uppercase mb-1">ADMIN OVERRIDE REASON (FOR IMMUTABLE AUDIT LOGS)</label>
                      <textarea
                        required
                        rows={4}
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="Explain why this temporary capacity extension is being issued (e.g. Lagos Realty Partners upgraded offline to enterprise plan, awaiting transaction settlement)."
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl outline-none focus:border-teal-700 font-medium leading-relaxed font-sans"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#18452E] hover:bg-[#123023] text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-md uppercase tracking-wider"
                    >
                      Apply Override & Log to Ledger
                    </button>
                  </div>
                </form>
              </div>

              {/* OVERRIDES & LIVE CAPACITIES TABLE */}
              <div className="space-y-3">
                <h4 className="font-display font-semibold text-xs text-#132A1D uppercase">
                  Real-time Subscriber Resource Allocations
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-amber-50/80 font-mono text-[9px] font-semibold text-stone-400 uppercase">
                        <th className="p-3">Entity Name</th>
                        <th className="p-3">Type</th>
                        <th className="p-3 text-center">Current Usage / Active Properties</th>
                        <th className="p-3 text-center">Allocated Limit</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3">Expiry</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {(subscriptions || []).map((sub) => {
                        let usageCount = 0;
                        if (sub.entityType === 'LANDLORD') {
                          usageCount = landlordUnits.filter(u => u.propertyName && getLandlordName(u.propertyName) === sub.entityId).length;
                        } else {
                          try {
                            const storedMcps = localStorage.getItem('uh_management_company_properties_v1');
                            const parsedMcps = storedMcps ? JSON.parse(storedMcps) : [];
                            usageCount = parsedMcps.filter((m: any) => m.company_id === sub.entityId && m.is_active === true).length;
                          } catch {
                            usageCount = sub.entityId === 'Lagos Realty Partners' ? 10 : 3;
                          }
                        }

                        const percent = sub.property_limit > 0 ? Math.round((usageCount / sub.property_limit) * 100) : 0;

                        return (
                          <tr key={sub.id} className="hover:bg-amber-50/80/50 transition">
                            <td className="p-3 font-display font-semibold text-[#18452E]">{sub.entityId}</td>
                            <td className="p-3 font-mono font-semibold text-[10px]">
                              <span className={`px-2 py-0.5 rounded-full ${
                                sub.entityType === 'PMC' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                {sub.entityType}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <span className="font-mono font-semibold">{usageCount} properties</span>
                                <div className="w-24 bg-amber-50/80 h-1.5 rounded-full mt-1 overflow-hidden border">
                                  <div 
                                    className={`h-full ${percent >= 100 ? 'bg-rose-600' : percent >= 75 ? 'bg-amber-500' : 'bg-[#18452E]'}`}
                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center font-mono font-semibold text-sm text-[#18452E]">{sub.property_limit}</td>
                            <td className="p-3 text-center">
                              {sub.is_overridden ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 font-mono animate-pulse">
                                  OVERRIDDEN
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50/80 text-#6B7280 font-mono">
                                  STANDARD
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-[10px] text-#6B7280">
                              {sub.is_overridden && sub.override_expiry ? (
                                <span className="text-#6B7280 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span>{sub.override_expiry.replace('T', ' ').substring(0, 16)}</span>
                                </span>
                              ) : sub.is_overridden ? (
                                <span className="text-stone-400">Never Reverts</span>
                              ) : (
                                <span className="text-stone-300">-</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              {sub.is_overridden ? (
                                <button
                                  onClick={() => handleForceRevert(sub.entityId)}
                                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[10px] font-semibold rounded-lg cursor-pointer transition flex items-center gap-1 ml-auto"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                                  <span>Force Expire Now</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedEntity(sub.entityId);
                                    setTempOverrideLimit(sub.property_limit);
                                  }}
                                  className="px-3 py-1.5 bg-white hover:bg-amber-50/80 border border-stone-200 text-[10px] font-semibold rounded-lg cursor-pointer transition"
                                >
                                  Adjust Limit
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROMO CODES TAB */}
        {activeTab === 'Promo Codes' && (
          <PromoCodesAdminSection triggerSuccess={triggerSuccess} />
        )}

        {/* TAB 13: PARTNER NETWORK */}
        {activeTab === 'Partner Network' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4">
            <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Affiliate Referral Payouts</h3>
            <p className="text-xs text-#6B7280">Approve referrals for landlords, tenants, or legal connection matches securely:</p>
            
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="font-semibold text-[#18452E] block">Chief Raymond Temowo (Affiliate Partner)</span>
                  <span className="block text-[10px] text-stone-400">Referred: Landlord Dr. Chioma Okafor</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="block font-mono font-semibold text-[#18452E]">₦50,000 Reward</span>
                  <button onClick={() => triggerSuccess('Referral payout approved. Dispatched to verified FBN account line within 14 business days.')} className="px-2.5 py-1 bg-[#18452E] hover:bg-[#18452E] text-white text-[9px] font-semibold rounded mt-1.5 cursor-pointer">
                    Approve Cash Release
                  </button>
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="font-semibold text-[#18452E] block">Adebisi Joshua (Affiliate Partner)</span>
                  <span className="block text-[10px] text-stone-400">Referred: Tenant Fatima Yusuf</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="block font-mono font-semibold text-[#18452E]">₦10,000 Reward</span>
                  <button onClick={() => triggerSuccess('Referral payout approved. Dispatched to verified Zenith account.')} className="px-2.5 py-1 bg-[#18452E] hover:bg-[#18452E] text-white text-[9px] font-semibold rounded mt-1.5 cursor-pointer">
                    Approve Cash Release
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 14: COMPLAINT REPORTS */}
        {activeTab === 'Complaint Reports' && (
          <AdminComplaintOversightSection triggerSuccess={triggerSuccess} />
        )}

        {/* TAB 15: DAMAGE REPORTS */}
        {activeTab === 'Damage Reports' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4">
            <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Damage Claims &amp; Estimates</h3>
            <p className="text-xs text-#6B7280">Security caution deposit claims logged by landlords:</p>
            
            <div className="space-y-4">
              {damages.map((dmg) => (
                <div key={dmg.id} className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-[#18452E] text-sm block">{dmg.property}</span>
                    <span className="block text-#6B7280 font-normal">Tenant: {dmg.tenant} &bull; Damage Category: {dmg.type}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block font-mono font-semibold text-red-600">Est Value: ₦{dmg.value.toLocaleString()}</span>
                    <button onClick={() => triggerSuccess('Caution Deposit dispute logged under active investigation.')} className="px-2.5 py-1 bg-red-600/10 text-red-700 font-semibold text-[10px] rounded hover:bg-red-600 hover:text-white mt-1 cursor-pointer">
                      Open Ledger Dispute Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 16: DOCUMENT VAULT */}
        {activeTab === 'Document Vault' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6">
            <div className="flex items-center space-x-3 text-[#18452E] mb-4 border-b border-stone-200 pb-4">
              <FolderOpen className="w-6 h-6" />
              <div>
                <h3 className="font-display font-semibold text-sm uppercase">Global Document Vault</h3>
                <p className="text-xs text-#6B7280 mt-0.5">Access every verified survey map, COREN log, title deed, and ID uploaded on the platform.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex items-start space-x-3">
                <FileLock className="w-5 h-5 text-[#18452E] shrink-0" />
                <div>
                  <span className="font-semibold block text-[#18452E]">COREN Structural Sanity Ledger</span>
                  <span className="text-[10px] text-stone-400 block mb-2">Platform-wide: COREN_UH_2026_Audit_Log.pdf</span>
                  <button onClick={() => triggerSuccess('COREN Structural Sanity file downloaded to local safe.')} className="text-[#18452E] hover:underline font-semibold text-[10px] cursor-pointer">
                    Download Secure Audit File
                  </button>
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex items-start space-x-3">
                <Map className="w-5 h-5 text-[#18452E] shrink-0" />
                <div>
                  <span className="font-semibold block text-[#18452E]">Global C of O Surveyor Map Checks</span>
                  <span className="text-[10px] text-stone-400 block mb-2">Platform-wide: SURCON_EP_Lagoon_Deed.pdf</span>
                  <button onClick={() => triggerSuccess('SURCON surveyor map downloaded.')} className="text-[#18452E] hover:underline font-semibold text-[10px] cursor-pointer">
                    Download Secure Audit File
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-[#18452E] shrink-0" />
                <div>
                  <span className="font-semibold block text-[#18452E]">Tenant Background Screening Master File</span>
                  <span className="text-[10px] text-stone-400 block mb-2">Platform-wide: UH_Global_Tenants_2026.pdf</span>
                  <button onClick={() => triggerSuccess('Master background file downloaded.')} className="text-[#18452E] hover:underline font-semibold text-[10px] cursor-pointer">
                    Download Secure Audit File
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex items-start space-x-3">
                <FileText className="w-5 h-5 text-[#18452E] shrink-0" />
                <div>
                  <span className="font-semibold block text-[#18452E]">CAC Corporate Filings (PMCs)</span>
                  <span className="text-[10px] text-stone-400 block mb-2">Platform-wide: UH_PMC_Corporate_Registry.zip</span>
                  <button onClick={() => triggerSuccess('Corporate filings downloaded.')} className="text-[#18452E] hover:underline font-semibold text-[10px] cursor-pointer">
                    Download Secure Audit File
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 17: BIRTHDAY ALERTS */}
        {activeTab === 'Birthday Alerts' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Birthdays System</h3>
              <Gift className="w-5 h-5 text-[#C9A84C]" />
            </div>
            <p className="text-xs text-#6B7280 leading-relaxed font-normal">
              Tenant dates of birth are completely protected under compliance privacy. This dashboard alerts management to send congratulations securely.
            </p>
            
            <div className="space-y-3">
              {birthdays.map((bday, index) => (
                <div key={index} className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <strong className="block text-#132A1D text-sm">{bday.name}</strong>
                    <span className="text-stone-400 block font-normal">Birthday: {bday.bday} &bull; Age: {bday.age} Years Old</span>
                  </div>
                  <button onClick={() => handleTriggerBdayAlert(bday.name, bday.phone)} className="px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white text-[10px] font-semibold rounded-lg cursor-pointer">
                    Dispatch SMS Vow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 18: PLATFORM STATS */}
        {activeTab === 'Platform Stats' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6">
            <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Platform Metrics &amp; Health</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-800 font-semibold blocking">Rent Collection Volume</span>
                <span className="text-2xl font-semibold text-emerald-950 block">₦28.4M</span>
                <span className="text-[9px] text-[#18452E] font-mono">100% Ledger Integrity Cleared</span>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-teal-800 font-semibold blocking">Overall Occupancy Rate</span>
                <span className="text-2xl font-semibold text-teal-950 block">85.4%</span>
                <span className="text-[9px] text-teal-700 font-mono">30 properties active tracking</span>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold blocking">Affiliate Dispatch Rate</span>
                <span className="text-2xl font-semibold text-amber-950 block">100%</span>
                <span className="text-[9px] text-[#C9A84C] font-mono">14 business days payment cycle</span>
              </div>
            </div>

            <div className="p-5 border border-stone-200 rounded-2xl space-y-2">
              <span className="text-xs uppercase font-mono text-stone-400 block font-semibold">Nigeria Real Estate Safety Chart Index</span>
              <div className="h-6 bg-[#16A34A] rounded-md flex items-center justify-center text-[10px] text-white font-mono font-semibold tracking-wide">
                98% Safety Score Index (98% transaction free of litigation/scam)
              </div>
            </div>
          </div>
        )}

        {/* TAB: COMPLIANCE CONTROL CENTER */}
        {activeTab === 'Compliance' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6">
            <div>
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase flex items-center gap-2">
                <span>COMPLIANCE &amp; PMC AGREEMENT CONTROL CENTER</span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] rounded-full font-mono font-semibold uppercase tracking-wider">
                  System Controller
                </span>
              </h3>
              <p className="text-xs text-#6B7280">
                Manage PMC management agreements, review real-time compliance anomalies, assign properties to PMCs, and approve requested fee changes.
              </p>
            </div>

            {/* SECTION 1: PENDING FEE CHANGE REQUESTS */}
            <div className="p-5 border border-stone-200 rounded-2xl bg-amber-50/80/30 space-y-4">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <div>
                  <h4 className="font-display font-semibold text-[#18452E] text-xs uppercase">Pending Fee Change Proposals</h4>
                  <p className="text-[10px] text-#6B7280">Proposals submitted by PMCs awaiting regulatory admin sign-off.</p>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 border border-amber-200 text-amber-800 font-mono text-[9px] font-semibold rounded-md">
                  {feeRequests.filter(r => r.status === 'Pending').length} Pending Approval
                </span>
              </div>

              {feeRequests.filter(r => r.status === 'Pending').length === 0 ? (
                <p className="text-center py-4 text-xs text-stone-400 italic">No pending management fee change proposals.</p>
              ) : (
                <div className="space-y-3">
                  {feeRequests.filter(r => r.status === 'Pending').map((req: any) => {
                    const handleApprove = () => {
                      // 1. Update managementCompanyProperties
                      const updatedMcp = managementCompanyProperties.map((m: any) => {
                        if (m.propertyName === req.propertyName && m.company_id === req.pmcName && m.is_active !== false) {
                          return { ...m, management_fee_percentage: req.proposedPercentage };
                        }
                        return m;
                      });
                      if (setManagementCompanyProperties) {
                        setManagementCompanyProperties(updatedMcp);
                      }

                      // 2. Update request status to 'Approved'
                      const updatedRequests = feeRequests.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r);
                      setFeeRequests(updatedRequests);
                      localStorage.setItem('uh_fee_change_requests_v1', JSON.stringify(updatedRequests));

                      // 3. Append to system activity logs
                      appendAuditLog({
                        actionType: 'FEE_CHANGE_APPROVED',
                        recordAffected: req.propertyName,
                        recordId: req.propertyId || req.id,
                        previousValue: `${req.currentPercentage}%`,
                        newValue: `${req.proposedPercentage}%`,
                        details: `Admin approved management fee percentage change for '${req.propertyName}' managed by '${req.pmcName}' from ${req.currentPercentage}% to ${req.proposedPercentage}%.`
                      });

                      triggerSuccess(`Successfully approved management fee change to ${req.proposedPercentage}% for '${req.propertyName}'!`);
                      window.dispatchEvent(new Event('storage'));
                    };

                    const handleReject = () => {
                      const updatedRequests = feeRequests.map(r => r.id === req.id ? { ...r, status: 'Rejected' } : r);
                      setFeeRequests(updatedRequests);
                      localStorage.setItem('uh_fee_change_requests_v1', JSON.stringify(updatedRequests));

                      appendAuditLog({
                        actionType: 'FEE_CHANGE_REJECTED',
                        recordAffected: req.propertyName,
                        recordId: req.propertyId || req.id,
                        previousValue: `${req.currentPercentage}%`,
                        newValue: `${req.currentPercentage}%`,
                        details: `Admin rejected management fee percentage change for '${req.propertyName}' managed by '${req.pmcName}' to ${req.proposedPercentage}%.`
                      });

                      triggerSuccess(`Proposal rejected. Fee remains at ${req.currentPercentage}% for '${req.propertyName}'.`);
                      window.dispatchEvent(new Event('storage'));
                    };

                    return (
                      <div key={req.id} className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-stone-850 text-xs block">{req.propertyName}</span>
                            <span className="text-[10px] text-#6B7280 font-mono">Managed by: <strong>{req.pmcName}</strong></span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 font-mono block">Submitted: {req.createdAt}</span>
                            <span className="inline-flex items-center gap-1 text-xs">
                              <span className="text-#6B7280 font-mono font-semibold">{req.currentPercentage}%</span>
                              <span className="text-stone-400">&rarr;</span>
                              <span className="text-[#18452E] font-mono font-semibold">{req.proposedPercentage}%</span>
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5 bg-amber-50/80 rounded-lg text-[11px] text-stone-650 italic">
                          &ldquo;{req.reason}&rdquo;
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={handleApprove}
                            className="px-3 py-1 bg-[#18452E] hover:bg-[#18452E] text-white text-[10px] uppercase font-semibold rounded-lg cursor-pointer transition shadow-xs"
                          >
                            Approve &amp; Apply
                          </button>
                          <button
                            onClick={handleReject}
                            className="px-3 py-1 bg-white hover:bg-amber-50/80 border border-stone-200 text-#6B7280 text-[10px] uppercase font-semibold rounded-lg cursor-pointer transition"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 2: COMPLIANCE ANOMALIES (OUTSTANDING MANAGEMENT FEES) */}
            <div className="p-5 border border-stone-200 rounded-2xl bg-rose-50/10 space-y-4">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <div>
                  <h4 className="font-display font-semibold text-rose-800 text-xs uppercase flex items-center gap-1.5">
                    <span>Outstanding Compliance Anomalies</span>
                  </h4>
                  <p className="text-[10px] text-#6B7280">Properties assigned to PMCs but missing their mandatory contract management fee percentage.</p>
                </div>
                <span className="px-2 py-0.5 bg-rose-100 border border-rose-200 text-rose-800 font-mono text-[9px] font-semibold rounded-md">
                  {managementCompanyProperties.filter((m: any) => m.management_fee_percentage === undefined || m.management_fee_percentage === null).length} Flagged
                </span>
              </div>

              {managementCompanyProperties.filter((m: any) => m.management_fee_percentage === undefined || m.management_fee_percentage === null).length === 0 ? (
                <div className="p-6 bg-emerald-50/50 border border-emerald-200 rounded-xl text-center space-y-1">
                  <span className="text-emerald-800 font-semibold text-xs block">🛡️ All Contracts Fully Compliant</span>
                  <span className="text-#6B7280 text-[10px]">No active property management agreements are missing fee metrics. No profit calculations are blocked.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {managementCompanyProperties.filter((m: any) => m.management_fee_percentage === undefined || m.management_fee_percentage === null).map((mcp: any) => {
                    return (
                      <div key={mcp.id} className="p-4 bg-white border border-rose-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-850 text-xs">{mcp.propertyName}</span>
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[8px] rounded-full font-mono font-semibold uppercase tracking-wider">
                              Management Fee Not Set
                            </span>
                          </div>
                          <span className="text-[10px] text-#6B7280 block font-mono">
                            Managed by: <strong>{mcp.company_id}</strong> &bull; Building ID: {mcp.buildingId}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            step="0.1"
                            placeholder="Fee % (1-50)"
                            id={`rectify-fee-${mcp.id}`}
                            className="w-28 p-1.5 bg-white border border-stone-200 rounded-lg text-xs outline-none text-center font-mono"
                          />
                          <button
                            onClick={() => {
                              const inputEl = document.getElementById(`rectify-fee-${mcp.id}`) as HTMLInputElement;
                              const val = parseFloat(inputEl?.value);
                              if (isNaN(val) || val < 1 || val > 50) {
                                alert("Please enter a valid percentage rate between 1 and 50.");
                                return;
                              }
                              // Rectify
                              const updated = managementCompanyProperties.map((p: any) => {
                                if (p.id === mcp.id) {
                                  return { ...p, management_fee_percentage: val };
                                }
                                return p;
                              });
                              if (setManagementCompanyProperties) {
                                setManagementCompanyProperties(updated);
                              }
                              appendAuditLog({
                                actionType: 'COMPLIANCE_RECTIFIED',
                                recordAffected: mcp.propertyName,
                                recordId: mcp.id,
                                previousValue: 'Not Set',
                                newValue: `${val}%`,
                                details: `Admin rectified compliance anomaly for '${mcp.propertyName}' (managed by ${mcp.company_id}). Set agreed fee rate to ${val}%.`
                              });
                              triggerSuccess(`Compliance anomaly resolved! Agreed fee set to ${val}% for '${mcp.propertyName}'.`);
                              window.dispatchEvent(new Event('storage'));
                            }}
                            className="px-3 py-1.5 bg-[#18452E] hover:bg-[#18452E] text-white text-[11px] font-semibold rounded-lg cursor-pointer transition shadow-xs"
                          >
                            Rectify &amp; Save
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 3: ASSIGN PROPERTY TO PROPERTY MANAGEMENT COMPANY (PMC) */}
            <div className="p-5 border border-stone-200 rounded-2xl bg-amber-50/80/10 space-y-4">
              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-display font-semibold text-[#18452E] text-xs uppercase">Assign Property to Management Company</h4>
                <p className="text-[10px] text-#6B7280">Draft a management agreement to delegate landlord portfolio assets to active PMCs.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!assignPropertyId || !assignPmcId || !assignFeePct) {
                    alert("Please complete all required fields.");
                    return;
                  }
                  const fee = parseFloat(assignFeePct);
                  if (isNaN(fee) || fee < 1 || fee > 50) {
                    alert("Management fee must be between 1 and 50 percent.");
                    return;
                  }
                  const selectedProperty = properties.find(p => p.id === assignPropertyId);
                  if (!selectedProperty) return;

                  // CreateMCP
                  const newMcp = {
                    id: `mcp-${Date.now()}`,
                    buildingId: selectedProperty.id,
                    propertyName: selectedProperty.title,
                    company_id: assignPmcId,
                    is_active: true,
                    management_fee_percentage: fee
                  };

                  if (setManagementCompanyProperties) {
                    setManagementCompanyProperties(prev => [newMcp, ...prev]);
                  }

                  appendAuditLog({
                    actionType: 'PROPERTY_ASSIGNED',
                    recordAffected: selectedProperty.title,
                    recordId: selectedProperty.id,
                    previousValue: 'None',
                    newValue: `${assignPmcId} (${fee}%)`,
                    details: `Assigned property '${selectedProperty.title}' to PMC '${assignPmcId}' with an agreed management fee of ${fee}%.`
                  });

                  // Reset inputs
                  setAssignPropertyId('');
                  setAssignPmcId('');
                  setAssignFeePct('');
                  triggerSuccess(`Successfully assigned property '${selectedProperty.title}' to PMC '${assignPmcId}' at ${fee}% management fee!`);
                  window.dispatchEvent(new Event('storage'));
                }}
                className="space-y-4 text-xs font-sans"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Property */}
                  <div>
                    <label className="block text-[9px] font-mono font-semibold text-#6B7280 uppercase mb-1">Select Asset Property</label>
                    <select
                      required
                      value={assignPropertyId}
                      onChange={(e) => setAssignPropertyId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs outline-none"
                    >
                      <option value="">-- Choose Property --</option>
                      {properties.map(p => {
                        const isAssigned = managementCompanyProperties.some((m: any) => m.propertyName === p.title && m.is_active !== false);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.title} {isAssigned ? '(Assigned)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Select PMC */}
                  <div>
                    <label className="block text-[9px] font-mono font-semibold text-#6B7280 uppercase mb-1">Select Property Management Company</label>
                    <select
                      required
                      value={assignPmcId}
                      onChange={(e) => setAssignPmcId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs outline-none"
                    >
                      <option value="">-- Choose PMC --</option>
                      {mockPMCs.map((pmc: any) => (
                        <option key={pmc.id} value={pmc.name}>{pmc.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Fee Percentage */}
                  <div>
                    <label className="block text-[9px] font-mono font-semibold text-#6B7280 uppercase mb-1">Agreed Management Fee (%)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="50"
                      step="0.1"
                      placeholder="Enter rate e.g. 12"
                      value={assignFeePct}
                      onChange={(e) => setAssignFeePct(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-lg text-xs outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="bg-[#18452E]/5 p-3 rounded-xl border border-[#0E2F1F]/10 text-[10px] text-stone-650 flex flex-col space-y-1">
                  <span>💡 <strong>Regulatory Helper Note:</strong> This rate represents the PMC&apos;s cut of collected rents. Accepts values between 1 and 50 percent. Upon saving, the property record is linked to the PMC with this rate, and the action is logged to the system activity log.</span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl cursor-pointer transition shadow-sm text-xs"
                  >
                    Create and Authorize Agreement
                  </button>
                </div>
              </form>
            </div>

            {/* SECTION 4: GENERAL PMC AGREEMENT LEDGER */}
            <div className="p-5 border border-stone-200 rounded-2xl space-y-4">
              <div>
                <h4 className="font-display font-semibold text-[#18452E] text-xs uppercase">Accredited PMC Agreement Registry</h4>
                <p className="text-[10px] text-#6B7280">Every active property management agreement currently authenticated across the portfolio.</p>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xl divide-y">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-amber-50/80 text-[10px] font-mono uppercase text-stone-400 border-b">
                      <th className="p-3">Property Name</th>
                      <th className="p-3">Management Company</th>
                      <th className="p-3 text-center">Agreed Fee Rate</th>
                      <th className="p-3 text-right">Contract Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {managementCompanyProperties.map((mcp: any) => (
                      <tr key={mcp.id} className="hover:bg-amber-50/80/50">
                        <td className="p-3 font-semibold text-#132A1D">{mcp.propertyName}</td>
                        <td className="p-3 text-stone-550">{mcp.company_id}</td>
                        <td className="p-3 text-center font-mono font-semibold text-[#18452E]">
                          {mcp.management_fee_percentage !== undefined ? `${mcp.management_fee_percentage}%` : 'Not Set'}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold font-mono uppercase ${
                            mcp.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50/80 text-#6B7280'
                          }`}>
                            {mcp.is_active !== false ? 'Active' : 'Terminated'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 19: TRANSPARENCY LEDGER */}
        {activeTab === 'Transparency Ledger' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6">
            <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">Global Transparency Ledger</h3>
            <p className="text-xs text-#6B7280">Every transaction, edit, upload, and approval on the platform is permanently logged here. Nothing hidden.</p>
            
            <div className="space-y-3 font-mono text-[10px]">
              <div className="p-3 bg-amber-50/80 border-l-2 border-[#0E2F1F] rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">RENT_PAYMENT_CLEARANCE</strong>
                  <span className="text-stone-400">2026-06-25 14:32:01 UTC</span>
                </div>
                <p className="text-#6B7280">Tenant Kola Abiodun (T1) paid ₦2,500,000 for Adebayo Lekki Heights (A1). Sent direct to GTB ***4392.</p>
              </div>

              <div className="p-3 bg-amber-50/80 border-l-2 border-amber-400 rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">DOCUMENT_UPLOAD_VERIFIED</strong>
                  <span className="text-stone-400">2026-06-25 10:15:44 UTC</span>
                </div>
                <p className="text-#6B7280">Prime Property Solutions uploaded CAC Corporate Registration. System verified RC-9988120.</p>
              </div>

              <div className="p-3 bg-amber-50/80 border-l-2 border-emerald-600 rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">MAINTENANCE_LOG_CREATED</strong>
                  <span className="text-stone-400">2026-06-24 09:22:11 UTC</span>
                </div>
                <p className="text-#6B7280">Landlord Babatunde Osei logged Plumbing Fix for The Oasis Towers (B2). Cost: ₦45,000. Status: Awaiting.</p>
              </div>

              {damageReports.slice(0, 3).map(dr => (
                <div key={dr.id} className="p-3 bg-amber-50/80 border-l-2 border-amber-600 rounded-r-xl">
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-#132A1D">DAMAGE_REPORT_LOGGED</strong>
                    <span className="text-stone-400">{dr.dateReported} UTC</span>
                  </div>
                  <p className="text-#6B7280">Shortlet Manager {dr.managerName} reported {dr.damageCategory} damage for {dr.propertyName}. Cost Estimate: ₦{dr.estimatedCost.toLocaleString()}. Status: {dr.status}.</p>
                </div>
              ))}

              <div className="p-3 bg-amber-50/80 border-l-2 border-rose-600 rounded-r-xl">
                <div className="flex justify-between items-center mb-1">
                  <strong className="text-#132A1D">DISPUTE_FILED</strong>
                  <span className="text-stone-400">2026-06-23 16:45:00 UTC</span>
                </div>
                <p className="text-#6B7280">Tenant Aisha Bello filed dispute against Landlord Dr. Chioma Okafor for unjustified Caution Deposit deduction.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 20: SETTINGS */}
        {activeTab === 'Settings' && (
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 space-y-6">
            <div>
              <h3 className="font-display font-semibold text-[#18452E] text-sm uppercase">System Settings &amp; Ledger API</h3>
              <p className="text-xs text-#6B7280">Configure global admin parameters securely. All connections operate on zero-trust token models.</p>
            </div>
            
            <div className="space-y-6 text-xs font-sans">
              <div className="p-4 bg-[#18452E]/5 border border-[#0E2F1F]/10 rounded-2xl space-y-3">
                <span className="font-semibold text-[#18452E] text-sm block">Sandbox Environment Testing</span>
                <p className="text-#6B7280 leading-relaxed text-[11px]">
                  Pre-populate your tenant registers, billing, shortlet booking logs, promise-to-pay ledger, platform documents, and unread notification layers with a rich demo dataset instantly to test all real-time compliance and automation engines.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={() => {
                      generateDemoDataset();
                      triggerSuccess('Sandbox Demo Dataset reset and reloaded from scratch successfully!');
                    }}
                    className="flex-1 py-2 px-4 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-center cursor-pointer transition shadow-sm"
                  >
                    Reset and Reload Demo Data
                  </button>
                  <button
                    onClick={() => {
                      removeDemoDataset();
                      triggerSuccess('Sandbox Demo Dataset cleared from all registers successfully.');
                    }}
                    className="flex-1 py-2 px-4 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-center cursor-pointer transition"
                  >
                    Clear Demo Dataset
                  </button>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-200/50 rounded-2xl space-y-3">
                <span className="font-semibold text-amber-800 text-sm block">PROMPT THREE &bull; Monthly summary Reports Cloud Function</span>
                <p className="text-#6B7280 leading-relaxed text-[11px]">
                  Emulate the automated Monthly Summary Cloud Function (scheduled to run at 8am Nigerian time on the first day of every month). This compiles real confirmed previous-month data, generates Unity Homes branded performance PDFs, uploads them to the database, and dispatches them as email attachments to active landlords (e.g. Mrs Adunola Fashola) and PMCs.
                </p>
                <button
                  onClick={() => {
                    triggerMonthlySummaryReportCloudFunction();
                    // Sync the local Admin email log instantly
                    try {
                      const stored = localStorage.getItem('uh_sent_emails_v1');
                      if (stored) setSentEmails(JSON.parse(stored));
                    } catch {}
                    triggerSuccess('Automated Monthly Portfolio Summary Report Cloud Function executed! Performance summaries generated and delivered successfully.');
                  }}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-center cursor-pointer transition shadow-sm"
                >
                  Trigger Scheduled Monthly Summary Reports Function
                </button>
              </div>

              <div className="p-4 bg-amber-50/80 border border-stone-200 rounded-2xl space-y-3">
                <span className="font-semibold text-[#18452E] block">Compliance Configuration Parameters</span>
                
                <div className="flex items-center justify-between">
                  <span>Mandatory Guarantor Check Gating</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#18452E]" />
                </div>

                <div className="flex items-center justify-between">
                  <span>WhatsApp Sub Inquiries Routing</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#18452E]" />
                </div>
              </div>

              <p className="text-stone-400 font-normal text-[10px] text-center italic">
                Unity Homes Admin Workspace RC-1849120 &bull; Don&apos;t Buy Wahala!
              </p>
            </div>
          </div>
        )}

        {activeTab === 'Portfolio Health' && (
          <PortfolioHealthCenter 
            properties={properties}
            landlordUnits={landlordUnits}
            bookings={bookings}
            damageReports={damageReports}
            serviceCharges={serviceCharges}
            tenantRegs={tenantApps}
          />
        )}

        {activeTab === 'Service Charges' && (
          <ServiceChargeIntelligence 
            properties={properties}
            landlordUnits={landlordUnits}
            serviceCharges={serviceCharges}
            setServiceCharges={setServiceCharges as React.Dispatch<React.SetStateAction<ServiceChargeBill[]>>}
            role="Admin"
          />
        )}

        {activeTab === 'Collections' && (
          <AICollectionCenter 
            role="Admin"
            userId="admin"
          />
        )}

      </div>

      {/* LANDLORD MODAL */}
      {selectedLandlordModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] w-full max-w-2xl overflow-hidden shadow-sm">
            <div className="bg-[#18452E] p-6 text-white flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <img src={selectedLandlordModal.photo} alt={selectedLandlordModal.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <h3 className="font-display font-semibold text-xl">{selectedLandlordModal.name}</h3>
                  <p className="text-xs font-mono text-emerald-200 mt-1">{selectedLandlordModal.type} &bull; {selectedLandlordModal.phone} &bull; {selectedLandlordModal.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLandlordModal(null)} className="p-2 hover:bg-white/10 rounded-full cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* TABS HEADER */}
              <div className="flex border-b border-stone-200">
                <button
                  onClick={() => setLandlordModalTab('details')}
                  className={`px-4 py-2 border-b-2 font-display font-semibold text-xs uppercase tracking-wider transition cursor-pointer ${
                    landlordModalTab === 'details'
                      ? 'border-[#18452E] text-[#18452E]'
                      : 'border-transparent text-stone-400 hover:text-#6B7280'
                  }`}
                >
                  Profile &amp; Details
                </button>
                <button
                  onClick={() => setLandlordModalTab('history')}
                  className={`px-4 py-2 border-b-2 font-display font-semibold text-xs uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer ${
                    landlordModalTab === 'history'
                      ? 'border-[#18452E] text-[#18452E]'
                      : 'border-transparent text-stone-400 hover:text-#6B7280'
                  }`}
                  title="This history is permanent and cannot be edited or deleted."
                >
                  <span>History</span>
                  <Lock className="w-3.5 h-3.5 text-[#18452E]" />
                </button>
              </div>

              {landlordModalTab === 'details' ? (
                <>
                  {/* PROFILE COMPLETION INDICATOR */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[#18452E] uppercase tracking-wider flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#18452E]" />
                        <span>Profile Verification Strength</span>
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">85% Complete</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#18452E] h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-#6B7280 font-mono mt-1 pt-1 border-t border-emerald-100">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">C of O Verified</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">Govt ID Scanned</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">Settlement Setup</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-amber-600 font-semibold">○</span>
                        <span className="text-#132A1D font-semibold">Corporate CAC Check</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Properties</span>
                      <strong className="font-mono text-#132A1D text-lg">{selectedLandlordModal.propertyCount}</strong>
                    </div>
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Tenants</span>
                      <strong className="font-mono text-#132A1D text-lg">{selectedLandlordModal.tenantCount}</strong>
                    </div>
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Portfolio Value</span>
                      <strong className="font-mono text-emerald-700 text-sm">₦{(selectedLandlordModal.portfolioValue / 1000000).toFixed(1)}M</strong>
                    </div>
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Outstanding</span>
                      <strong className={`font-mono text-sm ${selectedLandlordModal.outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {selectedLandlordModal.outstanding > 0 ? `₦${selectedLandlordModal.outstanding.toLocaleString()}` : 'Cleared'}
                      </strong>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-display font-semibold text-xs uppercase text-#6B7280">Service Charges &amp; Ledger History</h4>
                    <div className="p-4 bg-amber-50/80 rounded-xl border border-stone-200 text-xs text-#6B7280 font-mono">
                      All service charges up to date. Ledger shows 100% remittance rate for 2026.
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-display font-semibold text-xs uppercase text-#6B7280">Associated Documents</h4>
                    <div className="flex space-x-2">
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-[10px] font-semibold">C of O Verified</span>
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-[10px] font-semibold">Govt ID Scanned</span>
                    </div>
                  </div>
                </>
              ) : (
                <ImmutableHistory recordId={selectedLandlordModal.id} recordType="Landlord" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* TENANT MODAL */}
      {selectedTenantModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] w-full max-w-2xl overflow-hidden shadow-sm">
            <div className="bg-[#18452E] p-6 text-white flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <img src={selectedTenantModal.photo} alt={selectedTenantModal.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <h3 className="font-display font-semibold text-xl">{selectedTenantModal.name}</h3>
                  <p className="text-xs font-mono text-emerald-200 mt-1">{selectedTenantModal.occupation} at {selectedTenantModal.employer}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTenantModal(null)} className="p-2 hover:bg-white/10 rounded-full cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* TENANCY RECORD SUMMARY */}
              <div className=" text-white p-5 rounded-2xl space-y-3.5 shadow-sm">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h4 className="font-display font-semibold text-xs uppercase tracking-wide text-emerald-300">Tenancy Lifetime Summary</h4>
                  <span className="text-[9px] font-mono font-semibold bg-white/15 px-2 py-0.5 rounded uppercase tracking-wider text-white">System Audited</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="block text-[8px] uppercase text-emerald-200/70 font-sans tracking-wider font-semibold mb-1">Time on Platform</span>
                    <strong className="text-sm text-white font-semibold block">1 Yr, 4 Months</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-emerald-200/70 font-sans tracking-wider font-semibold mb-1">Properties Tenanted</span>
                    <strong className="text-sm text-white font-semibold block">2 Distinct</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-emerald-200/70 font-sans tracking-wider font-semibold mb-1">Lifetime Rent Paid</span>
                    <strong className="text-sm text-emerald-300 font-semibold block">₦3,750,000.00</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-emerald-200/70 font-sans tracking-wider font-semibold mb-1">Service Bills Paid</span>
                    <strong className="text-sm text-white font-semibold block">14 Periodical</strong>
                  </div>
                </div>
              </div>

              {/* TABS HEADER */}
              <div className="flex border-b border-stone-200">
                <button
                  onClick={() => setTenantModalTab('details')}
                  className={`px-4 py-2 border-b-2 font-display font-semibold text-xs uppercase tracking-wider transition cursor-pointer ${
                    tenantModalTab === 'details'
                      ? 'border-[#18452E] text-[#18452E]'
                      : 'border-transparent text-stone-400 hover:text-#6B7280'
                  }`}
                >
                  Profile &amp; Details
                </button>
                <button
                  onClick={() => setTenantModalTab('history')}
                  className={`px-4 py-2 border-b-2 font-display font-semibold text-xs uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer ${
                    tenantModalTab === 'history'
                      ? 'border-[#18452E] text-[#18452E]'
                      : 'border-transparent text-stone-400 hover:text-#6B7280'
                  }`}
                  title="This history is permanent and cannot be edited or deleted."
                >
                  <span>History</span>
                  <Lock className="w-3.5 h-3.5 text-[#18452E]" />
                </button>
              </div>

              {tenantModalTab === 'details' ? (
                <>
                  {/* PROFILE COMPLETION INDICATOR */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[#18452E] uppercase tracking-wider flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#18452E]" />
                        <span>Tenant Profile Verification Strength</span>
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">100% Complete</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#18452E] h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-#6B7280 font-mono mt-1 pt-1 border-t border-emerald-100">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">Bio &amp; Photo uploaded</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">Guarantor Verification</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">Employment confirmed</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">References Cleared</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div><span className="block text-[9px] text-stone-400 uppercase">Gender</span><strong>{selectedTenantModal.gender}</strong></div>
                    <div><span className="block text-[9px] text-stone-400 uppercase">DOB</span><strong>{selectedTenantModal.dob}</strong></div>
                    <div><span className="block text-[9px] text-stone-400 uppercase">Status</span><strong>{selectedTenantModal.relationship}</strong></div>
                    <div><span className="block text-[9px] text-stone-400 uppercase">Phone</span><strong className="font-mono">{selectedTenantModal.phone}</strong></div>
                    <div className="col-span-2"><span className="block text-[9px] text-stone-400 uppercase">Email</span><strong className="font-mono">{selectedTenantModal.email}</strong></div>
                  </div>
                  
                  <div className="p-4 bg-amber-50/80 rounded-xl border border-stone-200 space-y-3">
                    <h4 className="font-display font-semibold text-xs uppercase text-[#18452E]">Tenancy Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div><span className="block text-[9px] text-stone-400 uppercase">Property</span><strong>{selectedTenantModal.property} ({selectedTenantModal.unit})</strong></div>
                      <div><span className="block text-[9px] text-stone-400 uppercase">Rent</span><strong className="font-mono text-[#18452E]">₦{selectedTenantModal.rentAmount.toLocaleString()}</strong></div>
                      <div><span className="block text-[9px] text-stone-400 uppercase">Lease Period</span><strong className="font-mono">{selectedTenantModal.leaseStart} to {selectedTenantModal.leaseEnd}</strong></div>
                      <div><span className="block text-[9px] text-stone-400 uppercase">Payment History</span><strong className="text-emerald-600">{selectedTenantModal.paymentHistory}</strong></div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                    <h4 className="font-display font-semibold text-xs uppercase text-amber-900">Guarantor Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div><span className="block text-[9px] text-amber-700 uppercase">Name</span><strong className="text-amber-900">{selectedTenantModal.guarantor.name} ({selectedTenantModal.guarantor.relationship})</strong></div>
                      <div><span className="block text-[9px] text-amber-700 uppercase">Phone</span><strong className="font-mono text-amber-900">{selectedTenantModal.guarantor.phone}</strong></div>
                      <div><span className="block text-[9px] text-amber-700 uppercase">Occupation</span><strong className="text-amber-900">{selectedTenantModal.guarantor.occupation}</strong></div>
                      <div><span className="block text-[9px] text-amber-700 uppercase">Address</span><strong className="text-amber-900">{selectedTenantModal.guarantor.address}</strong></div>
                    </div>
                  </div>
                </>
              ) : (
                <ImmutableHistory recordId={selectedTenantModal.id} recordType="Tenant" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* PMC MODAL */}
      {selectedPMCModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] w-full max-w-2xl overflow-hidden shadow-sm">
            <div className="bg-[#18452E] p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="font-display font-semibold text-xl">{selectedPMCModal.name}</h3>
                <p className="text-xs font-mono text-emerald-200 mt-1">{selectedPMCModal.address} &bull; {selectedPMCModal.phone} &bull; {selectedPMCModal.email}</p>
              </div>
              <button onClick={() => setSelectedPMCModal(null)} className="p-2 hover:bg-white/10 rounded-full cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* TABS HEADER */}
              <div className="flex border-b border-stone-200">
                <button
                  onClick={() => setPmcModalTab('details')}
                  className={`px-4 py-2 border-b-2 font-display font-semibold text-xs uppercase tracking-wider transition cursor-pointer ${
                    pmcModalTab === 'details'
                      ? 'border-[#18452E] text-[#18452E]'
                      : 'border-transparent text-stone-400 hover:text-#6B7280'
                  }`}
                >
                  Profile &amp; Details
                </button>
                <button
                  onClick={() => setPmcModalTab('history')}
                  className={`px-4 py-2 border-b-2 font-display font-semibold text-xs uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer ${
                    pmcModalTab === 'history'
                      ? 'border-[#18452E] text-[#18452E]'
                      : 'border-transparent text-stone-400 hover:text-#6B7280'
                  }`}
                  title="This history is permanent and cannot be edited or deleted."
                >
                  <span>History</span>
                  <Lock className="w-3.5 h-3.5 text-[#18452E]" />
                </button>
              </div>

              {pmcModalTab === 'details' ? (
                <>
                  {/* PROFILE COMPLETION INDICATOR */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[#18452E] uppercase tracking-wider flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#18452E]" />
                        <span>Corporate Profile Strength</span>
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">90% Complete</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#18452E] h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-#6B7280 font-mono mt-1 pt-1 border-t border-emerald-100">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">CAC Certificate Verified</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">Tax ID Compliance verified</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">Professional Indemnity Scan</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-amber-600 font-semibold">○</span>
                        <span className="text-#132A1D font-semibold">Regulatory Audited Rating</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Landlords</span>
                      <strong className="font-mono text-#132A1D text-lg">{selectedPMCModal.landlordsManaged}</strong>
                    </div>
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Properties</span>
                      <strong className="font-mono text-#132A1D text-lg">{selectedPMCModal.propertiesManaged}</strong>
                    </div>
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Tenants</span>
                      <strong className="font-mono text-#132A1D text-lg">{selectedPMCModal.tenantsManaged}</strong>
                    </div>
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Staff Count</span>
                      <strong className="font-mono text-#132A1D text-lg">{selectedPMCModal.staffCount}</strong>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50/80 rounded-xl border border-stone-200 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-#6B7280 font-semibold uppercase">Subscription Tier</span>
                      <strong className="text-[#18452E]">{selectedPMCModal.subscription}</strong>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-#6B7280 font-semibold uppercase">YTD Collection History</span>
                      <strong className="font-mono text-emerald-600">{selectedPMCModal.collectionHistory}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <ImmutableHistory recordId={selectedPMCModal.id} recordType="PMC" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHORTLET MANAGER MODAL */}
      {selectedShortletModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[var(--radius-large)] w-full max-w-2xl overflow-hidden shadow-sm">
            <div className="bg-[#18452E] p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="font-display font-semibold text-xl">{selectedShortletModal.name}</h3>
                <p className="text-xs font-mono text-emerald-200 mt-1">Manager: {selectedShortletModal.manager}</p>
              </div>
              <button onClick={() => setSelectedShortletModal(null)} className="p-2 hover:bg-white/10 rounded-full cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* TABS HEADER */}
              <div className="flex border-b border-stone-200">
                <button
                  onClick={() => setShortletModalTab('details')}
                  className={`px-4 py-2 border-b-2 font-display font-semibold text-xs uppercase tracking-wider transition cursor-pointer ${
                    shortletModalTab === 'details'
                      ? 'border-[#18452E] text-[#18452E]'
                      : 'border-transparent text-stone-400 hover:text-#6B7280'
                  }`}
                >
                  Profile &amp; Details
                </button>
                <button
                  onClick={() => setShortletModalTab('history')}
                  className={`px-4 py-2 border-b-2 font-display font-semibold text-xs uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer ${
                    shortletModalTab === 'history'
                      ? 'border-[#18452E] text-[#18452E]'
                      : 'border-transparent text-stone-400 hover:text-#6B7280'
                  }`}
                  title="This history is permanent and cannot be edited or deleted."
                >
                  <span>History</span>
                  <Lock className="w-3.5 h-3.5 text-[#18452E]" />
                </button>
              </div>

              {shortletModalTab === 'details' ? (
                <>
                  {/* PROFILE COMPLETION INDICATOR */}
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[#18452E] uppercase tracking-wider flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#18452E]" />
                        <span>Manager Profile Strength</span>
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">75% Complete</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#18452E] h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    {/* Checklist */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-#6B7280 font-mono mt-1 pt-1 border-t border-emerald-100">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">ID Verification scan</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">Escrow Security Escrow</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-emerald-600 font-semibold">✓</span>
                        <span className="line-through text-stone-400">Interactive Host Course</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-amber-600 font-semibold">○</span>
                        <span className="text-#132A1D font-semibold">Review Rating Audit (&gt;=4.0)</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Properties</span>
                      <strong className="font-mono text-#132A1D text-lg">{selectedShortletModal.propertiesManaged}</strong>
                    </div>
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Bookings</span>
                      <strong className="font-mono text-#132A1D text-lg">{selectedShortletModal.bookingsLogged}</strong>
                    </div>
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Revenue</span>
                      <strong className="font-mono text-#132A1D">₦{(selectedShortletModal.revenueManaged / 1000000).toFixed(1)}M</strong>
                    </div>
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-stone-200">
                      <span className="text-[9px] uppercase font-mono text-stone-400 block">Commission</span>
                      <strong className="font-mono text-emerald-600">₦{(selectedShortletModal.commissionEarned / 1000000).toFixed(2)}M</strong>
                    </div>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-xs flex justify-between items-center">
                    <span className="text-teal-800 font-semibold uppercase">Remittance Performance</span>
                    <strong className="font-mono text-teal-900 text-lg">{selectedShortletModal.remittancePerformance}</strong>
                  </div>
                </>
              ) : (
                <ImmutableHistory recordId={selectedShortletModal.id} recordType="Shortlet Manager" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* EMAIL PREVIEW MODAL */}
      {selectedEmailPreview && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] w-full max-w-2xl overflow-hidden shadow-sm animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-150 flex justify-between items-center bg-[#18452E] text-white">
              <div>
                <h4 className="font-display font-semibold text-xs uppercase tracking-wider">Receipt Email Inspector</h4>
                <p className="text-[10px] opacity-85 mt-0.5 font-mono">Recipient: {selectedEmailPreview.recipientEmail} &bull; Ref: {selectedEmailPreview.id}</p>
              </div>
              <button 
                onClick={() => setSelectedEmailPreview(null)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-amber-50/80 flex-1 space-y-4">
              <div className="bg-white p-4 border border-stone-200 rounded-xl text-xs space-y-1 font-mono">
                <div><span className="font-semibold text-#6B7280">To:</span> {selectedEmailPreview.recipientEmail}</div>
                <div><span className="font-semibold text-#6B7280">Subject:</span> {selectedEmailPreview.subject}</div>
                <div><span className="font-semibold text-#6B7280">Sent At:</span> {new Date(selectedEmailPreview.sentAt).toLocaleString()}</div>
                <div>
                  <span className="font-semibold text-#6B7280">Attachments:</span>{' '}
                  {selectedEmailPreview.attachments?.map((att: any) => (
                    <span key={att.fileName} className="bg-amber-50 text-[#C9A84C] border border-amber-400/20 px-1.5 py-0.5 rounded font-semibold text-[10px] inline-flex items-center space-x-1">
                      <FileText className="w-3 h-3 inline" />
                      <span>{att.fileName}</span>
                    </span>
                  )) || <span className="text-stone-400">None</span>}
                </div>
                <div>
                  <span className="font-semibold text-#6B7280">Status:</span>{' '}
                  <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] uppercase ${
                    selectedEmailPreview.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {selectedEmailPreview.status}
                  </span>
                </div>
                {selectedEmailPreview.errorMessage && (
                  <div className="text-rose-600 bg-rose-50 p-2 rounded mt-2 border border-rose-150 text-[11px]">
                    <strong>SMTP Gateway Error:</strong> {selectedEmailPreview.errorMessage}
                  </div>
                )}
              </div>

              {/* Render HTML Body within a safe div */}
              <div className="border border-stone-200 rounded-xl bg-white p-4 overflow-x-auto shadow-inner">
                <div dangerouslySetInnerHTML={{ __html: selectedEmailPreview.body }} />
              </div>

              {/* Display Transparency Certificate PDF Mock Content if exists */}
              {selectedEmailPreview.attachments?.[0] && (
                <div className="border border-amber-400/30 bg-amber-50/20 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-#6B7280 uppercase tracking-wider">
                    <FileLock className="w-4 h-4 text-[#C9A84C]" />
                    <span>Attached Document: {selectedEmailPreview.attachments[0].fileName}</span>
                  </div>
                  <pre className="text-[10px] font-mono text-#6B7280 whitespace-pre bg-white border border-stone-200 p-4 rounded-lg overflow-x-auto leading-relaxed">
                    {selectedEmailPreview.attachments[0].content}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-stone-150 bg-amber-50/80 flex justify-end">
              <button 
                onClick={() => setSelectedEmailPreview(null)}
                className="px-4 py-2 bg-[#18452E] hover:bg-[#18452E] text-white font-semibold rounded-xl text-xs cursor-pointer transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotifications && (
        <NotificationFeed onClose={() => setShowNotifications(false)} role="Admin" targetId="Admin" />
      )}

      <MobileBottomNav 
        role="Admin"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setShowNotifications={setShowNotifications}
        hasUnread={hasUnreadNotifications}
      />
    </div>
  );
}
