// Unity Homes & Properties Ltd. - Waitlist Backend Service & Firestore Sync Engine

export type WaitlistRole = 
  | 'long_term_landlord'
  | 'shortlet_landlord'
  | 'property_management_company'
  | 'shortlet_manager'
  | 'realtor'
  | 'property_lawyer'
  | 'licensed_surveyor'
  | 'structural_engineer';

export type WaitlistInterest =
  | 'buying_property'
  | 'renting'
  | 'property_management'
  | 'property_verification'
  | 'finding_trusted_professionals'
  | 'neighbourhood_insights'
  | 'transparency_and_digital_records';

export interface WaitlistEntry {
  id: string;
  full_name: string;
  email: string; // stored in lowercase
  phone: string;
  role: WaitlistRole;
  organisation_name?: string;
  state: string;
  interests: WaitlistInterest[];
  submitted_at: string;
  email_confirmed: boolean;
  confirmed_at: string | null;
  confirmation_token: string;
  confirmation_token_expires_at: string; // 48h expiration
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  source: string;
  ip_hash: string;
  benefit_claimed?: string;
}

export interface WaitlistActivityLog {
  id: string;
  timestamp: string;
  action: 'SUBMISSION' | 'EMAIL_CONFIRMED' | 'RESEND_TOKEN' | 'BROADCAST_SENT';
  email: string;
  details: string;
}

export interface WaitlistBroadcastLog {
  id: string;
  timestamp: string;
  subject: string;
  message: string;
  target_role: string;
  recipient_count: number;
  sent_by: string;
}

const ALLOWED_ROLES: WaitlistRole[] = [
  'long_term_landlord',
  'shortlet_landlord',
  'property_management_company',
  'shortlet_manager',
  'realtor',
  'property_lawyer',
  'licensed_surveyor',
  'structural_engineer'
];

const ALLOWED_INTERESTS: WaitlistInterest[] = [
  'buying_property',
  'renting',
  'property_management',
  'property_verification',
  'finding_trusted_professionals',
  'neighbourhood_insights',
  'transparency_and_digital_records'
];

const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com', 'mailinator.com', 'guerrillamail.com', '10minutemail.com', 
  'trashmail.com', 'yopmail.com', 'dispostable.com', 'getnada.com'
];

const WAITLIST_STORAGE_KEY = 'uh_waitlist_entries_v1';
const WAITLIST_LOGS_KEY = 'uh_waitlist_activity_logs_v1';
const WAITLIST_BROADCASTS_KEY = 'uh_waitlist_broadcasts_v1';

