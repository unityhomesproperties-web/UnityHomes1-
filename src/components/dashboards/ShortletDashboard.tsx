import MobileBottomNav from "./MobileBottomNav";
import NotificationFeed from "./NotificationFeed";
import ConnectivityIndicator from "./ConnectivityIndicator";
import PlatformAnnouncements from "./PlatformAnnouncements";
import OperationsBriefingCard from "./OperationsBriefingCard";
import SupportCenter from "./SupportCenter";
import QuickSupportButton from "./QuickSupportButton";
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Activity, BookOpen, PlusCircle, CheckCircle, 
  Send, Landmark, Calendar, RefreshCw, Layers, AlertTriangle,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Percent, Award,
  FileText, FileSpreadsheet, Download, Bookmark, BookmarkCheck, Trash2, Plus, Search, Clock, Wifi, WifiOff, MapPin, User, Check, CheckCircle2, Megaphone, HelpCircle,
  Eye, ShieldCheck, Filter, ArrowRight, Camera, Phone, FileCheck, CreditCard, ExternalLink, RotateCcw, Building2, History, X, UserCheck, AlertCircle, Bell, ShieldAlert
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { BookingLog, UserSession, DamageReport } from '../../types';
import { initialShortletAgreements } from '../../data';
import { useLiveCollection, getUserTargetId } from '../../lib/database';

interface ShortletDashboardProps {
  session: UserSession;
  bookings: BookingLog[];
  setBookings: React.Dispatch<React.SetStateAction<BookingLog[]>>;
  damageReports: DamageReport[];
  setDamageReports: React.Dispatch<React.SetStateAction<DamageReport[]>>;
}

