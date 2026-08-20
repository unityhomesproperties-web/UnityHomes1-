export interface PMCApplication {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  whatsapp: string;
  email: string;
  cacNumber: string;
  address: string;
  yearsOperating: number;
  propertiesManaged: number;
  references?: string;
  receivingAuthority: 'Landlord Receives Directly' | 'This Company Receives on Landlord\'s Behalf';
  tenantRelationshipManager: string;
  maintenanceHandler: string;
  expenseApprover: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  dateApplied: string;
}

export interface TenantRegistration {
  id: string;
  landlordCode: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  country: string;
  occupation: string;
  employer?: string;
  dob: string; // Birthday (used only for messages, visible to admin only)
  passportPhoto: string; // Base64 or placeholder URL
  guarantorName: string;
  guarantorPhone: string;
  guarantorOccupation?: string;
  guarantorAddress?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  dateApplied: string;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  type: string; // 'For Rent' | 'For Lease' | 'Shortlet' | 'Commercial Rent' | 'Commercial Lease' | 'New Listing'
  location: string;
  state: string; // e.g. 'Lagos', 'Ogun', 'Abuja'
  bedrooms: number;
  bathrooms: number;
  description: string;
  photos: string[];
  youtubeTourUrl?: string;
  mapsPinLabel: string;
  amenities: string[];
  landlordCode: string;
  landlordName: string;
  verifiedAccountName: string;
  verifiedAccountNumber: string;
  verifiedBankName: string;
  feeBreakdown: {
    label: string;
    amount: number;
    explanation?: string;
  }[];
  isShortlet?: boolean;
  managementCompanyId?: string;
}

export type PackageType = 
  | 'lawyer'
  | 'surveyor'
  | 'structural_engineer'
  | 'dual_bundle_lawyer_surveyor'
  | 'dual_bundle_lawyer_engineer'
  | 'dual_bundle_surveyor_engineer'
  | 'complete_bundle';

export interface ProfessionalConnection {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  packageType: PackageType;
  amount: number;
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  connectionStatus: 'pending_match' | 'group_created' | 'service_delivered' | 'cancelled';
  professional1Id?: string;
  professional1Name?: string;
  professional2Id?: string;
  professional2Name?: string;
  professional3Id?: string;
  professional3Name?: string;
  dateCreated: string;
  notes?: string;
  isDemoData?: boolean;
  promoCode?: string;
  discountAmount?: number;
  originalAmount?: number;
  paystackReference?: string;
  amountPaid?: number;
  assignedProfessionalNames?: string[];
  createdAt?: string;
  status?: string;
}

export interface Professional {
  id: string;
  name: string;
  category: 'Lawyer' | 'Surveyor' | 'Structural Engineer';
  regNumber: string;
  issuingBody: string;
  experienceYears: number;
  statesCovered: string[];
  isFoundingMember: boolean;
  avatarUrl: string;
  bio: string;
  tags?: string[]; // Structural Engineer tags
  companyName?: string;
}

export type UserRole = 'Admin' | 'Landlord' | 'Tenant' | 'Shortlet Manager' | 'PMC' | 'Public';

export interface UserSession {
  role: UserRole;
  email: string;
  userId: string;
  name: string;
  entityId?: string; // landlordCode or pmcId, etc.
}

export interface VerificationInquiry {
  id: string;
  type: 'Professional' | 'PlatformSubscription';
  targetName: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  planName?: string;
  dateCreated: string;
  status: 'Pending' | 'Contacted' | 'Closed';
  promo_code?: string;
  promo_discount_text?: string;
}

export interface ServiceChargeCategory {
  id: string;
  name: 'Security Levy' | 'Waste Disposal' | 'Water Bill' | 'Generator Diesel' | 'Estate Due' | 'Cleaning Fee' | 'Special Assessment' | 'Custom';
  customName?: string;
  amount: number;
  frequency: 'Monthly' | 'Yearly' | 'One-off';
  dueDay: number; // e.g. 1-31
  applicableUnitIds: string[];
  propertyId: string; // The building/property ID
}

export interface ServiceChargeBill {
  id: string;
  categoryId: string;
  unitId: string; // references LandlordUnit
  tenantName: string;
  amount: number;
  dueDate: string;
  status: 'Unpaid' | 'Overdue' | 'Pending Verification' | 'Paid';
  receiptUrl?: string;
  verifiedBy?: string;
  dateVerified?: string;
  isDemoData?: boolean;
}

