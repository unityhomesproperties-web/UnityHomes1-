import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, ArrowLeft, Star, MapPin, Check } from 'lucide-react';

export default function AreaIntelligencePage() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<any>(() => {
    const saved = localStorage.getItem('unityAreaIntelligenceDraft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      location: {
        state: '',
        lga: '',
        area: '',
        estate: '',
        yearsLived: '',
        relationship: ''
      },
      ratings: {
        Security: 0,
        Electricity: 0,
        Water: 0,
        RoadCondition: 0,
        Drainage: 0,
        Flooding: 0,
        Internet: 0,
        Schools: 0,
        Hospitals: 0,
        Markets: 0,
        Banks: 0,
        PublicTransport: 0,
        NoiseLevel: 0,
        NightSafety: 0
      },
      housing: {
        typicalRent: '',
        propertyType: '',
        availability: '',
        easeOfFinding: '',
        rentIncreases: ''
      },
      experience: {
        recommend: '',
        bestThing: '',
        biggestChallenge: '',
        improvements: ''
      },
      consent: {
        accurate: false,
        anonymous: false
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('unityAreaIntelligenceDraft', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    // Clear error for this field if it exists
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`${section}.${field}`];
        return next;
      });
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.location.state) newErrors['location.state'] = 'State is required';
      if (!formData.location.lga) newErrors['location.lga'] = 'LGA is required';
      if (!formData.location.area) newErrors['location.area'] = 'Area is required';
      if (!formData.location.yearsLived) newErrors['location.yearsLived'] = 'Years lived is required';
      if (!formData.location.relationship) newErrors['location.relationship'] = 'Relationship is required';
    } else if (currentStep === 2) {
      // Optional: require all ratings to be > 0, but let's allow 0 as unrated or require them.
      // The prompt says "1-5", we can require them.
      const ratingFields = ['Security', 'Electricity', 'Water', 'RoadCondition', 'Drainage', 'Flooding', 'Internet', 'Schools', 'Hospitals', 'Markets', 'Banks', 'PublicTransport', 'NoiseLevel', 'NightSafety'];
      ratingFields.forEach(f => {
        if (formData.ratings[f] === 0) newErrors[`ratings.${f}`] = 'Please rate this aspect';
      });
    } else if (currentStep === 3) {
      if (!formData.housing.typicalRent) newErrors['housing.typicalRent'] = 'Typical rent is required';
      if (!formData.housing.propertyType) newErrors['housing.propertyType'] = 'Property type is required';
      if (!formData.housing.availability) newErrors['housing.availability'] = 'Availability is required';
      if (!formData.housing.easeOfFinding) newErrors['housing.easeOfFinding'] = 'Ease of finding is required';
      if (!formData.housing.rentIncreases) newErrors['housing.rentIncreases'] = 'Rent increases information is required';
    } else if (currentStep === 4) {
      if (!formData.experience.recommend) newErrors['experience.recommend'] = 'Please tell us if you recommend this area';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(s => Math.min(5, s + 1));
    }
  };
  
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => Math.max(1, s - 1));
  };

  const submitForm = () => {
    if (!formData.consent.accurate || !formData.consent.anonymous) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      localStorage.removeItem('unityAreaIntelligenceDraft');
    }, 1500);
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const inputClass = (err?: string) => `w-full h-14 bg-white border ${err ? 'border-red-500' : 'border-[rgba(0,108,37,.08)]'} rounded-xl px-4 text-[#10341D] placeholder:text-[#5F6F63] focus:outline-none focus:border-[#0E2F1F] focus:ring-1 focus:ring-[#0E2F1F] transition-all`;
  const labelClass = "block text-sm font-semibold text-[#10341D] mb-2";
  const helperClass = "block text-xs text-[#5F6F63] mt-1.5";
  const errorClass = "block text-xs text-red-500 mt-1.5";

  const renderProgress = () => {
    const steps = ['Location', 'Area Ratings', 'Housing Information', 'Community Experience', 'Review & Submit'];
    return (
      <div className="w-full max-w-4xl mx-auto mb-10 px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[rgba(0,108,37,.08)] z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#0E2F1F] z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
          
          {steps.map((s, idx) => {
            const sIdx = idx + 1;
            const isCompleted = step > sIdx;
            const isCurrent = step === sIdx;
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2 bg-[#F4F8F4] px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-[#0E2F1F] border-[#0E2F1F] text-white' :
                  isCurrent ? 'bg-[#F4F8F4] border-[#0E2F1F] text-[#0E2F1F]' :
                  'bg-white border-[rgba(0,108,37,.08)] text-[#5F6F63]'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-[#0E2F1F]"></div> : <div className="w-2.5 h-2.5 rounded-full bg-transparent border border-[rgba(0,108,37,.08)]"></div>}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:block ${
                  isCurrent || isCompleted ? 'text-[#10341D]' : 'text-[#5F6F63]'
                }`}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 max-w-2xl mx-auto bg-white p-8 rounded-[var(--radius-large)] shadow-sm border border-[rgba(0,108,37,.08)]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>State</label>
          <select value={formData.location.state} onChange={e => updateFormData('location', 'state', e.target.value)} className={inputClass(errors['location.state'])}>
            <option value="">Select State</option>
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja</option>
            <option value="Rivers">Rivers</option>
            <option value="Ogun">Ogun</option>
            <option value="Other">Other</option>
          </select>
          {errors['location.state'] && <span className={errorClass}>{errors['location.state']}</span>}
        </div>
        <div>
          <label className={labelClass}>LGA</label>
          <input type="text" value={formData.location.lga} onChange={e => updateFormData('location', 'lga', e.target.value)} placeholder="E.g. Eti-Osa" className={inputClass(errors['location.lga'])} />
          {errors['location.lga'] && <span className={errorClass}>{errors['location.lga']}</span>}
        </div>
        <div>
          <label className={labelClass}>Area</label>
          <input type="text" value={formData.location.area} onChange={e => updateFormData('location', 'area', e.target.value)} placeholder="E.g. Ikoyi" className={inputClass(errors['location.area'])} />
          {errors['location.area'] && <span className={errorClass}>{errors['location.area']}</span>}
        </div>
        <div>
          <label className={labelClass}>Estate <span className="text-[#5F6F63] font-normal">(Optional)</span></label>
          <input type="text" value={formData.location.estate} onChange={e => updateFormData('location', 'estate', e.target.value)} placeholder="E.g. Banana Island" className={inputClass()} />
        </div>
        <div>
          <label className={labelClass}>Years lived there</label>
          <select value={formData.location.yearsLived} onChange={e => updateFormData('location', 'yearsLived', e.target.value)} className={inputClass(errors['location.yearsLived'])}>
            <option value="">Select duration</option>
            <option value="Less than 1 year">Less than 1 year</option>
            <option value="1-3 years">1-3 years</option>
            <option value="3-5 years">3-5 years</option>
            <option value="5+ years">5+ years</option>
          </select>
          {errors['location.yearsLived'] && <span className={errorClass}>{errors['location.yearsLived']}</span>}
        </div>
        <div>
          <label className={labelClass}>Relationship to the area</label>
          <select value={formData.location.relationship} onChange={e => updateFormData('location', 'relationship', e.target.value)} className={inputClass(errors['location.relationship'])}>
            <option value="">Select relationship</option>
            <option value="Resident">Resident</option>
            <option value="Former Resident">Former Resident</option>
            <option value="Landlord">Landlord</option>
            <option value="Property Manager">Property Manager</option>
            <option value="Property Professional">Property Professional</option>
            <option value="Visitor">Visitor</option>
          </select>
          {errors['location.relationship'] && <span className={errorClass}>{errors['location.relationship']}</span>}
        </div>
      </div>
      <div className="pt-6 border-t border-[rgba(0,108,37,.08)] flex justify-end">
        <button onClick={nextStep} className="h-14 px-8 rounded-full bg-[#0E2F1F] text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => {
    const ratingFields = [
      { id: 'Security', label: 'Security' },
      { id: 'Electricity', label: 'Electricity' },
      { id: 'Water', label: 'Water' },
      { id: 'RoadCondition', label: 'Road Condition' },
      { id: 'Drainage', label: 'Drainage' },
      { id: 'Flooding', label: 'Flooding' },
      { id: 'Internet', label: 'Internet' },
      { id: 'Schools', label: 'Schools' },
      { id: 'Hospitals', label: 'Hospitals' },
      { id: 'Markets', label: 'Markets' },
      { id: 'Banks', label: 'Banks' },
      { id: 'PublicTransport', label: 'Public Transport' },
      { id: 'NoiseLevel', label: 'Noise Level' },
      { id: 'NightSafety', label: 'Night Safety' }
    ];

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 max-w-3xl mx-auto bg-white p-8 rounded-[var(--radius-large)] shadow-sm border border-[rgba(0,108,37,.08)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {ratingFields.map(field => (
            <div key={field.id} className="flex flex-col gap-2">
              <label className={labelClass}>{field.label}</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => updateFormData('ratings', field.id, star)}
                    className={`transition-colors p-1 ${formData.ratings[field.id] >= star ? 'text-[#6FBE45]' : 'text-[#5F6F63]/30 hover:text-[#6FBE45]/50'}`}
                  >
                    <Star className="w-8 h-8" fill={formData.ratings[field.id] >= star ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              {errors[`ratings.${field.id}`] && <span className={errorClass}>{errors[`ratings.${field.id}`]}</span>}
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-[rgba(0,108,37,.08)] flex justify-between">
          <button onClick={prevStep} className="h-14 px-6 rounded-full border border-[rgba(0,108,37,.08)] text-[#10341D] bg-white hover:bg-[#F4F8F4] transition-all font-semibold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4"/> Back
          </button>
          <button onClick={nextStep} className="h-14 px-8 rounded-full bg-[#0E2F1F] text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
            Next Step <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 max-w-2xl mx-auto bg-white p-8 rounded-[var(--radius-large)] shadow-sm border border-[rgba(0,108,37,.08)]">
      <div className="space-y-6">
        <div>
          <label className={labelClass}>Typical monthly rent</label>
          <input type="text" value={formData.housing.typicalRent} onChange={e => updateFormData('housing', 'typicalRent', e.target.value)} placeholder="e.g. ₦150,000" className={inputClass(errors['housing.typicalRent'])} />
          <span className={helperClass}>Average rent for a standard apartment in this area.</span>
          {errors['housing.typicalRent'] && <span className={errorClass}>{errors['housing.typicalRent']}</span>}
        </div>
        <div>
          <label className={labelClass}>Common property type</label>
          <select value={formData.housing.propertyType} onChange={e => updateFormData('housing', 'propertyType', e.target.value)} className={inputClass(errors['housing.propertyType'])}>
            <option value="">Select type</option>
            <option value="Apartments/Flats">Apartments/Flats</option>
            <option value="Detached Duplex">Detached Duplex</option>
            <option value="Semi-Detached Duplex">Semi-Detached Duplex</option>
            <option value="Bungalow">Bungalow</option>
            <option value="Self-Con/Studio">Self-Con/Studio</option>
          </select>
          <span className={helperClass}>The most prevalent type of housing.</span>
          {errors['housing.propertyType'] && <span className={errorClass}>{errors['housing.propertyType']}</span>}
        </div>
        <div>
          <label className={labelClass}>Housing availability</label>
          <select value={formData.housing.availability} onChange={e => updateFormData('housing', 'availability', e.target.value)} className={inputClass(errors['housing.availability'])}>
            <option value="">Select availability</option>
            <option value="Very Available">Very Available</option>
            <option value="Somewhat Available">Somewhat Available</option>
            <option value="Scarce">Scarce</option>
            <option value="Very Scarce">Very Scarce</option>
          </select>
          <span className={helperClass}>How easy it is to find vacant properties.</span>
          {errors['housing.availability'] && <span className={errorClass}>{errors['housing.availability']}</span>}
        </div>
        <div>
          <label className={labelClass}>Ease of finding accommodation</label>
          <select value={formData.housing.easeOfFinding} onChange={e => updateFormData('housing', 'easeOfFinding', e.target.value)} className={inputClass(errors['housing.easeOfFinding'])}>
            <option value="">Select ease</option>
            <option value="Very Easy">Very Easy</option>
            <option value="Easy">Easy</option>
            <option value="Difficult">Difficult</option>
            <option value="Very Difficult">Very Difficult</option>
          </select>
          <span className={helperClass}>Overall experience of renting or buying.</span>
          {errors['housing.easeOfFinding'] && <span className={errorClass}>{errors['housing.easeOfFinding']}</span>}
        </div>
        <div>
          <label className={labelClass}>Rent increases over recent years</label>
          <select value={formData.housing.rentIncreases} onChange={e => updateFormData('housing', 'rentIncreases', e.target.value)} className={inputClass(errors['housing.rentIncreases'])}>
            <option value="">Select trend</option>
            <option value="Stable">Stable</option>
            <option value="Slight Increase">Slight Increase</option>
            <option value="High Increase">High Increase</option>
            <option value="Unpredictable">Unpredictable</option>
          </select>
          <span className={helperClass}>How rent prices have changed over time.</span>
          {errors['housing.rentIncreases'] && <span className={errorClass}>{errors['housing.rentIncreases']}</span>}
        </div>
      </div>
      <div className="pt-6 border-t border-[rgba(0,108,37,.08)] flex justify-between">
        <button onClick={prevStep} className="h-14 px-6 rounded-full border border-[rgba(0,108,37,.08)] text-[#10341D] bg-white hover:bg-[#F4F8F4] transition-all font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <button onClick={nextStep} className="h-14 px-8 rounded-full bg-[#0E2F1F] text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 max-w-2xl mx-auto bg-white p-8 rounded-[var(--radius-large)] shadow-sm border border-[rgba(0,108,37,.08)]">
      <div className="space-y-6">
        <div>
          <label className={labelClass}>Would you recommend this area?</label>
          <div className="flex gap-4">
            {['Yes', 'Maybe', 'No'].map(opt => (
              <label key={opt} className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border cursor-pointer transition-all ${formData.experience.recommend === opt ? 'bg-[#0E2F1F] text-white border-[#0E2F1F]' : 'border-[rgba(0,108,37,.08)] text-[#10341D] hover:bg-[#F4F8F4]'}`}>
                <input type="radio" name="recommend" value={opt} checked={formData.experience.recommend === opt} onChange={e => updateFormData('experience', 'recommend', e.target.value)} className="hidden" />
                <span className="font-semibold">{opt}</span>
              </label>
            ))}
          </div>
          {errors['experience.recommend'] && <span className={errorClass}>{errors['experience.recommend']}</span>}
        </div>
        <div>
          <label className={labelClass}>Best thing about this area <span className="text-[#5F6F63] font-normal">(Optional)</span></label>
          <textarea 
            value={formData.experience.bestThing} 
            onChange={e => updateFormData('experience', 'bestThing', e.target.value.slice(0, 250))} 
            placeholder="Share the highlights..." 
            className={`${inputClass()} h-24 py-3 resize-none`}
          ></textarea>
          <span className="block text-xs text-right mt-1 text-[#5F6F63]">{formData.experience.bestThing.length}/250</span>
        </div>
        <div>
          <label className={labelClass}>Biggest challenge <span className="text-[#5F6F63] font-normal">(Optional)</span></label>
          <textarea 
            value={formData.experience.biggestChallenge} 
            onChange={e => updateFormData('experience', 'biggestChallenge', e.target.value.slice(0, 250))} 
            placeholder="What needs improvement?" 
            className={`${inputClass()} h-24 py-3 resize-none`}
          ></textarea>
          <span className="block text-xs text-right mt-1 text-[#5F6F63]">{formData.experience.biggestChallenge.length}/250</span>
        </div>
        <div>
          <label className={labelClass}>Suggestions for improvement <span className="text-[#5F6F63] font-normal">(Optional)</span></label>
          <textarea 
            value={formData.experience.improvements} 
            onChange={e => updateFormData('experience', 'improvements', e.target.value.slice(0, 250))} 
            placeholder="Any ideas for making it better?" 
            className={`${inputClass()} h-24 py-3 resize-none`}
          ></textarea>
          <span className="block text-xs text-right mt-1 text-[#5F6F63]">{formData.experience.improvements.length}/250</span>
        </div>
      </div>
      <div className="pt-6 border-t border-[rgba(0,108,37,.08)] flex justify-between">
        <button onClick={prevStep} className="h-14 px-6 rounded-full border border-[rgba(0,108,37,.08)] text-[#10341D] bg-white hover:bg-[#F4F8F4] transition-all font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <button onClick={nextStep} className="h-14 px-8 rounded-full bg-[#0E2F1F] text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
          Next Step <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-2xl mx-auto bg-white p-8 rounded-[var(--radius-large)] shadow-sm border border-[rgba(0,108,37,.08)]">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-[rgba(0,108,37,.08)]">
            <h4 className="font-semibold text-[#10341D]">Location</h4>
            <button onClick={() => setStep(1)} className="text-sm font-semibold text-[#2F8D46] hover:underline">Edit</button>
          </div>
          <p className="text-sm text-[#5F6F63]">
            {formData.location.area || 'N/A'}, {formData.location.lga || 'N/A'}, {formData.location.state || 'N/A'} <br/>
            {formData.location.relationship || 'Resident'} for {formData.location.yearsLived || 'some'} years
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-[rgba(0,108,37,.08)]">
            <h4 className="font-semibold text-[#10341D]">Housing & Feedback</h4>
            <button onClick={() => setStep(3)} className="text-sm font-semibold text-[#2F8D46] hover:underline">Edit</button>
          </div>
          <p className="text-sm text-[#5F6F63]">
            Rent: {formData.housing.typicalRent || 'N/A'} | Type: {formData.housing.propertyType || 'N/A'} <br/>
            Recommend: {formData.experience.recommend || 'N/A'}
          </p>
        </div>

        <div className="pt-6 space-y-4">
          <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl hover:bg-[#F4F8F4] transition-colors border border-transparent hover:border-[rgba(0,108,37,.08)]">
            <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.consent.accurate ? 'bg-[#0E2F1F] border-[#0E2F1F] text-white' : 'border-[rgba(0,108,37,.08)] bg-white group-hover:border-[#0E2F1F]'}`}>
              {formData.consent.accurate && <Check className="w-4 h-4" />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.consent.accurate} onChange={(e) => updateFormData('consent', 'accurate', e.target.checked)} />
            <span className="text-sm text-[#10341D] font-medium leading-relaxed">
              I confirm the information provided is true to the best of my knowledge.
            </span>
          </label>
          
          <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl hover:bg-[#F4F8F4] transition-colors border border-transparent hover:border-[rgba(0,108,37,.08)]">
            <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors ${formData.consent.anonymous ? 'bg-[#0E2F1F] border-[#0E2F1F] text-white' : 'border-[rgba(0,108,37,.08)] bg-white group-hover:border-[#0E2F1F]'}`}>
              {formData.consent.anonymous && <Check className="w-4 h-4" />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.consent.anonymous} onChange={(e) => updateFormData('consent', 'anonymous', e.target.checked)} />
            <span className="text-sm text-[#10341D] font-medium leading-relaxed">
              I allow Unity Homes to use this information anonymously to improve Area Intelligence.
            </span>
          </label>
        </div>
      </div>
      
      <div className="pt-6 border-t border-[rgba(0,108,37,.08)] flex justify-between">
        <button onClick={prevStep} className="h-14 px-6 rounded-full border border-[rgba(0,108,37,.08)] text-[#10341D] bg-white hover:bg-[#F4F8F4] transition-all font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <button 
          onClick={submitForm}
          disabled={!formData.consent.accurate || !formData.consent.anonymous || isSubmitting}
          className="h-14 px-8 rounded-full bg-[#0E2F1F] text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2 active:scale-[0.98] w-[220px] justify-center"
        >
          {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Submit'}
        </button>
      </div>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-lg mx-auto">
      <div className="w-24 h-24 bg-[#E8F3EA] rounded-full flex items-center justify-center mb-8 border border-[#0E2F1F]/10">
        <CheckCircle2 className="w-12 h-12 text-[#2F8D46]" />
      </div>
      <h2 className="text-3xl md:text-4xl font-serif font-semibold text-[#0E2F1F] mb-4">Thank You</h2>
      <p className="text-lg text-[#5F6F63] leading-relaxed mb-10">
        Your contribution will help us build better neighbourhood intelligence for Nigeria.
        Your contribution will help future buyers, renters and landlords make better decisions.
      </p>
      <div className="flex flex-col w-full sm:flex-row items-center justify-center gap-4">
        <button onClick={() => navigateTo('/')} className="w-full sm:w-auto h-14 px-8 rounded-full border border-[rgba(0,108,37,.08)] text-[#10341D] bg-white hover:bg-[#F4F8F4] transition-all font-semibold">
          Return Home
        </button>
        <button onClick={() => { setIsSuccess(false); setStep(1); setFormData({...formData}); }} className="w-full sm:w-auto h-14 px-8 rounded-full bg-[#0E2F1F] text-white font-semibold hover:opacity-90 transition-all">
          Share Area Intelligence
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F4F8F4]">
      {!isSuccess && (
        <header className="pt-16 pb-12 px-6 text-center max-w-4xl mx-auto">
          <h1 className="font-serif font-semibold text-4xl md:text-5xl text-[#0E2F1F] tracking-tight mb-4">
            Help Build Better Area Intelligence
          </h1>
          <p className="text-lg text-[#5F6F63] leading-relaxed max-w-2xl mx-auto">
            We're building Nigeria's most trusted community-powered neighbourhood database. Every verified response helps people make better property decisions.
          </p>
        </header>
      )}

      <main className="px-4 pb-24">
        {!isSuccess && renderProgress()}
        
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div key="success">
              {renderSuccess()}
            </motion.div>
          ) : (
            <motion.div key={`step-${step}`}>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
              {step === 5 && renderStep5()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
