import { PrismaClient, Role, CourseStatus, LessonType, EnrollmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed for Dark Space Security LMS...');

  // 1. Create Platform Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@darkspacesecurity.io' },
    update: {},
    create: {
      email: 'superadmin@darkspacesecurity.io',
      name: 'Platform Security Officer',
      locale: 'en',
      emailVerifiedAt: new Date(),
    },
  });

  // 2. Create Dark Space Security Tenant
  const darkspaceOrg = await prisma.organization.upsert({
    where: { slug: 'darkspace' },
    update: {},
    create: {
      slug: 'darkspace',
      name: 'Dark Space Security',
      defaultLocale: 'en',
      plan: 'enterprise',
      settings: {
        gamification: { enabled: true },
        aiRecommendations: { enabled: true },
        theme: 'dark-cyber',
      },
    },
  });

  // 3. Dark Space Security Branding Tokens (darkspacesecurity.io)
  await prisma.orgBranding.upsert({
    where: { organizationId: darkspaceOrg.id },
    update: {},
    create: {
      organizationId: darkspaceOrg.id,
      logoUrl: 'https://darkspacesecurity.io/images/logo.png',
      tokens: {
        '--color-primary': '#DC2626',
        '--color-primary-contrast': '#FFFFFF',
        '--color-secondary': '#990000',
        '--color-success': '#10B981',
        '--color-warning': '#F59E0B',
        '--color-danger': '#EF4444',
        '--color-surface': '#050508',
        '--color-surface-muted': '#0F0F17',
        '--color-text': '#F8FAFC',
        '--color-text-muted': '#94A3B8',
        '--color-border': '#1F1F2E',
        '--font-sans': 'Montserrat, system-ui, sans-serif',
        '--radius-md': '8px',
        '--radius-lg': '12px',
      },
      terminology: {
        course: 'Track',
        lesson: 'Lab Exercise',
        learner: 'Security Trainee',
        instructor: 'Security Instructor',
      },
    },
  });

  // 4. Create Org Admin User
  const orgAdminUser = await prisma.user.upsert({
    where: { email: 'admin@darkspacesecurity.io' },
    update: {},
    create: {
      email: 'admin@darkspacesecurity.io',
      name: 'Armaan Admin',
      locale: 'en',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: darkspaceOrg.id,
        userId: orgAdminUser.id,
      },
    },
    update: { role: Role.ORG_ADMIN },
    create: {
      organizationId: darkspaceOrg.id,
      userId: orgAdminUser.id,
      role: Role.ORG_ADMIN,
    },
  });

  // 5. Create Instructor User
  const instructorUser = await prisma.user.upsert({
    where: { email: 'instructor@darkspacesecurity.io' },
    update: {},
    create: {
      email: 'instructor@darkspacesecurity.io',
      name: 'Lead Security Researcher',
      locale: 'en',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: darkspaceOrg.id,
        userId: instructorUser.id,
      },
    },
    update: { role: Role.INSTRUCTOR },
    create: {
      organizationId: darkspaceOrg.id,
      userId: instructorUser.id,
      role: Role.INSTRUCTOR,
    },
  });

  // 6. Create Trainee User
  const learnerUser = await prisma.user.upsert({
    where: { email: 'trainee@darkspacesecurity.io' },
    update: {},
    create: {
      email: 'trainee@darkspacesecurity.io',
      name: 'Alex Trainee',
      locale: 'en',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: darkspaceOrg.id,
        userId: learnerUser.id,
      },
    },
    update: { role: Role.LEARNER },
    create: {
      organizationId: darkspaceOrg.id,
      userId: learnerUser.id,
      role: Role.LEARNER,
    },
  });

  // 7. Create Flagship Cybersecurity Course
  const flagshipCourse = await prisma.course.upsert({
    where: {
      organizationId_slug: {
        organizationId: darkspaceOrg.id,
        slug: 'ethical-hacking-vapt-mastery',
      },
    },
    update: {},
    create: {
      organizationId: darkspaceOrg.id,
      ownerId: instructorUser.id,
      slug: 'ethical-hacking-vapt-mastery',
      title: 'Ethical Hacking & Web Penetration Testing (VAPT)',
      summary: 'Hands-on penetration testing, Burp Suite exploitation, and threat emulation.',
      status: CourseStatus.PUBLISHED,
      visibility: 'TENANT',
      tags: ['cybersecurity', 'vapt', 'ethical-hacking', 'burp-suite'],
    },
  });

  const courseVersion = await prisma.courseVersion.upsert({
    where: {
      courseId_version: {
        courseId: flagshipCourse.id,
        version: 1,
      },
    },
    update: {},
    create: {
      organizationId: darkspaceOrg.id,
      courseId: flagshipCourse.id,
      version: 1,
      snapshot: {
        title: flagshipCourse.title,
        sectionsCount: 1,
      },
      publishedAt: new Date(),
    },
  });

  await prisma.course.update({
    where: { id: flagshipCourse.id },
    data: { currentVersionId: courseVersion.id },
  });

  const section = await prisma.section.create({
    data: {
      organizationId: darkspaceOrg.id,
      courseVersionId: courseVersion.id,
      title: 'Module 1: Web Application Reconnaissance & Mapping',
      position: 1,
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      organizationId: darkspaceOrg.id,
      sectionId: section.id,
      type: LessonType.TEXT,
      title: 'Lab 1: Attack Surface Discovery & Subdomain Enumeration',
      position: 1,
      durationSec: 600,
    },
  });

  await prisma.contentBlock.create({
    data: {
      organizationId: darkspaceOrg.id,
      lessonId: lesson1.id,
      kind: 'markdown',
      payload: {
        content: '# Lab 1: Reconnaissance\nLearn passive and active subdomain enumeration using Amass, Sublist3r, and Nmap.',
      },
      position: 1,
    },
  });

  // 8. Enroll trainee in the course
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: learnerUser.id,
        courseId: flagshipCourse.id,
      },
    },
    update: {},
    create: {
      organizationId: darkspaceOrg.id,
      userId: learnerUser.id,
      courseId: flagshipCourse.id,
      courseVersionId: courseVersion.id,
      status: EnrollmentStatus.ACTIVE,
      progressPct: 45.0,
    },
  });

  console.log('✅ Dark Space Security seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
