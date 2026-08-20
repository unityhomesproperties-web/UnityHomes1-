import { 
  getCollectionData, 
  saveCollectionData, 
  UnifiedNotification 
} from './database';
import { 
  LandlordUnit, 
  BookingLog, 
  DamageReport, 
  ServiceChargeBill, 
  PromiseToPay, 
  PlatformDocument, 
  Complaint, 
  MaintenanceJob,
  RentPayment
} from '../types';
import { 
  initialLandlordUnits, 
  initialBookingLogs, 
  initialServiceCharges,
  initialBuildings
} from '../data';

// Standard storage keys
const STORAGE_KEYS = {
  tenants: 'uh_collection_tenants_v1',
  bookings: 'uh_shortlet_bookings_v1',
  damages: 'uh_damage_reports_v1',
  charges: 'uh_service_charges_v1',
  promises: 'uh_promises_to_pay_v1',
  complaints: 'uh_complaints_v1',
  maintenance: 'uh_maintenance_requests_v1',
  documents: 'uh_documents_v1',
  notifications: 'uh_notifications_v1',
  logs: 'uh_activityLog_v1',
  rentPayments: 'uh_rent_payments_v1',
  sentEmails: 'uh_sent_emails_v1',
  subscriptions: 'uh_subscriptions_v1',
  managementCompanyProperties: 'uh_management_company_properties_v1',
  buildings: 'uh_buildings_v1',
  cautionDepositResolutions: 'uh_caution_deposit_resolutions_v1',
  supportTickets: 'uh_support_tickets_v1'
};

// Raw localStorage helpers
function getRawList<T>(key: string, fallback: T[]): T[] {
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error(e);
    }
  }
  return fallback;
}

