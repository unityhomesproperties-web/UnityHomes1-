"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = exports.ReferralService = exports.LoggingService = void 0;
const admin = require("firebase-admin");
const uuid_1 = require("uuid");
const db = admin.firestore();
class LoggingService {
    static async logActivity(action, details, req = {}) {
        const log = {
            id: (0, uuid_1.v4)(),
            action,
            details,
            timestamp: admin.firestore.Timestamp.now(),
            ip_hash: req.ip_hash || '',
            user_agent: req.user_agent || ''
        };
        await db.collection('activity_logs').doc(log.id).set(log);
    }
}
exports.LoggingService = LoggingService;
class ReferralService {
    static generateCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    static async validateReferral(code) {
        if (!code)
            return null;
        const snapshot = await db.collection('waitlist_entries').where('referral_code', '==', code.toUpperCase()).limit(1).get();
        if (snapshot.empty)
            return null;
        return snapshot.docs[0].id; // Return referrer ID
    }
    static async incrementReferralCount(referrerId, transaction) {
        const ref = db.collection('waitlist_entries').doc(referrerId);
        if (transaction) {
            transaction.update(ref, {
                referral_count: admin.firestore.FieldValue.increment(1)
            });
        }
        else {
            await ref.update({
                referral_count: admin.firestore.FieldValue.increment(1)
            });
        }
    }
}
exports.ReferralService = ReferralService;
class EmailService {
    static async sendConfirmationEmail(entry) {
        const emailData = {
            id: (0, uuid_1.v4)(),
            to: entry.email,
            subject: 'Confirm your Unity Homes Waitlist Registration',
            body: `Hello ${entry.full_name}, please confirm your email using this token: ${entry.confirmation_token}`,
            status: 'pending',
            created_at: admin.firestore.Timestamp.now()
        };
        await db.collection('email_queue').doc(emailData.id).set(emailData);
    }
    static async sendWelcomeEmail(entry) {
        const referralLink = `https://unityhomes.ng/ref/\${entry.referral_code}`;
        const emailData = {
            id: (0, uuid_1.v4)(),
            to: entry.email,
            subject: 'Welcome to Unity Homes Waitlist',
            body: `Hello ${entry.full_name}, welcome as a Founding Member! Share your referral link: \${referralLink}`,
            status: 'pending',
            created_at: admin.firestore.Timestamp.now()
        };
        await db.collection('email_queue').doc(emailData.id).set(emailData);
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=services.js.map