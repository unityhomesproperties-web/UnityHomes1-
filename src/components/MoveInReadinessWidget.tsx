import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, ShieldCheck, Upload, Send, FileText, Phone, Mail, User, Shield, Lock, Image } from 'lucide-react';
import { 
  FirestoreTenantProfile, 
  MoveInReadiness, 
  calculateMoveInReadiness, 
  getStoredTenantProfiles, 
  saveStoredTenantProfiles, 
  sendTenantInAppNotification,
  submitLevel2VerificationRequest
} from '../lib/firestoreArchitecture';

interface MoveInReadinessWidgetProps {
  profile: FirestoreTenantProfile;
  mode: 'tenant' | 'landlord' | 'admin';
  onProfileUpdated?: () => void;
}

export default function MoveInReadinessWidget({ profile, mode, onProfileUpdated }: MoveInReadinessWidgetProps) {
  const [currentProfile, setCurrentProfile] = useState<FirestoreTenantProfile>(profile);
  const readiness: MoveInReadiness = currentProfile.move_in_readiness || calculateMoveInReadiness(currentProfile);

  // Tenant Level 2 Form State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [ninInput, setNinInput] = useState(currentProfile.nin || '');
  const [idPhotoUrl, setIdPhotoUrl] = useState(currentProfile.government_id_photo || '');
  const [selfiePhotoUrl, setSelfiePhotoUrl] = useState(currentProfile.verification_selfie_photo || '');
  const [idType, setIdType] = useState(currentProfile.id_type || 'NIN');
  const [isSubmittingVerif, setIsSubmittingVerif] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Landlord override toggles for offline completion
  const handleToggleLandlordItem = (field: 'guarantor_confirmed' | 'lease_document_uploaded') => {
    const profiles = getStoredTenantProfiles();
    const idx = profiles.findIndex(p => p.id === currentProfile.id || p.user_id === currentProfile.user_id);
    if (idx >= 0) {
      if (field === 'guarantor_confirmed') {
        profiles[idx].guarantor_confirmed = !profiles[idx].guarantor_confirmed;
      }
      profiles[idx].move_in_readiness = calculateMoveInReadiness(profiles[idx]);
      saveStoredTenantProfiles(profiles);
      setCurrentProfile({ ...profiles[idx] });
      showToast('Checklist updated successfully!');
      if (onProfileUpdated) onProfileUpdated();
    }
  };

  const handleRemindTenant = (itemLabel: string) => {
    sendTenantInAppNotification(
      currentProfile.id,
      `Reminder from your landlord: Please complete your '${itemLabel}' on your Unity Homes Move-In Readiness checklist.`
    );
    showToast(`In-app notification sent to ${currentProfile.full_name}!`);
  };

  const handleSubmitLevel2Request = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPhotoUrl || !selfiePhotoUrl) {
      alert('Please upload both your Government ID and Verification Selfie photo.');
      return;
    }

    setIsSubmittingVerif(true);
    setTimeout(() => {
      submitLevel2VerificationRequest({
        tenant_id: currentProfile.id,
        tenant_name: currentProfile.full_name,
        tenant_phone: currentProfile.phone,
        tenant_email: currentProfile.email,
        nin: ninInput,
        id_type: idType,
        government_id_photo: idPhotoUrl,
        selfie_photo: selfiePhotoUrl
      });
      setIsSubmittingVerif(false);
      setShowVerificationModal(false);
      showToast('Level 2 Verification request submitted to Admin for review!');

      const updatedProfiles = getStoredTenantProfiles();
      const updated = updatedProfiles.find(p => p.id === currentProfile.id || p.user_id === currentProfile.user_id);
      if (updated) {
        setCurrentProfile({ ...updated });
      }
      if (onProfileUpdated) onProfileUpdated();
    }, 1000);
  };

  const mandatoryItems = [
    { label: 'Phone Number Verified', key: 'phone_verified', isDone: readiness.phone_verified, icon: Phone, canOverride: false },
    { label: 'Email Address Verified', key: 'email_verified', isDone: readiness.email_verified, icon: Mail, canOverride: false },
    { label: 'Passport Profile Photo', key: 'profile_photo_uploaded', isDone: readiness.profile_photo_uploaded, icon: User, canOverride: false },
    { label: 'Emergency Contact Added', key: 'emergency_contact_added', isDone: readiness.emergency_contact_added, icon: Shield, canOverride: false },
    { label: 'Guarantor Information Confirmed', key: 'guarantor_confirmed', isDone: readiness.guarantor_confirmed, icon: User, canOverride: true, fieldName: 'guarantor_confirmed' as const },
    { label: 'Signed Lease Document Uploaded', key: 'lease_document_uploaded', isDone: readiness.lease_document_uploaded, icon: FileText, canOverride: true, fieldName: 'lease_document_uploaded' as const },
  ];

  const level2Items = [
    { label: 'Government ID Uploaded', isDone: readiness.government_id_uploaded },
    { label: 'Verification Selfie Submitted', isDone: readiness.selfie_submitted },
    { label: 'Identity Verified by Admin', isDone: readiness.identity_verified },
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-800 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              MOVE-IN READINESS CHECKLIST
            </span>
            {currentProfile.verified_badge && (
              <span className="text-[9px] font-mono font-black uppercase text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                VERIFIED TENANT
              </span>
            )}
          </div>
          <h3 className="font-display font-bold text-#132A1D text-lg mt-1">
            Readiness Completion Tracking
          </h3>
          <p className="text-#6B7280 text-xs">
            Factual completion tracking system for move-in compliance.
          </p>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200 shrink-0">
          <div className="text-right">
            <span className="text-[9px] font-mono font-bold uppercase text-stone-400 block">Checklist Progress</span>
            <strong className="text-#132A1D font-mono font-black text-lg">
              {readiness.completion_percentage}%
            </strong>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-stone-200 flex items-center justify-center relative">
            <div 
              className={`w-full h-full rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                readiness.completion_percentage === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {mandatoryItems.filter(i => i.isDone).length}/6
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full bg-stone-50 h-2.5 rounded-full overflow-hidden border border-stone-200">
          <div 
            className="bg-[#18452E] h-full transition-all duration-500" 
            style={{ width: `${readiness.completion_percentage}%` }}
          />
        </div>
      </div>

      {/* Mandatory Items Checklist Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-black uppercase text-stone-400 tracking-wider">
          Mandatory Move-In Requirements (6 Core Controls)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mandatoryItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div 
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                  item.isDone ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-#132A1D'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold block">{item.label}</span>
                    <span className="text-[9px] font-mono text-stone-400">
                      {item.isDone ? 'Completed & Verified' : 'Action Required'}
                    </span>
                  </div>
                </div>

                {/* Role Specific Actions */}
                {mode === 'landlord' && !item.isDone && (
                  <div className="flex items-center gap-2">
                    {item.canOverride && item.fieldName && (
                      <button
                        onClick={() => handleToggleLandlordItem(item.fieldName!)}
                        className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-#132A1D text-[10px] font-bold rounded-xl transition cursor-pointer"
                      >
                        Mark Completed
                      </button>
                    )}
                    <button
                      onClick={() => handleRemindTenant(item.label)}
                      className="px-2.5 py-1 bg-emerald-800 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-900 transition cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Remind</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Level 2 Verification / Verified Badge Section */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <div>
              <strong className="text-xs font-bold text-amber-950 block">Level 2 Identity Verification (Verified Badge)</strong>
              <span className="text-[10px] text-amber-800">Optional identity verification for high-trust tenancy standing.</span>
            </div>
          </div>

          {mode === 'tenant' && !currentProfile.verified_badge && (
            <button
              onClick={() => setShowVerificationModal(true)}
              className="px-3 py-1.5 bg-[#C9A84C] hover:bg-[#B8973B] text-#132A1D text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Submit Verification</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-200/60">
          {level2Items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {item.isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-amber-300 shrink-0" />
              )}
              <span className={item.isDone ? 'font-bold text-#132A1D' : 'text-#6B7280'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TENANT MODAL: Submit Level 2 Verification */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-#132A1D/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-display font-bold text-#132A1D text-base">Level 2 Identity Verification</h3>
              </div>
              <button 
                onClick={() => setShowVerificationModal(false)}
                className="text-stone-400 hover:text-#6B7280 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitLevel2Request} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
                  National Identification Number (NIN)
                </label>
                <input 
                  type="text" 
                  value={ninInput}
                  onChange={(e) => setNinInput(e.target.value)}
                  placeholder="Enter 11-digit NIN"
                  maxLength={11}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs outline-none focus:border-emerald-700"
                />
                <span className="text-[9px] text-stone-400 block mt-1">
                  NIN is checked against database records for duplicate prevention.
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
                  ID Type
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                >
                  <option value="NIN">National Identity Number Card (NIN)</option>
                  <option value="International Passport">International Passport</option>
                  <option value="Drivers License">Driver's License</option>
                  <option value="Voters Card">Permanent Voter's Card (PVC)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
                  Upload Government ID Photo URL / File
                </label>
                <input 
                  type="text" 
                  required
                  value={idPhotoUrl}
                  onChange={(e) => setIdPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or upload link"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-#6B7280 uppercase mb-1">
                  Upload Verification Selfie Photo URL / File
                </label>
                <input 
                  type="text" 
                  required
                  value={selfiePhotoUrl}
                  onChange={(e) => setSelfiePhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or upload link"
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  className="flex-1 py-2.5 bg-stone-50 text-#132A1D font-bold rounded-xl hover:bg-stone-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVerif}
                  className="flex-1 py-2.5 bg-[#18452E] text-white font-bold rounded-xl hover:bg-[#18452E] transition cursor-pointer shadow-md"
                >
                  {isSubmittingVerif ? 'Transmitting...' : 'Submit to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
