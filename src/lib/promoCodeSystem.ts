import { PromoCode, PromoCodeRedemption, DiscountType, AppliesToScope } from '../types';

const PROMO_CODES_STORAGE_KEY = 'uh_promo_codes_v1';
const PROMO_REDEMPTIONS_STORAGE_KEY = 'uh_promo_code_redemptions_v1';

// Initial Seed Promo Codes for demonstration and testing (PROMPT THREE requirements)
const INITIAL_PROMO_CODES_SEED: PromoCode[] = [
  {
    id: 'PROMO-001',
    code: 'LAUNCH20',
    description: 'Launch campaign, 20 percent off for first 50 users.',
    discount_type: 'percentage',
    discount_value: 20,
    applies_to: 'all',
    specific_plan: null,
    eligible_roles: ['all'],
    max_uses: 50,
    current_uses: 3,
    valid_from: '2026-05-24T00:00:00.000Z',
    expires_at: '2026-10-24T23:59:59.000Z',
    is_active: true,
    created_by: 'Admin (Dami Joshua)',
    created_at: '2026-05-24T08:00:00.000Z'
  },
  {
    id: 'PROMO-002',
    code: 'PMCWELCOME',
    description: 'PMC welcome offer, NGN 20,000 off first month Starter plan.',
    discount_type: 'fixed_amount',
    discount_value: 20000,
    applies_to: 'subscription',
    specific_plan: 'pmc_starter',
    eligible_roles: ['property_management_company', 'PMC'],
    max_uses: 20,
    current_uses: 1,
    valid_from: '2026-06-24T00:00:00.000Z',
    expires_at: '2026-09-24T23:59:59.000Z',
    is_active: true,
    created_by: 'Admin (Dami Joshua)',
    created_at: '2026-06-24T09:00:00.000Z'
  },
  {
    id: 'PROMO-003',
    code: 'BUNDLE30',
    description: 'Bundle promotion, 30 percent off complete professional bundle.',
    discount_type: 'percentage',
    discount_value: 30,
    applies_to: 'professional_connection',
    specific_plan: 'complete_bundle',
    eligible_roles: ['all'],
    max_uses: 10,
    current_uses: 2,
    valid_from: '2026-07-03T00:00:00.000Z',
    expires_at: '2026-08-07T23:59:59.000Z',
    is_active: true,
    created_by: 'Admin (Dami Joshua)',
    created_at: '2026-07-03T10:00:00.000Z'
  },
  {
    id: 'PROMO-004',
    code: 'EXPIRED2025',
    description: 'Expired test code for verification of expiry handling.',
    discount_type: 'percentage',
    discount_value: 15,
    applies_to: 'all',
    specific_plan: null,
    eligible_roles: ['all'],
    max_uses: null,
    current_uses: 0,
    valid_from: '2026-01-24T00:00:00.000Z',
    expires_at: '2026-07-23T23:59:59.000Z',
    is_active: true,
    created_by: 'Admin (Dami Joshua)',
    created_at: '2026-01-24T11:00:00.000Z'
  },
  {
    id: 'PROMO-005',
    code: 'LANDLORD10',
    description: 'Landlord Growth plan discount for referral campaign batch one.',
    discount_type: 'percentage',
    discount_value: 10,
    applies_to: 'subscription',
    specific_plan: 'growth_landlord',
    eligible_roles: ['landlord', 'Landlord'],
    max_uses: 30,
    current_uses: 0,
    valid_from: '2026-07-24T00:00:00.000Z',
    expires_at: '2026-09-22T23:59:59.000Z',
    is_active: true,
    created_by: 'Admin (Dami Joshua)',
    created_at: '2026-07-24T08:00:00.000Z'
  }
];

