'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@lms/ui';
import { Shield, Search, ArrowLeft, Terminal } from 'lucide-react';

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const programs = [
    {
      id: '1',
      title: 'Ethical Hacking & Web Penetration Testing (VAPT)',
      category: 'OFFENSIVE',
      categoryLabel: 'Offensive Security',
      duration: '40 Hours Lab',
      level: 'Intermediate',
      price: 'Certified Track',
      description: 'Hands-on training in SQLi, XSS, SSRF, Burp Suite, Network Sniffing, and Metasploit exploitation.',
    },
    {
      id: '2',
      title: 'SOC Analyst & Incident Response Mastery',
      category: 'DEFENSIVE',
      categoryLabel: 'Defensive Security',
      duration: '35 Hours Lab',
      level: 'Advanced',
      price: 'Certified Track',
      description: 'Analyze telemetry, triage malware alerts, configure SIEM dashboards, and map adversary TTPs to MITRE ATT&CK.',
    },
    {
      id: '3',
      title: 'Cloud Security & AWS/Azure Architecture',
      category: 'CLOUD',
      categoryLabel: 'Cloud & Infrastructure',
      duration: '25 Hours Lab',
      level: 'Intermediate',
      price: 'Certified Track',
      description: 'Secure cloud identities (IAM), audit S3 buckets, harden Kubernetes clusters, and automate CSPM compliance.',
    },
    {
      id: '4',
      title: 'AI in Cyber Defense & Threat Automation',
      category: 'AI',
      categoryLabel: 'AI & Data Science',
      duration: '30 Hours Lab',
      level: 'All Levels',
      price: 'Certified Track',
      description: 'Train machine learning models for anomaly detection, malware classification, and automated firewall response.',
    },
    {
      id: '5',
      title: 'Full Stack Secure Web Development',
      category: 'DEV',
      categoryLabel: 'Secure Engineering',
      duration: '45 Hours Lab',
      level: 'Beginner to Pro',
      price: 'Certified Track',
      description: 'Build enterprise-grade applications with React, Next.js, Node.js, and multi-tenant PostgreSQL RLS.',
    },
  ];

  const filtered = programs.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-text)]">
      {/* Top Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4 text-red-500" />
              <span>Learning Hub</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-bold text-base text-white">Program Catalog</span>
          </div>
        </div>
      </header>

      {/* Main Catalog View */}
      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-red-500" />
            <span>Cyber Security & Technical Programs</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Choose from offensive security, defensive operations, AI security, and cloud engineering tracks.
          </p>
        </div>

        {/* Search & Filter Strip */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Input
              placeholder="Search by topic, tool (e.g. Burp, SOC, Cloud)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#0E0E14] border-zinc-800 text-white placeholder:text-zinc-500"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {['ALL', 'OFFENSIVE', 'DEFENSIVE', 'CLOUD', 'AI', 'DEV'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'bg-[#101018] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {cat === 'ALL' ? 'All Tracks' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-[#0B0B10] border border-[var(--color-border)] hover:border-red-600/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-red-950/20 group"
            >
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-zinc-900 text-red-400 border border-red-900/30">
                    {p.categoryLabel}
                  </span>
                  <span className="text-[var(--color-text-muted)] text-[11px]">{p.duration}</span>
                </div>
                <h3 className="font-bold text-base text-white group-hover:text-red-400 transition-colors mt-1">
                  {p.title}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">{p.price}</span>
                <Link href="/learn/demo-enrollment">
                  <Button variant="primary" size="sm" className="bg-gradient-to-r from-red-600 to-red-800 border-none font-bold text-xs">
                    Start Learning
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
