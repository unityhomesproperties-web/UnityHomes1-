import React, { useState, useEffect } from 'react';
import { 
  Bell, Bot, Sparkles, Clock, Send, CheckCircle, AlertTriangle, 
  TrendingUp, Search, Filter, Mail, Smartphone, FileText, Check, 
  Plus, Trash2, Building, Receipt, History, User, Calendar, RefreshCw
} from 'lucide-react';
import ExportCenter from './ExportCenter';
import SavedFilters from './SavedFilters';

// Interfaces matching types and feature demands
export interface CollectionTenant {
  id: string;
  tenantName: string;
  tenantCode: string;
  propertyName: string;
  unitNumber: string;
  landlordCode: string;
  pmcId?: string;
  rentAmount: number;
  rentPaid: number;
  rentStatus: 'Paid' | 'Overdue' | 'Due Soon' | 'Partially Paid';
  rentDueDate: string;
  serviceChargeAmount: number;
  serviceChargePaid: number;
  serviceChargeStatus: 'Paid' | 'Overdue' | 'Due Soon' | 'Partially Paid' | 'Unpaid';
  serviceChargeDueDate: string;
  overdueDays: number;
  latePaymentHistoryCount: number;
  isHighRisk: boolean;
  phone: string;
  email: string;
  whatsapp: string;
  guarantorName: string;
  guarantorPhone: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface ReminderLog {
  id: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  dateSent: string;
  timeSent: string;
  sender: 'AI' | 'PMC' | 'Landlord' | 'Admin';
  channel: 'In-App' | 'Email' | 'SMS' | 'WhatsApp';
  status: 'Delivered' | 'Failed' | 'Pending';
  readStatus: 'Read' | 'Unread' | 'N/A';
  paymentStatusAfter: 'Paid' | 'Partially Paid' | 'Unpaid';
  outstandingAmt: number;
}

export interface ReminderRule {
  id: string;
  triggerEvent: string; // e.g. "7 days before due date", "overdue by 14 days"
  channels: ('In-App' | 'Email' | 'SMS' | 'WhatsApp')[];
  isEnabled: boolean;
}

const LOCAL_STORAGE_TENANTS_KEY = 'uh_collection_tenants_v1';
const LOCAL_STORAGE_LOGS_KEY = 'uh_collection_logs_v1';
const LOCAL_STORAGE_RULES_KEY = 'uh_collection_rules_v1';
const LOCAL_STORAGE_LEDGER_KEY = 'uh_ledger_records_v1';

export default function AICollectionCenter({ role, userId }: { role: 'Admin' | 'PMC' | 'Landlord'; userId: string }) {
  // --- STATE ---
  const [tenants, setTenants] = useState<CollectionTenant[]>([]);
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [promises, setPromises] = useState<any[]>([]);
  
  // UI Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Rent' | 'ServiceCharge' | 'Both' | 'Partial' | 'Late' | 'HighRisk' | 'Overdue30' | 'Due7'>('All');
  const [tenantActiveFilters, setTenantActiveFilters] = useState<Record<string, any>>({});
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHistoryExportOpen, setIsHistoryExportOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'Dashboard' | 'BulkReminders' | 'Scheduler' | 'Tenants' | 'History' | 'PromisesCenter'>('Dashboard');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState<any | null>(null);
  const [showSingleReminderModal, setShowSingleReminderModal] = useState<CollectionTenant | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<('In-App' | 'Email' | 'SMS' | 'WhatsApp')[]>(['In-App', 'Email']);
  const [showReceiptModal, setShowReceiptModal] = useState<{ tenant: CollectionTenant; amount: number; paymentType: string; date: string; ref: string } | null>(null);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({ triggerEvent: '7 days overdue', channels: ['In-App', 'Email'] as any[] });

  // --- INITIAL DATA SEEDING ---
  useEffect(() => {
    // 1. Seed Tenants
    const cachedTenants = localStorage.getItem(LOCAL_STORAGE_TENANTS_KEY);
    let initialTenants: CollectionTenant[] = [];
    if (cachedTenants) {
      initialTenants = JSON.parse(cachedTenants);
    } else {
      // Generate 250 interconnected tenants
      const firstNames = ['Aisha', 'Emeka', 'Chidi', 'Aminu', 'Chioma', 'Kola', 'Olatunji', 'Fatima', 'Chinedu', 'Tunde', 'Ngozi', 'Seyi', 'Tochukwu', 'Kelechi', 'Damola', 'Funke', 'Yusuf', 'Babatunde', 'Olumide', 'Blessing', 'Ndidi', 'Sunday', 'Obi', 'Chinwe', 'Ifeanyi', 'Femi', 'Temitope', 'Bolanle', 'Adeola', 'Olamide'];
      const lastNames = ['Bello', 'Okafor', 'Nwosu', 'Adebayo', 'Ibrahim', 'Yusuf', 'Olatunji', 'Abiodun', 'Mokeme', 'Tinubu', 'Adeosun', 'Otedola', 'Alakija', 'Dangote', 'Adenuga', 'Okonjo', 'Sowore', 'Soyinka', 'Achebe', 'Ezenwa', 'Falz', 'Osei', 'Sanwo-Olu', 'Balogun', 'Obasanjo', 'Saraki', 'Adeleke', 'Danjuma', 'Elumelu', 'Ovia'];
      const propertiesList = [
        { name: 'Adebayo Lekki Heights Suite A', address: 'Admiralty Way, Lekki Phase 1, Lagos', landlord: 'Mrs Funmi Adebayo', lCode: 'UH-LANDLORD-FUNMI', pmc: 'Prime Property Solutions' },
        { name: 'Osei Gbagada Estate Flat A', address: 'Millennium Estate, Gbagada, Lagos', landlord: 'Mr Babatunde Osei', lCode: 'UH-LANDLORD-OSEI', pmc: 'Prime Property Solutions' },
        { name: 'Ikeja Studio Apartment Flat 4', address: 'Toyin Street, Ikeja, Lagos', landlord: 'Chief Mrs Chioma Nwachukwu', lCode: 'UH-LANDLORD-CHIOMA', pmc: 'Unity Homes PMC' },
        { name: 'Maryland Cozy Haven Suite B', address: 'Maryland Estate, Ikeja, Lagos', landlord: 'Dr Kola Abiodun', lCode: 'UH-LANDLORD-KOLA', pmc: 'Unity Homes PMC' },
        { name: 'The Oasis Towers Apartment 5C', address: 'Eko Atlantic City, Victoria Island, Lagos', landlord: 'Alhaji Yusuf Ibrahim', lCode: 'UH-LANDLORD-YUSUF', pmc: 'Elite PMC Services' },
        { name: 'Palm View Estate Block B2', address: 'Chevron Drive, Lekki, Lagos', landlord: 'Mrs Funmi Adebayo', lCode: 'UH-LANDLORD-FUNMI', pmc: 'Elite PMC Services' },
        { name: 'Yaba Tech Hub Co-workspace', address: 'Herbert Macaulay Way, Yaba, Lagos', landlord: 'Chief Mrs Chioma Nwachukwu', lCode: 'UH-LANDLORD-CHIOMA', pmc: 'Unity Homes PMC' }
      ];

      for (let i = 0; i < 250; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[(i * 3) % lastNames.length];
        const prop = propertiesList[i % propertiesList.length];
        const rentAmount = 2000000 + (i % 8) * 400000;
        
        // Split statuses: 0 = Overdue, 1 = Partially Paid, 2 = Due Soon, Rest = Paid
        const rentChoice = i % 12;
        let rentPaid = rentAmount;
        let rentStatus: 'Paid' | 'Overdue' | 'Due Soon' | 'Partially Paid' = 'Paid';
        let overdueDays = 0;
        let rentDueDate = '2026-12-15';

        if (rentChoice === 0) {
          rentPaid = 0;
          rentStatus = 'Overdue';
          const daysArr = [7, 14, 30, 60, 90];
          overdueDays = daysArr[i % daysArr.length];
          const due = new Date();
          due.setDate(due.getDate() - overdueDays);
          rentDueDate = due.toISOString().split('T')[0];
        } else if (rentChoice === 1) {
          rentPaid = rentAmount * 0.5; // Partially paid 50%
          rentStatus = 'Partially Paid';
          overdueDays = 10;
          const due = new Date();
          due.setDate(due.getDate() - 10);
          rentDueDate = due.toISOString().split('T')[0];
        } else if (rentChoice === 2) {
          rentPaid = 0;
          rentStatus = 'Due Soon';
          const due = new Date();
          due.setDate(due.getDate() + (2 + (i % 5))); // 2 to 7 days away
          rentDueDate = due.toISOString().split('T')[0];
        }

        // Service charges configuration
        const scAmount = 180000 + (i % 6) * 35000;
        const scChoice = (i + 4) % 12;
        let scPaid = scAmount;
        let scStatus: 'Paid' | 'Overdue' | 'Due Soon' | 'Partially Paid' | 'Unpaid' = 'Paid';
        let scDueDate = '2026-12-15';

        if (scChoice === 0) {
          scPaid = 0;
          scStatus = 'Unpaid';
          const due = new Date();
          due.setDate(due.getDate() - (5 + (i % 20)));
          scDueDate = due.toISOString().split('T')[0];
        } else if (scChoice === 1) {
          scPaid = scAmount * 0.4;
          scStatus = 'Partially Paid';
          const due = new Date();
          due.setDate(due.getDate() - 12);
          scDueDate = due.toISOString().split('T')[0];
        } else if (scChoice === 2) {
          scPaid = 0;
          scStatus = 'Due Soon';
          const due = new Date();
          due.setDate(due.getDate() + (3 + (i % 4)));
          scDueDate = due.toISOString().split('T')[0];
        }

        const isHighRisk = rentStatus === 'Overdue' && overdueDays >= 60;
        const latePaymentCount = isHighRisk ? 4 : (rentStatus === 'Overdue' ? 2 : 0);

        initialTenants.push({
          id: `tenant-gen-${i}`,
          tenantName: `${firstName} ${lastName}`,
          tenantCode: `UH-TENANT-${1200 + i}`,
          propertyName: prop.name,
          unitNumber: `Flat ${101 + (i % 15)}`,
          landlordCode: prop.lCode,
          pmcId: prop.pmc,
          rentAmount,
          rentPaid,
          rentStatus,
          rentDueDate,
          serviceChargeAmount: scAmount,
          serviceChargePaid: scPaid,
          serviceChargeStatus: scStatus,
          serviceChargeDueDate: scDueDate,
          overdueDays,
          latePaymentHistoryCount: latePaymentCount,
          isHighRisk,
          phone: `+234 80${3 + (i % 7)} ${100 + i} ${4100 + i}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@unityhomes.ng`,
          whatsapp: `+234 80${3 + (i % 7)} ${100 + i} ${4100 + i}`,
          guarantorName: `Dr. Joseph ${lastName}`,
          guarantorPhone: `+234 812 ${400 + i} ${9000 - i}`,
          bankName: i % 2 === 0 ? 'Guaranty Trust Bank (GTB)' : 'Zenith Bank PLC',
          accountNumber: `101${4839210 + i}`,
          accountName: `${firstName} ${lastName} Rent Holding Account`
        });
      }
      localStorage.setItem(LOCAL_STORAGE_TENANTS_KEY, JSON.stringify(initialTenants));
    }
    setTenants(initialTenants);

    // 2. Seed Logs (Reminder History)
    const cachedLogs = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
    if (cachedLogs) {
      setLogs(JSON.parse(cachedLogs));
    } else {
      const initialLogs: ReminderLog[] = [
        { id: 'rem-001', tenantName: 'Aisha Bello', propertyName: 'Ikeja Studio Apartment Flat 4', unitNumber: 'Flat 4', dateSent: '2026-06-30', timeSent: '09:00', sender: 'AI', channel: 'Email', status: 'Delivered', readStatus: 'Read', paymentStatusAfter: 'Unpaid', outstandingAmt: 2200000 },
        { id: 'rem-002', tenantName: 'Emeka Okafor', propertyName: 'Osei Gbagada Estate Flat A', unitNumber: 'Flat B', dateSent: '2026-06-30', timeSent: '09:30', sender: 'PMC', channel: 'WhatsApp', status: 'Delivered', readStatus: 'Read', paymentStatusAfter: 'Paid', outstandingAmt: 0 },
        { id: 'rem-003', tenantName: 'Chidi Nwosu', propertyName: 'Adebayo Lekki Heights Suite A', unitNumber: 'Suite A', dateSent: '2026-06-29', timeSent: '14:20', sender: 'Landlord', channel: 'SMS', status: 'Delivered', readStatus: 'N/A', paymentStatusAfter: 'Partially Paid', outstandingAmt: 150000 },
        { id: 'rem-004', tenantName: 'Fatima Yusuf', propertyName: 'The Oasis Towers Apartment 5C', unitNumber: 'Apartment 5C', dateSent: '2026-06-29', timeSent: '10:15', sender: 'AI', channel: 'In-App', status: 'Delivered', readStatus: 'Read', paymentStatusAfter: 'Unpaid', outstandingAmt: 4500000 },
        { id: 'rem-005', tenantName: 'Kola Abiodun', propertyName: 'Maryland Cozy Haven Suite B', unitNumber: 'Suite B', dateSent: '2026-06-28', timeSent: '11:00', sender: 'Admin', channel: 'Email', status: 'Delivered', readStatus: 'Unread', paymentStatusAfter: 'Paid', outstandingAmt: 0 }
      ];
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(initialLogs));
      setLogs(initialLogs);
    }

    // 3. Seed Rules (Scheduler Rules)
    const cachedRules = localStorage.getItem(LOCAL_STORAGE_RULES_KEY);
    if (cachedRules) {
      setRules(JSON.parse(cachedRules));
    } else {
      const initialRules: ReminderRule[] = [
        { id: 'rule-1', triggerEvent: '7 days before due date', channels: ['In-App', 'Email'], isEnabled: true },
        { id: 'rule-2', triggerEvent: '3 days before due date', channels: ['In-App', 'Email', 'WhatsApp'], isEnabled: true },
        { id: 'rule-3', triggerEvent: 'On due date', channels: ['In-App', 'Email', 'SMS', 'WhatsApp'], isEnabled: true },
        { id: 'rule-4', triggerEvent: '1 day after due date', channels: ['In-App', 'SMS'], isEnabled: true },
        { id: 'rule-5', triggerEvent: '7 days overdue', channels: ['In-App', 'Email', 'SMS'], isEnabled: true },
        { id: 'rule-6', triggerEvent: '14 days overdue', channels: ['Email', 'WhatsApp'], isEnabled: true },
        { id: 'rule-7', triggerEvent: '30 days overdue', channels: ['Email', 'SMS', 'WhatsApp'], isEnabled: true },
        { id: 'rule-8', triggerEvent: 'Every Monday until payment is received', channels: ['WhatsApp', 'SMS'], isEnabled: false }
      ];
      localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(initialRules));
      setRules(initialRules);
    }

    // 4. Seed Promises to Pay
    const LOCAL_STORAGE_PROMISES_KEY = 'uh_promises_to_pay_v1';
    const cachedPromises = localStorage.getItem(LOCAL_STORAGE_PROMISES_KEY);
    let initialPromises: any[] = [];
    if (cachedPromises) {
      initialPromises = JSON.parse(cachedPromises);
    } else {
      initialPromises = [
        {
          id: 'prm-mock-1',
          tenantId: 'TEN-802',
          tenantName: 'Babatunde Alao',
          tenantPhone: '+234 812 345 6789',
          propertyId: 'Epe Lagoon Terrace',
          propertyName: 'Epe Lagoon Terrace',
          landlordId: 'LAND-EPE-01',
          managementCompanyId: 'Prime Property Solutions',
          paymentType: 'Rent',
          outstandingAmount: 2000000,
          promisedAmount: 2000000,
          expectedPaymentDate: '2026-06-20',
          reasonForDelay: 'Business Cash Flow',
          note: 'Waiting on client payment invoice clearance.',
          status: 'Broken Promise',
          createdAt: '2026-06-05T10:00:00.000Z',
          acknowledgedByLandlord: true,
          acknowledgedByPMC: true,
          lastReminderStage: 'Overdue'
        },
        {
          id: 'prm-mock-2',
          tenantId: 'TEN-102',
          tenantName: 'Emeka Okafor',
          tenantPhone: '+234 809 876 5432',
          propertyId: 'Lekki Heights Tower B',
          propertyName: 'Lekki Heights Tower B',
          landlordId: 'LAND-LEK-02',
          managementCompanyId: 'Prime Property Solutions',
          paymentType: 'Rent',
          outstandingAmount: 3500000,
          promisedAmount: 3500000,
          expectedPaymentDate: '2026-07-15',
          reasonForDelay: 'Salary Delay',
          note: 'Bonus payment delayed till mid-July.',
          status: 'Upcoming',
          createdAt: '2026-06-25T14:30:00.000Z',
          acknowledgedByLandlord: false,
          acknowledgedByPMC: true,
          lastReminderStage: 'Scheduled (3 days before)'
        },
        {
          id: 'prm-mock-3',
          tenantId: 'TEN-504',
          tenantName: 'Fatima Bello',
          tenantPhone: '+234 803 111 2222',
          propertyId: 'Ikeja Gbagada Gated Estate',
          propertyName: 'Ikeja Gbagada Gated Estate',
          landlordId: 'LAND-IKJ-05',
          managementCompanyId: 'Prime Property Solutions',
          paymentType: 'Service Charge',
          outstandingAmount: 250000,
          promisedAmount: 250000,
          expectedPaymentDate: '2026-07-10',
          reasonForDelay: 'Bank Transfer Delay',
          note: 'FX conversion processing lag.',
          status: 'Upcoming',
          createdAt: '2026-06-28T09:15:00.000Z',
          acknowledgedByLandlord: false,
          acknowledgedByPMC: false,
          lastReminderStage: 'Scheduled (3 days before)'
        },
        {
          id: 'prm-mock-4',
          tenantId: 'TEN-231',
          tenantName: 'Adeola Shofoluwe',
          tenantPhone: '+234 817 999 8888',
          propertyId: 'Surulere Garden Courts',
          propertyName: 'Surulere Garden Courts',
          landlordId: 'LAND-SUR-03',
          managementCompanyId: 'Prime Property Solutions',
          paymentType: 'Both',
          outstandingAmount: 4200000,
          promisedAmount: 4200000,
          expectedPaymentDate: '2026-06-26',
          reasonForDelay: 'Salary Delay',
          note: 'Cleared fully.',
          status: 'Fulfilled',
          createdAt: '2026-06-12T08:00:00.000Z',
          acknowledgedByLandlord: true,
          acknowledgedByPMC: true,
          lastReminderStage: 'Fulfilled'
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_PROMISES_KEY, JSON.stringify(initialPromises));
    }
    setPromises(initialPromises);
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleAcknowledgePromise = (promiseId: string, party: 'Landlord' | 'PMC') => {
    const updatedPromises = promises.map((p) => {
      if (p.id === promiseId) {
        const updated = { ...p };
        if (party === 'Landlord') updated.acknowledgedByLandlord = true;
        if (party === 'PMC') updated.acknowledgedByPMC = true;
        return updated;
      }
      return p;
    });

    setPromises(updatedPromises);
    localStorage.setItem('uh_promises_to_pay_v1', JSON.stringify(updatedPromises));

    // Log to Transparency Ledger (uh_ledger_records_v1)
    const targetPromise = promises.find(p => p.id === promiseId);
    if (targetPromise) {
      const ledgerRecord = {
        id: `led-ack-${Math.random().toString(36).substr(2, 9)}`,
        propertyName: targetPromise.propertyName,
        unitNumber: 'Unit',
        tenantName: targetPromise.tenantName,
        type: `${party} Acknowledged Promise`,
        amount: targetPromise.promisedAmount,
        date: new Date().toISOString().split('T')[0],
        status: 'Acknowledged',
        ref: `ACK-${Math.floor(100000 + Math.random() * 900000)}`
      };
      const cachedLedger = localStorage.getItem('uh_ledger_records_v1');
      const ledger = cachedLedger ? JSON.parse(cachedLedger) : [];
      ledger.unshift(ledgerRecord);
      localStorage.setItem('uh_ledger_records_v1', JSON.stringify(ledger));
    }

    triggerSuccess(`Successfully registered ${party} acknowledgement for this promise.`);
  };

  const handleUpdatePromiseStatus = (promiseId: string, newStatus: 'Fulfilled' | 'Broken Promise') => {
    const targetPromise = promises.find(p => p.id === promiseId);
    if (!targetPromise) return;

    // 1. Update promise status
    const updatedPromises = promises.map((p) => {
      if (p.id === promiseId) {
        return { ...p, status: newStatus };
      }
      return p;
    });
    setPromises(updatedPromises);
    localStorage.setItem('uh_promises_to_pay_v1', JSON.stringify(updatedPromises));

    // 2. Update tenant collection state
    const cachedTenants = localStorage.getItem('uh_collection_tenants_v1');
    if (cachedTenants) {
      const allTenants = JSON.parse(cachedTenants);
      const updatedTenants = allTenants.map((t: any) => {
        if (t.tenantCode === targetPromise.tenantId) {
          const updated = { ...t };
          if (newStatus === 'Fulfilled') {
            if (targetPromise.paymentType === 'Rent' || targetPromise.paymentType === 'Both') {
              updated.rentPaid = t.rentAmount;
              updated.rentStatus = 'Paid';
            }
            if (targetPromise.paymentType === 'Service Charge' || targetPromise.paymentType === 'Both') {
              updated.serviceChargePaid = t.serviceChargeAmount;
              updated.serviceChargeStatus = 'Paid';
            }
            updated.overdueDays = 0;
            updated.isHighRisk = false;
            updated.isReminderSuspended = false;
            updated.activePromiseId = null;
          } else {
            // Broken promise - standard overdue workflow resumes!
            updated.isReminderSuspended = false;
            updated.brokenPromisesCount = (updated.brokenPromisesCount || 0) + 1;
          }
          return updated;
        }
        return t;
      });
      localStorage.setItem('uh_collection_tenants_v1', JSON.stringify(updatedTenants));
      setTenants(updatedTenants);
    }

    // 3. Log to Transparency Ledger
    const ledgerRecord = {
      id: `led-stat-${Math.random().toString(36).substr(2, 9)}`,
      propertyName: targetPromise.propertyName,
      unitNumber: 'Unit',
      tenantName: targetPromise.tenantName,
      type: newStatus === 'Fulfilled' ? 'Promise Fulfilled' : 'Promise Broken',
      amount: targetPromise.promisedAmount,
      date: new Date().toISOString().split('T')[0],
      status: newStatus === 'Fulfilled' ? 'Settled' : 'Defaulted',
      ref: `PRM-${Math.floor(100000 + Math.random() * 900000)}`
    };
    const cachedLedger = localStorage.getItem('uh_ledger_records_v1');
    const ledger = cachedLedger ? JSON.parse(cachedLedger) : [];
    ledger.unshift(ledgerRecord);
    localStorage.setItem('uh_ledger_records_v1', JSON.stringify(ledger));

    triggerSuccess(`Promise marked as ${newStatus} successfully.`);
  };

  // --- RE-CALCULATING COMPREHENSIVE COLLECTION STATS ---
  const rentExpected = tenants.reduce((acc, t) => acc + t.rentAmount, 0);
  const rentCollected = tenants.reduce((acc, t) => acc + t.rentPaid, 0);
  const rentOutstanding = rentExpected - rentCollected;
  const rentCollectionRate = rentExpected > 0 ? (rentCollected / rentExpected) * 100 : 0;

  const scExpected = tenants.reduce((acc, t) => acc + t.serviceChargeAmount, 0);
  const scCollected = tenants.reduce((acc, t) => acc + t.serviceChargePaid, 0);
  const scOutstanding = scExpected - scCollected;
  const scCollectionRate = scExpected > 0 ? (scCollected / scExpected) * 100 : 0;

  const overallCollectionRate = (rentExpected + scExpected) > 0 
    ? ((rentCollected + scCollected) / (rentExpected + scExpected)) * 100 
    : 0;

  const tenantsAwaitingReminder = tenants.filter(t => t.rentStatus === 'Overdue' || t.serviceChargeStatus === 'Unpaid' || t.serviceChargeStatus === 'Overdue').length;
  
  // Custom states that increment inside the current session
  const [remindersSentToday, setRemindersSentToday] = useState(18);
  const [paymentsReceivedAfterReminder, setPaymentsReceivedAfterReminder] = useState(9);

  // Highest outstanding leaders (simulated from our 250 records)
  const highestOutstandingTenantObj = [...tenants].sort((a,b) => ((b.rentAmount - b.rentPaid) + (b.serviceChargeAmount - b.serviceChargePaid)) - ((a.rentAmount - a.rentPaid) + (a.serviceChargeAmount - a.serviceChargePaid)))[0];
  const highestOutstandingTenant = highestOutstandingTenantObj ? `${highestOutstandingTenantObj.tenantName} (${highestOutstandingTenantObj.unitNumber})` : 'N/A';
  const highestOutstandingTenantAmt = highestOutstandingTenantObj ? ((highestOutstandingTenantObj.rentAmount - highestOutstandingTenantObj.rentPaid) + (highestOutstandingTenantObj.serviceChargeAmount - highestOutstandingTenantObj.serviceChargePaid)) : 0;

  const highestOutstandingProperty = 'Adebayo Lekki Heights (Lekki Phase 1)';
  const highestOutstandingEstate = 'Palm View Estate (Chevron Drive)';
  const highestOutstandingLandlord = 'Chief Mrs Chioma Nwachukwu Portfolio';
  const highestOutstandingPMC = 'Prime Property Solutions PMC Portfolio';

  // --- FILTERED TENANT LOGIC ---
  const filteredTenants = tenants.filter((tenant) => {
    // Search query match
    const matchesSearch = tenant.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tenant.tenantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tenant.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tenant.unitNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category filter match
    const rentOwingAmt = tenant.rentAmount - tenant.rentPaid;
    const scOwingAmt = tenant.serviceChargeAmount - tenant.serviceChargePaid;

    switch (statusFilter) {
      case 'Rent':
        return rentOwingAmt > 0 && scOwingAmt === 0;
      case 'ServiceCharge':
        return scOwingAmt > 0 && rentOwingAmt === 0;
      case 'Both':
        return rentOwingAmt > 0 && scOwingAmt > 0;
      case 'Partial':
        return tenant.rentStatus === 'Partially Paid' || tenant.serviceChargeStatus === 'Partially Paid';
      case 'Late':
        return tenant.latePaymentHistoryCount > 0;
      case 'HighRisk':
        return tenant.isHighRisk;
      case 'Overdue30':
        return tenant.overdueDays >= 30;
      case 'Due7':
        return tenant.rentStatus === 'Due Soon' || tenant.serviceChargeStatus === 'Due Soon';
      default:
        return true; // All
    }
  });

  // --- ONE-CLICK BULK REMINDERS DISPATCH ---
  const handleTriggerBulkReminders = (filterType: string) => {
    let eligibleTenants: CollectionTenant[] = [];
    let title = '';

    if (filterType === 'all_rent') {
      eligibleTenants = tenants.filter(t => (t.rentAmount - t.rentPaid) > 0);
      title = 'Everyone Owing Rent';
    } else if (filterType === 'all_sc') {
      eligibleTenants = tenants.filter(t => (t.serviceChargeAmount - t.serviceChargePaid) > 0);
      title = 'Everyone Owing Service Charges';
    } else if (filterType === 'all_both') {
      eligibleTenants = tenants.filter(t => (t.rentAmount - t.rentPaid) > 0 && (t.serviceChargeAmount - t.serviceChargePaid) > 0);
      title = 'Everyone Owing Both Rent & Service Charges';
    } else if (filterType === 'overdue_30') {
      eligibleTenants = tenants.filter(t => t.overdueDays >= 30);
      title = 'Overdue by more than 30 Days';
    } else if (filterType === 'due_7') {
      eligibleTenants = tenants.filter(t => {
        const d1 = t.rentStatus === 'Due Soon' || t.serviceChargeStatus === 'Due Soon';
        return d1;
      });
      title = 'Due within the next 7 Days';
    }

    if (eligibleTenants.length === 0) {
      triggerSuccess('No tenants found matching the selection criteria for reminders.');
      return;
    }

    const outstandingTotal = eligibleTenants.reduce((acc, t) => acc + ((t.rentAmount - t.rentPaid) + (t.serviceChargeAmount - t.serviceChargePaid)), 0);

    setShowBulkConfirmModal({
      title,
      tenants: eligibleTenants,
      totalOutstanding: outstandingTotal,
      filterType
    });
  };

  const handleConfirmBulkReminders = () => {
    if (!showBulkConfirmModal) return;

    const { tenants: affectedTenants } = showBulkConfirmModal;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const newLogs: ReminderLog[] = [...logs];

    affectedTenants.forEach((tenant: CollectionTenant) => {
      selectedChannels.forEach(channel => {
        newLogs.unshift({
          id: `rem-gen-${Math.random().toString(36).substr(2, 9)}`,
          tenantName: tenant.tenantName,
          propertyName: tenant.propertyName,
          unitNumber: tenant.unitNumber,
          dateSent: dateStr,
          timeSent: timeStr,
          sender: role === 'PMC' ? 'PMC' : (role === 'Landlord' ? 'Landlord' : 'Admin'),
          channel,
          status: 'Delivered',
          readStatus: 'Unread',
          paymentStatusAfter: 'Unpaid',
          outstandingAmt: ((tenant.rentAmount - tenant.rentPaid) + (tenant.serviceChargeAmount - tenant.serviceChargePaid))
        });
      });
    });

    setLogs(newLogs);
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(newLogs));
    setRemindersSentToday(prev => prev + affectedTenants.length * selectedChannels.length);

    triggerSuccess(`Successfully dispatched automated personalized reminders to ${affectedTenants.length} tenants via ${selectedChannels.join(', ')}.`);
    setShowBulkConfirmModal(null);
  };

  // --- INDIVIDUAL SINGLE REMINDER DISPATCH ---
  const handleOpenSingleReminder = (tenant: CollectionTenant) => {
    setShowSingleReminderModal(tenant);
  };

  const handleConfirmSingleReminder = () => {
    if (!showSingleReminderModal) return;

    const tenant = showSingleReminderModal;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const newLogs: ReminderLog[] = [...logs];
    selectedChannels.forEach(channel => {
      newLogs.unshift({
        id: `rem-gen-${Math.random().toString(36).substr(2, 9)}`,
        tenantName: tenant.tenantName,
        propertyName: tenant.propertyName,
        unitNumber: tenant.unitNumber,
        dateSent: dateStr,
        timeSent: timeStr,
        sender: role === 'PMC' ? 'PMC' : (role === 'Landlord' ? 'Landlord' : 'Admin'),
        channel,
        status: 'Delivered',
        readStatus: 'Unread',
        paymentStatusAfter: 'Unpaid',
        outstandingAmt: ((tenant.rentAmount - tenant.rentPaid) + (tenant.serviceChargeAmount - tenant.serviceChargePaid))
      });
    });

    setLogs(newLogs);
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(newLogs));
    setRemindersSentToday(prev => prev + selectedChannels.length);

    triggerSuccess(`Personalized collection reminder dispatched to ${tenant.tenantName} (${tenant.unitNumber})!`);
    setShowSingleReminderModal(null);
  };

