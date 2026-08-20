import { Complaint } from '../types';

export const COMPLAINT_CATEGORIES = [
  'Property Maintenance or Repairs',
  'Waste and Refuse Collection',
  'Property Condition or Safety',
  'Service Charges',
  'Noise or Neighbour Issue',
  'Landlord Conduct or Behaviour',
  'Property Management Company Conduct',
  'Something Else'
] as const;

export type ComplaintCategory = typeof COMPLAINT_CATEGORIES[number];

export function determinePropertyManagementType(
  propertyId?: string, 
  managementCompanyId?: string
): { isPMCManaged: boolean; pmcId?: string; pmcName?: string } {
  // Check localStorage uh_management_company_properties_v1
  try {
    const rawPMCProps = localStorage.getItem('uh_management_company_properties_v1');
    if (rawPMCProps) {
      const pmcProps: any[] = JSON.parse(rawPMCProps);
      const match = pmcProps.find((p: any) => 
        p.is_active !== false && 
        (p.property_id === propertyId || p.propertyId === propertyId || p.buildingId === propertyId)
      );
      if (match) {
        return {
          isPMCManaged: true,
          pmcId: match.company_id || match.companyName || match.pmcId || 'Lagos Realty Partners',
          pmcName: match.companyName || 'Lagos Realty Partners'
        };
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback check on managementCompanyId string
  if (
    managementCompanyId && 
    managementCompanyId !== 'Self-Managed' && 
    managementCompanyId !== 'None' && 
    managementCompanyId !== ''
  ) {
    return {
      isPMCManaged: true,
      pmcId: managementCompanyId,
      pmcName: managementCompanyId === 'Lagos Realty Partners' ? 'Lagos Realty Partners' : managementCompanyId
    };
  }

  return { isPMCManaged: false };
}

export interface ComplaintSubmissionParams {
  tenantName: string;
  tenantCode?: string;
  tenantEmail?: string;
  unitName: string;
  unitId?: string;
  propertyId: string;
  propertyName: string;
  complaint_category: ComplaintCategory;
  details: string;
  urgency?: 'Normal' | 'High' | 'Urgent';
  evidencePhotos?: string[];
  typeOfWasteIssue?: any;
  daysSinceLastCollection?: number;
  usualCollectionDay?: any;
  landlordId?: string;
  landlordName?: string;
  managementCompanyId?: string;
}

export function routeComplaintSubmission(params: ComplaintSubmissionParams): {
  complaint: Complaint;
  tenantNoticeMessage: string;
} {
  const { isPMCManaged, pmcId, pmcName } = determinePropertyManagementType(params.propertyId, params.managementCompanyId);

  const category = params.complaint_category;
  let routingPath: Complaint['routingPath'];
  let primaryRecipientRole: Complaint['primaryRecipientRole'];
  let primaryRecipientName: string | undefined;
  let secondaryRecipientRole: Complaint['secondaryRecipientRole'];
  let secondaryRecipientName: string | undefined;
  let adminOversight = false;
  let tenantNoticeMessage = '';

  const standardCategories = [
    'Property Maintenance or Repairs',
    'Waste and Refuse Collection',
    'Property Condition or Safety',
    'Service Charges',
    'Noise or Neighbour Issue'
  ];

  const nowIso = new Date().toISOString();
  const dateStr = nowIso.split('T')[0];

  const notificationsToCreate: any[] = [];

  if (standardCategories.includes(category)) {
    if (!isPMCManaged) {
      // PATH 1: Standard Issue on Self-Managed Property
      routingPath = 'path_1_self_managed';
      primaryRecipientRole = 'Landlord';
      primaryRecipientName = params.landlordName || 'Landlord';
      adminOversight = true;
      tenantNoticeMessage = `Your complaint has been submitted to your landlord (${primaryRecipientName}). Please allow up to 7 days for a response.`;

      // Landlord Notification
      notificationsToCreate.push({
        id: 'notif-lnd-' + Date.now(),
        recipientRole: 'Landlord',
        recipientId: params.landlordId || 'UH-LANDLORD-FASHOLA',
        title: `⚠️ New Tenant Complaint: ${params.propertyName}`,
        message: `${params.tenantName} has submitted a complaint about your property ${params.propertyName}. Category: ${category}. Please respond within 7 days.`,
        time: 'Just Now',
        unread: true,
        date: nowIso
      });

      // Admin Oversight Notification
      notificationsToCreate.push({
        id: 'notif-adm-ovs-' + Date.now(),
        recipientRole: 'Admin',
        recipientId: 'UH-ADMIN-MASTER',
        title: `[Admin Oversight Copy] New Complaint: ${params.propertyName}`,
        message: `[Admin Oversight Copy] ${params.tenantName} submitted a complaint about self-managed property ${params.propertyName}. Category: ${category}.`,
        time: 'Just Now',
        unread: true,
        date: nowIso
      });
    } else {
      // PATH 2: Standard Issue on PMC-Managed Property
      routingPath = 'path_2_pmc_managed';
      primaryRecipientRole = 'PMC';
      primaryRecipientName = pmcName || 'Property Management Company';
      secondaryRecipientRole = 'Landlord';
      secondaryRecipientName = params.landlordName || 'Property Owner';
      adminOversight = true;
      tenantNoticeMessage = `Your complaint has been submitted to your Property Manager (${primaryRecipientName}). Your landlord has also been notified.`;

      // PMC Notification
      notificationsToCreate.push({
        id: 'notif-pmc-' + Date.now(),
        recipientRole: 'PMC',
        recipientId: pmcId || 'Lagos Realty Partners',
        title: `⚠️ New Managed Complaint: ${params.propertyName}`,
        message: `${params.tenantName} has submitted a complaint for ${params.propertyName} which your company manages.`,
        time: 'Just Now',
        unread: true,
        date: nowIso
      });

      // Landlord Secondary Notification
      notificationsToCreate.push({
        id: 'notif-lnd-sec-' + Date.now(),
        recipientRole: 'Landlord',
        recipientId: params.landlordId || 'UH-LANDLORD-OBIORA',
        title: `ℹ️ Property Complaint Logged: ${params.propertyName}`,
        message: `Your tenant at ${params.propertyName} has submitted a complaint. Your property manager has been notified and is the primary handler.`,
        time: 'Just Now',
        unread: true,
        date: nowIso
      });

      // Admin Oversight Notification
      notificationsToCreate.push({
        id: 'notif-adm-ovs-' + Date.now(),
        recipientRole: 'Admin',
        recipientId: 'UH-ADMIN-MASTER',
        title: `[Admin Oversight Copy] PMC Complaint: ${params.propertyName}`,
        message: `[Admin Oversight Copy] ${params.tenantName} submitted a complaint regarding PMC-managed property ${params.propertyName}.`,
        time: 'Just Now',
        unread: true,
        date: nowIso
      });
    }
  } else if (category === 'Landlord Conduct or Behaviour') {
    // PATH 3: Landlord Conduct
    routingPath = 'path_3_landlord_conduct';
    primaryRecipientRole = 'Admin';
    primaryRecipientName = 'Unity Homes Admin';
    adminOversight = false; // Admin is primary handler
    tenantNoticeMessage = 'Your complaint about your landlord has been received by Unity Homes directly. We will review this privately.';

    // Admin Notification only (Landlord and PMC are NOT notified)
    notificationsToCreate.push({
      id: 'notif-adm-direct-' + Date.now(),
      recipientRole: 'Admin',
      recipientId: 'UH-ADMIN-MASTER',
      title: `🔒 Direct Complaint: Landlord Conduct (${params.propertyName})`,
      message: `Tenant ${params.tenantName} logged a complaint regarding Landlord Conduct for property ${params.propertyName}. (Landlord and PMC not notified)`,
      time: 'Just Now',
      unread: true,
      date: nowIso
    });
  } else if (category === 'Property Management Company Conduct') {
    // PATH 4: PMC Conduct
    routingPath = 'path_4_pmc_conduct';
    primaryRecipientRole = 'Admin';
    primaryRecipientName = 'Unity Homes Admin';
    secondaryRecipientRole = 'Landlord';
    secondaryRecipientName = params.landlordName || 'Property Owner';
    adminOversight = false;
    tenantNoticeMessage = 'Your complaint regarding your Property Management Company has been received by Unity Homes. Your landlord has also been notified.';

    // Admin Notification
    notificationsToCreate.push({
      id: 'notif-adm-pmccond-' + Date.now(),
      recipientRole: 'Admin',
      recipientId: 'UH-ADMIN-MASTER',
      title: `🔒 Direct Complaint: PMC Conduct (${params.propertyName})`,
      message: `Tenant ${params.tenantName} logged a complaint regarding PMC conduct for property ${params.propertyName}.`,
      time: 'Just Now',
      unread: true,
      date: nowIso
    });

    // Landlord Secondary Notification (PMC NOT notified!)
    notificationsToCreate.push({
      id: 'notif-lnd-pmccond-' + Date.now(),
      recipientRole: 'Landlord',
      recipientId: params.landlordId || 'UH-LANDLORD-MAGAJI',
      title: `🚨 Tenant Complaint Regarding Property Manager: ${params.propertyName}`,
      message: `Your tenant at ${params.propertyName} has submitted a complaint about your property management company. Unity Homes has been notified and will handle this directly.`,
      time: 'Just Now',
      unread: true,
      date: nowIso
    });
  } else {
    // PATH 5: Something Else
    routingPath = 'path_5_something_else';
    primaryRecipientRole = 'Admin';
    primaryRecipientName = 'Unity Homes Admin';
    adminOversight = false;
    tenantNoticeMessage = 'Your complaint has been received by Unity Homes Admin and will be reviewed directly.';

    notificationsToCreate.push({
      id: 'notif-adm-misc-' + Date.now(),
      recipientRole: 'Admin',
      recipientId: 'UH-ADMIN-MASTER',
      title: `📝 Complaint Received (Something Else): ${params.propertyName}`,
      message: `Tenant ${params.tenantName} logged a complaint under 'Something Else' for property ${params.propertyName}.`,
      time: 'Just Now',
      unread: true,
      date: nowIso
    });
  }

  // Create complaint object
  const newComplaint: Complaint = {
    id: 'complaint-' + Date.now(),
    tenant: params.tenantName,
    tenantCode: params.tenantCode,
    tenantEmail: params.tenantEmail,
    unit: params.unitName,
    unitId: params.unitId,
    propertyId: params.propertyId,
    propertyName: params.propertyName,
    complaint_category: category,
    category: category,
    routingPath,
    primaryRecipientRole,
    primaryRecipientName,
    secondaryRecipientRole,
    secondaryRecipientName,
    adminOversight,
    isPMCManaged,
    typeOfWasteIssue: params.typeOfWasteIssue,
    daysSinceLastCollection: params.daysSinceLastCollection,
    usualCollectionDay: params.usualCollectionDay,
    urgency: params.urgency || 'Normal',
    evidencePhotos: params.evidencePhotos,
    text: params.details,
    date: dateStr,
    status: 'Open',
    managementCompanyId: pmcId || params.managementCompanyId,
    landlordId: params.landlordId,
    landlordName: params.landlordName
  };

  // Persist notifications
  try {
    const rawNotifs = localStorage.getItem('uh_notifications_v1') || '[]';
    const notifs = JSON.parse(rawNotifs);
    localStorage.setItem('uh_notifications_v1', JSON.stringify([...notificationsToCreate, ...notifs]));

    // Log to activityLog
    const rawLogs = localStorage.getItem('uh_activityLog_v1') || '[]';
    const logs = JSON.parse(rawLogs);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: dateStr + ' ' + new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      actorName: params.tenantName,
      actorRole: 'Tenant',
      actionType: 'COMPLAINT_SUBMITTED',
      recordAffected: params.propertyName,
      details: `Submitted complaint (${category}) routed via ${routingPath}. Primary: ${primaryRecipientRole}.`
    };
    localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLog, ...logs]));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Error saving notifications/logs:', err);
  }

  return { complaint: newComplaint, tenantNoticeMessage };
}

