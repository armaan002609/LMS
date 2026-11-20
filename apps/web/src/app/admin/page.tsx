'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@lms/ui';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/lib/auth-context';
import {
  fetchUsersWithCourses,
  fetchCourses,
  assignCourse,
  unassignCourse,
  createNewUser,
  createNewCourse,
  deleteUser,
} from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { UserWithCourses, Course } from '@/lib/types';
import {
  Users,
  BookOpen,
  Shield,
  Palette,
  Plus,
  Trash2,
  X,
  Search,
  Database,
  AlertCircle,
  UserPlus,
  LogOut,
  BookPlus,
  Cpu,
  Radio,
} from 'lucide-react';
import { ScheduleLiveClassModal } from '@/components/ScheduleLiveClassModal';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();

  const [usersList, setUsersList] = useState<UserWithCourses[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'learner' | 'admin' | 'instructor'>('learner');
  const [newInitialCourse, setNewInitialCourse] = useState('');
  const [actionError, setActionError] = useState('');

  // Add Course Modal State
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isScheduleLiveOpen, setIsScheduleLiveOpen] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState('Web & Software');
  const [newCourseLevel, setNewCourseLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [newCourseSummary, setNewCourseSummary] = useState('');
  const [newCourseHours, setNewCourseHours] = useState(40);
  const [newCourseLabIp, setNewCourseLabIp] = useState('10.10.50.20');
  const [trackCategoryFilter, setTrackCategoryFilter] = useState('ALL');

  // Course Assignment Quick Selector State
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [selectedCourseToAssign, setSelectedCourseToAssign] = useState<string>('');

  const supabaseConnected = isSupabaseConfigured();

  const loadData = async () => {
    setLoading(true);
    try {
      const [users, courses] = await Promise.all([
        fetchUsersWithCourses(),
        fetchCourses(),
      ]);
      setUsersList(users);
      setCoursesList(courses);
      if (courses.length > 0 && courses[0] && !selectedCourseToAssign) {
        setSelectedCourseToAssign(courses[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    } else if (user && user.role !== 'admin') {
      router.replace('/');
    } else if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  // Handle Add New User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    if (!newName.trim() || !newEmail.trim()) {
      setActionError('Name and email are required');
      return;
    }

    try {
      await createNewUser(newName.trim(), newEmail.trim(), newRole, newInitialCourse || undefined);
      setIsAddUserOpen(false);
      setNewName('');
      setNewEmail('');
      setNewInitialCourse('');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create user');
    }
  };

  // Handle Add New Course
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    if (!newCourseTitle.trim()) {
      setActionError('Course title is required');
      return;
    }

    const slug = newCourseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      await createNewCourse({
        title: newCourseTitle.trim(),
        slug,
        summary: newCourseSummary.trim() || 'Comprehensive hands-on cybersecurity curriculum and virtual labs.',
        category: newCourseCategory,
        level: newCourseLevel,
        totalHours: Number(newCourseHours) || 40,
        modulesCount: 12,
        targetLabIp: newCourseLabIp.trim() || '10.10.50.20',
      });
      setIsAddCourseOpen(false);
      setNewCourseTitle('');
      setNewCourseSummary('');
      await loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to create course track');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to remove user "${userName}" from DarkSpaceSecurity?`)) {
      await deleteUser(userId);
      await loadData();
    }
  };

  // Handle Assign Course
  const handleAssignCourse = async (userId: string) => {
    if (!selectedCourseToAssign) return;
    await assignCourse(userId, selectedCourseToAssign);
    setAssigningUserId(null);
    await loadData();
  };

  // Handle Unassign Course
  const handleUnassignCourse = async (userId: string, courseId: string, courseTitle: string) => {
    if (confirm(`Revoke assignment of "${courseTitle}" from this user?`)) {
      await unassignCourse(userId, courseId);
      await loadData();
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const totalEnrollments = usersList.reduce((acc, u) => acc + u.assignedCourses.length, 0);

  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen bg-[#040406] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#040406] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h1 className="text-xl font-bold">Admin Clearance Required</h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          Your current security token is registered as a Learner. Please switch to an administrator identity to access this console.
        </p>
        <Link href="/" className="mt-4">
          <Button variant="primary" size="sm" className="bg-red-600">
            Back to Learner Portal
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040406] text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-[#1E1E28] bg-[#07070A] px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <span className="text-[10px] text-red-400 bg-red-950/60 border border-red-900/60 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Security Admin Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Supabase Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border bg-[#0B0B10] border-zinc-800">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-400">Database:</span>
            {supabaseConnected ? (
              <span className="text-emerald-400 font-bold">Supabase Cloud</span>
            ) : (
              <span className="text-amber-400 font-bold">Supabase Ready (Local)</span>
            )}
          </div>

          <Link href="/admin/branding">
            <Button variant="secondary" size="sm" className="gap-1.5 bg-[#12121A] border-zinc-800 text-xs text-zinc-300">
              <Palette className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden md:inline">Cyber Theme Studio</span>
            </Button>
          </Link>

          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white">
              Learner View
            </Button>
          </Link>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-950/20 text-xs flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8 flex-1">
        {/* Title Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              User & Course Command Center
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Provision users, assign offensive security curriculums, and manage training tracks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsScheduleLiveOpen(true)}
              className="gap-2 bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-950/70 font-semibold text-xs shadow-md shadow-red-950/30"
            >
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Assign Live Class</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddCourseOpen(true)}
              className="gap-2 bg-[#12121A] border-zinc-800 text-zinc-200 hover:text-white hover:border-zinc-700"
            >
              <BookPlus className="w-4 h-4 text-red-500" />
              <span>Create Course Track</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddUserOpen(true)}
              className="gap-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold border-none shadow-lg shadow-red-950/50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New User</span>
            </Button>
          </div>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0B0B10] border border-[#1E1E28] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Total Operators</span>
              <Users className="w-4 h-4 text-red-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-white">{usersList.length}</span>
              <p className="text-[10px] text-emerald-400 mt-0.5">Identities provisioned</p>
            </div>
          </div>

          <div className="bg-[#0B0B10] border border-[#1E1E28] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Assigned Tracks</span>
              <BookOpen className="w-4 h-4 text-red-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-white">{totalEnrollments}</span>
              <p className="text-[10px] text-zinc-400 mt-0.5">Active course instances</p>
            </div>
          </div>

          <div className="bg-[#0B0B10] border border-[#1E1E28] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Catalog Tracks</span>
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-white">{coursesList.length}</span>
              <p className="text-[10px] text-zinc-400 mt-0.5">Available for assignment</p>
            </div>
          </div>

          <div className="bg-[#0B0B10] border border-[#1E1E28] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-mono uppercase tracking-wider">Database Mode</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-base font-black text-emerald-400">
                {supabaseConnected ? 'Supabase Live' : 'Supabase Ready'}
              </span>
              <p className="text-[10px] text-zinc-500 mt-0.5">PostgreSQL / RLS enabled</p>
            </div>
          </div>
        </div>

        {/* User Management Table Section */}
        <section className="bg-[#0B0B10] border border-[#1E1E28] rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {/* Controls Bar */}
          <div className="p-4 md:p-6 border-b border-[#1E1E28] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#08080C]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold tracking-tight">Active Users & Assigned Courses</h2>
              <span className="text-[11px] font-mono text-zinc-500 ml-1">({filteredUsers.length} total)</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter users or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#040406] border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#040406] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-red-600"
              >
                <option value="ALL">All Roles</option>
                <option value="LEARNER">Learners Only</option>
                <option value="ADMIN">Admins Only</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E1E28] text-zinc-400 font-mono text-[10px] uppercase tracking-wider bg-[#060609]">
                  <th className="py-3 px-6">User / Operator</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-6">Assigned Courses & Work</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161620]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-zinc-500 font-mono">
                      <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading user authorizations...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#0E0E14] transition-colors">
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-red-400">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{u.name}</div>
                            <div className="text-[11px] text-zinc-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                            u.role === 'admin'
                              ? 'bg-red-950/60 text-red-400 border-red-900/60'
                              : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Assigned Courses */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap items-center gap-2">
                          {u.assignedCourses.length === 0 ? (
                            <span className="text-[11px] text-zinc-500 italic">No courses assigned</span>
                          ) : (
                            u.assignedCourses.map((ac) => (
                              <span
                                key={ac.courseId}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14141E] border border-zinc-800 text-[11px] text-zinc-200"
                              >
                                <span className="font-medium">{ac.courseTitle}</span>
                                <span className="text-[10px] font-mono text-emerald-400">
                                  {ac.progressPct}%
                                </span>
                                <button
                                  onClick={() => handleUnassignCourse(u.id, ac.courseId, ac.courseTitle)}
                                  title="Unassign this course"
                                  className="text-zinc-500 hover:text-red-400 ml-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))
                          )}

                          {/* Quick Assign Course Dropdown Trigger */}
                          {assigningUserId === u.id ? (
                            <div className="flex items-center gap-1 bg-[#161622] border border-red-900/60 p-1 rounded-lg">
                              <select
                                value={selectedCourseToAssign}
                                onChange={(e) => setSelectedCourseToAssign(e.target.value)}
                                className="bg-[#09090D] border border-zinc-700 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                              >
                                {coursesList
                                  .filter((c) => !u.assignedCourses.some((ac) => ac.courseId === c.id))
                                  .map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.title}
                                    </option>
                                  ))}
                              </select>
                              <button
                                onClick={() => handleAssignCourse(u.id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold"
                              >
                                Assign
                              </button>
                              <button
                                onClick={() => setAssigningUserId(null)}
                                className="px-1.5 py-1 text-zinc-400 hover:text-white text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAssigningUserId(u.id);
                                const available = coursesList.find(
                                  (c) => !u.assignedCourses.some((ac) => ac.courseId === c.id)
                                );
                                if (available) setSelectedCourseToAssign(available.id);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-dashed border-zinc-700 hover:border-red-500 text-[10px] text-zinc-400 hover:text-red-400 font-mono transition-all"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Assign Course</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            title="Remove user"
                            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900/60 hover:bg-red-950/20 transition-all inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Catalog Course Tracks Section */}
        <section className="bg-[#0B0B10] border border-[#1E1E28] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-bold tracking-tight">Available Academy Tracks & Target Pods</h2>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              {[
                { id: 'ALL', label: 'All Tracks' },
                { id: 'Web & Software', label: 'Web & Software' },
                { id: 'Cyber Security', label: 'Cyber Security' },
                { id: 'Data & AI', label: 'Data & AI' },
                { id: 'Internship', label: 'Internships' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setTrackCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all whitespace-nowrap ${
                    trackCategoryFilter === cat.id
                      ? 'bg-red-950/60 text-red-400 border-red-800/80 font-bold'
                      : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 bg-[#07070A]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coursesList
              .filter((c) => {
                if (trackCategoryFilter === 'ALL') return true;
                return c.category.toLowerCase().includes(trackCategoryFilter.toLowerCase());
              })
              .map((c) => (
              <div key={c.id} className="bg-[#07070A] border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-2">
                    <span className="text-red-400 font-bold">{c.category}</span>
                    <span>{c.level}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{c.title}</h4>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{c.summary}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Cpu className="w-3 h-3" />
                    <span>{c.targetLabIp || '10.10.11.45'}</span>
                  </span>
                  <span>{c.totalHours} Hours</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Supabase Connection Setup Box */}
        <section className="bg-[#08080C] border border-[#1E1E28] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Supabase Cloud Database Setup</h3>
              <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
                The schema and seed script are ready in <code className="text-red-400 font-mono">supabase/schema.sql</code>.
                Set <code className="text-zinc-300 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="text-zinc-300 font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel or your environment to sync changes live.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500">RLS Status:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 text-[10px] font-mono font-bold">
              ACTIVE
            </span>
          </div>
        </section>
      </main>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0B10] border border-[#1E1E28] rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Provision New Operator</h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 text-xs bg-red-950/60 text-red-400 border border-red-900/60 rounded-xl">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-[#07070A] border-zinc-800 text-white text-xs"
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. j.doe@darkspacesecurity.io"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-[#07070A] border-zinc-800 text-white text-xs font-mono"
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Assigned Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="bg-[#07070A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                >
                  <option value="learner">Learner (Assigned Work Only)</option>
                  <option value="admin">Administrator (Full Control)</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Initial Course Assignment (Optional)</label>
                <select
                  value={newInitialCourse}
                  onChange={(e) => setNewInitialCourse(e.target.value)}
                  className="bg-[#07070A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                >
                  <option value="">-- No initial course (assign later) --</option>
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-900">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Create & Authorize User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Track Modal */}
      {isAddCourseOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0B10] border border-[#1E1E28] rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookPlus className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">Create New Course Track</h3>
              </div>
              <button
                onClick={() => setIsAddCourseOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 text-xs bg-red-950/60 text-red-400 border border-red-900/60 rounded-xl">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAddCourse} className="flex flex-col gap-4">
              <Input
                label="Track Title"
                placeholder="e.g. Mobile Application Penetration Testing"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                className="bg-[#07070A] border-zinc-800 text-white text-xs"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Category</label>
                  <select
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    className="bg-[#07070A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  >
                    <optgroup label="Core Curriculum Categories">
                      <option value="Web & Software">Web & Software</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Data & AI">Data & AI</option>
                      <option value="Internship">Internship (4/8/12/24 Weeks)</option>
                    </optgroup>
                    <optgroup label="Specialized Security Disciplines">
                      <option value="Offensive Security">Offensive Security</option>
                      <option value="Web Security">Web Security</option>
                      <option value="Cloud Security">Cloud Security</option>
                      <option value="Defensive Security">Defensive Security</option>
                      <option value="Exploit Dev">Exploit Dev</option>
                      <option value="AI Security">AI Security</option>
                    </optgroup>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Difficulty Level</label>
                  <select
                    value={newCourseLevel}
                    onChange={(e) => setNewCourseLevel(e.target.value as any)}
                    className="bg-[#07070A] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Target Lab Host IP"
                  placeholder="10.10.50.20"
                  value={newCourseLabIp}
                  onChange={(e) => setNewCourseLabIp(e.target.value)}
                  className="bg-[#07070A] border-zinc-800 text-white text-xs font-mono"
                  required
                />

                <Input
                  label="Total Hours"
                  type="number"
                  value={String(newCourseHours)}
                  onChange={(e) => setNewCourseHours(Number(e.target.value) || 40)}
                  className="bg-[#07070A] border-zinc-800 text-white text-xs font-mono"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-medium">Syllabus Summary</label>
                <textarea
                  value={newCourseSummary}
                  onChange={(e) => setNewCourseSummary(e.target.value)}
                  rows={3}
                  placeholder="Describe key learning outcomes, exploitation tools, and target environments..."
                  className="bg-[#07070A] border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-900">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setIsAddCourseOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Publish Track
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Live Class Modal */}
      <ScheduleLiveClassModal
        isOpen={isScheduleLiveOpen}
        onClose={() => setIsScheduleLiveOpen(false)}
      />
    </div>
  );
}
