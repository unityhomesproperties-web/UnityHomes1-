// @ts-nocheck
import React, { useState, useEffect, FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AreaIntelligenceSuccess from '../components/AreaIntelligenceSuccess';

// --- DATA TYPES ---
interface LocationData {
  state: string;
  lga: string;
  area: string;
  estate: string;
  years_lived: string;
  relationship: string;
}

interface RatingsData {
  security: number;
  electricity: number;
  water: number;
  roads: number;
  drainage: number;
  flooding: number;
  internet: number;
  schools: number;
  hospitals: number;
  markets: number;
  banks: number;
  public_transport: number;
  noise: number;
  night_safety: number;
}

interface HousingData {
  typical_rent: string;
  property_type: string;
  availability: string;
  ease_of_finding: string;
  rent_change: string;
}

interface CommunityData {
  recommend: string;
  best_thing: string;
  biggest_challenge: string;
  suggestion: string;
}

interface AIData {
  location: LocationData;
  ratings: RatingsData;
  housing: HousingData;
  community: CommunityData;
  consent: {
    accurate: boolean;
    use_anonymously: boolean;
  };
}

const INITIAL_DATA: AIData = {
  location: { state: '', lga: '', area: '', estate: '', years_lived: '', relationship: '' },
  ratings: { security: 0, electricity: 0, water: 0, roads: 0, drainage: 0, flooding: 0, internet: 0, schools: 0, hospitals: 0, markets: 0, banks: 0, public_transport: 0, noise: 0, night_safety: 0 },
  housing: { typical_rent: '', property_type: '', availability: '', ease_of_finding: '', rent_change: '' },
  community: { recommend: '', best_thing: '', biggest_challenge: '', suggestion: '' },
  consent: { accurate: false, use_anonymously: false },
};

const RELATIONSHIPS = ["Resident", "Former Resident", "Landlord", "Property Manager", "Property Professional", "Visitor"];
const RECOMMENDATIONS = ["Yes", "Maybe", "No"];

// Reusable Components

const RadioRow = ({ label, selected, onClick, type = "default" }: { label: string, selected: boolean, onClick: () => void, type?: "default" | "yes" | "maybe" | "no" }) => {
  let activeBorder = 'border-[var(--color-brand-fresh)]';
  let activeBg = 'bg-[var(--color-surface-soft)]';
  let activeText = 'text-[var(--color-brand-deep)]';
  
  if (type === "maybe") {
    activeBorder = 'border-stone-400';
    activeBg = 'bg-stone-50';
    activeText = 'text-stone-800';
  } else if (type === "no") {
    activeBorder = 'border-stone-400';
    activeBg = 'bg-stone-100';
    activeText = 'text-stone-700';
  }

  return (
    <div 
      onClick={onClick}
      className={`relative flex items-center p-4 border rounded-[var(--radius-button)] cursor-pointer transition-all duration-200 ${
        selected ? `${activeBorder} ${activeBg}` : 'border-[var(--color-border)] hover:bg-[var(--color-surface-light)] bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
        selected ? 'border-[var(--color-brand-fresh)] bg-[var(--color-brand-fresh)]' : 'border-gray-300'
      }`}>
        {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <span className={`ml-4 block font-semibold ${selected ? activeText : 'text-[var(--color-text-primary)]'}`}>
        {label}
      </span>
    </div>
  );
};

const StarRating = ({ value, onChange, label }: { value: number, onChange: (val: number) => void, label: string }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex flex-row items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0 group">
      <span className="font-semibold text-sm sm:text-base text-[var(--color-text-primary)] capitalize">
        {label.replace(/_/g, ' ')}
      </span>
      <div className="flex space-x-1 sm:space-x-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hover || value);
          return (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center focus:outline-none"
            >
              <Star
                className={`w-7 h-7 sm:w-6 sm:h-6 transition-colors duration-200 ${
                  isActive ? 'fill-[var(--color-brand-fresh)] text-[var(--color-brand-fresh)]' : 'text-gray-200 fill-gray-100'
                }`}
              />
            </motion.button>
          )
        })}
      </div>
    </div>
  );
};

