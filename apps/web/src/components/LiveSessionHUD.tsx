'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@lms/ui';
import { LiveSession } from '@/lib/types';
import { fetchLiveSessions } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { ScheduleLiveClassModal } from '@/components/ScheduleLiveClassModal';
import {
  Radio,
  Users,
  Video,
  Clock,
  Plus,
  GraduationCap,
} from 'lucide-react';

export function LiveSessionHUD() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const loadSessions = async () => {
    const list = await fetchLiveSessions();
    setSessions(list);
  };

  useEffect(() => {
    loadSessions();

    const handleUpdate = () => {
      loadSessions();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dss_live_sessions_v1') {
        loadSessions();
      }
    };

    window.addEventListener('dss-live-sessions-updated', handleUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('dss-live-sessions-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const isLearnerWithMentor = Boolean(user && user.role === 'learner' && (user.assignedInstructorId || user.assignedInstructorName));

  // Prioritize session created by this learner's assigned mentor if available
  const mentorLiveSession = isLearnerWithMentor
    ? sessions.find((s) => s.status === 'live' && ((user?.assignedInstructorId && s.instructorId === user.assignedInstructorId) || (user?.assignedInstructorName && s.instructorName === user.assignedInstructorName)))
    : null;
  const liveSession = mentorLiveSession || sessions.find((s) => s.status === 'live');

  const mentorUpcomingSession = isLearnerWithMentor
    ? sessions.find((s) => s.status === 'upcoming' && ((user?.assignedInstructorId && s.instructorId === user.assignedInstructorId) || (user?.assignedInstructorName && s.instructorName === user.assignedInstructorName)))
    : null;
  const upcomingSession = mentorUpcomingSession || sessions.find((s) => s.status === 'upcoming');

  const isLiveSessionFromMentor = Boolean(
    isLearnerWithMentor && liveSession && ((user?.assignedInstructorId && liveSession.instructorId === user.assignedInstructorId) || (user?.assignedInstructorName && liveSession.instructorName === user.assignedInstructorName))
  );

  const isUpcomingSessionFromMentor = Boolean(
    isLearnerWithMentor && upcomingSession && ((user?.assignedInstructorId && upcomingSession.instructorId === user.assignedInstructorId) || (user?.assignedInstructorName && upcomingSession.instructorName === user.assignedInstructorName))
  );

  const canManage = Boolean(user && user.role !== 'learner' && (user.role === 'admin' || user.role === 'instructor'));

  if (!liveSession && !upcomingSession && !canManage) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. ACTIVE LIVE CLASS IN PROGRESS (HIGH PRIORITY HUD) */}
      {liveSession ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-red-600/90 bg-gradient-to-r from-[#160608] via-[#0C0B12] to-[#12080A] p-6 shadow-2xl shadow-red-950/60 animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-md shadow-red-950 animate-pulse">
                  <Radio className="w-3.5 h-3.5" />
                  <span>LIVE CLASS IN PROGRESS</span>
                </span>
                {isLiveSessionFromMentor && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono text-[10px] font-bold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Your Assigned Mentor</span>
                  </span>
                )}
                <span className="text-[10px] font-mono uppercase bg-red-950/80 text-red-400 border border-red-900/60 px-2 py-0.5 rounded font-bold">
                  {liveSession.courseTitle}
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{liveSession.attendeeCount ? `${liveSession.attendeeCount} Attending` : 'Cohort Active'}</span>
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1">
                {liveSession.topic}
              </h2>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {liveSession.agenda || 'Live interactive masterclass in session with hands-on walkthrough, audio Q&A, and direct instructor mentoring.'}
              </p>

              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 mt-1">
                <span>
                  Instructor: <strong className="text-white">{liveSession.instructorName}</strong>
                  {isLiveSessionFromMentor && <span className="text-amber-400 font-bold ml-1.5">(Your Mentor)</span>}
                </span>
                <span>·</span>
                <span>Platform: <strong className="text-red-400 uppercase">{liveSession.platform}</strong></span>
              </div>
            </div>

            {/* User Friendly 1-Click Join Action */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <Link href={`/learn/${liveSession.courseId}?tab=live`} className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 gap-2 shadow-xl shadow-red-950/60 hover:scale-[1.02] transition-all"
                >
                  <Radio className="w-4 h-4 animate-ping" />
                  <span>Join Live Class (1-Click) →</span>
                </Button>
              </Link>

              {canManage && (
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="text-[11px] text-zinc-400 hover:text-white font-mono text-center hover:underline pt-1"
                >
                  + Assign Another Class
                </button>
              )}
            </div>
          </div>
        </div>
      ) : upcomingSession ? (
        /* 2. UPCOMING SCHEDULED LIVE SESSION */
        <div className="bg-[#09090F] border border-[#1E1E28] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-900/60 text-red-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase bg-zinc-900 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded font-bold">
                  NEXT SCHEDULED LIVE CLASS
                </span>
                {isUpcomingSessionFromMentor && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono text-[10px] font-bold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Your Mentor</span>
                  </span>
                )}
                <span className="text-xs font-mono text-zinc-400">
                  {upcomingSession.scheduledTime}
                </span>
              </div>

              <h3 className="text-sm md:text-base font-bold text-white">
                {upcomingSession.topic}
              </h3>

              <p className="text-xs text-zinc-400">
                Track: <strong className="text-zinc-200">{upcomingSession.courseTitle}</strong> · Instructor: <strong className="text-white">{upcomingSession.instructorName}</strong>
                {isUpcomingSessionFromMentor && <span className="text-amber-400 font-bold ml-1.5">(Your Assigned Mentor)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link href={`/learn/${upcomingSession.courseId}?tab=live`}>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Enter Room Early</span>
              </Button>
            </Link>

            {canManage && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsScheduleModalOpen(true)}
                className="bg-[#12121A] border-zinc-800 text-xs text-zinc-300 hover:text-white gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-red-400" />
                <span>Assign Class</span>
              </Button>
            )}
          </div>
        </div>
      ) : canManage ? (
        /* 3. INSTRUCTOR ASSIGN LIVE CLASS QUICK BANNER (When no session is live) */
        <div className="bg-[#09090F] border border-dashed border-red-900/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-900/60 text-red-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Instructor Live Classroom Station
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Host an instant live class or schedule a cohort session with automatic learner alerts.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Assign / Schedule Live Class</span>
          </Button>
        </div>
      ) : null}

      {/* Schedule Live Class Modal */}
      <ScheduleLiveClassModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={loadSessions}
      />
    </div>
  );
}
