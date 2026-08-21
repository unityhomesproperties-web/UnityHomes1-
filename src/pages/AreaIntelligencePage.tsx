import React, { useState, useEffect, FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Star } from 'lucide-react';
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

// Reusable Star Rating Component
const StarRating = ({ value, onChange, label }: { value: number, onChange: (val: number) => void, label: string }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[var(--color-border)] rounded-[var(--radius-button)] bg-[var(--color-white)] hover:border-[var(--color-secondary-green)] transition-colors">
      <span className="font-semibold text-[var(--color-primary-text)] mb-2 sm:mb-0 capitalize">{label.replace(/_/g, ' ')}</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-1 min-h-[48px] min-w-[48px] sm:min-h-0 sm:min-w-0 flex items-center justify-center focus:outline-none"
          >
            <Star
              className={`w-8 h-8 sm:w-6 sm:h-6 transition-colors ${
                star <= (hover || value) ? 'fill-[var(--color-accent-gold)] text-[var(--color-accent-gold)]' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default function AreaIntelligencePage() {
  const [data, setData] = useState<AIData>(() => {
    const saved = localStorage.getItem('unity_ai_autosave');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalSteps = 5;

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
      // Validate at least some ratings are filled, or force all? Let's just encourage completion.
      // We will ensure at least one rating is provided.
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
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
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
    if (currentStep !== 5) return;
    
    if (!data.consent.accurate || !data.consent.use_anonymously) {
      setSubmitError("You must agree to both consent statements to submit.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
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
      return <p className="text-[var(--color-error)] text-sm mt-1">{errors[field]}</p>;
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

  return (
    <div className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto min-h-screen">
      <div className="mb-10 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-[var(--color-primary-green)] mb-4">Help Build Better Area Intelligence</h1>
        <p className="text-[var(--color-secondary-text)]">Share real information about your neighbourhood to help people make better property decisions.</p>
        <p className="text-sm font-semibold text-[var(--color-accent-gold)] mt-2">Estimated time: 3 to 4 minutes</p>
        
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
          
          {/* STEP 1: LOCATION */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-primary-text)] mb-6 pb-4 border-b border-[var(--color-border)]">Location Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">State</label>
                  <input type="text" value={data.location.state} onChange={e => updateSection('location', 'state', e.target.value)} onBlur={() => handleBlur('state')} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]" placeholder="e.g. Lagos" />
                  {renderError('state', errors)}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">LGA (Local Govt Area)</label>
                  <input type="text" value={data.location.lga} onChange={e => updateSection('location', 'lga', e.target.value)} onBlur={() => handleBlur('lga')} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]" placeholder="e.g. Eti-Osa" />
                  {renderError('lga', errors)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Area / Neighborhood</label>
                <input type="text" value={data.location.area} onChange={e => updateSection('location', 'area', e.target.value)} onBlur={() => handleBlur('area')} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]" placeholder="e.g. Lekki Phase 1" />
                {renderError('area', errors)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Estate Name (Optional)</label>
                <input type="text" value={data.location.estate} onChange={e => updateSection('location', 'estate', e.target.value)} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]" placeholder="e.g. 1004 Estate" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Years Lived/Known Here</label>
                  <input type="number" min="0" value={data.location.years_lived} onChange={e => updateSection('location', 'years_lived', e.target.value)} onBlur={() => handleBlur('years_lived')} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]" placeholder="e.g. 3" />
                  {renderError('years_lived', errors)}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Relationship to Area</label>
                  <select value={data.location.relationship} onChange={e => updateSection('location', 'relationship', e.target.value)} onBlur={() => handleBlur('relationship')} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]">
                    <option value="" disabled>Select relationship...</option>
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {renderError('relationship', errors)}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AREA EXPERIENCE */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-primary-text)] mb-2 pb-4 border-b border-[var(--color-border)]">Area Experience</h2>
              <p className="text-sm text-[var(--color-secondary-text)] mb-6">Rate the following aspects from 1 (Very Poor) to 5 (Excellent). Leave blank if you don't know.</p>
              
              {renderError('ratings', errors)}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(INITIAL_DATA.ratings).map(key => (
                  <StarRating 
                    key={key}
                    label={key}
                    value={data.ratings[key as keyof RatingsData]}
                    onChange={(val) => updateSection('ratings', key, val)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: HOUSING INFORMATION */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-primary-text)] mb-6 pb-4 border-b border-[var(--color-border)]">Housing Information</h2>
              
              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Typical Rent for a 2-Bedroom (Estimated)</label>
                <input type="text" value={data.housing.typical_rent} onChange={e => updateSection('housing', 'typical_rent', e.target.value)} onBlur={() => handleBlur('typical_rent')} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]" placeholder="e.g. ₦3,000,000" />
                {renderError('typical_rent', errors)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Common Property Type</label>
                <select value={data.housing.property_type} onChange={e => updateSection('housing', 'property_type', e.target.value)} onBlur={() => handleBlur('property_type')} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]">
                  <option value="" disabled>Select property type...</option>
                  <option>Apartments / Flats</option>
                  <option>Detached Duplexes</option>
                  <option>Semi-Detached Duplexes</option>
                  <option>Terraces</option>
                  <option>Bungalows</option>
                  <option>Mixed</option>
                </select>
                {renderError('property_type', errors)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Housing Availability</label>
                <select value={data.housing.availability} onChange={e => updateSection('housing', 'availability', e.target.value)} onBlur={() => handleBlur('availability')} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]">
                  <option value="" disabled>Select availability...</option>
                  <option>Very High (Many vacant properties)</option>
                  <option>Average (Standard turnover)</option>
                  <option>Low (Rarely available)</option>
                </select>
                {renderError('availability', errors)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Ease of Finding Accommodation</label>
                <select value={data.housing.ease_of_finding} onChange={e => updateSection('housing', 'ease_of_finding', e.target.value)} onBlur={() => handleBlur('ease_of_finding')} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]">
                  <option value="" disabled>Select ease...</option>
                  <option>Very Easy</option>
                  <option>Moderate</option>
                  <option>Difficult (High competition)</option>
                </select>
                {renderError('ease_of_finding', errors)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Rent Change Experience (Past 2 Years)</label>
                <select value={data.housing.rent_change} onChange={e => updateSection('housing', 'rent_change', e.target.value)} onBlur={() => handleBlur('rent_change')} className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]">
                  <option value="" disabled>Select experience...</option>
                  <option>Increased Significantly (&gt; 30%)</option>
                  <option>Increased Moderately (10% - 30%)</option>
                  <option>Stayed About the Same</option>
                  <option>Decreased</option>
                </select>
                {renderError('rent_change', errors)}
              </div>
            </div>
          )}

          {/* STEP 4: COMMUNITY EXPERIENCE */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-primary-text)] mb-6 pb-4 border-b border-[var(--color-border)]">Community Experience</h2>
              
              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-4">Would you recommend this area to a friend?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {RECOMMENDATIONS.map(rec => (
                    <label key={rec} className={`flex items-center justify-center p-4 border rounded-[var(--radius-button)] cursor-pointer transition-colors ${data.community.recommend === rec ? 'border-[var(--color-primary-green)] bg-[var(--color-primary-green)] text-[var(--color-white)]' : 'border-[var(--color-border)] hover:bg-[var(--color-background)] text-[var(--color-primary-text)]'}`}>
                      <input 
                        type="radio" 
                        name="recommend"
                        className="hidden"
                        checked={data.community.recommend === rec}
                        onChange={() => updateSection('community', 'recommend', rec)}
                        onBlur={() => handleBlur('recommend')}
                      />
                      <span className="font-bold">{rec}</span>
                    </label>
                  ))}
                </div>
                {renderError('recommend', errors)}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Best Thing About The Area (Optional)</label>
                <textarea 
                  maxLength={250}
                  value={data.community.best_thing}
                  onChange={e => updateSection('community', 'best_thing', e.target.value)}
                  className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)] resize-none"
                  rows={3}
                  placeholder="What do you love most?"
                />
                <div className="text-right text-xs text-[var(--color-secondary-text)] mt-1">{data.community.best_thing.length}/250</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Biggest Challenge (Optional)</label>
                <textarea 
                  maxLength={250}
                  value={data.community.biggest_challenge}
                  onChange={e => updateSection('community', 'biggest_challenge', e.target.value)}
                  className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)] resize-none"
                  rows={3}
                  placeholder="What is the hardest part about living here?"
                />
                <div className="text-right text-xs text-[var(--color-secondary-text)] mt-1">{data.community.biggest_challenge.length}/250</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Suggestion For Improvement (Optional)</label>
                <textarea 
                  maxLength={250}
                  value={data.community.suggestion}
                  onChange={e => updateSection('community', 'suggestion', e.target.value)}
                  className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)] resize-none"
                  rows={3}
                  placeholder="How could the area be better?"
                />
                <div className="text-right text-xs text-[var(--color-secondary-text)] mt-1">{data.community.suggestion.length}/250</div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {currentStep === 5 && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-xl font-bold text-[var(--color-primary-text)] pb-4 border-b border-[var(--color-border)]">Review Your Insights</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full">
                    <div className="col-span-2"><h3 className="text-sm font-bold text-[var(--color-secondary-text)] uppercase tracking-wider">Location</h3></div>
                    {Object.entries(data.location).map(([k, v]) => v && (
                      <div key={k}>
                        <span className="block text-sm text-[var(--color-secondary-text)] capitalize">{k.replace('_', ' ')}</span>
                        <span className="block font-medium text-[var(--color-primary-text)]">{v}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-[var(--color-secondary-green)] text-sm font-semibold hover:underline">Edit</button>
                </div>

                <div className="flex justify-between items-start pt-4 border-t border-[var(--color-border)]">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full">
                    <div className="col-span-2"><h3 className="text-sm font-bold text-[var(--color-secondary-text)] uppercase tracking-wider">Ratings</h3></div>
                    {Object.entries(data.ratings).map(([k, v]) => v > 0 && (
                      <div key={k}>
                        <span className="block text-sm text-[var(--color-secondary-text)] capitalize">{k.replace('_', ' ')}</span>
                        <div className="flex text-[var(--color-accent-gold)]">
                          {[...Array(v)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-[var(--color-secondary-green)] text-sm font-semibold hover:underline">Edit</button>
                </div>

                <div className="flex justify-between items-start pt-4 border-t border-[var(--color-border)]">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full">
                    <div className="col-span-2"><h3 className="text-sm font-bold text-[var(--color-secondary-text)] uppercase tracking-wider">Housing Information</h3></div>
                    {Object.entries(data.housing).map(([k, v]) => v && (
                      <div key={k} className="col-span-2">
                        <span className="block text-sm text-[var(--color-secondary-text)] capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="block font-medium text-[var(--color-primary-text)]">{v}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setCurrentStep(3)} className="text-[var(--color-secondary-green)] text-sm font-semibold hover:underline">Edit</button>
                </div>
                
                <div className="flex justify-between items-start pt-4 border-t border-[var(--color-border)]">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full">
                    <div className="col-span-2"><h3 className="text-sm font-bold text-[var(--color-secondary-text)] uppercase tracking-wider">Community Experience</h3></div>
                    {Object.entries(data.community).map(([k, v]) => v && (
                      <div key={k} className="col-span-2">
                        <span className="block text-sm text-[var(--color-secondary-text)] capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="block font-medium text-[var(--color-primary-text)]">{v}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setCurrentStep(4)} className="text-[var(--color-secondary-green)] text-sm font-semibold hover:underline">Edit</button>
                </div>
              </div>

              {submitError && (
                <div className="p-4 bg-[#FDEDED] border border-[#F5C2C7] rounded-[var(--radius-card)] text-[#842029]">
                  {submitError}
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-[var(--color-border)] space-y-4">
                <label className="flex items-start cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={data.consent.accurate}
                    onChange={(e) => updateSection('consent', 'accurate', e.target.checked)}
                    className="mt-1 w-5 h-5 text-[var(--color-secondary-green)] border-gray-300 rounded focus:ring-[var(--color-secondary-green)]"
                  />
                  <span className="ml-3 font-semibold text-[var(--color-primary-text)]">
                    I confirm that the information provided is accurate to the best of my knowledge.
                  </span>
                </label>
                
                <label className="flex items-start cursor-pointer mb-8">
                  <input 
                    type="checkbox" 
                    checked={data.consent.use_anonymously}
                    onChange={(e) => updateSection('consent', 'use_anonymously', e.target.checked)}
                    className="mt-1 w-5 h-5 text-[var(--color-secondary-green)] border-gray-300 rounded focus:ring-[var(--color-secondary-green)]"
                  />
                  <span className="ml-3 font-semibold text-[var(--color-primary-text)]">
                    I allow Unity Homes to use this information anonymously to improve Area Intelligence.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!data.consent.accurate || !data.consent.use_anonymously || isSubmitting}
                  className="w-full bg-[var(--color-accent-gold)] text-[var(--color-primary-green)] px-6 py-4 rounded-[var(--radius-button)] font-bold text-lg hover:opacity-90 transition-opacity min-h-[48px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Submit Area Insights'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Controls */}
          {currentStep < 5 && (
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
                <div />
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
