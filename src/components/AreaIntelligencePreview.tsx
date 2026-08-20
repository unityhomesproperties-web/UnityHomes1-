import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';

export default function AreaIntelligencePreview() {
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <section className="py-16 bg-[#F4F8F4] relative overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-6 relative z-10 flex justify-center">
        <div className="w-full max-w-3xl flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0E2F1F] mb-3">
            Help Build Better Area Intelligence
          </h2>
          <p className="text-base text-[#5F6F63] mb-6">
            Help future home buyers, renters and landlords make smarter decisions by sharing real information about your neighbourhood.
          </p>
          <div className="inline-flex items-center gap-2 text-sm font-medium text-[#0E2F1F] bg-white border border-[rgba(0,108,37,.08)] px-4 py-2 rounded-full mb-8 shadow-sm">
            <span className="text-[#2F8D46]">⏱</span> Estimated completion time: 3–4 minutes
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
            <button 
              onClick={() => navigateTo('/area-intelligence')}
              className="h-14 px-8 rounded-full bg-[#0E2F1F] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity hover:scale-[1.02] active:scale-[0.98] duration-200"
            >
              Contribute Area Insights
            </button>
            <button 
              className="h-14 px-8 rounded-full border border-[rgba(0,108,37,.08)] text-[#0E2F1F] bg-white hover:bg-[#F4F8F4] font-semibold transition-colors duration-200"
            >
              Learn Why This Matters
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
