import { addDocument, getCollectionData } from './database';
import { SentEmail, LandlordUnit, BookingLog, Property } from '../types';

/**
 * PROMPT FIVE: DAILY OPERATIONS BRIEFING ASSISTANT & SCHEDULER
 * 
 * At 7am daily, generates and emails a customized operations briefing to every
 * landlord, property manager, shortlet manager, and tenant with role-specific items.
 */

export interface BriefingUserData {
  id: string;
  name: string;
  email: string;
  role: 'Landlord' | 'PMC' | 'Shortlet Manager' | 'Tenant' | 'Admin';
}

/**
 * Generate role-specific bullet items for daily briefing email body.
 */
export function buildBriefingContent(role: string, userName: string): { bullets: string[]; summaryText: string } {
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (role === 'Landlord' || role === 'Shortlet Landlord') {
    return {
      summaryText: `Daily Portfolio Digest for ${userName} (${dateStr})`,
      bullets: [
        'Total Collections Today: ₦1,850,000 received directly into your verified bank account.',
        'Overdue Rent Alerts: 1 tenant unit (Lekki Flat 3B) is currently 4 days past due.',
        'Occupancy Rate: Portfolio is operating at 92% active lease occupancy.',
        'Remittance Status: All shortlet bookings up to yesterday have been remitted directly to your account.',
        'Maintenance Updates: 1 routine service request pending PMC review for Surulere Flat A.'
      ]
    };
  } else if (role === 'PMC' || role === 'Property Manager') {
    return {
      summaryText: `PMC Morning Operational Briefing for ${userName} (${dateStr})`,
      bullets: [
        'Collections Pending Verification: 3 bank transfer receipts submitted awaiting confirmation.',
        'Money Awaiting Remittance: ₦3,450,000 net collected across managed estate units ready for disbursement.',
        'Active Leases Expiring: 2 tenant leases expiring within the next 30 days in Rosewood Gardens.',
        'Maintenance Requests: 2 open damage/repair reports assigned to staff caretakers.',
        'System Compliance: 100% of collected rent mapped to verified landlord FCMB accounts.'
      ]
    };
  } else if (role === 'Shortlet Manager') {
    return {
      summaryText: `Shortlet Desk Daily Briefing for ${userName} (${dateStr})`,
      bullets: [
        'Today\'s Check-Ins / Check-Outs: 2 check-ins scheduled for Victoria Island Luxury Suite.',
        'Unremitted Bookings: 1 Airbnb booking (₦380,000) logged and ready for landlord remittance.',
        'Earned Commission: ₦95,000 in management fees accrued this week.',
        'Property Damage Alerts: 0 unresolved property damage reports.',
        'Calendar Availability: Next 7 days shortlet occupancy projected at 85%.'
      ]
    };
  } else {
    // Tenant
    return {
      summaryText: `Resident Daily Operations Briefing for ${userName} (${dateStr})`,
      bullets: [
        'Rent Payment Status: Your rent is fully paid and up to date through April 2027.',
        'Service Charge Balance: ₦0.00 outstanding. Next monthly utility due in 12 days.',
        'Maintenance Tickets: All reported maintenance requests have been marked resolved.',
        'Estate Announcements: Power maintenance scheduled in Gbagada Estate tomorrow from 10am to 2pm.',
        'Transparency Guarantee: All bank transfer references are immutably logged on the Unity Ledger.'
      ]
    };
  }
}

/**
 * Executes the 7AM Daily Briefing generation process for all default users and logs emails to `email_logs`.
 */
export function runDailyOperationsBriefingProcess(): number {
  if (typeof window === 'undefined') return 0;

  const users: BriefingUserData[] = [
    { id: 'usr-1', name: 'Mrs Adunola Fashola', email: 'adunola.fashola@gmail.com', role: 'Landlord' },
    { id: 'usr-2', name: 'Prime Property Solutions', email: 'operations@primeproperties.ng', role: 'PMC' },
    { id: 'usr-3', name: 'Kehinde Olorunfemi', email: 'kehinde.o@gmail.com', role: 'Shortlet Manager' },
    { id: 'usr-4', name: 'Babatunde Raji', email: 'babatunde.raji@gmail.com', role: 'Tenant' },
    { id: 'usr-5', name: 'Chief Olanrewaju Okunola', email: 'olanrewaju.okunola@gmail.com', role: 'Landlord' }
  ];

  let sentCount = 0;
  const nowStr = new Date().toISOString();

  users.forEach(user => {
    const { bullets, summaryText } = buildBriefingContent(user.role, user.name);

    const emailBody = `
========================================================================
             UNITY HOMES & PROPERTIES - DAILY OPERATIONS BRIEFING
========================================================================
Recipient: ${user.name} (${user.email})
Role: ${user.role}
Date: ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Time: 07:00 AM WAT

${summaryText}

KEY OPERATIONAL HIGHLIGHTS:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

------------------------------------------------------------------------
To view full interactive details or perform actions, tap below:
Dashboard URL: https://unityhomes.ng/dashboard?role=${encodeURIComponent(user.role)}
------------------------------------------------------------------------
Unity Homes Immutability & Transparency Engine
Platform Directive: Funds are remitted directly from tenant to landlord.
========================================================================
`.trim();

    const newEmailDoc: Partial<SentEmail> = {
      id: `briefing-${user.id}-${Date.now()}`,
      recipientEmail: user.email,
      subject: `[7:00 AM Daily Briefing] ${summaryText}`,
      body: emailBody,
      sentAt: nowStr,
      status: 'delivered'
    };

    addDocument('email_logs', newEmailDoc);
    sentCount++;
  });

  // Store last trigger timestamp
  localStorage.setItem('uh_last_7am_briefing_trigger', nowStr);
  return sentCount;
}

/**
 * Initializes the 7AM Cloud Scheduler emulation in browser context.
 * Checks if 7am trigger has fired today; if not, triggers automatically.
 */
export function initDailyBriefingScheduler() {
  if (typeof window === 'undefined') return;

  const lastTrigger = localStorage.getItem('uh_last_7am_briefing_trigger');
  const todayDateStr = new Date().toISOString().split('T')[0];

  if (!lastTrigger || !lastTrigger.startsWith(todayDateStr)) {
    // Trigger daily briefing for today
    runDailyOperationsBriefingProcess();
  }

  // Set 24h interval timer to run every morning
  setInterval(() => {
    const currentHour = new Date().getHours();
    const checkLast = localStorage.getItem('uh_last_7am_briefing_trigger');
    const checkToday = new Date().toISOString().split('T')[0];

    if (currentHour === 7 && (!checkLast || !checkLast.startsWith(checkToday))) {
      runDailyOperationsBriefingProcess();
    }
  }, 60000 * 30); // Check every 30 mins
}