export default function ShortletDashboard({
  session,
  bookings,
  setBookings,
  damageReports,
  setDamageReports
}: ShortletDashboardProps) {

  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'Overview' | 'LogBooking' | 'LogRemittance' | 'History' | 'DamageReport' | 'EarningsPortfolio' | 'Profile' | 'Support'>('Overview');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Profile Completion state checklist
  const [profileState, setProfileState] = useState({
    photoUploaded: true,
    phoneVerified: true,
    collectionAccountVerified: true,
    managementAgreementUploaded: true,
    bankNameMatchesRealName: false
  });

  // Property detail modal active tab
  const [propertyDetailTab, setPropertyDetailTab] = useState<'info' | 'agreements' | 'history'>('info');

  // Remittance dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReasonInput, setDisputeReasonInput] = useState('');
  const [disputedRemittanceId, setDisputedRemittanceId] = useState<string | null>(null);
  
  // Real-time listener for Shortlet Manager notifications
  const shortletManagerId = getUserTargetId(session);
  const shortletNotifications = useLiveCollection('notifications', [], (allNotifs) => {
    return allNotifs.filter(n => n.role === 'Shortlet Manager' && (!shortletManagerId || n.targetId === shortletManagerId || n.targetId === ''));
  });
  const hasUnreadNotifications = shortletNotifications.some(n => !n.read);
  const [subTab, setSubTab] = useState<'Analysis' | 'Ranking'>('Analysis');

  // Integrations states
  const [historySubTab, setHistorySubTab] = useState<'bookings' | 'remittances'>('bookings');
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  
  // Saved Filters states
  const [savedBookingFilters, setSavedBookingFilters] = useState<any[]>([]);
  const [savedRemittanceFilters, setSavedRemittanceFilters] = useState<any[]>([]);
  
  const [bookingFilters, setBookingFilters] = useState({
    source: 'All',
    property: 'All',
    quarter: 'All',
    search: ''
  });

  const [remittanceFilters, setRemittanceFilters] = useState({
    status: 'All',
    property: 'All',
    quarter: 'All',
    search: ''
  });

  const [showSaveBookingFilterName, setShowSaveBookingFilterName] = useState(false);
  const [bookingFilterNameInput, setBookingFilterNameInput] = useState('');
  const [showSaveRemitFilterName, setShowSaveRemitFilterName] = useState(false);
  const [remitFilterNameInput, setRemitFilterNameInput] = useState('');

  // Selected details modals states
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<BookingLog | null>(null);
  const [selectedDetailRemittance, setSelectedDetailRemittance] = useState<BookingLog | null>(null);
  const [selectedDetailProperty, setSelectedDetailProperty] = useState<any | null>(null);
  const [selectedDetailDamage, setSelectedDetailDamage] = useState<DamageReport | null>(null);

  // Recently Viewed tracker
  const addToShortletRecentlyViewed = (item: { id: string; type: string; name: string; subtext: string }) => {
    try {
      const raw = sessionStorage.getItem('uh_recently_viewed_shortlet_v1');
      let current = raw ? JSON.parse(raw) : [];
      current = current.filter((i: any) => !(i.id === item.id && i.type === item.type));
      current.unshift(item);
      current = current.slice(0, 6);
      sessionStorage.setItem('uh_recently_viewed_shortlet_v1', JSON.stringify(current));
      window.dispatchEvent(new Event('uh_recently_viewed_shortlet_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const loadRecentlyViewed = () => {
    try {
      const raw = sessionStorage.getItem('uh_recently_viewed_shortlet_v1');
      setRecentlyViewed(raw ? JSON.parse(raw) : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRecentlyViewed();
    const handleUpdate = () => {
      loadRecentlyViewed();
    };
    window.addEventListener('uh_recently_viewed_shortlet_updated', handleUpdate);
    return () => {
      window.removeEventListener('uh_recently_viewed_shortlet_updated', handleUpdate);
    };
  }, []);

  // Sync viewed triggers
  useEffect(() => {
    if (selectedDetailBooking) {
      addToShortletRecentlyViewed({
        id: selectedDetailBooking.id,
        type: 'booking',
        name: `Booking: ${selectedDetailBooking.guestName}`,
        subtext: selectedDetailBooking.propertyName
      });
    }
  }, [selectedDetailBooking]);

  useEffect(() => {
    if (selectedDetailRemittance) {
      addToShortletRecentlyViewed({
        id: selectedDetailRemittance.id,
        type: 'remittance',
        name: `Remittance: ${selectedDetailRemittance.guestName}`,
        subtext: selectedDetailRemittance.propertyName
      });
    }
  }, [selectedDetailRemittance]);

  useEffect(() => {
    if (selectedDetailProperty) {
      addToShortletRecentlyViewed({
        id: selectedDetailProperty.propertyId || selectedDetailProperty.propertyName,
        type: 'property',
        name: selectedDetailProperty.propertyName,
        subtext: `Landlord: ${selectedDetailProperty.landlordName}`
      });
    }
  }, [selectedDetailProperty]);

  useEffect(() => {
    if (selectedDetailDamage) {
      addToShortletRecentlyViewed({
        id: selectedDetailDamage.id,
        type: 'damage',
        name: `Damage: ${selectedDetailDamage.propertyName}`,
        subtext: selectedDetailDamage.damageCategory
      });
    }
  }, [selectedDetailDamage]);

  // Load and save filters
  useEffect(() => {
    try {
      const stored = localStorage.getItem('uh_shortlet_saved_filters_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedBookingFilters(parsed.booking || []);
        setSavedRemittanceFilters(parsed.remittance || []);
      } else {
        const defaultFilters = {
          booking: [
            { id: 'sb-1', name: 'Airbnb Bookings Only', filters: { source: 'Airbnb', property: 'All', quarter: 'All', search: '' } },
            { id: 'sb-2', name: 'Bookings for Eko Atlantic Suite', filters: { source: 'All', property: 'Eko Atlantic Suite', quarter: 'All', search: '' } }
          ],
          remittance: [
            { id: 'sr-1', name: 'Unpaid Remittances This Quarter', filters: { status: 'Unpaid', property: 'All', quarter: 'Q3', search: '' } }
          ]
        };
        localStorage.setItem('uh_shortlet_saved_filters_v1', JSON.stringify(defaultFilters));
        setSavedBookingFilters(defaultFilters.booking);
        setSavedRemittanceFilters(defaultFilters.remittance);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveCustomFilter = (type: 'booking' | 'remittance', name: string, filterObj: any) => {
    try {
      const stored = localStorage.getItem('uh_shortlet_saved_filters_v1');
      const parsed = stored ? JSON.parse(stored) : { booking: [], remittance: [] };
      const newFilter = {
        id: 'filter-' + Date.now(),
        name,
        filters: { ...filterObj }
      };
      if (type === 'booking') {
        parsed.booking = [...(parsed.booking || []), newFilter];
        setSavedBookingFilters(parsed.booking);
      } else {
        parsed.remittance = [...(parsed.remittance || []), newFilter];
        setSavedRemittanceFilters(parsed.remittance);
      }
      localStorage.setItem('uh_shortlet_saved_filters_v1', JSON.stringify(parsed));
      triggerSuccess(`Successfully saved filter: "${name}"`);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCustomFilter = (type: 'booking' | 'remittance', id: string) => {
    try {
      const stored = localStorage.getItem('uh_shortlet_saved_filters_v1');
      const parsed = stored ? JSON.parse(stored) : { booking: [], remittance: [] };
      if (type === 'booking') {
        parsed.booking = (parsed.booking || []).filter((f: any) => f.id !== id);
        setSavedBookingFilters(parsed.booking);
      } else {
        parsed.remittance = (parsed.remittance || []).filter((f: any) => f.id !== id);
        setSavedRemittanceFilters(parsed.remittance);
      }
      localStorage.setItem('uh_shortlet_saved_filters_v1', JSON.stringify(parsed));
      triggerSuccess('Custom filter configuration deleted.');
    } catch (e) {
      console.error(e);
    }
  };

  // Activity Log parser helper
  const getLogsForRecord = (recordId: string) => {
    try {
      const rawLogs = localStorage.getItem('uh_collection_logs_v1');
      const logs = rawLogs ? JSON.parse(rawLogs) : [];
      return logs.filter((log: any) => 
        log.details.toLowerCase().includes(recordId.toLowerCase())
      );
    } catch (e) {
      return [];
    }
  };

  const handleAcknowledgeRemittance = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          remittanceStatus: 'acknowledged',
          remittanceAcknowledgedAt: new Date().toISOString()
        };
      }
      return b;
    }));
    setSuccessMsg('Remittance payout acknowledged and marked verified.');
  };

  const handleDisputeRemittance = (bookingId: string, reason: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          remittanceStatus: 'disputed',
          disputeReason: reason,
          remittanceDisputedAt: new Date().toISOString()
        };
      }
      return b;
    }));
    setSuccessMsg('Remittance dispute filed successfully. Audit alert dispatched.');
  };

  // Exports handlers
  const handleExcelExport = (title: string, data: any[], columns: any[], properties: string[]) => {
    try {
      let xml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
          <style>
            table { border-collapse:collapse; font-family: 'Inter', sans-serif; }
            th { background-color: #1b4332; color: #ffffff; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
            td { padding: 6px; border: 1px solid #ddd; }
            .header-info { font-weight: bold; color: #1b4332; }
          </style>
        </head>
        <body>
          <h2>Unity Homes Shortlet Portfolio Statement</h2>
          <p><b>Report:</b> ${title}</p>
          <p><b>Shortlet Manager:</b> ${session.name}</p>
          <p><b>Export Date:</b> ${new Date().toLocaleDateString('en-NG')} ${new Date().toLocaleTimeString('en-NG')}</p>
          <p><b>Properties Included:</b> ${properties.length > 0 ? properties.join(', ') : 'All Assigned Properties'}</p>
          <br/>
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  ${columns.map(col => `<td>${col.accessor(item)}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerSuccess(`Successfully exported Excel spreadsheet for: ${title}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePdfExport = (title: string, data: any[], columns: any[], properties: string[]) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Pop-up blocked. Kindly enable pop-ups in your browser to print the PDF statement.');
        return;
      }
      const rowsHtml = data.map((item, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f9fafb'};">
          ${columns.map(col => `<td style="padding: 10px; border-bottom: 1px solid #e5e7eb; color: #374151;">${col.accessor(item)}</td>`).join('')}
        </tr>
      `).join('');

      const content = `
        <html>
        <head>
          <title>${title} - Shortlet Statement Extract</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #111827; background-color: #ffffff; }
            .badge { display: inline-block; padding: 4px 12px; background-color: #f0fdfa; color: #1b4332; border: 1px solid #d1fae5; font-size: 10px; font-weight: 700; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; }
            .header-container { border-bottom: 3px double #1b4332; padding-bottom: 20px; margin-bottom: 30px; }
            .brand-h1 { font-size: 24px; font-weight: 900; color: #1b4332; text-transform: uppercase; margin: 0 0 4px 0; }
            .meta-section { margin-top: 15px; font-size: 11px; color: #4b5563; font-family: monospace; line-height: 1.6; }
            .title-h2 { font-size: 16px; font-weight: 700; color: #111827; text-transform: uppercase; margin: 0 0 10px 0; border-left: 4px solid #1b4332; padding-left: 12px; }
            table { width: 100%; border-collapse: collapse; text-align: left; font-size: 11px; margin-top: 10px; }
            th { padding: 12px 10px; background-color: #1b4332; color: #ffffff; font-weight: 700; border-bottom: 2px solid #111827; text-transform: uppercase; }
            .footer { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 40px; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <span class="badge">Official Shortlet Portfolio extract</span>
          
          <div class="header-container">
            <h1 class="brand-h1">Unity Homes & Properties Ltd</h1>
            <p style="margin: 0; font-weight: 500; color: #2d6a4f; font-size: 12px;">Shortlet Management Division • Core ERP Ledger Extract</p>
            <div class="meta-section">
              <b>Shortlet Manager Name:</b> ${session.name}<br/>
              <b>Report Date:</b> ${new Date().toLocaleDateString('en-NG')} ${new Date().toLocaleTimeString('en-NG')}<br/>
              <b>Properties Included:</b> ${properties.length > 0 ? properties.join(', ') : 'All Assigned Properties'}
            </div>
          </div>

          <h2 class="title-h2">${title}</h2>

          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col.header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <span>Unity Homes Shortlet Suite v2.0</span>
            <span>Generated by Manager ${session.name}</span>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
      triggerSuccess(`Successfully printed PDF statement for: ${title}`);
    } catch (e) {
      console.error(e);
    }
  };
  
  // Resolve active manager agreements
  const managerAgreements = initialShortletAgreements.filter(
    a => a.managerName === session.name && !a.isManagedByMe && !a.isAwaitingAssignment
  );
  const activeAgreements = managerAgreements.length > 0 
    ? managerAgreements 
    : initialShortletAgreements.filter(a => a.managerName && !a.isManagedByMe && !a.isAwaitingAssignment);

  // Log Booking states
  const [bookingForm, setBookingForm] = useState(() => {
    const firstProp = activeAgreements.length > 0 ? activeAgreements[0].propertyName : 'Eko Atlantic Suite';
    return {
      propertyName: firstProp,
      unitNumber: 'Suite View',
      guestName: '',
      nights: '3',
      nightRate: '65000',
      bookingSource: 'Airbnb',
      cautionDepositCollected: false,
      cautionDepositAmount: '25000'
    };
  });

  // Log Remittance states
  const [remitForm, setRemitForm] = useState({
    bookingId: '',
    landlordAccount: '',
    amountRemitted: '',
    verifiedCheck: false
  });
  const [remitExpenses, setRemitExpenses] = useState('');
  const [remitTransferRef, setRemitTransferRef] = useState('');
  const [remitConfirmChecked, setRemitConfirmChecked] = useState(false);

  // Confirmation Overlays States
  const [bookingConfirmData, setBookingConfirmData] = useState<{
    propertyName: string;
    unitNumber: string;
    guestName: string;
    nights: number;
    nightRate: number;
    totalPaid: number;
    feePercent: number;
    feeAmount: number;
    remittedAmount: number;
    bookingSource: string;
    landlordName: string;
    landlordId: string;
    cautionDepositCollected: boolean;
    cautionDepositAmount: number;
  } | null>(null);

  const [remitConfirmData, setRemitConfirmData] = useState<{
    bookingId: string;
    propertyName: string;
    guestName: string;
    totalGross: number;
    managementFee: number;
    landlordShare: number;
    amountRemitted: number;
    landlordName: string;
    landlordBankName: string;
    landlordBankAccountName: string;
    landlordBankAccountNumber: string;
    landlordId: string;
  } | null>(null);

  const [resolutionModalBooking, setResolutionModalBooking] = useState<BookingLog | null>(null);

  const [resolutions, setResolutions] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('uh_caution_deposit_resolutions_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [bookingChecked, setBookingChecked] = useState(false);
  const [remitChecked, setRemitChecked] = useState(false);
  const [transferRefInput, setTransferRefInput] = useState('');

  const [damageForm, setDamageForm] = useState({
    bookingId: '',
    dateDiscovered: new Date().toISOString().split('T')[0],
    damageCategory: 'Furniture',
    severity: 'Medium',
    description: '',
    rootCause: '',
    repairVendor: '',
    estimatedCost: '',
    urgencyLevel: 'Low',
    evidenceCount: 0
  });

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.guestName) {
      alert('Kindly fill in the complete guest name.');
      return;
    }
    const nightsNum = parseInt(bookingForm.nights) || 1;
    const rateNum = parseInt(bookingForm.nightRate) || 0;
    const total = nightsNum * rateNum;

    // Look up manager agreement for this property
    const agreement = initialShortletAgreements.find(
      a => a.propertyName === bookingForm.propertyName
    );
    const feePercent = agreement ? agreement.managementFeePercent : 15;
    const feeAmount = Math.round(total * (feePercent / 100));
    const remittedAmount = total - feeAmount;

    setBookingConfirmData({
      propertyName: bookingForm.propertyName,
      unitNumber: bookingForm.unitNumber,
      guestName: bookingForm.guestName,
      nights: nightsNum,
      nightRate: rateNum,
      totalPaid: total,
      feePercent,
      feeAmount,
      remittedAmount,
      bookingSource: bookingForm.bookingSource,
      landlordName: agreement ? agreement.landlordName : 'Owner Partner',
      landlordId: agreement ? agreement.landlordId : '',
      cautionDepositCollected: bookingForm.cautionDepositCollected,
      cautionDepositAmount: bookingForm.cautionDepositCollected ? (parseInt(bookingForm.cautionDepositAmount) || 0) : 0
    });
    setBookingChecked(false);
  };

  const handleConfirmBooking = () => {
    if (!bookingConfirmData) return;

    const created: BookingLog = {
      id: 'book-' + Math.random().toString(36).substr(2, 9),
      propertyName: bookingConfirmData.propertyName,
      unitNumber: bookingConfirmData.unitNumber,
      guestName: bookingConfirmData.guestName,
      checkInDate: new Date().toISOString().split('T')[0],
      checkOutDate: new Date(Date.now() + bookingConfirmData.nights * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalPaid: bookingConfirmData.totalPaid,
      remittanceFormSent: false,
      remittanceAmount: bookingConfirmData.remittedAmount,
      managementFeeAmount: bookingConfirmData.feeAmount,
      status: 'Pending',
      bookingSource: bookingConfirmData.bookingSource as any,
      caution_deposit_collected: bookingConfirmData.cautionDepositCollected,
      caution_deposit_amount: bookingConfirmData.cautionDepositAmount
    };

    setBookings([created, ...bookings]);

    // Write to activity log
    try {
      const rawLogs = localStorage.getItem('uh_collection_logs_v1');
      const logs = rawLogs ? JSON.parse(rawLogs) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        eventType: 'SHORTLET_BOOKING_LOGGED',
        details: `${session.name} logged shortlet booking for ${bookingConfirmData.propertyName} (${bookingConfirmData.unitNumber}): Guest ${bookingConfirmData.guestName}, Gross ₦${bookingConfirmData.totalPaid.toLocaleString()}, ${bookingConfirmData.nights} nights.`,
        sender: 'PMC',
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

    setBookingForm(prev => ({ ...prev, guestName: '' }));
    setBookingConfirmData(null);
    triggerSuccess(`Booking successfully registered! Guest ${created.guestName} log created under booking source: ${created.bookingSource}.`);
    
    // Notify Storage
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: 'uh_activityLog_v1' }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'uh_collection_logs_v1' }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'uh_shortlet_bookings_v1' }));
    }
    setActiveTab('Overview');
  };

  const handleBookingSelectChange = (bookingId: string) => {
    const selectedBooking = bookings.find(b => b.id === bookingId);
    if (selectedBooking) {
      const agreement = initialShortletAgreements.find(
        a => a.propertyName === selectedBooking.propertyName
      );
      const bankDetails = agreement 
        ? `${agreement.landlordName} - ${agreement.landlordBankName} (${agreement.landlordBankAccountNumber})`
        : '';
      setRemitForm(prev => ({
        ...prev,
        bookingId,
        landlordAccount: bankDetails,
        amountRemitted: selectedBooking.remittanceAmount.toString()
      }));
    } else {
      setRemitForm(prev => ({
        ...prev,
        bookingId,
        landlordAccount: '',
        amountRemitted: ''
      }));
    }
  };

  const selectedRemitBooking = bookings.find(b => b.id === remitForm.bookingId);
  const selectedRemitAgreement = initialShortletAgreements.find(
    a => a.propertyName === selectedRemitBooking?.propertyName
  );
  const remitFeePercent = selectedRemitAgreement ? selectedRemitAgreement.managementFeePercent : 20;
  const remitManagerFee = selectedRemitBooking ? Math.round(selectedRemitBooking.totalPaid * (remitFeePercent / 100)) : 0;
  const remitNetAmount = selectedRemitBooking ? Math.max(0, selectedRemitBooking.totalPaid - remitManagerFee - (Number(remitExpenses) || 0)) : 0;

  const handleCustomRemitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRemitBooking) return;
    if (!remitConfirmChecked || remitTransferRef.trim().length < 6) {
      alert('Please confirm the checkbox and enter a valid transfer reference (at least 6 characters).');
      return;
    }

    setBookings(prev => prev.map(b => {
      if (b.id === selectedRemitBooking.id) {
        return {
          ...b,
          remittanceFormSent: true,
          remittanceAmount: remitNetAmount,
          remittanceStatus: 'unacknowledged',
          transferReference: remitTransferRef,
          remittanceExpenses: Number(remitExpenses) || 0,
          remittanceDate: new Date().toISOString()
        };
      }
      return b;
    }));

    setSuccessMsg(`Remittance of ₦${remitNetAmount.toLocaleString()} logged and recorded. Dispatched to verified landlord account.`);
    setRemitForm({ bookingId: '', landlordAccount: '', amountRemitted: '', verifiedCheck: false });
    setRemitExpenses('');
    setRemitTransferRef('');
    setRemitConfirmChecked(false);
  };

  const handleRemitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remitForm.bookingId || !remitForm.landlordAccount) {
      alert('Mandatory account logs required.');
      return;
    }

    const targetBooking = bookings.find(b => b.id === remitForm.bookingId);
    if (!targetBooking) {
      alert('Corresponding booking not found.');
      return;
    }

    const agreement = initialShortletAgreements.find(
      a => a.propertyName === targetBooking.propertyName
    );

    const feePercent = agreement ? agreement.managementFeePercent : 15;
    const feeAmount = Math.round(targetBooking.totalPaid * (feePercent / 100));
    const calculatedShare = targetBooking.totalPaid - feeAmount;

    const amtRemitted = parseInt(remitForm.amountRemitted) || calculatedShare;

    setRemitConfirmData({
      bookingId: targetBooking.id,
      propertyName: targetBooking.propertyName,
      guestName: targetBooking.guestName,
      totalGross: targetBooking.totalPaid,
      managementFee: feeAmount,
      landlordShare: calculatedShare,
      amountRemitted: amtRemitted,
      landlordName: agreement ? agreement.landlordName : 'Owner Partner',
      landlordBankName: agreement ? agreement.landlordBankName : 'Zenith Bank',
      landlordBankAccountName: agreement ? agreement.landlordBankAccountName : 'Babatunde Osei Registry Account',
      landlordBankAccountNumber: agreement ? agreement.landlordBankAccountNumber : '2022839485',
      landlordId: agreement ? agreement.landlordId : ''
    });
    setRemitChecked(false);
    setTransferRefInput('');
  };

  const handleConfirmRemittance = () => {
    if (!remitConfirmData) return;

    const updated = bookings.map(b => {
      if (b.id === remitConfirmData.bookingId) {
        return {
          ...b,
          remittanceFormSent: true,
          managementFeeAmount: remitConfirmData.managementFee,
          remittanceAmount: remitConfirmData.amountRemitted,
          remittanceDateSent: new Date().toISOString().split('T')[0],
          status: 'Pending Acknowledgement' as any, // Set status to 'Pending Acknowledgement' representing Fix 4!
          transferReference: transferRefInput
        };
      }
      return b;
    });

    setBookings(updated);

    // Write to activity log
    try {
      const rawLogs = localStorage.getItem('uh_collection_logs_v1');
      const logs = rawLogs ? JSON.parse(rawLogs) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        eventType: 'SHORTLET_REMITTANCE_RECORDED',
        details: `${session.name} remitted ₦${remitConfirmData.amountRemitted.toLocaleString()} to ${remitConfirmData.landlordName} (${remitConfirmData.landlordBankName}) for booking of Guest ${remitConfirmData.guestName} at ${remitConfirmData.propertyName}. Ref: ${transferRefInput}`,
        sender: 'PMC',
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

    setRemitForm({ bookingId: '', landlordAccount: '', amountRemitted: '', verifiedCheck: false });
    setRemitConfirmData(null);
    triggerSuccess('Landlord remittance successfully recorded. The client statement is set to Pending Acknowledgement.');
    
    // Notify Storage
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: 'uh_activityLog_v1' }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'uh_collection_logs_v1' }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'uh_shortlet_bookings_v1' }));
    }
    setActiveTab('Overview');
  };

  const handleDamageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageForm.bookingId) {
      alert('Please select a corresponding booking reference.');
      return;
    }

    const booking = bookings.find(b => b.id === damageForm.bookingId);
    if (!booking) return;

    const agreement = initialShortletAgreements.find(a => a.propertyName === booking.propertyName);

    const newReport: DamageReport = {
      id: 'dmg-' + Math.random().toString(36).substr(2, 9),
      propertyId: agreement ? agreement.propertyId : 'prop-unknown',
      propertyName: booking.propertyName,
      unitNumber: booking.unitNumber,
      bookingReference: booking.id,
      guestStay: `${booking.guestName} (${booking.checkInDate} to ${booking.checkOutDate})`,
      dateDiscovered: damageForm.dateDiscovered,
      damageCategory: damageForm.damageCategory as any,
      description: damageForm.description,
      estimatedCost: parseFloat(damageForm.estimatedCost) || 0,
      urgencyLevel: damageForm.urgencyLevel as any,
      status: 'Pending Approval',
      photos: [],
      videos: [],
      receipts: [],
      quotations: [],
      dateReported: new Date().toISOString().split('T')[0],
      managerId: session.userId,
      managerName: session.name,
      landlordId: 'UH-LANDLORD-FUNMI' // Mocked landlord ID
    };

    setDamageReports([newReport, ...damageReports]);
    triggerSuccess('Damage report submitted to Landlord Dashboard permanently.');
    setDamageForm({
      bookingId: '',
      dateDiscovered: new Date().toISOString().split('T')[0],
      damageCategory: 'Furniture',
      description: '',
      rootCause: '',
      repairVendor: '',
      estimatedCost: '',
      urgencyLevel: 'Low',
      evidenceCount: 0
    });
  };

  const totalCollected = bookings.reduce((sum, b) => sum + b.totalPaid, 0);
  const totalRemitted = bookings.reduce((sum, b) => sum + (b.remittanceFormSent ? b.remittanceAmount : 0), 0);
  const totalFees = bookings.reduce((sum, b) => {
    const agreement = initialShortletAgreements.find(a => a.propertyName === b.propertyName);
    const feePercent = agreement ? agreement.managementFeePercent : 15;
    const fee = Math.round(b.totalPaid * (feePercent / 100));
    return sum + (b.remittanceFormSent ? fee : 0);
  }, 0);
  const outstandingRemittances = totalCollected - totalRemitted - totalFees;
  const totalAccountedFor = totalRemitted + totalFees + outstandingRemittances;

  // =========================================================
  // PART B: MY EARNINGS PORTFOLIO CALCULATIONS
  // =========================================================
  const now = new Date();
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // e.g., "2026-07"
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastYearMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`; // e.g., "2026-06"

  const getBookingYearMonth = (b: BookingLog) => {
    if (!b.checkInDate) return '';
    return b.checkInDate.substring(0, 7); // "YYYY-MM"
  };

  const propertyMetrics = activeAgreements.map(a => {
    const propBookings = bookings.filter(b => b.propertyName === a.propertyName);
    
    // All time calculations
    const grossRevenue = propBookings.reduce((sum, b) => sum + b.totalPaid, 0);
    const landlordShareRemitted = propBookings.reduce((sum, b) => sum + (b.remittanceFormSent ? b.remittanceAmount : 0), 0);
    const outstandingRemittances = propBookings.reduce((sum, b) => {
      if (b.remittanceFormSent) return sum;
      const feePercent = a.managementFeePercent;
      const fee = b.managementFeeAmount !== undefined ? b.managementFeeAmount : Math.round(b.totalPaid * (feePercent / 100));
      return sum + (b.totalPaid - fee);
    }, 0);
    const managerCommissionEarned = grossRevenue - landlordShareRemitted - outstandingRemittances;

    // Current Month calculations
    const currentMonthBookings = propBookings.filter(b => getBookingYearMonth(b) === currentYearMonth);
    const currentMonthGross = currentMonthBookings.reduce((sum, b) => sum + b.totalPaid, 0);
    const currentMonthRemitted = currentMonthBookings.reduce((sum, b) => sum + (b.remittanceFormSent ? b.remittanceAmount : 0), 0);
    const currentMonthOutstanding = currentMonthBookings.reduce((sum, b) => {
      if (b.remittanceFormSent) return sum;
      const feePercent = a.managementFeePercent;
      const fee = b.managementFeeAmount !== undefined ? b.managementFeeAmount : Math.round(b.totalPaid * (feePercent / 100));
      return sum + (b.totalPaid - fee);
    }, 0);
    const currentMonthCommission = currentMonthGross - currentMonthRemitted - currentMonthOutstanding;

    // Last Month calculations
    const lastMonthBookings = propBookings.filter(b => getBookingYearMonth(b) === lastYearMonth);
    const lastMonthGross = lastMonthBookings.reduce((sum, b) => sum + b.totalPaid, 0);
    const lastMonthRemitted = lastMonthBookings.reduce((sum, b) => sum + (b.remittanceFormSent ? b.remittanceAmount : 0), 0);
    const lastMonthOutstanding = lastMonthBookings.reduce((sum, b) => {
      if (b.remittanceFormSent) return sum;
      const feePercent = a.managementFeePercent;
      const fee = b.managementFeeAmount !== undefined ? b.managementFeeAmount : Math.round(b.totalPaid * (feePercent / 100));
      return sum + (b.totalPaid - fee);
    }, 0);
    const lastMonthCommission = lastMonthGross - lastMonthRemitted - lastMonthOutstanding;

    // Additional performance metrics for Step 5
    const currentMonthBookingsCount = currentMonthBookings.length;
    const currentMonthNights = currentMonthBookings.reduce((sum, b) => {
      const start = new Date(b.checkInDate);
      const end = new Date(b.checkOutDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      return sum + diff;
    }, 0);
    const currentMonthAverageRate = currentMonthBookingsCount > 0
      ? Math.round(currentMonthBookings.reduce((sum, b) => {
          const start = new Date(b.checkInDate);
          const end = new Date(b.checkOutDate);
          const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
          return sum + (b.totalPaid / diff);
        }, 0) / currentMonthBookingsCount)
      : 0;

    return {
      agreement: a,
      grossRevenue,
      landlordShareRemitted,
      outstandingRemittances,
      managerCommissionEarned,
      currentMonthGross,
      currentMonthRemitted,
      currentMonthOutstanding,
      currentMonthCommission,
      lastMonthGross,
      lastMonthRemitted,
      lastMonthOutstanding,
      lastMonthCommission,
      currentMonthBookingsCount,
      currentMonthNights,
      currentMonthAverageRate
    };
  });

  // Sort cards/ranking descending by Manager Commission Earned of current month
  const sortedProperties = [...propertyMetrics].sort((a, b) => b.currentMonthCommission - a.currentMonthCommission).slice(0, 4);

  // Summary Row metrics
  const totalCommissionThisMonth = propertyMetrics.reduce((sum, p) => sum + p.currentMonthCommission, 0);
  const totalOutstandingAll = propertyMetrics.reduce((sum, p) => sum + p.outstandingRemittances, 0);

  // Total Commission This Year
  const currentYear = now.getFullYear();
  const currentYearBookings = bookings.filter(b => {
    if (!b.checkInDate) return false;
    return new Date(b.checkInDate).getFullYear() === currentYear;
  });
  const totalCommissionThisYear = currentYearBookings.reduce((sum, b) => {
    const agreement = activeAgreements.find(a => a.propertyName === b.propertyName);
    const feePercent = agreement ? agreement.managementFeePercent : 15;
    if (b.remittanceFormSent) {
      return sum + (b.totalPaid - b.remittanceAmount);
    } else {
      const fee = b.managementFeeAmount !== undefined ? b.managementFeeAmount : Math.round(b.totalPaid * (feePercent / 100));
      return sum + fee;
    }
  }, 0);

  const topPropThisMonth = sortedProperties[0];
  const mostProfitablePropName = topPropThisMonth && topPropThisMonth.currentMonthCommission > 0 
    ? topPropThisMonth.agreement.propertyName 
    : 'None';

  // Last 6 months chart data grouping
  const lastSixMonthsList: { label: string; yearMonth: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    lastSixMonthsList.push({ label, yearMonth });
  }

  const chartData = lastSixMonthsList.map(m => {
    const monthBookings = bookings.filter(b => getBookingYearMonth(b) === m.yearMonth);
    const totalComm = monthBookings.reduce((sum, b) => {
      const agreement = activeAgreements.find(a => a.propertyName === b.propertyName);
      const feePercent = agreement ? agreement.managementFeePercent : 15;
      if (b.remittanceFormSent) {
        return sum + (b.totalPaid - b.remittanceAmount);
      } else {
        const fee = b.managementFeeAmount !== undefined ? b.managementFeeAmount : Math.round(b.totalPaid * (feePercent / 100));
        return sum + fee;
      }
    }, 0);

    const breakdown = activeAgreements.map(a => {
      const propMonthBookings = monthBookings.filter(b => b.propertyName === a.propertyName);
      const propComm = propMonthBookings.reduce((sum, b) => {
        const feePercent = a.managementFeePercent;
        if (b.remittanceFormSent) {
          return sum + (b.totalPaid - b.remittanceAmount);
        } else {
          const fee = b.managementFeeAmount !== undefined ? b.managementFeeAmount : Math.round(b.totalPaid * (feePercent / 100));
          return sum + fee;
        }
      }, 0);
      return {
        propertyName: a.propertyName,
        commission: propComm
      };
    });

    return {
      month: m.label,
      yearMonth: m.yearMonth,
      total: totalComm,
      breakdown
    };
  });

  return (
    <div className="space-y-6 pb-16 font-sans text-xs sm:text-sm">
      
      {/* TOP SYSTEM HEADER BAR WITH CONNECTIVITY & ANNOUNCEMENTS */}
      <div className="bg-#132A1D text-white rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                Unity Shortlet Desk
              </h1>
              <span className="bg-[#18452E] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                Live Portal
              </span>
            </div>
            <p className="text-stone-400 text-xs mt-0.5">
              Welcome back, <strong className="text-stone-200">{session.name}</strong> ({session.role})
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <QuickSupportButton 
              currentTab={activeTab}
              onOpenSupportForm={() => setActiveTab('Support')}
            />
            <ConnectivityIndicator triggerSuccess={(msg) => setSuccessMsg(msg)} />
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 bg-#132A1D hover:bg-#132A1D rounded-xl text-white transition cursor-pointer"
              title="View Live Activity Feed"
            >
              <Bell className="w-4 h-4" />
              {hasUnreadNotifications && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-#132A1D animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Platform Announcements Display (Addition Nine) */}
        <PlatformAnnouncements userRole="Shortlet Manager" userId={shortletManagerId} />
      </div>

      {/* RECENTLY VIEWED BAR (Addition One) */}
      {recentlyViewed.length > 0 && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[10px] font-mono font-bold text-#6B7280 uppercase flex items-center space-x-1 shrink-0">
            <Clock className="w-3.5 h-3.5 text-[#18452E]" />
            <span>Recently Viewed:</span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {recentlyViewed.slice(0, 6).map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.type === 'booking') {
                    const b = bookings.find(book => book.id === item.id);
                    if (b) setSelectedDetailBooking(b);
                    else alert(`Booking record ${item.name} opened.`);
                  } else if (item.type === 'remittance') {
                    const b = bookings.find(book => book.id === item.id);
                    if (b) setSelectedDetailRemittance(b);
                    else alert(`Remittance statement ${item.name} opened.`);
                  } else if (item.type === 'property') {
                    const prop = activeAgreements.find(a => a.propertyId === item.id || a.propertyName === item.name);
                    if (prop) setSelectedDetailProperty(prop);
                    else alert(`Apartment detail ${item.name} opened.`);
                  } else if (item.type === 'damage') {
                    const dmg = damageReports.find(d => d.id === item.id);
                    if (dmg) setSelectedDetailDamage(dmg);
                    else alert(`Damage report ${item.name} opened.`);
                  } else {
                    alert(`Opened record: ${item.name}`);
                  }
                }}
                className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-[10px] font-medium text-#132A1D hover:text-[#18452E] transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
              >
                <span className="font-bold text-[#18452E]">{item.type.toUpperCase()}:</span>
                <span className="truncate max-w-[110px]">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* PROMPT TWO: FIVE PRIMARY NAVIGATION AREAS FOR SHORTLET DASHBOARD */}
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

          {/* AREA 2: BOOKINGS & PROPERTIES */}
          <button
            onClick={() => setActiveTab('LogBooking')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              ['LogBooking', 'History'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            2. Bookings
          </button>

          {/* AREA 3: MONEY */}
          <button
            onClick={() => setActiveTab('LogRemittance')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              ['LogRemittance', 'EarningsPortfolio'].includes(activeTab)
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            3. Money &amp; Remittance
          </button>

          {/* AREA 4: OPERATIONS */}
          <button
            onClick={() => setActiveTab('DamageReport')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer ${
              activeTab === 'DamageReport'
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            4. Operations / Damage
          </button>

          {/* AREA 5: MORE */}
          <button
            onClick={() => setActiveTab('Profile')}
            className={`py-2.5 px-3 font-display text-xs font-bold rounded-2xl border text-center transition cursor-pointer col-span-2 sm:col-span-1 ${
              activeTab === 'Profile'
                ? 'bg-[#18452E] text-white border-[#0E2F1F] shadow-sm'
                : 'bg-white border-stone-200 text-#132A1D hover:bg-stone-50'
            }`}
          >
            5. More / Profile
          </button>
        </div>

        {/* DYNAMIC SECONDARY SUB-NAVIGATION PILLS FOR ACTIVE AREA */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {activeTab === 'Overview' && (
            <button className="px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl bg-[#18452E] text-white cursor-pointer">
              &bull; Overview &amp; Desk Performance
            </button>
          )}

          {['LogBooking', 'History'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('LogBooking')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'LogBooking' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Log Booking
              </button>
              <button 
                onClick={() => setActiveTab('History')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'History' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; History &amp; Statements ({bookings.length})
              </button>
            </>
          )}

          {['LogRemittance', 'EarningsPortfolio'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('LogRemittance')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'LogRemittance' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; Log Remittance
              </button>
              <button 
                onClick={() => setActiveTab('EarningsPortfolio')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl transition cursor-pointer ${
                  activeTab === 'EarningsPortfolio' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; My Earnings Portfolio
              </button>
            </>
          )}

          {activeTab === 'DamageReport' && (
            <button className="px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl bg-[#18452E] text-white cursor-pointer">
              &bull; Report Property Damage ({damageReports.length})
            </button>
          )}

          {['Profile', 'Support'].includes(activeTab) && (
            <>
              <button 
                onClick={() => setActiveTab('Profile')} 
                className={`px-3 py-1.5 font-mono text-[11px] font-bold rounded-xl cursor-pointer ${
                  activeTab === 'Profile' ? 'bg-[#18452E] text-white' : 'bg-stone-50 text-#6B7280 hover:bg-stone-200'
                }`}
              >
                &bull; My Profile &amp; Verification
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

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs text-emerald-805">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* PROMPT FIVE: OPERATIONS BRIEFING ASSISTANT */}
          <OperationsBriefingCard role="Shortlet Manager" userName={session.name} />
          {/* REVENUE ARITHMETIC GRID (4 FIGURES) */}
          {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="spatial-glass border p-5 rounded-2xl space-y-1 bg-white">
              <span className="text-[10px] text-stone-400 block font-mono font-bold uppercase">TOTAL BOOKINGS REVENUE</span>
              <span className="text-2xl font-black text-[#18452E] block">₦{totalCollected.toLocaleString()}</span>
              <span className="text-[10px] text-#6B7280 block">Unified checks inside shortlet booking log.</span>
            </div>

            <div className="spatial-glass border p-5 rounded-2xl space-y-1 bg-emerald-50/30 border-emerald-100">
              <span className="text-[10px] text-emerald-800 block font-mono font-bold uppercase">REMITTED TO LANDLORDS</span>
              <span className="text-2xl font-black text-emerald-950 block">₦{totalRemitted.toLocaleString()}</span>
              {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
              <span className="text-[10px] text-emerald-700 block font-medium">Remitted to Landlords</span>
            </div>

            <div className="spatial-glass border p-5 rounded-2xl space-y-1 bg-white">
              <span className="text-[10px] text-[#C9A84C] block font-mono font-bold uppercase">MY EARNED COMMISSIONS</span>
              <span className="text-2xl font-black text-[#C9A84C] block">₦{totalFees.toLocaleString()}</span>
              <span className="text-[10px] text-stone-400 block">Commissions logged per agreed manager fees.</span>
            </div>

            <div className={`spatial-glass border p-5 rounded-2xl space-y-1 ${outstandingRemittances > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
              <span className={`text-[10px] block font-mono font-bold uppercase ${outstandingRemittances > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>OUTSTANDING REMITTANCES</span>
              <span className={`text-2xl font-black block ${outstandingRemittances > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>₦{outstandingRemittances.toLocaleString()}</span>
              <span className={`text-[10px] block font-medium ${outstandingRemittances > 0 ? 'text-rose-700 font-bold' : 'text-emerald-700'}`}>
                {outstandingRemittances > 0 ? 'Amount Not Yet Remitted to Landlords' : 'Fully Remitted'}
              </span>
            </div>

          </div>

          {/* 5TH LINE: REVENUE ACCOUNTING VERIFICATION */}
          <div className={`p-4 rounded-2xl border text-xs flex flex-wrap items-center justify-between gap-2 ${totalAccountedFor === totalCollected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'}`}>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold uppercase">Total Accounted For:</span>
              <span className="font-display font-black text-sm">₦{totalAccountedFor.toLocaleString()}</span>
            </div>
            {totalAccountedFor === totalCollected ? (
              <span className="text-[11px] text-emerald-800 font-medium">
                ✓ 100% Reconciled (₦{totalRemitted.toLocaleString()} Remitted + ₦{totalFees.toLocaleString()} Commission + ₦{outstandingRemittances.toLocaleString()} Outstanding = ₦{totalCollected.toLocaleString()} Total)
              </span>
            ) : (
              <span className="text-[11px] text-rose-800 font-bold bg-rose-100 px-2 py-1 rounded">
                ⚠ Calculation Discrepancy Detected, contact Unity Homes admin
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LOG BOOKING FORM */}
      {activeTab === 'LogBooking' && (
        <div className="bg-white border rounded-3xl p-6 space-y-4 max-w-xl mx-auto">
          <h3 className="font-display font-black text-sm text-[#18452E] uppercase border-b pb-2">Log a Shortlet Booking</h3>
          
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">TARGET SHORTLET PORTFOLIO</label>
              <select 
                value={bookingForm.propertyName}
                onChange={(e) => setBookingForm(prev => ({ ...prev, propertyName: e.target.value }))}
                className="w-full p-2.5 bg-white border border-stone-200 rounded text-xs outline-none"
              >
                {activeAgreements.map(a => (
                  <option key={a.propertyId} value={a.propertyName}>{a.propertyName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">UNIT IDENTIFIER</label>
                <input 
                  type="text" 
                  required
                  value={bookingForm.unitNumber}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, unitNumber: e.target.value }))}
                  className="w-full p-2 bg-white border border-stone-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">GUEST FULL NAME</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Chief Raymond"
                  value={bookingForm.guestName}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, guestName: e.target.value }))}
                  className="w-full p-2 bg-white border border-stone-200 rounded text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">BOOKING SOURCE</label>
                <select 
                  required
                  value={bookingForm.bookingSource}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, bookingSource: e.target.value }))}
                  className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none"
                >
                  <option value="Airbnb">Airbnb</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Direct">Direct</option>
                  <option value="Instagram">Instagram</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">NUMBER OF NIGHTS</label>
                <input 
                  type="number" 
                  required
                  value={bookingForm.nights}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, nights: e.target.value }))}
                  className="w-full p-2 bg-white border border-stone-200 rounded text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">NIGHTLY RATE (NGN)</label>
              <input 
                type="number" 
                required
                value={bookingForm.nightRate}
                onChange={(e) => setBookingForm(prev => ({ ...prev, nightRate: e.target.value }))}
                className="w-full p-2 bg-white border border-stone-200 rounded text-xs"
              />
            </div>

            <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 uppercase font-mono">Collect Caution Deposit?</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingForm(prev => ({ ...prev, cautionDepositCollected: true }))}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase font-mono cursor-pointer ${bookingForm.cautionDepositCollected ? 'bg-amber-800 text-white' : 'bg-white border border-amber-300 text-amber-900'}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingForm(prev => ({ ...prev, cautionDepositCollected: false }))}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase font-mono cursor-pointer ${!bookingForm.cautionDepositCollected ? 'bg-amber-800 text-white' : 'bg-white border border-amber-300 text-amber-900'}`}
                  >
                    No
                  </button>
                </div>
              </div>

              {bookingForm.cautionDepositCollected && (
                <div>
                  <label className="block text-[9px] font-mono font-bold text-amber-900 uppercase mb-1">Caution Deposit Amount (NGN)</label>
                  <input 
                    type="number"
                    value={bookingForm.cautionDepositAmount}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, cautionDepositAmount: e.target.value }))}
                    className="w-full p-2 bg-white border border-amber-300 rounded text-xs font-mono"
                  />
                </div>
              )}

              <p className="text-[10px] text-amber-900/80 leading-relaxed italic border-t border-amber-200/60 pt-2">
                This deposit is held by you as the manager and must be accounted for at checkout. Unity Homes does not hold or process this deposit.
              </p>
            </div>

            <button type="submit" className="w-full py-3 bg-[#18452E] hover:bg-[#18452E] text-white font-bold rounded-xl cursor-pointer transition">
              Register Confirmed Check-In Log
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LOG REMITTANCE */}
      {activeTab === 'LogRemittance' && (
        <div className="bg-white border rounded-3xl p-6 space-y-6 max-w-xl mx-auto shadow-sm">
          <h3 className="font-display font-black text-sm text-[#18452E] uppercase border-b pb-2">Record Landlord Remittance</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">SELECT CORRESPONDING BOOKING</label>
              <select 
                value={remitForm.bookingId}
                onChange={(e) => {
                  handleBookingSelectChange(e.target.value);
                  setRemitConfirmChecked(false);
                  setRemitTransferRef('');
                  setRemitExpenses('');
                }}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none font-mono focus:border-teal-600"
              >
                <option value="">Choose pending booking invoice...</option>
                {bookings.filter(b => !b.remittanceFormSent).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.propertyName} - Guest {b.guestName} (₦{b.totalPaid.toLocaleString()} collected)
                  </option>
                ))}
              </select>
            </div>

            {selectedRemitBooking && (
              <div className="space-y-5 animate-fade-in">
                {/* RECENTLY UPDATED WARNING BANNER IF APPLICABLE */}
                {(selectedRemitAgreement as any)?.recentlyUpdated && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Recent Account Update</strong>
                      <span className="text-[11px] block mt-0.5 text-amber-800">
                        This account was updated on {(selectedRemitAgreement as any)?.updatedDate || '2026-07-16'} and approved by Admin. Please verify this is correct before remitting.
                      </span>
                    </div>
                  </div>
                )}

                {/* VERIFIED LANDLORD ACCOUNT CARD */}
                <div className="p-4 bg-emerald-900 text-white rounded-2xl border border-emerald-800 space-y-3 relative overflow-hidden shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-emerald-100 text-sm font-display">
                        {selectedRemitAgreement?.landlordName || (selectedRemitBooking as any)?.landlordName || 'Chief Emeka Obiora'}
                      </h4>
                      <p className="text-[11px] text-emerald-300/80 font-mono mt-0.5">
                        {selectedRemitBooking.propertyName}
                      </p>
                    </div>
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-800 text-emerald-200 text-[9px] font-mono font-bold uppercase border border-emerald-700">
                      <span>✓ Verified by Unity Homes</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-emerald-800/80 grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <span className="text-[9px] text-emerald-400 font-mono uppercase block">ACCOUNT NAME (ADMIN VERIFIED)</span>
                      <strong className="text-sm font-mono tracking-wide text-white block mt-0.5">
                        {(selectedRemitAgreement as any)?.accountName || 'CHIEF EMEKA OBIORA (LEASING)'}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] text-emerald-400 font-mono uppercase block">BANK NAME</span>
                      <span className="font-bold text-emerald-100 block">{(selectedRemitAgreement as any)?.bankName || 'FCMB'}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-emerald-400 font-mono uppercase block">ACCOUNT NUMBER</span>
                      <span className="font-mono font-bold text-emerald-100 block">
                        ****{((selectedRemitAgreement as any)?.accountNumber || '0123456789').slice(-4)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-emerald-400 font-mono uppercase block">VERIFIED BY</span>
                      <span className="text-[11px] text-emerald-200 block">{(selectedRemitAgreement as any)?.verifiedBy || 'Unity Homes Admin (Auditor Tanko)'}</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-emerald-400 font-mono uppercase block">VERIFIED ON</span>
                      <span className="text-[11px] text-emerald-200 block">{(selectedRemitAgreement as any)?.verifiedOn || '2026-06-15'}</span>
                    </div>
                  </div>
                </div>

                {/* REMITTANCE CALCULATION FORM */}
                <form onSubmit={handleCustomRemitSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">GROSS BOOKING AMOUNT</label>
                      <input 
                        type="text" 
                        readOnly
                        value={`₦${selectedRemitBooking.totalPaid.toLocaleString()}`}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 text-#132A1D font-mono font-bold rounded-xl text-xs outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">MANAGER FEE ({remitFeePercent}%)</label>
                      <input 
                        type="text" 
                        readOnly
                        value={`₦${remitManagerFee.toLocaleString()} (${remitFeePercent}%)`}
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 text-emerald-900 font-mono font-bold rounded-xl text-xs outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">APPROVED EXPENSES (OPTIONAL)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 5000"
                        value={remitExpenses}
                        onChange={(e) => setRemitExpenses(e.target.value)}
                        className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">AMOUNT TO REMIT</label>
                      <input 
                        type="text" 
                        readOnly
                        value={`₦${remitNetAmount.toLocaleString()}`}
                        className="w-full p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono font-black rounded-xl text-sm outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">TRANSFER REFERENCE (REQUIRED)</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. GTB/TRF-2026-90812 or FCMB-88123"
                      value={remitTransferRef}
                      onChange={(e) => setRemitTransferRef(e.target.value)}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-teal-600 font-mono"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">Must contain at least 6 characters.</span>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-start space-x-2.5">
                    <input 
                      type="checkbox"
                      id="remitConfirmCheckbox"
                      checked={remitConfirmChecked}
                      onChange={(e) => setRemitConfirmChecked(e.target.checked)}
                      className="mt-0.5 accent-teal-700 w-4 h-4 rounded cursor-pointer"
                    />
                    <label htmlFor="remitConfirmCheckbox" className="text-[11px] text-#132A1D leading-snug cursor-pointer select-none">
                      I confirm this remittance was transferred to the verified landlord account shown above. The account name shown is correct and the transfer is complete.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={!remitConfirmChecked || remitTransferRef.trim().length < 6}
                    className={`w-full py-3.5 font-bold rounded-xl text-xs transition shadow-xs ${
                      remitConfirmChecked && remitTransferRef.trim().length >= 6
                        ? 'bg-[#18452E] hover:bg-[#18452E] text-white cursor-pointer'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    Submit Landlord Remittance
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOKING CONFIRMATION OVERLAY */}
      {bookingConfirmData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-stone-200 animate-fade-in text-#132A1D">
            <h4 className="font-display font-black text-sm text-[#18452E] uppercase mb-4 tracking-tight border-b pb-2">
              Confirm Booking Parameters
            </h4>
            
            <div className="space-y-3 mb-5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-stone-400">Property:</span>
                <strong className="text-#132A1D">{bookingConfirmData.propertyName} ({bookingConfirmData.unitNumber})</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200 items-center">
                <span className="text-stone-400">Landlord:</span>
                <span className="flex items-center space-x-1 font-bold text-#132A1D">
                  <span>{bookingConfirmData.landlordName}</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                    ✓ Verified Partner
                  </span>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-stone-400">Stay Duration:</span>
                <strong className="text-#132A1D">{bookingConfirmData.nights} Nights</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-stone-400">Night Rate:</span>
                <strong className="text-#132A1D">₦{bookingConfirmData.nightRate.toLocaleString()}/night</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-stone-400">Gross Revenue:</span>
                <strong className="text-#132A1D font-bold">₦{bookingConfirmData.totalPaid.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200 text-amber-700 font-medium">
                <span>Management Fee ({bookingConfirmData.feePercent}%):</span>
                <span>₦{bookingConfirmData.feeAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200 text-[#18452E] font-black bg-emerald-50/30 px-2 rounded-lg">
                <span>Net Landlord Share:</span>
                <span>₦{bookingConfirmData.remittedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-400">Booking Source:</span>
                <span className="px-2 py-0.5 bg-stone-50 text-#6B7280 rounded font-mono text-[9px] uppercase font-bold">{bookingConfirmData.bookingSource}</span>
              </div>
            </div>

            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start space-x-2.5 mb-5">
              <input 
                type="checkbox" 
                id="booking-confirm-gated-checkbox"
                checked={bookingChecked}
                onChange={(e) => setBookingChecked(e.target.checked)}
                className="w-4 h-4 accent-rose-600 shrink-0 mt-0.5 cursor-pointer"
              />
              <label htmlFor="booking-confirm-gated-checkbox" className="text-#132A1D leading-tight text-xs cursor-pointer select-none">
                I confirm I am logging this booking for the correct property and the correct landlord. I have verified the details above are accurate.
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setBookingConfirmData(null)}
                className="py-2.5 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel and Go Back
              </button>
              <button 
                type="button" 
                disabled={!bookingChecked}
                onClick={handleConfirmBooking}
                className={`py-2.5 text-white font-bold rounded-xl text-xs transition cursor-pointer ${
                  bookingChecked 
                    ? 'bg-[#18452E] hover:bg-[#18452E] shadow-md' 
                    : 'bg-stone-300 text-stone-400 cursor-not-allowed'
                }`}
              >
                Confirm and Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMITTANCE CONFIRMATION OVERLAY */}
      {remitConfirmData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-stone-200 animate-fade-in text-#132A1D">
            <h4 className="font-display font-black text-sm text-[#18452E] uppercase mb-4 tracking-tight border-b pb-2">
              Verify Remittance & Bank Logs
            </h4>
            
            <div className="space-y-2.5 mb-5 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-400">Landlord Name:</span>
                <span className="flex items-center space-x-1 font-bold text-#132A1D">
                  <span>{remitConfirmData.landlordName}</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                    ✓ Verified Partner
                  </span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-400">Destination Bank:</span>
                <strong className="text-#132A1D">{remitConfirmData.landlordBankName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-400">Account Name:</span>
                <strong className="text-#132A1D">{remitConfirmData.landlordBankAccountName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-400">Account Number:</span>
                <strong className="text-#132A1D font-mono text-[13px]">
                  **** **** {remitConfirmData.landlordBankAccountNumber.slice(-4)}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-400">Remittance Period:</span>
                <strong className="text-#6B7280">July 2026</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-400">Gross Income:</span>
                <strong className="text-#6B7280">₦{remitConfirmData.totalGross.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-400">Management Fee:</span>
                <strong className="text-amber-800">₦{remitConfirmData.managementFee.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200 font-bold text-#132A1D">
                <span>Agreement Net Share:</span>
                <span>₦{remitConfirmData.landlordShare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200 text-[#18452E] font-black bg-emerald-50 px-2 rounded-lg">
                <span>Recorded Payout Amount:</span>
                <span>₦{remitConfirmData.amountRemitted.toLocaleString()}</span>
              </div>
            </div>

            {/* GOLD WARNING FOR DISCREPANCY */}
            {remitConfirmData.amountRemitted !== remitConfirmData.landlordShare && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-[10px] leading-tight mb-4 flex items-start space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> The remitted amount (₦{remitConfirmData.amountRemitted.toLocaleString()}) differs from the calculated landlord share (₦{remitConfirmData.landlordShare.toLocaleString()}). Please ensure this discrepancy is authorized under your agreement terms.
                </span>
              </div>
            )}

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">
                  TRANSFER TRANSACTION REFERENCE (MIN 8 CHARS)
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. TRF-1948123985"
                  value={transferRefInput}
                  onChange={(e) => setTransferRefInput(e.target.value)}
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none font-mono"
                />
              </div>

              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start space-x-2.5">
                <input 
                  type="checkbox" 
                  id="remit-confirm-gated-checkbox"
                  checked={remitChecked}
                  onChange={(e) => setRemitChecked(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 shrink-0 mt-0.5 cursor-pointer"
                />
                <label htmlFor="remit-confirm-gated-checkbox" className="text-#132A1D leading-tight text-xs cursor-pointer select-none">
                  I confirm I have already transferred NGN {remitConfirmData.amountRemitted.toLocaleString()} to the bank account shown above. I am not logging a future intended transfer. I am recording a completed transfer that has already happened.
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => setRemitConfirmData(null)}
                className="py-2.5 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel and Go Back
              </button>
              <button 
                type="button" 
                disabled={!remitChecked || transferRefInput.trim().length < 8}
                onClick={handleConfirmRemittance}
                className={`py-2.5 text-white font-bold rounded-xl text-xs transition cursor-pointer ${
                  remitChecked && transferRefInput.trim().length >= 8
                    ? 'bg-[#18452E] hover:bg-[#18452E] shadow-md' 
                    : 'bg-stone-300 text-stone-400 cursor-not-allowed'
                }`}
              >
                Confirm and Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORY & STATEMENTS (BOOKINGS LOG & REMITTANCE CENTER) */}
      {activeTab === 'History' && (
        <div className="bg-white border rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-display font-black text-base text-[#18452E] uppercase">
                Portfolio Statements &amp; Audit Log
              </h3>
              <p className="text-#6B7280 text-xs mt-0.5">
                Comprehensive booking logs and landlord remittance disbursement records.
              </p>
            </div>

            {/* SUB-TABS */}
            <div className="flex bg-stone-50 p-1 rounded-xl shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setHistorySubTab('bookings')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  historySubTab === 'bookings' ? 'bg-white text-[#18452E] shadow-xs' : 'text-#6B7280 hover:text-#132A1D'
                }`}
              >
                Booking Log ({bookings.length})
              </button>
              <button
                onClick={() => setHistorySubTab('remittances')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  historySubTab === 'remittances' ? 'bg-white text-[#18452E] shadow-xs' : 'text-#6B7280 hover:text-#132A1D'
                }`}
              >
                Remittance Center
              </button>
            </div>
          </div>

          {/* SUBTAB 1: BOOKING LOG */}
          {historySubTab === 'bookings' && (
            <div className="space-y-4">
              {/* SAVED FILTERS & CONTROLS BAR (Addition Two) */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Bookmark className="w-4 h-4 text-[#18452E]" />
                    <span className="font-bold text-xs text-#132A1D uppercase tracking-wider">Saved Filters:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {savedBookingFilters.map((sf) => (
                      <div key={sf.id} className="inline-flex items-center space-x-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
                        <button
                          onClick={() => setBookingFilters({ ...sf.filters })}
                          className="font-medium text-#132A1D hover:text-[#18452E] cursor-pointer"
                        >
                          {sf.name}
                        </button>
                        <button
                          onClick={() => deleteCustomFilter('booking', sf.id)}
                          className="text-stone-400 hover:text-rose-600 cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => setShowSaveBookingFilterName(!showSaveBookingFilterName)}
                      className="px-2.5 py-1 bg-[#18452E] hover:bg-[#18452E] text-white text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Save Current Filter</span>
                    </button>
                  </div>
                </div>

                {showSaveBookingFilterName && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-stone-200">
                    <input
                      type="text"
                      placeholder="e.g. Airbnb Bookings Only"
                      value={bookingFilterNameInput}
                      onChange={(e) => setBookingFilterNameInput(e.target.value)}
                      className="p-1.5 bg-white border border-stone-200 rounded text-xs outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!bookingFilterNameInput.trim()) return;
                        saveCustomFilter('booking', bookingFilterNameInput.trim(), bookingFilters);
                        setBookingFilterNameInput('');
                        setShowSaveBookingFilterName(false);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save Preset
                    </button>
                  </div>
                )}

                {/* FILTERS INPUT GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  <input
                    type="text"
                    placeholder="Search guest name or property..."
                    value={bookingFilters.search}
                    onChange={(e) => setBookingFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                  />
                  <select
                    value={bookingFilters.source}
                    onChange={(e) => setBookingFilters(prev => ({ ...prev, source: e.target.value }))}
                    className="p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                  >
                    <option value="All">All Booking Sources</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Direct">Direct</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                  <select
                    value={bookingFilters.property}
                    onChange={(e) => setBookingFilters(prev => ({ ...prev, property: e.target.value }))}
                    className="p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                  >
                    <option value="All">All Shortlet Apartments</option>
                    {activeAgreements.map(a => (
                      <option key={a.propertyId} value={a.propertyName}>{a.propertyName}</option>
                    ))}
                  </select>
                  <select
                    value={bookingFilters.quarter}
                    onChange={(e) => setBookingFilters(prev => ({ ...prev, quarter: e.target.value }))}
                    className="p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                  >
                    <option value="All">All Timeframes</option>
                    <option value="Q3">Q3 2026 (July - Sept)</option>
                    <option value="Q2">Q2 2026 (Apr - June)</option>
                  </select>
                </div>
              </div>

              {/* EXPANDED EXPORT BUTTONS (Addition Three) */}
              {(() => {
                const filteredBookings = bookings.filter(b => {
                  if (bookingFilters.source !== 'All' && b.bookingSource !== bookingFilters.source) return false;
                  if (bookingFilters.property !== 'All' && b.propertyName !== bookingFilters.property) return false;
                  if (bookingFilters.search && !b.guestName.toLowerCase().includes(bookingFilters.search.toLowerCase()) && !b.propertyName.toLowerCase().includes(bookingFilters.search.toLowerCase())) return false;
                  return true;
                });

                const columns = [
                  { header: 'Property Name', accessor: (item: BookingLog) => item.propertyName },
                  { header: 'Guest Name', accessor: (item: BookingLog) => item.guestName },
                  { header: 'Check-In', accessor: (item: BookingLog) => item.checkInDate },
                  { header: 'Check-Out', accessor: (item: BookingLog) => item.checkOutDate },
                  { header: 'Booking Source', accessor: (item: BookingLog) => item.bookingSource || 'Direct' },
                  { header: 'Gross Revenue (NGN)', accessor: (item: BookingLog) => `₦${item.totalPaid.toLocaleString()}` },
                  { header: 'Remittance Status', accessor: (item: BookingLog) => item.remittanceFormSent ? 'Remitted' : 'Pending' }
                ];

                const activeProps = bookingFilters.property === 'All' ? activeAgreements.map(a => a.propertyName) : [bookingFilters.property];

                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200">
                      <span className="text-xs font-bold text-emerald-950">
                        Showing {filteredBookings.length} filtered booking records
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePdfExport(`Booking Log Extract (${bookingFilters.source} - ${bookingFilters.property})`, filteredBookings, columns, activeProps)}
                          className="px-3 py-1.5 bg-[#18452E] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer transition shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Export PDF</span>
                        </button>
                        <button
                          onClick={() => handleExcelExport(`Booking_Log_${bookingFilters.source}`, filteredBookings, columns, activeProps)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer transition shadow-xs"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Export Excel</span>
                        </button>
                      </div>
                    </div>

                    {/* BOOKINGS LIST */}
                    <div className="space-y-2.5">
                      {filteredBookings.length === 0 ? (
                        <p className="text-center py-8 text-stone-400 italic text-xs">No booking records match your selected filter criteria.</p>
                      ) : (
                        filteredBookings.map(b => {
                          const hasDeposit = b.caution_deposit_collected;
                          const existingRes = resolutions.find(r => r.bookingId === b.id);

                          return (
                            <div
                              key={b.id}
                              onClick={() => setSelectedDetailBooking(b)}
                              className="p-4 bg-white border border-stone-200 rounded-2xl hover:border-[#18452E] hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-bold text-[#18452E] text-sm">{b.propertyName}</span>
                                  <span className="px-2 py-0.5 bg-stone-50 text-#6B7280 rounded text-[9px] font-mono uppercase font-bold">
                                    {b.bookingSource || 'Direct'}
                                  </span>
                                  {hasDeposit && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-mono font-bold">
                                      🛡️ Deposit: ₦{(b.caution_deposit_amount || 25000).toLocaleString()}
                                    </span>
                                  )}
                                  {hasDeposit && existingRes && (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[9px] font-mono font-bold">
                                      ✓ Deposit Resolved ({existingRes.depositDecision})
                                    </span>
                                  )}
                                </div>
                                <p className="text-#6B7280 text-xs mt-0.5">
                                  Guest: <strong className="text-#132A1D">{b.guestName}</strong> &bull; Stay: {b.checkInDate} to {b.checkOutDate}
                                </p>
                              </div>

                              <div className="flex flex-col sm:items-end gap-1 text-left sm:text-right">
                                <span className="font-black text-sm text-[#18452E] block">₦{b.totalPaid.toLocaleString()}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                                    b.remittanceFormSent ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {b.remittanceFormSent ? 'Remitted' : 'Pending Remittance'}
                                  </span>
                                  {hasDeposit && !existingRes && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setResolutionModalBooking(b);
                                      }}
                                      className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-[9px] font-bold uppercase font-mono tracking-wider cursor-pointer"
                                    >
                                      Checkout &amp; Deposit Resolution
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SUBTAB 2: REMITTANCE CENTER */}
          {historySubTab === 'remittances' && (
            <div className="space-y-4">
              {/* SAVED FILTERS BAR */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Bookmark className="w-4 h-4 text-[#18452E]" />
                    <span className="font-bold text-xs text-#132A1D uppercase tracking-wider">Saved Remittance Filters:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {savedRemittanceFilters.map((sf) => (
                      <div key={sf.id} className="inline-flex items-center space-x-1 bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
                        <button
                          onClick={() => setRemittanceFilters({ ...sf.filters })}
                          className="font-medium text-#132A1D hover:text-[#18452E] cursor-pointer"
                        >
                          {sf.name}
                        </button>
                        <button
                          onClick={() => deleteCustomFilter('remittance', sf.id)}
                          className="text-stone-400 hover:text-rose-600 cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => setShowSaveRemitFilterName(!showSaveRemitFilterName)}
                      className="px-2.5 py-1 bg-[#18452E] hover:bg-[#18452E] text-white text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Save Preset</span>
                    </button>
                  </div>
                </div>

                {showSaveRemitFilterName && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-stone-200">
                    <input
                      type="text"
                      placeholder="e.g. Outstanding Remittances Only"
                      value={remitFilterNameInput}
                      onChange={(e) => setRemitFilterNameInput(e.target.value)}
                      className="p-1.5 bg-white border border-stone-200 rounded text-xs outline-none flex-1"
                    />
                    <button
                      onClick={() => {
                        if (!remitFilterNameInput.trim()) return;
                        saveCustomFilter('remittance', remitFilterNameInput.trim(), remittanceFilters);
                        setRemitFilterNameInput('');
                        setShowSaveRemitFilterName(false);
                      }}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Save Filter
                    </button>
                  </div>
                )}

                {/* FILTERS INPUT GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <select
                    value={remittanceFilters.status}
                    onChange={(e) => setRemittanceFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                  >
                    <option value="All">All Remittance Statuses</option>
                    <option value="Paid">Disbursed / Paid</option>
                    <option value="Unpaid">Outstanding / Pending</option>
                  </select>
                  <select
                    value={remittanceFilters.property}
                    onChange={(e) => setRemittanceFilters(prev => ({ ...prev, property: e.target.value }))}
                    className="p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                  >
                    <option value="All">All Apartments</option>
                    {activeAgreements.map(a => (
                      <option key={a.propertyId} value={a.propertyName}>{a.propertyName}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Search guest or transaction ref..."
                    value={remittanceFilters.search}
                    onChange={(e) => setRemittanceFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="p-2 bg-white border border-stone-200 rounded-xl text-xs outline-none"
                  />
                </div>
              </div>

              {/* EXPANDED EXPORT BUTTONS */}
              {(() => {
                const filteredRemittances = bookings.filter(b => {
                  if (remittanceFilters.status === 'Paid' && !b.remittanceFormSent) return false;
                  if (remittanceFilters.status === 'Unpaid' && b.remittanceFormSent) return false;
                  if (remittanceFilters.property !== 'All' && b.propertyName !== remittanceFilters.property) return false;
                  if (remittanceFilters.search && !b.guestName.toLowerCase().includes(remittanceFilters.search.toLowerCase()) && !b.propertyName.toLowerCase().includes(remittanceFilters.search.toLowerCase())) return false;
                  return true;
                });

                const columns = [
                  { header: 'Property', accessor: (item: BookingLog) => item.propertyName },
                  { header: 'Guest', accessor: (item: BookingLog) => item.guestName },
                  { header: 'Gross Revenue', accessor: (item: BookingLog) => `₦${item.totalPaid.toLocaleString()}` },
                  { header: 'Remittance Amount', accessor: (item: BookingLog) => `₦${item.remittanceAmount.toLocaleString()}` },
                  { header: 'Status', accessor: (item: BookingLog) => item.remittanceFormSent ? 'Disbursed' : 'Awaiting Disbursal' }
                ];

                const activeProps = remittanceFilters.property === 'All' ? activeAgreements.map(a => a.propertyName) : [remittanceFilters.property];

                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-2xl border border-emerald-200">
                      <span className="text-xs font-bold text-emerald-950">
                        Showing {filteredRemittances.length} remittance records
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePdfExport(`Remittance Statement (${remittanceFilters.status} - ${remittanceFilters.property})`, filteredRemittances, columns, activeProps)}
                          className="px-3 py-1.5 bg-[#18452E] hover:bg-black text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer transition shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Export PDF</span>
                        </button>
                        <button
                          onClick={() => handleExcelExport(`Remittances_${remittanceFilters.status}`, filteredRemittances, columns, activeProps)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1 cursor-pointer transition shadow-xs"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Export Excel</span>
                        </button>
                      </div>
                    </div>

                    {/* REMITTANCES LIST */}
                    <div className="space-y-2.5">
                      {filteredRemittances.length === 0 ? (
                        <p className="text-center py-8 text-stone-400 italic text-xs">No remittance records found.</p>
                      ) : (
                        filteredRemittances.map(b => (
                          <div
                            key={b.id}
                            onClick={() => setSelectedDetailRemittance(b)}
                            className="p-4 bg-white border border-stone-200 rounded-2xl hover:border-[#18452E] hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                          >
                            <div>
                              <p className="font-bold text-[#18452E] text-sm">{b.propertyName}</p>
                              <p className="text-#6B7280 text-xs mt-0.5">
                                Guest: {b.guestName} &bull; Check-in: {b.checkInDate}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              {b.remittanceFormSent ? (
                                <div>
                                  <span className="font-black text-sm text-emerald-800 block">₦{b.remittanceAmount.toLocaleString()}</span>
                                  <span className="text-[9px] uppercase font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                                    Disbursed Payout
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <span className="font-black text-sm text-amber-800 block">₦{b.remittanceAmount.toLocaleString()}</span>
                                  <span className="text-[9px] uppercase font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                    Awaiting Disbursal
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DAMAGE MANAGEMENT */}
      {activeTab === 'DamageReport' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SUBMIT REPORT FORM */}
            <div className="bg-white border rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-black text-sm text-[#18452E] uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Report Property Damage
              </h3>
              
              <form onSubmit={handleDamageSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">Booking Reference</label>
                  <select 
                    required
                    value={damageForm.bookingId}
                    onChange={(e) => setDamageForm(prev => ({ ...prev, bookingId: e.target.value }))}
                    className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none"
                  >
                    <option value="">-- Select booking --</option>
                    {bookings.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.propertyName} - {b.guestName} ({b.checkInDate})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">Damage Category</label>
                    <select 
                      value={damageForm.damageCategory}
                      onChange={(e) => setDamageForm(prev => ({ ...prev, damageCategory: e.target.value }))}
                      className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Television">Television</option>
                      <option value="Air Conditioner">Air Conditioner</option>
                      <option value="Kitchen Appliance">Kitchen Appliance</option>
                      <option value="Door">Door</option>
                      <option value="Window">Window</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Painting">Painting</option>
                      <option value="Flooring">Flooring</option>
                      <option value="Mattress">Mattress</option>
                      <option value="Decoration">Decoration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">Urgency Level</label>
                    <select 
                      value={damageForm.urgencyLevel}
                      onChange={(e) => setDamageForm(prev => ({ ...prev, urgencyLevel: e.target.value }))}
                      className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">Date Discovered</label>
                  <input 
                    type="date"
                    required
                    value={damageForm.dateDiscovered}
                    onChange={(e) => setDamageForm(prev => ({ ...prev, dateDiscovered: e.target.value }))}
                    className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">Description of Damage</label>
                  <textarea 
                    required
                    placeholder="Describe exactly what is broken or missing..."
                    value={damageForm.description}
                    onChange={(e) => setDamageForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">Estimated Repair Cost (₦)</label>
                  <input 
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    value={damageForm.estimatedCost}
                    onChange={(e) => setDamageForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">Root Cause</label>
                    <input 
                      type="text"
                      placeholder="e.g. Guest negligence"
                      value={damageForm.rootCause}
                      onChange={(e) => setDamageForm(prev => ({ ...prev, rootCause: e.target.value }))}
                      className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-stone-400 uppercase mb-1">Assigned Vendor (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Tola Plumbing"
                      value={damageForm.repairVendor}
                      onChange={(e) => setDamageForm(prev => ({ ...prev, repairVendor: e.target.value }))}
                      className="w-full p-2 bg-white border border-stone-200 rounded text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="border border-dashed border-stone-300 rounded-xl p-6 text-center bg-stone-50 cursor-pointer hover:bg-stone-50 transition-colors">
                  <span className="block text-#6B7280 font-bold mb-1">Click to Upload Evidence</span>
                  <span className="block text-[10px] text-stone-400">Photos, Videos, Invoices, Quotes, Voice Notes</span>
                  {damageForm.evidenceCount > 0 && (
                    <div className="mt-3 inline-flex bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {damageForm.evidenceCount} Files Attached
                    </div>
                  )}
                  <input type="file" multiple className="hidden" id="evidence-upload" onChange={(e) => setDamageForm(prev => ({ ...prev, evidenceCount: (e.target.files?.length || 0) }))} />
                  <label htmlFor="evidence-upload" className="absolute inset-0 cursor-pointer w-full h-full opacity-0"></label>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-[10px] text-amber-800 leading-tight">
                    <strong>Transparency Rule:</strong> Submitting this report will permanently lodge it to the landlord and admin dashboards. Evidence (photos/receipts) will be uploaded in the next step.
                  </p>
                </div>

                <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer">
                  Submit Damage Report
                </button>
              </form>
            </div>

            {/* MANAGER REPAIR STATUS TRACKER */}
            <div className="bg-white border rounded-3xl p-6 space-y-4">
              <h3 className="font-display font-black text-sm text-[#18452E] uppercase">Damage Tracking Status</h3>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {damageReports.length === 0 ? (
                  <p className="text-stone-400 italic text-xs">No damage reports submitted yet.</p>
                ) : (
                  damageReports.map(report => (
                    <div key={report.id} className="p-3 bg-stone-50 border rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#18452E]">{report.propertyName}</p>
                          <p className="text-#6B7280 font-mono text-[10px]">{report.damageCategory} &bull; {report.dateDiscovered}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded ${
                          report.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800' :
                          report.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          report.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'Completed' ? 'bg-stone-200 text-#6B7280' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      
                      <p className="text-#6B7280 text-[11px] leading-tight line-clamp-2">
                        {report.description}
                      </p>
                      
                      <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-[10px]">
                        <span className="font-bold text-#132A1D">Est: ₦{report.estimatedCost.toLocaleString()}</span>
                        <span className={`font-mono ${
                          report.urgencyLevel === 'Critical' ? 'text-red-600 font-bold' :
                          report.urgencyLevel === 'High' ? 'text-amber-600 font-bold' :
                          'text-stone-400'
                        }`}>{report.urgencyLevel} Urgency</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB: MY EARNINGS PORTFOLIO */}
      {activeTab === 'EarningsPortfolio' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 gap-4">
            <div>
              <h2 className="font-display font-black text-xl text-[#18452E] uppercase tracking-tight">My Earnings Portfolio</h2>
              <p className="text-#6B7280 text-xs mt-1">
                Real-time booking intelligence, commissions tracking, and property performance metrics.
              </p>
            </div>
            
            {/* SUB-TAB NAV */}
            <div className="flex bg-stone-50 p-1 rounded-xl shrink-0 self-start md:self-auto">
              <button
                onClick={() => setSubTab('Analysis')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition duration-200 ${
                  subTab === 'Analysis' 
                    ? 'bg-white text-[#18452E] shadow-xs' 
                    : 'text-#6B7280 hover:text-#132A1D'
                }`}
              >
                Earnings Overview
              </button>
              <button
                onClick={() => setSubTab('Ranking')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition duration-200 ${
                  subTab === 'Ranking' 
                    ? 'bg-white text-[#18452E] shadow-xs' 
                    : 'text-#6B7280 hover:text-#132A1D'
                }`}
              >
                Property Ranking
              </button>
            </div>
          </div>

          {subTab === 'Analysis' ? (
            <div className="space-y-8">
              {/* STEP 3: PORTFOLIO SUMMARY AT THE TOP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="spatial-glass border border-stone-200/80 p-5 rounded-2xl bg-stone-50/50 space-y-1">
                  <span className="text-[10px] text-stone-400 block font-mono font-bold uppercase tracking-wider">Commission This Month</span>
                  <span className="text-2xl font-black text-[#18452E] block">₦{totalCommissionThisMonth.toLocaleString()}</span>
                  <span className="text-[10px] text-#6B7280 block">Calculated from July booking logs.</span>
                </div>

                <div className="spatial-glass border border-stone-200/80 p-5 rounded-2xl bg-stone-50/50 space-y-1">
                  <span className="text-[10px] text-stone-400 block font-mono font-bold uppercase tracking-wider">Commission This Year</span>
                  <span className="text-2xl font-black text-[#C9A84C] block">₦{totalCommissionThisYear.toLocaleString()}</span>
                  <span className="text-[10px] text-#6B7280 block">Accumulated commissions for 2026.</span>
                </div>

                <div className="spatial-glass border border-stone-200/80 p-5 rounded-2xl bg-stone-50/50 space-y-1">
                  <span className="text-[10px] text-stone-400 block font-mono font-bold uppercase tracking-wider">Most Profitable Property</span>
                  <span className="text-base font-black text-#132A1D block truncate mt-1">
                    {mostProfitablePropName}
                  </span>
                  <span className="text-[10px] text-#6B7280 block">Highest manager fee generator.</span>
                </div>

                <div className="spatial-glass border border-stone-200/80 p-5 rounded-2xl bg-stone-50/50 space-y-1">
                  <span className="text-[10px] text-stone-400 block font-mono font-bold uppercase tracking-wider">Outstanding Remittances</span>
                  <span className={`text-2xl font-black block ${totalOutstandingAll > 0 ? 'text-red-600' : 'text-#132A1D'}`}>
                    ₦{totalOutstandingAll.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-#6B7280 block">Total pending landlord payouts.</span>
                </div>
              </div>

              {/* STEP 2: PER-PROPERTY EARNINGS CARDS */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-black text-sm text-[#18452E] uppercase tracking-wider">Property Commission Analysis</h3>
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">Sorted by profitability descending</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProperties.map(p => {
                    const lastComm = p.lastMonthCommission;
                    const curComm = p.currentMonthCommission;
                    let trendText = '';
                    let trendColor = 'text-stone-400';
                    let isUp = true;

                    if (lastComm === 0) {
                      if (curComm > 0) {
                        trendText = '+100%';
                        trendColor = 'text-emerald-600 bg-emerald-50 border border-emerald-200';
                        isUp = true;
                      } else {
                        trendText = '0%';
                        trendColor = 'text-#6B7280 bg-stone-50 border border-stone-200/60';
                        isUp = true;
                      }
                    } else {
                      const pct = ((curComm - lastComm) / lastComm) * 100;
                      if (pct > 0) {
                        trendText = `+${pct.toFixed(0)}%`;
                        trendColor = 'text-emerald-600 bg-emerald-50 border border-emerald-200';
                        isUp = true;
                      } else if (pct < 0) {
                        trendText = `${pct.toFixed(0)}%`;
                        trendColor = 'text-rose-600 bg-rose-50 border border-rose-100';
                        isUp = false;
                      } else {
                        trendText = '0%';
                        trendColor = 'text-#6B7280 bg-stone-50 border border-stone-200/60';
                        isUp = true;
                      }
                    }

                    return (
                      <div key={p.agreement.propertyId} className="bg-white border border-stone-200 rounded-3xl p-5 hover:shadow-lg transition duration-250 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-display font-black text-sm text-[#18452E] line-clamp-1">
                            {p.agreement.propertyName}
                          </h4>
                          <p className="text-[11px] text-stone-400 font-medium">
                            Landlord: {p.agreement.landlordName}
                          </p>
                        </div>

                        {/* STEP 1 VERIFIED FORMULA DISPLAY */}
                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2">
                          <div className="flex justify-between text-[11px] border-b pb-1 border-stone-200/50">
                            <span className="text-#6B7280">Gross Revenue (Month):</span>
                            <span className="font-mono font-bold text-#132A1D">₦{p.currentMonthGross.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[11px] border-b pb-1 border-stone-200/50">
                            <span className="text-#6B7280">Landlord Share (Month):</span>
                            <span className="font-mono font-bold text-#132A1D">₦{(p.currentMonthGross - p.currentMonthCommission - p.currentMonthOutstanding).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-#6B7280">Commission (Month):</span>
                            <span className="font-mono font-bold text-[#18452E]">₦{p.currentMonthCommission.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-mono text-stone-400 block uppercase font-bold">Outstanding Remittance</span>
                            <span className={`text-xs font-mono font-black ${p.outstandingRemittances > 0 ? 'text-red-600' : 'text-stone-400'}`}>
                              ₦{p.outstandingRemittances.toLocaleString()}
                            </span>
                          </div>

                          <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${trendColor}`}>
                            {isUp ? (
                              <ArrowUpRight className="w-3 h-3 shrink-0" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 shrink-0" />
                            )}
                            <span>{trendText}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* STEP 4: DEPOSIT ACCOUNTABILITY SUMMARY */}
              {(() => {
                const monthBookingsWithDeposit = bookings.filter(b => b.caution_deposit_collected);
                const monthDepositsCollected = monthBookingsWithDeposit.reduce((sum, b) => sum + (b.caution_deposit_amount || 25000), 0);

                const monthResolutions = resolutions.filter(r => r.resolvedAt && r.resolvedAt.startsWith(currentYearMonth));
                const monthDepositsReturned = monthResolutions.reduce((sum, r) => sum + (r.amountReturned || 0), 0);
                const monthDepositsRetained = monthResolutions.reduce((sum, r) => sum + (r.amountRetained || 0), 0);

                const unresolvedCheckouts = monthBookingsWithDeposit.filter(b => {
                  const isPastCheckout = b.checkOutDate <= new Date().toISOString().split('T')[0];
                  const hasRes = resolutions.some(r => r.bookingId === b.id);
                  return isPastCheckout && !hasRes;
                });

                return (
                  <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-white rounded-3xl p-6 space-y-4 shadow-lg border border-amber-700/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-700/60 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-5 h-5 text-amber-300" />
                          <h3 className="font-display font-black text-sm uppercase text-amber-100 tracking-wide">
                            Deposit Accountability Summary ({currentYearMonth})
                          </h3>
                        </div>
                        <p className="text-amber-200/80 text-xs mt-0.5">
                          Tracking shortlet caution deposits collected, returned, and retained for damage resolutions.
                        </p>
                      </div>

                      {unresolvedCheckouts.length > 0 ? (
                        <span className="px-3 py-1 bg-rose-600 text-white font-mono font-bold text-xs rounded-full uppercase flex items-center gap-1 shrink-0 animate-pulse">
                          ⚠️ {unresolvedCheckouts.length} Unresolved Checkouts
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-800 text-emerald-100 font-mono font-bold text-xs rounded-full uppercase shrink-0">
                          ✓ All Deposits Reconciled
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                      <div className="bg-amber-900/40 border border-amber-700/40 p-4 rounded-2xl">
                        <span className="text-[10px] font-mono uppercase text-amber-300/80 font-bold block">Total Collected</span>
                        <span className="text-xl font-black text-white block mt-1">₦{monthDepositsCollected.toLocaleString()}</span>
                        <span className="text-[10px] text-amber-200/70 block mt-0.5">{monthBookingsWithDeposit.length} shortlet bookings</span>
                      </div>

                      <div className="bg-emerald-950/40 border border-emerald-700/40 p-4 rounded-2xl">
                        <span className="text-[10px] font-mono uppercase text-emerald-300/80 font-bold block">Returned to Guests</span>
                        <span className="text-xl font-black text-emerald-200 block mt-1">₦{monthDepositsReturned.toLocaleString()}</span>
                        <span className="text-[10px] text-emerald-300/70 block mt-0.5">Disbursed post-checkout</span>
                      </div>

                      <div className="bg-amber-950/60 border border-amber-600/50 p-4 rounded-2xl">
                        <span className="text-[10px] font-mono uppercase text-amber-300/80 font-bold block">Retained for Damages</span>
                        <span className="text-xl font-black text-amber-300 block mt-1">₦{monthDepositsRetained.toLocaleString()}</span>
                        <span className="text-[10px] text-amber-200/70 block mt-0.5">Backed by damage audits</span>
                      </div>

                      <div className="bg-#132A1D/60 border border-#132A1D/50 p-4 rounded-2xl">
                        <span className="text-[10px] font-mono uppercase text-stone-300/80 font-bold block">Unresolved Checkouts</span>
                        <span className={`text-xl font-black block mt-1 ${unresolvedCheckouts.length > 0 ? 'text-rose-400 font-extrabold' : 'text-stone-300'}`}>
                          {unresolvedCheckouts.length}
                        </span>
                        <span className="text-[10px] text-stone-400 block mt-0.5">Pending resolution report</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* STEP 5: MONTHLY BAR CHART OF LAST 6 MONTHS */}
              <div className="bg-white border rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-[#18452E]" />
                    <h3 className="font-display font-black text-sm text-[#18452E] uppercase">6-Month Commission History</h3>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-stone-400 bg-stone-50 px-2 py-0.5 rounded uppercase">
                    Interactive Hover Breakdown
                  </span>
                </div>
                
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                      <YAxis 
                        tickFormatter={(v) => `₦${(v / 1000).toLocaleString()}k`} 
                        tick={{ fontSize: 10, fill: '#6B7280' }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45, 106, 79, 0.04)' }} />
                      <Bar dataKey="total" fill="#18452E" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 5: PROPERTY PERFORMANCE RANKING SPECIFIC TO THE MANAGER */
            <div className="bg-white border rounded-3xl p-6 space-y-5">
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-[#C9A84C]" />
                  <h3 className="font-display font-black text-sm text-[#18452E] uppercase">Property Performance Leaderboard</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">Current Month Statistics</span>
              </div>

              <div className="space-y-4">
                {sortedProperties.map((p, idx) => {
                  const isTop = idx === 0;
                  const isBottom = idx === sortedProperties.length - 1 && sortedProperties.length > 1;
                  
                  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                  const occupancyRate = (p.currentMonthNights / totalDays) * 100;

                  return (
                    <div 
                      key={p.agreement.propertyId} 
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-stone-50 border border-stone-200/60 rounded-2xl gap-4 hover:shadow-md transition duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0 ${
                          isTop 
                            ? 'bg-amber-100 text-[#C9A84C] border border-amber-200' 
                            : 'bg-stone-200 text-#6B7280'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#18452E] text-sm md:text-base truncate">{p.agreement.propertyName}</p>
                          <p className="text-stone-400 text-xs">Landlord: {p.agreement.landlordName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-left lg:text-right">
                        <div>
                          <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">Total Bookings</span>
                          <span className="font-bold text-#132A1D text-xs md:text-sm mt-0.5 block">{p.currentMonthBookingsCount} bookings</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">Avg Night Rate</span>
                          <span className="font-bold text-#132A1D text-xs md:text-sm mt-0.5 block">₦{p.currentMonthAverageRate.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">Occupancy Rate</span>
                          <span className="font-bold text-#132A1D text-xs md:text-sm mt-0.5 block">{occupancyRate.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-mono text-stone-400 block font-bold">Commission Earned</span>
                          <span className="font-bold text-[#18452E] text-xs md:text-sm mt-0.5 block">₦{p.currentMonthCommission.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="lg:min-w-[130px] lg:text-right shrink-0">
                        {isTop && (
                          <span className="inline-block bg-amber-50 text-[#C9A84C] border border-[#C9A84C]/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                            Most Profitable
                          </span>
                        )}
                        {isBottom && (
                          <span className="inline-block bg-stone-50 text-#6B7280 border border-stone-200 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                            Needs Attention
                          </span>
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

      {/* TAB 7: PROFILE & VERIFICATION (Addition Eight) */}
      {activeTab === 'Profile' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="bg-white border rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-display font-black text-sm text-[#18452E] uppercase flex items-center space-x-2">
                <User className="w-5 h-5 text-[#18452E]" />
                <span>Manager Profile &amp; Verification Progress</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                ID: {session.userId || 'SM-8921'}
              </span>
            </div>

            {/* PROFILE COMPLETION INDICATOR */}
            {(() => {
              const items = [
                { key: 'photoUploaded', label: 'Landlord Photo Uploaded', done: profileState.photoUploaded, action: 'Upload Photo' },
                { key: 'phoneVerified', label: 'Primary Contact Number Verified', done: profileState.phoneVerified, action: 'Verify Phone' },
                { key: 'collectionAccountVerified', label: 'Collection Account Verified for Remittances', done: profileState.collectionAccountVerified, action: 'Verify Bank' },
                { key: 'managementAgreementUploaded', label: 'Shortlet Management Agreement Executed', done: profileState.managementAgreementUploaded, action: 'Upload Agreement' },
                { key: 'bankNameMatchesRealName', label: 'Bank Account Name Matches Real Name', done: profileState.bankNameMatchesRealName, action: 'Verify Name Match' }
              ];

              const completedCount = items.filter(i => i.done).length;
              const totalCount = items.length;
              const percentage = Math.round((completedCount / totalCount) * 100);

              return (
                <div className="space-y-4 bg-stone-50 border border-stone-200 p-5 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-#132A1D uppercase tracking-wider">Verification Completeness</h4>
                      <p className="text-[10px] text-#6B7280 font-mono mt-0.5">
                        {completedCount} of {totalCount} compliance checkpoints passed
                      </p>
                    </div>
                    <span className={`text-xl font-black font-mono ${percentage === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {percentage}%
                    </span>
                  </div>

                  {/* PERCENTAGE BAR */}
                  <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${percentage === 100 ? 'bg-emerald-600' : 'bg-[#18452E]'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  {/* CHECKLIST ITEMS */}
                  <div className="space-y-2 pt-2 border-t border-stone-200/80">
                    {items.map((item) => (
                      <div key={item.key} className="flex justify-between items-center text-xs p-2.5 bg-white rounded-xl border border-stone-150">
                        <div className="flex items-center space-x-2">
                          {item.done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span className={item.done ? 'text-#132A1D font-medium' : 'text-#132A1D font-bold'}>
                            {item.label}
                          </span>
                        </div>
                        {item.done ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase rounded-full">
                            Complete
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setProfileState(prev => ({ ...prev, [item.key]: true }));
                              triggerSuccess(`Verified item: ${item.label}`);
                            }}
                            className="px-2.5 py-1 bg-[#18452E] hover:bg-[#18452E] text-white text-[10px] font-bold rounded-lg uppercase cursor-pointer transition shadow-xs"
                          >
                            {item.action}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase text-#132A1D font-mono">Assigned Manager Details</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-150">
                  <span className="text-[9px] text-stone-400 font-mono block uppercase">Name</span>
                  <strong className="text-#132A1D">{session.name}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-150">
                  <span className="text-[9px] text-stone-400 font-mono block uppercase">System Role</span>
                  <strong className="text-#132A1D">{session.role}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-150">
                  <span className="text-[9px] text-stone-400 font-mono block uppercase">Managed Units</span>
                  <strong className="text-#132A1D">{activeAgreements.length} Shortlets</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-150">
                  <span className="text-[9px] text-stone-400 font-mono block uppercase">Compliance Tier</span>
                  <strong className="text-emerald-700">Tier-1 Shortlet Desk</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SELECTED BOOKING DETAIL */}
      {selectedDetailBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-display font-black text-sm text-[#18452E] uppercase">Booking Record Detail</h3>
                <span className="text-[10px] font-mono text-stone-400">ID: {selectedDetailBooking.id}</span>
              </div>
              <button onClick={() => setSelectedDetailBooking(null)} className="p-1 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-#132A1D">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl border space-y-1">
                <span className="text-[9px] font-mono text-stone-400 block uppercase">Shortlet Property</span>
                <strong className="text-sm font-bold text-[#18452E]">{selectedDetailBooking.propertyName}</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Guest Name</span>
                  <strong className="text-#132A1D font-bold">{selectedDetailBooking.guestName}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Booking Channel</span>
                  <strong className="text-#132A1D font-bold">{selectedDetailBooking.bookingSource || 'Direct'}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Check-In Date</span>
                  <strong className="text-#132A1D font-bold">{selectedDetailBooking.checkInDate}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Check-Out Date</span>
                  <strong className="text-#132A1D font-bold">{selectedDetailBooking.checkOutDate}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Gross Revenue Collected</span>
                  <strong className="text-[#18452E] font-black text-sm">₦{selectedDetailBooking.totalPaid.toLocaleString()}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Remittance Net Amount</span>
                  <strong className="text-emerald-800 font-black text-sm">₦{selectedDetailBooking.remittanceAmount.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setSelectedDetailBooking(null)}
                className="px-4 py-2 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SELECTED REMITTANCE DETAIL WITH TRANSPARENCY TIMELINE (Addition Seven) */}
      {selectedDetailRemittance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-display font-black text-sm text-[#18452E] uppercase">Remittance Disbursement Record</h3>
                <span className="text-[10px] font-mono text-stone-400">Statement ID: {selectedDetailRemittance.id}</span>
              </div>
              <button onClick={() => setSelectedDetailRemittance(null)} className="p-1 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-#132A1D">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl border">
                <span className="text-[9px] font-mono text-stone-400 block uppercase">Property Covered</span>
                <strong className="text-#132A1D font-bold">{selectedDetailRemittance.propertyName}</strong>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border">
                <span className="text-[9px] font-mono text-stone-400 block uppercase">Net Disbursed Share</span>
                <strong className="text-emerald-800 font-black text-sm">₦{selectedDetailRemittance.remittanceAmount.toLocaleString()}</strong>
              </div>
            </div>

            {/* TRANSPARENCY TIMELINE (Addition Seven) */}
            <div className="space-y-3 bg-stone-50 border p-4 rounded-2xl">
              <h4 className="font-bold text-xs uppercase text-#132A1D font-mono tracking-wider">
                Transparency Audit Timeline
              </h4>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                {/* STEP 1 */}
                <div className="flex items-start space-x-3 relative z-10">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0 text-[10px] font-bold">1</div>
                  <div>
                    <strong className="text-xs text-#132A1D block">Remittance Submitted</strong>
                    <span className="text-[10px] text-#6B7280 font-mono block">Submitted by Manager: {session.name}</span>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="flex items-start space-x-3 relative z-10">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0 text-[10px] font-bold">2</div>
                  <div>
                    <strong className="text-xs text-#132A1D block">Transfer Reference Entered</strong>
                    <span className="text-[10px] text-#6B7280 font-mono block">Ref: TRF-SHORTLET-{selectedDetailRemittance.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                {/* STEP 3 */}
                <div className="flex items-start space-x-3 relative z-10">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0 text-[10px] font-bold">3</div>
                  <div>
                    <strong className="text-xs text-#132A1D block">Confirmation Checkbox Ticked</strong>
                    <span className="text-[10px] text-#6B7280 font-mono block">Manager Verified Payment Transfer</span>
                  </div>
                </div>

                {/* STEP 4 */}
                <div className="flex items-start space-x-3 relative z-10">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0 text-[10px] font-bold">4</div>
                  <div>
                    <strong className="text-xs text-#132A1D block">Landlord Notified</strong>
                    <span className="text-[10px] text-#6B7280 font-mono block">Dispatched to Landlord Feed &amp; Email</span>
                  </div>
                </div>

                {/* STEP 5: ACKNOWLEDGED OR DISPUTED */}
                <div className="flex items-start space-x-3 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 text-[10px] font-bold ${
                    selectedDetailRemittance.remittanceStatus === 'acknowledged' ? 'bg-emerald-600' :
                    selectedDetailRemittance.remittanceStatus === 'disputed' ? 'bg-rose-600' : 'bg-amber-500'
                  }`}>5</div>
                  <div>
                    {selectedDetailRemittance.remittanceStatus === 'acknowledged' ? (
                      <div>
                        <strong className="text-xs text-emerald-800 block">Acknowledged by Landlord</strong>
                        <span className="text-[10px] text-emerald-600 font-mono block">Confirmed received with no dispute</span>
                      </div>
                    ) : selectedDetailRemittance.remittanceStatus === 'disputed' ? (
                      <div>
                        <strong className="text-xs text-rose-800 block">Disputed by Landlord</strong>
                        <span className="text-[10px] text-rose-600 font-mono block">Reason: {selectedDetailRemittance.disputeReason || 'Discrepancy noted'}</span>
                      </div>
                    ) : (
                      <div>
                        <strong className="text-xs text-amber-800 block">Awaiting Landlord Acknowledgment</strong>
                        <span className="text-[10px] text-amber-600 font-mono block">Action required by Landlord</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between items-center pt-2 border-t">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    handleAcknowledgeRemittance(selectedDetailRemittance.id);
                    setSelectedDetailRemittance(null);
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-xs"
                >
                  Acknowledge Remittance
                </button>
                <button
                  onClick={() => {
                    setDisputedRemittanceId(selectedDetailRemittance.id);
                    setShowDisputeModal(true);
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold rounded-xl text-xs cursor-pointer transition border border-rose-200"
                >
                  Dispute Statement
                </button>
              </div>

              <button
                onClick={() => setSelectedDetailRemittance(null)}
                className="px-4 py-2 bg-stone-50 text-#132A1D font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE REASON MODAL */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-display font-black text-sm text-rose-800 uppercase">Dispute Remittance Statement</h3>
            <p className="text-xs text-#6B7280">
              Please specify the reason for disputing this remittance statement. This will trigger an immediate audit alert to management.
            </p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Expected ₦150,000 based on Airbnb payout, but received ₦130,000..."
              value={disputeReasonInput}
              onChange={(e) => setDisputeReasonInput(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDisputeModal(false);
                  setDisputeReasonInput('');
                }}
                className="px-4 py-2 bg-stone-50 text-#132A1D font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!disputeReasonInput.trim() || !disputedRemittanceId) return;
                  handleDisputeRemittance(disputedRemittanceId, disputeReasonInput.trim());
                  setShowDisputeModal(false);
                  setDisputeReasonInput('');
                  setSelectedDetailRemittance(null);
                }}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Submit Dispute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SELECTED PROPERTY DETAIL WITH AUDIT HISTORY TAB (Addition Four) */}
      {selectedDetailProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-display font-black text-base text-[#18452E] uppercase">{selectedDetailProperty.propertyName}</h3>
                <span className="text-[10px] font-mono text-stone-400">Property ID: {selectedDetailProperty.propertyId}</span>
              </div>
              <button onClick={() => setSelectedDetailProperty(null)} className="p-1 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-#132A1D">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL TABS */}
            <div className="flex bg-stone-50 p-1 rounded-xl">
              <button
                onClick={() => setPropertyDetailTab('info')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  propertyDetailTab === 'info' ? 'bg-white text-[#18452E] shadow-xs' : 'text-#6B7280'
                }`}
              >
                Apartment Info
              </button>
              <button
                onClick={() => setPropertyDetailTab('agreements')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  propertyDetailTab === 'agreements' ? 'bg-white text-[#18452E] shadow-xs' : 'text-#6B7280'
                }`}
              >
                Rates &amp; Terms
              </button>
              <button
                onClick={() => setPropertyDetailTab('history')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  propertyDetailTab === 'history' ? 'bg-white text-[#18452E] shadow-xs' : 'text-#6B7280'
                }`}
              >
                Audit History
              </button>
            </div>

            {propertyDetailTab === 'info' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Management Fee</span>
                  <strong className="text-[#18452E] font-bold">{selectedDetailProperty.managementFeePercent}%</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Landlord / Owner</span>
                  <strong className="text-#132A1D font-bold">{selectedDetailProperty.landlordName || session.name}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Agreement Status</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[9px] uppercase">Active</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Nightly Standard Rate</span>
                  <strong className="text-#132A1D font-bold">₦{selectedDetailProperty.nightlyRate ? selectedDetailProperty.nightlyRate.toLocaleString() : '85,000'}</strong>
                </div>
              </div>
            )}

            {propertyDetailTab === 'agreements' && (
              <div className="space-y-3 text-xs">
                <div className="p-4 bg-stone-50 border rounded-2xl space-y-2">
                  <h4 className="font-bold text-#132A1D uppercase font-mono text-[10px]">Management Terms &amp; Commission</h4>
                  <p className="text-#6B7280">
                    Unity Homes manages this unit at a fixed commission rate of <strong className="text-[#18452E]">{selectedDetailProperty.managementFeePercent}%</strong> of gross revenue collected. All utility and cleaning expenses are reconciled monthly.
                  </p>
                </div>
              </div>
            )}

            {/* AUDIT HISTORY TAB (Addition Four) */}
            {propertyDetailTab === 'history' && (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                <h4 className="font-bold text-xs uppercase text-#132A1D font-mono">Significant Changes &amp; Action Logs</h4>

                {(() => {
                  const logs = getLogsForRecord(selectedDetailProperty.propertyName);
                  if (logs.length === 0) {
                    return (
                      <div className="p-4 bg-stone-50 border rounded-2xl text-center text-stone-400 italic text-xs">
                        No historical rate or agreement changes logged for this unit yet.
                      </div>
                    );
                  }

                  return logs.map((log: any) => (
                    <div key={log.id} className="p-3 bg-stone-50 border rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#18452E]">{log.action || 'Rate Change'}</span>
                        <span className="text-[9px] font-mono text-stone-400">{log.timestamp}</span>
                      </div>
                      <p className="text-#6B7280">{log.details}</p>
                      <span className="text-[9px] text-stone-400 font-mono block">Author: {log.user} ({log.role})</span>
                    </div>
                  ));
                })()}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setSelectedDetailProperty(null)}
                className="px-4 py-2 bg-stone-50 text-#132A1D font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DAMAGE DETAIL MODAL */}
      {selectedDetailDamage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-display font-black text-sm text-amber-800 uppercase">Damage Report Detail</h3>
                <span className="text-[10px] font-mono text-stone-400">ID: {selectedDetailDamage.id}</span>
              </div>
              <button onClick={() => setSelectedDetailDamage(null)} className="p-1 hover:bg-stone-50 rounded-lg text-stone-400 hover:text-#132A1D">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-2xl border">
                <span className="text-[9px] font-mono text-stone-400 block uppercase">Property Name</span>
                <strong className="text-[#18452E] font-bold text-sm block">{selectedDetailDamage.propertyName}</strong>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl border">
                <span className="text-[9px] font-mono text-stone-400 block uppercase">Damage Description</span>
                <p className="text-#132A1D mt-0.5">{selectedDetailDamage.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Estimated Repair Cost</span>
                  <strong className="text-rose-700 font-black text-sm">₦{selectedDetailDamage.estimatedCost.toLocaleString()}</strong>
                </div>
                <div className="p-3 bg-stone-50 rounded-2xl border">
                  <span className="text-[9px] font-mono text-stone-400 block uppercase">Urgency Rating</span>
                  <strong className="text-amber-700 font-bold">{selectedDetailDamage.urgency || 'Medium'}</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setSelectedDetailDamage(null)}
                className="px-4 py-2 bg-stone-50 text-#132A1D font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
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
        role="Shortlet Manager"
        activeTab={activeTab}
        setActiveTab={setActiveTab as any}
        setShowNotifications={setShowNotifications}
        hasUnread={hasUnreadNotifications}
      />

      {/* RESOLUTION MODAL OVERLAY */}
      {resolutionModalBooking && (
        <DepositResolutionModal
          booking={resolutionModalBooking}
          session={session}
          onClose={() => setResolutionModalBooking(null)}
          onSuccess={(msg) => triggerSuccess(msg)}
        />
      )}

      {/* COMPLIANT FOOTER */}
      <p className="text-center text-[10px] text-[#C9A84C] font-mono uppercase font-bold tracking-wider">
        Unity Homes Shortlet Management Desk &bull; Don&apos;t Buy Wahala
      </p>

    </div>
  );
}

// Deposit Resolution Modal Component
function DepositResolutionModal({
  booking,
  session,
  onClose,
  onSuccess
}: {
  booking: BookingLog;
  session: UserSession;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}) {
  const depositAmt = booking.caution_deposit_amount || 25000;

  const [checkoutCondition, setCheckoutCondition] = useState<string>('No Damage Observed');
  const [damageDescription, setDamageDescription] = useState<string>('');
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState<string>('');
  const [estimatedRepairCost, setEstimatedRepairCost] = useState<string>('0');
  
  const [depositDecision, setDepositDecision] = useState<string>('Full Deposit Returned to Guest');
  const [amountRetained, setAmountRetained] = useState<string>('0');
  const [amountReturned, setAmountReturned] = useState<string>(depositAmt.toString());
  const [retentionJustification, setRetentionJustification] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(false);

  const handleDecisionChange = (dec: string) => {
    setDepositDecision(dec);
    if (dec === 'Full Deposit Returned to Guest') {
      setAmountRetained('0');
      setAmountReturned(depositAmt.toString());
    } else if (dec === 'Full Deposit Retained') {
      setAmountRetained(depositAmt.toString());
      setAmountReturned('0');
    }
  };

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setDamagePhotos(prev => [...prev, photoInput.trim()]);
      setPhotoInput('');
    } else {
      const sampleImg = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600';
      setDamagePhotos(prev => [...prev, sampleImg]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      alert('You must check the confirmation box before submitting.');
      return;
    }

    const retainedNum = depositDecision === 'Full Deposit Retained' ? depositAmt : depositDecision === 'Partial Deposit Returned' ? (parseInt(amountRetained) || 0) : 0;
    const returnedNum = depositDecision === 'Full Deposit Returned to Guest' ? depositAmt : depositDecision === 'Partial Deposit Returned' ? (parseInt(amountReturned) || 0) : 0;

    if (retainedNum > 0 && !retentionJustification.trim()) {
      alert('Mandatory retention justification is required when retaining any portion of the deposit.');
      return;
    }

    const resolutionDoc = {
      id: 'res-' + Date.now(),
      bookingId: booking.id,
      propertyId: booking.propertyName,
      propertyName: booking.propertyName,
      unitNumber: booking.unitNumber,
      guestName: booking.guestName,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      managerId: session.userId || 'mgr-1',
      managerName: session.name || 'Shortlet Desk Manager',
      landlordId: 'UH-LANDLORD-FUNMI',
      landlordName: 'Funmi Owner',
      cautionDepositAmount: depositAmt,
      checkoutCondition,
      damageDescription: checkoutCondition !== 'No Damage Observed' ? damageDescription : undefined,
      damagePhotos: damagePhotos.length > 0 ? damagePhotos : undefined,
      estimatedRepairCost: checkoutCondition !== 'No Damage Observed' ? (parseInt(estimatedRepairCost) || 0) : 0,
      depositDecision,
      amountRetained: retainedNum,
      amountReturned: returnedNum,
      retentionJustification,
      resolvedAt: new Date().toISOString(),
      status: 'Submitted'
    };

    try {
      const rawRes = localStorage.getItem('uh_caution_deposit_resolutions_v1');
      const currentRes = rawRes ? JSON.parse(rawRes) : [];
      const updatedRes = [resolutionDoc, ...currentRes];
      localStorage.setItem('uh_caution_deposit_resolutions_v1', JSON.stringify(updatedRes));

      const rawLogs = localStorage.getItem('uh_collection_logs_v1');
      const logs = rawLogs ? JSON.parse(rawLogs) : [];
      const newLog = {
        id: 'log-' + Math.random().toString(36).substr(2, 9),
        eventType: 'CAUTION_DEPOSIT_RESOLVED',
        details: `Checkout deposit resolution submitted by ${session.name} for Guest ${booking.guestName} (${booking.propertyName}). Condition: ${checkoutCondition}. Decision: ${depositDecision} (Retained: ₦${retainedNum.toLocaleString()}).`,
        sender: 'PMC',
        channel: 'In-App',
        status: 'Delivered',
        outstandingAmt: 0,
        dateSent: new Date().toISOString().split('T')[0],
        isDemoData: false
      };
      localStorage.setItem('uh_collection_logs_v1', JSON.stringify([newLog, ...logs]));

      const rawNotifs = localStorage.getItem('uh_notifications_v1');
      const notifs = rawNotifs ? JSON.parse(rawNotifs) : [];
      const landNotif = {
        id: 'notif-cd-land-' + Date.now(),
        recipientRole: 'Landlord',
        recipientId: 'UH-LANDLORD-FUNMI',
        title: `🛡️ Caution Deposit Resolution: ${booking.propertyName}`,
        message: `Checkout resolution logged for Guest ${booking.guestName}. Condition: ${checkoutCondition}. Decision: ${depositDecision}.`,
        timestamp: new Date().toISOString(),
        read: false
      };
      const adminNotif = {
        id: 'notif-cd-adm-' + Date.now(),
        recipientRole: 'Admin',
        recipientId: 'UH-ADMIN-MASTER',
        title: `🛡️ Caution Deposit Resolution Filed: ${booking.propertyName}`,
        message: `Shortlet manager ${session.name} resolved deposit for booking ${booking.id}. Decision: ${depositDecision}.`,
        timestamp: new Date().toISOString(),
        read: false
      };
      localStorage.setItem('uh_notifications_v1', JSON.stringify([landNotif, adminNotif, ...notifs]));
      
      window.dispatchEvent(new StorageEvent('storage', { key: 'uh_caution_deposit_resolutions_v1' }));
    } catch (e) {
      console.error(e);
    }

    onSuccess('Checkout and Deposit Resolution recorded successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-white border rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <h3 className="font-display font-black text-lg text-[#18452E] uppercase">
                Checkout &amp; Deposit Resolution
              </h3>
            </div>
            <p className="text-#6B7280 text-xs mt-1">
              {booking.propertyName} &bull; Guest: <strong className="text-#132A1D">{booking.guestName}</strong> ({booking.checkInDate} to {booking.checkOutDate})
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-50 rounded-full text-stone-400 hover:text-#132A1D">
            <X className="w-5 h-5 cursor-pointer" />
          </button>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Caution Deposit Held by Manager:</span>
          </div>
          <span className="font-mono font-black text-sm text-amber-950">₦{depositAmt.toLocaleString()}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CHECKOUT CONDITION */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
              PROPERTY CONDITION AT CHECKOUT *
            </label>
            <select
              required
              value={checkoutCondition}
              onChange={(e) => setCheckoutCondition(e.target.value)}
              className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono outline-none focus:border-amber-600"
            >
              <option value="No Damage Observed">No Damage Observed (Clean Checkout)</option>
              <option value="Minor Damage Found">Minor Damage Found (Superficial)</option>
              <option value="Significant Damage Found">Significant Damage Found (Requires Repair / Replacement)</option>
              <option value="Serious Damage Requiring Full Deposit Retention">Serious Damage Requiring Full Deposit Retention</option>
            </select>
          </div>

          {/* DAMAGE DETAILS (IF ANY DAMAGE) */}
          {checkoutCondition !== 'No Damage Observed' && (
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-4 animate-fade-in">
              <h4 className="font-bold text-xs text-amber-950 uppercase font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                Damage Evidence &amp; Repair Estimate
              </h4>

              <div>
                <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
                  DESCRIPTION OF DAMAGE *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe exact items damaged or broken during stay..."
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
                    ESTIMATED REPAIR / REPLACEMENT COST (NGN)
                  </label>
                  <input
                    type="number"
                    value={estimatedRepairCost}
                    onChange={(e) => setEstimatedRepairCost(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
                    DAMAGE EVIDENCE PHOTOS ({damagePhotos.length}/10)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Photo URL or leave empty for sample..."
                      value={photoInput}
                      onChange={(e) => setPhotoInput(e.target.value)}
                      className="p-2 bg-white border border-stone-200 rounded-xl text-xs font-mono outline-none flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhoto}
                      className="px-3 py-2 bg-amber-800 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {damagePhotos.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {damagePhotos.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-amber-300">
                      <img src={img} alt={`Damage ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setDamagePhotos(damagePhotos.filter((_, i) => i !== idx))}
                        className="absolute top-0 right-0 bg-rose-600 text-white w-4 h-4 text-[9px] flex items-center justify-center font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DEPOSIT DECISION */}
          <div className="space-y-3">
            <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase">
              DEPOSIT RESOLUTION DECISION *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'Full Deposit Returned to Guest', label: 'Full Return (100%)', desc: 'No retention' },
                { id: 'Partial Deposit Returned', label: 'Partial Return', desc: 'Split deposit' },
                { id: 'Full Deposit Retained', label: 'Full Retention (100%)', desc: 'Hold entire deposit' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => handleDecisionChange(opt.id)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    depositDecision === opt.id
                      ? 'bg-amber-900 text-white border-amber-950 shadow-sm'
                      : 'bg-stone-50 hover:bg-stone-50 text-#132A1D border-stone-200'
                  }`}
                >
                  <span className="font-bold text-xs block">{opt.label}</span>
                  <span className={`text-[10px] block mt-0.5 ${depositDecision === opt.id ? 'text-amber-200' : 'text-stone-400'}`}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* PARTIAL SPLIT SUBFIELDS */}
          {depositDecision === 'Partial Deposit Returned' && (
            <div className="p-4 bg-stone-50 border rounded-2xl grid grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
                  AMOUNT RETAINED FOR DAMAGE (NGN)
                </label>
                <input
                  type="number"
                  value={amountRetained}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setAmountRetained(val.toString());
                    setAmountReturned((Math.max(0, depositAmt - val)).toString());
                  }}
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
                  AMOUNT RETURNED TO GUEST (NGN)
                </label>
                <input
                  type="number"
                  value={amountReturned}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setAmountReturned(val.toString());
                    setAmountRetained((Math.max(0, depositAmt - val)).toString());
                  }}
                  className="w-full p-2 bg-white border border-stone-200 rounded-xl text-xs font-mono outline-none"
                />
              </div>
            </div>
          )}

          {/* RETENTION JUSTIFICATION */}
          {depositDecision !== 'Full Deposit Returned to Guest' && (
            <div>
              <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
                RETENTION JUSTIFICATION FOR LANDLORD &amp; ADMIN AUDIT *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Provide clear justification for holding or deducting from guest deposit..."
                value={retentionJustification}
                onChange={(e) => setRetentionJustification(e.target.value)}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:border-amber-600"
              />
            </div>
          )}

          {/* CONFIRMATION CHECKBOX */}
          <div className="p-3 bg-[#18452E]/10 border border-stone-200 rounded-2xl flex items-start space-x-2.5">
            <input
              type="checkbox"
              id="confirm-res-check"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 accent-[#18452E] shrink-0 mt-0.5 cursor-pointer"
            />
            <label htmlFor="confirm-res-check" className="text-#132A1D leading-tight text-xs cursor-pointer select-none">
              I confirm this checkout was completed and the deposit decision above is accurate. My report will be visible to the landlord and Unity Homes admin.
            </label>
          </div>

          {/* BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 bg-stone-50 hover:bg-stone-200 text-#132A1D font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!confirmed}
              className={`py-3 text-white font-bold rounded-xl text-xs transition cursor-pointer ${
                confirmed ? 'bg-[#18452E] hover:bg-[#18452E] shadow-md' : 'bg-stone-300 text-stone-400 cursor-not-allowed'
              }`}
            >
              Submit Deposit Resolution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Custom tooltip for historical bar chart breakdown (Step 4)
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-xl space-y-2 max-w-xs text-xs">
        <p className="font-bold text-#6B7280 uppercase tracking-wider text-[10px] font-mono">
          {data.month} Breakdown
        </p>
        <p className="font-black text-sm text-[#18452E] border-b border-stone-200 pb-1.5">
          Commission: ₦{data.total.toLocaleString()}
        </p>
        <div className="space-y-1">
          {data.breakdown.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center space-x-4">
              <span className="text-#6B7280 truncate max-w-[140px]">{item.propertyName}</span>
              <span className="font-mono font-bold text-#132A1D shrink-0">₦{item.commission.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
