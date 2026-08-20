"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = exports.incrementReferralCount = exports.validateReferral = exports.resendConfirmationEmail = exports.broadcastToWaitlist = exports.getWaitlistStats = exports.confirmWaitlistEmail = exports.submitWaitlistEntry = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const uuid_1 = require("uuid");
const validation_1 = require("./validation");
const services_1 = require("./services");
const crypto = require("crypto");
admin.initializeApp();
const db = admin.firestore();
// Helpers
function generateHash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}
// 1. submitWaitlistEntry
exports.submitWaitlistEntry = functions.https.onCall(async (data, context) => {
    const ip = context.rawRequest?.ip || 'unknown';
    const ip_hash = generateHash(ip);
    const user_agent = context.rawRequest?.headers['user-agent'] || 'unknown';
    // Rate Limiting (max 3 per IP per hour)
    const hourAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 3600000);
    const rateLimitQuery = await db.collection('waitlist_entries')
        .where('ip_hash', '==', ip_hash)
        .where('created_at', '>=', hourAgo)
        .get();
    if (rateLimitQuery.size >= 3) {
        await services_1.LoggingService.logActivity('RATE_LIMIT_EXCEEDED', { ip_hash });
        throw new functions.https.HttpsError('resource-exhausted', 'Too many requests. Please try again later.');
    }
    // Validation
    if (!data.full_name || !data.email || !data.phone || !data.state || !data.role || !data.interests) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
    }
    if (!(0, validation_1.validateEmail)(data.email)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid or disposable email address.');
    }
    if (!(0, validation_1.validatePhone)(data.phone)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number format.');
    }
    if (!(0, validation_1.isValidRole)(data.role)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid role selected.');
    }
    if (!(0, validation_1.isValidInterests)(data.interests)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid interests selected.');
    }
    const emailLower = data.email.toLowerCase().trim();
    // Duplicate Check
    const emailCheck = await db.collection('waitlist_entries').where('email', '==', emailLower).limit(1).get();
    if (!emailCheck.empty) {
        throw new functions.https.HttpsError('already-exists', 'Email is already on the waitlist.');
    }
    // Handle Referral
    let referred_by = null;
    if (data.referral_code) {
        referred_by = await services_1.ReferralService.validateReferral(data.referral_code);
    }
    const id = (0, uuid_1.v4)();
    const confirmation_token = crypto.randomBytes(32).toString('hex');
    const confirmation_token_expires_at = admin.firestore.Timestamp.fromMillis(Date.now() + 48 * 3600000); // 48 hours
    const referral_code = services_1.ReferralService.generateCode();
    const entry = {
        id,
        full_name: (0, validation_1.sanitizeInput)(data.full_name),
        email: emailLower,
        phone: (0, validation_1.sanitizeInput)(data.phone),
        state: (0, validation_1.sanitizeInput)(data.state),
        role: data.role,
        organisation_name: data.organisation_name ? (0, validation_1.sanitizeInput)(data.organisation_name) : undefined,
        interests: data.interests,
        submitted_at: admin.firestore.Timestamp.now(),
        email_confirmed: false,
        confirmation_token,
        confirmation_token_expires_at,
        referral_code,
        referred_by: referred_by || undefined,
        referral_count: 0,
        source: data.source ? (0, validation_1.sanitizeInput)(data.source) : undefined,
        ip_hash,
        user_agent,
        status: 'pending',
        created_at: admin.firestore.Timestamp.now(),
        updated_at: admin.firestore.Timestamp.now()
    };
    await db.collection('waitlist_entries').doc(id).set(entry);
    await services_1.EmailService.sendConfirmationEmail(entry);
    await services_1.LoggingService.logActivity('WAITLIST_ENTRY_CREATED', { entryId: id });
    return { success: true, message: 'Waitlist entry submitted successfully.', data: { id } };
});
// 2. confirmWaitlistEmail
exports.confirmWaitlistEmail = functions.https.onCall(async (data, context) => {
    const { token } = data;
    if (!token) {
        throw new functions.https.HttpsError('invalid-argument', 'Token is required.');
    }
    const query = await db.collection('waitlist_entries').where('confirmation_token', '==', token).limit(1).get();
    if (query.empty) {
        throw new functions.https.HttpsError('not-found', 'Invalid or expired confirmation token.');
    }
    const doc = query.docs[0];
    const entry = doc.data();
    if (entry.email_confirmed) {
        throw new functions.https.HttpsError('already-exists', 'Email is already confirmed.');
    }
    if (entry.confirmation_token_expires_at.toMillis() < Date.now()) {
        throw new functions.https.HttpsError('failed-precondition', 'Confirmation token has expired.');
    }
    await db.runTransaction(async (transaction) => {
        transaction.update(doc.ref, {
            email_confirmed: true,
            confirmed_at: admin.firestore.Timestamp.now(),
            status: 'confirmed',
            updated_at: admin.firestore.Timestamp.now()
        });
        if (entry.referred_by) {
            await services_1.ReferralService.incrementReferralCount(entry.referred_by, transaction);
        }
    });
    // Re-fetch to pass to EmailService
    const updatedDoc = await doc.ref.get();
    await services_1.EmailService.sendWelcomeEmail(updatedDoc.data());
    await services_1.LoggingService.logActivity('EMAIL_CONFIRMED', { entryId: entry.id });
    return { success: true, message: 'Email confirmed successfully.' };
});
// 3. getWaitlistStats (Admin only)
exports.getWaitlistStats = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Admin access required.');
    }
    const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
    if (!adminDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required.');
    }
    const stats = {
        total: 0,
        confirmed: 0,
        pending: 0
    };
    const snapshot = await db.collection('waitlist_entries').get();
    snapshot.forEach(doc => {
        stats.total++;
        if (doc.data().status === 'confirmed')
            stats.confirmed++;
        if (doc.data().status === 'pending')
            stats.pending++;
    });
    return { success: true, data: stats };
});
// 4. broadcastToWaitlist (Admin only)
exports.broadcastToWaitlist = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Admin access required.');
    }
    const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
    if (!adminDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required.');
    }
    const { subject, body, target_audience } = data;
    if (!subject || !body || !target_audience) {
        throw new functions.https.HttpsError('invalid-argument', 'Subject, body, and target_audience are required.');
    }
    const broadcastId = (0, uuid_1.v4)();
    const broadcastLog = {
        id: broadcastId,
        subject,
        body,
        sent_at: admin.firestore.Timestamp.now(),
        target_audience,
        status: 'processing',
        metrics: { sent: 0, failed: 0, opened: 0 }
    };
    await db.collection('broadcast_logs').doc(broadcastId).set(broadcastLog);
    // Note: A real implementation would trigger a pub/sub or batch process here to queue emails.
    // We'll simulate queuing the emails.
    let query = db.collection('waitlist_entries');
    if (target_audience.status) {
        query = query.where('status', '==', target_audience.status);
    }
    if (target_audience.roles && target_audience.roles.length > 0) {
        query = query.where('role', 'in', target_audience.roles);
    }
    const snapshot = await query.get();
    let queued = 0;
    const batch = db.batch();
    snapshot.forEach(doc => {
        // Only queue if state/interests match (since 'in' queries are limited in Firestore)
        const entry = doc.data();
        if (target_audience.states && target_audience.states.length > 0) {
            if (!target_audience.states.includes(entry.state))
                return;
        }
        if (target_audience.interests && target_audience.interests.length > 0) {
            const hasInterest = entry.interests.some(i => target_audience.interests.includes(i));
            if (!hasInterest)
                return;
        }
        const emailId = (0, uuid_1.v4)();
        const emailRef = db.collection('email_queue').doc(emailId);
        batch.set(emailRef, {
            id: emailId,
            to: entry.email,
            subject,
            body,
            status: 'pending',
            created_at: admin.firestore.Timestamp.now(),
            broadcast_id: broadcastId
        });
        queued++;
    });
    await batch.commit();
    await db.collection('broadcast_logs').doc(broadcastId).update({
        status: 'completed',
        'metrics.sent': queued
    });
    await services_1.LoggingService.logActivity('BROADCAST_QUEUED', { broadcastId, queued });
    return { success: true, message: `Queued ${queued} emails.` };
});
// 5. resendConfirmationEmail
exports.resendConfirmationEmail = functions.https.onCall(async (data, context) => {
    const { email } = data;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required.');
    }
    const emailLower = email.toLowerCase().trim();
    const query = await db.collection('waitlist_entries').where('email', '==', emailLower).limit(1).get();
    if (query.empty) {
        throw new functions.https.HttpsError('not-found', 'Waitlist entry not found.');
    }
    const doc = query.docs[0];
    const entry = doc.data();
    if (entry.email_confirmed) {
        throw new functions.https.HttpsError('already-exists', 'Email is already confirmed.');
    }
    // Generate new token
    const new_token = crypto.randomBytes(32).toString('hex');
    const new_expires = admin.firestore.Timestamp.fromMillis(Date.now() + 48 * 3600000);
    await doc.ref.update({
        confirmation_token: new_token,
        confirmation_token_expires_at: new_expires,
        updated_at: admin.firestore.Timestamp.now()
    });
    const updatedEntry = { ...entry, confirmation_token: new_token, confirmation_token_expires_at: new_expires };
    await services_1.EmailService.sendConfirmationEmail(updatedEntry);
    return { success: true, message: 'Confirmation email resent.' };
});
// 6. validateReferral
exports.validateReferral = functions.https.onCall(async (data, context) => {
    const { code } = data;
    if (!code) {
        throw new functions.https.HttpsError('invalid-argument', 'Referral code is required.');
    }
    const referrerId = await services_1.ReferralService.validateReferral(code);
    if (!referrerId) {
        throw new functions.https.HttpsError('not-found', 'Invalid referral code.');
    }
    return { success: true, data: { referrerId } };
});
// 7. incrementReferralCount
exports.incrementReferralCount = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Access required.');
    }
    const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
    if (!adminDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required.');
    }
    const { referrerId } = data;
    if (!referrerId) {
        throw new functions.https.HttpsError('invalid-argument', 'Referrer ID is required.');
    }
    await services_1.ReferralService.incrementReferralCount(referrerId);
    return { success: true, message: 'Referral count incremented.' };
});
// 8. logActivity
exports.logActivity = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Admin access required.');
    }
    const adminDoc = await db.collection('admins').doc(context.auth.uid).get();
    if (!adminDoc.exists) {
        throw new functions.https.HttpsError('permission-denied', 'Admin access required.');
    }
    const { action, details } = data;
    if (!action) {
        throw new functions.https.HttpsError('invalid-argument', 'Action is required.');
    }
    await services_1.LoggingService.logActivity(action, details, {
        ip_hash: generateHash(context.rawRequest?.ip || 'unknown'),
        user_agent: context.rawRequest?.headers['user-agent'] || 'unknown'
    });
    return { success: true, message: 'Activity logged.' };
});
//# sourceMappingURL=index.js.map