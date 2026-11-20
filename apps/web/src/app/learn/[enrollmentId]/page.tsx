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
  ArrowLeft,
  FileCode,
  RotateCcw,
  Flag,
  Clock,
  Send,
  ShieldAlert,
  Terminal as TerminalIcon,
  Video,
  Radio,
  Download,
  Users,
  Maximize2,
  Volume2,
  Play,
  Pause,
} from 'lucide-react';

export default function CoursePlayerPage({ params }: { params: { enrollmentId: string } }) {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'lecture' | 'live' | 'guide' | 'terminal' | 'flags'>('lecture');
  const [flagInput, setFlagInput] = useState('');
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  // Video Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');
  const [videoProgress, setVideoProgress] = useState(38); // 38% watched

  // Live class chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; time: string; text: string; role?: string }>>([
    { sender: 'Instructor', time: '18:02', text: 'Welcome team! Today we are demonstrating Spring Boot Actuator exploit chains.', role: 'instructor' },
    { sender: 'Operator_91', time: '18:04', text: 'Target host is reachable over VPN gateway 10.10.14.82.' },
    { sender: 'Cadet_Z', time: '18:06', text: 'Will this recording be uploaded after the stream?' },
    { sender: 'Instructor', time: '18:07', text: 'Yes, full 4K recorded lectures are archived immediately under the Lecture tab.', role: 'instructor' },
  ]);
  const [newChatInput, setNewChatInput] = useState('');

  // Terminal state
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

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: user?.name || 'You',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: newChatInput.trim(),
      },
    ]);
    setNewChatInput('');
  };

  const courseTitle = course?.title || 'Cyber Security Specialist';
  const targetIp = course?.targetLabIp || '10.10.11.45';

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-[var(--color-text)] font-sans">
      {/* Top Bar with Lab Target Telemetry */}
      <header className="border-b border-zinc-800/80 px-6 py-3 flex items-center justify-between bg-[#08080E] sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 text-red-500" />
              <span>Back to Portal</span>
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="border-l border-zinc-800 pl-3">
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{courseTitle}</span>
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-900/40 px-2 py-0.5 rounded font-mono">
                  {course?.category || 'Academy Track'}
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
        {/* Left Curriculum Outline */}
        <aside className="w-full md:w-80 border-r border-zinc-800/80 bg-[#08080C] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Curriculum Modules
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              {flagSubmitted ? '100% Done' : '40% Done'}
            </span>
          </div>

          <div className="flex flex-col gap-2 font-mono text-xs">
            {/* Module 1: Lecture */}
            <button
              onClick={() => setActiveTab('lecture')}
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                activeTab === 'lecture'
                  ? 'bg-[#141422] border-red-600/80 text-white shadow-sm shadow-red-950/30'
                  : 'bg-[#0A0A10] border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500 shrink-0" />
                <span className="truncate">1. Recorded Lecture</span>
              </div>
              <span className="text-[10px] text-zinc-400">45 Min</span>
            </button>

            {/* Module 2: Live Class */}
            <button
              onClick={() => setActiveTab('live')}
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                activeTab === 'live'
                  ? 'bg-[#141422] border-red-600/80 text-white shadow-sm shadow-red-950/30'
                  : 'bg-[#0A0A10] border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                <span className="truncate">2. Live Interactive Class</span>
              </div>
              <span className="text-[10px] text-red-400 font-bold">LIVE</span>
            </button>

            {/* Module 3: Hands-on Lab */}
            <button
              onClick={() => setActiveTab('terminal')}
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                activeTab === 'terminal' || activeTab === 'guide'
                  ? 'bg-[#141422] border-red-600/80 text-white shadow-sm shadow-red-950/30'
                  : 'bg-[#0A0A10] border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">3. Kali Virtual Attack Lab</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">+100 pts</span>
            </button>

            {/* Module 4: Flag Submission */}
            <button
              onClick={() => setActiveTab('flags')}
              className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                activeTab === 'flags'
                  ? 'bg-[#141422] border-red-600/80 text-white shadow-sm shadow-red-950/30'
                  : 'bg-[#0A0A10] border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">4. Proof Flag Submission</span>
              </div>
              <span className="text-[10px] text-amber-400 font-bold">CTF</span>
            </button>
          </div>

          <div className="mt-auto p-3 rounded-lg border border-red-950/60 bg-red-950/20 text-[11px] text-red-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>Target machine {targetIp} is completely isolated. Automated telemetry tracks lecture completion and lab flags.</p>
          </div>
        </aside>

        {/* Right Main Viewer */}
        <main className="flex-1 flex flex-col bg-[#050508] overflow-y-auto">
          {/* Navigation Bar between Modes */}
          <div className="flex items-center gap-2 border-b border-zinc-800/80 px-6 pt-3 bg-[#08080C] text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('lecture')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'lecture'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Recorded Lecture</span>
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'live'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Live Class & Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'guide'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Lab Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
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
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'flags'
                  ? 'border-red-500 text-white font-bold'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>Submit Flags</span>
            </button>
          </div>

          {/* TAB 1: RECORDED LECTURE (VIDEO PLAYER) */}
          {activeTab === 'lecture' && (
            <div className="p-6 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto w-full">
              {/* Cinema Cyber Video Player */}
              <div className="relative aspect-video w-full bg-[#020204] border border-[#1E1E28] rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between group">
                {/* Background Poster Simulation */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),rgba(0,0,0,0.95))] flex items-center justify-center">
                  <div className="text-center p-6 flex flex-col items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-900/50 hover:scale-105 transition-all"
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1 fill-current" />}
                    </button>
                    <span className="text-xs font-mono text-zinc-400">
                      {isPlaying ? 'Streaming Session In Progress' : 'Click to Play Recorded Lecture'}
                    </span>
                  </div>
                </div>

                {/* Video Top Overlay */}
                <div className="relative z-10 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-900/60 text-[10px] font-mono font-bold uppercase">
                      4K On-Demand Lecture
                    </span>
                    <span className="text-xs font-bold text-white truncate">{courseTitle} — Full Masterclass</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">Auto-Resume Active</span>
                </div>

                {/* Video Player Controls Bar */}
                <div className="relative z-10 p-4 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-2">
                  {/* Progress scrubber */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const pct = Math.round((clickX / rect.width) * 100);
                      setVideoProgress(Math.min(100, Math.max(0, pct)));
                    }}
                    className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden cursor-pointer"
                  >
                    <div className="bg-red-600 h-full rounded-full transition-all" style={{ width: `${videoProgress}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>
                      <div className="flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-zinc-400" />
                        <span>18:42 / 48:50</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Speed selector */}
                      <div className="flex items-center gap-1 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                        {['1x', '1.25x', '1.5x', '2x'].map((s) => (
                          <button
                            key={s}
                            onClick={() => setPlaybackSpeed(s)}
                            className={`px-1.5 rounded ${playbackSpeed === s ? 'text-red-400 font-bold' : 'text-zinc-500 hover:text-white'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      <button className="hover:text-white">
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lecture Description & Resources */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col gap-3">
                  <h2 className="text-xl font-bold text-white">Lecture Overview: Core Concepts & Live Exploit Setup</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    In this session, our senior instructors break down offensive attack vectors, network service enumeration, and automated vulnerability scanning. Follow along with your assigned target machine in the Kali Terminal tab.
                  </p>

                  <div className="p-4 bg-[#0B0B12] border border-zinc-800 rounded-xl mt-2 flex flex-col gap-2">
                    <span className="text-xs font-bold text-white font-mono uppercase text-red-400">Chapters:</span>
                    <ul className="text-xs space-y-1.5 font-mono text-zinc-300">
                      <li className="flex items-center justify-between cursor-pointer hover:text-red-400">
                        <span>00:00 — Introduction & Lab Architecture</span>
                        <span className="text-zinc-500">08:15</span>
                      </li>
                      <li className="flex items-center justify-between cursor-pointer hover:text-red-400 text-red-400">
                        <span>08:15 — Hands-on Nmap Service Probing</span>
                        <span className="text-zinc-500">18:42</span>
                      </li>
                      <li className="flex items-center justify-between cursor-pointer hover:text-red-400">
                        <span>18:42 — Exploiting Misconfigured Actuators</span>
                        <span className="text-zinc-500">32:10</span>
                      </li>
                      <li className="flex items-center justify-between cursor-pointer hover:text-red-400">
                        <span>32:10 — Privilege Escalation to Root Flag</span>
                        <span className="text-zinc-500">48:50</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Downloadable Resources */}
                <div className="bg-[#0B0B10] border border-[#1E1E28] rounded-xl p-5 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-red-500" />
                    <span>Lecture Materials</span>
                  </h3>
                  <div className="flex flex-col gap-2 text-xs">
                    <button
                      onClick={() => alert('Downloading official lecture slide deck')}
                      className="p-2.5 rounded-lg bg-[#07070A] border border-zinc-800 hover:border-zinc-700 text-left flex items-center justify-between text-zinc-300"
                    >
                      <span>Presentation Slides (PDF)</span>
                      <Download className="w-3.5 h-3.5 text-red-400" />
                    </button>
                    <button
                      onClick={() => alert('Downloading vulnerability cheat sheet')}
                      className="p-2.5 rounded-lg bg-[#07070A] border border-zinc-800 hover:border-zinc-700 text-left flex items-center justify-between text-zinc-300"
                    >
                      <span>Command Cheat Sheet</span>
                      <Download className="w-3.5 h-3.5 text-red-400" />
                    </button>
                    <button
                      onClick={() => alert('Downloading source code repository')}
                      className="p-2.5 rounded-lg bg-[#07070A] border border-zinc-800 hover:border-zinc-700 text-left flex items-center justify-between text-zinc-300"
                    >
                      <span>Sample Exploit Scripts (.py)</span>
                      <Download className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE INTERACTIVE CLASS */}
          {activeTab === 'live' && (
            <div className="flex-1 flex flex-col md:flex-row h-full">
              {/* Live Video Broadcast Stream */}
              <div className="flex-1 p-6 md:p-8 flex flex-col gap-4">
                <div className="relative aspect-video w-full bg-[#020204] border border-red-950/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
                  {/* Live Badge */}
                  <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                      <Radio className="w-3.5 h-3.5" />
                      LIVE STREAM BROADCAST
                    </span>
                    <span className="text-xs font-mono text-zinc-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>42 Operators Attending</span>
                    </span>
                  </div>

                  {/* Instructor Live Frame Simulation */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400 mb-3">
                      <Radio className="w-8 h-8 animate-ping" />
                    </div>
                    <h3 className="text-base font-bold text-white">Live Cohort Session in Progress</h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md">
                      Instructor is sharing live screen for <strong>{courseTitle}</strong>. Join the interactive voice/video room below.
                    </p>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => alert('Launching interactive WebRTC / Zoom Live Classroom...')}
                      className="mt-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 font-bold text-xs gap-2 shadow-lg shadow-red-950/50"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Join Interactive Live Room</span>
                    </Button>
                  </div>

                  {/* Bottom stream telemetry */}
                  <div className="p-4 bg-gradient-to-t from-black/90 to-transparent text-xs font-mono text-zinc-400 flex items-center justify-between">
                    <span>Host: Senior Security Architect (DarkSpace Red Team)</span>
                    <span className="text-emerald-400">Latency: 28ms (HD 1080p 60fps)</span>
                  </div>
                </div>

                <div className="bg-[#0B0B10] border border-[#1E1E28] rounded-xl p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">Next Scheduled Live Session</span>
                    <span className="text-zinc-400 text-[11px]">Advanced Buffer Overflow & Kernel Exploitation · Tomorrow at 14:00 UTC</span>
                  </div>
                  <Button variant="secondary" size="sm" className="bg-[#12121A] text-xs">
                    Add to Calendar
                  </Button>
                </div>
              </div>

              {/* Live Classroom Q&A Chat Sidebar */}
              <div className="w-full md:w-80 border-l border-zinc-800/80 bg-[#08080C] flex flex-col justify-between p-4">
                <div>
                  <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Live Session Chat</span>
                    <span className="text-[10px] text-emerald-400 font-mono">● Online</span>
                  </div>

                  <div className="py-4 space-y-3 overflow-y-auto max-h-[400px]">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className="text-xs flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className={`font-bold ${msg.role === 'instructor' ? 'text-red-400' : 'text-zinc-300'}`}>
                            {msg.sender}
                          </span>
                          <span className="text-[10px] text-zinc-600">{msg.time}</span>
                        </div>
                        <p className="text-zinc-400 bg-[#0D0D14] p-2 rounded-lg border border-zinc-900 leading-snug">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendChat} className="pt-3 border-t border-zinc-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={newChatInput}
                    onChange={(e) => setNewChatInput(e.target.value)}
                    placeholder="Ask instructor a question..."
                    className="flex-1 bg-[#050508] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                  <button type="submit" className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: LAB GUIDE & WALKTHROUGH */}
          {activeTab === 'guide' && (
            <div className="p-8 max-w-3xl flex flex-col gap-6 text-sm text-zinc-300 leading-relaxed">
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

          {/* TAB 4: INTERACTIVE TERMINAL */}
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

          {/* TAB 5: FLAG SUBMISSION */}
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
