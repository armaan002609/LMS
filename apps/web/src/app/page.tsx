'use client';

import React from 'react';
import Link from 'next/link';
import { Button, Badge } from '@lms/ui';
import { BookOpen, PlayCircle, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--color-primary)]">
            <BookOpen className="w-6 h-6" />
            <span>Acme Academy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-[var(--color-primary)]">Home</Link>
            <Link href="/catalog" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Catalog</Link>
            <Link href="/learn/demo-enrollment" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">My Learning</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="secondary" size="sm" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Admin Console</span>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Hero Resume Learning Strip (UI_UX_DESIGN.md §5.2) */}
        <section className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-[var(--radius-lg)] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="success">In Progress</Badge>
              <span className="text-xs text-[var(--color-text-muted)]">Last accessed 2 hours ago</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Introduction to Modern Web Development</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Module 1: Getting Started · Lesson 1: Welcome to the Course</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-[var(--color-primary)]">25% Complete</span>
              <div className="w-32 h-2 bg-indigo-200 rounded-full overflow-hidden mt-1">
                <div className="bg-[var(--color-primary)] h-full w-1/4 rounded-full" />
              </div>
            </div>
            <Link href="/learn/demo-enrollment">
              <Button variant="primary" size="md" className="gap-2">
                <PlayCircle className="w-4 h-4" />
                <span>Resume</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Recommended for You */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recommended for You</h3>
            <Link href="/catalog" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
              View All Courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: '1',
                title: 'Building Autonomous AI Agents',
                level: 'Intermediate',
                duration: '4 hours',
                rating: '4.9',
              },
              {
                id: '2',
                title: 'Full-Stack TypeScript & Prisma',
                level: 'Beginner',
                duration: '6 hours',
                rating: '4.8',
              },
              {
                id: '3',
                title: 'PostgreSQL Row-Level Security Architecture',
                level: 'Advanced',
                duration: '3 hours',
                rating: '5.0',
              },
            ].map((course) => (
              <div
                key={course.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                    <Badge variant="default">{course.level}</Badge>
                    <span>{course.duration}</span>
                  </div>
                  <h4 className="font-semibold text-base text-[var(--color-text)] mt-1">{course.title}</h4>
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-600">★ {course.rating}</span>
                  <Link href="/catalog">
                    <Button variant="secondary" size="sm">Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
