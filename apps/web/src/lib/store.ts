import { User, Course, Enrollment, UserWithCourses, CourseModuleItem, CourseResourceNote, AppNotification, LiveSession } from './types';
import { getSupabaseBrowserClient } from './supabase';
import { getCourseLabTemplate } from './course-content';

export const INITIAL_COURSES: Course[] = [
  // --- WEB & SOFTWARE ---
  {
    id: 'c0000000-0000-0000-0000-000000000101',
    title: 'Full Stack Development',
    slug: 'full-stack-development',
    summary: 'MERN + Deployment + Projects',
    category: 'Web & Software',
    level: 'Intermediate',
    totalHours: 60,
    modulesCount: 14,
    targetLabIp: '10.10.15.50',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000102',
    title: 'Java (Core + Adv + JSP)',
    slug: 'java-enterprise',
    summary: 'Build enterprise applications',
    category: 'Web & Software',
    level: 'Intermediate',
    totalHours: 55,
    modulesCount: 12,
    targetLabIp: '10.10.15.51',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000103',
    title: 'UI/UX Design',
    slug: 'ui-ux-design',
    summary: 'Engaging graphics and interfaces',
    category: 'Web & Software',
    level: 'Beginner',
    totalHours: 40,
    modulesCount: 10,
    targetLabIp: '10.10.15.52',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000104',
    title: 'Mobile App Development',
    slug: 'mobile-app-development',
    summary: 'Applications for Android & iOS',
    category: 'Web & Software',
    level: 'Intermediate',
    totalHours: 50,
    modulesCount: 12,
    targetLabIp: '10.10.15.53',
  },

  // --- CYBER SECURITY ---
  {
    id: 'c0000000-0000-0000-0000-000000000201',
    title: 'Cyber Security',
    slug: 'cyber-security-core',
    summary: 'Defensive + Offensive + Tools',
    category: 'Cyber Security',
    level: 'Intermediate',
    totalHours: 70,
    modulesCount: 16,
    targetLabIp: '10.10.11.45',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000202',
    title: 'Ethical Hacking',
    slug: 'ethical-hacking',
    summary: 'Practical vulnerability testing',
    category: 'Cyber Security',
    level: 'Advanced',
    totalHours: 80,
    modulesCount: 18,
    targetLabIp: '10.10.14.82',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000203',
    title: 'Web Hacking',
    slug: 'web-hacking',
    summary: 'Practical vulnerability testing',
    category: 'Cyber Security',
    level: 'Advanced',
    totalHours: 65,
    modulesCount: 15,
    targetLabIp: '10.10.20.10',
  },

  // --- DATA & AI ---
  {
    id: 'c0000000-0000-0000-0000-000000000301',
    title: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    summary: 'ML + AI + Neural Networks',
    category: 'Data & AI',
    level: 'Advanced',
    totalHours: 75,
    modulesCount: 16,
    targetLabIp: '10.10.40.10',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000302',
    title: 'Data Analyst',
    slug: 'data-analyst',
    summary: 'Excel, SQL, Power BI, Python',
    category: 'Data & AI',
    level: 'Beginner',
    totalHours: 45,
    modulesCount: 10,
    targetLabIp: '10.10.40.11',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000303',
    title: 'Generative AI',
    slug: 'generative-ai',
    summary: 'AI-powered content creation',
    category: 'Data & AI',
    level: 'Intermediate',
    totalHours: 40,
    modulesCount: 10,
    targetLabIp: '10.10.40.12',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000304',
    title: 'Data Science',
    slug: 'data-science',
    summary: 'Data-driven decision making',
    category: 'Data & AI',
    level: 'Advanced',
    totalHours: 65,
    modulesCount: 14,
    targetLabIp: '10.10.40.13',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000305',
    title: 'Python with AI & DL',
    slug: 'python-ai-dl',
    summary: 'AI-powered with deep learning',
    category: 'Data & AI',
    level: 'Advanced',
    totalHours: 60,
    modulesCount: 12,
    targetLabIp: '10.10.40.14',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000306',
    title: 'Python with AI & ML',
    slug: 'python-ai-ml',
    summary: 'AI-powered with machine learning',
    category: 'Data & AI',
    level: 'Intermediate',
    totalHours: 55,
    modulesCount: 12,
    targetLabIp: '10.10.40.15',
  },

  // --- INTERNSHIPS (4, 8, 12, 24 Weeks) ---
  {
    id: 'c0000000-0000-0000-0000-000000000401',
    title: 'Cyber Security Internship',
    slug: 'internship-cyber-security',
    summary: 'Red team + blue team exposure. Live projects with Govt + ISO recognised certificate (4 to 24 Weeks).',
    category: 'Internship',
    level: 'Intermediate',
    totalHours: 120,
    modulesCount: 24,
    targetLabIp: '10.10.99.10',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000402',
    title: 'Full Stack Development Internship',
    slug: 'internship-full-stack',
    summary: 'Frontend + Backend + Hosting. Work on industry tasks & placement assistance (4 to 24 Weeks).',
    category: 'Internship',
    level: 'Intermediate',
    totalHours: 120,
    modulesCount: 24,
    targetLabIp: '10.10.99.20',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000403',
    title: 'AI / ML Internship',
    slug: 'internship-ai-ml',
    summary: 'Machine learning + projects. Resume & interview prep with live industry tasks (4 to 24 Weeks).',
    category: 'Internship',
    level: 'Intermediate',
    totalHours: 120,
    modulesCount: 24,
    targetLabIp: '10.10.99.30',
  },
];

