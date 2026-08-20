import React, { useState } from 'react';
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

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--color-background)] text-[var(--color-primary-text)]">
      {/* Desktop Navigation */}
      <header className="sticky top-0 z-50 bg-[var(--color-white)] border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-[var(--color-primary-green)] hover:opacity-80 transition-opacity">
            Unity Homes
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-[var(--color-primary-text)] hover:text-[var(--color-secondary-green)] transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/waitlist"
              className="bg-[var(--color-accent-gold)] text-[var(--color-primary-green)] px-6 py-3 rounded-[var(--radius-button)] font-semibold hover:opacity-90 transition-opacity min-h-[48px] flex items-center justify-center"
            >
              Join Waitlist
            </Link>
          </nav>

          <button
            className="lg:hidden p-2 text-[var(--color-primary-text)] min-h-[48px] min-w-[48px] flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-[var(--color-primary-green)] flex flex-col animate-fade-in">
          <div className="flex items-center justify-between p-4 sm:px-6 h-20">
            <Link to="/" className="text-xl font-bold text-[var(--color-white)]" onClick={closeMenu}>
              Unity Homes
            </Link>
            <button
              className="p-2 text-[var(--color-white)] min-h-[48px] min-w-[48px] flex items-center justify-center"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 pt-8 pb-4 overflow-y-auto flex flex-col space-y-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={closeMenu}
                className="text-2xl font-medium text-[var(--color-white)] hover:text-[var(--color-accent-gold)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-8">
              <Link
                to="/waitlist"
                onClick={closeMenu}
                className="bg-[var(--color-accent-gold)] text-[var(--color-primary-green)] px-6 py-4 rounded-[var(--radius-button)] font-semibold text-lg w-full min-h-[48px] flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                Join Waitlist
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-white)] border-t border-[var(--color-border)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="text-lg font-bold text-[var(--color-primary-green)] mb-4 block">
                Unity Homes and Properties Ltd
              </Link>
              <p className="text-sm text-[var(--color-secondary-text)]">
                Building a safer, more transparent real estate experience for Nigeria.
              </p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <span className="font-semibold text-[var(--color-primary-text)] mb-2">Company</span>
              <Link to="/about" className="text-sm text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)]">About</Link>
              <Link to="/mission" className="text-sm text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)]">Mission</Link>
              <Link to="/vision" className="text-sm text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)]">Vision</Link>
            </div>

            <div className="flex flex-col space-y-3">
              <span className="font-semibold text-[var(--color-primary-text)] mb-2">Platform</span>
              <Link to="/services" className="text-sm text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)]">Services</Link>
              <Link to="/professionals" className="text-sm text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)]">Professionals</Link>
              <Link to="/area-intelligence" className="text-sm text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)]">Area Intelligence</Link>
              <Link to="/waitlist" className="text-sm text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)]">Join Waitlist</Link>
            </div>

            <div className="flex flex-col space-y-3">
              <span className="font-semibold text-[var(--color-primary-text)] mb-2">Legal</span>
              <Link to="/privacy" className="text-sm text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)]">Privacy</Link>
              <Link to="/terms" className="text-sm text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)]">Terms</Link>
              <Link to="/contact" className="text-sm text-[var(--color-secondary-text)] hover:text-[var(--color-secondary-green)]">Contact</Link>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center text-sm text-[var(--color-secondary-text)]">
            <p>&copy; 2026 Unity Homes and Properties Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
