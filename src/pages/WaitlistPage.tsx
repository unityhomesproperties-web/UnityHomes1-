import React, { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, Check } from 'lucide-react';

// --- DATA MODEL & TYPES ---

type WaitlistRole = 
  | 'property_seeker'
  | 'long_term_landlord'
  | 'shortlet_landlord'
  | 'property_management_company'
  | 'property_lawyer'
  | 'licensed_surveyor'
  | 'structural_engineer';

interface WaitlistData {
  role: WaitlistRole | '';
  full_name: string;
  email: string;
  phone: string;
  state: string;
  role_specific_data: any;
  information_confirmed: boolean;
}

const INITIAL_DATA: WaitlistData = {
  role: '',
  full_name: '',
  email: '',
  phone: '',
  state: '',
  role_specific_data: {},
  information_confirmed: false,
};

const ROLES = [
  { id: 'property_seeker', label: 'Property Seeker (Buy/Rent)' },
  { id: 'long_term_landlord', label: 'Long-Term Landlord' },
  { id: 'shortlet_landlord', label: 'Shortlet Landlord' },
  { id: 'property_management_company', label: 'Property Management Company' },
  { id: 'property_lawyer', label: 'Property Lawyer' },
  { id: 'licensed_surveyor', label: 'Licensed Surveyor' },
  { id: 'structural_engineer', label: 'Structural Engineer' },
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
];

// --- VALIDATION HELPERS ---

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => phone.length >= 10 && /^[\d\s\+\-\(\)]+$/.test(phone);

// --- MAIN COMPONENT ---

