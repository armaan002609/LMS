'use client';

import React, { useState } from 'react';
import { Button, Input } from '@lms/ui';
import { BookOpen, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@acme.edu');
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
          'x-organization-id': 'acme',
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-surface-muted)]">
      <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 bg-indigo-50 text-[var(--color-primary)] rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Acme Academy</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Sign in to your learning dashboard</p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 text-[var(--color-danger)] border border-red-200 rounded-[var(--radius-md)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[var(--color-border)] w-full" />
          <span className="bg-[var(--color-surface)] px-3 text-xs text-[var(--color-text-muted)] absolute">
            OR
          </span>
        </div>

        <Button variant="secondary" size="md" className="w-full gap-2" type="button">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Continue with SSO (SAML / OIDC)</span>
        </Button>

        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Protected by tenant-isolated multi-factor identity
        </p>
      </div>
    </div>
  );
}