export function calculateDaysOpen(dateStr?: string): number {
  if (!dateStr) return 0;
  const submitted = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - submitted.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function isComplaintEscalationEligible(c: Complaint): boolean {
  if (c.status === 'Resolved') return false;
  if (c.status === 'Escalated') return false;
  if (c.is_escalation_eligible) return true;
  const daysOpen = calculateDaysOpen(c.date);
  return daysOpen >= 7 && (c.status === 'Open' || c.status === 'Responded');
}

export function escalateComplaintInStorage(
  complaintId: string, 
  tenantName: string
): { success: boolean; message: string; complaint?: Complaint } {
  try {
    const raw = localStorage.getItem('uh_complaints_v1') || '[]';
    const complaints: Complaint[] = JSON.parse(raw);
    const index = complaints.findIndex(c => c.id === complaintId);
    if (index === -1) {
      return { success: false, message: 'Complaint not found.' };
    }

    const c = complaints[index];
    if (c.status === 'Escalated') {
      return { success: false, message: 'This complaint has already been escalated.' };
    }

    const daysOpen = calculateDaysOpen(c.date);
    const nowIso = new Date().toISOString();

    const updatedComplaint: Complaint = {
      ...c,
      status: 'Escalated',
      is_escalation_eligible: true,
      escalated_at: nowIso,
      escalated_by: tenantName,
      escalation_reason: `Open for ${daysOpen} days without resolution.`
    };

    complaints[index] = updatedComplaint;
    localStorage.setItem('uh_complaints_v1', JSON.stringify(complaints));

    // Send notifications & email log per Step Three rules
    const notifs: any[] = [];
    const emails: any[] = [];

    // 1. Admin Notification (Urgent)
    const adminMsg = `${updatedComplaint.tenant} has escalated a complaint for ${updatedComplaint.propertyName} that has been open for ${daysOpen} days. Full history attached.`;
    notifs.push({
      id: `notif-esc-adm-${Date.now()}`,
      recipientRole: 'Admin',
      recipientId: 'UH-ADMIN-MASTER',
      title: `🚨 URGENT: Complaint Escalated by Tenant (${updatedComplaint.propertyName})`,
      message: adminMsg,
      timestamp: nowIso,
      read: false
    });
    emails.push({
      id: `email-esc-adm-${Date.now()}`,
      to: 'admin@unityhomes.com',
      subject: `[URGENT ESCALATION] Complaint ${updatedComplaint.id} Escalated`,
      body: adminMsg,
      timestamp: nowIso
    });

    // 2. Routing Path logic for secondary notifications
    if (c.routingPath === 'path_1_self_managed') {
      // Notify landlord
      const lndMsg = `Your tenant ${updatedComplaint.tenant} at ${updatedComplaint.propertyName} has escalated complaint ${updatedComplaint.id} to Unity Homes admin after ${daysOpen} days without resolution.`;
      notifs.push({
        id: `notif-esc-lnd-${Date.now()}`,
        recipientRole: 'Landlord',
        recipientId: c.landlordId || 'UH-LANDLORD-FASHOLA',
        title: `⚠️ Tenant Escalation: ${updatedComplaint.propertyName}`,
        message: lndMsg,
        timestamp: nowIso,
        read: false
      });
      emails.push({
        id: `email-esc-lnd-${Date.now()}`,
        to: c.landlordName ? `${c.landlordName.toLowerCase().replace(/\s+/g, '.')}@property.com` : 'landlord@property.com',
        subject: `[Notice] Tenant Escalated Complaint to Admin - ${updatedComplaint.propertyName}`,
        body: lndMsg,
        timestamp: nowIso
      });
    } else if (c.routingPath === 'path_2_pmc_managed') {
      // Notify both PMC and Landlord
      const pmcMsg = `Tenant ${updatedComplaint.tenant} at ${updatedComplaint.propertyName} has escalated complaint ${updatedComplaint.id} to Unity Homes admin after ${daysOpen} days without resolution.`;
      notifs.push({
        id: `notif-esc-pmc-${Date.now()}`,
        recipientRole: 'PMC',
        recipientId: c.managementCompanyId || 'Lagos Realty Partners',
        title: `⚠️ Managed Complaint Escalated to Admin: ${updatedComplaint.propertyName}`,
        message: pmcMsg,
        timestamp: nowIso,
        read: false
      });
      emails.push({
        id: `email-esc-pmc-${Date.now()}`,
        to: 'support@lagosrealty.com',
        subject: `[Notice] Complaint Escalated to Admin - ${updatedComplaint.propertyName}`,
        body: pmcMsg,
        timestamp: nowIso
      });

      const lndMsg = `Your tenant ${updatedComplaint.tenant} at ${updatedComplaint.propertyName} has escalated complaint ${updatedComplaint.id} to Unity Homes admin after ${daysOpen} days without resolution.`;
      notifs.push({
        id: `notif-esc-lnd-${Date.now()}`,
        recipientRole: 'Landlord',
        recipientId: c.landlordId || 'UH-LANDLORD-OBIORA',
        title: `⚠️ Managed Property Complaint Escalated to Admin`,
        message: lndMsg,
        timestamp: nowIso,
        read: false
      });
      emails.push({
        id: `email-esc-lnd2-${Date.now()}`,
        to: 'landlord@property.com',
        subject: `[Notice] Managed Complaint Escalated to Admin`,
        body: lndMsg,
        timestamp: nowIso
      });
    }
    // Path 3 (Landlord conduct), Path 4 (PMC conduct), Path 5 (Something else): Notify Admin ONLY (already created above).

    // Save Notifications & Emails
    try {
      const existingNotifs = JSON.parse(localStorage.getItem('uh_notifications_v1') || '[]');
      localStorage.setItem('uh_notifications_v1', JSON.stringify([...notifs, ...existingNotifs]));

      const existingEmails = JSON.parse(localStorage.getItem('uh_emails_v1') || '[]');
      localStorage.setItem('uh_emails_v1', JSON.stringify([...emails, ...existingEmails]));

      // Save to Activity Log
      const existingLogs = JSON.parse(localStorage.getItem('uh_activityLog_v1') || '[]');
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: nowIso,
        actorName: tenantName,
        actorRole: 'Tenant',
        actionType: 'COMPLAINT_ESCALATED',
        recordAffected: `Complaint ${updatedComplaint.id}`,
        recordId: updatedComplaint.id,
        details: `Tenant ${tenantName} escalated complaint for ${updatedComplaint.propertyName} after ${daysOpen} days open. Routing: ${c.routingPath}.`
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLog, ...existingLogs]));
    } catch (e) {
      console.error(e);
    }

    window.dispatchEvent(new Event('storage'));
    return {
      success: true,
      message: 'Complaint successfully escalated to Unity Homes Admin. Relevant parties notified via in-app & email.',
      complaint: updatedComplaint
    };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Failed to escalate complaint.' };
  }
}

