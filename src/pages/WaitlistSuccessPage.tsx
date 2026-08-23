import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Map } from 'lucide-react';

export default function WaitlistSuccessPage() {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto min-h-[70vh] flex flex-col justify-center items-center text-center animate-fade-in">
      <div className="w-20 h-20 bg-[var(--color-surface-soft)] rounded-full flex items-center justify-center text-[var(--color-brand-fresh)] mb-8">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <h1 className="text-4xl font-bold text-[var(--color-brand-deep)] mb-4">
        Thank you for joining the Unity Homes Waitlist.
      </h1>
      <p className="text-2xl font-medium text-[var(--color-text-secondary)] mb-12">
        Together, let's build a safer real estate industry.
      </p>
      
      <div className="bg-white p-8 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-sm w-full text-left">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-[var(--color-surface-soft)] rounded-full flex items-center justify-center text-[var(--color-brand-fresh)] mr-4">
            <Map className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Help Build Better Area Intelligence
          </h2>
        </div>
        
        <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
          Would you like to help us understand what life is really like in your area? Your experience can help us build better community information for future buyers and renters.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/area-intelligence"
            className="flex-1 text-center bg-[var(--color-brand-fresh)] text-white px-6 py-4 rounded-[var(--radius-button)] font-semibold text-lg hover:bg-[var(--color-brand-medium)] transition-colors min-h-[48px] flex items-center justify-center shadow-sm"
          >
            Contribute Area Insights
          </Link>
          <Link
            to="/"
            className="flex-1 text-center bg-[var(--color-surface-light)] text-[var(--color-text-secondary)] border border-[var(--color-border)] px-6 py-4 rounded-[var(--radius-button)] font-semibold text-lg hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text-primary)] transition-colors min-h-[48px] flex items-center justify-center"
          >
            Skip For Now
          </Link>
        </div>
      </div>
    </div>
  );
}
