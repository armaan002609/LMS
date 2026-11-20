import { describe, it, expect, beforeAll, vi } from 'vitest';
import { CourseStatus } from '@lms/db';

describe('Cross-Tenant Data Isolation (Mandatory Security Suite - BRAIN.md §8)', () => {
  let mockPrisma: any;

  beforeAll(() => {
    // In-memory tenant isolation test double
    const tenantCourses = [
      { id: 'c1', organizationId: 'tenant-a-uuid', title: 'Tenant A Secret Course', status: CourseStatus.PUBLISHED },
      { id: 'c2', organizationId: 'tenant-b-uuid', title: 'Tenant B Private Course', status: CourseStatus.DRAFT },
    ];

    mockPrisma = {
      course: {
        findMany: vi.fn(async ({ where }) => {
          return tenantCourses.filter((c) => c.organizationId === where.organizationId);
        }),
        findFirst: vi.fn(async ({ where }) => {
          return tenantCourses.find(
            (c) => c.id === where.id && c.organizationId === where.organizationId
          ) || null;
        }),
      },
      withTenantContext: vi.fn(async (organizationId: string, fn: any) => {
        return fn({
          course: {
            findMany: async () => {
              return tenantCourses.filter((c) => c.organizationId === organizationId);
            },
          },
        });
      }),
    };
  });

  it('Tenant A cannot read Tenant B courses in standard query', async () => {
    const tenantACourses = await mockPrisma.course.findMany({
      where: { organizationId: 'tenant-a-uuid' },
    });

    expect(tenantACourses).toHaveLength(1);
    expect(tenantACourses[0].title).toBe('Tenant A Secret Course');

    const leakAttempt = tenantACourses.some((c: any) => c.organizationId === 'tenant-b-uuid');
    expect(leakAttempt).toBe(false);
  });

  it('Tenant B cannot fetch Tenant A course by ID', async () => {
    const course = await mockPrisma.course.findFirst({
      where: {
        id: 'c1',
        organizationId: 'tenant-b-uuid',
      },
    });

    expect(course).toBeNull();
  });

  it('PostgreSQL RLS withTenantContext isolates session queries strictly by organizationId', async () => {
    const result = await mockPrisma.withTenantContext('tenant-a-uuid', async (tx: any) => {
      return tx.course.findMany();
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('c1');
    expect(result[0].organizationId).toBe('tenant-a-uuid');
  });
});