export interface MaintenanceCost {
  id: string;
  propertyId: string;
  unitId?: string;
  description: string;
  amount: number;
  dateLogged: string;
  approvedBy?: string; // Must be filled before it counts
  status: 'Open' | 'In Progress' | 'Completed';
}

export interface InstallmentEntry {
  id: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
}

export interface LandlordUnit {
  id: string;
  buildingId?: string; // Links unit to a Building
  propertyName: string;
  unitNumber: string;
  tenantName: string;
  tenantCode: string;
  tenantPhoto?: string;
  rentAmount: number;
  paymentStatus: 'Paid' | 'Overdue' | 'Due Soon' | 'Vacant' | 'Lease Expiring Soon';
  dueDate: string;
  vacancyStartDate?: string;
  leaseExpiryDate?: string;
  isDemoData?: boolean;
  renewalIntention?: 'renewing' | 'vacating' | null;
  quitNoticeGenerated?: boolean;
  quitNoticeStatus?: 'Pending Admin Review' | 'Released to Both Parties' | 'Notice Period Active';
  quitNoticeInitiationDate?: string;
  quitNoticeLegalPeriod?: string;
  quitNoticeEndDate?: string;
  hasInstallmentSchedule?: boolean;
  installments?: InstallmentEntry[];
  rentPaid?: number; // to support tenant and installment views
  managementCompanyId?: string;
  tenantEmail?: string;
  address?: string;
  unitName?: string;
  landlordId?: string;
  landlordName?: string;
}

export interface Building {
  id: string;
  name: string;
  blockLabel: string; // e.g. Block A, Block B, Block C
  address: string; // shared street address
  coverPhoto: string;
  landlordCode: string;
}

// First-Class Firestore Architectural Entities
export interface FirestoreBuilding {
  id: string;
  landlord_id: string;
  management_company_id?: string | null;
  building_name: string;
  building_number: string;
  address_street: string;
  address_area: string;
  address_state: string;
  cover_photo_url: string;
  total_units: number;
  created_at: string;
  is_active: boolean;
}

export interface FirestoreUnit {
  id: string;
  building_id: string;
  landlord_id: string; // Copied automatically from building
  management_company_id?: string | null; // Copied automatically from building
  unit_name: string; // e.g. Flat A1, Suite 2B
  unit_type: 'studio' | 'one bedroom' | 'two bedroom' | 'three bedroom' | 'commercial' | string;
  annual_rent: number;
  current_tenant_id?: string | null; // null when vacant
  occupancy_status: 'vacant' | 'occupied' | 'reserved';
  collection_account_id: string;
  created_at: string;
}

export interface MoveInReadiness {
  personal_info_completed?: boolean;
  emergency_contact_completed?: boolean;
  guarantor_info_completed?: boolean;
  selfie_uploaded?: boolean;
  lease_agreement_signed?: boolean;
  phone_verified?: boolean;
  email_verified?: boolean;
  profile_photo_uploaded?: boolean;
  emergency_contact_added?: boolean;
  guarantor_confirmed?: boolean;
  lease_document_uploaded?: boolean;
  // Optional Level 2 items
  government_id_uploaded?: boolean;
  selfie_submitted?: boolean;
  identity_verified?: boolean;
  completion_percentage?: number;
}

export interface FirestoreTenantProfile {
  id: string; // Matches user auth UID
  user_id: string;
  full_name: string;
  phone: string;
  whatsapp?: string;
  email: string;
  dob?: string;
  country?: string;
  occupation?: string;
  employer?: string;
  nin?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  guarantor_name?: string;
  guarantor_phone?: string;
  guarantor_whatsapp?: string;
  guarantor_occupation?: string;
  guarantor_employer?: string;
  guarantor_address?: string;
  guarantor_relationship?: string;
  guarantor_confirmed?: boolean;
  passport_photo?: string;
  government_id_photo?: string;
  verification_selfie_photo?: string;
  id_type?: string;
  verified_badge?: boolean;
  verified_badge_date?: string;
  verified_badge_issuer?: string;
  nin_verified?: boolean;
  phone_verified?: boolean;
  email_verified?: boolean;
  signed_lease_url?: string;
  current_tenancy_id: string | null; // Pointer to current active tenancy in tenancies collection
  move_in_readiness?: MoveInReadiness;
  created_at: string;
  updated_at?: string;
}

