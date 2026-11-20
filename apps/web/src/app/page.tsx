'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { fetchLearnerCourses } from '@/lib/store';
import { Course } from '@/lib/types';
import { Logo } from '@/components/Logo';
import { Button } from '@lms/ui';
import { NotificationCenter } from '@/components/NotificationCenter';
import {
  Terminal,
  Shield,
  Clock,
  BookOpen,
  LogOut,
  Play,
  Lock,
  Cpu,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [assignedCourses, setAssignedCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      setLoadingCourses(true);
      fetchLearnerCourses(user.id || user.email)
        .then((courses) => {
          setAssignedCourses(courses);
        })
        .finally(() => {
          setLoadingCourses(false);
        });
    }
  }, [user]);

  if (isLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen bg-[#040406] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 font-mono tracking-wider">VERIFYING IDENTITY CLEARANCE...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#040406] text-white flex flex-col font-sans">
      {/* Top Cyber Navigation Bar */}
      <header className="border-b border-[#1E1E28] bg-[#07070A]/95 backdrop-blur sticky top-0 z-50 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-900/60 px-2 py-0.5 rounded tracking-widest">
              Learner Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />

            {user.role === 'admin' && (
              <Link href="/admin">
                <Button variant="secondary" size="sm" className="bg-[#12121C] border-red-900/40 text-red-400 hover:bg-red-950/30 text-xs font-semibold">
                  Admin Console →
                </Button>
              </Link>
            )}

            <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-bold text-red-400">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight">{user.name}</span>
                  <span className="text-[10px] text-zinc-500 capitalize">{user.role}</span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out of portal"
                className="p-1.5 rounded-lg border border-zinc-800 hover:border-red-900/60 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-all text-xs flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Learner Hub - ASSIGNED WORK ONLY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8">
        {/* Learner HUD Greeting & Status */}
        <section className="bg-[#0B0B10] border border-[#1E1E28] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                  Secure Session Active · ID: {user.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Welcome back, <span className="text-red-500">{user.name}</span>
              </h1>
              <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
                Here is your dedicated training perimeter. You only have access to work and courses explicitly assigned to your operator clearance.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="bg-[#07070A] border border-zinc-800/80 rounded-xl p-3.5 min-w-[110px] text-center">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Assigned Tracks</div>
                <div className="text-2xl font-black text-white mt-0.5">{assignedCourses.length}</div>
              </div>
              <div className="bg-[#07070A] border border-zinc-800/80 rounded-xl p-3.5 min-w-[110px] text-center">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Target Labs</div>
                <div className="text-2xl font-black text-red-500 mt-0.5">
                  {assignedCourses.filter((c) => c.targetLabIp).length}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Assigned Courses Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold tracking-tight">Your Assigned Courses & Work</h2>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {assignedCourses.length} Authorized Module{assignedCourses.length === 1 ? '' : 's'}
            </span>
          </div>

          {loadingCourses ? (
            <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-[#0B0B10]/50">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-zinc-400 font-mono">Querying assigned curriculum authorizations...</p>
            </div>
          ) : assignedCourses.length === 0 ? (
            /* Empty state when zero courses assigned */
            <div className="p-12 text-center border border-zinc-800 rounded-2xl bg-[#0B0B10] flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <Lock className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Assigned Courses Currently Available</h3>
                <p className="text-xs text-zinc-400 max-w-md mt-1">
                  Your identity is registered with DarkSpaceSecurity, but no training tracks have been provisioned to your profile yet.
                </p>
              </div>
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 font-mono">
                Please contact your DarkSpaceSecurity administrator to assign offensive security or defense courses.
              </div>
            </div>
          ) : (
            /* Assigned Course Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-[#0B0B10] border border-[#1E1E28] hover:border-red-900/50 rounded-2xl p-6 flex flex-col justify-between transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-all pointer-events-none" />

                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono uppercase bg-red-950/60 text-red-400 border border-red-900/60 px-2.5 py-0.5 rounded-full font-bold">
                        {course.category}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        {course.level} Level
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                      {course.summary}
                    </p>

                    {/* Metadata Specs */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-900 text-xs text-zinc-400">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        <span>{course.totalHours} Hours</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{course.modulesCount} Modules</span>
                      </div>
                      {course.targetLabIp && (
                        <div className="flex items-center gap-1.5 font-mono text-emerald-400">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Lab: {course.targetLabIp}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Launch Lab */}
                  <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-mono text-zinc-500">
                      Clearance: <span className="text-emerald-400 font-bold">AUTHORIZED</span>
                    </div>

                    <Link href={`/learn/${course.id}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold border-none shadow-md shadow-red-950/40 text-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Lab</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Live Attack Lab Target HUD (for first assigned track) */}
        {assignedCourses.length > 0 && assignedCourses[0]?.targetLabIp && (
          <section className="bg-[#09090D] border border-red-950/80 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold font-mono tracking-wide uppercase text-zinc-300">
                  Target Machine Perimeter HUD · Assigned Range
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                READY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-[#050508] border border-zinc-800/80 p-3 rounded-xl">
                <div className="text-[10px] text-zinc-500 uppercase">Assigned Machine IP</div>
                <div className="text-sm font-bold text-red-400 mt-1">{assignedCourses[0].targetLabIp}</div>
              </div>
              <div className="bg-[#050508] border border-zinc-800/80 p-3 rounded-xl">
                <div className="text-[10px] text-zinc-500 uppercase">Active Objective</div>
                <div className="text-sm font-bold text-zinc-200 mt-1">Identify CVE-2024 Remote Execution</div>
              </div>
              <div className="bg-[#050508] border border-zinc-800/80 p-3 rounded-xl">
                <div className="text-[10px] text-zinc-500 uppercase">VPN Gateway</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">10.10.14.82 (Online)</div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E1E28] bg-[#07070A] py-6 px-6 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo size="sm" />
          <p>© 2026 Dark Space Security. Authenticated Enterprise Cybersecurity Training Portal.</p>
        </div>
      </footer>
    </div>
  );
}
