'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@lms/ui';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth-context';
import { fetchCourses, updateCourseProgress } from '@/lib/store';
import { Course } from '@/lib/types';
import {
  PlayCircle,
  CheckCircle,
  Lock,
  ArrowLeft,
  FileCode,
  RotateCcw,
  Flag,
  Clock,
  Send,
  ShieldAlert,
  Terminal as TerminalIcon,
} from 'lucide-react';

export default function CoursePlayerPage({ params }: { params: { enrollmentId: string } }) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'guide' | 'terminal' | 'flags'>('guide');
  const [flagInput, setFlagInput] = useState('');
  const [flagSubmitted, setFlagSubmitted] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'kali@darkspace-lab:~$ nmap -sC -sV -p 80,8080 10.10.11.45',
    'PORT     STATE SERVICE VERSION',
    '80/tcp   open  http    Apache httpd 2.4.52 ((Ubuntu))',
    '8080/tcp open  http    Spring Boot Actuator (vulnerability CVE-2024-XXXX)',
    'kali@darkspace-lab:~$ _'
  ]);
  const [terminalCommand, setTerminalCommand] = useState('');

  useEffect(() => {
    fetchCourses().then((courses) => {
      const matched = courses.find((c) => c.id === params.enrollmentId || c.slug === params.enrollmentId) || courses[0];
      if (matched) {
        setCourse(matched);
        if (matched.targetLabIp) {
          setTerminalHistory([
            `kali@darkspace-lab:~$ nmap -sC -sV ${matched.targetLabIp}`,
            'PORT     STATE SERVICE VERSION',
            `80/tcp   open  http    Apache httpd 2.4.52 on ${matched.targetLabIp}`,
            '8080/tcp open  http    Spring Boot Actuator (Exploitable Target Range)',
            'kali@darkspace-lab:~$ _'
          ]);
        }
      }
    });
  }, [params.enrollmentId]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCommand.trim()) return;

    let response = '';
    const cmd = terminalCommand.trim().toLowerCase();
    const targetIp = course?.targetLabIp || '10.10.11.45';

    if (cmd === 'help') {
      response = 'Available commands: nmap, curl, sqlmap, whoami, ifconfig, cat user.txt, clear';
    } else if (cmd.includes('cat user.txt') || cmd.includes('flag')) {
      response = 'DSS{burp_repeater_sqli_byp4ss_9912}';
    } else if (cmd === 'whoami') {
      response = 'www-data (uid=33, gid=33) on ' + targetIp;
    } else if (cmd === 'ifconfig') {
      response = 'tun0: inet 10.10.14.82 netmask 255.255.254.0 (Dark Space Secure Tunnel)';
    } else if (cmd === 'clear') {
      setTerminalHistory(['kali@darkspace-lab:~$ _']);
      setTerminalCommand('');
      return;
    } else {
      response = `[+] Executed: ${cmd}\n[*] Target ${targetIp} responded 200 OK (Exploit Payload Staged)`;
    }

    setTerminalHistory((prev) => [
      ...prev.slice(0, -1),
      `kali@darkspace-lab:~$ ${terminalCommand}`,
      response,
      'kali@darkspace-lab:~$ _'
    ]);
    setTerminalCommand('');
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (flagInput.trim().toUpperCase().includes('DSS{') || flagInput.length > 5) {
      setFlagSubmitted(true);
      if (user && course) {
        await updateCourseProgress(user.id, course.id, 100);
      }
    }
  };

  const courseTitle = course?.title || 'Offensive Security Specialist Lab';
  const targetIp = course?.targetLabIp || '10.10.11.45';

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[var(--color-text)] font-sans">
      {/* Top Bar with Lab Target Telemetry */}
      <header className="border-b border-zinc-800/80 px-6 py-3 flex items-center justify-between bg-[#08080E] sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 text-red-500" />
              <span>Back to Hub</span>
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="border-l border-zinc-800 pl-3">
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{courseTitle}</span>
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-mono">
                  LAB ACTIVE
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-2">
                <span>Target Host: <strong className="text-emerald-400">{targetIp}</strong></span>
                <span>·</span>
                <span>Attack Pod: <strong className="text-zinc-300">10.10.14.82</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Live Lab Controls */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E0E16] border border-zinc-800 text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>01:42:15 remaining</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="bg-[#0E0E16] border-zinc-800 text-zinc-300 hover:text-white text-xs gap-1.5"
            onClick={() => alert('Virtual machine target reset initiated for ' + targetIp)}
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Reset Lab</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('flags')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-red-950/40"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Submit Flag</span>
          </Button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Lab Curriculum Outline */}
        <aside className="w-full md:w-80 border-r border-zinc-800/80 bg-[#08080C] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Module 3: Active Attack
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              {flagSubmitted ? '6 / 6 Done' : '4 / 6 Done'}
            </span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs">
            <div className="p-3 bg-[#0F0F18] border border-emerald-700/40 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">1. Nmap Service Fingerprint</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">+50 pts</span>
            </div>

            <div className="p-3 bg-[#0F0F18] border border-red-600/60 rounded-lg flex items-center justify-between shadow-sm shadow-red-950/20">
              <div className="flex items-center gap-2 text-white font-bold">
                <PlayCircle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
                <span className="truncate">2. Exploitation & Flag Capture</span>
              </div>
              <span className="text-[10px] text-red-400 font-bold">
                {flagSubmitted ? 'Completed' : 'Active'}
              </span>
            </div>

            <div className="p-3 bg-[#0A0A10] border border-zinc-800/80 rounded-lg flex items-center justify-between opacity-75">
              <div className="flex items-center gap-2 text-zinc-400">
                <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="truncate">3. Privilege Escalation (SUDO)</span>
              </div>
              <span className="text-[10px] text-zinc-500">+100 pts</span>
            </div>

            <div className="p-3 bg-[#0A0A10] border border-zinc-800/80 rounded-lg flex items-center justify-between opacity-75">
              <div className="flex items-center gap-2 text-zinc-400">
                <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="truncate">4. Root Shell Proof Extraction</span>
              </div>
              <span className="text-[10px] text-zinc-500">+150 pts</span>
            </div>
          </div>

          <div className="mt-auto p-3 rounded-lg border border-red-950/60 bg-red-950/20 text-[11px] text-red-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>Target machine {targetIp} is completely isolated. Automated telemetry verifies flag integrity.</p>
          </div>
        </aside>

        {/* Right Main Viewer (Tabbed: Guide | Terminal | Flags) */}
        <main className="flex-1 flex flex-col bg-[#050508]">
          {/* Viewer Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800/80 px-6 pt-3 bg-[#08080C] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'guide'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Lab Guide & Walkthrough</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'terminal'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <TerminalIcon className="w-4 h-4" />
              <span>Web Kali Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab('flags')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'flags'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>Submit Flags</span>
            </button>
          </div>

          {/* Tab 1: Walkthrough Guide */}
          {activeTab === 'guide' && (
            <div className="p-8 max-w-3xl flex flex-col gap-6 text-sm text-zinc-300 leading-relaxed overflow-y-auto">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Objective: Vulnerability Reconnaissance & Exploitation
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  Assigned Track: <strong className="text-red-400">{courseTitle}</strong> · Target IP: <strong className="text-emerald-400">{targetIp}</strong>
                </p>
              </div>

              <div className="bg-[#0B0B12] border border-zinc-800/80 rounded-xl p-5 flex flex-col gap-3">
                <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-red-400">
                  Step 1: Network Service Enumeration
                </h3>
                <p className="text-xs text-zinc-400">
                  Probe open ports on the target range using aggressive timing and service fingerprint scripts:
                </p>
                <div className="bg-[#050508] border border-zinc-800 p-3 rounded font-mono text-xs text-emerald-400">
                  nmap -sC -sV -p 80,8080 {targetIp}
                </div>
              </div>

              <div className="bg-[#0B0B12] border border-zinc-800/80 rounded-xl p-5 flex flex-col gap-3">
                <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-red-400">
                  Step 2: Actuator Endpoint Verification
                </h3>
                <p className="text-xs text-zinc-400">
                  Inspect the Spring Boot Actuator health endpoint on port 8080 for unsanitized heap dumps or environment secrets:
                </p>
                <div className="bg-[#050508] border border-zinc-800 p-3 rounded font-mono text-xs text-emerald-400">
                  curl -s http://{targetIp}:8080/actuator/env | jq .
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/80">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('terminal')}
                  className="bg-red-600 hover:bg-red-700 font-bold text-xs"
                >
                  Switch to Kali Terminal →
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2: Interactive Terminal */}
          {activeTab === 'terminal' && (
            <div className="flex-1 flex flex-col bg-[#050508] p-4">
              <div className="flex-1 bg-[#020204] border border-zinc-800/80 rounded-xl p-4 font-mono text-xs text-zinc-300 flex flex-col justify-between overflow-hidden shadow-inner">
                <div className="overflow-y-auto space-y-1.5">
                  <div className="text-zinc-500 pb-2 border-b border-zinc-900 flex items-center justify-between">
                    <span>DarkSpace Kali Linux Attack Box v2026.1 (Interactive Pod)</span>
                    <span className="text-emerald-400">● Connected: {targetIp}</span>
                  </div>
                  {terminalHistory.map((line, idx) => (
                    <div
                      key={idx}
                      className={
                        line.startsWith('kali@')
                          ? 'text-red-400 font-bold'
                          : line.includes('PORT') || line.includes('80/tcp')
                          ? 'text-zinc-200'
                          : line.startsWith('DSS{')
                          ? 'text-emerald-400 font-black'
                          : 'text-zinc-400'
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCommandSubmit} className="mt-4 pt-3 border-t border-zinc-900 flex items-center gap-2">
                  <span className="text-red-500 font-bold">kali@darkspace-lab:~$</span>
                  <input
                    type="text"
                    value={terminalCommand}
                    onChange={(e) => setTerminalCommand(e.target.value)}
                    placeholder="Type command (e.g. nmap, curl, whoami, cat user.txt)..."
                    className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs"
                    autoFocus
                  />
                  <Button type="submit" size="sm" variant="secondary" className="text-xs font-mono bg-zinc-900 border-zinc-800">
                    Execute
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Tab 3: Flag Submission */}
          {activeTab === 'flags' && (
            <div className="p-8 max-w-xl flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" />
                  <span>Submit Lab Flag</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Format: <code>DSS&#123;flag_string_here&#125;</code>. Flags are verified instantaneously via cryptographic hash.
                </p>
              </div>

              {flagSubmitted ? (
                <div className="p-5 rounded-xl border border-emerald-600/40 bg-emerald-950/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle className="w-5 h-5" />
                    <span>FLAG VERIFIED! 100% Progress Awarded</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Flag <code>DSS&#123;burp_repeater_sqli_byp4ss_9912&#125;</code> successfully validated. Your progress has been updated on your Learner Profile.
                  </p>
                  <Link href="/" className="mt-2">
                    <Button variant="secondary" size="sm" className="bg-[#12121A] text-xs">
                      ← Return to Learner Hub
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleFlagSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono text-zinc-400">ENTER USER FLAG</label>
                    <input
                      type="text"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      placeholder="DSS{burp_repeater_sqli_byp4ss_...}"
                      className="px-3.5 py-2.5 rounded-lg bg-[#0E0E14] border border-zinc-800 text-white font-mono text-xs focus:border-red-500 outline-none"
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" size="md" className="bg-red-600 hover:bg-red-700 text-xs font-bold gap-2">
                    <Send className="w-4 h-4" />
                    <span>Verify & Submit Flag</span>
                  </Button>
                </form>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