  // --- SMART AUTOMATION: SIMULATE COMPLETED PAYMENT ---
  const handleSimulatePayment = (tenantId: string, paymentType: 'Rent' | 'ServiceCharge' | 'Both') => {
    const updatedTenants = tenants.map(tenant => {
      if (tenant.id !== tenantId) return tenant;

      let updated = { ...tenant };
      let paidAmt = 0;
      let pType = '';

      if (paymentType === 'Rent' || paymentType === 'Both') {
        paidAmt += (tenant.rentAmount - tenant.rentPaid);
        updated.rentPaid = tenant.rentAmount;
        updated.rentStatus = 'Paid';
        pType += 'Rent';
      }
      if (paymentType === 'ServiceCharge' || paymentType === 'Both') {
        paidAmt += (tenant.serviceChargeAmount - tenant.serviceChargePaid);
        updated.serviceChargePaid = tenant.serviceChargeAmount;
        updated.serviceChargeStatus = 'Paid';
        pType += (pType ? ' & ' : '') + 'Service Charge';
      }

      updated.overdueDays = 0;
      updated.isHighRisk = false;

      // Log in Transparency Ledger & Trigger receipt modal
      const payRef = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
      const today = new Date().toISOString().split('T')[0];
      
      const ledgerRecord = {
        id: `led-${Math.random().toString(36).substr(2, 9)}`,
        propertyName: tenant.propertyName,
        unitNumber: tenant.unitNumber,
        tenantName: tenant.tenantName,
        type: pType,
        amount: paidAmt,
        date: today,
        status: 'Settled',
        ref: payRef
      };

      // Push to ledger
      const existingLedger = localStorage.getItem(LOCAL_STORAGE_LEDGER_KEY);
      const ledger = existingLedger ? JSON.parse(existingLedger) : [];
      ledger.unshift(ledgerRecord);
      localStorage.setItem(LOCAL_STORAGE_LEDGER_KEY, JSON.stringify(ledger));

      // Show automatic receipt
      setShowReceiptModal({
        tenant: updated,
        amount: paidAmt,
        paymentType: pType,
        date: today,
        ref: payRef
      });

      return updated;
    });

    setTenants(updatedTenants);
    localStorage.setItem(LOCAL_STORAGE_TENANTS_KEY, JSON.stringify(updatedTenants));
    setPaymentsReceivedAfterReminder(prev => prev + 1);
    triggerSuccess(`Smart Automation: Outstanding balance fully settled. Auto-generated receipt registered inside Transparency Ledger.`);
  };

