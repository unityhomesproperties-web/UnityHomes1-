"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidInterests = exports.isValidRole = exports.sanitizeInput = exports.validatePhone = exports.validateEmail = exports.DISPOSABLE_EMAIL_DOMAINS = exports.VALID_INTERESTS = exports.VALID_ROLES = void 0;
exports.VALID_ROLES = [
    'long_term_landlord',
    'shortlet_landlord',
    'property_management_company',
    'shortlet_manager',
    'realtor',
    'property_lawyer',
    'licensed_surveyor',
    'structural_engineer'
];
exports.VALID_INTERESTS = [
    'buying_property',
    'renting',
    'property_management',
    'property_verification',
    'finding_trusted_professionals',
    'neighbourhood_insights',
    'transparency_and_digital_records'
];
exports.DISPOSABLE_EMAIL_DOMAINS = [
    'mailinator.com',
    'yopmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'tempmail.com',
    'trashmail.com'
];
function validateEmail(email) {
    if (!email || email.trim().length === 0)
        return false;
    const re = /^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(String(email).toLowerCase()))
        return false;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain || exports.DISPOSABLE_EMAIL_DOMAINS.includes(domain))
        return false;
    return true;
}
exports.validateEmail = validateEmail;
function validatePhone(phone) {
    if (!phone || phone.trim().length === 0)
        return false;
    // Basic validation for international or local formats
    const re = /^\\+?[0-9\\s\\-\\(\\)]{7,15}$/;
    return re.test(phone);
}
exports.validatePhone = validatePhone;
function sanitizeInput(input) {
    if (!input)
        return '';
    return input.trim().replace(/<[^>]*>?/gm, '');
}
exports.sanitizeInput = sanitizeInput;
function isValidRole(role) {
    return exports.VALID_ROLES.includes(role);
}
exports.isValidRole = isValidRole;
function isValidInterests(interests) {
    if (!Array.isArray(interests) || interests.length === 0)
        return false;
    // Check for duplicates
    const unique = new Set(interests);
    if (unique.size !== interests.length)
        return false;
    return interests.every(i => exports.VALID_INTERESTS.includes(i));
}
exports.isValidInterests = isValidInterests;
//# sourceMappingURL=validation.js.map