export function handleAdminEscalationAction(
  complaintId: string,
  outcome: 'Resolved by Admin' | 'Returned to Primary Handler' | 'Serious Concern Flagged',
  payload: { resolutionNote?: string; returnedMessage?: string; adminName?: string }
): { success: boolean; message: string } {
  try {
    const raw = localStorage.getItem('uh_complaints_v1') || '[]';
    const complaints: Complaint[] = JSON.parse(raw);
    const index = complaints.findIndex(c => c.id === complaintId);
    if (index === -1) {
      return { success: false, message: 'Complaint not found.' };
    }

    const c = complaints[index];
    const nowIso = new Date().toISOString();
    let newStatus: Complaint['status'] = c.status;
    let tenantNotifMsg = '';
    let partyNotifMsg = '';

    const notifs: any[] = [];
    const emails: any[] = [];

    if (outcome === 'Resolved by Admin') {
      if (!payload.resolutionNote?.trim()) {
        return { success: false, message: 'Mandatory resolution note is required.' };
      }
      newStatus = 'Resolved';
      c.resolutionNote = payload.resolutionNote;
      c.admin_resolution_note = payload.resolutionNote;
      c.adminResponse = payload.resolutionNote;
      c.adminRespondedAt = nowIso;
      c.resolvedAt = nowIso;
      c.escalation_outcome = 'Resolved by Admin';

      tenantNotifMsg = payload.resolutionNote;
      partyNotifMsg = `Admin has resolved escalated complaint ${c.id} for ${c.propertyName}. Resolution Note: "${payload.resolutionNote}"`;

    } else if (outcome === 'Returned to Primary Handler') {
      if (!payload.returnedMessage?.trim()) {
        return { success: false, message: 'Mandatory message to primary handler is required.' };
      }
      newStatus = 'Responded';
      c.returned_message = payload.returnedMessage;
      c.adminResponse = `Returned to primary handler with directive: "${payload.returnedMessage}"`;
      c.adminRespondedAt = nowIso;
      c.escalation_outcome = 'Returned to Primary Handler';

      tenantNotifMsg = `Unity Homes has asked your landlord or property manager to resolve this within 48 hours.`;
      partyNotifMsg = `🚨 STATUTORY DIRECTIVE: Unity Homes Admin has returned escalated complaint ${c.id} for ${c.propertyName}. Requirement: resolve within 48 hours. Message: "${payload.returnedMessage}"`;

    } else if (outcome === 'Serious Concern Flagged') {
      newStatus = 'Under Review';
      c.serious_concern_flagged = true;
      c.adminResponse = 'Elevated to higher internal review level. Further modifications blocked pending formal review.';
      c.adminRespondedAt = nowIso;
      c.escalation_outcome = 'Serious Concern Flagged';

      tenantNotifMsg = `Unity Homes is conducting a formal review of your complaint. We will update you directly.`;
      partyNotifMsg = `🚨 NOTICE: Complaint ${c.id} for ${c.propertyName} has been flagged as a Serious Concern and elevated to formal administrative review.`;
    }

    c.status = newStatus;
    complaints[index] = c;
    localStorage.setItem('uh_complaints_v1', JSON.stringify(complaints));

    // Send Tenant Notification & Email (Step 5 requirement)
    notifs.push({
      id: `notif-out-tnt-${Date.now()}`,
      recipientRole: 'Tenant',
      recipientId: c.tenantId || c.tenant,
      title: `Escalation Outcome: ${c.propertyName}`,
      message: tenantNotifMsg,
      timestamp: nowIso,
      read: false
    });
    emails.push({
      id: `email-out-tnt-${Date.now()}`,
      to: c.tenantEmail || 'tenant@unityhomes.com',
      subject: `[Unity Homes Update] Complaint ${c.id} Escalation Outcome`,
      body: tenantNotifMsg,
      timestamp: nowIso
    });

    // Notify Landlord and PMC if applicable
    if (c.landlordId || c.landlordName) {
      notifs.push({
        id: `notif-out-lnd-${Date.now()}`,
        recipientRole: 'Landlord',
        recipientId: c.landlordId || 'UH-LANDLORD',
        title: `Admin Escalation Ruling: ${c.propertyName}`,
        message: partyNotifMsg,
        timestamp: nowIso,
        read: false
      });
      emails.push({
        id: `email-out-lnd-${Date.now()}`,
        to: 'landlord@property.com',
        subject: `[Admin Directive] Escalated Complaint ${c.id}`,
        body: partyNotifMsg,
        timestamp: nowIso
      });
    }

    if (c.managementCompanyId || c.isPMCManaged) {
      notifs.push({
        id: `notif-out-pmc-${Date.now()}`,
        recipientRole: 'PMC',
        recipientId: c.managementCompanyId || 'PMC',
        title: `Admin Escalation Ruling: ${c.propertyName}`,
        message: partyNotifMsg,
        timestamp: nowIso,
        read: false
      });
      emails.push({
        id: `email-out-pmc-${Date.now()}`,
        to: 'support@pmc.com',
        subject: `[Admin Directive] Escalated Complaint ${c.id}`,
        body: partyNotifMsg,
        timestamp: nowIso
      });
    }

    // Save Notifications & Emails & Activity Log
    try {
      const existingNotifs = JSON.parse(localStorage.getItem('uh_notifications_v1') || '[]');
      localStorage.setItem('uh_notifications_v1', JSON.stringify([...notifs, ...existingNotifs]));

      const existingEmails = JSON.parse(localStorage.getItem('uh_emails_v1') || '[]');
      localStorage.setItem('uh_emails_v1', JSON.stringify([...emails, ...existingEmails]));

      const existingLogs = JSON.parse(localStorage.getItem('uh_activityLog_v1') || '[]');
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: nowIso,
        actorName: payload.adminName || 'Admin',
        actorRole: 'Admin',
        actionType: 'COMPLAINT_ESCALATION_RESOLVED',
        recordAffected: `Complaint ${c.id}`,
        recordId: c.id,
        newValue: outcome,
        details: `Admin applied outcome "${outcome}" on escalated complaint ${c.id}. Tenant notified.`
      };
      localStorage.setItem('uh_activityLog_v1', JSON.stringify([newLog, ...existingLogs]));
    } catch (e) {
      console.error(e);
    }

    window.dispatchEvent(new Event('storage'));
    return { success: true, message: `Escalation outcome "${outcome}" applied successfully. Notifications sent.` };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Failed to apply admin escalation outcome.' };
  }
}
