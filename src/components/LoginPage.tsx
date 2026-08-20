import React, { useState } from 'react';
import { Home, Key, Calendar, Building, Shield, Check, Eye, EyeOff, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, UserSession } from '../types';
import { saveSession } from '../data';

interface LoginPageProps {
  navigate: (path: string, params?: any) => void;
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginPage({ navigate, onLoginSuccess }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Pre-configured accounts simulation
  const handleQuickDemoFill = (role: UserRole) => {
    setSelectedRole(role);
    const mockEmails: Record<UserRole, string> = {
      Admin: 'admin@unityhomes.ng',
      Landlord: 'landlord@unityhomes.ng',
      Tenant: 'gbenga.daniel@unityhomes.ng',
      'Shortlet Manager': 'shortlet@unityhomes.ng',
      PMC: 'pmc@unityhomes.ng',
      Public: ''
    };
    setEmail(mockEmails[role]);
    setPassword('unityhomes123');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      alert('Please select your account type category card first.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      
      let name = selectedRole === 'Admin' ? 'Olayinka Ayodele' : `${selectedRole} Representative`;
      let role = selectedRole;
      let entityId = selectedRole === 'Tenant' ? 'UH-TENANT-GBENGA' : (selectedRole === 'Landlord' ? 'UH-LANDLORD-0012' : '');
      let userId = 'session-' + Math.random().toString(36).substr(2, 9);
      const emailLower = (email || '').toLowerCase();

      if (selectedRole === 'Tenant') {
        name = 'Gbenga Daniel';
        entityId = 'UH-TENANT-GBENGA';
      } else if (emailLower.includes('james') || emailLower.includes('okonkwo')) {
        name = 'James Okonkwo';
        role = 'Shortlet Manager';
        userId = 'sandbox-user-9999';
      } else if (emailLower.includes('babatunde') || emailLower.includes('osei')) {
        name = 'Babatunde Osei';
        role = 'Landlord';
        entityId = 'UH-LANDLORD-OSEI';
      } else if (emailLower.includes('lagos') || emailLower.includes('realty')) {
        name = 'Lagos Realty Partners';
        role = 'PMC';
        userId = 'P2';
        entityId = 'Lagos Realty Partners';
      }

      const session: UserSession = {
        role,
        email: email || `${role.toLowerCase().replace(' ', '')}@unityhomes.ng`,
        userId,
        name,
        entityId
      };

      saveSession(session);
      onLoginSuccess(session);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 bg-[#F0F8F4] flex items-center justify-center">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-10 max-w-xl w-full">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div onClick={() => navigate('/')} className="w-12 h-12 bg-[#F0F8F4] border border-stone-200 rounded-xl flex items-center justify-center p-2.5 cursor-pointer shadow-inner">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#18452E]">
              <path d="M3 10L12 3L21 10V20C21 20.5523 20.5523 21 20 21H16V13H8V21H4C3.44772 21 3 20.4477 3 20V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-display font-extrabold text-[#18452E] mt-3">
            Welcome Back
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">Select your account type to proceed</p>
        </div>

        {/* FIVE ROLE CARDS - STEP 3 SPEC */}
        <div className="space-y-6">
          
          <div className="grid grid-cols-2 gap-3.5">
            
            {/* 1. Landlord */}
            <div
              onClick={() => handleQuickDemoFill('Landlord')}
              className={`p-4 rounded-xl border-2 cursor-pointer relative transition flex flex-col justify-between ${
                selectedRole === 'Landlord' 
                  ? 'border-[#18452E] bg-[#F0F8F4]' 
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div>
                <Home className="w-5 h-5 text-[#C9A84C] mb-2" />
                <h3 className="font-display font-semibold text-xs text-[#18452E]">I am a Landlord</h3>
                <p className="text-[10px] text-stone-400 mt-1 leading-snug">
                  Manage properties, tenants, and rental income.
                </p>
              </div>
              {selectedRole === 'Landlord' && (
                <span className="absolute top-2.5 right-2.5 bg-[#C9A84C] text-white p-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* 2. Tenant */}
            <div
              onClick={() => handleQuickDemoFill('Tenant')}
              className={`p-4 rounded-xl border-2 cursor-pointer relative transition flex flex-col justify-between ${
                selectedRole === 'Tenant' 
                  ? 'border-[#18452E] bg-[#F0F8F4]' 
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div>
                <Key className="w-5 h-5 text-[#C9A84C] mb-2" />
                <h3 className="font-display font-semibold text-xs text-[#18452E]">I am a Tenant</h3>
                <p className="text-[10px] text-stone-400 mt-1 leading-snug">
                  View tenancy, make payments, and track savings.
                </p>
              </div>
              {selectedRole === 'Tenant' && (
                <span className="absolute top-2.5 right-2.5 bg-[#C9A84C] text-white p-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* 3. Shortlet Manager */}
            <div
              onClick={() => handleQuickDemoFill('Shortlet Manager')}
              className={`p-4 rounded-xl border-2 cursor-pointer relative transition flex flex-col justify-between ${
                selectedRole === 'Shortlet Manager' 
                  ? 'border-[#18452E] bg-[#F0F8F4]' 
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div>
                <Calendar className="w-5 h-5 text-[#C9A84C] mb-2" />
                <h3 className="font-display font-semibold text-xs text-[#18452E]">I am a Shortlet Manager</h3>
                <p className="text-[10px] text-stone-400 mt-1 leading-snug">
                  Log bookings and manage landlord rentals.
                </p>
              </div>
              {selectedRole === 'Shortlet Manager' && (
                <span className="absolute top-2.5 right-2.5 bg-[#C9A84C] text-white p-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* 4. PMC */}
            <div
              onClick={() => handleQuickDemoFill('PMC')}
              className={`p-4 rounded-xl border-2 cursor-pointer relative transition flex flex-col justify-between ${
                selectedRole === 'PMC' 
                  ? 'border-[#1A5C50] bg-teal-50/40' 
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div>
                <Building className="w-5 h-5 text-[#1A5C50] mb-2" />
                <h3 className="font-display font-semibold text-xs text-[#18452E]">I am a Property Manager</h3>
                <p className="text-[10px] text-stone-400 mt-1 leading-snug">
                  Manage multiple portfolios professionally.
                </p>
              </div>
              {selectedRole === 'PMC' && (
                <span className="absolute top-2.5 right-2.5 bg-[#1A5C50] text-white p-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

          </div>

          {/* 5. Admin - Centered, smaller, visually quieter */}
          <div className="flex justify-center">
            <div
              onClick={() => handleQuickDemoFill('Admin')}
              className={`p-2.5 px-6 rounded-lg border cursor-pointer relative text-center transition ${
                selectedRole === 'Admin'
                  ? 'border-[#18452E] bg-[#F0F8F4] text-[#18452E]'
                  : 'border-stone-200/60 bg-white text-#6B7280 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-stone-400 shrink-0" />
                <span className="text-[11px] font-mono uppercase tracking-wider font-extrabold">I am an Administrator</span>
              </div>
              {selectedRole === 'Admin' && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C9A84C] text-white p-0.5 rounded-full">
                  <Check className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
          </div>

          {/* SLIDING FORM SECTION - STEP 3 SPEC */}
          <AnimatePresence>
            {selectedRole && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4 border-t border-stone-200 pt-5 overflow-hidden"
              >
                <div>
                  <label className="block text-[10px] font-bold text-[#18452E] uppercase mb-1">
                    Verified Portfolio Email Code
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-[#18452E] font-mono text-xs text-[#18452E]"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#18452E] uppercase mb-1 flex justify-between">
                    <span>Credentials Password Code</span>
                    <button
                      type="button"
                      onClick={() => navigate('/Pricing')} // Forgot password redirect link in gold as specified
                      className="text-[#C9A84C] text-[10px] font-mono font-bold hover:underline"
                    >
                      Forgot?
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 pr-10 text-xs focus:ring-1 focus:ring-[#18452E] text-[#18452E]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-[#18452E]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rememberMeCheck"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-[#18452E] border-stone-200 rounded"
                    />
                    <label htmlFor="rememberMeCheck" className="text-[10px] text-stone-500 font-sans leading-none">
                      Remember this portal
                    </label>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-lg text-[10px] text-#6B7280 leading-normal mb-1">
                  💡 <strong>Sandbox Hack:</strong> Selecting any card will auto-fill credentials for that role. Any password will let you check in.
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 bg-[#18452E] hover:bg-[#18452E] rounded-xl text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md uppercase tracking-wider cursor-pointer"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-[#C9A84C]" />
                      <span>Opening Workspace Access Portal...</span>
                    </>
                  ) : (
                    <span>Submit &amp; Open Workspace Dashboard</span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Under Form Prompt - STEP 3 SPEC */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Accounts are created by our team after a personal onboarding conversation. <br />
              New here? <button onClick={() => navigate('/pricing-and-services')} className="text-[#C9A84C] font-bold hover:underline">Visit unityhomes.ng to get started</button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
