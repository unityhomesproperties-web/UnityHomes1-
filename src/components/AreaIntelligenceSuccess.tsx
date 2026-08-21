import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Share2 } from 'lucide-react';
import ShareModal from '../components/ShareModal';

interface AISuccessStateProps {
  onReset: () => void;
}

export default function AreaIntelligenceSuccess({ onReset }: AISuccessStateProps) {
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  return (
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto min-h-[70vh] flex flex-col justify-center items-center text-center animate-fade-in">
      <div className="w-20 h-20 bg-[var(--color-background)] rounded-full flex items-center justify-center text-[var(--color-secondary-green)] mb-8">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <h1 className="text-4xl font-bold text-[var(--color-primary-green)] mb-6">
        Thank you for helping improve property transparency in Nigeria
      </h1>
      
      <p className="text-xl text-[var(--color-secondary-text)] leading-relaxed mb-10">
        Your insights will help others make more informed, safer property decisions.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <button
          onClick={() => setIsShareOpen(true)}
          className="flex items-center justify-center space-x-2 bg-[var(--color-primary-green)] text-[var(--color-white)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-lg hover:opacity-90 transition-opacity min-h-[48px]"
        >
          <Share2 className="w-5 h-5" />
          <span>Share Area Intelligence</span>
        </button>
        <Link
          to="/"
          className="flex items-center justify-center bg-[var(--color-background)] text-[var(--color-secondary-text)] border border-[var(--color-border)] px-8 py-4 rounded-[var(--radius-button)] font-semibold text-lg hover:bg-[var(--color-border)] hover:text-[var(--color-primary-text)] transition-colors min-h-[48px]"
        >
          Return Home
        </Link>
      </div>

      <ShareModal
        url={window.location.origin + '/area-intelligence'}
        title="Unity Homes Area Intelligence"
        text="I just contributed to Area Intelligence on Unity Homes to help build a more transparent real estate market in Nigeria. Share your neighborhood insights too!"
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
