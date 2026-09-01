import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useWaitlist } from './WaitlistContext';
import { Menu, X } from 'lucide-react';

import Footer from './Footer';

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Mission', href: '/mission' },
  { label: 'Vision', href: '/vision' },
  { label: 'Area Intelligence', href: '/area-intelligence' },
  { label: 'Services', href: '/services' },
  { label: 'Professionals', href: '/professionals' },
];

export default function Layout() {
  const { openWaitlist } = useWaitlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--color-surface-light)] text-[var(--color-text-primary)]">
      {/* Desktop Navigation */}
      <header 
        className={`absolute top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white border-b border-[var(--color-border)] py-1 md:py-2 shadow-sm' 
            : 'bg-white border-b border-transparent py-2 md:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/images/Logo.png" alt="Unity Homes Logo" className="h-8 md:h-10 w-auto object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40"><text x="0" y="28" font-family="sans-serif" font-weight="bold" font-size="24" fill="%2318452E">UNITY HOMES</text></svg>'; }} />
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-[var(--color-text-primary)] hover:text-[var(--color-brand-fresh)] transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
            <button onClick={openWaitlist} className="bg-[var(--color-brand-fresh)] text-white px-6 py-2.5 rounded-[var(--radius-button)] font-semibold hover:bg-[var(--color-brand-medium)] transition-colors min-h-[48px] flex items-center justify-center shadow-sm cursor-pointer">Join The Waitlist</button>
          </nav>

          <button
            className="lg:hidden p-2 text-[var(--color-text-primary)] min-h-[48px] min-w-[48px] flex items-center justify-center hover:bg-[var(--color-surface-soft)] rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">
          <div className="flex items-center justify-between p-4 sm:px-6 h-16 md:h-20 border-b border-[var(--color-border)]">
            <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
              <img src="/images/Logo.png" alt="Unity Homes Logo" className="h-8 w-auto object-contain" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40"><text x="0" y="28" font-family="sans-serif" font-weight="bold" font-size="24" fill="%2318452E">UNITY HOMES</text></svg>'; }} />
            </Link>
            <button
              className="p-2 text-[var(--color-brand-deep)] min-h-[48px] min-w-[48px] flex items-center justify-center hover:bg-[var(--color-surface-soft)] rounded-full transition-colors"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-6 pt-8 pb-8 overflow-y-auto flex flex-col space-y-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={closeMenu}
                className="text-2xl font-medium text-[var(--color-brand-deep)] hover:text-[var(--color-brand-fresh)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-8 mt-auto">
              <button onClick={() => { closeMenu(); openWaitlist(); }} className="bg-[var(--color-brand-fresh)] text-white px-6 py-4 rounded-[var(--radius-button)] font-semibold text-lg w-full min-h-[48px] flex items-center justify-center hover:bg-[var(--color-brand-medium)] transition-colors shadow-sm cursor-pointer">Join The Waitlist</button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-24 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
