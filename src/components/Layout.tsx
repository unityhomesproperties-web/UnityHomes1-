import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Mission', href: '/mission' },
  { label: 'Vision', href: '/vision' },
  { label: 'Area Intelligence', href: '/area-intelligence' },
  { label: 'Services', href: '/services' },
  { label: 'Professionals', href: '/professionals' },
];

export default function Layout() {
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
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white border-b border-[var(--color-border)] py-2 shadow-sm' 
            : 'bg-white/95 backdrop-blur-sm border-b border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-[var(--color-brand-deep)] hover:text-[var(--color-brand-fresh)] transition-colors">
            Unity Homes
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
            <Link
              to="/waitlist"
              className="bg-[var(--color-brand-fresh)] text-white px-6 py-2.5 rounded-[var(--radius-button)] font-semibold hover:bg-[var(--color-brand-medium)] transition-colors min-h-[48px] flex items-center justify-center shadow-sm"
            >
              Join The Waitlist
            </Link>
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
          <div className="flex items-center justify-between p-4 sm:px-6 h-20 border-b border-[var(--color-border)]">
            <Link to="/" className="text-xl font-bold text-[var(--color-brand-deep)]" onClick={closeMenu}>
              Unity Homes
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
              <Link
                to="/waitlist"
                onClick={closeMenu}
                className="bg-[var(--color-brand-fresh)] text-white px-6 py-4 rounded-[var(--radius-button)] font-semibold text-lg w-full min-h-[48px] flex items-center justify-center hover:bg-[var(--color-brand-medium)] transition-colors shadow-sm"
              >
                Join The Waitlist
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-24 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-brand-deep)] py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="text-lg font-bold text-white mb-4 block">
                Unity Homes and Properties Ltd
              </Link>
              <p className="text-sm text-white/70 leading-relaxed">
                Building a safer, more transparent real estate experience for Nigeria.
              </p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <span className="font-semibold text-white/50 mb-2 text-xs uppercase tracking-wider">Company</span>
              <Link to="/about" className="text-sm text-white/80 hover:text-white transition-colors">About</Link>
              <Link to="/mission" className="text-sm text-white/80 hover:text-white transition-colors">Mission</Link>
              <Link to="/vision" className="text-sm text-white/80 hover:text-white transition-colors">Vision</Link>
            </div>

            <div className="flex flex-col space-y-4">
              <span className="font-semibold text-white/50 mb-2 text-xs uppercase tracking-wider">Platform</span>
              <Link to="/services" className="text-sm text-white/80 hover:text-white transition-colors">Services</Link>
              <Link to="/professionals" className="text-sm text-white/80 hover:text-white transition-colors">Professionals</Link>
              <Link to="/area-intelligence" className="text-sm text-white/80 hover:text-white transition-colors">Area Intelligence</Link>
              <Link to="/waitlist" className="text-sm text-white/80 hover:text-white transition-colors">Join The Waitlist</Link>
            </div>

            <div className="flex flex-col space-y-4">
              <span className="font-semibold text-white/50 mb-2 text-xs uppercase tracking-wider">Legal</span>
              <Link to="/privacy" className="text-sm text-white/80 hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="text-sm text-white/80 hover:text-white transition-colors">Terms</Link>
              <Link to="/contact" className="text-sm text-white/80 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-white/50">
            <p>&copy; 2026 Unity Homes and Properties Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