// Production initial state: ONLY Administrator, ZERO demo learners
export const INITIAL_USERS: User[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Admin',
    email: 'admin@darkspacesecurity.io',
    role: 'admin',
    organizationId: 'a0000000-0000-0000-0000-000000000001',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

// ZERO demo enrollments
export const INITIAL_ENROLLMENTS: Enrollment[] = [];

const LOCAL_STORAGE_KEY_USERS = 'dss_users_data';
const LOCAL_STORAGE_KEY_COURSES = 'dss_courses_data';
const LOCAL_STORAGE_KEY_ENROLLMENTS = 'dss_enrollments_data';

// Helper to get local data (with purge for old demo students)
const getLocalUsers = (): User[] => {
  if (typeof window === 'undefined') return INITIAL_USERS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    const parsed: User[] = JSON.parse(stored);
    const cleaned = parsed.filter(
      (u) => u.email !== 'learner@darkspacesecurity.io' && u.email !== 'sarah.connor@darkspacesecurity.io'
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(cleaned));
    }
    return cleaned.length > 0 ? cleaned : INITIAL_USERS;
  } catch {
    return INITIAL_USERS;
  }
};

const getLocalCourses = (): Course[] => {
  if (typeof window === 'undefined') return INITIAL_COURSES;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_COURSES);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY_COURSES, JSON.stringify(INITIAL_COURSES));
    return INITIAL_COURSES;
  }
  try {
    const parsed: Course[] = JSON.parse(stored);
    // If local storage has outdated course list (less than 16), update to official catalog
    if (parsed.length < INITIAL_COURSES.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY_COURSES, JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    }
    return parsed;
  } catch {
    return INITIAL_COURSES;
  }
};

const getLocalEnrollments = (): Enrollment[] => {
  if (typeof window === 'undefined') return INITIAL_ENROLLMENTS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_ENROLLMENTS);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY_ENROLLMENTS, JSON.stringify(INITIAL_ENROLLMENTS));
    return INITIAL_ENROLLMENTS;
  }
  try {
    const parsed: Enrollment[] = JSON.parse(stored);
    const cleaned = parsed.filter((e) => e.userId !== 'u2' && e.userId !== 'u3');
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY_ENROLLMENTS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return INITIAL_ENROLLMENTS;
  }
};

const saveLocalUsers = (users: User[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(users));
  }
};

const saveLocalCourses = (courses: Course[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_COURSES, JSON.stringify(courses));
  }
};

const saveLocalEnrollments = (enrollments: Enrollment[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_ENROLLMENTS, JSON.stringify(enrollments));
  }
};

// ==========================================
// STORE DATA API
// ==========================================

export async function fetchCourses(): Promise<Course[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('courses').select('*');
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          summary: c.summary,
          category: c.category,
          level: c.level,
          totalHours: c.total_hours || 40,
          modulesCount: c.modules_count || 10,
          targetLabIp: c.target_lab_ip,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch error, fallback to local', err);
    }
  }
  return getLocalCourses();
}

