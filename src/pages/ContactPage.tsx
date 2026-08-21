import React, { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
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
    <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[var(--color-primary-green)] mb-6">Contact Us</h1>
        <p className="text-xl text-[var(--color-secondary-text)] max-w-2xl mx-auto">
          Have questions about Unity Homes or want to learn more about our upcoming features? We are here to help.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-24">
        {/* Contact Information */}
        <div className="space-y-8">
          <div className="bg-[var(--color-white)] p-8 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-sm">
            <h2 className="text-2xl font-bold text-[var(--color-primary-text)] mb-8">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-[var(--color-background)] rounded-full flex items-center justify-center text-[var(--color-secondary-green)] mr-4 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-primary-text)] mb-1">Email Support</h3>
                  <a href="mailto:unityhomesproperties@gmail.com" className="text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)] transition-colors">
                    unityhomesproperties@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-[var(--color-background)] rounded-full flex items-center justify-center text-[var(--color-secondary-green)] mr-4 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-primary-text)] mb-1">Phone</h3>
                  <a href="tel:+2348000000000" className="text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)] transition-colors">
                    +234 800 000 0000
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-[var(--color-background)] rounded-full flex items-center justify-center text-[var(--color-secondary-green)] mr-4 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--color-primary-text)] mb-1">Office</h3>
                  <p className="text-[var(--color-secondary-text)]">
                    Lagos, Nigeria<br />
                    (Full address available upon platform launch)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[var(--color-white)] p-8 rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-sm">
          {isSuccess ? (
            <div className="h-full flex flex-col justify-center items-center text-center animate-fade-in py-12">
              <div className="w-16 h-16 bg-[var(--color-background)] rounded-full flex items-center justify-center text-[var(--color-secondary-green)] mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--color-primary-green)] mb-4">Message Sent</h3>
              <p className="text-[var(--color-secondary-text)] mb-8">
                Thank you for reaching out. A member of the Unity Homes team will get back to you shortly.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="text-[var(--color-secondary-green)] font-semibold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)]"
                  placeholder="Your email address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--color-primary-text)] mb-2">Message</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full px-4 py-4 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-secondary-green)] text-[var(--color-primary-text)] resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--color-primary-green)] text-[var(--color-white)] px-6 py-4 rounded-[var(--radius-button)] font-bold text-lg hover:bg-[var(--color-secondary-green)] transition-colors min-h-[48px] flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 mr-2" />
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

      {/* Embedded FAQ Section */}
      <div className="pt-16 border-t border-[var(--color-border)]">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--color-primary-green)] mb-4">Frequently Asked Questions</h2>
          <p className="text-[var(--color-secondary-text)] text-lg">
            Quick answers to common questions about our platform.
          </p>
        </div>
        <FAQSection />
      </div>
    </div>
  );
}
