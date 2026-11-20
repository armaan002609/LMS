'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@lms/ui';
import { Users, BookOpen, DollarSign, Award, Palette, Globe, Shield } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Active Learners', value: '1,248', change: '+14% this month', icon: Users },
    { label: 'Published Courses', value: '18', change: '+2 new', icon: BookOpen },
    { label: 'Completion Rate', value: '62.4%', change: '+5.2% vs target', icon: Award },
    { label: 'Gross Revenue', value: '$24,500', change: '+18% ARR', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface-muted)] flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-lg text-[var(--color-primary)]">
            Acme Academy
          </Link>
          <span className="text-xs text-[var(--color-text-muted)] bg-gray-100 px-2 py-0.5 rounded">
            Org Admin Console
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/branding">
            <Button variant="secondary" size="sm" className="gap-2">
              <Palette className="w-4 h-4" />
              <span>Branding Studio</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">Learner View</Button>
          </Link>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl w-full mx-auto px-8 py-8 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Organization Overview</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Real-time metrics, active enrollments, and tenant settings</p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between shadow-sm"
              >
                <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                  <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
                  <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold text-[var(--color-text)]">{s.value}</span>
                  <p className="text-xs text-[var(--color-success)] mt-1 font-medium">{s.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Admin Actions & Setup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-base">White-Label Branding</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Configure logo, favicon, color tokens, and verify WCAG 4.5:1 contrast in real-time.
            </p>
            <Link href="/admin/branding">
              <Button variant="primary" size="sm" className="w-full">Open Branding Studio</Button>
            </Link>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-base">Custom Domains & TLS</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Map custom CNAME domains (e.g. learn.yourorg.com) with automated SSL certification.
            </p>
            <Button variant="secondary" size="sm" className="w-full">Manage Domains</Button>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[var(--color-primary)]" />
              <h3 className="font-semibold text-base">SSO & Integrations</h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Configure SAML 2.0 / OIDC enterprise single sign-on and Webhook dispatchers.
            </p>
            <Button variant="secondary" size="sm" className="w-full">Configure SSO</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
