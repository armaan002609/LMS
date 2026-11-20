'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@lms/ui';
import { Logo } from '@/components/Logo';
import {
  PlayCircle,
  BarChart3,
  Terminal,
  Flame,
  ChevronRight,
  Award,
  CheckCircle2,
  Clock,
  Target,
  FileCode,
  Lock,
  Layers,
  Key
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-text)] cyber-grid">
      {/* Top Navigation Bar with Pill Menu (DarkSpaceSecurity Signature) */}
      <header className="border-b border-[var(--color-border)] bg-[#040406]/90 backdrop-blur-xl px-6 py-3.5 sticky top-0 z-50 flex items-center justify-between">
        {/* Brand Logo & Name Matching Uploaded Asset */}
        <Link href="/" className="group">
          <Logo size="md" showSubtitle />
        </Link>

        {/* Center Pill Menu */}
        <nav className="hidden lg:flex items-center gap-5 bg-[#0C0C12] border border-[var(--color-border)] px-6 py-2 rounded-full text-xs font-semibold shadow-inner">
          <Link href="/" className="text-white hover:text-red-400 transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Learning Hub</span>
          </Link>
          <div className="w-px h-3.5 bg-zinc-800" />
          <Link href="/catalog" className="text-[var(--color-text-muted)] hover:text-white transition-colors">
            All Programs
          </Link>
          <div className="w-px h-3.5 bg-zinc-800" />
          <Link href="/learn/demo-enrollment" className="text-[var(--color-text-muted)] hover:text-white transition-colors">
            My Virtual Labs
          </Link>
          <div className="w-px h-3.5 bg-zinc-800" />
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/40">
            CTF Rank #42
          </span>
        </nav>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          {/* Live VPN Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0C0C12] border border-zinc-800 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-400">VPN:</span>
            <span className="text-emerald-400 font-bold">10.10.14.82</span>
          </div>

          <Link href="/admin">
            <Button variant="secondary" size="sm" className="gap-2 bg-[#0E0E16] border-[var(--color-border)] text-xs hover:border-red-600/40">
              <BarChart3 className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Admin Console</span>
            </Button>
          </Link>

          <Link href="/login">
            <Button variant="primary" size="sm" className="text-xs bg-gradient-to-r from-red-600 to-red-800 border-none font-bold shadow-lg shadow-red-950/50">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-12">
        {/* Hero Section: Editorial & Live Machine HUD */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Column: Heading & Value Prop */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-red-950/70 text-red-400 border border-red-800/40 w-fit">
              <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Winter 2026 Offensive Security Cohort</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Hands-on Cyber Security, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-orange-500">
                VAPT & Ethical Hacking
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed max-w-xl">
              Train in browser-accessible Kali Linux virtual machines, attack live simulated enterprise targets,
              and earn industry-recognized credentials built by active penetration testers.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/learn/demo-enrollment">
                <Button variant="primary" size="lg" className="gap-2.5 bg-gradient-to-r from-red-600 via-red-700 to-red-800 border-none font-bold shadow-xl shadow-red-950/60 text-sm">
                  <PlayCircle className="w-5 h-5" />
                  <span>Resume Live Lab</span>
                </Button>
              </Link>

              <Link href="/catalog">
                <Button variant="secondary" size="lg" className="gap-2 bg-[#0C0C12] border-zinc-800 hover:border-zinc-700 text-sm font-semibold">
                  <span>Browse 18 Tracks</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </Button>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-6 pt-3 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">50K+</span>
                <span>Graduates</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">120+</span>
                <span>Virtual Labs</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-400 text-sm">99.9%</span>
                <span>Sandbox Uptime</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Lab Attack Box HUD Widget */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-2xl p-5 border border-zinc-800 glow-subtle flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

              {/* HUD Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <Terminal className="w-4 h-4 text-red-500" />
                  <span className="font-bold text-white">TARGET MACHINE HUD</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">ONLINE</span>
                </div>
              </div>

              {/* Lab Metadata Details */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-[#07070B] p-2.5 rounded-lg border border-zinc-800/70 flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 uppercase">Target Host IP</span>
                  <span className="text-white font-bold text-sm">10.10.11.45</span>
                  <span className="text-[10px] text-red-400">web-vapt.internal</span>
                </div>
                <div className="bg-[#07070B] p-2.5 rounded-lg border border-zinc-800/70 flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 uppercase">Time Remaining</span>
                  <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>01:42:15</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">+30m Available</span>
                </div>
              </div>

              {/* Terminal Output Snapshot */}
              <div className="bg-[#030305] rounded-lg p-3 border border-zinc-800 font-mono-code text-[11px] text-zinc-300 leading-relaxed flex flex-col gap-1">
                <div className="flex items-center gap-1.5 pb-1 border-b border-zinc-900 text-[10px] text-zinc-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-950 border border-red-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-amber-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-950 border border-emerald-700" />
                  <span className="ml-1 text-zinc-400">kali@darkspace:~# nmap -sV -p 80,443,8080 10.10.11.45</span>
                </div>
                <p className="text-zinc-400 pt-1">PORT &nbsp; &nbsp; STATE SERVICE &nbsp; &nbsp;VERSION</p>
                <p className="text-emerald-400">80/tcp &nbsp; open &nbsp;http &nbsp; &nbsp; &nbsp; Apache 2.4.52</p>
                <p className="text-amber-400">8080/tcp open &nbsp;http-proxy &nbsp;Spring Boot Actuator</p>
                <p className="text-red-400">└── [VULN] CVE-2024-XXXX Unauthenticated Endpoint Found</p>
              </div>

              {/* Action */}
              <Link href="/learn/demo-enrollment">
                <Button variant="primary" size="sm" className="w-full bg-red-600 hover:bg-red-700 font-bold text-xs gap-2 py-2.5 shadow-md shadow-red-950/40">
                  <Terminal className="w-4 h-4" />
                  <span>Launch Web Attack Console</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Grid: Why Dark Space Security */}
        <section className="flex flex-col gap-6 pt-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">
                BENTO CAPABILITIES
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Engineered for Offensive & Defensive Mastery
              </h2>
            </div>
            <Link href="/catalog" className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1">
              <span>Explore Curriculum</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {/* Bento Card 1: Large Featured VAPT */}
            <div className="md:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between border border-zinc-800 relative overflow-hidden group">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-3 py-1 rounded-md bg-red-950/80 text-red-400 border border-red-800/40 font-bold">
                    PRIMARY FLAGSHIP TRACK
                  </span>
                  <span className="text-zinc-500">40 Hours Live Labs</span>
                </div>

                <h3 className="text-xl font-extrabold text-white group-hover:text-red-400 transition-colors">
                  Web Application Penetration Testing & Bug Bounty (VAPT)
                </h3>

                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-lg">
                  Master the OWASP Top 10 vulnerabilities with dedicated sandbox environments.
                  Exploit blind SQL injection, server-side request forgery (SSRF), JWT bypasses, and multi-step privilege escalation.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {['Burp Suite Pro', 'SQLmap', 'OWASP ZAP', 'Postman API', 'Linux PrivEsc'].map((tool, idx) => (
                    <span key={idx} className="text-[11px] font-mono bg-[#07070B] text-zinc-300 px-2.5 py-1 rounded border border-zinc-800">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Includes Project-Based Internship</span>
                </span>
                <Link href="/learn/demo-enrollment">
                  <Button variant="secondary" size="sm" className="bg-[#12121A] text-xs font-bold border-zinc-800 hover:border-red-600/40">
                    Open Lab Track
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bento Card 2: Live CTF Scoreboard */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-zinc-800">
              <div className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/40 text-red-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-base text-white">Live CTF Arena</h4>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  Compete in weekly challenge boxes. Capture user.txt and root.txt flags to climb the global rankings.
                </p>
              </div>

              <div className="bg-[#07070B] rounded-lg p-3 border border-zinc-800/70 text-xs font-mono mt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Rank:</span>
                  <span className="text-white font-bold">#42 Worldwide</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Flags Captured:</span>
                  <span className="text-emerald-400 font-bold">14 / 32</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Points Balance:</span>
                  <span className="text-amber-400 font-bold">1,850 pts</span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Verifiable Credentials */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-zinc-800">
              <div className="flex flex-col gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/40 text-red-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-base text-white">Cryptographic Certs</h4>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  Publicly verifiable certificates with SHA-256 hashes and LinkedIn credential integration.
                </p>
              </div>

              <div className="bg-[#07070B] rounded-lg p-3 border border-zinc-800/70 text-[11px] font-mono mt-4 flex flex-col gap-1.5">
                <span className="text-zinc-500 uppercase text-[9px]">Latest Issued Cert</span>
                <span className="text-white font-bold truncate">CERT-2026-DSS-VAPT-9481</span>
                <span className="text-emerald-400 text-[10px]">✓ Publicly Verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Professional Cybersecurity Tracks */}
        <section className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-mono text-red-500 uppercase tracking-widest font-bold">
              INDUSTRY ALIGNED
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              Curriculum Aligned with Industry Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                id: 'ceh',
                title: 'Certified Ethical Hacker (CEH v12)',
                category: 'Offensive',
                hours: '40 Hours',
                level: 'Intermediate',
                icon: Key,
                bullets: ['Recon & Scanning', 'Metasploit Framework', 'Privilege Escalation'],
              },
              {
                id: 'soc',
                title: 'SOC Analyst & SIEM Threat Hunting',
                category: 'Defensive',
                hours: '35 Hours',
                level: 'Advanced',
                icon: Layers,
                bullets: ['Splunk & Elastic SIEM', 'Wireshark Packet Analysis', 'MITRE ATT&CK Mapping'],
              },
              {
                id: 'cloud',
                title: 'Cloud Security & DevSecOps',
                category: 'Infrastructure',
                hours: '30 Hours',
                level: 'Intermediate',
                icon: Lock,
                bullets: ['AWS IAM Auditing', 'Kubernetes Hardening', 'CI/CD Pipeline Scanning'],
              },
              {
                id: 'ai',
                title: 'AI in Cyber Defense & Automation',
                category: 'Next-Gen IT',
                hours: '25 Hours',
                level: 'All Levels',
                icon: FileCode,
                bullets: ['Anomaly Detection', 'LLM Jailbreak Audits', 'Automated Triage Scripts'],
              },
            ].map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.id}
                  className="bg-[#09090F] border border-zinc-800/90 hover:border-red-600/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-red-950/20 group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-900 text-red-400 border border-zinc-800">
                        {track.category}
                      </span>
                      <span className="text-zinc-500 font-mono text-[11px]">{track.hours}</span>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center group-hover:text-red-400 group-hover:border-red-600/30 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>

                    <h4 className="font-bold text-base text-white group-hover:text-red-400 transition-colors leading-snug">
                      {track.title}
                    </h4>

                    <ul className="text-xs text-zinc-400 flex flex-col gap-1.5 pt-1">
                      {track.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-red-500" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500">{track.level}</span>
                    <Link href="/catalog">
                      <Button variant="secondary" size="sm" className="bg-[#101018] border-zinc-800 text-xs font-semibold hover:border-red-600/50">
                        View Track
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Corporate Trust & Hiring Partners */}
        <section className="glass-panel rounded-2xl p-6 border border-zinc-800 text-center flex flex-col gap-4">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold">
            TRUSTED TRAINING PARTNERS & HIRING NETWORKS
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-sm font-extrabold text-zinc-500">
            <span className="hover:text-white transition-colors">CROWDSTRIKE</span>
            <span className="hover:text-white transition-colors">PALO ALTO NETWORKS</span>
            <span className="hover:text-white transition-colors">SENTINELONE</span>
            <span className="hover:text-white transition-colors">CISCO TALOS</span>
            <span className="hover:text-white transition-colors">BUGGROWD</span>
            <span className="hover:text-white transition-colors">HACKERONE</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[#020204] px-6 py-8 mt-12 flex flex-col items-center gap-3 text-center text-xs text-zinc-500">
        <Logo size="sm" />
        <p>© 2026 DarkSpaceSecurity (darkspacesecurity.io). All rights reserved. Secure · Learn · Upgrade.</p>
        <p className="font-mono text-[11px] text-zinc-600">Enterprise Multi-Tenant Learning System · AES-256 Encrypted Lab Sandboxes</p>
      </footer>
    </div>
  );
}