export async function fetchUsersWithCourses(): Promise<UserWithCourses[]> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data: usersData, error: userError } = await supabase.from('users').select('*');
      const { data: enrollmentsData } = await supabase.from('enrollments').select('*, courses(*)');

      if (!userError && usersData) {
        const courses = await fetchCourses();
        return usersData.map((u: any) => {
          const userEnrollments = (enrollmentsData || []).filter((e: any) => e.user_id === u.id && e.status === 'ACTIVE');
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            organizationId: u.organization_id || 'darkspace',
            createdAt: u.created_at,
            assignedInstructorId: u.assigned_instructor_id || undefined,
            assignedInstructorName: u.assigned_instructor_name || undefined,
            assignedCourses: userEnrollments.map((e: any) => {
              const matchedCourse = courses.find((c) => c.id === e.course_id) || e.courses;
              return {
                enrollmentId: e.id,
                courseId: e.course_id,
                courseTitle: matchedCourse ? matchedCourse.title : 'Security Track',
                courseSlug: matchedCourse ? matchedCourse.slug : 'track',
                progressPct: Number(e.progress_pct || 0),
                assignedAt: e.assigned_at,
              };
            }),
          };
        });
      }
    } catch (err) {
      console.warn('Supabase error, falling back to local store', err);
    }
  }

  // Fallback to Local Persistent Store
  const users = getLocalUsers();
  const enrollments = getLocalEnrollments();
  const courses = getLocalCourses();

  return users.map((user) => {
    const userEnrollments = enrollments.filter((e) => e.userId === user.id && e.status === 'ACTIVE');
    return {
      ...user,
      assignedCourses: userEnrollments.map((e) => {
        const c = courses.find((course) => course.id === e.courseId);
        return {
          enrollmentId: e.id,
          courseId: e.courseId,
          courseTitle: c ? c.title : 'Security Module',
          courseSlug: c ? c.slug : 'module',
          progressPct: e.progressPct,
          assignedAt: e.assignedAt,
        };
      }),
    };
  });
}

export async function fetchLearnerCourses(userId: string): Promise<Course[]> {
  const allWithCourses = await fetchUsersWithCourses();
  const found = allWithCourses.find((u) => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
  if (!found) return [];

  const assignedCourseIds = new Set(found.assignedCourses.map((ac) => ac.courseId));
  const courses = await fetchCourses();
  return courses.filter((c) => assignedCourseIds.has(c.id));
}

export async function assignCourse(userId: string, courseId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('enrollments').upsert({
        user_id: userId,
        course_id: courseId,
        status: 'ACTIVE',
        progress_pct: 0,
        assigned_at: new Date().toISOString(),
      });
      if (!error) return true;
    } catch (err) {
      console.error('Supabase assign error', err);
    }
  }

  // Local fallback
  const enrollments = getLocalEnrollments();
  const exists = enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  if (!exists) {
    enrollments.push({
      id: 'e_' + Date.now(),
      userId,
      courseId,
      status: 'ACTIVE',
      progressPct: 0,
      assignedAt: new Date().toISOString(),
    });
    saveLocalEnrollments(enrollments);
  }
  return true;
}

export async function unassignCourse(userId: string, courseId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', courseId);
      if (!error) return true;
    } catch (err) {
      console.error('Supabase unassign error', err);
    }
  }

  // Local fallback
  const enrollments = getLocalEnrollments().filter(
    (e) => !(e.userId === userId && e.courseId === courseId)
  );
  saveLocalEnrollments(enrollments);
  return true;
}

export async function updateCourseProgress(userId: string, courseId: string, progressPct: number): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ progress_pct: progressPct })
        .eq('user_id', userId)
        .eq('course_id', courseId);
      if (!error) return true;
    } catch (err) {
      console.error('Supabase update progress error', err);
    }
  }

  // Local fallback
  const enrollments = getLocalEnrollments();
  const found = enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  if (found) {
    found.progressPct = progressPct;
    saveLocalEnrollments(enrollments);
  }
  return true;
}

