import { 
  FirestoreBuilding, 
  FirestoreUnit, 
  FirestoreTenantProfile, 
  FirestoreTenancy, 
  FirestoreTenantInvitation, 
  InvitationPreFilledData,
  MoveInReadiness,
  Level2VerificationRequest
} from '../types';

export type {
  FirestoreBuilding,
  FirestoreUnit,
  FirestoreTenantProfile,
  FirestoreTenancy,
  FirestoreTenantInvitation,
  InvitationPreFilledData,
  MoveInReadiness,
  Level2VerificationRequest
};

// ==========================================
// LOCAL PERSISTENT STORAGE KEYS FOR BACKEND ARCHITECTURE
// ==========================================
const BUILDINGS_KEY = 'uh_buildings_v2';
const UNITS_KEY = 'uh_units_v2';
const TENANT_PROFILES_KEY = 'uh_tenant_profiles_v2';
const TENANCIES_KEY = 'uh_tenancies_v2';
const TENANT_INVITATIONS_KEY = 'uh_tenant_invitations_v2';
const NOTIFICATIONS_KEY = 'uh_landlord_notifications_v2';
const TENANT_NOTIFICATIONS_KEY = 'uh_tenant_notifications_v2';
const VERIFICATION_REQUESTS_KEY = 'uh_verification_requests_v1';
const ACTIVITY_LOG_KEY = 'uh_activity_logs_v1';

