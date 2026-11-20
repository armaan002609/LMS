import { User, Course, Enrollment, UserWithCourses } from './types';
import { getSupabaseBrowserClient } from './supabase';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Offensive Security Certified Specialist',
    slug: 'offensive-security-specialist',
    summary: 'Active Directory exploitation, AV evasion, and command and control ops.',
    category: 'Offensive Security',
    level: 'Advanced',
    totalHours: 80,
    modulesCount: 16,
    targetLabIp: '10.10.11.45',
  },
  {
    id: 'c2',
    title: 'Web Application & API Penetration Testing',
    slug: 'web-api-vapt',
    summary: 'OWASP Top 10, GraphQL injection, OAuth exploitation, and zero-day hunting.',
    category: 'Web Security',
    level: 'Intermediate',
    totalHours: 60,
    modulesCount: 14,
    targetLabIp: '10.10.14.82',
  },
  {
    id: 'c3',
    title: 'Cloud Security & AWS DevSecOps Architecture',
    slug: 'cloud-security-aws',
    summary: 'Hardening cloud environments, IAM privilege escalation, and container escape.',
    category: 'Cloud Security',
    level: 'Advanced',
    totalHours: 50,
    modulesCount: 10,
    targetLabIp: '10.10.18.99',
  },
  {
    id: 'c4',
    title: 'SOC Analyst & Threat Hunting Blueprint',
    slug: 'soc-analyst-threat-hunting',
    summary: 'SIEM log analysis, memory forensics, network traffic packet inspection.',
    category: 'Defensive Security',
    level: 'Intermediate',
    totalHours: 45,
    modulesCount: 12,
    targetLabIp: '10.10.22.10',
  },
  {
    id: 'c5',
    title: 'Zero-Day Exploitation & Reverse Engineering',
    slug: 'zero-day-reverse-engineering',
    summary: 'x86/x64 assembly, buffer overflows, Ghidra disassembly, and kernel debugging.',
    category: 'Exploit Dev',
    level: 'Advanced',
    totalHours: 90,
    modulesCount: 18,
    targetLabIp: '10.10.30.50',
  },
  {
    id: 'c6',
    title: 'AI Security & LLM Prompt Injection Defense',
    slug: 'ai-security-llm-defense',
    summary: 'Securing generative AI pipelines against prompt injection, jailbreaking, and data poisoning.',
    category: 'AI Security',
    level: 'Beginner',
    totalHours: 35,
    modulesCount: 8,
    targetLabIp: '10.10.40.12',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Security Commander (Admin)',
    email: 'admin@darkspacesecurity.io',
    role: 'admin',
    organizationId: 'darkspace',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'u2',
    name: 'Alex Mercer',
    email: 'learner@darkspacesecurity.io',
    role: 'learner',
    organizationId: 'darkspace',
    createdAt: '2026-02-01T10:30:00Z',
  },
  {
    id: 'u3',
    name: 'Sarah Connor',
    email: 'sarah.connor@darkspacesecurity.io',
    role: 'learner',
    organizationId: 'darkspace',
    createdAt: '2026-02-10T14:15:00Z',
  },
];

export const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: 'e1',
    userId: 'u2',
    courseId: 'c1',
    status: 'ACTIVE',
    progressPct: 64,
    assignedAt: '2026-02-02T11:00:00Z',
  },
  {
    id: 'e2',
    userId: 'u2',
    courseId: 'c2',
    status: 'ACTIVE',
    progressPct: 28,
    assignedAt: '2026-02-05T09:20:00Z',
  },
  {
    id: 'e3',
    userId: 'u3',
    courseId: 'c2',
    status: 'ACTIVE',
    progressPct: 45,
    assignedAt: '2026-02-11T12:00:00Z',
  },
];

const LOCAL_STORAGE_KEY_USERS = 'dss_users_data';
const LOCAL_STORAGE_KEY_COURSES = 'dss_courses_data';
const LOCAL_STORAGE_KEY_ENROLLMENTS = 'dss_enrollments_data';

// Helper to get local data
const getLocalUsers = (): User[] => {
  if (typeof window === 'undefined') return INITIAL_USERS;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(stored);
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
    return JSON.parse(stored);
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
    return JSON.parse(stored);
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
  const found = enrollments.find((e) => (e.userId === userId || e.userId === 'u2') && (e.courseId === courseId || e.courseId === 'c1' || e.courseId === 'c2'));
  if (found) {
    found.progressPct = progressPct;
    saveLocalEnrollments(enrollments);
  }
  return true;
}

export async function createNewUser(name: string, email: string, role: 'admin' | 'learner' | 'instructor', initialCourseId?: string): Promise<User> {
  const newUser: User = {
    id: 'u_' + Date.now(),
    name,
    email,
    role,
    organizationId: 'darkspace',
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').insert({
        email,
        name,
        role,
        organization_id: 'a0000000-0000-0000-0000-000000000001',
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

  return newUser;
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
