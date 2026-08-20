import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Search, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Mission', href: '#mission' },
    { label: 'Area Intelligence', href: '#area-intelligence' },
    { label: 'Services', href: '#services' },
    { label: 'Professionals', href: '#professionals' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-4' : 'py-6'
        }`}
      >
        <div className="max-w-[1320px] mx-auto px-6">
          <div
            className={`flex items-center justify-between transition-all duration-300 rounded-full px-6 md:px-8 ${
              scrolled
                ? 'bg-[var(--theme-surface)]/80 backdrop-blur-md border border-[var(--color-border)] shadow-[var(--shadow-nav)] h-16'
                : 'bg-transparent border-transparent h-20'
            }`}
          >
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
              <div className="h-10 relative flex items-center shrink-0">
                <img
                  src="/logo.svg"
                  alt="Unity Homes"
                  className="h-full w-auto object-contain dark:brightness-200 dark:grayscale dark:invert"
                />
              </div>
              <div className="hidden lg:block">
                <span className="font-display font-bold text-lg tracking-tight text-[var(--color-text-primary)] block leading-none">
                  Unity Homes
                </span>
                <span className="font-sans text-[8px] tracking-[0.25em] font-semibold text-[var(--color-gold)] uppercase block mt-1">
                  &amp; Properties Ltd
                </span>
              </div>
            </div>

            {/* Center: Links (Desktop) */}
            <nav className="hidden xl:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-[var(--theme-brand-bg)] transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
              <a
                href="#join"
                className="text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors relative group"
              >
                Join Waitlist
                <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-[var(--theme-brand-bg)] transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-all hover:scale-105"
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </motion.div>
              </button>
              
              <button
                className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-all hover:scale-105"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <a
                href="#join"
                className="hidden md:flex h-10 px-6 rounded-full bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] text-sm font-semibold items-center justify-center hover:scale-105 transition-all shadow-sm"
              >
                Join Waitlist
              </a>

              <button
                className="xl:hidden w-10 h-10 flex items-center justify-center text-[var(--color-text-primary)]"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] xl:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-[var(--theme-surface)] shadow-2xl z-[101] flex flex-col xl:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.svg"
                    alt="Unity Homes"
                    className="h-8 w-auto object-contain dark:brightness-200 dark:grayscale dark:invert"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-all"
                  >
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 flex items-center justify-center text-[var(--color-text-primary)]"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-display font-medium text-[var(--color-text-primary)]"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#join"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-display font-medium text-[var(--color-text-primary)]"
                >
                  Join Waitlist
                </a>
              </div>

              <div className="p-6 border-t border-[var(--color-border)]">
                <a
                  href="#join"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-14 rounded-full bg-[var(--theme-brand-bg)] text-[var(--theme-brand-fg)] text-base font-semibold flex items-center justify-center"
                >
                  Join Waitlist
                </a>
                <div className="mt-8 flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                  <span>&copy; {new Date().getFullYear()} Unity Homes Ltd.</span>
                  <div className="flex gap-4">
                    <a href="#" className="hover:text-[var(--color-text-primary)]">X</a>
                    <a href="#" className="hover:text-[var(--color-text-primary)]">In</a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
