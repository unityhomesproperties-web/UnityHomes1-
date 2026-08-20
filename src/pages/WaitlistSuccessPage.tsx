import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function WaitlistSuccessPage() {
  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto min-h-[70vh] flex flex-col justify-center items-center text-center animate-fade-in">
      <div className="w-20 h-20 bg-[var(--color-background)] rounded-full flex items-center justify-center text-[var(--color-secondary-green)] mb-8">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <h1 className="text-4xl font-bold text-[var(--color-primary-green)] mb-6">
        Registration Complete
      </h1>
      
      <p className="text-xl text-[var(--color-secondary-text)] leading-relaxed mb-10">
        Thank you for joining the Unity Homes waitlist. Your information has been successfully received, and we will contact you as soon as we launch the features relevant to your role.
      </p>

      <Link
        to="/"
        className="inline-flex bg-[var(--color-accent-gold)] text-[var(--color-primary-green)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-lg hover:opacity-90 transition-opacity min-h-[48px] items-center justify-center"
      >
        Return to Home
      </Link>
    </div>
  );
}
