import { useEffect, useState, useRef } from 'react';
import { UserSession, PromiseToPay, BookingLog, DamageReport, ServiceChargeBill, Property, LandlordUnit } from '../types';

// Centralized real-time listener event system for mock Firestore
const listeners: { [key: string]: Set<() => void> } = {};

function notifyListeners(collectionName: string) {
  if (listeners[collectionName]) {
    listeners[collectionName].forEach(callback => callback());
  }
}

// Global window event listener to sync across tabs/iframes in real-time
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('uh_')) {
      const collection = event.key.replace('uh_', '').replace('_v1', '');
      notifyListeners(collection);
      if (collection === 'collection_tenants') notifyListeners('tenancies');
      if (collection === 'promises_to_pay') notifyListeners('promisesToPay');
      if (collection === 'ledger_records') {
        notifyListeners('activityLog');
        notifyListeners('rentPayments');
      }
    }
  });

  // Intercept local storage writes on the current window to notify listeners instantly
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    const beforeRaw = localStorage.getItem(key);
    originalSetItem.apply(this, [key, value]);
    if (key.startsWith('uh_')) {
      const collection = key.replace('uh_', '').replace('_v1', '');
      notifyListeners(collection);
      if (collection === 'collection_tenants') notifyListeners('tenancies');
      if (collection === 'promises_to_pay') notifyListeners('promisesToPay');
      if (collection === 'ledger_records') {
        notifyListeners('activityLog');
        notifyListeners('rentPayments');
      }
      
      // Dynamic trigger check for state changes
      if (updateCallback && beforeRaw && value) {
        try {
          const beforeArr = JSON.parse(beforeRaw);
          const afterArr = JSON.parse(value);
          if (Array.isArray(beforeArr) && Array.isArray(afterArr)) {
            afterArr.forEach((afterDoc: any) => {
              const beforeDoc = beforeArr.find((b: any) => b.id === afterDoc.id);
              if (beforeDoc && beforeDoc.status !== afterDoc.status) {
                if (updateCallback) updateCallback(collection, beforeDoc, afterDoc);
              }
            });
          }
        } catch (e) {
          console.error('Error in storage trigger', e);
        }
      }
    }
  };
}

// Helper to get collection key in localStorage
function getStorageKey(collectionName: string): string {
  return `uh_${collectionName}_v1`;
}

// Load data from localStorage or fallback to initial seed
export function getCollectionData<T>(collectionName: string, initialData: T[]): T[] {
  if (typeof window === 'undefined') return initialData;
  const cached = localStorage.getItem(getStorageKey(collectionName));
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Error parsing cached data', e);
    }
  }
  // Seed initial data
  localStorage.setItem(getStorageKey(collectionName), JSON.stringify(initialData));
  return initialData;
}

// Save data to localStorage and notify listeners
export function saveCollectionData<T>(collectionName: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(collectionName), JSON.stringify(data));
  notifyListeners(collectionName);
}

