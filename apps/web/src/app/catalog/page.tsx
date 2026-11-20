'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Badge } from '@lms/ui';
import { BookOpen, Search, ArrowLeft } from 'lucide-react';

export default function CatalogPage() {
  const [search, setSearch] = useState('');

  const courses = [
    {
      id: '1',
      title: 'Introduction to Modern Web Development',
      category: 'Software Engineering',
      duration: '5 hours',
      price: 'Free',
      level: 'Beginner',
    },
    {
      id: '2',
      title: 'Building Autonomous AI Agents',
      category: 'Artificial Intelligence',
      duration: '4 hours',
      price: '$49.00',
      level: 'Intermediate',
    },
    {
      id: '3',
      title: 'PostgreSQL Row-Level Security Architecture',
      category: 'Databases & Security',
      duration: '3 hours',
      price: '$29.00',
      level: 'Advanced',
    },
  ];

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      {/* Top Header */}
      <header className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between bg-[var(--color-surface)]">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2 font-bold text-lg text-[var(--color-primary)]">
            <BookOpen className="w-5 h-5" />
            <span>Course Catalog</span>
          </div>
        </div>
      </header>

      {/* Main Catalog */}
      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Explore Courses</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Browse published courses in your organization. Filter by title, topic, or level.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Input
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                  <Badge variant="default">{c.level}</Badge>
                  <span>{c.duration}</span>
                </div>
                <h3 className="font-bold text-base text-[var(--color-text)] mt-1">{c.title}</h3>
                <span className="text-xs text-[var(--color-text-muted)]">{c.category}</span>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--color-primary)]">{c.price}</span>
                <Link href="/learn/demo-enrollment">
                  <Button variant="primary" size="sm">Enroll</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