export interface FirestoreTenancy {
  id: string;
  tenant_id: string;
  unit_id: string;
  building_id: string;
  landlord_id: string;
  management_company_id?: string | null;
  lease_start_date: string;
  lease_end_date: string;
  lease_amount: number;
  rent_frequency?: 'Annual' | 'Biannual';
  caution_deposit_amount?: number;
  signed_agreement_doc?: string;
  offline_id_doc?: string;
  inspection_photos?: string[];
  status: 'active' | 'ended' | 'cancelled' | 'terminated';
  created_at: string;
}

export interface InvitationPreFilledData {
  tenantFullName: string;
  fullName?: string; // fallback alias
  phone: string;
  whatsapp?: string;
  email: string;
  dob?: string;
  country?: string;
  occupation?: string;
  employer?: string;
  nin?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorWhatsapp?: string;
  guarantorOccupation?: string;
  guarantorEmployer?: string;
  guarantorAddress?: string;
  guarantorRelationship?: 'Parent' | 'Sibling' | 'Employer' | 'Spouse' | 'Friend' | 'Other' | string;
  leaseStartDate: string;
  leaseEndDate: string;
  leaseAmount: number;
  rentFrequency?: 'Annual' | 'Biannual';
  cautionDepositAmount?: number;
  cautionDeposit?: number;
  signedAgreementDoc?: string;
  offlineIdDoc?: string;
  inspectionPhotos?: string[];
}

export interface FirestoreTenantInvitation {
  id: string;
  landlord_id: string;
  unit_id: string;
  building_id: string;
  management_company_id?: string | null;
  tenant_id_code?: string; // e.g. UH-TNT-849201
  pre_filled_data: InvitationPreFilledData;
  invitation_code: string; // Format: K8M4-ZP91 (4 chars, hyphen, 4 chars)
  invitation_link: string; // e.g. unityhomes.ng/join/K8M4-ZP91
  qr_code_url: string;
  delivery_channels?: string[];
  delivery_status?: Record<string, string>;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: string; // Exactly 14 days after creation
  created_at: string;
  accepted_at?: string | null;
  tenant_user_id?: string | null;
}

