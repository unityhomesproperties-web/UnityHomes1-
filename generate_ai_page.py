import os

content = """import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, MapPin, 
  Home, Star, Info, ChevronDown, Check, Zap, Droplets, Map,
  Wifi, GraduationCap, Building2, Store, Landmark, Bus, Activity, Moon
} from 'lucide-react';
import { navigateTo } from '../utils/navigation';

const categories = [
  { id: 'security', label: 'Security', icon: ShieldCheck, desc: 'Safety of lives and property' },
  { id: 'electricity', label: 'Electricity', icon: Zap, desc: 'Average daily power supply' },
  { id: 'water', label: 'Water Supply', icon: Droplets, desc: 'Reliability of clean water' },
  { id: 'roads', label: 'Road Condition', icon: Map, desc: 'Quality of access roads' },
  { id: 'drainage', label: 'Drainage', icon: Activity, desc: 'Gutters and water flow' },
  { id: 'flood', label: 'Flood Risk', icon: Droplets, desc: 'Vulnerability to flooding' },
  { id: 'internet', label: 'Internet', icon: Wifi, desc: 'Network & broadband quality' },
  { id: 'schools', label: 'Schools', icon: GraduationCap, desc: 'Access to quality education' },
  { id: 'hospitals', label: 'Hospitals', icon: Building2, desc: 'Healthcare facilities nearby' },
  { id: 'markets', label: 'Markets', icon: Store, desc: 'Groceries and shopping' },
  { id: 'banks', label: 'Banks', icon: Landmark, desc: 'Financial services access' },
  { id: 'transport', label: 'Public Transport', icon: Bus, desc: 'Ease of commuting' },
  { id: 'noise', label: 'Noise Level', icon: Activity, desc: 'General area peacefulness' },
  { id: 'night', label: 'Night Safety', icon: Moon, desc: 'Moving around after dark' },
];

export default function AreaIntelligencePage() {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<any>({
    location: { state: '', lga: '', area: '', estate: '', yearsLived: '', relationship: '' },
    ratings: {},
    housing: { rent: '', propertyType: '', availability: '', ease: '', trend: '' },
    experience: { recommend: '', best: '', challenge: '', suggestions: '' },
    consent: { required: false, optional: true }
  });

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => Math.min(6, s + 1));
  };
  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => Math.max(1, s - 1));
  };

  const submitForm = () => {
    // In a real app, send to backend here
    setIsSuccess(true);
  };

  // Progress Tracker
  const renderProgress = () => {
    const steps = [
      { id: 1, name: 'Location' },
      { id: 2, name: 'Ratings' },
      { id: 3, name: 'Housing' },
      { id: 4, name: 'Experience' },
      { id: 5, name: 'Review' }
    ];
    
    return (
      <div className="w-full max-w-4xl mx-auto mb-12 px-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[var(--color-border)] z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--theme-brand-bg)] z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
          
          {steps.map((s, i) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 bg-[var(--color-bg)] px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-[var(--theme-brand-bg)] border-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)]' :
                  isCurrent ? 'bg-[var(--color-bg)] border-[var(--theme-brand-bg)] text-[var(--theme-brand-bg)]' :
                  'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{s.id}</span>}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider hidden md:block ${
                  isCurrent || isCompleted ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
                }`}>{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">Where do you live?</h2>
        <p className="text-[var(--color-text-secondary)]">Help us organize data by specific neighbourhoods and estates.</p>
      </div>

      <div className="bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">State</label>
            <select 
              value={formData.location.state}
              onChange={(e) => updateFormData('location', 'state', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none appearance-none"
            >
              <option value="">Select State</option>
              <option value="Lagos">Lagos</option>
              <option value="Abuja">Abuja</option>
              <option value="Rivers">Rivers</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">LGA</label>
            <input 
              type="text" placeholder="e.g. Eti-Osa"
              value={formData.location.lga}
              onChange={(e) => updateFormData('location', 'lga', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">Area</label>
            <input 
              type="text" placeholder="e.g. Ikoyi"
              value={formData.location.area}
              onChange={(e) => updateFormData('location', 'area', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center justify-between">
              Estate <span className="text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] px-2 py-0.5 rounded text-[var(--color-text-muted)]">Optional</span>
            </label>
            <input 
              type="text" placeholder="e.g. Banana Island"
              value={formData.location.estate}
              onChange={(e) => updateFormData('location', 'estate', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[var(--color-border)]">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">Years Lived Here</label>
            <select 
              value={formData.location.yearsLived}
              onChange={(e) => updateFormData('location', 'yearsLived', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none appearance-none"
            >
              <option value="">Select duration</option>
              <option value="<1">Less than 1 year</option>
              <option value="1-3">1 - 3 years</option>
              <option value="3-5">3 - 5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">Relationship to Area</label>
            <select 
              value={formData.location.relationship}
              onChange={(e) => updateFormData('location', 'relationship', e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none appearance-none"
            >
              <option value="">Select relationship</option>
              <option value="Resident">Resident</option>
              <option value="Former Resident">Former Resident</option>
              <option value="Landlord">Landlord</option>
              <option value="Property Manager">Property Manager</option>
              <option value="Property Professional">Property Professional</option>
              <option value="Visitor">Visitor</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button 
          onClick={nextStep}
          disabled={!formData.location.state || !formData.location.area}
          className="h-12 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 shadow-lg shadow-[var(--theme-brand-bg)]/20"
        >
          Continue <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">Rate Your Area</h2>
        <p className="text-[var(--color-text-secondary)]">How would you rate the infrastructure and services? (1 = Poor, 5 = Excellent)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const Icon = cat.icon;
          const currentVal = formData.ratings[cat.id] || 0;
          return (
            <div key={cat.id} className="bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--theme-brand-bg)]/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[var(--theme-brand-bg)]/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[var(--theme-brand-bg)]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{cat.label}</h4>
                </div>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] mb-4 min-h-[32px]">{cat.desc}</p>
              
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => updateFormData('ratings', cat.id, star)}
                    className="p-1 focus:outline-none hover:scale-110 transition-transform"
                  >
                    <Star className={`w-5 h-5 ${star <= currentVal ? 'fill-[var(--color-gold)] text-[var(--color-gold)]' : 'fill-[var(--color-bg)] text-[var(--color-border)]'}`} />
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-between pt-8">
        <button onClick={prevStep} className="h-12 px-6 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-bg)] hover:bg-[var(--theme-surface)] transition-all font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <button onClick={nextStep} className="h-12 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg shadow-[var(--theme-brand-bg)]/20">
          Continue <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">Housing Information</h2>
        <p className="text-[var(--color-text-secondary)]">Help others understand the local real estate market dynamics.</p>
      </div>

      <div className="bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 space-y-6">
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">Common Property Type</label>
          <p className="text-xs text-[var(--color-text-secondary)] mb-2">What kind of housing is most prevalent here?</p>
          <select 
            value={formData.housing.propertyType}
            onChange={(e) => updateFormData('housing', 'propertyType', e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none appearance-none"
          >
            <option value="">Select property type</option>
            <option value="Apartments">Apartments / Flats</option>
            <option value="Bungalows">Bungalows</option>
            <option value="Duplexes">Duplexes / Townhouses</option>
            <option value="Compounds">Multi-family Compounds</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">Typical Annual Rent</label>
          <p className="text-xs text-[var(--color-text-secondary)] mb-2">For a standard 2 or 3 bedroom property</p>
          <select 
            value={formData.housing.rent}
            onChange={(e) => updateFormData('housing', 'rent', e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none appearance-none"
          >
            <option value="">Select range</option>
            <option value="<1M">Less than ₦1M</option>
            <option value="1M-3M">₦1M - ₦3M</option>
            <option value="3M-5M">₦3M - ₦5M</option>
            <option value="5M-10M">₦5M - ₦10M</option>
            <option value=">10M">Above ₦10M</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">Ease of Finding Accommodation</label>
          <select 
            value={formData.housing.ease}
            onChange={(e) => updateFormData('housing', 'ease', e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none appearance-none"
          >
            <option value="">Select option</option>
            <option value="Very Easy">Very Easy - Lots of empty houses</option>
            <option value="Moderate">Moderate - Takes some searching</option>
            <option value="Difficult">Difficult - Rarely any empty houses</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">Rent Increase Trend</label>
          <select 
            value={formData.housing.trend}
            onChange={(e) => updateFormData('housing', 'trend', e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none appearance-none"
          >
            <option value="">Select trend</option>
            <option value="Stable">Stable (No recent hikes)</option>
            <option value="Moderate">Moderate increases yearly</option>
            <option value="High">Skyrocketing quickly</option>
          </select>
        </div>

      </div>

      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="h-12 px-6 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-bg)] hover:bg-[var(--theme-surface)] transition-all font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <button onClick={nextStep} className="h-12 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg shadow-[var(--theme-brand-bg)]/20">
          Continue <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">Community Experience</h2>
        <p className="text-[var(--color-text-secondary)]">Your personal take on living in this neighbourhood.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-[var(--color-text-primary)] block mb-4">Would you recommend this area?</label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'Yes', icon: '✅' },
              { id: 'Maybe', icon: '🤔' },
              { id: 'No', icon: '❌' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => updateFormData('experience', 'recommend', opt.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  formData.experience.recommend === opt.id 
                  ? 'border-[var(--theme-brand-bg)] bg-[var(--theme-brand-bg)]/5 shadow-sm' 
                  : 'border-[var(--color-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-brand-bg)]/30'
                }`}
              >
                <span className="text-3xl mb-2">{opt.icon}</span>
                <span className="font-semibold text-sm text-[var(--color-text-primary)]">{opt.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 space-y-5">
          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">Best Thing About This Area</label>
            <textarea 
              maxLength={250}
              value={formData.experience.best}
              onChange={(e) => updateFormData('experience', 'best', e.target.value)}
              className="w-full h-24 p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none resize-none"
              placeholder="What do you love most?"
            ></textarea>
            <span className="absolute bottom-3 right-3 text-[10px] text-[var(--color-text-muted)] font-mono">{formData.experience.best.length}/250</span>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-[var(--color-text-primary)]">Biggest Challenge</label>
            <textarea 
              maxLength={250}
              value={formData.experience.challenge}
              onChange={(e) => updateFormData('experience', 'challenge', e.target.value)}
              className="w-full h-24 p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm focus:ring-1 focus:ring-[var(--theme-brand-bg)] focus:outline-none resize-none"
              placeholder="What needs improvement?"
            ></textarea>
            <span className="absolute bottom-3 right-3 text-[10px] text-[var(--color-text-muted)] font-mono">{formData.experience.challenge.length}/250</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="h-12 px-6 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-bg)] hover:bg-[var(--theme-surface)] transition-all font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <button onClick={nextStep} className="h-12 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:scale-[1.02] transition-all flex items-center gap-2 shadow-lg shadow-[var(--theme-brand-bg)]/20">
          Continue <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">Review & Submit</h2>
        <p className="text-[var(--color-text-secondary)]">Please confirm your contribution before submitting.</p>
      </div>

      <div className="bg-[var(--theme-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 space-y-6">
        
        {/* Summary Sections */}
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border)]">
            <h4 className="font-semibold text-[var(--color-text-primary)]">Location</h4>
            <button onClick={() => setStep(1)} className="text-xs font-semibold text-[var(--theme-brand-bg)] hover:underline">Edit</button>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {formData.location.area || 'N/A'}, {formData.location.lga || 'N/A'}, {formData.location.state || 'N/A'} <br/>
            {formData.location.relationship || 'Resident'} for {formData.location.yearsLived || 'some'} years
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--color-border)]">
            <h4 className="font-semibold text-[var(--color-text-primary)]">Housing & Feedback</h4>
            <button onClick={() => setStep(3)} className="text-xs font-semibold text-[var(--theme-brand-bg)] hover:underline">Edit</button>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Rent: {formData.housing.rent || 'N/A'} | Type: {formData.housing.propertyType || 'N/A'} <br/>
            Recommend: {formData.experience.recommend || 'N/A'}
          </p>
        </div>

        {/* Consent */}
        <div className="pt-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.consent.required ? 'bg-[var(--theme-brand-bg)] border-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)]' : 'border-[var(--color-border)] bg-[var(--color-bg)] group-hover:border-[var(--theme-brand-bg)]/50'}`}>
              {formData.consent.required && <Check className="w-3.5 h-3.5" />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.consent.required} onChange={(e) => updateFormData('consent', 'required', e.target.checked)} />
            <span className="text-sm text-[var(--color-text-secondary)]">
              I confirm this information is accurate to the best of my knowledge. *
            </span>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.consent.optional ? 'bg-[var(--theme-brand-bg)] border-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)]' : 'border-[var(--color-border)] bg-[var(--color-bg)] group-hover:border-[var(--theme-brand-bg)]/50'}`}>
              {formData.consent.optional && <Check className="w-3.5 h-3.5" />}
            </div>
            <input type="checkbox" className="hidden" checked={formData.consent.optional} onChange={(e) => updateFormData('consent', 'optional', e.target.checked)} />
            <span className="text-sm text-[var(--color-text-secondary)]">
              I allow Unity Homes to anonymously use my contribution to improve Area Intelligence.
            </span>
          </label>
          <div className="pl-8 text-xs text-[var(--color-text-muted)]">
            See our <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">Terms</a>.
          </div>
        </div>

      </div>

      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="h-12 px-6 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-bg)] hover:bg-[var(--theme-surface)] transition-all font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4"/> Back
        </button>
        <button 
          onClick={submitForm}
          disabled={!formData.consent.required}
          className="h-12 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 shadow-lg shadow-[var(--theme-brand-bg)]/20"
        >
          Submit Contribution
        </button>
      </div>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-[var(--theme-brand-bg)]/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="w-24 h-24 bg-[var(--theme-brand-bg)]/10 rounded-full flex items-center justify-center relative z-10 border border-[var(--theme-brand-bg)]/30 shadow-2xl shadow-[var(--theme-brand-bg)]/20">
          <CheckCircle2 className="w-12 h-12 text-[var(--theme-brand-bg)]" />
        </div>
      </div>
      
      <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--color-text-primary)] mb-2">Thank You!</h2>
      <p className="text-lg text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
        Your contribution will help build Nigeria's most trusted neighbourhood intelligence platform.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 w-full sm:w-auto max-w-md mx-auto">
        <button onClick={() => navigateTo('/')} className="w-full sm:w-auto h-14 px-8 rounded-xl bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] font-semibold hover:scale-[1.02] transition-all shadow-lg shadow-[var(--theme-brand-bg)]/20">
          Return Home
        </button>
        <button onClick={() => { setIsSuccess(false); setStep(1); setFormData({...formData}); }} className="w-full sm:w-auto h-14 px-8 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-bg)] hover:bg-[var(--theme-surface)] transition-all font-semibold">
          Share More Insights
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      {!isSuccess && (
        <header className="pt-12 pb-8 px-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--theme-brand-bg)]/30 bg-[var(--theme-brand-bg)]/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--theme-brand-bg)]"></span>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--theme-brand-bg)]">Community Intelligence</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--color-text-primary)] tracking-tight mb-4">
            Help Build Better Area Intelligence
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
            We're building Nigeria's most trusted community-powered neighbourhood database. Every verified contribution helps buyers, renters and landlords make better decisions.
          </p>
        </header>
      )}

      {/* Main Content */}
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
"""

with open("src/components/AreaIntelligencePage.tsx", "w") as f:
    f.write(content)
