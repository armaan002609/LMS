'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@lms/ui';
import { Shield, PlayCircle, BarChart3, Terminal, Flame, ChevronRight, Award, CheckCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-text)]">
      {/* Dark Space Security Pill Navbar (style.css matching) */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/40">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-wide text-white">
              DARK SPACE <span className="text-[var(--color-primary)]">SECURITY</span>
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] tracking-widest uppercase">
              Secure · Learn · Upgrade
            </span>
          </div>
        </Link>

        {/* Center Pill Menu */}
        <nav className="hidden md:flex items-center gap-6 bg-[#0E0E14] border border-[var(--color-border)] px-6 py-2 rounded-full text-xs font-semibold">
          <Link href="/" className="text-[var(--color-primary)] transition-colors">
            Learning Hub
          </Link>
          <div className="w-px h-3 bg-red-600/40" />
          <Link href="/catalog" className="text-[var(--color-text-muted)] hover:text-white transition-colors">
            All Programs
          </Link>
          <div className="w-px h-3 bg-red-600/40" />
          <Link href="/learn/demo-enrollment" className="text-[var(--color-text-muted)] hover:text-white transition-colors">
            My Enrolled Tracks
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="secondary" size="sm" className="gap-2 bg-[#12121A] border-[var(--color-border)] text-xs">
              <BarChart3 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>Security Console</span>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm" className="text-xs bg-gradient-to-r from-red-600 to-red-800 border-none shadow-md shadow-red-900/30">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-10">
        {/* Cyber Hero Banner (style.css matching) */}
        <section className="relative overflow-hidden rounded-2xl border border-red-900/30 bg-gradient-to-r from-[#120005] via-[#0D0B14] to-[#0A0A10] p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col gap-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/40">
                  <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  Active Security Track
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">Target: CEH & Red Team Operations</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Offensive Cyber Security & Penetration Testing (VAPT)
              </h1>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Module 3: Exploitation Techniques · Hands-on Burp Suite & Metasploit Labs
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <div className="flex flex-col items-start md:items-end">
                <span className="text-sm font-bold text-red-400">45% Completed</span>
                <div className="w-44 h-2 bg-zinc-800 rounded-full overflow-hidden mt-1.5 border border-zinc-700">
                  <div className="bg-gradient-to-r from-red-600 to-red-500 h-full w-[45%] rounded-full" />
                </div>
              </div>
              <Link href="/learn/demo-enrollment">
                <Button variant="primary" size="md" className="gap-2 bg-gradient-to-r from-red-600 to-red-800 border-none font-bold shadow-lg shadow-red-900/40">
                  <PlayCircle className="w-4 h-4" />
                  <span>Resume Lab</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Industry-Leading Cybersecurity Tracks */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[var(--color-primary)]" />
                <span>Featured Cybersecurity & Tech Tracks</span>
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Industry-aligned certifications, virtual labs, and project-based internships
              </p>
            </div>
            <Link href="/catalog" className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
              <span>View All 18 Tracks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: '1',
                title: 'Ethical Hacking & Web Penetration Testing (VAPT)',
                category: 'Offensive Security',
                duration: '40 Hours Lab',
                level: 'Intermediate',
                rating: '4.9',
                skills: ['Burp Suite', 'OWASP Top 10', 'Nmap', 'Metasploit'],
              },
              {
                id: '2',
                title: 'SOC Analyst & Threat Intelligence Operations',
                category: 'Defensive Security',
                duration: '35 Hours Lab',
                level: 'Advanced',
                rating: '4.95',
                skills: ['SIEM / Splunk', 'Wireshark', 'Incident Response', 'MITRE ATT&CK'],
              },
              {
                id: '3',
                title: 'AI in Cyber Defense & Automation',
                category: 'Next-Gen IT',
                duration: '30 Hours Lab',
                level: 'All Levels',
                rating: '4.85',
                skills: ['Anomaly Detection', 'LLM Security', 'Python Automation', 'Cloud Guard'],
              },
            ].map((course) => (
              <div
                key={course.id}
                className="bg-[#0B0B10] border border-[var(--color-border)] hover:border-red-600/40 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-red-950/20 group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-zinc-900 text-red-400 border border-red-900/30">
                      {course.category}
                    </span>
                    <span className="text-[var(--color-text-muted)] text-[11px]">{course.duration}</span>
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-red-400 transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {course.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="text-[10px] bg-zinc-900/80 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-500">★ {course.rating}</span>
                  <Link href="/learn/demo-enrollment">
                    <Button variant="secondary" size="sm" className="bg-[#14141E] border-zinc-800 text-xs hover:border-red-600/50">
                      View Syllabus
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dark Space Security Features Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[#0B0B10] flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-red-950/60 text-red-500 border border-red-900/40">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Verified Cyber Certifications</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Earn cryptographic certificates with unique verification IDs and LinkedIn badges.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[#0B0B10] flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-red-950/60 text-red-500 border border-red-900/40">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Hands-on Sandboxed Labs</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Real-world offensive & defensive CTF simulations with automated grading.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[#0B0B10] flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-red-950/60 text-red-500 border border-red-900/40">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Project-Based Internships</h4>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Work on live security tools, CVE audits, and threat emulation scripts.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] bg-[#030305] px-6 py-8 mt-12 text-center text-xs text-[var(--color-text-muted)]">
        <p>© 2026 Dark Space Security (darkspacesecurity.io). All rights reserved. Secure · Learn · Upgrade.</p>
      </footer>
    </div>
  );
}