export interface Level2VerificationRequest {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email: string;
  nin?: string;
  id_type: 'NIN Card' | 'Driver\'s License' | 'International Passport' | 'Voter\'s Card' | string;
  government_id_photo: string;
  selfie_photo: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejection_reason?: string;
  nin_duplicate_warning?: boolean;
  duplicate_nin_tenant_name?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface ShortletManagerAgreement {
  propertyId: string;
  propertyName: string;
  managerName: string;
  managerPhoto: string;
  managementFeePercent: number; // e.g. 15 for 15%
  managementCompany?: string;
  landlordId?: string;
  landlordName?: string;
  landlordBankName?: string;
  landlordBankAccountName?: string;
  landlordBankAccountNumber?: string;
  isManagedByMe?: boolean;
  isAwaitingAssignment?: boolean;
}

export interface BookingLog {
  id: string;
  propertyName: string;
  unitNumber: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPaid: number;
  remittanceFormSent: boolean;
  remittanceAmount: number;
  managementFeeAmount?: number;
  remittanceDateSent?: string;
  status: 'Confirmed' | 'Pending' | 'Disputed' | 'Acknowledged' | 'Pending Acknowledgement';
  bookingSource?: 'Airbnb' | 'Booking.com' | 'Direct' | 'Instagram' | 'WhatsApp' | 'Other';
  caution_deposit_collected?: boolean;
  caution_deposit_amount?: number;
  isDemoData?: boolean;
}

export interface CautionDepositResolution {
  id: string;
  bookingId: string;
  managerId: string;
  managerName: string;
  landlordId: string;
  landlordName: string;
  propertyId?: string;
  propertyName: string;
  unitNumber: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  depositAmount: number;
  checkoutCondition: 'No Damage Observed' | 'Minor Damage Found' | 'Significant Damage Found' | 'Serious Damage Requiring Full Deposit Retention';
  damageDescription?: string;
  damagePhotos?: string[];
  estimatedRepairCost?: number;
  depositDecision: 'Full Deposit Returned to Guest' | 'Partial Deposit Returned' | 'Full Deposit Retained';
  amountRetained?: number;
  amountReturned?: number;
  retentionJustification?: string;
  status: 'submitted' | 'landlord_acknowledged' | 'disputed' | 'pending_admin_review' | 'resolved_manager_upheld' | 'resolved_landlord_upheld';
  disputeReason?: string;
  disputeEvidence?: string[];
  disputedAt?: string;
  adminRulingNote?: string;
  adminRuledAt?: string;
  submittedAt: string;
  isDemoData?: boolean;
}

export interface DamageReport {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  bookingReference: string;
  guestStay: string;
  dateDiscovered: string;
  damageCategory: 'Furniture' | 'Television' | 'Air Conditioner' | 'Kitchen Appliance' | 'Door' | 'Window' | 'Plumbing' | 'Electrical' | 'Painting' | 'Flooring' | 'Mattress' | 'Decoration' | 'Other';
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  rootCause?: string;
  repairVendor?: string;
  estimatedCost: number;
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed';
  photos: string[];
  videos: string[];
  receipts: string[];
  quotations: string[];
  dateReported: string;
  managerId: string;
  landlordId: string;
  managerName?: string;
  isDemoData?: boolean;
}

export interface PromiseToPay {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  propertyId: string;
  propertyName: string;
  landlordId: string;
  managementCompanyId: string;
  paymentType: 'Rent' | 'Service Charge' | 'Both';
  outstandingAmount: number;
  promisedAmount: number;
  expectedPaymentDate: string;
  reasonForDelay: 'Salary Delay' | 'Business Cash Flow' | 'Medical Emergency' | 'Travel' | 'Bank Transfer Delay' | 'Other';
  note?: string;
  status: 'Upcoming' | 'Due Today' | 'Fulfilled' | 'Broken Promise' | 'Overdue' | 'Partially Paid' | 'Under Review';
  createdAt: string;
  acknowledgedByLandlord?: boolean;
  acknowledgedByPMC?: boolean;
  lastReminderStage?: string;
  isDemoData?: boolean;
}

export interface PlatformDocument {
  id: string;
  title: string;
  fileName: string;
  category: string;
  dateCreated: string;
  isDemoData?: boolean;
}

export interface Complaint {
  id: string;
  tenant: string;
  tenantId?: string;
  tenantCode?: string;
  tenantEmail?: string;
  unit: string;
  unitId?: string;
  propertyId?: string;
  propertyName?: string;
  complaint_category: 
    | 'Property Maintenance or Repairs'
    | 'Waste and Refuse Collection'
    | 'Property Condition or Safety'
    | 'Service Charges'
    | 'Noise or Neighbour Issue'
    | 'Landlord Conduct or Behaviour'
    | 'Property Management Company Conduct'
    | 'Something Else';
  category?: string; // legacy fallback
  routingPath?: 'path_1_self_managed' | 'path_2_pmc_managed' | 'path_3_landlord_conduct' | 'path_4_pmc_conduct' | 'path_5_something_else';
  primaryRecipientRole?: 'Landlord' | 'PMC' | 'Admin';
  primaryRecipientName?: string;
  secondaryRecipientRole?: 'Landlord' | 'PMC' | 'Admin';
  secondaryRecipientName?: string;
  adminOversight?: boolean;
  isPMCManaged?: boolean;
  typeOfWasteIssue?: 'Waste not collected on scheduled day' | 'No collection in over seven days' | 'Communal bins overflowing' | 'Waste collected from some units but not mine' | 'Health or hygiene concern from uncollected waste' | 'Other';
  daysSinceLastCollection?: number;
  evidencePhotos?: string[];
  usualCollectionDay?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'I do not know' | string;
  urgency?: 'Normal' | 'High' | 'Urgent';
  text: string;
  date: string;
  status: 'Open' | 'Responded' | 'Resolved' | 'Submitted' | 'Received by Property Manager' | 'Action Being Taken' | 'Pending Verification' | 'In Ledger Dispute' | 'Under Review' | 'Escalated';
  managementCompanyId?: string;
  landlordId?: string;
  landlordName?: string;
  landlordResponse?: string;
  landlordActionTaken?: string;
  landlordRespondedAt?: string;
  pmcResponse?: string;
  pmcActionTaken?: string;
  pmcRespondedAt?: string;
  adminResponse?: string;
  adminActionTaken?: string;
  adminRespondedAt?: string;
  adminNotes?: string[];
  resolutionNote?: string;
  resolvedAt?: string;
  reassignmentHistory?: { reassignedBy: string; oldPath: string; newPath: string; reason: string; date: string }[];
  is_escalation_eligible?: boolean;
  escalated_at?: string;
  escalated_by?: string;
  escalation_reason?: string;
  escalation_outcome?: 'Resolved by Admin' | 'Returned to Primary Handler' | 'Serious Concern Flagged';
  admin_resolution_note?: string;
  returned_message?: string;
  serious_concern_flagged?: boolean;
  isDemoData?: boolean;
}

export interface MaintenanceJob {
  id: string;
  property: string;
  issue: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Pending Inspector Quote' | 'Approved & Funded' | 'Resolved & Closed';
  isDemoData?: boolean;
}

export interface RentPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  propertyName: string;
  unitNumber: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'pending_confirmation' | 'confirmed';
  receivingBankName?: string;
  receivingAccountName?: string;
  receivingAccountNumber?: string;
  ref?: string;
  isDemoData?: boolean;
  landlordName?: string;
}

