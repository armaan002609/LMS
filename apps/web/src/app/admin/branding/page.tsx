'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Badge } from '@lms/ui';
import { validateContrast } from '@lms/ui';
import { ArrowLeft, Check, AlertTriangle, Eye, Shield } from 'lucide-react';

export default function BrandingStudioPage() {
  const [primaryColor, setPrimaryColor] = useState('#DC2626');
  const [contrastColor, setContrastColor] = useState('#FFFFFF');
  const [courseTerminology, setCourseTerminology] = useState('Track');
  const [isSaved, setIsSaved] = useState(false);

  const contrastResult = validateContrast(contrastColor, primaryColor);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text)] flex flex-col">
      {/* Top Header */}
      <header className="border-b border-[var(--color-border)] bg-[#07070A] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4 text-red-500" />
              <span>Back to Admin</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <h1 className="text-base font-bold text-white">Dark Space White-Label Studio</h1>
          </div>
        </div>

        <Button variant="primary" size="sm" onClick={handleSave} className="gap-2 bg-red-600 hover:bg-red-700 text-xs font-bold">
          {isSaved ? <Check className="w-4 h-4" /> : null}
          <span>{isSaved ? 'Published!' : 'Publish Changes'}</span>
        </Button>
      </header>

      {/* Split Studio */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="bg-[#0B0B10] border border-[var(--color-border)] rounded-xl p-6 flex flex-col gap-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-white">Brand Tokens & Styling</h2>
            <p className="text-xs text-[var(--color-text-muted)]">
              Real-time white-labeling matching darkspacesecurity.io aesthetic
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
                Primary Cyber Color (Accents, Buttons)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded border border-zinc-700 cursor-pointer bg-transparent"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-36 font-mono bg-[#07070A] border-zinc-800 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
                Contrast Text Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={contrastColor}
                  onChange={(e) => setContrastColor(e.target.value)}
                  className="w-10 h-10 rounded border border-zinc-700 cursor-pointer bg-transparent"
                />
                <Input
                  value={contrastColor}
                  onChange={(e) => setContrastColor(e.target.value)}
                  className="w-36 font-mono bg-[#07070A] border-zinc-800 text-white"
                />
              </div>
            </div>

            {/* Accessibility Contrast Checker (WCAG 2.2 AA) */}
            <div className="p-4 rounded-lg border flex items-center justify-between bg-[#08080C] border-zinc-800">
              <div className="flex items-center gap-2">
                {contrastResult.valid ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <span className="text-xs font-bold text-white">WCAG Contrast: {contrastResult.ratio}:1</span>
                  <p className="text-[11px] text-[var(--color-text-muted)]">
                    {contrastResult.valid
                      ? 'Passes WCAG 2.2 AA (minimum 4.5:1 ratio)'
                      : 'Fails WCAG 2.2 AA threshold'}
                  </p>
                </div>
              </div>
              <Badge variant={contrastResult.valid ? 'success' : 'warning'}>
                {contrastResult.valid ? 'Passes AA' : 'Contrast Alert'}
              </Badge>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4">
              <h3 className="text-xs font-bold text-white mb-2">Custom Terminology</h3>
              <Input
                label='Singular name for "Course"'
                value={courseTerminology}
                onChange={(e) => setCourseTerminology(e.target.value)}
                className="bg-[#07070A] border-zinc-800 text-white"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="bg-[#0B0B10] border border-[var(--color-border)] rounded-xl p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-white">Live Learner View Preview</span>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Interactive</span>
          </div>

          <div
            className="border border-zinc-800 rounded-xl p-6 flex flex-col gap-6 bg-[#050508]"
            style={{
              // @ts-ignore
              '--color-primary': primaryColor,
              '--color-primary-contrast': contrastColor,
            }}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <span className="font-extrabold text-base tracking-wide text-white">
                DARK SPACE <span style={{ color: primaryColor }}>SECURITY</span>
              </span>
              <button
                className="px-4 py-1.5 text-xs font-bold rounded-md"
                style={{ backgroundColor: primaryColor, color: contrastColor }}
              >
                Sign In
              </button>
            </div>

            <div className="p-4 bg-[#0B0B12] rounded-lg border border-zinc-800 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                Featured {courseTerminology}
              </span>
              <h4 className="font-bold text-sm text-white">Ethical Hacking & Web Penetration Testing (VAPT)</h4>
              <p className="text-xs text-zinc-400">
                Industry-aligned cybersecurity curriculum with Burp Suite and Metasploit.
              </p>
              <div className="mt-2">
                <button
                  className="px-4 py-2 text-xs font-bold rounded-md shadow-lg"
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
