import { Module } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { PrismaService } from '../../common/database/prisma.service';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Module({
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, PrismaService, TenantGuard],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