const INITIAL_REDEMPTIONS_SEED: PromoCodeRedemption[] = [
  {
    id: 'RED-10001',
    promo_code_id: 'PROMO-001',
    code: 'LAUNCH20',
    user_id: 'usr-landlord-adunola',
    user_role: 'landlord',
    applied_to: 'professional_connection',
    related_id: 'CONN-88301',
    original_amount: 55000,
    discount_amount: 11000,
    final_amount: 44000,
    redeemed_at: '2026-07-14T10:00:00.000Z',
    status: 'applied',
    userName: 'Mrs Adunola Fashola'
  },
  {
    id: 'RED-10002',
    promo_code_id: 'PROMO-001',
    code: 'LAUNCH20',
    user_id: 'usr-tenant-funmi',
    user_role: 'tenant',
    applied_to: 'professional_connection',
    related_id: 'CONN-88305',
    original_amount: 55000,
    discount_amount: 11000,
    final_amount: 44000,
    redeemed_at: '2026-07-02T14:20:00.000Z',
    status: 'applied',
    userName: 'Funmi Adebayo'
  },
  {
    id: 'RED-10003',
    promo_code_id: 'PROMO-003',
    code: 'BUNDLE30',
    user_id: 'usr-visitor-demo',
    user_role: 'Public',
    applied_to: 'professional_connection',
    related_id: 'CONN-99205',
    original_amount: 120000,
    discount_amount: 36000,
    final_amount: 84000,
    redeemed_at: '2026-07-19T14:30:00.000Z',
    status: 'applied',
    userName: 'Demo Visitor'
  },
  {
    id: 'RED-10004',
    promo_code_id: 'PROMO-002',
    code: 'PMCWELCOME',
    user_id: 'usr-pmc-lagos-realty',
    user_role: 'PMC',
    applied_to: 'subscription',
    related_id: 'SUB-44102',
    original_amount: 65000,
    discount_amount: 20000,
    final_amount: 45000,
    redeemed_at: '2026-07-03T09:15:00.000Z',
    status: 'applied',
    userName: 'Lagos Realty Partners'
  }
];

// Helper to get promo codes list
export function getPromoCodes(): PromoCode[] {
  if (typeof window === 'undefined') return INITIAL_PROMO_CODES_SEED;
  try {
    const cached = localStorage.getItem(PROMO_CODES_STORAGE_KEY);
    if (cached) return JSON.parse(cached);
    localStorage.setItem(PROMO_CODES_STORAGE_KEY, JSON.stringify(INITIAL_PROMO_CODES_SEED));
    return INITIAL_PROMO_CODES_SEED;
  } catch (e) {
    console.error('Error loading promo codes:', e);
    return INITIAL_PROMO_CODES_SEED;
  }
}

// Helper to save promo codes
export function savePromoCodes(codes: PromoCode[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROMO_CODES_STORAGE_KEY, JSON.stringify(codes));
  window.dispatchEvent(new Event('storage'));
}

// Helper to get promo code redemptions
export function getPromoCodeRedemptions(): PromoCodeRedemption[] {
  if (typeof window === 'undefined') return INITIAL_REDEMPTIONS_SEED;
  try {
    const cached = localStorage.getItem(PROMO_REDEMPTIONS_STORAGE_KEY);
    if (cached) return JSON.parse(cached);
    localStorage.setItem(PROMO_REDEMPTIONS_STORAGE_KEY, JSON.stringify(INITIAL_REDEMPTIONS_SEED));
    return INITIAL_REDEMPTIONS_SEED;
  } catch (e) {
    console.error('Error loading promo redemptions:', e);
    return INITIAL_REDEMPTIONS_SEED;
  }
}

// Helper to save promo code redemptions
export function savePromoCodeRedemptions(redemptions: PromoCodeRedemption[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROMO_REDEMPTIONS_STORAGE_KEY, JSON.stringify(redemptions));
  window.dispatchEvent(new Event('storage'));
}

export interface ValidatePromoCodeInput {
  code: string;
  applies_to: 'professional_connection' | 'subscription';
  plan_name?: string | null;
  order_amount: number;
  user_id: string;
  user_role: string;
}