function saveRawList<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function generateDemoDataset() {
  // First clear any existing demo data
  removeDemoDataset();

  // Load clean non-demo data
  const cleanUnits = getRawList<LandlordUnit>(STORAGE_KEYS.tenants, initialLandlordUnits).filter(u => !u.isDemoData);
  const cleanBookings = getRawList<BookingLog>(STORAGE_KEYS.bookings, initialBookingLogs).filter(b => !b.isDemoData);
  const cleanCharges = getRawList<ServiceChargeBill>(STORAGE_KEYS.charges, initialServiceCharges).filter(c => !c.isDemoData);
  const cleanPromises = getRawList<PromiseToPay>(STORAGE_KEYS.promises, []).filter(p => !p.isDemoData);
  const cleanComplaints = getRawList<Complaint>(STORAGE_KEYS.complaints, []).filter(c => !c.isDemoData);
  const cleanMaintenance = getRawList<MaintenanceJob>(STORAGE_KEYS.maintenance, []).filter(m => !m.isDemoData);
  const cleanDamages = getRawList<DamageReport>(STORAGE_KEYS.damages, []).filter(d => !d.isDemoData);
  const cleanDocuments = getRawList<PlatformDocument>(STORAGE_KEYS.documents, []).filter(d => !d.isDemoData);
  const cleanLogs = getRawList<any>(STORAGE_KEYS.logs, []).filter(l => !l.isDemoData);
  const cleanNotifications = getRawList<UnifiedNotification>(STORAGE_KEYS.notifications, []).filter(n => !n.isDemoData);

  // 1. SEED LANDLORD UNITS (TENANCIES)
  const demoUnits: LandlordUnit[] = [];

  // Landlord One: Mrs Adunola Fashola (8 properties across Surulere and Yaba, all self-managed)
  // Total Portfolio value = 8,200,000. Collected = 6,400,000. Outstanding = 1,800,000.
  const fasholaProperties = [
    { name: 'Fashola Surulere Flat A', rent: 948669, status: 'Paid' as const, expiryDays: 22 }, // expiring in 22 days, renewalIntention null
    { name: 'Fashola Surulere Flat B', rent: 1069801, status: 'Paid' as const },
    { name: 'Fashola Surulere Flat C', rent: 1954227, status: 'Paid' as const },
    { name: 'Fashola Yaba Terrace A', rent: 687888, status: 'Paid' as const },
    { name: 'Fashola Yaba Terrace B', rent: 781072, status: 'Paid' as const },
    { name: 'Fashola Yaba Penthouse A', rent: 772735, status: 'Paid' as const },
    { name: 'Fashola Surulere Suite A', rent: 1418932, status: 'Overdue' as const, overdueDays: 34, tenant: 'Kunle Fashina' }, // overdue by 34 days
    { name: 'Fashola Yaba Villa A', rent: 567296, status: 'Paid' as const, tenant: 'Yemi Alade', installment: true } // installment plan
  ];

  fasholaProperties.forEach((p, idx) => {
    const unitId = `fashola-unit-${idx + 1}`;
    let dueDate = '';
    let leaseExpiryDate = '';
    let renewalIntention = null;

    if (p.expiryDays !== undefined) {
      leaseExpiryDate = new Date(Date.now() + p.expiryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dueDate = leaseExpiryDate;
    } else if (p.overdueDays !== undefined) {
      dueDate = new Date(Date.now() - p.overdueDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else {
      dueDate = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    demoUnits.push({
      id: unitId,
      buildingId: 'bld-fashola',
      propertyName: p.name,
      unitNumber: `Flat ${idx + 1}`,
      tenantName: p.tenant || `Fasola Tenant ${idx + 1}`,
      tenantCode: `UH-TENANT-FASHOLA-${idx + 1}`,
      rentAmount: p.rent,
      paymentStatus: p.status,
      dueDate,
      leaseExpiryDate: leaseExpiryDate || undefined,
      renewalIntention,
      isDemoData: true,
      landlordId: 'UH-LANDLORD-FASHOLA',
      landlordName: 'Mrs Adunola Fashola',
      installments: p.installment ? [
        { id: 'inst-1', dueDate: '2026-05-15', amount: 80000, status: 'Paid' },
        { id: 'inst-2', dueDate: '2026-06-15', amount: 80000, status: 'Paid' },
        { id: 'inst-3', dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], amount: 80000, status: 'Unpaid' }
      ] : undefined
    } as any);
  });

  // Landlord Two: Chief Emeka Obiora (11 properties, 3 managed by Lagos Realty Partners, 8 self-managed)
  // Portfolio value = 22,400,000. Collected = 18,600,000. Outstanding = 3,800,000.
  const obioraProperties = [
    { name: 'Obiora Ikeja GRA Villa', rent: 5689835, status: 'Paid' as const, pmc: 'Lagos Realty Partners' }, // managed
    { name: 'Obiora Ikeja Penthouse', rent: 2975290, status: 'Paid' as const, pmc: 'Lagos Realty Partners' }, // managed
    { name: 'Obiora Magodo Terrace', rent: 1730147, status: 'Paid' as const, pmc: 'Lagos Realty Partners' }, // managed
    { name: 'Obiora Self Flat A', rent: 653332, status: 'Paid' as const }, // self
    { name: 'Obiora Self Flat B', rent: 534600, status: 'Paid' as const }, // self
    { name: 'Obiora Self Flat C', rent: 703202, status: 'Paid' as const }, // self
    { name: 'Obiora Self Flat D', rent: 432748, status: 'Paid' as const }, // self
    { name: 'Obiora Self Flat E', rent: 570557, status: 'Paid' as const }, // self
    { name: 'Obiora Self Flat F', rent: 578633, status: 'Paid' as const }, // self
    { name: 'Obiora Self Mansion A', rent: 732754, status: 'Overdue' as const, tenant: 'Nnamdi Azikiwe', overdueDays: 15, brokenPromise: true }, // self, broken promise overdue
    { name: 'Obiora Self Villa F', rent: 729837, status: 'Vacant' as const, vacancyStartDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] } // vacant
  ];

  obioraProperties.forEach((p, idx) => {
    const unitId = `obiora-unit-${idx + 1}`;
    let dueDate = '';
    if (p.overdueDays !== undefined) {
      dueDate = new Date(Date.now() - p.overdueDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (p.status !== 'Vacant') {
      dueDate = new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    demoUnits.push({
      id: unitId,
      buildingId: p.pmc ? 'bld-obiora-pmc' : 'bld-obiora-self',
      propertyName: p.name,
      unitNumber: `Suite ${idx + 1}`,
      tenantName: p.status === 'Vacant' ? '' : (p.tenant || `Obiora Tenant ${idx + 1}`),
      tenantCode: p.status === 'Vacant' ? '' : `UH-TENANT-OBIORA-${idx + 1}`,
      rentAmount: p.rent,
      paymentStatus: p.status,
      dueDate,
      vacancyStartDate: p.vacancyStartDate,
      managementCompanyId: p.pmc || undefined,
      isDemoData: true,
      landlordId: 'UH-LANDLORD-OBIORA',
      landlordName: 'Chief Emeka Obiora'
    } as any);
  });

  // Landlord Three: Alhaji Sule Magaji (4 properties managed by Lagos Realty Partners)
  // Portfolio value = 2,760,000. Collected = 1,920,000. Outstanding = 840,000.
  const magajiProperties = [
    { name: 'Magaji Gbagada Flat', rent: 2134077, status: 'Paid' as const, tenant: 'Magaji Tenant 1' },
    { name: 'Magaji Yaba Penthouse', rent: 465650, status: 'Paid' as const, tenant: 'Magaji Tenant 2' },
    { name: 'Magaji Surulere Duplex', rent: 946354, status: 'Overdue' as const, overdueDays: 10, tenant: 'Aminu Kano', upcomingPromise: true }, // upcoming promise
    { name: 'Magaji Mainland Court', rent: 647363, status: 'Overdue' as const, overdueDays: 19, tenant: 'Sani Bello' } // overdue by 19 days
  ];

  magajiProperties.forEach((p, idx) => {
    const unitId = `magaji-unit-${idx + 1}`;
    const dueDate = new Date(Date.now() - (p.overdueDays || -120) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    demoUnits.push({
      id: unitId,
      buildingId: 'bld-magaji',
      propertyName: p.name,
      unitNumber: `Flat ${idx + 1}`,
      tenantName: p.tenant,
      tenantCode: `UH-TENANT-MAGAJI-${idx + 1}`,
      rentAmount: p.rent,
      paymentStatus: p.status,
      dueDate,
      managementCompanyId: 'Lagos Realty Partners',
      isDemoData: true,
      landlordId: 'UH-LANDLORD-MAGAJI',
      landlordName: 'Alhaji Sule Magaji'
    } as any);
  });

  // Landlord Four & Five: Dr Bimbo Adeyemi & Mrs Grace Nwosu (Shortlet Portfolios)
  // Bimbo Adeyemi: 6 shortlet properties, Mrs Grace Nwosu: 4 shortlet properties
  // Portfolio values: Bimbo Adeyemi NGN 148,000,000 asset value, Grace Nwosu NGN 32,000,000.
  // Let's seed vacant placeholder units just to show their portfolios!
  const shortletPortfolios = [
    { id: 'UH-LANDLORD-ADEYEMI', name: 'Dr Bimbo Adeyemi', properties: ['Lekki Phase 1 apartment A', 'Lekki Phase 1 apartment B', 'Lekki Phase 1 apartment C', 'Victoria Island Suite A', 'Victoria Island Suite B', 'Victoria Island Suite C'], assetValue: 29600000 },
    { id: 'UH-LANDLORD-NWOSU', name: 'Mrs Grace Nwosu', properties: ['Nwosu Ikoyi Villa A', 'Nwosu Ikoyi Villa B', 'Nwosu Ikoyi Penthouse C', 'Nwosu Ikoyi Penthouse D'], assetValue: 6400000 }
  ];

  shortletPortfolios.forEach((landlord) => {
    landlord.properties.forEach((name, idx) => {
      demoUnits.push({
        id: `shortlet-unit-${landlord.id}-${idx}`,
        buildingId: `bld-shortlet-${landlord.id}`,
        propertyName: name,
        unitNumber: 'Suite A',
        tenantName: '',
        tenantCode: '',
        rentAmount: 0,
        paymentStatus: 'Vacant' as const,
        dueDate: '',
        managementCompanyId: 'Okonkwo Shortlet Management',
        isDemoData: true,
        landlordId: landlord.id,
        landlordName: landlord.name
      } as any);
    });
  });

  saveRawList(STORAGE_KEYS.tenants, [...demoUnits, ...cleanUnits]);

  // 2. SEED PROMISES TO PAY
  const demoPromises: PromiseToPay[] = [
    {
      id: 'promise-magaji-upcoming',
      tenantId: 'UH-TENANT-MAGAJI-3',
      tenantName: 'Aminu Kano',
      tenantPhone: '+234 812 111 2222',
      propertyId: 'bld-magaji',
      propertyName: 'Magaji Surulere Duplex',
      landlordId: 'UH-LANDLORD-MAGAJI',
      managementCompanyId: 'Lagos Realty Partners',
      paymentType: 'Rent',
      outstandingAmount: 96000,
      promisedAmount: 96000,
      expectedPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days in future
      reasonForDelay: 'Pending terminal benefits disbursement',
      status: 'Upcoming',
      createdAt: new Date().toISOString(),
      isDemoData: true
    } as any,
    {
      id: 'promise-obiora-broken',
      tenantId: 'UH-TENANT-OBIORA-10',
      tenantName: 'Nnamdi Azikiwe',
      tenantPhone: '+234 803 333 4444',
      propertyId: 'bld-obiora-self',
      propertyName: 'Obiora Self Mansion A',
      landlordId: 'UH-LANDLORD-OBIORA',
      paymentType: 'Rent',
      outstandingAmount: 760000,
      promisedAmount: 760000,
      expectedPaymentDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days in past
      // DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds.
      reasonForDelay: 'Awaiting international funds transfer confirmation',
      status: 'Broken Promise',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      isDemoData: true
    } as any
  ];

  saveRawList(STORAGE_KEYS.promises, [...demoPromises, ...cleanPromises]);

  // 3. SEED SHORTLET BOOKINGS (James Okonkwo)
  // Total Gross Revenue: 64,800,000
  // Commission Earned: 10,680,000
  // Outstanding Remittances: 1,800,000
  const demoBookings: BookingLog[] = [
    // Lekki Phase 1 apartment A: Most Profitable Property (Total gross: 16.2M, 15% commission)
    {
      id: 'book-adeyemi-1a',
      propertyName: 'Lekki Phase 1 apartment A',
      unitNumber: 'Suite A',
      guestName: 'Aliko Dangote',
      checkInDate: '2026-07-01',
      checkOutDate: '2026-07-10',
      totalPaid: 240000,
      remittanceFormSent: false, // Outstanding!
      remittanceAmount: 204000, // 85%
      managementFeeAmount: 36000, // 15%
      status: 'Confirmed',
      bookingSource: 'Direct',
      isDemoData: true
    },
    {
      id: 'book-adeyemi-1b',
      propertyName: 'Lekki Phase 1 apartment A',
      unitNumber: 'Suite A',
      guestName: 'Wizkid Ayo',
      checkInDate: '2026-07-12',
      checkOutDate: '2026-07-20',
      totalPaid: 1600000,
      remittanceFormSent: true, // Remitted
      remittanceAmount: 1360000,
      managementFeeAmount: 240000,
      status: 'Acknowledged',
      bookingSource: 'Airbnb',
      caution_deposit_collected: true,
      caution_deposit_amount: 30000,
      isDemoData: true
    },
    {
      id: 'book-adeyemi-1c',
      propertyName: 'Lekki Phase 1 apartment A',
      unitNumber: 'Suite A',
      guestName: 'Davido Adeleke',
      checkInDate: '2026-06-01',
      checkOutDate: '2026-06-15',
      totalPaid: 1400000,
      remittanceFormSent: true,
      remittanceAmount: 1190000,
      managementFeeAmount: 210000,
      status: 'Acknowledged',
      bookingSource: 'Booking.com',
      isDemoData: true
    },
    // Lekki Phase 1 apartment B: 8,000,000 gross
    {
      id: 'book-adeyemi-2a',
      propertyName: 'Lekki Phase 1 apartment B',
      unitNumber: 'Suite A',
      guestName: 'Burna Boy',
      checkInDate: '2026-07-02',
      checkOutDate: '2026-07-13',
      totalPaid: 1600000,
      remittanceFormSent: true,
      remittanceAmount: 1360000,
      managementFeeAmount: 240000,
      status: 'Acknowledged',
      bookingSource: 'Airbnb',
      caution_deposit_collected: true,
      caution_deposit_amount: 30000,
      isDemoData: true
    },
    // Lekki Phase 1 apartment C: 7,400,000 gross
    {
      id: 'book-adeyemi-3a',
      propertyName: 'Lekki Phase 1 apartment C',
      unitNumber: 'Suite A',
      guestName: 'Tiwa Savage',
      checkInDate: '2026-06-10',
      checkOutDate: '2026-06-25',
      totalPaid: 1480000,
      remittanceFormSent: true,
      remittanceAmount: 1258000,
      managementFeeAmount: 222000,
      status: 'Acknowledged',
      bookingSource: 'Booking.com',
      isDemoData: true
    },
    // Victoria Island Suite A: 5,000,000 gross
    {
      id: 'book-adeyemi-4a',
      propertyName: 'Victoria Island Suite A',
      unitNumber: 'Suite A',
      guestName: 'Genevieve Nnaji',
      checkInDate: '2026-05-01',
      checkOutDate: '2026-05-15',
      totalPaid: 1000000,
      remittanceFormSent: true,
      remittanceAmount: 850000,
      managementFeeAmount: 150000,
      status: 'Acknowledged',
      bookingSource: 'Airbnb',
      isDemoData: true
    },
    // Victoria Island Suite B: 5,000,000 gross
    {
      id: 'book-adeyemi-5a',
      propertyName: 'Victoria Island Suite B',
      unitNumber: 'Suite A',
      guestName: 'Richard Mofe-Damijo',
      checkInDate: '2026-04-10',
      checkOutDate: '2026-04-20',
      totalPaid: 1000000,
      remittanceFormSent: true,
      remittanceAmount: 850000,
      managementFeeAmount: 150000,
      status: 'Acknowledged',
      bookingSource: 'Booking.com',
      isDemoData: true
    },
    // Victoria Island Suite C: 4,000,000 gross
    {
      id: 'book-adeyemi-6a',
      propertyName: 'Victoria Island Suite C',
      unitNumber: 'Suite A',
      guestName: 'Funke Akindele',
      checkInDate: '2026-03-01',
      checkOutDate: '2026-03-10',
      totalPaid: 800000,
      remittanceFormSent: true,
      remittanceAmount: 680000,
      managementFeeAmount: 120000,
      status: 'Acknowledged',
      bookingSource: 'Direct',
      isDemoData: true
    },
    // Nwosu Ikoyi Villa A: 20% commission, Gross: 975,000 (Outstanding)
    {
      id: 'book-nwosu-1a',
      propertyName: 'Nwosu Ikoyi Villa A',
      unitNumber: 'Suite B',
      guestName: 'Olamide Baddo',
      checkInDate: '2026-07-11',
      checkOutDate: '2026-07-16',
      totalPaid: 195000,
      remittanceFormSent: false, // Outstanding!
      remittanceAmount: 156000, // 80%
      managementFeeAmount: 39000, // 20%
      status: 'Confirmed',
      bookingSource: 'Direct',
      caution_deposit_collected: true,
      caution_deposit_amount: 25000,
      isDemoData: true
    },
    // Unresolved checkout booking (yesterday)
    {
      id: 'book-unresolved-1',
      propertyName: 'Lekki Phase 1 apartment C',
      unitNumber: 'Suite C',
      guestName: 'Tunde Bakare',
      checkInDate: '2026-07-18',
      checkOutDate: '2026-07-20',
      totalPaid: 150000,
      remittanceFormSent: false,
      remittanceAmount: 127500,
      managementFeeAmount: 22500,
      status: 'Confirmed',
      bookingSource: 'Direct',
      caution_deposit_collected: true,
      caution_deposit_amount: 20000,
      isDemoData: true
    },
    // Nwosu Ikoyi Villa B: 6,000,000 gross
    {
      id: 'book-nwosu-2a',
      propertyName: 'Nwosu Ikoyi Villa B',
      unitNumber: 'Suite B',
      guestName: 'Falz the Bahd Guy',
      checkInDate: '2026-06-05',
      checkOutDate: '2026-06-18',
      totalPaid: 1200000,
      remittanceFormSent: true,
      remittanceAmount: 960000,
      managementFeeAmount: 240000,
      status: 'Acknowledged',
      bookingSource: 'Airbnb',
      isDemoData: true
    },
    // Nwosu Ikoyi Penthouse C: 6,225,000 gross
    {
      id: 'book-nwosu-3a',
      propertyName: 'Nwosu Ikoyi Penthouse C',
      unitNumber: 'Suite B',
      guestName: 'Tems Openiyi',
      checkInDate: '2026-05-10',
      checkOutDate: '2026-05-25',
      totalPaid: 1245000,
      remittanceFormSent: true,
      remittanceAmount: 996000,
      managementFeeAmount: 249000,
      status: 'Acknowledged',
      bookingSource: 'Booking.com',
      isDemoData: true
    },
    // Nwosu Ikoyi Penthouse D: 6,000,000 gross
    {
      id: 'book-nwosu-4a',
      propertyName: 'Nwosu Ikoyi Penthouse D',
      unitNumber: 'Suite B',
      guestName: 'Kizz Daniel',
      checkInDate: '2026-04-01',
      checkOutDate: '2026-04-12',
      totalPaid: 1200000,
      remittanceFormSent: true,
      remittanceAmount: 960000,
      managementFeeAmount: 240000,
      status: 'Acknowledged',
      bookingSource: 'Airbnb',
      isDemoData: true
    }
  ];

  saveRawList(STORAGE_KEYS.bookings, [...demoBookings, ...cleanBookings]);

  // 4. SEED SERVICE CHARGE BILLS (Lagos Realty Partners)
  // Collection rate exactly 74.22% (rounds to 74%)
  // Total bills: 50. Security Levy (15,000), Generator Diesel (12,000).
  // Paid counts: 19 Security Levy, 18 Generator Diesel.
  const demoCharges: ServiceChargeBill[] = [];

  // Units managed by Lagos Realty Partners:
  const lrpUnitIds = [
    'obiora-unit-1', 'obiora-unit-2', 'obiora-unit-3',
    'magaji-unit-1', 'magaji-unit-2', 'magaji-unit-3', 'magaji-unit-4'
  ];

  // We need exactly 25 Security Levy bills of NGN 15,000
  // 19 Paid, 6 Unpaid/Overdue
  for (let i = 0; i < 25; i++) {
    const unitId = lrpUnitIds[i % lrpUnitIds.length];
    const status = i < 19 ? 'Paid' : 'Overdue';
    demoCharges.push({
      id: `sc-seclevy-${i + 1}`,
      categoryId: 'sc-sec',
      unitId,
      tenantName: i % 2 === 0 ? 'Chief Obiora Tenant' : 'Alhaji Magaji Tenant',
      amount: 15000,
      dueDate: new Date(Date.now() - (i % 5 + 1) * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status,
      dateVerified: status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
      verifiedBy: status === 'Paid' ? 'pmc-user-lrp' : undefined,
      isDemoData: true
    } as any);
  }

  // We need exactly 25 Generator Diesel bills of NGN 12,000
  // 18 Paid, 7 Unpaid/Overdue
  for (let i = 0; i < 25; i++) {
    const unitId = lrpUnitIds[i % lrpUnitIds.length];
    const status = i < 18 ? 'Paid' : 'Overdue';
    demoCharges.push({
      id: `sc-diesel-${i + 1}`,
      categoryId: 'sc-diesel',
      unitId,
      tenantName: i % 2 === 0 ? 'Chief Obiora Tenant' : 'Alhaji Magaji Tenant',
      amount: 12000,
      dueDate: new Date(Date.now() - (i % 5 + 1) * 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status,
      dateVerified: status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined,
      verifiedBy: status === 'Paid' ? 'pmc-user-lrp' : undefined,
      isDemoData: true
    } as any);
  }

  // Seed Kehinde Olorunfemi pending service charge payment
  demoCharges.push({
    id: 'sc-kehinde-diesel',
    categoryId: 'sc-diesel',
    unitId: 'unit-kehinde',
    tenantName: 'Kehinde Olorunfemi',
    tenantEmail: 'kehinde.olorunfemi@gmail.com',
    amount: 35000,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending_verification',
    propertyName: 'Plot 22, Fola Osibo Road, Lekki Phase 1, Lagos',
    unitNumber: 'Suite A',
    managingAuthority: 'Lagos Realty Partners',
    receivingBankName: 'Zenith Bank',
    receivingAccountName: 'LRP Operations Account',
    receivingAccountNumber: '2022839485',
    ref: 'TX-SC-KEHINDE-99',
    isDemoData: true
  } as any);

  saveRawList(STORAGE_KEYS.charges, [...demoCharges, ...cleanCharges]);

  // 5. SEED ACTIVITY LOGS (Exactly 35 logs)
  const demoLogs: any[] = [
    { id: 'log-1', eventType: 'TENANCY_CREATED', details: 'Lease Agreement signed for Kunle Fashina under Fashola Surulere Suite A.', sender: 'PMC', channel: 'Email', status: 'Delivered', outstandingAmt: 600000, dateSent: '2026-06-01', isDemoData: true },
    { id: 'log-2', eventType: 'RENT_PAYMENT_RECEIVED', details: 'Installment payment 1 (₦400,000) cleared successfully by Yemi Alade.', sender: 'PMC', channel: 'SMS', status: 'Delivered', outstandingAmt: 800000, dateSent: '2026-05-15', isDemoData: true },
    { id: 'log-3', eventType: 'RENT_PAYMENT_RECEIVED', details: 'Installment payment 2 (₦400,000) cleared successfully by Yemi Alade.', sender: 'PMC', channel: 'SMS', status: 'Delivered', outstandingAmt: 400000, dateSent: '2026-06-15', isDemoData: true },
    { id: 'log-4', eventType: 'PAYMENT_REMINDER', details: 'First Rent Invoice reminder (₦600,000) issued to Kunle Fashina via WhatsApp.', sender: 'AI', channel: 'WhatsApp', status: 'Delivered', outstandingAmt: 600000, dateSent: '2026-06-25', isDemoData: true },
    { id: 'log-5', eventType: 'PAYMENT_REMINDER', details: 'Overdue rent warning (34 days late) sent to Kunle Fashina via Email.', sender: 'AI', channel: 'Email', status: 'Delivered', outstandingAmt: 600000, dateSent: '2026-07-09', isDemoData: true },
    { id: 'log-6', eventType: 'PAYMENT_REMINDER', details: 'Upcoming installment 3 reminder sent to Yemi Alade via SMS.', sender: 'AI', channel: 'SMS', status: 'Delivered', outstandingAmt: 400000, dateSent: '2026-07-05', isDemoData: true },
    { id: 'log-7', eventType: 'TENANCY_CREATED', details: 'Rent Invoice (₦3,800,000) issued to Nnamdi Azikiwe.', sender: 'PMC', channel: 'Email', status: 'Delivered', outstandingAmt: 3800000, dateSent: '2026-06-01', isDemoData: true },
    { id: 'log-8', eventType: 'PAYMENT_REMINDER', details: 'Rent due soon notification sent to Nnamdi Azikiwe.', sender: 'AI', channel: 'SMS', status: 'Delivered', outstandingAmt: 3800000, dateSent: '2026-06-08', isDemoData: true },
    { id: 'log-9', eventType: 'PROMISE_TO_PAY_LOGGED', details: 'Nnamdi Azikiwe registered a Promise to Pay (₦3,800,000) for June 20.', sender: 'AI', channel: 'WhatsApp', status: 'Delivered', outstandingAmt: 3800000, dateSent: '2026-06-10', isDemoData: true },
    { id: 'log-10', eventType: 'PROMISE_TO_PAY_BROKEN', details: 'Nnamdi Azikiwe missed his promised rent clearance deadline of June 20.', sender: 'AI', channel: 'Email', status: 'Delivered', outstandingAmt: 3800000, dateSent: '2026-06-20', isDemoData: true },
    { id: 'log-11', eventType: 'PAYMENT_REMINDER', details: 'Second overdue warning (10 days late) sent to Nnamdi Azikiwe.', sender: 'AI', channel: 'WhatsApp', status: 'Delivered', outstandingAmt: 3800000, dateSent: '2026-06-30', isDemoData: true },
    { id: 'log-12', eventType: 'PAYMENT_REMINDER', details: 'Critical demand legal alert sent to Nnamdi Azikiwe via Email.', sender: 'Admin', channel: 'Email', status: 'Delivered', outstandingAmt: 3800000, dateSent: '2026-07-09', isDemoData: true },
    { id: 'log-13', eventType: 'TENANCY_CREATED', details: 'Rent Invoice (₦1,080,000) sent to Magaji Tenant 1.', sender: 'PMC', channel: 'Email', status: 'Delivered', outstandingAmt: 1080000, dateSent: '2026-05-01', isDemoData: true },
    { id: 'log-14', eventType: 'RENT_PAYMENT_RECEIVED', details: 'Direct routing rent payment (₦1,080,000) received from Magaji Tenant 1.', sender: 'PMC', channel: 'SMS', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-05-01', isDemoData: true },
    { id: 'log-15', eventType: 'TENANCY_CREATED', details: 'Rent Invoice (₦840,000) sent to Magaji Tenant 2.', sender: 'PMC', channel: 'Email', status: 'Delivered', outstandingAmt: 840000, dateSent: '2026-05-01', isDemoData: true },
    { id: 'log-16', eventType: 'RENT_PAYMENT_RECEIVED', details: 'Direct bank payment (₦840,000) received from Magaji Tenant 2.', sender: 'PMC', channel: 'SMS', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-05-02', isDemoData: true },
    { id: 'log-17', eventType: 'TENANCY_CREATED', details: 'Rent Invoice (₦480,000) sent to Aminu Kano.', sender: 'PMC', channel: 'Email', status: 'Delivered', outstandingAmt: 480000, dateSent: '2026-06-01', isDemoData: true },
    { id: 'log-18', eventType: 'PROMISE_TO_PAY_LOGGED', details: 'Aminu Kano registered an upcoming Promise to Pay (₦480,000) for July 15.', sender: 'AI', channel: 'WhatsApp', status: 'Delivered', outstandingAmt: 480000, dateSent: '2026-06-10', isDemoData: true },
    { id: 'log-19', eventType: 'TENANCY_CREATED', details: 'Rent Invoice (₦360,000) sent to Sani Bello.', sender: 'PMC', channel: 'Email', status: 'Delivered', outstandingAmt: 360000, dateSent: '2026-06-15', isDemoData: true },
    { id: 'log-20', eventType: 'PAYMENT_REMINDER', details: 'Rent due soon reminder sent to Sani Bello via SMS.', sender: 'AI', channel: 'SMS', status: 'Delivered', outstandingAmt: 360000, dateSent: '2026-06-25', isDemoData: true },
    { id: 'log-21', eventType: 'PAYMENT_REMINDER', details: 'Overdue rent alert (19 days late) sent to Sani Bello via WhatsApp.', sender: 'AI', channel: 'WhatsApp', status: 'Delivered', outstandingAmt: 360000, dateSent: '2026-07-05', isDemoData: true },
    { id: 'log-22', eventType: 'SERVICE_CHARGE_ISSUED', details: 'Security Levy bill (₦15,000) generated for Magaji Gbagada Flat.', sender: 'PMC', channel: 'Email', status: 'Delivered', outstandingAmt: 15000, dateSent: '2026-07-01', isDemoData: true },
    { id: 'log-23', eventType: 'SERVICE_CHARGE_ISSUED', details: 'Generator Diesel bill (₦12,000) generated for Magaji Gbagada Flat.', sender: 'PMC', channel: 'Email', status: 'Delivered', outstandingAmt: 12000, dateSent: '2026-07-01', isDemoData: true },
    { id: 'log-24', eventType: 'SERVICE_CHARGE_RECEIVED', details: 'Service charge payment (₦27,000) cleared by Magaji Tenant 1.', sender: 'PMC', channel: 'SMS', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-02', isDemoData: true },
    { id: 'log-25', eventType: 'BOOKING_LOGGED', details: 'Shortlet booking booked for Eko Atlantic Suite by Emeka Okafor.', sender: 'Shortlet Manager', channel: 'Email', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-01', isDemoData: true },
    { id: 'log-26', eventType: 'REMITTANCE_SENT', details: 'Remittance form dispatch completed for Eko Atlantic Suite.', sender: 'Shortlet Manager', channel: 'WhatsApp', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-05', isDemoData: true },
    { id: 'log-27', eventType: 'DAMAGE_REPORTED', details: 'Minor AC damage report logged for Adebayo Lekki Heights Suite A.', sender: 'Shortlet Manager', channel: 'In-App', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-02', isDemoData: true },
    { id: 'log-28', eventType: 'COMPLAINT_FILED', details: 'Water pump offline dispute reported by tenant Damola Olatunji.', sender: 'Tenant', channel: 'WhatsApp', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-04', isDemoData: true },
    { id: 'log-29', eventType: 'TENANT_VERIFICATION', details: 'Tenant credit check and KYC verification initiated for new applicant.', sender: 'PMC', channel: 'Email', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-03', isDemoData: true },
    { id: 'log-30', eventType: 'LEASE_EXPIRY_REMINDER', details: 'Automated 30-day lease expiry warning sent to Mrs Fashola Tenant 1.', sender: 'AI', channel: 'Email', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-05', isDemoData: true },
    { id: 'log-31', eventType: 'COMPLAINT_UPDATED', details: 'Caretaker dispatched to inspect water pump at Osei Gbagada Estate Flat A.', sender: 'PMC', channel: 'SMS', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-06', isDemoData: true },
    { id: 'log-32', eventType: 'LEASE_EXPIRY_REMINDER', details: 'Urgent 22-day lease renewal inquiry sent to Mrs Fashola Tenant 1.', sender: 'AI', channel: 'WhatsApp', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-09', isDemoData: true },
    { id: 'log-33', eventType: 'MAINTENANCE_LOGGED', details: 'Kitchen pipe leak repair request logged for Fashola Yaba Penthouse A.', sender: 'Tenant', channel: 'In-App', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-08', isDemoData: true },
    { id: 'log-34', eventType: 'SYSTEM_BACKUP', details: 'System ledger database automated off-site secure backup completed.', sender: 'Admin', channel: 'In-App', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-08', isDemoData: true },
    { id: 'log-35', eventType: 'DEMO_DATA_GENERATED', details: 'Part C Comprehensive Sandboxed Demo Dataset successfully seeded.', sender: 'Admin', channel: 'In-App', status: 'Delivered', outstandingAmt: 0, dateSent: '2026-07-09', isDemoData: true }
  ];

  saveRawList(STORAGE_KEYS.logs, [...demoLogs, ...cleanLogs]);

  // 6. SEED COMPLAINTS (5 Demo complaints matching all 5 routing paths)
  const demoComplaints: Complaint[] = [
    {
      id: 'complaint-demo-path-1',
      tenant: 'Kunle Fashina',
      tenantCode: 'UH-TENANT-FASHOLA-7',
      unit: 'Flat 7',
      propertyId: 'fashola-unit-7',
      propertyName: 'Fashola Surulere Suite A',
      landlordId: 'UH-LANDLORD-FASHOLA',
      landlordName: 'Mrs Adunola Fashola',
      complaint_category: 'Property Maintenance or Repairs',
      category: 'Property Maintenance or Repairs',
      routingPath: 'path_1_self_managed',
      primaryRecipientRole: 'Landlord',
      primaryRecipientName: 'Mrs Adunola Fashola',
      adminOversight: true,
      isPMCManaged: false,
      urgency: 'High',
      text: 'Borehole pump controller box tripped overnight, resulting in no running water for Flat 7.',
      date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
      status: 'Open',
      is_escalation_eligible: true,
      isDemoData: true
    },
    {
      id: 'complaint-demo-path-2',
      tenant: 'Magaji Tenant 1',
      tenantCode: 'UH-TENANT-MAGAJI-1',
      unit: 'Flat 1',
      propertyId: 'magaji-unit-1',
      propertyName: 'Magaji Gbagada Flat',
      landlordId: 'UH-LANDLORD-MAGAJI',
      landlordName: 'Alhaji Sule Magaji',
      managementCompanyId: 'Lagos Realty Partners',
      complaint_category: 'Service Charges',
      category: 'Service Charges',
      routingPath: 'path_2_pmc_managed',
      primaryRecipientRole: 'PMC',
      primaryRecipientName: 'Lagos Realty Partners',
      secondaryRecipientRole: 'Landlord',
      secondaryRecipientName: 'Alhaji Sule Magaji',
      adminOversight: true,
      isPMCManaged: true,
      urgency: 'Normal',
      text: 'Requested itemized receipts for the Q2 security levy and generator diesel levy.',
      date: '2026-07-18',
      status: 'Responded',
      pmcResponse: 'PMC Lagos Realty Partners audited the service charge breakdown, confirmed all diesel purchase receipts match generator runtime logs, and issued an updated itemized ledger reconciliation to tenant.',
      pmcActionTaken: 'Audited service charge breakdown and issued itemized ledger reconciliation',
      pmcRespondedAt: '2026-07-20T11:30:00Z',
      isDemoData: true
    },
    {
      id: 'complaint-demo-path-3',
      tenant: 'Yemi Alade',
      tenantCode: 'UH-TENANT-FASHOLA-8',
      unit: 'Flat 8',
      propertyId: 'fashola-unit-8',
      propertyName: 'Fashola Yaba Villa A',
      landlordId: 'UH-LANDLORD-FASHOLA',
      landlordName: 'Mrs Adunola Fashola',
      complaint_category: 'Landlord Conduct or Behaviour',
      category: 'Landlord Conduct or Behaviour',
      routingPath: 'path_3_landlord_conduct',
      primaryRecipientRole: 'Admin',
      primaryRecipientName: 'Unity Homes Admin',
      adminOversight: false,
      isPMCManaged: false,
      urgency: 'Urgent',
      text: 'Unannounced late night inspection visits without prior 24-hour notice.',
      date: '2026-07-21',
      status: 'Open',
      isDemoData: true
    },
    {
      id: 'complaint-demo-path-4',
      tenant: 'Aminu Kano',
      tenantCode: 'UH-TENANT-MAGAJI-3',
      unit: 'Flat 3',
      propertyId: 'magaji-unit-3',
      propertyName: 'Magaji Surulere Duplex',
      landlordId: 'UH-LANDLORD-MAGAJI',
      landlordName: 'Alhaji Sule Magaji',
      managementCompanyId: 'Lagos Realty Partners',
      complaint_category: 'Property Management Company Conduct',
      category: 'Property Management Company Conduct',
      routingPath: 'path_4_pmc_conduct',
      primaryRecipientRole: 'Admin',
      primaryRecipientName: 'Unity Homes Admin',
      secondaryRecipientRole: 'Landlord',
      secondaryRecipientName: 'Alhaji Sule Magaji',
      adminOversight: false,
      isPMCManaged: true,
      urgency: 'High',
      text: 'PMC site supervisor was non-responsive during maintenance escalation and delayed repairs.',
      date: '2026-07-21',
      status: 'Open',
      isDemoData: true
    },
    {
      id: 'complaint-demo-path-5',
      tenant: 'Sani Bello',
      tenantCode: 'UH-TENANT-MAGAJI-4',
      unit: 'Flat 4',
      propertyId: 'magaji-unit-4',
      propertyName: 'Magaji Mainland Court',
      landlordId: 'UH-LANDLORD-MAGAJI',
      landlordName: 'Alhaji Sule Magaji',
      complaint_category: 'Something Else',
      category: 'Something Else',
      routingPath: 'path_5_something_else',
      primaryRecipientRole: 'Admin',
      primaryRecipientName: 'Unity Homes Admin',
      adminOversight: false,
      isPMCManaged: false,
      urgency: 'Normal',
      text: 'Inquiry regarding estate perimeter fence security upgrade and access token protocols.',
      date: '2026-07-22',
      status: 'Open',
      isDemoData: true
    }
  ];
  saveRawList(STORAGE_KEYS.complaints, [...demoComplaints, ...cleanComplaints]);

  // 6b. SEED CAUTION DEPOSIT RESOLUTIONS
  const cleanCautionResolutions = getRawList<any>(STORAGE_KEYS.cautionDepositResolutions, []).filter((r: any) => !r.isDemoData);
  const demoCautionDepositResolutions = [
    {
      id: 'cd-res-1',
      bookingId: 'book-adeyemi-1b',
      managerId: 'kehinde-mgr',
      managerName: 'Kehinde Olorunfemi',
      landlordId: 'landlord-adeyemi',
      landlordName: 'Dr Adeyemi',
      propertyName: 'Lekki Phase 1 apartment A',
      unitNumber: 'Suite A',
      guestName: 'Emeka Okafor',
      checkInDate: '2026-07-15',
      checkOutDate: '2026-07-18',
      depositAmount: 30000,
      checkoutCondition: 'No Damage Observed',
      depositDecision: 'Full Deposit Returned to Guest',
      amountRetained: 0,
      amountReturned: 30000,
      status: 'landlord_acknowledged',
      submittedAt: '2026-07-18T10:00:00Z',
      isDemoData: true
    },
    {
      id: 'cd-res-2',
      bookingId: 'book-nwosu-1a',
      managerId: 'kehinde-mgr',
      managerName: 'Kehinde Olorunfemi',
      landlordId: 'landlord-nwosu',
      landlordName: 'Mrs Nwosu',
      propertyName: 'Ikoyi Studio',
      unitNumber: 'Studio 1',
      guestName: 'Babatunde Johnson',
      checkInDate: '2026-07-12',
      checkOutDate: '2026-07-16',
      depositAmount: 25000,
      checkoutCondition: 'Minor Damage Found',
      damageDescription: 'Bathroom mirror cracked, shower curtain torn.',
      damagePhotos: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600',
        'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600'
      ],
      estimatedRepairCost: 18000,
      depositDecision: 'Partial Deposit Returned',
      amountRetained: 18000,
      amountReturned: 7000,
      retentionJustification: 'Replacement mirror installation and heavy duty shower curtain replacement costs.',
      status: 'submitted',
      submittedAt: '2026-07-16T11:30:00Z',
      isDemoData: true
    },
    {
      id: 'cd-res-3',
      bookingId: 'book-adeyemi-2a',
      managerId: 'kehinde-mgr',
      managerName: 'Kehinde Olorunfemi',
      landlordId: 'landlord-adeyemi',
      landlordName: 'Dr Adeyemi',
      propertyName: 'Lekki Phase 1 apartment B',
      unitNumber: 'Suite B',
      guestName: 'Chidi Okonkwo',
      checkInDate: '2026-07-08',
      checkOutDate: '2026-07-13',
      depositAmount: 30000,
      checkoutCondition: 'Significant Damage Found',
      damageDescription: 'Leather sofa upholstery burned and dining table scratched severely.',
      damagePhotos: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'
      ],
      estimatedRepairCost: 45000,
      depositDecision: 'Full Deposit Retained',
      amountRetained: 30000,
      amountReturned: 0,
      retentionJustification: 'Full deposit retained as estimated repair cost exceeds total deposit collected.',
      status: 'disputed',
      disputeReason: 'Landlord queried whether sofa burn was pre-existing and if damage justifies full retention without formal vendor repair receipts.',
      submittedAt: '2026-07-13T14:00:00Z',
      disputedAt: '2026-07-14T09:00:00Z',
      isDemoData: true
    }
  ];
  saveRawList(STORAGE_KEYS.cautionDepositResolutions, [...demoCautionDepositResolutions, ...cleanCautionResolutions]);

  // 7. SEED MAINTENANCE
  const demoMaintenance: MaintenanceJob[] = [
    {
      id: 'maintenance-lrp-1',
      property: 'Magaji Gbagada Flat',
      issue: 'Water pump system inspection and replacement of sand filter elements.',
      priority: 'High',
      status: 'Open',
      isDemoData: true
    }
  ];
  saveRawList(STORAGE_KEYS.maintenance, [...demoMaintenance, ...cleanMaintenance]);

  // 8. SEED DOCUMENTS
  const demoDocuments: PlatformDocument[] = [
    {
      id: 'doc-lrp-1',
      title: 'LRP Lease Agreement Magaji Gbagada Flat',
      fileName: 'LRP_Agreement_Gbagada_Flat_1.pdf',
      category: 'Tenancy Agreement',
      dateCreated: '2026-05-01',
      isDemoData: true
    },
    {
      id: 'doc-fashola-1',
      title: 'Fashola Surulere Flat A Tenancy Deed',
      fileName: 'Fashola_Tenancy_Deed_FlatA.pdf',
      category: 'Tenancy Agreement',
      dateCreated: '2026-06-01',
      isDemoData: true
    }
  ];
  saveRawList(STORAGE_KEYS.documents, [...demoDocuments, ...cleanDocuments]);

  // 9. SEED NOTIFICATIONS
  const demoNotifications: UnifiedNotification[] = [
    {
      id: 'notif-lrp-1',
      type: 'promise_created',
      message: 'Demo: Tenant Aminu Kano registered upcoming Promise to Pay (₦480,000) due on July 15, 2026.',
      relatedRecordId: 'promise-magaji-upcoming',
      read: false,
      timestamp: new Date().toISOString(),
      role: 'PMC',
      targetId: 'Lagos Realty Partners',
      isDemoData: true
    } as any,
    {
      id: 'notif-fashola-1',
      type: 'promise_created',
      message: 'Demo: Tenant Kunle Fashina has rent overdue by 34 days. Please review logged WhatsApp reminders.',
      relatedRecordId: 'log-5',
      read: false,
      timestamp: new Date().toISOString(),
      role: 'Landlord',
      targetId: 'UH-LANDLORD-FASHOLA',
      isDemoData: true
    } as any
  ];
  saveRawList(STORAGE_KEYS.notifications, [...demoNotifications, ...cleanNotifications]);

  // Seed Kehinde Olorunfemi pending rent payment
  const demoRentPayments: RentPayment[] = [
    {
      id: 'rent-kehinde-q3',
      tenantId: 'UH-KEHINDE-OLORUN',
      tenantName: 'Kehinde Olorunfemi',
      tenantEmail: 'kehinde.olorunfemi@gmail.com',
      propertyName: 'Plot 22, Fola Osibo Road, Lekki Phase 1, Lagos',
      unitNumber: 'Suite A',
      amount: 1200000,
      dueDate: '2026-07-31',
      status: 'pending_confirmation',
      receivingBankName: 'Guaranty Trust Bank (GTB)',
      receivingAccountName: 'Funmi Adebayo Verified Account',
      receivingAccountNumber: '1022938485',
      ref: 'TX-RENT-KEHINDE-11',
      isDemoData: true,
      landlordName: 'Mrs Funmi Adebayo'
    }
  ];
  saveRawList(STORAGE_KEYS.rentPayments, [...demoRentPayments]);

  // --- PROGRAMMATIC ENHANCEMENT FOR PROMPT FIVE ---

  // 10. GENERATE 8+ ACTIVITY LOGS FOR EVERY SINGLE SEEDED RECORD SPREAD OVER 60 DAYS
  const extraLogs: any[] = [];
  
  const getDateDaysAgo = (days: number, hour: number = 10) => {
    const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString().replace('T', ' ').substring(0, 16);
  };

  const unitEventTemplates = [
    { type: 'PROPERTY_ADDED', details: 'Property registered and verified in portfolio.' },
    { type: 'KYC_VERIFICATION', details: 'Tenant KYC screening passed.' },
    { type: 'CONTRACT_SIGNED', details: 'Digital lease agreement executed.' },
    { type: 'TENANT_ONBOARDED', details: 'Tenant checked-in and key-token hand-over logged.' },
    { type: 'METER_INITIALIZED', details: 'IoT electricity & water meters initialized.' },
    { type: 'RENT_CONFIRMED', details: 'Rent transaction verified.' },
    { type: 'COMPLIANCE_PASSED', details: 'Property structural safety certificate filed.' },
    { type: 'AUDIT_COMPLETE', details: 'Routine administrative compliance check completed.' }
  ];

  // For every single demo tenant/unit record:
  demoUnits.forEach((unit) => {
    const dayOffsets = [59, 52, 45, 38, 30, 22, 14, 2];
    dayOffsets.forEach((days, idx) => {
      const template = unitEventTemplates[idx];
      extraLogs.push({
        id: `TXN-${unit.id}-${idx + 1}-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: getDateDaysAgo(days, 9 + idx),
        actorName: (unit as any).landlordName || 'System Auditor',
        actorRole: 'Landlord',
        actionType: template.type,
        recordAffected: `Property Unit: ${unit.propertyName}`,
        recordId: unit.id, // matches property/tenant ID exactly!
        previousValue: idx === 0 ? 'None' : 'Pending',
        newValue: 'Certified',
        details: `${template.details} Unit: ${unit.unitNumber || 'A'}, Property: ${unit.propertyName}.`,
        isDemoData: true
      });
    });
  });

  // For payment 'rent-kehinde-q3' (8 lifecycle logs)
  // DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds.
  const rentKehindeLogsTemplates = [
    { type: 'PAYMENT_INITIALIZED', details: 'Tenant Kehinde Olorunfemi triggered rent payment.' },
    { type: 'GATEWAY_PENDING', details: 'Transaction routed through verified bank gateway.' },
    { type: 'RETRY_ATTEMPT', details: 'Payment retry registered on GTBank portal.' },
    { type: 'BANK_QUERY_FILED', details: 'Query dispatched to verify payment confirmation status.' },
    { type: 'COMPLIANCE_HOLD', details: 'Temporary hold applied pending check verification.' },
    { type: 'DOCUMENT_UPLOADED', details: 'Tenant uploaded Zenith transfer slip proof.' },
    { type: 'AWAITING_ADMIN_CLEARANCE', details: 'Status set to pending_confirmation. Awaiting Admin manual vetting.' },
    { type: 'CERTIFICATE_PENDING', details: 'Receipt certified ledger entry prepared.' }
  ];

  const paymentOffsets = [15, 13, 11, 9, 7, 5, 3, 1];
  paymentOffsets.forEach((days, idx) => {
    const template = rentKehindeLogsTemplates[idx];
    extraLogs.push({
      id: `TXN-RENT-KEHINDE-${idx + 1}`,
      timestamp: getDateDaysAgo(days, 8 + idx),
      actorName: 'Kehinde Olorunfemi',
      actorRole: 'Tenant',
      actionType: template.type,
      recordAffected: 'Rent Payment - Plot 22, Fola Osibo Road, Lekki Phase 1',
      recordId: 'rent-kehinde-q3', // matches payment record!
      previousValue: idx === 0 ? 'None' : 'Pending',
      newValue: 'pending_confirmation',
      details: template.details,
      isDemoData: true
    });
  });

  // For service charge 'sc-kehinde-diesel' (8 lifecycle logs)
  const scKehindeLogsTemplates = [
    { type: 'SC_BILL_GENERATED', details: 'Generator Diesel bill (₦35,000) successfully dispatched to Kehinde Olorunfemi.' },
    { type: 'NOTIF_DISPATCHED', details: 'Service charge bill notification delivered.' },
    { type: 'TENANT_REVIEWED', details: 'Tenant viewed service charge breakdown.' },
    { type: 'PAYMENT_SUBMITTED', details: 'Tenant processed transfer to Lagos Realty Partners Zenith Bank account.' },
    { type: 'LEDGER_PENDING', details: 'Deposit identified by automated ledger gateway.' },
    { type: 'PROOF_OF_PAYMENT', details: 'Tenant submitted bank transaction receipt proof.' },
    { type: 'PMC_QUEUE_ADDED', details: 'Payment entered Lagos Realty Partners review pipeline.' },
    { type: 'AWAITING_VERIFICATION', details: 'Status set to pending_verification. Awaiting PMC approval.' }
  ];

  paymentOffsets.forEach((days, idx) => {
    const template = scKehindeLogsTemplates[idx];
    extraLogs.push({
      id: `TXN-SC-KEHINDE-${idx + 1}`,
      timestamp: getDateDaysAgo(days, 10 + idx),
      actorName: 'Kehinde Olorunfemi',
      actorRole: 'Tenant',
      actionType: template.type,
      recordAffected: 'Service Charge - Plot 22, Fola Osibo", Lekki',
      recordId: 'sc-kehinde-diesel', // matches payment record!
      previousValue: idx === 0 ? 'None' : 'Pending',
      newValue: 'pending_verification',
      details: template.details,
      isDemoData: true
    });
  });

  saveRawList(STORAGE_KEYS.logs, [...extraLogs, ...demoLogs, ...cleanLogs]);

  // 11. SEED BUILDINGS (Mrs Adunola Fashola gets exactly 8 buildings in the database)
  const cleanBuildings = getRawList<any>(STORAGE_KEYS.buildings, []).filter(b => !b.isDemoData);
  const fasholaBuildings: any[] = [];
  fasholaProperties.forEach((p, idx) => {
    fasholaBuildings.push({
      id: `bld-fashola-${idx + 1}`,
      name: p.name,
      blockLabel: `Flat ${idx + 1}`,
      address: p.name.includes('Surulere') ? 'Surulere, Lagos' : 'Yaba, Lagos',
      coverPhoto: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      landlordCode: 'UH-LANDLORD-FASHOLA',
      isDemoData: true
    });
  });
  saveRawList(STORAGE_KEYS.buildings, [...fasholaBuildings, ...cleanBuildings]);

  // 12. SEED MANAGEMENT COMPANY PROPERTIES
  const cleanMcp = getRawList<any>(STORAGE_KEYS.managementCompanyProperties, []).filter(m => !m.isDemoData);
  const lrpMcp: any[] = [];
  
  // Seed Chief Emeka Obiora's 3 properties managed by Lagos Realty Partners (12% management fee)
  const obioraManaged = [
    'Obiora Ikeja GRA Villa',
    'Obiora Ikeja Penthouse',
    'Obiora Magodo Terrace'
  ];
  obioraManaged.forEach((name, idx) => {
    lrpMcp.push({
      id: `mcp-lrp-obiora-${idx + 1}`,
      buildingId: `bld-lrp-obiora-${idx + 1}`,
      propertyName: name,
      company_id: 'Lagos Realty Partners',
      is_active: true,
      management_fee_percentage: 12,
      isDemoData: true
    });
  });

  // Seed Alhaji Sule Magaji's 4 properties managed by Lagos Realty Partners (15% management fee)
  const magajiManaged = [
    'Magaji Gbagada Flat',
    'Magaji Yaba Penthouse',
    'Magaji Surulere Duplex',
    'Magaji Mainland Court'
  ];
  magajiManaged.forEach((name, idx) => {
    lrpMcp.push({
      id: `mcp-lrp-magaji-${idx + 1}`,
      buildingId: `bld-magaji`,
      propertyName: name,
      company_id: 'Lagos Realty Partners',
      is_active: true,
      management_fee_percentage: 15,
      isDemoData: true
    });
  });

  // Seed 11 dummy properties (blocks 1-8 have 10% fee; blocks 9-11 have undefined/missing fee to trigger compliance)
  for (let i = 1; i <= 11; i++) {
    lrpMcp.push({
      id: `mcp-lrp-dummy-${i}`,
      buildingId: `bld-lrp-dummy-${i}`,
      propertyName: `Lagos Realty Plaza Block ${i}`,
      company_id: 'Lagos Realty Partners',
      is_active: true,
      management_fee_percentage: i <= 8 ? 10 : undefined,
      isDemoData: true
    });
  }
  saveRawList(STORAGE_KEYS.managementCompanyProperties, [...lrpMcp, ...cleanMcp]);

  // 13. SEED SUBSCRIPTIONS (Mrs Fashola is exactly at 80% capacity (8/10), Lagos Realty Partners is at limit (11/10))
  const cleanSubscriptions = getRawList<any>(STORAGE_KEYS.subscriptions, []).filter(s => !s.isDemoData);
  const demoSubscriptions = [
    { id: 'sub-funmi', entityId: 'UH-LANDLORD-FUNMI', name: 'Mrs Funmi Adebayo', type: 'Landlord', subscription: 'Landlord Growth Profile Pack', property_limit: 30, isDemoData: true },
    { id: 'sub-osei', entityId: 'UH-LANDLORD-OSEI', name: 'Mr Babatunde Osei', type: 'Landlord', subscription: 'Landlord Growth Profile Pack', property_limit: 30, isDemoData: true },
    { id: 'sub-prime', entityId: 'Prime Property Solutions', name: 'Prime Property Solutions', type: 'PMC', subscription: 'PMC Professional Suite', property_limit: 100, isDemoData: true },
    { id: 'sub-lrp', entityId: 'Lagos Realty Partners', name: 'Lagos Realty Partners', type: 'PMC', subscription: 'Starter Suite', property_limit: 10, original_limit: 10, isDemoData: true },
    { id: 'sub-fashola', entityId: 'UH-LANDLORD-FASHOLA', name: 'Mrs Adunola Fashola', type: 'Landlord', subscription: 'Basic Landlord Pack', property_limit: 10, original_limit: 10, isDemoData: true }
  ];
  saveRawList(STORAGE_KEYS.subscriptions, [...demoSubscriptions, ...cleanSubscriptions]);

  // 14. SEED SUPPORT TICKETS
  const cleanSupportTickets = getRawList<any>(STORAGE_KEYS.supportTickets, []).filter(s => !s.isDemoData);
  const demoSupportTickets = [
    {
      id: 'UH-SUP-0001',
      refNumber: 'UH-SUP-0001',
      userId: 'UH-LANDLORD-FASHOLA',
      userName: 'Mrs Adunola Fashola',
      userRole: 'Landlord',
      userEmail: 'adunola.fashola@property.com',
      category: 'Technical Problem or Bug',
      description: 'The payment history page shows a loading error on my Surulere properties',
      affectedPageOrFeature: 'Payment History Page',
      contactPreference: 'In-App Response',
      priority: 'Urgent',
      status: 'In Progress',
      createdAt: '2026-07-20T10:15:00Z',
      updatedAt: '2026-07-20T11:00:00Z',
      firstAdminResponseAt: '2026-07-20T11:00:00Z',
      messages: [
        {
          id: 'msg-sup-1-1',
          senderName: 'Mrs Adunola Fashola',
          senderRole: 'Landlord',
          senderEmail: 'adunola.fashola@property.com',
          message: 'The payment history page shows a loading error on my Surulere properties',
          timestamp: '2026-07-20T10:15:00Z'
        },
        {
          id: 'msg-sup-1-2',
          senderName: 'Unity Homes Support',
          senderRole: 'Admin',
          senderEmail: 'admin@unityhomes.com',
          message: 'We are looking into this and will update you within 2 hours',
          timestamp: '2026-07-20T11:00:00Z'
        }
      ],
      isDemoData: true
    },
    {
      id: 'UH-SUP-0002',
      refNumber: 'UH-SUP-0002',
      userId: 'Lagos Realty Partners',
      userName: 'Lagos Realty Partners',
      userRole: 'PMC',
      userEmail: 'support@lagosrealty.com',
      category: 'Billing and Subscription',
      description: 'I need to understand how the management fee percentage affects our monthly invoice',
      contactPreference: 'Email Response',
      priority: 'Normal',
      status: 'New',
      createdAt: '2026-07-21T09:30:00Z',
      updatedAt: '2026-07-21T09:30:00Z',
      messages: [
        {
          id: 'msg-sup-2-1',
          senderName: 'Lagos Realty Partners',
          senderRole: 'PMC',
          senderEmail: 'support@lagosrealty.com',
          message: 'I need to understand how the management fee percentage affects our monthly invoice',
          timestamp: '2026-07-21T09:30:00Z'
        }
      ],
      isDemoData: true
    },
    {
      id: 'UH-SUP-0003',
      refNumber: 'UH-SUP-0003',
      userId: 'james-okonkwo-mgr',
      userName: 'James Okonkwo',
      userRole: 'Shortlet Manager',
      userEmail: 'james.okonkwo@shortlet.com',
      category: 'Feature Question',
      description: "Can I add a second bank account for a different landlord's remittances",
      contactPreference: 'In-App Response',
      priority: 'Low',
      status: 'Resolved',
      createdAt: '2026-07-18T14:20:00Z',
      updatedAt: '2026-07-18T15:00:00Z',
      firstAdminResponseAt: '2026-07-18T15:00:00Z',
      resolutionNote: "Each landlord's remittance uses their own verified collection account. You do not need a separate account",
      messages: [
        {
          id: 'msg-sup-3-1',
          senderName: 'James Okonkwo',
          senderRole: 'Shortlet Manager',
          senderEmail: 'james.okonkwo@shortlet.com',
          message: "Can I add a second bank account for a different landlord's remittances",
          timestamp: '2026-07-18T14:20:00Z'
        },
        {
          id: 'msg-sup-3-2',
          senderName: 'Unity Homes Support',
          senderRole: 'Admin',
          senderEmail: 'admin@unityhomes.com',
          message: "Each landlord's remittance uses their own verified collection account. You do not need a separate account",
          timestamp: '2026-07-18T15:00:00Z'
        }
      ],
      isDemoData: true
    },
    {
      id: 'UH-SUP-0004',
      refNumber: 'UH-SUP-0004',
      userId: 'UH-TENANT-MAGAJI-3',
      userName: 'Demo Tenant',
      userRole: 'Tenant',
      userEmail: 'tenant@unityhomes.com',
      category: 'Account and Login Issues',
      description: 'I cannot see my lease document in the vault even though my landlord says it was uploaded',
      contactPreference: 'In-App Response',
      priority: 'Normal',
      status: 'Awaiting User Response',
      createdAt: '2026-07-21T16:45:00Z',
      updatedAt: '2026-07-21T17:30:00Z',
      firstAdminResponseAt: '2026-07-21T17:30:00Z',
      messages: [
        {
          id: 'msg-sup-4-1',
          senderName: 'Demo Tenant',
          senderRole: 'Tenant',
          senderEmail: 'tenant@unityhomes.com',
          message: 'I cannot see my lease document in the vault even though my landlord says it was uploaded',
          timestamp: '2026-07-21T16:45:00Z'
        },
        {
          id: 'msg-sup-4-2',
          senderName: 'Unity Homes Support',
          senderRole: 'Admin',
          senderEmail: 'admin@unityhomes.com',
          message: 'Can you tell us which document name you are looking for',
          timestamp: '2026-07-21T17:30:00Z'
        }
      ],
      isDemoData: true
    }
  ];
  saveRawList(STORAGE_KEYS.supportTickets, [...demoSupportTickets, ...cleanSupportTickets]);

  // Trigger reactive updates across all localStorage key listeners in other files
  Object.keys(STORAGE_KEYS).forEach(k => {
    const key = STORAGE_KEYS[k as keyof typeof STORAGE_KEYS];
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: localStorage.getItem(key)
    }));
  });
}

export function removeDemoDataset() {
  // Clear out isDemoData from all collections
  Object.keys(STORAGE_KEYS).forEach(k => {
    const key = STORAGE_KEYS[k as keyof typeof STORAGE_KEYS];
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Keep only non-demo records, or restore default seeds if empty and we want fallback
          let filtered = parsed.filter(item => !item.isDemoData);
          
          if (filtered.length === 0) {
            if (key === STORAGE_KEYS.tenants) filtered = initialLandlordUnits;
            if (key === STORAGE_KEYS.bookings) filtered = initialBookingLogs;
            if (key === STORAGE_KEYS.charges) filtered = initialServiceCharges;
            if (key === STORAGE_KEYS.buildings) filtered = initialBuildings;
            if (key === STORAGE_KEYS.subscriptions) {
              filtered = [
                { id: 'sub-funmi', entityId: 'UH-LANDLORD-FUNMI', name: 'Mrs Funmi Adebayo', type: 'Landlord', subscription: 'Landlord Growth Profile Pack', property_limit: 30 },
                { id: 'sub-osei', entityId: 'UH-LANDLORD-OSEI', name: 'Mr Babatunde Osei', type: 'Landlord', subscription: 'Landlord Growth Profile Pack', property_limit: 30 },
                { id: 'sub-prime', entityId: 'Prime Property Solutions', name: 'Prime Property Solutions', type: 'PMC', subscription: 'PMC Professional Suite', property_limit: 100 },
                { id: 'sub-lrp', entityId: 'Lagos Realty Partners', name: 'Lagos Realty Partners', type: 'PMC', subscription: 'Starter Suite', property_limit: 10, original_limit: 10 }
              ];
            }
            if (key === STORAGE_KEYS.managementCompanyProperties) {
              const initialMcp: any[] = [];
              initialBuildings.forEach(b => {
                let company_id = '';
                if (b.landlordCode === 'UH-LANDLORD-OSEI') {
                  company_id = 'Prime Property Solutions';
                } else if (b.landlordCode === 'UH-LANDLORD-MUSA') {
                  company_id = 'Lagos Realty Partners';
                }
                if (company_id) {
                  initialMcp.push({
                    id: `mcp-${b.id}`,
                    buildingId: b.id,
                    propertyName: b.name,
                    company_id: company_id,
                    is_active: true
                  });
                }
              });
              const lrpCount = initialMcp.filter(m => m.company_id === 'Lagos Realty Partners').length;
              if (lrpCount < 11) {
                for (let i = lrpCount + 1; i <= 11; i++) {
                  initialMcp.push({
                    id: `mcp-lrp-dummy-${i}`,
                    buildingId: `bld-lrp-dummy-${i}`,
                    propertyName: `Lagos Realty Plaza Block ${i}`,
                    company_id: 'Lagos Realty Partners',
                    is_active: true
                  });
                }
              }
              filtered = initialMcp;
            }
          }
          
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      } catch (e) {
        console.error(e);
      }
    }
  });

  // Trigger reactive updates
  Object.keys(STORAGE_KEYS).forEach(k => {
    const key = STORAGE_KEYS[k as keyof typeof STORAGE_KEYS];
    window.dispatchEvent(new StorageEvent('storage', {
      key: key,
      newValue: localStorage.getItem(key)
    }));
  });
}
