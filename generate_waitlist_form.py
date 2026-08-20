import os

content = """import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  Search, 
  Key, 
  Briefcase, 
  Scale, 
  Compass, 
  HardHat, 
  Lock, 
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Home,
  X
} from 'lucide-react';
import { Button, Card, Input, Badge } from '../design-system/components';

const ROLES = [
  { id: 'seeker', label: 'Property Seeker', desc: 'Find verified properties and professionals', icon: Search },
  { id: 'manage', label: 'Let Unity Homes Manage My Property', desc: 'Professional management for your assets', icon: Home },
  { id: 'long-term', label: 'Long-Term Landlord', desc: 'List and manage residential or commercial units', icon: Key },
  { id: 'shortlet', label: 'Shortlet Landlord', desc: 'Manage your short-term rentals and guests', icon: Building },
  { id: 'pmc', label: 'Property Management Company', desc: 'Tools for professional property managers', icon: Briefcase },
  { id: 'lawyer', label: 'Property Lawyer', desc: 'Provide legal services and verification', icon: Scale },
  { id: 'surveyor', label: 'Licensed Surveyor', desc: 'Offer professional surveying services', icon: Compass },
  { id: 'engineer', label: 'Structural Engineer', desc: 'Provide engineering assessments', icon: HardHat }
];

const INTERESTS = [
  'Buying Property', 'Renting Property', 'Property Management', 
  'Property Verification', 'Finding Professionals', 'Digital Property Records', 
  'Area Intelligence', 'Property Investment'
];

const NIGERIAN_STATES = [
  'Lagos', 'FCT Abuja', 'Rivers', 'Oyo', 'Ogun', 'Enugu', 'Kano', 'Delta', 'Anambra', 
  'Akwa Ibom', 'Edo', 'Kaduna', 'Kwara', 'Osun', 'Abia', 'Adamawa', 'Bauchi', 
  'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Ebonyi', 'Ekiti', 'Gombe', 'Imo', 
  'Jigawa', 'Katsina', 'Kebbi', 'Kogi', 'Nasarawa', 'Niger', 'Plateau', 'Sokoto', 
  'Taraba', 'Yobe', 'Zamfara'
];

const TOTAL_STEPS = 5;

export default function WaitlistRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    role: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    state: '',
    contactMethod: 'Email',
    interests: [],
    referralCode: '',
    roleSpecific: {}
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Autosave
  useEffect(() => {
    const saved = localStorage.getItem('unity_waitlist_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.step) {
          setFormData(parsed.formData);
          setStep(parsed.step);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (step < 6 && !isSuccess) {
      localStorage.setItem('unity_waitlist_progress', JSON.stringify({ step, formData }));
    }
  }, [step, formData, isSuccess]);

  const updateData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateRoleData = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      roleSpecific: { ...prev.roleSpecific, [field]: value }
    }));
  };

  const nextStep = () => {
    window.scrollTo({ top: document.getElementById('waitlist-container')?.offsetTop || 0, behavior: 'smooth' });
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
    window.scrollTo({ top: document.getElementById('waitlist-container')?.offsetTop || 0, behavior: 'smooth' });
    setStep(s => Math.max(s - 1, 1));
  };

  const submitForm = () => {
    // In Prompt 3/4 this will hit the backend. For now, simulate success
    setIsSuccess(true);
    localStorage.removeItem('unity_waitlist_progress');
  };

  const isStep1Valid = !!formData.role;
  const isStep2Valid = !!(formData.fullName && formData.email && formData.email.includes('@') && formData.phoneNumber && formData.state);
  const isStep3Valid = () => {
    const rs = formData.roleSpecific;
    switch(formData.role) {
      case 'seeker': return !!(rs.primaryInterest && rs.preferredState);
      case 'manage': return !!(rs.propertyType && rs.numberOfProperties && rs.preferredState);
      case 'long-term': return !!rs.numberOfProperties;
      case 'shortlet': return !!rs.numberOfUnits;
      case 'pmc': return !!(rs.companyName && rs.managedProperties);
      case 'lawyer': return !!(rs.lawFirm && rs.yearsExperience && (!rs.joinDirectory || rs.verificationConsent));
      case 'surveyor': return !!(rs.surveyFirm && rs.practiceArea && (!rs.joinDirectory || rs.verificationConsent));
      case 'engineer': return !!(rs.engineeringFirm && rs.yearsExperience && (!rs.joinDirectory || rs.verificationConsent));
      default: return true;
    }
  };
  const isStep4Valid = formData.interests.length > 0;

  const renderProgress = () => {
    const percentage = ((step - 1) / TOTAL_STEPS) * 100;
    const timeRemaining = Math.max(90 - ((step - 1) * 20), 10);
    
    return (
      <div className="sticky top-0 z-20 bg-[var(--color-bg)]/90 backdrop-blur-md pt-4 pb-6 border-b border-[var(--color-divider)] mb-8">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">Step {step} of {TOTAL_STEPS}</p>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
              {step === 1 && 'Choose Your Role'}
              {step === 2 && 'Personal Information'}
              {step === 3 && 'Additional Details'}
              {step === 4 && 'Your Interests'}
              {step === 5 && 'Almost Done'}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[var(--color-forest)]">{Math.round(percentage)}% Complete</p>
            <p className="text-xs text-[var(--color-text-secondary)]">About {timeRemaining} seconds left</p>
          </div>
        </div>
        <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--color-forest)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ROLES.map(role => (
          <Card 
            key={role.id}
            variant={formData.role === role.id ? 'selectable' : 'hover'}
            selected={formData.role === role.id}
            onClick={() => updateData('role', role.id)}
            className="p-4 flex items-start gap-4 transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${formData.role === role.id ? 'bg-[var(--color-forest)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-forest)]'}`}>
              <role.icon className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-base font-bold text-[var(--color-text-primary)]">{role.label}</h4>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{role.desc}</p>
            </div>
          </Card>
        ))}
      </div>
      <div className="pt-8 flex justify-end">
        <Button onClick={nextStep} disabled={!isStep1Valid} rightIcon={<ArrowRight className="w-5 h-5" />}>
          Next Step
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Input 
        label="Full Name" 
        placeholder="Enter your full name" 
        value={formData.fullName}
        onChange={e => updateData('fullName', e.target.value)}
      />
      
      <Input 
        label="Email Address" 
        type="email"
        placeholder="you@example.com" 
        value={formData.email}
        onChange={e => updateData('email', e.target.value)}
        helperText="We'll send a verification email to activate your waitlist registration."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Phone Number" 
          type="tel"
          placeholder="+234 XXX XXXX" 
          value={formData.phoneNumber}
          onChange={e => updateData('phoneNumber', e.target.value)}
        />
        
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">State</label>
          <select 
            className="flex h-14 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
            value={formData.state}
            onChange={e => updateData('state', e.target.value)}
          >
            <option value="">Select a state</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold text-[var(--color-text-primary)]">Preferred Contact Method</label>
        <div className="flex flex-wrap gap-4">
          {['Email', 'Phone', 'WhatsApp'].map(method => (
            <label key={method} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                name="contactMethod" 
                value={method}
                checked={formData.contactMethod === method}
                onChange={e => updateData('contactMethod', e.target.value)}
                className="w-5 h-5 text-[var(--color-forest)] focus:ring-[var(--color-forest)] border-[var(--color-border)]"
              />
              <span className="text-base text-[var(--color-text-primary)]">{method}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-8 flex justify-between items-center">
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>Back</Button>
        <Button onClick={nextStep} disabled={!isStep2Valid} rightIcon={<ArrowRight className="w-5 h-5" />}>Next Step</Button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const rs = formData.roleSpecific;
    const role = formData.role;
    
    return (
      <div className="space-y-6">
        
        {role === 'seeker' && (
          <>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">Primary Interest</label>
              <select className="flex h-14 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]" value={rs.primaryInterest || ''} onChange={e => updateRoleData('primaryInterest', e.target.value)}>
                <option value="">Select interest</option>
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
                <option value="Professional Services">Professional Services</option>
              </select>
            </div>
            <Input label="Budget Range (Optional)" placeholder="e.g. ₦10m - ₦50m" value={rs.budgetRange || ''} onChange={e => updateRoleData('budgetRange', e.target.value)} />
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">Preferred State</label>
              <select className="flex h-14 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]" value={rs.preferredState || ''} onChange={e => updateRoleData('preferredState', e.target.value)}>
                <option value="">Select a state</option>
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </>
        )}

        {role === 'manage' && (
          <>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">Property Type</label>
              <select className="flex h-14 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]" value={rs.propertyType || ''} onChange={e => updateRoleData('propertyType', e.target.value)}>
                <option value="">Select type</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed Use">Mixed Use</option>
              </select>
            </div>
            <Input label="Number of Properties" type="number" placeholder="0" value={rs.numberOfProperties || ''} onChange={e => updateRoleData('numberOfProperties', e.target.value)} />
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">Preferred State</label>
              <select className="flex h-14 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]" value={rs.preferredState || ''} onChange={e => updateRoleData('preferredState', e.target.value)}>
                <option value="">Select a state</option>
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">Current Property Challenges</label>
              <textarea className="flex w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)] min-h-[120px]" placeholder="Tell us what you need help with..." value={rs.propertyChallenges || ''} onChange={e => updateRoleData('propertyChallenges', e.target.value)}></textarea>
            </div>
          </>
        )}

        {role === 'long-term' && (
          <>
            <Input label="Portfolio Name (Optional)" placeholder="e.g. Adebayo Properties" value={rs.portfolioName || ''} onChange={e => updateRoleData('portfolioName', e.target.value)} />
            <Input label="Number of Properties" type="number" placeholder="0" value={rs.numberOfProperties || ''} onChange={e => updateRoleData('numberOfProperties', e.target.value)} />
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">Interested in Property Management?</label>
              <div className="flex gap-4">
                {['Yes', 'No'].map(opt => (
                  <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="intMgmt" value={opt} checked={rs.interestedInManagement === opt} onChange={e => updateRoleData('interestedInManagement', e.target.value)} className="w-5 h-5 text-[var(--color-forest)] focus:ring-[var(--color-forest)] border-[var(--color-border)]" />
                    <span className="text-base text-[var(--color-text-primary)]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {role === 'shortlet' && (
          <>
            <Input label="Business Name (Optional)" placeholder="e.g. Lagos Luxury Shortlets" value={rs.businessName || ''} onChange={e => updateRoleData('businessName', e.target.value)} />
            <Input label="Number of Units" type="number" placeholder="0" value={rs.numberOfUnits || ''} onChange={e => updateRoleData('numberOfUnits', e.target.value)} />
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">Interested in Property Management?</label>
              <div className="flex gap-4">
                {['Yes', 'No'].map(opt => (
                  <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="intMgmt2" value={opt} checked={rs.interestedInManagement === opt} onChange={e => updateRoleData('interestedInManagement', e.target.value)} className="w-5 h-5 text-[var(--color-forest)] focus:ring-[var(--color-forest)] border-[var(--color-border)]" />
                    <span className="text-base text-[var(--color-text-primary)]">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {role === 'pmc' && (
          <>
            <Input label="Company Name" placeholder="e.g. Shelter Pro Managers" value={rs.companyName || ''} onChange={e => updateRoleData('companyName', e.target.value)} />
            <Input label="Managed Properties" type="number" placeholder="0" value={rs.managedProperties || ''} onChange={e => updateRoleData('managedProperties', e.target.value)} />
            <Input label="Website (Optional)" placeholder="https://" value={rs.website || ''} onChange={e => updateRoleData('website', e.target.value)} />
          </>
        )}

        {role === 'lawyer' && (
          <>
            <Input label="Law Firm" placeholder="Enter firm name" value={rs.lawFirm || ''} onChange={e => updateRoleData('lawFirm', e.target.value)} />
            <Input label="Years of Experience" type="number" placeholder="0" value={rs.yearsExperience || ''} onChange={e => updateRoleData('yearsExperience', e.target.value)} />
            <div className="flex flex-col space-y-4 pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={rs.joinDirectory || false} onChange={e => updateRoleData('joinDirectory', e.target.checked)} className="w-5 h-5 text-[var(--color-forest)] focus:ring-[var(--color-forest)] rounded border-[var(--color-border)]" />
                <span className="text-base font-semibold text-[var(--color-text-primary)]">Join Verified Directory</span>
              </label>
              {rs.joinDirectory && (
                <label className="flex items-start space-x-3 cursor-pointer ml-8 p-4 bg-[var(--color-bg)] rounded-[var(--radius-card)]">
                  <input type="checkbox" checked={rs.verificationConsent || false} onChange={e => updateRoleData('verificationConsent', e.target.checked)} className="w-5 h-5 mt-0.5 text-[var(--color-forest)] focus:ring-[var(--color-forest)] rounded border-[var(--color-border)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">I consent to Unity Homes verifying my professional credentials before listing my services in the directory.</span>
                </label>
              )}
            </div>
          </>
        )}

        {role === 'surveyor' && (
          <>
            <Input label="Survey Firm" placeholder="Enter firm name" value={rs.surveyFirm || ''} onChange={e => updateRoleData('surveyFirm', e.target.value)} />
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-semibold text-[var(--color-text-primary)]">Practice Area</label>
              <select className="flex h-14 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]" value={rs.practiceArea || ''} onChange={e => updateRoleData('practiceArea', e.target.value)}>
                <option value="">Select practice area</option>
                <option value="Cadastral">Cadastral</option>
                <option value="Topographic">Topographic</option>
                <option value="Engineering">Engineering</option>
              </select>
            </div>
            <div className="flex flex-col space-y-4 pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={rs.joinDirectory || false} onChange={e => updateRoleData('joinDirectory', e.target.checked)} className="w-5 h-5 text-[var(--color-forest)] focus:ring-[var(--color-forest)] rounded border-[var(--color-border)]" />
                <span className="text-base font-semibold text-[var(--color-text-primary)]">Join Verified Directory</span>
              </label>
              {rs.joinDirectory && (
                <label className="flex items-start space-x-3 cursor-pointer ml-8 p-4 bg-[var(--color-bg)] rounded-[var(--radius-card)]">
                  <input type="checkbox" checked={rs.verificationConsent || false} onChange={e => updateRoleData('verificationConsent', e.target.checked)} className="w-5 h-5 mt-0.5 text-[var(--color-forest)] focus:ring-[var(--color-forest)] rounded border-[var(--color-border)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">I consent to Unity Homes verifying my professional credentials before listing my services in the directory.</span>
                </label>
              )}
            </div>
          </>
        )}

        {role === 'engineer' && (
          <>
            <Input label="Engineering Firm" placeholder="Enter firm name" value={rs.engineeringFirm || ''} onChange={e => updateRoleData('engineeringFirm', e.target.value)} />
            <Input label="Years Experience" type="number" placeholder="0" value={rs.yearsExperience || ''} onChange={e => updateRoleData('yearsExperience', e.target.value)} />
            <div className="flex flex-col space-y-4 pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" checked={rs.joinDirectory || false} onChange={e => updateRoleData('joinDirectory', e.target.checked)} className="w-5 h-5 text-[var(--color-forest)] focus:ring-[var(--color-forest)] rounded border-[var(--color-border)]" />
                <span className="text-base font-semibold text-[var(--color-text-primary)]">Join Verified Directory</span>
              </label>
              {rs.joinDirectory && (
                <label className="flex items-start space-x-3 cursor-pointer ml-8 p-4 bg-[var(--color-bg)] rounded-[var(--radius-card)]">
                  <input type="checkbox" checked={rs.verificationConsent || false} onChange={e => updateRoleData('verificationConsent', e.target.checked)} className="w-5 h-5 mt-0.5 text-[var(--color-forest)] focus:ring-[var(--color-forest)] rounded border-[var(--color-border)]" />
                  <span className="text-sm text-[var(--color-text-secondary)]">I consent to Unity Homes verifying my professional credentials before listing my services in the directory.</span>
                </label>
              )}
            </div>
          </>
        )}

        <div className="pt-8 flex justify-between items-center">
          <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>Back</Button>
          <Button onClick={nextStep} disabled={!isStep3Valid()} rightIcon={<ArrowRight className="w-5 h-5" />}>Next Step</Button>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    const toggleInterest = (i: string) => {
      setFormData((prev: any) => ({
        ...prev,
        interests: prev.interests.includes(i) 
          ? prev.interests.filter((x: string) => x !== i)
          : [...prev.interests, i]
      }));
    };

    return (
      <div className="space-y-6">
        <p className="text-base text-[var(--color-text-secondary)] mb-4">Select all that apply to you (minimum 1 required):</p>
        <div className="flex flex-wrap gap-3">
          {INTERESTS.map(interest => {
            const isSelected = formData.interests.includes(interest);
            return (
              <div 
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`
                  px-4 py-3 rounded-full border text-sm font-semibold cursor-pointer transition-all duration-300 ease-out flex items-center space-x-2
                  ${isSelected ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white shadow-md' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-forest)]'}
                `}
              >
                {isSelected && <Check className="w-4 h-4" strokeWidth={3} />}
                <span>{interest}</span>
              </div>
            );
          })}
        </div>

        <div className="pt-8 flex justify-between items-center">
          <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>Back</Button>
          <Button onClick={nextStep} disabled={!isStep4Valid} rightIcon={<ArrowRight className="w-5 h-5" />}>Next Step</Button>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-8">
      <Input 
        label="Referral Code (Optional)" 
        placeholder="Enter code" 
        value={formData.referralCode}
        onChange={e => updateData('referralCode', e.target.value)}
        helperText="If someone invited you, enter their referral code."
      />

      <div className="flex items-start space-x-4 p-5 bg-[var(--color-bg)] rounded-[var(--radius-card)] border border-[var(--color-border)]">
        <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-[var(--color-forest)]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">Secure & Encrypted</h4>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Your information is encrypted and securely stored. Unity Homes never sells or shares your personal information without your permission.
          </p>
        </div>
      </div>

      <div className="pt-4 flex justify-between items-center">
        <Button variant="outline" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>Back</Button>
        <Button onClick={submitForm} rightIcon={<CheckCircle2 className="w-5 h-5" />}>Join Waitlist</Button>
      </div>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="w-full max-w-[760px] mx-auto py-16 px-6 relative z-10" id="waitlist-container">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center bg-[var(--color-surface-card)] rounded-[var(--radius-card)] p-10 md:p-16 border border-[var(--color-border)] shadow-[var(--shadow-modal)]"
        >
          <div className="w-24 h-24 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--color-success)]">
            <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] mb-4 tracking-tight">
            You're officially on the Unity Homes Waitlist!
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-[480px] mx-auto">
            Thank you for joining. A verification email has been sent to your inbox. Please verify your email to activate your registration.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" onClick={() => setShowInviteModal(true)}>Continue</Button>
            <Button variant="outline" size="lg" onClick={() => { setIsSuccess(false); setStep(1); setFormData({...formData, role: '', roleSpecific: {}, interests: []}); }}>
              Verify My Email
            </Button>
          </div>
        </motion.div>

        {/* Post Success Invitation Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[var(--color-text-primary)]/40 backdrop-blur-sm"
                onClick={() => window.location.href = '/'}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-[var(--color-surface-card)] w-full max-w-[600px] rounded-[var(--radius-card)] shadow-[var(--shadow-modal)] p-8 md:p-12 z-10 border border-[var(--color-border)]"
              >
                <button onClick={() => window.location.href = '/'} className="absolute top-6 right-6 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                  <X className="w-6 h-6" />
                </button>
                <div className="w-16 h-16 bg-[var(--color-gold)]/10 rounded-2xl flex items-center justify-center mb-6 text-[var(--color-gold)]">
                  <Compass className="w-8 h-8" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">
                  Help Build Better Area Intelligence
                </h3>
                <p className="text-base text-[var(--color-text-secondary)] mb-10 leading-relaxed">
                  Spend just three to four minutes helping improve property transparency across Nigeria by sharing information about your neighbourhood.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button fullWidth size="lg">Contribute Area Insights</Button>
                  <Button variant="ghost" fullWidth size="lg" onClick={() => window.location.href = '/'}>Skip For Now</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <section className="w-full relative z-10 py-16 px-6" id="waitlist-container">
      <div className="max-w-[760px] mx-auto mb-16 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-6">
          Join the Unity Homes Waitlist
        </h2>
        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-[640px] mx-auto">
          Be among the first to experience Nigeria's most transparent real estate platform and receive exclusive early access, verified property services and future member benefits.
        </p>
      </div>

      <div className="max-w-[760px] mx-auto">
        <Card className="p-6 md:p-12 overflow-hidden bg-[var(--color-surface-card)]">
          {renderProgress()}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </section>
  );
}
"""

with open("src/components/WaitlistRegistration.tsx", "w") as f:
    f.write(content)
