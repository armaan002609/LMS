'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@lms/ui';
import { PlayCircle, CheckCircle, Lock, ArrowLeft, Terminal, FileCode, Check } from 'lucide-react';

export default function CoursePlayerPage() {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-text)]">
      {/* Topbar */}
      <header className="border-b border-[var(--color-border)] px-6 py-3.5 flex items-center justify-between bg-[#07070B]">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4 text-red-500" />
              <span>Back</span>
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-red-950 flex items-center justify-center border border-red-800/40">
              <Terminal className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">
                Ethical Hacking & Web Penetration Testing (VAPT)
              </h1>
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Module 3 · Lesson 2: Burp Suite Repeater & Intruder Attacks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-red-400">
            {completed ? '100% Lab Finished' : '45% In Progress'}
          </span>
          <Button
            variant={completed ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setCompleted(!completed)}
            className={completed ? 'bg-zinc-800 text-zinc-300' : 'bg-red-600 hover:bg-red-700 text-white font-bold'}
          >
            {completed ? <Check className="w-3.5 h-3.5 mr-1" /> : null}
            <span>{completed ? 'Lab Completed' : 'Mark Lab Complete'}</span>
          </Button>
        </div>
      </header>

      {/* Split Lab Player */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Outline */}
        <aside className="w-full md:w-80 border-r border-[var(--color-border)] bg-[#0A0A10] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Lab Modules & Exercises
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="p-3 bg-[#11111A] border border-red-600/50 rounded-lg flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                {completed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <PlayCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-xs font-semibold text-white">1. Burp Suite Setup & Scope</span>
              </div>
              <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded">Lab</span>
            </div>

            <div className="p-3 bg-[#0E0E14] border border-zinc-800/80 rounded-lg flex items-center justify-between cursor-pointer opacity-80">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-300">2. SQL Injection Bypass</span>
              </div>
              <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">Lab</span>
            </div>

            <div className="p-3 bg-[#0E0E14] border border-zinc-800/80 rounded-lg flex items-center justify-between cursor-pointer opacity-80">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-300">3. Cross-Site Scripting (XSS)</span>
              </div>
              <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">Lab</span>
            </div>
          </div>
        </aside>

        {/* Right Lab Viewer */}
        <main className="flex-1 p-8 max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-2 text-xs text-red-400 font-mono">
            <FileCode className="w-4 h-4" />
            <span>EXERCISE_ID: DSS-LAB-03-VAPT</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white">
            Burp Suite Repeater & Intruder Attacks
          </h2>

          <div className="p-5 rounded-xl border border-zinc-800 bg-[#0E0E14] text-xs font-mono text-zinc-300 leading-relaxed flex flex-col gap-3">
            <span className="text-red-400 font-bold">[LAB OBJECTIVES]</span>
            <p>1. Intercept HTTP POST /api/v1/auth/login traffic using Burp Suite proxy on 127.0.0.1:8080.</p>
            <p>2. Send intercepted requests to Repeater to test authentication bypass and credential stuffing resistance.</p>
            <p>3. Observe rate-limiting response headers and RFC 7807 problem details payloads.</p>
          </div>

          <div className="prose max-w-none text-zinc-300 text-sm leading-relaxed flex flex-col gap-4">
            <h3 className="text-base font-bold text-white">Lab Instructions</h3>
            <p>
              In this module, you will learn how to intercept, manipulate, and replay HTTP transactions.
              Dark Space Security virtual labs provide a pre-configured target sandbox running our multi-tenant
              authentication endpoints.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