  // --- RULE MANAGER ACTIONS ---
  const handleToggleRule = (id: string) => {
    const updated = rules.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r);
    setRules(updated);
    localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(updated));
    triggerSuccess('Scheduler rule status updated successfully.');
  };

  const handleAddRule = () => {
    if (!newRule.triggerEvent) return;
    const rule: ReminderRule = {
      id: `rule-${Math.random().toString(36).substr(2, 9)}`,
      triggerEvent: newRule.triggerEvent,
      channels: newRule.channels,
      isEnabled: true
    };
    const updated = [...rules, rule];
    setRules(updated);
    localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(updated));
    setShowAddRuleModal(false);
    triggerSuccess(`Added automated reminder scheduler rule for "${newRule.triggerEvent}"`);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(updated));
    triggerSuccess('Scheduler rule deleted.');
  };

  return (
    <div className="bg-[#FAF9F6] border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-sm space-y-6 text-#132A1D font-sans tracking-wide">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-stone-200 pb-5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-[#18452E] p-2.5 rounded-2xl text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-black text-xl text-[#18452E] uppercase tracking-tight">Automated Collection &amp; Reminder Engine</h2>
              <span className="bg-[#18452E]/10 text-[#18452E] text-[9px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full">ACTIVE AUTOMATION</span>
            </div>
            <p className="text-#6B7280 text-xs mt-1">Smart real-time tenant ledger monitoring, personalized template dispatches, and immutable transaction audits.</p>
          </div>
        </div>
        
        {/* REFRESH/SYNC */}
        <button 
          onClick={() => {
            localStorage.removeItem(LOCAL_STORAGE_TENANTS_KEY);
            window.location.reload();
          }} 
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-stone-200 bg-white hover:bg-stone-50 rounded-xl text-#6B7280 text-[10px] font-bold uppercase transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* FEEDBACK STATUS */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2.5 text-xs text-emerald-800 font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SUB-TABS NAVIGATION */}
      <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-3">
        {[
          { id: 'Dashboard', label: 'Collection Dashboard', icon: TrendingUp },
          { id: 'BulkReminders', label: 'One-Click Bulk Actions', icon: Bell },
          { id: 'Scheduler', label: 'Reminder Scheduler', icon: Clock },
          { id: 'PromisesCenter', label: 'Promise to Pay Center', icon: Calendar },
          { id: 'Tenants', label: 'Tenants Ledger Filter', icon: User },
          { id: 'History', label: 'Reminder Logs & History', icon: History }
        ].map(subTab => {
          const Icon = subTab.icon;
          const isActive = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl transition ${
                isActive ? 'bg-[#18452E] text-white shadow' : 'bg-white border border-stone-200 text-#6B7280 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{subTab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ====================================================
          TAB 1: COLLECTION DASHBOARD
          ==================================================== */}
      {activeSubTab === 'Dashboard' && (
        <div className="space-y-6">
          
          {/* CORE METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Rent Collected Card */}
            <div className="bg-white border border-stone-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Long-Term Rent Ledger</span>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl font-display font-black text-stone-850">₦{rentCollected.toLocaleString()}</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Collected of ₦{rentExpected.toLocaleString()}</span>
                </div>
                <span className="text-xs bg-[#18452E]/10 text-[#18452E] px-2 py-1 rounded-lg font-black">{rentCollectionRate.toFixed(1)}%</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-[10px]">
                <span className="text-rose-550 font-bold">Outstanding: ₦{rentOutstanding.toLocaleString()}</span>
              </div>
            </div>

            {/* Service Charge Card */}
            <div className="bg-white border border-stone-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Service Charge Ledger</span>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl font-display font-black text-stone-850">₦{scCollected.toLocaleString()}</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">Collected of ₦{scExpected.toLocaleString()}</span>
                </div>
                <span className="text-xs bg-[#18452E]/10 text-[#18452E] px-2 py-1 rounded-lg font-black">{scCollectionRate.toFixed(1)}%</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between text-[10px]">
                <span className="text-rose-550 font-bold">Outstanding: ₦{scOutstanding.toLocaleString()}</span>
              </div>
            </div>

            {/* Overall Collection */}
            <div className="bg-[#18452E] text-white p-5 rounded-2xl space-y-2 shadow-sm">
              <span className="text-[10px] font-mono text-[#C9A84C] uppercase tracking-widest block font-bold">Overall Collection Performance</span>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl font-display font-black text-white">{overallCollectionRate.toFixed(1)}%</span>
                  <span className="text-[10px] text-stone-300 block mt-0.5">Combined collection percentage</span>
                </div>
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-[#C9A84C]" />
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 text-[10px] text-stone-300">
                <span>Excellent compliance rate over standard Lagos portfolios.</span>
              </div>
            </div>

            {/* Reminder Status */}
            <div className="bg-white border border-stone-200 p-5 rounded-2xl space-y-2 shadow-xs">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-bold">Automated Dispatches</span>
              <div className="grid grid-cols-2 gap-2 text-center pt-1">
                <div className="bg-stone-50 p-2 rounded-xl">
                  <span className="text-xl font-bold text-#132A1D">{remindersSentToday}</span>
                  <span className="text-[9px] text-stone-400 block uppercase font-mono mt-0.5">Sent Today</span>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl">
                  <span className="text-xl font-bold text-emerald-800">{paymentsReceivedAfterReminder}</span>
                  <span className="text-[9px] text-emerald-500 block uppercase font-mono mt-0.5">Receipts</span>
                </div>
              </div>
              <div className="text-[9px] text-stone-450 text-center font-bold uppercase tracking-wider pt-1">
                Avg Days to Payment: <strong className="text-emerald-700">4.2 Days</strong>
              </div>
            </div>

          </div>

          {/* AUTOMATED ACTIONABLE INSIGHTS PANEL */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-[var(--radius-large)] p-5 space-y-3 shadow-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="font-display font-black text-xs uppercase text-[#18452E] tracking-wider">Automated Collection Insights &amp; Audit Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white border border-stone-200 p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-#132A1D block">Critical Arrears Threshold</span>
                <p className="text-#6B7280 leading-normal"><strong>8 tenants</strong> are more than 30 days overdue. Recommended action: Dispatch One-Tap Bulk reminders via SMS and WhatsApp immediate escalation.</p>
              </div>
              <div className="bg-white border border-stone-200 p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-#132A1D block">High Outstandings Filter</span>
                <p className="text-#6B7280 leading-normal"><strong>5 tenants</strong> have outstanding service charges exceeding ₦500,000. Recommend custom verification checks.</p>
              </div>
              <div className="bg-white border border-stone-200 p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-#132A1D block">Response Velocity Index</span>
                <p className="text-#6B7280 leading-normal"><strong>3 tenants</strong> usually pay within 48 hours after receiving an automated reminder. System recommends softer templates first.</p>
              </div>
              <div className="bg-white border border-stone-200 p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-#132A1D block">Highest Unit Risk</span>
                <p className="text-#6B7280 leading-normal"><strong>Apartment B12</strong> (The Oasis Towers) currently holds the single highest outstanding balance of ₦{highestOutstandingTenantAmt.toLocaleString()}.</p>
              </div>
              <div className="bg-white border border-stone-200 p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-#132A1D block">Asset Needs Attention</span>
                <p className="text-#6B7280 leading-normal"><strong>Palm View Estate</strong> has the lowest overall collection rate this month (71%). Recommend review with the Property Relationship Manager.</p>
              </div>
              <div className="bg-white border border-stone-200 p-3.5 rounded-xl text-xs space-y-1">
                <span className="font-bold text-#132A1D block">Ledger Remittance Delta</span>
                <p className="text-#6B7280 leading-normal">Collection performance improved by <strong>14%</strong> compared with last month. 22 reminders sent yesterday resulted in <strong>9 immediate payments</strong> today.</p>
              </div>
            </div>
          </div>

          {/* INTERACTIVE LEADERBOARDS & VISUALIZATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Collection Performance Charts (Simple Elegant Pure SVG) */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-xs space-y-4">
              <h4 className="font-display font-black text-[#18452E] text-xs uppercase tracking-wider border-b border-stone-200 pb-2">Real-Time Portfolio Collection Status</h4>
              
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold">Total Long-term Rent Received</span>
                    <span className="font-mono text-[#18452E] font-bold">₦{rentCollected.toLocaleString()} ({rentCollectionRate.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-stone-50 h-3.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full transition-all duration-550" style={{ width: `${rentCollectionRate}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold">Total Service Charges Collected</span>
                    <span className="font-mono text-teal-700 font-bold">₦{scCollected.toLocaleString()} ({scCollectionRate.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-stone-50 h-3.5 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full transition-all duration-550" style={{ width: `${scCollectionRate}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold">Combined Collection Rate</span>
                    <span className="font-mono text-[#C9A84C] font-bold">₦{(rentCollected + scCollected).toLocaleString()} ({overallCollectionRate.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-stone-50 h-3.5 rounded-full overflow-hidden">
                    <div className="bg-[#C9A84C] h-full transition-all duration-550" style={{ width: `${overallCollectionRate}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 border rounded-xl p-3 text-[10px] text-#6B7280 leading-relaxed mt-2">
                <strong>Smart System Check:</strong> All values are calculated directly from active client ledger records. Completing any tenant payment updates these charts instantly.
              </div>
            </div>

            {/* Highest Outstandings Leaderboard */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] p-6 shadow-xs space-y-4">
              <h4 className="font-display font-black text-[#18452E] text-xs uppercase tracking-wider border-b border-stone-200 pb-2">Outstandings Leaderboard Rankings</h4>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-#6B7280 uppercase font-mono text-[9px] tracking-wide">Highest Outstanding Tenant</span>
                  <div className="text-right">
                    <span className="font-bold text-#132A1D block">{highestOutstandingTenant}</span>
                    <span className="font-mono text-xs font-black text-rose-700">₦{highestOutstandingTenantAmt.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-2 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-#6B7280 uppercase font-mono text-[9px] tracking-wide">Highest Outstanding Property</span>
                  <span className="font-bold text-#132A1D text-right">{highestOutstandingProperty}</span>
                </div>

                <div className="flex justify-between items-center p-2 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-#6B7280 uppercase font-mono text-[9px] tracking-wide">Highest Outstanding Estate</span>
                  <span className="font-bold text-#132A1D text-right">{highestOutstandingEstate}</span>
                </div>

                <div className="flex justify-between items-center p-2 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-#6B7280 uppercase font-mono text-[9px] tracking-wide">Landlord Portfolio Arrears</span>
                  <span className="font-bold text-#132A1D text-right">{highestOutstandingLandlord}</span>
                </div>

                <div className="flex justify-between items-center p-2 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-#6B7280 uppercase font-mono text-[9px] tracking-wide">PMC Portfolio Arrears</span>
                  <span className="font-bold text-#132A1D text-right">{highestOutstandingPMC}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ====================================================
          TAB 2: ONE-CLICK BULK ACTION REMINDERS
          ==================================================== */}
      {activeSubTab === 'BulkReminders' && (
        <div className="space-y-6">
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs leading-normal">
            <span className="font-bold text-[#18452E] block mb-1">One-Click Dispatch Rules</span>
            Unity Homes Automated System utilizes immediate personalized multi-channel reminder templates mapping exact arrears balances, payment verification details, and contact points to accelerate recovery metrics.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="bg-rose-100 text-rose-800 text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-black">RENT OVERDUES</span>
                <h4 className="font-display font-black text-sm text-[#18452E] uppercase mt-2">Remind All Rent Owings</h4>
                <p className="text-xs text-#6B7280 mt-1">Dispatches notifications to every active tenant currently owing outstanding rent balances.</p>
              </div>
              <button 
                onClick={() => handleTriggerBulkReminders('all_rent')}
                className="w-full bg-[#18452E] hover:bg-[#18452E] text-white text-[10px] font-black uppercase py-2.5 rounded-xl transition cursor-pointer"
              >
                Trigger Rent Reminders
              </button>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="bg-teal-100 text-teal-800 text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-black">SERVICE CHARGE ARREARS</span>
                <h4 className="font-display font-black text-sm text-[#18452E] uppercase mt-2">Remind All Service Charges</h4>
                <p className="text-xs text-#6B7280 mt-1">Targets tenants who haven&apos;t completed service charge payments this cycle.</p>
              </div>
              <button 
                onClick={() => handleTriggerBulkReminders('all_sc')}
                className="w-full bg-[#18452E] hover:bg-[#18452E] text-white text-[10px] font-black uppercase py-2.5 rounded-xl transition cursor-pointer"
              >
                Trigger Service Charge Reminders
              </button>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="bg-purple-100 text-purple-800 text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-black">COMBINED ARREARS</span>
                <h4 className="font-display font-black text-sm text-[#18452E] uppercase mt-2">Remind Combined Owings</h4>
                <p className="text-xs text-#6B7280 mt-1">Triggers customized dual-balance templates to tenants owing both rent and service charges.</p>
              </div>
              <button 
                onClick={() => handleTriggerBulkReminders('all_both')}
                className="w-full bg-[#18452E] hover:bg-[#18452E] text-white text-[10px] font-black uppercase py-2.5 rounded-xl transition cursor-pointer"
              >
                Trigger Combined Reminders
              </button>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="bg-amber-100 text-amber-800 text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-black">OVERDUE &gt; 30 DAYS</span>
                <h4 className="font-display font-black text-sm text-[#18452E] uppercase mt-2">Arrears Exceeding 30d</h4>
                <p className="text-xs text-#6B7280 mt-1">High urgency escalation reminder sent to tenants overdue by more than a month.</p>
              </div>
              <button 
                onClick={() => handleTriggerBulkReminders('overdue_30')}
                className="w-full bg-rose-700 hover:bg-rose-800 text-white text-[10px] font-black uppercase py-2.5 rounded-xl transition cursor-pointer"
              >
                Trigger Urgent Reminders
              </button>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <span className="bg-blue-100 text-blue-800 text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-black">DUE WITHIN 7 DAYS</span>
                <h4 className="font-display font-black text-sm text-[#18452E] uppercase mt-2">Upcoming Grace Period</h4>
                <p className="text-xs text-#6B7280 mt-1">Friendly automated reminders dispatched 7 days prior to their official due date.</p>
              </div>
              <button 
                onClick={() => handleTriggerBulkReminders('due_7')}
                className="w-full bg-blue-750 hover:bg-blue-800 text-white text-[10px] font-black uppercase py-2.5 rounded-xl transition cursor-pointer"
              >
                Trigger friendly Reminders
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ====================================================
          TAB 3: AUTOMATED REMINDER SCHEDULER
          ==================================================== */}
      {activeSubTab === 'Scheduler' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-black text-[#18452E] text-sm uppercase">Automatic Scheduler Rules</h3>
              {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
              <p className="text-#6B7280 text-xs mt-0.5">Automate dispatches pre &amp; post rent cycles. Stopped automatically upon complete payment confirmation.</p>
            </div>
            <button 
              onClick={() => setShowAddRuleModal(true)}
              className="flex items-center space-x-1 px-4 py-2 bg-[#18452E] text-white text-[10px] font-black uppercase rounded-xl transition hover:bg-[#18452E] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Rule</span>
            </button>
          </div>

          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-150 text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black">
                    <th className="p-4">Trigger Event</th>
                    <th className="p-4">Delivery Channels</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-4 font-bold text-#132A1D">{rule.triggerEvent}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {rule.channels.map(ch => (
                            <span key={ch} className="bg-stone-50 border text-#6B7280 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          rule.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-#6B7280'
                        }`}>
                          {rule.isEnabled ? 'Active Scheduler' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleToggleRule(rule.id)}
                            className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase transition ${
                              rule.isEnabled ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            }`}
                          >
                            {rule.isEnabled ? 'Pause' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 4: TENANTS LEDGER & FILTERS (Interactive list)
          ==================================================== */}
      {activeSubTab === 'Tenants' && (
        <div className="space-y-6">
          
          {/* SEARCH & FILTERS CONTROLS */}
          <div className="bg-white border border-stone-200 p-4 rounded-[var(--radius-large)] space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4.5 h-4.5 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search tenant name, apartment, landlord or PMC..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-2 px-10 text-xs text-#132A1D outline-none placeholder:text-stone-400"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-stone-400 shrink-0" />
                <select 
                  value={statusFilter}
                  onChange={(e: any) => {
                    setStatusFilter(e.target.value);
                    setTenantActiveFilters({ filterStatus: e.target.value });
                  }}
                  className="bg-stone-50 border border-stone-200 rounded-2xl p-2 text-xs text-#132A1D outline-none"
                >
                  <option value="All">All Arrears Profiles</option>
                  <option value="Rent">Owing Rent Only</option>
                  <option value="ServiceCharge">Owing Service Charge Only</option>
                  <option value="Both">Owing Rent &amp; Service Charge</option>
                  <option value="Partial">Partial Payments Profile</option>
                  <option value="Late">Repeat Late Payers</option>
                  <option value="HighRisk">High Risk / Defaulters</option>
                  <option value="Overdue30">Arrears &gt; 30 Days</option>
                  <option value="Due7">Due within 7 Days</option>
                </select>
              </div>

              <button
                onClick={() => setIsExportOpen(true)}
                className="px-4 py-2 bg-[#18452E] hover:bg-[#18452E] text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Export Ledger Report</span>
              </button>
            </div>

            <div className="pt-2 border-t border-stone-200">
              <SavedFilters
                listId="tenants"
                activeFilters={tenantActiveFilters}
                onApplyFilter={(f) => {
                  setTenantActiveFilters(f);
                  if (f.filterStatus) setStatusFilter(f.filterStatus as any);
                }}
                triggerSuccess={(msg) => {
                  setSuccessMessage(msg);
                  setTimeout(() => setSuccessMessage(null), 4500);
                }}
              />
            </div>
          </div>

          <ExportCenter
            title="Bulk Defaulter & Arrears Ledger Report"
            data={filteredTenants}
            columns={[
              { header: 'Tenant Code', accessor: (t: any) => t.tenantCode },
              { header: 'Tenant Name', accessor: (t: any) => t.tenantName },
              { header: 'Property & Unit', accessor: (t: any) => `${t.propertyName} (Unit ${t.unitNumber})` },
              { header: 'Rent Due', accessor: (t: any) => `₦${(t.rentAmount - t.rentPaid).toLocaleString()}` },
              { header: 'Service Charge Due', accessor: (t: any) => `₦${(t.serviceChargeAmount - t.serviceChargePaid).toLocaleString()}` },
              { header: 'Overdue (Days)', accessor: (t: any) => `${t.overdueDays} days` }
            ]}
            activeFiltersDesc={statusFilter}
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            triggerSuccess={(msg) => {
              setSuccessMessage(msg);
              setTimeout(() => setSuccessMessage(null), 4500);
            }}
          />

          {/* TENANTS LIST VIEW */}
          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] overflow-hidden shadow-xs">
            <div className="p-4 bg-stone-50/50 border-b border-stone-150 flex justify-between items-center">
              <span className="font-mono text-[9px] text-stone-400 uppercase font-black tracking-widest">
                ACTIVE TENANT LEDGER RECORDS ({filteredTenants.length} FOUND)
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-150 text-[9px] font-mono text-stone-400 uppercase tracking-widest font-black">
                    <th className="p-4">Tenant Details</th>
                    <th className="p-4">Property &amp; Unit</th>
                    <th className="p-4">Rent Ledger</th>
                    <th className="p-4">Service Charge</th>
                    <th className="p-4">Arrears Days</th>
                    <th className="p-4 text-center">Interactive Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredTenants.slice(0, 50).map((tenant) => {
                    const rentOutstanding = tenant.rentAmount - tenant.rentPaid;
                    const scOutstanding = tenant.serviceChargeAmount - tenant.serviceChargePaid;
                    const combinedOutstanding = rentOutstanding + scOutstanding;
                    
                    return (
                      <tr key={tenant.id} className="hover:bg-stone-50/40 transition">
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-#132A1D">{tenant.tenantName}</span>
                              {tenant.isHighRisk && (
                                <span className="bg-rose-100 text-rose-800 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">High Risk</span>
                              )}
                              {tenant.latePaymentHistoryCount > 0 && (
                                <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">Late Payer</span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-stone-400 block">{tenant.tenantCode}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <span className="text-#132A1D font-medium block">{tenant.propertyName}</span>
                            <span className="text-[10px] text-stone-400 block">{tenant.unitNumber}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {tenant.rentStatus === 'Paid' ? (
                            <span className="text-emerald-700 font-bold">Fully Settled</span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="font-bold text-#132A1D">₦{rentOutstanding.toLocaleString()}</span>
                              <span className="text-[9px] text-stone-450 block uppercase tracking-wide font-mono">Due: {tenant.rentDueDate}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {tenant.serviceChargeStatus === 'Paid' ? (
                            <span className="text-emerald-700 font-bold">Fully Settled</span>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="font-bold text-#132A1D">₦{scOutstanding.toLocaleString()}</span>
                              <span className="text-[9px] text-stone-450 block uppercase tracking-wide font-mono font-bold">Due: {tenant.serviceChargeDueDate}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {combinedOutstanding === 0 ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded">Paid</span>
                          ) : (
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              tenant.overdueDays >= 60 ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {tenant.overdueDays > 0 ? `${tenant.overdueDays} Days Overdue` : 'Due Soon'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {combinedOutstanding > 0 ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button 
                                onClick={() => handleOpenSingleReminder(tenant)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-[#18452E] text-white rounded-lg text-[9px] font-bold uppercase hover:bg-[#18452E] transition"
                              >
                                <Send className="w-3 h-3" />
                                <span>Remind</span>
                              </button>

                              <button 
                                onClick={() => handleSimulatePayment(tenant.id, rentOutstanding > 0 && scOutstanding > 0 ? 'Both' : (rentOutstanding > 0 ? 'Rent' : 'ServiceCharge'))}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-emerald-700 transition"
                              >
                                Clear Balance
                              </button>
                            </div>
                          ) : (
                            <span className="text-emerald-650 font-bold text-[10px] uppercase font-mono tracking-wider flex items-center justify-center gap-1">
                              <Check className="w-4.5 h-4.5 text-emerald-600" /> Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTenants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400 italic">No tenants found matching your filters. Try selecting a different category.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {filteredTenants.length > 50 && (
              <div className="p-3 bg-stone-50 text-center border-t border-stone-200 text-[10px] text-stone-400 font-mono">
                Showing top 50 active tenant records. All stats and notifications apply to all 250+ records.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 5: REMINDER HISTORY LOGS
          ==================================================== */}
      {activeSubTab === 'History' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white border border-stone-200 p-4 rounded-[var(--radius-large)]">
            <div>
              <h4 className="font-display font-black text-[#18452E] text-xs uppercase">Reminder Dispatch History</h4>
              <p className="text-stone-400 text-[10px] font-light">Comprehensive real-time tracking of all alert payloads sent across the network.</p>
            </div>
            <button
              onClick={() => setIsHistoryExportOpen(true)}
              className="px-4 py-2 bg-[#18452E] hover:bg-[#18452E] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Export Audit History Logs</span>
            </button>
          </div>

          <ExportCenter
            title="Collection Reminder Dispatch Log"
            data={logs}
            columns={[
              { header: 'ID', accessor: (l: any) => l.id },
              { header: 'Tenant Name', accessor: (l: any) => l.tenantName },
              { header: 'Property & Unit', accessor: (l: any) => `${l.propertyName} (Unit ${l.unitNumber})` },
              { header: 'Date Sent', accessor: (l: any) => `${l.dateSent} ${l.timeSent}` },
              { header: 'Dispatch Channel', accessor: (l: any) => l.channel },
              { header: 'Delivery Status', accessor: (l: any) => l.status },
              { header: 'Outstanding Amount', accessor: (l: any) => `₦${l.outstandingAmt.toLocaleString()}` }
            ]}
            activeFiltersDesc="All Deliveries"
            isOpen={isHistoryExportOpen}
            onClose={() => setIsHistoryExportOpen(false)}
            triggerSuccess={(msg) => {
              setSuccessMessage(msg);
              setTimeout(() => setSuccessMessage(null), 4500);
            }}
          />

          <div className="p-4 bg-white border border-stone-200 rounded-[var(--radius-large)] space-y-2">
            <span className="text-xs font-mono text-stone-400 uppercase tracking-widest font-black block">Log Delivery Channel Summary</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-stone-50 border p-3 rounded-2xl">
                <span className="text-xl font-bold text-#132A1D">{logs.filter(l => l.channel === 'In-App').length}</span>
                <span className="text-[10px] text-#6B7280 block font-bold uppercase font-mono mt-0.5">In-App Alerts</span>
              </div>
              <div className="bg-stone-50 border p-3 rounded-2xl">
                <span className="text-xl font-bold text-#132A1D">{logs.filter(l => l.channel === 'Email').length}</span>
                <span className="text-[10px] text-#6B7280 block font-bold uppercase font-mono mt-0.5">Email logs</span>
              </div>
              <div className="bg-stone-50 border p-3 rounded-2xl">
                <span className="text-xl font-bold text-#132A1D">{logs.filter(l => l.channel === 'SMS').length}</span>
                <span className="text-[10px] text-#6B7280 block font-bold uppercase font-mono mt-0.5">SMS dispatches</span>
              </div>
              <div className="bg-stone-50 border p-3 rounded-2xl">
                <span className="text-xl font-bold text-#132A1D">{logs.filter(l => l.channel === 'WhatsApp').length}</span>
                <span className="text-[10px] text-#6B7280 block font-bold uppercase font-mono mt-0.5">WhatsApp alerts</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-150 text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black">
                    <th className="p-4">Reminder ID</th>
                    <th className="p-4">Tenant &amp; Apartment</th>
                    <th className="p-4">Property</th>
                    <th className="p-4">Date/Time</th>
                    <th className="p-4">Delivery Details</th>
                    <th className="p-4">Outstanding Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/50 transition">
                      <td className="p-4 font-mono text-#6B7280">{log.id}</td>
                      <td className="p-4">
                        <div>
                          <span className="font-bold text-#132A1D block">{log.tenantName}</span>
                          <span className="text-[10px] text-stone-400 block">{log.unitNumber}</span>
                        </div>
                      </td>
                      <td className="p-4 text-#132A1D">{log.propertyName}</td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-medium text-#132A1D block">{log.dateSent}</span>
                          <span className="text-[10px] text-stone-400 block">{log.timeSent}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="bg-stone-50 text-#6B7280 text-[9px] font-mono px-2 py-0.5 rounded">
                            {log.channel}
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono px-2 py-0.5 rounded font-black uppercase">
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-#132A1D">
                        {log.outstandingAmt > 0 ? `₦${log.outstandingAmt.toLocaleString()}` : <span className="text-emerald-700">Settled</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 6: PROMISE TO PAY CENTER
          ==================================================== */}
      {activeSubTab === 'PromisesCenter' && (() => {
        // Compute dynamic metrics
        const totalValuePromised = promises.reduce((acc, p) => acc + p.promisedAmount, 0);
        const activePromises = promises.filter(p => p.status === 'Upcoming' || p.status === 'Due Today').length;
        const brokenPromises = promises.filter(p => p.status === 'Broken Promise').length;
        const totalPromisesCount = promises.length;
        const brokenPromisesRate = totalPromisesCount > 0 ? Math.round((brokenPromises / totalPromisesCount) * 100) : 0;

        // Compute rankings for broken promises (Step 2 Part A)
        const propBrokenCounts: { [key: string]: number } = {};
        const tenantBrokenCounts: { [key: string]: number } = {};

        promises.forEach(p => {
          if (p.status === 'Broken Promise') {
            propBrokenCounts[p.propertyName] = (propBrokenCounts[p.propertyName] || 0) + 1;
            tenantBrokenCounts[p.tenantName] = (tenantBrokenCounts[p.tenantName] || 0) + 1;
          }
        });

        const propertiesRanking = Object.entries(propBrokenCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        const tenantsRanking = Object.entries(tenantBrokenCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        return (
          <div className="space-y-6 animate-fade-in text-xs">
            {/* PROMISE SUMMARY METRICS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-stone-200 p-4 rounded-[var(--radius-large)] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black block">Total Value Promised</span>
                <span className="text-xl font-display font-black text-[#18452E] block">₦{totalValuePromised.toLocaleString()}</span>
                <span className="text-[9px] text-#6B7280 block font-medium">Accumulated tenant commitments</span>
              </div>
              <div className="bg-white border border-stone-200 p-4 rounded-[var(--radius-large)] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black block">Active Promises</span>
                <span className="text-xl font-display font-black text-amber-600 block">{activePromises} Accounts</span>
                <span className="text-[9px] text-#6B7280 block font-medium">Automatic alerts suspended</span>
              </div>
              <div className="bg-white border border-stone-200 p-4 rounded-[var(--radius-large)] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black block">Broken Promises</span>
                <span className="text-xl font-display font-black text-rose-600 block">{brokenPromises} Defaults</span>
                <span className="text-[9px] text-#6B7280 block font-medium">Resumed overdue schedules</span>
              </div>
              <div className="bg-white border border-stone-200 p-4 rounded-[var(--radius-large)] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black block">Promise Broken Rate</span>
                <span className="text-xl font-display font-black text-#132A1D block">{brokenPromisesRate}%</span>
                <span className="text-[9px] text-#6B7280 block font-medium">Weighted tenant performance</span>
              </div>
            </div>

            {/* PROPERTIES & TENANTS WITH MOST BROKEN PROMISES RANKINGS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-stone-200 p-5 rounded-[var(--radius-large)] space-y-3">
                <div className="border-b pb-2 flex justify-between items-center">
                  <h4 className="font-display font-black text-[#18452E] uppercase tracking-wider text-xs">Properties With Most Broken Promises</h4>
                  <span className="text-[9px] font-mono bg-stone-50 text-#6B7280 px-2 py-0.5 rounded font-bold uppercase">Defaults count</span>
                </div>
                {propertiesRanking.length > 0 ? (
                  <div className="space-y-2">
                    {propertiesRanking.map((prop, idx) => (
                      <div key={prop.name} className="flex justify-between items-center p-2.5 bg-stone-50 rounded-xl border border-stone-150">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono bg-[#18452E] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-#132A1D">{prop.name}</span>
                        </div>
                        <span className="font-mono font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-lg text-[10px]">
                          {prop.count} Broken
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic text-center py-4 text-[10px]">No broken promises registered yet.</p>
                )}
              </div>

              <div className="bg-white border border-stone-200 p-5 rounded-[var(--radius-large)] space-y-3">
                <div className="border-b pb-2 flex justify-between items-center">
                  <h4 className="font-display font-black text-[#18452E] uppercase tracking-wider text-xs">Tenants With Most Broken Promises</h4>
                  <span className="text-[9px] font-mono bg-stone-50 text-#6B7280 px-2 py-0.5 rounded font-bold uppercase">Defaults count</span>
                </div>
                {tenantsRanking.length > 0 ? (
                  <div className="space-y-2">
                    {tenantsRanking.map((t, idx) => (
                      <div key={t.name} className="flex justify-between items-center p-2.5 bg-stone-50 rounded-xl border border-stone-150">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono bg-[#18452E] text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-#132A1D">{t.name}</span>
                        </div>
                        <span className="font-mono font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-lg text-[10px]">
                          {t.count} Broken
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic text-center py-4 text-[10px]">No broken promises registered yet.</p>
                )}
              </div>
            </div>

            {/* ALL PROMISES DATABASE LEDGER */}
            <div className="bg-white border border-stone-200 rounded-[var(--radius-large)] overflow-hidden shadow-xs">
              <div className="p-4 bg-stone-50 border-b border-stone-150 flex justify-between items-center">
                <h4 className="font-display font-black text-[#18452E] uppercase tracking-wider text-xs">Active & Historical Promises Ledger</h4>
                <span className="text-[10px] text-stone-400 font-mono">Logged role: <strong>{role}</strong></span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-150 text-[10px] font-mono text-stone-400 uppercase tracking-widest font-black">
                      <th className="p-4">Tenant & Unit</th>
                      <th className="p-4">Type & Amount</th>
                      <th className="p-4">Expected Date</th>
                      <th className="p-4">Delay Reason & Note</th>
                      <th className="p-4 text-center">Acknowledgements</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {promises.map((p) => {
                      let statusBg = 'bg-stone-50 text-#132A1D border-stone-200';
                      if (p.status === 'Fulfilled') statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      else if (p.status === 'Broken Promise' || p.status === 'Overdue') statusBg = 'bg-rose-50 text-rose-800 border-rose-200';
                      else if (p.status === 'Upcoming' || p.status === 'Due Today') statusBg = 'bg-amber-50 text-amber-800 border-amber-200';

                      return (
                        <tr key={p.id} className="hover:bg-stone-50/50 transition text-xs">
                          {/* TENANT & UNIT */}
                          <td className="p-4">
                            <div>
                              <span className="font-bold text-#132A1D block">{p.tenantName}</span>
                              <span className="text-[10px] text-stone-400 block font-mono">{p.propertyName}</span>
                            </div>
                          </td>
                          {/* AMOUNT */}
                          <td className="p-4">
                            <div>
                              <span className="font-mono font-bold text-[#18452E] block">₦{p.promisedAmount.toLocaleString()}</span>
                              <span className="text-[9px] uppercase font-mono text-stone-400 block">{p.paymentType} Promise</span>
                            </div>
                          </td>
                          {/* EXPECTED DATE */}
                          <td className="p-4">
                            <span className="font-mono font-medium text-#132A1D">{p.expectedPaymentDate}</span>
                          </td>
                          {/* REASON & NOTE */}
                          <td className="p-4 max-w-xs">
                            <div className="space-y-0.5">
                              <span className="font-bold text-#6B7280 block">{p.reasonForDelay}</span>
                              {p.note && <span className="text-[10px] text-stone-400 italic block">"{p.note}"</span>}
                            </div>
                          </td>
                          {/* ACKNOWLEDGEMENTS */}
                          <td className="p-4">
                            <div className="flex flex-col items-center gap-1">
                              {/* LANDLORD ACK */}
                              <div className="flex items-center space-x-1">
                                <span className="text-[9px] text-stone-400 uppercase font-mono">Landlord:</span>
                                {p.acknowledgedByLandlord ? (
                                  <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">ACK</span>
                                ) : (
                                  <span className="text-[9px] text-stone-400 font-bold bg-stone-50 px-1.5 py-0.5 rounded">PENDING</span>
                                )}
                              </div>
                              {/* PMC ACK */}
                              <div className="flex items-center space-x-1">
                                <span className="text-[9px] text-stone-400 uppercase font-mono">PMC:</span>
                                {p.acknowledgedByPMC ? (
                                  <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">ACK</span>
                                ) : (
                                  <span className="text-[9px] text-stone-400 font-bold bg-stone-50 px-1.5 py-0.5 rounded">PENDING</span>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* STATUS */}
                          <td className="p-4 text-center">
                            <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${statusBg}`}>
                              {p.status}
                            </span>
                          </td>
                          {/* ACTIONS */}
                          <td className="p-4 text-right">
                            <div className="flex flex-col gap-1.5 justify-end items-end">
                              {/* ACKNOWLEDGE BUTTONS FOR CURRENT ROLE */}
                              {(!p.acknowledgedByLandlord && (role === 'Landlord' || role === 'Admin')) && (
                                <button 
                                  onClick={() => handleAcknowledgePromise(p.id, 'Landlord')}
                                  className="px-2 py-1 bg-amber-500 text-white hover:bg-amber-600 rounded font-bold uppercase transition text-[8px] tracking-wider cursor-pointer"
                                >
                                  Ack Landlord
                                </button>
                              )}
                              {(!p.acknowledgedByPMC && (role === 'PMC' || role === 'Admin')) && (
                                <button 
                                  onClick={() => handleAcknowledgePromise(p.id, 'PMC')}
                                  className="px-2 py-1 bg-amber-500 text-white hover:bg-amber-600 rounded font-bold uppercase transition text-[8px] tracking-wider cursor-pointer"
                                >
                                  Ack PMC
                                </button>
                              )}

                              {/* MARK STATUS BUTTONS */}
                              {(p.status === 'Upcoming' || p.status === 'Due Today') && (
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => handleUpdatePromiseStatus(p.id, 'Fulfilled')}
                                    className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded font-bold uppercase transition text-[8px] tracking-wider cursor-pointer font-mono"
                                  >
                                    {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
                                    Verify Payment
                                  </button>
                                  <button 
                                    onClick={() => handleUpdatePromiseStatus(p.id, 'Broken Promise')}
                                    className="px-2 py-1 bg-rose-600 text-white hover:bg-rose-700 rounded font-bold uppercase transition text-[8px] tracking-wider cursor-pointer font-mono"
                                  >
                                    Mark Default
                                  </button>
                                </div>
                              )}
                              
                              {p.status === 'Fulfilled' && (
                                <span className="text-[9px] font-mono text-emerald-650 font-bold">Closed (Fulfilled)</span>
                              )}
                              {p.status === 'Broken Promise' && (
                                <span className="text-[9px] font-mono text-rose-600 font-bold">Closed (Broken)</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {promises.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400 italic">No registered promises found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ====================================================
          MODAL: BULK CONFIRM DISPATCH
          ==================================================== */}
      {showBulkConfirmModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-large)] max-w-lg w-full border border-stone-200 shadow-sm p-6 space-y-5 animate-scale-up text-xs sm:text-sm">
            <div className="flex items-center space-x-2.5 text-[#18452E] border-b pb-3">
              <Bot className="w-6 h-6" />
              <h3 className="font-display font-black text-sm uppercase">Confirm Bulk Collection Reminders Dispatch</h3>
            </div>

            <div className="space-y-3">
              <p className="text-#6B7280 leading-normal">
                You are about to launch the Automated Collection Engine to automatically format and dispatch personalized reminders for <strong>{showBulkConfirmModal.title}</strong>:
              </p>

              <div className="bg-stone-50 border p-4 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-#6B7280 font-mono text-[9px] uppercase font-bold">Total Recipients:</span>
                  <span className="font-bold text-#132A1D">{showBulkConfirmModal.tenants.length} Tenants</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-#6B7280 font-mono text-[9px] uppercase font-bold">Total Outstanding:</span>
                  <span className="font-mono font-black text-rose-700">₦{showBulkConfirmModal.totalOutstanding.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-#6B7280 font-mono text-[9px] uppercase font-bold">Estimated Deliveries:</span>
                  <span className="font-bold text-#132A1D">{showBulkConfirmModal.tenants.length * selectedChannels.length} Alerts</span>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-stone-400 uppercase font-black tracking-widest">ENABLED CHANNELS</label>
                <div className="flex flex-wrap gap-2">
                  {['In-App', 'Email', 'SMS', 'WhatsApp'].map(ch => {
                    const isSelected = selectedChannels.includes(ch as any);
                    return (
                      <button
                        key={ch}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedChannels(prev => prev.filter(p => p !== ch));
                          } else {
                            setSelectedChannels(prev => [...prev, ch as any]);
                          }
                        }}
                        className={`px-3 py-1.5 border rounded-xl font-bold uppercase text-[10px] transition ${
                          isSelected ? 'bg-[#18452E] text-white border-[#0E2F1F]' : 'bg-white border-stone-250 text-#6B7280 hover:bg-stone-50'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button 
                onClick={handleConfirmBulkReminders}
                className="flex-1 bg-[#18452E] hover:bg-[#18452E] text-white py-2.5 rounded-xl text-[10px] font-black uppercase transition shadow-md cursor-pointer"
              >
                Confirm &amp; Dispatch Bulk
              </button>
              <button 
                onClick={() => setShowBulkConfirmModal(null)}
                className="flex-1 bg-stone-50 hover:bg-stone-200 text-#6B7280 py-2.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: PERSONALIZED SINGLE REMINDER TEMPLATE PREVIEW
          ==================================================== */}
      {showSingleReminderModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-large)] max-w-2xl w-full border border-stone-200 shadow-sm p-6 space-y-4 animate-scale-up text-xs sm:text-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center space-x-2 text-[#18452E] border-b pb-3 justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-5.5 h-5.5" />
                <h3 className="font-display font-black text-sm uppercase">Automated Personalized Reminder Preview</h3>
              </div>
              <span className="font-mono text-[9px] text-[#18452E] bg-[#18452E]/10 px-2 py-0.5 rounded font-black uppercase">LIVE PREVIEW</span>
            </div>

            <p className="text-#6B7280 leading-normal">
              Unity Homes has generated this personalized notification leveraging actual portfolio ledger parameters:
            </p>

            {/* THE TEMPLATE DISPLAY BOX */}
            <div className="border border-amber-200 bg-amber-50/20 p-5 rounded-2xl font-sans text-#132A1D leading-relaxed whitespace-pre-wrap text-xs max-h-[350px] overflow-y-auto border-dashed shadow-inner">
              <strong className="text-#132A1D block border-b pb-1 mb-2 font-mono text-[9px] uppercase tracking-wider text-amber-800">DISPATCH MESSAGE BODY</strong>
              <div>Dear <strong>{showSingleReminderModal.tenantName}</strong>,</div>
              <div className="mt-2">This is an automated payment reconciliation notice regarding your lease at <strong>{showSingleReminderModal.propertyName} ({showSingleReminderModal.unitNumber})</strong>, managed under <strong>Unity Homes Network</strong>.</div>
              
              <div className="mt-3 font-mono bg-white border border-stone-200/60 p-3 rounded-xl space-y-1.5 text-[11px] shadow-xs">
                <div className="flex justify-between border-b pb-1">
                  <span>Tenant Reference:</span>
                  <strong>{showSingleReminderModal.tenantCode}</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Outstanding Rent:</span>
                  <strong>₦{(showSingleReminderModal.rentAmount - showSingleReminderModal.rentPaid).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Outstanding Service Charge:</span>
                  <strong>₦{(showSingleReminderModal.serviceChargeAmount - showSingleReminderModal.serviceChargePaid).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-bold text-rose-800">Total Arrears Balance:</span>
                  <strong className="text-rose-800 font-bold">₦{((showSingleReminderModal.rentAmount - showSingleReminderModal.rentPaid) + (showSingleReminderModal.serviceChargeAmount - showSingleReminderModal.serviceChargePaid)).toLocaleString()}</strong>
                </div>
              </div>

              {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
              <div className="mt-3"><strong>PAYMENT RECEIVING ACCOUNT:</strong></div>
              <div className="font-mono bg-stone-50 border p-2.5 rounded-xl text-[10px] space-y-0.5 mt-1">
                <div>Bank Name: <strong>{showSingleReminderModal.bankName}</strong></div>
                <div>Account Name: <strong>{showSingleReminderModal.accountName}</strong></div>
                <div>Account Number: <strong>{showSingleReminderModal.accountNumber}</strong></div>
                <div>Payment Reference: <strong>UH-REF-{showSingleReminderModal.tenantCode}</strong></div>
              </div>

              {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
              <div className="mt-3">Once payment is successfully completed, the smart automated ledger will instantly process confirmations, generate automatic rent certificates/receipts, stop scheduled reminders, and update dashboards in real time.</div>
              
              <div className="mt-3 text-stone-400 font-mono text-[9.5px]">
                Support: info@unityhomes.ng | WhatsApp Support: +234 800 864 8946
              </div>
            </div>

            {/* Channel Selector */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-stone-400 uppercase font-black tracking-widest">ENABLED CHANNELS FOR DISPATCH</label>
              <div className="flex flex-wrap gap-2">
                {['In-App', 'Email', 'SMS', 'WhatsApp'].map(ch => {
                  const isSelected = selectedChannels.includes(ch as any);
                  return (
                    <button
                      key={ch}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedChannels(prev => prev.filter(p => p !== ch));
                        } else {
                          setSelectedChannels(prev => [...prev, ch as any]);
                        }
                      }}
                      className={`px-3 py-1.5 border rounded-xl font-bold uppercase text-[10px] transition ${
                        isSelected ? 'bg-[#18452E] text-white border-[#0E2F1F]' : 'bg-white border-stone-250 text-#6B7280 hover:bg-stone-50'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button 
                onClick={handleConfirmSingleReminder}
                className="flex-1 bg-[#18452E] hover:bg-[#18452E] text-white py-2.5 rounded-xl text-[10px] font-black uppercase transition shadow-md cursor-pointer"
              >
                Dispatch Personalized Alert
              </button>
              <button 
                onClick={() => setShowSingleReminderModal(null)}
                className="flex-1 bg-stone-50 hover:bg-stone-200 text-#6B7280 py-2.5 rounded-xl text-[10px] font-black uppercase transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: AUTOMATED RECEIPT (Smart Automation)
          ==================================================== */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-large)] max-w-lg w-full border border-stone-200 shadow-sm p-6 space-y-4 animate-scale-up text-xs sm:text-sm">
            <div className="flex flex-col items-center justify-center space-y-2 border-b pb-3">
              <div className="bg-emerald-100 p-2.5 rounded-full text-emerald-800">
                <Receipt className="w-7 h-7" />
              </div>
              <h3 className="font-display font-black text-sm uppercase text-[#18452E] tracking-wider mt-1">AUTO-GENERATED SETTLED RECEIPT</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-black px-2.5 py-0.5 rounded uppercase">SMART AUTOMATION COMPLIANT</span>
            </div>

            <div className="bg-stone-50 border border-stone-150 p-4 rounded-2xl space-y-2 text-#132A1D font-mono text-[11px]">
              <div className="flex justify-between border-b pb-1">
                <span>Receipt Number:</span>
                <span className="font-bold text-#132A1D">{showReceiptModal.ref}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Tenant Name:</span>
                <span className="font-bold text-#132A1D">{showReceiptModal.tenant.tenantName}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Property Unit:</span>
                <span className="font-bold text-#132A1D">{showReceiptModal.tenant.propertyName} ({showReceiptModal.tenant.unitNumber})</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Payment Category:</span>
                <span className="font-bold text-#132A1D">{showReceiptModal.paymentType}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Date Settled:</span>
                <span className="font-bold text-#132A1D">{showReceiptModal.date}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm border-t font-black">
                <span className="text-[#18452E]">Total Amount Paid:</span>
                <span className="text-[#18452E]">₦{showReceiptModal.amount.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[10px] text-stone-400 text-center leading-normal">
              Receipt signed and filed permanently in the Transparency Ledger of Unity Homes. All active reminder schedulers and auto-dispatches have been stopped for this record.
            </p>

            <button 
              onClick={() => setShowReceiptModal(null)}
              className="w-full bg-[#18452E] hover:bg-[#18452E] text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
            >
              Acknowledge &amp; Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: ADD RULE FOR SCHEDULER
          ==================================================== */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[var(--radius-large)] max-w-md w-full border border-stone-200 shadow-sm p-6 space-y-4 animate-scale-up text-xs sm:text-sm">
            <h3 className="font-display font-black text-sm uppercase text-[#18452E] border-b pb-2">Add Automated Reminder Rule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase font-black tracking-widest mb-1.5">Trigger Event</label>
                <input 
                  type="text"
                  placeholder="e.g. 5 days overdue"
                  value={newRule.triggerEvent}
                  onChange={(e) => setNewRule(prev => ({ ...prev, triggerEvent: e.target.value }))}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs text-stone-850 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase font-black tracking-widest mb-1.5">Channels</label>
                <div className="flex flex-wrap gap-2">
                  {['In-App', 'Email', 'SMS', 'WhatsApp'].map(ch => {
                    const isSelected = newRule.channels.includes(ch);
                    return (
                      <button
                        key={ch}
                        onClick={() => {
                          if (isSelected) {
                            setNewRule(prev => ({ ...prev, channels: prev.channels.filter(c => c !== ch) }));
                          } else {
                            setNewRule(prev => ({ ...prev, channels: [...prev.channels, ch] }));
                          }
                        }}
                        className={`px-3 py-1.5 border rounded-xl font-bold uppercase text-[10px] transition ${
                          isSelected ? 'bg-[#18452E] text-white border-[#0E2F1F]' : 'bg-white border-stone-250 text-#6B7280 hover:bg-stone-50'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <button 
                onClick={handleAddRule}
                className="flex-1 bg-[#18452E] hover:bg-[#18452E] text-white py-2 rounded-xl text-[10px] font-black uppercase transition cursor-pointer"
              >
                Create Rule
              </button>
              <button 
                onClick={() => setShowAddRuleModal(false)}
                className="flex-1 bg-stone-50 hover:bg-stone-200 text-#6B7280 py-2 rounded-xl text-[10px] font-black uppercase transition cursor-pointer"
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
