import React, { useState } from 'react';
import { Building, ShieldCheck, Mail, Phone, MapPin, Award, CheckCircle } from 'lucide-react';
import { savePMCApplication } from '../data';

interface PmcApplicationPageProps {
  navigate: (path: string, params?: any) => void;
}

export default function PmcApplicationPage({ navigate }: PmcApplicationPageProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    phone: '',
    whatsapp: '',
    email: '',
    cacNumber: '',
    address: '',
    yearsOperating: 1,
    propertiesManaged: 10,
    references: '',
    receivingAuthority: 'Landlord Receives Directly' as 'Landlord Receives Directly' | 'This Company Receives on Landlord\'s Behalf',
    tenantRelationshipManager: '',
    maintenanceHandler: '',
    expenseApprover: ''
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactName || !formData.email || !formData.cacNumber || !formData.tenantRelationshipManager || !formData.maintenanceHandler || !formData.expenseApprover) {
      alert('Please fill out all required company metrics.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      savePMCApplication({
        companyName: formData.companyName,
        contactName: formData.contactName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        email: formData.email,
        cacNumber: formData.cacNumber,
        address: formData.address,
        yearsOperating: formData.yearsOperating,
        propertiesManaged: formData.propertiesManaged,
        references: formData.references,
        receivingAuthority: formData.receivingAuthority,
        tenantRelationshipManager: formData.tenantRelationshipManager,
        maintenanceHandler: formData.maintenanceHandler,
        expenseApprover: formData.expenseApprover
      });
      setSuccess(true);
    }, 1800);
  };

  return (
    <div className="min-h-screen py-10 px-4 md:px-8 bg-[#F0F8F4] flex items-center justify-center">
      <div className="bg-white rounded-[var(--radius-large)] border border-stone-200 shadow-sm p-8 max-w-2xl w-full">
        
        {/* Header Block inline matching STEP 5 SPEC */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center p-2 mb-3">
            <Building className="w-full h-full text-[#1A5C50]" />
          </div>
          <span className="font-mono text-[10px] font-semibold tracking-widest text-[#C9A84C] uppercase">
            CORPORATE PARTNERSHIP
          </span>
          <h1 className="text-2xl font-display font-semibold text-[#18452E] mt-1">
            Apply as Property Management Company
          </h1>
          <p className="text-xs text-stone-500 mt-1 pr-6 pl-6 font-normal">
            Register your firm for administrative vetting. Once approved, you gain multi-portfolio dashboard capabilities.
          </p>
        </div>

        {success ? (
          <div className="text-center p-6 space-y-4">
            <div className="w-16 h-16 bg-teal-100 text-[#1A5C50] rounded-full flex items-center justify-center mx-auto text-3xl">
              ✓
            </div>
            <h3 className="font-display font-semibold text-sm text-[#18452E] uppercase font-mono">
              Corporate Request Form Logged
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Your partnership request has been received. A member of the Unity Homes administrative team will reach out personally via phone or email within a few business days to coordinate credentials.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 w-full py-3 bg-[#1A5C50] text-[#F0F8F4] hover:bg-teal-900 font-semibold rounded-xl text-xs transition cursor-pointer shadow-sm"
            >
              Return to Homepage
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Company Corporate Name*</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E]"
                  placeholder="Lekki Prime Management Ltd"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Corporate CAC Number*</label>
                <input
                  type="text"
                  required
                  value={formData.cacNumber}
                  onChange={(e) => setFormData({ ...formData, cacNumber: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E]"
                  placeholder="e.g. RC-1849120"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Contact Person Full Name*</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E]"
                  placeholder="Deji Adeniyi"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Contact Corporate Email*</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E]"
                  placeholder="deji@lekkiprime.ng"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Phone Line Connection*</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E]"
                  placeholder="+234 812..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#18452E] uppercase">WhatsApp Connecting Number</label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E]"
                  placeholder="+234 812..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Years Corporate Operating</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.yearsOperating}
                  onChange={(e) => setFormData({ ...formData, yearsOperating: parseInt(e.target.value) || 0 })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Active Portfolios Controlled (Units count)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.propertiesManaged}
                  onChange={(e) => setFormData({ ...formData, propertiesManaged: parseInt(e.target.value) || 0 })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Physical Registered Office Address*</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E]"
                placeholder="22 Admiralty Road, Lekki Phase 1, Lagos"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Reference Credentials / Free Notes text (Optional)</label>
              <textarea
                value={formData.references}
                onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs h-20 resize-none text-[#18452E]"
                placeholder="Describe current diasporan landlord listings with legal perfection briefs..."
              ></textarea>
            </div>

            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="text-[#18452E] font-semibold text-sm">Service & Compliance Setup</h3>
              
              <div>
                <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Receiving Authority*</label>
                <select
                  required
                  value={formData.receivingAuthority}
                  onChange={(e) => setFormData({ ...formData, receivingAuthority: e.target.value as any })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E] mt-1"
                >
                  <option value="Landlord Receives Directly">Landlord Receives Directly (Direct to Owner's Bank)</option>
                  <option value="This Company Receives on Landlord's Behalf">This Company Receives on Landlord's Behalf</option>
                </select>
                <p className="text-[10px] text-#6B7280 mt-1">Determines which verified bank account a property is linked to.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Tenant Relationship Manager*</label>
                  <input
                    type="text"
                    required
                    value={formData.tenantRelationshipManager}
                    onChange={(e) => setFormData({ ...formData, tenantRelationshipManager: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E] mt-1"
                    placeholder="Name of person responsible for tenants"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Maintenance Handler*</label>
                  <input
                    type="text"
                    required
                    value={formData.maintenanceHandler}
                    onChange={(e) => setFormData({ ...formData, maintenanceHandler: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E] mt-1"
                    placeholder="Name of person responsible for repairs"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-semibold text-[#18452E] uppercase">Expense Approver*</label>
                <input
                  type="text"
                  required
                  value={formData.expenseApprover}
                  onChange={(e) => setFormData({ ...formData, expenseApprover: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-xs text-[#18452E] mt-1"
                  placeholder="Person authorised to approve maintenance costs"
                />
                <p className="text-[10px] text-#6B7280 mt-1">Every maintenance cost entered must require this Approved By field before it counts in profitability figures.</p>
              </div>
            </div>

            {/* Disclaimer and Submit Conforming to STEP 5 SPEC */}
            <div className="bg-[#1A5C50]/5 rounded-xl p-4 border border-[#1A5C50]/20 text-[11px] text-[#1A5C50] leading-relaxed">
              <span className="font-semibold flex items-center space-x-1.5 font-mono text-[9px] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-[#1A5C50]" />
                ADMINISTRATIVE LICENSE VET
              </span>
              Approval is not automatic and is based on a personal review of corporate registry records by the founder <strong>Olayinka Ayodele</strong>.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1A5C50] text-[#F0F8F4] hover:bg-teal-900 border border-[#1A5C50] rounded-xl font-semibold font-sans text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center space-x-1"
            >
              {isSubmitting ? 'Verifying Corporate Credentials RC...' : 'Apply to Partner With Unity Homes'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