export async function createNewUser(
  name: string,
  email: string,
  role: 'admin' | 'learner' | 'instructor',
  initialCourseId?: string,
  assignedInstructorId?: string
): Promise<User> {
  let assignedInstructorName: string | undefined;
  if (assignedInstructorId) {
    const existingUsers = getLocalUsers();
    const inst = existingUsers.find((u) => u.id === assignedInstructorId);
    if (inst) assignedInstructorName = inst.name;
  }

  const newUser: User = {
    id: 'u_' + Date.now(),
    name,
    email,
    role,
    organizationId: 'darkspace',
    createdAt: new Date().toISOString(),
    assignedInstructorId: role === 'learner' ? assignedInstructorId : undefined,
    assignedInstructorName: role === 'learner' ? assignedInstructorName : undefined,
  };

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').insert({
        email,
        name,
        role,
        organization_id: 'a0000000-0000-0000-0000-000000000001',
        assigned_instructor_id: assignedInstructorId || null,
      }).select().single();
      if (!error && data) {
        newUser.id = data.id;
        if (initialCourseId) {
          await assignCourse(newUser.id, initialCourseId);
        }
        return newUser;
      }
    } catch (err) {
      console.error('Supabase create user error', err);
    }
  }

  // Local fallback
  const users = getLocalUsers();
  users.push(newUser);
  saveLocalUsers(users);

  if (initialCourseId) {
    await assignCourse(newUser.id, initialCourseId);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dss-users-updated'));
  }

  return newUser;
}

export async function assignLearnerToInstructor(learnerId: string, instructorId: string): Promise<boolean> {
  const users = getLocalUsers();
  const instructor = users.find((u) => u.id === instructorId && u.role === 'instructor');
  const instructorName = instructor ? instructor.name : undefined;

  const updatedUsers = users.map((u) => {
    if (u.id === learnerId) {
      return {
        ...u,
        assignedInstructorId: instructorId,
        assignedInstructorName: instructorName,
      };
    }
    return u;
  });

  saveLocalUsers(updatedUsers);

  // If Supabase connected, update
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      await supabase.from('users').update({ assigned_instructor_id: instructorId }).eq('id', learnerId);
    } catch (e) {
      console.warn('Supabase assign instructor error', e);
    }
  }

  // Also update active session if current user is this learner
  if (typeof window !== 'undefined') {
    try {
      const activeSession = localStorage.getItem('dss_active_user_session');
      if (activeSession) {
        const parsed = JSON.parse(activeSession);
        if (parsed.id === learnerId) {
          localStorage.setItem(
            'dss_active_user_session',
            JSON.stringify({
              ...parsed,
              assignedInstructorId: instructorId,
              assignedInstructorName: instructorName,
            })
          );
        }
      }
    } catch {}
    window.dispatchEvent(new CustomEvent('dss-users-updated'));
  }

  return true;
}

export async function unassignLearnerFromInstructor(learnerId: string): Promise<boolean> {
  const users = getLocalUsers();
  const updatedUsers = users.map((u) => {
    if (u.id === learnerId) {
      const copy = { ...u };
      delete copy.assignedInstructorId;
      delete copy.assignedInstructorName;
      return copy;
    }
    return u;
  });

  saveLocalUsers(updatedUsers);

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      await supabase.from('users').update({ assigned_instructor_id: null }).eq('id', learnerId);
    } catch (e) {
      console.warn('Supabase unassign instructor error', e);
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const activeSession = localStorage.getItem('dss_active_user_session');
      if (activeSession) {
        const parsed = JSON.parse(activeSession);
        if (parsed.id === learnerId) {
          const copy = { ...parsed };
          delete copy.assignedInstructorId;
          delete copy.assignedInstructorName;
          localStorage.setItem('dss_active_user_session', JSON.stringify(copy));
        }
      }
    } catch {}
    window.dispatchEvent(new CustomEvent('dss-users-updated'));
  }

  return true;
}

