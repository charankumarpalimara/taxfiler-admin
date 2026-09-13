'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthService } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('admin@taxfiler.com');
  const [password, setPassword] = useState<string>('Admin@12345');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await AuthService.login(email, password);
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@taxfiler.com');
    setPassword('Admin@12345');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#1455B8]/30 via-[#1688E8]/20 to-[#72C900]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#72C900]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1455B8]/20 border border-[#1455B8]/30 text-[#1688E8] text-xs font-bold mb-4 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#72C900]" />
            <span>NexGen Accounting Group • Admin Portal</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-heading">
            Executive Portal Sign In
          </h1>
          <p className="text-slate-400 text-xs mt-2">
            Secure JWT Access to Client Submissions & CPA Registrations
          </p>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Authentication successful! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@taxfiler.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-[#1455B8] focus:ring-1 focus:ring-[#1455B8] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-[#1455B8] focus:ring-1 focus:ring-[#1455B8] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#1455B8] to-[#1688E8] hover:from-[#0E3E85] hover:to-[#1455B8] text-white font-bold text-xs shadow-lg shadow-[#1455B8]/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Actions */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-3">
            <button
              onClick={() => router.push('/')}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-[#72C900] border border-[#72C900]/30 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#72C900]" />
              <span>Enter Dashboard Directly</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2">
              <p className="text-[11px] text-slate-400 mb-1">Quick Auto-Fill Test Admin Credentials:</p>
              <button
                onClick={fillDemoCredentials}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px] font-mono transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>admin@taxfiler.com / Admin@12345</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          🔒 Encrypted JWT Authentication • MongoDB Atlas Enterprise Database
        </p>
      </div>
    </div>
  );
}
