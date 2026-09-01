import { addDocument, getCollectionData, saveCollectionData, triggerNotificationCloudEvent, updateDocument, registerUpdateCallback } from './database';
import { RentPayment, ServiceChargeBill, SentEmail, PlatformDocument } from '../types';

// Register the update callback dynamically on module load to decouple triggering
if (typeof window !== 'undefined') {
  registerUpdateCallback(emulateCloudFunctionTrigger);
}

// Key for sent emails log in localStorage
const SENT_EMAILS_KEY = 'uh_sent_emails_v1';
const DOCUMENTS_KEY = 'uh_documents_v1';
const ACTIVITY_LOG_KEY = 'uh_activityLog_v1';

// Failure simulation state (can be toggled in Admin UI)
export function getEmailFailureMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('uh_email_fail_simulation_active') === 'true';
}

export function setEmailFailureMode(active: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('uh_email_fail_simulation_active', active ? 'true' : 'false');
}

/**
 * Generates a mock "Transparency Certificate" representing the PDF attachment.
 */
export function generateTransparencyCertificate(payment: any, type: 'Rent' | 'Service Charge'): string {
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const ref = payment.ref || `TX-${Math.floor(100000 + Math.random() * 900000)}`;
  const tenantName = payment.tenantName || 'Kehinde Olorunfemi';
  const propName = payment.propertyName || 'Lekki Phase 1 Smart Villa';
  const unit = payment.unitNumber || 'Suite A';
  const amountStr = `₦${(payment.amount || payment.rentAmount || 0).toLocaleString()}`;
  
  return `
========================================================================
             UNITY HOMES AND PROPERTIES LTD - TRANSPARENCY LEDGER
========================================================================
                  OFFICIAL TRANSACTION SECURITY CERTIFICATE

This certificate guarantees the immutability and permanence of this payment record
on the Unity Homes verified Ledger. Once verified, this ledger state can never 
be deleted or altered by any party, including administrators.

[CERTIFICATE DETAILS]
- Certificate Ref: Cert-${ref}
- Payment Type: ${type} Clearance
- Associated Ref: ${ref}
- Timestamp: ${dateStr}
- Verified Tenant: ${tenantName}
- Physical Real Estate: ${propName}
- Specific Unit: ${unit}
- Amount Cleared: ${amountStr}
- Ledger Block Hash: SHA256-${ref}-${Math.random().toString(36).substring(2, 10).toUpperCase()}

[SECURITY PRINCIPLE]
"Property as a Permanent Medical Record" — Unity Homes and Properties Ltd certifies
that this transaction has been irreversibly saved to the permanent audit trail.
========================================================================
  `;
}

/**
 * Helper to get or generate the PDF attachment.
 */
function ensurePdfAttachmentExists(payment: any, type: 'Rent' | 'Service Charge'): { fileName: string; content: string } {
  const ref = payment.ref || `TX-${Math.floor(100000 + Math.random() * 900000)}`;
  const fileName = `Transparency_Certificate_${ref}.pdf`;
  const textContent = generateTransparencyCertificate(payment, type);
  
  // Register in Document Vault (uh_documents_v1) if not exists
  const docs = getCollectionData<PlatformDocument>('documents', []);
  const docExists = docs.some(d => d.fileName === fileName);
  if (!docExists) {
    const newDoc: PlatformDocument = {
      id: `doc-${ref}`,
      title: `${type} Transparency Certificate - Ref ${ref}`,
      fileName,
      category: 'Receipt Certificate',
      dateCreated: new Date().toISOString().split('T')[0]
    };
    docs.unshift(newDoc);
    saveCollectionData('documents', docs);
  }
  
  return { fileName, content: textContent };
}

/**
 * Generates Branded HTML for Rent Payment Receipt Email
 */
