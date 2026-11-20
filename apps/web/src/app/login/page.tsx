'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@lms/ui';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, UserCheck, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('learner@darkspacesecurity.io');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (targetEmail?: string) => {
    setIsLoading(true);
    setError('');
    const emailToUse = targetEmail || email;

    const res = await login(emailToUse, password);

    if (res.success && res.user) {
      if (res.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#040406] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.18),rgba(255,255,255,0))] relative">
      <div className="max-w-md w-full bg-[#0B0B10] border border-[#1E1E28] rounded-2xl p-8 shadow-2xl shadow-red-950/20 flex flex-col gap-6 relative backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Logo size="lg" showSubtitle />
          <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono tracking-wide">
            AUTHENTICATED ACCESS ONLY
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-950/70 text-red-300 border border-red-900/80 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Security Email Identifier"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#07070A] border-zinc-800 text-white font-mono text-sm"
            placeholder="user@darkspacesecurity.io"
            required
          />
          <Input
            label="Access Passphrase"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#07070A] border-zinc-800 text-white font-mono text-sm"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 font-bold border-none shadow-lg shadow-red-900/40 text-white"
          >
            Authenticate Identity
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-[#0B0B10] px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono absolute">
            ONE-CLICK ROLE SWITCH
          </span>
        </div>

        {/* Quick Demo Logins for smooth verification */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setEmail('learner@darkspacesecurity.io');
              handleLogin('learner@darkspacesecurity.io');
            }}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-800 bg-[#0E0E14] hover:border-zinc-700 hover:bg-zinc-900 transition-all text-left text-xs"
          >
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Learner</div>
              <div className="text-[10px] text-zinc-400 truncate">Assigned Work</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('admin@darkspacesecurity.io');
              handleLogin('admin@darkspacesecurity.io');
            }}
            className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-800 bg-[#0E0E14] hover:border-red-900/60 hover:bg-red-950/20 transition-all text-left text-xs"
          >
            <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
            <div>
              <div className="font-semibold text-white">Admin</div>
              <div className="text-[10px] text-zinc-400 truncate">Full Command</div>
            </div>
          </button>
        </div>

        <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-red-500" /> Supabase RLS Protected
          </span>
          <span>v2.4 Cyber LMS</span>
        </div>
      </div>
    </div>
  );
}