// Helper to log system activity
export function logActivityEvent(event: { event_type: string; description: string; actor_id: string; target_id?: string }): void {
  try {
    const raw = localStorage.getItem(ACTIVITY_LOG_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.push({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...event,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to log activity event', e);
  }
}

// Utility helper to generate XXXX-XXXX invitation codes
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${part1}-${part2}`;
}

// Utility to generate unique Tenant ID e.g. UH-TNT-849201
export function generateTenantIdCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `UH-TNT-${num}`;
}

// Utility to generate QR Code SVG Data URL
export function generateQRCodeDataUrl(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encoded}`;
}

// ==========================================
// DATA ENGINE LOADERS & SAVERS
// ==========================================
export function getStoredBuildings(): FirestoreBuilding[] {
  try {
    const raw = localStorage.getItem(BUILDINGS_KEY);
    if (!raw) return getInitialSeedBuildings();
    return JSON.parse(raw);
  } catch (e) {
    return getInitialSeedBuildings();
  }
}

export function saveStoredBuildings(buildings: FirestoreBuilding[]): void {
  try {
    localStorage.setItem(BUILDINGS_KEY, JSON.stringify(buildings));
  } catch (e) {
    console.error('Failed to save buildings to storage', e);
  }
}

export function getStoredUnits(): FirestoreUnit[] {
  try {
    const raw = localStorage.getItem(UNITS_KEY);
    if (!raw) return getInitialSeedUnits();
    return JSON.parse(raw);
  } catch (e) {
    return getInitialSeedUnits();
  }
}

export function saveStoredUnits(units: FirestoreUnit[]): void {
  try {
    localStorage.setItem(UNITS_KEY, JSON.stringify(units));
  } catch (e) {
    console.error('Failed to save units to storage', e);
  }
}

export function getStoredTenantProfiles(): FirestoreTenantProfile[] {
  try {
    const raw = localStorage.getItem(TENANT_PROFILES_KEY);
    if (!raw) return getInitialSeedTenantProfiles();
    return JSON.parse(raw);
  } catch (e) {
    return getInitialSeedTenantProfiles();
  }
}

export function saveStoredTenantProfiles(profiles: FirestoreTenantProfile[]): void {
  try {
    localStorage.setItem(TENANT_PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save tenant profiles to storage', e);
  }
}

export function getStoredTenancies(): FirestoreTenancy[] {
  try {
    const raw = localStorage.getItem(TENANCIES_KEY);
    if (!raw) return getInitialSeedTenancies();
    return JSON.parse(raw);
  } catch (e) {
    return getInitialSeedTenancies();
  }
}

export function saveStoredTenancies(tenancies: FirestoreTenancy[]): void {
  try {
    localStorage.setItem(TENANCIES_KEY, JSON.stringify(tenancies));
  } catch (e) {
    console.error('Failed to save tenancies to storage', e);
  }
}

export function getStoredInvitations(): FirestoreTenantInvitation[] {
  try {
    const raw = localStorage.getItem(TENANT_INVITATIONS_KEY);
    if (!raw) {
      const seed = getInitialSeedInvitations();
      saveStoredInvitations(seed);
      return seed;
    }
    return JSON.parse(raw);
  } catch (e) {
    return getInitialSeedInvitations();
  }
}

export function saveStoredInvitations(invitations: FirestoreTenantInvitation[]): void {
  try {
    localStorage.setItem(TENANT_INVITATIONS_KEY, JSON.stringify(invitations));
  } catch (e) {
    console.error('Failed to save invitations to storage', e);
  }
}

/**
 * Prompt Five Operational Cloud Functions Equivalents
 */

export function reassignTenantUnit(
  tenancyId: string,
  targetUnitId: string,
  landlordName: string
): { success: boolean; message: string } {
  const tenancies = getStoredTenancies();
  const units = getStoredUnits();
  const profiles = getStoredTenantProfiles();

  const tenancyIndex = tenancies.findIndex(t => t.id === tenancyId || t.unit_id === tenancyId);
  if (tenancyIndex === -1) {
    throw new Error('Tenancy record not found.');
  }

  const tenancy = tenancies[tenancyIndex];
  const oldUnitId = tenancy.unit_id;
  const oldUnit = units.find(u => u.id === oldUnitId);
  const newUnit = units.find(u => u.id === targetUnitId);

  if (!newUnit) {
    throw new Error('Target unit not found.');
  }

  if (newUnit.occupancy_status === 'occupied') {
    throw new Error('Target unit is already occupied.');
  }

  // Update tenancy document with new unit_id and lease amount
  tenancy.unit_id = targetUnitId;
  tenancy.building_id = newUnit.building_id;
  tenancy.lease_amount = newUnit.annual_rent;
  saveStoredTenancies(tenancies);

  // Update old unit's occupancy_status to vacant and current_tenant_id to null
  if (oldUnit) {
    oldUnit.occupancy_status = 'vacant';
    oldUnit.current_tenant_id = null;
  }

  // Update new unit's occupancy_status to occupied and current_tenant_id to tenant's id
  newUnit.occupancy_status = 'occupied';
  newUnit.current_tenant_id = tenancy.tenant_id;
  saveStoredUnits(units);

  // Update tenant_profiles current_tenancy_id to the new tenancy
  const profileIndex = profiles.findIndex(p => p.id === tenancy.tenant_id || p.user_id === tenancy.tenant_id);
  if (profileIndex !== -1) {
    profiles[profileIndex].current_tenancy_id = tenancy.id;
    saveStoredTenantProfiles(profiles);
  }

  const oldUnitName = oldUnit ? oldUnit.unit_name : oldUnitId;
  const newUnitName = newUnit.unit_name;
  const tenantProfile = profileIndex !== -1 ? profiles[profileIndex] : null;
  const tenantName = tenantProfile?.full_name || 'Tenant';

  // Write activityLog entry
  logActivityEvent({
    event_type: 'UNIT_REASSIGNMENT',
    description: `Tenant ${tenantName} reassigned from ${oldUnitName} to ${newUnitName} by ${landlordName}`,
    actor_id: tenancy.landlord_id,
    target_id: tenancy.tenant_id
  });

  // Notify tenant
  sendTenantInAppNotification(
    tenancy.tenant_id,
    `Your unit allocation has been updated! You have been reassigned from ${oldUnitName} to ${newUnitName} by ${landlordName}.`
  );

  return {
    success: true,
    message: `Tenant reassigned from ${oldUnitName} to ${newUnitName} successfully.`
  };
}

export function endTenantTenancy(
  tenancyId: string,
  checklistConfirmations: {
    physically_vacated: boolean;
    keys_returned: boolean;
    condition_assessed: boolean;
    caution_deposit_documented: boolean;
  },
  landlordName: string
): { success: boolean; message: string } {
  if (!checklistConfirmations.physically_vacated ||
      !checklistConfirmations.keys_returned ||
      !checklistConfirmations.condition_assessed ||
      !checklistConfirmations.caution_deposit_documented) {
    throw new Error('All move-out checklist confirmations must be completed before ending tenancy.');
  }

  const tenancies = getStoredTenancies();
  const units = getStoredUnits();
  const profiles = getStoredTenantProfiles();

  const tenancyIndex = tenancies.findIndex(t => t.id === tenancyId || t.unit_id === tenancyId);
  if (tenancyIndex === -1) {
    throw new Error('Tenancy record not found.');
  }

  const tenancy = tenancies[tenancyIndex];
  tenancy.status = 'terminated';
  saveStoredTenancies(tenancies);

  // Update unit occupancy_status to vacant and current_tenant_id to null
  const unit = units.find(u => u.id === tenancy.unit_id);
  if (unit) {
    unit.occupancy_status = 'vacant';
    unit.current_tenant_id = null;
    saveStoredUnits(units);
  }

  // Update tenant_profiles current_tenancy_id to null
  const profileIndex = profiles.findIndex(p => p.id === tenancy.tenant_id || p.user_id === tenancy.tenant_id);
  if (profileIndex !== -1) {
    profiles[profileIndex].current_tenancy_id = null;
    saveStoredTenantProfiles(profiles);
  }

  const tenantName = profileIndex !== -1 ? profiles[profileIndex].full_name : 'Tenant';
  const unitName = unit ? unit.unit_name : tenancy.unit_id;

  // Permanent activity log
  logActivityEvent({
    event_type: 'MOVE_OUT_TERMINATED',
    description: `Tenancy terminated for ${tenantName} at ${unitName} by ${landlordName}. Move-out checklist verified: Physically vacated, keys returned, condition assessed, caution deposit documented.`,
    actor_id: tenancy.landlord_id,
    target_id: tenancy.tenant_id
  });

  // Notify tenant
  sendTenantInAppNotification(
    tenancy.tenant_id,
    `Your tenancy for ${unitName} has been concluded by ${landlordName}. Your historical records remain safely stored on your account.`
  );

  return {
    success: true,
    message: `Tenancy for ${tenantName} at ${unitName} has been concluded successfully.`
  };
}

export function checkExistingTenantByContact(email?: string, phone?: string): FirestoreTenantProfile | null {
  const profiles = getStoredTenantProfiles();
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  const normalizedPhone = phone ? phone.trim().replace(/\s+/g, '') : '';

  if (!normalizedEmail && !normalizedPhone) return null;

  const match = profiles.find(p => {
    const pEmail = p.email ? p.email.trim().toLowerCase() : '';
    const pPhone = p.phone ? p.phone.trim().replace(/\s+/g, '') : '';
    return (normalizedEmail && pEmail === normalizedEmail) || (normalizedPhone && pPhone === normalizedPhone);
  });

  return match || null;
}

export function acceptTenantInvitationForExistingUser(
  invitationCode: string,
  existingTenantId: string
): { tenancy: FirestoreTenancy; profile: FirestoreTenantProfile; building: FirestoreBuilding } {
  const invitations = getStoredInvitations();
  const units = getStoredUnits();
  const buildings = getStoredBuildings();
  const profiles = getStoredTenantProfiles();
  const tenancies = getStoredTenancies();

  const invIndex = invitations.findIndex(i => i.invitation_code === invitationCode || i.id === invitationCode);
  if (invIndex === -1) {
    throw new Error('Invitation code not found or invalid.');
  }

  const invitation = invitations[invIndex];
  if (invitation.status === 'expired') {
    throw new Error('This invitation code has expired.');
  }

  const unit = units.find(u => u.id === invitation.unit_id);
  if (!unit) {
    throw new Error('Unit associated with invitation not found.');
  }

  const building = buildings.find(b => b.id === unit.building_id);
  if (!building) {
    throw new Error('Building associated with unit not found.');
  }

  const profileIndex = profiles.findIndex(p => p.id === existingTenantId || p.user_id === existingTenantId);
  if (profileIndex === -1) {
    throw new Error('Existing tenant profile not found.');
  }

  const tenantProfile = profiles[profileIndex];

  // Create new tenancy document under existing user
  const newTenancy: FirestoreTenancy = {
    id: `tenancy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    tenant_id: tenantProfile.id,
    unit_id: unit.id,
    building_id: building.id,
    landlord_id: invitation.landlord_id,
    management_company_id: invitation.management_company_id || null,
    lease_start_date: new Date().toISOString().split('T')[0],
    lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lease_amount: invitation.pre_filled_data.leaseAmount || unit.annual_rent,
    caution_deposit_amount: invitation.pre_filled_data.cautionDeposit || 0,
    status: 'active',
    created_at: new Date().toISOString()
  };

  tenancies.push(newTenancy);
  saveStoredTenancies(tenancies);

  // Update unit occupancy_status to occupied and current_tenant_id to tenant's id
  unit.occupancy_status = 'occupied';
  unit.current_tenant_id = tenantProfile.id;
  saveStoredUnits(units);

  // Update current_tenancy_id to the new tenancy
  tenantProfile.current_tenancy_id = newTenancy.id;
  tenantProfile.move_in_readiness = calculateMoveInReadiness(tenantProfile);
  saveStoredTenantProfiles(profiles);

  // Update invitation status
  invitation.status = 'accepted';
  saveStoredInvitations(invitations);

  // Notifications & activity log
  logActivityEvent({
    event_type: 'INVITATION_ACCEPTED_EXISTING_USER',
    description: `Existing tenant ${tenantProfile.full_name} accepted invitation and linked to new property: ${unit.unit_name} at ${building.building_name}`,
    actor_id: tenantProfile.id,
    target_id: invitation.landlord_id
  });

  sendLandlordInAppNotification(
    invitation.landlord_id,
    `Tenant ${tenantProfile.full_name} accepted your invitation and linked their account to ${unit.unit_name} at ${building.building_name}.`,
    invitation.id
  );

  sendTenantInAppNotification(
    tenantProfile.id,
    `Welcome! Your account is now linked to ${unit.unit_name} at ${building.building_name}.`
  );

  return {
    tenancy: newTenancy,
    profile: tenantProfile,
    building
  };
}

export function regenerateExpiredInvitation(
  invitationId: string,
  landlordName: string
): { success: boolean; newCode: string; invitation: FirestoreTenantInvitation } {
  const invitations = getStoredInvitations();
  const invIndex = invitations.findIndex(i => i.id === invitationId || i.invitation_code === invitationId);

  if (invIndex === -1) {
    throw new Error('Invitation not found.');
  }

  const invitation = invitations[invIndex];
  const newCode = `REGEN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  invitation.invitation_code = newCode;
  invitation.invitation_link = `${window.location.origin}/register-tenant?code=${newCode}`;
  invitation.created_at = now.toISOString();
  invitation.expires_at = expiresAt.toISOString();
  invitation.status = 'pending';

  saveStoredInvitations(invitations);

  logActivityEvent({
    event_type: 'INVITATION_REGENERATED',
    description: `Expired invitation for ${invitation.pre_filled_data?.fullName || 'tenant'} regenerated by ${landlordName}. New code: ${newCode}`,
    actor_id: invitation.landlord_id,
    target_id: invitation.unit_id
  });

  return {
    success: true,
    newCode,
    invitation
  };
}

// ==========================================
// STEP 1: BUILDINGS & UNITS FUNCTIONS + TRIGGERS
// ==========================================

/**
 * Creates or updates a Building document in Firestore.
 * Automatically recalculates total_units from the units collection.
 */
export function createOrUpdateBuilding(data: Omit<FirestoreBuilding, 'total_units'>): FirestoreBuilding {
  const buildings = getStoredBuildings();
  const units = getStoredUnits();
  
  const existingIndex = buildings.findIndex(b => b.id === data.id);
  const buildingUnitsCount = units.filter(u => u.building_id === data.id).length;
  
  const buildingDoc: FirestoreBuilding = {
    ...data,
    total_units: buildingUnitsCount
  };

  if (existingIndex >= 0) {
    buildings[existingIndex] = buildingDoc;
  } else {
    buildings.push(buildingDoc);
  }
  
  saveStoredBuildings(buildings);

  // Trigger: Fire on building update -> propagates landlord_id and management_company_id to all units
  triggerOnBuildingUpdated(buildingDoc.id, buildingDoc.landlord_id, buildingDoc.management_company_id);

  return buildingDoc;
}

/**
 * Cloud Function Trigger: Fires on building update or unit creation.
 * Automatically copies building's landlord_id and management_company_id to all units in that building.
 */
export function triggerOnBuildingUpdated(buildingId: string, landlordId: string, managementCompanyId?: string | null): void {
  const units = getStoredUnits();
  let updated = false;

  const newUnits = units.map(u => {
    if (u.building_id === buildingId) {
      if (u.landlord_id !== landlordId || u.management_company_id !== (managementCompanyId || null)) {
        updated = true;
        return {
          ...u,
          landlord_id: landlordId,
          management_company_id: managementCompanyId || null
        };
      }
    }
    return u;
  });

  if (updated) {
    saveStoredUnits(newUnits);
  }

  // Also update Building's total_units count
  const buildings = getStoredBuildings();
  const bIndex = buildings.findIndex(b => b.id === buildingId);
  if (bIndex >= 0) {
    const totalCount = newUnits.filter(u => u.building_id === buildingId).length;
    if (buildings[bIndex].total_units !== totalCount) {
      buildings[bIndex].total_units = totalCount;
      saveStoredBuildings(buildings);
    }
  }
}

/**
 * Creates a new Unit in the units collection.
 * landlord_id and management_company_id are automatically inherited from the parent building.
 */
export function createUnit(data: Omit<FirestoreUnit, 'id' | 'landlord_id' | 'management_company_id' | 'created_at'> & { building_id: string }): FirestoreUnit {
  const buildings = getStoredBuildings();
  const parentBuilding = buildings.find(b => b.id === data.building_id);

  if (!parentBuilding) {
    throw new Error(`Parent Building with ID ${data.building_id} not found.`);
  }

  const unitId = `unit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const newUnit: FirestoreUnit = {
    ...data,
    id: unitId,
    // AUTOMATIC INHERITANCE FROM BUILDING (Never entered manually)
    landlord_id: parentBuilding.landlord_id,
    management_company_id: parentBuilding.management_company_id || null,
    created_at: new Date().toISOString()
  };

  const units = getStoredUnits();
  units.push(newUnit);
  saveStoredUnits(units);

  // Recalculate parent building total_units
  triggerOnBuildingUpdated(parentBuilding.id, parentBuilding.landlord_id, parentBuilding.management_company_id);

  return newUnit;
}

// ==========================================
// STEP 2: TENANT PROFILES & TENANCIES
// ==========================================

/**
 * Updates a tenant's profile and maintains active/historical tenancy pointers.
 */
export function updateTenantProfileCurrentTenancy(tenantUserId: string, newTenancyId: string | null): void {
  const profiles = getStoredTenantProfiles();
  const index = profiles.findIndex(p => p.id === tenantUserId || p.user_id === tenantUserId);

  if (index >= 0) {
    profiles[index].current_tenancy_id = newTenancyId;
    profiles[index].updated_at = new Date().toISOString();
    saveStoredTenantProfiles(profiles);
  }
}

// ==========================================
// STEP 3: INVITATION SYSTEM
// ==========================================

/**
 * Creates a new tenant invitation in a single Cloud Function call.
 * Generates tenant_id_code (UH-TNT-XXXXXX), unique 8-char invitation_code, invitation_link, qr_code_url,
 * sets expires_at to +14 days, status to 'pending', and returns the invitation package immediately.
 */
export function createTenantInvitation(params: {
  landlord_id: string;
  unit_id: string;
  building_id: string;
  pre_filled_data: InvitationPreFilledData;
}): FirestoreTenantInvitation {
  const invitations = getStoredInvitations();
  
  const tenantIdCode = generateTenantIdCode();
  const invitationCode = generateInvitationCode();
  const invitationLink = `unityhomes.ng/join/${invitationCode}`;
  const qrCodeUrl = generateQRCodeDataUrl(`https://${invitationLink}`);
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(); // +14 days

  const newInvitation: FirestoreTenantInvitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    landlord_id: params.landlord_id,
    unit_id: params.unit_id,
    building_id: params.building_id,
    tenant_id_code: tenantIdCode,
    pre_filled_data: params.pre_filled_data,
    invitation_code: invitationCode,
    invitation_link: invitationLink,
    qr_code_url: qrCodeUrl,
    status: 'pending',
    expires_at: expiresAt,
    created_at: now.toISOString(),
    accepted_at: null,
    tenant_user_id: null
  };

  invitations.push(newInvitation);
  saveStoredInvitations(invitations);

  return newInvitation;
}

/**
 * Regenerates an expired or active invitation code.
 * Invalidates old invitation by setting status to 'expired', and creates a fresh invitation code & 14-day window.
 */
export function regenerateTenantInvitation(oldInvitationId: string): FirestoreTenantInvitation {
  const invitations = getStoredInvitations();
  const oldIndex = invitations.findIndex(i => i.id === oldInvitationId);

  if (oldIndex >= 0) {
    invitations[oldIndex].status = 'expired';
    saveStoredInvitations(invitations);
    
    return createTenantInvitation({
      landlord_id: invitations[oldIndex].landlord_id,
      unit_id: invitations[oldIndex].unit_id,
      building_id: invitations[oldIndex].building_id,
      pre_filled_data: invitations[oldIndex].pre_filled_data
    });
  }

  throw new Error('Original invitation not found.');
}

/**
 * Cloud Function validation representation for unauthenticated visitors.
 * Lookup by invitation_code. Returns status or invitation object.
 */
export function validateInvitationByCode(code: string): {
  valid: boolean;
  status?: 'not_found' | 'expired' | 'accepted' | 'pending';
  invitation?: FirestoreTenantInvitation;
  errorMessage?: string;
} {
  // Trigger expiry check prior to validation
  checkAndExpireTenantInvitations();

  const invitations = getStoredInvitations();
  const inv = invitations.find(i => i.invitation_code.toUpperCase() === code.trim().toUpperCase());

  if (!inv) {
    return {
      valid: false,
      status: 'not_found',
      errorMessage: 'This invitation link is not valid. Please contact your landlord for a new link.'
    };
  }

  if (inv.status === 'expired') {
    return {
      valid: false,
      status: 'expired',
      errorMessage: 'This invitation has expired. Please contact your landlord to send a new invitation.'
    };
  }

  if (inv.status === 'accepted') {
    return {
      valid: false,
      status: 'accepted',
      errorMessage: 'This invitation has already been accepted and activated.'
    };
  }

  return {
    valid: true,
    status: 'pending',
    invitation: inv
  };
}

/**
 * Calculates Move-In Readiness checklist for a tenant profile.
 */
export function calculateMoveInReadiness(profile: Partial<FirestoreTenantProfile>): MoveInReadiness {
  const phoneVerified = true; // Set during phone OTP step
  const emailVerified = true; // Set during email OTP step
  const profilePhotoUploaded = Boolean(profile.passport_photo && profile.passport_photo.length > 10);
  const emergencyContactAdded = Boolean(profile.emergency_contact_name && profile.emergency_contact_name.trim().length > 0);
  const guarantorConfirmed = Boolean(profile.guarantor_confirmed === true);
  const leaseDocumentUploaded = true; // Signed agreement document created during invitation / tenancy setup

  let completedMandatory = 0;
  if (phoneVerified) completedMandatory++;
  if (emailVerified) completedMandatory++;
  if (profilePhotoUploaded) completedMandatory++;
  if (emergencyContactAdded) completedMandatory++;
  if (guarantorConfirmed) completedMandatory++;
  if (leaseDocumentUploaded) completedMandatory++;

  const completionPercentage = Math.round((completedMandatory / 6) * 100);

  return {
    phone_verified: phoneVerified,
    email_verified: emailVerified,
    profile_photo_uploaded: profilePhotoUploaded,
    emergency_contact_added: emergencyContactAdded,
    guarantor_confirmed: guarantorConfirmed,
    lease_document_uploaded: leaseDocumentUploaded,
    government_id_uploaded: Boolean(profile.government_id_photo),
    selfie_submitted: Boolean(profile.verification_selfie_photo),
    identity_verified: Boolean(profile.verified_badge),
    completion_percentage: completionPercentage
  };
}

/**
 * Cloud Function Trigger on Invitation Acceptance:
 * Creates user doc, tenant_profiles document, tenancy document, updates unit to occupied,
 * updates invitation to accepted, writes activityLog entry, and notifies landlord.
 */
export function acceptTenantInvitation(invitationCode: string, tenantUserId: string): {
  invitation: FirestoreTenantInvitation;
  tenancy: FirestoreTenancy;
  profile: FirestoreTenantProfile;
} {
  const validation = validateInvitationByCode(invitationCode);
  if (!validation.valid || !validation.invitation) {
    throw new Error(validation.errorMessage || 'Invalid or expired invitation code.');
  }

  const invitation = validation.invitation;
  const invitations = getStoredInvitations();
  const invIndex = invitations.findIndex(i => i.id === invitation.id);

  // Find unit & building
  const units = getStoredUnits();
  const unit = units.find(u => u.id === invitation.unit_id);
  
  const buildings = getStoredBuildings();
  const building = buildings.find(b => b.id === invitation.building_id);

  const landlordId = invitation.landlord_id;
  const managementCompanyId = building?.management_company_id || unit?.management_company_id || null;

  const pre = invitation.pre_filled_data;
  const tenantName = pre.tenantFullName || pre.fullName || 'New Tenant';

  // 1. Create Tenancy document automatically
  const tenancyId = `tenancy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const tenancy: FirestoreTenancy = {
    id: tenancyId,
    tenant_id: tenantUserId,
    unit_id: invitation.unit_id,
    building_id: invitation.building_id,
    landlord_id: landlordId,
    management_company_id: managementCompanyId,
    lease_start_date: pre.leaseStartDate,
    lease_end_date: pre.leaseEndDate,
    lease_amount: pre.leaseAmount,
    rent_frequency: pre.rentFrequency || 'Annual',
    caution_deposit_amount: pre.cautionDepositAmount || 0,
    signed_agreement_doc: pre.signedAgreementDoc || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    offline_id_doc: pre.offlineIdDoc,
    inspection_photos: pre.inspectionPhotos,
    status: 'active',
    created_at: new Date().toISOString()
  };

  const tenancies = getStoredTenancies();
  tenancies.push(tenancy);
  saveStoredTenancies(tenancies);

  // 2. Update Unit occupancy_status to occupied & current_tenant_id
  if (unit) {
    unit.current_tenant_id = tenantUserId;
    unit.occupancy_status = 'occupied';
    saveStoredUnits(units);
  }

  // 3. Create / Update Tenant Profile & calculate Move-In Readiness
  const profiles = getStoredTenantProfiles();
  let profile = profiles.find(p => p.id === tenantUserId || p.user_id === tenantUserId);

  const partialProfileData = {
    full_name: tenantName,
    phone: pre.phone,
    whatsapp: pre.whatsapp || pre.phone,
    email: pre.email,
    dob: pre.dob,
    country: pre.country || 'Nigeria',
    occupation: pre.occupation,
    employer: pre.employer,
    nin: pre.nin,
    emergency_contact_name: pre.emergencyContactName,
    emergency_contact_phone: pre.emergencyContactPhone,
    emergency_contact_relationship: pre.emergencyContactRelationship,
    guarantor_name: pre.guarantorName,
    guarantor_phone: pre.guarantorPhone,
    guarantor_whatsapp: pre.guarantorWhatsapp,
    guarantor_occupation: pre.guarantorOccupation,
    guarantor_employer: pre.guarantorEmployer,
    guarantor_address: pre.guarantorAddress,
    guarantor_relationship: pre.guarantorRelationship,
    guarantor_confirmed: true, // Default confirmed when set by landlord during invite creation
    current_tenancy_id: tenancyId
  };

  if (profile) {
    Object.assign(profile, partialProfileData);
    profile.move_in_readiness = calculateMoveInReadiness(profile);
    profile.updated_at = new Date().toISOString();
  } else {
    profile = {
      id: tenantUserId,
      user_id: tenantUserId,
      ...partialProfileData,
      created_at: new Date().toISOString()
    };
    profile.move_in_readiness = calculateMoveInReadiness(profile);
    profiles.push(profile);
  }
  saveStoredTenantProfiles(profiles);

  // 4. Update Invitation status to accepted
  if (invIndex >= 0) {
    invitations[invIndex].status = 'accepted';
    invitations[invIndex].accepted_at = new Date().toISOString();
    invitations[invIndex].tenant_user_id = tenantUserId;
    saveStoredInvitations(invitations);
  }

  // 5. Activity Log Entry
  const unitName = unit ? unit.unit_name : 'Flat';
  logActivityEvent({
    event_type: 'Tenant Account Activated via Invitation',
    description: `Tenant ${tenantName} activated their account for ${unitName} using invitation code ${invitationCode}.`,
    actor_id: tenantUserId,
    target_id: invitation.unit_id
  });

  // 6. Notify Landlord (in-app & email simulation)
  const notifMsg = `Your tenant ${tenantName} has successfully activated their Unity Homes account for ${unitName}. Their dashboard is now live. Check their Move-In Readiness Checklist to see what steps remain.`;
  sendLandlordInAppNotification(landlordId, notifMsg, invitation.id);

  return { invitation, tenancy, profile };
}

/**
 * Sends an in-app notification to tenant.
 */
export function sendTenantInAppNotification(tenantUserId: string, message: string): void {
  try {
    const raw = localStorage.getItem(TENANT_NOTIFICATIONS_KEY);
    const notifs = raw ? JSON.parse(raw) : [];
    notifs.push({
      id: `tnotif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantUserId,
      message,
      read: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(TENANT_NOTIFICATIONS_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to store tenant notification', e);
  }
}

export function getTenantInAppNotifications(tenantUserId: string): any[] {
  try {
    const raw = localStorage.getItem(TENANT_NOTIFICATIONS_KEY);
    if (!raw) return [];
    const notifs = JSON.parse(raw);
    return notifs.filter((n: any) => n.tenantUserId === tenantUserId);
  } catch (e) {
    return [];
  }
}

/**
 * Landlord sends a Move-In Readiness item reminder to tenant.
 */
export function remindTenantChecklist(tenantUserId: string, itemName: string): void {
  const msg = `Your landlord has asked you to complete your Move-In Readiness Checklist. ${itemName} is still pending. Please update this in your Profile or Dashboard.`;
  sendTenantInAppNotification(tenantUserId, msg);
}

// ==========================================
// LEVEL 2 VERIFIED TENANT BADGE FUNCTIONS
// ==========================================
export function getStoredVerificationRequests(): Level2VerificationRequest[] {
  try {
    const raw = localStorage.getItem(VERIFICATION_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredVerificationRequests(requests: Level2VerificationRequest[]): void {
  try {
    localStorage.setItem(VERIFICATION_REQUESTS_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Failed to save verification requests', e);
  }
}

export function submitLevel2VerificationRequest(params: {
  tenant_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email: string;
  nin?: string;
  id_type: string;
  government_id_photo: string;
  selfie_photo: string;
}): Level2VerificationRequest {
  const requests = getStoredVerificationRequests();
  const profiles = getStoredTenantProfiles();

  // Update profile with uploaded files
  const pIndex = profiles.findIndex(p => p.id === params.tenant_id || p.user_id === params.tenant_id);
  if (pIndex >= 0) {
    profiles[pIndex].government_id_photo = params.government_id_photo;
    profiles[pIndex].verification_selfie_photo = params.selfie_photo;
    profiles[pIndex].id_type = params.id_type;
    if (params.nin) profiles[pIndex].nin = params.nin;
    profiles[pIndex].move_in_readiness = calculateMoveInReadiness(profiles[pIndex]);
    saveStoredTenantProfiles(profiles);
  }

  // Duplicate NIN Check
  let duplicateWarning = false;
  let duplicateName = '';
  if (params.nin) {
    const existing = profiles.find(p => p.nin === params.nin && p.id !== params.tenant_id);
    if (existing) {
      duplicateWarning = true;
      duplicateName = existing.full_name;
    }
  }

  const newRequest: Level2VerificationRequest = {
    id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    tenant_id: params.tenant_id,
    tenant_name: params.tenant_name,
    tenant_phone: params.tenant_phone,
    tenant_email: params.tenant_email,
    nin: params.nin,
    id_type: params.id_type,
    government_id_photo: params.government_id_photo,
    selfie_photo: params.selfie_photo,
    status: 'Pending',
    nin_duplicate_warning: duplicateWarning,
    duplicate_nin_tenant_name: duplicateName,
    submitted_at: new Date().toISOString()
  };

  requests.push(newRequest);
  saveStoredVerificationRequests(requests);

  logActivityEvent({
    event_type: 'Level 2 Verification Request Submitted',
    description: `Tenant ${params.tenant_name} submitted Level 2 ID & Selfie verification.`,
    actor_id: params.tenant_id
  });

  return newRequest;
}

export function reviewLevel2VerificationRequest(requestId: string, decision: 'Approved' | 'Rejected', rejectionReason?: string): void {
  const requests = getStoredVerificationRequests();
  const reqIndex = requests.findIndex(r => r.id === requestId);

  if (reqIndex >= 0) {
    const req = requests[reqIndex];
    req.status = decision;
    req.rejection_reason = rejectionReason;
    req.reviewed_at = new Date().toISOString();
    saveStoredVerificationRequests(requests);

    const profiles = getStoredTenantProfiles();
    const pIndex = profiles.findIndex(p => p.id === req.tenant_id || p.user_id === req.tenant_id);
    if (pIndex >= 0) {
      if (decision === 'Approved') {
        profiles[pIndex].verified_badge = true;
      }
      profiles[pIndex].move_in_readiness = calculateMoveInReadiness(profiles[pIndex]);
      saveStoredTenantProfiles(profiles);
    }

    // Notify tenant
    const msg = decision === 'Approved'
      ? 'Congratulations! Your Level 2 Identity Verification was approved. You now have the Unity Homes Verified Tenant badge!'
      : `Your Level 2 Identity Verification was rejected. Reason: ${rejectionReason || 'Documents unclear'}`;
    sendTenantInAppNotification(req.tenant_id, msg);
  }
}

// ==========================================
// STEP 5: INVITATION EXPIRY ENFORCEMENT
// ==========================================

/**
 * Cloud Function Trigger (Daily Cron):
 * Checks all tenant_invitations where status === 'pending' and expires_at is in the past.
 * Sets status to 'expired' and sends an in-app notification to the landlord.
 */
export function checkAndExpireTenantInvitations(): number {
  const invitations = getStoredInvitations();
  const units = getStoredUnits();
  const now = new Date();
  let expiredCount = 0;

  const updatedInvitations = invitations.map(inv => {
    if (inv.status === 'pending' && new Date(inv.expires_at) < now) {
      inv.status = 'expired';
      expiredCount++;

      // Send in-app notification to landlord
      const unit = units.find(u => u.id === inv.unit_id);
      const unitName = unit ? unit.unit_name : 'your unit';
      const tenantName = inv.pre_filled_data.fullName || 'Prospective Tenant';
      
      const message = `Your invitation for ${tenantName} at ${unitName} has expired. You can generate a new invitation from the tenant management section.`;
      sendLandlordInAppNotification(inv.landlord_id, message, inv.id);
    }
    return inv;
  });

  if (expiredCount > 0) {
    saveStoredInvitations(updatedInvitations);
  }

  return expiredCount;
}

/**
 * Helper to dispatch in-app notifications to landlord
 */
export function sendLandlordInAppNotification(landlordId: string, message: string, invitationId: string): void {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifs = raw ? JSON.parse(raw) : [];
    notifs.push({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      landlordId,
      invitationId,
      message,
      read: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to store notification', e);
  }
}

export function getLandlordInAppNotifications(landlordId: string): any[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    const notifs = JSON.parse(raw);
    return notifs.filter((n: any) => n.landlordId === landlordId);
  } catch (e) {
    return [];
  }
}

// ==========================================
// INITIAL SEED DATA FOR DEMO & BACKWARD COMPATIBILITY
// ==========================================
function getInitialSeedBuildings(): FirestoreBuilding[] {
  return [
    {
      id: 'bldg-fashola-surulere',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      building_name: 'Fashola Court Surulere',
      building_number: '14 Afolabi Street',
      address_street: '14 Afolabi Street',
      address_area: 'Surulere',
      address_state: 'Lagos',
      cover_photo_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      total_units: 4,
      created_at: '2025-01-10T10:00:00.000Z',
      is_active: true
    },
    {
      id: 'bldg-fashola-yaba',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      building_name: 'Fashola Annex Yaba',
      building_number: '8 Iwaya Road',
      address_street: '8 Iwaya Road',
      address_area: 'Yaba',
      address_state: 'Lagos',
      cover_photo_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
      total_units: 3,
      created_at: '2025-02-01T10:00:00.000Z',
      is_active: true
    },
    {
      id: 'bldg-funmi-lekki-heights',
      landlord_id: 'UH-LANDLORD-FUNMI',
      management_company_id: null,
      building_name: 'Adebayo Lekki Heights',
      building_number: 'Block 2, Plot 14',
      address_street: 'Admiralty Way',
      address_area: 'Lekki Phase 1',
      address_state: 'Lagos',
      cover_photo_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      total_units: 3,
      created_at: '2025-01-15T10:00:00.000Z',
      is_active: true
    }
  ];
}

function getInitialSeedUnits(): FirestoreUnit[] {
  return [
    {
      id: 'unit-fashola-a1',
      building_id: 'bldg-fashola-surulere',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      unit_name: 'Unit A1',
      unit_type: 'two bedroom',
      annual_rent: 800000,
      current_tenant_id: 'tenant-ngozi-okafor',
      occupancy_status: 'occupied',
      collection_account_id: 'acc-zenith-4853',
      created_at: '2025-01-10T10:30:00.000Z'
    },
    {
      id: 'unit-fashola-a2',
      building_id: 'bldg-fashola-surulere',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      unit_name: 'Unit A2',
      unit_type: 'two bedroom',
      annual_rent: 800000,
      current_tenant_id: 'tenant-emeka-dike',
      occupancy_status: 'occupied',
      collection_account_id: 'acc-zenith-4853',
      created_at: '2025-01-10T10:35:00.000Z'
    },
    {
      id: 'unit-fashola-a3',
      building_id: 'bldg-fashola-surulere',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      unit_name: 'Unit A3',
      unit_type: 'two bedroom',
      annual_rent: 800000,
      current_tenant_id: null,
      occupancy_status: 'vacant',
      collection_account_id: 'acc-zenith-4853',
      created_at: '2025-01-10T10:40:00.000Z'
    },
    {
      id: 'unit-fashola-a4',
      building_id: 'bldg-fashola-surulere',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      unit_name: 'Unit A4',
      unit_type: 'two bedroom',
      annual_rent: 700000,
      current_tenant_id: 'tenant-taiwo-adeyemi',
      occupancy_status: 'occupied',
      collection_account_id: 'acc-zenith-4853',
      created_at: '2025-01-10T10:45:00.000Z'
    },
    {
      id: 'unit-fashola-annex-1',
      building_id: 'bldg-fashola-yaba',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      unit_name: 'Unit 1',
      unit_type: 'one bedroom',
      annual_rent: 600000,
      current_tenant_id: 'tenant-fatima-bello',
      occupancy_status: 'occupied',
      collection_account_id: 'acc-zenith-4853',
      created_at: '2025-02-01T11:00:00.000Z'
    },
    {
      id: 'unit-fashola-annex-2',
      building_id: 'bldg-fashola-yaba',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      unit_name: 'Unit 2',
      unit_type: 'one bedroom',
      annual_rent: 600000,
      current_tenant_id: null,
      occupancy_status: 'vacant',
      collection_account_id: 'acc-zenith-4853',
      created_at: '2025-02-01T11:05:00.000Z'
    },
    {
      id: 'unit-fashola-annex-3',
      building_id: 'bldg-fashola-yaba',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      unit_name: 'Unit 3',
      unit_type: 'one bedroom',
      annual_rent: 650000,
      current_tenant_id: 'tenant-chukwuemeka-osei',
      occupancy_status: 'occupied',
      collection_account_id: 'acc-zenith-4853',
      created_at: '2025-02-01T11:10:00.000Z'
    }
  ];
}

function getInitialSeedTenantProfiles(): FirestoreTenantProfile[] {
  return [
    {
      id: 'tenant-ngozi-okafor',
      user_id: 'tenant-ngozi-okafor',
      full_name: 'Ngozi Okafor',
      phone: '08031112233',
      email: 'ngozi.okafor@example.com',
      occupation: 'Corporate Lawyer',
      employer: 'Aluko & Oyebode',
      guarantor_name: 'Chief Chidi Okafor',
      guarantor_phone: '08023334455',
      guarantor_occupation: 'Senior Consultant',
      guarantor_address: '12 Ikoyi Crescent, Lagos',
      current_tenancy_id: 'tenancy-ngozi-fashola-a1',
      verified_badge: true,
      verified_badge_date: '2024-06-15T10:00:00.000Z',
      verified_badge_issuer: 'UH-LANDLORD-ADEYINKA',
      nin: '12345678901',
      nin_verified: true,
      phone_verified: true,
      email_verified: true,
      passport_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      government_id_photo: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=400&q=80',
      verification_selfie_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      signed_lease_url: 'https://example.com/lease-ngozi.pdf',
      move_in_readiness: {
        personal_info_completed: true,
        emergency_contact_completed: true,
        guarantor_info_completed: true,
        government_id_uploaded: true,
        selfie_uploaded: true,
        lease_agreement_signed: true
      },
      created_at: '2023-05-01T10:00:00.000Z'
    },
    {
      id: 'tenant-emeka-dike',
      user_id: 'tenant-emeka-dike',
      full_name: 'Emeka Dike',
      phone: '08032223344',
      email: 'emeka.dike@example.com',
      occupation: 'Financial Analyst',
      employer: 'KPMG Nigeria',
      guarantor_name: 'Engr. Jide Dike',
      guarantor_phone: '08024445566',
      guarantor_occupation: 'Civil Engineer',
      guarantor_address: '25 Allen Avenue, Ikeja',
      current_tenancy_id: 'tenancy-emeka-fashola-a2',
      verified_badge: false,
      nin_verified: false,
      phone_verified: true,
      email_verified: true,
      passport_photo: undefined,
      signed_lease_url: undefined,
      move_in_readiness: {
        personal_info_completed: true,
        emergency_contact_completed: true,
        guarantor_info_completed: true,
        government_id_uploaded: true,
        selfie_uploaded: false,
        lease_agreement_signed: false
      },
      created_at: '2025-08-01T10:00:00.000Z'
    },
    {
      id: 'tenant-taiwo-adeyemi',
      user_id: 'tenant-taiwo-adeyemi',
      full_name: 'Taiwo Adeyemi',
      phone: '08033334455',
      email: 'taiwo.adeyemi@example.com',
      occupation: 'Product Designer',
      employer: 'Interswitch',
      guarantor_name: 'Dr. Samuel Adeyemi',
      guarantor_phone: '08025556677',
      current_tenancy_id: 'tenancy-taiwo-fashola-a4',
      verified_badge: true,
      phone_verified: true,
      email_verified: true,
      move_in_readiness: {
        personal_info_completed: true,
        emergency_contact_completed: true,
        guarantor_info_completed: true,
        government_id_uploaded: true,
        selfie_uploaded: true,
        lease_agreement_signed: true
      },
      created_at: '2025-08-20T10:00:00.000Z'
    },
    {
      id: 'tenant-fatima-bello',
      user_id: 'tenant-fatima-bello',
      full_name: 'Fatima Bello',
      phone: '08034445566',
      email: 'fatima.bello@example.com',
      occupation: 'Content Strategist',
      employer: 'GidiMedia',
      guarantor_name: 'Senator Gidado Bello',
      guarantor_phone: '08026667788',
      current_tenancy_id: 'tenancy-fatima-fashola-1',
      verified_badge: true,
      phone_verified: true,
      email_verified: true,
      passport_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      signed_lease_url: 'https://example.com/lease-fatima.pdf',
      move_in_readiness: {
        personal_info_completed: true,
        emergency_contact_completed: true,
        guarantor_info_completed: true,
        government_id_uploaded: true,
        selfie_uploaded: true,
        lease_agreement_signed: true
      },
      created_at: '2025-09-01T10:00:00.000Z'
    },
    {
      id: 'tenant-chukwuemeka-osei',
      user_id: 'tenant-chukwuemeka-osei',
      full_name: 'Chukwuemeka Osei',
      phone: '08035556677',
      email: 'chukwuemeka.osei@example.com',
      occupation: 'Architect',
      employer: 'Studio Osei',
      guarantor_name: 'Engr. Kwame Osei',
      guarantor_phone: '08027778899',
      current_tenancy_id: 'tenancy-chukwuemeka-fashola-3',
      verified_badge: false,
      phone_verified: true,
      email_verified: true,
      move_in_readiness: {
        personal_info_completed: true,
        emergency_contact_completed: true,
        guarantor_info_completed: true,
        government_id_uploaded: true,
        selfie_uploaded: true,
        lease_agreement_signed: true
      },
      created_at: '2025-10-01T10:00:00.000Z'
    }
  ];
}

function getInitialSeedTenancies(): FirestoreTenancy[] {
  return [
    {
      id: 'tenancy-ngozi-fashola-a1',
      tenant_id: 'tenant-ngozi-okafor',
      unit_id: 'unit-fashola-a1',
      building_id: 'bldg-fashola-surulere',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      lease_start_date: '2025-08-01',
      lease_end_date: '2026-07-31',
      lease_amount: 800000,
      caution_deposit_amount: 100000,
      status: 'active',
      created_at: '2025-08-01T10:00:00.000Z'
    },
    {
      id: 'tenancy-ngozi-adeyinka-past',
      tenant_id: 'tenant-ngozi-okafor',
      unit_id: 'unit-adeyinka-flat3',
      building_id: 'bldg-adeyinka-palms',
      landlord_id: 'UH-LANDLORD-ADEYINKA',
      management_company_id: null,
      lease_start_date: '2023-05-01',
      lease_end_date: '2025-05-01',
      lease_amount: 750000,
      caution_deposit_amount: 100000,
      status: 'terminated',
      created_at: '2023-05-01T10:00:00.000Z'
    },
    {
      id: 'tenancy-emeka-fashola-a2',
      tenant_id: 'tenant-emeka-dike',
      unit_id: 'unit-fashola-a2',
      building_id: 'bldg-fashola-surulere',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      lease_start_date: '2025-08-01',
      lease_end_date: '2026-07-31',
      lease_amount: 800000,
      caution_deposit_amount: 100000,
      status: 'active',
      created_at: '2025-08-01T10:00:00.000Z'
    },
    {
      id: 'tenancy-taiwo-fashola-a4',
      tenant_id: 'tenant-taiwo-adeyemi',
      unit_id: 'unit-fashola-a4',
      building_id: 'bldg-fashola-surulere',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      lease_start_date: '2025-08-29',
      lease_end_date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lease_amount: 700000,
      caution_deposit_amount: 100000,
      status: 'active',
      created_at: '2025-08-29T10:00:00.000Z'
    },
    {
      id: 'tenancy-fatima-fashola-1',
      tenant_id: 'tenant-fatima-bello',
      unit_id: 'unit-fashola-annex-1',
      building_id: 'bldg-fashola-yaba',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      lease_start_date: '2025-09-01',
      lease_end_date: '2026-08-31',
      lease_amount: 600000,
      caution_deposit_amount: 50000,
      status: 'active',
      created_at: '2025-09-01T10:00:00.000Z'
    },
    {
      id: 'tenancy-chukwuemeka-fashola-3',
      tenant_id: 'tenant-chukwuemeka-osei',
      unit_id: 'unit-fashola-annex-3',
      building_id: 'bldg-fashola-yaba',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      lease_start_date: '2025-10-01',
      lease_end_date: '2026-09-30',
      lease_amount: 650000,
      caution_deposit_amount: 50000,
      status: 'active',
      created_at: '2025-10-01T10:00:00.000Z'
    }
  ];
}

function getInitialSeedInvitations(): FirestoreTenantInvitation[] {
  const now = new Date();
  const created3DaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const expires11DaysFromNow = new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000);

  const created16DaysAgo = new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000);
  const expired2DaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://unityhomes.app';

  return [
    {
      id: 'inv-fashola-a3-bisi',
      tenant_id_code: 'UH-TNT-908122',
      invitation_code: 'BISI-A3FA',
      invitation_link: `${origin}/register-tenant?code=BISI-A3FA`,
      qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BISI-A3FA',
      unit_id: 'unit-fashola-a3',
      building_id: 'bld-fashola-court',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      pre_filled_data: {
        tenantFullName: 'Bisi Adebola',
        fullName: 'Bisi Adebola',
        phone: '08033445566',
        email: 'bisi.adebola@example.com',
        occupation: 'Marketing Strategist',
        employer: 'Flutterwave',
        guarantorName: 'Dr. Kemi Adebola',
        guarantorPhone: '08021112233',
        leaseAmount: 800000,
        leaseStartDate: '2026-08-01',
        leaseEndDate: '2027-07-31',
        cautionDeposit: 100000
      },
      delivery_channels: ['whatsapp', 'email', 'sms'],
      delivery_status: { whatsapp: 'delivered', email: 'delivered', sms: 'delivered' },
      status: 'pending',
      created_at: created3DaysAgo.toISOString(),
      expires_at: expires11DaysFromNow.toISOString()
    },
    {
      id: 'inv-fashola-annex2-tosin',
      tenant_id_code: 'UH-TNT-771239',
      invitation_code: 'TOSI-AN2X',
      invitation_link: `${origin}/register-tenant?code=TOSI-AN2X`,
      qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TOSI-AN2X',
      unit_id: 'unit-fashola-annex-2',
      building_id: 'bld-fashola-court',
      landlord_id: 'UH-LANDLORD-FASHOLA',
      management_company_id: null,
      pre_filled_data: {
        tenantFullName: 'Tosin Eke',
        fullName: 'Tosin Eke',
        phone: '08055556677',
        email: 'tosin.eke@example.com',
        occupation: 'Product Manager',
        employer: 'Andela',
        guarantorName: 'Chief Funso Eke',
        guarantorPhone: '08029990011',
        leaseAmount: 600000,
        leaseStartDate: '2026-08-01',
        leaseEndDate: '2027-07-31',
        cautionDeposit: 50000
      },
      delivery_channels: ['whatsapp', 'email'],
      delivery_status: { whatsapp: 'delivered', email: 'delivered' },
      status: 'expired',
      created_at: created16DaysAgo.toISOString(),
      expires_at: expired2DaysAgo.toISOString()
    }
  ];
}

export function loadPromptSixDemoData(): void {
  saveStoredBuildings(getInitialSeedBuildings());
  saveStoredUnits(getInitialSeedUnits());
  saveStoredTenantProfiles(getInitialSeedTenantProfiles());
  saveStoredTenancies(getInitialSeedTenancies());
  saveStoredInvitations(getInitialSeedInvitations());
}

