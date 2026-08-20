import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, ArrowRight, User, Home, Building, Shield,
  Scale, Map, Compass, Mail, Phone, MapPin, Briefcase, ChevronRight, Lock
} from 'lucide-react';

export default function WaitlistRegistration() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>(() => {
    const saved = localStorage.getItem('unityWaitlistDraft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      role: '',
      fullName: '',
      email: '',
      phone: '',
      state: '',
      // Role specific
      seekerInterests: [], // for Property Seeker
      propertyCount: '', // for Landlords / PMC
      propertyType: '', // for Landlords / PMC
      landlordService: '', // for Landlords / PMC
      firmName: '', // Professionals
      registrationNumber: '', // Professionals
      yearsOfExperience: '', // Professionals
      professionalConsent: false,
      // General Services
      generalServices: [],
      // Review
      finalConfirm: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('unityWaitlistDraft', JSON.stringify(formData));
  }, [formData]);

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    window.scrollTo({ top: document.getElementById('join')?.offsetTop! - 100, behavior: 'smooth' });
    setStep(s => Math.min(6, s + 1));
  };
  
  const prevStep = () => {
    window.scrollTo({ top: document.getElementById('join')?.offsetTop! - 100, behavior: 'smooth' });
    setStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      localStorage.removeItem('unityWaitlistDraft');
      setTimeout(() => setShowModal(true), 1500);
    }, 1500);
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const roles = [
    { id: 'Property Seeker', icon: User, desc: 'Looking to buy, rent, or verify property' },
    { id: 'Long-Term Landlord', icon: Home, desc: 'Managing annual rent properties' },
    { id: 'Shortlet Landlord', icon: Home, desc: 'Managing short-stay apartments' },
    { id: 'Property Management Company', icon: Building, desc: 'Professional property managers' },
    { id: 'Property Lawyer', icon: Scale, desc: 'Legal professional in real estate' },
    { id: 'Licensed Surveyor', icon: Compass, desc: 'Registered land surveyor' },
    { id: 'Structural Engineer', icon: Shield, desc: 'Certified structural engineer' },
  ];

  const seekerInterestOptions = [
    'Buying Property', 'Renting Property', 'Professional Services', 'Property Verification', 'Area Intelligence'
  ];

  const landlordServiceOptions = [
    'List My Property Only', 'List and Use Unity Homes Manager', 'Both Services'
  ];

  const generalServiceOptions = [
    'Property Listings', 'Property Verification', 'Trusted Professionals', 
    'Property Management', 'Facilities Management', 'Waitlist Access'
  ];

  const isProfessional = ['Property Lawyer', 'Licensed Surveyor', 'Structural Engineer'].includes(formData.role);
  const isLandlordOrPMC = ['Long-Term Landlord', 'Shortlet Landlord', 'Property Management Company'].includes(formData.role);

  // Validation
  const canProceedStep1 = formData.role !== '';
  const canProceedStep2 = formData.fullName.length > 2 && formData.email.includes('@') && formData.phone.length >= 10 && formData.state !== '';
  
  const canProceedStep3 = () => {
    if (formData.role === 'Property Seeker') {
      return formData.seekerInterests.length > 0;
    }
    if (isLandlordOrPMC) {
      return formData.propertyCount !== '' && formData.propertyType !== '' && formData.landlordService !== '';
    }
    if (isProfessional) {
      return formData.firmName !== '' && formData.registrationNumber !== '' && formData.yearsOfExperience !== '' && formData.professionalConsent;
    }
    return true;
  };

  const canProceedStep4 = formData.generalServices.length > 0;
  const canProceedStep5 = formData.finalConfirm;

  const renderProgress = () => {
    const steps = ['Role', 'Details', 'Specifics', 'Services', 'Review'];
    return (
      <div className="w-full max-w-3xl mx-auto mb-10 px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[var(--color-border)] z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--theme-brand-bg)] z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
          
          {steps.map((s, idx) => {
            const sIdx = idx + 1;
            const isCompleted = step > sIdx;
            const isCurrent = step === sIdx;
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2 bg-[var(--color-bg)] px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-[var(--theme-brand-bg)] border-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)]' :
                  isCurrent ? 'bg-[var(--color-bg)] border-[var(--theme-brand-bg)] text-[var(--theme-brand-bg)]' :
                  'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-brand-bg)]"></div> : <div className="w-2.5 h-2.5 rounded-full bg-transparent border border-[var(--color-border)]"></div>}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:block ${
                  isCurrent || isCompleted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
                }`}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const inputClass = "w-full h-14 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--theme-brand-bg)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] transition-all";
  const labelClass = "block text-sm font-semibold text-[var(--color-text-primary)] mb-2";

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-semibold text-[var(--color-text-primary)] mb-3">How do you intend to use Unity Homes?</h3>
        <p className="text-[var(--color-text-secondary)]">Select the role that best describes you.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map(r => {
          const isSelected = formData.role === r.id;
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => updateForm('role', r.id)}
              className={`p-4 rounded-2xl border text-left flex items-start gap-4 transition-all duration-200 ${
                isSelected 
                  ? 'bg-[var(--theme-brand-bg)]/5 border-[var(--theme-brand-bg)] shadow-sm' 
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)]' : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className={`block font-semibold mb-1 ${isSelected ? 'text-[var(--theme-brand-bg)]' : 'text-[var(--color-text-primary)]'}`}>{r.id}</span>
                <span className="block text-xs text-[var(--color-text-secondary)] leading-relaxed">{r.desc}</span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="pt-6 border-t border-[var(--color-border)] flex justify-end">
        <button onClick={nextStep} disabled={!canProceedStep1} className="h-14 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-semibold text-[var(--color-text-primary)] mb-3">Basic Information</h3>
        <p className="text-[var(--color-text-secondary)]">Let us know how to reach you.</p>
      </div>
      
      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <label className={labelClass}>Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input type="text" value={formData.fullName} onChange={e => updateForm('fullName', e.target.value)} className={`${inputClass} pl-12`} placeholder="Enter your full name" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input type="email" value={formData.email} onChange={e => updateForm('email', e.target.value)} className={`${inputClass} pl-12`} placeholder="Enter your email" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
              <input type="tel" value={formData.phone} onChange={e => updateForm('phone', e.target.value)} className={`${inputClass} pl-12`} placeholder="e.g. 08012345678" />
            </div>
          </div>
          <div>
            <label className={labelClass}>State of Residence</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
              <select value={formData.state} onChange={e => updateForm('state', e.target.value)} className={`${inputClass} pl-12 appearance-none`}>
                <option value="">Select State</option>
                <option value="Lagos">Lagos</option>
                <option value="Abuja">Abuja (FCT)</option>
                <option value="Rivers">Rivers</option>
                <option value="Ogun">Ogun</option>
                <option value="Oyo">Oyo</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-[var(--color-border)] flex justify-between">
        <button onClick={prevStep} className="h-14 px-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--color-bg)] transition-all">Back</button>
        <button onClick={nextStep} disabled={!canProceedStep2} className="h-14 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-semibold text-[var(--color-text-primary)] mb-3">Role Specifics</h3>
        <p className="text-[var(--color-text-secondary)]">Details for {formData.role}</p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {formData.role === 'Property Seeker' && (
          <div>
            <label className={labelClass}>What are you interested in? (Select all that apply)</label>
            <div className="space-y-3">
              {seekerInterestOptions.map(opt => (
                <label key={opt} className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--theme-brand-bg)]/5 cursor-pointer transition-colors">
                  <input type="checkbox" checked={formData.seekerInterests.includes(opt)} onChange={e => {
                    if (e.target.checked) updateForm('seekerInterests', [...formData.seekerInterests, opt]);
                    else updateForm('seekerInterests', formData.seekerInterests.filter((i: string) => i !== opt));
                  }} className="w-5 h-5 rounded text-[var(--theme-brand-bg)] focus:ring-[var(--theme-brand-bg)]" />
                  <span className="font-medium text-[var(--color-text-primary)]">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {isLandlordOrPMC && (
          <>
            <div>
              <label className={labelClass}>Number of Properties / Units</label>
              <select value={formData.propertyCount} onChange={e => updateForm('propertyCount', e.target.value)} className={inputClass}>
                <option value="">Select range</option>
                <option value="1-5">1 - 5 units</option>
                <option value="6-20">6 - 20 units</option>
                <option value="21-50">21 - 50 units</option>
                <option value="50+">50+ units</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Primary Property Type</label>
              <select value={formData.propertyType} onChange={e => updateForm('propertyType', e.target.value)} className={inputClass}>
                <option value="">Select type</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed Use">Mixed Use</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Service Preference</label>
              <div className="space-y-3">
                {landlordServiceOptions.map(opt => (
                  <label key={opt} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${formData.landlordService === opt ? 'bg-[var(--theme-brand-bg)]/5 border-[var(--theme-brand-bg)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)]'}`}>
                    <input type="radio" name="landlordService" value={opt} checked={formData.landlordService === opt} onChange={e => updateForm('landlordService', e.target.value)} className="w-5 h-5 text-[var(--theme-brand-bg)] focus:ring-[var(--theme-brand-bg)]" />
                    <span className={`font-medium ${formData.landlordService === opt ? 'text-[var(--theme-brand-bg)]' : 'text-[var(--color-text-primary)]'}`}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {isProfessional && (
          <>
            <div>
              <label className={labelClass}>Firm / Practice Name</label>
              <input type="text" value={formData.firmName} onChange={e => updateForm('firmName', e.target.value)} className={inputClass} placeholder="Enter your firm name" />
            </div>
            <div>
              <label className={labelClass}>
                {formData.role === 'Property Lawyer' ? 'NBA Registration Number' : 
                 formData.role === 'Licensed Surveyor' ? 'SURCON / Surveying Registration Number' : 
                 'COREN Registration Number'}
              </label>
              <input type="text" value={formData.registrationNumber} onChange={e => updateForm('registrationNumber', e.target.value)} className={inputClass} placeholder="Enter exactly as issued by your professional body" />
              <p className="text-xs text-[var(--color-text-muted)] mt-2">Enter it exactly as issued by your professional body.</p>
            </div>
            <div>
              <label className={labelClass}>Years of Experience</label>
              <select value={formData.yearsOfExperience} onChange={e => updateForm('yearsOfExperience', e.target.value)} className={inputClass}>
                <option value="">Select range</option>
                <option value="0-3">0 - 3 years</option>
                <option value="4-7">4 - 7 years</option>
                <option value="8-15">8 - 15 years</option>
                <option value="15+">15+ years</option>
              </select>
            </div>
            <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl mt-6">
              <label className="flex items-start gap-4 cursor-pointer">
                <input type="checkbox" checked={formData.professionalConsent} onChange={e => updateForm('professionalConsent', e.target.checked)} className="w-5 h-5 mt-1 rounded text-[var(--theme-brand-bg)] focus:ring-[var(--theme-brand-bg)]" />
                <div>
                  <span className="block text-sm text-[var(--color-text-primary)] font-medium leading-relaxed">
                    I consent to Unity Homes verifying my eligibility, professional registration, and active membership status with the appropriate professional regulatory body before considering me for the Unity Homes Professional Directory.
                  </span>
                  <span className="block text-xs text-[var(--color-text-secondary)] mt-2">
                    Verification does not guarantee directory listing. Final inclusion will only happen after review and agreement.
                  </span>
                </div>
              </label>
            </div>
          </>
        )}
      </div>

      <div className="pt-6 border-t border-[var(--color-border)] flex justify-between">
        <button onClick={prevStep} className="h-14 px-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--color-bg)] transition-all">Back</button>
        <button onClick={nextStep} disabled={!canProceedStep3()} className="h-14 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-semibold text-[var(--color-text-primary)] mb-3">Service Preferences</h3>
        <p className="text-[var(--color-text-secondary)]">Which services are you most interested in? (Select at least one)</p>
      </div>

      <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {generalServiceOptions.map(opt => (
          <label key={opt} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${formData.generalServices.includes(opt) ? 'bg-[var(--theme-brand-bg)]/5 border-[var(--theme-brand-bg)] shadow-sm' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)]'}`}>
            <input type="checkbox" checked={formData.generalServices.includes(opt)} onChange={e => {
              if (e.target.checked) updateForm('generalServices', [...formData.generalServices, opt]);
              else updateForm('generalServices', formData.generalServices.filter((i: string) => i !== opt));
            }} className="w-5 h-5 mt-0.5 rounded text-[var(--theme-brand-bg)] focus:ring-[var(--theme-brand-bg)]" />
            <span className={`font-medium ${formData.generalServices.includes(opt) ? 'text-[var(--theme-brand-bg)]' : 'text-[var(--color-text-primary)]'}`}>{opt}</span>
          </label>
        ))}
      </div>

      <div className="pt-6 border-t border-[var(--color-border)] flex justify-between max-w-2xl mx-auto">
        <button onClick={prevStep} className="h-14 px-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--color-bg)] transition-all">Back</button>
        <button onClick={nextStep} disabled={!canProceedStep4} className="h-14 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          Review & Submit <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-serif font-semibold text-[var(--color-text-primary)] mb-3">Review & Submit</h3>
        <p className="text-[var(--color-text-secondary)]">Please confirm your details before joining the waitlist.</p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[var(--color-border)]">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Basic Information</h4>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Role:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.role}</span></div>
              <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Name:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.fullName}</span></div>
              <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Email:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.email}</span></div>
              <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Phone:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.phone}</span></div>
              <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">State:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.state}</span></div>
            </div>
          </div>
          
          <div className="p-6 border-b border-[var(--color-border)]">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Specifics</h4>
            <div className="space-y-3 text-sm">
              {formData.role === 'Property Seeker' && (
                <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Interests:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.seekerInterests.join(', ')}</span></div>
              )}
              {isLandlordOrPMC && (
                <>
                  <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Units:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.propertyCount}</span></div>
                  <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Type:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.propertyType}</span></div>
                  <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Service:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.landlordService}</span></div>
                </>
              )}
              {isProfessional && (
                <>
                  <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Firm:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.firmName}</span></div>
                  <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Reg. Number:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.registrationNumber}</span></div>
                  <div className="grid grid-cols-3 gap-2"><span className="text-[var(--color-text-secondary)]">Experience:</span><span className="col-span-2 font-medium text-[var(--color-text-primary)]">{formData.yearsOfExperience}</span></div>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Services</h4>
            <div className="flex flex-wrap gap-2">
              {formData.generalServices.map((srv: string) => (
                <span key={srv} className="px-3 py-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full text-xs font-medium text-[var(--color-text-primary)]">{srv}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <label className="flex items-start gap-4 cursor-pointer p-4 rounded-xl hover:bg-[var(--theme-brand-bg)]/5 transition-colors">
            <input type="checkbox" checked={formData.finalConfirm} onChange={e => updateForm('finalConfirm', e.target.checked)} className="w-5 h-5 mt-0.5 rounded text-[var(--theme-brand-bg)] focus:ring-[var(--theme-brand-bg)]" />
            <span className="text-sm text-[var(--color-text-primary)] font-medium">I confirm that the information I provided is accurate.</span>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-[var(--color-border)] flex justify-between max-w-xl mx-auto">
        <button onClick={prevStep} disabled={isSubmitting} className="h-14 px-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--color-bg)] disabled:opacity-50 transition-all">Back</button>
        <button onClick={handleSubmit} disabled={!canProceedStep5 || isSubmitting} className="h-14 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-[200px]">
          {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Join the Waitlist'}
        </button>
      </div>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 flex flex-col items-center text-center max-w-md mx-auto space-y-6">
      <div className="w-20 h-20 bg-[var(--theme-brand-bg)]/10 rounded-full flex items-center justify-center border-4 border-[var(--color-bg)] shadow-[0_0_0_1px_rgba(0,108,37,0.1)] relative">
        <div className="absolute inset-0 bg-[var(--theme-brand-bg)]/20 rounded-full blur-xl animate-pulse"></div>
        <CheckCircle2 className="w-10 h-10 text-[var(--theme-brand-bg)] relative z-10" />
      </div>
      <div>
        <h3 className="text-3xl font-serif font-bold text-[var(--color-text-primary)] mb-4">
          You’re officially on the Unity Homes Waitlist!
        </h3>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-2">
          We’ve sent a confirmation email to your inbox.
        </p>
        <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
          Please verify your email to activate your registration.
        </p>
        <div className="flex gap-4 mt-8 justify-center">
          <button className="h-12 px-6 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:opacity-90 transition-all">
            Open Email
          </button>
          <button onClick={() => { window.location.href = '/' }} className="h-12 px-6 rounded-xl bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--color-bg)] transition-all">
            Return Home
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section id="join" className="py-24 relative overflow-hidden bg-[var(--color-bg)] z-10 border-t border-[var(--color-border)]">
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden flex items-start justify-center">
        <div className="w-[1000px] h-[500px] bg-[var(--theme-brand-bg)]/5 rounded-full blur-[100px] -translate-y-1/2 opacity-70"></div>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-brand-bg)]/10 text-[var(--theme-brand-bg)] text-xs font-semibold tracking-wide uppercase mb-6 border border-[var(--theme-brand-bg)]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-brand-bg)] animate-pulse"></span>
            Waitlist Registration
          </div>
          <h2 className="font-serif font-semibold text-4xl md:text-5xl text-[var(--color-text-primary)] tracking-tight mb-6">
            Join the Waitlist
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
            Register your interest to get early access to Nigeria's most transparent real estate ecosystem.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[32px] p-6 md:p-10 lg:p-12 shadow-xl shadow-black/5 dark:shadow-white/5 relative overflow-hidden">
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
              className="relative w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl z-10"
            >
              <div className="w-16 h-16 bg-[var(--theme-brand-bg)]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-[var(--theme-brand-bg)]/20">
                <MapPin className="w-8 h-8 text-[var(--theme-brand-bg)]" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[var(--color-text-primary)] text-center mb-4">
                Would you like to help improve Area Intelligence?
              </h3>
              <p className="text-base text-[var(--color-text-secondary)] text-center mb-8 leading-relaxed">
                Spend just a few minutes sharing information about your area.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => { setShowModal(false); navigateTo('/area-intelligence'); }} 
                  className="w-full h-14 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:opacity-90 transition-all shadow-[0_4px_12px_rgba(20,90,50,0.3)] shadow-[var(--theme-brand-bg)]/20"
                >
                  Contribute Area Insights
                </button>
                <button 
                  onClick={() => { setShowModal(false); navigateTo('/'); window.scrollTo(0,0); }} 
                  className="w-full h-14 rounded-xl bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold hover:bg-[var(--color-bg)] transition-all"
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
