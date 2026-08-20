import * as admin from 'firebase-admin';

export type WaitlistStatus = 'pending' | 'confirmed' | 'waitlisted';

export type AllowedRole =
  | 'long_term_landlord'
  | 'shortlet_landlord'
  | 'property_management_company'
  | 'shortlet_manager'
  | 'realtor'
  | 'property_lawyer'
  | 'licensed_surveyor'
  | 'structural_engineer';

export type AllowedInterest =
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
  email: string; // Stored in lowercase
  phone: string;
  state: string;
  role: AllowedRole;
  organisation_name?: string;
  interests: AllowedInterest[];
  submitted_at: admin.firestore.Timestamp;
  email_confirmed: boolean;
  confirmed_at?: admin.firestore.Timestamp;
  confirmation_token: string;
  confirmation_token_expires_at: admin.firestore.Timestamp;
  referral_code: string;
  referred_by?: string;
  referral_count: number;
  source?: string;
  ip_hash: string;
  user_agent: string;
  status: WaitlistStatus;
  created_at: admin.firestore.Timestamp;
  updated_at: admin.firestore.Timestamp;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: Record<string, any>;
  timestamp: admin.firestore.Timestamp;
  ip_hash?: string;
  user_agent?: string;
}

export interface AnalyticsSnapshot {
  id: string;
  timestamp: admin.firestore.Timestamp;
  metrics: {
    total_waitlist: number;
    confirmed: number;
    pending: number;
    role_distribution: Record<string, number>;
    state_distribution: Record<string, number>;
    interest_distribution: Record<string, number>;
    referral_clicks: number;
    referral_conversions: number;
    landing_page_visits: number;
  };
}

export interface BroadcastLog {
  id: string;
  subject: string;
  body: string;
  sent_at: admin.firestore.Timestamp;
  target_audience: {
    status?: WaitlistStatus;
    roles?: AllowedRole[];
    states?: string[];
    interests?: AllowedInterest[];
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metrics: {
    sent: number;
    failed: number;
    opened: number;
  };
}
