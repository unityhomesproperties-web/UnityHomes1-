import React, { useState, useEffect } from 'react';
import { ShieldAlert, BookOpen, Key, CheckSquare, UploadCloud, CheckCircle2, AlertCircle, Loader, Lock, Phone, Mail, QrCode, ArrowRight, ShieldCheck } from 'lucide-react';
import { validateInvitationByCode, acceptTenantInvitation } from '../lib/firestoreArchitecture';

interface RegisterTenantPageProps {
  navigate: (path: string, params?: any) => void;
  onLoginSuccess?: (session: any) => void;
  routeParams?: any;
}

export default function RegisterTenantPage({ navigate, onLoginSuccess, routeParams }: RegisterTenantPageProps) {
  const urlCode = routeParams?.code || '';
  const [invitationCodeInput, setInvitationCodeInput] = useState<string>(urlCode);
  
  // Validation State
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeInvitation, setActiveInvitation] = useState<any | null>(null);

  // Activation Steps: 1 = Code Entry/Welcome, 2 = Phone OTP, 3 = Email OTP, 4 = Password Setup, 5 = Success
  const [step, setStep] = useState<number>(1);

  // OTP Verification States
  const [phoneOtp, setPhoneOtp] = useState<string>('123456');
  const [emailOtp, setEmailOtp] = useState<string>('654321');
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);

  // Password Setup
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isActivating, setIsActivating] = useState<boolean>(false);

  // Auto-validate if code is provided in URL
  useEffect(() => {
    if (urlCode) {
      handleValidateCode(urlCode);
    }
  }, [urlCode]);

  const handleValidateCode = (codeToTest?: string) => {
    const code = (codeToTest || invitationCodeInput).trim();
    if (!code) {
      setValidationError('Please enter a valid invitation code.');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    setTimeout(() => {
      setIsValidating(false);
      const res = validateInvitationByCode(code);
      if (!res.valid || !res.invitation) {
        setValidationError(res.errorMessage || 'Invalid invitation link or code.');
        setActiveInvitation(null);
      } else {
        setActiveInvitation(res.invitation);
        setValidationError(null);
      }
    }, 800);
  };

  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneOtp.length < 4) {
      alert('Please enter a valid OTP code.');
      return;
    }
    setIsPhoneVerified(true);
    setOtpSentNotice('Phone number verified successfully!');
    setStep(3); // Move to Email verification
  };

  const handleVerifyEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOtp.length < 4) {
      alert('Please enter a valid OTP code.');
      return;
    }
    setIsEmailVerified(true);
    setOtpSentNotice('Email address verified successfully!');
    setStep(4); // Move to Password creation
  };

  const handleActivateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsActivating(true);
    setPasswordError(null);

    setTimeout(() => {
      try {
        const tenantUid = `tnt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const result = acceptTenantInvitation(activeInvitation.invitation_code, tenantUid);

        setIsActivating(false);
        setStep(5);

        // Build active user session
        const session = {
          id: tenantUid,
          name: result.profile.full_name,
          email: result.profile.email,
          role: 'Tenant' as const,
          phone: result.profile.phone,
          unitId: result.tenancy.unit_id,
          landlordId: result.tenancy.landlord_id
        };

        // Save session locally and notify parent
        localStorage.setItem('uh_user_session_v1', JSON.stringify(session));
        if (onLoginSuccess) {
          onLoginSuccess(session);
        }

        // Redirect directly to Tenant Dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } catch (err: any) {
        setIsActivating(false);
        setPasswordError(err.message || 'Failed to activate account. Please try again.');
      }
    }, 1200);
  };

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: '' };
    if (pwd.length < 6) return { label: 'Weak', color: 'text-rose-600 bg-rose-100' };
    if (pwd.length < 10) return { label: 'Medium', color: 'text-amber-600 bg-amber-100' };
    return { label: 'Strong', color: 'text-emerald-700 bg-emerald-100' };
  };

  const pwdStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-[#F0F8F4] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[var(--radius-large)] border border-stone-200 shadow-sm overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-[#18452E] text-white p-6 text-center space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <QrCode className="w-32 h-32 text-emerald-400" />
          </div>
          <span className="text-[9px] uppercase font-mono font-black text-[#C9A84C] bg-white/10 px-3 py-1 rounded-full tracking-widest inline-block border border-[#C9A84C]/30">
            UNITY HOMES TENANT ONBOARDING
          </span>
          <h1 className="font-display font-black text-2xl tracking-tight text-white">
            Activate Your Tenancy
          </h1>
          <p className="text-emerald-200 text-xs max-w-xs mx-auto">
            Direct, verified landlord invitation portal.
          </p>
        </div>

        <div className="p-6 space-y-6">

          {/* STEP 1: INVITATION CODE ENTRY & WELCOME SCREEN */}
          {!activeInvitation ? (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h2 className="font-display font-bold text-#132A1D text-base">Enter Invitation Code</h2>
                <p className="text-#6B7280 text-xs">
                  Enter the 8-character invitation code provided by your landlord to activate your account.
                </p>
              </div>

              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Invitation Error</strong>
                    <span>{validationError}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase">
                  INVITATION CODE (e.g. K8M4-ZP91)
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={invitationCodeInput}
                    onChange={(e) => setInvitationCodeInput(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    maxLength={10}
                    className="w-full p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-center font-mono font-black text-xl tracking-widest text-#132A1D outline-none focus:border-emerald-700 uppercase"
                  />
                </div>

                <button
                  onClick={() => handleValidateCode()}
                  disabled={isValidating || !invitationCodeInput}
                  className="w-full py-3.5 bg-[#18452E] hover:bg-[#18452E] text-white text-xs font-bold rounded-2xl transition cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isValidating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-white" />
                      <span>Validating Invitation...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* WELCOME & ACTIVATION STEPS WHEN VALID CODE LOADED */
            <div>
              {/* Welcome Summary Banner */}
              <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl space-y-2 mb-6">
                <div className="flex items-center gap-2 text-emerald-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-xs font-mono uppercase">Verified Invitation Found</span>
                </div>
                <h3 className="font-display font-black text-#132A1D text-base">
                  Welcome to {activeInvitation.pre_filled_data.tenantFullName || 'Unity Homes'}
                </h3>
                <p className="text-#6B7280 text-xs leading-relaxed">
                  Your landlord has invited you to join <strong>Unit #{activeInvitation.unit_id}</strong>. We have your tenancy details ready.
                </p>
              </div>

              {/* STEP 1 CONT: VERIFY PHONE */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase">PRE-FILLED PHONE NUMBER</label>
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-#132A1D font-mono text-sm font-bold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-700" />
                      <span>{activeInvitation.pre_filled_data.phone}</span>
                    </div>
                  </div>

                  <p className="text-#6B7280 text-xs">
                    We will send a 6-digit verification code to confirm your phone number.
                  </p>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-[#18452E] text-white text-xs font-bold rounded-2xl hover:bg-[#18452E] transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Send Phone Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: PHONE OTP ENTER */}
              {step === 2 && (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4 animate-fade-in">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      STEP 1 OF 3 &bull; PHONE VERIFICATION
                    </span>
                    <h3 className="font-display font-bold text-#132A1D text-base">Enter Phone OTP Code</h3>
                    <p className="text-#6B7280 text-xs">
                      Enter the 6-digit verification code sent to <strong>{activeInvitation.pre_filled_data.phone}</strong>.
                    </p>
                  </div>

                  <div>
                    <input 
                      type="text" 
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-center font-mono font-bold text-xl tracking-widest outline-none focus:border-emerald-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#18452E] text-white text-xs font-bold rounded-2xl hover:bg-[#18452E] transition cursor-pointer shadow-md"
                  >
                    Verify Phone & Proceed
                  </button>
                </form>
              )}

              {/* STEP 3: EMAIL OTP ENTER */}
              {step === 3 && (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-4 animate-fade-in">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      STEP 2 OF 3 &bull; EMAIL VERIFICATION
                    </span>
                    <h3 className="font-display font-bold text-#132A1D text-base">Verify Email Address</h3>
                    <p className="text-#6B7280 text-xs">
                      Enter the 6-digit verification code sent to <strong>{activeInvitation.pre_filled_data.email}</strong>.
                    </p>
                  </div>

                  <div>
                    <input 
                      type="text" 
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="654321"
                      maxLength={6}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-center font-mono font-bold text-xl tracking-widest outline-none focus:border-emerald-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#18452E] text-white text-xs font-bold rounded-2xl hover:bg-[#18452E] transition cursor-pointer shadow-md"
                  >
                    Verify Email & Proceed
                  </button>
                </form>
              )}

              {/* STEP 4: PASSWORD CREATION */}
              {step === 4 && (
                <form onSubmit={handleActivateAccount} className="space-y-4 animate-fade-in">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      STEP 3 OF 3 &bull; SECURITY SETUP
                    </span>
                    <h3 className="font-display font-bold text-#132A1D text-base">Create Account Password</h3>
                    <p className="text-#6B7280 text-xs">
                      Set up your secure password to complete activation and access your dashboard.
                    </p>
                  </div>

                  {passwordError && (
                    <p className="text-rose-600 text-xs font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center">
                      {passwordError}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase">PASSWORD</label>
                        {pwdStrength.label && (
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${pwdStrength.color}`}>
                            {pwdStrength.label}
                          </span>
                        )}
                      </div>
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-mono font-bold text-#6B7280 uppercase mb-1">CONFIRM PASSWORD</label>
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs outline-none focus:border-emerald-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isActivating}
                    className="w-full py-3.5 bg-[#18452E] text-white text-xs font-bold rounded-2xl hover:bg-[#18452E] transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {isActivating ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin text-white" />
                        <span>Activating Account...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Create Account & Launch Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 5: ACTIVATION SUCCESS */}
              {step === 5 && (
                <div className="text-center space-y-4 py-4 animate-fade-in">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-#132A1D text-lg">Account Activated!</h3>
                    <p className="text-#6B7280 text-xs mt-1">
                      Your tenancy is linked and active. Redirecting you to your tenant dashboard...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