export function generateRentReceiptHtml(payment: RentPayment): string {
  const amountStr = `₦${payment.amount.toLocaleString()}`;
  const dateStr = payment.paymentDate || new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });
  const ref = payment.ref || `TX-${Math.floor(100000 + Math.random() * 900000)}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Dark Green Brand Header -->
      <div style="background-color: #1B4332; padding: 30px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">UNITY HOMES</h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #D8F3DC; text-transform: uppercase; font-weight: bold;">Unity Homes and Properties Ltd</p>
      </div>
      
      <!-- Body Content -->
      <div style="padding: 40px 30px;">
        <h2 style="margin-top: 0; color: #1B4332; font-size: 20px; font-weight: 800; text-transform: uppercase; text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">Official Payment Receipt</h2>
        
        <div style="margin: 25px 0;">
          <!-- Ordered Fields as specified -->
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333333;">
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666; width: 40%;">Receipt Ref</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #1B4332;">${ref}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Tenant Name</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${payment.tenantName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Property Address</td>
              <td style="padding: 10px 0; text-align: right; line-height: 1.4;">${payment.propertyName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Unit</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${payment.unitNumber}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Ultimate Property Owner / PMC</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${payment.landlordName || 'Mrs Funmi Adebayo'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Receiving Bank Account</td>
              <td style="padding: 10px 0; text-align: right;">${payment.receivingAccountName || (payment.landlordName ? payment.landlordName + ' Account' : 'Unity Homes Trust Account')}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9; background-color: #f4fcf6;">
              <td style="padding: 12px 10px; font-weight: bold; color: #1B4332;">Gross Amount</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: 900; color: #2D6A4F; font-size: 16px;">${amountStr}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Date and Time</td>
              <td style="padding: 10px 0; text-align: right; font-family: monospace;">${dateStr}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Period</td>
              {/* DO NOT use clearing, settlement, or escrow language here. This platform never holds or clears funds. */}
              <td style="padding: 10px 0; text-align: right;">${payment.dueDate ? 'Rent Payment covering cycle until ' + payment.dueDate : 'Q3-Q4 Rent Payment Cycle'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Method</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #555555;">${payment.receivingBankName || 'Direct Bank Transfer'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Platform Ref</td>
              <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px;">UH-RENT-${payment.id}</td>
            </tr>
          </table>
        </div>
        
        <!-- Verified Seal Badge -->
        <div style="text-align: center; margin: 30px 0 10px 0; background: #eaf5ec; border: 1.5px dashed #2D6A4F; padding: 15px; border-radius: 8px;">
          <span style="display: inline-block; background-color: #2D6A4F; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">VERIFIED LEDGER ENTRY</span>
          <div style="font-size: 12px; color: #1B4332; font-weight: bold;">TRUSTED TRANSACTION COMPLETED</div>
          <p style="margin: 3px 0 0 0; font-size: 10px; color: #666666; line-height: 1.4;">This document is digitally signed by the Unity Homes automated ledger. Changes or deletions are architecturally impossible under immutable database protocols.</p>
        </div>
      </div>
      
      <!-- Gold Branded Footer -->
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="margin: 0; font-size: 10px; color: #777777; line-height: 1.5;">You received this automated receipt because a rent verification transaction cleared for your registered account profile. This document has been permanently archived in your platform Document Vault.</p>
        <p style="margin: 15px 0 0 0; font-size: 13px; color: #6FBE45; font-weight: bold; font-style: italic;">Don't Buy Wahala</p>
      </div>
    </div>
  `;
}

/**
 * Generates Branded HTML for Service Charge Payment Receipt Email
 */