const TextareaRow = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
  const maxLength = 250;
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[var(--color-text-primary)]">{label} <span className="text-stone-400 font-normal">(Optional)</span></label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          className="w-full px-4 py-4 rounded-[18px] border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-brand-fresh)] focus:ring-1 focus:ring-[var(--color-brand-fresh)] text-[var(--color-text-primary)] resize-none transition-all duration-200"
          rows={3}
          placeholder="Share your thoughts..."
        />
        <div className="absolute bottom-3 right-4 text-xs font-medium text-stone-400">
          {value.length} / {maxLength}
        </div>
      </div>
    </div>
  );
};

const AbstractIllustration = ({ type }: { type: 'hero' | 'location' | 'housing' | 'community' }) => {
  if (type === 'hero') {
    return (
      <svg className="w-full h-full opacity-30" viewBox="0 0 400 200" fill="none">
        <motion.path d="M50,150 L100,100 L200,100 L250,50 L350,50" stroke="white" strokeWidth="2" strokeLinejoin="round" 
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} />
        <motion.circle cx="100" cy="100" r="4" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }} />
        <motion.circle cx="200" cy="100" r="4" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, duration: 0.4 }} />
        <motion.circle cx="250" cy="50" r="4" fill="white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, duration: 0.4 }} />
        <motion.circle cx="200" cy="100" r="12" stroke="white" strokeWidth="1" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: [0, 1, 0] }} transition={{ delay: 1, duration: 1 }} />
      </svg>
    );
  }
  if (type === 'location') {
    return (
      <svg className="w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
        <motion.rect x="50" y="50" width="100" height="100" rx="8" stroke="#0E2F1F" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
        <motion.circle cx="100" cy="100" r="12" fill="#6FBE45" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />
      </svg>
    );
  }
  if (type === 'housing') {
    return (
      <svg className="w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
        <motion.path d="M40,120 L100,60 L160,120 V160 H40 Z" stroke="#0E2F1F" strokeWidth="4" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
        <motion.rect x="85" y="120" width="30" height="40" stroke="#0E2F1F" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />
      </svg>
    );
  }
  if (type === 'community') {
    return (
      <svg className="w-full h-full opacity-10" viewBox="0 0 200 200" fill="none">
        <motion.path d="M40,100 L160,100" stroke="#6FBE45" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        <motion.path d="M60,100 L80,70 L100,100" stroke="#0E2F1F" strokeWidth="4" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.4 }} />
        <motion.path d="M100,100 L120,60 L140,100" stroke="#0E2F1F" strokeWidth="4" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.4 }} />
      </svg>
    );
  }
  return null;
};

