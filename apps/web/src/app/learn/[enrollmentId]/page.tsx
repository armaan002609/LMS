'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Badge } from '@lms/ui';
import { PlayCircle, CheckCircle, Lock, ArrowLeft, FileText } from 'lucide-react';

export default function CoursePlayerPage() {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      {/* Topbar: course title · progress · back */}
      <header className="border-b border-[var(--color-border)] px-6 py-3.5 flex items-center justify-between bg-[var(--color-surface)]">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-sm font-bold text-[var(--color-text)]">
              Introduction to Modern Web Development
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Module 1: Getting Started · Lesson 1 of 4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-[var(--color-primary)]">
            {completed ? '100% Completed' : '25% Completed'}
          </span>
          <Button
            variant={completed ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setCompleted(!completed)}
          >
            {completed ? 'Completed' : 'Mark Complete'}
          </Button>
        </div>
      </header>

      {/* Main Split Player: Outline Left | Lesson Content Right (UI_UX_DESIGN.md §5.4) */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Outline */}
        <aside className="w-full md:w-80 border-r border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Course Outline
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-primary)] rounded-[var(--radius-md)] flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                {completed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <PlayCircle className="w-4 h-4 text-[var(--color-primary)]" />
                )}
                <span className="text-sm font-medium">1. Welcome to the Course</span>
              </div>
              <Badge variant="default">5 min</Badge>
            </div>

            <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] flex items-center justify-between cursor-pointer opacity-70">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">2. Setting Up Monorepo</span>
              </div>
              <Badge variant="default">15 min</Badge>
            </div>

            <div className="p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] flex items-center justify-between cursor-pointer opacity-70">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">3. Multi-Tenant Architecture</span>
              </div>
              <Badge variant="default">20 min</Badge>
            </div>
          </div>
        </aside>

        {/* Right Lesson Content */}
        <main className="flex-1 p-8 max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <FileText className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Text & Documentation Lesson</span>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text)]">
            Welcome to Introduction to Modern Web Development
          </h2>

          <div className="prose max-w-none text-[var(--color-text)] leading-relaxed flex flex-col gap-4 text-sm">
            <p>
              Welcome to the course! In this curriculum, we will guide you step-by-step through the process
              of architecting and implementing modern multi-tenant cloud applications using TypeScript, Next.js,
              NestJS, and PostgreSQL with Row-Level Security (RLS).
            </p>
            <h3 className="text-lg font-semibold mt-4">Key Takeaways</h3>
            <ul className="list-disc pl-5 flex flex-col gap-2">
              <li>Comprehensive understanding of tenant-isolated data models and RLS policies.</li>
              <li>Design token systems for instantaneous white-labeling without redeployment.</li>
              <li>Standards-compliant SCORM 1.2/2004 and xAPI integrations.</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
