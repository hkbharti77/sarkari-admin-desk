import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Sparkles,
  ArrowRight,
  Globe,
} from 'lucide-react';

interface LoginPageProps {
  onSuccessfulLogin?: () => void;
}

export function LoginPage({ onSuccessfulLogin }: LoginPageProps) {
  const { login, seedAdmin, error, clearError, isLoading } = useAuth();

  const [email, setEmail] = useState('admin@govjob.in');
  const [password, setPassword] = useState('Admin@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [seedNotice, setSeedNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSeedNotice(null);

    if (!email.trim() || !password) return;

    const ok = await login({ email, password, rememberMe });
    if (ok && onSuccessfulLogin) {
      onSuccessfulLogin();
    }
  };

  const handleQuickFill = (targetEmail: string, targetPass: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    clearError();
    setSeedNotice(null);
  };

  const handleSeedSuperAdmin = async () => {
    setIsSeeding(true);
    setSeedNotice(null);
    clearError();
    try {
      const res = await seedAdmin();
      if (res.success) {
        setSeedNotice({
          type: 'success',
          message: res.message || 'Default admin verified in database.',
        });
        setEmail('admin@govjob.in');
        setPassword('Admin@1234');
      } else {
        setSeedNotice({
          type: 'error',
          message: res.message || 'Failed to seed admin in database.',
        });
      }
    } catch (err: any) {
      setSeedNotice({
        type: 'error',
        message: err.message || 'Database connection error.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen max-w-full overflow-hidden flex flex-col justify-between bg-[#F4F6FA] text-[#172033] selection:bg-[#F5B544]/30">
      {/* Sleek Top Banner (Compact Height) */}
      <header className="bg-[#12305A] text-white text-[11px] font-medium py-1.5 px-4 border-b border-white/10 shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F5B544]" />
            <span className="font-semibold tracking-wide">
              BharatRojgar & GovJob · Admin Publishing Desk
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[#ADC7FA] text-[11px]">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#F5B544]" /> Content Management System
            </span>
            <span>·</span>
            <span>Publish Jobs, Admit Cards & Results</span>
          </div>
        </div>
      </header>

      {/* Main Centered Content Canvas - Perfectly Fits 100% Viewport */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-3.5 my-auto">
          {/* Header Brand Lockup */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#12305A] text-[#F5B544] shadow-sm border border-[#1C4478] mb-0.5">
              <Layers className="w-6 h-6 stroke-[2.2]" aria-hidden="true" />
            </div>
            <h1 className="text-[20px] sm:text-[22px] font-bold text-[#12305A] tracking-[-0.01em] leading-tight">
              GovJob Admin Console
            </h1>
            <p className="text-[12px] text-[#556987]">
              Portal Management & Results Publishing Desk
            </p>
          </div>

          {/* Authentication Card */}
          <div className="bg-white border border-[#D0D5DD] rounded-lg shadow-sm p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#EAECF0] pb-2.5">
              <div>
                <h2 className="text-[14px] font-semibold text-[#12305A]">
                  Admin Sign In
                </h2>
                <p className="text-[11px] text-[#667085]">
                  Enter credentials to access the publisher console.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#12305A]/5 text-[#12305A] text-[10px] font-bold border border-[#12305A]/10 uppercase tracking-wide">
                <ShieldCheck className="w-3 h-3 text-[#12305A]" />
                Staff Access
              </span>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[12px] animate-fadeIn flex items-start gap-2"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-tight">{error}</div>
              </div>
            )}

            {/* Seeding / Action Notice */}
            {seedNotice && (
              <div
                role="status"
                className={`p-2.5 rounded-md text-[12px] border animate-fadeIn flex items-start gap-2 ${
                  seedNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {seedNotice.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 leading-tight">{seedNotice.message}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email / Username */}
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-[12px] font-semibold text-[#172033] mb-1"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#667085]">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) clearError();
                    }}
                    placeholder="admin@govjob.in"
                    className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-md border border-[#D0D5DD] bg-white text-[#172033] placeholder-[#98A2B3] focus:outline-none focus:ring-1.5 focus:ring-[#12305A] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="admin-password"
                    className="block text-[12px] font-semibold text-[#172033]"
                  >
                    Password
                  </label>
                  <span className="text-[10px] text-[#667085]">
                    Encrypted
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#667085]">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) clearError();
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-8 pr-9 py-1.5 text-[12px] rounded-md border border-[#D0D5DD] bg-white text-[#172033] placeholder-[#98A2B3] focus:outline-none focus:ring-1.5 focus:ring-[#12305A] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#667085] hover:text-[#172033] focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#12305A] border-[#D0D5DD] focus:ring-[#12305A]"
                  />
                  <span className="text-[#475467] font-medium select-none">
                    Remember session
                  </span>
                </label>
                <span className="text-[#667085] font-mono text-[10px]">
                  JWT Active
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-md bg-[#12305A] text-white text-[13px] font-semibold hover:bg-[#1C4478] active:bg-[#0D2240] focus:outline-none focus:ring-2 focus:ring-[#12305A] transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Admin Console</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#F5B544]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Autofill Bar */}
            <div className="border-t border-[#EAECF0] pt-2.5 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#667085] font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1 text-[#12305A]">
                  <KeyRound className="w-3 h-3 text-[#F5B544]" />
                  Quick Demo Autofill
                </span>
                <span>Pre-Configured</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickFill('admin@govjob.in', 'Admin@1234')
                  }
                  className="text-left p-1.5 rounded border border-[#E4E7EC] hover:border-[#12305A]/40 hover:bg-[#F8F9FC] transition-colors group"
                >
                  <div className="text-[11px] font-bold text-[#12305A] flex items-center justify-between">
                    <span>Super Admin</span>
                    <span className="text-[9px] text-[#F5B544] font-black group-hover:translate-x-0.5 transition-transform">
                      FILL
                    </span>
                  </div>
                  <div className="text-[10px] text-[#667085] truncate font-mono">
                    admin@govjob.in
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickFill('scrutiny@govjob.in', 'Admin@1234')
                  }
                  className="text-left p-1.5 rounded border border-[#E4E7EC] hover:border-[#12305A]/40 hover:bg-[#F8F9FC] transition-colors group"
                >
                  <div className="text-[11px] font-bold text-[#12305A] flex items-center justify-between">
                    <span>Reviewer</span>
                    <span className="text-[9px] text-[#F5B544] font-black group-hover:translate-x-0.5 transition-transform">
                      FILL
                    </span>
                  </div>
                  <div className="text-[10px] text-[#667085] truncate font-mono">
                    scrutiny@govjob.in
                  </div>
                </button>
              </div>

              {/* Seed DB Button */}
              <div className="flex items-center justify-between text-[10px] pt-0.5">
                <button
                  type="button"
                  disabled={isSeeding}
                  onClick={handleSeedSuperAdmin}
                  className="font-semibold text-[#12305A] hover:text-[#1C4478] hover:underline flex items-center gap-1 disabled:opacity-60"
                >
                  <Sparkles className="w-3 h-3 text-[#F5B544]" />
                  {isSeeding ? 'Checking...' : 'Seed Default Admin in DB'}
                </button>

                <span className="text-[#98A2B3]">
                  Pass: Admin@1234
                </span>
              </div>
            </div>
          </div>

          {/* Independent Disclaimer */}
          <p className="text-[10px] leading-[14px] text-center text-[#667085]">
            BharatRojgar & GovJob is an independent directory publishing recruitment alerts and exam results.
          </p>
        </div>
      </main>

      {/* Compact Institutional Footer */}
      <footer className="border-t border-[#E4E7EC] bg-white py-1.5 px-4 text-center text-[11px] text-[#667085] shrink-0">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div>
            © {new Date().getFullYear()} BharatRojgar & GovJob · Admin Publishing Console
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#475467]">
            <span>Content Publishing Desk</span>
            <span>·</span>
            <span>Editorial Workspace</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
