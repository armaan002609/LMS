'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@lms/ui';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth-context';
import { Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');

    const res = await login(email.trim(), password);

    if (res.success && res.user) {
      if (res.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      setError(res.error || 'Authentication failed. Please check your email and password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#040406] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(220,38,38,0.18),rgba(255,255,255,0))] relative">
      <div className="max-w-md w-full bg-[#0B0B10] border border-[#1E1E28] rounded-2xl p-8 shadow-2xl shadow-red-950/20 flex flex-col gap-6 relative backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <Logo size="lg" showSubtitle />
          <p className="text-xs text-zinc-400 mt-1 font-mono tracking-wide">
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
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#07070A] border-zinc-800 text-white font-mono text-sm"
            placeholder="name@darkspacesecurity.io"
            required
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#07070A] border-zinc-800 text-white font-mono text-sm"
            placeholder="••••••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 font-bold border-none shadow-lg shadow-red-900/40 text-white"
          >
            Sign In to Academy
          </Button>
        </form>

        <div className="pt-4 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span>Supabase Cloud Identity & RLS</span>
          </span>
          <span className="font-mono">v2.4 Production</span>
        </div>
      </div>
    </div>
  );
}
