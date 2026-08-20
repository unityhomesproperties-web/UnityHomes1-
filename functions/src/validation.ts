import { AllowedRole, AllowedInterest } from './schema';

export const VALID_ROLES: AllowedRole[] = [
  'long_term_landlord',
  'shortlet_landlord',
  'property_management_company',
  'shortlet_manager',
  'realtor',
  'property_lawyer',
  'licensed_surveyor',
  'structural_engineer'
];

export const VALID_INTERESTS: AllowedInterest[] = [
  'buying_property',
  'renting',
  'property_management',
  'property_verification',
  'finding_trusted_professionals',
  'neighbourhood_insights',
  'transparency_and_digital_records'
];

export const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com',
  'yopmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'tempmail.com',
  'trashmail.com'
];

export function validateEmail(email: string): boolean {
  if (!email || email.trim().length === 0) return false;
  const re = /^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(String(email).toLowerCase())) return false;
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || DISPOSABLE_EMAIL_DOMAINS.includes(domain)) return false;
  
  return true;
}

export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim().length === 0) return false;
  // Basic validation for international or local formats
  const re = /^\\+?[0-9\\s\\-\\(\\)]{7,15}$/;
  return re.test(phone);
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input.trim().replace(/<[^>]*>?/gm, '');
}

export function isValidRole(role: any): role is AllowedRole {
  return VALID_ROLES.includes(role);
}

export function isValidInterests(interests: any[]): boolean {
  if (!Array.isArray(interests) || interests.length === 0) return false;
  // Check for duplicates
  const unique = new Set(interests);
  if (unique.size !== interests.length) return false;
  
  return interests.every(i => VALID_INTERESTS.includes(i));
}
