'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Badge } from '@lms/ui';
import { validateContrast } from '@lms/ui';
import { ArrowLeft, Check, AlertTriangle, Eye } from 'lucide-react';

export default function BrandingStudioPage() {
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [contrastColor, setContrastColor] = useState('#FFFFFF');
  const [courseTerminology, setCourseTerminology] = useState('Course');
  const [isSaved, setIsSaved] = useState(false);

  const contrastResult = validateContrast(contrastColor, primaryColor);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-muted)] flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin</span>
            </Button>
          </Link>
          <h1 className="text-lg font-bold">White-Label Branding Studio</h1>
        </div>

        <Button variant="primary" size="sm" onClick={handleSave} className="gap-2">
          {isSaved ? <Check className="w-4 h-4" /> : null}
          <span>{isSaved ? 'Published!' : 'Publish Changes'}</span>
        </Button>
      </header>

      {/* Split Studio: Editor Left | Live Preview Right (UI_UX_DESIGN.md §5.9) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Controls */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text)]">Brand Tokens & Styling</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Changes propagate to all tenant learner pages within 60 seconds without code deploy.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">
                Primary Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-36 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">
                Button Text Color (Contrast)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={contrastColor}
                  onChange={(e) => setContrastColor(e.target.value)}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={contrastColor}
                  onChange={(e) => setContrastColor(e.target.value)}
                  className="w-36 font-mono"
                />
              </div>
            </div>

            {/* Accessibility Contrast Checker (WCAG 2.2 AA) */}
            <div className="p-4 rounded-[var(--radius-md)] border flex items-center justify-between bg-gray-50 border-gray-200">
              <div className="flex items-center gap-2">
                {contrastResult.valid ? (
                  <Check className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
                <div>
                  <span className="text-sm font-medium">WCAG Contrast Ratio: {contrastResult.ratio}:1</span>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {contrastResult.valid
                      ? 'Passes WCAG 2.2 AA (minimum 4.5:1 for normal text)'
                      : 'Fails WCAG 2.2 AA contrast threshold! Adjust colors.'}
                  </p>
                </div>
              </div>
              <Badge variant={contrastResult.valid ? 'success' : 'warning'}>
                {contrastResult.valid ? 'Passes AA' : 'Contrast Alert'}
              </Badge>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4">
              <h3 className="text-sm font-bold mb-3">Custom Terminology</h3>
              <Input
                label='Singular name for "Course"'
                value={courseTerminology}
                onChange={(e) => setCourseTerminology(e.target.value)}
                placeholder="e.g. Program, Module, Track"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Preview Panel */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-bold">Live Learner View Preview</span>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">Interactive</span>
          </div>

          <div
            className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 flex flex-col gap-6"
            style={{
              // @ts-ignore
              '--color-primary': primaryColor,
              '--color-primary-contrast': contrastColor,
            }}
          >
            <div className="flex items-center justify-between border-b pb-4">
              <span className="font-bold text-lg" style={{ color: primaryColor }}>
                Acme Academy
              </span>
              <button
                className="px-4 py-2 text-sm font-medium rounded-md"
                style={{ backgroundColor: primaryColor, color: contrastColor }}
              >
                Sign In
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg flex flex-col gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Featured {courseTerminology}
              </span>
              <h4 className="font-bold text-base">Introduction to Modern Web Development</h4>
              <p className="text-xs text-gray-600">
                Explore full-stack architecture, RLS multi-tenancy, and scalable APIs.
              </p>
              <div className="mt-2">
                <button
                  className="px-4 py-2 text-sm font-medium rounded-md shadow-sm"
                  style={{ backgroundColor: primaryColor, color: contrastColor }}
                >
                  Enroll in {courseTerminology}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
