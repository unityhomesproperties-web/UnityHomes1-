import React, { useState } from 'react';
import { Settings, X, Beaker, CheckSquare } from 'lucide-react';

export default function DemoMode() {
  const [isOpen, setIsOpen] = useState(false);

  const fillWaitlist = (role: string, dataOverrides: any = {}) => {
    const data = {
      role: role,
      full_name: 'Demo User',
      email: `demo.${role}@example.com`,
      phone: '08012345678',
      state: 'Lagos',
      role_specific_data: dataOverrides,
      information_confirmed: false // Keep false so they have to review
    };
    localStorage.setItem('unity_waitlist_autosave', JSON.stringify(data));
    window.location.href = `/waitlist?role=${role}`;
  };

  const scenarios = [
    {
      label: 'Seeker (Buy/Rent)',
      action: () => fillWaitlist('property_seeker', { interests: ['Buy Property', 'Area Intelligence'] })
    },
    {
      label: 'Landlord (List Only)',
      action: () => fillWaitlist('long_term_landlord', { service_preference: 'List My Property Only', properties_count: '2', property_type: 'Residential' })
    },
    {
      label: 'Landlord (Manager)',
      action: () => fillWaitlist('long_term_landlord', { service_preference: 'List Plus Unity Homes Manager', properties_count: '5', property_type: 'Mixed' })
    },
    {
      label: 'Landlord (Both)',
      action: () => fillWaitlist('long_term_landlord', { service_preference: 'Both Services', properties_count: '1', property_type: 'Commercial' })
    },
    {
      label: 'PMC (Both)',
      action: () => fillWaitlist('property_management_company', { company_name: 'Demo PMC Ltd', contact_person: 'Jane Manager', service_preference: 'Both Services', properties_count: '50' })
    },
    {
      label: 'Lawyer (Consent)',
      action: () => fillWaitlist('property_lawyer', { firm_name: 'Demo Legal', registration_number: 'NBA-12345', years_of_experience: '10', consent: true })
    },
    {
      label: 'Surveyor (Consent)',
      action: () => fillWaitlist('licensed_surveyor', { firm_name: 'Survey Co', registration_number: 'SURV-9876', years_of_experience: '5', consent: true })
    },
    {
      label: 'Engineer (Consent)',
      action: () => fillWaitlist('structural_engineer', { firm_name: 'BuildTech', registration_number: 'COREN-555', years_of_experience: '15', consent: true })
    },
    {
      label: 'Area Intelligence',
      action: () => {
        const aiData = {
          location: { state: 'Lagos', lga: 'Eti-Osa', area: 'Lekki Phase 1', estate: 'Demo Estate', years_lived: '4', relationship: 'Resident' },
          ratings: { security: 4, electricity: 3, water: 5, roads: 4, drainage: 2, flooding: 2, internet: 5, schools: 4, hospitals: 4, markets: 5, banks: 5, public_transport: 3, noise: 2, night_safety: 4 },
          housing: { typical_rent: '₦4,000,000', property_type: 'Apartments / Flats', availability: 'Average (Standard turnover)', ease_of_finding: 'Moderate', rent_change: 'Increased Moderately (10% - 30%)' },
          community: { recommend: 'Yes', best_thing: 'Proximity to offices and restaurants.', biggest_challenge: 'Traffic during rush hour.', suggestion: 'Better drainage maintenance.' },
          consent: { accurate: false, use_anonymously: false }
        };
        localStorage.setItem('unity_ai_autosave', JSON.stringify(aiData));
        window.location.href = '/area-intelligence';
      }
    },
    {
      label: 'Network Error Demo',
      action: () => fillWaitlist('property_seeker', { interests: ['Buy Property'] }) // Need to manually type network@error.com on form
    }
  ];

  return (
    <>
      {/* Floating Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[90] bg-[var(--color-text-primary)] text-white p-4 rounded-full shadow-sm hover:-translate-y-1 hover:shadow-sm transition-all"
        aria-label="Open Demo Tools"
      >
        <Beaker className="w-6 h-6" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-[var(--color-brand-fresh)]/80 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[var(--radius-card)] p-6 shadow-sm animate-slide-up relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-[var(--color-brand-medium)]" />
              Demo Testing Tools
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              Select a scenario to pre-fill local state and navigate directly to the form.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {scenarios.map((scen, idx) => (
                <button
                  key={idx}
                  onClick={scen.action}
                  className="flex items-center text-left text-sm font-semibold p-3 border border-[var(--color-border)] rounded-[var(--radius-button)] hover:border-[var(--color-brand-fresh)] hover:bg-[var(--color-surface-light)] transition-colors text-[var(--color-text-primary)]"
                >
                  <CheckSquare className="w-4 h-4 mr-2 text-[var(--color-text-secondary)]" />
                  {scen.label}
                </button>
              ))}
            </div>

            <div className="p-4 bg-[#FFF9E6] border border-[#FFE082] rounded-[var(--radius-input)] text-xs text-[#8A6D3B]">
              <strong>Note on Error Validation:</strong> To test the error states, use these emails on the Waitlist form:<br/>
              • <code>network@error.com</code><br/>
              • <code>duplicate@email.com</code><br/>
              • <code>service@down.com</code><br/>
              Or use phone <code>0000000000</code>.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