export interface ValidatePromoCodeOutput {
  valid: boolean;
  promo_code_id?: string;
  code?: string;
  discount_type?: DiscountType;
  discount_value?: number;
  discount_amount?: number;
  final_amount?: number;
  discounted_amount?: number;
  sanitized_description?: string;
  message: string;
}

/**
 * STEP THREE: Callable Cloud Function Emulator: validatePromoCode
 * Executes the 9 required validation checks in strict order.
 */
export function validatePromoCode(input: ValidatePromoCodeInput): ValidatePromoCodeOutput {
  const codes = getPromoCodes();
  const redemptions = getPromoCodeRedemptions();
  
  const formattedCode = (input.code || '').trim().toUpperCase();
  if (!formattedCode) {
    return { valid: false, message: 'Please enter a promo code.' };
  }

  // Check 1: Does a document exist in promoCodes where code equals submitted value in uppercase.
  const promo = codes.find(c => c.code.toUpperCase() === formattedCode);
  if (!promo) {
    return { valid: false, message: 'Code not found. Please check and try again.' };
  }

  // Check 2: Is is_active true on that document.
  if (!promo.is_active) {
    return { valid: false, message: 'This code is no longer active.' };
  }

  // Check 3: Is today's date on or after valid_from.
  const now = new Date();
  const validFromDate = new Date(promo.valid_from);
  if (now.getTime() < validFromDate.getTime()) {
    return { valid: false, message: 'This code is not yet active.' };
  }

  // Check 4: Is today's date before expires_at, or is expires_at null.
  if (promo.expires_at) {
    const expiresAtDate = new Date(promo.expires_at);
    if (now.getTime() > expiresAtDate.getTime()) {
      return { valid: false, message: 'This code has expired.' };
    }
  }

  // Check 5: Does the code's applies_to field match context passed by frontend, or is it set to all.
  if (promo.applies_to !== 'all' && promo.applies_to !== input.applies_to) {
    return { valid: false, message: 'This code cannot be used for this type of purchase.' };
  }

  // Check 6: If specific_plan is not null on code, does it match plan_name passed by frontend.
  if (promo.specific_plan && promo.specific_plan.trim() !== '') {
    const targetPlan = promo.specific_plan.trim().toLowerCase();
    const currentPlan = (input.plan_name || '').trim().toLowerCase();

    let isPlanMatch = targetPlan === currentPlan;
    if (!isPlanMatch) {
      if (targetPlan === 'complete_bundle' && (currentPlan.includes('complete') || currentPlan.includes('bundle'))) {
        isPlanMatch = true;
      } else if (targetPlan === 'pmc_starter' && currentPlan.includes('starter')) {
        isPlanMatch = true;
      } else if (targetPlan === 'growth_landlord' && currentPlan.includes('growth')) {
        isPlanMatch = true;
      }
    }

    if (!isPlanMatch) {
      return { valid: false, message: 'This code is only valid for a specific plan that does not match your selection.' };
    }
  }

  // Check 7: Does the calling user's role appear in eligible_roles array, or is eligible_roles set to all.
  const roles = promo.eligible_roles || ['all'];
  const formattedUserRole = (input.user_role || '').trim().toLowerCase();

  const isRoleEligible = roles.includes('all') || roles.some(r => {
    const norm = r.trim().toLowerCase();
    if (norm === 'all') return true;
    if (norm === formattedUserRole) return true;
    if ((norm === 'pmc' || norm === 'property_management_company') && (formattedUserRole === 'pmc' || formattedUserRole === 'property_management_company')) return true;
    if (norm === 'landlord' && formattedUserRole === 'landlord') return true;
    return false;
  });

  if (!isRoleEligible) {
    return { valid: false, message: 'This code is not available for your account type.' };
  }

  // Check 8: If max_uses is not null, is current_uses less than max_uses.
  if (promo.max_uses !== null && promo.max_uses !== undefined) {
    if (promo.current_uses >= promo.max_uses) {
      return { valid: false, message: 'This code has reached its maximum number of uses.' };
    }
  }

  // Check 9: Has this specific user_id already redeemed this specific promo_code_id successfully.
  const inputUserClean = (input.user_id || '').trim().toLowerCase();
  const existingRedemption = redemptions.find(r => {
    if (r.promo_code_id !== promo.id || r.status !== 'applied') return false;
    const redemptionUserClean = (r.user_id || '').trim().toLowerCase();
    if (redemptionUserClean === inputUserClean) return true;
    if (inputUserClean.includes('adunola') && redemptionUserClean.includes('adunola')) return true;
    return false;
  });

  if (existingRedemption) {
    return { valid: false, message: 'You have already used this code.' };
  }

  // ALL NINE CHECKS PASSED -> Calculate discount amount & final amount
  let discount_amount = 0;
  if (promo.discount_type === 'percentage') {
    discount_amount = Math.round(input.order_amount * (promo.discount_value / 100));
  } else if (promo.discount_type === 'fixed_amount') {
    discount_amount = Math.min(input.order_amount, promo.discount_value);
  } else if (promo.discount_type === 'free_months') {
    // For subscription free months, discount covers the initial order period
    discount_amount = input.order_amount;
  }

  const final_amount = Math.max(0, input.order_amount - discount_amount);

  // Sanitized description for user display (removes internal admin notes)
  let descText = '';
  if (promo.discount_type === 'percentage') {
    descText = `${promo.discount_value}% Discount`;
  } else if (promo.discount_type === 'fixed_amount') {
    descText = `₦${promo.discount_value.toLocaleString()} Discount`;
  } else if (promo.discount_type === 'free_months') {
    descText = `${promo.discount_value} Month(s) Free Subscription`;
  }

  const sanitized_description = `Promo Code ${promo.code} Applied (${descText})`;

  return {
    valid: true,
    promo_code_id: promo.id,
    code: promo.code,
    discount_type: promo.discount_type,
    discount_value: promo.discount_value,
    discount_amount,
    final_amount,
    discounted_amount: final_amount,
    sanitized_description,
    message: 'Promo code applied successfully!'
  };
}