export interface SentEmail {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'delivered' | 'failed';
  attachments?: { fileName: string; content: string }[];
  errorMessage?: string;
}

export interface LandlordReport {
  id: string;
  landlordId: string;
  landlordName: string;
  landlordEmail: string;
  monthCovered: string; // e.g. "June 2026"
  sentAt: string;
  downloaded: boolean;
  pdfUrl: string;
  pdfContent: string; // HTML preview of the PDF content
  metrics: {
    totalRentalIncome: number;
    totalServiceChargesCollected: number;
    totalMaintenanceExpenses: number;
    netIncome: number;
    occupancyRateAtMonthEnd: number;
    outstandingRent: number;
    topPerformingProperty: string;
    leaseRenewalsCount: number;
    leaseRenewalsTenantNames: string[];
    newTenantsCount: number;
    newTenantNames: string[];
  };
  briefingSentences: string[];
}

export interface PmcReport {
  id: string;
  pmcId: string;
  pmcName: string;
  pmcEmail: string;
  monthCovered: string; // e.g. "June 2026"
  sentAt: string;
  downloaded: boolean;
  pdfUrl: string;
  pdfContent: string; // HTML preview of the PDF content
  metrics: {
    totalRentCollectedAcrossPortfolio: number;
    totalServiceChargesCollectedAcrossPortfolio: number;
    totalManagementFeesEarned: number;
    totalMaintenanceCostsApproved: number;
    netPortfolioIncome: number;
    overallOccupancyRateAtMonthEnd: number;
    outstandingRentAcrossPortfolio: number;
    propertiesAddedThisMonthCount: number;
    tenantsAddedThisMonthCount: number;
    remittancesSentAndAcknowledgedCount: number;
  };
  briefingSentences: string[];
}export type SupportCategory = 
  | 'Account and Login Issues'
  | 'Billing and Subscription'
  | 'Technical Problem or Bug'
  | 'Feature Question'
  | 'Data or Record Concern'
  | 'Professional Connection Issue'
  | 'Other';

export type SupportPriority = 'Normal' | 'Urgent' | 'Low';
export type SupportStatus = 'New' | 'In Progress' | 'Awaiting User Response' | 'Resolved';
export type SupportContactPreference = 'In-App Response' | 'Email Response' | 'WhatsApp Response';

export interface SupportTicketMessage {
  id: string;
  senderName: string;
  senderRole: string;
  senderEmail?: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface SupportTicket {
  id: string;
  refNumber: string; // e.g. "UH-SUP-0001"
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  category: SupportCategory;
  description: string;
  affectedPageOrFeature?: string;
  screenshots?: string[];
  contactPreference: SupportContactPreference;
  priority: SupportPriority;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  firstAdminResponseAt?: string;
  messages: SupportTicketMessage[];
  resolutionNote?: string;
  isDemoData?: boolean;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  appliesTo: 'Long-Term Landlord' | 'Shortlet Landlord' | 'PMC';
  unitLimit: number | 'unlimited';
  monthlyPrice: number;
  features: string[];
  popular?: boolean;
  accentColor?: string;
  badge?: string;
}

export interface SubscriptionInquiry {
  id: string;
  planName: string;
  appliesTo: string;
  billingCycle: 'Monthly' | 'Annual';
  monthlyPrice: number;
  annualPrice: number;
  visitorName: string;
  visitorPhone: string;
  visitorEmail?: string;
  portfolioSize?: string;
  notes?: string;
  timestamp: string;
  status: 'Pending' | 'Contacted' | 'Onboarded';
  promo_code?: string;
  promo_discount_text?: string;
}

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_months';
export type AppliesToScope = 'all' | 'professional_connection' | 'subscription';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  applies_to: AppliesToScope;
  specific_plan?: string | null;
  eligible_roles: string[];
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  expires_at: string | null;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface PromoCodeRedemption {
  id: string;
  promo_code_id: string;
  code: string;
  user_id: string;
  user_role: string;
  applied_to: 'professional_connection' | 'subscription';
  related_id: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
  redeemed_at: string;
  status: 'applied' | 'reversed';
  userName?: string;
}

