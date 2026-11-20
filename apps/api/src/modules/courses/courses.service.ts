import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/courses.dto';
import { CourseStatus, Prisma } from '@lms/db';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async listCourses(organizationId: string, status?: CourseStatus) {
    return this.prisma.course.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourse(organizationId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, organizationId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        versions: {
          include: {
            sections: {
              include: { lessons: true },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    return course;
  }

  async createCourse(organizationId: string, ownerId: string, dto: CreateCourseDto) {
    const existing = await this.prisma.course.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug: dto.slug,
        },
      },
    });

    if (existing) {
      throw new ConflictException(`Course slug "${dto.slug}" is already taken`);
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create course header
      const course = await tx.course.create({
        data: {
          organizationId,
          ownerId,
          slug: dto.slug,
          title: dto.title,
          summary: dto.summary,
          tags: dto.tags ?? [],
          status: CourseStatus.DRAFT,
        },
      });

      // 2. Initialize draft version 1
      const initialVersion = await tx.courseVersion.create({
        data: {
          organizationId,
          courseId: course.id,
          version: 1,
          snapshot: { title: dto.title, status: 'DRAFT' },
        },
      });

      // 3. Create initial empty section
      await tx.section.create({
        data: {
          organizationId,
          courseVersionId: initialVersion.id,
          title: 'Section 1: Introduction',
          position: 1,
        },
      });

      return course;
    });
  }

  async updateCourse(organizationId: string, courseId: string, dto: UpdateCourseDto) {
    await this.getCourse(organizationId, courseId);

    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        title: dto.title,
        summary: dto.summary,
        tags: dto.tags,
      },
    });
  }

  /**
   * Course publish flow (BRAIN.md §7.2, PRD §4.4)
   * Freezes draft version into an immutable snapshot and publishes the course.
   */
  async publishCourse(organizationId: string, courseId: string) {
    const course = await this.getCourse(organizationId, courseId);

    const latestVersion = course.versions[0];
    if (!latestVersion) {
      throw new BadRequestException('Course has no version to publish');
    }

    if (latestVersion.sections.length === 0) {
      throw new BadRequestException('Course must have at least one section before publishing');
    }

    const totalLessons = latestVersion.sections.reduce(
      (acc: number, s: any) => acc + s.lessons.length,
      0
    );

    if (totalLessons === 0) {
      throw new BadRequestException('Course must have at least one lesson before publishing');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Snapshot structure
      const snapshot = {
        title: course.title,
        summary: course.summary,
        publishedAt: new Date().toISOString(),
        sections: latestVersion.sections.map((sec: any) => ({
          id: sec.id,
          title: sec.title,
          position: sec.position,
          lessons: sec.lessons.map((l: any) => ({
            id: l.id,
            type: l.type,
            title: l.title,
            position: l.position,
            durationSec: l.durationSec,
          })),
        })),
      };

      // 2. Update version published state
      await tx.courseVersion.update({
        where: { id: latestVersion.id },
        data: {
          snapshot,
          publishedAt: new Date(),
        },
      });

      // 3. Mark course PUBLISHED
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: {
          status: CourseStatus.PUBLISHED,
          currentVersionId: latestVersion.id,
        },
      });

      return updatedCourse;
    });
  }
}