export async function bulkAssignLearnersToInstructor(learnerIds: string[], instructorId: string): Promise<boolean> {
  const users = getLocalUsers();
  const instructor = users.find((u) => u.id === instructorId && u.role === 'instructor');
  const instructorName = instructor ? instructor.name : undefined;
  const learnerSet = new Set(learnerIds);

  const updatedUsers = users.map((u) => {
    if (learnerSet.has(u.id)) {
      return {
        ...u,
        assignedInstructorId: instructorId,
        assignedInstructorName: instructorName,
      };
    }
    return u;
  });

  saveLocalUsers(updatedUsers);

  if (typeof window !== 'undefined') {
    try {
      const activeSession = localStorage.getItem('dss_active_user_session');
      if (activeSession) {
        const parsed = JSON.parse(activeSession);
        if (learnerSet.has(parsed.id)) {
          localStorage.setItem(
            'dss_active_user_session',
            JSON.stringify({
              ...parsed,
              assignedInstructorId: instructorId,
              assignedInstructorName: instructorName,
            })
          );
        }
      }
    } catch {}
    window.dispatchEvent(new CustomEvent('dss-users-updated'));
  }

  return true;
}

export async function createNewCourse(courseData: Omit<Course, 'id'>): Promise<Course> {
  const newCourse: Course = {
    ...courseData,
    id: 'c_' + Date.now(),
  };

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('courses').insert({
        title: courseData.title,
        slug: courseData.slug,
        summary: courseData.summary,
        category: courseData.category,
        level: courseData.level,
        total_hours: courseData.totalHours,
        modules_count: courseData.modulesCount,
        target_lab_ip: courseData.targetLabIp,
        organization_id: 'a0000000-0000-0000-0000-000000000001',
      }).select().single();

      if (!error && data) {
        newCourse.id = data.id;
        return newCourse;
      }
    } catch (err) {
      console.error('Supabase create course error', err);
    }
  }

  // Local fallback
  const courses = getLocalCourses();
  courses.push(newCourse);
  saveLocalCourses(courses);
  return newCourse;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (!error) return true;
    } catch (err) {
      console.error('Supabase delete user error', err);
    }
  }

  // Local fallback
  const users = getLocalUsers().filter((u) => u.id !== userId);
  saveLocalUsers(users);
  const enrollments = getLocalEnrollments().filter((e) => e.userId !== userId);
  saveLocalEnrollments(enrollments);
  return true;
}

// ==========================================
// COURSE MODULES, NOTES & NOTIFICATIONS STORE
// ==========================================

const LOCAL_STORAGE_KEY_MODULES = 'dss_course_modules_v1';
const LOCAL_STORAGE_KEY_NOTES = 'dss_course_notes_v1';
const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'dss_app_notifications_v1';

// ZERO demo notifications
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

// 1. Fetch Course Modules
export async function fetchCourseModules(courseId: string, courseTitle = '', category = ''): Promise<CourseModuleItem[]> {
  const template = getCourseLabTemplate(courseTitle, category);
  const baseModules: CourseModuleItem[] = template.initialModules.map((m, idx) => ({
    id: `${courseId}_${m.id}`,
    courseId,
    title: m.title,
    type: m.type,
    duration: m.duration,
    summary: `${courseTitle} core curriculum module.`,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * (10 - idx)).toISOString(),
  }));

  if (typeof window === 'undefined') return baseModules;

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_MODULES);
    if (stored) {
      const parsed: CourseModuleItem[] = JSON.parse(stored);
      const userUploaded = parsed.filter((m) => m.courseId === courseId || m.courseId === courseTitle);
      return [...baseModules, ...userUploaded];
    }
  } catch (err) {
    console.error('Failed reading custom modules', err);
  }

  return baseModules;
}

// 2. Add Course Module & Notify Learners
export async function addCourseModule(moduleData: Omit<CourseModuleItem, 'id' | 'createdAt'>, courseTitle?: string): Promise<CourseModuleItem> {
  const newModule: CourseModuleItem = {
    ...moduleData,
    id: 'mod_' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_MODULES);
      const list: CourseModuleItem[] = stored ? JSON.parse(stored) : [];
      list.push(newModule);
      localStorage.setItem(LOCAL_STORAGE_KEY_MODULES, JSON.stringify(list));
    } catch (err) {
      console.error('Failed saving module', err);
    }
  }

  // Automatically trigger notification for learners!
  const tabParam = moduleData.type === 'live' ? '?tab=live' : moduleData.type === 'lecture' ? '?tab=lecture' : moduleData.type === 'notes' ? '?tab=notes' : '';
  await addNotification({
    courseId: moduleData.courseId,
    courseTitle: courseTitle || 'Course Curriculum',
    title: moduleData.type === 'lecture'
      ? 'New Recorded Lecture Uploaded'
      : moduleData.type === 'live'
      ? 'Live Interactive Class Scheduled'
      : 'New Module Added',
    message: moduleData.instructorName
      ? `${moduleData.instructorName} added "${newModule.title}" to ${courseTitle || 'the course'}.`
      : `Instructor added "${newModule.title}" to ${courseTitle || 'the course'}.`,
    type: moduleData.type === 'live' ? 'live' : moduleData.type === 'notes' ? 'notes' : 'lecture',
    actionLink: `/learn/${moduleData.courseId}${tabParam}`,
    instructorId: moduleData.instructorId,
    instructorName: moduleData.instructorName,
  });

  return newModule;
}

