'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@lms/ui';
import { Logo } from '@/components/Logo';
import { Lock, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@darkspacesecurity.io');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-organization-id': 'darkspace',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'Email or password is incorrect');
      }

      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Email or password is incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-surface)] relative">
      <div className="absolute top-6 left-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="w-4 h-4 text-red-500" />
            <span>Back to Portal</span>
          </Button>
        </Link>
      </div>

      <div className="max-w-md w-full bg-[#0B0B10] border border-[var(--color-border)] rounded-2xl p-8 shadow-2xl flex flex-col gap-6 relative">
        <div className="flex flex-col items-center text-center gap-2">
          <Logo size="lg" showSubtitle />
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Sign in to your cybersecurity academy</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-950/60 text-red-400 border border-red-900/60 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#07070A] border-zinc-800 text-white"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#07070A] border-zinc-800 text-white"
            required
          />

          <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-800 font-bold border-none shadow-lg shadow-red-900/40">
            Sign In to Terminal
          </Button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[var(--color-border)] w-full" />
          <span className="bg-[#0B0B10] px-3 text-xs text-[var(--color-text-muted)] absolute">
            ENTERPRISE ACCESS
          </span>
        </div>

        <Button variant="secondary" size="md" className="w-full gap-2 bg-[#101018] border-zinc-800 text-xs" type="button">
          <Lock className="w-4 h-4 text-red-500" />
          <span>Continue with SSO (SAML / OIDC)</span>
        </Button>

        <p className="text-center text-[11px] text-[var(--color-text-muted)]">
          Protected by tenant-isolated multi-factor identity
        </p>
      </div>
    </div>
  );
}
