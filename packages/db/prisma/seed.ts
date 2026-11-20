import { PrismaClient, Role, CourseStatus, LessonType, EnrollmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Platform Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@lmsportal.app' },
    update: {},
    create: {
      email: 'superadmin@lmsportal.app',
      name: 'Platform Super Admin',
      locale: 'en',
      emailVerifiedAt: new Date(),
    },
  });

  // 2. Create Demo Tenant (Acme Academy)
  const acmeOrg = await prisma.organization.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      slug: 'acme',
      name: 'Acme Academy',
      defaultLocale: 'en',
      plan: 'enterprise',
      settings: {
        gamification: { enabled: true },
        aiRecommendations: { enabled: true },
      },
    },
  });

  // 3. Demo Tenant Branding (PRD §9 Tokens)
  await prisma.orgBranding.upsert({
    where: { organizationId: acmeOrg.id },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      logoUrl: 'https://cdn.lmsportal.app/demo/acme-logo.svg',
      tokens: {
        '--color-primary': '#4F46E5',
        '--color-primary-contrast': '#FFFFFF',
        '--color-secondary': '#0EA5E9',
        '--color-success': '#16A34A',
        '--color-warning': '#D97706',
        '--color-danger': '#DC2626',
        '--color-surface': '#FFFFFF',
        '--color-surface-muted': '#F8FAFC',
        '--color-text': '#0F172A',
        '--color-text-muted': '#475569',
        '--color-border': '#E2E8F0',
        '--font-sans': 'Inter, system-ui, sans-serif',
        '--radius-md': '8px',
        '--radius-lg': '12px',
      },
      terminology: {
        course: 'Course',
        lesson: 'Lesson',
        learner: 'Learner',
        instructor: 'Instructor',
      },
    },
  });

  // 4. Create Org Admin User
  const orgAdminUser = await prisma.user.upsert({
    where: { email: 'admin@acme.edu' },
    update: {},
    create: {
      email: 'admin@acme.edu',
      name: 'Alice OrgAdmin',
      locale: 'en',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: acmeOrg.id,
        userId: orgAdminUser.id,
      },
    },
    update: { role: Role.ORG_ADMIN },
    create: {
      organizationId: acmeOrg.id,
      userId: orgAdminUser.id,
      role: Role.ORG_ADMIN,
    },
  });

  // 5. Create Instructor User
  const instructorUser = await prisma.user.upsert({
    where: { email: 'instructor@acme.edu' },
    update: {},
    create: {
      email: 'instructor@acme.edu',
      name: 'Professor Bob Smith',
      locale: 'en',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: acmeOrg.id,
        userId: instructorUser.id,
      },
    },
    update: { role: Role.INSTRUCTOR },
    create: {
      organizationId: acmeOrg.id,
      userId: instructorUser.id,
      role: Role.INSTRUCTOR,
    },
  });

  // 6. Create Learner User
  const learnerUser = await prisma.user.upsert({
    where: { email: 'learner@acme.edu' },
    update: {},
    create: {
      email: 'learner@acme.edu',
      name: 'Charlie Learner',
      locale: 'en',
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: acmeOrg.id,
        userId: learnerUser.id,
      },
    },
    update: { role: Role.LEARNER },
    create: {
      organizationId: acmeOrg.id,
      userId: learnerUser.id,
      role: Role.LEARNER,
    },
  });

  // 7. Create a Sample Course with CourseVersion, Section, Lesson
  const sampleCourse = await prisma.course.upsert({
    where: {
      organizationId_slug: {
        organizationId: acmeOrg.id,
        slug: 'intro-to-web-development',
      },
    },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      ownerId: instructorUser.id,
      slug: 'intro-to-web-development',
      title: 'Introduction to Modern Web Development',
      summary: 'Learn full-stack web development with TypeScript, React, and Node.js.',
      status: CourseStatus.PUBLISHED,
      visibility: 'TENANT',
      tags: ['web', 'typescript', 'react'],
    },
  });

  const courseVersion = await prisma.courseVersion.upsert({
    where: {
      courseId_version: {
        courseId: sampleCourse.id,
        version: 1,
      },
    },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      courseId: sampleCourse.id,
      version: 1,
      snapshot: {
        title: sampleCourse.title,
        sectionsCount: 1,
      },
      publishedAt: new Date(),
    },
  });

  await prisma.course.update({
    where: { id: sampleCourse.id },
    data: { currentVersionId: courseVersion.id },
  });

  const section = await prisma.section.create({
    data: {
      organizationId: acmeOrg.id,
      courseVersionId: courseVersion.id,
      title: 'Module 1: Getting Started',
      position: 1,
    },
  });

  const lesson1 = await prisma.lesson.create({
    data: {
      organizationId: acmeOrg.id,
      sectionId: section.id,
      type: LessonType.TEXT,
      title: 'Welcome to the Course',
      position: 1,
      durationSec: 300,
    },
  });

  await prisma.contentBlock.create({
    data: {
      organizationId: acmeOrg.id,
      lessonId: lesson1.id,
      kind: 'markdown',
      payload: {
        content: '# Welcome!\nThis course covers everything you need to know to build modern web applications.',
      },
      position: 1,
    },
  });

  // 8. Enroll Charlie in the course
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: learnerUser.id,
        courseId: sampleCourse.id,
      },
    },
    update: {},
    create: {
      organizationId: acmeOrg.id,
      userId: learnerUser.id,
      courseId: sampleCourse.id,
      courseVersionId: courseVersion.id,
      status: EnrollmentStatus.ACTIVE,
      progressPct: 0.0,
    },
  });

  console.log('✅ Seed completed successfully:');
  console.log(` - Super Admin: ${superAdmin.email}`);
  console.log(` - Tenant: ${acmeOrg.name} (${acmeOrg.slug})`);
  console.log(` - Org Admin: ${orgAdminUser.email}`);
  console.log(` - Instructor: ${instructorUser.email}`);
  console.log(` - Learner: ${learnerUser.email}`);
  console.log(` - Course: ${sampleCourse.title} (v1)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