// 3. Fetch Course Notes
export async function fetchCourseNotes(courseId: string, courseTitle = '', category = ''): Promise<CourseResourceNote[]> {
  const template = getCourseLabTemplate(courseTitle, category);
  const baseNotes: CourseResourceNote[] = template.initialNotes.map((n, idx) => ({
    id: `${courseId}_${n.id}`,
    courseId,
    title: n.title,
    description: n.description,
    fileName: n.fileName,
    fileSize: n.fileSize,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * (24 * (idx + 1))).toISOString(),
  }));

  if (typeof window === 'undefined') return baseNotes;

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
    if (stored) {
      const parsed: CourseResourceNote[] = JSON.parse(stored);
      const userUploaded = parsed.filter((n) => n.courseId === courseId || n.courseId === courseTitle);
      return [...userUploaded, ...baseNotes];
    }
  } catch (err) {
    console.error('Failed reading custom notes', err);
  }

  return baseNotes;
}

// 4. Add Course Note & Notify Learners
export async function addCourseNote(noteData: Omit<CourseResourceNote, 'id' | 'uploadedAt'>, courseTitle?: string): Promise<CourseResourceNote> {
  const newNote: CourseResourceNote = {
    ...noteData,
    id: 'note_' + Date.now(),
    uploadedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
      const list: CourseResourceNote[] = stored ? JSON.parse(stored) : [];
      list.unshift(newNote);
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(list));
    } catch (err) {
      console.error('Failed saving note', err);
    }
  }

  // Automatically trigger notification for learners!
  await addNotification({
    courseId: noteData.courseId,
    courseTitle: courseTitle || 'Course Curriculum',
    title: 'New Study Notes & Materials Uploaded',
    message: noteData.instructorName
      ? `${noteData.instructorName} published "${newNote.title}" in ${courseTitle || 'your course'}.`
      : `Instructor published "${newNote.title}" in ${courseTitle || 'your course'}.`,
    type: 'notes',
    actionLink: `/learn/${noteData.courseId}?tab=notes`,
    instructorId: noteData.instructorId,
    instructorName: noteData.instructorName,
  });

  return newNote;
}

// 5. Fetch Notifications
export async function fetchNotifications(): Promise<AppNotification[]> {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
    if (!stored) {
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed: AppNotification[] = JSON.parse(stored);
    const cleaned = parsed.filter((n) => n.id !== 'notif-1' && n.id !== 'notif-2' && n.id !== 'notif-3');
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

// 6. Add Notification
export async function addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): Promise<AppNotification> {
  const newNotif: AppNotification = {
    ...notif,
    id: 'notif_' + Date.now(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  if (typeof window !== 'undefined') {
    try {
      const current = await fetchNotifications();
      const updated = [newNotif, ...current];
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
      // Dispatch browser custom event so active tabs immediately refresh notifications and show toasts
      window.dispatchEvent(new CustomEvent('dss-new-notification', { detail: newNotif }));
    } catch (err) {
      console.error('Failed saving notification', err);
    }
  }

  return newNotif;
}

// 7. Mark as Read
export async function markNotificationAsRead(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const current = await fetchNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('dss-notifications-updated'));
  } catch (err) {
    console.error('Failed updating notification', err);
  }
}

// 8. Mark All as Read
export async function markAllNotificationsAsRead(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const current = await fetchNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('dss-notifications-updated'));
  } catch (err) {
    console.error('Failed updating notifications', err);
  }
}

// 9. Clear All Notifications
export async function clearAllNotifications(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('dss-notifications-updated'));
  } catch (err) {
    console.error('Failed clearing notifications', err);
  }
}

