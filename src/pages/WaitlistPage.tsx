import React, { useState, useEffect, FormEvent } from 'react';
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
  { id: 'property_seeker', title: 'Property Seeker', desc: "I'm looking for property or property-related help.", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80" },
  { id: 'long_term_landlord', title: 'Long-Term Landlord', desc: 'I want to list and/or manage long-term property.', img: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&q=80" },
  { id: 'shortlet_landlord', title: 'Shortlet Landlord', desc: 'I want to list and/or manage shortlet property.', img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80" },
  { id: 'property_management_company', title: 'Property Management Company', desc: 'I manage properties on behalf of clients.', img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80" },
  { id: 'property_lawyer', title: 'Property Lawyer', desc: 'I provide legal services for property transactions.', img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80" },
  { id: 'licensed_surveyor', title: 'Licensed Surveyor', desc: 'I provide professional surveying services.', img: "https://images.unsplash.com/photo-1541888086925-ebcf3819e933?auto=format&fit=crop&q=80" },
  { id: 'structural_engineer', title: 'Structural Engineer', desc: 'I provide structural engineering services.', img: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80" }
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
];

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => phone.length >= 10 && /^[\d\s\+\-\(\)]+$/.test(phone);



export default function WaitlistPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
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
    <div className="min-h-screen font-sans bg-black relative flex flex-col">
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div 
            key="step0"
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" alt="Modern home exterior" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </motion.div>
        )}
        {currentStep > 0 && currentStep < 5 && (
          <motion.div 
            key="form-bg"
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src={
              currentStep === 1 ? "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80" :
              currentStep === 2 ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80" :
              currentStep === 3 ? (data.role ? ROLES_DISPLAY.find(r => r.id === data.role)?.img : "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80") :
              "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80"
            } alt="Background" className="w-full h-full object-cover transition-all duration-700" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full flex-grow flex flex-col">
        {currentStep === 0 && (
          <div className="min-h-screen flex flex-col justify-end pb-24 px-6 md:px-12 lg:px-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl"
            >
              <h1 className="text-white text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight text-balance">
                Real Estate Should Be Easier.
              </h1>
              <p className="text-white/90 text-xl md:text-2xl font-normal mb-10 max-w-2xl text-balance">
                Join the Unity Homes waitlist and tell us how you'd like to be part of the platform.
              </p>
              <button 
                onClick={() => setCurrentStep(1)}
                className="bg-[#008D24] text-white px-10 py-5 rounded-full font-semibold text-xl shadow-[0_8px_30px_rgba(255,255,255,0.2)] hover:bg-[#007a1f] hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1"
              >
                Join the Waitlist
              </button>
            </motion.div>
          </div>
        )}

        {currentStep > 0 && (
          <div className="py-12 px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
              
              {currentStep > 1 && !isSubmitting && (
                <button 
                  onClick={handleBack}
                  className="mb-6 self-start flex items-center text-white/90 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </button>
              )}
              {currentStep === 1 && !isSubmitting && (
                <button 
                  onClick={() => setCurrentStep(0)}
                  className="mb-6 self-start flex items-center text-white/90 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </button>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-12 w-full flex-grow"
              >
                
                {currentStep === 1 && (
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex-grow"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-[#132A1D] mb-2 shadow-sm">Who are you?</h2>
                  <p className="text-gray-600 mb-10 text-lg">Select the role that best describes you to continue.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ROLES_DISPLAY.map((role) => {
                      const selected = data.role === role.id;
                      return (
                        <div 
                          key={role.id}
                          onClick={() => { updateData('role', role.id); setDirection(1); }}
                          className={`cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${selected ? 'ring-4 ring-[#008D24]' : 'hover:shadow-xl border border-gray-100'}`}
                        >
                          <div className="h-40 w-full relative">
                            <img src={role.img} alt={role.title} className="w-full h-full object-cover" />
                            {selected && (
                              <div className="absolute top-3 right-3 bg-[#008D24] text-white p-1 rounded-full shadow-md">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold text-[#132A1D] text-lg mb-1">{role.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{role.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
{currentStep === 2 && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Full Name</label>
                          <input 
                            type="text" 
                            value={data.full_name}
                            onChange={(e) => updateData('full_name', e.target.value)}
                            onBlur={() => handleBlur('full_name')}
                            className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] transition-all text-[var(--color-text-primary)] font-medium"
                          />
                          {renderError('full_name', currentErrors)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Email Address</label>
                            <input 
                              type="email" 
                              value={data.email}
                              onChange={(e) => updateData('email', e.target.value)}
                              onBlur={() => handleBlur('email')}
                              className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] transition-all text-[var(--color-text-primary)] font-medium"
                            />
                            {renderError('email', currentErrors)}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Phone Number</label>
                            <input 
                              type="tel" 
                              value={data.phone}
                              onChange={(e) => updateData('phone', e.target.value)}
                              onBlur={() => handleBlur('phone')}
                              className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] transition-all text-[var(--color-text-primary)] font-medium"
                            />
                            {renderError('phone', currentErrors)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">State (Nigeria)</label>
                          <select 
                            value={data.state}
                            onChange={(e) => updateData('state', e.target.value)}
                            onBlur={() => handleBlur('state')}
                            className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] transition-all text-[var(--color-text-primary)] appearance-none font-medium"
                          >
                            <option value="" disabled>Select a state...</option>
                            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {renderError('state', currentErrors)}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-400 mb-2 uppercase">Country</label>
                          <input 
                            type="text" 
                            value="Nigeria"
                            disabled
                            className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-stone-50 text-gray-500 font-medium cursor-not-allowed"
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
                            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase">What are you interested in?</label>
                            <div className="space-y-3">
                              {['Buy Property', 'Rent Property', 'Find a Professional', 'Property Verification', 'Area Intelligence'].map(interest => {
                                const selected = (data.role_specific_data.interests || []).includes(interest);
                                return (
                                  <label 
                                    key={interest} 
                                    className={`flex items-center px-5 h-14 border rounded-[18px] cursor-pointer transition-all duration-200 ${
                                      selected ? 'border-[#008D24] bg-[#EAF5E3]' : 'border-[var(--color-border)] hover:bg-stone-50 hover:border-gray-300'
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                                      selected ? 'border-[#008D24] bg-[#008D24]' : 'border-gray-300 bg-white'
                                    }`}>
                                      {selected && <Check className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <span className={`ml-4 font-semibold ${selected ? 'text-[#132A1D]' : 'text-[var(--color-text-primary)]'}`}>{interest}</span>
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
                              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase">Service Preference</label>
                              <div className="space-y-3">
                                {['List My Property Only', 'List Plus Unity Homes Manager', 'Both Services'].map(pref => {
                                  const selected = data.role_specific_data.service_preference === pref;
                                  return (
                                    <label key={pref} className={`flex items-center px-5 h-14 border rounded-[18px] cursor-pointer transition-all ${selected ? 'border-[#008D24] bg-[#EAF5E3]' : 'border-[var(--color-border)] hover:bg-stone-50 hover:border-gray-300'}`}>
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selected ? 'border-[#008D24] bg-[#008D24]' : 'border-gray-300 bg-white'}`}>
                                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                      </div>
                                      <span className={`ml-4 font-semibold ${selected ? 'text-[#132A1D]' : 'text-[var(--color-text-primary)]'}`}>{pref}</span>
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
                                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Number of Properties or Units</label>
                                <input 
                                  type="number" min="1"
                                  value={data.role_specific_data.properties_count || ''}
                                  onChange={(e) => updateData('role_specific_data.properties_count', e.target.value)}
                                  onBlur={() => handleBlur('properties_count')}
                                  className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] font-medium"
                                />
                                {renderError('properties_count', currentErrors)}
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Property Type</label>
                                <input 
                                  type="text" placeholder="e.g. Residential, Commercial"
                                  value={data.role_specific_data.property_type || ''}
                                  onChange={(e) => updateData('role_specific_data.property_type', e.target.value)}
                                  onBlur={() => handleBlur('property_type')}
                                  className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] font-medium"
                                />
                                {renderError('property_type', currentErrors)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Short Description (Optional)</label>
                              <textarea 
                                rows={3}
                                value={data.role_specific_data.description || ''}
                                onChange={(e) => updateData('role_specific_data.description', e.target.value)}
                                className="w-full p-5 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] resize-none font-medium"
                              />
                            </div>
                          </div>
                        )}

                        {/* PMC */}
                        {data.role === 'property_management_company' && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Company Name</label>
                                <input 
                                  type="text" 
                                  value={data.role_specific_data.company_name || ''}
                                  onChange={(e) => updateData('role_specific_data.company_name', e.target.value)}
                                  onBlur={() => handleBlur('company_name')}
                                  className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] font-medium"
                                />
                                {renderError('company_name', currentErrors)}
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Contact Person</label>
                                <input 
                                  type="text" 
                                  value={data.role_specific_data.contact_person || ''}
                                  onChange={(e) => updateData('role_specific_data.contact_person', e.target.value)}
                                  onBlur={() => handleBlur('contact_person')}
                                  className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] font-medium"
                                />
                                {renderError('contact_person', currentErrors)}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-4 uppercase">Service Preference</label>
                              <div className="space-y-3">
                                {['List My Clients Properties', 'Use Unity Homes Manager', 'Both Services'].map(pref => {
                                  const selected = data.role_specific_data.service_preference === pref;
                                  return (
                                    <label key={pref} className={`flex items-center px-5 h-14 border rounded-[18px] cursor-pointer transition-all ${selected ? 'border-[#008D24] bg-[#EAF5E3]' : 'border-[var(--color-border)] hover:bg-stone-50 hover:border-gray-300'}`}>
                                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selected ? 'border-[#008D24] bg-[#008D24]' : 'border-gray-300 bg-white'}`}>
                                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                      </div>
                                      <span className={`ml-4 font-semibold ${selected ? 'text-[#132A1D]' : 'text-[var(--color-text-primary)]'}`}>{pref}</span>
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
                              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Number of Properties Managed</label>
                              <input 
                                type="number" min="1"
                                value={data.role_specific_data.properties_count || ''}
                                onChange={(e) => updateData('role_specific_data.properties_count', e.target.value)}
                                onBlur={() => handleBlur('properties_count')}
                                className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] font-medium"
                              />
                              {renderError('properties_count', currentErrors)}
                            </div>
                          </div>
                        )}

                        {/* PROFESSIONALS */}
                        {['property_lawyer', 'licensed_surveyor', 'structural_engineer'].includes(data.role) && (
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Firm or Practice Name</label>
                              <input 
                                type="text" 
                                value={data.role_specific_data.firm_name || ''}
                                onChange={(e) => updateData('role_specific_data.firm_name', e.target.value)}
                                onBlur={() => handleBlur('firm_name')}
                                className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] font-medium"
                              />
                              {renderError('firm_name', currentErrors)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">
                                  {data.role === 'property_lawyer' ? 'NBA Registration Number' : 
                                   data.role === 'licensed_surveyor' ? 'SURCON Registration / License Number' : 
                                   'COREN Registration Number'}
                                </label>
                                <input 
                                  type="text" 
                                  value={data.role_specific_data.registration_number || ''}
                                  onChange={(e) => updateData('role_specific_data.registration_number', e.target.value.trimStart())}
                                  onBlur={() => handleBlur('registration_number')}
                                  className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] font-medium"
                                />
                                {data.role === 'licensed_surveyor' && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                      Enter your valid SURCON registration or license number. This information will be used as part of our professional verification process.
                                    </p>
                                    <p className="text-sm font-semibold text-[#008D24]">
                                      Surveyors on Unity Homes will be required to undergo professional verification before being approved on the platform.
                                    </p>
                                  </div>
                                )}
                                {renderError('registration_number', currentErrors)}
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 uppercase">Years of Experience</label>
                                <input 
                                  type="number" min="0"
                                  value={data.role_specific_data.years_of_experience || ''}
                                  onChange={(e) => updateData('role_specific_data.years_of_experience', e.target.value)}
                                  onBlur={() => handleBlur('years_of_experience')}
                                  className="w-full px-5 h-14 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[#008D24] focus:ring-1 focus:ring-[#008D24] font-medium"
                                />
                                {renderError('years_of_experience', currentErrors)}
                              </div>
                            </div>
                            
                            <div className="pt-4">
                              <label className="flex items-start cursor-pointer group">
                                <div className="mt-1 relative flex items-center justify-center min-w-[48px] min-h-[48px] shrink-0">
                                  <input 
                                    type="checkbox"
                                    className="sr-only"
                                    checked={data.role_specific_data.consent || false}
                                    onChange={(e) => updateData('role_specific_data.consent', e.target.checked)}
                                    onBlur={() => handleBlur('consent')}
                                  />
                                  <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                                    data.role_specific_data.consent 
                                      ? 'border-[#008D24] bg-[#008D24]' 
                                      : 'border-gray-300 bg-white group-hover:border-[#008D24]'
                                  }`}>
                                    {data.role_specific_data.consent && <Check className="w-4 h-4 text-white" />}
                                  </div>
                                </div>
                                <div className="ml-2 mt-3">
                                  <span className="block text-[var(--color-text-primary)] font-semibold mb-1 leading-relaxed">
                                    I consent to Unity Homes verifying my eligibility, professional registration, and active membership status with the appropriate professional regulatory body before considering me for the Unity Homes Professional Directory.
                                  </span>
                                  <span className="block text-sm text-[var(--color-text-secondary)] leading-relaxed">
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
                      <div className="space-y-6">
                        <div className="bg-stone-50 rounded-[18px] p-6 md:p-8 border border-[var(--color-border)]">
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">Your Role</h3>
                            <button type="button" onClick={() => { setDirection(-1); setCurrentStep(1); }} className="text-[#008D24] text-sm font-semibold hover:underline">EDIT</button>
                          </div>
                          <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                            {ROLES_DISPLAY.find(r => r.id === data.role)?.title}
                          </p>
                        </div>

                        <div className="bg-stone-50 rounded-[18px] p-6 md:p-8 border border-[var(--color-border)]">
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">Your Details</h3>
                            <button type="button" onClick={() => { setDirection(-1); setCurrentStep(2); }} className="text-[#008D24] text-sm font-semibold hover:underline">EDIT</button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <span className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Name</span>
                              <span className="block font-semibold text-[var(--color-text-primary)] text-base">{data.full_name}</span>
                            </div>
                            <div>
                              <span className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Email</span>
                              <span className="block font-semibold text-[var(--color-text-primary)] text-base">{data.email}</span>
                            </div>
                            <div>
                              <span className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">Phone</span>
                              <span className="block font-semibold text-[var(--color-text-primary)] text-base">{data.phone}</span>
                            </div>
                            <div>
                              <span className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">State</span>
                              <span className="block font-semibold text-[var(--color-text-primary)] text-base">{data.state}, Nigeria</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-stone-50 rounded-[18px] p-6 md:p-8 border border-[var(--color-border)]">
                          <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">Additional Details</h3>
                            <button type="button" onClick={() => { setDirection(-1); setCurrentStep(3); }} className="text-[#008D24] text-sm font-semibold hover:underline">EDIT</button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {Object.entries(data.role_specific_data).map(([key, val]) => {
                              if (key === 'consent' || val === '' || val === null || val === undefined) return null;
                              return (
                                <div key={key} className={Array.isArray(val) || key === 'description' ? 'col-span-1 sm:col-span-2' : ''}>
                                  <span className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                                  <span className="block font-semibold text-[var(--color-text-primary)] text-base">
                                    {key === 'registration_number' && data.role === 'licensed_surveyor' && val ? `${val} (SURCON, Verification Pending)` : Array.isArray(val) ? val.join(', ') : String(val)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {submitError && (
                          <div className="p-5 bg-[#FDEDED] border border-[#F5C2C7] rounded-[18px] text-[#842029] font-medium text-sm">
                            {submitError}
                          </div>
                        )}

                        <div className="pt-2">
                          <label className="flex items-start cursor-pointer group">
                            <div className="relative flex items-center justify-center min-w-[48px] min-h-[48px] shrink-0">
                              <input 
                                type="checkbox"
                                className="sr-only"
                                checked={data.information_confirmed}
                                onChange={(e) => updateData('information_confirmed', e.target.checked)}
                              />
                              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                                data.information_confirmed 
                                  ? 'border-[#008D24] bg-[#008D24]' 
                                  : 'border-gray-300 bg-white group-hover:border-[#008D24]'
                              }`}>
                                {data.information_confirmed && <Check className="w-4 h-4 text-white" />}
                              </div>
                            </div>
                            <div className="ml-2 mt-[14px]">
                              <span className="block font-semibold text-[var(--color-text-primary)] leading-relaxed">
                                I confirm that the information I provided is accurate.
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  

                <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center">
                  <div className="mb-4 sm:mb-0 text-sm font-semibold text-gray-400">
                    Step {currentStep} of {steps.length}
                  </div>
                  <button
                    onClick={currentStep === 4 ? handleSubmit : handleNext}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#008D24] text-white px-8 py-4 rounded-xl font-semibold shadow-md hover:bg-[#007a1f] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        {currentStep === 4 ? 'Submit Application' : 'Continue'} 
                        {currentStep !== 4 && <ChevronRight className="w-5 h-5 ml-2" />}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