export default function WaitlistPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [data, setData] = useState<WaitlistData>(() => {
    const saved = localStorage.getItem('unity_waitlist_autosave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Data Migration for Surveyor
        if (parsed.role === 'licensed_surveyor' && parsed.role_specific_data) {
          if (parsed.role_specific_data.niesv_membership_number && !parsed.role_specific_data.registration_number) {
            // Do not automatically treat an old NIESV number as a SURCON registration number.
            // Mark the existing surveyor record as requiring update.
            parsed.role_specific_data.verification_status = 'requires_update';
            // We clear out the old niesv field from being used as the primary number, but the user is forced to re-enter a valid SURCON number because registration_number will be empty.
          }
        }
        
        return parsed;
      } catch (e) {
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalSteps = 3;

  // URL override for role
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ROLES.find(r => r.id === roleParam)) {
      updateData('role', roleParam as WaitlistRole);
    }
  }, [location]);

  // Autosave
  useEffect(() => {
    localStorage.setItem('unity_waitlist_autosave', JSON.stringify(data));
  }, [data]);

  const updateData = (field: keyof WaitlistData | string, value: any) => {
    if (field.startsWith('role_specific_data.')) {
      const subField = field.split('.')[1];
      setData(prev => ({
        ...prev,
        role_specific_data: {
          ...prev.role_specific_data,
          [subField]: value
        }
      }));
    } else {
      setData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const clearAutosave = () => {
    localStorage.removeItem('unity_waitlist_autosave');
  };

  // --- VALIDATION LOGIC ---

  const getBasicInfoErrors = () => {
    const errors: Record<string, string> = {};
    if (!data.role) errors.role = 'Please select a role to continue.';
    if (!data.full_name.trim()) errors.full_name = 'Please enter your full name.';
    if (!data.email) errors.email = 'Please enter your email address.';
    else if (!isValidEmail(data.email)) errors.email = 'Please enter a valid email address.';
    if (!data.phone) errors.phone = 'Please enter your phone number.';
    else if (!isValidPhone(data.phone)) errors.phone = 'Please enter a valid phone number.';
    if (!data.state) errors.state = 'Please select a state.';
    return errors;
  };

  const getRoleSpecificErrors = () => {
    const errors: Record<string, string> = {};
    const rsd = data.role_specific_data;

    if (data.role === 'property_seeker') {
      if (!rsd.interests || rsd.interests.length === 0) {
        errors.interests = 'Please select at least one interest.';
      }
    } else if (data.role === 'long_term_landlord' || data.role === 'shortlet_landlord') {
      if (!rsd.service_preference) errors.service_preference = 'Please select a service preference.';
      if (!rsd.properties_count) errors.properties_count = 'Please enter the number of properties or units.';
      else if (parseInt(rsd.properties_count) < 1) errors.properties_count = 'Number of properties must be at least 1.';
      if (!rsd.property_type) errors.property_type = 'Please enter the property type.';
    } else if (data.role === 'property_management_company') {
      if (!rsd.company_name) errors.company_name = 'Please enter your company name.';
      if (!rsd.contact_person) errors.contact_person = 'Please enter a contact person.';
      if (!rsd.service_preference) errors.service_preference = 'Please select a service preference.';
      if (!rsd.properties_count) errors.properties_count = 'Please enter the number of properties managed.';
      else if (parseInt(rsd.properties_count) < 1) errors.properties_count = 'Number of properties must be at least 1.';
    } else if (['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(data.role)) {
      if (!rsd.firm_name) errors.firm_name = 'Please enter your firm or practice name.';
      
      const trimmedRegistration = (rsd.registration_number || '').trim();
      if (!trimmedRegistration) {
        if (data.role === 'licensed_surveyor') {
          errors.registration_number = 'Please enter your SURCON registration or license number.';
        } else {
          errors.registration_number = 'Please enter your registration number.';
        }
      }

      if (!rsd.years_of_experience) errors.years_of_experience = 'Please enter your years of experience.';
      else if (parseInt(rsd.years_of_experience) < 0) errors.years_of_experience = 'Please enter a valid number of years.';
      if (!rsd.consent) errors.consent = 'You must consent to the verification process to continue.';
    }
    return errors;
  };

  const handleNext = () => {
    let errors = {};
    if (currentStep === 1) errors = getBasicInfoErrors();
    else if (currentStep === 2) errors = getRoleSpecificErrors();

    if (Object.keys(errors).length === 0) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Mark all fields on this step as touched to show errors
      const newTouched = { ...touched };
      Object.keys(errors).forEach(key => newTouched[key] = true);
      setTouched(newTouched);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (currentStep !== 3) return;

    const basicErrors = getBasicInfoErrors();
    const roleErrors = getRoleSpecificErrors();
    
    if (Object.keys(basicErrors).length > 0 || Object.keys(roleErrors).length > 0 || !data.information_confirmed) {
      setSubmitError('Please ensure all required fields are filled out accurately.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Mock API call and strict error handling as requested
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const testEmail = data.email.toLowerCase();
      
      if (testEmail.includes('network@error')) {
        throw new Error('A network error occurred while connecting to the server. Please check your connection and try again.');
      }
      if (testEmail.includes('duplicate@email')) {
        throw new Error('This email address is already on the waitlist.');
      }
      if (data.phone === '0000000000') {
        throw new Error('This phone number is already registered on the waitlist.');
      }
      if (testEmail.includes('service@down')) {
        throw new Error('Our registration service is temporarily unavailable. We are working to fix this. Please try again later.');
      }

      // Simulate backend payload construction
      const payload: any = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        state: data.state,
        role: data.role,
        role_specific_data: { ...data.role_specific_data },
      };

      if (data.role === 'licensed_surveyor') {
        payload.role_specific_data.professional_type = "surveyor";
        payload.role_specific_data.professional_registration_body = "SURCON";
        payload.role_specific_data.professional_registration_number = data.role_specific_data.registration_number;
        payload.role_specific_data.verification_status = "pending";
      }

      console.log("Submitting payload to backend:", payload);

      // Success
      clearAutosave();
      navigate('/waitlist/success');
      
    } catch (err: any) {
      // Generic fallback for any unhandled exceptions to match prompt exact phrasing
      const msg = err.message || "We couldn't complete your registration right now. Your information has not been lost. Please try again.";
      // Use exact fallback from prompt if generic
      if (!err.message) {
         setSubmitError("We couldn't complete your registration right now. Your information has not been lost. Please try again.");
      } else {
         setSubmitError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderError = (field: string, errors: Record<string, string>) => {
    if (touched[field] && errors[field]) {
      return <p className="text-[var(--color-error)] text-sm mt-1">{errors[field]}</p>;
    }
    return null;
  };

  const basicErrors = getBasicInfoErrors();
  const roleErrors = getRoleSpecificErrors();

  return (
    <div className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
      
      {/* Wizard Header */}
      <div className="mb-10 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-[var(--color-primary-green)] mb-4">Join the Waitlist</h1>
        <p className="text-[var(--color-secondary-text)]">Complete your registration to get early access.</p>
        
        {/* Progress Bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="flex justify-between text-sm font-semibold text-[var(--color-secondary-text)] mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-[var(--color-border)] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[var(--color-secondary-green)] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-white)] p-6 md:p-10 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-sm animate-slide-up">
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: BASIC INFO */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-primary-text)] mb-6 pb-4 border-b border-[var(--color-border)]">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">I am joining as a:</label>
                <select 
                  value={data.role}
                  onChange={(e) => updateData('role', e.target.value)}
                  onBlur={() => handleBlur('role')}
                  className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]"
                >
                  <option value="" disabled>Select your role...</option>
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
                {renderError('role', basicErrors)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={data.full_name}
                  onChange={(e) => updateData('full_name', e.target.value)}
                  onBlur={() => handleBlur('full_name')}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]"
                />
                {renderError('full_name', basicErrors)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={data.email}
                    onChange={(e) => updateData('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="e.g. jane@example.com"
                    className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]"
                  />
                  {renderError('email', basicErrors)}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    value={data.phone}
                    onChange={(e) => updateData('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="e.g. 0800 000 0000"
                    className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]"
                  />
                  {renderError('phone', basicErrors)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">State (Nigeria)</label>
                <select 
                  value={data.state}
                  onChange={(e) => updateData('state', e.target.value)}
                  onBlur={() => handleBlur('state')}
                  className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]"
                >
                  <option value="" disabled>Select a state...</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {renderError('state', basicErrors)}
              </div>
            </div>
          )}

          {/* STEP 2: ROLE SPECIFIC */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-primary-text)] mb-6 pb-4 border-b border-[var(--color-border)]">
                Additional Details
              </h2>
              
              {/* PROPERTY SEEKER */}
              {data.role === 'property_seeker' && (
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-4">What are you interested in? (Select all that apply)</label>
                  <div className="space-y-3">
                    {['Buy Property', 'Rent Property', 'Find a Professional', 'Property Verification', 'Area Intelligence'].map(interest => {
                      const selected = data.role_specific_data.interests?.includes(interest);
                      return (
                        <label key={interest} className="flex items-center space-x-3 p-4 border border-[var(--color-border)] rounded-[var(--radius-button)] cursor-pointer hover:bg-[var(--color-background)] transition-colors">
                          <input 
                            type="checkbox" 
                            checked={selected || false}
                            onChange={(e) => {
                              const curr = data.role_specific_data.interests || [];
                              if (e.target.checked) updateData('role_specific_data.interests', [...curr, interest]);
                              else updateData('role_specific_data.interests', curr.filter((i: string) => i !== interest));
                            }}
                            onBlur={() => handleBlur('interests')}
                            className="w-5 h-5 text-[var(--color-secondary-green)] border-gray-300 rounded focus:ring-[var(--color-secondary-green)]"
                          />
                          <span className="text-[var(--color-primary-text)] font-medium">{interest}</span>
                        </label>
                      )
                    })}
                  </div>
                  {renderError('interests', roleErrors)}
                </div>
              )}

              {/* LANDLORDS */}
              {(data.role === 'long_term_landlord' || data.role === 'shortlet_landlord') && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-4">What would you like Unity Homes to help you with?</label>
                    <div className="space-y-4">
                      {[
                        { id: 'list_only', title: 'List My Property Only', desc: 'I want to list my vacant property for visibility and tenant enquiries.' },
                        { id: 'list_and_manage', title: 'List Plus Unity Homes Manager', desc: 'I want to list my property and use Unity Homes Manager to manage tenants, rent and property operations.' },
                        { id: 'both', title: 'Both Services', desc: 'I want to list my property and use Unity Homes Manager for ongoing management.' },
                      ].map(pref => (
                        <label key={pref.id} className={`flex items-start p-4 border rounded-[var(--radius-button)] cursor-pointer transition-colors ${data.role_specific_data.service_preference === pref.title ? 'border-[var(--color-secondary-green)] bg-[#F4F8F4]' : 'border-[var(--color-border)] hover:bg-[var(--color-background)]'}`}>
                          <input 
                            type="radio" 
                            name="service_preference"
                            checked={data.role_specific_data.service_preference === pref.title}
                            onChange={() => updateData('role_specific_data.service_preference', pref.title)}
                            onBlur={() => handleBlur('service_preference')}
                            className="mt-1 w-5 h-5 text-[var(--color-secondary-green)] border-gray-300 focus:ring-[var(--color-secondary-green)]"
                          />
                          <div className="ml-3">
                            <span className="block text-[var(--color-primary-text)] font-bold">{pref.title}</span>
                            <span className="block text-sm text-[var(--color-secondary-text)] mt-1">{pref.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                    {renderError('service_preference', roleErrors)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Number of Properties or Units</label>
                      <input 
                        type="number" 
                        min="1"
                        value={data.role_specific_data.properties_count || ''}
                        onChange={(e) => updateData('role_specific_data.properties_count', e.target.value)}
                        onBlur={() => handleBlur('properties_count')}
                        className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)]"
                      />
                      {renderError('properties_count', roleErrors)}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Property Type</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Residential, Commercial"
                        value={data.role_specific_data.property_type || ''}
                        onChange={(e) => updateData('role_specific_data.property_type', e.target.value)}
                        onBlur={() => handleBlur('property_type')}
                        className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)]"
                      />
                      {renderError('property_type', roleErrors)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Short Description (Optional)</label>
                    <textarea 
                      rows={3}
                      value={data.role_specific_data.description || ''}
                      onChange={(e) => updateData('role_specific_data.description', e.target.value)}
                      className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)]"
                    />
                  </div>
                </>
              )}

              {/* PMC */}
              {data.role === 'property_management_company' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Company Name</label>
                      <input 
                        type="text" 
                        value={data.role_specific_data.company_name || ''}
                        onChange={(e) => updateData('role_specific_data.company_name', e.target.value)}
                        onBlur={() => handleBlur('company_name')}
                        className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)]"
                      />
                      {renderError('company_name', roleErrors)}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Contact Person</label>
                      <input 
                        type="text" 
                        value={data.role_specific_data.contact_person || ''}
                        onChange={(e) => updateData('role_specific_data.contact_person', e.target.value)}
                        onBlur={() => handleBlur('contact_person')}
                        className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)]"
                      />
                      {renderError('contact_person', roleErrors)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-4">Service Preference</label>
                    <div className="space-y-4">
                      {['List My Clients Properties', 'Use Unity Homes Manager', 'Both Services'].map(pref => (
                        <label key={pref} className={`flex items-center p-4 border rounded-[var(--radius-button)] cursor-pointer transition-colors ${data.role_specific_data.service_preference === pref ? 'border-[var(--color-secondary-green)] bg-[#F4F8F4]' : 'border-[var(--color-border)] hover:bg-[var(--color-background)]'}`}>
                          <input 
                            type="radio" 
                            name="pmc_service_preference"
                            checked={data.role_specific_data.service_preference === pref}
                            onChange={() => updateData('role_specific_data.service_preference', pref)}
                            onBlur={() => handleBlur('service_preference')}
                            className="w-5 h-5 text-[var(--color-secondary-green)] border-gray-300 focus:ring-[var(--color-secondary-green)]"
                          />
                          <span className="ml-3 block text-[var(--color-primary-text)] font-bold">{pref}</span>
                        </label>
                      ))}
                    </div>
                    {renderError('service_preference', roleErrors)}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Number of Properties Managed</label>
                    <input 
                      type="number" 
                      min="1"
                      value={data.role_specific_data.properties_count || ''}
                      onChange={(e) => updateData('role_specific_data.properties_count', e.target.value)}
                      onBlur={() => handleBlur('properties_count')}
                      className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)]"
                    />
                    {renderError('properties_count', roleErrors)}
                  </div>
                </>
              )}

              {/* PROFESSIONALS */}
              {['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(data.role) && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Firm or Practice Name</label>
                    <input 
                      type="text" 
                      value={data.role_specific_data.firm_name || ''}
                      onChange={(e) => updateData('role_specific_data.firm_name', e.target.value)}
                      onBlur={() => handleBlur('firm_name')}
                      className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)]"
                    />
                    {renderError('firm_name', roleErrors)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">
                        {data.role === 'property_lawyer' ? 'NBA Registration Number' : 
                         data.role === 'licensed_surveyor' ? 'SURCON Registration / License Number' : 
                         'COREN Registration Number'}
                      </label>
                      <input 
                        type="text" 
                        value={data.role_specific_data.registration_number || ''}
                        onChange={(e) => updateData('role_specific_data.registration_number', e.target.value.trimStart())}
                        onBlur={() => handleBlur('registration_number')}
                        className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)]"
                      />
                      {data.role === 'licensed_surveyor' && (
                        <>
                          <p className="text-sm text-[var(--color-secondary-text)] mt-2">
                            Enter your valid SURCON registration or license number. This information will be used as part of our professional verification process.
                          </p>
                          <p className="text-sm font-semibold text-[var(--color-secondary-green)] mt-2">
                            Surveyors on Unity Homes will be required to undergo professional verification before being approved on the platform.
                          </p>
                        </>
                      )}
                      {renderError('registration_number', roleErrors)}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Years of Experience</label>
                      <input 
                        type="number" 
                        min="0"
                        value={data.role_specific_data.years_of_experience || ''}
                        onChange={(e) => updateData('role_specific_data.years_of_experience', e.target.value)}
                        onBlur={() => handleBlur('years_of_experience')}
                        className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)]"
                      />
                      {renderError('years_of_experience', roleErrors)}
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-[var(--color-background)] border border-[var(--color-border)] rounded-[var(--radius-card)]">
                    <label className="flex items-start cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={data.role_specific_data.consent || false}
                        onChange={(e) => updateData('role_specific_data.consent', e.target.checked)}
                        onBlur={() => handleBlur('consent')}
                        className="mt-1 w-5 h-5 text-[var(--color-secondary-green)] border-gray-300 rounded focus:ring-[var(--color-secondary-green)]"
                      />
                      <div className="ml-4">
                        <span className="block text-[var(--color-primary-text)] font-semibold mb-2">
                          I consent to Unity Homes verifying my eligibility, professional registration, and active membership status with the appropriate professional regulatory body before considering me for the Unity Homes Professional Directory.
                        </span>
                        <span className="block text-sm text-[var(--color-secondary-text)]">
                          Verification does not guarantee directory listing. Final inclusion will only happen after review and agreement.
                        </span>
                      </div>
                    </label>
                    {renderError('consent', roleErrors)}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-primary-text)] pb-4 border-b border-[var(--color-border)]">
                Review Your Information
              </h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-secondary-text)] uppercase tracking-wider mb-2">Role Selection</h3>
                    <p className="text-lg font-medium text-[var(--color-primary-text)]">{ROLES.find(r => r.id === data.role)?.label}</p>
                  </div>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-[var(--color-secondary-green)] text-sm font-semibold hover:underline">Edit</button>
                </div>

                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                    <div className="col-span-2">
                      <h3 className="text-sm font-bold text-[var(--color-secondary-text)] uppercase tracking-wider mb-2">Basic Information</h3>
                    </div>
                    <div>
                      <span className="block text-sm text-[var(--color-secondary-text)]">Name</span>
                      <span className="block font-medium text-[var(--color-primary-text)]">{data.full_name}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-[var(--color-secondary-text)]">Email</span>
                      <span className="block font-medium text-[var(--color-primary-text)]">{data.email}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-[var(--color-secondary-text)]">Phone</span>
                      <span className="block font-medium text-[var(--color-primary-text)]">{data.phone}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-[var(--color-secondary-text)]">State</span>
                      <span className="block font-medium text-[var(--color-primary-text)]">{data.state}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-[var(--color-secondary-green)] text-sm font-semibold hover:underline">Edit</button>
                </div>

                <div className="flex justify-between items-start pt-4 border-t border-[var(--color-border)]">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full">
                    <div className="col-span-2">
                      <h3 className="text-sm font-bold text-[var(--color-secondary-text)] uppercase tracking-wider mb-2">Additional Details</h3>
                    </div>
                    {Object.entries(data.role_specific_data).map(([key, val]) => {
                      if (key === 'consent' || val === '' || val === null || val === undefined) return null;
                      return (
                        <div key={key} className={Array.isArray(val) || key === 'description' ? 'col-span-2' : ''}>
                          <span className="block text-sm text-[var(--color-secondary-text)] capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="block font-medium text-[var(--color-primary-text)]">
                            {key === 'registration_number' && data.role === 'licensed_surveyor' && val ? `${val} (SURCON, Verification Pending)` : Array.isArray(val) ? val.join(', ') : String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-[var(--color-secondary-green)] text-sm font-semibold hover:underline">Edit</button>
                </div>
              </div>

              {submitError && (
                <div className="p-4 bg-[#FDEDED] border border-[#F5C2C7] rounded-[var(--radius-card)] text-[#842029]">
                  {submitError}
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
                <label className="flex items-center cursor-pointer mb-8">
                  <input 
                    type="checkbox" 
                    checked={data.information_confirmed}
                    onChange={(e) => updateData('information_confirmed', e.target.checked)}
                    className="w-5 h-5 text-[var(--color-secondary-green)] border-gray-300 rounded focus:ring-[var(--color-secondary-green)]"
                  />
                  <span className="ml-3 font-semibold text-[var(--color-primary-text)]">
                    I confirm that the information I provided is accurate.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!data.information_confirmed || isSubmitting}
                  className="w-full bg-[var(--color-accent-gold)] text-[var(--color-primary-green)] px-6 py-4 rounded-[var(--radius-button)] font-bold text-lg hover:opacity-90 transition-opacity min-h-[48px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Join The Waitlist'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          {currentStep < 3 && (
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-[var(--color-border)]">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center text-[var(--color-secondary-text)] hover:text-[var(--color-primary-text)] font-semibold transition-colors px-4 py-2 min-h-[48px]"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </button>
              ) : (
                <div /> // Placeholder for spacing
              )}
              
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center bg-[var(--color-primary-green)] text-[var(--color-white)] px-8 py-3 rounded-[var(--radius-button)] font-semibold hover:bg-[var(--color-secondary-green)] transition-colors min-h-[48px]"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