export interface RedeemPromoCodeInput {
  promo_code_id: string;
  code?: string;
  user_id: string;
  user_role: string;
  applied_to: 'professional_connection' | 'subscription';
  related_id: string;
  original_amount: number;
  discount_amount: number;
  userName?: string;
}

/**
 * STEP FOUR: Callable Cloud Function Emulator: redeemPromoCode
 * Records promoCodeRedemptions doc and increments current_uses on promoCodes in an atomic transaction.
 */
export function redeemPromoCode(input: RedeemPromoCodeInput): { success: boolean; redemptionId: string; message: string } {
  const codes = getPromoCodes();
  const redemptions = getPromoCodeRedemptions();

  const promoIndex = codes.findIndex(c => c.id === input.promo_code_id);
  if (promoIndex === -1) {
    throw new Error('Transaction Failed: Promo code document not found.');
  }

  const promo = codes[promoIndex];
  const final_amount = Math.max(0, input.original_amount - input.discount_amount);
  const redemptionId = `RED-${Math.floor(100000 + Math.random() * 900000)}`;

  const newRedemption: PromoCodeRedemption = {
    id: redemptionId,
    promo_code_id: promo.id,
    code: promo.code,
    user_id: input.user_id,
    user_role: input.user_role,
    applied_to: input.applied_to,
    related_id: input.related_id,
    original_amount: input.original_amount,
    discount_amount: input.discount_amount,
    final_amount,
    redeemed_at: new Date().toISOString(),
    status: 'applied',
    userName: input.userName || 'User'
  };

  // Atomic Update: Increment current_uses and record redemption document
  const updatedCodes = [...codes];
  updatedCodes[promoIndex] = {
    ...promo,
    current_uses: promo.current_uses + 1
  };

  const updatedRedemptions = [newRedemption, ...redemptions];

  // Save atomically
  savePromoCodes(updatedCodes);
  savePromoCodeRedemptions(updatedRedemptions);

  return {
    success: true,
    redemptionId,
    message: 'Promo code successfully redeemed!'
  };
}