export function generateServiceChargeReceiptHtml(bill: ServiceChargeBill): string {
  const b = bill as any;
  const amountStr = `₦${b.amount.toLocaleString()}`;
  const dateStr = b.dateVerified || new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });
  const ref = b.ref || `TX-${Math.floor(100000 + Math.random() * 900000)}`;
  const categoryName = b.categoryId === 'sc-sec' ? 'Security Levy' : b.categoryId === 'sc-diesel' ? 'Generator Diesel' : 'Estate Common Services';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <!-- Dark Green Brand Header -->
      <div style="background-color: #1B4332; padding: 30px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">UNITY HOMES</h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; color: #D8F3DC; text-transform: uppercase; font-weight: bold;">Unity Homes and Properties Ltd</p>
      </div>
      
      <!-- Body Content -->
      <div style="padding: 40px 30px;">
        <h2 style="margin-top: 0; color: #1B4332; font-size: 20px; font-weight: 800; text-transform: uppercase; text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">Official Service Charge Receipt</h2>
        
        <div style="margin: 25px 0;">
          <!-- Ordered Fields as specified -->
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #333333;">
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666; width: 40%;">Receipt Ref</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #1B4332;">${ref}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Tenant Name</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${b.tenantName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Property Address</td>
              <td style="padding: 10px 0; text-align: right; line-height: 1.4;">${b.propertyName || 'Magaji Gbagada Flat Buildings'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Unit</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${b.unitNumber || 'Suite 2B'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Managing Authority</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold;">${b.managingAuthority || 'Lagos Realty Partners'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Receiving Bank Account</td>
              <td style="padding: 10px 0; text-align: right;">${b.receivingAccountName || 'PMC Designated Operations Account'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9; background-color: #f4fcf6;">
              <td style="padding: 12px 10px; font-weight: bold; color: #1B4332;">Amount Verified</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: 900; color: #2D6A4F; font-size: 16px;">${amountStr}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Verification Date/Time</td>
              <td style="padding: 10px 0; text-align: right; font-family: monospace;">${dateStr}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Category</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #2D6A4F;">${categoryName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Method</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #555555;">${b.receivingBankName || 'Direct Interbank Transfer'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f9f9f9;">
              <td style="padding: 10px 0; font-weight: bold; color: #666666;">Platform Ref</td>
              <td style="padding: 10px 0; text-align: right; font-family: monospace; font-size: 11px;">UH-SC-${b.id}</td>
            </tr>
          </table>
        </div>
        
        <!-- Verified Seal Badge -->
        <div style="text-align: center; margin: 30px 0 10px 0; background: #eaf5ec; border: 1.5px dashed #2D6A4F; padding: 15px; border-radius: 8px;">
          <span style="display: inline-block; background-color: #2D6A4F; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">VERIFIED LEDGER ENTRY</span>
          <div style="font-size: 12px; color: #1B4332; font-weight: bold;">TRUSTED TRANSACTION COMPLETED</div>
          <p style="margin: 3px 0 0 0; font-size: 10px; color: #666666; line-height: 1.4;">This document is digitally signed by the Unity Homes automated ledger. Changes or deletions are architecturally impossible under immutable database protocols.</p>
        </div>
      </div>
      
      <!-- Gold Branded Footer -->
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="margin: 0; font-size: 10px; color: #777777; line-height: 1.5;">You received this automated receipt because a service charge validation cleared for your registered account profile. This document has been permanently archived in your platform Document Vault.</p>
        <p style="margin: 15px 0 0 0; font-size: 13px; color: #6FBE45; font-weight: bold; font-style: italic;">Don't Buy Wahala</p>
      </div>
    </div>
  `;
}

/**
 * Emulated Serverless Cloud Function Trigger
 */
export function emulateCloudFunctionTrigger(collectionName: string, beforeDoc: any, afterDoc: any) {
  // Determine if there is a target state change to confirmed or Paid
  const isRentTrigger = 
    (collectionName === 'rentPayments' || collectionName === 'rent_payments') && 
    beforeDoc.status === 'pending_confirmation' && 
    afterDoc.status === 'confirmed';
    
  const isServiceChargeTrigger = 
    (collectionName === 'serviceCharges' || collectionName === 'service_charges' || collectionName === 'charges') && 
    (beforeDoc.status === 'pending_verification' || beforeDoc.status === 'Pending Verification') && 
    (afterDoc.status === 'confirmed' || afterDoc.status === 'Paid');

  if (!isRentTrigger && !isServiceChargeTrigger) return;

  const type = isRentTrigger ? 'Rent' : 'Service Charge';
  const recipientEmail = afterDoc.tenantEmail || afterDoc.email || 'kehinde.olorunfemi@gmail.com';
  
  // Create or obtain Transparency Certificate PDF attachment
  const attachment = ensurePdfAttachmentExists(afterDoc, type);
  
  // Calculate date format for subject (e.g. 2026-07-20)
  const todayStr = new Date().toISOString().split('T')[0];
  const propAddr = afterDoc.propertyName || 'Lekki Phase 1 Smart Villa';
  
  const subject = isRentTrigger 
    ? `Payment Receipt — Unity Homes and Properties Ltd followed by ${propAddr} and ${todayStr}`
    : `Service Charge Receipt — Unity Homes and Properties Ltd followed by ${propAddr} and ${todayStr}`;
    
  const emailHtml = isRentTrigger 
    ? generateRentReceiptHtml(afterDoc as RentPayment)
    : generateServiceChargeReceiptHtml(afterDoc as ServiceChargeBill);

  // Check failure mode
  const isFailed = getEmailFailureMode();

  // Create Sent Email entry
  const sentEmail: SentEmail = {
    id: `email-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    recipientEmail,
    subject,
    body: emailHtml,
    sentAt: new Date().toISOString(),
    status: isFailed ? 'failed' : 'delivered',
    attachments: [attachment],
    errorMessage: isFailed ? 'SMTP Gateway Timeout: 504 Gateway Error' : undefined
  };

  // Push to local storage uh_sent_emails_v1
  const existingEmails = getCollectionData<SentEmail>('sent_emails', []);
  existingEmails.unshift(sentEmail);
  saveCollectionData('sent_emails', existingEmails);

  if (isFailed) {
    // Notify admin on failure immediately
    triggerNotificationCloudEvent(
      'dispute_raised',
      `SMTP Error: Failed to automatically send ${type} receipt email to ${recipientEmail} (${afterDoc.tenantName || 'Kehinde Olorunfemi'}). Ref: ${afterDoc.id}`,
      afterDoc.id,
      [{ role: 'Admin', targetId: 'Admin' }]
    );
  } else {
    // Write transaction directly to activityLog collection
    const storedLogsRaw = localStorage.getItem(ACTIVITY_LOG_KEY);
    const storedLogs = storedLogsRaw ? JSON.parse(storedLogsRaw) : [];
    
    const tenantId = afterDoc.tenantId || afterDoc.tenantCode || afterDoc.id || 'UH-KEHINDE-OLORUN';
    const logEntry = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actorName: 'System Cloud Function',
      actorRole: 'System',
      actionType: 'Payment Receipt Email Sent',
      recordAffected: isRentTrigger ? 'Rent Payment Receipt' : 'Service Charge Receipt',
      recordId: tenantId,
      details: `Tenant ID: ${tenantId}, Payment Type: ${type}, Timestamp: ${new Date().toISOString()}`
    };
    
    storedLogs.unshift(logEntry);
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(storedLogs));
    
    // Trigger reactive updates for audit trail UI
    window.dispatchEvent(new StorageEvent('storage', {
      key: ACTIVITY_LOG_KEY,
      newValue: JSON.stringify(storedLogs)
    }));
  }
}
