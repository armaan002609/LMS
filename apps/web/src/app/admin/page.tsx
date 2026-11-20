'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@lms/ui';
import { Users, BookOpen, Shield, Award, Palette, Globe, Terminal } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Active Cyber Learners', value: '1,420', change: '+18% this month', icon: Users },
    { label: 'Published Tracks', value: '18', change: '5 certification paths', icon: BookOpen },
    { label: 'Lab Completion Rate', value: '74.2%', change: '+8.5% CTF pass rate', icon: Award },
    { label: 'Vulnerability Submissions', value: '312', change: 'CVE audits reviewed', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[var(--color-border)] bg-[#07070A] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-extrabold text-lg text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span>Dark Space Security</span>
          </Link>
          <span className="text-[11px] text-red-400 bg-red-950/60 border border-red-900/40 px-2.5 py-0.5 rounded-full font-bold">
            Security Admin Console
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/branding">
            <Button variant="secondary" size="sm" className="gap-2 bg-[#12121A] border-zinc-800 text-xs">
              <Palette className="w-4 h-4 text-red-500" />
              <span>Cyber Theme Studio</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs">Learner View</Button>
          </Link>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl w-full mx-auto px-8 py-8 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Academy Operations Dashboard</h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Manage training tracks, lab environments, learner credentials, and security compliance.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-[#0B0B10] border border-[var(--color-border)] rounded-xl p-5 flex flex-col justify-between shadow-sm"
              >
                <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{s.label}</span>
                  <Icon className="w-5 h-5 text-red-500" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-extrabold text-white">{s.value}</span>
                  <p className="text-xs text-emerald-400 mt-1 font-medium">{s.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0B0B10] border border-[var(--color-border)] hover:border-red-600/30 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-base text-white">Dark Space Theme & Tokens</h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Configure crimson accents, charcoal surfaces, and real-time WCAG 2.2 contrast compliance.
            </p>
            <Link href="/admin/branding">
              <Button variant="primary" size="sm" className="w-full bg-red-600 hover:bg-red-700 text-xs font-bold">
                Open Theme Studio
              </Button>
            </Link>
          </div>

          <div className="bg-[#0B0B10] border border-[var(--color-border)] hover:border-red-600/30 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-base text-white">Custom Domains & CNAME</h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Deploy custom domain (e.g. academy.darkspacesecurity.io) with automated TLS certificates.
            </p>
            <Button variant="secondary" size="sm" className="w-full bg-[#12121A] border-zinc-800 text-xs">
              Manage Domains
            </Button>
          </div>

          <div className="bg-[#0B0B10] border border-[var(--color-border)] hover:border-red-600/30 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-base text-white">SCORM & Sandboxed Labs</h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Upload SCORM 1.2/2004 packages, configure xAPI statements, and inspect live attempts.
            </p>
            <Button variant="secondary" size="sm" className="w-full bg-[#12121A] border-zinc-800 text-xs">
              Lab Management
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
