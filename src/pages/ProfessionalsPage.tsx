import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Map as MapIcon, HardHat } from 'lucide-react';

const PROFESSIONALS = [
  {
    roleId: 'property_lawyer',
    icon: Scale,
    title: 'Property Lawyer',
    description: 'Verify titles, draft agreements, and ensure all transactions are legally sound and protected.'
  },
  {
    roleId: 'licensed_surveyor',
    icon: MapIcon,
    title: 'Licensed Surveyor',
    description: 'Confirm property boundaries, conduct structural surveys, and provide accurate topographic data.'
  },
  {
    roleId: 'structural_engineer',
    icon: HardHat,
    title: 'Structural Engineer',
    description: 'Assess building integrity, review construction quality, and certify property safety standards.'
  }
];

export default function ProfessionalsPage() {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen flex flex-col animate-fade-in">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold text-[var(--color-brand-deep)] mb-6">
          For Real Estate Professionals
        </h1>
        <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed">
          Unity Homes is building a trusted professional network for people who need qualified help with property decisions.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {PROFESSIONALS.map((prof) => (
          <div key={prof.roleId} className="bg-white p-8 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-[var(--color-surface-soft)] rounded-full flex items-center justify-center text-[var(--color-brand-fresh)] mb-6">
              <prof.icon className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">{prof.title}</h3>
            
            <p className="text-[var(--color-text-secondary)] flex-1 mb-8 leading-relaxed">
              {prof.description}
            </p>
            
            <Link
              to={`/waitlist?role=${prof.roleId}`}
              className="w-full text-center bg-[var(--color-surface-light)] text-[var(--color-brand-deep)] border border-[var(--color-border)] px-6 py-3 rounded-[var(--radius-button)] font-semibold hover:bg-[var(--color-brand-deep)] hover:text-white transition-colors min-h-[48px] flex items-center justify-center"
            >
              Join The Waitlist
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