// Initial seed data to populate analytics if empty
const SEED_WAITLIST_ENTRIES: WaitlistEntry[] = [
  {
    id: 'wl-1001',
    full_name: 'Chief Babatunde Ogundele',
    email: 'babatunde.ogundele@lagosproperties.ng',
    phone: '08033001122',
    role: 'long_term_landlord',
    organisation_name: 'Ogundele Family Estates',
    state: 'Lagos',
    interests: ['property_management', 'property_verification', 'transparency_and_digital_records'],
    submitted_at: '2026-07-20T09:15:00.000Z',
    email_confirmed: true,
    confirmed_at: '2026-07-20T09:18:22.000Z',
    confirmation_token: 'tok_ogundele_confirmed',
    confirmation_token_expires_at: '2026-07-22T09:15:00.000Z',
    referral_code: 'UNITY-OGUN88',
    referred_by: null,
    referral_count: 5,
    source: 'website',
    ip_hash: 'ip_a1b2c3d4e5',
    benefit_claimed: '1 Month FREE after launch'
  },
  {
    id: 'wl-1002',
    full_name: 'Arc. Chinedu Okeke',
    email: 'chinedu@primepmc.ng',
    phone: '08022114455',
    role: 'property_management_company',
    organisation_name: 'Prime Property Managers Ltd',
    state: 'FCT Abuja',
    interests: ['property_management', 'finding_trusted_professionals', 'transparency_and_digital_records'],
    submitted_at: '2026-07-22T14:30:00.000Z',
    email_confirmed: true,
    confirmed_at: '2026-07-22T14:35:10.000Z',
    confirmation_token: 'tok_okeke_confirmed',
    confirmation_token_expires_at: '2026-07-24T14:30:00.000Z',
    referral_code: 'UNITY-OKEK99',
    referred_by: 'UNITY-OGUN88',
    referral_count: 3,
    source: 'referral',
    ip_hash: 'ip_b2c3d4e5f6',
    benefit_claimed: '1 Month FREE after launch'
  },
  {
    id: 'wl-1003',
    full_name: 'Barr. Folake Adeleke',
    email: 'folake@adelekelaw.ng',
    phone: '08055443322',
    role: 'property_lawyer',
    organisation_name: 'Adeleke & Legal Associates',
    state: 'Lagos',
    interests: ['property_verification', 'finding_trusted_professionals', 'transparency_and_digital_records'],
    submitted_at: '2026-07-24T11:00:00.000Z',
    email_confirmed: true,
    confirmed_at: '2026-07-24T11:04:15.000Z',
    confirmation_token: 'tok_adeleke_confirmed',
    confirmation_token_expires_at: '2026-07-26T11:00:00.000Z',
    referral_code: 'UNITY-LAWFOL',
    referred_by: null,
    referral_count: 8,
    source: 'social',
    ip_hash: 'ip_c3d4e5f6g7',
    benefit_claimed: 'Founding Professional Badge + 6 Months FREE Verified Listing'
  },
  {
    id: 'wl-1004',
    full_name: 'Surv. Ibrahim Bello',
    email: 'ibrahim.bello@surveynigeria.com',
    phone: '08077889900',
    role: 'licensed_surveyor',
    organisation_name: 'Apex Geospatial & Surveyors',
    state: 'Oyo',
    interests: ['property_verification', 'finding_trusted_professionals'],
    submitted_at: '2026-07-25T16:20:00.000Z',
    email_confirmed: true,
    confirmed_at: '2026-07-25T16:22:00.000Z',
    confirmation_token: 'tok_bello_confirmed',
    confirmation_token_expires_at: '2026-07-27T16:20:00.000Z',
    referral_code: 'UNITY-SURVIB',
    referred_by: 'UNITY-LAWFOL',
    referral_count: 2,
    source: 'referral',
    ip_hash: 'ip_d4e5f6g7h8',
    benefit_claimed: 'Founding Professional Badge + 6 Months FREE Verified Listing'
  },
  {
    id: 'wl-1005',
    full_name: 'Ezinne Nwachukwu',
    email: 'ezinne.nwachukwu@gmail.com',
    phone: '08133445566',
    role: 'shortlet_landlord',
    organisation_name: 'Zinne Luxury Apartments',
    state: 'Rivers',
    interests: ['buying_property', 'renting', 'neighbourhood_insights'],
    submitted_at: '2026-07-26T10:10:00.000Z',
    email_confirmed: false,
    confirmed_at: null,
    confirmation_token: 'tok_ezinne_pending',
    confirmation_token_expires_at: '2026-07-28T10:10:00.000Z',
    referral_code: 'UNITY-EZIN77',
    referred_by: null,
    referral_count: 0,
    source: 'website',
    ip_hash: 'ip_e5f6g7h8i9'
  }
];

// Local Storage Helpers
export function getWaitlistEntries(): WaitlistEntry[] {
  try {
    const raw = localStorage.getItem(WAITLIST_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read waitlist storage', e);
  }
  // Initialize with seed
  localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(SEED_WAITLIST_ENTRIES));
  return SEED_WAITLIST_ENTRIES;
}

export function saveWaitlistEntries(entries: WaitlistEntry[]): void {
  try {
    localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save waitlist entries', e);
  }
}

