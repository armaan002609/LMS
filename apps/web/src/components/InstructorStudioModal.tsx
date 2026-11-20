'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@lms/ui';
import {
  X,
  Upload,
  FileText,
  Video,
  Radio,
  Send,
  Sparkles,
  CheckCircle,
  Trash2,
  Clock,
} from 'lucide-react';
import { addCourseModule, addCourseNote, scheduleLiveSession, deleteLiveSession, fetchLiveSessions } from '@/lib/store';
import { LiveSession } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

interface InstructorStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onSuccess?: () => void;
}

export function InstructorStudioModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  onSuccess,
}: InstructorStudioModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'module' | 'live' | 'notes'>('module');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Module Upload State
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleType, setModuleType] = useState<'lecture' | 'lab' | 'live' | 'notes'>('lecture');
  const [moduleDuration, setModuleDuration] = useState('45 Min');
  const [moduleVideoUrl, setModuleVideoUrl] = useState('');
  const [moduleSummary, setModuleSummary] = useState('');

  // Live Class State
  const [liveTopic, setLiveTopic] = useState('');
  const [liveDate, setLiveDate] = useState('Tomorrow, 6:00 PM IST');
  const [liveMeetingUrl, setLiveMeetingUrl] = useState('https://meet.darkspacesecurity.io/live-session');
  const [liveAgenda, setLiveAgenda] = useState('');
  const [existingSessions, setExistingSessions] = useState<LiveSession[]>([]);

  const loadSessions = async () => {
    if (!courseId) return;
    try {
      const all = await fetchLiveSessions();
      setExistingSessions(all.filter((s) => s.courseId === courseId));
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen, courseId]);

  const handleDeleteLiveSession = async (sessionId: string, topic: string) => {
    if (confirm(`Are you sure you want to delete the live class "${topic}"? This will cancel the session and notify learners.`)) {
      await deleteLiveSession(sessionId);
      await loadSessions();
      setSuccessMessage(`Live session "${topic}" has been deleted.`);
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccessMessage(''), 2500);
    }
  };

  // Notes Upload State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteFileName, setNoteFileName] = useState('');
  const [noteFileSize, setNoteFileSize] = useState('2.8 MB');
  const [noteDescription, setNoteDescription] = useState('');

  if (!isOpen) return null;

  const handlePublishModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await addCourseModule(
        {
          courseId,
          title: moduleTitle.trim(),
          type: moduleType,
          duration: moduleDuration.trim() || '45 Min',
          videoUrl: moduleVideoUrl.trim() || undefined,
          summary: moduleSummary.trim() || `Instructor lecture: ${moduleTitle.trim()}`,
          instructorId: user?.id,
          instructorName: user?.name || 'Assigned Instructor',
        },
        courseTitle
      );

      setSuccessMessage(`Module "${moduleTitle}" published! All enrolled learners have been notified.`);
      setModuleTitle('');
      setModuleSummary('');
      setModuleVideoUrl('');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTopic.trim()) return;
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await scheduleLiveSession({
        courseId,
        courseTitle,
        topic: liveTopic.trim(),
        scheduledTime: liveDate.trim(),
        status: 'upcoming',
        platform: 'internal',
        meetingUrl: `/learn/${courseId}?tab=live`,
        instructorId: user?.id,
        instructorName: user?.name || 'Assigned Instructor',
        agenda: liveAgenda.trim() || `Interactive stream: ${liveTopic.trim()}`,
      });
      await loadSessions();

      setSuccessMessage(`Live Class scheduled! An instant notification alert was dispatched to all students.`);
      setLiveTopic('');
      setLiveAgenda('');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await addCourseNote(
        {
          courseId,
          title: noteTitle.trim(),
          description: noteDescription.trim() || 'Official study notes and reference architecture document.',
          fileName: noteFileName.trim() || `${noteTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`,
          fileSize: noteFileSize.trim() || '2.5 MB',
          instructorId: user?.id,
          instructorName: user?.name || 'Assigned Instructor',
        },
        courseTitle
      );

      setSuccessMessage(`Study notes uploaded! Learners were notified and can now download them.`);
      setNoteTitle('');
      setNoteDescription('');
      setNoteFileName('');
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0B0B12] border border-[#1E1E28] rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-900/60 flex items-center justify-center text-red-500">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Instructor Content Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-900/60 font-bold uppercase">
                  INSTRUCTOR
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Course: <span className="text-white font-semibold">{courseTitle}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#06060A] border border-zinc-800/80 rounded-xl text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('module')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'module'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Add Module</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'live'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Schedule Live</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'notes'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Upload Notes</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: ADD MODULE / RECORDED LECTURE */}
        {activeTab === 'module' && (
          <form onSubmit={handlePublishModule} className="flex flex-col gap-4 text-xs">
            <Input
              label="Module or Lecture Title"
              placeholder="e.g. Next.js 14 Server Actions & Microservices Architecture"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="bg-[#07070A] border-zinc-800 text-white text-xs"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-medium">Module Type</label>
                <select
                  value={moduleType}
                  onChange={(e) => setModuleType(e.target.value as any)}
                  className="bg-[#07070A] border border-zinc-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-red-600"
                >
                  <option value="lecture">Recorded Lecture (Video)</option>
                  <option value="lab">Hands-on Lab Exercise</option>
                  <option value="live">Live Class Session</option>
                  <option value="notes">Study Notes / Guide</option>
                </select>
              </div>

              <Input
                label="Duration / Est. Time"
                placeholder="e.g. 45 Min or 1.5 Hours"
                value={moduleDuration}
                onChange={(e) => setModuleDuration(e.target.value)}
                className="bg-[#07070A] border-zinc-800 text-white text-xs"
              />
            </div>

            <Input
              label="Video Stream URL (Optional)"
              placeholder="e.g. https://stream.darkspacesecurity.io/lecture-04.mp4"
              value={moduleVideoUrl}
              onChange={(e) => setModuleVideoUrl(e.target.value)}
              className="bg-[#07070A] border-zinc-800 text-white text-xs"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">Lecture Notes & Key Concepts</label>
              <textarea
                rows={3}
                placeholder="Key takeaways, terminal setups, or prerequisites covered in this session..."
                value={moduleSummary}
                onChange={(e) => setModuleSummary(e.target.value)}
                className="bg-[#07070A] border border-zinc-800 rounded-lg p-2.5 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-[11px] text-zinc-400 font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
              <span>Publishing this module will immediately dispatch a notification alert to all enrolled learners.</span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !moduleTitle.trim()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 py-2.5 mt-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Module & Notify Students'}</span>
            </Button>
          </form>
        )}

        {/* TAB 2: SCHEDULE LIVE CLASS */}
        {activeTab === 'live' && (
          <div className="flex flex-col gap-4 text-xs">
            {/* Existing Live Sessions List with Delete option */}
            {existingSessions.length > 0 && (
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#06060A] border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
                  <span className="font-semibold text-zinc-300">Active / Scheduled Sessions ({existingSessions.length})</span>
                  <span className="text-[10px] text-zinc-500">Instructor Controls</span>
                </div>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {existingSessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/70 border border-zinc-800/80 text-xs"
                    >
                      <div className="flex flex-col gap-0.5 truncate mr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                              s.status === 'live'
                                ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {s.status === 'live' ? 'LIVE NOW' : 'UPCOMING'}
                          </span>
                          <span className="font-semibold text-zinc-200 truncate">{s.topic}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>{s.scheduledTime}</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteLiveSession(s.id, s.topic)}
                        className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-900/60 text-red-400 hover:text-white text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 transition-colors"
                        title="Delete this live class"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete Class</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleScheduleLive} className="flex flex-col gap-4 text-xs">
              <Input
                label="Live Masterclass Topic"
                placeholder="e.g. Live Q&A & Code Review: Full Stack Microservices"
                value={liveTopic}
                onChange={(e) => setLiveTopic(e.target.value)}
                className="bg-[#07070A] border-zinc-800 text-white text-xs"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date & Time"
                  placeholder="e.g. Tomorrow at 6:00 PM IST"
                  value={liveDate}
                  onChange={(e) => setLiveDate(e.target.value)}
                  className="bg-[#07070A] border-zinc-800 text-white text-xs"
                  required
                />

                <Input
                  label="Live Stream / Room Link"
                  placeholder="e.g. https://meet.darkspacesecurity.io/room-01"
                  value={liveMeetingUrl}
                  onChange={(e) => setLiveMeetingUrl(e.target.value)}
                  className="bg-[#07070A] border-zinc-800 text-white text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-medium">Session Agenda & Prep Work</label>
                <textarea
                  rows={3}
                  placeholder="What students should review before joining the live broadcast..."
                  value={liveAgenda}
                  onChange={(e) => setLiveAgenda(e.target.value)}
                  className="bg-[#07070A] border border-zinc-800 rounded-lg p-2.5 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-[11px] text-zinc-400 font-mono flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                <span>Learners will see this in their curriculum calendar and receive an alert with the room link.</span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !liveTopic.trim()}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 py-2.5 mt-1"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Scheduling...' : 'Schedule Live Class & Broadcast Alert'}</span>
              </Button>
            </form>
          </div>
        )}

        {/* TAB 3: UPLOAD NOTES & RESOURCES */}
        {activeTab === 'notes' && (
          <form onSubmit={handleUploadNotes} className="flex flex-col gap-4 text-xs">
            <Input
              label="Document or Resource Title"
              placeholder="e.g. Full Stack Production Architecture & Docker Cheatsheet"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="bg-[#07070A] border-zinc-800 text-white text-xs"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="File Name"
                placeholder="e.g. fullstack-architecture.pdf"
                value={noteFileName}
                onChange={(e) => setNoteFileName(e.target.value)}
                className="bg-[#07070A] border-zinc-800 text-white text-xs"
              />

              <Input
                label="File Size / Format"
                placeholder="e.g. 3.2 MB · PDF"
                value={noteFileSize}
                onChange={(e) => setNoteFileSize(e.target.value)}
                className="bg-[#07070A] border-zinc-800 text-white text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-zinc-400 font-medium">Notes Summary / Description</label>
              <textarea
                rows={3}
                placeholder="Brief description of the diagrams, formulas, commands, or source code attached..."
                value={noteDescription}
                onChange={(e) => setNoteDescription(e.target.value)}
                className="bg-[#07070A] border border-zinc-800 rounded-lg p-2.5 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 text-[11px] text-zinc-400 font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Notes will appear under the &quot;Study Notes &amp; Files&quot; tab and notify enrolled learners.</span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !noteTitle.trim()}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 py-2.5 mt-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Uploading...' : 'Upload Notes & Notify Learners'}</span>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
