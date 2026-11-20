import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateEnrollmentDto, UpdateProgressDto } from './dto/enrollments.dto';
import { EnrollmentStatus, Prisma } from '@lms/db';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(organizationId: string, currentUserId: string, dto: CreateEnrollmentDto) {
    const targetUserId = dto.userId || currentUserId;

    const course = await this.prisma.course.findFirst({
      where: { id: dto.courseId, organizationId },
    });

    if (!course) {
      throw new NotFoundException(`Course ${dto.courseId} not found`);
    }

    if (!course.currentVersionId) {
      throw new BadRequestException('Cannot enroll in unpublished course with no published version');
    }

    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: targetUserId,
          courseId: course.id,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User is already enrolled in this course');
    }

    return this.prisma.enrollment.create({
      data: {
        organizationId,
        userId: targetUserId,
        courseId: course.id,
        courseVersionId: course.currentVersionId,
        status: EnrollmentStatus.ACTIVE,
        progressPct: 0.0,
      },
    });
  }

  async getMyEnrollments(organizationId: string, userId: string) {
    return this.prisma.enrollment.findMany({
      where: { organizationId, userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            tags: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  /**
   * Progress & completion engine (BRAIN.md §7.4, TRD §5.2)
   */
  async updateProgress(
    organizationId: string,
    userId: string,
    lessonId: string,
    dto: UpdateProgressDto
  ) {
    // 1. Locate lesson and its section & courseVersion
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, organizationId },
      include: {
        section: {
          include: {
            courseVersion: {
              include: {
                sections: {
                  include: { lessons: true },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }

    const courseVersion = lesson.section.courseVersion;

    // 2. Locate active enrollment
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        organizationId,
        userId,
        courseVersionId: courseVersion.id,
      },
    });

    if (!enrollment) {
      throw new BadRequestException('User is not enrolled in this course version');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 3. Upsert lesson progress
      await tx.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId,
          },
        },
        update: {
          status: dto.status,
          score: dto.score,
          timeSpentSec: { increment: dto.timeSpentSec || 0 },
          state: dto.state ?? {},
          clientUpdatedAt: new Date(),
        },
        create: {
          organizationId,
          enrollmentId: enrollment.id,
          lessonId,
          status: dto.status,
          score: dto.score,
          timeSpentSec: dto.timeSpentSec || 0,
          state: dto.state ?? {},
          clientUpdatedAt: new Date(),
        },
      });

      // 4. Calculate total completed lessons
      const totalLessons = courseVersion.sections.reduce(
        (acc: number, sec: any) => acc + sec.lessons.length,
        0
      );

      const completedCount = await tx.lessonProgress.count({
        where: {
          enrollmentId: enrollment.id,
          status: 'COMPLETED',
        },
      });

      const progressPct = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
      const isCompleted = progressPct >= 100;

      // 5. Update enrollment
      return tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPct,
          status: isCompleted ? EnrollmentStatus.COMPLETED : enrollment.status,
          completedAt: isCompleted ? new Date() : enrollment.completedAt,
        },
      });
    });
  }
}
