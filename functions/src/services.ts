import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { WaitlistEntry, ActivityLog, WaitlistStatus } from './schema';

const db = admin.firestore();

export class LoggingService {
  static async logActivity(action: string, details: any, req: any = {}) {
    const log: ActivityLog = {
      id: uuidv4(),
      action,
      details,
      timestamp: admin.firestore.Timestamp.now(),
      ip_hash: req.ip_hash || '',
      user_agent: req.user_agent || ''
    };
    await db.collection('activity_logs').doc(log.id).set(log);
  }
}

export class ReferralService {
  static generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  static async validateReferral(code: string): Promise<string | null> {
    if (!code) return null;
    const snapshot = await db.collection('waitlist_entries').where('referral_code', '==', code.toUpperCase()).limit(1).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].id; // Return referrer ID
  }

  static async incrementReferralCount(referrerId: string, transaction?: admin.firestore.Transaction) {
    const ref = db.collection('waitlist_entries').doc(referrerId);
    if (transaction) {
      transaction.update(ref, {
        referral_count: admin.firestore.FieldValue.increment(1)
      });
    } else {
      await ref.update({
        referral_count: admin.firestore.FieldValue.increment(1)
      });
    }
  }
}

export class EmailService {
  static async sendConfirmationEmail(entry: WaitlistEntry) {
    const emailData = {
      id: uuidv4(),
      to: entry.email,
      subject: 'Confirm your Unity Homes Waitlist Registration',
      body: `Hello ${entry.full_name}, please confirm your email using this token: ${entry.confirmation_token}`,
      status: 'pending',
      created_at: admin.firestore.Timestamp.now()
    };
    await db.collection('email_queue').doc(emailData.id).set(emailData);
  }

  static async sendWelcomeEmail(entry: WaitlistEntry) {
    const referralLink = `https://unityhomes.ng/ref/\${entry.referral_code}`;
    const emailData = {
      id: uuidv4(),
      to: entry.email,
      subject: 'Welcome to Unity Homes Waitlist',
      body: `Hello ${entry.full_name}, welcome as a Founding Member! Share your referral link: \${referralLink}`,
      status: 'pending',
      created_at: admin.firestore.Timestamp.now()
    };
    await db.collection('email_queue').doc(emailData.id).set(emailData);
  }
}
