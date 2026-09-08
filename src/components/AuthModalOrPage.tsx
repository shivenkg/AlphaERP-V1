import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Phone,
  User,
  RefreshCw,
  Copy,
  Check,
  Layers,
  ChevronRight
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { ROLE_DEFINITIONS } from '../utils/rbac';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';

interface AuthModalOrPageProps {
  onSuccess?: (user: UserProfile) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthModalOrPage: React.FC<AuthModalOrPageProps> = ({
  onSuccess,
  isModal = false,
  onClose
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('shiven.k@gmail.com');
  const [enteredOtp, setEnteredOtp] = useState('');

  // Sign Up Form State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('+91 98');
  const [signupRole, setSignupRole] = useState<UserRole>('estimator');
  const [signupTitle, setSignupTitle] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('');

  // OTP Simulation State
  const [activeDispatchedOtp, setActiveDispatchedOtp] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState<number>(300); // 5 mins in seconds
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pre-configured Demo Accounts
  const demoAccounts: { role: UserRole; name: string; email: string; desc: string; badgeColor: string }[] = [
    {
      role: 'executive',
      name: 'Shivender Kumar',
      email: 'shiven.k@gmail.com',
      desc: 'Super Admin • Full Application Customization & Settings',
      badgeColor: 'bg-indigo-600 text-white'
    },
    {
      role: 'procurement',
      name: 'Rakesh Mehra',
      email: 'rakesh.procure@company.com',
      desc: 'Procurement Head • PR Review & Vendor PO Approval',
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      role: 'sales_manager',
      name: 'Rajesh Sharma',
      email: 'rajesh.hvac@company.com',
      desc: 'Business Manager • PO Sign-off & Awarding Quotes',
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      role: 'estimator',
      name: 'Priya Mukherjee',
      email: 'priya.m@company.com',
      desc: 'Chief MEP Estimator • Heat Load, BOQs & Quotes',
      badgeColor: 'bg-amber-600 text-white'
    },
    {
      role: 'warehouse',
      name: 'Imran Khan',
      email: 'imran.warehouse@company.com',
      desc: 'Warehouse Lead • Inward GRN & Stock Allocations',
      badgeColor: 'bg-teal-600 text-white'
    },
    {
      role: 'finance',
      name: 'Ananya Roy',
      email: 'ananya.roy@company.com',
      desc: 'Financial Controller • Billing, Tax Invoices & NEFT',
      badgeColor: 'bg-purple-600 text-white'
    },
    {
      role: 'technician',
      name: 'Vikram Sundaram',
      email: 'vikram.s@company.com',
      desc: 'Field Commissioning Engineer • Work Orders',
      badgeColor: 'bg-slate-700 text-white'
    }
  ];

  // Sync role metadata for sign up
  useEffect(() => {
    if (authMode === 'signup') {
      const def = ROLE_DEFINITIONS[signupRole];
      if (def) {
        setSignupTitle(def.name);
        setSignupDepartment(def.department);
      }
    }
  }, [signupRole, authMode]);

  // Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    } else if (otpCountdown === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, otpCountdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handler: Request OTP
  const handleRequestOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetEmail = authMode === 'signin' ? loginEmail.trim() : signupEmail.trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please enter a valid work or personal email address.');
      return;
    }

    if (authMode === 'signup' && !signupName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        const res = storageService.requestEmailOtp(
          targetEmail,
          authMode === 'signin' ? 'login' : 'signup',
          authMode === 'signup'
            ? {
                name: signupName.trim(),
                phone: signupPhone.trim(),
                role: signupRole,
                title: signupTitle.trim() || ROLE_DEFINITIONS[signupRole].name,
                department: signupDepartment.trim() || ROLE_DEFINITIONS[signupRole].department
              }
            : undefined
        );

        setActiveDispatchedOtp(res.otp);
        setStep('otp');
        setOtpCountdown(300);
        setTimerActive(true);
        setSuccessMessage(`6-digit verification code sent to ${targetEmail}`);
        setIsLoading(false);
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err.message || 'Failed to dispatch verification code.');
      }
    }, 450);
  };

  // Handler: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetEmail = authMode === 'signin' ? loginEmail.trim() : signupEmail.trim();
    if (!enteredOtp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        const res = storageService.verifyEmailOtp(targetEmail, enteredOtp.trim());
        setIsLoading(false);
        if (res.user && onSuccess) {
          onSuccess(res.user);
        }
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err.message || 'Invalid verification code.');
      }
    }, 400);
  };

  // Handler: One-Click Demo Login
  const handleQuickDemoLogin = (acc: typeof demoAccounts[0]) => {
    setIsLoading(true);
    setTimeout(() => {
      const loggedUser = storageService.loginDemoUser(acc.email);
      setIsLoading(false);
      if (onSuccess) {
        onSuccess(loggedUser);
      }
    }, 300);
  };

  // Auto fill OTP from email notification banner
  const handleAutoFillOtp = (otp: string) => {
    setEnteredOtp(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const activeEmail = authMode === 'signin' ? loginEmail : signupEmail;

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
      {/* Top Simulated Email Inbox Delivery Notification Banner */}
      {activeDispatchedOtp && step === 'otp' && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-blue-500/30 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    📧 Simulated Corporate Email Gateway
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    Delivered
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-100 mt-0.5">
                  Subject: <span className="font-mono text-blue-200">AlphaERP Security Verification Code</span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Recipient: <span className="font-medium text-white">{activeEmail}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-medium px-2">OTP:</span>
              <span className="text-base font-black tracking-widest font-mono text-emerald-400 bg-slate-900 px-3 py-1 rounded-lg border border-emerald-500/30">
                {activeDispatchedOtp}
              </span>
              <button
                type="button"
                onClick={() => handleAutoFillOtp(activeDispatchedOtp)}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOtp ? 'Applied!' : 'Auto-Fill OTP'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Authentication Box */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Brand Header */}
          <div className="bg-slate-900 px-6 py-6 text-white border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <JSAlphaSoftLogo size="md" variant="icon" isDarkTheme={true} />
                <div>
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <span className="text-[#0066E0]">Atmos</span>
                    <span className="text-white">Aircon</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                      AlphaERP
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    HVAC Projects • BOQ Inventory • PR/PO • Customization Suite
                  </p>
                </div>
              </div>

              {isModal && onClose && (
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 mt-6 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/80">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setStep('email');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signin'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Email OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setStep('email');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New User Registration</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {/* Feedback Messages */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* STEP 1: EMAIL & DETAILS INPUT */}
            {step === 'email' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                {authMode === 'signin' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Corporate Work Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. shiven.k@gmail.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      We will deliver a 6-digit single-use OTP code to this address.
                    </p>
                  </div>
                ) : (
                  /* SIGN UP FIELDS */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="e.g. Alok Verma"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Work Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            placeholder="alok.v@alphaerp.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Mobile Phone
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            placeholder="+91 98200 00000"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Assigned Enterprise Role *
                      </label>
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value as UserRole)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="executive">Executive / Managing Director (Super Admin)</option>
                        <option value="sales_manager">Sales Head / Business Manager</option>
                        <option value="estimator">Chief MEP & HVAC Estimator</option>
                        <option value="procurement">Purchase & Procurement Head</option>
                        <option value="warehouse">Warehouse & Stock Controller</option>
                        <option value="finance">Financial Controller & Accounts</option>
                        <option value="technician">Field Commissioning Engineer</option>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {ROLE_DEFINITIONS[signupRole]?.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Designation Title
                        </label>
                        <input
                          type="text"
                          value={signupTitle}
                          onChange={(e) => setSignupTitle(e.target.value)}
                          placeholder="e.g. Senior Project Manager"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Department
                        </label>
                        <input
                          type="text"
                          value={signupDepartment}
                          onChange={(e) => setSignupDepartment(e.target.value)}
                          placeholder="e.g. Field Operations"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Send Verification OTP' : 'Register & Send OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      Verification Code Sent To:
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{activeEmail}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setErrorMessage(null);
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Enter 6-Digit Email OTP
                    </label>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Expires in {formatTime(otpCountdown)}</span>
                    </div>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xl font-mono tracking-widest text-center font-black text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                    Universal demo codes <span className="font-mono font-bold text-slate-700">123456</span> or{' '}
                    <span className="font-mono font-bold text-slate-700">999999</span> can also be used for testing.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={timerActive && otpCountdown > 240}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600 disabled:opacity-40 transition-colors"
                  >
                    Resend Code {timerActive && otpCountdown > 240 ? `(${formatTime(300 - otpCountdown)})` : ''}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || enteredOtp.length < 6}
                    className="flex-1 max-w-[220px] flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Enter</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right / Quick Demo Persona & Role Selector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Instant Test Sign-In (All Roles)
                </h3>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                One-Click Access
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
              Click any verified enterprise profile below to bypass or pre-fill OTP login:
            </p>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {demoAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleQuickDemoLogin(acc)}
                  className="p-3 rounded-2xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/40 transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${acc.badgeColor}`}>
                        {acc.role.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                        {acc.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{acc.email}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{acc.desc}</div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>

            {/* Admin Customization Highlight Box */}
            <div className="mt-4 p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-xs text-indigo-900">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Super Admin Customization Power</span>
              </div>
              <p className="text-[11px] text-indigo-800/90 leading-relaxed">
                Log in as <strong>Shivender Kumar (Super Admin)</strong> to access the full <strong>Application Customization Suite</strong>: change branding, tax GST rules, PO thresholds, bank accounts, and role permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
