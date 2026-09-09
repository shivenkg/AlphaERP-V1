import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  User,
  RefreshCw,
  ChevronRight,
  Globe,
  KeyRound
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { ROLE_DEFINITIONS } from '../utils/rbac';
import { JSAlphaSoftLogo } from './JSAlphaSoftLogo';
import { insforge } from '../lib/insforge';

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
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('shiven.k@gmail.com');
  const [loginPassword, setLoginPassword] = useState('AlphaERP@2026');

  // Sign Up Form State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('+91 98');
  const [signupRole, setSignupRole] = useState<UserRole>('estimator');
  const [signupTitle, setSignupTitle] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

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

  // Handler: InsForge Email & Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = loginEmail.trim();
    const password = loginPassword.trim();

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Fallback to local demo profile if demo user
        const demo = demoAccounts.find(d => d.email.toLowerCase() === email.toLowerCase());
        if (demo) {
          const user = storageService.loginDemoUser(demo.email);
          setIsLoading(false);
          if (onSuccess) onSuccess(user);
          return;
        }
        setIsLoading(false);
        setErrorMessage(error.message || 'Invalid login credentials.');
        return;
      }

      if (data?.user) {
        const userProfile: UserProfile = {
          id: data.user.id,
          name: data.user.profile?.name || data.user.email.split('@')[0],
          email: data.user.email,
          role: (data.user.profile as any)?.role || 'executive',
          title: (data.user.profile as any)?.title || 'Team Member',
          department: (data.user.profile as any)?.department || 'HVAC Operations',
          avatar: data.user.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          status: 'active',
          createdAt: data.user.createdAt
        };

        storageService.setCurrentUser(userProfile);
        setIsLoading(false);
        setSuccessMessage('Successfully signed in!');
        if (onSuccess) onSuccess(userProfile);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Sign in failed. Please check network.');
    }
  };

  // Handler: InsForge Email & Password Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const name = signupName.trim();
    const email = signupEmail.trim();
    const password = signupPassword.trim();

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name,
        redirectTo: window.location.origin
      });

      if (error) {
        setIsLoading(false);
        setErrorMessage(error.message || 'Registration failed.');
        return;
      }

      if (data?.user) {
        // Save profile data into InsForge user profile
        await insforge.auth.setProfile({
          name,
          role: signupRole,
          title: signupTitle.trim() || ROLE_DEFINITIONS[signupRole].name,
          department: signupDepartment.trim() || ROLE_DEFINITIONS[signupRole].department,
          phone: signupPhone.trim(),
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
        });

        const userProfile: UserProfile = {
          id: data.user.id,
          name,
          email,
          phone: signupPhone.trim(),
          role: signupRole,
          title: signupTitle.trim() || ROLE_DEFINITIONS[signupRole].name,
          department: signupDepartment.trim() || ROLE_DEFINITIONS[signupRole].department,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          status: 'active',
          createdAt: data.user.createdAt
        };

        storageService.setCurrentUser(userProfile);
        setIsLoading(false);

        if (data.requireEmailVerification) {
          setSuccessMessage('Verification email sent! You can also sign in right away.');
        } else {
          setSuccessMessage('Account created successfully!');
        }

        if (onSuccess) onSuccess(userProfile);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Registration failed.');
    }
  };

  // Handler: Google OAuth
  const handleGoogleOAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await insforge.auth.signInWithOAuth('google', {
        redirectTo: window.location.origin
      });

      if (error) {
        setIsLoading(false);
        setErrorMessage(error.message || 'Google Sign-In failed to initialize.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Google OAuth is unavailable or not enabled.');
    }
  };

  // Handler: Forgot / Reset Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = forgotEmail.trim();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await insforge.auth.sendResetPasswordEmail({
        email,
        redirectTo: `${window.location.origin}/#reset-password`
      });

      setIsLoading(false);
      if (error) {
        setErrorMessage(error.message || 'Could not send reset password email.');
      } else {
        setSuccessMessage('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to send password reset email.');
    }
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
    }, 250);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
      {/* InsForge Backend Status Header */}
      <div className="mb-4 p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between border border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            Backend: <strong className="text-white">InsForge PostgreSQL</strong> (<span className="text-emerald-400 font-mono text-[11px]">as2hwz72.us-east</span>)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>RLS & JWT Auth Protected</span>
        </div>
      </div>

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
                    Enterprise HVAC Suite • Powered by InsForge
                  </p>
                </div>
              </div>

              {isModal && onClose && (
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
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
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
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

            {/* Google OAuth Quick Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shadow-xs hover:border-slate-400 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google OAuth</span>
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                    Or with email credentials
                  </span>
                </div>
              </div>
            </div>

            {/* SIGN IN FORM */}
            {authMode === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. shiven.k@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Account Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In with InsForge Auth</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-4">
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
                      Password (6+ chars) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Enterprise Role *
                    </label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="executive">Executive / Super Admin</option>
                      <option value="sales_manager">Sales Head / Business Manager</option>
                      <option value="estimator">Chief MEP & HVAC Estimator</option>
                      <option value="procurement">Purchase & Procurement Head</option>
                      <option value="warehouse">Warehouse & Stock Controller</option>
                      <option value="finance">Financial Controller & Accounts</option>
                      <option value="technician">Field Commissioning Engineer</option>
                    </select>
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Create InsForge Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {authMode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>Password Reset Request</span>
                  </div>
                  <p>
                    Enter your email below and we will send a password reset link to your inbox.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. shiven.k@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-blue-600 cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
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
              Click any verified enterprise profile below to switch roles or test instantly:
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
