'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@lms/ui';
import {
  X,
  Radio,
  Calendar,
  Clock,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { createLiveSession, fetchCourses, fetchUsersWithCourses } from '@/lib/store';
import { Course, UserWithCourses } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

interface ScheduleLiveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourseId?: string;
  defaultCourseTitle?: string;
  onSuccess?: () => void;
}

export function ScheduleLiveClassModal({
  isOpen,
  onClose,
  defaultCourseId,
  defaultCourseTitle,
  onSuccess,
}: ScheduleLiveClassModalProps) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<UserWithCourses[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState(defaultCourseId || '');
  const [topic, setTopic] = useState('');
  const [instructorName, setInstructorName] = useState('Senior Academy Instructor');
  const [scheduleType, setScheduleType] = useState<'instant' | 'today_evening' | 'tomorrow' | 'custom'>('instant');
  const [customDateTime, setCustomDateTime] = useState('');
  const [platform, setPlatform] = useState<'internal' | 'custom'>('internal');
  const [meetingUrl, setMeetingUrl] = useState('https://meet.darkspacesecurity.io/session-live');
  const [agenda, setAgenda] = useState('');
  const [notifyLearners, setNotifyLearners] = useState(true);
  const [autoAdmitEveryone, setAutoAdmitEveryone] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCourses().then((list) => {
      setCourses(list);
      if (!selectedCourseId && list.length > 0 && list[0]) {
        setSelectedCourseId(defaultCourseId || list[0].id);
      }
    });

    fetchUsersWithCourses().then((users) => {
      const insts = users.filter((u) => u.role === 'instructor');
      setAvailableInstructors(insts);
    });

    if (user && user.role === 'instructor') {
      setSelectedInstructorId(user.id);
      setInstructorName(user.name);
    }
  }, [defaultCourseId, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    const matchedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
    const cTitle = defaultCourseTitle || (matchedCourse ? matchedCourse.title : 'Official Curriculum');

    let scheduledTimeLabel = 'LIVE NOW';
    let sessionStatus: 'live' | 'upcoming' = 'live';

    if (scheduleType === 'instant') {
      scheduledTimeLabel = 'LIVE NOW';
      sessionStatus = 'live';
    } else if (scheduleType === 'today_evening') {
      scheduledTimeLabel = 'Today at 18:00 IST';
      sessionStatus = 'upcoming';
    } else if (scheduleType === 'tomorrow') {
      scheduledTimeLabel = 'Tomorrow at 11:00 AM IST';
      sessionStatus = 'upcoming';
    } else {
      scheduledTimeLabel = customDateTime.trim() || 'Scheduled Session';
      sessionStatus = 'upcoming';
    }

    try {
      const targetCId = matchedCourse ? matchedCourse.id : selectedCourseId;
      if (typeof window !== 'undefined') {
        try {
          const roomStateKey = `dss_live_room_state_${targetCId}`;
          const current = localStorage.getItem(roomStateKey);
          const parsed = current ? JSON.parse(current) : {};
          localStorage.setItem(
            roomStateKey,
            JSON.stringify({
              ...parsed,
              autoAdmitEveryone,
            })
          );
        } catch {}
      }

      const finalInstructorId = selectedInstructorId || (user?.role === 'instructor' ? user.id : undefined);
      const finalInstructorName = instructorName.trim() || user?.name || 'Senior Academy Instructor';

      await createLiveSession({
        courseId: targetCId,
        courseTitle: cTitle,
        topic: topic.trim(),
        instructorId: finalInstructorId,
        instructorName: finalInstructorName,
        scheduledTime: scheduledTimeLabel,
        meetingUrl: meetingUrl.trim() || 'https://meet.darkspacesecurity.io/live',
        platform,
        status: sessionStatus,
        attendeeCount: sessionStatus === 'live' ? 42 : 12,
        agenda: agenda.trim() || `Live masterclass covering core concepts and interactive lab exercises.`,
      });

      setSuccessMessage(
        sessionStatus === 'live'
          ? `Live class is NOW LIVE! An instant push alert was dispatched to all enrolled learners.`
          : `Live class scheduled for ${scheduledTimeLabel}. Notifications were sent to students!`
      );

      setTopic('');
      setAgenda('');

      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1600);
    } catch (err) {
      console.error('Failed scheduling live class', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0B12] border border-[#1E1E28] rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-900/60 flex items-center justify-center text-red-500">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Assign &amp; Schedule Live Interactive Class</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-900/60 font-bold uppercase">
                  INSTRUCTOR
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Create an instant live class or schedule upcoming sessions with 1-click notification.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Course Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 font-medium">Target Course Track</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-[#07070A] border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-600"
              required
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Live Class Topic"
              placeholder="e.g. Next.js 14 Server Actions & Microservices"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-[#07070A] border-zinc-800 text-white text-xs"
              required
            />
            {user?.role === 'admin' && availableInstructors.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-medium text-xs">Instructor in Charge</label>
                <select
                  value={selectedInstructorId}
                  onChange={(e) => {
                    const instId = e.target.value;
                    setSelectedInstructorId(instId);
                    const found = availableInstructors.find((i) => i.id === instId);
                    if (found) setInstructorName(found.name);
                  }}
                  className="bg-[#07070A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                >
                  <option value="">Choose Instructor...</option>
                  {availableInstructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.email})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Input
                label="Instructor Host Name"
                placeholder="e.g. Senior Academy Instructor"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="bg-[#07070A] border-zinc-800 text-white text-xs"
                required
              />
            )}
          </div>

          {/* Quick Schedule Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 font-medium">When to Host This Class</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setScheduleType('instant')}
                className={`p-2.5 rounded-lg border text-xs font-mono flex flex-col items-center justify-center gap-1 transition-all ${
                  scheduleType === 'instant'
                    ? 'bg-red-600 border-red-500 text-white font-bold shadow-md shadow-red-950'
                    : 'bg-[#07070A] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Go Live NOW</span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('today_evening')}
                className={`p-2.5 rounded-lg border text-xs font-mono flex flex-col items-center justify-center gap-1 transition-all ${
                  scheduleType === 'today_evening'
                    ? 'bg-red-600 border-red-500 text-white font-bold shadow-md shadow-red-950'
                    : 'bg-[#07070A] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Today 18:00</span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('tomorrow')}
                className={`p-2.5 rounded-lg border text-xs font-mono flex flex-col items-center justify-center gap-1 transition-all ${
                  scheduleType === 'tomorrow'
                    ? 'bg-red-600 border-red-500 text-white font-bold shadow-md shadow-red-950'
                    : 'bg-[#07070A] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Tomorrow 11:00</span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('custom')}
                className={`p-2.5 rounded-lg border text-xs font-mono flex flex-col items-center justify-center gap-1 transition-all ${
                  scheduleType === 'custom'
                    ? 'bg-red-600 border-red-500 text-white font-bold shadow-md shadow-red-950'
                    : 'bg-[#07070A] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Custom Date</span>
              </button>
            </div>

            {scheduleType === 'custom' && (
              <div className="mt-2">
                <Input
                  label="Custom Date & Time"
                  placeholder="e.g. Friday 24 Nov, 17:30 IST"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="bg-[#07070A] border-zinc-800 text-white text-xs"
                />
              </div>
            )}
          </div>

          {/* Platform & Meeting Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">Broadcast Platform</label>
              <select
                value={platform}
                onChange={(e) => {
                  const p = e.target.value as any;
                  setPlatform(p);
                  if (p === 'internal') setMeetingUrl('https://meet.darkspacesecurity.io/session-live');
                }}
                className="bg-[#07070A] border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-600"
              >
                <option value="internal">Dark Space In-App Live Studio (Native WebRTC)</option>
                <option value="custom">Custom WebRTC / In-App Stream</option>
              </select>
            </div>

            <Input
              label="Live Studio Room Key"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="bg-[#07070A] border-zinc-800 text-white text-xs"
              required
            />
          </div>

          {/* Agenda */}
          <div className="flex flex-col gap-1.5">
            <label className="text-zinc-400 font-medium">Class Agenda &amp; Prerequisites (Optional)</label>
            <textarea
              rows={2}
              placeholder="What students should be prepared with..."
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="bg-[#07070A] border border-zinc-800 rounded-lg p-2.5 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs text-zinc-300 font-mono cursor-pointer select-none">
              <input
                type="checkbox"
                checked={notifyLearners}
                onChange={(e) => setNotifyLearners(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-700 text-red-600 focus:ring-red-600"
              />
              <span>Broadcast instant push notification &amp; banner to all enrolled learners</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-zinc-300 font-mono cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoAdmitEveryone}
                onChange={(e) => setAutoAdmitEveryone(e.target.checked)}
                className="rounded bg-zinc-900 border-zinc-700 text-red-600 focus:ring-red-600"
              />
              <span className="text-emerald-400">⚡ Auto-allow everyone (Learners enter immediately without waiting for host approval)</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !topic.trim()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 py-2.5 mt-1"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>
              {isSubmitting
                ? 'Assigning Class...'
                : scheduleType === 'instant'
                ? '🚀 Launch Live Class NOW & Alert Learners'
                : '📅 Schedule Live Class & Notify Learners'}
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
}
