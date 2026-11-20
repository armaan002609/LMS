export type Role = 'admin' | 'learner' | 'instructor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  totalHours: number;
  modulesCount: number;
  targetLabIp?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'REVOKED';
  progressPct: number;
  assignedAt: string;
}

export interface UserWithCourses extends User {
  assignedCourses: Array<{
    enrollmentId: string;
    courseId: string;
    courseTitle: string;
    courseSlug: string;
    progressPct: number;
    assignedAt: string;
  }>;
}
