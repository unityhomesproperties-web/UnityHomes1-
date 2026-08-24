const fs = require('fs');

const content = `import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const ROLES_DISPLAY = [
  { id: 'property_seeker', title: 'Property Seeker', desc: "I'm looking for property or property-related help." },
  { id: 'long_term_landlord', title: 'Long-Term Landlord', desc: 'I want to list and/or manage long-term property.' },
  { id: 'shortlet_landlord', title: 'Shortlet Landlord', desc: 'I want to list and/or manage shortlet property.' },
  { id: 'property_management_company', title: 'Property Management Company', desc: 'I manage properties on behalf of clients.' },
  { id: 'property_lawyer', title: 'Property Lawyer', desc: 'I provide legal services for property transactions.' },
  { id: 'licensed_surveyor', title: 'Licensed Surveyor', desc: 'I provide professional surveying services.' },
  { id: 'structural_engineer', title: 'Structural Engineer', desc: 'I provide structural engineering services.' }
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
];

const isValidEmail = (email: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
const isValidPhone = (phone: string) => phone.length >= 10 && /^[\\d\\s\\+\\-\\(\\)]+$/.test(phone);

const BannerAnimation = () => (
  <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none flex justify-center items-center">
    <svg viewBox="0 0 1000 200" fill="none" className="w-full h-full max-w-5xl">
      <motion.path 
        d="M 0,140 L 250,140 L 300,60 L 700,60 L 750,140 L 1000,140" 
        stroke="white" 
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.path 
        d="M 350,200 L 400,120 L 600,120 L 650,200" 
        stroke="white" 
        strokeWidth="2"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
      />
    </svg>
  </div>
);

export default function WaitlistPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<WaitlistData>(INITIAL_DATA);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [autosaveVisible, setAutosaveVisible] = useState(false);

  // Autosave load
  useEffect(() => {
    const saved = localStorage.getItem('unity_waitlist_autosave');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role !== undefined) {
          setData(parsed);
        }
      } catch (e) {}
    }
  }, []);

  // Autosave trigger
  useEffect(() => {
    if (data !== INITIAL_DATA) {
      localStorage.setItem('unity_waitlist_autosave', JSON.stringify(data));
      setAutosaveVisible(true);
      const timer = setTimeout(() => setAutosaveVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const updateData = (field: string, value: any) => {
    if (field.startsWith('role_specific_data.')) {
      const key = field.split('.')[1];
      setData(prev => ({
        ...prev,
        role_specific_data: {
          ...prev.role_specific_data,
          [key]: value
        }
      }));
    } else if (field === 'role') {
      setData(prev => ({
        ...prev,
        role: value as WaitlistRole,
        role_specific_data: {} // Reset role specific data on role change
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
    let errors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!data.role) errors.role = 'Please select a role to continue.';
    } else if (currentStep === 2) {
      if (!data.full_name.trim()) errors.full_name = 'Please enter your full name.';
      if (!data.email) errors.email = 'Please enter your email address.';
      else if (!isValidEmail(data.email)) errors.email = 'Please enter a valid email address.';
      if (!data.phone) errors.phone = 'Please enter your phone number.';
      else if (!isValidPhone(data.phone)) errors.phone = 'Please enter a valid phone number.';
      if (!data.state) errors.state = 'Please select a state.';
    } else if (currentStep === 3) {
      errors = getRoleSpecificErrors();
    }

    if (Object.keys(errors).length === 0) {
      setDirection(1);
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const newTouched = { ...touched };
      Object.keys(errors).forEach(key => newTouched[key] = true);
      setTouched(newTouched);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!data.information_confirmed) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const testEmail = data.email.toLowerCase();
      if (testEmail.includes('network@error')) {
        throw new Error('Network failure connecting to the server. Please check your connection and try again.');
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

      clearAutosave();
      navigate('/waitlist/success');
      
    } catch (err: any) {
      if (!err.message) {
         setSubmitError("We couldn't complete your registration right now. Your information has not been lost. Please try again.");
      } else {
         setSubmitError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI Helpers
  const renderError = (field: string, errors: Record<string, string>) => {
    if (touched[field] && errors[field]) {
      return (
        <motion.p 
          initial={{ opacity: 0, y: -4 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-[#D92D20] text-sm font-medium mt-1.5"
        >
          {errors[field]}
        </motion.p>
      );
    }
    return null;
  };

  const getStep3Title = (role: string) => {
    if (!role) return 'Additional Details';
    if (role === 'property_seeker') return 'Your Interests';
    if (['long_term_landlord', 'shortlet_landlord', 'property_management_company'].includes(role)) return 'Property Details';
    if (['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(role)) return 'Professional Details';
    return 'Preferences';
  };

  const steps = [
    { num: 1, title: 'Your Role' },
    { num: 2, title: 'Your Details' },
    { num: 3, title: getStep3Title(data.role) },
    { num: 4, title: 'Review' }
  ];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 20 : -20,
      opacity: 0
    })
  };

  // Extract errors for current step rendering
  let currentErrors: Record<string, string> = {};
  if (currentStep === 1) {
    if (!data.role) currentErrors.role = 'Please select a role to continue.';
  } else if (currentStep === 2) {
    if (!data.full_name.trim()) currentErrors.full_name = 'Please enter your full name.';
    if (!data.email) currentErrors.email = 'Please enter your email address.';
    else if (!isValidEmail(data.email)) currentErrors.email = 'Please enter a valid email address.';
    if (!data.phone) currentErrors.phone = 'Please enter your phone number.';
    else if (!isValidPhone(data.phone)) currentErrors.phone = 'Please enter a valid phone number.';
    if (!data.state) currentErrors.state = 'Please select a state.';
  } else if (currentStep === 3) {
    currentErrors = getRoleSpecificErrors();
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-light)] font-sans">
      {/* Banner */}
      <div className="relative bg-[#2F8D46] pt-12 pb-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <BannerAnimation />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-white/80 font-bold tracking-widest text-xs uppercase mb-4">
            Join Unity Homes
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Be part of what's next in Nigerian real estate.
          </h1>
          <p className="text-lg text-white/90">
            Join the Unity Homes waitlist and tell us how you'd like to be part of the platform.
          </p>
        </div>
      </div>

      {/* Application Workspace */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-24 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] flex flex-col md:flex-row overflow-hidden min-h-[600px]">
          
          {/* Progress Panel (Desktop) & Top Bar (Mobile) */}
          <div className="md:w-80 bg-stone-50 border-b md:border-b-0 md:border-r border-[var(--color-border)] p-6 md:p-10 flex-shrink-0">
            {/* Mobile Progress */}
            <div className="md:hidden">
              <div className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                Step {currentStep} of {steps.length}
              </div>
              <div className="w-full bg-gray-200 h-1 rounded-full mb-4">
                <div 
                  className="bg-[#6FBE45] h-1 rounded-full transition-all duration-300"
                  style={{ width: \`\${(currentStep / steps.length) * 100}%\` }}
                />
              </div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                {steps[currentStep - 1].title}
              </h2>
            </div>

            {/* Desktop Progress */}
            <div className="hidden md:block">
              <h3 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest mb-10">
                Your Journey
              </h3>
              <div className="space-y-8 relative">
                <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-gray-200" />
                {steps.map((step, index) => {
                  const isCompleted = currentStep > step.num;
                  const isCurrent = currentStep === step.num;
                  const isUpcoming = currentStep < step.num;

                  return (
                    <div key={step.num} className="relative flex items-start">
                      <div className={\`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 \${
                        isCompleted ? 'bg-[#6FBE45]' : 
                        isCurrent ? 'bg-white border-2 border-[#6FBE45]' : 
                        'bg-white border-2 border-gray-300'
                      }\`}>
                        {isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
                        {isCurrent && <div className="w-2 h-2 rounded-full bg-[#6FBE45]" />}
                      </div>
                      <div className="ml-4">
                        <span className={\`block text-xs font-bold mb-1 \${
                          isCompleted || isCurrent ? 'text-[#6FBE45]' : 'text-gray-400'
                        }\`}>
                          0{step.num}
                        </span>
                        <span className={\`block font-bold \${
                          isCurrent ? 'text-[var(--color-text-primary)]' : 
                          isCompleted ? 'text-[var(--color-text-secondary)]' : 
                          'text-gray-400'
                        }\`}>
                          {step.title}
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">
                          {isCompleted ? 'Completed' : isCurrent ? 'Current step' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 md:p-12 lg:p-16 relative">
            <div className="absolute top-6 right-6 md:top-8 md:right-8 h-6 flex items-center">
              <AnimatePresence>
                {autosaveVisible && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center text-xs font-bold text-[#6FBE45]"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Saved
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="mb-8 hidden md:block">
                <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2 block">
                  Step 0{currentStep}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-primary)]">
                  {steps[currentStep - 1].title}
                </h2>
              </div>

              <div className="flex-1">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-6"
                  >
                    {/* STEP 1: ROLE */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        {ROLES_DISPLAY.map(r => (
                          <label 
                            key={r.id} 
                            className={\`flex items-start p-5 border rounded-[18px] cursor-pointer transition-all duration-200 \${
                              data.role === r.id 
                                ? 'border-[#6FBE45] bg-[#EAF5E3]' 
                                : 'border-[var(--color-border)] hover:bg-stone-50 hover:border-gray-300'
                            }\`}
                          >
                            <div className={\`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 \${
                              data.role === r.id ? 'border-[#6FBE45] bg-[#6FBE45]' : 'border-gray-300 bg-white'
                            }\`}>
                              {data.role === r.id && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="ml-4">
                              <span className="block font-bold text-[var(--color-text-primary)]">{r.title}</span>
                              <span className="block text-sm text-[var(--color-text-secondary)] mt-1">{r.desc}</span>
                            </div>
                            <input 
                              type="radio" 
                              name="waitlist_role"
                              className="sr-only"
                              checked={data.role === r.id}
                              onChange={() => updateData('role', r.id)}
                            />
                          </label>
                        ))}
                        {renderError('role', currentErrors)}
                      </div>
                    )}

                    {/* STEP 2: PERSONAL DETAILS */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">FULL NAME</label>
                          <input 
                            type="text" 
                            value={data.full_name}
                            onChange={(e) => updateData('full_name', e.target.value)}
                            onBlur={() => handleBlur('full_name')}
                            className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45] transition-all text-[var(--color-text-primary)]"
                          />
                          {renderError('full_name', currentErrors)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">EMAIL ADDRESS</label>
                            <input 
                              type="email" 
                              value={data.email}
                              onChange={(e) => updateData('email', e.target.value)}
                              onBlur={() => handleBlur('email')}
                              className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45] transition-all text-[var(--color-text-primary)]"
                            />
                            {renderError('email', currentErrors)}
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">PHONE NUMBER</label>
                            <input 
                              type="tel" 
                              value={data.phone}
                              onChange={(e) => updateData('phone', e.target.value)}
                              onBlur={() => handleBlur('phone')}
                              className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45] transition-all text-[var(--color-text-primary)]"
                            />
                            {renderError('phone', currentErrors)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">STATE</label>
                          <select 
                            value={data.state}
                            onChange={(e) => updateData('state', e.target.value)}
                            onBlur={() => handleBlur('state')}
                            className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45] transition-all text-[var(--color-text-primary)] appearance-none"
                          >
                            <option value="" disabled>Select a state...</option>
                            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {renderError('state', currentErrors)}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2">COUNTRY</label>
                          <input 
                            type="text" 
                            value="Nigeria"
                            disabled
                            className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-stone-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 3: ROLE SPECIFIC */}
                    {currentStep === 3 && (
                      <div className="space-y-8">
                        {/* PROPERTY SEEKER */}
                        {data.role === 'property_seeker' && (
                          <div>
                            <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-4">WHAT ARE YOU INTERESTED IN?</label>
                            <div className="space-y-3">
                              {['Buy Property', 'Rent Property', 'Find a Professional', 'Property Verification', 'Area Intelligence'].map(interest => {
                                const selected = (data.role_specific_data.interests || []).includes(interest);
                                return (
                                  <label 
                                    key={interest} 
                                    className={\`flex items-center px-5 h-14 border rounded-[18px] cursor-pointer transition-all duration-200 \${
                                      selected ? 'border-[#6FBE45] bg-[#EAF5E3]' : 'border-[var(--color-border)] hover:bg-stone-50'
                                    }\`}
                                  >
                                    <div className={\`w-5 h-5 rounded border flex items-center justify-center shrink-0 \${
                                      selected ? 'border-[#6FBE45] bg-[#6FBE45]' : 'border-gray-300 bg-white'
                                    }\`}>
                                      {selected && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className={\`ml-4 font-bold \${selected ? 'text-[#132A1D]' : 'text-[var(--color-text-primary)]'}\`}>{interest}</span>
                                    <input 
                                      type="checkbox"
                                      className="sr-only"
                                      checked={selected}
                                      onChange={(e) => {
                                        const current = data.role_specific_data.interests || [];
                                        const updated = e.target.checked ? [...current, interest] : current.filter((i: string) => i !== interest);
                                        updateData('role_specific_data.interests', updated);
                                      }}
                                      onBlur={() => handleBlur('interests')}
                                    />
                                  </label>
                                );
                              })}
                            </div>
                            {renderError('interests', currentErrors)}
                          </div>
                        )}

                        {/* LANDLORDS */}
                        {['long_term_landlord', 'shortlet_landlord'].includes(data.role) && (
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-4">SERVICE PREFERENCE</label>
                              <div className="space-y-3">
                                {['List My Property Only', 'List Plus Unity Homes Manager', 'Both Services'].map(pref => {
                                  const selected = data.role_specific_data.service_preference === pref;
                                  return (
                                    <label key={pref} className={\`flex items-center px-5 h-14 border rounded-[18px] cursor-pointer transition-all \${selected ? 'border-[#6FBE45] bg-[#EAF5E3]' : 'border-[var(--color-border)] hover:bg-stone-50'}\`}>
                                      <div className={\`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 \${selected ? 'border-[#6FBE45] bg-[#6FBE45]' : 'border-gray-300 bg-white'}\`}>
                                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                      </div>
                                      <span className={\`ml-4 font-bold \${selected ? 'text-[#132A1D]' : 'text-[var(--color-text-primary)]'}\`}>{pref}</span>
                                      <input 
                                        type="radio"
                                        name="landlord_pref"
                                        className="sr-only"
                                        checked={selected}
                                        onChange={() => updateData('role_specific_data.service_preference', pref)}
                                        onBlur={() => handleBlur('service_preference')}
                                      />
                                    </label>
                                  );
                                })}
                              </div>
                              {renderError('service_preference', currentErrors)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">NUMBER OF PROPERTIES OR UNITS</label>
                                <input 
                                  type="number" min="1"
                                  value={data.role_specific_data.properties_count || ''}
                                  onChange={(e) => updateData('role_specific_data.properties_count', e.target.value)}
                                  onBlur={() => handleBlur('properties_count')}
                                  className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45]"
                                />
                                {renderError('properties_count', currentErrors)}
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">PROPERTY TYPE</label>
                                <input 
                                  type="text" placeholder="e.g. Residential, Commercial"
                                  value={data.role_specific_data.property_type || ''}
                                  onChange={(e) => updateData('role_specific_data.property_type', e.target.value)}
                                  onBlur={() => handleBlur('property_type')}
                                  className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45]"
                                />
                                {renderError('property_type', currentErrors)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">SHORT DESCRIPTION (OPTIONAL)</label>
                              <textarea 
                                rows={3}
                                value={data.role_specific_data.description || ''}
                                onChange={(e) => updateData('role_specific_data.description', e.target.value)}
                                className="w-full p-4 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45] resize-none"
                              />
                            </div>
                          </div>
                        )}

                        {/* PMC */}
                        {data.role === 'property_management_company' && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">COMPANY NAME</label>
                                <input 
                                  type="text" 
                                  value={data.role_specific_data.company_name || ''}
                                  onChange={(e) => updateData('role_specific_data.company_name', e.target.value)}
                                  onBlur={() => handleBlur('company_name')}
                                  className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45]"
                                />
                                {renderError('company_name', currentErrors)}
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">CONTACT PERSON</label>
                                <input 
                                  type="text" 
                                  value={data.role_specific_data.contact_person || ''}
                                  onChange={(e) => updateData('role_specific_data.contact_person', e.target.value)}
                                  onBlur={() => handleBlur('contact_person')}
                                  className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45]"
                                />
                                {renderError('contact_person', currentErrors)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-4">SERVICE PREFERENCE</label>
                              <div className="space-y-3">
                                {['List My Clients Properties', 'Use Unity Homes Manager', 'Both Services'].map(pref => {
                                  const selected = data.role_specific_data.service_preference === pref;
                                  return (
                                    <label key={pref} className={\`flex items-center px-5 h-14 border rounded-[18px] cursor-pointer transition-all \${selected ? 'border-[#6FBE45] bg-[#EAF5E3]' : 'border-[var(--color-border)] hover:bg-stone-50'}\`}>
                                      <div className={\`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 \${selected ? 'border-[#6FBE45] bg-[#6FBE45]' : 'border-gray-300 bg-white'}\`}>
                                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                      </div>
                                      <span className={\`ml-4 font-bold \${selected ? 'text-[#132A1D]' : 'text-[var(--color-text-primary)]'}\`}>{pref}</span>
                                      <input 
                                        type="radio" name="pmc_pref" className="sr-only"
                                        checked={selected}
                                        onChange={() => updateData('role_specific_data.service_preference', pref)}
                                        onBlur={() => handleBlur('service_preference')}
                                      />
                                    </label>
                                  )
                                })}
                              </div>
                              {renderError('service_preference', currentErrors)}
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">NUMBER OF PROPERTIES MANAGED</label>
                              <input 
                                type="number" min="1"
                                value={data.role_specific_data.properties_count || ''}
                                onChange={(e) => updateData('role_specific_data.properties_count', e.target.value)}
                                onBlur={() => handleBlur('properties_count')}
                                className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45]"
                              />
                              {renderError('properties_count', currentErrors)}
                            </div>
                          </div>
                        )}

                        {/* PROFESSIONALS */}
                        {['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(data.role) && (
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">FIRM OR PRACTICE NAME</label>
                              <input 
                                type="text" 
                                value={data.role_specific_data.firm_name || ''}
                                onChange={(e) => updateData('role_specific_data.firm_name', e.target.value)}
                                onBlur={() => handleBlur('firm_name')}
                                className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45]"
                              />
                              {renderError('firm_name', currentErrors)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2 uppercase">
                                  {data.role === 'property_lawyer' ? 'NBA Registration Number' : 
                                   data.role === 'licensed_surveyor' ? 'SURCON Registration / License Number' : 
                                   'COREN Registration Number'}
                                </label>
                                <input 
                                  type="text" 
                                  value={data.role_specific_data.registration_number || ''}
                                  onChange={(e) => updateData('role_specific_data.registration_number', e.target.value.trimStart())}
                                  onBlur={() => handleBlur('registration_number')}
                                  className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45]"
                                />
                                {data.role === 'licensed_surveyor' && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                      Enter your valid SURCON registration or license number. This information will be used as part of our professional verification process.
                                    </p>
                                    <p className="text-sm font-bold text-[#2F8D46]">
                                      Surveyors on Unity Homes will be required to undergo professional verification before being approved on the platform.
                                    </p>
                                  </div>
                                )}
                                {renderError('registration_number', currentErrors)}
                              </div>
                              <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2">YEARS OF EXPERIENCE</label>
                                <input 
                                  type="number" min="0"
                                  value={data.role_specific_data.years_of_experience || ''}
                                  onChange={(e) => updateData('role_specific_data.years_of_experience', e.target.value)}
                                  onBlur={() => handleBlur('years_of_experience')}
                                  className="w-full px-4 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#6FBE45] focus:ring-1 focus:ring-[#6FBE45]"
                                />
                                {renderError('years_of_experience', currentErrors)}
                              </div>
                            </div>
                            
                            <div className="pt-4">
                              <label className="flex items-start cursor-pointer group">
                                <div className="mt-1 relative flex items-center justify-center min-w-[48px] min-h-[48px]">
                                  <input 
                                    type="checkbox"
                                    className="sr-only"
                                    checked={data.role_specific_data.consent || false}
                                    onChange={(e) => updateData('role_specific_data.consent', e.target.checked)}
                                    onBlur={() => handleBlur('consent')}
                                  />
                                  <div className={\`w-6 h-6 rounded border flex items-center justify-center transition-colors \${
                                    data.role_specific_data.consent 
                                      ? 'border-[#6FBE45] bg-[#6FBE45]' 
                                      : 'border-gray-300 bg-white group-hover:border-[#6FBE45]'
                                  }\`}>
                                    {data.role_specific_data.consent && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                </div>
                                <div className="ml-1 mt-3">
                                  <span className="block text-[var(--color-text-primary)] font-bold mb-1 leading-relaxed">
                                    I consent to Unity Homes verifying my eligibility, professional registration, and active membership status with the appropriate professional regulatory body before considering me for the Unity Homes Professional Directory.
                                  </span>
                                  <span className="block text-sm text-[var(--color-text-secondary)]">
                                    Verification does not guarantee directory listing. Final inclusion will only happen after review and agreement.
                                  </span>
                                </div>
                              </label>
                              {renderError('consent', currentErrors)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {currentStep === 4 && (
                      <div className="space-y-8">
                        <div className="bg-stone-50 rounded-2xl p-6 md:p-8 border border-[var(--color-border)]">
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Your Role</h3>
                            <button type="button" onClick={() => { setDirection(-1); setCurrentStep(1); }} className="text-[#6FBE45] text-sm font-bold hover:underline">EDIT</button>
                          </div>
                          <p className="text-lg font-bold text-[var(--color-text-primary)]">
                            {ROLES_DISPLAY.find(r => r.id === data.role)?.title}
                          </p>
                        </div>

                        <div className="bg-stone-50 rounded-2xl p-6 md:p-8 border border-[var(--color-border)]">
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Your Details</h3>
                            <button type="button" onClick={() => { setDirection(-1); setCurrentStep(2); }} className="text-[#6FBE45] text-sm font-bold hover:underline">EDIT</button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <span className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Name</span>
                              <span className="block font-bold text-[var(--color-text-primary)]">{data.full_name}</span>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Email</span>
                              <span className="block font-bold text-[var(--color-text-primary)]">{data.email}</span>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Phone</span>
                              <span className="block font-bold text-[var(--color-text-primary)]">{data.phone}</span>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">State</span>
                              <span className="block font-bold text-[var(--color-text-primary)]">{data.state}, Nigeria</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-stone-50 rounded-2xl p-6 md:p-8 border border-[var(--color-border)]">
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Additional Details</h3>
                            <button type="button" onClick={() => { setDirection(-1); setCurrentStep(3); }} className="text-[#6FBE45] text-sm font-bold hover:underline">EDIT</button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {Object.entries(data.role_specific_data).map(([key, val]) => {
                              if (key === 'consent' || val === '' || val === null || val === undefined) return null;
                              return (
                                <div key={key} className={Array.isArray(val) || key === 'description' ? 'col-span-1 sm:col-span-2' : ''}>
                                  <span className="block text-xs font-bold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                                  <span className="block font-bold text-[var(--color-text-primary)]">
                                    {key === 'registration_number' && data.role === 'licensed_surveyor' && val ? \`\${val} (SURCON, Verification Pending)\` : Array.isArray(val) ? val.join(', ') : String(val)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {submitError && (
                          <div className="p-5 bg-[#FDEDED] border border-[#F5C2C7] rounded-xl text-[#842029] font-medium text-sm">
                            {submitError}
                          </div>
                        )}

                        <div className="pt-4">
                          <label className="flex items-start cursor-pointer group">
                            <div className="mt-0.5 relative flex items-center justify-center min-w-[48px] min-h-[48px]">
                              <input 
                                type="checkbox"
                                className="sr-only"
                                checked={data.information_confirmed}
                                onChange={(e) => updateData('information_confirmed', e.target.checked)}
                              />
                              <div className={\`w-6 h-6 rounded border flex items-center justify-center transition-colors \${
                                data.information_confirmed 
                                  ? 'border-[#6FBE45] bg-[#6FBE45]' 
                                  : 'border-gray-300 bg-white group-hover:border-[#6FBE45]'
                              }\`}>
                                {data.information_confirmed && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                            <div className="ml-1 mt-3">
                              <span className="block font-bold text-[var(--color-text-primary)] leading-relaxed">
                                I confirm that the information I provided is accurate.
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Controls */}
              <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold transition-colors px-2 py-2 min-h-[48px]"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back
                  </button>
                ) : (
                  <div />
                )}
                
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center bg-[#6FBE45] text-white px-8 py-3 rounded-[18px] font-bold text-lg hover:bg-[#5CA636] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-h-[56px] shadow-sm"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!data.information_confirmed || isSubmitting}
                    className="flex items-center bg-[#132A1D] text-white px-8 py-3 rounded-[18px] font-bold text-lg hover:bg-[#0E2F1F] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-h-[56px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5 mr-2" />
                        Processing...
                      </>
                    ) : (
                      'JOIN THE WAITLIST'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/WaitlistPage.tsx', content);
console.log('Successfully wrote WaitlistPage.tsx');