// --- MAIN COMPONENT ---
export default function AreaIntelligencePage() {
  const [data, setData] = useState<AIData>(() => {
    const saved = localStorage.getItem('unity_ai_autosave');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalSteps = 5;

  const STEPS = [
    { title: "Location", short: "Location" },
    { title: "Area Experience", short: "Experience" },
    { title: "Housing Information", short: "Housing" },
    { title: "Community Experience", short: "Community" },
    { title: "Review", short: "Review" },
  ];

  useEffect(() => {
    localStorage.setItem('unity_ai_autosave', JSON.stringify(data));
  }, [data]);

  const updateSection = (section: keyof AIData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    if (step === 1) {
      if (!data.location.state) errors.state = "State is required.";
      if (!data.location.lga) errors.lga = "LGA is required.";
      if (!data.location.area) errors.area = "Area is required.";
      if (!data.location.years_lived) errors.years_lived = "Years lived is required.";
      if (!data.location.relationship) errors.relationship = "Relationship is required.";
    }
    if (step === 2) {
      const hasRating = Object.values(data.ratings).some(v => v > 0);
      if (!hasRating) errors.ratings = "Please rate at least one aspect of the area.";
    }
    if (step === 3) {
      if (!data.housing.typical_rent) errors.typical_rent = "Typical rent is required.";
      if (!data.housing.property_type) errors.property_type = "Common property type is required.";
      if (!data.housing.availability) errors.availability = "Housing availability is required.";
      if (!data.housing.ease_of_finding) errors.ease_of_finding = "Ease of finding accommodation is required.";
      if (!data.housing.rent_change) errors.rent_change = "Rent change experience is required.";
    }
    if (step === 4) {
      if (!data.community.recommend) errors.recommend = "Recommendation is required.";
    }
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length === 0) {
      setDirection(1);
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
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

  const handleEdit = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (currentStep !== 5) return;
    
    if (!data.consent.accurate || !data.consent.use_anonymously) {
      setSubmitError("You must agree to both consent statements to submit.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 2000));
      localStorage.removeItem('unity_ai_autosave');
      setIsSuccess(true);
    } catch (err) {
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (field: string, errors: Record<string, string>) => {
    if (touched[field] && errors[field]) {
      return (
        <motion.p 
          initial={{ opacity: 0, y: -4 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-red-500 text-sm mt-1"
        >
          {errors[field]}
        </motion.p>
      );
    }
    return null;
  };

  if (isSuccess) {
    return <AreaIntelligenceSuccess onReset={() => {
      setData(INITIAL_DATA);
      setIsSuccess(false);
      setCurrentStep(1);
    }} />;
  }

  const errors = validateStep(currentStep);

  // Animation variants
  const pageVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: "easeOut" }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
      transition: { duration: 0.25, ease: "easeIn" }
    })
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] font-sans pt-16">
      
      {/* SOLID COLOR BANNER */}
      <section className="bg-[#6FBE45] relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AbstractIllustration type="hero" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
          <h4 className="text-xs md:text-sm font-semibold tracking-widest uppercase text-white/90 mb-3">
            AREA INTELLIGENCE
          </h4>
          <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight mb-4 max-w-2xl">
            Help people understand what living in your area is really like.
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl mb-6 leading-relaxed">
            Share real information about your neighbourhood to help people make better property decisions.
          </p>
          <div className="inline-flex bg-[#132A1D] border-transparent text-white rounded-full px-4 py-2 text-sm font-semibold">
            Estimated time: 3–4 minutes
          </div>
        </div>
      </section>

      {/* APPLICATION WORKSPACE */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        
        {/* MOBILE PROGRESS */}
        <div className="md:hidden mb-8">
          <div className="flex justify-between text-xs font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wider">
            <span>Step {currentStep} of {totalSteps}</span>
            <span className="text-[var(--color-brand-fresh)]">{STEPS[currentStep-1].short}</span>
          </div>
          <div className="w-full bg-[var(--color-surface-soft)] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[var(--color-brand-fresh)] h-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          
          {/* DESKTOP PROGRESS SIDEBAR */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest mb-8">Your Journey</h3>
              <div className="space-y-6">
                {STEPS.map((step, idx) => {
                  const isCompleted = idx + 1 < currentStep;
                  const isCurrent = idx + 1 === currentStep;
                  
                  return (
                    <div key={idx} className="relative flex items-start group">
                      {idx !== STEPS.length - 1 && (
                        <div className={`absolute left-2.5 top-6 w-px h-8 transition-colors duration-300 ${isCompleted ? 'bg-[var(--color-brand-fresh)]' : 'bg-stone-200'}`} />
                      )}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300 ${
                        isCompleted ? 'bg-[var(--color-brand-fresh)] border-[var(--color-brand-fresh)]' :
                        isCurrent ? 'border-[var(--color-brand-fresh)]' : 'border-stone-300'
                      }`}>
                        {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        {isCurrent && <div className="w-2 h-2 rounded-full bg-[var(--color-brand-fresh)]" />}
                      </div>
                      <div className="ml-4">
                        <div className="text-xs font-semibold text-[var(--color-text-secondary)] mb-0.5">0{idx + 1}</div>
                        <div className={`text-sm font-semibold transition-colors duration-300 ${
                          isCompleted || isCurrent ? 'text-[var(--color-brand-deep)]' : 'text-stone-400'
                        }`}>
                          {step.title}
                        </div>
                        {isCompleted && (
                          <div className="text-xs text-[var(--color-brand-fresh)] mt-1 font-medium flex items-center">
                            Completed
                          </div>
                        )}
                        {isCurrent && (
                          <div className="text-xs text-[var(--color-text-secondary)] mt-1 flex items-center gap-1">
                            Current Step <span className="text-stone-300 ml-1 italic text-[10px]">✓ Saved</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FORM AREA */}
          <div className="flex-1 max-w-3xl">
            <div className="bg-white rounded-[24px] shadow-sm border border-[var(--color-border)] p-6 md:p-10 relative overflow-hidden min-h-[500px]">
              
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                >
                  
                  {/* STEP 1: LOCATION */}
                  {currentStep === 1 && (
                    <div className="space-y-8">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <div className="text-xs font-semibold text-[var(--color-brand-fresh)] uppercase tracking-wider mb-2">Step 01</div>
                          <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-2">Where is the area you're sharing about?</h2>
                          <p className="text-[var(--color-text-secondary)]">Please provide the specific location details so others can find this intelligence.</p>
                        </div>
                        <div className="hidden sm:block w-24 h-24 shrink-0 -mt-2 -mr-2">
                          <AbstractIllustration type="location" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">State</label>
                          <input type="text" value={data.location.state} onChange={e => updateSection('location', 'state', e.target.value)} onBlur={() => handleBlur('state')} className="w-full px-4 py-4 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-brand-fresh)] focus:ring-1 focus:ring-[var(--color-brand-fresh)] text-[var(--color-text-primary)] transition-all" placeholder="e.g. Lagos" />
                          {renderError('state', errors)}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">LGA (Local Govt Area)</label>
                          <input type="text" value={data.location.lga} onChange={e => updateSection('location', 'lga', e.target.value)} onBlur={() => handleBlur('lga')} className="w-full px-4 py-4 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-brand-fresh)] focus:ring-1 focus:ring-[var(--color-brand-fresh)] text-[var(--color-text-primary)] transition-all" placeholder="e.g. Eti-Osa" />
                          {renderError('lga', errors)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Area / Neighborhood</label>
                          <input type="text" value={data.location.area} onChange={e => updateSection('location', 'area', e.target.value)} onBlur={() => handleBlur('area')} className="w-full px-4 py-4 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-brand-fresh)] focus:ring-1 focus:ring-[var(--color-brand-fresh)] text-[var(--color-text-primary)] transition-all" placeholder="e.g. Lekki Phase 1" />
                          {renderError('area', errors)}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Estate Name <span className="text-stone-400 font-normal">(Optional)</span></label>
                          <input type="text" value={data.location.estate} onChange={e => updateSection('location', 'estate', e.target.value)} className="w-full px-4 py-4 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-brand-fresh)] focus:ring-1 focus:ring-[var(--color-brand-fresh)] text-[var(--color-text-primary)] transition-all" placeholder="e.g. 1004 Estate" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Years Lived/Known Here</label>
                        <input type="number" min="0" value={data.location.years_lived} onChange={e => updateSection('location', 'years_lived', e.target.value)} onBlur={() => handleBlur('years_lived')} className="w-full md:w-1/2 px-4 py-4 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-brand-fresh)] focus:ring-1 focus:ring-[var(--color-brand-fresh)] text-[var(--color-text-primary)] transition-all" placeholder="e.g. 3" />
                        {renderError('years_lived', errors)}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">Relationship to Area</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {RELATIONSHIPS.map(rel => (
                            <RadioRow 
                              key={rel}
                              label={rel}
                              selected={data.location.relationship === rel}
                              onClick={() => {
                                updateSection('location', 'relationship', rel);
                                handleBlur('relationship');
                              }}
                            />
                          ))}
                        </div>
                        {renderError('relationship', errors)}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: AREA EXPERIENCE */}
                  {currentStep === 2 && (
                    <div className="space-y-10">
                      <div className="mb-6">
                        <div className="text-xs font-semibold text-[var(--color-brand-fresh)] uppercase tracking-wider mb-2">Step 02</div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-2">How would you describe everyday life in this area?</h2>
                        <p className="text-[var(--color-text-secondary)]">Rate each aspect based on your own experience. 5 is Excellent, 1 is Poor.</p>
                        {renderError('ratings', errors)}
                      </div>

                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
                        <h3 className="text-xs font-semibold tracking-widest text-[var(--color-text-secondary)] uppercase bg-stone-50 py-2 px-4 rounded-md mb-2">Safety</h3>
                        <div className="px-2">
                          <StarRating label="Security" value={data.ratings.security} onChange={v => updateSection('ratings', 'security', v)} />
                          <StarRating label="Night Safety" value={data.ratings.night_safety} onChange={v => updateSection('ratings', 'night_safety', v)} />
                          <StarRating label="Noise" value={data.ratings.noise} onChange={v => updateSection('ratings', 'noise', v)} />
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-2">
                        <h3 className="text-xs font-semibold tracking-widest text-[var(--color-text-secondary)] uppercase bg-stone-50 py-2 px-4 rounded-md mb-2">Essential Services</h3>
                        <div className="px-2">
                          <StarRating label="Electricity" value={data.ratings.electricity} onChange={v => updateSection('ratings', 'electricity', v)} />
                          <StarRating label="Water" value={data.ratings.water} onChange={v => updateSection('ratings', 'water', v)} />
                          <StarRating label="Internet" value={data.ratings.internet} onChange={v => updateSection('ratings', 'internet', v)} />
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-2">
                        <h3 className="text-xs font-semibold tracking-widest text-[var(--color-text-secondary)] uppercase bg-stone-50 py-2 px-4 rounded-md mb-2">Roads & Environment</h3>
                        <div className="px-2">
                          <StarRating label="Roads" value={data.ratings.roads} onChange={v => updateSection('ratings', 'roads', v)} />
                          <StarRating label="Drainage" value={data.ratings.drainage} onChange={v => updateSection('ratings', 'drainage', v)} />
                          <StarRating label="Flooding" value={data.ratings.flooding} onChange={v => updateSection('ratings', 'flooding', v)} />
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-2">
                        <h3 className="text-xs font-semibold tracking-widest text-[var(--color-text-secondary)] uppercase bg-stone-50 py-2 px-4 rounded-md mb-2">Community Amenities</h3>
                        <div className="px-2">
                          <StarRating label="Schools" value={data.ratings.schools} onChange={v => updateSection('ratings', 'schools', v)} />
                          <StarRating label="Hospitals" value={data.ratings.hospitals} onChange={v => updateSection('ratings', 'hospitals', v)} />
                          <StarRating label="Markets" value={data.ratings.markets} onChange={v => updateSection('ratings', 'markets', v)} />
                          <StarRating label="Banks" value={data.ratings.banks} onChange={v => updateSection('ratings', 'banks', v)} />
                        </div>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="space-y-2">
                        <h3 className="text-xs font-semibold tracking-widest text-[var(--color-text-secondary)] uppercase bg-stone-50 py-2 px-4 rounded-md mb-2">Transport</h3>
                        <div className="px-2">
                          <StarRating label="Public Transport" value={data.ratings.public_transport} onChange={v => updateSection('ratings', 'public_transport', v)} />
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* STEP 3: HOUSING INFO */}
                  {currentStep === 3 && (
                    <div className="space-y-8">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <div className="text-xs font-semibold text-[var(--color-brand-fresh)] uppercase tracking-wider mb-2">Step 03</div>
                          <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-2">What is the housing experience like?</h2>
                          <p className="text-[var(--color-text-secondary)]">Share what you have observed about housing availability, cost and access in the area.</p>
                        </div>
                        <div className="hidden sm:block w-24 h-24 shrink-0 -mt-2 -mr-2">
                          <AbstractIllustration type="housing" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Typical Rent</label>
                          <input type="text" value={data.housing.typical_rent} onChange={e => updateSection('housing', 'typical_rent', e.target.value)} onBlur={() => handleBlur('typical_rent')} className="w-full px-4 py-4 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-brand-fresh)] focus:ring-1 focus:ring-[var(--color-brand-fresh)] text-[var(--color-text-primary)] transition-all" placeholder="e.g. ₦3,000,000 / year" />
                          {renderError('typical_rent', errors)}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Common Property Type</label>
                          <div className="relative">
                            <select value={data.housing.property_type} onChange={e => updateSection('housing', 'property_type', e.target.value)} onBlur={() => handleBlur('property_type')} className="w-full px-4 py-4 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface-light)] focus:outline-none focus:border-[var(--color-brand-fresh)] focus:ring-1 focus:ring-[var(--color-brand-fresh)] text-[var(--color-text-primary)] appearance-none transition-all">
                              <option value="" disabled>Select property type...</option>
                              <option value="Apartments/Flats">Apartments / Flats</option>
                              <option value="Duplexes">Duplexes</option>
                              <option value="Bungalows">Bungalows</option>
                              <option value="Terraces">Terraces</option>
                              <option value="Mixed">Mixed</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                              <ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                          {renderError('property_type', errors)}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">Housing Availability</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {["Plentiful", "Moderate", "Scarce"].map(opt => (
                              <RadioRow key={opt} label={opt} selected={data.housing.availability === opt} onClick={() => { updateSection('housing', 'availability', opt); handleBlur('availability'); }} />
                            ))}
                          </div>
                          {renderError('availability', errors)}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">Ease of Finding Accommodation</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {["Very Easy", "Moderate", "Difficult"].map(opt => (
                              <RadioRow key={opt} label={opt} selected={data.housing.ease_of_finding === opt} onClick={() => { updateSection('housing', 'ease_of_finding', opt); handleBlur('ease_of_finding'); }} />
                            ))}
                          </div>
                          {renderError('ease_of_finding', errors)}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">Rent Change Experience</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {["Increasing Rapidly", "Stable / Slow Increase", "Decreasing"].map(opt => (
                              <RadioRow key={opt} label={opt} selected={data.housing.rent_change === opt} onClick={() => { updateSection('housing', 'rent_change', opt); handleBlur('rent_change'); }} />
                            ))}
                          </div>
                          {renderError('rent_change', errors)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: COMMUNITY EXPERIENCE */}
                  {currentStep === 4 && (
                    <div className="space-y-8">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <div className="text-xs font-semibold text-[var(--color-brand-fresh)] uppercase tracking-wider mb-2">Step 04</div>
                          <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-2">What should people know about this area?</h2>
                          <p className="text-[var(--color-text-secondary)]">Your personal insights can be incredibly valuable to someone moving here.</p>
                        </div>
                        <div className="hidden sm:block w-24 h-24 shrink-0 -mt-2 -mr-2">
                          <AbstractIllustration type="community" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3">Would You Recommend The Area?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <RadioRow type="yes" label="Yes" selected={data.community.recommend === "Yes"} onClick={() => { updateSection('community', 'recommend', 'Yes'); handleBlur('recommend'); }} />
                          <RadioRow type="maybe" label="Maybe" selected={data.community.recommend === "Maybe"} onClick={() => { updateSection('community', 'recommend', 'Maybe'); handleBlur('recommend'); }} />
                          <RadioRow type="no" label="No" selected={data.community.recommend === "No"} onClick={() => { updateSection('community', 'recommend', 'No'); handleBlur('recommend'); }} />
                        </div>
                        {renderError('recommend', errors)}
                      </div>

                      <div className="space-y-6 pt-6 border-t border-[var(--color-border)]">
                        <TextareaRow label="Best Thing About The Area" value={data.community.best_thing} onChange={v => updateSection('community', 'best_thing', v)} />
                        <TextareaRow label="Biggest Challenge" value={data.community.biggest_challenge} onChange={v => updateSection('community', 'biggest_challenge', v)} />
                        <TextareaRow label="Suggestion For Improvement" value={data.community.suggestion} onChange={v => updateSection('community', 'suggestion', v)} />
                      </div>
                    </div>
                  )}

                  {/* STEP 5: REVIEW & CONSENT */}
                  {currentStep === 5 && (
                    <div className="space-y-8">
                      <div className="mb-8">
                        <div className="text-xs font-semibold text-[var(--color-brand-fresh)] uppercase tracking-wider mb-2">Step 05</div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--color-text-primary)] mb-2">Review your area insights.</h2>
                        <p className="text-[var(--color-text-secondary)]">Take a moment to make sure your information is accurate before submitting.</p>
                      </div>

                      <div className="space-y-8">
                        {/* Location Review */}
                        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                          <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-200">
                            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Location</h3>
                            <button type="button" onClick={() => handleEdit(1)} className="text-[var(--color-brand-fresh)] text-sm font-semibold hover:underline flex items-center gap-1">Edit <ChevronRight className="w-3 h-3"/></button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(data.location).map(([k, v]) => v && (
                              <div key={k}>
                                <div className="text-xs text-[var(--color-text-secondary)] capitalize mb-0.5">{k.replace('_', ' ')}</div>
                                <div className="font-semibold text-sm text-[var(--color-text-primary)]">{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Area Experience Review */}
                        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                          <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-200">
                            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Area Experience</h3>
                            <button type="button" onClick={() => handleEdit(2)} className="text-[var(--color-brand-fresh)] text-sm font-semibold hover:underline flex items-center gap-1">Edit <ChevronRight className="w-3 h-3"/></button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4">
                            {Object.entries(data.ratings).map(([k, v]) => v > 0 && (
                              <div key={k}>
                                <div className="text-xs text-[var(--color-text-secondary)] capitalize mb-1">{k.replace('_', ' ')}</div>
                                <div className="flex items-center text-[var(--color-brand-fresh)] gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < v ? 'fill-current' : 'text-stone-300'}`} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Housing Info Review */}
                        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                          <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-200">
                            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Housing Information</h3>
                            <button type="button" onClick={() => handleEdit(3)} className="text-[var(--color-brand-fresh)] text-sm font-semibold hover:underline flex items-center gap-1">Edit <ChevronRight className="w-3 h-3"/></button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(data.housing).map(([k, v]) => v && (
                              <div key={k}>
                                <div className="text-xs text-[var(--color-text-secondary)] capitalize mb-0.5">{k.replace(/_/g, ' ')}</div>
                                <div className="font-semibold text-sm text-[var(--color-text-primary)]">{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Community Review */}
                        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
                          <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-200">
                            <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Community Experience</h3>
                            <button type="button" onClick={() => handleEdit(4)} className="text-[var(--color-brand-fresh)] text-sm font-semibold hover:underline flex items-center gap-1">Edit <ChevronRight className="w-3 h-3"/></button>
                          </div>
                          <div className="space-y-4">
                            <div>
                               <div className="text-xs text-[var(--color-text-secondary)] capitalize mb-0.5">Recommend</div>
                               <div className="font-semibold text-sm text-[var(--color-text-primary)]">{data.community.recommend}</div>
                            </div>
                            {['best_thing', 'biggest_challenge', 'suggestion'].map(k => {
                              const val = data.community[k as keyof CommunityData];
                              if (!val) return null;
                              return (
                                <div key={k}>
                                  <div className="text-xs text-[var(--color-text-secondary)] capitalize mb-0.5">{k.replace(/_/g, ' ')}</div>
                                  <div className="font-semibold text-sm text-[var(--color-text-primary)] italic">"{val}"</div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Consent & Submit */}
                      <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
                        <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-6">Consent</h3>
                        
                        <div className="space-y-4 mb-8">
                          <label className="flex items-start group cursor-pointer p-4 border border-[var(--color-border)] rounded-[18px] bg-white hover:border-[var(--color-brand-fresh)] transition-colors">
                            <div className="relative flex items-center justify-center mt-0.5">
                              <input 
                                type="checkbox" 
                                className="sr-only"
                                checked={data.consent.accurate}
                                onChange={(e) => updateSection('consent', 'accurate', e.target.checked)}
                              />
                              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${data.consent.accurate ? 'bg-[var(--color-brand-fresh)] border-[var(--color-brand-fresh)] text-white' : 'border-stone-300 group-hover:border-[var(--color-brand-fresh)]'}`}>
                                {data.consent.accurate && <Check className="w-4 h-4" strokeWidth={3} />}
                              </div>
                            </div>
                            <span className="ml-4 text-sm font-semibold text-[var(--color-text-primary)] leading-tight pt-0.5">
                              I confirm that the information provided is accurate to the best of my knowledge.
                            </span>
                          </label>

                          <label className="flex items-start group cursor-pointer p-4 border border-[var(--color-border)] rounded-[18px] bg-white hover:border-[var(--color-brand-fresh)] transition-colors">
                            <div className="relative flex items-center justify-center mt-0.5">
                              <input 
                                type="checkbox" 
                                className="sr-only"
                                checked={data.consent.use_anonymously}
                                onChange={(e) => updateSection('consent', 'use_anonymously', e.target.checked)}
                              />
                              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${data.consent.use_anonymously ? 'bg-[var(--color-brand-fresh)] border-[var(--color-brand-fresh)] text-white' : 'border-stone-300 group-hover:border-[var(--color-brand-fresh)]'}`}>
                                {data.consent.use_anonymously && <Check className="w-4 h-4" strokeWidth={3} />}
                              </div>
                            </div>
                            <span className="ml-4 text-sm font-semibold text-[var(--color-text-primary)] leading-tight pt-0.5">
                              I allow Unity Homes to use this information anonymously to improve Area Intelligence.
                            </span>
                          </label>
                        </div>

                        {submitError && (
                          <div className="mb-6 p-4 bg-[#FDEDED] border border-[#F5C2C7] rounded-[18px] text-[#842029] text-sm font-semibold">
                            {submitError}
                          </div>
                        )}

                        <button
                          onClick={handleSubmit}
                          disabled={!data.consent.accurate || !data.consent.use_anonymously || isSubmitting}
                          className="w-full bg-[var(--color-brand-fresh)] text-white px-6 py-4 rounded-[18px] font-semibold text-lg hover:bg-[var(--color-brand-medium)] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="animate-spin w-5 h-5 mr-2" />
                              Processing...
                            </>
                          ) : (
                            'SUBMIT AREA INSIGHTS'
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

              {/* CONTROLS (Back / Next) */}
              {currentStep < 5 && (
                <div className="relative z-10 flex justify-between items-center mt-10 pt-6 border-t border-[var(--color-border)]">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-semibold transition-colors px-4 py-2 min-h-[48px]"
                    >
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      Back
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center bg-[var(--color-brand-fresh)] text-white px-8 py-3 rounded-[18px] font-semibold hover:bg-[var(--color-brand-medium)] transition-all duration-200 min-h-[48px] shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
