'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@lms/ui';
import {
  PlayCircle,
  CheckCircle,
  Lock,
  ArrowLeft,
  Terminal,
  FileCode,
  RotateCcw,
  Flag,
  Clock,
  Send,
  ShieldAlert
} from 'lucide-react';

export default function CoursePlayerPage() {
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

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalCommand.trim()) return;

    let response = '';
    const cmd = terminalCommand.trim().toLowerCase();

    if (cmd === 'help') {
      response = 'Available commands: nmap, curl, sqlmap, whoami, ifconfig, cat user.txt, clear';
    } else if (cmd.includes('cat user.txt') || cmd.includes('flag')) {
      response = 'DSS{burp_repeater_sqli_byp4ss_9912}';
    } else if (cmd === 'whoami') {
      response = 'www-data (uid=33, gid=33)';
    } else if (cmd === 'ifconfig') {
      response = 'tun0: inet 10.10.14.82 netmask 255.255.254.0 (Dark Space VPN)';
    } else if (cmd === 'clear') {
      setTerminalHistory(['kali@darkspace-lab:~$ _']);
      setTerminalCommand('');
      return;
    } else {
      response = `[+] Executed: ${cmd}\n[*] Target 10.10.11.45 responded 200 OK`;
    }

    setTerminalHistory((prev) => [
      ...prev.slice(0, -1),
      `kali@darkspace-lab:~$ ${terminalCommand}`,
      response,
      'kali@darkspace-lab:~$ _'
    ]);
    setTerminalCommand('');
  };

  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flagInput.trim().toUpperCase().includes('DSS{') || flagInput.length > 5) {
      setFlagSubmitted(true);
    }
  };

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
            <img
              src="/logo-mark.png"
              alt="Logo"
              className="w-5 h-7 object-contain drop-shadow-[0_0_6px_rgba(255,0,0,0.5)]"
            />
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Ethical Hacking & Web Penetration Testing (VAPT)</span>
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-mono">
                  LAB-03
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono">
                Target Machine: <span className="text-emerald-400 font-bold">10.10.11.45</span> · Assigned Attack Box: <span className="text-zinc-300">10.10.14.82</span>
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
            onClick={() => alert('Virtual machine target reset initiated')}
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
              Module 3: Exploitation
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">4 / 6 Done</span>
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
                <span className="truncate">2. Burp Repeater SQLi Bypass</span>
              </div>
              <span className="text-[10px] text-red-400 font-bold">Active</span>
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
                <span className="truncate">4. Root Flag Extraction</span>
              </div>
              <span className="text-[10px] text-zinc-500">+150 pts</span>
            </div>
          </div>

          <div className="mt-auto p-3 rounded-lg border border-red-950/60 bg-red-950/20 text-[11px] text-red-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>Target machine is completely sandboxed. Automated telemetry verifies flag integrity.</p>
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
              <Terminal className="w-4 h-4 text-red-500" />
              <span>Kali Web Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab('flags')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'flags'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Flag className="w-4 h-4 text-amber-500" />
              <span>Submit Flags ({flagSubmitted ? '1/1' : '0/1'})</span>
            </button>
          </div>

          {/* Tab 1: Lab Guide */}
          {activeTab === 'guide' && (
            <div className="p-8 max-w-4xl flex flex-col gap-6 overflow-y-auto">
              <div className="flex items-center gap-2 text-xs font-mono text-red-400">
                <span>VULNERABILITY ID: CWE-89 (SQL INJECTION)</span>
                <span>·</span>
                <span>SEVERITY: CRITICAL (CVSS 9.8)</span>
              </div>

              <h2 className="text-2xl font-black text-white">
                Burp Suite Repeater & SQL Injection Authentication Bypass
              </h2>

              <div className="p-4 rounded-xl border border-zinc-800 bg-[#0C0C14] text-xs font-mono text-zinc-300 leading-relaxed flex flex-col gap-2">
                <span className="text-red-400 font-bold uppercase tracking-wider">[TASK OBJECTIVES]</span>
                <p>1. Open Burp Suite and configure your browser proxy to 127.0.0.1:8080.</p>
                <p>2. Intercept the login POST request to <code>http://10.10.11.45/admin/login.php</code>.</p>
                <p>3. Send request to Repeater and inject SQL payload: <code>admin' OR '1'='1' -- -</code>.</p>
                <p>4. Locate the user flag in the session response and submit below.</p>
              </div>

              <div className="flex flex-col gap-4 text-sm text-zinc-300 leading-relaxed">
                <h3 className="text-base font-bold text-white">Detailed Instructions</h3>
                <p>
                  When user credentials are concatenated directly into SQL queries without parameterized prepared statements,
                  an attacker can alter the query structure. In this lab, the backend query resembles:
                </p>
                <pre className="p-4 rounded-lg bg-[#020204] border border-zinc-800 text-xs font-mono text-amber-300 overflow-x-auto">
                  SELECT * FROM operators WHERE email = &apos;&apos; OR &apos;1&apos;=&apos;1&apos; -- &apos; AND password_hash = &apos;...&apos;;
                </pre>
                <p>
                  Use the integrated <strong>Kali Web Terminal</strong> tab above to send test curl commands or verify your VPN connection.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Interactive Kali Web Terminal */}
          {activeTab === 'terminal' && (
            <div className="flex-1 flex flex-col p-6 bg-[#020204]">
              <div className="flex items-center justify-between pb-3 text-xs font-mono text-zinc-400">
                <span>Target: 10.10.11.45 | Session: ttyS0 | Shell: zsh</span>
                <span className="text-emerald-400">● LIVE PTY CONNECTED</span>
              </div>

              <div className="flex-1 rounded-xl bg-[#000000] border border-zinc-800 p-4 font-mono-code text-xs text-zinc-300 overflow-y-auto flex flex-col justify-between shadow-2xl">
                <div className="flex flex-col gap-1">
                  {terminalHistory.map((line, idx) => (
                    <div
                      key={idx}
                      className={
                        line.startsWith('kali@')
                          ? 'text-white font-bold'
                          : line.includes('open')
                          ? 'text-emerald-400'
                          : line.includes('CVE') || line.includes('DSS{')
                          ? 'text-red-400 font-bold'
                          : 'text-zinc-400'
                      }
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {/* Command Input Form */}
                <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-4 border-t border-zinc-900 mt-4">
                  <span className="text-emerald-400 font-bold">kali@darkspace-lab:~$</span>
                  <input
                    type="text"
                    value={terminalCommand}
                    onChange={(e) => setTerminalCommand(e.target.value)}
                    placeholder="Type command (e.g. cat user.txt, whoami, ifconfig, help)..."
                    className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs placeholder:text-zinc-600"
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
                    <span>FLAG VERIFIED! +100 Points Awarded</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Flag <code>DSS&#123;burp_repeater_sqli_byp4ss_9912&#125;</code> successfully validated. You have unlocked Module 4.
                  </p>
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
