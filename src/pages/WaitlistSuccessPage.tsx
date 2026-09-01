import React from 'react';
import { Link } from 'react-router-dom';
import { Map, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function WaitlistSuccessPage() {
  return (
    <div className="min-h-screen bg-black relative flex flex-col items-center justify-center font-sans overflow-hidden py-12 px-4 sm:px-6">
      
      {/* Background Image - Keys/Doorway (Bright moment) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80" 
          alt="Moving in success" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        
        {/* Animated Checkmark */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="w-24 h-24 bg-[#008D24] rounded-full flex items-center justify-center shadow-lg mb-8"
        >
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" 
            />
          </svg>
        </motion.div>

        {/* Success Message */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-12 tracking-tight leading-tight text-balance"
        >
          Thank you for joining the Unity Homes Waitlist, together let's build a safe real estate industry.
        </motion.h1>

        {/* Floating White Card for Next Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-12 w-full max-w-2xl text-left"
        >
          <div className="flex items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-[#EAF5E3] flex items-center justify-center shrink-0 mr-4">
              <Map className="w-6 h-6 text-[#008D24]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#132A1D] mb-2">Help Build Better Area Intelligence</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                While you wait, you can help us map your community. Contribute local knowledge about security, amenities, and infrastructure to make neighborhoods more transparent.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/area-intelligence" 
              className="flex-1 bg-[#008D24] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#007a1f] transition-colors flex items-center justify-center text-center shadow-md"
            >
              Contribute Area Insights <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link 
              to="/" 
              className="flex-1 bg-stone-100 text-[#132A1D] py-4 px-6 rounded-xl font-semibold hover:bg-stone-200 transition-colors text-center flex items-center justify-center"
            >
              Skip For Now
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