// Firestore mock functions
export function addDocument<T extends { id?: string }>(collectionName: string, doc: T, initialSeed: T[] = []): T {
  // Enforce subscription property capacity limits at the database write level (Security Rules emulator)
  if (collectionName === 'buildings' || collectionName === 'management_company_properties' || collectionName === 'properties') {
    const isPmc = (doc as any).company_id !== undefined || (doc as any).managementCompanyId !== undefined;
    const isLandlord = (doc as any).landlordCode !== undefined;
    
    let subscriptions: any[] = [];
    try {
      const storedSub = localStorage.getItem('uh_subscriptions_v1');
      if (storedSub) subscriptions = JSON.parse(storedSub);
    } catch {}

    if (isPmc) {
      const companyId = (doc as any).company_id || (doc as any).managementCompanyId || 'Lagos Realty Partners';
      const sub = subscriptions.find(s => s.entityId === companyId);
      const limit = sub ? sub.property_limit : 10;
      
      let mcps: any[] = [];
      try {
        const storedMcp = localStorage.getItem('uh_management_company_properties_v1');
        if (storedMcp) mcps = JSON.parse(storedMcp);
      } catch {}
      
      const count = mcps.filter((m: any) => m.company_id === companyId && m.is_active !== false).length;
      if (count >= limit) {
        throw new Error(`Write Blocked by Firestore Security Rules: Subscription limit reached. Current usage: ${count}/${limit}.`);
      }
    } else if (isLandlord) {
      const landlordCode = (doc as any).landlordCode;
      const sub = subscriptions.find(s => s.entityId === landlordCode);
      const limit = sub ? sub.property_limit : 30;
      
      let blds: any[] = [];
      try {
        const storedBld = localStorage.getItem('uh_buildings_v1');
        if (storedBld) blds = JSON.parse(storedBld);
      } catch {}
      
      const count = blds.filter((b: any) => b.landlordCode === landlordCode && b.is_active !== false).length;
      if (count >= limit) {
        throw new Error(`Write Blocked by Firestore Security Rules: Subscription limit reached. Current usage: ${count}/${limit}.`);
      }
    }
  }

  const current = getCollectionData<T>(collectionName, initialSeed);
  const newDoc = {
    ...doc,
    id: doc.id || `${collectionName.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
  };
  current.unshift(newDoc);
  saveCollectionData(collectionName, current);
  return newDoc;
}

// Callback mechanism to decouple triggers (like Cloud Functions) and prevent circular imports
let updateCallback: ((collectionName: string, beforeDoc: any, afterDoc: any) => void) | null = null;

export function registerUpdateCallback(cb: (collectionName: string, beforeDoc: any, afterDoc: any) => void) {
  updateCallback = cb;
}

export function updateDocument<T extends { id: string }>(collectionName: string, docId: string, updates: Partial<T>, initialSeed: T[] = []) {
  const current = getCollectionData<T>(collectionName, initialSeed);
  const beforeDoc = current.find(item => item.id === docId);
  const updated = current.map(item => {
    if (item.id === docId) {
      return { ...item, ...updates };
    }
    return item;
  });
  saveCollectionData(collectionName, updated);

  if (beforeDoc && updateCallback) {
    const afterDoc = updated.find(item => item.id === docId);
    if (afterDoc) {
      updateCallback(collectionName, beforeDoc, afterDoc);
    }
  }
}

export function deleteDocument<T extends { id: string }>(collectionName: string, docId: string, initialSeed: T[] = []) {
  if (
    collectionName === 'activityLog' || 
    collectionName === 'ledger_records' || 
    collectionName === 'collection_logs' || 
    collectionName === 'logs'
  ) {
    throw new Error(`Write Blocked by Firestore Security Rules: Compliance logs and ledger records are write-once, immutable, and cannot be deleted.`);
  }

  const current = getCollectionData<T>(collectionName, initialSeed);
  const filtered = current.filter(item => item.id !== docId);
  saveCollectionData(collectionName, filtered);
}

// Auto-copy rule for PromisesToPay (Step 3)
// Automatically copies landlordId and managementCompanyId from the parent tenancy record
export function preparePromiseToPay(
  promise: Partial<PromiseToPay>,
  tenancyRecord: LandlordUnit
): PromiseToPay {
  // Extract correct codes from tenancyRecord
  const landlordId = tenancyRecord.buildingId 
    ? getLandlordCodeFromBuilding(tenancyRecord.buildingId) 
    : (promise.landlordId || 'UH-LANDLORD-FUNMI');
  
  const managementCompanyId = getPMCIdFromProperty(tenancyRecord.propertyName) || 'Prime Property Solutions';

  return {
    id: promise.id || `PRM-${Math.floor(100000 + Math.random() * 900000)}`,
    tenantId: tenancyRecord.tenantCode,
    tenantName: tenancyRecord.tenantName,
    tenantPhone: tenancyRecord.tenantCode, // fallback or from tenancy
    propertyId: tenancyRecord.propertyName,
    propertyName: tenancyRecord.propertyName,
    landlordId: landlordId, // Auto-copied, never accepted directly from submitted form!
    managementCompanyId: managementCompanyId, // Auto-copied, never accepted directly from submitted form!
    paymentType: promise.paymentType || 'Rent',
    outstandingAmount: promise.outstandingAmount || tenancyRecord.rentAmount,
    promisedAmount: promise.promisedAmount || 0,
    expectedPaymentDate: promise.expectedPaymentDate || '',
    reasonForDelay: promise.reasonForDelay || 'Salary Delay',
    note: promise.note || '',
    status: promise.status || 'Upcoming',
    createdAt: promise.createdAt || new Date().toISOString()
  };
}

// Helpers for property resolution
function getLandlordCodeFromBuilding(buildingId: string): string {
  if (buildingId.includes('funmi')) return 'UH-LANDLORD-FUNMI';
  if (buildingId.includes('osei')) return 'UH-LANDLORD-OSEI';
  if (buildingId.includes('musa')) return 'UH-LANDLORD-MUSA';
  if (buildingId.includes('chioma')) return 'UH-LANDLORD-CHIOMA';
  if (buildingId.includes('emmanuel')) return 'UH-LANDLORD-EMMANUEL';
  return 'UH-LANDLORD-FUNMI';
}

function getPMCIdFromProperty(propertyName: string): string {
  if (propertyName.toLowerCase().includes('rosewood') || propertyName.toLowerCase().includes('gbagada estate')) {
    return 'Prime Property Solutions';
  }
  if (propertyName.toLowerCase().includes('wuse') || propertyName.toLowerCase().includes('maitama') || propertyName.toLowerCase().includes('gwarinpa')) {
    return 'Lagos Realty Partners';
  }
  return 'Prime Property Solutions';
}

// Step 2 Unified Notification Collection Schema definition
export interface UnifiedNotification {
  id: string;
  type: 
    | 'payment_confirmed' 
    | 'promise_created' 
    | 'promise_broken' 
    | 'dispute_raised' 
    | 'booking_logged' 
    | 'remittance_submitted' 
    | 'complaint_status_changed' 
    | 'document_uploaded'
    | 'rent_reminder'
    | 'broadcast'
    | 'lease_renewal_alert'
    | 'damage_report'
    | 'maintenance_update'
    | 'quit_notice'
    | 'subscription_renewal'
    | 'admin_action';
  message: string;
  relatedRecordId: string;
  read: boolean;
  timestamp: string;
  role: string; // Scoped target role
  targetId: string; // Landlord code, tenant code, PMC id or Admin
  channels?: ('WhatsApp' | 'SMS' | 'Email' | 'In-App')[]; // Channel routing tracking
  isDemoData?: boolean;
}

// Utility to resolve the unique targetId of the current user session
export function getUserTargetId(session: UserSession): string {
  const name = session.name.toLowerCase();
  if (session.role === 'Admin') return 'Admin';
  if (session.role === 'Landlord') {
    if (name.includes('funmi')) return 'UH-LANDLORD-FUNMI';
    if (name.includes('babatunde') || name.includes('osei')) return 'UH-LANDLORD-OSEI';
    if (name.includes('musa') || name.includes('ibrahim')) return 'UH-LANDLORD-MUSA';
    if (name.includes('chioma') || name.includes('okafor')) return 'UH-LANDLORD-CHIOMA';
    if (name.includes('emmanuel')) return 'UH-LANDLORD-EMMANUEL';
    if (name.includes('fashola') || name.includes('adunola')) return 'UH-LANDLORD-FASHOLA';
    if (name.includes('obiora') || name.includes('emeka')) return 'UH-LANDLORD-OBIRA';
    return session.entityId || 'UH-LANDLORD-FUNMI';
  }
  if (session.role === 'Tenant') {
    return session.entityId || 'UH-TENANT-2412';
  }
  if (session.role === 'PMC') {
    return 'Prime Property Solutions';
  }
  if (session.role === 'Shortlet Manager') {
    return 'sandbox-user-9999';
  }
  return session.userId;
}

const initialNotificationsSeed: UnifiedNotification[] = [
  {
    id: 'not-seed-1',
    type: 'promise_created',
    message: 'Tenant Aisha Bello has logged a promise to pay outstanding rent balance on or before July 20, 2026.',
    relatedRecordId: 'PRM-001',
    read: false,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    role: 'Landlord',
    targetId: 'UH-LANDLORD-CHIOMA'
  },
  {
    id: 'not-seed-2',
    type: 'payment_confirmed',
    message: 'Direct routing rent clearance confirmed: Chidi Mokeme paid ₦3,500,000 for Adebayo Lekki Heights Suite A.',
    relatedRecordId: 'unit-chidi',
    read: false,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    role: 'Landlord',
    targetId: 'UH-LANDLORD-FUNMI'
  },
  {
    id: 'not-seed-3',
    type: 'booking_logged',
    message: 'New Airbnb shortlet booking registered for Osei Gbagada Estate Flat B (Guest: Chief Raymond Temowo).',
    relatedRecordId: 'book-osei-short',
    read: false,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
    role: 'Shortlet Manager',
    targetId: 'sandbox-user-9999'
  },
  {
    id: 'not-seed-4',
    type: 'dispute_raised',
    message: 'Dispute raised by Aisha Bello regarding caution deposit allocation.',
    relatedRecordId: 'unit-aisha',
    read: false,
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    role: 'Admin',
    targetId: 'Admin'
  }
];

// Unified trigger event function for Cloud Functions emulation
export function triggerNotificationCloudEvent(
  type: UnifiedNotification['type'],
  message: string,
  relatedRecordId: string,
  addressedTo: { role: string; targetId?: string }[],
  channels?: ('WhatsApp' | 'SMS' | 'Email' | 'In-App')[]
) {
  // Determine channels based on permanent notification routing rules:
  // Rule One: Automated rent reminders only use the channel sequence: WhatsApp first, SMS second, email third.
  // Rule Two: Every other notification type uses in-app notification and email only.
  // Rule Three: Urgent broadcasts from admin use email and in-app only (Not WhatsApp).
  // Rule Four: No notification of any kind sends to WhatsApp or SMS unless it is specifically a scheduled rent reminder.
  
  let finalChannels: ('WhatsApp' | 'SMS' | 'Email' | 'In-App')[] = ['In-App', 'Email'];
  
  if (type === 'rent_reminder') {
    finalChannels = ['WhatsApp', 'SMS', 'Email'];
  } else {
    // If other notification types specify WhatsApp or SMS, we strictly filter them out.
    if (channels) {
      finalChannels = channels.filter(ch => ch === 'In-App' || ch === 'Email');
    }
  }

  const currentNotifs = getCollectionData<UnifiedNotification>('notifications', initialNotificationsSeed);
  const newNotifs = addressedTo.map(addr => ({
    id: `not-${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    relatedRecordId,
    read: false,
    timestamp: new Date().toISOString(),
    role: addr.role,
    targetId: addr.targetId || '',
    channels: finalChannels
  }));
  
  saveCollectionData('notifications', [...newNotifs, ...currentNotifs]);
}

// Step 1 Custom Live Listener React Hook
export function useLiveCollection<T extends { id?: string }>(
  collectionName: string,
  initialSeed: T[],
  filterCallback: (data: T[]) => T[]
): T[] {
  const filterRef = useRef(filterCallback);
  filterRef.current = filterCallback;

  const [data, setData] = useState<T[]>(() => {
    const raw = getCollectionData<T>(collectionName, initialSeed);
    return filterRef.current(raw);
  });

  useEffect(() => {
    // Register listener
    if (!listeners[collectionName]) {
      listeners[collectionName] = new Set();
    }
    
    const updateHandler = () => {
      const raw = getCollectionData<T>(collectionName, initialSeed);
      setData(filterRef.current(raw));
    };

    listeners[collectionName].add(updateHandler);

    return () => {
      listeners[collectionName].delete(updateHandler);
    };
  }, [collectionName, initialSeed]);

  return data;
}