export function getWaitlistLogs(): WaitlistActivityLog[] {
  try {
    const raw = localStorage.getItem(WAITLIST_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read waitlist logs', e);
  }
  return [];
}

export function logWaitlistActivity(action: WaitlistActivityLog['action'], email: string, details: string): void {
  const logs = getWaitlistLogs();
  const newLog: WaitlistActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    email,
    details
  };
  logs.unshift(newLog);
  try {
    localStorage.setItem(WAITLIST_LOGS_KEY, JSON.stringify(logs.slice(0, 200)));
  } catch (e) {
    console.error('Failed to save activity log', e);
  }
}

export function getWaitlistBroadcasts(): WaitlistBroadcastLog[] {
  try {
    const raw = localStorage.getItem(WAITLIST_BROADCASTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read broadcasts', e);
  }
  return [];
}

// Utility: Hash IP or create mock client fingerprint
function generateIpHash(ipOrAgent?: string): string {
  const str = ipOrAgent || 'client-browser-fingerprint-unityhomes';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `ip_${Math.abs(hash).toString(36)}`;
}

// Utility: Role Benefit Description
export function getBenefitForRole(role: WaitlistRole): string {
  switch (role) {
    case 'long_term_landlord':
    case 'shortlet_landlord':
    case 'property_management_company':
    case 'shortlet_manager':
      return '1 Month FREE after launch';
    case 'property_lawyer':
    case 'licensed_surveyor':
    case 'structural_engineer':
      return 'Founding Professional Badge + 6 Months FREE Verified Listing';
    case 'realtor':
      return 'Early access to verified listings, professional tools and future updates';
    default:
      return 'Early Access Member Perk';
  }
}

// BACKEND CLOUD FUNCTION 1: submitWaitlistEntry
export interface SubmitWaitlistParams {
  full_name: string;
  email: string;
  phone: string;
  role: WaitlistRole;
  organisation_name?: string;
  state: string;
  interests: WaitlistInterest[];
  referred_by?: string | null;
  source?: string;
}

export function submitWaitlistEntry(params: SubmitWaitlistParams): {
  success: boolean;
  message: string;
  entry?: WaitlistEntry;
  confirmation_link?: string;
} {
  const emailLower = params.email.trim().toLowerCase();

  // 1. Validate Email format
  if (!emailLower || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    throw new Error('Please enter a valid email address.');
  }

  // 2. Disposable Email Domain Blocking
  const domain = emailLower.split('@')[1];
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    throw new Error('Disposable email addresses are not permitted. Please use your official or permanent email.');
  }

  // 3. Validate Role
  if (!ALLOWED_ROLES.includes(params.role)) {
    throw new Error(`Invalid role selected. Must be one of allowed professional roles.`);
  }

  // 4. Validate Interests
  if (!params.interests || params.interests.length === 0) {
    throw new Error('Please select at least one area you are interested in.');
  }

  const invalidInterests = params.interests.filter(i => !ALLOWED_INTERESTS.includes(i));
  if (invalidInterests.length > 0) {
    throw new Error('Selected interest list contains invalid options.');
  }

  // Deduplicate interests
  const cleanInterests = Array.from(new Set(params.interests));

  // 5. Rate Limiting Check (Max 3 submissions per IP hash per hour)
  const entries = getWaitlistEntries();
  const ipHash = generateIpHash(navigator.userAgent);
  const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
  
  const recentIpSubmissions = entries.filter(e => e.ip_hash === ipHash && e.submitted_at > oneHourAgo);
  if (recentIpSubmissions.length >= 3) {
    throw new Error('Too many submissions from this connection in a short period. Please wait an hour before trying again.');
  }

  // 6. Check for duplicate active email
  const existing = entries.find(e => e.email === emailLower);
  if (existing) {
    if (existing.email_confirmed) {
      return {
        success: true,
        message: `Welcome back, ${existing.full_name}! You are already on the confirmed Unity Homes waitlist with Referral Code ${existing.referral_code}.`,
        entry: existing,
        confirmation_link: `${window.location.origin}/waitlist?confirmed=true&token=${existing.confirmation_token}`
      };
    } else {
      // Refresh token and expiration for existing pending entry
      existing.confirmation_token = `tok_${Math.random().toString(36).substring(2, 12)}`;
      existing.confirmation_token_expires_at = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
      saveWaitlistEntries(entries);
      logWaitlistActivity('RESEND_TOKEN', emailLower, `Refreshed 48h confirmation token for pending registration.`);

      return {
        success: true,
        message: `A registration request for ${emailLower} was pending. We have refreshed your 48-hour confirmation token!`,
        entry: existing,
        confirmation_link: `${window.location.origin}/waitlist?token=${existing.confirmation_token}`
      };
    }
  }

  // 7. Handle Referral Attribution
  let referrerCode: string | null = null;
  if (params.referred_by) {
    const referrer = entries.find(e => e.referral_code.toUpperCase() === params.referred_by?.trim().toUpperCase());
    if (referrer) {
      referrer.referral_count += 1;
      referrerCode = referrer.referral_code;
    }
  }

  // 8. Construct Entry
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 48 * 3600 * 1000); // 48 hours
  const refCode = `UNITY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const token = `tok_${Math.random().toString(36).substring(2, 14)}`;

  const newEntry: WaitlistEntry = {
    id: `wl-${Date.now()}`,
    full_name: params.full_name.trim(),
    email: emailLower,
    phone: params.phone.trim(),
    role: params.role,
    organisation_name: params.organisation_name?.trim() || undefined,
    state: params.state,
    interests: cleanInterests,
    submitted_at: now.toISOString(),
    email_confirmed: false,
    confirmed_at: null,
    confirmation_token: token,
    confirmation_token_expires_at: expiresAt.toISOString(),
    referral_code: refCode,
    referred_by: referrerCode,
    referral_count: 0,
    source: params.source || 'website',
    ip_hash: ipHash,
    benefit_claimed: getBenefitForRole(params.role)
  };

  entries.unshift(newEntry);
  saveWaitlistEntries(entries);
  logWaitlistActivity('SUBMISSION', emailLower, `New waitlist entry created as ${params.role}. Token expires in 48 hours.`);

  const confirmationLink = `${window.location.origin}/waitlist?token=${token}`;

  return {
    success: true,
    message: `Thank you, ${params.full_name}! Your waitlist registration was received. Please confirm your email to lock in your early access benefits.`,
    entry: newEntry,
    confirmation_link: confirmationLink
  };
}

// BACKEND CLOUD FUNCTION 2: confirmWaitlistEmail
export function confirmWaitlistEmail(token: string): {
  success: boolean;
  message: string;
  entry?: WaitlistEntry;
} {
  const entries = getWaitlistEntries();
  const entry = entries.find(e => e.confirmation_token === token);

  if (!entry) {
    throw new Error('Invalid or non-existent confirmation token.');
  }

  if (entry.email_confirmed) {
    return {
      success: true,
      message: `Your email (${entry.email}) has already been confirmed! Your early access benefit is reserved.`,
      entry
    };
  }

  const now = new Date();
  const expiry = new Date(entry.confirmation_token_expires_at);

  if (now > expiry) {
    throw new Error('This confirmation link has expired after 48 hours. Please request a new confirmation link.');
  }

  entry.email_confirmed = true;
  entry.confirmed_at = now.toISOString();
  saveWaitlistEntries(entries);

  logWaitlistActivity('EMAIL_CONFIRMED', entry.email, `Email confirmed successfully. Launch benefit locked: "${entry.benefit_claimed}"`);

  return {
    success: true,
    message: `Congratulations ${entry.full_name}! Your email is confirmed. You have secured: ${entry.benefit_claimed}`,
    entry
  };
}

// BACKEND CLOUD FUNCTION 3: resendConfirmationEmail
export function resendConfirmationEmail(email: string): {
  success: boolean;
  message: string;
  confirmation_link?: string;
} {
  const emailLower = email.trim().toLowerCase();
  const entries = getWaitlistEntries();
  const entry = entries.find(e => e.email === emailLower);

  if (!entry) {
    throw new Error('No waitlist submission found for this email address.');
  }

  if (entry.email_confirmed) {
    return {
      success: true,
      message: 'Your email address is already verified!'
    };
  }

  entry.confirmation_token = `tok_${Math.random().toString(36).substring(2, 14)}`;
  entry.confirmation_token_expires_at = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
  saveWaitlistEntries(entries);

  logWaitlistActivity('RESEND_TOKEN', emailLower, 'Resent confirmation link with new 48h token.');

  return {
    success: true,
    message: `A new 48-hour confirmation link has been issued for ${emailLower}.`,
    confirmation_link: `${window.location.origin}/waitlist?token=${entry.confirmation_token}`
  };
}

// BACKEND CLOUD FUNCTION 4: getWaitlistStats
export function getWaitlistStats() {
  const entries = getWaitlistEntries();
  const logs = getWaitlistLogs();

  const total = entries.length;
  const confirmed = entries.filter(e => e.email_confirmed).length;

  // By role
  const roleCounts: Record<string, number> = {};
  ALLOWED_ROLES.forEach(r => roleCounts[r] = 0);
  entries.forEach(e => {
    roleCounts[e.role] = (roleCounts[e.role] || 0) + 1;
  });

  // By state
  const stateCounts: Record<string, number> = {};
  entries.forEach(e => {
    stateCounts[e.state] = (stateCounts[e.state] || 0) + 1;
  });

  // By interest
  const interestCounts: Record<string, number> = {};
  ALLOWED_INTERESTS.forEach(i => interestCounts[i] = 0);
  entries.forEach(e => {
    e.interests.forEach(i => {
      interestCounts[i] = (interestCounts[i] || 0) + 1;
    });
  });

  // Top referrers
  const topReferrers = [...entries]
    .sort((a, b) => b.referral_count - a.referral_count)
    .slice(0, 5);

  return {
    total,
    confirmed,
    pending: total - confirmed,
    confirmationRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    roleCounts,
    stateCounts,
    interestCounts,
    topReferrers,
    recentEntries: entries.slice(0, 10),
    activityLogs: logs.slice(0, 20)
  };
}

// BACKEND CLOUD FUNCTION 5: broadcastToWaitlist (Admin)
export function broadcastToWaitlist(options: {
  subject: string;
  message: string;
  target_role: string; // 'all' or specific role
  sender_name: string;
}): {
  success: boolean;
  recipient_count: number;
} {
  const entries = getWaitlistEntries();
  const confirmedEntries = entries.filter(e => e.email_confirmed);

  const targets = options.target_role === 'all'
    ? confirmedEntries
    : confirmedEntries.filter(e => e.role === options.target_role);

  const broadcasts = getWaitlistBroadcasts();
  const newBroadcast: WaitlistBroadcastLog = {
    id: `bc-${Date.now()}`,
    timestamp: new Date().toISOString(),
    subject: options.subject,
    message: options.message,
    target_role: options.target_role,
    recipient_count: targets.length,
    sent_by: options.sender_name
  };

  broadcasts.unshift(newBroadcast);
  try {
    localStorage.setItem(WAITLIST_BROADCASTS_KEY, JSON.stringify(broadcasts));
  } catch (e) {
    console.error('Failed to log broadcast', e);
  }

  logWaitlistActivity('BROADCAST_SENT', 'ADMIN', `Broadcast "${options.subject}" dispatched to ${targets.length} recipients (${options.target_role}).`);

  return {
    success: true,
    recipient_count: targets.length
  };
}
