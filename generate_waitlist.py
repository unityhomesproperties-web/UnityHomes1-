import os

with open("src/components/WaitlistRegistration.tsx", "w") as f:
    f.write("""import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, ChevronRight, Lock, Shield, ArrowRight, User, Home, Building, 
  Briefcase, Scale, Map, Hammer, AlertCircle, Loader2, CheckCircle2,
  Mail, Phone, MapPin, Building2, Star
} from 'lucide-react';

const ROLES = [
  { id: 'Property Seeker', icon: Home, label: 'Property Seeker', desc: 'Looking to buy or rent' },
  { id: 'Let Unity Homes Manage My Property', icon: Shield, label: 'Manage My Property', desc: 'Trust us to manage your assets' },
  { id: 'Long-Term Landlord', icon: Building, label: 'Long-Term Landlord', desc: 'Owner of multiple properties' },
  { id: 'Shortlet Landlord', icon: Home, label: 'Shortlet Landlord', desc: 'Owner of short-term rentals' },
  { id: 'Property Management Company', icon: Briefcase, label: 'Management Company', desc: 'Agency or management firm' },
  { id: 'Property Lawyer', icon: Scale, label: 'Property Lawyer', desc: 'Legal professional' },
  { id: 'Licensed Surveyor', icon: Map, label: 'Licensed Surveyor', desc: 'Surveying professional' },
  { id: 'Structural Engineer', icon: Hammer, label: 'Structural Engineer', desc: 'Engineering professional' },
];

const INTERESTS = [
  'Buying Property',
  'Renting',
  'Property Management',
  'Property Verification',
  'Trusted Professionals',
  'Digital Property Records'
];

type FormData = {
  role: string;
  fullName: string;
  email: string;
  phone: string;
  state: string;
  contactMethod: string;
  
  primaryInterest: string;
  budgetRange: string;
  preferredState: string;
  
  propertyType: string;
  propertyLocation: string;
  
  portfolioName: string;
  numberOfProperties: string;
  needPropertyManagement: string;
  
  businessName: string;
  unitsManaged: string;
  interestedInManagement: string;
  
  companyName: string;
  website: string;
  managedPropertiesCount: string;
  
  firm: string;
  yearsOfExperience: string;
  verifiedDirectoryConsent: boolean;

  interests: string[];
  referralCode: string;
};

const INITIAL_DATA: FormData = {
  role: '',
  fullName: '',
  email: '',
  phone: '',
  state: '',
  contactMethod: 'Email',
  primaryInterest: '',
  budgetRange: '',
  preferredState: '',
  propertyType: '',
  propertyLocation: '',
  portfolioName: '',
  numberOfProperties: '',
  needPropertyManagement: '',
  businessName: '',
  unitsManaged: '',
  interestedInManagement: '',
  companyName: '',
  website: '',
  managedPropertiesCount: '',
  firm: '',
  yearsOfExperience: '',
  verifiedDirectoryConsent: false,
  interests: [],
  referralCode: ''
};

export default function WaitlistRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('unity_waitlist_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role) {
          setFormData(parsed);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('unity_waitlist_draft', JSON.stringify(formData));
  }, [formData]);

  const updateForm = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  const goToStep = (s: number) => setStep(s);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    localStorage.removeItem('unity_waitlist_draft');
  };

  const renderProgress = () => {
    const progress = ((step - 1) / 4) * 100;
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            Step {step} of 5
          </span>
          <span className="text-xs font-semibold text-[var(--theme-brand-bg)]">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div className="w-full h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--theme-brand-bg)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-2">Select Your Role</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">How do you intend to use Unity Homes?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => { updateForm({ role: role.id }); nextStep(); }}
            className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-300 ${
              formData.role === role.id
                ? 'border-[var(--theme-brand-bg)] bg-[var(--theme-brand-bg)]/5 shadow-[0_0_15px_rgba(20,71,49,0.1)]'
                : 'border-[var(--color-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-brand-bg)]/30 hover:-translate-y-1 hover:shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              formData.role === role.id ? 'bg-[var(--theme-brand-bg)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)]'
            }`}>
              {formData.role === role.id ? <Check className="w-5 h-5" /> : <role.icon className="w-5 h-5" />}
            </div>
            <div>
              <h4 className={`font-semibold text-sm mb-1 ${formData.role === role.id ? 'text-[var(--theme-brand-bg)]' : 'text-[var(--color-text-primary)]'}`}>
                {role.label}
              </h4>
              <p className="text-xs text-[var(--color-text-secondary)]">{role.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-2">Basic Information</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">Let us know how to reach you.</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => updateForm({ fullName: e.target.value })}
            className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:border-[var(--theme-brand-bg)] transition-all"
            placeholder="Olayinka Ayodele"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateForm({ email: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:border-[var(--theme-brand-bg)] transition-all"
              placeholder="olayinka@example.com"
            />
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1 ml-1">We'll send a verification email to activate your waitlist registration.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateForm({ phone: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:border-[var(--theme-brand-bg)] transition-all"
              placeholder="+234 800 000 0000"
            />
             <p className="text-[10px] text-[var(--color-text-muted)] mt-1 ml-1">We'll only contact you regarding your registration.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">State</label>
            <select
              value={formData.state}
              onChange={(e) => updateForm({ state: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:border-[var(--theme-brand-bg)] transition-all appearance-none"
            >
              <option value="">Select State</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Ogun">Ogun</option>
              <option value="Oyo">Oyo</option>
              <option value="Rivers">Rivers</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Preferred Contact</label>
            <div className="flex gap-2">
              {['Email', 'Phone', 'WhatsApp'].map(method => (
                <button
                  key={method}
                  onClick={() => updateForm({ contactMethod: method })}
                  className={`flex-1 h-12 rounded-xl border text-xs font-semibold transition-all ${
                    formData.contactMethod === method 
                      ? 'bg-[var(--theme-brand-bg)] border-[var(--theme-brand-bg)] text-white' 
                      : 'bg-[var(--theme-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--theme-brand-bg)]/30'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-4 h-12">
          Back
        </button>
        <button 
          onClick={nextStep} 
          disabled={!formData.fullName || !formData.email || !formData.phone}
          className="h-12 px-8 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg)] text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-2">Role Information</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">Help us tailor your experience as a {formData.role}.</p>
      </div>
      
      <div className="space-y-4">
        {formData.role === 'Property Seeker' && (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Primary Interest</label>
              <select value={formData.primaryInterest} onChange={(e) => updateForm({ primaryInterest: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all">
                <option value="">Select Interest</option>
                <option value="Buying">Buying</option>
                <option value="Renting">Renting</option>
                <option value="Shortlet">Shortlet</option>
              </select>
            </div>
            <div>
               <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Budget Range (₦)</label>
               <input type="text" value={formData.budgetRange} onChange={(e) => updateForm({ budgetRange: e.target.value })} placeholder="e.g. 5M - 10M" className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all" />
            </div>
          </>
        )}
        
        {formData.role === 'Let Unity Homes Manage My Property' && (
          <>
            <div>
               <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Property Type</label>
               <input type="text" value={formData.propertyType} onChange={(e) => updateForm({ propertyType: e.target.value })} placeholder="e.g. 4 Bedroom Duplex" className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all" />
            </div>
            <div>
               <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Property Location</label>
               <input type="text" value={formData.propertyLocation} onChange={(e) => updateForm({ propertyLocation: e.target.value })} placeholder="e.g. Lekki Phase 1" className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all" />
            </div>
          </>
        )}

        {(formData.role === 'Long-Term Landlord' || formData.role === 'Shortlet Landlord') && (
           <>
            <div>
               <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">{formData.role === 'Shortlet Landlord' ? 'Business Name (Optional)' : 'Portfolio Name (Optional)'}</label>
               <input type="text" value={formData.role === 'Shortlet Landlord' ? formData.businessName : formData.portfolioName} onChange={(e) => updateForm(formData.role === 'Shortlet Landlord' ? { businessName: e.target.value } : { portfolioName: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all" />
            </div>
            <div>
               <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Number of Properties/Units</label>
               <input type="number" value={formData.role === 'Shortlet Landlord' ? formData.unitsManaged : formData.numberOfProperties} onChange={(e) => updateForm(formData.role === 'Shortlet Landlord' ? { unitsManaged: e.target.value } : { numberOfProperties: e.target.value })} placeholder="e.g. 5" className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all" />
            </div>
           </>
        )}

        {formData.role === 'Property Management Company' && (
           <>
            <div>
               <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Company Name</label>
               <input type="text" value={formData.companyName} onChange={(e) => updateForm({ companyName: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all" />
            </div>
            <div>
               <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Properties Managed</label>
               <input type="number" value={formData.managedPropertiesCount} onChange={(e) => updateForm({ managedPropertiesCount: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all" />
            </div>
           </>
        )}

        {['Property Lawyer', 'Licensed Surveyor', 'Structural Engineer'].includes(formData.role) && (
           <>
            <div>
               <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Firm / Practice Name</label>
               <input type="text" value={formData.firm} onChange={(e) => updateForm({ firm: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all" />
            </div>
            <div>
               <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Years of Experience</label>
               <input type="number" value={formData.yearsOfExperience} onChange={(e) => updateForm({ yearsOfExperience: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all" />
            </div>
            <label className="flex items-start gap-3 mt-4 cursor-pointer p-4 rounded-xl border border-[var(--color-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-brand-bg)]/30 transition-all">
               <div className="pt-0.5">
                 <input type="checkbox" checked={formData.verifiedDirectoryConsent} onChange={(e) => updateForm({ verifiedDirectoryConsent: e.target.checked })} className="w-4 h-4 text-[var(--theme-brand-bg)] rounded border-[var(--color-border)] focus:ring-[var(--theme-brand-bg)]" />
               </div>
               <div>
                 <p className="text-sm font-semibold text-[var(--color-text-primary)]">Include in Verified Directory</p>
                 <p className="text-xs text-[var(--color-text-secondary)] mt-1">I consent to being verified and listed in Unity Homes' professional directory.</p>
               </div>
            </label>
           </>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-4 h-12">
          Back
        </button>
        <button 
          onClick={nextStep} 
          className="h-12 px-8 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg)] text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-all"
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-2">Interests & Referrals</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">What features are you most excited about?</p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {INTERESTS.map(interest => (
          <button
            key={interest}
            onClick={() => {
              const current = formData.interests;
              if (current.includes(interest)) {
                updateForm({ interests: current.filter(i => i !== interest) });
              } else {
                updateForm({ interests: [...current, interest] });
              }
            }}
            className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
              formData.interests.includes(interest)
                ? 'bg-[var(--theme-brand-bg)] border-[var(--theme-brand-bg)] text-white shadow-md'
                : 'bg-[var(--theme-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--theme-brand-bg)]/30 hover:-translate-y-0.5'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>

      <div className="pt-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">Referral Code (Optional)</label>
        <input
          type="text"
          value={formData.referralCode}
          onChange={(e) => updateForm({ referralCode: e.target.value })}
          className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all uppercase tracking-widest"
          placeholder="e.g. UH-2024-ABC"
        />
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1 ml-1">If someone referred you, enter their code.</p>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-4 h-12">
          Back
        </button>
        <button 
          onClick={nextStep} 
          disabled={formData.interests.length === 0}
          className="h-12 px-8 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg)] text-sm font-semibold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          Review <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-2">Review & Submit</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">Please confirm your details before joining.</p>
      </div>

      <div className="space-y-4">
        {/* Section 1 */}
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-[var(--color-text-primary)] text-sm flex items-center gap-2"><User className="w-4 h-4 text-[var(--theme-brand-bg)]"/> Personal Info</h4>
            <button onClick={() => goToStep(2)} className="text-xs font-semibold text-[var(--theme-brand-bg)] hover:underline">Edit</button>
          </div>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Name</p>
              <p className="font-medium text-[var(--color-text-primary)]">{formData.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">State</p>
              <p className="font-medium text-[var(--color-text-primary)]">{formData.state || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Email</p>
              <p className="font-medium text-[var(--color-text-primary)] truncate pr-2">{formData.email}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Phone</p>
              <p className="font-medium text-[var(--color-text-primary)]">{formData.phone}</p>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-[var(--color-text-primary)] text-sm flex items-center gap-2"><Briefcase className="w-4 h-4 text-[var(--theme-brand-bg)]"/> Role Info</h4>
            <button onClick={() => goToStep(3)} className="text-xs font-semibold text-[var(--theme-brand-bg)] hover:underline">Edit</button>
          </div>
          <div className="text-sm">
            <p className="text-xs text-[var(--color-text-muted)]">Selected Role</p>
            <p className="font-medium text-[var(--color-text-primary)] mb-2">{formData.role}</p>
            {formData.firm && <><p className="text-xs text-[var(--color-text-muted)]">Firm</p><p className="font-medium text-[var(--color-text-primary)]">{formData.firm}</p></>}
            {formData.companyName && <><p className="text-xs text-[var(--color-text-muted)]">Company</p><p className="font-medium text-[var(--color-text-primary)]">{formData.companyName}</p></>}
          </div>
        </div>

        {/* Section 3 */}
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-[var(--color-text-primary)] text-sm flex items-center gap-2"><Star className="w-4 h-4 text-[var(--theme-brand-bg)]"/> Interests</h4>
            <button onClick={() => goToStep(4)} className="text-xs font-semibold text-[var(--theme-brand-bg)] hover:underline">Edit</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.interests.map(i => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-[var(--color-border)] text-[var(--color-text-secondary)] text-[11px] font-medium">{i}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full h-14 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] text-base font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 shadow-lg shadow-[var(--theme-brand-bg)]/20"
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Join the Waitlist'}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
          <Lock className="w-3 h-3" /> Your information is encrypted and will never be shared.
        </p>
      </div>
      
      <div className="flex justify-center pt-2">
        <button onClick={prevStep} disabled={isSubmitting} className="text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          Back to edit
        </button>
      </div>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-8 flex flex-col items-center text-center space-y-6"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-[var(--theme-brand-bg)]/20 rounded-full blur-xl animate-pulse"></div>
        <div className="w-20 h-20 bg-[var(--theme-brand-bg)]/10 rounded-full flex items-center justify-center relative z-10 border border-[var(--theme-brand-bg)]/30">
          <CheckCircle2 className="w-10 h-10 text-[var(--theme-brand-bg)]" />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-3">You're Officially on the Waitlist!</h3>
        <p className="text-base text-[var(--color-text-secondary)] max-w-[300px] mx-auto leading-relaxed">
          Thank you for joining Unity Homes. We've sent a confirmation email.
        </p>
        <p className="text-sm font-semibold text-[var(--theme-brand-bg)] mt-2">
          Please verify your email to activate your registration.
        </p>
      </div>
      
      <div className="w-full space-y-3 pt-6">
        <button className="w-full h-14 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg)] text-base font-semibold hover:scale-[1.02] transition-all flex justify-center items-center gap-2">
          <Mail className="w-5 h-5"/> Verify My Email
        </button>
        <button onClick={() => setShowModal(true)} className="w-full h-14 rounded-xl bg-[var(--theme-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-base font-semibold hover:bg-[var(--color-bg)] transition-all">
          Continue
        </button>
      </div>
    </motion.div>
  );

  return (
    <section id="waitlist" className="py-24 relative overflow-hidden bg-[var(--color-bg)] z-10">
      <div className="max-w-[1320px] mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--theme-brand-bg)]/30 bg-[var(--theme-brand-bg)]/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--theme-brand-bg)] animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--theme-brand-bg)]">Exclusive Early Access</span>
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-[var(--color-text-primary)] tracking-tight mb-4">
            Join the Unity Homes Waitlist
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-[700px] lg:mx-0 mx-auto">
            Be among the first to experience Nigeria's most transparent real estate technology platform and receive priority access before launch.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* LEFT: Trust Panel */}
          <div className="w-full lg:w-[40%] flex flex-col justify-between">
            <div>
              <h3 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-8">Why Join Early?</h3>
              <div className="space-y-6">
                {[
                  { title: 'Priority platform access', icon: AlertCircle },
                  { title: 'Early product updates', icon: Mail },
                  { title: 'Exclusive launch invitations', icon: Star },
                  { title: 'Access to verified professionals', icon: Shield },
                  { title: 'Future referral rewards', icon: CheckCircle2 }
                ].map((benefit, i) => (
                  <div key={i} className="group flex items-center gap-4 pb-6 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                    <div className="w-12 h-12 rounded-full bg-[var(--theme-surface)] border border-[var(--color-border)] flex items-center justify-center shrink-0 group-hover:bg-[var(--theme-brand-bg)]/5 group-hover:border-[var(--theme-brand-bg)]/30 group-hover:scale-110 transition-all duration-300">
                      <benefit.icon className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--theme-brand-bg)] transition-colors" />
                    </div>
                    <span className="text-base font-semibold text-[var(--color-text-primary)]">{benefit.title}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 p-6 rounded-2xl bg-[var(--theme-surface)] border border-[var(--color-border)] flex items-start gap-4 hidden lg:flex">
              <Lock className="w-6 h-6 text-[var(--theme-brand-bg)] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[var(--color-text-primary)] text-sm mb-1">Bank-Level Security</h4>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">Your information is encrypted and securely stored. We never share your data with third parties without explicit consent.</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Registration Card */}
          <div className="w-full lg:w-[60%]">
            <div className="sticky top-28 bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-[32px] p-6 md:p-10 shadow-xl shadow-[var(--color-text-primary)]/5 dark:shadow-[var(--color-bg)]/50">
              
              {!isSuccess && renderProgress()}
              
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div key="success" className="min-h-[400px] flex items-center justify-center">
                    {renderSuccess()}
                  </motion.div>
                ) : (
                  <motion.div key={`step-${step}`} className="min-h-[400px]">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>

      {/* Optional Area Intelligence Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-[32px] p-8 shadow-2xl z-10"
            >
              <div className="w-16 h-16 bg-[var(--color-bg)] rounded-full flex items-center justify-center mb-6 mx-auto border border-[var(--color-border)]">
                <MapPin className="w-8 h-8 text-[var(--theme-brand-bg)]" />
              </div>
              <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] text-center mb-3">
                Help Build Better Area Intelligence
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8 leading-relaxed">
                Spend just a few minutes helping us build Nigeria's most trusted neighbourhood database. Your insights will help others make better real estate decisions.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => { setShowModal(false); window.scrollTo(0,0); }} 
                  className="w-full h-14 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:scale-[1.02] transition-all"
                >
                  Contribute Area Insights
                </button>
                <button 
                  onClick={() => { setShowModal(false); window.scrollTo(0,0); }} 
                  className="w-full h-14 rounded-xl bg-transparent text-[var(--color-text-secondary)] font-semibold hover:text-[var(--color-text-primary)] transition-all"
                >
                  Skip For Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
""")