// ==========================================
// LIVE SESSIONS & STREAMING STORE
// ==========================================

const LOCAL_STORAGE_KEY_LIVE_SESSIONS = 'dss_live_sessions_v1';

// ZERO demo live sessions
export const INITIAL_LIVE_SESSIONS: LiveSession[] = [];

export async function fetchLiveSessions(courseId?: string): Promise<LiveSession[]> {
  if (typeof window === 'undefined') {
    return courseId ? INITIAL_LIVE_SESSIONS.filter((s) => s.courseId === courseId || s.courseTitle.toLowerCase().includes(courseId.toLowerCase())) : INITIAL_LIVE_SESSIONS;
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY_LIVE_SESSIONS);
    if (!stored) {
      localStorage.setItem(LOCAL_STORAGE_KEY_LIVE_SESSIONS, JSON.stringify(INITIAL_LIVE_SESSIONS));
      return courseId ? INITIAL_LIVE_SESSIONS.filter((s) => s.courseId === courseId || s.courseTitle.toLowerCase().includes(courseId.toLowerCase())) : INITIAL_LIVE_SESSIONS;
    }
    const list: LiveSession[] = JSON.parse(stored);
    const cleaned = list.filter((s) => s.id !== 'live-session-1' && s.id !== 'live-session-2');
    if (cleaned.length !== list.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY_LIVE_SESSIONS, JSON.stringify(cleaned));
    }
    return courseId ? cleaned.filter((s) => s.courseId === courseId || s.courseTitle.toLowerCase().includes(courseId.toLowerCase())) : cleaned;
  } catch {
    return INITIAL_LIVE_SESSIONS;
  }
}

export async function createLiveSession(sessionData: Omit<LiveSession, 'id' | 'createdAt'>): Promise<LiveSession> {
  const newSession: LiveSession = {
    ...sessionData,
    id: 'live_' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const current = await fetchLiveSessions();
      const updated = [newSession, ...current.filter((s) => s.id !== newSession.id)];
      localStorage.setItem(LOCAL_STORAGE_KEY_LIVE_SESSIONS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('dss-live-sessions-updated', { detail: newSession }));
    } catch (err) {
      console.error('Failed saving live session', err);
    }
  }

  // Also auto-add as a course module so it shows in the syllabus outline
  await addCourseModule({
    courseId: sessionData.courseId,
    title: `Live Class: ${sessionData.topic}`,
    type: 'live',
    duration: sessionData.status === 'live' ? 'LIVE NOW' : 'SCHEDULED',
    summary: sessionData.agenda || `Live session for ${sessionData.courseTitle}`,
    scheduledTime: sessionData.scheduledTime,
    instructorId: sessionData.instructorId,
    instructorName: sessionData.instructorName,
  }, sessionData.courseTitle);

  // Automatically dispatch notification to learners
  await addNotification({
    courseId: sessionData.courseId,
    courseTitle: sessionData.courseTitle,
    title: sessionData.status === 'live' ? '🔴 Live Interactive Class Started!' : '📅 New Live Class Scheduled',
    message: sessionData.status === 'live'
      ? `Live class "${sessionData.topic}" hosted by ${sessionData.instructorName} is in session right now. Click to join immediately!`
      : `Live session "${sessionData.topic}" scheduled by ${sessionData.instructorName} for ${sessionData.scheduledTime}.`,
    type: 'live',
    actionLink: `/learn/${sessionData.courseId}?tab=live`,
    instructorId: sessionData.instructorId,
    instructorName: sessionData.instructorName,
  });

  return newSession;
}

export async function updateLiveSessionStatus(id: string, status: 'live' | 'upcoming' | 'completed'): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const list = await fetchLiveSessions();
    const updated = list.map((s) => (s.id === id ? { ...s, status } : s));
    localStorage.setItem(LOCAL_STORAGE_KEY_LIVE_SESSIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('dss-live-sessions-updated'));
  } catch (err) {
    console.error('Failed updating live session status', err);
  }
}

export async function deleteLiveSession(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const list = await fetchLiveSessions();
    const updated = list.filter((s) => s.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_LIVE_SESSIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('dss-live-sessions-updated'));
  } catch (err) {
    console.error('Failed deleting live session', err);
  }
}


