import React, { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import FAQSection from '../components/FAQSection';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate submission without backend exposure
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Immersive Hero Banner - Solid Supporting Green */}
      <section className="relative text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/images/about_us.jpg" alt="Hero Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-transparent" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
          >
            <h4 className="text-sm font-semibold tracking-widest uppercase text-white/80 mb-4">
              GET IN TOUCH
            </h4>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-6">
              Let's talk about real estate.
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-xl font-medium">
              Have a question about Unity Homes, the waitlist or what we're building? Get in touch with us.
            </p>
          </motion.div>
          
          {/* Hero Visual: Person -> Message -> Unity Homes */}
          <div className="hidden md:flex justify-center items-center h-full">
            <svg viewBox="0 0 400 120" fill="none" className="w-full max-w-sm">
              {/* Person Icon */}
              <motion.circle cx="40" cy="40" r="16" stroke="white" strokeWidth="4" />
              <motion.path d="M16,100 C16,70 64,70 64,100" stroke="white" strokeWidth="4" strokeLinecap="round" />
              
              {/* Line to Message */}
              <motion.line 
                x1="80" y1="60" x2="160" y2="60" 
                stroke="white" strokeWidth="2" strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: "linear" }}
              />
              
              {/* Message Icon */}
              <motion.rect 
                x="170" y="40" width="60" height="40" rx="8" 
                stroke="white" strokeWidth="4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              />
              <motion.path 
                d="M170,45 L200,65 L230,45" 
                stroke="white" strokeWidth="4" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              />
              
              {/* Line to Unity Homes */}
              <motion.line 
                x1="240" y1="60" x2="320" y2="60" 
                stroke="white" strokeWidth="2" strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.4, ease: "linear" }}
              />
              
              {/* Unity Homes Icon (House) */}
              <motion.path 
                d="M330,60 L360,35 L390,60 V90 H330 Z" 
                stroke="white" strokeWidth="4" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              />
            </svg>
          </div>
        </div>
      </section>

      <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16 mb-32">
          
          {/* Contact Information */}
          <div className="md:col-span-5 space-y-12">
            <div>
              <h2 className="text-3xl font-semibold text-[#132A1D] mb-8">Contact Information</h2>
              <p className="text-lg text-[#6B7280] leading-relaxed mb-10">
                Whether you're interested in our upcoming platform, joining the waitlist, or seeking general information, we're ready to answer your questions.
              </p>
            </div>
            
            <div className="space-y-10">
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold tracking-widest uppercase text-[#6B7280] mb-3">Email</h3>
                <a 
                  href="mailto:unityhomesproperties@gmail.com" 
                  className="text-xl md:text-2xl font-semibold text-[#132A1D] hover:text-[#6FBE45] transition-colors"
                >
                  unityhomesproperties@gmail.com
                </a>
              </div>
              
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold tracking-widest uppercase text-[#6B7280] mb-3">Phone</h3>
                <a 
                  href="tel:+2348000000000" 
                  className="text-xl md:text-2xl font-semibold text-[#132A1D] hover:text-[#6FBE45] transition-colors"
                >
                  +234 800 000 0000
                </a>
              </div>
              
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold tracking-widest uppercase text-[#6B7280] mb-3">Office</h3>
                <p className="text-xl font-semibold text-[#132A1D]">
                  Lagos, Nigeria
                </p>
                <p className="text-[#6B7280] mt-1">
                  (Full address available upon platform launch)
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#F5FAF2] p-10 md:p-12 rounded-[24px] border border-[#6FBE45]/20 h-full flex flex-col justify-center"
              >
                <div className="w-16 h-16 bg-white rounded-[18px] border border-[#6FBE45]/20 flex items-center justify-center text-[#6FBE45] mb-6 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-semibold text-[#132A1D] mb-4">Message received.</h3>
                <p className="text-xl text-[#6B7280] mb-10 leading-relaxed">
                  Thank you for reaching out to Unity Homes. We'll get back to you through the contact details you provided.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="inline-flex items-center text-[#2F8D46] font-semibold text-lg hover:text-[#6FBE45] transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[24px] border border-gray-200 shadow-sm space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-[#132A1D] mb-3">Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-5 py-4 rounded-[18px] border border-gray-300 bg-white focus:outline-none focus:ring-4 focus:ring-[#EAF5E3] focus:border-[#6FBE45] transition-all duration-200 text-[#132A1D] text-lg placeholder:text-gray-400"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#132A1D] mb-3">Email</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-5 py-4 rounded-[18px] border border-gray-300 bg-white focus:outline-none focus:ring-4 focus:ring-[#EAF5E3] focus:border-[#6FBE45] transition-all duration-200 text-[#132A1D] text-lg placeholder:text-gray-400"
                    placeholder="Your email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#132A1D] mb-3">Message</label>
                  <textarea 
                    required
                    rows={6}
                    className="w-full px-5 py-4 rounded-[18px] border border-gray-300 bg-white focus:outline-none focus:ring-4 focus:ring-[#EAF5E3] focus:border-[#6FBE45] transition-all duration-200 text-[#132A1D] text-lg resize-none placeholder:text-gray-400"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#6FBE45] text-white px-8 py-5 rounded-[18px] font-semibold text-lg hover:bg-[#5CA636] transition-all duration-200 min-h-[56px] flex items-center justify-center disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5 mr-3" />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      
      {/* Embedded FAQ Section */}
      <div className="py-24 bg-[#F5FAF2] border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h4 className="text-sm font-semibold tracking-widest uppercase text-[#2F8D46] mb-4">
              QUESTIONS, ANSWERED.
            </h4>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#132A1D] mb-4">
              Everything you need to know about Unity Homes.
            </h2>
          </div>
          <FAQSection />
        </div>
      </div>
    </div>
  );
}
